#!/usr/bin/env python3
"""Validate and enrich ConferenceTracker CSV entries.

Pipeline goals:
- Validate schema, enums, and date formats.
- Check URL reachability for existing links.
- Crawl official pages to discover CFP/CfT/CfW links.
- Fill safe missing values and emit a review report.

This script is intentionally conservative:
- It does not invent dates or enum values.
- It only auto-updates fields when evidence is strong.
"""

from __future__ import annotations

import argparse
import csv
import datetime as dt
import html
import os
import re
import sys
import urllib.error
import urllib.parse
import urllib.request
from dataclasses import dataclass, field
from typing import Dict, Iterable, List, Optional, Tuple


EXPECTED_HEADERS = [
    "conference_name",
    "priority_level",
    "attendees_500_plus",
    "academic_acceptance_level",
    "cfp_deadline_month",
    "submission_tracks",
    "accepts_cfp",
    "accepts_cft",
    "accepts_cfw",
    "travel_accommodation_sponsorship",
    "cfp_deadline_MM-DD",
    "cft_deadline_MM-DD",
    "cfw_deadline_MM-DD",
    "conference_start_date",
    "conference_end_date",
    "city",
    "country",
    "website_or_cfp_link",
    "cft_link",
    "cfw_link",
    "conference_type",
    "timezone",
    "notes",
    "last_verified_date",
    "venue_pattern",
]

ALLOWED_ENUMS = {
    "priority_level": {"High", "Medium", "Low"},
    "attendees_500_plus": {"Yes", "No", "Unknown"},
    "academic_acceptance_level": {"Academic", "Industry", "Mixed", "Unknown"},
    "accepts_cfp": {"Yes", "No", "Unknown"},
    "accepts_cft": {"Yes", "No", "Unknown"},
    "accepts_cfw": {"Yes", "No", "Unknown"},
    "travel_accommodation_sponsorship": {"Yes", "No", "Unknown", "Partial"},
    "conference_type": {"In-Person", "Hybrid", "Virtual"},
    "venue_pattern": {"Rotating", "Mostly Fixed", "Fixed", "Unknown"},
}

MONTH_DAY_RE = re.compile(r"^(TBD|\d{2}-\d{2})$")
ISO_DATE_RE = re.compile(r"^(TBD|\d{4}-\d{2}-\d{2})$")
URL_RE = re.compile(r"^https?://", re.IGNORECASE)
HREF_RE = re.compile(r"""href=["']([^"'#]+)["']""", re.IGNORECASE)
HTTP_TIMEOUT = 4
USER_AGENT = "ConferenceTrackerVerifier/1.0 (+https://github.com/javanXD/ConferenceTracker)"
SOCIAL_HOST_BLOCKLIST = {
    "linkedin.com",
    "www.linkedin.com",
    "x.com",
    "twitter.com",
    "www.twitter.com",
    "facebook.com",
    "www.facebook.com",
    "instagram.com",
    "www.instagram.com",
}


@dataclass
class RowOutcome:
    idx: int
    name: str
    changes: List[str] = field(default_factory=list)
    warnings: List[str] = field(default_factory=list)
    errors: List[str] = field(default_factory=list)


def normalize_url(raw: str) -> str:
    url = (raw or "").strip()
    if not url:
        return ""
    if URL_RE.search(url):
        return url
    if url.startswith("www."):
        return "https://" + url
    return url


def is_allowed(value: str, allowed: set[str]) -> bool:
    return value in allowed


def valid_month_day(value: str) -> bool:
    if not MONTH_DAY_RE.match(value):
        return False
    if value == "TBD":
        return True
    month, day = value.split("-")
    m = int(month)
    d = int(day)
    return 1 <= m <= 12 and 1 <= d <= 31


def valid_iso_date(value: str) -> bool:
    if not ISO_DATE_RE.match(value):
        return False
    if value == "TBD":
        return True
    try:
        dt.date.fromisoformat(value)
        return True
    except ValueError:
        return False


def fetch_url(url: str, cache: Dict[str, Tuple[Optional[int], str]]) -> Tuple[Optional[int], str]:
    if url in cache:
        return cache[url]
    req = urllib.request.Request(url, headers={"User-Agent": USER_AGENT}, method="GET")
    try:
        with urllib.request.urlopen(req, timeout=HTTP_TIMEOUT) as resp:
            status = getattr(resp, "status", 200)
            body = resp.read(300_000).decode("utf-8", errors="replace")
            cache[url] = (status, body)
            return cache[url]
    except urllib.error.HTTPError as e:
        cache[url] = (e.code, "")
        return cache[url]
    except Exception:
        cache[url] = (None, "")
        return cache[url]


def extract_candidate_links(base_url: str, body: str) -> List[str]:
    links: List[str] = []
    for match in HREF_RE.finditer(body):
        href = html.unescape(match.group(1)).strip()
        if href.startswith(("mailto:", "javascript:", "tel:")):
            continue
        abs_url = urllib.parse.urljoin(base_url, href)
        if URL_RE.match(abs_url):
            links.append(abs_url)
    return links


