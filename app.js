/* ============================================================
   app.js — the reading shell.
   Responsibilities:
     - build the sidebar table of contents from SECTIONS
     - hash routing (#section-id)
     - render the active section's HTML, typeset math, run onMount
     - prev / next pager
     - reveal-solution clicks (event delegation)
     - mobile sidebar toggle
   It knows nothing about any particular section's content.
   ============================================================ */

(function () {
  "use strict";

  const SECTIONS = window.SECTIONS || [];
  const CONTENT  = window.SectionContent || {};

  const tocEl     = document.getElementById("toc");
  const contentEl = document.getElementById("content");
  const pagerEl   = document.getElementById("pager");
  const sidebar   = document.getElementById("sidebar");
  const backdrop  = document.getElementById("backdrop");
  const menuBtn   = document.getElementById("menu-toggle");

  function indexOfId(id) {
    return SECTIONS.findIndex((s) => s.id === id);
  }

  /* ---------- Sidebar ---------- */
  function buildSidebar() {
    let html = "";
    let lastGroup = null;
    SECTIONS.forEach((s) => {
      const group = s.group || "";
      if (group !== lastGroup) {
        if (group) html += `<div class="toc-group-label">${group}</div>`;
        lastGroup = group;
      }
      html += `<a class="toc-link" data-id="${s.id}" href="#${s.id}">${s.title}</a>`;
    });
    tocEl.innerHTML = html;
  }

  function highlightToc(id) {
    tocEl.querySelectorAll(".toc-link").forEach((a) => {
      a.classList.toggle("active", a.dataset.id === id);
    });
  }

  /* ---------- Math typesetting ---------- */
  function typeset(el) {
    if (typeof window.renderMathInElement === "function") {
      window.renderMathInElement(el, {
        delimiters: [
          { left: "$$", right: "$$", display: true },
          { left: "$",  right: "$",  display: false },
          { left: "\\(", right: "\\)", display: false },
          { left: "\\[", right: "\\]", display: true },
        ],
        throwOnError: false,
      });
    }
  }

  /* ---------- Pager ---------- */
  function buildPager(idx) {
    const prev = SECTIONS[idx - 1];
    const next = SECTIONS[idx + 1];
    const cell = (s, dir) =>
      s
        ? `<a class="pager-btn ${dir}" href="#${s.id}">
             <div class="dir">${dir === "prev" ? "← Previous" : "Next →"}</div>
             <div class="ttl">${s.title}</div>
           </a>`
        : `<span class="pager-btn ${dir} disabled"></span>`;
    pagerEl.innerHTML = cell(prev, "prev") + cell(next, "next");
  }

  /* ---------- Render a section ---------- */
  function render(id) {
    let idx = indexOfId(id);
    if (idx === -1) { idx = 0; id = SECTIONS[0] && SECTIONS[0].id; }
    if (!id) {
      contentEl.innerHTML = "<h1>No sections yet</h1><p>Add one in <code>sections/manifest.js</code>.</p>";
      return;
    }

    const section = CONTENT[id];
    if (!section) {
      contentEl.innerHTML = `<h1>Missing content</h1>
        <p>The manifest lists <code>${id}</code>, but no section registered it.
        Check that <code>sections/${id}.js</code> is included in
        <code>index.html</code>.</p>`;
      buildPager(idx);
      highlightToc(id);
      return;
    }

    const html = typeof section.html === "function" ? section.html() : section.html;
    contentEl.innerHTML = html || "";
    typeset(contentEl);
    if (typeof section.onMount === "function") {
      try { section.onMount(contentEl); }
      catch (err) { console.error(`onMount error in section "${id}":`, err); }
    }

    buildPager(idx);
    highlightToc(id);
    document.title = (section.title || SECTIONS[idx].title) + " · Advanced AI Applications";
    window.scrollTo(0, 0);
    closeSidebar();
  }

  /* ---------- Routing ---------- */
  function currentId() {
    // A hash may carry a query suffix (e.g. #anatomy-of-a-call?teach) used to
    // toggle instructor mode — the id is only the part before the "?".
    const raw = (location.hash || "").replace(/^#/, "").split("?")[0];
    return decodeURIComponent(raw);
  }
  function route() {
    render(currentId() || (SECTIONS[0] && SECTIONS[0].id));
  }

  /* ---------- Instructor mode ----------
     Notes written with Toolkit.instructorNote are hidden from students by
     default (CSS .teach-only) and revealed when <body> has class "teach".
     Turn on by visiting any URL with ?teach (in the query or after the hash,
     e.g. #tokens-and-context?teach); it persists in localStorage. A discreet
     chip appears ONLY while on, so students never see a way to enable it.
     Turn off via the chip, or ?teach=off. */
  function teachStored() {
    try { return localStorage.getItem("aae-teach") === "1"; } catch (e) { return false; }
  }
  function teachStore(on) {
    try { localStorage.setItem("aae-teach", on ? "1" : "0"); } catch (e) {}
  }
  function teachParam() {
    const hashQ = (location.hash.split("?")[1] || "");
    const q = location.search.replace(/^\?/, "");
    const params = new URLSearchParams(q + (q && hashQ ? "&" : "") + hashQ);
    if (!params.has("teach")) return null;
    const v = params.get("teach");
    return (v === "off" || v === "0" || v === "false") ? "off" : "on";
  }
  function renderTeachChip(on) {
    let chip = document.getElementById("teach-chip");
    if (on && !chip) {
      chip = document.createElement("button");
      chip.id = "teach-chip";
      chip.type = "button";
      chip.textContent = "Instructor notes shown · click to hide";
      chip.addEventListener("click", () => {
        teachStore(false);
        document.body.classList.remove("teach");
        chip.remove();
      });
      document.body.appendChild(chip);
    } else if (!on && chip) {
      chip.remove();
    }
  }
  function applyTeach() {
    const p = teachParam();
    let on = teachStored();
    if (p === "on") on = true;
    if (p === "off") on = false;
    teachStore(on);
    document.body.classList.toggle("teach", on);
    renderTeachChip(on);
  }

  /* ---------- Reveal-solution (event delegation) ---------- */
  contentEl.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-toggle-solution]");
    if (!btn) return;
    const sol = btn.parentElement.querySelector(".solution");
    if (!sol) return;
    const open = sol.classList.toggle("open");
    btn.textContent = open ? "Hide solution" : "Show solution";
  });

  /* ---------- Mobile sidebar ---------- */
  function openSidebar()  { sidebar.classList.add("open");  backdrop.classList.add("show"); }
  function closeSidebar() { sidebar.classList.remove("open"); backdrop.classList.remove("show"); }
  if (menuBtn)  menuBtn.addEventListener("click", openSidebar);
  if (backdrop) backdrop.addEventListener("click", closeSidebar);

  /* ---------- Boot ---------- */
  function boot() {
    buildSidebar();
    applyTeach();
    route();
  }
  window.addEventListener("hashchange", () => { applyTeach(); route(); });
  // KaTeX auto-render is loaded with `defer`; wait for full load so
  // renderMathInElement is defined before the first typeset.
  if (document.readyState === "complete") boot();
  else window.addEventListener("load", boot);
})();
