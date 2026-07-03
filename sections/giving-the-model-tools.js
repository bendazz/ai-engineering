/* ============================================================
   Section: Giving the model tools  (CONCEPT) — opens Block 5
   "Tool use", course section 21.
     - why: the model is a closed box (stale knowledge, unreliable
       arithmetic, no access to your data/systems, cannot act)
     - the mechanism: you give DESCRIPTIONS of functions; the model
       returns a structured REQUEST to call one; YOUR code runs it and
       hands back the result; the model continues. The model asks, your
       code acts (you control execution — a security seed).
     - a tool = name + description + input_schema (callback structured
       outputs: a tool call is schema-valid output, pointed outward)
     - the description is a prompt (be prescriptive about WHEN to call)
     - tool_choice: auto / any / a named tool / none
   Concept section: no inline problems; ends "What you learned".

   Star interactive: tool-call flow stepper — a scripted-but-honest
   request -> model asks -> your code runs -> result -> answer, with the
   real JSON at each stage.

   VERIFIED (claude-api skill, 2026-07-02): tool def {name, description,
   input_schema}; tool_choice auto/any/tool/none; stop_reason "tool_use";
   tool_use blocks (.name/.input/.id); tool_result {type, tool_use_id,
   content, is_error?}. See [[verified-facts]].

   NOTE (playbook): no literal dollar signs; no backtick chars in prose;
   no star-slash inside comments; JSON/dicts in code only; instructor notes
   hidden via Toolkit.instructorNote.
   ============================================================ */

