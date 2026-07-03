/* ============================================================
   Section: Tokens and the context window  (CONCEPT, math-flavored)
   Block 2 "Working with the Model", section 2 (course section 8).
   Makes the billing/limit unit concrete:
     - what a token is (subword/BPE units; ~4 chars / ~0.75 words,
       but it VARIES) and why the model reads/writes/bills in them
     - counting: rough estimate vs the exact count_tokens API;
       the tiktoken trap (wrong tokenizer) -> "measure, don't guess"
     - the context window as a token BUDGET (input+output must fit;
       200K Haiku vs 1M Sonnet/Opus) with honest reference points
     - THE MATH: resending history each turn (statelessness callback)
       makes cumulative input tokens grow like O(N^2)
   Concept section: no inline problems; ends "What you learned".

   Interactives:
     A. honest token ESTIMATOR (chars/words -> est tokens, clearly
        labeled approximate; count_tokens is the exact source).
     B. STAR: growing-conversation meter — slider N, per-turn input
        bars (linear ramp) + cumulative tokens/cost readout showing
        the quadratic blow-up. Model select drives price + window.
     + a small static context-window comparison (200K vs 1M bars).

   Facts (claude-api skill, verified 2026-07-02):
     - client.messages.count_tokens(model=, messages=) -> .input_tokens;
       counts are MODEL-SPECIFIC (pass the model you'll infer with).
     - Do NOT use tiktoken: OpenAI's tokenizer, undercounts Claude by
       ~15-20% (more on code / non-English).
     - Context windows: Haiku 4.5 = 200K; Sonnet 5 & Opus 4.8 = 1M.
     - List prices USD/1M in/out: Haiku 1/5, Sonnet 3/15, Opus 5/25.

   NOTE (playbook): KaTeX commands double-backslashed (\\frac, \\sum,
   \\approx, \\cdot, \\text, \\,). NO literal dollar signs anywhere —
   money written as "USD"/words; widgets build the sign at runtime with
   String.fromCharCode(36). No backtick chars in prose. Inequalities
   and comparators as words or &lt;/&gt;.
   ============================================================ */

