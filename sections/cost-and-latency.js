/* ============================================================
   Section: Cost & latency as engineering  (CONCEPT) — Block 7 section 2
   (course section 33).
     - the cost model: input vs output tokens (output ~5x pricier);
       conversation resend grows cost O(N^2) (callback tokens-and-context);
       cost/request = in_tok*in_price + out_tok*out_price (+ cache)
     - right-sizing the model: Haiku 1/5, Sonnet 5 3/15, Opus 4.8 5/25,
       Fable 5 10/50 (USD per 1M in/out). Pick the CHEAPEST model that
       passes your eval — don't default to the biggest.
     - latency: dominated by OUTPUT tokens (autoregressive), plus thinking
       + tool round-trips; streaming improves PERCEIVED latency not total
     - percentiles: the mean hides the tail. p50/p95/p99. Your slowest 5%
       churn. Measure p95, not the average. (stats callback)
     - the accuracy/cost/latency frontier: you can't max all three; the
       eval tells you where you can afford to sit
   Concept section: no inline problems; ends "What you learned".

   Star interactives: (1) request-cost calculator (REAL arithmetic over
   verified per-model prices); (2) latency-percentile visualizer (REAL
   p50/p95/p99 over a skewed sample, mean marked to show it lies).

   VERIFIED (claude-api skill, models table 2026): per-1M USD prices —
   Haiku 4.5 1/5 (200K ctx), Sonnet 5 3/15, Opus 4.8 5/25, Fable 5 10/50.

   NOTE (playbook): no literal dollar signs (words in prose;
   String.fromCharCode in onMount); no backtick chars in prose; no
   star-slash inside comments; no raw less-than in html; instructor notes hidden.
   ============================================================ */

