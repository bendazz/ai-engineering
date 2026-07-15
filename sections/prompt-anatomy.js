/* ============================================================
   Section: Anatomy of a good prompt  (CONCEPT) — opens Block 4
   "Prompt Engineering (measured)", course section 16.
   Now that students can MEASURE, prompting becomes engineering. The
   components that reliably move quality, each a testable hypothesis:
     - a clear, specific instruction (vagueness in -> variance out)
     - a role (system prompt; callback anatomy-of-a-call)
     - delimited input (separate instructions from data)
     - an explicit output format (callback structured-outputs)
     - constraints + an escape hatch ("if unsure, say neutral" =
       the can't-answer bucket)
     - decomposition of big asks
   Then: you don't GUESS which help — you add one and re-run the eval.
   Concept section: no inline problems; ends "What you learned".

   Star interactive: a prompt BUILDER — toggle ingredients on/off and
   watch the actual prompt assemble, with a "what this fixes" note per
   ingredient and an honest structure-score proxy.

   NOTE (playbook): no literal dollar signs; no backtick chars in prose;
   JSON examples live in Toolkit.code / onMount JS strings (no dollar-brace);
   instructor notes hidden via Toolkit.instructorNote.
   ============================================================ */

window.SectionContent["prompt-anatomy"] = {
  title: "Anatomy of a good prompt",

  html: `
    <div class="eyebrow">Prompt Engineering · Section 19</div>
    <h1>Anatomy of a good prompt</h1>

    <p>Everything changes now that you can measure. &ldquo;Prompt engineering&rdquo;
    has a reputation as folklore — a bag of incantations people trade on the internet.
    In this course it's something sharper: a set of <strong>testable choices</strong>,
    each of which you keep only if the eval says it earned its place. This block is
    prompting as engineering. It starts with the anatomy — what a good prompt is
    actually made of.</p>

    <h2>A prompt is a specification</h2>

    <p>The mental model that fixes most bad prompts: a prompt is a
    <strong>spec you hand a very fast, very literal contractor</strong> who has no
    access to your intentions, only your words. Vagueness in, variance out. Compare:</p>

    ${Toolkit.code("Vague — high variance", `Analyze this review.`)}

    ${Toolkit.code("Specific — low variance", `You are a precise sentiment classifier.

Classify the customer review below as positive, negative, or neutral.
Review (between the lines):
---
{review}
---
Respond as JSON: {"sentiment": "...", "confidence": 0.0-1.0}.
The sentiment must be exactly one of: positive, negative, neutral.
If you genuinely cannot tell, use "neutral" with a low confidence.`)}

    <p>The second isn't &ldquo;more polite&rdquo; — it removes the freedoms the model
    would otherwise fill in differently every run. Every added line closes off a way
    the output could have varied.</p>

    <h2>The ingredients</h2>

    <p>A strong prompt is usually some deliberate combination of these. Toggle them and
    watch a real prompt come together:</p>

    ${Toolkit.widget(
      "Prompt builder",
      `<div class="pb-toggles" id="pb-toggles"></div>
       <div class="pb-preview-head">assembled prompt</div>
       <pre class="pb-preview" id="pb-preview"></pre>
       <div class="pb-score" id="pb-score"></div>
       <div class="nd-cap">The prompt really is assembled from your toggles. The
         &ldquo;structure score&rdquo; just counts ingredients — it's a proxy for
         deliberateness, not a promise of quality. Only an eval can tell you if a
         change actually helped.</div>`
    )}

    <ul>
      <li><strong>A clear instruction.</strong> Say exactly what you want done, in
        plain imperative language. &ldquo;Classify as positive/negative/neutral,&rdquo;
        not &ldquo;analyze.&rdquo;</li>
      <li><strong>A role.</strong> A short system-prompt persona sets standing behavior
        (&ldquo;You are a precise classifier&rdquo;). It frames every turn — the
        highest-leverage real estate, as you saw in the anatomy of a call.</li>
      <li><strong>Delimited input.</strong> Fence the data so the model can't confuse
        <em>your instructions</em> with <em>the content</em> it's processing. (This
        also quietly starts to matter for safety.)</li>
      <li><strong>An explicit output format.</strong> State the exact shape you want —
        and when it must be machine-readable, enforce it with structured outputs rather
        than hoping.</li>
      <li><strong>Constraints and an escape hatch.</strong> Pin the allowed answers,
        and always give the model a way to say &ldquo;I can't tell&rdquo; (&ldquo;if
        unsure, answer neutral&rdquo;). That escape hatch is what keeps your
        <em>must-not / can't-answer</em> cases from turning into confident wrong
        answers.</li>
      <li><strong>Decomposition.</strong> If the ask is big, break it into stated steps
        rather than one vague command.</li>
    </ul>

    <h2>Every ingredient is a hypothesis</h2>

    <p>Here's the part that makes this a course about engineering and not about
    incantations: <strong>you do not guess which of these help your task.</strong> Each
    is a hypothesis. You add one to your prompt, run your eval, and look at whether the
    number moved by more than the confidence interval. Some of these will help a lot on
    your task, some barely, and some — genuinely — will hurt. The anatomy tells you what
    to <em>try</em>; the eval tells you what to <em>keep</em>.</p>

    ${Toolkit.instructorNote(
      `If you demo one thing, demo a vague prompt run five times versus a specific one
       run five times — the spread of the vague version collapses under the specific
       one, live. In practice the three ingredients that pay off most often are
       <em>specificity of instruction</em>, an <em>explicit output format</em>, and the
       <em>escape hatch</em> ("say unsure"), which alone kills a whole class of
       confident-wrong failures. Resist the urge to teach a long menu of tricks — the
       durable lesson is the discipline (add one, measure), not any particular
       incantation, which will age out.`
    )}

    <h2>What you learned</h2>
    <ul>
      <li>A prompt is a <strong>specification</strong>: vagueness leaves freedoms the
        model fills in differently every run, which shows up as variance.</li>
      <li>Good prompts combine deliberate ingredients — a clear instruction, a role,
        <strong>delimited input</strong>, an explicit <strong>output format</strong>,
        <strong>constraints plus an escape hatch</strong>, and decomposition.</li>
      <li>These are <strong>hypotheses, not rules</strong>: add one, run the eval, and
        keep it only if the improvement clears the confidence interval. The anatomy says
        what to try; the eval says what to keep.</li>
    </ul>
  `,

  onMount(root) {
    /* ---- Prompt builder: assemble a real prompt from toggles ---- */
    const INGREDIENTS = [
      { id: "role", label: "Role", why: "sets standing behavior",
        text: "You are a precise sentiment classifier." },
      { id: "instruction", label: "Clear instruction", why: "says exactly what to do", on: true, fixed: true,
        text: "Classify the customer review below as positive, negative, or neutral." },
      { id: "delimit", label: "Delimited input", why: "separates instructions from data",
        text: "Review (between the lines):\n---\n{review}\n---" },
      { id: "format", label: "Output format", why: "makes the answer machine-readable",
        text: "Respond as JSON: {\"sentiment\": \"...\", \"confidence\": 0.0-1.0}." },
      { id: "constraint", label: "Constraints + escape hatch", why: "pins answers, allows 'unsure'",
        text: "sentiment must be exactly one of: positive, negative, neutral.\nIf you genuinely cannot tell, use \"neutral\" with a low confidence." },
      { id: "example", label: "An example", why: "shows the target by demonstration",
        text: "Example — Review: \"Never buying again.\" -> {\"sentiment\": \"negative\", \"confidence\": 0.95}" },
      { id: "steps", label: "Step-by-step", why: "decomposes the reasoning",
        text: "First note the emotional cues in the review, then decide the label." },
    ];
    const state = {};
    INGREDIENTS.forEach((g) => { state[g.id] = !!g.on; });

    const togglesEl = root.querySelector("#pb-toggles");
    const previewEl = root.querySelector("#pb-preview");
    const scoreEl = root.querySelector("#pb-score");
    if (!togglesEl) return;

    function renderToggles() {
      togglesEl.innerHTML = INGREDIENTS.map((g) =>
        `<button class="pb-chip${state[g.id] ? " on" : ""}${g.fixed ? " fixed" : ""}" data-id="${g.id}">
           ${state[g.id] ? "✓ " : "+ "}${g.label}<span class="pb-why">${g.why}</span>
         </button>`
      ).join("");
      togglesEl.querySelectorAll(".pb-chip").forEach((b) => {
        const g = INGREDIENTS.find((x) => x.id === b.dataset.id);
        if (g.fixed) return;
        b.addEventListener("click", () => { state[g.id] = !state[g.id]; render(); });
      });
    }

    function render() {
      renderToggles();
      // assemble in a sensible reading order
      const order = ["role", "instruction", "delimit", "format", "constraint", "example", "steps"];
      const parts = order
        .filter((id) => state[id])
        .map((id) => INGREDIENTS.find((g) => g.id === id).text);
      previewEl.textContent = parts.join("\n\n");
      const n = order.filter((id) => state[id]).length;
      scoreEl.innerHTML = "structure score: <strong>" + n + " / " + order.length + "</strong> ingredients";
    }

    render();
  },
};
