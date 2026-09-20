/* ============================================================
   Section: Evaluating tools and groundedness  (CONCEPT) — Block 5
   section 4 (course section 24). Same discipline, new capability.
     - tool-call correctness: dataset input -> expected tool (or None) +
       expected args; metrics = right tool? right args? called-when-should
       and NOT when shouldn't (precision/recall; callback beyond-accuracy).
       Evaluable exactly like classification.
     - groundedness / faithfulness: is every claim in the answer supported
       by the retrieved sources? LLM-judge rubric (callback llm-as-judge).
       The rare, hireable RAG eval.
     - two failure modes: retrieval MISS (recall@k — right passage never
       retrieved) vs ungrounded GENERATION (retrieved but hallucinated
       anyway). Diagnose which before you fix.
   Concept section: no inline problems; ends "What you learned".

   Star interactive: groundedness claim-checker — toggle a grounded vs a
   hallucinated answer; each claim marked supported/unsupported vs the
   sources (scripted, labeled); groundedness score.

   Facts: evals are stats + an LLM-judge (both verified earlier). No new
   external API facts.

   NOTE (playbook): no literal dollar signs; no backtick chars in prose;
   no star-slash in comments; triple-quoted rubric (no literal \\n); instructor
   notes hidden.
   ============================================================ */

