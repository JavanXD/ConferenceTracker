(function () {
  function reveal(el) {
    var raw = el.getAttribute("data-c");
    if (!raw) return;
    var email = raw.split(",").map(function (code) {
      return String.fromCharCode(parseInt(code, 10));
    }).join("");
    el.href = "mailto:" + email;
    el.textContent = email;
    el.setAttribute("aria-label", "Email " + email);
    el.removeAttribute("data-c");
  }

  document.querySelectorAll(".obf-email").forEach(reveal);
})();
