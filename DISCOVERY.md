# Discovery tooling (local)

Scraping and pipeline automation live in **`discovery/`** (gitignored by default).

Read **`discovery/00_STEP_ORDER.md`** after you have the folder locally.

Quick run from repo root:

```bash
discovery/02_collect/.venv/bin/python discovery/04_orchestrate/step_10_sync.py --research --backend web
```

To commit discovery: remove `/discovery/` from `.gitignore`, enable `.github/workflows/conference-discovery.yml`, add `OPENAI_API_KEY`.
