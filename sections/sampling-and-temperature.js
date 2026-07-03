/* ============================================================
   Section: Sampling and temperature  (CONCEPT, math-flavored)
   Block 2 "Working with the Model", section 3 (course section 9).
   Explains the MECHANISM behind Section 1's wobble and the knob:
     - the model emits a probability distribution over the next token
       (softmax over logits) and SAMPLES from it -> randomness
     - temperature reshapes that distribution:
         p_i = e^{z_i/T} / sum_j e^{z_j/T}
       T->0 sharpens to argmax (near-greedy); T=1 = natural; T>1 flatter
     - the knob in practice + its HONEST limits
   Concept section: no inline problems; ends "What you learned".

   Star interactive: a softmax/temperature reshaper — a slider warps a
   fixed (illustrative, LABELED) set of next-token logits into live
   probability bars, plus a "draw 20 samples" tally that shows low T ->
   nearly always the top token, high T -> spread. Real math, real
   Math.random sampling; hand-picked logits are labeled illustrative.

   VERIFIED (claude-api skill, 2026-07-02) — this changed the section:
     - temperature range is 0.0-1.0 (default 1.0) on models that accept
       it; our default HAIKU 4.5 DOES accept it (so the experiment is
       real). error-codes.md: "Invalid temperature value (must be 0.0-1.0)".
     - FRONTIER models remove the knob: temperature/top_p/top_k are
       REJECTED with 400 on Opus 4.7/4.8, Sonnet 5, Fable 5 — steer by
       prompting instead.
     - Pass only ONE of temperature / top_p (both -> 400 on Claude 4+).
     - temperature=0 never guaranteed identical outputs.

   NOTE (playbook): KaTeX commands double-backslashed (\\frac, \\sum,
   \\to, \\;). No literal dollar signs. No backtick chars in prose.
   Instructor notes via Toolkit.instructorNote (hidden from students).
   ============================================================ */

