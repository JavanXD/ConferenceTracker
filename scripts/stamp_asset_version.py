#!/usr/bin/env python3
"""Stamp ?v=<git-sha> on local static assets referenced from HTML."""

from __future__ import annotations

import re
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
HTML_FILES = ("index.html", "impressum.html", "privacy.html")
ASSET_RE = re.compile(
    r'(\./(?:styles\.css|app\.js|assets/bootstrap\.js|assets/obfuscate-email\.js))(?:\?v=[^"\']+)?'
)
ASSET_DATA_V_RE = re.compile(r'(data-v=")[^"]*(")')


def git_short_sha() -> str:
    return subprocess.check_output(
        ["git", "rev-parse", "--short", "HEAD"],
        cwd=ROOT,
        text=True,
    ).strip()


def stamp_file(path: Path, version: str) -> bool:
    original = path.read_text(encoding="utf-8")
    updated = ASSET_RE.sub(rf"\1?v={version}", original)
    updated = ASSET_DATA_V_RE.sub(rf"\g<1>{version}\g<2>", updated)
    if updated == original:
        return False
    path.write_text(updated, encoding="utf-8")
    return True


def main() -> int:
    version = git_short_sha()
    (ROOT / "ASSET_VERSION").write_text(f"{version}\n", encoding="utf-8")
    changed = False
    for name in HTML_FILES:
        path = ROOT / name
        if not path.exists():
            print(f"skip missing {name}", file=sys.stderr)
            continue
        if stamp_file(path, version):
            print(f"stamped {name} -> v={version}")
            changed = True
    if not changed:
        print(f"asset versions already at v={version}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
