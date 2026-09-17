(() => {
  const SCRIPT_ID = "storylingo-vercel-analytics";

  window.va =
    window.va ||
    function () {
      (window.vaq = window.vaq || []).push(arguments);
    };

  if (!document.getElementById(SCRIPT_ID)) {
    const script = document.createElement("script");
    script.id = SCRIPT_ID;
    script.defer = true;
    script.src = "/_vercel/insights/script.js";
    document.head.appendChild(script);
  }

  const cleanPath = (value) => {
    try {
      const url = new URL(value, location.origin);
      return url.origin === location.origin ? url.pathname : url.hostname;
    } catch {
      return String(value || "").slice(0, 120);
    }
  };

  const track = (name, data = {}) => {
    try {
      window.va("event", {
        name,
        data: Object.fromEntries(
          Object.entries(data)
            .filter(([, value]) => value !== undefined && value !== null && value !== "")
            .map(([key, value]) => [key, typeof value === "string" ? value.slice(0, 120) : value])
        ),
      });
    } catch {}
  };

  const pageLanguage = () => {
    const select = document.querySelector("#languageSelect, [data-language-select]");
    return select?.value || document.documentElement.lang || "unknown";
  };

  track("storylingo_visit", {
    path: location.pathname,
    language: pageLanguage(),
  });

  document.addEventListener("change", (event) => {
    const target = event.target;
    if (!(target instanceof HTMLSelectElement)) return;
    if (!target.matches("#languageSelect, [data-language-select], select[name='language']")) return;

    track("language_change", {
      language: target.value,
      path: location.pathname,
    });
  });

  document.addEventListener("click", (event) => {
    const element = event.target instanceof Element ? event.target : null;
    if (!element) return;

    const link = element.closest("a[href]");
    if (link) {
      const href = link.getAttribute("href") || "";
      const route = cleanPath(href);
      const text = (link.textContent || "").trim().replace(/\s+/g, " ").slice(0, 80);

      if (/folk-tales|universal-stories|chapter|story|collection|comic/i.test(href)) {
        track("story_open", {
          route,
          label: text || "story-link",
          language: pageLanguage(),
        });
      }

      if (/instagram\.com|orangesoft\.uk/i.test(href)) {
        track("external_link", {
          destination: cleanPath(href),
          label: text || "external-link",
        });
      }
    }

    const practice = element.closest("[data-practice], [data-practice-word], .practice-word, .practice-button");
    if (practice) {
      track("practice_started", {
        path: location.pathname,
        language: pageLanguage(),
      });
    }

    const audio = element.closest("[data-audio], [data-play-audio], .audio-button, .play-audio");
    if (audio) {
      track("audio_started", {
        path: location.pathname,
        language: pageLanguage(),
      });
    }
  });

  window.StoryLingoAnalytics = { track };
})();
