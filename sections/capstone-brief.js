/* ============================================================
   Section: Capstone — build a real AI system  (STUDIO) — the finale,
   course section 43. The culminating studio for Block 8 AND the whole
   course: build a complete, evaluated, deployed AI-engineering system on
   the Claude API, end to end, as a PORTFOLIO piece. The eval evidence is
   the deliverable, not the demo.
   Integrates every block: foundation (1–2) + eval spine (3) + prompt (4) +
   tools/RAG or agents (5–6) + production (7) + deployment (8).
   Studio pattern at full scale: scenario switcher A/B/C + the full-
   lifecycle spec + scoping rule + milestones + rubric + red-team swap +
   deliverables + "this is the job". Reuses .scn-/.sc-/.scorecard CSS; adds
   a lifecycle self-audit (.lc-*). Heavy instructor scaffolding, all HIDDEN.

   NOTE (playbook): studio = brief; ends "this is the job". No literal
   dollar signs; no backtick chars in prose; no star-slash inside comments;
   no raw less-than in html; curly quotes literal; instructor notes hidden.
   ============================================================ */

window.SectionContent["capstone-brief"] = {
  title: "Capstone: build a real AI system",

  html: `
    <div class="eyebrow">Capstone · Section 43 · Studio</div>
    <h1>Capstone: build a real AI system</h1>

    <p>This is the whole course, at once. You're going to build a complete AI-engineering system on
    the Claude API — from the first call all the way to a deployed, monitored service — and you're
    going to do the thing that has separated an engineer from a demo-builder in every studio this
    term: <strong>you'll prove it works with evidence.</strong> The deliverable isn't a slick demo.
    It's a system whose quality, cost, and reliability you can <em>defend with numbers</em>, and a
    repo that shows a future employer exactly how you did it.</p>

    <p>Solo or in pairs. Pick a scenario — or bring your own with sign-off:</p>

    ${Toolkit.widget(
      "Capstone scenarios",
      `<div class="scn-tabs">
         <button class="btn ghost scn-tab active-mode" data-s="A">A · Support assistant</button>
         <button class="btn ghost scn-tab" data-s="B">B · Research agent</button>
         <button class="btn ghost scn-tab" data-s="C">C · Extraction pipeline</button>
       </div>
       <div class="scn-card" id="cap-card"></div>`
    )}

    <h2>What &ldquo;complete&rdquo; means: the full lifecycle</h2>

    <p>A capstone system has to touch every stage of the arc you learned. Here's the spec — audit
    yourself against it as you build. The centerpiece is the eval: everything else is in service of
    being able to say, with a straight face, how good your system actually is.</p>

    ${Toolkit.widget(
      "Full-lifecycle self-audit",
      `<div class="lc-groups" id="lc-groups"></div>
       <div class="lc-meter-wrap"><div class="lc-meter" id="lc-meter"></div><span class="lc-meter-txt" id="lc-meter-txt"></span></div>
       <div class="nd-cap">A working checklist across the whole course. The centerpiece is the
         Evaluation group — a capstone with a great demo and no eval is not a capstone.</div>`
    )}

    <h2>The one rule that saves capstones: scope down</h2>

    <p>The single most common way this project goes wrong is over-reaching — a grand system that's
    60% built and proves nothing. The course's own value applies to your own work now:
    <strong>narrow and finished beats broad and broken.</strong> Pick <em>one</em> capability path
    (retrieval <em>or</em> an agent, not both), a <em>small</em> corpus or task, and go deep enough
    to evaluate it honestly. A tightly-scoped system with real numbers is an A; a sprawling one with
    a demo and no evidence is not.</p>

    <h2>Milestones</h2>
    <p>Build it in an order that keeps you honest — prove the loop end-to-end on day one, then deepen:</p>
    <ul>
      <li><strong>M1 — Skeleton.</strong> Scope locked, one working API call, and a <em>tiny</em> eval
        (even five cases) running. You have the whole loop, thin.</li>
      <li><strong>M2 — Capability.</strong> The real capability built (prompt + tools/retrieval or an
        agent) and its matching eval, with a baseline number.</li>
      <li><strong>M3 — Hardening.</strong> Tracing, cost and p95 latency measured, guardrails in.</li>
      <li><strong>M4 — Ship.</strong> Deployed as a service, a CI regression gate live, a
        monitoring/rollout plan, and the portfolio writeup.</li>
    </ul>

    <h2>How it's judged</h2>
    <p>Five dimensions, each scored 0/1/2 — and notice where the weight sits:</p>
    <ul>
      <li><strong>Eval rigor (the spine).</strong> A labeled dataset, the right metric, and
        <strong>confidence intervals</strong> on the headline number. Honest.</li>
      <li><strong>Capability + its eval.</strong> The thing works, and you measured it with the
        <em>right</em> capability-specific eval (groundedness, tool-correctness, or outcome+trajectory).</li>
      <li><strong>Production.</strong> Observable (tracing), cost and p95 latency measured, guarded.</li>
      <li><strong>Deployment.</strong> Prompt-versioned, a CI eval gate that blocks a regression, a
        monitoring/rollout plan.</li>
      <li><strong>Engineering &amp; honesty.</strong> Clean repo and git history, and a truthful
        account of what doesn't work yet.</li>
    </ul>

    <h2>Red-team swap</h2>
    <p>Before you submit, trade projects with another team and audit their <em>evidence</em>, one last
    time: run their eval yourself, try to break their guardrails, check that every headline number
    carries a confidence interval, and try to merge a deliberate regression past their CI gate. What
    you find, they fix — and what they find in yours, you fix.</p>

    ${Toolkit.widget(
      "Capstone red-team scorecard",
      `<div class="scorecard" id="cap-sc">
         <label class="sc-item"><input type="checkbox" data-sc> Their eval runs, on a real labeled dataset, and the headline number has a <strong>confidence interval</strong>.</label>
         <label class="sc-item"><input type="checkbox" data-sc> The capability has the <strong>right eval</strong> (groundedness / tool-correctness / outcome+trajectory), not just a demo.</label>
         <label class="sc-item"><input type="checkbox" data-sc> Every call is <strong>traced</strong>; cost and <strong>p95</strong> latency are measured.</label>
         <label class="sc-item"><input type="checkbox" data-sc> Guardrails hold against an adversarial input, and the guard's <strong>false-positive rate</strong> is known.</label>
         <label class="sc-item"><input type="checkbox" data-sc> A deliberate regression is <strong>blocked by their CI gate</strong> — it can't merge.</label>
         <label class="sc-item"><input type="checkbox" data-sc> The repo is clean, and the writeup is <strong>honest</strong> about limitations.</label>
       </div>
       <div class="sc-verdict" id="cap-verdict"></div>`
    )}

    <h2>Deliverables</h2>
    <ul class="checklist">
      <li><input type="checkbox" id="c1"><label for="c1">The system: a deployed service wrapping your evaluated, hardened pipeline.</label></li>
      <li><input type="checkbox" id="c2"><label for="c2">The eval suite: labeled dataset, metrics, headline number <em>with a confidence interval</em>.</label></li>
      <li><input type="checkbox" id="c3"><label for="c3">A CI regression gate (a red check that blocks a regressing merge) + a monitoring/rollout plan.</label></li>
      <li><input type="checkbox" id="c4"><label for="c4">The portfolio writeup — the next section is about making this the part that gets you hired.</label></li>
    </ul>

    ${Toolkit.instructorNote(
      `<strong>Running the capstone (~2–3 weeks / 6–9 sessions).</strong> Map the milestones to class
       time: M1 by end of week 1 (this is the anti-over-scoping checkpoint — if a team can't get a
       5-case eval running end-to-end, make them cut scope NOW), M2 mid, M3 early week 3, M4 + red-team
       swap + demo day at the end. The single highest-value intervention you can make is forcing scope
       down early: the failure mode is always "too ambitious, nothing finished, nothing measured."
       Require the eval before the features — a team that builds capability with no eval has learned
       nothing this term. Reserve the last session for the red-team swap and a demo day (each team: 5
       min system + the eval numbers, 2 min a classmate tries to break it).`
    )}

    ${Toolkit.instructorNote(
      `<strong>Grading key (0/1/2 each; 10 total).</strong> (1) Eval rigor — 2: labeled set + right
       metric + CI + honest about noise; 1: an eval but no CI or wrong metric; 0: a demo, no eval.
       (2) Capability + its eval — 2: works + the correct capability-specific eval; 1: works, weak eval;
       0: doesn't work or unmeasured. (3) Production — 2: tracing + cost + p95 + guardrails; 1: some;
       0: none. (4) Deployment — 2: service + a CI gate that actually blocks a regression + a
       rollout/monitoring plan; 1: deployed but no gate; 0: notebook only. (5) Engineering & honesty —
       2: clean repo, real git history, truthful limitations; 1: messy or oversold; 0: neither.
       Anchor the whole rubric on evidence over polish — the weight is deliberately on the eval and the
       CI gate, because that is the course's thesis. An 8+ is a genuine portfolio piece; tell them so.`
    )}

    ${Toolkit.instructorNote(
      `<strong>Failure modes to name on day one</strong> (they will hit these): over-scoping (cut it);
       demo-instead-of-eval (no number, no grade); a headline metric with no CI (Block 3 — it's not a
       result, it's an anecdote); guardrails tuned so tight they block real inputs (measure the
       false-positive rate); a CI "gate" that doesn't actually block anything (make them prove a
       regression can't merge); and a README that oversells (honesty is graded). Point them at the next
       section early — the portfolio writeup is where a good project becomes a job offer, and it should
       not be a last-night afterthought.`
    )}

    <h2>This is the job</h2>
    <p>Everything the last two courses built toward is in this one project. You will call a model you
    didn't train, make it reliable, measure whether it's actually any good, harden it against a messy
    world, and ship it where people depend on it — and you'll be able to <em>prove</em> every claim you
    make about it. That is the work. Not a clever prompt, not an impressive demo: a non-deterministic
    system made trustworthy, with the evidence to back it. Build that. Then, in the last section, let's
    make sure the world can see it.</p>
  `,

  onMount(root) {
    /* ---- Scenario switcher ---- */
    const SCN = {
      A: {
        name: "Support assistant",
        build: "A customer-support assistant over a real (small) document corpus — retrieval as a tool, input + output guardrails.",
        eval: "Groundedness (a kappa-validated judge) + recall@k on the corpus; task success rate with a CI. Capability path: retrieval.",
        watch: "Ungrounded answers, an injection that gets past the input guard, and a headline number with no CI.",
      },
      B: {
        name: "Research agent",
        build: "An agent that answers a multi-part question using 2–3 tools (incl. retrieval), with a goal, a step cap, and tracing.",
        eval: "Outcome success rate (with a CI) AND trajectory (steps + cost per task); a must-not-call boundary. Capability path: agent.",
        watch: "Non-termination, an outcome-pass-but-wasteful trajectory, and a consequential action with no gate.",
      },
      C: {
        name: "Extraction pipeline",
        build: "A structured-extraction pipeline over messy inputs — structured outputs (Pydantic), run at some scale.",
        eval: "Field-level accuracy / precision-recall on a labeled set (with a CI); cost per record and p95 latency as first-class metrics. Capability path: structured outputs.",
        watch: "Valid JSON that is quietly wrong (shape is not truth), unmeasured cost at scale, and no CI on accuracy.",
      },
    };
    const cardEl = root.querySelector("#cap-card");
    const tabs = Array.prototype.slice.call(root.querySelectorAll(".scn-tab"));
    function renderScenario(key) {
      const s = SCN[key];
      if (!cardEl) return;
      cardEl.innerHTML =
        `<div class="scn-name">${s.name}</div>
         <div class="scn-kind">Build: ${s.build}</div>
         <p class="scn-mission"><strong>Prove it with:</strong> ${s.eval}</p>
         <div class="scn-metrics"><strong>Red-team will watch for:</strong> ${s.watch}</div>`;
      tabs.forEach((t) => t.classList.toggle("active-mode", t.dataset.s === key));
    }
    tabs.forEach((t) => t.addEventListener("click", () => renderScenario(t.dataset.s)));
    renderScenario("A");

    /* ---- Full-lifecycle self-audit ---- */
    const GROUPS = [
      { name: "Foundation", block: "Blocks 1–2", items: ["A working Claude API call", "Structured outputs where they fit", "Cost per request known"] },
      { name: "Evaluation — the spine", block: "Block 3", items: ["A labeled eval dataset", "The right metric for the task", "A confidence interval on the headline number", "A kappa-validated judge (if using LLM-as-judge)"] },
      { name: "Capability", block: "Blocks 4–6", items: ["Prompt engineering, iterated with the eval", "Tools/retrieval OR an agent (one path)", "The matching capability eval"] },
      { name: "Production", block: "Block 7", items: ["Tracing on every call", "Cost + p95 latency measured", "Input + output guardrails"] },
      { name: "Deployment", block: "Block 8", items: ["Prompt versioning", "A CI regression eval gate", "A monitoring / rollout plan"] },
    ];
    const groupsEl = root.querySelector("#lc-groups");
    const meterEl = root.querySelector("#lc-meter");
    const meterTxt = root.querySelector("#lc-meter-txt");
    if (!groupsEl) return;
    let idc = 0;
    groupsEl.innerHTML = GROUPS.map((g, gi) =>
      `<div class="lc-group" data-g="${gi}">
         <div class="lc-g-head"><span class="lc-g-name">${g.name}</span><span class="lc-g-block">${g.block}</span><span class="lc-g-count" data-gc="${gi}"></span></div>
         ${g.items.map((it) => { idc++; return `<label class="lc-item"><input type="checkbox" data-lc data-g="${gi}"> ${it}</label>`; }).join("")}
       </div>`).join("");
    const boxes = Array.prototype.slice.call(groupsEl.querySelectorAll("[data-lc]"));
    function update() {
      const total = boxes.length, done = boxes.filter((b) => b.checked).length;
      const pct = Math.round((done / total) * 100);
      meterEl.style.width = pct + "%";
      meterEl.className = "lc-meter" + (pct === 100 ? " full" : "");
      meterTxt.textContent = done + " / " + total + " (" + pct + "%)";
      GROUPS.forEach((g, gi) => {
        const gb = boxes.filter((b) => +b.dataset.g === gi);
        const gd = gb.filter((b) => b.checked).length;
        const el = groupsEl.querySelector('[data-gc="' + gi + '"]');
        el.textContent = gd + "/" + gb.length;
        el.className = "lc-g-count" + (gd === gb.length ? " done" : "");
      });
    }
    boxes.forEach((b) => b.addEventListener("change", update));
    update();

    /* ---- Red-team scorecard ---- */
    const scBoxes = Array.prototype.slice.call(root.querySelectorAll("#cap-sc [data-sc]"));
    const verdictEl = root.querySelector("#cap-verdict");
    function score() {
      const n = scBoxes.filter((b) => b.checked).length;
      let cls, msg;
      if (n >= 5) { cls = "real"; msg = "A genuine portfolio piece — evaluated, hardened, deployed, and defensible. Ship it and put it at the top of your resume."; }
      else if (n >= 3) { cls = "inconc"; msg = "Close. The unchecked items are exactly what a hiring engineer would poke at — fix them before demo day."; }
      else { cls = "worse"; msg = "Still a project, not yet a portfolio piece — the evidence isn't there. This is the gap between a demo and the job."; }
      verdictEl.className = "sc-verdict " + cls;
      verdictEl.innerHTML = "<strong>" + n + " of 6</strong> — " + msg;
    }
    scBoxes.forEach((b) => b.addEventListener("change", score));
    score();
  },
};