window.SectionContent["tokens-and-context"] = {
  title: "Tokens and the context window",

  html: `
    <div class="eyebrow">Working with the Model · Section 8</div>
    <h1>Tokens and the context window</h1>

    <p>The meter on every response reads in <strong>tokens</strong>, and so does
    your bill and every size limit the model has. Tokens are the atom of this whole
    business: they're what the model reads, what it writes, what you pay for, and
    what has to fit. So it's worth a few minutes to make them concrete — and, since
    this is a course about measuring, to learn the difference between
    <em>estimating</em> tokens and <em>counting</em> them exactly.</p>

    <h2>What is a token?</h2>

    <p>A token is not a word and not a character — it's a <strong>subword
    piece</strong>. Language models are trained with a tokenizer that chops text
    into a fixed vocabulary of common chunks: whole short words become single
    tokens, while longer or rarer words split into a few pieces. Roughly, the word
    <strong>tokenization</strong> might come apart as <code>token</code> +
    <code>ization</code>, and a name the tokenizer has never seen splits into even
    smaller bits. Spaces and punctuation count too.</p>

    <p>The useful rule of thumb for ordinary English is:</p>
    <ul>
      <li>about <strong>4 characters</strong> per token, and</li>
      <li>about <strong>0.75 words</strong> per token (so ~750 words is very
        roughly 1,000 tokens).</li>
    </ul>

    <p>But treat that as a ballpark, because it genuinely <em>varies</em>: code,
    JSON, non-English text, unusual names, and lots of whitespace all shift the
    ratio — sometimes a lot. Try it on your own text (this is an estimate, and it
    tells you honestly that it is):</p>

    ${Toolkit.widget(
      "Rough token estimator",
      `<textarea id="te-input" class="tok-ta" rows="3">Tokenization turns text into subword pieces the model can read.</textarea>
       <div class="tok-nums" id="te-nums"></div>
       <div class="nd-cap">A rough estimate only (about 4 characters per token).
         Claude uses its <em>own</em> tokenizer, so the exact number comes from the
         API, below. Do not reach for <code>tiktoken</code> — that is a different
         model's tokenizer and it undercounts Claude.</div>`
    )}

    <h2>Counting tokens honestly</h2>

    <p>An estimate is fine for a rough cost guess. But when the number actually
    matters — deciding whether a document fits, pricing a job before you run it,
    comparing two prompts — you want the <strong>exact</strong> count. Anthropic
    gives you an endpoint for it, and it costs nothing to call:</p>

    ${Toolkit.code("Python", `count = client.messages.count_tokens(
    model="claude-haiku-4-5",     # counts are model-specific
    messages=[{"role": "user", "content": open("essay.txt").read()}],
)
print(count.input_tokens)`)}

    <p>Two things make this the <em>honest</em> way to count. First, it uses
    Claude's real tokenizer, so the number is exact rather than a guess. Second,
    it's <strong>model-specific</strong> — you pass the same model you plan to run,
    because different model families can tokenize slightly differently.</p>

    ${Toolkit.callout(
      `A tempting shortcut you should warn students off: reaching for
       <code>tiktoken</code> (or any &ldquo;GPT token counter&rdquo;) to size a
       Claude prompt. It's the <em>wrong tokenizer</em> — it undercounts Claude by
       around 15 to 20 percent on ordinary prose, and by more on code or
       non-English text. Sizing a job with it is exactly the kind of
       plausible-but-wrong number this course trains you to distrust: when the
       count matters, <strong>measure it with <code>count_tokens</code></strong>,
       don't estimate with the wrong ruler.`,
      { type: "warn", label: "The wrong-ruler trap" }
    )}

    <h2>The context window: a token budget</h2>

    <p>Every model has a <strong>context window</strong> — the maximum number of
    tokens it can consider at once. Here's the key part: the window has to hold
    <strong>both</strong> your input <em>and</em> the reply. Input tokens plus
    output tokens must fit under the ceiling. Overrun it and the call fails; you
    have to send less.</p>

    <p>The models you're using aren't small — but they aren't infinite either:</p>

    <div class="ctx-bars">
      <div class="ctx-row">
        <div class="ctx-name">Haiku 4.5</div>
        <div class="ctx-track"><div class="ctx-fill" style="width:20%"><span>200K tokens</span></div></div>
      </div>
      <div class="ctx-row">
        <div class="ctx-name">Sonnet 5 · Opus 4.8</div>
        <div class="ctx-track"><div class="ctx-fill big" style="width:100%"><span>1,000K tokens</span></div></div>
      </div>
    </div>

    <p>To make those numbers physical: 200,000 tokens is roughly a
    <strong>long novel</strong>; a million tokens is a small <strong>shelf</strong>
    of them. That's a lot of room — but a careless application can still blow the
    budget, and the most common way is the one from last section.</p>

    <h2>Why long conversations get expensive (the math)</h2>

    <p>Remember the big idea from the last section: the API is stateless, so to
    continue a conversation you <strong>resend the entire history every turn</strong>.
    That has a precise and slightly alarming consequence for cost.</p>

    <p>Say each exchange (a user turn plus the model's reply) adds about
    <strong>T</strong> tokens to the transcript. Then the request on turn
    <strong>k</strong> has to carry everything so far — about
    <strong>k·T</strong> input tokens. Add that up over a conversation of
    <strong>N</strong> turns and the total input you've paid to send is:</p>

    <p class="mathline">$$\\sum_{k=1}^{N} kT \\;=\\; T\\cdot\\frac{N(N+1)}{2} \\;\\approx\\; \\frac{T\\,N^{2}}{2}$$</p>

    <p>That is <strong>quadratic</strong> in the length of the conversation. Double
    the number of turns and you roughly <strong>quadruple</strong> the input tokens
    you've paid for — not because any single message got bigger, but because you
    keep recarrying the whole growing history. The per-turn cost climbs in a
    straight line; the running total curves upward. Watch it happen:</p>

    ${Toolkit.widget(
      "The cost of a growing conversation",
      `<div class="ct-models" id="gr-models"></div>
       <label class="grow-slider">Length of conversation:
         <strong><span id="gr-nlabel">10</span> exchanges</strong>
         <input type="range" id="gr-n" min="1" max="30" value="10" />
       </label>
       <div class="grow-bars" id="gr-bars"></div>
       <div class="grow-baseline">input tokens sent per turn (each bar is one request)</div>
       <div class="ct-readout" id="gr-readout"></div>
       <div class="nd-cap">Assumes each exchange adds about 300 tokens of transcript
         and about 200 output tokens. The exact numbers are illustrative — the
         <em>shape</em> (linear per turn, quadratic in total) is real.</div>`
    )}

    ${Toolkit.callout(
      `This is a lovely place to slow down and do the sum on the board, because it
       turns a fuzzy worry (&ldquo;long chats cost more&rdquo;) into a clean
       result: cumulative input scales like N squared. It also motivates real
       engineering they'll do later — trimming or <em>summarizing</em> old turns
       to keep the resent history bounded, rather than letting it grow without
       limit. The math is the argument for the technique.`,
      { type: "note", label: "For you, the instructor" }
    )}

    <h2>What to actually do about it</h2>
    <ul>
      <li><strong>Keep the resent history bounded.</strong> Drop or summarize old
        turns so a long conversation doesn't drag a growing tail of tokens through
        every call.</li>
      <li><strong>Set <code>max_tokens</code> deliberately.</strong> It reserves
        output room inside the window and caps the priciest tokens (output usually
        costs several times more than input).</li>
      <li><strong>Pick the model for the job's size.</strong> If your inputs are
        huge, the 1M window of Sonnet or Opus buys headroom; if they're small,
        Haiku's 200K is plenty and far cheaper.</li>
      <li><strong>Count when it matters.</strong> Use <code>count_tokens</code> to
        check a big input <em>before</em> you send it, instead of discovering the
        ceiling with a failed call.</li>
    </ul>

    <h2>What you learned</h2>
    <ul>
      <li>A <strong>token</strong> is a subword piece — about 4 characters or 0.75
        words for English, but it <em>varies</em> with code, language, and
        formatting.</li>
      <li>The model reads, writes, and <strong>bills</strong> in tokens. Estimate
        with the rule of thumb, but <strong>count exactly with
        <code>count_tokens</code></strong> when the number matters — and never with
        <code>tiktoken</code>, which is the wrong tokenizer.</li>
      <li>The <strong>context window</strong> is a token budget that must hold input
        <em>and</em> output together (200K for Haiku, 1M for Sonnet and Opus).</li>
      <li>Because the API is stateless, resending history makes cumulative input
        tokens grow <strong>quadratically</strong> with conversation length — the
        reason bounding or summarizing history is real engineering, not
        housekeeping.</li>
    </ul>
  `,

  onMount(root) {
    const D = String.fromCharCode(36);   // a dollar sign, built at runtime

    function money(n) {
      if (n < 0.01)  return D + n.toFixed(4);
      if (n < 1)     return D + n.toFixed(3);
      return D + n.toFixed(2);
    }
    function commas(n) {
      return Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }

    /* ---- Widget A: rough token estimator ---- */
    const taEl = root.querySelector("#te-input");
    const numsEl = root.querySelector("#te-nums");
    if (taEl && numsEl) {
      const estimate = () => {
        const text = taEl.value;
        const chars = text.length;
        const words = (text.trim().match(/\S+/g) || []).length;
        const tokens = Math.max(chars ? 1 : 0, Math.round(chars / 4));
        numsEl.innerHTML =
          `<div class="tok-cell"><span class="tok-big">${commas(chars)}</span>characters</div>
           <div class="tok-cell"><span class="tok-big">${commas(words)}</span>words</div>
           <div class="tok-cell est"><span class="tok-big">~${commas(tokens)}</span>estimated tokens</div>`;
      };
      taEl.addEventListener("input", estimate);
      estimate();
    }

    /* ---- Widget B: growing-conversation meter (star) ---- */
    const MODELS = [
      { id: "haiku",  name: "Haiku 4.5", inP: 1, outP: 5,  ctx: 200000  },
      { id: "sonnet", name: "Sonnet 5",  inP: 3, outP: 15, ctx: 1000000 },
      { id: "opus",   name: "Opus 4.8",  inP: 5, outP: 25, ctx: 1000000 },
    ];
    const T = 300;        // tokens added to the transcript per exchange
    const OUT = 200;      // output tokens per reply
    let sel = "haiku";

    const modelsEl  = root.querySelector("#gr-models");
    const nEl       = root.querySelector("#gr-n");
    const nLabelEl  = root.querySelector("#gr-nlabel");
    const barsEl    = root.querySelector("#gr-bars");
    const readoutEl = root.querySelector("#gr-readout");
    if (!modelsEl) return;

    function renderModels() {
      modelsEl.innerHTML = MODELS.map((m) =>
        `<button class="ct-model${m.id === sel ? " sel" : ""}" data-id="${m.id}">
           <span class="ct-mname">${m.name}</span>
           <span class="ct-mprice">${commas(m.ctx)} ctx · USD ${m.inP}/${m.outP} per 1M</span>
         </button>`
      ).join("");
      modelsEl.querySelectorAll(".ct-model").forEach((b) => {
        b.addEventListener("click", () => { sel = b.dataset.id; renderModels(); compute(); });
      });
    }

    function compute() {
      const m = MODELS.find((x) => x.id === sel);
      const N = parseInt(nEl.value, 10);
      nLabelEl.textContent = N;

      // per-turn input tokens: turn k carries ~k*T of history
      const perTurn = [];
      for (let k = 1; k <= N; k++) perTurn.push(k * T);
      const maxTurn = perTurn[perTurn.length - 1];

      const cumInput = T * N * (N + 1) / 2;   // the quadratic sum
      const cumOutput = OUT * N;
      const cost = (cumInput / 1e6) * m.inP + (cumOutput / 1e6) * m.outP;

      // double-the-length comparison
      const N2 = N * 2;
      const cumInput2 = T * N2 * (N2 + 1) / 2;
      const ratio = cumInput > 0 ? cumInput2 / cumInput : 4;

      // bars
      barsEl.innerHTML = perTurn.map((v) => {
        const h = Math.max(4, Math.round((v / maxTurn) * 100));
        return `<div class="grow-bar" style="height:${h}%" title="${commas(v)} tokens"></div>`;
      }).join("");

      const overflow = maxTurn > m.ctx;
      readoutEl.innerHTML =
        `<div class="ct-line"><span>Last turn re-sends</span><span>${commas(maxTurn)} tokens</span></div>
         <div class="ct-line ct-big"><span>Total input over ${N} turns</span><span>${commas(cumInput)}</span></div>
         <div class="ct-line"><span>Estimated cost so far</span><span>${money(cost)}</span></div>
         <div class="ct-line ct-note">Going to <strong>${N2}</strong> exchanges would send about
           <strong>${ratio.toFixed(1)}x</strong> as much input — that is the N-squared curve at work.
           ${overflow
             ? "<br>Heads up: a single turn now exceeds " + m.name + "'s context window."
             : ""}</div>`;
    }

    nEl.addEventListener("input", compute);
    renderModels();
    compute();
  },
};
