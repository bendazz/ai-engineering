/* ============================================================
   Section: Structured outputs  (CONCEPT) — the on-ramp to evals
   Block 2 "Working with the Model", section 4 (course section 10).
   The pivot: to build a SYSTEM on the model (and to MEASURE it), your
   code needs values it can read, not prose it has to guess at.
     - prose is not data; string-parsing free text is a losing game
     - the naive fix (ask for JSON) is fragile — the wobble means
       fences / preambles / trailing commas / wrong labels sneak in
     - schema-enforced structured outputs GUARANTEE parseable shape;
       Pydantic + client.messages.parse() is the clean Python path
     - why this is the precondition for every eval: a guaranteed shape
       is what lets code score outputs automatically
     - honesty: structured output constrains SHAPE, not TRUTH (a valid
       "positive" can still be the wrong label) -> you still need evals
   Concept section: no inline problems; ends "What you learned".

   Star interactive: naive-vs-enforced parser — runs REAL JSON.parse +
   a schema check on hand-authored (labeled) realistic raw outputs;
   naive mode ~1/6 usable, enforced mode 6/6.

   VERIFIED (claude-api skill, 2026-07-02):
     - Recommended: client.messages.parse(model=, max_tokens=,
       messages=[...], output_format=<PydanticBaseModel>) ->
       response.parsed_output (validated instance).
     - Under the hood / raw: messages.create(output_config={"format":
       {"type":"json_schema","schema":{...}}}) guarantees the first
       content block is text with valid JSON. Strict tool use: tool with
       "strict": True + input_schema.
     - Supported models INCLUDE Haiku 4.5 (also Fable 5, Opus 4.8,
       Sonnet 5) — so the examples run on the course default model.

   NOTE (playbook): no literal dollar signs; no backtick chars in prose;
   the ``` code fence in the widget is built with String.fromCharCode(96)
   to avoid unbalanced literal backticks. Instructor notes hidden via
   Toolkit.instructorNote.
   ============================================================ */

