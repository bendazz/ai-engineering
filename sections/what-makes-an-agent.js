/* ============================================================
   Section: What makes it an agent  (CONCEPT) — opens Block 6
   "Agents", course section 26.
     - the leap: in Block 5 YOUR code drove the loop (checked stop_reason,
       decided whether to continue). An agent moves that decision INTO the
       model. Same loop, different driver.
     - the autonomy spectrum: single call (you control all) -> workflow
       (your code owns the plan, model fills steps) -> agent (model owns
       the plan: picks tools, order, and when it's done)
     - what you gain (open-ended, adaptive) vs what you pay (non-determinism
       at the PLAN level, cost, latency, harder to control/debug)
     - the four-question gate (should I build an agent?): complexity, value,
       viability, cost-of-error. Any "no" -> step down.
     - honest default: reach for the simplest thing that works; most
       "agents" are workflows in disguise.
   Concept section: no inline problems; ends "What you learned".

   Star interactive: autonomy-spectrum stepper (single call / workflow /
   agent — who controls flow, predictability, cost, when to use). Plus a
   compact "should you build an agent?" task picker scored on 4 criteria.

   VERIFIED (claude-api skill, 2026-07-02): the "Should I build an agent?"
   four criteria (complexity, value, viability, cost-of-error) and the
   workflow-vs-agent framing come from the skill's decision guidance.

   NOTE (playbook): no literal dollar signs; no backtick chars in prose;
   no star-slash inside comments; no dollar-brace in comments; instructor
   notes hidden via Toolkit.instructorNote.
   ============================================================ */