window.SectionContent["cost-and-latency"] = {
  title: "Cost and latency as engineering",

  html: `
    <div class="eyebrow">Production · Section 33</div>
    <h1>Cost and latency as engineering</h1>

    <p>In a notebook, cost and speed are invisible — one call is a fraction of a cent and finishes
    while you blink. Multiply by a million requests a month and they become the two numbers your
    boss asks about first. In production, <strong>cost and latency are quality metrics</strong>,
    measured and engineered exactly like accuracy. The good news: you already have the eval that
    tells you how much of each you can afford to trade.</p>

    <h2>The cost model</h2>

    <p>You pay per token, and the two directions are priced differently: <strong>output tokens
    cost several times more than input tokens</strong> (on our default model, one dollar per
    million in, five dollars per million out). So a request's cost is roughly:</p>

    <p class="formula-line">cost ≈ (input tokens × input price) + (output tokens × output price)</p>

    <p>Two consequences follow. First, <strong>long outputs are expensive</strong> — capping
    <code>max_tokens</code> and asking for concise answers is a real cost lever. Second, remember
    the quadratic from Block 2: in a growing conversation you resend the whole history every turn,
    so a chat's cumulative token cost grows like the <em>square</em> of its length. Long agent
    trajectories and long chats are where the money goes.</p>

    <p>Put in some numbers — the cost here is genuine arithmetic over real per-model prices:</p>

    ${Toolkit.widget(
      "Request cost calculator",
      `<div class="cl-controls">
         <label class="cl-field">input tokens
           <input type="range" id="cl-in" min="100" max="20000" step="100" value="2000"></label>
         <label class="cl-field">output tokens
           <input type="range" id="cl-out" min="50" max="4000" step="50" value="600"></label>
         <label class="cl-field">requests / month
           <input type="range" id="cl-req" min="1000" max="2000000" step="1000" value="100000"></label>
       </div>
       <table class="cl-table" id="cl-table"></table>
       <div class="nd-cap">Prices are per million tokens (input / output), from the current model
         table. The cheapest model that passes your eval is usually the right answer — bigger is
         not automatically better, and here it is 10× the bill.</div>`
    )}

    <h2>Right-sizing the model</h2>

    <p>The instinct to reach for the most powerful model is the same mistake as reaching for an
    agent when a workflow would do. The professional move is <strong>right-sizing</strong>: run
    your eval on the cheapest model first, and only move up when the eval says you must. If Haiku
    passes, shipping Opus is setting five dollars on fire for every one you needed to spend. The
    eval turns &ldquo;which model?&rdquo; from a vibe into a measured decision.</p>

    <h2>Latency, and the tyranny of the tail</h2>

    <p>Latency is mostly about <strong>output</strong>: the model generates one token at a time, so
    a long answer is a slow answer, while a huge prompt is processed comparatively fast. Extended
    thinking and tool round-trips add more. <strong>Streaming</strong> doesn't make the total any
    faster, but it makes it <em>feel</em> fast — the user sees words immediately instead of staring
    at a spinner — which is why you stream anything user-facing.</p>

    <p>Now the part people get wrong: <strong>don't report the average.</strong> Latency
    distributions are skewed — most requests are quick, a few are slow — and the average hides the
    slow tail that actually drives people away. You report <strong>percentiles</strong>: p50 (the
    median), p95, p99. &ldquo;p95 = 4 seconds&rdquo; means one in twenty requests is at least that
    slow, and those users are the ones who leave. Watch how badly the mean can lie:</p>

    ${Toolkit.widget(
      "Latency: the mean vs the tail",
      `<canvas id="pc-canvas"></canvas>
       <div class="pc-stats" id="pc-stats"></div>
       <div class="controls">
         <button class="btn ghost pc-tab active-mode" data-d="typical">Typical traffic</button>
         <button class="btn ghost pc-tab" data-d="spiky">A slow tail</button>
       </div>
       <div class="nd-cap">Real percentiles computed over the sample. Notice the mean sits far left
         of p95 — optimizing &ldquo;average latency&rdquo; can leave your worst-served users exactly
         as miserable.</div>`
    )}

    <h2>The frontier</h2>

    <p>Accuracy, cost, and latency pull against each other. A bigger model or more thinking buys
    accuracy at the price of both money and speed; a smaller model and a token cap buy cheapness
    and speed at the risk of accuracy. There is no setting that maximizes all three — there's only
    a <strong>frontier</strong> of achievable trade-offs, and <em>where you sit on it is a business
    decision your eval makes for you.</em> Set an accuracy bar you must clear, then take the
    cheapest, fastest configuration that clears it. That sentence is most of production engineering.</p>

    ${Toolkit.instructorNote(
      `The percentile point is the most transferable idea here and pure Chad-bait for the stats
       backbone: averages of skewed distributions are lies, and latency is always skewed. Draw the
       histogram on the board, mark the mean, then mark p95 way out to the right, and ask &ldquo;who
       are the users at p99?&rdquo; (answer: the ones writing the angry reviews). Tie right-sizing
       back to the eval spine explicitly — &ldquo;which model&rdquo; is not a taste question, it's
       the cheapest model that clears your accuracy bar, full stop. If students internalize
       &ldquo;measure p95, ship the cheapest model that passes,&rdquo; they're already ahead of most
       working practitioners. The frontier framing (pick the accuracy floor, minimize the rest) is
       the same shape as the precision/recall threshold choice from Block 3 — same discipline,
       different axes.`
    )}

    <h2>What you learned</h2>
    <ul>
      <li>Cost is <strong>input + output tokens at different prices</strong> (output is several
        times pricier), and conversation resend makes chat cost grow <strong>quadratically</strong>.</li>
      <li><strong>Right-size the model</strong>: ship the cheapest one that clears your eval bar —
        bigger is not automatically better, just more expensive.</li>
      <li>Latency is driven by <strong>output tokens</strong>; streaming fixes <em>perceived</em>
        speed. Report <strong>percentiles (p95/p99), never the average</strong> — the tail is what
        churns users.</li>
      <li>Accuracy, cost, and latency form a <strong>frontier</strong>: set an accuracy floor with
        your eval, then take the cheapest, fastest config that clears it.</li>
    </ul>
  `,

  onMount(root) {
    const D = String.fromCharCode(36);

    /* ---- (1) Request cost calculator: REAL arithmetic ---- */
    const MODELS = [
      { name: "Haiku 4.5", inP: 1, outP: 5 },
      { name: "Sonnet 5", inP: 3, outP: 15 },
      { name: "Opus 4.8", inP: 5, outP: 25 },
      { name: "Fable 5", inP: 10, outP: 50 },
    ];
    const inEl = root.querySelector("#cl-in");
    const outEl = root.querySelector("#cl-out");
    const reqEl = root.querySelector("#cl-req");
    const clTable = root.querySelector("#cl-table");

    function fmtReq(n) {
      if (n >= 1000000) return (n / 1000000).toFixed(1).replace(".0", "") + "M";
      if (n >= 1000) return Math.round(n / 1000) + "k";
      return "" + n;
    }
    function renderCost() {
      if (!clTable) return;
      const inTok = +inEl.value, outTok = +outEl.value, req = +reqEl.value;
      clTable.innerHTML =
        `<thead><tr><th>model</th><th>per request</th><th>per ${fmtReq(req)} / month</th></tr></thead>` +
        "<tbody>" + MODELS.map((m, i) => {
          const per = (inTok / 1e6) * m.inP + (outTok / 1e6) * m.outP;
          const monthly = per * req;
          return `<tr class="${i === 0 ? "cl-cheap" : ""}">
             <td>${m.name}${i === 0 ? ' <span class="cl-tag">default</span>' : ""}</td>
             <td class="cl-num">${D}${per.toFixed(5)}</td>
             <td class="cl-num">${D}${monthly.toLocaleString("en-US", { maximumFractionDigits: 0 })}</td>
           </tr>`;
        }).join("") + "</tbody>";
    }
    [inEl, outEl, reqEl].forEach((el) => el && el.addEventListener("input", renderCost));
    renderCost();

    /* ---- (2) Latency percentile visualizer: REAL percentiles ---- */
    const SAMPLES = {
      typical: [0.6,0.7,0.7,0.8,0.8,0.8,0.9,0.9,0.9,0.9,1.0,1.0,1.0,1.1,1.1,1.2,1.2,1.3,1.4,1.6,1.9,2.4,3.1],
      spiky:   [0.6,0.7,0.7,0.8,0.8,0.9,0.9,0.9,1.0,1.0,1.0,1.1,1.1,1.2,1.3,1.4,1.6,2.2,3.5,5.0,6.8,8.1,9.4],
    };
    let dist = "typical";
    const canvas = root.querySelector("#pc-canvas");
    const statsEl = root.querySelector("#pc-stats");
    const pcTabs = Array.prototype.slice.call(root.querySelectorAll(".pc-tab"));

    function percentile(sorted, p) {
      const idx = Math.min(sorted.length - 1, Math.floor((p / 100) * sorted.length));
      return sorted[idx];
    }
    function drawLatency() {
      if (!canvas) return;
      const data = SAMPLES[dist].slice().sort((a, b) => a - b);
      const mean = data.reduce((a, b) => a + b, 0) / data.length;
      const p50 = percentile(data, 50), p95 = percentile(data, 95), p99 = percentile(data, 99);
      const { ctx, w, h } = Toolkit.fitCanvas(canvas, 150);
      ctx.clearRect(0, 0, w, h);
      const maxV = data[data.length - 1] * 1.1;
      const bins = 18, counts = new Array(bins).fill(0);
      data.forEach((v) => { const b = Math.min(bins - 1, Math.floor((v / maxV) * bins)); counts[b]++; });
      const maxC = Math.max.apply(null, counts);
      const bw = w / bins;
      for (let i = 0; i < bins; i++) {
        const bh = (counts[i] / maxC) * (h - 30);
        ctx.fillStyle = "#c7cbf5";
        ctx.fillRect(i * bw + 1, h - 20 - bh, bw - 2, bh);
      }
      function mark(v, color, label) {
        const x = (v / maxV) * w;
        ctx.strokeStyle = color; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(x, 6); ctx.lineTo(x, h - 20); ctx.stroke();
        ctx.fillStyle = color; ctx.font = "600 11px -apple-system, sans-serif";
        ctx.fillText(label, Math.min(w - 30, x + 3), 15);
      }
      mark(mean, "#8a93a6", "mean");
      mark(p95, "#be123c", "p95");
      statsEl.innerHTML =
        `<span class="pc-stat"><b>mean</b> ${mean.toFixed(1)}s</span>
         <span class="pc-stat"><b>p50</b> ${p50.toFixed(1)}s</span>
         <span class="pc-stat pc-warn"><b>p95</b> ${p95.toFixed(1)}s</span>
         <span class="pc-stat pc-warn"><b>p99</b> ${p99.toFixed(1)}s</span>`;
    }
    pcTabs.forEach((t) => t.addEventListener("click", () => {
      dist = t.dataset.d;
      pcTabs.forEach((x) => x.classList.toggle("active-mode", x === t));
      drawLatency();
    }));
    drawLatency();
    window.addEventListener("resize", drawLatency);
  },
};