window.SectionContent["sampling-and-temperature"] = {
  title: "Sampling and temperature",

  html: `
    <div class="eyebrow">Working with the Model · Section 9</div>
    <h1>Sampling and temperature</h1>

    <p>Back in the first section you watched the model give different answers to
    the same prompt, and you've since seen it happen for real. Now let's open the
    hood: <em>where</em> does that randomness come from, and what — if anything —
    can you do about it? The answer is a small, beautiful piece of machinery, and
    understanding it changes how you think about controlling the model.</p>

    <h2>The model doesn't choose a word — it samples one</h2>

    <p>A language model generates text one token at a time. At each step it does
    <strong>not</strong> simply decide on the next token. Instead it produces a
    <strong>score for every token in its vocabulary</strong> — tens of thousands of
    numbers called <em>logits</em> — saying how well each one fits so far. Those
    scores are turned into a <strong>probability distribution</strong>, and then
    the model <strong>draws one token at random</strong> from that distribution.</p>

    <p>Say the prompt so far is &ldquo;The weather today is&rdquo;. The model's
    distribution over the next word might look like this:</p>

    <ul>
      <li><strong>sunny</strong> — 46%</li>
      <li><strong>cloudy</strong> — 21%</li>
      <li><strong>warm</strong> — 12%</li>
      <li><strong>cold</strong> — 8%</li>
      <li>... and a long tail of less likely words.</li>
    </ul>

    <p>Most of the time it draws &ldquo;sunny&rdquo; — but not always. And it makes
    a fresh draw at <em>every</em> token position, for the whole reply. Multiply a
    little randomness at each step across a paragraph, and you get answers that are
    different every time. <strong>That is the wobble, exactly.</strong> It isn't a
    glitch bolted on for variety; it's how the model writes at all.</p>

    <h2>Temperature: sharpening or flattening the distribution</h2>

    <p>Now the knob. The raw scores are converted to probabilities with a function
    called <strong>softmax</strong>, and softmax has a dial in it called the
    <strong>temperature</strong> <em>T</em>. For token <em>i</em> with score
    <em>z</em><sub>i</sub>:</p>

    <p class="mathline">$$p_i \\;=\\; \\frac{e^{\\,z_i / T}}{\\sum_j e^{\\,z_j / T}}$$</p>

    <p>Dividing the scores by <em>T</em> before exponentiating is the whole trick,
    and it does something intuitive:</p>
    <ul>
      <li><strong>As <em>T</em> approaches 0</strong>, the biggest score runs away
        from the rest and its probability approaches 1. The model becomes nearly
        <strong>greedy</strong> — it almost always takes the single most likely
        token. Output gets focused and far more repeatable.</li>
      <li><strong>At <em>T</em> = 1</strong>, you get the model's natural
        distribution — the scores as trained.</li>
      <li><strong>As <em>T</em> grows past 1</strong>, the distribution
        <strong>flattens</strong>: long-shot tokens get more of the mass, so output
        gets more varied, more surprising, and eventually incoherent.</li>
    </ul>

    <p>Drag the temperature below and watch the same fixed scores turn into very
    different distributions — then draw samples from each to feel what
    &ldquo;sharper&rdquo; and &ldquo;flatter&rdquo; actually mean:</p>

    ${Toolkit.widget(
      "Temperature reshapes the distribution",
      `<label class="grow-slider">Temperature <em>T</em> =
         <strong><span id="tp-tlabel">0.70</span></strong>
         <input type="range" id="tp-temp" min="0.05" max="1.5" step="0.05" value="0.70" />
       </label>
       <div class="temp-scalebar"><span>0 · greedy</span><span>1 · natural</span><span>1.5 · wild</span></div>
       <div class="temp-dist" id="tp-bars"></div>
       <div class="controls">
         <button class="btn" id="tp-sample">Draw 20 samples at this T</button>
         <button class="btn ghost" id="tp-reset">Clear</button>
       </div>
       <div class="temp-tally" id="tp-tally"></div>
       <div class="nd-cap">The seven candidate words and their scores are
         hand-picked for illustration, but the softmax math and the random draws
         are the real thing. Claude accepts <em>T</em> from 0 to 1; past 1 here
         just shows the trend.</div>`
    )}

    ${Toolkit.instructorNote(
      `This is the payoff for the math-minded students, and a great board moment:
       derive that softmax with T in the denominator sends the distribution to the
       argmax as T goes to 0 and toward uniform as T grows. Subtracting the max
       score before exponentiating (for numerical stability) is a nice aside that
       connects to how it's really implemented. If you want a single sentence for
       the class: <em>temperature is the contrast knob on the probability
       distribution</em> — low is high-contrast (one winner), high is washed-out
       (everyone's in the running).`
    )}

    <h2>The knob in your code — and its real limits</h2>

    <p>On a model that exposes it, <code>temperature</code> is just another
    parameter, ranging from <strong>0.0 to 1.0</strong> (the default is
    <strong>1.0</strong>). Our workhorse, Haiku 4.5, accepts it, so you can run this
    yourself:</p>

    ${Toolkit.code("Python", `# Focused and far more repeatable: low temperature
resp = client.messages.create(
    model="claude-haiku-4-5",
    max_tokens=50,
    temperature=0.0,          # hug the most likely tokens
    messages=[{"role": "user", "content": "Name one primary color."}],
)`)}

    <p>Run that a few times and the answers vary much less than they did in the
    wobble experiment. Bump <code>temperature</code> up to <code>1.0</code> and ask
    for &ldquo;five quirky names for a coffee shop,&rdquo; and you'll want the
    spread. One rule to remember: set <strong>either</strong> <code>temperature</code>
    <strong>or</strong> <code>top_p</code> (a related knob), <strong>not both</strong>
    — sending both is an error on current models.</p>

    <p>Now the two honest caveats, because they matter more than the knob itself:</p>

    ${Toolkit.callout(
      `<strong>Low temperature is not determinism.</strong> Even at
       <code>temperature=0</code> the model is <em>not</em> guaranteed to return the
       same text twice — floating-point details, load balancing, and routing all
       introduce tiny variations. You can dial variance <em>down</em>, sometimes a
       lot, but you cannot dial it to zero. A language model is never a pure
       function.`,
      { type: "warn", label: "Temperature 0 still wobbles" }
    )}

    ${Toolkit.callout(
      `<strong>The strongest models remove the knob entirely.</strong> On Anthropic's
       frontier models — Opus 4.7 and 4.8, Sonnet 5, Fable 5 — the
       <code>temperature</code>, <code>top_p</code>, and <code>top_k</code>
       parameters are <strong>rejected outright</strong> (the API returns an error).
       You steer those models with <em>prompting</em> instead: if you want focused,
       consistent output, you ask for it in words. Temperature lives on the smaller
       and older models (like Haiku 4.5); on the biggest ones, sampling is simply a
       fact you design around.`,
      { type: "note", label: "A moving target — verified July 2026" }
    )}

    <p>Put those together and you arrive at the idea this whole course is built on.
    You cannot make a language model deterministic. Temperature lets you reduce the
    variance on some models, never eliminate it, and on the best models you don't
    get the knob at all. <strong>Non-determinism is not a setting you switch off —
    it's the ground you build on.</strong> That is precisely why, from here on,
    &ldquo;did my change help?&rdquo; can only be answered by <em>measuring across
    many samples</em>, not by running it once.</p>

    ${Toolkit.instructorNote(
      `The temptation students will have is to &ldquo;just set temperature to 0 and
       make it deterministic so testing is easy.&rdquo; Head that off directly: it
       doesn't fully work even where the knob exists, and it doesn't exist on the
       models they'll most want to use. This is the motivational hinge of the
       course — the reason the next block builds evals. Verify the frontier-model
       behavior live if you can; it drifts, and the students respect that you
       checked rather than trusting a slide.`
    )}

    <h2>So which temperature should you use?</h2>
    <p>When the knob is available, the choice follows the task:</p>
    <ul>
      <li><strong>Low temperature</strong> (near 0) for work with a
        <em>right answer</em>: classification, extraction, structured output,
        grading, following a strict format. You want focus and repeatability.</li>
      <li><strong>Higher temperature</strong> (up toward 1) for work that benefits
        from <em>variety</em>: brainstorming, drafting, alternatives, creative
        copy.</li>
      <li>Either way, <strong>measure at the setting you'll ship.</strong> If your
        product runs at temperature 1 (or on a model with no knob), evaluate it
        there — testing at a calmer setting than you deploy just hides the variance
        you'll actually face.</li>
    </ul>

    <h2>What you learned</h2>
    <ul>
      <li>A model generates by producing a <strong>probability distribution</strong>
        over the next token (softmax over logits) and <strong>sampling</strong> from
        it — repeated every token, which is where the wobble comes from.</li>
      <li><strong>Temperature</strong> reshapes that distribution:
        $p_i = e^{z_i/T} / \\sum_j e^{z_j/T}$. Low <em>T</em> sharpens toward the
        top token (near-greedy); <em>T</em> near 1 is the natural spread; higher
        flattens it.</li>
      <li>In code, <code>temperature</code> runs <strong>0.0 to 1.0</strong> (default
        1.0) where it exists — set only one of <code>temperature</code> or
        <code>top_p</code>.</li>
      <li>But <strong>you can't buy determinism</strong>: temperature 0 still varies,
        and the frontier models drop the knob entirely (you steer them by prompting).
        Non-determinism is permanent — which is why measurement, not a single run,
        is how you tell whether a change helped.</li>
    </ul>
  `,

  onMount(root) {
    /* ---- Softmax / temperature reshaper -------------------------------
       Fixed, illustrative logits for the next token after "The weather
       today is ___". softmax(T) is the real thing; draws use Math.random. */
    const TOKENS = [
      { t: "sunny",  z: 3.0 },
      { t: "cloudy", z: 2.2 },
      { t: "warm",   z: 1.7 },
      { t: "cold",   z: 1.1 },
      { t: "rainy",  z: 0.6 },
      { t: "fine",   z: 0.1 },
      { t: "gloomy", z: -0.5 },
    ];

    const tempEl   = root.querySelector("#tp-temp");
    const tlabelEl = root.querySelector("#tp-tlabel");
    const barsEl   = root.querySelector("#tp-bars");
    const sampleBtn= root.querySelector("#tp-sample");
    const resetBtn = root.querySelector("#tp-reset");
    const tallyEl  = root.querySelector("#tp-tally");
    if (!tempEl) return;

    function softmax(T) {
      const m = Math.max.apply(null, TOKENS.map((d) => d.z));
      const exps = TOKENS.map((d) => Math.exp((d.z - m) / T));
      const sum = exps.reduce((a, b) => a + b, 0);
      return exps.map((e) => e / sum);
    }

    function renderBars() {
      const T = parseFloat(tempEl.value);
      tlabelEl.textContent = T.toFixed(2);
      const p = softmax(T);
      const pmax = Math.max.apply(null, p);
      barsEl.innerHTML = TOKENS.map((d, i) => {
        const pct = p[i] * 100;
        const w = (p[i] / pmax) * 100;         // scale bar to the tallest
        const top = i === 0 ? " top" : "";
        return `<div class="temp-row">
            <div class="temp-tok">${d.t}</div>
            <div class="temp-track"><div class="temp-fill${top}" style="width:${w.toFixed(1)}%"></div></div>
            <div class="temp-pct">${pct < 1 ? pct.toFixed(1) : Math.round(pct)}%</div>
          </div>`;
      }).join("");
    }

    function draw(p) {
      const r = Math.random();
      let acc = 0;
      for (let i = 0; i < p.length; i++) { acc += p[i]; if (r <= acc) return i; }
      return p.length - 1;
    }

    function sample() {
      const T = parseFloat(tempEl.value);
      const p = softmax(T);
      const counts = TOKENS.map(() => 0);
      for (let n = 0; n < 20; n++) counts[draw(p)] += 1;
      const distinct = counts.filter((c) => c > 0).length;
      const chips = TOKENS.map((d, i) =>
        counts[i] > 0
          ? `<span class="temp-chip${i === 0 ? " top" : ""}">${d.t} ×${counts[i]}</span>`
          : ""
      ).join("");
      tallyEl.innerHTML =
        `<div class="temp-tally-head">20 draws at <em>T</em> = ${T.toFixed(2)} —
           ${distinct} distinct word${distinct === 1 ? "" : "s"}${
             distinct === 1 ? " (effectively greedy)" : ""}</div>
         <div class="temp-chips">${chips}</div>`;
    }

    tempEl.addEventListener("input", renderBars);
    sampleBtn.addEventListener("click", sample);
    resetBtn.addEventListener("click", () => { tallyEl.innerHTML = ""; });
    renderBars();
  },
};
