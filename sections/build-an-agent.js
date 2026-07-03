/* ============================================================
   Section: Build an agent  (LAB) — Block 6 section 2
   (course section 27). Hand the wheel to the model.
     - the agent loop = the Block-5 tool loop + a GOAL (system prompt) + a
       MAX-STEPS guard + a dispatcher over several tools. The model chooses
       the sequence; you no longer write the flowchart.
     - the system prompt is the agent's standing brief/policy — it shapes
       EVERY decision across the trajectory, not one answer
     - the max-steps cap is a hard safety bound: never let an agent loop
       forever (for/range + else catches the cap)
     - the managed shortcut exists (tool_runner / managed agents) — build
       it by hand once so it's never magic and you can keep control
     (the deep failure taxonomy + guardrails get their own section next)
   LAB: predict-then-reveal; ends "What you accomplished".

   Star interactive: agent-run tracer — step a scripted multi-tool run and
   watch the model PLAN -> act -> observe -> decide across steps toward a
   goal, with a step counter against MAX_STEPS (real loop shape, scripted
   example).

   VERIFIED (Block 5): the loop / stop_reason / tool_result shape. The only
   new code is the goal-bearing system prompt, the range(MAX_STEPS) guard,
   and a run_tool dispatcher.

   NOTE (playbook): no literal dollar signs (money in words / plain digits);
   no backtick chars in prose; no star-slash inside comments; NO literal
   backslash-n inside Toolkit.code bodies; instructor notes hidden.
   ============================================================ */

