(() => {
  if (window.StoryLingoAnalytics) return;

  // Vercel Web Analytics bootstrap for this static HTML application.
  // It is first-party on the StoryLingo deployment and does not require us
  // to create our own cross-site identifier or store personal information.
  window.va = window.va || function () {
    (window.vaq = window.vaq || []).push(arguments);
  };

  if (!document.querySelector('script[data-storylingo-vercel-analytics="1"]')) {
    const script = document.createElement("script");
    script.defer = true;
    script.src = "/_vercel/insights/script.js";
    script.dataset.storylingoVercelAnalytics = "1";
    document.head.appendChild(script);
  }

  const path = location.pathname || "/";
  const queryLanguage = new URLSearchParams(location.search).get("lang");

  function language() {
    const selected = document.querySelector(".langs button.on")?.dataset.lang;
    const picker = document.getElementById("languageSelect")?.value;
    if (selected) return selected;
    if (picker) return picker;
    if (queryLanguage) return queryLanguage;
    if (/^\/ua(?:\/|$)/.test(path)) return "uk";
    if (/^\/pl(?:\/|$)/.test(path)) return "pl";
    if (/^\/fr(?:\/|$)/.test(path)) return "fr";
    if (/^\/de(?:\/|$)/.test(path)) return "de";
    if (/^\/es(?:\/|$)/.test(path)) return "es";
    if (/^\/it(?:\/|$)/.test(path)) return "it";
    return document.documentElement.lang || "en";
  }

  function track(name, data = {}) {
    try {
      const clean = {};
      for (const [key, value] of Object.entries(data)) {
        if (value === undefined || value === null || value === "") continue;
        clean[key] = typeof value === "string" ? value.slice(0, 120) : value;
      }
      window.va("event", { name, data: clean });
    } catch {
      // Analytics must never interrupt reading or language practice.
    }
  }

  function isReaderPage() {
    if (document.getElementById("story")) return true;
    return /(universal-stories|folk-tales|folk-tales\/collection|comic|novel|turnip|mitten)/.test(path);
  }

  function storyTarget(href) {
    try {
      const url = new URL(href, location.href);
      if (url.origin !== location.origin) return null;
      if (!/(universal-stories|folk-tales|comic|novel|turnip|mitten)/.test(url.pathname)) return null;
      return url.pathname;
    } catch {
      return null;
    }
  }

  const api = Object.freeze({ track, language, route: path });
  window.StoryLingoAnalytics = api;

  if (isReaderPage()) {
    track("Story Opened", { route: path, language: language() });

    let depth50 = false;
    let depth90 = false;
    let ticking = false;
    const reportDepth = () => {
      ticking = false;
      const doc = document.documentElement;
      const max = Math.max(1, doc.scrollHeight - innerHeight);
      const depth = Math.max(0, Math.min(1, scrollY / max));
      if (!depth50 && depth >= 0.5) {
        depth50 = true;
        track("Reading Depth 50%", { route: path, language: language() });
      }
      if (!depth90 && depth >= 0.9) {
        depth90 = true;
        track("Reading Depth 90%", { route: path, language: language() });
      }
    };
    addEventListener("scroll", () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(reportDepth);
    }, { passive: true });

    setTimeout(() => {
      if (document.visibilityState === "visible") {
        track("30 Second Reading Session", { route: path, language: language() });
      }
    }, 30000);
  }

  document.addEventListener("change", (event) => {
    const target = event.target;
    if (target?.id === "languageSelect") {
      track("Language Changed", { language: target.value, route: path });
    }
  });

  document.addEventListener("click", (event) => {
    const target = event.target instanceof Element ? event.target : null;
    if (!target) return;

    const languageButton = target.closest(".langs button[data-lang]");
    if (languageButton) {
      track("Language Changed", { language: languageButton.dataset.lang, route: path });
      return;
    }

    const listen = target.closest("#listen,.swl-listen,[data-listen]");
    if (listen) {
      track("Listening Used", { route: path, language: language() });
      return;
    }

    const parallel = target.closest("#parallel");
    if (parallel) {
      track("Parallel Reading Toggled", { route: path, language: language() });
      return;
    }

    const practice = target.closest("a[href*='verbs'],a[href*='nouns'],a[href*='grammar'],a[href*='practice'],button[id*='practice'],button[class*='practice']");
    if (practice) {
      const href = practice.getAttribute("href") || "";
      const tool = href.includes("verbs") ? "verbs" : href.includes("nouns") ? "nouns" : href.includes("grammar") ? "grammar" : "practice";
      track("Study Tool Opened", { tool, language: language() });
      return;
    }

    const anchor = target.closest("a[href]");
    const story = anchor ? storyTarget(anchor.href) : null;
    if (story) {
      track("Story Link Opened", { route: story, language: language() });
    }
  }, { capture: true });
})();