window.SectionContent["evaluating-tools"] = {
  title: "Evaluating tools and groundedness",

  html: `
    <div class="eyebrow">Tool Use · Section 28</div>
    <h1>Evaluating tools and groundedness</h1>

    <p>New capability, same question — the one this whole course keeps asking:
    <strong>is it any good, and how do I know?</strong> A tool-using system can fail in two
    new ways, and each has its own measurement. Did the model <em>call the tools
    correctly</em>? And when it retrieved something, is its answer actually
    <em>grounded</em> in what it found?</p>

    <h2>Tool-call correctness</h2>

    <p>The first is reassuringly familiar: it's classification again. Build a dataset where
    each example says what the model <em>should</em> do — which tool (if any) and with what
    arguments:</p>

    ${Toolkit.code("tool_eval.py", `EVAL = [
    {"input": "What is 12% of 340?",         "tool": "calculator",  "args": {"expression": "0.12 * 340"}},
    {"input": "What is your return policy?", "tool": "search_docs", "args": {"query": "return policy"}},
    {"input": "Hi there!",                   "tool": None},   # should NOT call any tool
]

right_tool = 0
for ex in EVAL:
    call = first_tool_call(assistant, ex["input"])   # the first tool the model asked for, or None
    got = call.name if call else None
    right_tool += (got == ex["tool"])

print("tool-selection accuracy:", right_tool / len(EVAL))`)}

    <p>From here it's the metrics you already know. <strong>Tool selection</strong> is a
    classification problem — accuracy, or precision and recall per tool if calls are
    imbalanced. The <code>None</code> rows matter as much as the others: a model that calls
    a tool when it shouldn't (calling <code>search_docs</code> to answer &ldquo;hi&rdquo;)
    is a real failure, the tool-use version of a false positive. And beyond
    <em>which</em> tool, you can score whether the <strong>arguments</strong> were right —
    did it pass a sensible <code>query</code>, the correct <code>expression</code>?</p>

    <h2>Groundedness: is the answer actually supported?</h2>

    <p>The second failure is subtler and is where RAG systems quietly rot. The model
    retrieves some passages and then writes an answer — but does the answer
    <em>stick to</em> those passages, or does it wander off and invent things? An answer can
    be fluent, confident, well-formatted, and <strong>ungrounded</strong>: it states a
    &ldquo;fact&rdquo; the sources never contained. That's a hallucination, and structured
    output won't catch it (shape is not truth).</p>

    <p>You measure grounding the way you measure any open-ended quality: with an
    <strong>LLM judge</strong>, given an anchored rubric that pins it to the sources:</p>

    ${Toolkit.code("groundedness rubric", `GROUNDEDNESS = """You check whether an ANSWER is grounded in the SOURCES.
Judge using only the sources; ignore any outside knowledge.
  2 - every claim in the answer is directly supported by the sources.
  1 - mostly supported, but one minor detail is not in the sources.
  0 - the answer states a claim the sources do not support (a hallucination).
List which claims are supported, then give the score."""`)}

    <p>Same rules as any judge: validate it against a batch of human-labeled answers
    (Cohen's kappa) before you trust it, then let it grade at scale.</p>

    <p>Watch a groundedness check work — flip between a grounded answer and a plausible but
    hallucinated one:</p>

    ${Toolkit.widget(
      "Groundedness check",
      `<div class="gc-sources" id="gc-sources"></div>
       <div class="controls">
         <button class="btn ghost gc-tab active-mode" data-a="good">A grounded answer</button>
         <button class="btn ghost gc-tab" data-a="bad">A hallucinated answer</button>
       </div>
       <div class="gc-answer" id="gc-answer"></div>
       <div class="gc-claims" id="gc-claims"></div>
       <div class="gc-score" id="gc-score"></div>
       <div class="nd-cap">The per-claim supported/unsupported marks are scripted for
         illustration; in your system a judge makes them, and the score is
         supported-claims over total.</div>`
    )}

    <h2>Two failures, measured apart</h2>

    <p>These two evals aren't redundant — they diagnose <strong>different</strong> broken
    parts, and confusing them wastes days. Ask two questions:</p>
    <ul>
      <li><strong>Was the right passage even retrieved?</strong> This is
        <strong>recall@k</strong> — of the questions whose answer lives in your corpus, how
        often did the needed passage appear in the top <em>k</em>. If recall is low, the
        answer <em>cannot</em> be grounded no matter how good the model is — fix retrieval
        (better embeddings, more <em>k</em>, better chunks).</li>
      <li><strong>Given a good passage, did the answer stay faithful to it?</strong> That's
        <strong>groundedness</strong>. If retrieval was fine but groundedness is low, the
        problem is on the generation side — tighten the prompt, tell it to answer only from
        the sources and cite them.</li>
    </ul>

    <p>A confidently wrong RAG answer is one of these two, and the cure is different for
    each. Measuring them separately is what turns &ldquo;the bot lies sometimes&rdquo; into
    a fixable bug.</p>

    ${Toolkit.instructorNote(
      `The recall@k vs. groundedness split is the highest-value idea in this section and a
       genuinely hireable diagnostic — most people conflate "the RAG bot hallucinated" into
       one vague complaint. Drill it as a 2x2: right passage retrieved (yes/no) x answer
       faithful to it (yes/no). Bottom-left (not retrieved) is a retrieval bug; top-right
       (retrieved but unfaithful) is a generation bug; they have completely different fixes.
       This is also the honest bridge to why the deferred course-#4 material (better
       chunking, rerankers, hybrid search) exists — it all lives in the "raise recall@k"
       corner. Keep groundedness itself measured by a kappa-validated judge, per the earlier
       section; an unvalidated groundedness judge is just another confident opinion.`
    )}

    <h2>What you learned</h2>
    <ul>
      <li><strong>Tool-call correctness</strong> is classification: did the model pick the
        right tool (or correctly none), with the right arguments? Score it with accuracy /
        precision / recall — the <code>None</code> cases are real failures too.</li>
      <li><strong>Groundedness</strong> asks whether every claim is supported by the
        retrieved sources — measured with a <strong>kappa-validated LLM judge</strong>,
        because structured output guarantees shape, not truth.</li>
      <li>RAG fails two distinct ways: a <strong>retrieval miss</strong> (low
        <strong>recall@k</strong>) versus <strong>ungrounded generation</strong> — diagnose
        which before you fix, because the cures are different.</li>
    </ul>
  `,

  onMount(root) {
    /* ---- Groundedness claim-checker (scripted, illustrative) ---- */
    const SOURCES = [
      "Refunds are available within 30 days of purchase with a receipt.",
      "Damaged items can be exchanged free within 90 days.",
    ];
    const ANSWERS = {
      good: {
        text: "You can get a refund within 30 days if you have your receipt, and damaged items can be exchanged free for up to 90 days.",
        claims: [
          { c: "refund within 30 days with a receipt", ok: true },
          { c: "damaged items exchanged free within 90 days", ok: true },
        ],
      },
      bad: {
        text: "You can get a refund within 30 days with a receipt, damaged items are exchangeable for 90 days, and refunds are issued instantly to your card.",
        claims: [
          { c: "refund within 30 days with a receipt", ok: true },
          { c: "damaged items exchangeable within 90 days", ok: true },
          { c: "refunds are issued instantly to your card", ok: false },
        ],
      },
    };
    let which = "good";
    const srcEl = root.querySelector("#gc-sources");
    const tabs = Array.prototype.slice.call(root.querySelectorAll(".gc-tab"));
    const ansEl = root.querySelector("#gc-answer");
    const claimsEl = root.querySelector("#gc-claims");
    const scoreEl = root.querySelector("#gc-score");
    if (!srcEl) return;

    srcEl.innerHTML = "<div class=\"gc-src-head\">sources</div>" +
      SOURCES.map((s) => `<div class="gc-src">${s}</div>`).join("");

    function render() {
      const a = ANSWERS[which];
      ansEl.innerHTML = "<div class=\"gc-a-head\">answer</div>" + a.text;
      claimsEl.innerHTML = a.claims.map((cl) =>
        `<div class="gc-claim ${cl.ok ? "ok" : "bad"}">
           <span class="gc-mark">${cl.ok ? "✓ supported" : "✗ not in sources"}</span>
           <span>${cl.c}</span>
         </div>`).join("");
      const ok = a.claims.filter((c) => c.ok).length;
      const total = a.claims.length;
      const grounded = ok === total;
      scoreEl.className = "gc-score " + (grounded ? "real" : "worse");
      scoreEl.innerHTML = "groundedness: <strong>" + ok + " / " + total +
        " claims supported</strong> — " + (grounded
          ? "grounded: every claim traces to a source."
          : "NOT grounded: a confident claim the sources never made. This is what the eval must catch.");
      tabs.forEach((t) => t.classList.toggle("active-mode", t.dataset.a === which));
    }
    tabs.forEach((t) => t.addEventListener("click", () => { which = t.dataset.a; render(); }));
    render();
  },
};
