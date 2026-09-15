(() => {
  if (window.__storylingoRecaptchaStarted) return;
  window.__storylingoRecaptchaStarted = true;

  const SESSION_KEY = "storylingo_recaptcha_verified_v1";
  const ACTION = "storylingo_visit";
  let siteKey = "";
  let overlay = null;
  let scriptPromise = null;

  // Embedded social browsers can prevent reCAPTCHA from completing reliably.
  // StoryLingo's public reading experience must never be blocked by that.
  const ua = navigator.userAgent || "";
  const isEmbeddedSocialBrowser = /Instagram|FBAN|FBAV|FB_IAB|Messenger|Threads/i.test(ua);
  if (isEmbeddedSocialBrowser) return;

  try {
    if (sessionStorage.getItem(SESSION_KEY) === "yes") return;
  } catch {}

  function loadScript() {
    if (window.grecaptcha?.execute) return Promise.resolve();
    if (scriptPromise) return scriptPromise;
    scriptPromise = new Promise((resolve, reject) => {
      const existing = document.querySelector('script[data-storylingo-recaptcha-api="1"]');
      if (existing) {
        existing.addEventListener("load", resolve, { once: true });
        existing.addEventListener("error", reject, { once: true });
        return;
      }
      const script = document.createElement("script");
      script.src = `https://www.google.com/recaptcha/api.js?render=${encodeURIComponent(siteKey)}`;
      script.async = true;
      script.defer = true;
      script.dataset.storylingoRecaptchaApi = "1";
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
    return scriptPromise;
  }

  function showOverlay(message = "VERIFYING HUMAN ACCESS…", failed = false) {
    if (!overlay) {
      overlay = document.createElement("div");
      overlay.setAttribute("role", "status");
      overlay.setAttribute("aria-live", "polite");
      overlay.style.cssText = "position:fixed;inset:0;z-index:2147483646;display:grid;place-items:center;background:rgba(8,7,6,.94);backdrop-filter:blur(7px);font-family:ui-monospace,SFMono-Regular,Menlo,monospace;color:#f5ead5;padding:24px;text-align:center";
      overlay.innerHTML = '<div style="max-width:520px;border:1px solid #d5b868;padding:22px;background:#111"><strong data-recaptcha-message style="display:block;letter-spacing:.08em">VERIFYING HUMAN ACCESS…</strong><p style="color:#b9ad98;line-height:1.55;margin:12px 0 0">StoryLingo uses Google reCAPTCHA for abuse prevention.</p><button type="button" data-recaptcha-retry style="display:none;margin:18px auto 0;padding:10px 15px;border:1px solid #d5b868;background:#181512;color:#f5ead5;font:inherit;cursor:pointer">TRY AGAIN</button></div>';
      document.body.appendChild(overlay);
      overlay.querySelector("[data-recaptcha-retry]")?.addEventListener("click", verify);
    }
    const label = overlay.querySelector("[data-recaptcha-message]");
    const retry = overlay.querySelector("[data-recaptcha-retry]");
    if (label) label.textContent = message;
    if (retry) retry.style.display = failed ? "block" : "none";
  }

  async function token() {
    await loadScript();
    return new Promise((resolve, reject) => {
      window.grecaptcha.ready(async () => {
        try { resolve(await window.grecaptcha.execute(siteKey, { action: ACTION })); }
        catch (error) { reject(error); }
      });
    });
  }

  async function verify() {
    showOverlay();
    try {
      const responseToken = await token();
      const response = await fetch("/api/recaptcha-verify", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ token: responseToken, action: ACTION }),
        cache: "no-store",
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok || result?.ok !== true) throw new Error("verification_failed");
      try { sessionStorage.setItem(SESSION_KEY, "yes"); } catch {}
      overlay?.remove();
      overlay = null;
    } catch {
      // Fail open for public reading. reCAPTCHA must not trap visitors on a blocking screen.
      overlay?.remove();
      overlay = null;
    }
  }

  async function start() {
    try {
      const response = await fetch("/api/recaptcha-config", { cache: "no-store" });
      const config = response.ok ? await response.json() : null;
      if (!config?.enabled || !config?.siteKey) return;
      siteKey = config.siteKey;
      await verify();
    } catch {
      overlay?.remove();
      overlay = null;
    }
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start, { once: true });
  else start();
})();
