# Contributing Data Updates

This project accepts updates through pull requests (PRs).

## What You Can Contribute

- Add a new cybersecurity / infosec / hacking event entry.
- Update an existing entry (deadlines, links, city/country, status, notes).
- Fix formatting or broken links.

## Before You Start

- Make sure you have a GitHub account.
- Fork this repository (if you do not have write access).
- Clone your fork locally.

## Branch and Edit Workflow

1. Create a branch:

```bash
git checkout -b chore/update-conference-entry
```

2. Edit `conferences.csv` per [`docs/CATALOG.md`](docs/CATALOG.md) (schema) and [`.cursor/skills/update-conference-data/SKILL.md`](.cursor/skills/update-conference-data/SKILL.md) (research rules).

3. Validate your changes:
   - Check for accidental extra commas or broken CSV rows.
   - Ensure URLs are valid and direct where possible.
   - If unsure about a value, keep `TBD` / `Unknown` rather than guessing.

4. Commit:

```bash
git add conferences.csv
git commit -m "Update conference entry details"
```

5. Push your branch:

```bash
git push -u origin chore/update-conference-entry
```

6. Open a Pull Request on GitHub.

## Pull Request Checklist

- Clearly state whether you **added** or **updated** entries.
- List affected conference names.
- Mention key changed fields (for example: deadlines, links, location, status).
- Note any estimated values and why they were estimated.

## Suggested PR Title Format

- `Add: <Conference Name>`
- `Update: <Conference Name> deadlines and links`
- `Update: multiple conference entries (dates/links/status)`

## Review Expectations

- Maintainers may request source verification for critical fields.
- PRs with uncertain values should keep `TBD`/`Unknown` and include notes.
- Keep changes scoped; avoid unrelated formatting churn.

## Automated discovery (maintainers)

Optional **`discovery/`** folder (gitignored by default): scrapers + pipeline. See `discovery/README.md` when present locally.
