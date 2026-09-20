/* ============================================================
   Section: Multiple agents  (CONCEPT) — Block 6 section 5
   (course section 30). The honest treatment of orchestration / sub-agents
   / "swarms" — the thing students read about and are drawn to.
     - honest core: multiple agents are SOMETIMES the right architecture,
       more often not. Default to one capable agent.
     - when it genuinely helps: parallel INDEPENDENT subtasks (fan-out),
       context isolation (clean focused context per worker), specialization
     - the pattern: orchestrator-worker (decompose -> spawn workers ->
       collect -> synthesize)
     - when it hurts (the common case): cost multiplies, latency +
       coordination overhead, errors compound across hand-offs, and now you
       must evaluate the SYSTEM, not one agent
     - honest default: one good agent with good tools beats a swarm you
       can't debug; reach for multi-agent only for genuinely independent
       parallel work / isolation, and only if you can eval the whole system
   Concept section: no inline problems; ends "What you learned".

   Star interactive: task-shape switcher — pick a task shape and see whether
   multiple agents help or hurt, the pattern to use, and the tradeoff.

   NOTE: kept CONCEPTUAL on purpose — no click-specific API lab, so we don't
   commit to an unverified orchestration surface. A multi-agent LAB would
   require verifying the current API from source first.

   NOTE (playbook): no literal dollar signs; no backtick chars in prose;
   no star-slash inside comments; instructor notes hidden.
   ============================================================ */

