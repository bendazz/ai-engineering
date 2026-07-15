/* ============================================================
   Section: Few-shot prompting  (CONCEPT) — Block 4 section 2
   (course section 17). Show, don't just tell.
     - in-context learning: examples in the prompt teach the task/format
       with no training; the zero -> one -> few-shot ladder
     - what examples buy: format lock-in, edge-case guidance, boundary
       disambiguation
     - choosing examples: cover the classes, include the HARD cases your
       eval fails, keep format identical, don't leak your test set
       (overfitting; callback held-out set); "examples are data"
     - diminishing returns + cost: each example adds tokens to EVERY call
       (callback tokens/cost); accuracy rises then plateaus, cost rises
       linearly -> find the knee, and MEASURE (few-shot doesn't always win)
   Concept section: no inline problems; ends "What you learned".

   Star interactive: few-shot tradeoff slider — n examples vs an
   (illustrative, LABELED) accuracy curve and REAL per-call token/cost.

   Facts: builds on verified messages-list + structured-output patterns.
   No new external API facts.

   NOTE (playbook): no literal dollar signs (cost via String.fromCharCode
   (36)); no backtick chars in prose; JSON in code/onMount strings only;
   instructor notes hidden via Toolkit.instructorNote.
   ============================================================ */

window.SectionContent["few-shot"] = {
  title: "Few-shot prompting",

  html: `
    <div class="eyebrow">Prompt Engineering · Section 20</div>
    <h1>Few-shot prompting</h1>

    <p>The most reliable prompt technique after &ldquo;be specific&rdquo; is
    &ldquo;show, don't tell.&rdquo; Instead of only <em>describing</em> the task, you put
    a few worked <strong>examples</strong> right in the prompt. The model reads them and
    picks up the pattern on the spot — no training, no fine-tuning. This is called
    <strong>in-context learning</strong>, and it's one of the genuinely surprising
    powers of these models.</p>

    <h2>The zero, one, few ladder</h2>

    <p><strong>Zero-shot</strong> is what you've done so far: just instructions.
    <strong>One-shot</strong> adds a single example; <strong>few-shot</strong> adds
    several. The cleanest way to supply them is as prior turns in the
    <code>messages</code> list — the model treats them as the conversation's
    established pattern:</p>

    ${Toolkit.code("Python — few-shot as example turns", `messages = [
    {"role": "user", "content": "Review: Broke on day one."},
    {"role": "assistant", "content": '{"sentiment": "negative", "confidence": 0.97}'},
    {"role": "user", "content": "Review: It arrived on Tuesday."},
    {"role": "assistant", "content": '{"sentiment": "neutral", "confidence": 0.80}'},
    {"role": "user", "content": f"Review: {new_review}"},   # the real one
]`)}

    <h2>What examples buy you</h2>
    <ul>
      <li><strong>Format lock-in.</strong> A couple of examples in the exact output
        shape are often better at pinning the format than a paragraph describing it.</li>
      <li><strong>Edge-case guidance.</strong> Show one hard case handled correctly —
        a sarcastic review labeled negative — and the model generalizes the handling.</li>
      <li><strong>Boundary disambiguation.</strong> Examples draw the line between your
        categories far more precisely than adjectives can (&ldquo;what exactly counts as
        neutral?&rdquo; is answered by two neutral examples).</li>
    </ul>

    <h2>Choosing examples well</h2>

    <p>Few-shot is where your eval work pays a dividend: the best examples to add are
    usually the <strong>failures your eval just surfaced.</strong> Turn a miss into a
    demonstration and you've taught the exact weakness away. Beyond that:</p>
    <ul>
      <li><strong>Cover the classes</strong> — don't show only positives.</li>
      <li><strong>Favor hard, representative cases</strong> over easy ones; easy examples
        teach little.</li>
      <li><strong>Keep the format identical</strong> across every example — inconsistency
        in your examples becomes inconsistency in the output.</li>
      <li><strong>Never use your test-set examples as prompt examples.</strong> That's
        leakage: you'd be teaching to the test and your eval number would lie. Draw
        few-shot examples from a separate pool.</li>
    </ul>

    <p>The mental frame your data-minded self will like: <strong>the examples are
    data.</strong> Few-shot prompting is a tiny, in-context version of learning from
    labeled examples — which is exactly why the same discipline (cover the space, don't
    leak the test set) applies.</p>

    <h2>Diminishing returns, and the cost</h2>

    <p>Examples are not free. Every one you add is tokens on <strong>every single
    call</strong> — the input-token cost you studied earlier, paid forever. And the
    benefit curve bends over: the jump from zero to two examples is usually large, from
    two to four smaller, and past that often flat. So there's a knee to find. Slide it:</p>

    ${Toolkit.widget(
      "Few-shot: benefit vs. cost",
      `<label class="grow-slider">Examples in the prompt:
         <strong><span id="fs-n">2</span></strong>
         <input type="range" id="fs-n-i" min="0" max="8" step="1" value="2" />
       </label>
       <div class="metric-row" id="fs-metrics"></div>
       <div class="cm-caption" id="fs-cap"></div>
       <div class="nd-cap">The accuracy curve is illustrative — on <em>your</em> task the
         shape is different, which is the whole point: you'd measure it. The token and
         cost figures are real arithmetic on typical sizes.</div>`
    )}

    <p>And the honest caveat that keeps this from becoming dogma: <strong>few-shot doesn't
    always win.</strong> On some tasks a crisp instruction beats a pile of examples, and
    the examples just cost you tokens. Which is true for <em>your</em> task is, as always,
    an eval question — add examples, re-run, and see if the gain clears the interval.</p>

    ${Toolkit.instructorNote(
      `The move that lands with students: after they run their eval, have them take the
       three or four failures and paste them back into the prompt as few-shot examples,
       then re-run. Watching those specific cases flip — and the number rise — makes
       in-context learning concrete in a way no explanation does. Also flag the leakage
       trap hard: it is the single most common way students accidentally inflate their
       own eval (examples drawn from the same set they test on), and it's the same
       train/test discipline from the stats section.`
    )}

    <h2>What you learned</h2>
    <ul>
      <li><strong>Few-shot / in-context learning</strong> teaches the task by example, no
        training required — the zero → one → few ladder.</li>
      <li>Examples buy <strong>format lock-in, edge-case handling, and boundary
        clarity</strong>; the best ones to add are your eval's own failures.</li>
      <li><strong>Examples are data:</strong> cover the classes, prefer hard cases, keep
        the format consistent, and never draw examples from your test set (leakage).</li>
      <li>Examples cost tokens on <strong>every call</strong> and their benefit
        <strong>plateaus</strong> — find the knee, and confirm few-shot actually helps
        <em>your</em> task with the eval.</li>
    </ul>
  `,

  onMount(root) {
    /* ---- Few-shot tradeoff: illustrative accuracy, real token/cost ---- */
    const D = String.fromCharCode(36);
    const BASE_TOKENS = 130;      // instruction + input, per call
    const PER_EXAMPLE = 45;       // tokens each example adds, per call
    const HAIKU_IN = 1.0;         // USD per 1M input tokens
    const CALLS = 1000;           // a typical eval run

    const nEl = root.querySelector("#fs-n-i");
    const nLab = root.querySelector("#fs-n");
    const metricsEl = root.querySelector("#fs-metrics");
    const capEl = root.querySelector("#fs-cap");
    if (!nEl) return;

    function card(name, val) {
      return `<div class="metric-card"><div class="metric-name">${name}</div>
        <div class="metric-val">${val}</div></div>`;
    }

    function render() {
      const n = parseInt(nEl.value, 10);
      nLab.textContent = n;
      // illustrative concave accuracy curve: 62% at 0-shot -> ~90% asymptote
      const acc = 0.90 - 0.28 * Math.exp(-n / 2.2);
      const tokens = BASE_TOKENS + n * PER_EXAMPLE;
      const runCost = (tokens * CALLS / 1e6) * HAIKU_IN;

      metricsEl.innerHTML =
        card("accuracy (illustrative)", Math.round(acc * 100) + "%") +
        card("tokens / call", tokens) +
        card("cost of a 1000-call run", D + runCost.toFixed(3));

      let msg;
      if (n === 0) msg = "Zero-shot: just instructions. Cheapest possible, but the model has to infer your format and boundaries on its own.";
      else if (n <= 2) msg = "The first example or two usually deliver most of the benefit — this is the steep part of the curve.";
      else if (n <= 4) msg = "Gains are flattening while every call keeps getting more expensive. You're near the knee for many tasks.";
      else msg = "Past here, accuracy has mostly plateaued but you're paying the example tax on every one of the " + CALLS + " calls. Rarely worth it — but measure to be sure.";
      capEl.textContent = msg;
    }

    nEl.addEventListener("input", render);
    render();
  },
};
