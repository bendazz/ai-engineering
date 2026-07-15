/* ============================================================
   Section: Let the model think  (CONCEPT) — Block 4 section 3
   (course section 18). Reasoning before answering.
     - Route 1: ASK for reasoning in the prompt (any model, incl. Haiku)
       — reasoning-before-answer (callback: the judge put reasoning
       first); you see it, it's an audit trail
     - Route 2: NATIVE extended/adaptive thinking on reasoning-tier
       models (Opus/Sonnet/Fable): thinking={"type":"adaptive"}, depth
       via output_config effort; budget_tokens REMOVED; thinking blocks
     - cost is real: reasoning = more output tokens = more cost/latency;
       over-thinking easy tasks wastes money (sometimes hurts)
     - measured: does reasoning help YOUR task enough to justify the cost?
   Concept section: no inline problems; ends "What you learned".

   Star interactive: reasoning tradeoff — easy vs hard task x think on/off
   -> illustrative accuracy + real-ish relative cost.

   VERIFIED (claude-api skill, 2026-07-02):
     - adaptive thinking: thinking={"type":"adaptive"[, "display":
       "summarized"]}; depth via output_config={"effort": low..max};
       budget_tokens REMOVED on Fable5/Opus4.8/4.7 (400), deprecated 4.6.
     - thinking blocks: block.type == "thinking", block.thinking text.
     - Adaptive thinking listed for Fable5/Opus4.8/4.7/4.6, Sonnet5/4.6 —
       NOT Haiku 4.5. So native thinking = reasoning-tier models; for the
       course-default Haiku, prompt-based reasoning is the lever.

   NOTE (playbook): no literal dollar signs; no backtick chars in prose;
   JSON/dicts in code only (no dollar-brace); instructor notes hidden.
   ============================================================ */