window.SectionContent["multiple-agents"] = {
  title: "Multiple agents",

  html: `
    <div class="eyebrow">Agents · Section 34</div>
    <h1>Multiple agents</h1>

    <p>This is the part you've read the breathless posts about: <strong>orchestration,
    sub-agents, swarms</strong> — a fleet of AIs dividing up the work. It's genuinely a real
    pattern, and it's genuinely oversold. The hireable skill here is not building a swarm; it's
    knowing the narrow set of cases where more agents actually help, and recognizing the far
    larger set where one good agent is simpler, cheaper, and more reliable.</p>

    <h2>The pattern: orchestrator and workers</h2>

    <p>Multi-agent systems almost always take one shape. An <strong>orchestrator</strong> agent
    breaks a goal into pieces, hands each piece to a <strong>worker</strong> agent (its own loop,
    its own tools, its own clean context), collects what comes back, and synthesizes a final
    result. If that sounds familiar, it should — it's the tool-use loop one level up, where some
    of the &ldquo;tools&rdquo; are themselves agents.</p>

    <h2>When more agents genuinely help</h2>
    <p>Three situations, and they're more specific than the hype suggests:</p>
    <ul>
      <li><strong>Parallel, independent subtasks.</strong> If the work fans out into pieces that
        don't depend on each other — summarize eight documents, research five unrelated
        companies — workers can run <em>at the same time</em>. That's a real latency win, because
        the pieces genuinely don't need to talk.</li>
      <li><strong>Context isolation.</strong> A long single agent drowns in its own history;
        irrelevant earlier steps crowd the context and degrade its judgment. Giving each worker a
        <em>clean, focused</em> context — just its one subtask — can beat one agent juggling
        everything, with the orchestrator holding the big picture.</li>
      <li><strong>Genuine specialization.</strong> Occasionally two subtasks are so different in
        tools and instructions (a code-writing worker vs. a data-lookup worker) that separate,
        focused agents each do their job better than one generalist stretched across both.</li>
    </ul>

    <h2>When it hurts — which is more often</h2>
    <p>Every agent you add is a full loop of many model calls, and coordinating them is not free:</p>
    <ul>
      <li><strong>Cost multiplies.</strong> Five worker agents is roughly five agents' worth of
        calls, plus the orchestrator's. A swarm can cost an order of magnitude more than one agent
        for the same job.</li>
      <li><strong>Latency and coordination overhead.</strong> Unless the work is truly parallel and
        independent, you've added hand-offs, waiting, and glue — often slower, not faster.</li>
      <li><strong>Errors compound across hand-offs.</strong> A worker that returns something subtly
        wrong poisons everything the orchestrator builds on it, and the mistake is now buried two
        agents deep.</li>
      <li><strong>You must now evaluate the whole system.</strong> Everything from the last two
        sections — non-determinism, trajectory eval, tracing — gets multiplied. Debugging one
        agent was hard; debugging a swarm where agents call agents is much harder.</li>
    </ul>

    <p>Run a few task shapes through the decision — notice how rarely the honest answer is
    &ldquo;yes, use a swarm&rdquo;:</p>

    ${Toolkit.widget(
      "One agent or many?",
      `<div class="ma-tabs">
         <button class="btn ghost ma-tab active-mode" data-t="0">Summarize 8 unrelated docs</button>
         <button class="btn ghost ma-tab" data-t="1">Deep research, 5 subtopics</button>
         <button class="btn ghost ma-tab" data-t="2">Fill a form, each field builds on the last</button>
         <button class="btn ghost ma-tab" data-t="3">Answer one support question</button>
       </div>
       <div class="ma-card" id="ma-card"></div>`
    )}

    <h2>The honest default</h2>
    <p>Start with <strong>one capable agent and good tools.</strong> It is easier to build, far
    easier to evaluate, and cheaper to run — and it is the right answer for most tasks that <em>feel</em>
    like they want a swarm. Reach for multiple agents when the work genuinely decomposes into
    <strong>independent, parallel</strong> pieces or genuinely needs <strong>context isolation</strong> —
    and only when you can afford to evaluate the whole system, not just admire the diagram. A swarm you
    can't measure is not an advanced system; it's an expensive one you don't understand.</p>

    ${Toolkit.instructorNote(
      `Students are magnetically drawn to multi-agent (it looks like the future, and the demos are
       flashy). Don't crush the enthusiasm — redirect it into judgment. The framing that lands:
       &ldquo;anyone can wire up five agents; an engineer knows the three cases where it helps and
       the ten where it doesn't.&rdquo; The honest single-vs-multi call IS the hireable skill,
       because it's the one most people get wrong by defaulting to complexity. If your program or
       university is under pressure to look cutting-edge with multi-agent systems, this is exactly
       the section that arms students to build the <em>right</em> thing rather than the impressive-
       looking thing — and to say, credibly, why. Kept conceptual on purpose: a real multi-agent
       lab means committing to an orchestration API, which we'd want to verify from source first;
       the judgment here transfers regardless of which framework a job uses.`
    )}

    <h2>What you learned</h2>
    <ul>
      <li>Multi-agent systems take the <strong>orchestrator-worker</strong> shape — the tool-use
        loop one level up, where some tools are themselves agents.</li>
      <li>More agents genuinely help for <strong>parallel independent subtasks, context isolation,
        and true specialization</strong> — and little else.</li>
      <li>They usually <strong>hurt</strong>: cost multiplies, coordination adds latency and failure
        modes, errors compound across hand-offs, and you must evaluate the whole system.</li>
      <li>Default to <strong>one capable agent</strong>; reach for many only when the work truly
        decomposes <em>and</em> you can measure the result. The judgment call is the skill.</li>
    </ul>
  `,

  onMount(root) {
    /* ---- Task-shape switcher: does multi-agent help? ---- */
    const TASKS = [
      {
        verdict: "helps",
        use: "Orchestrator + parallel workers (fan-out).",
        why: "Eight summaries that don't depend on each other can run at the same time — a real latency win, and each worker gets a clean context with just its own document.",
        cost: "Cost is about the same total work as one agent doing them in sequence, but wall-clock time drops sharply.",
      },
      {
        verdict: "helps",
        use: "Orchestrator + specialized workers, for context isolation.",
        why: "Each subtopic gets its own focused agent that isn't drowning in the other four subtopics' history; the orchestrator synthesizes at the end.",
        cost: "More expensive than one agent, but the isolation can meaningfully improve quality on genuinely separable research.",
      },
      {
        verdict: "hurts",
        use: "One agent. Do NOT split this up.",
        why: "Each field depends on the previous one, so there's nothing to parallelize. Splitting it adds hand-offs and coordination for zero speedup — and each hand-off is a chance to drop context.",
        cost: "Multi-agent here is pure overhead: more calls, more latency, more failure modes, no benefit.",
      },
      {
        verdict: "hurts",
        use: "One agent — arguably not even an agent, just a call with a retrieval tool.",
        why: "A single support question is a one-shot job. A swarm is wildly overkill: you'd pay for an orchestrator and workers to answer something one grounded call handles.",
        cost: "Orders of magnitude more cost and latency than the task deserves. Complexity for its own sake.",
      },
    ];
    const tabs = Array.prototype.slice.call(root.querySelectorAll(".ma-tab"));
    const cardEl = root.querySelector("#ma-card");
    if (!cardEl) return;

    function render(idx) {
      const t = TASKS[idx];
      const helps = t.verdict === "helps";
      cardEl.className = "ma-card " + (helps ? "helps" : "hurts");
      cardEl.innerHTML =
        `<div class="ma-verdict">${helps ? "✓ Multiple agents help here" : "✗ Use one agent"}</div>
         <div class="ma-rows">
           <div class="ma-row"><span class="ma-k">Use</span><span>${t.use}</span></div>
           <div class="ma-row"><span class="ma-k">Why</span><span>${t.why}</span></div>
           <div class="ma-row"><span class="ma-k">The tradeoff</span><span>${t.cost}</span></div>
         </div>`;
      tabs.forEach((tb, k) => tb.classList.toggle("active-mode", k === idx));
    }
    tabs.forEach((tb, k) => tb.addEventListener("click", () => render(k)));
    render(0);
  },
};
