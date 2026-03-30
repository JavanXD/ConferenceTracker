# Conference Tracker CSV Template

This project contains a CSV template for tracking conference speaking opportunities:

- `conferences.csv`
- `index.html` (static dashboard UI that reads the CSV)

The CSV uses normalized, analysis-friendly column names (`snake_case`) and placeholder values.

## Columns

- `conference_name`  
  Official conference name.

- `priority_level`  
  Internal priority for your planning. Suggested values: `High`, `Medium`, `Low`.

- `attendees_500_plus`  
  Whether expected attendance is over 500. Suggested values: `Yes`, `No`, `Unknown`.

- `academic_acceptance_level`  
  Whether the conference is acceptable for PhD/academic profile building. Suggested values: `Academic`, `Industry`, `Mixed`, `Unknown`.

- `cfp_deadline_month`  
  Typical month when CfP closes each year (for recurring events). Example: `March`.

- `submission_tracks`  
  What the event accepts. Example values: `Talks`, `Talks|Workshops`, `Talks|Trainings|Workshops`.

- `accepts_cfp`  
  Whether this conference currently accepts CfP (talk proposals). Suggested values: `Yes`, `No`, `Unknown`.

- `accepts_cft`  
  Whether this conference currently accepts CfT (trainer/training proposals). Suggested values: `Yes`, `No`, `Unknown`.

- `accepts_cfw`  
  Whether this conference currently accepts CfW (workshop proposals). Suggested values: `Yes`, `No`, `Unknown`.

- `travel_accommodation_sponsorship`  
  Whether speaker travel/accommodation support is available. Suggested values: `Yes`, `No`, `Unknown`, `Partial`.

- `cfp_deadline_MM-DD`  
  Recurring annual Call for Proposals deadline. Required format: `MM-DD` (use `TBD` if unknown).

- `cft_deadline_MM-DD`  
  Recurring annual Call for Trainers deadline. Required format: `MM-DD` (use `TBD` if unknown).

- `cfw_deadline_MM-DD`  
  Recurring annual Call for Workshops deadline. Required format: `MM-DD` (use `TBD` if unknown).

- `conference_start_date`  
  First day of the conference. Required format: `YYYY-MM-DD` (use `TBD` if unknown).

- `conference_end_date`  
  Last day of the conference. Required format: `YYYY-MM-DD` (use `TBD` if unknown).

- `city`  
  Host city (or primary city if multi-location).

- `country`  
  Host country.

- `website_or_cfp_link`  
  Main conference page or direct CfP page URL.

- `cft_link`  
  Direct Call for Trainers link if available, otherwise leave blank.

- `cfw_link`  
  Direct Call for Workshops link if available, otherwise leave blank.

- `conference_type`  
  Suggested values: `In-Person`, `Hybrid`, `Virtual`.

- `venue_pattern`  
  Whether host location changes over time. Suggested values: `Rotating`, `Mostly Fixed`, `Fixed`, `Unknown`.

- `timezone`  
  Primary conference timezone, e.g. `UTC`, `Europe/Berlin`, `Asia/Kolkata`.

- `notes`  
  Free-text notes (selection criteria, speaker perks, reminders, etc.).

- `last_verified_date`  
  Date you last checked this row for accuracy. Format: `YYYY-MM-DD`.

## Data Entry Conventions

- Use `MM-DD` for recurring annual deadlines: `cfp_deadline_MM-DD`, `cft_deadline_MM-DD`, `cfw_deadline_MM-DD`.
- Use `YYYY-MM-DD` for event-specific dates: `conference_start_date`, `conference_end_date`, `last_verified_date`.
- Keep categorical values consistent to make filtering/reporting reliable.
- Use `Unknown` instead of leaving important boolean-like fields blank.
- Leave links blank only when genuinely unavailable.
- If only month or rough timing is known, keep exact date fields as `TBD` and document assumptions in `notes`.

## AI Agent: How to Find Missing Information

Use this workflow when an AI agent is asked to enrich rows with missing values (`TBD`, `Unknown`, blank links).

### 1) Prioritize trusted sources (in order)

- First choice: official conference website pages (main site, official CfP/CfT/CfW pages).
- Second choice: official submission platforms used by the organizer (e.g. Sessionize, PaperCall, Pretalx).
- Third choice: official organizer social posts only when no better source exists.
- Fourth choice: event directories/aggregators only as lead sources; confirm with an official source before writing final values.
- Always prefer the newest edition page when multiple years are available.

### 2) Field-by-field lookup strategy

- `cfp_deadline_MM-DD`, `cft_deadline_MM-DD`, `cfw_deadline_MM-DD`: normalize recurring dates to `MM-DD`; if only a month is known, keep `cfp_deadline_month` and set deadline to `TBD`.
- `accepts_cfp`, `accepts_cft`, `accepts_cfw`: set `Yes` only if the call is explicitly open/announced; otherwise `No` or `Unknown`.
- `website_or_cfp_link`, `cft_link`, `cfw_link`: prefer the direct call page over generic homepages.
- `conference_start_date`, `conference_end_date`: use event program/date page, not assumptions.
- `city`, `country`, `timezone`: use the official venue/location page.

### 3) Consistency rules

- If no verified value is found, keep `Unknown`/`TBD` (do not invent).
- If current-year dates are missing but prior-year data is reliable, you may use a placeholder estimate based on repeating patterns; mark it clearly in `notes` with `Estimated from prior year pattern`.
- Update `last_verified_date` whenever a row is checked, even if values do not change.
- Add evidence notes in `notes` (short source hint, e.g. "CfT date from official call page").
- Keep enum-like values consistent (`Yes/No/Unknown`, `High/Medium/Low`, etc.).

### 4) Suggested agent loop

