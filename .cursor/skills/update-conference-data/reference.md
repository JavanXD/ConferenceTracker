# `conferences.csv` reference

Canonical file: `conferences.csv` at repo root. The dashboard parses with Papa Parse; invalid values may be coerced to `TBD`/`Unknown` (see `normalizeAndValidateRows` in `app.js`).

## Column order (28 columns)

Do not reorder. Header must match exactly:

```
conference_name,priority_level,attendees_500_plus,academic_acceptance_level,cfp_deadline_month,submission_tracks,accepts_cfp,accepts_cft,accepts_cfw,accepts_cfv,travel_accommodation_sponsorship,cfp_deadline_MM-DD,cft_deadline_MM-DD,cfw_deadline_MM-DD,cfv_deadline_MM-DD,conference_start_date,conference_end_date,city,country,website_or_cfp_link,cft_link,cfw_link,cfv_link,conference_type,timezone,notes,last_verified_date,venue_pattern
```

## Columns

| # | Column | Format / values |
|---|--------|-----------------|
| 1 | `conference_name` | Official display name (required) |
| 2 | `priority_level` | `High` \| `Medium` \| `Low` |
| 3 | `attendees_500_plus` | `Yes` \| `No` \| `Unknown` |
| 4 | `academic_acceptance_level` | `Academic` \| `Industry` \| `Mixed` \| `Unknown` |
| 5 | `cfp_deadline_month` | English month name or `TBD` |
| 6 | `submission_tracks` | Pipe-separated track labels (e.g. `Talks`, `Workshops`, `Trainings`, `CTF`, `Panels`, `Villages`) |
| 7–10 | `accepts_cfp` … `accepts_cfv` | `Yes` \| `No` \| `Unknown` |
| 11 | `travel_accommodation_sponsorship` | `Yes` \| `No` \| `Unknown` \| `Partial` |
| 12–15 | `*_deadline_MM-DD` | `MM-DD` or `TBD` (empty often treated as missing; prefer `TBD`) |
| 16–17 | `conference_start_date`, `conference_end_date` | `YYYY-MM-DD` or `TBD` |
| 18–19 | `city`, `country` | Plain text; `TBD` for unknown city |
| 20 | `website_or_cfp_link` | HTTPS URL to main site or primary CFP |
| 21–23 | `cft_link`, `cfw_link`, `cfv_link` | Dedicated URL or empty |
| 24 | `conference_type` | `In-Person` \| `Hybrid` \| `Virtual` |
| 25 | `timezone` | IANA timezone id |
| 26 | `notes` | Free text; cite sources, CFP state, estimates |
| 27 | `last_verified_date` | `YYYY-MM-DD` (use today when you verify) |
| 28 | `venue_pattern` | `Rotating` \| `Mostly Fixed` \| `Fixed` \| `Unknown` |

## Link fields

| Field | Use when |
|-------|----------|
| `website_or_cfp_link` | Homepage or single best CFP entry point |
| `cft_link` | Separate training CFP (e.g. Black Hat trainings portal) |
| `cfw_link` | Workshop CFP or workshop info page |
| `cfv_link` | Volunteer / staff call |

Prefer **direct** CFP URLs (Sessionize event, PaperCall call, Pretalx event) over generic homepages when speakers submit there.

## Common `submission_tracks` tokens

Use existing repo patterns where possible:

`Talks`, `Workshops`, `Trainings`, `CTF`, `Panels`, `Villages`, `Briefings`

Combine with `|`, no spaces around the pipe.

## CSV quoting

Quote the whole field if it contains a comma:

```csv
ExampleCon,High,Yes,Industry,March,Talks,Yes,No,No,Unknown,Unknown,03-15,TBD,TBD,TBD,2026-06-01,2026-06-03,Berlin,Germany,https://example.com/cfp,,,,In-Person,Europe/Berlin,"Official site lists CFP Mar 15; hybrid optional.",2026-06-01,Rotating
```

## Priority guidance

| Level | Typical events |
|-------|----------------|
| `High` | Major industry cons, Black Hat, DEF CON ecosystem flagships, large academic venues |
| `Medium` | Regional cons, AppSec days, mid-size BSides |
| `Low` | Small/local BSides, niche or unconfirmed editions |

When unsure, ask the user or use `Medium` with `Unknown` attendance.

## Country names

Normalize for map geocoding consistency:

- `United States`, `United Kingdom`, `United Arab Emirates`
- `Netherlands`, `Czech Republic`, `South Korea`
- City spelling: `Zürich`, `São Paulo` as on official site when stable

## App validation (sanitized on load)

- Invalid `MM-DD` / `YYYY-MM-DD` → coerced to `TBD` + console warning
- `accepts_*` / `accepts_cfv` / `venue_pattern` → invalid enum → `Unknown` (or default for accepts)

Fix warnings in the CSV rather than relying on runtime coercion.
