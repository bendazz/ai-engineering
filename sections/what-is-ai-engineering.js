/* ============================================================
   Section: What AI engineering is (and isn't)
   The opening concept section for the AI-engineering course. It
   sets the frame the whole course rests on:
     1. You BUILD ON a finished model; you don't TRAIN one.
     2. That model is NON-DETERMINISTIC — a call is a sample, not
        a lookup. (response ~ model(prompt), a squiggle not an =.)
     3. So the defining question of the job is "is my change
        actually better, and how do I KNOW?" — i.e. measurement /
        evals, the spine of the course.
   Interactives: a static build-vs-train schematic, and an honest
   (clearly-illustrative) non-determinism roller that accumulates
   into a tally, seeding evals and structured outputs at once.
   No code yet, no API key — that starts next section.
   ============================================================ */

window.SectionContent["what-is-ai-engineering"] = {
  title: "What AI engineering is (and isn't)",

  html: `
    <div class="eyebrow">Setup &amp; First Contact · Section 1</div>
    <h1>What AI engineering is (and isn't)</h1>

    <p>In the first course you learned the <em>mathematics</em> underneath these
    models. In the second you learned, without writing code, what an AI app is
    made of and what it can do. This course is the third step, and it is a
    different kind of step: here you do <strong>the job</strong>. You will write
    real Python, keep it in a real repository, and build small systems the way a
    working <strong>AI engineer</strong> builds them. So the first question worth
    answering carefully is: what <em>is</em> that job?</p>

    <h2>You build on the model — you don't build the model</h2>

    <p>There is a job that creates language models: gather enormous amounts of
    text, run a training process that adjusts billions of numbers inside a neural
    network, and produce a finished model. That is the work of a
    <strong>machine-learning engineer</strong> or researcher, and it is mostly
    what your first course was preparing the ground for. <strong>It is not this
    course.</strong></p>

    <p>AI engineering starts <em>after</em> that model exists. You treat the
    finished model as a given — a component you call, the way you'd call a
    database or a payment service — and your job is to build a
    <strong>reliable product around it</strong>. You never touch the numbers
    inside; you decide what text goes in, what comes back out, and everything
    that has to happen around those two moments to make the result trustworthy.</p>

    <div class="bt-split">
      <div class="bt-card">
        <div class="bt-head">Machine-learning engineer</div>
        <div class="bt-verb">Builds the model</div>
        <p class="bt-what">Data → training → a finished model. Changes what is
        <em>inside</em> the box. Thinks in gradients, loss curves, GPUs.</p>
      </div>
      <div class="bt-card bt-you">
        <div class="bt-head">AI engineer — you</div>
        <div class="bt-verb">Builds <em>on</em> the model</div>
        <p class="bt-what">Takes the finished model as given and builds the
        system <em>around</em> it. Changes what goes <em>into</em> the box and
        what happens to what comes <em>out</em>. Thinks in prompts, tools,
        retrieval, tests, cost, and deployment.</p>
      </div>
    </div>

    ${Toolkit.callout(
      `If a student asks "so are we doing machine learning — neural nets,
       gradient descent, training?", the honest answer is: that is the course
       <em>before</em> the model exists. We begin where it leaves off. We will
       never train a model in here; we will call finished ones (like Claude)
       over the network and engineer everything around them. Keeping that line
       crisp saves a lot of confusion later.`,
      { type: "note", label: "For you, the instructor" }
    )}

    <h2>The twist: the component is not deterministic</h2>

    <p>Here is the one fact that makes this job genuinely different from ordinary
    software engineering. Every other component you have ever called is
    <strong>deterministic</strong>: give <code>sqrt</code> the number nine and it
    returns three, today, tomorrow, forever. A language model does not behave
    that way. Ask it the exact same thing twice and you can get two different
    answers.</p>

    <p>In your first course you might have written the model as a function:</p>

    <p style="text-align:center; font-size:1.1rem">
      $\\text{response} = \\text{model}(\\text{prompt})$
    </p>

    <p>That was <em>almost</em> right, and the small thing it gets wrong is the
    most important thing in this whole course. The honest version replaces the
    equals sign with a squiggle:</p>

    <p style="text-align:center; font-size:1.1rem">
      $\\text{response} \\sim \\text{model}(\\text{prompt})$
    </p>

    <p>Read the squiggle as <strong>"is a sample from."</strong> The model
    doesn't hold one fixed answer for your prompt; it defines a whole
    <em>range</em> of possible answers with different likelihoods, and each call
    hands you <strong>one draw</strong> from that range. Nearly everything that
    is strange, hard, and interesting about AI engineering flows from that single
    change of symbol. Watch it happen:</p>

    ${Toolkit.widget(
      "The same prompt, run again and again",
      `<div class="nd-prompt">Prompt: <em>Reply with one word — is this review
         positive or negative?</em><br>“The food was cold and the waiter was rude.”</div>

       <div class="controls">
         <button class="btn" id="nd-run1">Run once</button>
         <button class="btn" id="nd-run10">Run 10×</button>
         <button class="btn ghost" id="nd-reset">Reset</button>
       </div>

       <div class="nd-log-label">Raw text the model returned (newest first):</div>
       <div class="nd-log" id="nd-log"><span class="nd-empty">No runs yet — press a button.</span></div>

       <div class="nd-tally" id="nd-tally">
         <div class="nd-row">
           <div class="nd-key">Clean &amp; correct</div>
           <div class="nd-track"><div class="nd-fill clean" id="nd-fill-clean"></div></div>
           <div class="nd-count" id="nd-count-clean">0</div>
         </div>
         <div class="nd-row">
           <div class="nd-key">Right idea, messy format</div>
           <div class="nd-track"><div class="nd-fill messy" id="nd-fill-messy"></div></div>
           <div class="nd-count" id="nd-count-messy">0</div>
         </div>
         <div class="nd-row">
           <div class="nd-key">Wrong answer</div>
           <div class="nd-track"><div class="nd-fill wrong" id="nd-fill-wrong"></div></div>
           <div class="nd-count" id="nd-count-wrong">0</div>
         </div>
       </div>

       <div class="readout">
         <div class="stat"><span class="label">Runs</span><span class="value" id="nd-total">0</span></div>
         <div class="stat"><span class="label">Correct meaning</span><span class="value" id="nd-correct">—</span></div>
         <div class="stat"><span class="label">Usable as-is</span><span class="value" id="nd-usable">—</span></div>
       </div>

       <div class="nd-cap">Illustrative — these outputs follow a realistic
         distribution so you can see the effect. In the very next section you'll
         get a key and produce the <em>real</em> numbers from your own code.</div>`
    )}

    <p>Three separate headaches are on display in that one little widget, and
    each names a real part of the job:</p>

    <ul>
      <li><strong>The wording drifts.</strong> Same meaning, different text every
      run. You will learn to pin the output into a clean, fixed shape.</li>
      <li><strong>Some answers are correct but unusable.</strong> "The review is
      negative." means the right thing, but a program that expected the single
      word <code>negative</code> chokes on it. The gap between "a human would
      accept this" and "my code can consume this" is enormous.</li>
      <li><strong>Some answers are simply wrong.</strong> Not often here — but
      "not often" is a number, and you had better know what it is.</li>
    </ul>

    <h2>So the whole job reorganizes around one question</h2>

    <p>Think about what that squiggle does to ordinary software practice. In
    normal engineering you write code, a test passes or fails, and you ship. But
    how do you write <code>assert model_output == "negative"</code> when the
    output legitimately varies, and is sometimes phrased three different ways,
    and is occasionally just wrong? You can't. The old idea of a test breaks.</p>

    <p>What replaces it is <strong>measurement</strong>. You stop asking "does it
    pass?" and start asking a question with a number for an answer:</p>

    ${Toolkit.callout(
      `<strong>"I changed something — is it actually better, and how do I
       know?"</strong> That question is the spine of this course. Every time we
       add a capability — structure, a tool, retrieval, memory, a whole agent —
       we will also build the thing that <em>measures</em> whether it helped.
       That measurement has a name in this field: an <strong>eval</strong>.
       Turning "it seems good" into a trustworthy number is the single skill that
       separates someone who once got a model to do a neat trick from someone a
       company will let ship.`,
      { type: "ai", label: "The spine of this course" }
    )}

    <p>This is also, quietly, good news for how we will work. "Is it better?"
    is a question about counting and comparing — how often is it right, is this
    difference real or just noise, how confident can I be. That is measurement,
    and measurement is something we can be rigorous about rather than hand-wavy.
    The fuzzy-sounding parts of AI ("is the answer <em>good</em>?") will keep
    getting pinned to numbers we can actually defend.</p>

    <h2>The shape of the work</h2>

    <p>Everything else in the course is a way of controlling what goes into that
    box, or handling what comes out — always with an eval watching to tell us
    whether a change helped. The moving parts of the job look like this:</p>

    <ul>
      <li><strong>Get clean output</strong> — force the model's text into a shape
      your code can trust.</li>
      <li><strong>Give the model reach</strong> — let it call tools and look
      things up, so it can act and use facts it wasn't born knowing.</li>
      <li><strong>Feed it the right context</strong> — retrieve the relevant
      material and put it in the prompt (retrieval, the RAG idea from course two,
      now built by hand).</li>
      <li><strong>Let it work in steps</strong> — agents that plan, act, and
      loop toward a goal.</li>
      <li><strong>Make it survive production</strong> — cost, speed, retries,
      guardrails, and watching it once real people are using it.</li>
      <li><strong>Ship and keep it honest</strong> — deploy it as a service,
      version your prompts, and re-run your evals so it doesn't silently rot.</li>
    </ul>

    <p>Notice there is no separate "testing unit" and no separate "deployment
    unit" bolted on at the end. Because the component is non-deterministic,
    measuring and shipping are not topics we visit once — they are threaded
    through everything, which is exactly how the real job feels.</p>

    ${Toolkit.callout(
      `A live thing worth doing on day one: open the chat assistant, paste the
       review prompt from the widget, and send it three or four times in a row so
       the class watches the answer wobble with their own eyes. Then ask: "if a
       customer's refund depended on this, how would you find out how often it's
       wrong?" That question <em>is</em> the course, and it lands harder when
       they've just seen the wobble.`,
      { type: "note", label: "For you, the instructor" }
    )}

    <h2>What you learned</h2>
    <ul>
      <li>AI engineering means <strong>building on a finished model</strong>, not
      training one — you engineer everything <em>around</em> the box, never the
      numbers inside it.</li>
      <li>The model is <strong>non-deterministic</strong>: a call is a
      <em>sample</em>, not a lookup. Honestly, $\\text{response} \\sim
      \\text{model}(\\text{prompt})$ — a squiggle, not an equals sign.</li>
      <li>That one fact breaks the ordinary idea of a pass/fail test and replaces
      it with <strong>measurement</strong>.</li>
      <li>The spine of the course is one question: <strong>"is my change actually
      better, and how do I know?"</strong> — answered with <strong>evals</strong>.</li>
      <li>Testing and deployment aren't end-of-course add-ons; non-determinism
      threads them through <strong>everything</strong> you build.</li>
    </ul>
  `,

  onMount(root) {
    /* ---- Non-determinism roller ------------------------------------
       Honest & illustrative: we draw from a realistic weighted set of
       outputs a real model might return for this sentiment prompt.
       Three buckets:
         clean  = correct meaning AND directly machine-usable ("negative")
         messy  = correct meaning but not clean (punctuation / verbosity)
         wrong  = incorrect answer
       Math.random() is genuine browser JS, so the wobble is real. ---- */
    const OUTCOMES = [
      { text: "Negative",                w: 45, cat: "clean" },
      { text: "negative",                w: 12, cat: "clean" },
      { text: "Negative.",               w: 18, cat: "messy" },
      { text: "negative sentiment",      w: 5,  cat: "messy" },
      { text: "The review is negative.", w: 10, cat: "messy" },
      { text: "Neutral",                 w: 5,  cat: "wrong" },
      { text: "Positive",                w: 5,  cat: "wrong" },
    ];
    const TOTAL_W = OUTCOMES.reduce((a, o) => a + o.w, 0);

    const counts = { clean: 0, messy: 0, wrong: 0 };
    let total = 0;
    const log = []; // newest first

    const logEl   = root.querySelector("#nd-log");
    const totalEl = root.querySelector("#nd-total");
    const correctEl = root.querySelector("#nd-correct");
    const usableEl  = root.querySelector("#nd-usable");
    const fills  = {
      clean: root.querySelector("#nd-fill-clean"),
      messy: root.querySelector("#nd-fill-messy"),
      wrong: root.querySelector("#nd-fill-wrong"),
    };
    const nums = {
      clean: root.querySelector("#nd-count-clean"),
      messy: root.querySelector("#nd-count-messy"),
      wrong: root.querySelector("#nd-count-wrong"),
    };

    function draw() {
      let r = Math.random() * TOTAL_W;
      for (const o of OUTCOMES) {
        r -= o.w;
        if (r <= 0) return o;
      }
      return OUTCOMES[0];
    }

    function render() {
      totalEl.textContent = String(total);

      if (total === 0) {
        correctEl.textContent = "—";
        usableEl.textContent = "—";
      } else {
        const correct = counts.clean + counts.messy; // right meaning
        correctEl.textContent = Math.round((correct / total) * 100) + "%";
        usableEl.textContent = Math.round((counts.clean / total) * 100) + "%";
      }

      ["clean", "messy", "wrong"].forEach((cat) => {
        nums[cat].textContent = String(counts[cat]);
        const share = total ? (counts[cat] / total) * 100 : 0;
        fills[cat].style.width = share + "%";
      });

      if (log.length === 0) {
        logEl.innerHTML = '<span class="nd-empty">No runs yet — press a button.</span>';
        return;
      }
      logEl.innerHTML = log
        .slice(0, 14)
        .map((o) => `<span class="nd-chip ${o.cat}">“${o.text}”</span>`)
        .join("");
    }

    function runN(n) {
      for (let i = 0; i < n; i++) {
        const o = draw();
        counts[o.cat] += 1;
        total += 1;
        log.unshift(o);
      }
      render();
    }

    root.querySelector("#nd-run1").addEventListener("click", () => runN(1));
    root.querySelector("#nd-run10").addEventListener("click", () => runN(10));
    root.querySelector("#nd-reset").addEventListener("click", () => {
      counts.clean = counts.messy = counts.wrong = 0;
      total = 0;
      log.length = 0;
      render();
    });

    render();
  },
};
