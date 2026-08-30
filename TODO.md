# ConferenceTracker — Product Plan & Roadmap

This document is the **single source of truth** for product direction: vision, personas, UX architecture (so no role is overwhelmed), phased delivery, and checklists.

---

## Product vision

**ConferenceTracker** evolves from a static conference discovery dashboard into a **trusted place where organisers publish opportunities, speakers run their CfP life, and attendees plan and prove participation** — with shareable outcomes that drive organic growth.

**Core principle:** *Separate by intent (persona mode); unify by data (conferences).* Everyone shares the same conference catalog; each persona gets a **focused shell** and **role-relevant home**, not one cluttered mega-app.

---

## Strategic pillars (by persona)

| Persona | Job to be done | Product pillars |
|--------|----------------|-------------------|
| **Speaker** | Find the right CfPs, track submissions, prove credibility | Discovery + **My pipeline** + verified **speaker profile** + alerts |
| **Attendee** | Discover events, plan attendance, remember and **prove** participation | Discovery + **My trips** (shortlist/history) + **attendance badges** + alerts |
| **Organiser** | Accurate listing, trust, issuance, optional growth/analytics | **My event(s)** + verification + badge/token issuance + listing authority |

Cross-cutting: **trust** (verification), **fresh data** (`conferences.csv` + pipelines), **shareable public pages** (badges, profiles, conferences).

---

## UX architecture — avoid overwhelming users

### Persona mode (session-level)

- [ ] First-run or settings: **“What best describes you?”** — Speaker | Attendee | Organiser (short descriptions).
- [ ] Persist choice; **default navigation, home, and empty states** to that mode.
- [ ] **Persistent switcher** (e.g. header: “Viewing as: Speaker ▾”) — no hidden mode changes.
- [ ] **First-run copy** one promise per mode (e.g. Speaker: *Find CfPs and track submissions — add your profile when ready.*) — do **not** surface organiser tools until mode is Organiser or user opens organiser URL.

### Information architecture

- **Explore** — Shared: filters, map, search, conference list (neutral chrome).
- **My [Speaker \| Trips \| Events]** — Role-specific dashboard (pipeline, shortlist, organiser tools).
- **Profile / badges** — Speaker portfolio & badges; Attendee badge history; Organiser identity as needed.
- **Account** — Mode, notifications, privacy, data export.
- **Footer / Help** — GitHub, contribute data, docs — not primary nav.

### Navigation pattern (max 3–4 primary items per mode)

| Mode | Primary nav (example) |
|------|------------------------|
| Speaker | Discover · My pipeline · Profile · Alerts |
| Attendee | Discover · My trips · Badges · Alerts |
| Organiser | My events · Listings · Badges & verification · Analytics |

### Contextual actions (not global clutter)

- [ ] Conference **card / detail**: show **only CTAs for current mode** (e.g. Speaker: track CfP / add to pipeline; Attendee: save / claim attendance; Organiser: manage listing — if owner).
- [ ] Rare cross-role actions under **“More”** or after explicit mode switch.
- [ ] **Organiser-only** surfaces (bulk tokens, queues, widgets) **never** on Speaker or Attendee home.

### Public vs authenticated UX

- [ ] Public URLs (`/conference/...`, `/badge/...`, `/speaker/...`) stay **SEO-neutral**.
- [ ] After sign-in + mode: **same data**, **persona-stripped chrome** — primary tasks match mode, not a dump of all features.

---

## Growth alignment (PLG)

- **Shareable artifacts:** attendance badge, speaker badge, speaker profile — each with a **public landing page** + CTA for non-users.
- **Loops:** claim → verify → share → visit → sign up / claim (instrument in Phase 4).
- **No vanity gamification** — milestones tied to evidence (talks, countries, verified entries).

---

## Guiding principles

- Real value first (deadlines, proof, planning); growth is a consequence.
- Verify before scale on badges and profile claims.
- Progressive disclosure: default simple; Advanced / Organiser tools tucked away.
- Accessibility and mobile-friendly share flows.

---

## Phase 0 — Product, UX foundations, technical foundations

### 0.1 Product & scope
- [ ] Lock MVP boundaries for Speaker / Attendee / Organiser (what ships when).
- [ ] Define non-goals (e.g. no social graph v1, no global leaderboard).
- [ ] Align success metrics (see end of doc).

### 0.2 UX / IA (deliver before or with first logged-in build)
- [ ] Wireframes: **three home screens** (Speaker / Attendee / Organiser) + shared Explore.
- [ ] Spec: mode switcher, first-run onboarding copy, empty states per mode.
- [ ] Spec: contextual CTAs on conference card + detail by mode.

