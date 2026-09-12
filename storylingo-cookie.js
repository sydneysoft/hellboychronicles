(() => {
  const key = "storylingo_cookie_notice_accepted";
  try {
    if (localStorage.getItem(key) === "yes") return;
  } catch {}

  const banner = document.createElement("div");
  banner.className = "sl-cookie";
  banner.setAttribute("role", "region");
  banner.setAttribute("aria-label", "Cookie notice");
  banner.innerHTML = `
    <div class="sl-cookie-inner">
      <div>
        <strong>COOKIE NOTICE</strong>
        <p>StoryLingo uses essential browser storage for language and reading preferences.</p>
      </div>
      <button type="button" data-cookie-accept>ACCEPT</button>
    </div>
  `;

  const body = document.body;
  body.insertBefore(banner, body.firstChild);

  banner.querySelector("[data-cookie-accept]")?.addEventListener("click", () => {
    try { localStorage.setItem(key, "yes"); } catch {}
    banner.remove();
  });
})();