def score_link(url: str, terms: Iterable[str]) -> int:
    low = url.lower()
    score = 0
    for t in terms:
        if t in low:
            score += 2
    if score > 0 and ("sessionize.com" in low or "papercall.io" in low or "pretalx" in low):
        score += 2
    return score


def link_is_actionable(url: str) -> bool:
    try:
        parsed = urllib.parse.urlparse(url)
    except Exception:
        return False
    host = (parsed.netloc or "").lower()
    if not host:
        return False
    if host in SOCIAL_HOST_BLOCKLIST or any(host.endswith("." + d) for d in SOCIAL_HOST_BLOCKLIST):
        return False
    path_low = (parsed.path or "").lower()
    if any(
        token in path_low
        for token in (
            "/bundles/",
            "/add-to-calendar/",
            ".css",
            ".js",
            "/assets/",
            "/static/",
            "/images/",
            "favicon",
        )
    ):
        return False
    # Skip naked homepages: too weak for direct CfP/CfT/CfW evidence.
    if parsed.path in ("", "/") and not parsed.query:
        return False
    return True


def best_match(links: Iterable[str], terms: Iterable[str]) -> str:
    scored: List[Tuple[int, str]] = []
    for link in set(links):
        if not link_is_actionable(link):
            continue
        s = score_link(link, terms)
        if s > 0:
            scored.append((s, link))
    scored.sort(key=lambda t: (-t[0], t[1]))
    return scored[0][1] if scored else ""


def update_if_missing(row: Dict[str, str], key: str, value: str, changes: List[str]) -> None:
    if not value:
        return
    cur = (row.get(key) or "").strip()
    if not cur:
        row[key] = value
        changes.append(f"{key}: empty -> {value}")


def maybe_update_unknown_flag(
    row: Dict[str, str], flag_key: str, evidence: bool, changes: List[str], warnings: List[str]
) -> None:
    cur = (row.get(flag_key) or "").strip()
    if not evidence:
        return
    if cur == "Unknown":
        row[flag_key] = "Yes"
        changes.append(f"{flag_key}: Unknown -> Yes (link evidence)")
    elif cur == "No":
        warnings.append(f"{flag_key}=No but discovered potential link evidence")


def load_csv(path: str) -> Tuple[List[Dict[str, str]], List[str]]:
    with open(path, newline="", encoding="utf-8") as fh:
        reader = csv.DictReader(fh)
        if reader.fieldnames != EXPECTED_HEADERS:
            raise ValueError("CSV header mismatch with expected schema")
        rows = list(reader)
    return rows, reader.fieldnames or []


def write_csv(path: str, fieldnames: List[str], rows: List[Dict[str, str]]) -> None:
    with open(path, "w", newline="", encoding="utf-8") as fh:
        writer = csv.DictWriter(fh, fieldnames=fieldnames, extrasaction="ignore")
        writer.writeheader()
        writer.writerows(rows)


