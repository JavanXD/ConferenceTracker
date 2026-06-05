#!/usr/bin/env python3
"""Validate conferences.csv against docs/CATALOG.md (used by CI)."""

from __future__ import annotations

import csv
import re
import sys
from pathlib import Path

REPO = Path(__file__).resolve().parents[1]
CSV_PATH = REPO / "data" / "conferences.csv"
CATALOG_PATH = REPO / "docs" / "CATALOG.md"

MM_DD = re.compile(r"^(TBD|\d{2}-\d{2})$")
ISO_DATE = re.compile(r"^(TBD|\d{4}-\d{2}-\d{2})$")


def load_expected_header() -> list[str]:
    text = CATALOG_PATH.read_text(encoding="utf-8")
    for line in text.splitlines():
        stripped = line.strip()
        if stripped.startswith("conference_name,"):
            return stripped.split(",")
    raise SystemExit(f"Could not find CSV header in {CATALOG_PATH}")


def normalize_deadline(value: str) -> str:
    clean = value.strip()
    return clean if clean else "TBD"


def validate_mm_dd(value: str, field: str, row_num: int, errors: list[str]) -> None:
    clean = normalize_deadline(value)
    if not MM_DD.match(clean):
        errors.append(f"row {row_num}: invalid {field} {value!r} (expected MM-DD or TBD)")


def validate_iso_date(value: str, field: str, row_num: int, errors: list[str]) -> None:
    if not ISO_DATE.match(value):
        errors.append(
            f"row {row_num}: invalid {field} {value!r} (expected YYYY-MM-DD or TBD)"
        )


def main() -> int:
    if not CSV_PATH.is_file():
        print(f"::error file={CSV_PATH}::Missing conferences.csv", file=sys.stderr)
        return 1

    expected = load_expected_header()
    errors: list[str] = []
    names: dict[str, int] = {}

    with CSV_PATH.open(newline="", encoding="utf-8") as handle:
        reader = csv.reader(handle)
        try:
            header = next(reader)
        except StopIteration:
            print("::error::conferences.csv is empty", file=sys.stderr)
            return 1

        if header != expected:
            errors.append(
                "CSV header does not match docs/CATALOG.md "
                f"(expected {len(expected)} columns, got {len(header)})"
            )

        for row_num, row in enumerate(reader, start=2):
            if not any(cell.strip() for cell in row):
                continue
            if len(row) != len(expected):
                errors.append(
                    f"row {row_num}: expected {len(expected)} columns, got {len(row)}"
                )
                continue

            record = dict(zip(expected, row))
            name = record["conference_name"].strip()
            if not name:
                errors.append(f"row {row_num}: missing conference_name")
                continue

            key = name.casefold()
            if key in names:
                errors.append(
                    f"row {row_num}: duplicate conference_name {name!r} "
                    f"(first seen row {names[key]})"
                )
            else:
                names[key] = row_num

            for field in (
                "cfp_deadline_MM-DD",
                "cft_deadline_MM-DD",
                "cfw_deadline_MM-DD",
                "cfv_deadline_MM-DD",
            ):
                validate_mm_dd(record[field].strip(), field, row_num, errors)

            for field in (
                "conference_start_date",
                "conference_end_date",
                "last_verified_date",
            ):
                validate_iso_date(record[field].strip(), field, row_num, errors)

    if errors:
        for msg in errors:
            print(f"::error file={CSV_PATH}::{msg}", file=sys.stderr)
        print(f"::error::Found {len(errors)} catalog validation error(s)", file=sys.stderr)
        return 1

    print(f"Validated {len(names)} conference row(s) in {CSV_PATH.name}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