window.SectionContent["let-it-think"] = {
  title: "Let the model think",

  html: `
    <div class="eyebrow">Prompt Engineering · Section 21</div>
    <h1>Let the model think</h1>

    <p>Some tasks aren't pattern-matching — they need actual reasoning: multi-step logic,
    arithmetic, weighing evidence, careful judgment. On those, the single most effective
    move is to give the model room to <strong>work before it commits to an answer.</strong>
    There are two ways to do that, and knowing which to reach for (and what it costs) is
    the skill.</p>

    <h2>Route 1: ask for the reasoning (works on any model)</h2>

    <p>The simplest version costs nothing new: make the model produce its reasoning
    <em>before</em> its answer. You've already used this — the LLM judge put a
    <code>reasoning</code> field <strong>first</strong> in its schema on purpose. Because
    the answer is generated after (and conditioned on) the reasoning tokens, the model
    effectively gets to think out loud, and you get an audit trail for free:</p>

    ${Toolkit.code("Python — reasoning before the label", `class Answer(BaseModel):
    reasoning: str                                   # the model works here first...
    label: Literal["positive", "negative", "neutral"]  # ...then commits

# Field order matters: 'reasoning' comes before 'label', so the model
# generates its thinking before the answer — and you can read it back.`)}

    <p>The classic prompt version is just adding &ldquo;think step by step, then
    answer.&rdquo; Fair warning, and an honesty point: on <em>modern</em> models that
    old incantation is weaker than it used to be — they already reason more by default —
    so treat it as a hypothesis to test, not a magic phrase to sprinkle everywhere.</p>

    <h2>Route 2: native extended thinking (the reasoning-tier models)</h2>

    <p>The bigger models — Opus, Sonnet, and Fable — have a first-class
    <strong>thinking mode</strong>: a dedicated scratchpad the model reasons in before it
    writes the answer, returned as separate <em>thinking blocks</em>. You turn it on with
    a parameter and control how hard it thinks with <code>effort</code>:</p>

    ${Toolkit.code("Python — native adaptive thinking", `resp = client.messages.create(
    model="claude-sonnet-5",            # a reasoning-tier model
    max_tokens=2000,
    thinking={"type": "adaptive"},      # give it a reasoning scratchpad
    output_config={"effort": "high"},   # how hard to think: low | medium | high | max
    messages=[{"role": "user", "content": hard_question}],
)

for block in resp.content:
    if block.type == "thinking":
        print("reasoning:", block.thinking)
    elif block.type == "text":
        print("answer:", block.text)`)}

    ${Toolkit.callout(
      `Two things that have <strong>changed</strong> here, so recalled snippets may be
       stale: you no longer set a manual <code>budget_tokens</code> — it's removed on the
       current models (sending it is an error); depth is controlled by
       <code>effort</code> instead. And native thinking lives on the
       <strong>reasoning-tier</strong> models — Opus, Sonnet, Fable. Our cheap default,
       Haiku 4.5, isn't a thinking model, so on Haiku you reach for Route 1
       (prompt-based reasoning); when a task truly needs deep reasoning, that's a reason
       to move up to a bigger model.`,
      { type: "note", label: "Verified July 2026 — a moving target" }
    )}

    <h2>Reasoning costs real money</h2>

    <p>Thinking is not free lunch: every reasoning token is an <strong>output token</strong>,
    the priciest kind, and it adds latency too. Worse, reasoning can <em>backfire</em> on
    easy tasks — force elaborate deliberation on a trivial classification and you pay
    multiples for no gain, and can even talk the model out of a right answer. Reasoning is
    a tool for <strong>hard</strong> problems, not a seasoning you add to everything. Feel
    the tradeoff:</p>

    ${Toolkit.widget(
      "When does thinking earn its cost?",
      `<div class="controls">
         <button class="btn ghost lt-task active-mode" data-t="easy">Easy task (simple classify)</button>
         <button class="btn ghost lt-task" data-t="hard">Hard task (multi-step reasoning)</button>
       </div>
       <label class="lt-switch"><input type="checkbox" id="lt-think"> Let the model think</label>
       <div class="metric-row" id="lt-metrics"></div>
       <div class="cm-caption" id="lt-cap"></div>
       <div class="nd-cap">Accuracies are illustrative of the typical pattern; the cost
         multiplier reflects that reasoning burns extra output tokens. On your own task,
         you'd measure both the accuracy gain and the cost — and decide.</div>`
    )}

    <h2>So: measured, like everything</h2>

    <p>Whether reasoning helps is an eval question with a cost attached. Add it, run the
    eval, and weigh <strong>two</strong> numbers, not one: did accuracy rise by more than
    the confidence interval, <em>and</em> is that gain worth the extra tokens and latency?
    A real answer sounds like &ldquo;reasoning bought us four points on the hard slice for
    triple the cost — worth it there, not on the easy slice.&rdquo;</p>

    ${Toolkit.instructorNote(
      `The nuance worth protecting students from is cargo-culting &ldquo;think step by
       step.&rdquo; On current models it is not a universal win, and native thinking is
       both model-gated and billed as output tokens. The durable lesson is the cost/benefit
       framing: reasoning trades tokens and latency for accuracy on genuinely hard tasks,
       and the eval (plus a glance at the cost) is how you decide. A nice demo is to run a
       simple sentiment classify with and without a forced reasoning field and show the
       accuracy is unchanged while the token count jumps — the tax with no benefit.`
    )}

    <h2>What you learned</h2>
    <ul>
      <li>Reasoning before answering helps on genuinely hard tasks. <strong>Route 1</strong>:
        ask for it in the prompt / put a <code>reasoning</code> field first — works on any
        model, including Haiku, and gives you an audit trail.</li>
      <li><strong>Route 2</strong>: native <strong>adaptive thinking</strong> on the
        reasoning-tier models (Opus/Sonnet/Fable) — <code>thinking={"type":"adaptive"}</code>
        with depth set by <code>effort</code>; <code>budget_tokens</code> is gone, and Haiku
        isn't a thinking model.</li>
      <li>Reasoning burns <strong>output tokens</strong> (cost + latency) and can
        <strong>hurt on easy tasks</strong> — it's a tool for hard problems, not a default.</li>
      <li>Decide with the eval and the cost together: keep reasoning only where the accuracy
        gain <strong>clears the interval and justifies the price.</strong></li>
    </ul>
  `,

  onMount(root) {
    /* ---- Reasoning tradeoff: illustrative accuracy + relative cost ---- */
    const TASK = {
      easy: { off: 0.92, on: 0.93, costOff: 1.0, costOn: 2.5,
              note: "A simple classification. Thinking barely moves accuracy but multiplies the cost — a tax with no benefit." },
      hard: { off: 0.61, on: 0.82, costOff: 1.0, costOn: 3.0,
              note: "A genuine multi-step problem. Here the reasoning space earns its cost: a big accuracy jump that a single-shot answer can't reach." },
    };
    let task = "easy";

    const taskBtns = Array.prototype.slice.call(root.querySelectorAll(".lt-task"));
    const thinkEl = root.querySelector("#lt-think");
    const metricsEl = root.querySelector("#lt-metrics");
    const capEl = root.querySelector("#lt-cap");
    if (!thinkEl) return;

    function card(name, val) {
      return `<div class="metric-card"><div class="metric-name">${name}</div>
        <div class="metric-val">${val}</div></div>`;
    }
    function render() {
      const t = TASK[task];
      const on = thinkEl.checked;
      const acc = on ? t.on : t.off;
      const cost = on ? t.costOn : t.costOff;
      const gain = Math.round((t.on - t.off) * 100);
      metricsEl.innerHTML =
        card("accuracy", Math.round(acc * 100) + "%") +
        card("relative cost", cost.toFixed(1) + "x") +
        card("gain from thinking", "+" + gain + " pts");
      let msg = t.note;
      if (on && task === "easy") msg = "Thinking ON, easy task: you just paid about 2.5x the tokens for ~1 point. On easy work, reasoning is money down the drain.";
      if (on && task === "hard") msg = "Thinking ON, hard task: +21 points for ~3x the cost. This is exactly where reasoning belongs — measure it and keep it here.";
      capEl.textContent = msg;
    }

    taskBtns.forEach((b) => b.addEventListener("click", () => {
      task = b.dataset.t;
      taskBtns.forEach((x) => x.classList.toggle("active-mode", x === b));
      render();
    }));
    thinkEl.addEventListener("change", render);
    render();
  },
};
