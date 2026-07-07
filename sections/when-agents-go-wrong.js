/* ============================================================
   Section: When agents go wrong  (CONCEPT) — Block 6 section 4
   (course section 29). The failure modes autonomy unlocks, and the
   levers that keep an agent on the rails.
     - new failure modes: non-termination/loops, goal drift, hallucinated
       tool calls, compounding errors across steps
     - control levers:
       * max-iteration cap (the seatbelt from build-an-agent)
       * human-in-the-loop approval gates before consequential/irreversible
         actions (callback Block 5: drop back to the manual loop)
       * argument validation / tool guardrails (+ is_error recovery)
       * OBSERVABILITY: you cannot debug what you cannot see -> trace every
         step (plan, tool, args, result, cost). A requirement, not a nicety.
   Concept section: no inline problems; ends "What you learned".

   Star interactive: failure-mode switcher — pick a failure, watch a short
   trace exhibit it, toggle the guardrail and watch it get caught.

   Facts: control patterns build on the verified Block-5 loop (is_error,
   manual loop). No new external API facts.

   NOTE (playbook): no literal dollar signs; no backtick chars in prose;
   no star-slash inside comments; NO literal backslash-n inside Toolkit.code
   bodies; instructor notes hidden.
   ============================================================ */

window.SectionContent["when-agents-go-wrong"] = {
  title: "When agents go wrong",

  html: `
    <div class="eyebrow">Agents · Section 31</div>
    <h1>When agents go wrong</h1>

    <p>A single call fails in one place: the answer is bad, you see it, you fix the prompt. An
    agent fails <em>somewhere in a trajectory you didn't write</em> — and it can fail in ways a
    single call simply can't. Handing the model the wheel means new kinds of crashes, and the
    job is to know them by name and to build the guardrails that catch them before your users
    (or your bill) do.</p>

    <h2>The new failure modes</h2>

    <p>Four show up again and again. Pick one and watch it happen — then switch on the guardrail
    that stops it:</p>

    ${Toolkit.widget(
      "Failure modes, and the levers that catch them",
      `<div class="fm-tabs">
         <button class="btn ghost fm-tab active-mode" data-f="0">Infinite loop</button>
         <button class="btn ghost fm-tab" data-f="1">Goal drift</button>
         <button class="btn ghost fm-tab" data-f="2">Hallucinated tool</button>
         <button class="btn ghost fm-tab" data-f="3">Compounding error</button>
       </div>
       <div class="fm-trace" id="fm-trace"></div>
       <div class="fm-diag" id="fm-diag"></div>
       <div class="controls">
         <button class="btn" id="fm-guard">Switch on the guardrail</button>
       </div>
       <div class="fm-fix" id="fm-fix"></div>`
    )}

    <p>Notice the shape of the cure in every case: the model's autonomy is real, but you get to
    <strong>wrap it in code you control</strong>. The agent proposes; your harness disposes.</p>

    <h2>The control levers</h2>

    <h3>1 · The step cap</h3>
    <p>You already have this one: <code>for step in range(MAX_STEPS)</code>. It can't prevent a
    bad trajectory, but it guarantees a <em>bounded</em> one — the difference between a mistake
    and an unbounded bill. It's the seatbelt: cheap, and never optional.</p>

    <h3>2 · Human-in-the-loop approval gates</h3>
    <p>For actions that are <strong>consequential or irreversible</strong> — sending mail, issuing
    a refund, merging code — you don't let the agent act on its own. You pause the loop and put a
    person in front of the action. This is precisely why you learned to build the loop by hand:
    so you can step into it.</p>

    ${Toolkit.code("an approval gate", `CONSEQUENTIAL = {"issue_refund", "send_email", "book_trip"}

for block in response.content:
    if block.type == "tool_use":
        if block.name in CONSEQUENTIAL and not human_approves(block):
            result = "Action declined by a human reviewer."   # the agent adapts
        else:
            result = run_tool(block.name, block.input)`)}

    <h3>3 · Validate before you execute</h3>
    <p>The agent asks; it doesn't act. So your harness is the checkpoint: confirm the tool exists,
    validate the arguments against the schema, and hand a failure <em>back</em> to the model with
    <code>is_error</code> so it can recover instead of crashing your program. A hallucinated tool
    call becomes a correctable message, not an exception.</p>

    <h3>4 · Observability: trace everything</h3>
    <p>This is the one people skip and regret. <strong>You cannot debug what you cannot see</strong>,
    and an agent's failure lives in the sequence of decisions, not in a single response. So log
    every step — the model's plan, which tool it called, with what arguments, what came back, and
    what it cost:</p>

    ${Toolkit.code("a trace record per step", `trace.append({
    "step": step,
    "plan": first_text(response),      # what the model said it was doing
    "tool": block.name,
    "args": block.input,
    "result": result,
    "tokens": response.usage.output_tokens,
})`)}

    <p>When an agent does something baffling, this trace is the difference between &ldquo;it
    hallucinated, I guess&rdquo; and &ldquo;on step 4 it misread the 30-day tier as 90 days, and
    every later step followed from that.&rdquo; One is a shrug; the other is a fix. Treat tracing
    as part of building the agent, not something you bolt on after it breaks.</p>

    ${Toolkit.callout(
      `An agent is only as safe as the harness around it. The model's judgment will sometimes be
       wrong — that's not a bug you can prompt away, it's the nature of a non-deterministic system.
       Reliability comes from the <strong>bounded, observable, human-gated loop you wrap it in</strong>,
       not from hoping the model never errs.`,
      { type: "warn", label: "The core stance" }
    )}

    ${Toolkit.instructorNote(
      `Frame the whole section as &ldquo;the agent proposes, your harness disposes.&rdquo; Students
       want to fix agent misbehavior by editing the prompt; the professional move is to assume the
       model will occasionally be wrong and engineer the surrounding loop so that wrongness is
       bounded (cap), caught (validation), gated (human approval on irreversible actions), and
       visible (tracing). The tracing point is worth dwelling on because it's the bridge to
       production — every real agent system is drowning in trace/observability tooling, and a
       student who instinctively logs the trajectory is already thinking like an operator. Good
       board demo: take the agent from section 27, remove the cap, and give it an unsatisfiable
       goal (&ldquo;find the refund policy&rdquo; with the policy tool broken) — watch it loop.
       Then add the cap back and show the for/else alert. Fear, then relief, then the lesson.`
    )}

    <h2>What you learned</h2>
    <ul>
      <li>Autonomy unlocks new failures: <strong>non-termination, goal drift, hallucinated tool
        calls, and compounding errors</strong> across steps.</li>
      <li>You don't fix these by trusting the model more — you wrap it in a
        <strong>harness you control</strong>: the agent proposes, your code disposes.</li>
      <li>The levers: a <strong>step cap</strong>, <strong>human approval gates</strong> on
        irreversible actions, <strong>argument validation</strong> with <code>is_error</code>
        recovery, and above all <strong>tracing every step</strong>.</li>
      <li><strong>You cannot debug what you cannot see</strong> — build observability in from the
        start, because an agent's bug lives in its trajectory.</li>
    </ul>
  `,

  onMount(root) {
    /* ---- Failure-mode switcher with a guardrail toggle ---- */
    const FAILURES = [
      {
        symptom: [
          { t: "plan", s: "I need the refund policy." },
          { t: "tool", s: 'search_docs("refund policy")' },
          { t: "obs", s: "(the policy tool is returning nothing)" },
          { t: "plan", s: "That returned nothing. I need the refund policy." },
          { t: "tool", s: 'search_docs("refund policy")' },
          { t: "loop", s: "…and again, and again, forever." },
        ],
        diag: "The agent can't get what it needs, so it never reaches end_turn — it just keeps trying the same failing action.",
        guard: "The step cap (MAX_STEPS)",
        fix: "The for-loop trips at step 6 and the else-clause raises an alert. You get a bounded run and a notification — not a runaway bill.",
      },
      {
        symptom: [
          { t: "plan", s: "Goal: compute this customer's refund." },
          { t: "tool", s: 'search_docs("refund policy")' },
          { t: "obs", s: "Returns policy… see also shipping and delivery times." },
          { t: "plan", s: "Let me explain the shipping options in detail…" },
          { t: "drift", s: "The agent has wandered off the refund goal onto shipping." },
        ],
        diag: "Over many steps, buried under tool output, the original goal fades and the agent drifts to an adjacent topic.",
        guard: "Restate the goal + shorter trajectories",
        fix: "The system prompt persists the goal on every call, and a tighter step budget limits how far it can wander before you check in. The goal stays in view.",
      },
      {
        symptom: [
          { t: "plan", s: "I'll look up this customer's account." },
          { t: "tool", s: 'lookup_account(id="C-4471")' },
          { t: "err", s: "But lookup_account was never defined — the model invented it." },
        ],
        diag: "The agent asked for a tool that does not exist (or passed arguments that don't match the schema). Executed blindly, this crashes your program.",
        guard: "Validate the call, return is_error",
        fix: "Your harness checks the name and arguments BEFORE executing. The bad call becomes a tool_result with is_error=True, and the model adapts: 'That tool isn't available — let me use search_docs instead.'",
      },
      {
        symptom: [
          { t: "tool", s: 'search_docs("return window")' },
          { t: "obs", s: "Full refund within 30 days." },
          { t: "plan", s: "So the window is 90 days. This 75-day return qualifies for a full refund." },
          { t: "compound", s: "Every later step builds on the misread 90 — locally reasonable, globally wrong." },
        ],
        diag: "A small early mistake (misreading 30 as 90) is never caught, so each following step is consistent with the error. The final answer is confidently wrong.",
        guard: "Ground + verify intermediate steps",
        fix: "Grounding each claim in the retrieved text (and, for high stakes, a verification step or human checkpoint) catches the misread early — before four more steps are built on top of it.",
      },
    ];
    let f = 0, guarded = false;
    const tabs = Array.prototype.slice.call(root.querySelectorAll(".fm-tab"));
    const traceEl = root.querySelector("#fm-trace");
    const diagEl = root.querySelector("#fm-diag");
    const guardBtn = root.querySelector("#fm-guard");
    const fixEl = root.querySelector("#fm-fix");
    if (!traceEl) return;

    const CLS = { plan: "plan", tool: "tool", obs: "obs", loop: "bad", drift: "bad", err: "bad", compound: "bad" };
    const LABEL = { plan: "plan", tool: "tool call", obs: "observation", loop: "loop", drift: "drift", err: "error", compound: "compounding" };

    function render() {
      const item = FAILURES[f];
      traceEl.innerHTML = item.symptom.map((r) =>
        `<div class="fm-row ${CLS[r.t]}"><span class="fm-badge">${LABEL[r.t]}</span>${r.s}</div>`).join("");
      diagEl.innerHTML = `<span class="fm-diag-k">What went wrong</span> ${item.diag}`;
      if (guarded) {
        fixEl.style.display = "";
        fixEl.innerHTML = `<span class="fm-fix-k">Guardrail · ${item.guard}</span> ${item.fix}`;
        guardBtn.textContent = "Hide the guardrail";
      } else {
        fixEl.style.display = "none";
        guardBtn.textContent = "Switch on the guardrail";
      }
      tabs.forEach((t, k) => t.classList.toggle("active-mode", k === f));
    }
    tabs.forEach((t, k) => t.addEventListener("click", () => { f = k; guarded = false; render(); }));
    guardBtn.addEventListener("click", () => { guarded = !guarded; render(); });
    render();
  },
};
