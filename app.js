    const CSV_PATH = "conferences.csv";
    const STORAGE_KEY = "conference_dashboard_filters_v1";
    const GEO_CACHE_KEY = "conference_dashboard_geo_cache_v3";
    const UI_PREFS_KEY = "conference_dashboard_ui_prefs_v1";

    function defaultFilters() {
      return {
        search: "",
        attendees: "",
        acceptsCfp: "",
        acceptsCft: "",
        acceptsCfw: "",
        cftOrCfw: "",
        academicLevel: "",
        sponsorship: "",
        conferenceType: "",
        cfpMonth: "",
        venuePattern: "",
        deadlineWindow: "",
        sortBy: "attendees_name"
      };
    }

    const state = {
      rows: [],
      filters: defaultFilters(),
      headerSort: { key: "", direction: "asc" },
      activeTab: "dashboard",
      geocodeCache: {},
      mapSource: "all"
    };

    let mapInstance = null;
    let mapLayer = null;

    const el = {
      searchInput: document.getElementById("searchInput"),
      attendeesFilter: document.getElementById("attendeesFilter"),
      acceptsCfpFilter: document.getElementById("acceptsCfpFilter"),
      acceptsCftFilter: document.getElementById("acceptsCftFilter"),
      acceptsCfwFilter: document.getElementById("acceptsCfwFilter"),
      academicFilter: document.getElementById("academicFilter"),
      sponsorshipFilter: document.getElementById("sponsorshipFilter"),
      typeFilter: document.getElementById("typeFilter"),
      monthFilter: document.getElementById("monthFilter"),
      venuePatternFilter: document.getElementById("venuePatternFilter"),
      sortFilter: document.getElementById("sortFilter"),
      activeFilterMeta: document.getElementById("activeFilterMeta"),
      activeFilterChips: document.getElementById("activeFilterChips"),
      shortcutsBtn: document.getElementById("shortcutsBtn"),
      shortcutHelp: document.getElementById("shortcutHelp"),
      summaryCards: document.getElementById("summaryCards"),
      dataThead: document.querySelector("#dataTable thead"),
      dataTbody: document.querySelector("#dataTable tbody"),
      emptyState: document.getElementById("emptyState"),
      resetBtn: document.getElementById("resetBtn"),
      tabDashboard: document.getElementById("tabDashboard"),
      tabMap: document.getElementById("tabMap"),
      panelDashboard: document.getElementById("panelDashboard"),
      panelMap: document.getElementById("panelMap"),
      worldMap: document.getElementById("worldMap"),
      mapMeta: document.getElementById("mapMeta"),
      mapControls: document.getElementById("mapControls")
    };

    function normalize(value) {
      return (value ?? "").toString().trim();
    }

    function toLower(value) {
      return normalize(value).toLowerCase();
    }

    function loadGeocodeCache() {
      try {
        const raw = localStorage.getItem(GEO_CACHE_KEY);
        if (!raw) return {};
        const parsed = JSON.parse(raw);
        return parsed && typeof parsed === "object" ? parsed : {};
      } catch (err) {
        console.warn("Could not parse geocode cache", err);
        return {};
      }
    }

    function saveGeocodeCache() {
      localStorage.setItem(GEO_CACHE_KEY, JSON.stringify(state.geocodeCache));
    }

    function saveFilters() {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state.filters));
    }

    function normalizeUrlFilterValue(value) {
      const clean = normalize(value);
      if (!clean) return "";
      if (clean === "All") return "";
      return clean;
    }

    function readFiltersFromUrl() {
      const params = new URLSearchParams(window.location.search);
      if (!params.toString()) return;
      const urlFilters = defaultFilters();
      let hasAny = false;
      Object.keys(urlFilters).forEach((key) => {
        if (!params.has(key)) return;
        urlFilters[key] = normalizeUrlFilterValue(params.get(key));
        hasAny = true;
      });
      if (!hasAny) return;
      state.filters = { ...state.filters, ...urlFilters };
    }

    function syncFiltersToUrl() {
      const params = new URLSearchParams(window.location.search);
      Object.entries(state.filters).forEach(([key, value]) => {
        const normalized = normalize(value);
        if (!normalized || (key === "sortBy" && normalized === "attendees_name")) {
          params.delete(key);
          return;
        }
        params.set(key, normalized);
      });
      const query = params.toString();
      const nextUrl = query ? `${window.location.pathname}?${query}` : window.location.pathname;
      window.history.replaceState(null, "", nextUrl);
    }

    function saveUiPrefs() {
      const prefs = {
        activeTab: state.activeTab,
        mapSource: state.mapSource
      };
      localStorage.setItem(UI_PREFS_KEY, JSON.stringify(prefs));
    }

    function loadFilters() {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return;
        const parsed = JSON.parse(raw);
        state.filters = { ...state.filters, ...parsed };
      } catch (err) {
        console.warn("Could not parse saved filters", err);
      }
    }

    function loadUiPrefs() {
      try {
        const raw = localStorage.getItem(UI_PREFS_KEY);
        if (!raw) return;
        const parsed = JSON.parse(raw);
        if (parsed?.activeTab === "dashboard" || parsed?.activeTab === "map") {
          state.activeTab = parsed.activeTab;
        }
        if (parsed?.mapSource === "all" || parsed?.mapSource === "filtered") {
          state.mapSource = parsed.mapSource;
        }
      } catch (err) {
        console.warn("Could not parse saved UI prefs", err);
      }
    }

    function applyFilterValuesToInputs() {
      if (el.searchInput) el.searchInput.value = state.filters.search;
      if (el.attendeesFilter) el.attendeesFilter.value = state.filters.attendees;
      if (el.acceptsCfpFilter) el.acceptsCfpFilter.value = state.filters.acceptsCfp;
      if (el.acceptsCftFilter) el.acceptsCftFilter.value = state.filters.acceptsCft;
      if (el.acceptsCfwFilter) el.acceptsCfwFilter.value = state.filters.acceptsCfw;
      if (el.academicFilter) el.academicFilter.value = state.filters.academicLevel;
      if (el.sponsorshipFilter) el.sponsorshipFilter.value = state.filters.sponsorship;
      if (el.typeFilter) el.typeFilter.value = state.filters.conferenceType;
      if (el.monthFilter) el.monthFilter.value = state.filters.cfpMonth;
      if (el.venuePatternFilter) el.venuePatternFilter.value = state.filters.venuePattern;
      if (el.sortFilter) el.sortFilter.value = state.filters.sortBy || "attendees_name";
    }

    function fillOptions(selectEl, values) {
      const current = selectEl.value;
      const options = ["", ...values];
      selectEl.innerHTML = options.map((v) => {
        const selected = v === current ? "selected" : "";
        return `<option value="${escapeHtml(v)}" ${selected}>${v || "All"}</option>`;
      }).join("");
    }

    function uniqueSortedValues(rows, key) {
      const values = new Set();
      rows.forEach((r) => {
        const value = normalize(r[key]);
        if (value) values.add(value);
      });
      return [...values].sort((a, b) => a.localeCompare(b));
    }

    function pickValue(row, keys, fallback = "") {
      for (const key of keys) {
        const val = normalize(row[key]);
        if (val) return val;
      }
      return fallback;
    }

    function normalizeRowSchema(rawRow) {
      return {
        conference_name: pickValue(rawRow, ["conference_name"]),
        priority_level: pickValue(rawRow, ["priority_level"]),
        attendees_500_plus: pickValue(rawRow, ["attendees_500_plus"]),
        academic_acceptance_level: pickValue(rawRow, ["academic_acceptance_level"]),
        cfp_deadline_month: pickValue(rawRow, ["cfp_deadline_month"]),
        submission_tracks: pickValue(rawRow, ["submission_tracks"]),
        accepts_cfp: pickValue(rawRow, ["accepts_cfp"], "Unknown"),
        accepts_cft: pickValue(rawRow, ["accepts_cft"], "Unknown"),
        accepts_cfw: pickValue(rawRow, ["accepts_cfw"], "Unknown"),
        travel_accommodation_sponsorship: pickValue(rawRow, ["travel_accommodation_sponsorship"]),
        cfp_deadline: pickValue(rawRow, ["cfp_deadline", "cfp_deadline_MM-DD"], "TBD"),
        cft_deadline: pickValue(rawRow, ["cft_deadline", "cft_deadline_MM-DD"], "TBD"),
        cfw_deadline: pickValue(rawRow, ["cfw_deadline", "cfw_deadline_MM-DD"], "TBD"),
        conference_start_date: pickValue(rawRow, ["conference_start_date"]),
        conference_end_date: pickValue(rawRow, ["conference_end_date"]),
        city: pickValue(rawRow, ["city"]),
        country: pickValue(rawRow, ["country"]),
        website_or_cfp_link: pickValue(rawRow, ["website_or_cfp_link"]),
        cft_link: pickValue(rawRow, ["cft_link"]),
        cfw_link: pickValue(rawRow, ["cfw_link"]),
        conference_type: pickValue(rawRow, ["conference_type"]),
        venue_pattern: pickValue(rawRow, ["venue_pattern"], "Unknown"),
        timezone: pickValue(rawRow, ["timezone"]),
        submission_status: pickValue(rawRow, ["submission_status"], "Unknown"),
        notes: pickValue(rawRow, ["notes"]),
        last_verified_date: pickValue(rawRow, ["last_verified_date"])
      };
    }

    function isValidMonthDay(value) {
      const clean = normalize(value);
      if (clean === "" || clean.toUpperCase() === "TBD") return true;
      return /^\d{2}-\d{2}$/.test(clean);
    }

    function isValidIsoDate(value) {
      const clean = normalize(value);
      if (clean === "" || clean.toUpperCase() === "TBD") return true;
      return /^\d{4}-\d{2}-\d{2}$/.test(clean);
    }

    function sanitizeEnum(value, allowedValues, fallback) {
      const clean = normalize(value);
      return allowedValues.includes(clean) ? clean : fallback;
    }

    function normalizeAndValidateRows(parsed) {
      const validRows = [];
      let skippedRows = 0;

      if (Array.isArray(parsed.errors) && parsed.errors.length) {
        console.warn("[ConferenceTracker] CSV parse warnings:", parsed.errors);
      }

      (parsed.data || []).forEach((rawRow, index) => {
        const csvRowNumber = index + 2; // +1 header, +1 1-indexed
        try {
          if (!rawRow || typeof rawRow !== "object") {
            console.warn(`[ConferenceTracker] Skipping row ${csvRowNumber}: row is not a valid object.`);
            skippedRows += 1;
            return;
          }

          const rawValues = Object.values(rawRow).map((v) => normalize(v));
          const hasContent = rawValues.some((v) => v !== "");
          if (!hasContent) return;

          const issues = [];
          if (Array.isArray(rawRow.__parsed_extra) && rawRow.__parsed_extra.length > 0) {
            issues.push(`extra columns detected (${rawRow.__parsed_extra.length})`);
          }

          const row = normalizeRowSchema(rawRow);

          if (!row.conference_name) {
            console.warn(`[ConferenceTracker] Skipping row ${csvRowNumber}: missing conference_name.`);
            skippedRows += 1;
            return;
          }

          row.accepts_cfp = sanitizeEnum(row.accepts_cfp, ["Yes", "No", "Unknown"], "Unknown");
          row.accepts_cft = sanitizeEnum(row.accepts_cft, ["Yes", "No", "Unknown"], "Unknown");
          row.accepts_cfw = sanitizeEnum(row.accepts_cfw, ["Yes", "No", "Unknown"], "Unknown");
          row.venue_pattern = sanitizeEnum(row.venue_pattern, ["Rotating", "Mostly Fixed", "Fixed", "Unknown"], "Unknown");

          if (!isValidMonthDay(row.cfp_deadline)) {
            issues.push(`invalid cfp_deadline "${row.cfp_deadline}"`);
            row.cfp_deadline = "TBD";
          }
          if (!isValidMonthDay(row.cft_deadline)) {
            issues.push(`invalid cft_deadline "${row.cft_deadline}"`);
            row.cft_deadline = "TBD";
          }
          if (!isValidMonthDay(row.cfw_deadline)) {
            issues.push(`invalid cfw_deadline "${row.cfw_deadline}"`);
            row.cfw_deadline = "TBD";
          }

          if (!isValidIsoDate(row.conference_start_date)) {
            issues.push(`invalid conference_start_date "${row.conference_start_date}"`);
            row.conference_start_date = "TBD";
          }
          if (!isValidIsoDate(row.conference_end_date)) {
            issues.push(`invalid conference_end_date "${row.conference_end_date}"`);
            row.conference_end_date = "TBD";
          }
          if (!isValidIsoDate(row.last_verified_date)) {
            issues.push(`invalid last_verified_date "${row.last_verified_date}"`);
            row.last_verified_date = "TBD";
          }

          if (issues.length) {
            console.warn(`[ConferenceTracker] Row ${csvRowNumber} normalized with warnings: ${issues.join("; ")}`);
          }

          validRows.push(row);
        } catch (err) {
          console.warn(`[ConferenceTracker] Skipping row ${csvRowNumber} due to processing error:`, err);
          skippedRows += 1;
        }
      });

      console.info(
        `[ConferenceTracker] CSV load complete: ${validRows.length} row(s) loaded, ${skippedRows} row(s) skipped.`
      );
      return validRows;
    }

    function escapeHtml(value) {
      return value
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
    }

    function linkOrText(url) {
      const clean = normalize(url);
      if (!clean) return "";
      if (/^https?:\/\//i.test(clean)) {
        return `<a href="${escapeHtml(clean)}" target="_blank" rel="noopener noreferrer">link</a>`;
      }
      return escapeHtml(clean);
    }

    function ellipsisCell(value) {
      const clean = normalize(value);
      if (!clean) return "";
      return `<span class="cell-ellipsis" title="${escapeHtml(clean)}">${escapeHtml(clean)}</span>`;
    }

    function renderTrackBadges(tracksValue) {
      const tracks = normalize(tracksValue)
        .split("|")
        .map((t) => normalize(t))
        .filter(Boolean);
      if (tracks.length === 0) return "";

      const map = {
        Talks: { label: "P", title: "Talks / Papers" },
        Trainings: { label: "T", title: "Trainings" },
        Workshops: { label: "W", title: "Workshops" }
      };

      return `<span class="track-badges">${tracks.map((track) => {
        const conf = map[track];
        const label = conf ? conf.label : track.charAt(0).toUpperCase();
        const title = conf ? conf.title : track;
        return `<span class="track-badge" title="${escapeHtml(title)}">${escapeHtml(label)}</span>`;
      }).join("")}</span>`;
    }

    function renderAcceptanceLevelCell(value) {
      const raw = normalize(value);
      const v = toLower(raw);
      if (v === "industry") {
        return `<span class="acceptance-emoji" title="Industry" aria-label="Industry">👷</span>`;
      }
      if (v === "academic") {
        return `<span class="acceptance-emoji" title="Academic" aria-label="Academic">🧑‍🎓</span>`;
      }
      if (v === "mixed") {
        return `<span class="acceptance-emoji" title="Mixed (industry and academic)" aria-label="Mixed">👷🧑‍🎓</span>`;
      }
      return escapeHtml(raw || "—");
    }

    const countryToIso2 = {
      Argentina: "AR",
      Australia: "AU",
      Austria: "AT",
      Bahrain: "BH",
      Belgium: "BE",
      Brazil: "BR",
      Canada: "CA",
      Denmark: "DK",
      France: "FR",
      Germany: "DE",
      Greece: "GR",
      India: "IN",
      Indonesia: "ID",
      Israel: "IL",
      Italy: "IT",
      Japan: "JP",
      Kenya: "KE",
      Lithuania: "LT",
      Luxembourg: "LU",
      Mexico: "MX",
      Nepal: "NP",
      Netherlands: "NL",
      Norway: "NO",
      Poland: "PL",
      Portugal: "PT",
      Qatar: "QA",
      Romania: "RO",
      "Saudi Arabia": "SA",
      Singapore: "SG",
      "South Africa": "ZA",
      Spain: "ES",
      Switzerland: "CH",
      "United Arab Emirates": "AE",
      "United Kingdom": "GB",
      "United States": "US"
    };

    function iso2ToFlagEmoji(iso2) {
      return iso2
        .toUpperCase()
        .replace(/./g, (char) => String.fromCodePoint(127397 + char.charCodeAt(0)));
    }

    function renderCountryFlag(countryValue) {
      const country = normalize(countryValue);
      if (!country || country === "TBD" || country === "Various") return "—";
      const iso2 = countryToIso2[country];
      if (!iso2) return escapeHtml(country);
      return `<span class="country-flag" title="${escapeHtml(country)}" aria-label="${escapeHtml(country)}">${iso2ToFlagEmoji(iso2)}</span>`;
    }

    function renderSummary(filteredRows, allRows) {
      const total = allRows.length;
      const shown = filteredRows.length;
      const largeEvents = filteredRows.filter((r) => toLower(r.attendees_500_plus) === "yes").length;
      const openCfp = filteredRows.filter((r) => toLower(r.accepts_cfp) === "yes").length;
      const openCftOrCfw = filteredRows.filter(
        (r) => toLower(r.accepts_cft) === "yes" || toLower(r.accepts_cfw) === "yes"
      ).length;
      const travelSupport = filteredRows.filter(
        (r) => normalize(r.travel_accommodation_sponsorship) === "Yes"
      ).length;
      const academic = filteredRows.filter((r) => toLower(r.academic_acceptance_level) === "academic").length;
      const dueSoon = filteredRows.filter((r) => {
        const info = getNextDeadlineInfo(r);
        return info && info.daysUntil <= 30;
      }).length;

      const cards = [
        { label: "Shown / Total", value: `${shown} / ${total}`, action: "clear", hint: "Reset to all conferences" },
        { label: "500+ Attendees", value: `${largeEvents}`, action: "attendees_500", hint: "Large audience events" },
        { label: "Open CfP", value: `${openCfp}`, action: "open_cfp", hint: "Accepts CfP = Yes" },
        { label: "Open CfT / CfW", value: `${openCftOrCfw}`, action: "open_cft_or_cfw", hint: "Accepts training or workshops (either)" },
        { label: "Travel support", value: `${travelSupport}`, action: "travel_support", hint: "Travel or accommodation sponsorship = Yes" },
        { label: "Due <= 30 Days", value: `${dueSoon}`, action: "due_30", hint: "Nearest deadline first" },
        { label: "Academic", value: `${academic}`, action: "academic", hint: "Academic acceptance level" }
      ];

      el.summaryCards.innerHTML = cards.map((c) => `
        <button class="metric-btn" type="button" data-stat-action="${c.action}">
          <div class="label">${c.label}</div>
          <div class="value">${c.value}</div>
          <div class="hint">${c.hint}</div>
        </button>
      `).join("");
    }

    function renderTable(rows) {
      if (rows.length === 0) {
        el.dataTbody.innerHTML = "";
        el.emptyState.hidden = false;
        return;
      }
      el.emptyState.hidden = true;

      function td(label, value, className) {
        const cls = className ? ` class="${escapeHtml(className)}"` : "";
        return `<td data-label="${escapeHtml(label)}"${cls}>${value}</td>`;
      }

      el.dataTbody.innerHTML = rows.map((r) => `
        <tr>
          ${td("Name", ellipsisCell(r.conference_name))}
          ${td("500+?", escapeHtml(normalize(r.attendees_500_plus)))}
          ${td("CfP?", toPill(r.accepts_cfp))}
          ${td("CfT?", toPill(r.accepts_cft))}
          ${td("CfW?", toPill(r.accepts_cfw))}
          ${td("Academic", renderAcceptanceLevelCell(r.academic_acceptance_level), "acceptance-col")}
          ${td("CfP Month", escapeHtml(normalize(r.cfp_deadline_month)))}
          ${td("Tracks", renderTrackBadges(r.submission_tracks))}
          ${td("Sponsorship", sponsorshipPill(r.travel_accommodation_sponsorship))}
          ${td("CfP", renderDeadlineValue(r, "cfp_deadline", "accepts_cfp"))}
          ${td("CfT", renderDeadlineValue(r, "cft_deadline", "accepts_cft"))}
          ${td("CfW", renderDeadlineValue(r, "cfw_deadline", "accepts_cfw"))}
          ${td("Start", escapeHtml(normalize(r.conference_start_date)))}
          ${td("End", escapeHtml(normalize(r.conference_end_date)))}
          ${td("City", escapeHtml(normalize(r.city)))}
          ${td("Country", renderCountryFlag(r.country), "country-col")}
          ${td("Website/CfP", linkOrText(r.website_or_cfp_link))}
          ${td("CfT Link", linkOrText(r.cft_link))}
          ${td("CfW Link", linkOrText(r.cfw_link))}
          ${td("Next Deadline", renderNextDeadline(r))}
        </tr>
      `).join("");
    }

    function parseMonthDay(monthDay) {
      const clean = normalize(monthDay);
      if (!/^\d{2}-\d{2}$/.test(clean)) return null;
      const [m, d] = clean.split("-").map((x) => Number(x));
      if (m < 1 || m > 12 || d < 1 || d > 31) return null;
      return { month: m, day: d };
    }

    function getNextDeadlineInfo(row) {
      const candidates = [
        { key: "cfp_deadline", label: "CfP" },
        { key: "cft_deadline", label: "CfT" },
        { key: "cfw_deadline", label: "CfW" }
      ];
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      let best = null;

      candidates.forEach((c) => {
        const parsed = parseMonthDay(row[c.key]);
        if (!parsed) return;
        let date = new Date(today.getFullYear(), parsed.month - 1, parsed.day);
        if (date < today) {
          date = new Date(today.getFullYear() + 1, parsed.month - 1, parsed.day);
        }
        const msPerDay = 24 * 60 * 60 * 1000;
        const daysUntil = Math.round((date - today) / msPerDay);
        if (!best || daysUntil < best.daysUntil) {
          best = { label: c.label, monthDay: normalize(row[c.key]), daysUntil };
        }
      });
      return best;
    }

    function renderNextDeadline(row) {
      const acceptsCfp = normalize(row.accepts_cfp);
      const acceptsCft = normalize(row.accepts_cft);
      const acceptsCfw = normalize(row.accepts_cfw);
      if (acceptsCfp === "No" && acceptsCft === "No" && acceptsCfw === "No") {
        return `<span class="pill pill-na">N/A</span>`;
      }
      const info = getNextDeadlineInfo(row);
      if (!info) return `<span class="pill pill-unknown">TBD</span>`;
      const cls = info.daysUntil <= 30 ? "pill-deadline-soon" : "pill-deadline-upcoming";
      return `<span class="pill ${cls}">${info.label} ${escapeHtml(info.monthDay)} (${info.daysUntil}d)</span>`;
    }

    function renderDeadlineValue(row, deadlineKey, acceptsKey) {
      const deadline = normalize(row[deadlineKey]);
      const accepts = normalize(row[acceptsKey]);
      if (deadline && deadline.toUpperCase() !== "TBD") return escapeHtml(deadline);
      if (accepts === "No") return `<span class="pill pill-na">N/A</span>`;
      return "TBD";
    }

    function toPill(value) {
      const v = toLower(value);
      if (v === "yes") return `<span class="pill pill-yes">Yes</span>`;
      if (v === "no") return `<span class="pill pill-no">No</span>`;
      return `<span class="pill pill-unknown">${escapeHtml(normalize(value) || "Unknown")}</span>`;
    }

    function sponsorshipPill(value) {
      const raw = normalize(value);
      const v = toLower(raw);
      if (v === "yes") {
        return `<span class="pill pill-yes" title="Travel or accommodation sponsorship offered">Yes</span>`;
      }
      if (v === "no") {
        return `<span class="pill pill-no" title="No travel or accommodation sponsorship">No</span>`;
      }
      if (v === "partial") {
        return `<span class="pill pill-gray" title="Partial travel or accommodation support">Partial</span>`;
      }
      const label = raw || "Unknown";
      return `<span class="pill pill-gray" title="Sponsorship status not verified">${escapeHtml(label)}</span>`;
    }

    function parseCities(cityValue) {
      const city = normalize(cityValue);
      if (!city) return [];
      return city
        .split("|")
        .map((c) => normalize(c))
        .filter(Boolean);
    }

    function isMappable(value) {
      const lowered = toLower(value);
      return Boolean(value) && !["tbd", "various", "unknown", "n/a"].includes(lowered);
    }

    function normalizeCountryName(countryValue) {
      const country = normalize(countryValue);
      const lowered = toLower(country);
      const aliases = {
        usa: "United States",
        us: "United States",
        uk: "United Kingdom",
        uae: "United Arab Emirates"
      };
      return aliases[lowered] || country;
    }

    function normalizeCityName(cityValue) {
      const city = normalize(cityValue);
      if (!city) return "";
      const compact = city
        .replace(/\s+/g, " ")
        .trim();
      const aliases = {
        "washington dc": "Washington",
        "luxembourg city": "Luxembourg",
        "beer sheva": "Beersheba"
      };
      const lowered = toLower(compact);
      if (aliases[lowered]) return aliases[lowered];
      return compact.replace(/\bDC\b/i, "D.C.");
    }

    function isVirtualConference(row) {
      const conferenceType = toLower(row?.conference_type);
      const city = toLower(row?.city);
      return conferenceType === "virtual" || city === "virtual" || city === "online";
    }

    function getVirtualLocationPoint(cityValue, countryValue) {
      const city = toLower(cityValue);
      const country = toLower(countryValue);
      const isVirtualCity = city === "virtual" || city === "online";
      if (!isVirtualCity) return null;
      if (country === "global" || country === "worldwide" || country === "international") {
        return { lat: 20, lon: 0, precision: "virtual_global" };
      }
      return null;
    }

    function buildConferenceMapPoints(rows) {
      const points = [];
      const seen = new Set();
      const cityBuckets = new Map();

      rows.forEach((row) => {
        if (isVirtualConference(row)) return;
        const country = normalize(row.country);
        if (!isMappable(country)) return;

        const name = normalize(row.conference_name);
        if (!name) return;

        const cities = parseCities(row.city);
        cities.forEach((city) => {
          if (!isMappable(city)) return;
          const locationKey = `${city}, ${country}`;
          const dedupeKey = `${locationKey}::${name}`;
          if (seen.has(dedupeKey)) return;
          seen.add(dedupeKey);
          if (!cityBuckets.has(locationKey)) cityBuckets.set(locationKey, 0);
          const indexInCity = cityBuckets.get(locationKey);
          cityBuckets.set(locationKey, indexInCity + 1);
          points.push({
            locationKey,
            city,
            country,
            name,
            indexInCity
          });
        });
      });
      return points;
    }

    function markerColors() {
      return {
        stroke: "#d9ffe8",
        fill: "#00ff9c"
      };
    }

    function markerRadiusForPoint(entry) {
      const tiers = [3.1, 3.8, 4.6, 5.3];
      const stableSeed = `${entry.locationKey}|${entry.name}`;
      let hash = 0;
      for (let i = 0; i < stableSeed.length; i += 1) {
        hash = ((hash << 5) - hash) + stableSeed.charCodeAt(i);
        hash |= 0;
      }
      const idx = Math.abs(hash + entry.indexInCity) % tiers.length;
      return tiers[idx];
    }

    function updateMapSourceButtons() {
      if (!el.mapControls) return;
      const buttons = [...el.mapControls.querySelectorAll("[data-map-source]")];
      buttons.forEach((btn) => {
        const source = btn.getAttribute("data-map-source");
        const isActive = source === state.mapSource;
        btn.classList.toggle("active", isActive);
        btn.setAttribute("aria-pressed", String(isActive));
      });
    }

    async function geocodeLocation(location) {
      const cacheKey = location.key;

      const virtualPoint = getVirtualLocationPoint(location.city, location.country);
      if (virtualPoint) {
        state.geocodeCache[cacheKey] = virtualPoint;
        saveGeocodeCache();
        return virtualPoint;
      }
      if (state.geocodeCache[cacheKey]) return state.geocodeCache[cacheKey];

      const city = normalizeCityName(location.city);
      const country = normalizeCountryName(location.country);
      const queries = [
        `${city}, ${country}`,
        city,
        country
      ].filter((q) => isMappable(q));

      for (let index = 0; index < queries.length; index += 1) {
        const query = encodeURIComponent(queries[index]);
        const url = `https://geocoding-api.open-meteo.com/v1/search?name=${query}&count=1&language=en&format=json`;
        try {
          const res = await fetch(url);
          if (!res.ok) continue;
          const data = await res.json();
          const first = data?.results?.[0];
          if (!first || typeof first.latitude !== "number" || typeof first.longitude !== "number") continue;
          const point = {
            lat: first.latitude,
            lon: first.longitude,
            precision: index === 0 ? "city" : index === 1 ? "city_fallback" : "country"
          };
          state.geocodeCache[cacheKey] = point;
          saveGeocodeCache();
          return point;
        } catch (err) {
          console.warn("Geocoding attempt failed for", location.key, err);
        }
      }
      return null;
    }

    function initMapIfNeeded() {
      if (mapInstance || !el.worldMap || typeof L === "undefined") return;
      mapInstance = L.map(el.worldMap, {
        worldCopyJump: true,
        zoomControl: true,
        preferCanvas: true
      }).setView([18, 10], 2);
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 7,
        minZoom: 2,
        opacity: 0.62,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(mapInstance);
      mapLayer = L.layerGroup().addTo(mapInstance);
    }

    async function renderWorldMap(rows) {
      initMapIfNeeded();
      if (!mapLayer || !el.mapMeta) return;

      const points = buildConferenceMapPoints(rows);
      el.mapMeta.textContent = `Geocoding ${points.length} conference point${points.length === 1 ? "" : "s"}...`;

      mapLayer.clearLayers();

      let mapped = 0;
      let unresolved = 0;
      let countryFallbackCount = 0;
      for (const entry of points) {
        const point = await geocodeLocation({
          key: entry.locationKey,
          city: entry.city,
          country: entry.country
        });
        if (!point) {
          unresolved += 1;
          continue;
        }
        mapped += 1;
        if (point.precision === "country") {
          countryFallbackCount += 1;
        }
        const jitterRadius = 0.13;
        const angle = (entry.indexInCity % 12) * (Math.PI / 6);
        const ring = Math.floor(entry.indexInCity / 12);
        const latOffset = Math.sin(angle) * jitterRadius * (ring + 1);
        const lonOffset = Math.cos(angle) * jitterRadius * (ring + 1);
        const colors = markerColors();
        const radius = markerRadiusForPoint(entry);
        const marker = L.circleMarker([point.lat + latOffset, point.lon + lonOffset], {
          radius,
          color: colors.stroke,
          weight: 1.6,
          fillColor: colors.fill,
          fillOpacity: 0.88
        });
        marker.bindTooltip(
          `<div class="map-tooltip-title">${escapeHtml(entry.name)}</div><div class="map-tooltip-meta">${escapeHtml(entry.city)}, ${escapeHtml(entry.country)}</div>`,
          {
          permanent: false,
          sticky: true,
          direction: "top",
          className: "map-tooltip"
          }
        );
        marker.bindPopup(
          `<div class="map-popup-title">${escapeHtml(entry.name)}</div><div class="map-popup-meta">${escapeHtml(entry.city)}, ${escapeHtml(entry.country)}</div>`
        );
        marker.addTo(mapLayer);
      }

      const fallbackText = countryFallbackCount
        ? ` ${countryFallbackCount} point${countryFallbackCount === 1 ? "" : "s"} use country-level placement.`
        : "";
      el.mapMeta.textContent = `Showing ${mapped} conferences on the map.${fallbackText}${unresolved ? ` ${unresolved} point${unresolved === 1 ? "" : "s"} could not be geocoded.` : ""}`;
      setTimeout(() => mapInstance?.invalidateSize(), 0);
    }

    function getFilteredRows() {
      return state.rows.filter(rowMatchesFilters);
    }

    function getMapRows() {
      return state.mapSource === "filtered" ? getFilteredRows() : state.rows;
    }

    function updateMapIfVisible() {
      if (state.activeTab !== "map") return;
      renderWorldMap(getMapRows());
    }

    function setActiveTab(tab) {
      state.activeTab = tab === "map" ? "map" : "dashboard";
      saveUiPrefs();
      const onDashboard = state.activeTab === "dashboard";
      if (el.panelDashboard) el.panelDashboard.hidden = !onDashboard;
      if (el.panelMap) el.panelMap.hidden = onDashboard;
      if (el.tabDashboard) {
        el.tabDashboard.classList.toggle("active", onDashboard);
        el.tabDashboard.setAttribute("aria-selected", String(onDashboard));
      }
      if (el.tabMap) {
        el.tabMap.classList.toggle("active", !onDashboard);
        el.tabMap.setAttribute("aria-selected", String(!onDashboard));
      }
      if (!onDashboard) {
        updateMapSourceButtons();
        renderWorldMap(getMapRows());
      }
    }

    function getActiveFilterCount() {
      return Object.entries(state.filters)
        .filter(([k, v]) => k !== "sortBy" && Boolean(v))
        .length;
    }

    function renderFilterChips() {
      const labels = {
        search: "Search",
        attendees: "500+",
        acceptsCfp: "CfP",
        acceptsCft: "CfT",
        acceptsCfw: "CfW",
        cftOrCfw: "CfT or CfW",
        academicLevel: "Academic",
        sponsorship: "Sponsorship",
        conferenceType: "Type",
        cfpMonth: "CfP Month",
        venuePattern: "Venue Pattern",
        deadlineWindow: "Deadline"
      };
      const activeEntries = Object.entries(state.filters)
        .filter(([k, v]) => k !== "sortBy" && Boolean(v));
      if (activeEntries.length === 0) {
        el.activeFilterChips.innerHTML = "";
        return;
      }
      el.activeFilterChips.innerHTML = activeEntries.map(([key, value]) => {
        const displayValue =
          key === "cftOrCfw" && toLower(value) === "yes" ? "either CfT or CfW" : value;
        return `
        <button class="chip" type="button" data-clear-filter="${key}">
          <span>${labels[key] || key}:</span>${escapeHtml(displayValue)} x
        </button>
      `;
      }).join("");
    }

    function clearSingleFilter(key) {
      if (!(key in state.filters)) return;
      state.filters[key] = "";
      applyFilterValuesToInputs();
      rerender();
    }

    function monthOrder(monthValue) {
      const months = [
        "january", "february", "march", "april", "may", "june",
        "july", "august", "september", "october", "november", "december"
      ];
      const idx = months.indexOf(toLower(monthValue));
      return idx === -1 ? 999 : idx;
    }

    function attendeesOrder(attendeesValue) {
      const v = toLower(attendeesValue);
      if (v === "yes") return 0;
      if (v === "unknown") return 1;
      if (v === "no") return 2;
      return 99;
    }

    function statusOrder(statusValue) {
      const order = ["not started", "drafting", "planned", "submitted", "accepted", "waitlisted", "rejected", "missed"];
      const idx = order.indexOf(toLower(statusValue));
      return idx === -1 ? 999 : idx;
    }

    function isoDateOrder(dateValue) {
      const clean = normalize(dateValue);
      if (!clean || clean.toUpperCase() === "TBD") return Number.MAX_SAFE_INTEGER;
      const t = Date.parse(clean);
      return Number.isNaN(t) ? Number.MAX_SAFE_INTEGER : t;
    }

    function compareHeaderSort(a, b, key, direction) {
      const mul = direction === "desc" ? -1 : 1;
      if (key === "conference_start_date" || key === "conference_end_date") {
        const diff = isoDateOrder(a[key]) - isoDateOrder(b[key]);
        if (diff !== 0) return diff * mul;
      } else if (key === "cfp_deadline_month") {
        const diff = monthOrder(a[key]) - monthOrder(b[key]);
        if (diff !== 0) return diff * mul;
      } else if (key === "submission_status") {
        const diff = statusOrder(a[key]) - statusOrder(b[key]);
        if (diff !== 0) return diff * mul;
      } else if (key === "attendees_500_plus") {
        const diff = attendeesOrder(a[key]) - attendeesOrder(b[key]);
        if (diff !== 0) return diff * mul;
      } else {
        const diff = normalize(a[key]).localeCompare(normalize(b[key]));
        if (diff !== 0) return diff * mul;
      }
      return normalize(a.conference_name).localeCompare(normalize(b.conference_name));
    }

    function sortRows(rows) {
      if (state.headerSort.key) {
        const sorted = [...rows];
        sorted.sort((a, b) => compareHeaderSort(a, b, state.headerSort.key, state.headerSort.direction));
        return sorted;
      }
      const sortBy = state.filters.sortBy || "attendees_name";
      const sorted = [...rows];
      if (sortBy === "name_asc") {
        sorted.sort((a, b) => normalize(a.conference_name).localeCompare(normalize(b.conference_name)));
      } else if (sortBy === "month_name") {
        sorted.sort((a, b) => {
          const monthCmp = monthOrder(a.cfp_deadline_month) - monthOrder(b.cfp_deadline_month);
          if (monthCmp !== 0) return monthCmp;
          return normalize(a.conference_name).localeCompare(normalize(b.conference_name));
        });
      } else if (sortBy === "status_name") {
        sorted.sort((a, b) => {
          const sCmp = statusOrder(a.submission_status) - statusOrder(b.submission_status);
          if (sCmp !== 0) return sCmp;
          return normalize(a.conference_name).localeCompare(normalize(b.conference_name));
        });
      } else if (sortBy === "deadline_soon") {
        sorted.sort((a, b) => {
          const aInfo = getNextDeadlineInfo(a);
          const bInfo = getNextDeadlineInfo(b);
          const aDays = aInfo ? aInfo.daysUntil : 9999;
          const bDays = bInfo ? bInfo.daysUntil : 9999;
          if (aDays !== bDays) return aDays - bDays;
          return normalize(a.conference_name).localeCompare(normalize(b.conference_name));
        });
      } else {
        sorted.sort((a, b) => {
          const attendeesCmp = attendeesOrder(a.attendees_500_plus) - attendeesOrder(b.attendees_500_plus);
          if (attendeesCmp !== 0) return attendeesCmp;
          return normalize(a.conference_name).localeCompare(normalize(b.conference_name));
        });
      }
      return sorted;
    }

    function rowMatchesFilters(row) {
      const s = state.filters;
      const text = `${normalize(row.conference_name)} ${normalize(row.city)} ${normalize(row.country)}`.toLowerCase();
      if (s.search && !text.includes(s.search.toLowerCase())) return false;
      if (s.attendees && normalize(row.attendees_500_plus) !== s.attendees) return false;
      if (s.acceptsCfp && normalize(row.accepts_cfp) !== s.acceptsCfp) return false;
      if (toLower(s.cftOrCfw) === "yes") {
        const cftYes = normalize(row.accepts_cft) === "Yes";
        const cfwYes = normalize(row.accepts_cfw) === "Yes";
        if (!cftYes && !cfwYes) return false;
      } else {
        if (s.acceptsCft && normalize(row.accepts_cft) !== s.acceptsCft) return false;
        if (s.acceptsCfw && normalize(row.accepts_cfw) !== s.acceptsCfw) return false;
      }
      if (s.academicLevel && normalize(row.academic_acceptance_level) !== s.academicLevel) return false;
      if (s.sponsorship && normalize(row.travel_accommodation_sponsorship) !== s.sponsorship) return false;
      if (s.conferenceType && normalize(row.conference_type) !== s.conferenceType) return false;
      if (s.cfpMonth && normalize(row.cfp_deadline_month) !== s.cfpMonth) return false;
      if (s.venuePattern && normalize(row.venue_pattern) !== s.venuePattern) return false;
      if (s.deadlineWindow) {
        const info = getNextDeadlineInfo(row);
        const limit = Number(s.deadlineWindow);
        if (!info || Number.isNaN(limit) || info.daysUntil > limit) return false;
      }
      return true;
    }

    function readFilterValues() {
      state.filters.search = normalize(el.searchInput.value);
      state.filters.attendees = normalize(el.attendeesFilter.value);
      state.filters.acceptsCfp = normalize(el.acceptsCfpFilter.value);
      state.filters.acceptsCft = normalize(el.acceptsCftFilter.value);
      state.filters.acceptsCfw = normalize(el.acceptsCfwFilter.value);
      state.filters.academicLevel = normalize(el.academicFilter.value);
      state.filters.sponsorship = normalize(el.sponsorshipFilter.value);
      state.filters.conferenceType = normalize(el.typeFilter.value);
      state.filters.cfpMonth = normalize(el.monthFilter.value);
      state.filters.venuePattern = normalize(el.venuePatternFilter.value);
      state.filters.sortBy = normalize(el.sortFilter.value) || "attendees_name";
      if (state.filters.acceptsCft || state.filters.acceptsCfw) {
        state.filters.cftOrCfw = "";
      }
    }

    function updateFilterMeta() {
      const active = getActiveFilterCount();
      el.activeFilterMeta.textContent = active === 0
        ? "No filters active. Use the summary cards for quick actions."
        : `${active} active filter${active > 1 ? "s" : ""} (saved in browser)`;
    }

    function applyPreset(preset) {
      if (preset === "clear") {
        resetFilters();
        return;
      }
      state.filters = defaultFilters();
      if (preset === "open_cfp") state.filters.acceptsCfp = "Yes";
      if (preset === "open_cft_or_cfw") {
        state.filters.cftOrCfw = "yes";
        state.filters.acceptsCft = "";
        state.filters.acceptsCfw = "";
      }
      if (preset === "travel_support") state.filters.sponsorship = "Yes";
      if (preset === "due_30") state.filters.deadlineWindow = "30";
      if (preset === "high_priority" || preset === "attendees_500") state.filters.attendees = "Yes";
      if (preset === "academic") state.filters.academicLevel = "Academic";
      state.filters.sortBy = "deadline_soon";
      state.headerSort = { key: "", direction: "asc" };
      applyFilterValuesToInputs();
      rerender();
    }

    function applyHeaderFilter(filterKey) {
      const map = {
        acceptsCfp: "acceptsCfp",
        acceptsCft: "acceptsCft",
        acceptsCfw: "acceptsCfw"
      };
      const stateKey = map[filterKey];
      if (!stateKey) return;
      const cycle = ["", "Yes", "No", "Unknown"];
      const current = state.filters[stateKey] || "";
      const idx = cycle.indexOf(current);
      state.filters[stateKey] = cycle[(idx + 1) % cycle.length];
      state.headerSort = { key: "", direction: "asc" };
      applyFilterValuesToInputs();
      rerender();
    }

    function applyHeaderSort(sortKey) {
      if (!sortKey) return;
      if (state.headerSort.key === sortKey) {
        state.headerSort.direction = state.headerSort.direction === "asc" ? "desc" : "asc";
      } else {
        state.headerSort = { key: sortKey, direction: "asc" };
      }
      if (el.sortFilter) el.sortFilter.value = "";
      rerender();
    }

    function renderHeaderInteractions() {
      if (!el.dataThead) return;
      const headers = [...el.dataThead.querySelectorAll(".clickable-th")];
      headers.forEach((th) => {
        th.classList.remove("sort-asc", "sort-desc", "filter-active");
        const sortKey = th.getAttribute("data-sort-key");
        const filterKey = th.getAttribute("data-filter-key");
        if (sortKey && sortKey === state.headerSort.key) {
          th.classList.add(state.headerSort.direction === "desc" ? "sort-desc" : "sort-asc");
        }
        if (filterKey) {
          const current = state.filters[filterKey] || "";
          if (current) th.classList.add("filter-active");
        }
      });
    }

    function rerender() {
      readFilterValues();
      saveFilters();
      syncFiltersToUrl();

      const filtered = getFilteredRows();
      const sortedFiltered = sortRows(filtered);
      renderSummary(sortedFiltered, state.rows);
      renderTable(sortedFiltered);
      updateFilterMeta();
      renderFilterChips();
      renderHeaderInteractions();
      updateMapIfVisible();
    }

    function populateFilterOptions(rows) {
      fillOptions(el.attendeesFilter, uniqueSortedValues(rows, "attendees_500_plus"));
      fillOptions(el.acceptsCfpFilter, uniqueSortedValues(rows, "accepts_cfp"));
      fillOptions(el.acceptsCftFilter, uniqueSortedValues(rows, "accepts_cft"));
      fillOptions(el.acceptsCfwFilter, uniqueSortedValues(rows, "accepts_cfw"));
      fillOptions(el.academicFilter, uniqueSortedValues(rows, "academic_acceptance_level"));
      fillOptions(el.sponsorshipFilter, uniqueSortedValues(rows, "travel_accommodation_sponsorship"));
      fillOptions(el.typeFilter, uniqueSortedValues(rows, "conference_type"));
      fillOptions(el.monthFilter, uniqueSortedValues(rows, "cfp_deadline_month"));
      fillOptions(el.venuePatternFilter, uniqueSortedValues(rows, "venue_pattern"));
    }

    async function loadCsvAndRender() {
      const csvUrl = `${CSV_PATH}?t=${Date.now()}`;
      const res = await fetch(csvUrl, { cache: "no-store" });
      if (!res.ok) throw new Error(`Failed to load CSV: HTTP ${res.status}`);
      const csvText = await res.text();
      const parsed = Papa.parse(csvText, {
        header: true,
        skipEmptyLines: true,
        transformHeader: (h) => normalize(h)
      });
      if (parsed.errors.length) {
        console.warn("CSV parse warnings:", parsed.errors);
      }
      state.rows = normalizeAndValidateRows(parsed);
      populateFilterOptions(state.rows);
      applyFilterValuesToInputs();
      rerender();
      updateMapIfVisible();
    }

    function resetFilters() {
      state.filters = defaultFilters();
      state.headerSort = { key: "", direction: "asc" };
      localStorage.removeItem(STORAGE_KEY);
      applyFilterValuesToInputs();
      rerender();
    }

    function bindEvents() {
      const rerenderOnInput = [el.searchInput, el.attendeesFilter, el.acceptsCfpFilter, el.acceptsCftFilter, el.acceptsCfwFilter, el.academicFilter, el.sponsorshipFilter, el.typeFilter, el.monthFilter, el.venuePatternFilter, el.sortFilter];
      rerenderOnInput.filter(Boolean).forEach((inputEl) => inputEl.addEventListener("input", rerender));
      rerenderOnInput.filter(Boolean).forEach((inputEl) => inputEl.addEventListener("change", rerender));
      if (el.resetBtn) el.resetBtn.addEventListener("click", resetFilters);
      if (el.shortcutsBtn && el.shortcutHelp) {
        el.shortcutsBtn.addEventListener("click", () => {
          const isHidden = el.shortcutHelp.classList.toggle("hidden");
          el.shortcutsBtn.setAttribute("aria-expanded", String(!isHidden));
        });
      }
      if (el.summaryCards) el.summaryCards.addEventListener("click", (event) => {
        const btn = event.target.closest("[data-stat-action]");
        if (!btn) return;
        applyPreset(btn.getAttribute("data-stat-action"));
      });
      if (el.activeFilterChips) el.activeFilterChips.addEventListener("click", (event) => {
        const btn = event.target.closest("[data-clear-filter]");
        if (!btn) return;
        clearSingleFilter(btn.getAttribute("data-clear-filter"));
      });
      if (el.dataThead) el.dataThead.addEventListener("click", (event) => {
        const th = event.target.closest(".clickable-th");
        if (!th) return;
        const sortKey = th.getAttribute("data-sort-key");
        const filterKey = th.getAttribute("data-filter-key");
        if (sortKey) {
          applyHeaderSort(sortKey);
          return;
        }
        if (filterKey) {
          applyHeaderFilter(filterKey);
        }
      });
      if (el.mapControls) el.mapControls.addEventListener("click", (event) => {
        const btn = event.target.closest("[data-map-source]");
        if (!btn) return;
        const source = btn.getAttribute("data-map-source");
        if (source !== "all" && source !== "filtered") return;
        state.mapSource = source;
        saveUiPrefs();
        updateMapSourceButtons();
        updateMapIfVisible();
      });
      if (el.tabDashboard) el.tabDashboard.addEventListener("click", () => setActiveTab("dashboard"));
      if (el.tabMap) el.tabMap.addEventListener("click", () => setActiveTab("map"));
      document.addEventListener("keydown", (event) => {
        if (!event.altKey) return;
        const key = event.key.toLowerCase();
        if (key === "f") {
          event.preventDefault();
          el.searchInput?.focus();
          el.searchInput?.select();
        } else if (key === "0") {
          event.preventDefault();
          resetFilters();
        } else if (key === "k") {
          event.preventDefault();
          el.shortcutsBtn?.click();
        }
      });
    }

    async function start() {
      state.geocodeCache = loadGeocodeCache();
      loadFilters();
      readFiltersFromUrl();
      loadUiPrefs();
      bindEvents();
      setActiveTab(state.activeTab);
      updateMapSourceButtons();
      try {
        await loadCsvAndRender();
      } catch (err) {
        console.error(err);
        document.body.innerHTML = `
          <div class="app-error">
            <h2>Could not load data</h2>
            <p>Run this page via a local server (not <code>file://</code>) and verify all project files are present.</p>
            <pre>${escapeHtml(String(err))}</pre>
          </div>
        `;
      }
    }

    start();