window.SectionContent["build-an-agent"] = {
  title: "Build an agent",

  html: `
    <div class="eyebrow">Agents · Section 27 · Lab</div>
    <h1>Build an agent</h1>

    <p>You have every part already. The tool-use loop from the last block <em>is</em> the agent
    loop — to turn it into an agent you change three small things: you give the model a
    <strong>goal</strong> instead of a single question, you let it call from
    <strong>several tools</strong>, and you put a <strong>hard cap</strong> on how many times it
    may go around. Then you stop writing the plan and let the model write it.</p>

    <h2>The loop, now model-driven</h2>

    <p>First the agent's brief. For a single call the system prompt shapes one answer; for an
    agent it's the <strong>standing policy</strong> that governs every decision it makes:</p>

    ${Toolkit.code("the agent's brief", `SYSTEM = """You are a returns assistant. Your goal is to tell the
customer exactly what refund they are owed.
Always search the policy documents before answering — never answer
a policy question from memory. When you have the answer, state it
plainly and stop."""`)}

    <p>Now the loop. Read the three differences from Block 5 — the goal is in
    <code>system</code>, several tools are available, and <code>while True</code> has become
    <code>for step in range(MAX_STEPS)</code>:</p>

    ${Toolkit.code("agent.py", `import anthropic
client = anthropic.Anthropic()

def run_tool(name, args):
    if name == "search_docs": return search_docs(args["query"])
    if name == "calculator":  return run_calculator(args["expression"])
    return "unknown tool"

tools = [search_docs_tool, calculator_tool]      # the model picks among these
messages = [{"role": "user", "content":
    "I'm returning an 89.50 item I bought 40 days ago. What refund do I get?"}]

MAX_STEPS = 6
for step in range(MAX_STEPS):
    response = client.messages.create(
        model="claude-haiku-4-5",
        max_tokens=1000,
        system=SYSTEM,                           # the goal + standing rules
        tools=tools,
        messages=messages,
    )
    if response.stop_reason == "end_turn":
        break                                    # the model decided it is DONE

    messages.append({"role": "assistant", "content": response.content})
    results = []
    for block in response.content:
        if block.type == "tool_use":
            results.append({
                "type": "tool_result",
                "tool_use_id": block.id,
                "content": run_tool(block.name, block.input),
            })
    messages.append({"role": "user", "content": results})
else:
    # the for-loop ended WITHOUT hitting break -> we ran out of steps
    raise RuntimeError("agent did not finish within MAX_STEPS")

answer = next(b.text for b in response.content if b.type == "text")
print(answer)`)}

    <p>Nothing here is new machinery — it's the loop you already trust, with the model now
    deciding <em>which</em> tool to call and <em>when</em> it has enough to answer. Give it a
    tiered returns policy and a specific order, and it will typically search the policy, read
    the tiers, do the arithmetic, and answer — a three-step plan you never wrote.</p>

    <h2>The one line you must not skip: the cap</h2>

    <p>An agent decides its own stopping point — which means it can decide <em>wrong</em> and
    keep going. A confused agent will happily search, re-search, and re-re-search forever,
    burning tokens and time. <code>for step in range(MAX_STEPS)</code> is your seatbelt: the
    loop <strong>cannot</strong> run more than a fixed number of turns, and the <code>else</code>
    clause fires when the agent failed to finish in time so you notice instead of paying a
    surprise bill. Write the cap first, before the agent ever runs.</p>

    <p>Watch a run unfold — the model plans, acts, sees the result, and decides again, one step
    at a time against the cap:</p>

    ${Toolkit.widget(
      "Trace an agent run",
      `<div class="ar-meter"><div class="ar-meter-fill" id="ar-fill"></div>
         <span class="ar-meter-txt" id="ar-meter-txt"></span></div>
       <div class="ar-list" id="ar-list"></div>
       <div class="controls">
         <button class="btn" id="ar-step">Run next step</button>
         <button class="btn ghost" id="ar-reset">Reset</button>
       </div>
       <div class="ar-cap" id="ar-cap"></div>
       <div class="nd-cap">A scripted run, but the rhythm — plan, tool call, observation,
         next decision, until the model stops at end_turn — is exactly what your loop drives.
         The step counter is the MAX_STEPS cap protecting you.</div>`
    )}

    <h2>The shortcut, and why you built it by hand first</h2>

    <p>In production you often let the SDK's <strong>tool runner</strong> spin this loop for you,
    just as in Block 5 — and Anthropic also offers fully <strong>managed agents</strong> that run
    the loop and host the tools on their side. Both are fine. But you build the loop by hand once
    so none of it is magic, and so you can always drop back to the manual version when you need
    the control the next section is about — logging every step, or pausing for a human to approve
    an action before it happens.</p>

    ${Toolkit.problem(
      `Why did we write <code>for step in range(MAX_STEPS)</code> instead of the
       <code>while True</code> from the tool-use loop — and what is the <code>else</code> clause
       for?`,
      `<p>Because an agent chooses when to stop, and a confused one may never choose to. In
       Block 5 <em>your</em> code decided when the work was done, so <code>while True</code> was
       safe — the loop ended when you said so. Here the <em>model</em> decides, and if it keeps
       asking for tools it will loop until you run out of money or patience. The
       <code>range(MAX_STEPS)</code> is a hard ceiling the model cannot talk its way past. The
       <code>for/else</code> is a Python detail worth knowing: the <code>else</code> runs only if
       the loop finished <em>without</em> hitting <code>break</code> — i.e. the agent used up
       every step and still wasn't done. That's your signal that something went wrong, so you can
       alert instead of silently returning a half-finished answer.</p>`,
      { label: "Predict: why the cap?" }
    )}

    ${Toolkit.problem(
      `A classmate deletes the &ldquo;Always search the policy documents before answering&rdquo;
       line from <code>SYSTEM</code>. The agent still works on many questions, but now it
       sometimes answers refund questions straight from memory — confidently, and sometimes
       wrong. Why does one line in the system prompt matter so much more for an agent than for a
       single call?`,
      `<p>Because for a single call the system prompt shapes exactly <em>one</em> answer, but for
       an agent it shapes <em>every decision across the whole trajectory</em>. That line isn't
       decoration — it's the rule that makes the model choose to <code>search_docs</code> instead
       of guessing, on every turn. The system prompt is the closest thing you have to steering a
       loop you no longer control step by step: it's the agent's standing policy. Take away the
       instruction to ground its answers and you take away the behavior that made those answers
       trustworthy. This is also a preview of why agents are hard to keep on the rails — a lot of
       your control lives in words, not in code.</p>`,
      { label: "Predict: the missing rule" }
    )}

    ${Toolkit.instructorNote(
      `Two things to demo live if you can. (1) Run the same agent twice and show the trajectories
       differ — maybe it searches once, maybe twice, maybe phrases the query differently. That
       plan-level non-determinism is the whole reason the eval sections coming next are hard, and
       seeing it beats being told. (2) Lower MAX_STEPS to something cruel like 2 on a task that
       needs 3 and show the <code>else</code> clause firing — students feel the cap working. If a
       student asks &ldquo;why not just set MAX_STEPS to 1000 and forget it&rdquo;, that's the
       perfect segue: because a stuck agent at 1000 steps is a stuck agent that cost you 1000
       calls. The cap is a budget, not just a safety net.`
    )}

    <h2>What you accomplished</h2>
    <ul>
      <li>You turned the tool-use loop into an <strong>agent</strong> by adding a
        <strong>goal</strong> (system prompt), <strong>several tools</strong> (a
        <code>run_tool</code> dispatcher), and a <strong>step cap</strong> — and let the model
        choose the sequence.</li>
      <li>The <strong>system prompt is the agent's standing policy</strong>: it governs every
        decision across the trajectory, so grounding rules live there.</li>
      <li><code>for step in range(MAX_STEPS)</code> with an <code>else</code> is your
        <strong>runaway guard</strong> — write the cap before the agent ever runs.</li>
      <li>Managed loops (tool runner, managed agents) exist, but building it by hand keeps you
        able to <strong>drop back to manual control</strong> when you need it.</li>
    </ul>
  `,

  onMount(root) {
    /* ---- Agent-run tracer: a scripted 3-step, 2-tool run ---- */
    const MAX = 6;
    const STEPS = [
      {
        think: "This is a policy question with a specific amount. My brief says search the policy before answering — so I'll look up the return window and any fees.",
        action: { kind: "tool", label: 'search_docs(query="return window refund restocking fee")' },
        obs: "Returns within 30 days: full refund. 31–60 days: refund minus a 15% restocking fee. After 60 days: not accepted.",
        cap: "Step 1 — the model PLANS (grounding first, per its brief) and calls a tool. It has not answered yet.",
      },
      {
        think: "The purchase was 40 days ago, which falls in the 31–60 day tier, so a 15% restocking fee applies. I need 85% of 89.50 — I won't do that arithmetic in my head.",
        action: { kind: "tool", label: 'calculator(expression="89.50 * 0.85")' },
        obs: "76.075",
        cap: "Step 2 — the model uses the FIRST result to decide the second action. This chained plan is one you never wrote.",
      },
      {
        think: "I have the policy and the number. 40 days means the 15% fee applies, giving a refund of 76.08. I'm done.",
        action: { kind: "answer", label: "Because it's been 40 days, a 15% restocking fee applies, so your refund is 76.08 (85% of 89.50)." },
        obs: null,
        cap: "Step 3 — stop_reason is end_turn: the model judges the goal met and answers. The loop breaks; it used 3 of its 6 allowed steps.",
      },
    ];
    let shown = 0;
    const listEl = root.querySelector("#ar-list");
    const capEl = root.querySelector("#ar-cap");
    const fillEl = root.querySelector("#ar-fill");
    const meterTxt = root.querySelector("#ar-meter-txt");
    const stepBtn = root.querySelector("#ar-step");
    const resetBtn = root.querySelector("#ar-reset");
    if (!listEl) return;

    function render() {
      listEl.innerHTML = STEPS.slice(0, shown).map((s, k) => {
        const act = s.action.kind === "answer"
          ? `<div class="ar-act answer"><span class="ar-tag">answer · end_turn</span>${s.action.label}</div>`
          : `<div class="ar-act tool"><span class="ar-tag">tool call</span>${s.action.label}</div>`;
        const obs = s.obs
          ? `<div class="ar-obs"><span class="ar-tag">observation</span>${s.obs}</div>`
          : "";
        return `<div class="ar-step-box">
             <div class="ar-num">step ${k + 1}</div>
             <div class="ar-think"><span class="ar-tag">plan</span>${s.think}</div>
             ${act}${obs}
           </div>`;
      }).join("");
      const used = shown;
      fillEl.style.width = Math.round((used / MAX) * 100) + "%";
      fillEl.className = "ar-meter-fill" + (used >= MAX ? " full" : "");
      meterTxt.textContent = used + " / " + MAX + " steps used";
      capEl.textContent = shown > 0 ? STEPS[shown - 1].cap : "Press “Run next step” to watch the agent plan its own path toward the goal.";
      stepBtn.disabled = shown >= STEPS.length;
      stepBtn.textContent = shown >= STEPS.length ? "Reached end_turn" : "Run next step";
    }
    stepBtn.addEventListener("click", () => { if (shown < STEPS.length) { shown++; render(); } });
    resetBtn.addEventListener("click", () => { shown = 0; render(); });
    render();
  },
};
