(() => {
  if (!document.querySelector('script[data-storylingo-analytics-loader="1"]')) {
    const analytics = document.createElement("script");
    analytics.src = "/storylingo-analytics.js?v=20260917-1";
    analytics.defer = true;
    analytics.dataset.storylingoAnalyticsLoader = "1";
    document.head.appendChild(analytics);
  }

  if (!document.querySelector('script[data-storylingo-recaptcha-loader="1"]')) {
    const recaptcha = document.createElement("script");
    recaptcha.src = "/storylingo-recaptcha.js?v=20260912-1";
    recaptcha.defer = true;
    recaptcha.dataset.storylingoRecaptchaLoader = "1";
    document.head.appendChild(recaptcha);
  }

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
        <p>StoryLingo uses essential browser storage for language and reading preferences, privacy-friendly first-party usage analytics, and Google reCAPTCHA for security and abuse prevention when enabled.</p>
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