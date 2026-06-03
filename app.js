    const CSV_PATH = "conferences.csv";
    const STORAGE_KEY = "conference_dashboard_filters_v1";
    const GEO_CACHE_KEY = "conference_dashboard_geo_cache_v3";
    const UI_PREFS_KEY = "conference_dashboard_ui_prefs_v1";
    const PERSONA_KEY = "conference_dashboard_persona_v1";
    const APP_SECTION_KEY = "conference_dashboard_app_section_v1";
    const ONBOARDING_KEY = "conference_dashboard_onboarding_v1";
    const PIPELINE_KEY = "conference_dashboard_pipeline_v1";
    const SAVED_TRIPS_KEY = "conference_dashboard_saved_trips_v1";
    const FAVORITES_KEY = "conference_dashboard_favorites_v1";
    const NOTES_KEY = "conference_dashboard_notes_v1";
    const PLANNING_PREFS_KEY = "conference_dashboard_planning_prefs_v1";

    const TRIP_PLAN = {
      planning: "planning",
      deferred: "deferred",
      attended: "attended",
      skipped: "skipped"
    };

    const PIPE_PLAN = {
      active: "active",
      deferred: "deferred",
      done: "done"
    };

    const BACKUP_FORMAT_VERSION = 1;
    const KNOWN_STORAGE_KEYS = [
      STORAGE_KEY,
      GEO_CACHE_KEY,
      UI_PREFS_KEY,
      PERSONA_KEY,
      APP_SECTION_KEY,
      ONBOARDING_KEY,
      PIPELINE_KEY,
      SAVED_TRIPS_KEY,
      FAVORITES_KEY,
      NOTES_KEY,
      PLANNING_PREFS_KEY
    ];

    const CSV_EXPORT_KEYS = [
      "conference_name",
      "city",
      "country",
      "cfp_deadline_month",
      "cfp_deadline",
      "cft_deadline",
      "cfw_deadline",
      "conference_start_date",
      "conference_end_date",
      "submission_tracks",
      "travel_accommodation_sponsorship",
      "conference_type",
      "website_or_cfp_link",
      "cft_link",
      "cfw_link"
    ];

    const PIPELINE_STATUSES = [
      { value: "watching", label: "Watching" },
      { value: "drafting", label: "Drafting" },
      { value: "submitted", label: "Submitted" },
      { value: "accepted", label: "Accepted" },
      { value: "declined", label: "Declined" },
      { value: "waitlisted", label: "Waitlisted" }
    ];

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
        deadlineWindow: "",
        favoritesOnly: "",
        region: "",
        actionableCfp: "",
        industryTalks: "",
        inPipeline: "",
        sortBy: "attendees_name"
      };
    }

    function speakerPresetFilters() {
      return {
        ...defaultFilters(),
        acceptsCfp: "Yes",
        actionableCfp: "yes",
        sortBy: "deadline_soon"
      };
    }

    const state = {
      rows: [],
      filters: defaultFilters(),
      headerSort: { key: "", direction: "asc" },
      activeTab: "dashboard",
      geocodeCache: {},
      mapSource: "all",
      personaMode: "speaker",
      appSection: "discover",
      pipeline: [],
      savedTrips: [],
      favorites: [],
      notes: {},
      detailConferenceName: "",
      _personaFromUrl: false,
      _sectionFromUrl: false,
      planningYearFilterPipeline: "all",
      planningYearFilterTrips: "all",
      theme: "light"
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
      sortFilter: document.getElementById("sortFilter"),
      activeFilterMeta: document.getElementById("activeFilterMeta"),
      activeFilterChips: document.getElementById("activeFilterChips"),
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
      mapControls: document.getElementById("mapControls"),
      personaSelect: document.getElementById("personaSelect"),
      personaHint: document.getElementById("personaHint"),
      themeToggle: document.getElementById("themeToggle"),
      themeToggleText: document.getElementById("themeToggleText"),
      sectionDiscover: document.getElementById("sectionDiscover"),
      sectionSpeaker: document.getElementById("sectionSpeaker"),
      sectionAttendee: document.getElementById("sectionAttendee"),
      sectionSettings: document.getElementById("sectionSettings"),
      onboardingDialog: document.getElementById("onboardingDialog"),
      onboardingContinue: document.getElementById("onboardingContinue"),
      mySpeakerEmpty: document.getElementById("mySpeakerEmpty"),
      mySpeakerList: document.getElementById("mySpeakerList"),
      myPipelineToolbar: document.getElementById("myPipelineToolbar"),
      exportPipelineCsvBtn: document.getElementById("exportPipelineCsvBtn"),
      exportPipelineIcsBtn: document.getElementById("exportPipelineIcsBtn"),
      pipelineUpcoming: document.getElementById("pipelineUpcoming"),
      myTripsEmpty: document.getElementById("myTripsEmpty"),
      myTripsList: document.getElementById("myTripsList"),
      myTripsToolbar: document.getElementById("myTripsToolbar"),
      exportTripsCsvBtn: document.getElementById("exportTripsCsvBtn"),
      exportTripsIcsBtn: document.getElementById("exportTripsIcsBtn"),
      tripsUpcoming: document.getElementById("tripsUpcoming"),
      footerStatus: document.getElementById("footerStatus"),
      shortcutsDialog: document.getElementById("shortcutsDialog"),
      shortcutsCloseBtn: document.getElementById("shortcutsCloseBtn"),
      footerShortcutsBtn: document.getElementById("footerShortcutsBtn"),
      pipelineYearFilter: document.getElementById("pipelineYearFilter"),
      tripsYearFilter: document.getElementById("tripsYearFilter"),
      favoritesFilter: document.getElementById("favoritesFilter"),
      exportStorageBtn: document.getElementById("exportStorageBtn"),
      importStorageBtn: document.getElementById("importStorageBtn"),
      importStorageFile: document.getElementById("importStorageFile"),
      backupStatus: document.getElementById("backupStatus"),
      exportCsvBtn: document.getElementById("exportCsvBtn"),
      copyViewLinkBtn: document.getElementById("copyViewLinkBtn"),
      conferenceDetailDialog: document.getElementById("conferenceDetailDialog"),
      conferenceDetailTitle: document.getElementById("conferenceDetailTitle"),
      conferenceDetailBody: document.getElementById("conferenceDetailBody"),
      conferenceDetailNotes: document.getElementById("conferenceDetailNotes"),
      conferenceDetailToolbar: document.getElementById("conferenceDetailToolbar"),
      conferenceDetailHint: document.getElementById("conferenceDetailHint"),
      conferenceDetailClose: document.getElementById("conferenceDetailClose"),
      discoverQuickActions: document.getElementById("discoverQuickActions"),
      advancedFiltersBtn: document.getElementById("advancedFiltersBtn"),
      advancedFilterFields: [...document.querySelectorAll(".advanced-filter")],
      appViewNav: document.querySelector(".app-view-nav"),
      appViewDiscover: document.getElementById("appViewDiscover"),
      appViewSpeaker: document.getElementById("appViewSpeaker"),
      appViewAttendee: document.getElementById("appViewAttendee"),
      appViewSettings: document.getElementById("appViewSettings"),
      tabNav: document.querySelector(".tab-nav")
    };

    function iconSvg(pathD) {
      return `<svg class="icon-svg" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="${pathD}"/></svg>`;
    }

    const ICON = {
      remove: iconSvg(
        "M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"
      ),
      clipboard: iconSvg(
        "M19 9h-4V3H9v6H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 0c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm2 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"
      ),
      place: iconSvg(
        "M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"
      ),
      openInNew: iconSvg(
        "M19 19H5V5h7V3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2v-7h-2v7zM14 3v2h3.59l-9.83 9.83 1.41 1.41L19 6.41V10h2V3h-7z"
      ),
      calendar: iconSvg(
        "M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z"
      ),
      link: iconSvg(
        "M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1zM8 13h8v-2H8v2zm9-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1s-1.39 3.1-3.1 3.1h-4V17h4c2.76 0 5-2.24 5-5s-2.24-5-5-5z"
      ),
      star: iconSvg(
        "M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"
      ),
      starOutline: iconSvg(
        "M22 9.24l-7.19-.62L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21 12 17.27 18.18 21l-1.63-7.03L22 9.24zm-7.41 5.29L12 15.9l-2.59-1.37L9.18 12 12 10.47l2.82 1.53 1.41 1.41z"
      )
    };

    let advancedFiltersExpanded = false;

    function normalize(value) {
      return (value ?? "").toString().trim();
    }

    function toLower(value) {
      return normalize(value).toLowerCase();
    }

    function planningYearFromRow(row) {
      if (!row) return new Date().getFullYear();
      return referenceYearForRow(row);
    }

    function normalizePipelineItem(raw, yearFallback) {
      const yDef = Number.isFinite(yearFallback) ? yearFallback : new Date().getFullYear();
      if (typeof raw === "string") {
        return { name: normalize(raw), status: "watching", planningYear: yDef, pipePlan: PIPE_PLAN.active };
      }
      if (!raw || typeof raw !== "object" || !raw.name) return null;
      const name = normalize(raw.name);
      let status = normalize(raw.status).toLowerCase() || "watching";
      if (!PIPELINE_STATUSES.some((s) => s.value === status)) status = "watching";
      let planningYear = Number(raw.planningYear);
      if (!Number.isFinite(planningYear) || planningYear < 2000 || planningYear > 2100) planningYear = yDef;
      let pipePlan = normalize(raw.pipePlan).toLowerCase();
      if (!Object.values(PIPE_PLAN).includes(pipePlan)) pipePlan = PIPE_PLAN.active;
      return { name, status, planningYear, pipePlan };
    }

    function normalizeTripEntry(raw, yearFallback) {
      const yDef = Number.isFinite(yearFallback) ? yearFallback : new Date().getFullYear();
      if (typeof raw === "string") {
        return { name: normalize(raw), planningYear: yDef, tripPlan: TRIP_PLAN.planning };
      }
      if (!raw || typeof raw !== "object" || !raw.name) return null;
      const name = normalize(raw.name);
      let planningYear = Number(raw.planningYear);
      if (!Number.isFinite(planningYear) || planningYear < 2000 || planningYear > 2100) planningYear = yDef;
      let tripPlan = normalize(raw.tripPlan).toLowerCase();
      if (!Object.values(TRIP_PLAN).includes(tripPlan)) tripPlan = TRIP_PLAN.planning;
      return { name, planningYear, tripPlan };
    }

    function getTripEntry(name) {
      const n = normalize(name);
      return state.savedTrips.find((t) => normalize(t.name) === n) || null;
    }

    function getPipelineEntry(name) {
      const n = normalize(name);
      return state.pipeline.find((p) => normalize(p.name) === n) || null;
    }

    function tripPlanLabel(v) {
      const map = {
        [TRIP_PLAN.planning]: "Planning",
        [TRIP_PLAN.deferred]: "Deferred",
        [TRIP_PLAN.attended]: "Attended",
        [TRIP_PLAN.skipped]: "Skipped"
      };
      return map[v] || v;
    }

    function pipePlanLabel(v) {
      const map = {
        [PIPE_PLAN.active]: "Active",
        [PIPE_PLAN.deferred]: "Deferred",
        [PIPE_PLAN.done]: "Done"
      };
      return map[v] || v;
    }

    function filterYearOptionsHtml(selected) {
      let html = `<option value="all"${selected === "all" ? " selected" : ""}>All years</option>`;
      const y0 = new Date().getFullYear();
      for (let y = y0 - 2; y <= y0 + 8; y++) {
        html += `<option value="${y}"${String(selected) === String(y) ? " selected" : ""}>${y}</option>`;
      }
      return html;
    }

    function yearSelectHtml(selected, attrName, enc) {
      const y0 = new Date().getFullYear();
      let opts = "";
      for (let y = y0 - 2; y <= y0 + 8; y++) {
        opts += `<option value="${y}"${Number(selected) === y ? " selected" : ""}>${y}</option>`;
      }
      return `<select class="my-plan-year-select" ${attrName}="${enc}" aria-label="Target year">${opts}</select>`;
    }

    function tripPlanSelectHtml(value, dataCname) {
      const cur = normalize(value).toLowerCase() || TRIP_PLAN.planning;
      return `<select class="my-trip-plan-select" data-trip-plan-status data-cname="${dataCname}" aria-label="Trip status">
        ${Object.values(TRIP_PLAN)
          .map((v) => `<option value="${v}"${cur === v ? " selected" : ""}>${tripPlanLabel(v)}</option>`)
          .join("")}
      </select>`;
    }

    function pipePlanSelectHtml(value, dataCname) {
      const cur = normalize(value).toLowerCase() || PIPE_PLAN.active;
      return `<select class="my-pipe-plan-select" data-pipe-plan-status data-cname="${dataCname}" aria-label="Plan status">
        ${Object.values(PIPE_PLAN)
          .map((v) => `<option value="${v}"${cur === v ? " selected" : ""}>${pipePlanLabel(v)}</option>`)
          .join("")}
      </select>`;
    }

    function loadPlanningPrefs() {
      try {
        const raw = localStorage.getItem(PLANNING_PREFS_KEY);
        if (!raw) return;
        const p = JSON.parse(raw);
        if (!p || typeof p !== "object") return;
        if (p.pipeline === "all" || (p.pipeline != null && /^\d+$/.test(String(p.pipeline)))) {
          state.planningYearFilterPipeline = p.pipeline === "all" ? "all" : Number(p.pipeline);
        }
        if (p.trips === "all" || (p.trips != null && /^\d+$/.test(String(p.trips)))) {
          state.planningYearFilterTrips = p.trips === "all" ? "all" : Number(p.trips);
        }
      } catch (err) {
        console.warn("Could not load planning prefs", err);
      }
    }

    function savePlanningPrefs() {
      try {
        localStorage.setItem(
          PLANNING_PREFS_KEY,
          JSON.stringify({
            pipeline: state.planningYearFilterPipeline,
            trips: state.planningYearFilterTrips
          })
        );
      } catch (err) {
        console.warn("Could not save planning prefs", err);
      }
    }

    function syncPlanningFilterControls() {
      if (el.pipelineYearFilter) {
        el.pipelineYearFilter.innerHTML = filterYearOptionsHtml(state.planningYearFilterPipeline);
        el.pipelineYearFilter.value =
          state.planningYearFilterPipeline === "all" ? "all" : String(state.planningYearFilterPipeline);
      }
      if (el.tripsYearFilter) {
        el.tripsYearFilter.innerHTML = filterYearOptionsHtml(state.planningYearFilterTrips);
        el.tripsYearFilter.value =
          state.planningYearFilterTrips === "all" ? "all" : String(state.planningYearFilterTrips);
      }
    }

    function getFilteredPipeline() {
      if (state.planningYearFilterPipeline === "all") return state.pipeline.slice();
      const y = Number(state.planningYearFilterPipeline);
      return state.pipeline.filter((p) => Number(p.planningYear) === y);
    }

    function getFilteredTrips() {
      if (state.planningYearFilterTrips === "all") return state.savedTrips.slice();
      const y = Number(state.planningYearFilterTrips);
      return state.savedTrips.filter((t) => Number(t.planningYear) === y);
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
      if (state.personaMode && state.personaMode !== "speaker") {
        params.set("persona", state.personaMode);
      } else {
        params.delete("persona");
      }
      if (state.appSection && state.appSection !== "discover") {
        params.set("view", state.appSection);
      } else {
        params.delete("view");
      }
      const query = params.toString();
      const nextUrl = query ? `${window.location.pathname}?${query}` : window.location.pathname;
      window.history.replaceState(null, "", nextUrl);
    }

    function readAppMetaFromUrl() {
      const params = new URLSearchParams(window.location.search);
      if (params.has("persona")) {
        const val = normalize(params.get("persona")).toLowerCase();
        if (["speaker", "attendee"].includes(val)) {
          state.personaMode = val;
          state._personaFromUrl = true;
        }
      }
      if (params.has("view")) {
        const val = normalize(params.get("view")).toLowerCase();
        if (["discover", "speaker", "attendee", "settings"].includes(val)) {
          state.appSection = val;
          state._sectionFromUrl = true;
        }
      }
    }

    function migrateLegacyPersonaState() {
      let changed = false;
      if (state.personaMode === "organiser") {
        state.personaMode = "speaker";
        changed = true;
      }
      if (state.appSection === "organiser") {
        state.appSection = "discover";
        changed = true;
      }
      if (changed) {
        savePersonaMode();
        saveAppSection();
      }
    }

    function loadPersonaAndSectionFromStorage() {
      if (!state._personaFromUrl) {
        try {
          const raw = localStorage.getItem(PERSONA_KEY);
          if (raw && ["speaker", "attendee"].includes(raw)) {
            state.personaMode = raw;
          }
        } catch (err) {
          console.warn("Could not read persona preference", err);
        }
      }
      if (!state._sectionFromUrl) {
        try {
          const raw = localStorage.getItem(APP_SECTION_KEY);
          if (raw && ["discover", "speaker", "attendee", "settings"].includes(raw)) {
            state.appSection = raw;
          }
        } catch (err) {
          console.warn("Could not read app section preference", err);
        }
      }
      migrateLegacyPersonaState();
    }

    function savePersonaMode() {
      try {
        localStorage.setItem(PERSONA_KEY, state.personaMode);
      } catch (err) {
        console.warn("Could not save persona preference", err);
      }
    }

    function saveAppSection() {
      try {
        localStorage.setItem(APP_SECTION_KEY, state.appSection);
      } catch (err) {
        console.warn("Could not save app section preference", err);
      }
    }

    function loadPipeline() {
      try {
        const raw = localStorage.getItem(PIPELINE_KEY);
        if (!raw) {
          state.pipeline = [];
          return;
        }
        const parsed = JSON.parse(raw);
        if (!Array.isArray(parsed)) {
          state.pipeline = [];
          return;
        }
        const yFallback = new Date().getFullYear();
        state.pipeline = parsed
          .map((item) => normalizePipelineItem(item, yFallback))
          .filter(Boolean);
      } catch (err) {
        console.warn("Could not parse pipeline", err);
        state.pipeline = [];
      }
    }

    function savePipeline() {
      try {
        localStorage.setItem(PIPELINE_KEY, JSON.stringify(state.pipeline));
      } catch (err) {
        console.warn("Could not save pipeline", err);
      }
    }

    function loadSavedTrips() {
      try {
        const raw = localStorage.getItem(SAVED_TRIPS_KEY);
        if (!raw) {
          state.savedTrips = [];
          return;
        }
        const parsed = JSON.parse(raw);
        if (!Array.isArray(parsed)) {
          state.savedTrips = [];
          return;
        }
        const yFallback = new Date().getFullYear();
        state.savedTrips = parsed.map((item) => normalizeTripEntry(item, yFallback)).filter(Boolean);
      } catch (err) {
        console.warn("Could not parse saved trips", err);
        state.savedTrips = [];
      }
    }

    function saveSavedTrips() {
      try {
        localStorage.setItem(SAVED_TRIPS_KEY, JSON.stringify(state.savedTrips));
      } catch (err) {
        console.warn("Could not save saved trips", err);
      }
    }

    function findRowByConferenceName(name) {
      const n = normalize(name);
      if (!n) return null;
      return state.rows.find((r) => normalize(r.conference_name) === n) || null;
    }

    function isInPipeline(name) {
      const n = normalize(name);
      return state.pipeline.some((p) => normalize(p.name) === n);
    }

    function isSavedTrip(name) {
      const n = normalize(name);
      return state.savedTrips.some((s) => normalize(s.name) === n);
    }

    function addToPipeline(name) {
      const n = normalize(name);
      if (!n || isInPipeline(n)) return;
      const row = findRowByConferenceName(n);
      const y = planningYearFromRow(row);
      state.pipeline.push({ name: n, status: "watching", planningYear: y, pipePlan: PIPE_PLAN.active });
      savePipeline();
      renderMyPanels();
    }

    function removeFromPipeline(name) {
      const n = normalize(name);
      state.pipeline = state.pipeline.filter((p) => normalize(p.name) !== n);
      savePipeline();
      renderMyPanels();
    }

    function setPipelineStatus(name, status) {
      const n = normalize(name);
      const item = state.pipeline.find((p) => normalize(p.name) === n);
      if (!item) return;
      let st = normalize(status).toLowerCase() || "watching";
      if (!PIPELINE_STATUSES.some((s) => s.value === st)) st = "watching";
      item.status = st;
      savePipeline();
    }

    function setPipelinePlanningYear(name, year) {
      const n = normalize(name);
      const item = state.pipeline.find((p) => normalize(p.name) === n);
      if (!item) return;
      const y = Number(year);
      if (!Number.isFinite(y) || y < 2000 || y > 2100) return;
      item.planningYear = y;
      savePipeline();
      renderMyPanels();
      refreshConferenceDetailIfOpen();
    }

    function setPipePlan(name, plan) {
      const n = normalize(name);
      const item = state.pipeline.find((p) => normalize(p.name) === n);
      if (!item) return;
      let p = normalize(plan).toLowerCase();
      if (!Object.values(PIPE_PLAN).includes(p)) p = PIPE_PLAN.active;
      item.pipePlan = p;
      savePipeline();
      renderMyPanels();
      refreshConferenceDetailIfOpen();
    }

    function addSavedTrip(name) {
      const n = normalize(name);
      if (!n || isSavedTrip(n)) return;
      const row = findRowByConferenceName(n);
      const y = planningYearFromRow(row);
      state.savedTrips.push({ name: n, planningYear: y, tripPlan: TRIP_PLAN.planning });
      saveSavedTrips();
      renderMyPanels();
    }

    function setTripPlanningYear(name, year) {
      const n = normalize(name);
      const item = state.savedTrips.find((t) => normalize(t.name) === n);
      if (!item) return;
      const y = Number(year);
      if (!Number.isFinite(y) || y < 2000 || y > 2100) return;
      item.planningYear = y;
      saveSavedTrips();
      renderMyPanels();
      refreshConferenceDetailIfOpen();
    }

    function setTripPlan(name, plan) {
      const n = normalize(name);
      const item = state.savedTrips.find((t) => normalize(t.name) === n);
      if (!item) return;
      let p = normalize(plan).toLowerCase();
      if (!Object.values(TRIP_PLAN).includes(p)) p = TRIP_PLAN.planning;
      item.tripPlan = p;
      saveSavedTrips();
      renderMyPanels();
      refreshConferenceDetailIfOpen();
    }

    function removeSavedTrip(name) {
      const n = normalize(name);
      state.savedTrips = state.savedTrips.filter((s) => normalize(s.name) !== n);
      saveSavedTrips();
      renderMyPanels();
    }

    function loadFavorites() {
      try {
        const raw = localStorage.getItem(FAVORITES_KEY);
        if (!raw) {
          state.favorites = [];
          return;
        }
        const parsed = JSON.parse(raw);
        state.favorites = Array.isArray(parsed) ? parsed.map((x) => normalize(x)).filter(Boolean) : [];
      } catch (err) {
        console.warn("Could not parse favorites", err);
        state.favorites = [];
      }
    }

    function saveFavorites() {
      try {
        localStorage.setItem(FAVORITES_KEY, JSON.stringify(state.favorites));
      } catch (err) {
        console.warn("Could not save favorites", err);
      }
    }

    function isFavorite(name) {
      const n = normalize(name);
      return state.favorites.some((x) => normalize(x) === n);
    }

    function toggleFavorite(name) {
      const n = normalize(name);
      if (!n) return;
      const idx = state.favorites.findIndex((x) => normalize(x) === n);
      if (idx >= 0) state.favorites.splice(idx, 1);
      else state.favorites.push(n);
      saveFavorites();
    }

    function loadNotes() {
      try {
        const raw = localStorage.getItem(NOTES_KEY);
        if (!raw) {
          state.notes = {};
          return;
        }
        const parsed = JSON.parse(raw);
        state.notes = parsed && typeof parsed === "object" ? parsed : {};
      } catch (err) {
        console.warn("Could not parse notes", err);
        state.notes = {};
      }
    }

    function saveNotesObject() {
      try {
        localStorage.setItem(NOTES_KEY, JSON.stringify(state.notes));
      } catch (err) {
        console.warn("Could not save notes", err);
      }
    }

    function setNoteForConference(name, text) {
      const n = normalize(name);
      if (!n) return;
      const t = normalize(text);
      if (!t) {
        delete state.notes[n];
      } else {
        state.notes[n] = t.slice(0, 8000);
      }
      saveNotesObject();
    }

    function csvEscapeCell(value) {
      const s = normalize(value).replace(/"/g, '""');
      return `"${s}"`;
    }

    function exportFilteredCsv() {
      readFilterValues();
      const rows = sortRows(getFilteredRows());
      const headerRow = CSV_EXPORT_KEYS.map((k) => csvEscapeCell(k))
        .concat(csvEscapeCell("your_notes"))
        .join(",");
      const lines = [`\ufeff${headerRow}`];
      rows.forEach((r) => {
        const n = normalize(r.conference_name);
        const cells = CSV_EXPORT_KEYS.map((k) => csvEscapeCell(r[k] || ""));
        cells.push(csvEscapeCell(state.notes[n] || ""));
        lines.push(cells.join(","));
      });
      const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `conference-tracker-export-${new Date().toISOString().slice(0, 10)}.csv`;
      a.rel = "noopener";
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    }

    function copyViewLinkToClipboard() {
      readFilterValues();
      saveFilters();
      syncFiltersToUrl();
      const url = window.location.href;
      const done = () => {
        if (el.conferenceDetailHint && el.conferenceDetailDialog?.open) {
          el.conferenceDetailHint.textContent = "Link copied to clipboard.";
        } else if (el.backupStatus) {
          el.backupStatus.textContent = "Link copied to clipboard.";
          el.backupStatus.classList.remove("backup-status-error");
        }
      };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(url).then(done).catch(() => {
          window.prompt("Copy this link:", url);
        });
      } else {
        window.prompt("Copy this link:", url);
      }
    }

    function escapeIcsText(value) {
      return normalize(value)
        .replace(/\\/g, "\\\\")
        .replace(/;/g, "\\;")
        .replace(/,/g, "\\,")
        .replace(/\n/g, "\\n");
    }

    function formatIcsDateOnly(d) {
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      return `${y}${m}${day}`;
    }

    function buildVEventLines(row) {
      const info = getNextDeadlineInfo(row);
      if (!info || !info.deadlineDate) return null;
      const name = normalize(row.conference_name);
      const uidBase = `${name}-${formatIcsDateOnly(info.deadlineDate)}`.replace(/[^a-zA-Z0-9@._-]/g, "-");
      const stamp = formatIcsDateOnly(new Date());
      const dt = formatIcsDateOnly(info.deadlineDate);
      const sum = escapeIcsText(`${info.label} deadline: ${name}`);
      const city = normalize(row.city);
      const country = normalize(row.country);
      const locLine = city || country ? `LOCATION:${escapeIcsText(`${city}${city && country ? ", " : ""}${country}`)}` : "";
      const site = normalize(row.website_or_cfp_link);
      const userNote = state.notes[name];
      const descParts = [];
      if (site) descParts.push(`Site: ${site}`);
      if (userNote) descParts.push(`Notes: ${userNote}`);
      const descLine = descParts.length ? `DESCRIPTION:${escapeIcsText(descParts.join(" | "))}` : "";
      return [
        "BEGIN:VEVENT",
        `UID:${uidBase}@conference-tracker.local`,
        `DTSTAMP:${stamp}T120000Z`,
        `DTSTART;VALUE=DATE:${dt}`,
        `SUMMARY:${sum}`,
        locLine,
        descLine,
        "END:VEVENT"
      ].filter((line) => Boolean(line));
    }

    function buildIcsForConference(row) {
      const ve = buildVEventLines(row);
      if (!ve) return null;
      return [
        "BEGIN:VCALENDAR",
        "VERSION:2.0",
        "PRODID:-//ConferenceTracker//EN",
        "CALSCALE:GREGORIAN",
        ...ve,
        "END:VCALENDAR"
      ].join("\r\n");
    }

    function buildMergedIcsFromRows(rows) {
      const chunks = [];
      rows.forEach((row) => {
        const ve = buildVEventLines(row);
        if (ve) chunks.push(...ve);
      });
      if (chunks.length === 0) return null;
      return [
        "BEGIN:VCALENDAR",
        "VERSION:2.0",
        "PRODID:-//ConferenceTracker//EN",
        "CALSCALE:GREGORIAN",
        ...chunks,
        "END:VCALENDAR"
      ].join("\r\n");
    }

    function downloadTextFile(content, filename, mime) {
      const blob = new Blob([content], { type: mime });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      a.rel = "noopener";
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    }

    function downloadIcsForConference(row) {
      const ics = buildIcsForConference(row);
      if (!ics) {
        window.alert("There is no upcoming deadline to add to your calendar (TBD or N/A).");
        return;
      }
      const safe = normalize(row.conference_name).replace(/[^\w\-]+/g, "_").slice(0, 80);
      downloadTextFile(ics, `${safe || "deadline"}.ics`, "text/calendar;charset=utf-8");
    }

    function exportPipelineCsv() {
      const headerCells = ["pipeline_status", "planning_year", "pipe_plan"]
        .concat(CSV_EXPORT_KEYS)
        .concat(["your_notes"])
        .map((k) => csvEscapeCell(k));
      const lines = [`\ufeff${headerCells.join(",")}`];
      state.pipeline.forEach((item) => {
        const n = normalize(item.name);
        const row = findRowByConferenceName(n);
        const status = normalize(item.status) || "watching";
        const cells = [
          csvEscapeCell(status),
          csvEscapeCell(String(item.planningYear ?? "")),
          csvEscapeCell(item.pipePlan || PIPE_PLAN.active)
        ];
        CSV_EXPORT_KEYS.forEach((k) => {
          cells.push(csvEscapeCell(row ? row[k] || "" : ""));
        });
        cells.push(csvEscapeCell(state.notes[n] || ""));
        lines.push(cells.join(","));
      });
      downloadTextFile(lines.join("\n"), `pipeline-export-${new Date().toISOString().slice(0, 10)}.csv`, "text/csv;charset=utf-8");
      setFooterStatus("Pipeline CSV downloaded.");
    }

    function exportTripsCsv() {
      const headerCells = ["planning_year", "trip_plan"]
        .concat(CSV_EXPORT_KEYS)
        .concat(["your_notes"])
        .map((k) => csvEscapeCell(k));
      const lines = [`\ufeff${headerCells.join(",")}`];
      state.savedTrips.forEach((item) => {
        const n = normalize(item.name);
        const row = findRowByConferenceName(n);
        const cells = [csvEscapeCell(String(item.planningYear ?? "")), csvEscapeCell(item.tripPlan || TRIP_PLAN.planning)];
        CSV_EXPORT_KEYS.forEach((k) => {
          cells.push(csvEscapeCell(row ? row[k] || "" : ""));
        });
        cells.push(csvEscapeCell(state.notes[n] || ""));
        lines.push(cells.join(","));
      });
      downloadTextFile(lines.join("\n"), `saved-trips-export-${new Date().toISOString().slice(0, 10)}.csv`, "text/csv;charset=utf-8");
      setFooterStatus("Trips CSV downloaded.");
    }

    function exportPipelineIcsBundle() {
      const rows = state.pipeline.map((p) => findRowByConferenceName(p.name)).filter(Boolean);
      const ics = buildMergedIcsFromRows(rows);
      if (!ics) {
        window.alert("No calendar dates found for pipeline items (TBD, N/A, or missing from the catalog).");
        return;
      }
      downloadTextFile(ics, `pipeline-deadlines-${new Date().toISOString().slice(0, 10)}.ics`, "text/calendar;charset=utf-8");
      setFooterStatus("Pipeline calendar file downloaded.");
    }

    function exportTripsIcsBundle() {
      const rows = state.savedTrips.map((item) => findRowByConferenceName(item.name)).filter(Boolean);
      const ics = buildMergedIcsFromRows(rows);
      if (!ics) {
        window.alert("No calendar dates found for saved trips (TBD, N/A, or missing from the catalog).");
        return;
      }
      downloadTextFile(ics, `trips-deadlines-${new Date().toISOString().slice(0, 10)}.ics`, "text/calendar;charset=utf-8");
      setFooterStatus("Trips calendar file downloaded.");
    }

    let footerStatusTimer = 0;
    function setFooterStatus(message) {
      if (!el.footerStatus) return;
      window.clearTimeout(footerStatusTimer);
      el.footerStatus.textContent = message || "";
      if (message) {
        footerStatusTimer = window.setTimeout(() => {
          el.footerStatus.textContent = "";
        }, 4500);
      }
    }

    function openShortcutsDialog() {
      if (el.shortcutsDialog && typeof el.shortcutsDialog.showModal === "function") {
        try {
          el.shortcutsDialog.showModal();
        } catch (err) {
          console.warn(err);
        }
      }
    }

    function closeShortcutsDialog() {
      if (el.shortcutsDialog && typeof el.shortcutsDialog.close === "function") {
        el.shortcutsDialog.close();
      }
    }

    const UPCOMING_DEADLINE_DAYS = 30;

    function renderUpcomingStrip(container, conferenceNames) {
      if (!container) return;
      const entries = [];
      conferenceNames.forEach((rawName) => {
        const name = normalize(rawName);
        const row = findRowByConferenceName(name);
        if (!row) return;
        const info = getNextDeadlineInfo(row);
        if (!info || info.daysUntil < 0 || info.daysUntil > UPCOMING_DEADLINE_DAYS) return;
        entries.push({
          name,
          daysUntil: info.daysUntil,
          label: info.label,
          monthDay: info.monthDay
        });
      });
      entries.sort((a, b) => a.daysUntil - b.daysUntil);
      if (entries.length === 0) {
        container.hidden = true;
        container.innerHTML = "";
        return;
      }
      container.hidden = false;
      container.innerHTML = `
        <h3 class="upcoming-strip-title">≤${UPCOMING_DEADLINE_DAYS}d</h3>
        <ul class="upcoming-strip-list">
          ${entries
            .map(
              (e) =>
                `<li><span class="upcoming-name">${escapeHtml(e.name)}</span> <span class="upcoming-meta">${escapeHtml(e.label)} ${escapeHtml(e.monthDay)} · ${e.daysUntil}d</span></li>`
            )
            .join("")}
        </ul>
      `;
    }

    function setDetailUrlParam(name) {
      const params = new URLSearchParams(window.location.search);
      if (name) params.set("c", name);
      else params.delete("c");
      const query = params.toString();
      const nextUrl = query ? `${window.location.pathname}?${query}` : window.location.pathname;
      window.history.replaceState(null, "", nextUrl);
    }

    function fillConferenceDetail(row) {
      const name = normalize(row.conference_name);
      if (el.conferenceDetailTitle) el.conferenceDetailTitle.textContent = name;
      if (el.conferenceDetailNotes) {
        el.conferenceDetailNotes.value = state.notes[name] || "";
      }
      let nd = getNextDeadlineInfo(row, {
        includePastFallback: true,
        includeProjectedRecurring: true
      });
      if (!nd) nd = getEventTimingEstimate(row);
      const body = [];
      body.push('<dl class="detail-dl">');
      body.push(`<dt>Where</dt><dd>${escapeHtml(normalize(row.city))}, ${escapeHtml(normalize(row.country))} · ${escapeHtml(normalize(row.conference_type))}</dd>`);
      const dateNote = isProjectedEditionDates(row)
        ? ' <span class="detail-date-est">(next occurrence est. from last edition)</span>'
        : "";
      body.push(
        `<dt>Dates</dt><dd>${escapeHtml(formatDisplayConferenceDate(row, "start"))} → ${escapeHtml(formatDisplayConferenceDate(row, "end"))}${dateNote}</dd>`
      );
      if (!isAttendeeMode()) {
        body.push(`<dt>CfP mo.</dt><dd>${escapeHtml(normalize(row.cfp_deadline_month))}</dd>`);
        const deadlineLines = [
          ["CfP", row.cfp_deadline, row.website_or_cfp_link],
          ["CfT", row.cft_deadline, row.cft_link],
          ["CfW", row.cfw_deadline, row.cfw_link],
          ["CfV", row.cfv_deadline, row.cfv_link]
        ]
          .map(([label, dl, url]) => {
            const date = normalize(dl);
            const urlClean = normalize(url);
            const hasDate = Boolean(date) && date.toUpperCase() !== "TBD";
            let dateText = hasDate ? escapeHtml(date) : "—";
            if (!hasDate && urlClean && /^https?:\/\//i.test(urlClean)) {
              dateText = submissionPortalIndicator(urlClean).glyph;
            }
            if (urlClean && /^https?:\/\//i.test(urlClean)) {
              const { platform } = submissionPortalIndicator(urlClean);
              const linkLabel = hasDate
                ? dateText
                : `${dateText} ${escapeHtml(platform)}`;
              return `${label}: <a href="${escapeHtml(urlClean)}" target="_blank" rel="noopener noreferrer">${linkLabel}</a>`;
            }
            return `${label}: ${dateText}`;
          })
          .join(" · ");
        body.push(`<dt>Deadlines</dt><dd class="detail-links">${deadlineLines}</dd>`);
        const trackList = allSubmissionTracksForDisplay(row);
        body.push(
          `<dt>Tracks</dt><dd>${trackList.length ? escapeHtml(trackList.join(" | ")) : "—"}</dd>`
        );
        body.push(`<dt>Next due</dt><dd>${nd ? escapeHtml(formatNextDeadlineText(nd)) : "—"}</dd>`);
      }
      const linkParts = [];
      if (normalize(row.website_or_cfp_link)) {
        linkParts.push(`<a href="${escapeHtml(row.website_or_cfp_link)}" target="_blank" rel="noopener noreferrer">Site</a>`);
      }
      if (!isAttendeeMode()) {
        if (normalize(row.cft_link)) {
          linkParts.push(`<a href="${escapeHtml(row.cft_link)}" target="_blank" rel="noopener noreferrer">CfT</a>`);
        }
        if (normalize(row.cfw_link)) {
          linkParts.push(`<a href="${escapeHtml(row.cfw_link)}" target="_blank" rel="noopener noreferrer">CfW</a>`);
        }
        if (normalize(row.cfv_link)) {
          linkParts.push(`<a href="${escapeHtml(row.cfv_link)}" target="_blank" rel="noopener noreferrer">CfV</a>`);
        }
      }
      if (linkParts.length) {
        body.push(`<dt>Links</dt><dd class="detail-links">${linkParts.join(" · ")}</dd>`);
      }
      body.push("</dl>");
      if (state.personaMode === "attendee" && getTripEntry(name)) {
        const te = getTripEntry(name);
        const encPlan = encodeURIComponent(name);
        body.push(`<div class="detail-planning-block">
          <h3 class="detail-planning-block-title">Trip</h3>
          <div class="detail-planning-row"><span class="detail-planning-label">Year</span>${yearSelectHtml(te.planningYear, "data-trip-year", encPlan)}</div>
          <div class="detail-planning-row"><span class="detail-planning-label">Status</span>${tripPlanSelectHtml(te.tripPlan, encPlan)}</div>
        </div>`);
      }
      if (state.personaMode === "speaker" && getPipelineEntry(name)) {
        const pe = getPipelineEntry(name);
        const encPlan = encodeURIComponent(name);
        body.push(`<div class="detail-planning-block">
          <h3 class="detail-planning-block-title">Pipeline</h3>
          <div class="detail-planning-row"><span class="detail-planning-label">Year</span>${yearSelectHtml(pe.planningYear, "data-pipeline-year", encPlan)}</div>
          <div class="detail-planning-row"><span class="detail-planning-label">Plan</span>${pipePlanSelectHtml(pe.pipePlan, encPlan)}</div>
        </div>`);
      }
      if (el.conferenceDetailBody) el.conferenceDetailBody.innerHTML = body.join("");

      const enc = encodeURIComponent(name);
      const parts = [];
      function detailBtn(action, icon, label) {
        return `<button type="button" class="detail-action-btn btn-with-icon btn-icon-only" data-detail-action="${action}" data-cname="${enc}"${tipDataAttr(label)} aria-label="${escapeHtml(label)}">${icon}<span class="visually-hidden">${escapeHtml(label)}</span></button>`;
      }
      if (state.personaMode === "speaker") {
        parts.push(
          isInPipeline(name)
            ? detailBtn("pipeline-remove", ICON.remove, "Remove from pipeline")
            : detailBtn("pipeline-add", ICON.clipboard, "Add to pipeline")
        );
      } else if (state.personaMode === "attendee") {
        parts.push(
          isSavedTrip(name)
            ? detailBtn("saved-remove", ICON.remove, "Remove from trips")
            : detailBtn("saved-add", ICON.place, "Save to trips")
        );
      }
      parts.push(
        detailBtn("fav-toggle", isFavorite(name) ? ICON.star : ICON.starOutline, isFavorite(name) ? "Remove favorite" : "Add favorite")
      );
      parts.push(
        `<button type="button" class="detail-action-btn btn-with-icon btn-icon-only" data-detail-action="ics" data-cname="${enc}"${tipDataAttr("Add to calendar")} aria-label="Add to calendar"${!nd ? " disabled" : ""}>${ICON.calendar}<span class="visually-hidden">Add to calendar</span></button>`
      );
      parts.push(detailBtn("copy-conf-link", ICON.link, "Copy link"));
      if (el.conferenceDetailToolbar) el.conferenceDetailToolbar.innerHTML = parts.join(" ");

      if (el.conferenceDetailHint) {
        el.conferenceDetailHint.hidden = false;
      }
    }

    function openConferenceDetail(row, options) {
      const skipUrl = options && options.skipUrl;
      state.detailConferenceName = normalize(row.conference_name);
      fillConferenceDetail(row);
      if (!skipUrl) setDetailUrlParam(state.detailConferenceName);
      if (el.conferenceDetailDialog && typeof el.conferenceDetailDialog.showModal === "function") {
        try {
          el.conferenceDetailDialog.showModal();
        } catch (err) {
          console.warn(err);
        }
      }
    }

    function closeConferenceDetail() {
      if (el.conferenceDetailDialog && el.conferenceDetailDialog.open) {
        el.conferenceDetailDialog.close();
      }
    }

    function refreshConferenceDetailIfOpen() {
      if (!state.detailConferenceName || !el.conferenceDetailDialog?.open) return;
      const row = findRowByConferenceName(state.detailConferenceName);
      if (row) fillConferenceDetail(row);
      else closeConferenceDetail();
    }

    function tryOpenDetailFromUrl() {
      const params = new URLSearchParams(window.location.search);
      if (!params.has("c")) return;
      const name = normalize(params.get("c"));
      if (!name) {
        params.delete("c");
        const q = params.toString();
        window.history.replaceState(null, "", q ? `${window.location.pathname}?${q}` : window.location.pathname);
        return;
      }
      const row = findRowByConferenceName(name);
      if (row) openConferenceDetail(row, { skipUrl: true });
      else {
        params.delete("c");
        const q = params.toString();
        window.history.replaceState(null, "", q ? `${window.location.pathname}?${q}` : window.location.pathname);
      }
    }

    function maybeApplySpeakerDiscoverDefaults() {
      if (state.personaMode !== "speaker") return;
      try {
        if (localStorage.getItem(STORAGE_KEY)) return;
      } catch (err) {
        console.warn(err);
      }
      const params = new URLSearchParams(window.location.search);
      const filterKeys = new Set(Object.keys(defaultFilters()));
      const hasUrlFilters = [...params.keys()].some((k) => filterKeys.has(k));
      if (hasUrlFilters) return;
      state.filters = speakerPresetFilters();
    }

    function isGenericDefaultFilters() {
      const f = state.filters;
      const d = defaultFilters();
      const extraKeys = ["region", "actionableCfp", "industryTalks", "inPipeline"];
      for (const key of Object.keys(d)) {
        if (key === "sortBy") {
          if (normalize(f.sortBy) && normalize(f.sortBy) !== normalize(d.sortBy) && f.sortBy !== "deadline_soon") {
            return false;
          }
          continue;
        }
        if (normalize(f[key]) !== normalize(d[key])) return false;
      }
      return extraKeys.every((key) => !normalize(f[key]));
    }

    function setPersonaMode(mode) {
      if (!["speaker", "attendee"].includes(mode)) return;
      const prevMode = state.personaMode;
      state.personaMode = mode;
      if (mode === "attendee" && prevMode !== "attendee") {
        clearSpeakerOnlyFilters();
        applyFilterValuesToInputs();
      }
      if (mode === "speaker" && prevMode !== "speaker" && isGenericDefaultFilters()) {
        state.filters = speakerPresetFilters();
        state.headerSort = { key: "", direction: "asc" };
        applyFilterValuesToInputs();
      }
      if (
        state.appSection !== "discover" &&
        state.appSection !== "settings" &&
        state.appSection !== mode
      ) {
        state.appSection = mode;
        saveAppSection();
      }
      savePersonaMode();
      if (el.personaSelect) el.personaSelect.value = mode;
      updatePersonaHint();
      applyAppSectionUI();
      rerender();
    }

    function updatePersonaHint() {
      if (!el.personaHint) return;
      const hints = {
        speaker: "",
        attendee: ""
      };
      el.personaHint.textContent = hints[state.personaMode] || "";
    }

    function applyPrimaryNavModel() {
      const isMobile = isSmallScreen();
      const buttons = [
        { key: "discover", btn: el.appViewDiscover, label: "Discover" },
        { key: "speaker", btn: el.appViewSpeaker, label: "Pipeline" },
        { key: "attendee", btn: el.appViewAttendee, label: "Trips" },
        { key: "settings", btn: el.appViewSettings, label: "Settings" }
      ];
      const alwaysVisible = new Set(["discover", "settings"]);
      if (!isMobile) {
        buttons.forEach(({ key, btn, label }) => {
          if (!btn) return;
          btn.hidden = false;
          const span = btn.querySelector("span");
          if (span) span.textContent = label;
        });
        return;
      }
      const personaSection = state.personaMode;
      buttons.forEach(({ key, btn }) => {
        if (!btn) return;
        if (alwaysVisible.has(key)) {
          btn.hidden = false;
          return;
        }
        btn.hidden = key !== personaSection;
      });
      const personaButton = buttons.find((entry) => entry.key === personaSection)?.btn;
      if (personaButton) {
        const span = personaButton.querySelector("span");
        if (span) span.textContent = "My area";
      }
    }

    function applyAppSectionUI() {
      if (
        isSmallScreen() &&
        state.appSection !== "discover" &&
        state.appSection !== "settings" &&
        state.appSection !== state.personaMode
      ) {
        state.appSection = state.personaMode;
        saveAppSection();
      }
      const section = state.appSection;
      const map = {
        discover: el.sectionDiscover,
        speaker: el.sectionSpeaker,
        attendee: el.sectionAttendee,
        settings: el.sectionSettings
      };
      Object.entries(map).forEach(([key, node]) => {
        if (!node) return;
        node.hidden = key !== section;
      });
      document.querySelectorAll(".app-view-nav button[data-app-section]").forEach((btn) => {
        const match = btn.getAttribute("data-app-section") === section;
        btn.classList.toggle("active", match);
        btn.setAttribute("aria-current", match ? "page" : "false");
      });
      applyPrimaryNavModel();
      if (section === "speaker" || section === "attendee") {
        renderMyPanels();
      }
      if (section === "discover") {
        updateMapIfVisible();
      }
      const showSpeakerQuick =
        state.personaMode === "speaker" && section === "discover";
      if (el.discoverQuickActions) el.discoverQuickActions.hidden = !showSpeakerQuick;
    }

    function setAppSection(section) {
      if (!["discover", "speaker", "attendee", "settings"].includes(section)) return;
      if (
        isSmallScreen() &&
        section !== "discover" &&
        section !== "settings" &&
        section !== state.personaMode
      ) {
        section = state.personaMode;
      }
      state.appSection = section;
      saveAppSection();
      applyAppSectionUI();
      syncFiltersToUrl();
    }

    function moveFocusInButtonList(container, current, direction) {
      if (!container || !current) return;
      const buttons = [...container.querySelectorAll("button:not([hidden])")];
      if (!buttons.length) return;
      const idx = buttons.indexOf(current);
      if (idx === -1) return;
      const next = buttons[(idx + direction + buttons.length) % buttons.length];
      next.focus();
    }

    function rowActionButton(action, enc, iconHtml, label, title) {
      const tip = title || label;
      return `<button type="button" class="table-action-btn btn-with-icon btn-icon-only" data-action="${escapeHtml(action)}" data-cname="${enc}"${tipDataAttr(tip)} aria-label="${escapeHtml(tip)}">${iconHtml}<span class="visually-hidden">${escapeHtml(label)}</span></button>`;
    }

    function renderRowActions(row) {
      const name = normalize(row.conference_name);
      const enc = encodeURIComponent(name);
      if (state.personaMode === "speaker") {
        if (isInPipeline(name)) {
          return rowActionButton("pipeline-remove", enc, ICON.remove, "Remove", "Remove from pipeline");
        }
        return rowActionButton("pipeline-add", enc, ICON.clipboard, "Add", "Add to pipeline");
      }
      if (state.personaMode === "attendee") {
        if (isSavedTrip(name)) {
          return rowActionButton("saved-remove", enc, ICON.remove, "Remove", "Remove from trips");
        }
        return rowActionButton("saved-add", enc, ICON.place, "Save", "Save to trips");
      }
      return "—";
    }

    function renderPipelineStatusOptions(current) {
      let cur = normalize(current).toLowerCase() || "watching";
      if (!PIPELINE_STATUSES.some((s) => s.value === cur)) cur = "watching";
      return PIPELINE_STATUSES.map((s) => {
        const sel = s.value === cur ? " selected" : "";
        return `<option value="${escapeHtml(s.value)}"${sel}>${escapeHtml(s.label)}</option>`;
      }).join("");
    }

    function renderMyPanels() {
      syncPlanningFilterControls();
      renderMySpeakerPanel();
      renderMyTripsPanel();
    }

    function renderMySpeakerPanel() {
      if (!el.mySpeakerEmpty || !el.mySpeakerList) return;
      if (state.pipeline.length === 0) {
        el.mySpeakerEmpty.textContent =
          "No pipeline items yet. On Discover, use Add on a conference row.";
        el.mySpeakerEmpty.hidden = false;
        el.mySpeakerList.hidden = true;
        el.mySpeakerList.innerHTML = "";
        if (el.myPipelineToolbar) el.myPipelineToolbar.hidden = true;
        if (el.pipelineUpcoming) {
          el.pipelineUpcoming.hidden = true;
          el.pipelineUpcoming.innerHTML = "";
        }
        return;
      }
      const filtered = getFilteredPipeline();
      if (filtered.length === 0) {
        el.mySpeakerEmpty.textContent =
          "No pipeline items for this year. Change the year filter or add conferences from Discover.";
        el.mySpeakerEmpty.hidden = false;
        el.mySpeakerList.hidden = true;
        el.mySpeakerList.innerHTML = "";
        if (el.myPipelineToolbar) el.myPipelineToolbar.hidden = false;
        if (el.pipelineUpcoming) {
          el.pipelineUpcoming.hidden = true;
          el.pipelineUpcoming.innerHTML = "";
        }
        return;
      }
      el.mySpeakerEmpty.innerHTML = "";
      el.mySpeakerEmpty.hidden = true;
      el.mySpeakerList.hidden = false;
      if (el.myPipelineToolbar) el.myPipelineToolbar.hidden = false;
      renderUpcomingStrip(el.pipelineUpcoming, filtered.map((p) => p.name));
      const rowsHtml = filtered
        .map((item) => {
          const row = findRowByConferenceName(item.name);
          const nd = row ? renderNextDeadline(row) : "—";
          const city = row ? `${escapeHtml(normalize(row.city))}, ${escapeHtml(normalize(row.country))}` : "— (not in current data)";
          const enc = encodeURIComponent(item.name);
          return `
          <tr>
            <td>${ellipsisCell(item.name)}</td>
            <td>${city}</td>
            <td class="my-nd-cell">${nd}</td>
            <td class="my-plan-cell">${yearSelectHtml(item.planningYear, "data-pipeline-year", enc)}</td>
            <td>
              <select class="pipeline-status-select" data-pipeline-status data-cname="${enc}" aria-label="Submission status for ${escapeHtml(item.name)}">
                ${renderPipelineStatusOptions(item.status)}
              </select>
            </td>
            <td class="my-plan-cell">${pipePlanSelectHtml(item.pipePlan, enc)}</td>
            <td>
              <button type="button" class="table-action-btn btn-with-icon btn-icon-only" data-action="pipeline-remove" data-cname="${enc}"${tipDataAttr("Remove from pipeline")} aria-label="Remove from pipeline">${ICON.remove}<span class="visually-hidden">Remove</span></button>
            </td>
          </tr>
        `;
        })
        .join("");
      el.mySpeakerList.innerHTML = `
        <table class="my-area-table">
          <thead>
            <tr>
              <th scope="col">Event</th>
              <th scope="col">Where</th>
              <th scope="col">Due</th>
              <th scope="col">Year</th>
              <th scope="col">Status</th>
              <th scope="col">Plan</th>
              <th scope="col" aria-label="Actions"></th>
            </tr>
          </thead>
          <tbody>${rowsHtml}</tbody>
        </table>
      `;
    }

    function renderMyTripsPanel() {
      if (!el.myTripsEmpty || !el.myTripsList) return;
      if (state.savedTrips.length === 0) {
        el.myTripsEmpty.textContent =
          "No saved trips yet. On Discover, use Save on a conference row.";
        el.myTripsEmpty.hidden = false;
        el.myTripsList.hidden = true;
        el.myTripsList.innerHTML = "";
        if (el.myTripsToolbar) el.myTripsToolbar.hidden = true;
        if (el.tripsUpcoming) {
          el.tripsUpcoming.hidden = true;
          el.tripsUpcoming.innerHTML = "";
        }
        return;
      }
      const filtered = getFilteredTrips();
      if (filtered.length === 0) {
        el.myTripsEmpty.textContent =
          "No trips for this year. Change the year filter or save conferences from Discover.";
        el.myTripsEmpty.hidden = false;
        el.myTripsList.hidden = true;
        el.myTripsList.innerHTML = "";
        if (el.myTripsToolbar) el.myTripsToolbar.hidden = false;
        if (el.tripsUpcoming) {
          el.tripsUpcoming.hidden = true;
          el.tripsUpcoming.innerHTML = "";
        }
        return;
      }
      el.myTripsEmpty.innerHTML = "";
      el.myTripsEmpty.hidden = true;
      el.myTripsList.hidden = false;
      if (el.myTripsToolbar) el.myTripsToolbar.hidden = false;
      renderUpcomingStrip(el.tripsUpcoming, filtered.map((t) => t.name));
      const rowsHtml = filtered
        .map((item) => {
          const row = findRowByConferenceName(item.name);
          const nd = row ? renderNextDeadline(row) : "—";
          const city = row
            ? `${escapeHtml(normalize(row.city))}, ${escapeHtml(normalize(row.country))}`
            : "— (not in current data)";
          const enc = encodeURIComponent(item.name);
          return `
          <tr>
            <td>${ellipsisCell(item.name)}</td>
            <td>${city}</td>
            <td class="my-nd-cell">${nd}</td>
            <td class="my-plan-cell">${yearSelectHtml(item.planningYear, "data-trip-year", enc)}</td>
            <td class="my-plan-cell">${tripPlanSelectHtml(item.tripPlan, enc)}</td>
            <td>
              <button type="button" class="table-action-btn btn-with-icon btn-icon-only" data-action="saved-remove" data-cname="${enc}"${tipDataAttr("Remove from trips")} aria-label="Remove from trips">${ICON.remove}<span class="visually-hidden">Remove</span></button>
            </td>
          </tr>
        `;
        })
        .join("");
      el.myTripsList.innerHTML = `
        <table class="my-area-table">
          <thead>
            <tr>
              <th scope="col">Event</th>
              <th scope="col">Where</th>
              <th scope="col">Due</th>
              <th scope="col">Year</th>
              <th scope="col">Trip</th>
              <th scope="col" aria-label="Actions"></th>
            </tr>
          </thead>
          <tbody>${rowsHtml}</tbody>
        </table>
      `;
    }

    function openOnboardingIfNeeded() {
      if (!el.onboardingDialog) return;
      try {
        if (localStorage.getItem(ONBOARDING_KEY) === "1") return;
      } catch (err) {
        return;
      }
      const radios = el.onboardingDialog.querySelectorAll('input[name="onboardingPersona"]');
      radios.forEach((r) => {
        r.checked = r.value === state.personaMode;
      });
      if (typeof el.onboardingDialog.showModal === "function") {
        try {
          el.onboardingDialog.showModal();
        } catch (err) {
          console.warn("Could not open onboarding dialog", err);
        }
      }
    }

    function completeOnboarding() {
      const form = el.onboardingDialog?.querySelector('input[name="onboardingPersona"]:checked');
      const val = form?.value;
      if (val && ["speaker", "attendee"].includes(val)) {
        setPersonaMode(val);
      }
      try {
        localStorage.setItem(ONBOARDING_KEY, "1");
      } catch (err) {
        console.warn("Could not persist onboarding flag", err);
      }
      if (el.onboardingDialog && typeof el.onboardingDialog.close === "function") {
        el.onboardingDialog.close();
      }
      rerender();
      window.setTimeout(() => tryOpenDetailFromUrl(), 100);
    }

    function setBackupStatus(message, isError) {
      if (!el.backupStatus) return;
      el.backupStatus.textContent = message || "";
      el.backupStatus.classList.toggle("backup-status-error", Boolean(isError));
    }

    function collectStorageSnapshot() {
      const storage = {};
      KNOWN_STORAGE_KEYS.forEach((k) => {
        const v = localStorage.getItem(k);
        if (v !== null) storage[k] = v;
      });
      return storage;
    }

    function validateBackupPayload(data) {
      if (!data || typeof data !== "object") return false;
      if (data.app !== "ConferenceTracker") return false;
      if (!data.storage || typeof data.storage !== "object") return false;
      return true;
    }

    function stringifyStorageValue(v) {
      if (v === null || v === undefined) return null;
      if (typeof v === "string") return v;
      try {
        return JSON.stringify(v);
      } catch (err) {
        return null;
      }
    }

    function exportStorageBackup() {
      setBackupStatus("");
      const storage = collectStorageSnapshot();
      const payload = {
        version: BACKUP_FORMAT_VERSION,
        exportedAt: new Date().toISOString(),
        app: "ConferenceTracker",
        storage
      };
      const text = JSON.stringify(payload, null, 2);
      const blob = new Blob([text], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      const stamp = new Date().toISOString().slice(0, 10);
      a.href = url;
      a.download = `conference-tracker-backup-${stamp}.json`;
      a.rel = "noopener";
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      setBackupStatus(`Backup downloaded (${Object.keys(storage).length} items).`);
    }

    function applyImportedStorage(data) {
      const incoming = data.storage;
      KNOWN_STORAGE_KEYS.forEach((k) => {
        if (Object.prototype.hasOwnProperty.call(incoming, k)) {
          const raw = incoming[k];
          if (raw === null || raw === undefined) {
            localStorage.removeItem(k);
          } else {
            const str = stringifyStorageValue(raw);
            if (str !== null) localStorage.setItem(k, str);
            else localStorage.removeItem(k);
          }
        } else {
          localStorage.removeItem(k);
        }
      });
    }

    async function importStorageFromFile(file) {
      setBackupStatus("");
      let text;
      try {
        text = await file.text();
      } catch (err) {
        console.warn(err);
        setBackupStatus("Could not read file.", true);
        return;
      }
      let data;
      try {
        data = JSON.parse(text);
      } catch (err) {
        setBackupStatus("Invalid JSON file.", true);
        return;
      }
      if (!validateBackupPayload(data)) {
        setBackupStatus("Invalid backup: expected app \"ConferenceTracker\" and a storage object.", true);
        return;
      }
      if (typeof data.version === "number" && data.version > BACKUP_FORMAT_VERSION) {
        setBackupStatus("This backup needs a newer version of the app.", true);
        return;
      }
      try {
        applyImportedStorage(data);
      } catch (err) {
        console.error(err);
        setBackupStatus("Could not apply backup.", true);
        return;
      }
      setBackupStatus("Backup restored. Reloading…");
      window.setTimeout(() => {
        window.location.reload();
      }, 400);
    }

    function applyTheme(theme, options) {
      const opts = options || {};
      const next = theme === "light" ? "light" : "dark";
      state.theme = next;
      document.documentElement.setAttribute("data-theme", next);
      const metaTheme = document.querySelector('meta[name="theme-color"]');
      if (metaTheme) metaTheme.setAttribute("content", next === "light" ? "#f4f7f5" : "#050707");
      if (el.themeToggle) {
        const isLight = next === "light";
        el.themeToggle.setAttribute("aria-pressed", isLight ? "true" : "false");
        el.themeToggle.setAttribute("aria-label", isLight ? "Switch to dark mode" : "Switch to light mode");
        const iconLight = el.themeToggle.querySelector(".theme-icon-light");
        const iconDark = el.themeToggle.querySelector(".theme-icon-dark");
        if (iconLight) iconLight.hidden = isLight;
        if (iconDark) iconDark.hidden = !isLight;
      }
      if (el.themeToggleText) {
        el.themeToggleText.textContent = next === "light" ? "Dark mode" : "Light mode";
      }
      if (!opts.skipSave) saveUiPrefs();
    }

    function toggleTheme() {
      applyTheme(state.theme === "light" ? "dark" : "light");
    }

    function saveUiPrefs() {
      const prefs = {
        activeTab: state.activeTab,
        mapSource: state.mapSource,
        theme: state.theme
      };
      localStorage.setItem(UI_PREFS_KEY, JSON.stringify(prefs));
    }

    function loadFilters() {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return;
        const parsed = JSON.parse(raw);
        state.filters = { ...state.filters, ...parsed };
        delete state.filters.acceptsCfv;
        delete state.filters.cfpMonth;
        delete state.filters.venuePattern;
        if (state.filters.sortBy === "month_name") state.filters.sortBy = "attendees_name";
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
        if (parsed?.theme === "light" || parsed?.theme === "dark") {
          state.theme = parsed.theme;
        }
      } catch (err) {
        console.warn("Could not parse saved UI prefs", err);
      }
      applyTheme(state.theme, { skipSave: true });
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
      if (el.favoritesFilter) el.favoritesFilter.value = state.filters.favoritesOnly;
      if (el.sortFilter) el.sortFilter.value = state.filters.sortBy || "attendees_name";
    }

    function filterOptionLabel(key, value) {
      if (key === "travel_accommodation_sponsorship" && toLower(value) === "unknown") return "Unset";
      if (
        (key === "accepts_cfp" ||
          key === "accepts_cft" ||
          key === "accepts_cfw" ||
          key === "accepts_cfv") &&
        value === "Yes"
      ) {
        return "Has deadline";
      }
      if (
        (key === "accepts_cfp" ||
          key === "accepts_cft" ||
          key === "accepts_cfw" ||
          key === "accepts_cfv") &&
        value === "No"
      ) {
        return "No deadline";
      }
      return value;
    }

    function fillOptions(selectEl, values, valueKey) {
      const current = selectEl.value;
      const options = ["", ...values];
      selectEl.innerHTML = options.map((v) => {
        const selected = v === current ? "selected" : "";
        const label = v ? filterOptionLabel(valueKey, v) : "All";
        return `<option value="${escapeHtml(v)}" ${selected}>${escapeHtml(label)}</option>`;
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
        submission_tracks: pickValue(rawRow, ["submission_tracks"]),
        travel_accommodation_sponsorship: pickValue(rawRow, ["travel_accommodation_sponsorship"]),
        cfp_deadline: pickValue(rawRow, ["cfp_deadline", "cfp_deadline_MM-DD"], "TBD"),
        cft_deadline: pickValue(rawRow, ["cft_deadline", "cft_deadline_MM-DD"], "TBD"),
        cfw_deadline: pickValue(rawRow, ["cfw_deadline", "cfw_deadline_MM-DD"], "TBD"),
        cfv_deadline: pickValue(rawRow, ["cfv_deadline", "cfv_deadline_MM-DD"], "TBD"),
        conference_start_date: pickValue(rawRow, ["conference_start_date"]),
        conference_end_date: pickValue(rawRow, ["conference_end_date"]),
        city: pickValue(rawRow, ["city"]),
        country: pickValue(rawRow, ["country"]),
        website_or_cfp_link: pickValue(rawRow, ["website_or_cfp_link"]),
        cft_link: pickValue(rawRow, ["cft_link"]),
        cfw_link: pickValue(rawRow, ["cfw_link"]),
        cfv_link: pickValue(rawRow, ["cfv_link"]),
        conference_type: pickValue(rawRow, ["conference_type"]),
        venue_pattern: pickValue(rawRow, ["venue_pattern"], "Unknown"),
        timezone: pickValue(rawRow, ["timezone"]),
        submission_status: pickValue(rawRow, ["submission_status"], "Unknown"),
        notes: pickValue(rawRow, ["notes"]),
        last_verified_date: pickValue(rawRow, ["last_verified_date"])
      };
    }

    const MONTH_NAMES = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December"
    ];

    function cfpDeadlineMonthFromDeadline(deadline) {
      const clean = normalize(deadline);
      if (!clean || clean.toUpperCase() === "TBD") return "TBD";
      const match = clean.match(/^(\d{2})-(\d{2})$/);
      if (!match) return "TBD";
      const monthNum = parseInt(match[1], 10);
      if (monthNum < 1 || monthNum > 12) return "TBD";
      return MONTH_NAMES[monthNum - 1];
    }

    function acceptsFromDeadline(deadline) {
      const d = normalize(deadline);
      if (!d || d.toUpperCase() === "TBD") return "No";
      return isValidMonthDay(d) ? "Yes" : "No";
    }

    function deriveAcceptsFromDeadlines(row) {
      row.accepts_cfp = acceptsFromDeadline(row.cfp_deadline);
      row.accepts_cft = acceptsFromDeadline(row.cft_deadline);
      row.accepts_cfw = acceptsFromDeadline(row.cfw_deadline);
      row.accepts_cfv = acceptsFromDeadline(row.cfv_deadline);
      row.cfp_deadline_month = cfpDeadlineMonthFromDeadline(row.cfp_deadline);
    }

    function submissionTracksIncludeToken(tracksValue, token) {
      const want = toLower(token);
      return normalize(tracksValue)
        .split("|")
        .map((t) => toLower(normalize(t)))
        .some((t) => t === want);
    }

    function comparableUrl(url) {
      const clean = normalize(url);
      if (!clean || !/^https?:\/\//i.test(clean)) return "";
      try {
        const u = new URL(clean);
        const host = u.hostname.toLowerCase().replace(/^www\./, "");
        const path = u.pathname.replace(/\/+$/, "") || "";
        return `${host}${path}`;
      } catch {
        return "";
      }
    }

    /** Drop mistaken per-type links (homepage in CfW without a workshop program, etc.). */
    function sanitizePerTypeSubmissionLinks(row) {
      const issues = [];
      const website = comparableUrl(row.website_or_cfp_link);

      if (normalize(row.cfw_link)) {
        const hasWorkshops = rowHasSubmissionTrack(row, "Workshops");
        const cfw = comparableUrl(row.cfw_link);
        if (!hasWorkshops) {
          issues.push("cleared cfw_link (no workshop program)");
          row.cfw_link = "";
        } else if (
          website &&
          cfw === website &&
          acceptsFromDeadline(row.cfw_deadline) !== "Yes"
        ) {
          issues.push("cleared cfw_link (duplicate of website_or_cfp_link)");
          row.cfw_link = "";
        }
      }

      if (normalize(row.cft_link)) {
        const hasTrainings = rowHasSubmissionTrack(row, "Trainings");
        const cft = comparableUrl(row.cft_link);
        if (!hasTrainings) {
          issues.push("cleared cft_link (no training program)");
          row.cft_link = "";
        } else if (
          website &&
          cft === website &&
          acceptsFromDeadline(row.cft_deadline) !== "Yes"
        ) {
          issues.push("cleared cft_link (duplicate of website_or_cfp_link)");
          row.cft_link = "";
        }
      }

      return issues;
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
          if (!isValidMonthDay(row.cfv_deadline)) {
            issues.push(`invalid cfv_deadline "${row.cfv_deadline}"`);
            row.cfv_deadline = "TBD";
          }

          deriveAcceptsFromDeadlines(row);

          const linkIssues = sanitizePerTypeSubmissionLinks(row);
          if (linkIssues.length) {
            issues.push(...linkIssues);
            deriveAcceptsFromDeadlines(row);
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

    function escapeAttr(value) {
      return escapeHtml(value).replace(/`/g, "&#96;");
    }

    /** Desktop-only instant hint (no native title tooltip delay). Touch uses visible labels + aria-label. */
    function tipDataAttr(text) {
      const clean = normalize(text);
      if (!clean) return "";
      return ` data-tip="${escapeAttr(clean)}"`;
    }

    function linkOrText(url, label) {
      const clean = normalize(url);
      if (!clean) return "";
      if (/^https?:\/\//i.test(clean)) {
        const text = normalize(label) || "↗";
        return `<a href="${escapeHtml(clean)}" target="_blank" rel="noopener noreferrer">${escapeHtml(text)}</a>`;
      }
      return escapeHtml(clean);
    }

    function ellipsisCell(value) {
      const clean = normalize(value);
      if (!clean) return "";
      return `<span class="cell-ellipsis"${tipDataAttr(clean)}>${escapeHtml(clean)}</span>`;
    }

    const DEADLINE_IMPLIED_TRACKS = {
      cfp_deadline: "Talks",
      cft_deadline: "Trainings",
      cfw_deadline: "Workshops"
    };

    function parseSubmissionTrackList(tracksValue) {
      return normalize(tracksValue)
        .split("|")
        .map((t) => normalize(t))
        .filter(Boolean);
    }

    /** Talks / Trainings / Workshops implied by deadline MM-DD or matching link (not shown as name badges). */
    function tracksImpliedByRow(row) {
      const implied = new Set();
      Object.entries(DEADLINE_IMPLIED_TRACKS).forEach(([deadlineKey, trackName]) => {
        if (acceptsFromDeadline(row[deadlineKey]) === "Yes") implied.add(trackName);
      });
      if (normalize(row.cft_link)) implied.add("Trainings");
      if (normalize(row.cfw_link)) implied.add("Workshops");
      return implied;
    }

    function rowHasSubmissionTrack(row, token) {
      if (submissionTracksIncludeToken(row.submission_tracks, token)) return true;
      return tracksImpliedByRow(row).has(token);
    }

    function allSubmissionTracksForDisplay(row) {
      const implied = tracksImpliedByRow(row);
      const listed = parseSubmissionTrackList(row.submission_tracks);
      const out = [];
      const seen = new Set();
      [...implied, ...listed].forEach((t) => {
        if (!seen.has(t)) {
          seen.add(t);
          out.push(t);
        }
      });
      return out;
    }

    function extraSubmissionTracks(row) {
      const listed = parseSubmissionTrackList(row.submission_tracks);
      const implied = tracksImpliedByRow(row);
      return listed.filter((t) => !implied.has(t));
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
        return `<span class="track-badge"${tipDataAttr(title)}>${escapeHtml(label)}</span>`;
      }).join("")}</span>`;
    }

    function renderExtraTrackBadges(row) {
      const extra = extraSubmissionTracks(row);
      if (extra.length === 0) return "";
      return renderTrackBadges(extra.join("|"));
    }

    function renderAcceptanceLevelCell(value) {
      const raw = normalize(value);
      const v = toLower(raw);
      if (v === "industry") {
        return `<span class="acceptance-emoji" aria-label="Industry">👷</span>`;
      }
      if (v === "academic") {
        return `<span class="acceptance-emoji" aria-label="Academic">🧑‍🎓</span>`;
      }
      if (v === "mixed") {
        return `<span class="acceptance-emoji" aria-label="Mixed industry and academic">👷🧑‍🎓</span>`;
      }
      return escapeHtml(raw || "—");
    }

    const COUNTRY_REGION = {
      europe: new Set([
        "United Kingdom",
        "Germany",
        "France",
        "Netherlands",
        "Belgium",
        "Switzerland",
        "Austria",
        "Italy",
        "Spain",
        "Portugal",
        "Norway",
        "Denmark",
        "Poland",
        "Romania",
        "Luxembourg",
        "Lithuania",
        "Greece"
      ]),
      americas: new Set(["United States", "Canada", "Brazil", "Argentina", "Mexico", "Chile"]),
      apac: new Set(["Japan", "Singapore", "India", "Australia", "Indonesia", "Nepal", "Taiwan"]),
      mea: new Set(["Israel", "United Arab Emirates", "Saudi Arabia", "Bahrain", "Qatar"]),
      africa: new Set(["South Africa", "Kenya"])
    };

    const countryToIso2 = {
      Argentina: "AR",
      Australia: "AU",
      Austria: "AT",
      Bahrain: "BH",
      Belgium: "BE",
      Brazil: "BR",
      Canada: "CA",
      Chile: "CL",
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
      Taiwan: "TW",
      "United Arab Emirates": "AE",
      "United Kingdom": "GB",
      "United States": "US"
    };

    function iso2ToFlagEmoji(iso2) {
      return iso2
        .toUpperCase()
        .replace(/./g, (char) => String.fromCodePoint(127397 + char.charCodeAt(0)));
    }

    function isGlobalCountry(country) {
      const c = toLower(country);
      return c === "global" || c === "worldwide" || c === "international";
    }

    function globalCountryFlagSvg() {
      return `<svg class="country-flag-svg" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2Zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.22.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93Zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39Z"/></svg>`;
    }

    function renderCountryFlag(countryValue) {
      const country = normalize(countryValue);
      if (!country || country === "TBD" || country === "Various") return "—";
      if (isGlobalCountry(country)) {
        return `<span class="country-flag country-flag-global"${tipDataAttr(country)} aria-label="${escapeHtml(country)}">${globalCountryFlagSvg()}</span>`;
      }
      const iso2 = countryToIso2[country];
      if (!iso2) {
        return `<span class="country-flag country-flag-text"${tipDataAttr(country)} aria-label="${escapeHtml(country)}">${escapeHtml(country)}</span>`;
      }
      return `<span class="country-flag"${tipDataAttr(country)} aria-label="${escapeHtml(country)}">${iso2ToFlagEmoji(iso2)}</span>`;
    }

    function renderFavoriteCell(row) {
      const name = normalize(row.conference_name);
      const enc = encodeURIComponent(name);
      const on = isFavorite(name);
      const label = on ? "Remove from favorites" : "Add to favorites";
      const star = on ? "★" : "☆";
      return `<button type="button" class="fav-btn" data-action="fav-toggle" data-cname="${enc}"${tipDataAttr(label)} aria-label="${escapeHtml(label)}" aria-pressed="${on ? "true" : "false"}">${star}</button>`;
    }

    function renderNameCell(row) {
      const name = normalize(row.conference_name);
      const enc = encodeURIComponent(name);
      const display = escapeHtml(name);
      const extraTracks = !isAttendeeMode() ? renderExtraTrackBadges(row) : "";
      const extras = extraTracks ? `<div class="name-extra-tracks">${extraTracks}</div>` : "";
      return `<div class="name-cell-wrap">
        <div class="conf-card-head">
          <button type="button" class="name-detail-btn" data-action="open-detail" data-cname="${enc}" aria-label="Open details for ${escapeHtml(name)}" title="${display}"><span class="cell-ellipsis name-ellipsis">${display}</span></button>
          <div class="conf-card-fav">${renderFavoriteCell(row)}</div>
        </div>${extras}</div>`;
    }

    function cfpDeadlineWithinDays(row, maxDays) {
      if (acceptsFromDeadline(row.cfp_deadline) !== "Yes") return false;
      const days = daysUntilDeadlineForRow(row, "cfp_deadline", { rollForwardIfPast: false });
      return days !== null && days >= 0 && days <= maxDays;
    }

    function renderSummary(filteredRows, allRows) {
      const total = allRows.length;
      const shown = filteredRows.length;
      const favCount = allRows.filter((r) => isFavorite(r.conference_name)).length;
      const largeEvents = filteredRows.filter((r) => toLower(r.attendees_500_plus) === "yes").length;
      const hasCfpDeadline = filteredRows.filter(
        (r) => acceptsFromDeadline(r.cfp_deadline) === "Yes"
      ).length;
      const actionableCfp = filteredRows.filter(isActionableCfp).length;
      const hasCftOrCfwDeadline = filteredRows.filter((r) => {
        return (
          acceptsFromDeadline(r.cft_deadline) === "Yes" ||
          acceptsFromDeadline(r.cfw_deadline) === "Yes"
        );
      }).length;
      const travelSupport = filteredRows.filter(
        (r) => normalize(r.travel_accommodation_sponsorship) === "Yes"
      ).length;
      const academic = filteredRows.filter((r) => toLower(r.academic_acceptance_level) === "academic").length;
      const industryMixed = filteredRows.filter((r) => {
        const lvl = normalize(r.academic_acceptance_level);
        return lvl === "Industry" || lvl === "Mixed";
      }).length;
      const dueSoon = filteredRows.filter((r) => {
        const info = getNextDeadlineInfo(r);
        return info && info.daysUntil >= 0 && info.daysUntil <= 30;
      }).length;
      const due14 = filteredRows.filter((r) => cfpDeadlineWithinDays(r, 14)).length;

      let cards;
      if (state.personaMode === "speaker") {
        cards = [
          { label: "Open CfPs", value: `${actionableCfp}`, action: "actionable_cfp", hint: "CfP open, deadline still ahead" },
          { label: "≤14d", value: `${due14}`, action: "due_14", hint: "CfP due within 14 days" },
          { label: "Travel", value: `${travelSupport}`, action: "travel_support", hint: "Travel or hotel support" },
          { label: "CfP date", value: `${hasCfpDeadline}`, action: "open_cfp", hint: "Published CfP deadline (MM-DD), any year" },
          { label: "Industry", value: `${industryMixed}`, action: "industry_talks", hint: "Industry or mixed audience" },
          { label: "≤30d", value: `${dueSoon}`, action: "due_30", hint: "Any deadline within 30 days" },
          { label: "Shown", value: `${shown} / ${total}`, action: "clear", hint: "Clear filters" },
          { label: "★", value: `${favCount}`, action: "favorites_only", hint: "Show favorites only" }
        ];
      } else {
        cards = [
          { label: "Shown", value: `${shown} / ${total}`, action: "clear", hint: "Clear filters" },
          { label: "★", value: `${favCount}`, action: "favorites_only", hint: "Show favorites only" },
          { label: "500+", value: `${largeEvents}`, action: "attendees_500", hint: "500+ attendees" }
        ];
      }

      el.summaryCards.innerHTML = cards.map((c) => {
        const aria = `${c.label}: ${c.value}. ${c.hint || "Apply filter"}`;
        const hintHtml = c.hint ? `<div class="hint">${escapeHtml(c.hint)}</div>` : "";
        return `
        <button class="metric-btn" type="button" data-stat-action="${c.action}" aria-label="${escapeHtml(aria)}">
          <div class="label">${c.label}</div>
          <div class="value">${c.value}</div>
          ${hintHtml}
        </button>
      `;
      }).join("");
    }

    function renderTable(rows) {
      if (rows.length === 0) {
        el.dataTbody.innerHTML = "";
        el.emptyState.hidden = false;
        const favOnly = toLower(state.filters.favoritesOnly) === "yes";
        const noStars = state.favorites.length === 0;
        el.emptyState.textContent =
          favOnly && noStars
            ? "No favorites yet. Star conferences in the table, then filter to starred only."
            : "No conferences match the current filters. Try Reset filters or fewer criteria.";
        return;
      }
      el.emptyState.hidden = true;

      const MOBILE_FIELD_LABELS = {
        Academic: "Acad",
        Sponsorship: "Sponsor",
        "Next Deadline": "Next Due"
      };

      function td(label, value, className) {
        const parts = (className || "").split(/\s+/).filter(Boolean);
        if (label === "Name") parts.push("m-head");
        else if (label === "Favorite") parts.push("m-fav");
        else if (label === "Actions") parts.push("m-actions");
        else if (label === "Next Deadline" || label === "Site") parts.push("m-foot");
        else parts.push("m-field");
        const isDeadlineCol = label === "CfP" || label === "CfT" || label === "CfW";
        const empty = !String(value == null ? "" : value).trim();
        if (isDeadlineCol && empty) parts.push("deadline-cell-empty");
        const cls = parts.length ? ` class="${escapeHtml(parts.join(" "))}"` : "";
        const content = value == null ? "" : value;
        const displayLabel = MOBILE_FIELD_LABELS[label] || label;
        const inner =
          parts.includes("m-field") || parts.includes("m-foot")
            ? `<span class="m-field-value">${content}</span>`
            : content;
        return `<td data-label="${escapeHtml(displayLabel)}"${cls}>${inner}</td>`;
      }

      const attendee = isAttendeeMode();
      el.dataTbody.innerHTML = rows
        .map((r) => {
          const cells = [
            td("Name", renderNameCell(r), "name-col m-head"),
            td("Favorite", renderFavoriteCell(r), "fav-col fav-col-desktop"),
            td("500+?", escapeHtml(normalize(r.attendees_500_plus)))
          ];
          if (!attendee) {
            cells.push(
              td("Academic", renderAcceptanceLevelCell(r.academic_acceptance_level), "acceptance-col"),
              td("Sponsorship", sponsorshipPill(r.travel_accommodation_sponsorship)),
              td("CfP", renderDeadlineCell(r, "cfp_deadline", r.website_or_cfp_link, "CfP")),
              td("CfT", renderDeadlineCell(r, "cft_deadline", r.cft_link, "CfT")),
              td("CfW", renderDeadlineCell(r, "cfw_deadline", r.cfw_link, "CfW"))
            );
          }
          cells.push(
            td("Start", renderConferenceDateCell(r, "start")),
            td("End", renderConferenceDateCell(r, "end")),
            td("City", escapeHtml(normalize(r.city))),
            td("Country", renderCountryFlag(r.country), "country-col")
          );
          if (attendee) {
            cells.push(td("Site", linkOrText(r.website_or_cfp_link, "Site"), "attendee-only-col"));
          } else {
            cells.push(td("Next Deadline", renderNextDeadline(r)));
          }
          cells.push(td("Actions", renderRowActions(r), "table-action-cell"));
          return `<tr class="conf-row">${cells.join("")}</tr>`;
        })
        .join("");
    }

    function parseMonthDay(monthDay) {
      const clean = normalize(monthDay);
      if (!/^\d{2}-\d{2}$/.test(clean)) return null;
      const [m, d] = clean.split("-").map((x) => Number(x));
      if (m < 1 || m > 12 || d < 1 || d > 31) return null;
      return { month: m, day: d };
    }

    function startOfToday() {
      const now = new Date();
      return new Date(now.getFullYear(), now.getMonth(), now.getDate());
    }

    function conferenceStartDate(row) {
      const clean = normalize(row.conference_start_date);
      if (!clean || clean.toUpperCase() === "TBD") return null;
      const t = Date.parse(clean);
      return Number.isNaN(t) ? null : new Date(t);
    }

    function conferenceEndDate(row) {
      const clean = normalize(row.conference_end_date);
      if (!clean || clean.toUpperCase() === "TBD") return null;
      const t = Date.parse(clean);
      return Number.isNaN(t) ? null : new Date(t);
    }

    function formatIsoDateLocal(d) {
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      return `${y}-${m}-${day}`;
    }

    /** Calendar year of the next future occurrence of the stored edition month-day. */
    function referenceYearForRow(row) {
      const start = conferenceStartDate(row);
      const today = startOfToday();
      if (!start) return today.getFullYear();
      let y = today.getFullYear();
      let candidate = new Date(y, start.getMonth(), start.getDate());
      if (candidate < today) {
        candidate = new Date(y + 1, start.getMonth(), start.getDate());
      }
      return candidate.getFullYear();
    }

    function effectiveConferenceStartDate(row) {
      const start = conferenceStartDate(row);
      if (!start) return null;
      const y = referenceYearForRow(row);
      return new Date(y, start.getMonth(), start.getDate());
    }

    function effectiveConferenceEndDate(row) {
      const start = conferenceStartDate(row);
      const end = conferenceEndDate(row) || start;
      if (!start || !end) return null;
      const yStart = referenceYearForRow(row);
      let yEnd = yStart + (end.getFullYear() - start.getFullYear());
      if (yEnd === yStart) {
        const startOrd = monthDayOrdinal({ month: start.getMonth() + 1, day: start.getDate() });
        const endOrd = monthDayOrdinal({ month: end.getMonth() + 1, day: end.getDate() });
        if (endOrd < startOrd) yEnd = yStart + 1;
      }
      return new Date(yEnd, end.getMonth(), end.getDate());
    }

    function isProjectedEditionDates(row) {
      const start = conferenceStartDate(row);
      if (!start) return false;
      return referenceYearForRow(row) !== start.getFullYear();
    }

    function formatDisplayConferenceDate(row, which) {
      const eff = which === "start" ? effectiveConferenceStartDate(row) : effectiveConferenceEndDate(row);
      if (!eff) {
        return normalize(which === "start" ? row.conference_start_date : row.conference_end_date) || "TBD";
      }
      return formatIsoDateLocal(eff);
    }

    function renderConferenceDateCell(row, which) {
      const display = formatDisplayConferenceDate(row, which);
      if (!display || display.toUpperCase() === "TBD") {
        return escapeHtml(display || "TBD");
      }
      const title = isProjectedEditionDates(row)
        ? "Next occurrence estimated from last known edition; CSV dates unchanged"
        : "";
      const cls = isProjectedEditionDates(row) ? " conference-date-est" : "";
      return `<span class="conference-date${cls}"${title ? tipDataAttr(title) : ""}>${escapeHtml(display)}</span>`;
    }

    function monthDayOrdinal(parsed) {
      return parsed.month * 100 + parsed.day;
    }

    function resolveDeadlineDate(row, deadlineKey, options) {
      const monthDay = normalize(row[deadlineKey]);
      if (!monthDay || monthDay.toUpperCase() === "TBD") return null;
      const parsed = parseMonthDay(monthDay);
      if (!parsed) return null;

      const conf = effectiveConferenceStartDate(row);
      if (!conf) {
        const today = startOfToday();
        let deadlineDate = new Date(today.getFullYear(), parsed.month - 1, parsed.day);
        if (options?.rollForwardIfPast !== false) {
          const msPerDay = 24 * 60 * 60 * 1000;
          const days = Math.round((deadlineDate - today) / msPerDay);
          if (days < -60) {
            deadlineDate = new Date(today.getFullYear() + 1, parsed.month - 1, parsed.day);
          }
        }
        return deadlineDate;
      }

      const today = startOfToday();
      const msPerDay = 24 * 60 * 60 * 1000;
      const dlOrd = monthDayOrdinal(parsed);
      const confOrd = monthDayOrdinal({
        month: conf.getMonth() + 1,
        day: conf.getDate()
      });

      let deadlineYear = conf.getFullYear();
      if (dlOrd > confOrd) deadlineYear -= 1;
      let deadlineDate = new Date(deadlineYear, parsed.month - 1, parsed.day);

      if (options?.rollForwardIfPast !== false) {
        let days = Math.round((deadlineDate - today) / msPerDay);
        if (days < -60) {
          const confEnd = effectiveConferenceEndDate(row);
          const editionOver = confEnd && confEnd < today;
          if (editionOver) {
            deadlineDate = new Date(deadlineYear + 1, parsed.month - 1, parsed.day);
          }
        }
      }

      return deadlineDate;
    }

    function daysUntilDeadlineForRow(row, deadlineKey, options) {
      const deadlineDate = resolveDeadlineDate(row, deadlineKey, options);
      if (!deadlineDate) return null;
      const today = startOfToday();
      const msPerDay = 24 * 60 * 60 * 1000;
      return Math.round((deadlineDate - today) / msPerDay);
    }

    function isActionableCfp(row) {
      if (acceptsFromDeadline(row.cfp_deadline) !== "Yes") return false;
      const dl = normalize(row.cfp_deadline);
      if (!dl || dl.toUpperCase() === "TBD") return false;
      const days = daysUntilDeadlineForRow(row, "cfp_deadline", { rollForwardIfPast: false });
      return days !== null && days >= 0;
    }

    function countryMatchesRegion(country, region) {
      if (!region) return true;
      const c = normalize(country);
      if (!c || c === "TBD" || c === "Global" || c === "Virtual") return false;
      const set = COUNTRY_REGION[region];
      return set ? set.has(c) : true;
    }

    const DEADLINE_TYPE_CANDIDATES = [
      { key: "cfp_deadline", label: "CfP" },
      { key: "cft_deadline", label: "CfT" },
      { key: "cfw_deadline", label: "CfW" },
      { key: "cfv_deadline", label: "CfV" }
    ];

    function resolveDeadlineDateAnnualEstimate(row, deadlineKey) {
      let date = resolveDeadlineDate(row, deadlineKey, { rollForwardIfPast: false });
      if (!date) return null;
      const today = startOfToday();
      const msPerDay = 24 * 60 * 60 * 1000;
      for (let bump = 0; bump < 4; bump += 1) {
        const daysUntil = Math.round((date - today) / msPerDay);
        if (daysUntil >= 0) return date;
        date = new Date(date.getFullYear() + 1, date.getMonth(), date.getDate());
      }
      return null;
    }

    function gatherResolvedDeadlines(row, options = {}) {
      const useAnnualEstimate = options.annualEstimate === true;
      const rollForwardIfPast = options.rollForwardIfPast === true;
      const today = startOfToday();
      const msPerDay = 24 * 60 * 60 * 1000;
      const resolved = [];
      DEADLINE_TYPE_CANDIDATES.forEach((c) => {
        const monthDay = normalize(row[c.key]);
        if (!monthDay || monthDay.toUpperCase() === "TBD") return;
        const deadlineDate = useAnnualEstimate
          ? resolveDeadlineDateAnnualEstimate(row, c.key)
          : resolveDeadlineDate(row, c.key, { rollForwardIfPast });
        if (!deadlineDate) return;
        const daysUntil = Math.round((deadlineDate - today) / msPerDay);
        resolved.push({ label: c.label, monthDay, daysUntil, deadlineDate });
      });
      return resolved;
    }

    function daysSinceConferenceEnd(row) {
      const end = effectiveConferenceEndDate(row);
      if (!end) return null;
      const today = startOfToday();
      const msPerDay = 24 * 60 * 60 * 1000;
      return Math.round((today - end) / msPerDay);
    }

    /** Safe to roll MM-DD forward for Next Due when edition recurs or is still on the horizon. */
    function eligibleForDeadlineProjection(row) {
      const today = startOfToday();
      const effEnd = effectiveConferenceEndDate(row);
      if (effEnd && effEnd >= today) return true;
      const effStart = effectiveConferenceStartDate(row);
      if (effStart && effStart >= today) return true;
      const vp = normalize(row.venue_pattern);
      if (vp === "Fixed" || vp === "Mostly Fixed" || vp === "Rotating") return true;
      const sinceEnd = daysSinceConferenceEnd(row);
      if (sinceEnd === null) return true;
      return sinceEnd <= 365;
    }

    function getEventTimingEstimate(row) {
      const effStart = effectiveConferenceStartDate(row);
      if (!effStart) return null;
      const today = startOfToday();
      const msPerDay = 24 * 60 * 60 * 1000;
      const monthDay = `${String(effStart.getMonth() + 1).padStart(2, "0")}-${String(effStart.getDate()).padStart(2, "0")}`;
      const daysUntil = Math.round((effStart - today) / msPerDay);
      return {
        label: "Event",
        monthDay,
        daysUntil,
        deadlineDate: effStart,
        isPast: false,
        isProjected: true,
        isEventTiming: true
      };
    }

    function pickSoonestUpcoming(resolved) {
      const upcoming = resolved.filter((r) => r.daysUntil >= 0);
      if (!upcoming.length) return null;
      return upcoming.reduce((a, b) => (a.daysUntil < b.daysUntil ? a : b));
    }

    /** Upcoming only by default; display may project next annual cycle or fall back to past. */
    function getNextDeadlineInfo(row, options = {}) {
      const includePastFallback = options.includePastFallback === true;
      const includeProjectedRecurring = options.includeProjectedRecurring === true;

      const resolved = gatherResolvedDeadlines(row, { rollForwardIfPast: false });
      if (!resolved.length) return null;

      let best = pickSoonestUpcoming(resolved);
      if (best) return { ...best, isPast: false, isProjected: false };

      if (includeProjectedRecurring && eligibleForDeadlineProjection(row)) {
        const projected = gatherResolvedDeadlines(row, { annualEstimate: true });
        best = pickSoonestUpcoming(projected);
        if (best) return { ...best, isPast: false, isProjected: true };
      }

      if (!includePastFallback) return null;

      const bestPast = resolved.reduce((a, b) => (a.daysUntil > b.daysUntil ? a : b));
      return { ...bestPast, isPast: true, isProjected: false };
    }

    function formatNextDeadlineText(info) {
      if (!info) return "";
      if (info.isPast) return `${info.label} ${info.monthDay} (past)`;
      if (info.isProjected) return `${info.label} ${info.monthDay} (est. · ${info.daysUntil}d)`;
      return `${info.label} ${info.monthDay} (${info.daysUntil}d)`;
    }

    function renderNextDeadline(row) {
      const hasAnyDeadline = ["cfp_deadline", "cft_deadline", "cfw_deadline", "cfv_deadline"].some((key) => {
        return acceptsFromDeadline(row[key]) === "Yes";
      });
      if (!hasAnyDeadline) {
        const eventEst = getEventTimingEstimate(row);
        if (eventEst) {
          return `<span class="pill pill-deadline-est">${escapeHtml(formatNextDeadlineText(eventEst))}</span>`;
        }
        return `<span class="pill pill-na">N/A</span>`;
      }
      const info = getNextDeadlineInfo(row, {
        includePastFallback: true,
        includeProjectedRecurring: true
      });
      if (!info) return `<span class="pill pill-unknown">TBD</span>`;
      const cls = info.isPast
        ? "pill-deadline-past"
        : info.isProjected
          ? "pill-deadline-est"
          : info.daysUntil <= 30
            ? "pill-deadline-soon"
            : "pill-deadline-upcoming";
      return `<span class="pill ${cls}">${escapeHtml(formatNextDeadlineText(info))}</span>`;
    }

    function submissionPortalIndicator(url) {
      const clean = normalize(url);
      let host = "";
      try {
        if (clean && /^https?:\/\//i.test(clean)) host = new URL(clean).hostname.toLowerCase();
      } catch {
        host = "";
      }
      if (host.includes("sessionize.com")) {
        return { glyph: "📅", platform: "Sessionize" };
      }
      if (host.includes("papercall.io")) {
        return { glyph: "📣", platform: "PaperCall" };
      }
      if (host.includes("pretalx.com") || host.includes("pretalx.")) {
        return { glyph: "📋", platform: "Pretalx" };
      }
      if (host.includes("glueup.com")) {
        return { glyph: "🔗", platform: "Glue Up" };
      }
      if (host.includes("awardsplatform.com")) {
        return { glyph: "🏆", platform: "Awards platform" };
      }
      if (host.includes("blackhat.com")) {
        return { glyph: "🎩", platform: "Black Hat" };
      }
      if (host.includes("submittable.com")) {
        return { glyph: "📨", platform: "Submittable" };
      }
      if (host.includes("easychair.org")) {
        return { glyph: "🪑", platform: "EasyChair" };
      }
      return { glyph: "🔗", platform: "Submission portal" };
    }

    function renderDeadlinePortalMarkup(url, linkKind) {
      const { glyph, platform } = submissionPortalIndicator(url);
      const title = `${platform} — ${linkKind} open, deadline not published`;
      return `<span class="deadline-chip" title="${escapeAttr(title)}"><span class="deadline-portal" aria-hidden="true">${glyph}</span><span class="deadline-portal-label">${escapeHtml(platform)}</span></span>`;
    }

    function wrapDeadlineLink(url, innerHtml, ariaLabel) {
      const clean = normalize(url);
      if (!clean || !/^https?:\/\//i.test(clean)) return innerHtml;
      return `<a class="deadline-link" href="${escapeHtml(clean)}" target="_blank" rel="noopener noreferrer" aria-label="${escapeAttr(ariaLabel)}">${innerHtml}</a>`;
    }

    function renderDeadlineCell(row, deadlineKey, linkUrl, linkKind) {
      const deadline = normalize(row[deadlineKey]);
      const url = normalize(linkUrl);
      const hasDate = Boolean(deadline) && deadline.toUpperCase() !== "TBD";

      if (!hasDate) {
        if (url) {
          const { platform } = submissionPortalIndicator(url);
          const portal = wrapDeadlineLink(
            url,
            renderDeadlinePortalMarkup(url, linkKind),
            `${linkKind} on ${platform} (deadline not published)`
          );
          return portal;
        }
        return "";
      }

      const days = daysUntilDeadlineForRow(row, deadlineKey, { rollForwardIfPast: true });
      let cls = "deadline-mmdd";
      if (days !== null) {
        if (days < 0) cls = "deadline-mmdd deadline-past";
        else if (days <= 30) cls = "deadline-mmdd deadline-soon";
      }
      const dateTitle = "Annual submission deadline (MM-DD); open vs closed is based on days until due";
      const inner = `<span class="${cls}" title="${dateTitle}">${escapeHtml(deadline)}</span>`;
      const aria = url ? `${linkKind} deadline ${deadline}, opens submission page` : dateTitle;
      return wrapDeadlineLink(url, inner, aria);
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
        return `<span class="pill pill-yes">Yes</span>`;
      }
      if (v === "no") {
        return `<span class="pill pill-no">No</span>`;
      }
      if (v === "partial") {
        return `<span class="pill pill-gray">Partial</span>`;
      }
      if (!raw || v === "unknown" || v === "tbd" || v === "n/a") {
        return `<span class="sponsor-unset" title="Travel/accommodation sponsorship not verified">—</span>`;
      }
      return `<span class="pill pill-gray">${escapeHtml(raw)}</span>`;
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
        uae: "United Arab Emirates",
        "chinese taipei": "Taiwan",
        worldwide: "Global",
        international: "Global"
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
      el.mapMeta.textContent = `Loading ${points.length}…`;

      mapLayer.clearLayers();

      let mapped = 0;
      let unresolved = 0;
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

      const parts = [`${mapped} on map`];
      if (unresolved) parts.push(`${unresolved} unknown`);
      el.mapMeta.textContent = parts.join(" · ");
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
        acceptsCfp: "CfP deadline",
        acceptsCft: "CfT deadline",
        acceptsCfw: "CfW deadline",
        cftOrCfw: "CfT or CfW",
        academicLevel: "Academic",
        sponsorship: "Sponsorship",
        conferenceType: "Type",
        deadlineWindow: "Deadline",
        favoritesOnly: "Favorites",
        region: "Region",
        actionableCfp: "Actionable CfP",
        industryTalks: "Industry talks",
        inPipeline: "Pipeline"
      };
      const activeEntries = Object.entries(state.filters)
        .filter(([k, v]) => k !== "sortBy" && Boolean(v));
      if (activeEntries.length === 0) {
        el.activeFilterChips.innerHTML = "";
        return;
      }
      el.activeFilterChips.innerHTML = activeEntries.map(([key, value]) => {
        const displayValue =
          key === "cftOrCfw" && toLower(value) === "yes"
            ? "either CfT or CfW"
            : key === "favoritesOnly" && toLower(value) === "yes"
              ? "only"
              : key === "actionableCfp" && toLower(value) === "yes"
                ? "open deadlines"
                : key === "acceptsCfp" || key === "acceptsCft" || key === "acceptsCfw"
                ? filterOptionLabel(
                    key === "acceptsCfp"
                      ? "accepts_cfp"
                      : key === "acceptsCft"
                        ? "accepts_cft"
                        : "accepts_cfw",
                    value
                  )
                : key === "sponsorship" && toLower(value) === "unknown"
                  ? "Unset"
                : key === "industryTalks" && toLower(value) === "yes"
                  ? "Industry + Mixed"
                  : key === "inPipeline" && toLower(value) === "yes"
                    ? "mine only"
                    : value;
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
        const diff =
          isoDateOrder(formatDisplayConferenceDate(a, key === "conference_start_date" ? "start" : "end")) -
          isoDateOrder(formatDisplayConferenceDate(b, key === "conference_start_date" ? "start" : "end"));
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
      } else if (sortBy === "start_soon") {
        sorted.sort((a, b) => {
          const dateCmp =
            isoDateOrder(formatDisplayConferenceDate(a, "start")) - isoDateOrder(formatDisplayConferenceDate(b, "start"));
          if (dateCmp !== 0) return dateCmp;
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
      if (s.acceptsCfp && acceptsFromDeadline(row.cfp_deadline) !== s.acceptsCfp) return false;
      if (toLower(s.cftOrCfw) === "yes") {
        const cftYes = acceptsFromDeadline(row.cft_deadline) === "Yes";
        const cfwYes = acceptsFromDeadline(row.cfw_deadline) === "Yes";
        if (!cftYes && !cfwYes) return false;
      } else {
        if (s.acceptsCft && acceptsFromDeadline(row.cft_deadline) !== s.acceptsCft) return false;
        if (s.acceptsCfw && acceptsFromDeadline(row.cfw_deadline) !== s.acceptsCfw) return false;
      }
      if (s.academicLevel && normalize(row.academic_acceptance_level) !== s.academicLevel) return false;
      if (s.sponsorship && normalize(row.travel_accommodation_sponsorship) !== s.sponsorship) return false;
      if (s.conferenceType && normalize(row.conference_type) !== s.conferenceType) return false;
      if (s.deadlineWindow) {
        const limit = Number(s.deadlineWindow);
        if (!Number.isNaN(limit)) {
          let days = null;
          if (acceptsFromDeadline(row.cfp_deadline) === "Yes") {
            days = daysUntilDeadlineForRow(row, "cfp_deadline", { rollForwardIfPast: false });
          }
          if (days === null) {
            const info = getNextDeadlineInfo(row, {
              includePastFallback: true,
              includeProjectedRecurring: true
            });
            days = info ? info.daysUntil : null;
            if (days === null) {
              const ev = getEventTimingEstimate(row);
              days = ev ? ev.daysUntil : null;
            }
          }
          if (days === null || days < 0 || days > limit) return false;
        }
      }
      if (toLower(s.actionableCfp) === "yes" && !isActionableCfp(row)) return false;
      if (s.region && !countryMatchesRegion(row.country, s.region)) return false;
      if (toLower(s.industryTalks) === "yes") {
        const lvl = normalize(row.academic_acceptance_level);
        if (lvl !== "Industry" && lvl !== "Mixed") return false;
      }
      if (toLower(s.inPipeline) === "yes" && !isInPipeline(row.conference_name)) return false;
      if (toLower(s.favoritesOnly) === "yes" && !isFavorite(row.conference_name)) return false;
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
      state.filters.favoritesOnly = normalize(el.favoritesFilter?.value);
      state.filters.sortBy = normalize(el.sortFilter.value) || "attendees_name";
      if (state.filters.acceptsCft || state.filters.acceptsCfw) {
        state.filters.cftOrCfw = "";
      }
    }

    function updateFilterMeta() {
      if (!el.activeFilterMeta) return;
      const active = getActiveFilterCount();
      if (active === 0) {
        el.activeFilterMeta.hidden = false;
        el.activeFilterMeta.textContent = "No filters active";
        return;
      }
      el.activeFilterMeta.textContent = "";
      el.activeFilterMeta.hidden = true;
    }

    function applySpeakerPreset(preset) {
      state.filters = speakerPresetFilters();
      state.headerSort = { key: "", direction: "asc" };
      if (preset === "due_14") state.filters.deadlineWindow = "14";
      if (preset === "travel") state.filters.sponsorship = "Yes";
      if (preset === "industry") state.filters.industryTalks = "yes";
      if (preset === "pipeline") {
        state.filters = { ...defaultFilters(), inPipeline: "yes", sortBy: "deadline_soon" };
      }
      if (preset === "region_europe") state.filters.region = "europe";
      if (preset === "region_americas") state.filters.region = "americas";
      if (preset === "region_apac") state.filters.region = "apac";
      applyFilterValuesToInputs();
      rerender();
    }

    function isSpeakerPresetActive(preset, f) {
      if (preset === "discover") {
        return (
          toLower(f.actionableCfp) === "yes" &&
          f.acceptsCfp === "Yes" &&
          !f.region &&
          !f.deadlineWindow &&
          !f.sponsorship &&
          !toLower(f.industryTalks) &&
          !toLower(f.inPipeline)
        );
      }
      if (preset === "due_14") {
        return (
          toLower(f.actionableCfp) === "yes" &&
          f.acceptsCfp === "Yes" &&
          f.deadlineWindow === "14" &&
          !f.region &&
          !f.sponsorship &&
          !toLower(f.industryTalks) &&
          !toLower(f.inPipeline)
        );
      }
      if (preset === "travel") {
        return (
          f.sponsorship === "Yes" &&
          toLower(f.actionableCfp) === "yes" &&
          f.acceptsCfp === "Yes" &&
          !f.region &&
          !f.deadlineWindow &&
          !toLower(f.industryTalks)
        );
      }
      if (preset === "industry") {
        return toLower(f.industryTalks) === "yes" && f.sortBy === "deadline_soon" && !toLower(f.actionableCfp);
      }
      if (preset === "pipeline") {
        return toLower(f.inPipeline) === "yes" && !toLower(f.actionableCfp);
      }
      if (preset === "region_europe") return f.region === "europe";
      if (preset === "region_americas") return f.region === "americas";
      if (preset === "region_apac") return f.region === "apac";
      return false;
    }

    function renderSpeakerPresetActiveState() {
      if (!el.discoverQuickActions) return;
      const f = state.filters;
      el.discoverQuickActions.querySelectorAll("[data-speaker-preset]").forEach((btn) => {
        const preset = btn.getAttribute("data-speaker-preset");
        btn.classList.toggle("active", isSpeakerPresetActive(preset, f));
        btn.setAttribute("aria-pressed", isSpeakerPresetActive(preset, f) ? "true" : "false");
      });
    }

    function applyPreset(preset) {
      if (preset === "clear") {
        resetFilters();
        return;
      }
      if (preset === "favorites_only") {
        state.filters = state.personaMode === "speaker" ? speakerPresetFilters() : defaultFilters();
        state.filters.favoritesOnly = "yes";
        state.filters.sortBy = "deadline_soon";
        state.headerSort = { key: "", direction: "asc" };
        applyFilterValuesToInputs();
        rerender();
        return;
      }
      if (preset === "actionable_cfp") {
        applySpeakerPreset("discover");
        return;
      }
      if (preset === "due_14") {
        applySpeakerPreset("due_14");
        return;
      }
      if (preset === "industry_talks") {
        applySpeakerPreset("industry");
        return;
      }
      state.filters = state.personaMode === "speaker" ? speakerPresetFilters() : defaultFilters();
      if (preset === "open_cfp") {
        state.filters.acceptsCfp = "Yes";
        state.filters.actionableCfp = "";
      }
      if (preset === "open_cft_or_cfw") {
        state.filters.cftOrCfw = "yes";
        state.filters.acceptsCft = "";
        state.filters.acceptsCfw = "";
        state.filters.actionableCfp = "";
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
      const cycle = ["", "Yes", "No"];
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
        if (th.hasAttribute("data-sort-key")) th.setAttribute("aria-sort", "none");
        const sortKey = th.getAttribute("data-sort-key");
        const filterKey = th.getAttribute("data-filter-key");
        if (sortKey && sortKey === state.headerSort.key) {
          th.classList.add(state.headerSort.direction === "desc" ? "sort-desc" : "sort-asc");
          th.setAttribute("aria-sort", state.headerSort.direction === "desc" ? "descending" : "ascending");
        }
        if (filterKey) {
          const current = state.filters[filterKey] || "";
          if (current) th.classList.add("filter-active");
        }
      });
    }

    function isSmallScreen() {
      return window.matchMedia("(max-width: 640px)").matches;
    }

    function isAttendeeMode() {
      return state.personaMode === "attendee";
    }

    const SPEAKER_ONLY_FILTER_KEYS = [
      "acceptsCfp",
      "acceptsCft",
      "acceptsCfw",
      "cftOrCfw",
      "academicLevel",
      "sponsorship",
      "deadlineWindow",
      "actionableCfp",
      "industryTalks",
      "inPipeline"
    ];

    function clearSpeakerOnlyFilters() {
      SPEAKER_ONLY_FILTER_KEYS.forEach((k) => {
        state.filters[k] = "";
      });
      if (state.filters.sortBy === "deadline_soon") {
        state.filters.sortBy = "attendees_name";
      }
      if (
        state.headerSort.key &&
        (state.headerSort.key.startsWith("accepts_") ||
          state.headerSort.key === "academic_acceptance_level")
      ) {
        state.headerSort = { key: "", direction: "asc" };
      }
    }

    function sortFilterOptionsHtml() {
      const cur = state.filters.sortBy || "attendees_name";
      const opts = isAttendeeMode()
        ? [
            { v: "attendees_name", l: "500+ attendees, then name" },
            { v: "name_asc", l: "Name A–Z" },
            { v: "start_soon", l: "Conference date soonest" }
          ]
        : [
            { v: "attendees_name", l: "500+ attendees, then name" },
            { v: "name_asc", l: "Name A–Z" },
            { v: "deadline_soon", l: "Next deadline soonest" }
          ];
      return opts
        .map((o) => `<option value="${o.v}"${cur === o.v ? " selected" : ""}>${escapeHtml(o.l)}</option>`)
        .join("");
    }

    function updateTableHeaderForPersona() {
      if (!el.dataThead) return;
      const hideSpeakerCols = isAttendeeMode();
      el.dataThead.querySelectorAll("th").forEach((th) => {
        if (th.classList.contains("speaker-only-col")) {
          th.hidden = hideSpeakerCols;
        }
      });
    }

    function applyPersonaDiscoverUI() {
      document.documentElement.dataset.persona = state.personaMode;
      const hideSpeaker = isAttendeeMode();
      document.querySelectorAll("#filters .speaker-only").forEach((node) => {
        node.hidden = hideSpeaker;
      });
      if (el.sortFilter) {
        el.sortFilter.innerHTML = sortFilterOptionsHtml();
        const allowed = [...el.sortFilter.options].map((o) => o.value);
        if (!allowed.includes(state.filters.sortBy)) {
          state.filters.sortBy = "attendees_name";
        }
      }
      updateTableHeaderForPersona();
      if (el.filtersWrap) {
        el.filtersWrap.classList.toggle("filters-attendee", hideSpeaker);
      }
    }

    function setAdvancedFiltersExpanded(expanded) {
      advancedFiltersExpanded = Boolean(expanded);
      el.advancedFilterFields.forEach((field) => {
        field.hidden = !advancedFiltersExpanded;
      });
      if (el.advancedFiltersBtn) {
        el.advancedFiltersBtn.setAttribute("aria-expanded", advancedFiltersExpanded ? "true" : "false");
        el.advancedFiltersBtn.textContent = advancedFiltersExpanded ? "Hide extra filters" : "Show more filters";
      }
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
      renderSpeakerPresetActiveState();
      renderHeaderInteractions();
      applyPersonaDiscoverUI();
      renderMyPanels();
      refreshConferenceDetailIfOpen();
      updateMapIfVisible();
    }

    function populateFilterOptions(rows) {
      fillOptions(el.attendeesFilter, uniqueSortedValues(rows, "attendees_500_plus"));
      fillOptions(el.acceptsCfpFilter, uniqueSortedValues(rows, "accepts_cfp"), "accepts_cfp");
      fillOptions(el.acceptsCftFilter, uniqueSortedValues(rows, "accepts_cft"), "accepts_cft");
      fillOptions(el.acceptsCfwFilter, uniqueSortedValues(rows, "accepts_cfw"), "accepts_cfw");
      fillOptions(el.academicFilter, uniqueSortedValues(rows, "academic_acceptance_level"));
      fillOptions(
        el.sponsorshipFilter,
        uniqueSortedValues(rows, "travel_accommodation_sponsorship"),
        "travel_accommodation_sponsorship"
      );
      fillOptions(el.typeFilter, uniqueSortedValues(rows, "conference_type"));
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
      closeConferenceDetail();
      state.filters = defaultFilters();
      state.headerSort = { key: "", direction: "asc" };
      localStorage.removeItem(STORAGE_KEY);
      applyFilterValuesToInputs();
      rerender();
    }

    function initInstantTips() {
      const tip = document.createElement("div");
      tip.id = "uiTip";
      tip.className = "ui-tip";
      tip.hidden = true;
      tip.setAttribute("role", "tooltip");
      document.body.appendChild(tip);

      const hoverMq = window.matchMedia("(hover: hover) and (pointer: fine)");
      let activeTarget = null;

      function tipParentFor(target) {
        return target?.closest("dialog[open]") || document.body;
      }

      function attachTipTo(target) {
        const parent = tipParentFor(target);
        if (tip.parentNode !== parent) parent.appendChild(tip);
      }

      function hideTip() {
        activeTarget = null;
        tip.hidden = true;
        if (tip.parentNode !== document.body) document.body.appendChild(tip);
      }

      function placeTip(target) {
        const text = target.getAttribute("data-tip");
        if (!text) {
          hideTip();
          return;
        }
        attachTipTo(target);
        tip.textContent = text;
        tip.hidden = false;
        const rect = target.getBoundingClientRect();
        const margin = 8;
        let top = rect.top - tip.offsetHeight - margin;
        let left = rect.left + rect.width / 2 - tip.offsetWidth / 2;
        left = Math.max(margin, Math.min(left, window.innerWidth - tip.offsetWidth - margin));
        if (top < margin) top = rect.bottom + margin;
        tip.style.top = `${Math.round(top)}px`;
        tip.style.left = `${Math.round(left)}px`;
      }

      function showTip(target) {
        if (!target?.getAttribute("data-tip")) return;
        activeTarget = target;
        placeTip(target);
      }

      document.addEventListener(
        "mouseover",
        (event) => {
          if (!hoverMq.matches) return;
          const el = event.target.closest("[data-tip]");
          if (el) showTip(el);
        },
        true
      );

      document.addEventListener(
        "mouseout",
        (event) => {
          if (!hoverMq.matches || !activeTarget) return;
          const from = event.target.closest("[data-tip]");
          if (!from || from !== activeTarget) return;
          const to = event.relatedTarget;
          if (to && from.contains(to)) return;
          hideTip();
        },
        true
      );

      document.addEventListener(
        "focusin",
        (event) => {
          const el = event.target.closest("[data-tip]");
          if (el) showTip(el);
        },
        true
      );

      document.addEventListener(
        "focusout",
        (event) => {
          if (!activeTarget) return;
          const el = event.target.closest("[data-tip]");
          if (el === activeTarget) hideTip();
        },
        true
      );

      window.addEventListener(
        "scroll",
        () => {
          if (activeTarget) placeTip(activeTarget);
        },
        true
      );

      hoverMq.addEventListener("change", () => {
        if (!hoverMq.matches) hideTip();
      });
    }

    function bindEvents() {
      initInstantTips();
      const rerenderOnInput = [el.searchInput, el.favoritesFilter, el.attendeesFilter, el.acceptsCfpFilter, el.acceptsCftFilter, el.acceptsCfwFilter, el.academicFilter, el.sponsorshipFilter, el.typeFilter, el.sortFilter];
      rerenderOnInput.filter(Boolean).forEach((inputEl) => inputEl.addEventListener("input", rerender));
      rerenderOnInput.filter(Boolean).forEach((inputEl) => inputEl.addEventListener("change", rerender));
      if (el.resetBtn) el.resetBtn.addEventListener("click", resetFilters);
      if (el.advancedFiltersBtn) {
        el.advancedFiltersBtn.addEventListener("click", () => {
          setAdvancedFiltersExpanded(!advancedFiltersExpanded);
        });
      }
      if (el.summaryCards) el.summaryCards.addEventListener("click", (event) => {
        const btn = event.target.closest("[data-stat-action]");
        if (!btn) return;
        applyPreset(btn.getAttribute("data-stat-action"));
      });
      if (el.discoverQuickActions) {
        el.discoverQuickActions.addEventListener("click", (event) => {
          const btn = event.target.closest("[data-speaker-preset]");
          if (!btn) return;
          applySpeakerPreset(btn.getAttribute("data-speaker-preset"));
        });
      }
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
      window.matchMedia("(max-width: 640px)").addEventListener("change", () => {
        applyPrimaryNavModel();
      });
      if (el.themeToggle) {
        el.themeToggle.addEventListener("click", () => toggleTheme());
      }
      if (el.personaSelect) {
        el.personaSelect.addEventListener("change", () => {
          setPersonaMode(el.personaSelect.value);
        });
      }
      document.querySelectorAll(".app-view-nav button[data-app-section]").forEach((btn) => {
        btn.addEventListener("click", () => {
          const sec = btn.getAttribute("data-app-section");
          if (sec) setAppSection(sec);
        });
      });
      if (el.appViewNav) {
        el.appViewNav.addEventListener("keydown", (event) => {
          const target = event.target.closest("button[data-app-section]");
          if (!target) return;
          if (event.key === "ArrowRight" || event.key === "ArrowDown") {
            event.preventDefault();
            moveFocusInButtonList(el.appViewNav, target, 1);
          } else if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
            event.preventDefault();
            moveFocusInButtonList(el.appViewNav, target, -1);
          } else if (event.key === "Home") {
            const first = el.appViewNav.querySelector("button[data-app-section]:not([hidden])");
            if (first) {
              event.preventDefault();
              first.focus();
            }
          } else if (event.key === "End") {
            const list = [...el.appViewNav.querySelectorAll("button[data-app-section]:not([hidden])")];
            const last = list[list.length - 1];
            if (last) {
              event.preventDefault();
              last.focus();
            }
          }
        });
      }
      if (el.tabNav) {
        el.tabNav.addEventListener("keydown", (event) => {
          const target = event.target.closest("button.tab-btn");
          if (!target) return;
          if (event.key === "ArrowRight" || event.key === "ArrowDown") {
            event.preventDefault();
            moveFocusInButtonList(el.tabNav, target, 1);
          } else if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
            event.preventDefault();
            moveFocusInButtonList(el.tabNav, target, -1);
          } else if (event.key === "Home") {
            const first = el.tabNav.querySelector("button.tab-btn:not([hidden])");
            if (first) {
              event.preventDefault();
              first.focus();
            }
          } else if (event.key === "End") {
            const list = [...el.tabNav.querySelectorAll("button.tab-btn:not([hidden])")];
            const last = list[list.length - 1];
            if (last) {
              event.preventDefault();
              last.focus();
            }
          }
        });
      }
      if (el.dataTbody) {
        el.dataTbody.addEventListener("click", (event) => {
          const btn = event.target.closest("[data-action]");
          if (!btn) return;
          const enc = btn.getAttribute("data-cname");
          if (!enc) return;
          const name = decodeURIComponent(enc);
          const action = btn.getAttribute("data-action");
          if (action === "open-detail") {
            const row = findRowByConferenceName(name);
            if (row) openConferenceDetail(row);
            return;
          }
          if (action === "fav-toggle") {
            toggleFavorite(name);
            rerender();
            return;
          }
          if (action === "pipeline-add") addToPipeline(name);
          else if (action === "pipeline-remove") removeFromPipeline(name);
          else if (action === "saved-add") addSavedTrip(name);
          else if (action === "saved-remove") removeSavedTrip(name);
          else return;
          rerender();
        });
      }
      if (el.mySpeakerList) {
        el.mySpeakerList.addEventListener("change", (event) => {
          const t = event.target;
          if (t.matches("[data-pipeline-year]")) {
            const enc = t.getAttribute("data-cname");
            if (!enc) return;
            setPipelinePlanningYear(decodeURIComponent(enc), t.value);
            return;
          }
          if (t.matches("[data-pipe-plan-status]")) {
            const enc = t.getAttribute("data-cname");
            if (!enc) return;
            setPipePlan(decodeURIComponent(enc), t.value);
            return;
          }
          const sel = event.target.closest("[data-pipeline-status]");
          if (!sel) return;
          const enc = sel.getAttribute("data-cname");
          if (!enc) return;
          setPipelineStatus(decodeURIComponent(enc), sel.value);
        });
        el.mySpeakerList.addEventListener("click", (event) => {
          const btn = event.target.closest("[data-action]");
          if (!btn || btn.getAttribute("data-action") !== "pipeline-remove") return;
          const enc = btn.getAttribute("data-cname");
          if (!enc) return;
          removeFromPipeline(decodeURIComponent(enc));
          rerender();
        });
      }
      if (el.myTripsList) {
        el.myTripsList.addEventListener("change", (event) => {
          const t = event.target;
          if (t.matches("[data-trip-year]")) {
            const enc = t.getAttribute("data-cname");
            if (!enc) return;
            setTripPlanningYear(decodeURIComponent(enc), t.value);
            return;
          }
          if (t.matches("[data-trip-plan-status]")) {
            const enc = t.getAttribute("data-cname");
            if (!enc) return;
            setTripPlan(decodeURIComponent(enc), t.value);
            return;
          }
        });
        el.myTripsList.addEventListener("click", (event) => {
          const btn = event.target.closest("[data-action]");
          if (!btn || btn.getAttribute("data-action") !== "saved-remove") return;
          const enc = btn.getAttribute("data-cname");
          if (!enc) return;
          removeSavedTrip(decodeURIComponent(enc));
          rerender();
        });
      }
      if (el.pipelineYearFilter) {
        el.pipelineYearFilter.addEventListener("change", () => {
          const v = el.pipelineYearFilter.value;
          state.planningYearFilterPipeline = v === "all" ? "all" : Number(v);
          savePlanningPrefs();
          renderMyPanels();
        });
      }
      if (el.tripsYearFilter) {
        el.tripsYearFilter.addEventListener("change", () => {
          const v = el.tripsYearFilter.value;
          state.planningYearFilterTrips = v === "all" ? "all" : Number(v);
          savePlanningPrefs();
          renderMyPanels();
        });
      }
      if (el.onboardingContinue) {
        el.onboardingContinue.addEventListener("click", () => {
          completeOnboarding();
        });
      }
      if (el.exportStorageBtn) {
        el.exportStorageBtn.addEventListener("click", () => {
          exportStorageBackup();
        });
      }
      if (el.importStorageBtn && el.importStorageFile) {
        el.importStorageBtn.addEventListener("click", () => {
          el.importStorageFile.click();
        });
        el.importStorageFile.addEventListener("change", (event) => {
          const file = event.target.files && event.target.files[0];
          if (file) importStorageFromFile(file);
          event.target.value = "";
        });
      }
      if (el.exportCsvBtn) {
        el.exportCsvBtn.addEventListener("click", () => {
          exportFilteredCsv();
        });
      }
      if (el.copyViewLinkBtn) {
        el.copyViewLinkBtn.addEventListener("click", () => {
          copyViewLinkToClipboard();
        });
      }
      let notesDebounce;
      if (el.conferenceDetailNotes) {
        el.conferenceDetailNotes.addEventListener("input", () => {
          clearTimeout(notesDebounce);
          notesDebounce = setTimeout(() => {
            const n = state.detailConferenceName;
            if (!n) return;
            setNoteForConference(n, el.conferenceDetailNotes.value);
          }, 400);
        });
      }
      if (el.conferenceDetailClose) {
        el.conferenceDetailClose.addEventListener("click", () => {
          closeConferenceDetail();
        });
      }
      if (el.conferenceDetailDialog) {
        el.conferenceDetailDialog.addEventListener("change", (event) => {
          const t = event.target;
          if (t.matches("[data-trip-year]")) {
            const enc = t.getAttribute("data-cname");
            if (!enc) return;
            setTripPlanningYear(decodeURIComponent(enc), t.value);
            return;
          }
          if (t.matches("[data-trip-plan-status]")) {
            const enc = t.getAttribute("data-cname");
            if (!enc) return;
            setTripPlan(decodeURIComponent(enc), t.value);
            return;
          }
          if (t.matches("[data-pipeline-year]")) {
            const enc = t.getAttribute("data-cname");
            if (!enc) return;
            setPipelinePlanningYear(decodeURIComponent(enc), t.value);
            return;
          }
          if (t.matches("[data-pipe-plan-status]")) {
            const enc = t.getAttribute("data-cname");
            if (!enc) return;
            setPipePlan(decodeURIComponent(enc), t.value);
          }
        });
        el.conferenceDetailDialog.addEventListener("click", (event) => {
          const btn = event.target.closest("[data-detail-action]");
          if (!btn) return;
          const action = btn.getAttribute("data-detail-action");
          const enc = btn.getAttribute("data-cname");
          if (!enc) return;
          const name = decodeURIComponent(enc);
          const row = findRowByConferenceName(name);
          if (!row) return;
          if (action === "ics") {
            downloadIcsForConference(row);
            return;
          }
          if (action === "copy-conf-link") {
            const u = new URL(window.location.href);
            u.searchParams.set("c", name);
            const link = u.toString();
            if (navigator.clipboard && navigator.clipboard.writeText) {
              navigator.clipboard.writeText(link).then(() => {
                if (el.conferenceDetailHint) el.conferenceDetailHint.textContent = "Conference link copied.";
              }).catch(() => {
                window.prompt("Copy this link:", link);
              });
            } else {
              window.prompt("Copy this link:", link);
            }
            return;
          }
          if (action === "fav-toggle") {
            toggleFavorite(name);
            fillConferenceDetail(row);
            rerender();
            return;
          }
          if (action === "pipeline-add") {
            addToPipeline(name);
            fillConferenceDetail(row);
            rerender();
            return;
          }
          if (action === "pipeline-remove") {
            removeFromPipeline(name);
            fillConferenceDetail(row);
            rerender();
            return;
          }
          if (action === "saved-add") {
            addSavedTrip(name);
            fillConferenceDetail(row);
            rerender();
            return;
          }
          if (action === "saved-remove") {
            removeSavedTrip(name);
            fillConferenceDetail(row);
            rerender();
            return;
          }
        });
        el.conferenceDetailDialog.addEventListener("close", () => {
          state.detailConferenceName = "";
          setDetailUrlParam(null);
        });
      }
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
        }
      });
      function isTypingTarget(target) {
        if (!target || !target.tagName) return false;
        const t = target.tagName.toLowerCase();
        if (t === "input" || t === "textarea" || t === "select") return true;
        return Boolean(target.isContentEditable);
      }
      document.addEventListener("keydown", (event) => {
        if (event.key !== "?" || event.altKey || event.ctrlKey || event.metaKey) return;
        if (isTypingTarget(event.target)) return;
        event.preventDefault();
        openShortcutsDialog();
      });
      if (el.footerShortcutsBtn) {
        el.footerShortcutsBtn.addEventListener("click", () => openShortcutsDialog());
      }
      if (el.shortcutsCloseBtn) {
        el.shortcutsCloseBtn.addEventListener("click", () => closeShortcutsDialog());
      }
      if (el.exportPipelineCsvBtn) el.exportPipelineCsvBtn.addEventListener("click", () => exportPipelineCsv());
      if (el.exportPipelineIcsBtn) el.exportPipelineIcsBtn.addEventListener("click", () => exportPipelineIcsBundle());
      if (el.exportTripsCsvBtn) el.exportTripsCsvBtn.addEventListener("click", () => exportTripsCsv());
      if (el.exportTripsIcsBtn) el.exportTripsIcsBtn.addEventListener("click", () => exportTripsIcsBundle());
    }

    async function start() {
      state.geocodeCache = loadGeocodeCache();
      readAppMetaFromUrl();
      loadPersonaAndSectionFromStorage();
      loadPipeline();
      loadSavedTrips();
      loadFavorites();
      loadNotes();
      loadFilters();
      readFiltersFromUrl();
      maybeApplySpeakerDiscoverDefaults();
      loadUiPrefs();
      loadPlanningPrefs();
      if (isAttendeeMode()) {
        clearSpeakerOnlyFilters();
        applyFilterValuesToInputs();
      }
      bindEvents();
      if (el.personaSelect) el.personaSelect.value = state.personaMode;
      updatePersonaHint();
      applyAppSectionUI();
      setActiveTab(state.activeTab);
      setAdvancedFiltersExpanded(!isSmallScreen());
      updateMapSourceButtons();
      try {
        await loadCsvAndRender();
        openOnboardingIfNeeded();
        window.setTimeout(() => {
          if (!el.onboardingDialog?.open) tryOpenDetailFromUrl();
        }, 300);
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