### 0.3 Data model (beyond `conferences.csv`)
- [x] **Discovery pipeline** (maintainer): `discovery/` (gitignored, numbered steps `01_config`…`07_runtime`) — collect + LLM → proposal CSV; human merge. Docs: `discovery/00_STEP_ORDER.md`.
- [ ] `users` + roles / persona preference
- [ ] `badges`, `claims`, `speaker_entries`, `verification_tokens`
- [ ] Optional: `saved_conferences` (attendee), `submission_items` (speaker pipeline), `organiser_event_links`
- [ ] Public slugs: `/conference/<slug>`, `/badge/<id>`, `/speaker/<handle>`

### 0.4 Architecture
- [ ] Static site + serverless APIs vs full-stack — ADR
- [ ] DB + object storage for assets; OG image strategy

### 0.5 Security & trust
- [ ] Anti-fraud baseline; moderation; rate limits; privacy toggles on profile entries

**Acceptance:** PRD + IA wireframes + schema + ADR; engineering unblocked.

---

## Phase 1 — Badge MVP + mode-aware shell

**Objective:** First growth loop (shareable proof) + **logged-in experience that respects persona** (no organiser noise for speakers).

### 1.1 Auth + persona mode
- [ ] Sign up / sign in (minimal)
- [ ] Mode selection + persistence + header switcher
- [ ] Route guards or layout variants so **Organiser nav** does not appear in Speaker/Attendee mode

### 1.2 Conference public pages
- [ ] `/conference/<slug>` — detail, OG/meta, **mode-aware CTAs** (track / save / claim / manage if organiser)

### 1.3 Badge claims & verification
- [ ] Attendance claim flow + speaker single-event claim
- [ ] States: pending / verified / rejected
- [ ] At least one verification path (token or moderator queue) + light admin UI

### 1.4 Badge artifacts & share
- [ ] `/badge/<id>` — verification, conference link, product CTA, OG image
- [ ] Share: copy link, LinkedIn helper, download image

**Acceptance:** Verified user can share a badge URL; recipient understands value; **Speaker default home** still does not show organiser tools.

---

## Phase 2 — Speaker portfolio + attendee “My trips” (parallel tracks)

**Objective:** Compounding identity for speakers; **attendee** value without mixing organiser UI.

### 2.1 Speaker
- [ ] `/speaker/<handle>` — bio, timeline, flags/countries, tracks, verified counts
- [ ] Entry claims with evidence; utility milestones only
- [ ] Speaker card export / share

### 2.2 Attendee
- [ ] **My trips:** saved conferences, notes, optional history
- [ ] **Attendance badges** list + link to public badge pages
- [ ] Empty state: “Save events or claim an attendance badge”

### 2.3 Explore remains shared
- [ ] No change to “one catalog”; only **My** areas diverge by mode

**Acceptance:** Speaker profile is shareable professional proof; Attendee has a clear home without speaker pipeline or organiser queues.

---

## Phase 3 — Organiser tools + scalable verification

**Objective:** Scale trust; **all heavy organiser UX lives here**, gated by mode/role.

### 3.1 Organiser onboarding & event link
- [ ] Organiser role + link user to conference record(s)
- [ ] Conference claim policies; verification settings

### 3.2 Issuance & operations
- [ ] Bulk attendance/speaker tokens; expiry/revocation
- [ ] Review queues, templates, audit log

### 3.3 Trust surfaces
- [ ] “Verified by organiser” on badges/entries; report issue

**Acceptance:** Organisers can run issuance without engineering; Speaker/Attendee UIs remain unchanged in scope (no feature creep on their homes).

---

## Phase 4 — SEO + distribution + instrumentation

### 4.1 Programmatic SEO
- [ ] Sitemap: conferences, speakers, index policy for badges
- [ ] Canonical + schema; noindex for private states

### 4.2 Internal linking
- [ ] Conference ↔ speaker; similar conferences

### 4.3 Analytics
- [ ] Funnel: claim → share → view → signup; UTM/referrer

**Acceptance:** Measurable growth loops; personas still land on mode-appropriate post-signup experience.

---

## Phase 5 — Retention depth (utility, not gamification)

### 5.1 Speaker
- [ ] Submission pipeline (per conference: draft / submitted / outcome), calendar/conflict hints
- [ ] Progress view: geography, topics, upcoming CfPs from tracker (match explanations, not opaque scores)

