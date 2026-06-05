# Conference catalog (`data/conferences.csv`)

Canonical reference for the static catalog in `data/`. The dashboard loads it with Papa Parse; invalid values may coerce to `TBD`/`Unknown` (`normalizeAndValidateRows` in `app.js`).

**How to edit rows:** [`.cursor/skills/update-conference-data/SKILL.md`](../.cursor/skills/update-conference-data/SKILL.md) (research workflow). **PRs:** [`CONTRIBUTING.md`](../CONTRIBUTING.md).

**Not stored in CSV:** `accepts_cfp` … `accepts_cfv`, `cfp_deadline_month` — derived on load from `*_deadline_MM-DD`.

## Header (do not reorder)

```
conference_name,priority_level,attendees_500_plus,academic_acceptance_level,submission_tracks,travel_accommodation_sponsorship,cfp_deadline_MM-DD,cft_deadline_MM-DD,cfw_deadline_MM-DD,cfv_deadline_MM-DD,conference_start_date,conference_end_date,city,country,website_or_cfp_link,cft_link,cfw_link,cfv_link,conference_type,timezone,notes,last_verified_date,venue_pattern
```

## Columns

| # | Column | Values / notes |
|---|--------|----------------|
| 1 | `conference_name` | Official name (required) |
| 2 | `priority_level` | `High` \| `Medium` \| `Low` — see [priority](#priority) |
| 3 | `attendees_500_plus` | `Yes` \| `No` \| `Unknown` |
| 4 | `academic_acceptance_level` | `Academic` \| `Industry` \| `Mixed` \| `Unknown` |
| 5 | `submission_tracks` | Optional **extras only** (`CTF`, `Panels`, `Villages`, `Briefings`, …) — see [Name badges](#name-badges) |
| 6 | `travel_accommodation_sponsorship` | `Yes` \| `No` \| `Unknown` \| `Partial` |
| 7–10 | `*_deadline_MM-DD` | `MM-DD` or `TBD` — **source of truth** per submission type; keep **past** close dates |
| 11–12 | `conference_start_date`, `conference_end_date` | `YYYY-MM-DD` or `TBD` — fill **last official edition** when next year unknown; edition history / relocation in `notes` |
| 13–14 | `city`, `country` | Plain text; `TBD` city ok; normalize country names — see [countries](#country-names) |
| 15 | `website_or_cfp_link` | Main site or primary talk CfP |
| 16–18 | `cft_link`, `cfw_link`, `cfv_link` | Dedicated portal only — see [links and UI](#links-and-ui) |
| 19 | `conference_type` | `In-Person` \| `Hybrid` \| `Virtual` |
| 20 | `timezone` | IANA id |
| 21 | `notes` | Evidence, open CfP without close date, prior editions, `Estimated …` when inferring |
| 22 | `last_verified_date` | `YYYY-MM-DD` — set to **today** on every row you touch |
| 23 | `venue_pattern` | `Rotating` \| `Mostly Fixed` \| `Fixed` \| `Unknown` |

### Deadlines (`MM-DD`)

| Record | Column |
|--------|--------|
| Talk / training / workshop / volunteer close | `cfp_` / `cft_` / `cfw_` / `cfv_` |
| No public or unknown close | `TBD` + explain in `notes` |

Do **not** clear deadlines or conference dates when CfP is closed. Open on PaperCall/Sessionize with no close date → `TBD` + portal URL + note.

`MM-DD` is resolved against **conference edition year** from `conference_start_date` (CfP month-day before event start → prior calendar year). Actionable vs past is computed in `app.js`.

### Conference dates (`YYYY-MM-DD`)

| Situation | Action |
|-----------|--------|
| Next edition announced | Official start/end |
| Not announced | Latest **verifiable** edition (even years ago); older runs in `notes` |
| Series relocated | Regional row keeps last **local** dates; note new city or add a row |
| Nothing verifiable | `TBD` only then |

Single-day: same date in start and end. Stale CSV years still matter: missing conference dates → **TBD** / empty **Next Due** even though the UI can project occurrences once dates exist.

## Links and UI

| Curator sets | Speaker table |
|--------------|----------------|
| `MM-DD` + type link | Linked date |
| `MM-DD`, link empty | Date only |
| `TBD` + URL for that type | Platform emoji (Sessionize 📅, PaperCall 📣, …) |
| `TBD`, no URL | Empty cell |

| Field | Rule |
|-------|------|
| `website_or_cfp_link` | Homepage or best talk CfP |
| `cft_link` | Distinct training portal; implies **Trainings** (no need to repeat in `submission_tracks`) |
| `cfw_link` | Distinct workshop portal; implies **Workshops** |
| `cfv_link` | Volunteer / staff call |

**Filters:** *Has deadline* = valid `MM-DD`; *No deadline* = `TBD`/empty (includes link-only). **Open CfPs** = CfP still in the future. **Sponsorship** `Unknown` → **—**; filter **Unset**. Detail panel lists deadlines + links. Export omits derived `accepts_*`.

### Name badges

Small letters beside the conference name (e.g. **C** = CTF) are **not** separate CSV columns.

| Source | Effect |
|--------|--------|
| `cfp_deadline_MM-DD` (valid) | **Talks** implied — no **P** badge (CfP column covers talks) |
| `cft_deadline_MM-DD` or `cft_link` | **Trainings** implied — no **T** badge |
| `cfw_deadline_MM-DD` or `cfw_link` | **Workshops** implied — no **W** badge |
| `submission_tracks` | Only tokens **not** implied above become badges (typically `CTF`, `Panels`, `Villages`) |

**Minify CSV:** leave `submission_tracks` empty when the row only has talks/trainings/workshops via deadline/link columns; add `CTF|Villages` only for extra program types. Detail **Tracks** merges implied + listed tokens.

**Next Due / Start / End (display):** projects next calendar occurrence from stored dates (`est.`, italic dates); ICS and “open CfP” filters use **stored** values only. Pipeline/trip default year = projected occurrence.

## CSV quoting

Quote fields that contain commas; escape `"` as `""`.

```csv
ExampleCon,High,Yes,Industry,Talks,Unknown,03-15,TBD,TBD,TBD,2026-06-01,2026-06-03,Berlin,Germany,https://example.com/cfp,,,,In-Person,Europe/Berlin,"CFP Mar 15; hybrid.",2026-06-01,Rotating
```

## Priority

| Level | Typical |
|-------|---------|
| `High` | Major industry cons, flagship camps |
| `Medium` | Regional cons, AppSec days, mid BSides |
| `Low` | Small/local BSides, unconfirmed |

## Country names

`United States`, `United Kingdom`, `United Arab Emirates`, `Netherlands`, `Czech Republic`, `South Korea`; city spelling per official site when stable.

## App validation (on load)

Invalid `MM-DD` / `YYYY-MM-DD` → `TBD` + console warning; bad `venue_pattern` → `Unknown`; mistaken `cft_`/`cfw_` homepage links may be stripped when tracks don’t match. Fix CSV rather than relying on coercion.
