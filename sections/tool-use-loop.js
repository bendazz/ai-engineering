/* ============================================================
   Section: The tool-use loop  (LAB) — Block 5 section 2
   (course section 22). Hand-code the round trip.
     - the manual agentic loop (verified): call with tools -> check
       stop_reason -> extract tool_use blocks -> execute -> append the
       assistant content AND a tool_result (matching tool_use_id) ->
       loop until end_turn
     - a real calculator tool (with a security caveat on eval)
     - multiple tools + error handling (is_error)
     - the SDK tool runner as the production shortcut
   LAB: predict-then-reveal; ends "What you accomplished".

   Star interactive: loop tracer — step a scripted 2-tool-call
   conversation and watch messages[] grow with tool_use / tool_result
   turns until end_turn (real structure, scripted example).

   VERIFIED (claude-api skill): manual loop shape, tool_result format,
   is_error, tool_runner (@beta_tool + client.beta.messages.tool_runner).

   NOTE (playbook): no literal dollar signs (money in words); no backtick
   chars in prose; no star-slash in comments; NO literal \\n inside Toolkit.code
   bodies; instructor notes hidden.
   ============================================================ */

window.SectionContent["tool-use-loop"] = {
  title: "The tool-use loop",

  html: `
    <div class="eyebrow">Tool Use · Section 22 · Lab</div>
    <h1>The tool-use loop</h1>

    <p>You saw the round trip; now build it by hand. You understand a mechanism when you
    code it, and the tool-use loop is the beating heart of everything that follows,
    including agents. It's a <code>while</code> loop with one job: keep going until the
    model stops asking for tools.</p>

    <h2>The loop</h2>

    <p>First a real tool — your function, on your machine:</p>

    ${Toolkit.code("A real tool", `def run_calculator(expression):
    # DEMO ONLY: never eval untrusted input in real code — use a safe
    # arithmetic parser. This is the security boundary you now control.
    return str(eval(expression))`)}

    <p>Now the loop. Read the comments — every line earns its place:</p>

    ${Toolkit.code("tool_loop.py", `import anthropic
client = anthropic.Anthropic()

tools = [calculator_tool]     # the definition from last section
messages = [{"role": "user", "content": "What is 18% of 64.50, then that plus 64.50?"}]

while True:
    response = client.messages.create(
        model="claude-haiku-4-5",
        max_tokens=500,
        tools=tools,
        messages=messages,
    )
    if response.stop_reason == "end_turn":
        break                                  # the model is done — no tool wanted

    # 1) Append the model's turn AS-IS (it contains the tool_use request)
    messages.append({"role": "assistant", "content": response.content})

    # 2) Run every tool the model asked for, collect the results
    tool_results = []
    for block in response.content:
        if block.type == "tool_use":
            result = run_calculator(block.input["expression"])
            tool_results.append({
                "type": "tool_result",
                "tool_use_id": block.id,        # MUST match the request's id
                "content": result,
            })

    # 3) Send the results back as a user turn, then loop
    messages.append({"role": "user", "content": tool_results})

answer = next(b.text for b in response.content if b.type == "text")
print(answer)`)}

    <p>Three subtleties do all the work. You <strong>append the model's own
    <code>tool_use</code> turn</strong> before the result, so the conversation stays
    coherent — the model has to see the request it made. Each <code>tool_result</code>
    carries the <strong>matching <code>tool_use_id</code></strong>, so the model knows
    which request this answers. And it's a <strong>loop</strong>, not a single round: the
    model might use the calculator, see the result, and immediately ask for it again
    (here, once for the 18%, once for the sum) before it's ready to answer.</p>

    ${Toolkit.widget(
      "Trace the loop",
      `<div class="tr-list" id="tr-list"></div>
       <div class="controls">
         <button class="btn" id="tr-step">Run next step</button>
         <button class="btn ghost" id="tr-reset">Reset</button>
       </div>
       <div class="tr-cap" id="tr-cap"></div>
       <div class="nd-cap">A scripted two-call example, but the message sequence —
         user, assistant tool_use, user tool_result, repeat, then a final answer at
         end_turn — is exactly what your loop builds.</div>`
    )}

    <h2>Multiple tools and errors</h2>

    <p>Give the model several tools and it picks (the <code>description</code> is how it
    chooses). When a tool fails, don't crash the loop — hand the failure back so the model
    can recover:</p>

    ${Toolkit.code("A failed tool result", `tool_results.append({
    "type": "tool_result",
    "tool_use_id": block.id,
    "content": "Error: no flight found for that date.",
    "is_error": True,        # the model sees this and can try another approach
})`)}

    <h2>The shortcut you'll use in practice</h2>

    <p>Once you understand the loop, you rarely write it by hand. The SDK's
    <strong>tool runner</strong> runs it for you — you decorate plain functions and it
    handles the calling, executing, and feeding-back:</p>

    ${Toolkit.code("The tool runner (beta)", `from anthropic import beta_tool

@beta_tool
def calculator(expression: str) -> str:
    "Evaluate an arithmetic expression."
    return str(eval(expression))     # DEMO ONLY (see the caveat above)

runner = client.beta.messages.tool_runner(
    model="claude-haiku-4-5",
    max_tokens=500,
    tools=[calculator],
    messages=[{"role": "user", "content": "What is 18% of 64.50, then plus 64.50?"}],
)
for message in runner:            # the loop, handled for you
    print(message)`)}

    <p>Build it by hand once so the runner is never magic — and so you can drop back to the
    manual loop when you need control (logging every call, or requiring human approval
    before a tool that spends money or sends mail).</p>

    ${Toolkit.problem(
      `In the manual loop, why must you append the model's <code>tool_use</code> turn to
       <code>messages</code> <em>before</em> you append the <code>tool_result</code> — and
       why does the result carry a <code>tool_use_id</code>?`,
      `<p>Because the API is stateless (remember section 7): each call is judged only on
       the messages you send. If you send back a <code>tool_result</code> without the
       <code>tool_use</code> request that preceded it, the conversation is incoherent —
       there's a result answering a question that isn't in the transcript, and the API
       will reject it. The <code>tool_use_id</code> is the thread tying a specific result
       to the specific request it answers, which matters the moment the model asks for two
       tools at once: without the id, you couldn't say which result is which.</p>`,
      { label: "Predict: why append the request first?" }
    )}

    ${Toolkit.problem(
      `A classmate handles the tool call but forgets the <code>while</code> — they run one
       round and then read the answer. It works for &ldquo;what's 4891 times 237&rdquo; but
       breaks on &ldquo;18% of 64.50, then plus 64.50.&rdquo; Why?`,
      `<p>Some tasks need <strong>more than one</strong> tool call, and each call needs the
       previous result before the next can happen. The two-step question requires the model
       to get the 18% <em>first</em>, then feed that number into a second calculation. With
       a single round, you execute the first tool, send the result, and the model comes back
       wanting a <em>second</em> tool call — but there's no loop to service it, so you read a
       half-finished response. The loop exists precisely so the model can chain as many tool
       calls as the task needs before it reaches <code>end_turn</code>.</p>`,
      { label: "Predict: the missing loop" }
    )}

    <h2>What you accomplished</h2>
    <ul>
      <li>You built the <strong>manual tool-use loop</strong>: call → check
        <code>stop_reason</code> → run the requested tools → send
        <code>tool_result</code>s (with matching ids) → loop until <code>end_turn</code>.</li>
      <li>You append the model's <strong>tool_use turn before the result</strong>, and you
        return failures with <strong><code>is_error</code></strong> so the model can
        recover.</li>
      <li>You know the <strong>tool runner</strong> automates the loop — and why building it
        by hand first means you can drop back to manual control when you need it.</li>
    </ul>
  `,

  onMount(root) {
    /* ---- Loop tracer: a scripted 2-tool-call transcript ---- */
    const STEPS = [
      { role: "user", kind: "text", text: "What is 18% of 64.50, then that plus 64.50?", cap: "The user's question. It needs two calculations, in order." },
      { role: "assistant", kind: "tool_use", text: "calculator(expression=\"0.18 * 64.50\")", cap: "stop_reason is tool_use. The model asks for the first calculation — it won't guess the arithmetic." },
      { role: "user", kind: "tool_result", text: "11.61", cap: "Your code ran the calculator and sent the result back (with the matching tool_use_id)." },
      { role: "assistant", kind: "tool_use", text: "calculator(expression=\"11.61 + 64.50\")", cap: "Still not done — the model uses the first result to ask for the second calculation. This is why you need the loop." },
      { role: "user", kind: "tool_result", text: "76.11", cap: "Your code returns the second result." },
      { role: "assistant", kind: "text", text: "18% of 64.50 is 11.61, so the total is 76.11.", cap: "stop_reason is end_turn: the model has what it needs and answers. The loop stops." },
    ];
    let shown = 0;
    const listEl = root.querySelector("#tr-list");
    const capEl = root.querySelector("#tr-cap");
    const stepBtn = root.querySelector("#tr-step");
    const resetBtn = root.querySelector("#tr-reset");
    if (!listEl) return;

    function esc(s) { return s.replace(/&/g, "&amp;").replace(/</g, "&lt;"); }
    function render() {
      listEl.innerHTML = STEPS.slice(0, shown).map((s) =>
        `<div class="tr-msg ${s.kind}">
           <span class="tr-badge">${s.role} · ${s.kind}</span>
           <span class="tr-text">${esc(s.text)}</span>
         </div>`).join("");
      capEl.textContent = shown > 0 ? STEPS[shown - 1].cap : "Press “Run next step” to trace one loop iteration at a time.";
      stepBtn.disabled = shown >= STEPS.length;
      stepBtn.textContent = shown >= STEPS.length ? "Reached end_turn" : "Run next step";
    }
    stepBtn.addEventListener("click", () => { if (shown < STEPS.length) { shown++; render(); } });
    resetBtn.addEventListener("click", () => { shown = 0; render(); });
    render();
  },
};