window.SectionContent["giving-the-model-tools"] = {
  title: "Giving the model tools",

  html: `
    <div class="eyebrow">Tool Use · Section 21</div>
    <h1>Giving the model tools</h1>

    <p>Up to now the model has been a closed box: text in, text out, drawing only on
    what it absorbed during training. That box has hard walls. It doesn't know today's
    date's news, it's genuinely unreliable at exact arithmetic, it can't read your
    database, and it can't <em>do</em> anything — send an email, book a room, hit an API.
    <strong>Tools</strong> break the box open. They let the model call your code.</p>

    <h2>The walls that tools fix</h2>
    <ul>
      <li><strong>Stale knowledge</strong> — nothing after the training cutoff, and
        nothing about <em>your</em> world (your docs, your prices, this user's account).</li>
      <li><strong>Unreliable computation</strong> — language models approximate; they
        are not calculators, and they miscount and mis-multiply confidently.</li>
      <li><strong>No access</strong> — they can't query your systems or the live web on
        their own.</li>
      <li><strong>No actions</strong> — a model can <em>say</em> &ldquo;I've booked
        it,&rdquo; but it can't book anything.</li>
    </ul>

    <h2>The mechanism: the model asks, your code acts</h2>

    <p>Here's the mental model, and the one misconception to kill early: you do
    <strong>not</strong> hand the model your functions to run. You hand it
    <em>descriptions</em> of them. When the model decides a tool would help, it doesn't
    execute anything — it emits a structured <strong>request</strong>: &ldquo;please call
    <code>calculator</code> with <code>expression = 4891 * 237</code>.&rdquo; <strong>Your
    code</strong> runs the real function and hands the result back. Then the model
    continues, now knowing the answer.</p>

    <p>Step through the round trip — notice the model never touches your code; it only
    asks:</p>

    ${Toolkit.widget(
      "One tool call, end to end",
      `<div class="tf-stage" id="tf-stage"></div>
       <div class="controls">
         <button class="btn ghost" id="tf-back">Back</button>
         <button class="btn" id="tf-next">Next step</button>
       </div>
       <div class="tf-dots" id="tf-dots"></div>
       <div class="nd-cap">The flow — request, tool-use request, your execution, result,
         final answer — is exactly the real shape. The specific example (a calculator
         call) is scripted for illustration.</div>`
    )}

    <p>Because <em>you</em> run the tools, you're in control of what actually executes —
    which is your safety valve, and something we'll lean on later.</p>

    <h2>A tool is a described function</h2>

    <p>A tool definition is three things: a <strong>name</strong>, a
    <strong>description</strong>, and an <strong>input schema</strong>. If that schema
    looks familiar, it should — it's the same JSON-Schema idea as structured outputs. In
    fact that's exactly what a tool call is: <strong>structured output pointed
    outward</strong>. The model produces a schema-valid request instead of a schema-valid
    answer.</p>

    ${Toolkit.code("A tool definition", `calculator_tool = {
    "name": "calculator",
    "description": (
        "Evaluate an arithmetic expression. Call this whenever the user asks "
        "for a calculation — the model is unreliable at exact arithmetic."
    ),
    "input_schema": {
        "type": "object",
        "properties": {
            "expression": {
                "type": "string",
                "description": "A arithmetic expression, e.g. 4891 * 237",
            }
        },
        "required": ["expression"],
    },
}`)}

    <h2>The description is a prompt</h2>

    <p>The <code>description</code> field isn't documentation for you — it's how the model
    decides <strong>when</strong> to reach for the tool. So be prescriptive about the
    trigger, not just the function: &ldquo;Call this when the user asks about current
    prices or recent events&rdquo; beats &ldquo;gets information.&rdquo; A vague
    description gives you a tool the model forgets to use, or uses at the wrong time.</p>

    <h2>Who decides: tool_choice</h2>
    <p>You can steer how eagerly the model reaches for tools with <code>tool_choice</code>:</p>
    <ul>
      <li><code>{"type": "auto"}</code> — the model decides (the default).</li>
      <li><code>{"type": "any"}</code> — it must use <em>some</em> tool.</li>
      <li><code>{"type": "tool", "name": "..."}</code> — force one specific tool.</li>
      <li><code>{"type": "none"}</code> — forbid tools for this turn.</li>
    </ul>

    ${Toolkit.instructorNote(
      `The framing that prevents a lot of confusion: a tool call is not the model
       &ldquo;running code&rdquo; — it's the model <em>filling out a form</em> (the input
       schema) that asks you to run code. Draw it as the model handing a slip across a
       counter and your code doing the work behind it. That picture makes three later
       things obvious: why <em>you</em> hold the security boundary, why a good schema and
       description matter (a bad form gets filled out badly), and why tool use is
       literally structured outputs with the result sent back. Tie it explicitly to the
       structured-outputs section — same machinery, new direction.`
    )}

    <h2>What you learned</h2>
    <ul>
      <li>Tools break the model out of its box — fixing <strong>stale knowledge,
        unreliable computation, no data access, and no ability to act.</strong></li>
      <li>The model doesn't run your code; it emits a structured
        <strong>request</strong>, <strong>your code executes</strong> it, and the result
        goes back — so you hold the execution boundary.</li>
      <li>A tool is a <strong>name + description + input schema</strong> — structured
        outputs pointed outward — and the <strong>description decides when</strong> the
        model calls it.</li>
      <li><code>tool_choice</code> controls whether tool use is optional, required,
        forced to one, or off.</li>
    </ul>
  `,

  onMount(root) {
    /* ---- Tool-call flow stepper (scripted example, real shape) ---- */
    const STAGES = [
      { who: "you", title: "1 · You send the request (with tools available)",
        body: 'messages = [{"role": "user", "content": "What is 4891 * 237?"}]\ntools = [calculator_tool]',
        note: "You include the tool definitions in the call. The model may or may not use them." },
      { who: "model", title: "2 · The model asks for a tool",
        body: 'stop_reason: "tool_use"\ncontent: [ ToolUseBlock(\n    id="tu_01",\n    name="calculator",\n    input={"expression": "4891 * 237"}\n) ]',
        note: "The model didn't compute anything — it returned a structured REQUEST to call your calculator, with an id you'll echo back." },
      { who: "you", title: "3 · Your code runs the tool",
        body: 'result = run_calculator("4891 * 237")\n# -> "1159167"',
        note: "This is your function, on your machine. The model never touches it." },
      { who: "you", title: "4 · You send the result back",
        body: 'tool_result = {\n    "type": "tool_result",\n    "tool_use_id": "tu_01",\n    "content": "1159167",\n}',
        note: "The tool_use_id must match the request. You append the model's tool_use turn, then this result, and call again." },
      { who: "model", title: "5 · The model answers, now informed",
        body: 'stop_reason: "end_turn"\n"4,891 times 237 is 1,159,167."',
        note: "With the tool result in the conversation, the model finishes the job — correctly." },
    ];
    let i = 0;
    const stageEl = root.querySelector("#tf-stage");
    const dotsEl = root.querySelector("#tf-dots");
    const nextBtn = root.querySelector("#tf-next");
    const backBtn = root.querySelector("#tf-back");
    if (!stageEl) return;

    function render() {
      const s = STAGES[i];
      stageEl.innerHTML =
        `<div class="tf-head ${s.who}"><span class="tf-who">${s.who === "model" ? "the model" : "your code"}</span>${s.title}</div>
         <pre class="tf-body">${s.body.replace(/&/g, "&amp;").replace(/</g, "&lt;")}</pre>
         <div class="tf-note">${s.note}</div>`;
      dotsEl.innerHTML = STAGES.map((_, k) =>
        `<span class="tf-dot${k === i ? " on" : ""}"></span>`).join("");
      backBtn.disabled = i === 0;
      nextBtn.disabled = i === STAGES.length - 1;
      nextBtn.textContent = i === STAGES.length - 1 ? "Done" : "Next step";
    }
    nextBtn.addEventListener("click", () => { if (i < STAGES.length - 1) { i++; render(); } });
    backBtn.addEventListener("click", () => { if (i > 0) { i--; render(); } });
    render();
  },
};
