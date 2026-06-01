---
name: update-conference-data
description: >-
  Add or update rows in conferences.csv for the Conference Tracker dashboard.
  Use when the user asks to add a conference, update deadlines/links/location,
  fix missing data, verify CFP/CfT/CfW, enrich notes, or edit conference catalog
  entries. Requires web research from official sources before writing values.
---

# Update conference data (`conferences.csv`)

## Scope

- **In scope:** `conferences.csv` only (the static catalog the app loads).
- **Out of scope:** `index.html` / `app.js` unless the user explicitly asks for UI changes.
- **PR workflow:** See [CONTRIBUTING.md](../../../CONTRIBUTING.md). Column reference: [reference.md](reference.md).

## Before editing

1. **Read the header row** in `conferences.csv` — never reorder or rename columns.
2. **Search for an existing row** by `conference_name` (and region/edition if the name is ambiguous).
3. **Research on the web** — do not rely on training data alone for dates, deadlines, or URLs.

## Update vs add

| Situation | Action |
|-----------|--------|
| Same conference already listed | **Update** only changed fields; keep verified values |
| New event or distinct regional edition | **Add** one new row |
| Duplicate names (e.g. merged editions) | **Merge** into one row per user intent; remove obsolete duplicate if asked |

Match naming to how the community knows the event (official branding). Prefer one row per logical conference the dashboard should show.

### Duplicate safety (required)

- **Search the full catalog** before any **add** — exact name, similar name, and same official domain.
- If a row already exists (even under slightly different spelling), **update that row** — do not add a second.
- **Never** create two rows for the same conference edition.
- When merging from [`discovery/pipeline/proposals/`](../../../discovery/pipeline/HUMAN_REVIEW.md): respect `proposed_action`, `matched_catalog_name`, and `risk_flags`; run `python discovery/pipeline/validate_proposal.py` on the proposal file first if the user is doing a batch merge.

## Research (required)

Use **WebSearch** / **WebFetch** (or equivalent) until you can cite official evidence.

### Source priority

1. **Official conference website** — dates, location, CFP/CfT/CfW pages
2. **Official submission platforms** — [Sessionize](https://sessionize.com), [PaperCall](https://www.papercall.io), [Pretalx](https://pretalx.com), vendor CFP portals (e.g. Black Hat awards platform)
3. **Official organizer posts** — only when the site is stale
4. **Aggregators / directories** — leads only; **verify** on an official source before writing

### What to collect

- Conference **start/end** dates (`YYYY-MM-DD`)
- **CfP / CfT / CfW / CfV** open or closed; **MM-DD** deadline when published (else `TBD`)
- **Direct URLs:** main site or CFP page → `website_or_cfp_link`; dedicated CfT/CfW/CfV → `cft_link`, `cfw_link`, `cfv_link`
- **City, country**, **In-Person / Hybrid / Virtual**, **IANA timezone**
- **Tracks** (talks, trainings, workshops, CTF, etc.) for `submission_tracks` and `accepts_*` flags
- **Sponsorship** (travel/hotel) when stated officially
- Short **notes** with evidence (portal name, “CFP open, close date not published”, prior-year estimate, etc.)

### Hard limits

- **Never invent** exact dates, deadlines, or URLs.
- Use **`TBD`** or **`Unknown`** when not verifiable.
- Prior-year or pattern-based guesses → prefix **`Estimated`** in `notes` and keep fields `TBD`/`Unknown` unless the user explicitly wants estimates in the cell.
- **PaperCall/Sessionize open with no close date:** `cfp_deadline_MM-DD` = `TBD`, `accepts_cfp` = `Yes` if submissions are open, explain in `notes`.

## Field rules (summary)

Full column list and enums: [reference.md](reference.md).

- **Enums only** — e.g. `Yes|No|Unknown`, `High|Medium|Low`, `Academic|Industry|Mixed|Unknown`, `In-Person|Hybrid|Virtual`
- **Recurring deadlines:** `MM-DD` or `TBD` (`cfp_deadline_MM-DD`, etc.)
- **Calendar dates:** `YYYY-MM-DD` or `TBD` (conference dates, `last_verified_date`)
- **`cfp_deadline_month`:** English month name (e.g. `March`) or `TBD`
- **`submission_tracks`:** pipe-separated, e.g. `Talks|Workshops|Trainings`
- **`country`:** normalized names (`United States`, `United Kingdom`, `Chile`, …)
- **`timezone`:** valid IANA id (`Europe/Berlin`, `America/Los_Angeles`, …)
- **`last_verified_date`:** set to **today** (`YYYY-MM-DD`) for **every row you touch**
- **`notes`:** one line preferred; include source hints (no markdown links required)

### How the app uses deadlines

- `MM-DD` is interpreted against the **conference edition year** from `conference_start_date`.
- If the deadline’s month-day is **after** the conference start in the calendar year, the dashboard treats it as the **previous** year (typical for CfPs months before the event).
- Open CfP with a deadline already passed for the current edition → row may not show as “actionable”; fix dates or notes rather than forcing wrong `MM-DD`.

## CSV editing

- Preserve **exact column order** and header names.
- Fields containing **commas** must be **double-quoted**; escape `"` as `""`.
- Leave optional link columns **empty** when there is no dedicated URL (do not duplicate the main URL without reason).
- Avoid wide reformatting of unrelated rows.
- After edits, skim for **ragged rows** (extra commas, broken quotes).

## Workflow checklist

Copy and track:

```
- [ ] Existing row located (or confirmed new)
- [ ] Official site + CFP platform checked
- [ ] Dates/deadlines/links verified (or TBD/Unknown)
- [ ] Enums and formats match reference
- [ ] last_verified_date set on touched rows
- [ ] notes mention sources / open CFP without close date
- [ ] Summary prepared for user
```

## Deliverable to the user

After editing, report:

1. **Added** / **updated** counts
2. **Conference names** touched
3. **Key changes** (deadlines, links, location, accepts_*)
4. **Still missing** on High-priority rows (TBD/Unknown on critical fields), if any
5. **Sources** used (URLs or portal names) when anything was non-obvious

## Leads from extractors / pipeline (optional)

Conference **names and high-level hints** from the discovery stack:

- **Discovery tooling** ([`discovery/README.md`](../../../discovery/README.md), gitignored) — collect + LLM extract + [`discovery/pipeline/`](../../../discovery/pipeline/HUMAN_REVIEW.md) proposals with `proposed_action`, `matched_catalog_name`, `risk_flags`.

The **pipeline never writes** `conferences.csv`. On GitHub Actions (when enabled), proposals may include **web research** JSON in `research_notes` (OpenAI + fetched pages). Use this skill when the **human** asks to merge **approved** rows. Run `python discovery/pipeline/validate_proposal.py` on the proposal file first when doing a batch merge. Verify on **official** sites; respect `proposed_action` and `risk_flags`.

## Optional verification

Load the app locally (`python3 -m http.server 8000` → `index.html`) and confirm the row renders without CSV warnings in the browser console.

## Examples

**CfP open on PaperCall, no close date published**

- `accepts_cfp`: `Yes`
- `cfp_deadline_MM-DD`: `TBD`
- `website_or_cfp_link`: PaperCall URL
- `notes`: … CFP open on PaperCall; close date not published …

**Update deadlines only**

- Change `cfp_deadline_MM-DD`, `cfp_deadline_month`, links; bump `last_verified_date`; leave unrelated fields unchanged.

**New BSides / village event**

- New row; `priority_level` usually `Low` or `Medium` unless user specifies; research pretalx/sessionize CFP; set `venue_pattern` when known (`Unknown` if not).