window.SectionContent["what-makes-an-agent"] = {
  title: "What makes it an agent",

  html: `
    <div class="eyebrow">Agents · Section 30</div>
    <h1>What makes it an agent</h1>

    <p>You already built the machine. In the last block, your <code>while</code> loop drove
    everything: it called the model, checked <code>stop_reason</code>, ran the tools the model
    asked for, and decided whether to go around again. An <strong>agent</strong> is that exact
    loop with one thing changed — the decision about <em>what to do next</em> moves out of your
    code and into the model. Same loop, different driver.</p>

    <p>That single shift is the whole story of this block: what it unlocks, what it costs, and —
    because it's this course — how you would ever <em>know</em> it worked.</p>

    <h2>The autonomy spectrum</h2>

    <p>&ldquo;Agent&rdquo; isn't a yes/no label; it's the far end of a spectrum of how much
    control you hand to the model. Step across it:</p>

    ${Toolkit.widget(
      "Who drives the loop?",
      `<div class="as-track" id="as-track"></div>
       <div class="controls">
         <button class="btn ghost" id="as-back">Back</button>
         <button class="btn" id="as-next">More autonomy</button>
       </div>
       <div class="as-card" id="as-card"></div>`
    )}

    <p>The dividing line is simple: <strong>who owns the plan?</strong> In a workflow,
    <em>you</em> do — you wrote the flowchart, and the model just fills in each box (classify
    this, summarize that). In an agent, the <em>model</em> owns the plan — it decides which
    tools to call, in what order, and when the goal is met. You can't draw its flowchart in
    advance, because the flowchart depends on what the model discovers along the way.</p>

    <h2>What you gain, and what you pay</h2>

    <p>Autonomy is not free power — it's a trade, and being clear-eyed about both sides is what
    separates an engineer from someone chasing a demo.</p>

    <div class="two-col">
      ${Toolkit.callout(
        `<strong>What you gain</strong>
         <ul>
           <li><strong>Open-ended tasks</strong> you can't fully specify up front — &ldquo;find
             out why this customer is unhappy and draft a reply&rdquo; has no fixed flowchart.</li>
           <li><strong>Adaptivity</strong> — the agent reacts to what a tool returns and changes
             course, instead of following a script that breaks on the first surprise.</li>
         </ul>`,
        { type: "note", label: "Upside" }
      )}
      ${Toolkit.callout(
        `<strong>What you pay</strong>
         <ul>
           <li><strong>Non-determinism at the plan level</strong> — not just different wording
             (Block 2), but a different <em>sequence of actions</em> each run. Much harder to test.</li>
           <li><strong>Cost and latency</strong> — an agent makes many model calls per task, not one.</li>
           <li><strong>Control and debugging</strong> — when it goes wrong, it went wrong somewhere
             in a trajectory you didn't write.</li>
         </ul>`,
        { type: "warn", label: "Downside" }
      )}
    </div>

    <h2>Should you build an agent? Four questions</h2>

    <p>Before you reach for an agent, run the task through four gates. If the answer to any one
    is &ldquo;no,&rdquo; step back down the spectrum to a workflow or a single call.</p>

    <ul>
      <li><strong>Complexity</strong> — is the task genuinely multi-step and hard to specify in
        advance? <em>If you can draw the flowchart yourself, write the workflow.</em></li>
      <li><strong>Value</strong> — does the outcome justify the extra cost and latency an agent
        spends?</li>
      <li><strong>Viability</strong> — is the model actually capable at this kind of task? An
        agent can't out-run a model that can't do the underlying job.</li>
      <li><strong>Cost of error</strong> — when it makes a mistake, can you catch and recover
        (tests, review, rollback, a human approval gate)? Autonomy is only safe where errors are
        survivable.</li>
    </ul>

    <p>Try a few tasks against the gate:</p>

    ${Toolkit.widget(
      "Should this be an agent?",
      `<div class="sb-tabs">
         <button class="btn ghost sb-tab active-mode" data-t="0">Extract a date from a PDF</button>
         <button class="btn ghost sb-tab" data-t="1">Triage + resolve a support ticket</button>
         <button class="btn ghost sb-tab" data-t="2">Auto-merge to production</button>
       </div>
       <div class="sb-grid" id="sb-grid"></div>
       <div class="sb-verdict" id="sb-verdict"></div>`
    )}

    <h2>The honest default: the simplest thing that works</h2>

    <p>Here is the instinct worth building: <strong>most problems that sound like they need an
    agent are workflows in disguise.</strong> A workflow you can test, price, and predict is worth
    more than an agent you can only hope about. So start at the cheap end of the spectrum and only
    move right when the task genuinely needs the model to chart its own course. Reaching for the
    biggest tool first is how demos get built and how production systems get into trouble.</p>

    ${Toolkit.instructorNote(
      `The one-line test that makes this stick: <strong>can you draw the flowchart?</strong> If you
       can sketch the decision flow yourself before running anything, it's a workflow — code the
       flowchart, call the model at each box, and enjoy something testable. If the flow depends on
       what the model finds partway through (the third step exists only because step two returned
       something surprising), it's an agent. Students arrive thinking &ldquo;agent&rdquo; is the
       impressive, correct answer; the hireable instinct is the opposite — reach for the least
       autonomy that does the job. Tie this forward to eval: everything that makes an agent
       attractive (it charts its own path) is exactly what makes it hard to measure, which is the
       next two sections.`
    )}

    <h2>What you learned</h2>
    <ul>
      <li>An <strong>agent is the tool-use loop with the model in the driver's seat</strong> — it
        decides which tools to call, in what order, and when it's done.</li>
      <li>The <strong>autonomy spectrum</strong> runs single call → workflow (you own the plan) →
        agent (the model owns the plan); the dividing line is <em>who owns the plan</em>.</li>
      <li>Autonomy trades testability, cost, and control for the ability to handle
        <strong>open-ended, adaptive</strong> tasks.</li>
      <li>Run every candidate through the <strong>four gates</strong> — complexity, value,
        viability, cost of error — and default to the <strong>simplest thing that works</strong>.</li>
    </ul>
  `,

  onMount(root) {
    /* ---- Autonomy-spectrum stepper ---- */
    const STAGES = [
      {
        name: "Single call",
        driver: "You — entirely",
        flow: "One prompt in, one answer out. No loop.",
        pred: "High — same input, nearly the same output.",
        cost: "One model call.",
        when: "Classify, summarize, extract, answer. Most tasks live here.",
      },
      {
        name: "Workflow",
        driver: "Your code owns the plan",
        flow: "You chain calls with logic YOU wrote (if/else, loops, retries). The model fills in each step.",
        pred: "High — you can draw the flowchart and test each branch.",
        cost: "A handful of calls, in a shape you control.",
        when: "Multi-step tasks whose steps you CAN specify up front.",
      },
      {
        name: "Agent",
        driver: "The model owns the plan",
        flow: "You give tools + a goal; the model decides which tools, in what order, and when to stop.",
        pred: "Low — the trajectory varies run to run; you can't draw it in advance.",
        cost: "Many calls per task — variable, and often large.",
        when: "Open-ended tasks you CANNOT fully specify — the model must chart the course.",
      },
    ];
    let i = 0;
    const trackEl = root.querySelector("#as-track");
    const cardEl = root.querySelector("#as-card");
    const nextBtn = root.querySelector("#as-next");
    const backBtn = root.querySelector("#as-back");
    if (!trackEl) return;

    function render() {
      trackEl.innerHTML = STAGES.map((s, k) =>
        `<div class="as-node${k === i ? " on" : ""}${k < i ? " past" : ""}">
           <div class="as-dot"></div><div class="as-label">${s.name}</div>
         </div>` +
        (k < STAGES.length - 1 ? '<div class="as-line' + (k < i ? " past" : "") + '"></div>' : "")
      ).join("");
      const s = STAGES[i];
      cardEl.innerHTML =
        `<div class="as-name">${s.name}</div>
         <div class="as-rows">
           <div class="as-row"><span class="as-k">Who drives</span><span>${s.driver}</span></div>
           <div class="as-row"><span class="as-k">The loop</span><span>${s.flow}</span></div>
           <div class="as-row"><span class="as-k">Predictability</span><span>${s.pred}</span></div>
           <div class="as-row"><span class="as-k">Cost</span><span>${s.cost}</span></div>
           <div class="as-row"><span class="as-k">Use it for</span><span>${s.when}</span></div>
         </div>`;
      backBtn.disabled = i === 0;
      nextBtn.disabled = i === STAGES.length - 1;
      nextBtn.textContent = i === STAGES.length - 1 ? "Full autonomy" : "More autonomy";
    }
    nextBtn.addEventListener("click", () => { if (i < STAGES.length - 1) { i++; render(); } });
    backBtn.addEventListener("click", () => { if (i > 0) { i--; render(); } });
    render();

    /* ---- Should-you-build-an-agent task picker ---- */
    const TASKS = [
      {
        crit: [
          { k: "Complexity", ok: false, note: "One step — read a field. No plan to make." },
          { k: "Value", ok: false, note: "Low stakes; a single call is plenty." },
          { k: "Viability", ok: true, note: "Models extract fields reliably." },
          { k: "Cost of error", ok: true, note: "Easy to check the date is sane." },
        ],
        verdict: "no",
        line: "A single call. There is no plan here to hand over — reaching for an agent adds cost and risk for nothing.",
      },
      {
        crit: [
          { k: "Complexity", ok: true, note: "Read, search docs, decide, maybe escalate — steps depend on the ticket." },
          { k: "Value", ok: true, note: "Resolving tickets end-to-end is worth real money." },
          { k: "Viability", ok: true, note: "With good tools + retrieval, the model can do the underlying job." },
          { k: "Cost of error", ok: true, note: "A human can review drafts before they send; mistakes are recoverable." },
        ],
        verdict: "yes",
        line: "A genuine agent case: the path depends on what the ticket turns out to be, the value is real, and errors are catchable behind a review gate.",
      },
      {
        crit: [
          { k: "Complexity", ok: true, note: "Multi-step: read the diff, run tests, decide." },
          { k: "Value", ok: true, note: "Saving engineer time is valuable." },
          { k: "Viability", ok: true, note: "The model can reason about code." },
          { k: "Cost of error", ok: false, note: "A wrong merge ships a bug to users — hard to catch, expensive to undo." },
        ],
        verdict: "no",
        line: "Fails the last gate. The task is agent-shaped, but an unrecoverable error (bad code in production) means you do NOT hand over full autonomy — keep a human approval gate before the merge.",
      },
    ];
    const tabs = Array.prototype.slice.call(root.querySelectorAll(".sb-tab"));
    const gridEl = root.querySelector("#sb-grid");
    const sbVerdict = root.querySelector("#sb-verdict");
    function renderTask(idx) {
      const t = TASKS[idx];
      gridEl.innerHTML = t.crit.map((c) =>
        `<div class="sb-cell ${c.ok ? "ok" : "no"}">
           <div class="sb-cell-head"><span class="sb-mark">${c.ok ? "✓" : "✗"}</span>${c.k}</div>
           <div class="sb-note">${c.note}</div>
         </div>`).join("");
      const good = t.verdict === "yes";
      sbVerdict.className = "sb-verdict " + (good ? "real" : "worse");
      sbVerdict.innerHTML = "<strong>" + (good ? "Build an agent." : "Don't — step down.") +
        "</strong> " + t.line;
      tabs.forEach((tb, k) => tb.classList.toggle("active-mode", k === idx));
    }
    tabs.forEach((tb, k) => tb.addEventListener("click", () => renderTask(k)));
    renderTask(0);
  },
};
