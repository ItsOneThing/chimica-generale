/* Chimica Generale — interazioni condivise:
   tema chiaro/scuro, barra di lettura, indice attivo, torna su. */
(function () {
  "use strict";

  var root = document.documentElement;
  var STORAGE_KEY = "chimica-tema";
  var media = window.matchMedia("(prefers-color-scheme: dark)");
  var toggle = document.querySelector("[data-theme-toggle]");

  function readStoredTheme() {
    try {
      return localStorage.getItem(STORAGE_KEY);
    } catch (error) {
      return null;
    }
  }

  function storeTheme(value) {
    try {
      localStorage.setItem(STORAGE_KEY, value);
    } catch (error) {
      /* Su file:// alcuni browser bloccano localStorage: il tema resta attivo
         solo per la pagina corrente, senza interrompere nulla. */
    }
  }

  function syncToggle(theme) {
    if (!toggle) return;
    var isDark = theme === "dark";
    toggle.setAttribute("aria-pressed", String(isDark));
    toggle.setAttribute(
      "aria-label",
      isDark ? "Passa al tema chiaro" : "Passa al tema scuro"
    );
    toggle.setAttribute("title", isDark ? "Tema chiaro" : "Tema scuro");
  }

  function applyTheme(theme) {
    root.setAttribute("data-theme", theme);
    syncToggle(theme);
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) {
      meta.setAttribute("content", theme === "dark" ? "#0d1319" : "#f6f8fa");
    }
  }

  applyTheme(root.getAttribute("data-theme") === "dark" ? "dark" : "light");

  if (toggle) {
    toggle.hidden = false;
    toggle.addEventListener("click", function () {
      var next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
      applyTheme(next);
      storeTheme(next);
    });
  }

  media.addEventListener("change", function (event) {
    if (readStoredTheme()) return;
    applyTheme(event.matches ? "dark" : "light");
  });

  /* Barra di avanzamento della lettura */
  var progress = document.querySelector("[data-progress]");
  if (progress) {
    var ticking = false;

    var updateProgress = function () {
      ticking = false;
      var max = root.scrollHeight - root.clientHeight;
      var value = max > 0 ? (root.scrollTop / max) * 100 : 0;
      progress.style.width = Math.min(100, Math.max(0, value)) + "%";
    };

    var requestProgress = function () {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(updateProgress);
    };

    updateProgress();
    window.addEventListener("scroll", requestProgress, { passive: true });
    window.addEventListener("resize", requestProgress, { passive: true });
  }

  /* Torna all'inizio */
  var toTop = document.querySelector("[data-to-top]");
  if (toTop) {
    var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

    var updateToTop = function () {
      toTop.classList.toggle("is-visible", window.scrollY > 700);
    };

    updateToTop();
    window.addEventListener("scroll", updateToTop, { passive: true });

    toTop.addEventListener("click", function () {
      window.scrollTo({
        top: 0,
        behavior: reduceMotion.matches ? "auto" : "smooth"
      });
    });
  }

  /* Evidenzia la voce dell'indice corrispondente alla sezione visibile */
  var toc = document.querySelector("[data-toc]");
  if (toc && "IntersectionObserver" in window) {
    var links = Array.prototype.slice.call(
      toc.querySelectorAll('a[href^="#"]')
    );
    var entries = links
      .map(function (link) {
        var id = decodeURIComponent(link.getAttribute("href").slice(1));
        var target = document.getElementById(id);
        return target ? { link: link, target: target } : null;
      })
      .filter(Boolean);

    if (entries.length) {
      var visible = new Set();
      var currentId = entries[0].target.id;

      var setCurrent = function (id) {
        currentId = id;
        entries.forEach(function (entry) {
          var active = entry.target.id === id;
          entry.link.classList.toggle("is-active", active);
          if (active) {
            entry.link.setAttribute("aria-current", "true");
          } else {
            entry.link.removeAttribute("aria-current");
          }
        });
      };

      var observer = new IntersectionObserver(
        function (records) {
          records.forEach(function (record) {
            if (record.isIntersecting) {
              visible.add(record.target.id);
            } else {
              visible.delete(record.target.id);
            }
          });

          var first = entries.filter(function (entry) {
            return visible.has(entry.target.id);
          })[0];

          if (first) setCurrent(first.target.id);
        },
        { rootMargin: "-12% 0px -72% 0px", threshold: 0 }
      );

      entries.forEach(function (entry) {
        observer.observe(entry.target);
        entry.link.addEventListener("click", function () {
          setCurrent(entry.target.id);
        });
      });

      setCurrent(currentId);
    }
  }
})();
