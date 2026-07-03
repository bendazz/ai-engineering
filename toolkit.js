/* ============================================================
   toolkit.js — a grab-bag of OPTIONAL helpers for sections.
   Nothing here is required. A section can ignore all of it and
   just return raw HTML, or use these to save typing.

   Everything returns an HTML string (so it composes with
   template literals). Interactive behavior (canvas, buttons) is
   wired in a section's onMount(root) function instead.
   ============================================================ */

window.Toolkit = (function () {

  // A highlighted aside. type: "" | "ai" | "note" | "warn"
  // Pass opts.teach (or use the "For you, the instructor" label) to mark it an
  // INSTRUCTOR-ONLY note: it gets the .teach-only class, so it is hidden from
  // students by default and shown only in instructor mode (body.teach).
  function callout(bodyHTML, opts = {}) {
    const type = opts.type || "";
    const label = opts.label || ({
      "":    "Idea",
      ai:    "Where this lives in an AI app",
      note:  "Heads up",
      warn:  "Common mistake",
    })[type];
    const teach = opts.teach || label === "For you, the instructor";
    return `<div class="callout ${type}${teach ? " teach-only" : ""}">
      ${label ? `<div class="callout-label">${label}</div>` : ""}
      ${bodyHTML}
    </div>`;
  }

  // An INSTRUCTOR-ONLY aside. Renders a "For you, the instructor" callout
  // wrapped so it is HIDDEN from students by default (CSS .teach-only), and
  // shown only when instructor mode is on (body.teach — toggled in app.js by
  // visiting a URL with ?teach). Use this for facilitation notes, board demos,
  // and troubleshooting the class shouldn't read inline.
  function instructorNote(bodyHTML, opts = {}) {
    return callout(bodyHTML, {
      type: "note",
      label: opts.label || "For you, the instructor",
      teach: true,
    });
  }

  // A practice problem with a hidden, click-to-reveal solution.
  // The reveal is wired globally in app.js via event delegation,
  // so you can drop these anywhere with no extra JS.
  let _problemCounter = 0;
  function problem(questionHTML, solutionHTML, opts = {}) {
    _problemCounter += 1;
    const label = opts.label || `Problem ${_problemCounter}`;
    return `<div class="problem">
      <div class="problem-num">${label}</div>
      <div class="problem-q">${questionHTML}</div>
      <button class="solution-toggle" data-toggle-solution>Show solution</button>
      <div class="solution">
        <div class="solution-label">Solution</div>
        ${solutionHTML}
      </div>
    </div>`;
  }

  // Call at the top of a section's html to reset problem numbering.
  function resetProblems() { _problemCounter = 0; }

  // The 0-to-1 probability strip used as a visual anchor.
  function probabilityScale() {
    return `<div class="prob-scale">
      <div class="bar"></div>
      <div class="ticks">
        <span>0 — impossible</span>
        <span>½ — even chance</span>
        <span>1 — certain</span>
      </div>
    </div>`;
  }

  // A titled container for an interactive widget. Pass the inner
  // HTML (canvas, controls, readouts); style comes from .widget.
  function widget(titleHTML, innerHTML) {
    return `<div class="widget">
      ${titleHTML ? `<div class="widget-title">${titleHTML}</div>` : ""}
      ${innerHTML}
    </div>`;
  }

  // A titled code / terminal block. `head` is a small label (a filename
  // like "hello.py", or "Terminal"/"PowerShell" which gets terminal styling);
  // `body` is the literal code/commands. NOTE: body is inserted as-is (not
  // HTML-escaped), so a caller who needs < & > must pass &lt; &amp; &gt;.
  function code(head, body) {
    const term = /terminal|powershell|bash|shell|cmd/i.test(head);
    return `<div class="codeblock${term ? " term" : ""}">
      <div class="cb-head">${head}</div><pre>${body}</pre></div>`;
  }

  /* ---- small canvas helper: handles HiDPI sizing ---- */
  // Returns { ctx, w, h } with the canvas sized crisply to its
  // CSS width and the given CSS height.
  function fitCanvas(canvas, cssHeight) {
    const dpr = window.devicePixelRatio || 1;
    const cssWidth = canvas.clientWidth || canvas.parentElement.clientWidth;
    canvas.style.height = cssHeight + "px";
    canvas.width = Math.round(cssWidth * dpr);
    canvas.height = Math.round(cssHeight * dpr);
    const ctx = canvas.getContext("2d");
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    return { ctx, w: cssWidth, h: cssHeight };
  }

  return { callout, instructorNote, problem, resetProblems, probabilityScale, widget, code, fitCanvas };
})();
