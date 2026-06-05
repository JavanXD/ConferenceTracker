(function () {
  var script = document.currentScript;
  var version = "";
  if (script) {
    version = script.getAttribute("data-v") || "";
    if (!version && script.src) {
      var match = script.src.match(/[?&]v=([^&]+)/);
      if (match) version = decodeURIComponent(match[1]);
    }
  }
  if (!version) version = String(Date.now());

  var theme = "light";
  try {
    var raw = localStorage.getItem("conference_dashboard_ui_prefs_v1");
    if (raw) {
      var prefs = JSON.parse(raw);
      if (prefs.theme === "dark" || prefs.theme === "light") theme = prefs.theme;
    }
  } catch (e) {
    theme = "light";
  }
  document.documentElement.setAttribute("data-theme", theme);
  var meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute("content", theme === "light" ? "#f4f7f5" : "#050707");

  var existing = document.getElementById("appStyles");
  if (existing) {
    existing.href = "./styles.css?v=" + version;
    return;
  }
  var link = document.createElement("link");
  link.id = "appStyles";
  link.rel = "stylesheet";
  link.href = "./styles.css?v=" + version;
  document.head.appendChild(link);
})();
