/* ============================================================
   Section: Evaluating agents  (LAB) — Block 6 section 3
   (course section 28). The spine, at its hardest.
     - why agent eval is hard: the trajectory is non-deterministic (not
       just wording — the whole PLAN varies), multi-step, partial credit,
       many valid paths
     - TWO axes:
       * outcome eval — did it reach the goal? end-state check
         (programmatic where possible) + LLM judge on the final result
       * trajectory eval — did it take a SENSIBLE path? right tools,
         efficient, no wasted/looping steps (callback evaluating-tools)
     - they can DISAGREE: right answer by a wasteful/lucky route; or a
       sensible path to a wrong answer
     - new metrics: task success rate (WITH a CI — callback is-the-
       difference-real), steps-to-completion, cost-per-task
     - build the agent-eval harness; the small-n CI is honestly wide
   LAB: predict-then-reveal; ends "What you accomplished".

   Star interactive: agent-eval dashboard — a task set with per-task
   outcome (pass/fail) + trajectory tag + steps; rolled-up success rate
   (REAL normal-approx CI), avg steps, avg cost; toggle Agent v1 vs v2 to
   see the accuracy-vs-cost tradeoff and the wide small-n interval.

   Facts: all stats are Block-3 machinery reused (proportion CI, judge).
   No new external API facts.

   NOTE (playbook): no literal dollar signs (cost in plain numbers / cents);
   no backtick chars in prose; no star-slash inside comments; NO literal
   backslash-n inside Toolkit.code bodies; instructor notes hidden.
   ============================================================ */