### 5.2 Attendee
- [ ] Alerts for saved events / regions; optional digest
- [ ] Registration/early-bird only if data exists — avoid empty promises

### 5.3 Organiser (optional tier)
- [ ] Listing analytics (views, CFP clicks); embed/widget; press-friendly exports

### 5.4 Collaboration
- [ ] Team shortlist / shared workspace (invites) — separate area, not on Speaker-only home

**Acceptance:** Users return for planning and outcomes; primary nav per mode stays lean.

---

## Cross-phase engineering

| Area | Tasks |
|------|--------|
| **Backend** | Auth, CRUD for badges/claims/profiles/saves/pipeline items, roles |
| **Frontend** | Layout system per mode, shared Explore, public routes, share components |
| **Data** | Slug mapping from `conferences.csv`; migration from static-only |
| **Legal** | Terms for claims/public profiles; privacy; deletion/export |
| **QA** | Abuse cases; OG/share checks; a11y; mobile share |

---

## Delivery sequence (recommended)

1. Phase 0 — product + **UX IA** + tech + trust baseline  
2. Phase 1 — **auth + mode shell** + badge MVP + conference pages  
3. Phase 2 — speaker profiles + **attendee My trips / badges**  
4. Phase 3 — organiser tooling at scale  
5. Phase 4 — SEO + measurement  
6. Phase 5 — pipeline, alerts, collaboration, organiser analytics  

---

## Success metrics

- Mode-appropriate task completion (e.g. Speaker: pipeline updates; Attendee: saves/claims; Organiser: verified issuances)
- Badge claim → share → inbound view → signup
- Speaker profile creation & repeat shares; organic landings on conference/speaker pages
- 30/60-day return among active personas

---

## Immediate next actions

- [ ] Approve Phase 0 scope (including **three home IA** wireframes)
- [ ] Choose stack ADR + MVP verification method
- [ ] Break Phase 0–1 into implementation tickets with estimates

---

## Current app UX/A11y/mobile improvements (implemented + next)

### Implemented in current static app

- [x] Convert interactive table headers to real controls (`button` inside `<th>`) for keyboard access.
- [x] Add `aria-sort` updates on sortable columns so sort state is announced to assistive tech.
- [x] Add mobile quick actions in Discover (`Search`, `Filters`, `Sort`, `Map`) for faster one-handed use.
- [x] Add collapsible filters on small screens with explicit toggle buttons and `aria-expanded`.
- [x] Increase button touch targets and spacing for better mobile tap reliability.
- [x] Prevent global horizontal page panning by moving from page-level x-scroll to component-level overflow handling.

### Next UI iteration (high priority)

- [ ] Add progressive disclosure for filters (basic vs advanced groups) to reduce first-screen cognitive load.
- [ ] Improve table header accessibility further with explicit keyboard hint text and clearer filter-cycle feedback.
- [ ] Simplify mobile nav hierarchy (role + section + tab) to reduce mode-switch confusion.
- [ ] Run a focused mobile accessibility QA pass (iOS Safari + Android Chrome) and record issues.

### Validation checklist for this track

- [ ] Keyboard-only flow works end-to-end: search → filter → sort → open detail → favorite.
- [ ] Core touch targets meet comfortable mobile sizing (targeting >=44px where applicable).
- [ ] No horizontal page scroll at narrow viewports (320px–390px).
- [ ] Screen reader announces sortable column state and filter changes clearly.

## Web hygiene / security (2026-08-29 audit)

- [x] Referrer-Policy + X-Frame-Options + nosniff + Permissions-Policy via edge Worker `javan-gh-pages-headers` on `conference-tracker.javan.de/*`
- [x] Meta referrer already present on homepage; documented Worker as HTTP-header source
- [x] Root `/favicon.ico` (copy of `assets/favicon.ico`) so `/favicon.ico` is not 404
- [x] OG PNG already shipped (`assets/social-preview.png`)
- [x] Optional: drop GitHub Pages `Access-Control-Allow-Origin: *` (low) *(stripped via `javan-gh-pages-headers`)*
- [x] Optional: move CSP from meta http-equiv to HTTP header via Worker (meta `frame-ancestors` is ignored by browsers; Worker XFO covers framing) *(HTTP CSP set by `javan-gh-pages-headers` 2026-08-30; mirrors prior meta allowlist)*

## Needs your decision

- [ ] Keep `javan-gh-pages-headers` Worker for this GH Pages host long-term, or migrate to Cloudflare Pages?