window.SectionContent["structured-outputs"] = {
  title: "Structured outputs",

  html: `
    <div class="eyebrow">Working with the Model · Section 13</div>
    <h1>Structured outputs</h1>

    <p>Everything the model has handed back so far is <strong>prose</strong> —
    lovely for a human to read, and nearly useless to a program. If you're building
    a <em>system</em> on top of the model, your code has to reliably pull specific
    values out of each response: a category, a score, a list. And there's a second
    reason that matters even more for this course: <strong>you can't measure what
    you can't read.</strong> An output your code can check by itself is the very
    thing that makes evaluation possible. This section is how you get one.</p>

    <h2>Prose is not data</h2>

    <p>Suppose you're building a sentiment classifier. You ask the model whether a
    review is positive or negative, and it replies:</p>

    ${Toolkit.callout(
      `&ldquo;This review is overwhelmingly positive — the customer is delighted
       with the battery life and calls it the best purchase they've made all
       year.&rdquo;`,
      { label: "What the model said" }
    )}

    <p>A person knows that means <em>positive</em>. But your code wanted the single
    word <code>positive</code> so it could count it, store it, or compare it against
    a known answer. Now it has a sentence. You could try to fish the label out with
    string matching — but what about &ldquo;not negative,&rdquo; or a reply that
    mentions both words, or one in a different language? Parsing free text by hand
    is a game you lose slowly. You need the model to answer in a
    <strong>fixed, predictable shape</strong>.</p>

    <h2>The naive fix — and why it wobbles</h2>

    <p>The obvious move is to just ask for JSON:</p>

    ${Toolkit.code("Python — the fragile way", `response = client.messages.create(
    model="claude-haiku-4-5",
    max_tokens=100,
    messages=[{"role": "user",
               "content": "Classify the sentiment. Reply with JSON: {sentiment, confidence}."}],
)

import json
data = json.loads(response.content[0].text)   # crashes if the text isn't clean JSON`)}

    <p>This works... most of the time. But &ldquo;most of the time&rdquo; is exactly
    the problem, because of the non-determinism you just studied. Run it enough and
    the model will eventually wrap the JSON in a Markdown code fence, add a friendly
    &ldquo;Sure! Here you go:&rdquo; preamble, leave a trailing comma, capitalize
    the label, or invent an extra field — and your <code>json.loads</code> throws an
    exception in production at the worst possible moment. Below are realistic
    examples of what a model actually returns. Run the real parser on them:</p>

    ${Toolkit.widget(
      "Will your code survive the response?",
      `<div class="controls">
         <button class="btn" id="so-naive">Ask nicely for JSON</button>
         <button class="btn ghost" id="so-strict">Enforce a schema</button>
       </div>
       <div class="so-mode" id="so-mode"></div>
       <div class="so-rows" id="so-rows"></div>
       <div class="so-summary" id="so-summary"></div>
       <div class="nd-cap">The sample responses are hand-picked to show the kinds of
         output a model really produces — but the <code>JSON.parse</code> and the
         field check run on them are real.</div>`
    )}

    <h2>The real fix: enforce a schema</h2>

    <p>The robust answer isn't to parse more cleverly — it's to make the malformed
    responses <strong>impossible</strong>. The Claude API can <strong>constrain the
    output to a JSON Schema</strong> you provide, so the response is guaranteed to be
    valid JSON with exactly the fields and types you asked for. In Python the clean
    way to do this is with a <strong>Pydantic</strong> model and
    <code>messages.parse</code>:</p>

    ${Toolkit.code("Python — the reliable way", `from pydantic import BaseModel
from typing import Literal

class Sentiment(BaseModel):
    sentiment: Literal["positive", "negative", "neutral"]
    confidence: float

response = client.messages.parse(
    model="claude-haiku-4-5",             # structured outputs work on Haiku 4.5
    max_tokens=100,
    messages=[{"role": "user",
               "content": "Classify: Best purchase I have made all year!"}],
    output_format=Sentiment,
)

result = response.parsed_output           # a validated Sentiment object
print(result.sentiment)                   # "positive"
print(result.confidence)                  # e.g. 0.97`)}

    <p>Three things just got much better. The response is
    <strong>guaranteed parseable</strong> — no fences, no preamble, no trailing
    commas. It comes back as a real, <strong>validated Python object</strong>
    (<code>result.sentiment</code>), not a string you have to decode. And because
    the field is a <code>Literal</code>, the label is guaranteed to be one of your
    three allowed values — never <code>Positive</code>, never <code>pos</code>,
    never a surprise. That <code>enum</code> constraint alone is worth the price of
    admission for any classification task.</p>

    <p>Under the hood, <code>messages.parse</code> is sending your schema as
    <code>output_config={"format": {"type": "json_schema", ...}}</code> and
    validating the reply against it; you can use that raw form directly if you're
    not in Python. A closely related tool, <strong>strict tool use</strong>, applies
    the same guarantee to a tool's arguments. Same idea either way: the shape is
    enforced by the API, not left to the model's good manners.</p>

    ${Toolkit.instructorNote(
      `The most convincing way to teach this is to break it live. Run the naive
       version in a loop of 15–20 calls in front of the class and let one of them
       come back fenced or chatty and blow up <code>json.loads</code> — the failure
       is the lesson. Then swap in <code>messages.parse</code> with the Pydantic
       model and run the same loop clean. Students who have watched the crash
       internalize why &ldquo;just ask for JSON&rdquo; is not an engineering answer.
       (If you're short on time, the widget above stands in for the demo.)`
    )}

    <h2>Why this is the on-ramp to evaluation</h2>

    <p>Here's the payoff, and the reason this section sits where it does. Once every
    response comes back in a guaranteed shape, your <em>code</em> can judge it:</p>

    ${Toolkit.code("Python", `result = classify(review)                 # returns a validated Sentiment
correct = (result.sentiment == expected_label)   # a comparison a program can make`)}

    <p>That single comparison is the seed of every eval in the rest of this course.
    Run it over ten examples, or a thousand, and you can compute an
    <strong>accuracy</strong> — an actual number that tells you whether the system
    works, and whether your last change helped or hurt. Free-form prose can't be
    tallied; a validated <code>result.sentiment</code> can. <strong>Structured
    output is what turns &ldquo;the model said something&rdquo; into &ldquo;the model
    returned a value I can score.&rdquo;</strong> Without it, there is nothing to
    measure; with it, measurement becomes routine.</p>

    ${Toolkit.callout(
      `One honest limit, and it's an important one: a schema constrains the
       <strong>shape</strong> of the answer, not its <strong>truth</strong>. The
       model can return a perfectly valid <code>{"sentiment": "positive"}</code> for
       a review that was clearly negative. Structured output guarantees you can
       <em>read</em> the answer, never that the answer is <em>right</em>. Closing
       that second gap — is it actually correct? — is exactly what evals are for,
       and where we go next.`,
      { type: "warn", label: "Shape is not truth" }
    )}

    ${Toolkit.instructorNote(
      `This &ldquo;shape vs truth&rdquo; distinction is the clean hinge into the
       evals block, and it's worth stating as a two-part contract: structured
       outputs handle <em>parseability</em> (a machine problem, now solved), and
       evals handle <em>correctness</em> (a measurement problem, coming up). Keeping
       the two ideas separate prevents the common confusion that a valid JSON reply
       is a correct reply.`
    )}

    <h2>Keeping schemas reliable</h2>
    <ul>
      <li><strong>Use enums for categories.</strong> A <code>Literal</code> /
        <code>enum</code> field guarantees one of a known set — the single most
        useful constraint for classification and grading.</li>
      <li><strong>Mark fields required</strong> and disallow stray ones
        (<code>additionalProperties: false</code>) so the shape is exact.</li>
      <li><strong>Keep it flat and small.</strong> Deeply nested schemas are harder
        for the model to fill reliably; simpler shapes are more robust.</li>
      <li><strong>Remember shape is not truth.</strong> A <code>confidence</code> or
        <code>reasoning</code> field can be well-formed and still wrong — useful, but
        not a substitute for measuring correctness.</li>
    </ul>

    <h2>What you learned</h2>
    <ul>
      <li>Free-form prose can't be consumed by code; a <strong>fixed, predictable
        shape</strong> can.</li>
      <li>Asking for JSON in the prompt is <strong>fragile</strong> — non-determinism
        eventually produces fences, preambles, trailing commas, and off-spec labels
        that break naive parsing.</li>
      <li><strong>Schema-enforced structured outputs</strong> guarantee valid,
        parseable JSON with exactly your fields; in Python,
        <code>client.messages.parse</code> with a <strong>Pydantic</strong> model
        returns a validated object, and a <code>Literal</code> field pins categories
        to a known set. (Works on Haiku 4.5 and the larger models.)</li>
      <li>A guaranteed shape is the <strong>precondition for evaluation</strong>:
        it's what lets code compare an output to an expected answer and compute a
        score. But structured output constrains <strong>shape, not truth</strong> —
        measuring correctness is the job of evals.</li>
    </ul>
  `,

  onMount(root) {
    /* ---- Naive-vs-enforced parser -------------------------------------
       Real JSON.parse + a real field check, run on hand-authored (labeled)
       examples of the raw output a model actually returns. */
    const F = String.fromCharCode(96).repeat(3);   // a ``` fence, no literal backticks
    const ALLOWED = ["positive", "negative", "neutral"];

    const NAIVE = [
      { raw: '{"sentiment": "positive", "confidence": 0.94}' },
      { raw: F + 'json\n{"sentiment": "negative", "confidence": 0.8}\n' + F },
      { raw: 'Sure! Here is the classification:\n\n{"sentiment": "positive", "confidence": 0.7}' },
      { raw: '{"sentiment": "positive", "confidence": 0.9,}' },
      { raw: '{"sentiment": "Positive"}' },
      { raw: '{"label": "positive", "confidence": 0.88}' },
    ];
    const STRICT = [
      '{"sentiment": "positive", "confidence": 0.94}',
      '{"sentiment": "negative", "confidence": 0.80}',
      '{"sentiment": "positive", "confidence": 0.70}',
      '{"sentiment": "positive", "confidence": 0.90}',
      '{"sentiment": "positive", "confidence": 0.66}',
      '{"sentiment": "positive", "confidence": 0.88}',
    ].map((raw) => ({ raw }));

    let mode = "naive";

    const naiveBtn = root.querySelector("#so-naive");
    const strictBtn= root.querySelector("#so-strict");
    const modeEl   = root.querySelector("#so-mode");
    const rowsEl   = root.querySelector("#so-rows");
    const sumEl    = root.querySelector("#so-summary");
    if (!rowsEl) return;

    function esc(s) {
      return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    }

    function check(raw) {
      let parsed;
      try { parsed = JSON.parse(raw); }
      catch (e) { return { parseOk: false, err: e.message }; }
      const s = parsed.sentiment, c = parsed.confidence;
      if (!ALLOWED.includes(s)) {
        return { parseOk: true, schemaOk: false,
          schemaMsg: s === undefined ? "no 'sentiment' field" : "'" + s + "' is not an allowed label" };
      }
      if (typeof c !== "number" || c < 0 || c > 1) {
        return { parseOk: true, schemaOk: false, schemaMsg: "missing or invalid 'confidence'" };
      }
      return { parseOk: true, schemaOk: true };
    }

    function badge(ok, okText, badText) {
      return `<span class="so-badge ${ok ? "ok" : "bad"}">${ok ? "✓ " + okText : "✗ " + badText}</span>`;
    }

    function render() {
      const data = mode === "naive" ? NAIVE : STRICT;
      let usable = 0;
      rowsEl.innerHTML = data.map((d) => {
        const r = check(d.raw);
        const parseBadge = badge(r.parseOk, "parses", "JSON error");
        let schemaBadge;
        if (!r.parseOk) {
          schemaBadge = `<span class="so-badge bad">✗ ${esc(r.err)}</span>`;
        } else {
          schemaBadge = badge(r.schemaOk, "valid shape", r.schemaMsg);
        }
        const good = r.parseOk && r.schemaOk;
        if (good) usable += 1;
        return `<div class="so-row ${good ? "good" : "bad"}">
            <pre class="so-raw">${esc(d.raw)}</pre>
            <div class="so-badges">${parseBadge}${schemaBadge}</div>
          </div>`;
      }).join("");

      const n = data.length;
      if (mode === "naive") {
        modeEl.innerHTML = "<strong>Naive mode:</strong> you asked for JSON in the prompt and are running <code>json.loads</code> on whatever comes back.";
        sumEl.className = "so-summary bad";
        sumEl.innerHTML = "Only <strong>" + usable + " of " + n + "</strong> responses were safely usable. The rest would crash or mislead your program.";
      } else {
        modeEl.innerHTML = "<strong>Enforced mode:</strong> the API constrained every response to your schema.";
        sumEl.className = "so-summary good";
        sumEl.innerHTML = "<strong>" + usable + " of " + n + "</strong> responses parse and match the schema. Every one is safe to use.";
      }
      naiveBtn.classList.toggle("active-mode", mode === "naive");
      strictBtn.classList.toggle("active-mode", mode === "strict");
    }

    naiveBtn.addEventListener("click", () => { mode = "naive"; render(); });
    strictBtn.addEventListener("click", () => { mode = "strict"; render(); });
    render();
  },
};