window.SectionContent["evaluating-agents"] = {
  title: "Evaluating agents",

  html: `
    <div class="eyebrow">Agents · Section 32 · Lab</div>
    <h1>Evaluating agents</h1>

    <p>Here is where autonomy sends the bill. Everything that made an agent attractive — it
    charts its own path — is exactly what makes it hard to measure. A single call gave one
    answer you could grade. An agent gives you a whole <strong>trajectory</strong> that varies
    run to run, takes many steps, and can be half-right. The eval spine of this course doesn't
    break here; it just has to grow a second dimension.</p>

    <h2>Two questions, not one</h2>

    <p>A single-call eval asked one thing: was the answer good? An agent forces you to ask
    <strong>two</strong>, and to keep them separate:</p>

    <ul>
      <li><strong>Outcome</strong> — did the agent actually <em>reach the goal</em>? This is an
        end-state check: did the refund come out right, did the ticket get resolved, is the file
        in the right place? Where you can check it in code, do (an exact match, a number in
        range); where you can't, an <strong>LLM judge</strong> on the final result, exactly as in
        the evaluation block.</li>
      <li><strong>Trajectory</strong> — did it get there by a <em>sensible path</em>? Did it call
        the right tools (callback to tool-call correctness), in a reasonable number of steps,
        without looping or wandering? A right answer reached by fifteen redundant searches is a
        problem even though the outcome passed.</li>
    </ul>

    <p>The reason to measure both is that <strong>they disagree</strong>, and each disagreement
    means something different:</p>

    ${Toolkit.callout(
      `<strong>Outcome ✓ · Trajectory ✓</strong> — what you want.<br>
       <strong>Outcome ✓ · Trajectory ✗</strong> — right answer, wasteful or lucky path: it cost
       too much, or it got there by accident and won't next time.<br>
       <strong>Outcome ✗ · Trajectory ✓</strong> — sensible path, wrong answer: often a tool
       failed or the final reasoning slipped — a targeted fix.<br>
       <strong>Outcome ✗ · Trajectory ✗</strong> — broken; start over.`,
      { type: "note", label: "The 2×2" }
    )}

    <h2>The metrics</h2>

    <p>Three numbers carry most of the weight, and you already know the statistics behind all
    three from the evaluation block:</p>
    <ul>
      <li><strong>Task success rate</strong> — the fraction of tasks whose <em>outcome</em>
        passed. It's a proportion, so it comes with a <strong>confidence interval</strong> — and
        on a small task set that interval is embarrassingly wide (this is
        <em>is-the-difference-real</em>, back again).</li>
      <li><strong>Steps-to-completion</strong> — the average trajectory length. Shorter is better
        <em>once the outcome passes</em>; on its own it's meaningless (an agent that quits
        immediately has one step and zero value).</li>
      <li><strong>Cost per task</strong> — an agent makes many calls, so cost is a first-class
        quality metric here, not an afterthought. Two agents with identical success rates are not
        equal if one costs triple.</li>
    </ul>

    <h2>The harness</h2>

    <p>It's the eval harness from Block 3, taught to record the trajectory alongside the answer:</p>

    ${Toolkit.code("eval_agent.py", `TASKS = [
    {"input": "Refund for an 89.50 item, 40 days old?", "expect": "76.08"},
    {"input": "Refund for a 120 item, 10 days old?",    "expect": "120"},
    # ... more tasks, each with a checkable expected outcome
]

def evaluate(tasks):
    passed, steps, cost = 0, 0, 0.0
    for t in tasks:
        answer, trajectory = run_agent(t["input"])   # trajectory = the tool calls made
        outcome_ok = t["expect"] in answer           # OUTCOME: reached the goal?
        passed += outcome_ok
        steps   += len(trajectory)                   # TRAJECTORY: how long?
        cost    += cost_of(trajectory)               # sum of per-call costs
    n = len(tasks)
    p = passed / n
    se = (p * (1 - p) / n) ** 0.5                     # the same proportion CI as Block 3
    print("success rate:", round(p, 3), "+/-", round(1.96 * se, 3))
    print("avg steps:", round(steps / n, 2))
    print("avg cost per task:", round(cost / n, 4))`)}

    <p>Run it on two versions of your agent and the tradeoff jumps out. Flip between them — the
    numbers are computed live from the per-task results:</p>

    ${Toolkit.widget(
      "Agent eval dashboard",
      `<div class="controls">
         <button class="btn ae-tab active-mode" data-v="0">Agent v1 (lean)</button>
         <button class="btn ghost ae-tab" data-v="1">Agent v2 (grounds every answer)</button>
       </div>
       <table class="ae-table" id="ae-table"></table>
       <div class="ae-summary" id="ae-summary"></div>
       <div class="nd-cap">Success rate, its 95% interval, average steps, and average cost are
         all computed from the per-task rows above — not hand-typed. Watch how a real accuracy
         gain can come with a real cost, and how wide the interval is at only six tasks.</div>`
    )}

    ${Toolkit.problem(
      `Agent v2 passes every task, but on one of them it made the same search three times before
       answering correctly. Its outcome score is perfect. What does your trajectory eval add that
       the outcome score alone would hide — and why do you care if the answer was right?`,
      `<p>The outcome score says &ldquo;correct&rdquo; and stops there. The trajectory eval catches
       that &ldquo;correct&rdquo; cost three searches when one would do — wasted money, wasted
       latency, and a warning sign. You care for two reasons. First, <strong>cost</strong>: at
       scale, tripling the tool calls on a subset of tasks is a real bill, and cost-per-task is a
       quality metric, not a footnote. Second, <strong>reliability</strong>: an answer reached by
       a confused, redundant path is often <em>lucky</em> rather than <em>robust</em> — the same
       agent may not be lucky on the next, slightly different task. A perfect outcome score with a
       bad trajectory is a system that works today and surprises you next week. That's exactly the
       disagreement the 2×2 is built to surface.</p>`,
      { label: "Predict: right answer, bad path" }
    )}

    ${Toolkit.problem(
      `Your task set has 6 tasks. Agent v1 passes 4 (67%), Agent v2 passes 6 (100%). A teammate
       says &ldquo;v2 is clearly better, ship it.&rdquo; Using what you learned in the evaluation
       block, what's your objection?`,
      `<p>At six tasks the confidence intervals are so wide they overlap heavily — you cannot
       conclude much. The 95% interval on 4/6 stretches roughly from 30% to 100%; the interval on
       6/6 is unreliable at the boundary (the normal approximation degenerates when the rate hits
       1, which is itself a flag that n is too small). The <em>point estimates</em> differ, but
       the <strong>uncertainty swamps the gap</strong>. This is the same lesson as
       <em>is-the-difference-real</em>: a difference in scores on a tiny set is mostly noise. The
       objection isn't &ldquo;v2 is worse&rdquo; — it may well be better — it's &ldquo;six tasks
       can't tell us,&rdquo; so the fix is <strong>more tasks</strong> before shipping, plus a look
       at whether v2's extra cost is worth whatever real gain survives a bigger set.</p>`,
      { label: "Predict: is 4/6 vs 6/6 real?" }
    )}

    ${Toolkit.instructorNote(
      `The single idea to leave them with: <strong>outcome and trajectory are different axes and
       you need both.</strong> Draw the 2×2 on the board and put a real failure in each quadrant
       from the agent you built last section. The top-right cell (outcome-pass, trajectory-fail)
       is the one people miss and the one that quietly bankrupts an agent in production — a demo
       that &ldquo;works&rdquo; while burning ten calls per query. The CI point is a deliberate
       callback: agent task sets are usually SMALL (each task is expensive to run and to label),
       so the wide-interval problem from Block 3 bites harder here than anywhere. If a student
       reports &ldquo;92% success&rdquo; on 12 tasks, the right response is &ldquo;plus or minus
       what?&rdquo; Cost-per-task as a first-class metric is also genuinely hireable — most
       hobbyists never measure it and are shocked by the bill.`
    )}

    <h2>What you accomplished</h2>
    <ul>
      <li>You evaluate an agent on <strong>two axes</strong>: <strong>outcome</strong> (did it
        reach the goal — end-state check or judge) and <strong>trajectory</strong> (did it take a
        sensible, efficient path).</li>
      <li>The axes <strong>disagree</strong>, and the 2×2 tells you what kind of problem you
        have — especially the costly <em>right-answer-by-a-bad-path</em> case.</li>
      <li>The core metrics — <strong>task success rate (with a CI), steps-to-completion, and cost
        per task</strong> — are Block-3 statistics applied to a moving target.</li>
      <li>Agent task sets are small, so <strong>confidence intervals are wide</strong>: resist
        declaring a winner from a handful of tasks.</li>
    </ul>
  `,

  onMount(root) {
    /* ---- Agent eval dashboard: REAL stats over per-task rows ---- */
    const COST_PER_STEP = 0.004;   // plain number (dollars-per-step), shown without a currency mark
    const VERSIONS = [
      {
        name: "Agent v1 (lean)",
        rows: [
          { task: "Refund, 89.50, 40 days", ok: true,  steps: 2, traj: "efficient" },
          { task: "Refund, 120, 10 days",   ok: true,  steps: 2, traj: "efficient" },
          { task: "Refund, 45, 75 days",    ok: false, steps: 1, traj: "skipped the policy search" },
          { task: "Exchange, damaged, 50d", ok: true,  steps: 3, traj: "efficient" },
          { task: "Refund, 200, 55 days",   ok: false, steps: 2, traj: "wrong fee tier" },
          { task: "Refund, 30, 5 days",     ok: true,  steps: 2, traj: "efficient" },
        ],
      },
      {
        name: "Agent v2 (grounds every answer)",
        rows: [
          { task: "Refund, 89.50, 40 days", ok: true, steps: 3, traj: "efficient" },
          { task: "Refund, 120, 10 days",   ok: true, steps: 3, traj: "efficient" },
          { task: "Refund, 45, 75 days",    ok: true, steps: 4, traj: "efficient" },
          { task: "Exchange, damaged, 50d", ok: true, steps: 5, traj: "wasteful — searched 3 times" },
          { task: "Refund, 200, 55 days",   ok: true, steps: 4, traj: "efficient" },
          { task: "Refund, 30, 5 days",     ok: true, steps: 3, traj: "efficient" },
        ],
      },
    ];
    let v = 0;
    const tabs = Array.prototype.slice.call(root.querySelectorAll(".ae-tab"));
    const tableEl = root.querySelector("#ae-table");
    const summaryEl = root.querySelector("#ae-summary");
    if (!tableEl) return;

    function render() {
      const ver = VERSIONS[v];
      const rows = ver.rows;
      const n = rows.length;
      const passed = rows.filter((r) => r.ok).length;
      const p = passed / n;
      const se = Math.sqrt(p * (1 - p) / n);
      const half = 1.96 * se;
      const lo = Math.max(0, p - half), hi = Math.min(1, p + half);
      const avgSteps = rows.reduce((a, r) => a + r.steps, 0) / n;
      const avgCost = avgSteps * COST_PER_STEP;

      tableEl.innerHTML =
        `<thead><tr><th>task</th><th>outcome</th><th>steps</th><th>trajectory</th></tr></thead>` +
        "<tbody>" + rows.map((r) =>
          `<tr>
             <td>${r.task}</td>
             <td class="ae-oc ${r.ok ? "pass" : "fail"}">${r.ok ? "✓ pass" : "✗ fail"}</td>
             <td class="ae-steps">${r.steps}</td>
             <td class="ae-traj ${r.traj === "efficient" ? "good" : "warn"}">${r.traj}</td>
           </tr>`).join("") + "</tbody>";

      const pct = (x) => (x * 100).toFixed(0) + "%";
      const boundaryNote = (p === 1 || p === 0)
        ? " (normal-approx CI is unreliable at the boundary — a flag that n is too small)"
        : "";
      summaryEl.innerHTML =
        `<div class="ae-stat"><span class="ae-stat-n">${pct(p)}</span><span class="ae-stat-l">success rate<br>95% CI ${pct(lo)}–${pct(hi)}${boundaryNote}</span></div>
         <div class="ae-stat"><span class="ae-stat-n">${avgSteps.toFixed(1)}</span><span class="ae-stat-l">avg steps<br>to completion</span></div>
         <div class="ae-stat"><span class="ae-stat-n">${avgCost.toFixed(3)}</span><span class="ae-stat-l">avg cost<br>per task</span></div>`;
      tabs.forEach((t, k) => t.classList.toggle("active-mode", k === v));
      tabs.forEach((t, k) => { if (k === v) t.classList.remove("ghost"); else t.classList.add("ghost"); });
    }
    tabs.forEach((t, k) => t.addEventListener("click", () => { v = k; render(); }));
    render();
  },
};