def run_pipeline(csv_path: str, apply_changes: bool, max_fetches: int) -> Tuple[List[RowOutcome], int]:
    rows, fieldnames = load_csv(csv_path)
    outcomes: List[RowOutcome] = []
    changed_rows = 0
    today = dt.date.today().isoformat()
    fetch_cache: Dict[str, Tuple[Optional[int], str]] = {}
    fetch_count = 0

    for i, row in enumerate(rows, start=2):
        name = (row.get("conference_name") or f"Row {i}").strip()
        out = RowOutcome(idx=i, name=name)

        for key, allowed in ALLOWED_ENUMS.items():
            val = (row.get(key) or "").strip()
            if not val and "Unknown" in allowed:
                row[key] = "Unknown"
                out.changes.append(f"{key}: empty -> Unknown")
                val = "Unknown"
            if not is_allowed(val, allowed):
                out.errors.append(f"{key} has invalid enum value: {val!r}")

        for key in ("cfp_deadline_MM-DD", "cft_deadline_MM-DD", "cfw_deadline_MM-DD"):
            val = (row.get(key) or "").strip()
            if not val:
                row[key] = "TBD"
                out.changes.append(f"{key}: empty -> TBD")
                val = "TBD"
            if not valid_month_day(val):
                out.errors.append(f"{key} has invalid MM-DD/TBD value: {val!r}")

        for key in ("conference_start_date", "conference_end_date", "last_verified_date"):
            val = (row.get(key) or "").strip()
            if not valid_iso_date(val):
                out.errors.append(f"{key} has invalid YYYY-MM-DD/TBD value: {val!r}")

        for key in ("website_or_cfp_link", "cft_link", "cfw_link"):
            val = normalize_url(row.get(key, ""))
            if val and not URL_RE.match(val):
                out.warnings.append(f"{key} is not a valid http(s) URL: {val!r}")
            row[key] = val

        primary = row.get("website_or_cfp_link", "")
        all_links: List[str] = []
        if primary and URL_RE.match(primary):
            if primary in fetch_cache or fetch_count < max_fetches:
                if primary not in fetch_cache:
                    fetch_count += 1
                status, body = fetch_url(primary, fetch_cache)
                if status is None:
                    out.warnings.append("website_or_cfp_link unreachable")
                elif status >= 400:
                    out.warnings.append(f"website_or_cfp_link returned HTTP {status}")
                if body:
                    all_links.extend(extract_candidate_links(primary, body))
            else:
                out.warnings.append("link verification skipped (fetch limit reached)")

        if primary and not row.get("cft_link"):
            candidate = best_match(all_links, ("cft", "train", "call-for-trainers"))
            update_if_missing(row, "cft_link", candidate, out.changes)
        if primary and not row.get("cfw_link"):
            candidate = best_match(all_links, ("cfw", "workshop", "call-for-workshops"))
            update_if_missing(row, "cfw_link", candidate, out.changes)
        if primary and ("cfp" not in primary.lower()):
            candidate = best_match(all_links, ("cfp", "call-for-papers", "sessionize", "papercall", "pretalx"))
            if candidate and not row.get("website_or_cfp_link", "").strip():
                row["website_or_cfp_link"] = candidate
                out.changes.append(f"website_or_cfp_link: empty -> {candidate}")

        tracks = (row.get("submission_tracks") or "").lower()
        has_workshops_track = "workshop" in tracks
        maybe_update_unknown_flag(row, "accepts_cft", bool(row.get("cft_link")), out.changes, out.warnings)
        maybe_update_unknown_flag(row, "accepts_cfw", bool(row.get("cfw_link")), out.changes, out.warnings)
        if has_workshops_track and row.get("accepts_cfw", "") == "Unknown":
            row["accepts_cfw"] = "Yes"
            out.changes.append("accepts_cfw: Unknown -> Yes (submission_tracks includes Workshops)")
        maybe_update_unknown_flag(
            row,
            "accepts_cfp",
            bool(row.get("website_or_cfp_link") and "cfp" in row["website_or_cfp_link"].lower()),
            out.changes,
            out.warnings,
        )

        if out.changes:
            row["last_verified_date"] = today
            changed_rows += 1

        outcomes.append(out)

    if apply_changes:
        write_csv(csv_path, fieldnames, rows)

    return outcomes, changed_rows


def write_report(path: str, outcomes: List[RowOutcome], changed_rows: int) -> None:
    errors = sum(1 for o in outcomes if o.errors)
    warnings = sum(1 for o in outcomes if o.warnings)
    touched = [o for o in outcomes if o.changes]

    lines = [
        "# Conference Data Verification Report",
        "",
        f"- Generated: {dt.datetime.now().isoformat(timespec='seconds')}",
        f"- Rows with changes: {changed_rows}",
        f"- Rows with warnings: {warnings}",
        f"- Rows with errors: {errors}",
        "",
    ]

    if touched:
        lines.append("## Auto-updated Rows")
        for o in touched:
            lines.append(f"- {o.name} (row {o.idx})")
            for c in o.changes:
                lines.append(f"  - {c}")
        lines.append("")

    problematic = [o for o in outcomes if o.warnings or o.errors]
    if problematic:
        lines.append("## Warnings and Errors")
        for o in problematic:
            lines.append(f"- {o.name} (row {o.idx})")
            for w in o.warnings:
                lines.append(f"  - WARNING: {w}")
            for e in o.errors:
                lines.append(f"  - ERROR: {e}")
    else:
        lines.append("## Warnings and Errors")
        lines.append("- None")

    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "w", encoding="utf-8") as fh:
        fh.write("\n".join(lines) + "\n")


def parse_args(argv: List[str]) -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Validate conference CSV, enrich links, and generate a report."
    )
    parser.add_argument(
        "--csv",
        default="conferences.csv",
        help="Path to conferences CSV (default: conferences.csv)",
    )
    parser.add_argument(
        "--apply",
        action="store_true",
        help="Write discovered safe changes back to CSV",
    )
    parser.add_argument(
        "--report",
        default=f"reports/verification-{dt.date.today().isoformat()}.md",
        help="Output markdown report path",
    )
    parser.add_argument(
        "--max-fetches",
        type=int,
        default=40,
        help="Maximum number of webpages to fetch per run (default: 40)",
    )
    return parser.parse_args(argv)


def main(argv: List[str]) -> int:
    args = parse_args(argv)
    try:
        outcomes, changed_rows = run_pipeline(args.csv, args.apply, args.max_fetches)
        write_report(args.report, outcomes, changed_rows)
    except Exception as exc:
        print(f"Pipeline failed: {exc}", file=sys.stderr)
        return 1

    mode = "APPLY" if args.apply else "DRY-RUN"
    print(f"[{mode}] Completed verification. Report: {args.report}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main(sys.argv[1:]))
