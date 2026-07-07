/* ============================================================
   Section: Studio — build and evaluate an agent  (STUDIO) — caps Block 6
   (course section 31). Teams build a small agent (2-3 tools incl.
   retrieval, a goal, a step cap, tracing), then EVALUATE it on BOTH axes
   (outcome success rate WITH a CI + trajectory: steps + cost per task) and
   red-team it for the new failure modes (non-termination, drift,
   hallucinated tools, compounding errors, ungated consequential actions).
   Studio pattern: scenario switcher A/B/C + build rules + red-team
   scorecard + deliverables + "this is the job".
   Reuses the .scn- and .sc- and .scorecard CSS.
   Heavy instructor scaffolding, all HIDDEN via Toolkit.instructorNote.

   NOTE (playbook): studio = brief; ends "this is the job". No literal
   dollar signs; no backtick chars in prose; no star-slash inside comments;
   curly quotes literal.
   ============================================================ */

window.SectionContent["agent-studio"] = {
  title: "Studio: build and evaluate an agent",

  html: `
    <div class="eyebrow">Agents · Section 33 · Studio</div>
    <h1>Studio: build and evaluate an agent</h1>

    <p>The whole trilogy comes together here. Your team builds a real agent — a goal, a few tools
    including retrieval, a step cap, and a trace — and then does the hard part that separates an
    engineer from a demo-builder: you <strong>measure it on both axes</strong>. Did it reach the
    goal, and did it get there by a sensible, affordable path? A slick agent run is worth nothing
    without the evidence; the evidence is the deliverable.</p>

    <p>Teams of three or four. Pick a brief:</p>

    ${Toolkit.widget(
      "Studio briefs",
      `<div class="scn-tabs">
         <button class="btn ghost scn-tab active-mode" data-s="A">A · Returns agent</button>
         <button class="btn ghost scn-tab" data-s="B">B · Research assistant</button>
         <button class="btn ghost scn-tab" data-s="C">C · Ops agent (with a real action)</button>
       </div>
       <div class="scn-card" id="ag-card"></div>`
    )}

    <h2>Build rules</h2>
    <ul>
      <li><strong>A goal in the system prompt</strong> — the agent's standing policy, including a
        grounding rule (search before answering) where it applies.</li>
      <li><strong>Two or three tools</strong>, one of which is <code>search_docs</code> over a
        small corpus you assemble.</li>
      <li><strong>A <code>MAX_STEPS</code> cap from the first line</strong> — bounded runs, never
        <code>while True</code>. Handle the &ldquo;ran out of steps&rdquo; case.</li>
      <li><strong>Trace every step</strong> — plan, tool, arguments, result, cost. You will need it
        to diagnose a failure, and you cannot debug what you cannot see.</li>
      <li><strong>Gate consequential actions</strong> — if a tool does something irreversible, put
        a human approval step in front of it.</li>
    </ul>

    <h2>Evaluate it (this is the point)</h2>
    <ul>
      <li><strong>Outcome</strong> — a task set with checkable goals; report the
        <strong>success rate with a confidence interval</strong> (bare numbers don't count), on
        enough tasks that the interval means something.</li>
      <li><strong>Trajectory</strong> — measure <strong>steps-to-completion and cost per task</strong>;
        flag any task that passed by a wasteful or lucky path (the outcome-pass, trajectory-fail
        cell).</li>
      <li><strong>An edge bucket</strong> — include tasks that are out-of-policy, unanswerable, or
        adversarial. The right outcome there may be &ldquo;refuse&rdquo; or &ldquo;escalate,&rdquo;
        and your eval must score that too.</li>
    </ul>

    <h2>Red-team round</h2>
    <p>Swap with another team and audit their <strong>evidence and their harness</strong>, not
    their demo:</p>

    ${Toolkit.widget(
      "Agent-reliability scorecard",
      `<div class="scorecard" id="ag-sc">
         <label class="sc-item"><input type="checkbox" data-sc> The loop has a <strong>MAX_STEPS cap</strong> and handles the ran-out-of-steps case — no unbounded runs.</label>
         <label class="sc-item"><input type="checkbox" data-sc> Success rate is reported <strong>with a confidence interval</strong>, on enough tasks to mean something.</label>
         <label class="sc-item"><input type="checkbox" data-sc> <strong>Trajectory is measured</strong> (steps + cost per task), not just outcome.</label>
         <label class="sc-item"><input type="checkbox" data-sc> The task set includes a <strong>hard/edge bucket</strong> (out-of-policy, unanswerable) and scores the right refusal.</label>
         <label class="sc-item"><input type="checkbox" data-sc> Any <strong>consequential action is behind a human gate</strong> (or there are none by design).</label>
         <label class="sc-item"><input type="checkbox" data-sc> <strong>Every step is traced</strong>, so at least one failure can be diagnosed to the step that broke.</label>
       </div>
       <div class="sc-verdict" id="ag-verdict"></div>`
    )}

    <h2>Deliverables</h2>
    <ul class="checklist">
      <li><input type="checkbox" id="a1"><label for="a1">The agent: its goal (system prompt), tools, the capped loop, and the trace.</label></li>
      <li><input type="checkbox" id="a2"><label for="a2">A task set including an edge bucket, with a checkable expected outcome per task.</label></li>
      <li><input type="checkbox" id="a3"><label for="a3">Outcome success rate <em>with a CI</em>, plus trajectory metrics (avg steps, cost per task).</label></li>
      <li><input type="checkbox" id="a4"><label for="a4">One failure diagnosed from the trace: which step broke, why, and the fix.</label></li>
    </ul>

    ${Toolkit.instructorNote(
      `<strong>Facilitation (~60-90 min; a double block is ideal).</strong> 10 pick brief + assemble
       corpus · 20 build agent (goal, tools, cap, trace) — reuse last section's loop, don't rebuild
       from scratch · 25 build the task set + both-axis eval — this is the learning, and where teams
       will want to skip straight to a demo · 10 red-team swap · 15 debrief. If time is short, five
       tasks and two tools is fine; a small honest two-axis eval beats a big demo with no numbers.`
    )}

    ${Toolkit.instructorNote(
      `<strong>Answer key — a strong Scenario A.</strong> Goal in SYSTEM: &ldquo;compute the exact
       refund; always search the policy first; if the return is out of policy, say so and
       escalate.&rdquo; Tools: <code>search_docs</code> over ~10 policy passages + <code>calculator</code>.
       Task set: several in-policy refunds at different day-counts (checkable numbers), plus an edge
       bucket — a 200-day return (expect: refuse/escalate) and an ambiguous case. Outcome: string/number
       check on the refund; success rate with a CI. Trajectory: avg steps, cost per task; flag any task
       that searched more than once needlessly. A team that shows a working agent but reports only
       &ldquo;it works&rdquo; with no CI, no cost, no edge case, and no trace has missed the entire
       block — and that gap is the lesson.`
    )}

    ${Toolkit.instructorNote(
      `<strong>Grade the evidence, 0/1/2 each:</strong> (1) Agent design — goal-bearing system prompt,
       sensible tools, a cap, and tracing built in. (2) Outcome eval — checkable task set incl. an edge
       bucket; success rate WITH a CI. (3) Trajectory + cost — steps and cost per task measured; the
       wasteful-but-correct case noticed. (4) Rigor — a failure diagnosed from the trace, and consequential
       actions gated. 8/8 is an agent whose reliability and cost you could defend in a real review.
       Failure modes to name aloud: demo-instead-of-eval, bare success rate with no CI, ignoring cost,
       no edge bucket, no trace (so no diagnosis possible), ungated irreversible actions.`
    )}

    <h2>This is the job</h2>
    <p>Building an agent that works in a demo is an afternoon. Building one you can <em>stand behind</em>
    is this studio: you know its success rate and the uncertainty on it, you know what each task costs,
    you've seen how it behaves on the cases designed to break it, and when it fails you can point to the
    exact step and say why. That is the difference between something that impresses a room and something
    a business can run. Autonomy is easy to show off and hard to trust — your job is to make it
    trustworthy, and to prove that it is.</p>
  `,

  onMount(root) {
    /* ---- Scenario switcher ---- */
    const SCN = {
      A: {
        name: "Returns agent",
        tools: "search_docs (policy passages) + calculator. Goal: state the exact refund owed.",
        eval: "Outcome: is the refund number right (and does it refuse out-of-policy returns)? Trajectory: did it search before answering, and in how few steps? Report success rate + CI, avg steps, cost.",
        watch: "Answering refund questions from memory (skipped the search), wrong fee tier, and any run that searches the same thing repeatedly.",
      },
      B: {
        name: "Research assistant",
        tools: "search_docs (a small corpus) + calculator + an optional stub fetch. Goal: answer a multi-part question with a grounded synthesis.",
        eval: "Outcome: is the synthesis complete AND grounded in the corpus (a judge on groundedness)? Trajectory: steps, cost, and whether it stayed on the goal. Report both axes.",
        watch: "Goal drift (wandering off onto an adjacent subtopic), invented facts not in the corpus, and a run that loops without converging.",
      },
      C: {
        name: "Ops agent (with a real action)",
        tools: "search_docs + calculator + a CONSEQUENTIAL tool (e.g. issue_refund) that must be gated. Goal: decide and, on approval, act.",
        eval: "Outcome: correct decision + correct action only when appropriate. Trajectory: steps, cost. Crucially: is the irreversible action behind a human approval gate?",
        watch: "The agent taking the irreversible action with no gate, compounding an early misread into a wrong action, and no trace to reconstruct what it did.",
      },
    };
    const cardEl = root.querySelector("#ag-card");
    const tabs = Array.prototype.slice.call(root.querySelectorAll(".scn-tab"));
    function renderScenario(key) {
      const s = SCN[key];
      if (!cardEl) return;
      cardEl.innerHTML =
        `<div class="scn-name">${s.name}</div>
         <div class="scn-kind">Tools + goal: ${s.tools}</div>
         <p class="scn-mission"><strong>Evaluate:</strong> ${s.eval}</p>
         <div class="scn-metrics"><strong>Red-team will watch for:</strong> ${s.watch}</div>`;
      tabs.forEach((t) => t.classList.toggle("active-mode", t.dataset.s === key));
    }
    tabs.forEach((t) => t.addEventListener("click", () => renderScenario(t.dataset.s)));
    renderScenario("A");

    /* ---- Scorecard ---- */
    const boxes = Array.prototype.slice.call(root.querySelectorAll("#ag-sc [data-sc]"));
    const verdictEl = root.querySelector("#ag-verdict");
    function score() {
      const n = boxes.filter((b) => b.checked).length;
      let cls, msg;
      if (n >= 5) { cls = "real"; msg = "Trustworthy — you know its success rate, its cost, how it fails, and you can bound and diagnose it. Defensible in a real review."; }
      else if (n >= 3) { cls = "inconc"; msg = "Partly there. The unchecked items are exactly where an autonomous system quietly costs or breaks in production."; }
      else { cls = "worse"; msg = "A demo, not a trustworthy agent — unbounded, unmeasured, or unobservable. Impressive in a room, unsafe in the wild."; }
      verdictEl.className = "sc-verdict " + cls;
      verdictEl.innerHTML = "<strong>" + n + " of 6</strong> — " + msg;
    }
    boxes.forEach((b) => b.addEventListener("change", score));
    score();
  },
};