1. Select rows with missing values (`TBD`, `Unknown`, empty links).
2. Open official sources and extract exact values.
3. Update CSV row fields + `last_verified_date`.
4. Repeat until no high-priority missing fields remain.

### 5) Quick quality checklist before saving

- Deadline fields are in `MM-DD`; event/check dates are `YYYY-MM-DD` or `TBD`.
- Links are direct and working.
- CfP/CfT/CfW acceptance flags match the current call status.
- `notes` explains uncertain or partial data.
- If a value is estimated, `notes` must explicitly say `Estimated` and mention the basis (e.g. prior year dates).

### 6) Date and value format cheatsheet

- Deadline fields: `MM-DD` only (`01-07`, `11-22`, `TBD`).
- Event/check dates: `YYYY-MM-DD` only (`2026-04-15`, `2026-03-30`, `TBD`).
- Multi-day monthly unknown range is allowed only as `TBD` in date fields; keep month hint in `cfp_deadline_month`.
- Boolean-like fields must be `Yes`, `No`, or `Unknown` (no free text).
- Keep `conference_name` stable across years; use suffixes like `2024` only for explicit historical entries.

## Reusable AI Prompt (Add/Update Conferences)

Copy/paste this prompt when you want an AI agent to add or update conference rows:

```text
Update `conferences.csv` with the conference entries I provide.

Goals:
1) Add missing conferences as new rows.
2) Update existing rows if the conference already exists.
3) Fill missing fields by researching official sources online.

Mandatory rules:
- Keep the exact CSV column order and do not add/remove columns.
- Deadline fields must use `MM-DD`: `cfp_deadline_MM-DD`, `cft_deadline_MM-DD`, `cfw_deadline_MM-DD`.
- Date fields must use `YYYY-MM-DD` or `TBD`: `conference_start_date`, `conference_end_date`, `last_verified_date`.
- Use only `Yes` / `No` / `Unknown` for boolean-like fields.
- Prefer direct official links (conference site, official CfP/CfT/CfW page, official Sessionize/PaperCall/Pretalx page).
- Always make location fields map-ready for every touched row:
  - `city` and `country` must be concrete values, never `TBD`/`Various` unless genuinely unknown.
  - Normalize country names for geocoding (`United States`, `United Kingdom`, `United Arab Emirates` instead of abbreviations).
  - `timezone` must be a real IANA value (for example `Europe/Berlin`, `America/New_York`, `Asia/Singapore`).
- If city is unknown but country is known, set city to `TBD` and explicitly note `country-only location` in `notes`.
- If current-year data is missing, estimate from prior-year pattern and explicitly write `Estimated ...` in `notes`.
- If data cannot be verified, keep `TBD` or `Unknown` (never invent exact values).
- Always update `last_verified_date` to today for touched rows.

Source priority:
1) Official conference website
2) Official CFP platform page (Sessionize/PaperCall/Pretalx)
3) Official organizer social post
4) Aggregator only as a lead; verify with an official source before writing final values

What to return:
- Short summary of what was added vs updated
- List of rows still containing key `TBD`/`Unknown` fields
- Mention any estimated values added from prior-year patterns
- Include a `Map readiness` section with:
  - Count of touched rows that are fully geocodable (`city + country + timezone` present)
  - Rows still not geocodable and the exact missing fields
```

## Reusable AI Prompt (Optimize Missing Data + Run)

Use this when you want the agent to actively reduce missing data across the existing file:

```text
Optimize missing data in `conferences.csv` and run the update now.

Scope:
- Work on existing rows first (do not add new conferences unless explicitly requested).
- Prioritize High/Medium rows, then rows with official links already present.

Execution plan:
1) Identify rows with missing critical fields:
   - `TBD`/`Unknown` in `conference_start_date`, `conference_end_date`, `city`, `country`, `timezone`
   - `TBD` in `cfp_deadline_MM-DD`, `cft_deadline_MM-DD`, `cfw_deadline_MM-DD`
2) Research using source priority:
   - official conference site
   - official CFP platform page (Sessionize/PaperCall/Pretalx)
   - official organizer social post
   - aggregator only as lead, must verify with official source
3) Update values with strict formats:
   - deadline fields: `MM-DD` or `TBD`
   - event/check dates: `YYYY-MM-DD` or `TBD`
   - boolean-like fields: `Yes|No|Unknown`
4) If current-year value is missing but prior-year pattern is reliable:
   - fill estimated value
   - add `Estimated ...` explanation in `notes`
5) Update `last_verified_date` for every touched row.
6) Validate map readiness before finishing:
   - ensure `city`, `country`, and `timezone` are present for touched rows
   - normalize country names (`United States`, `United Kingdom`, `United Arab Emirates`)
   - report any remaining non-geocodable rows explicitly

Hard constraints:
- Keep exact column order and CSV integrity.
- Never invent exact values without a source or a clearly marked estimate.
- Keep existing valid data unless correcting a format/value error.

What to return after run:
- Count of rows improved
- Which fields were most improved
- Remaining top-priority rows still missing critical data
```

## Getting Started

1. Open `conferences.csv`.
2. Replace placeholder row values with real conference data.
3. Add one row per conference.
4. Periodically update `last_verified_date`.

## Dashboard (Static Page)

`index.html` loads `conferences.csv` live in the browser and provides:

- searchable/filterable conference list
- summary metrics
- simple visual breakdowns (priority, CfP month)
- remembered filters via browser `localStorage`

### Run locally

Because browsers block `fetch()` for local files (`file://`), run a tiny local server in this folder:

```bash
python3 -m http.server 8000
```

Then open:

- [http://localhost:8000/index.html](http://localhost:8000/index.html)

Any CSV changes are picked up when you click **Reload CSV** (or refresh the page).
