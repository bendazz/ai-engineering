/* ============================================================
   Section: Monitoring & drift  (CONCEPT) — Block 8 section 4
   (course section 41).
     - the system is live; monitoring = watching it. Built on tracing
       (Block 7): aggregate traces -> time-series dashboards + alerts
     - what to watch: success rate, cost/request, p95 latency, error rate,
       guardrail-block rate -- over TIME
     - alerting: thresholds -> page someone when crossed
     - DRIFT (the LLM-specific rot): the world changes (new products, new
       user behavior, even a provider model update), so a system that aced
       its LAUNCH eval silently degrades as the input distribution moves
     - offline vs online eval: offline = a curated SNAPSHOT (gates changes,
       sec 40); online = the live stream (catches drift). You need both.
     - detecting drift: watch online metrics for slow declines; sample prod
       continuously and eval it (the flywheel, forever); watch input shift
     - responding: mine new failures into the eval set, fix, re-baseline
   Concept section: no inline problems; ends "What you learned".

   Star interactive: monitoring dashboard — canvas time-series of a metric
   over weeks with an alert threshold; a drift event (slow decline) trips
   the alert; toggle success rate / p95 latency / cost per request.

   NOTE (playbook): no literal dollar signs (String.fromCharCode in onMount);
   no backtick chars in prose; no star-slash inside comments; no raw
   less-than in html; instructor notes hidden.
   ============================================================ */

window.SectionContent["monitoring-and-drift"] = {
  title: "Monitoring and drift",

  html: `
    <div class="eyebrow">Deployment · Section 43</div>
    <h1>Monitoring and drift</h1>

    <p>Your system passed its evals, cleared the CI gate, and shipped. You are not done — you're
    just now responsible for something that runs continuously, in a world that won't hold still.
    <strong>Monitoring</strong> is how you watch a live system, and it exists because of a problem
    unique to building on a model: a system that was correct at launch can rot without a single line
    of your code changing.</p>

    <h2>Monitoring is your traces, aggregated</h2>

    <p>You already did the hard part in Block 7: you trace every request. Monitoring is just those
    traces rolled up over time into dashboards and alerts. The vital signs to chart:</p>
    <ul>
      <li><strong>Success rate</strong> — from online labels, user signals (thumbs, escalations), or
        a sampled eval on live traffic.</li>
      <li><strong>Cost per request</strong> and <strong>p95 latency</strong> — the Block-7 metrics,
        now watched as trend lines, not one-off numbers.</li>
      <li><strong>Error rate</strong> and <strong>guardrail-block rate</strong> — a spike in either
        is an early warning that something changed.</li>
    </ul>
    <p>And an <strong>alert</strong> on each: when a metric crosses a threshold, someone gets paged.
    A dashboard nobody looks at catches nothing; the alert is what makes monitoring active.</p>

    <h2>Drift: the rot you can't see coming</h2>

    <p>Here's the part that's special to LLM systems. Your offline eval is a <strong>snapshot</strong>
    — the cases you had when you built it. But production is a <em>moving</em> distribution. New
    products launch, users start asking things they never asked, slang shifts, a holiday changes
    behavior — and even the model underneath you can be updated by the provider. None of that touches
    your code, and yet the system that scored 93% at launch is quietly answering a different mix of
    questions than the one you tested. That slow decay is <strong>drift</strong>, and you only see it
    if you're watching:</p>

    ${Toolkit.widget(
      "Production monitor",
      `<div class="controls">
         <button class="btn ghost mo-tab active-mode" data-m="success">Success rate</button>
         <button class="btn ghost mo-tab" data-m="latency">p95 latency</button>
         <button class="btn ghost mo-tab" data-m="cost">Cost / request</button>
       </div>
       <canvas id="mo-canvas"></canvas>
       <div class="mo-readout" id="mo-readout"></div>
       <div class="nd-cap">Twelve weeks of a live metric with its alert threshold. The numbers are
         illustrative, but the shape is the real danger: nothing broke, no code changed, and quality
         drifted below the line anyway — visible only because it was monitored.</div>`
    )}

    <h2>Offline and online eval, together</h2>

    <p>This is why you keep <em>two</em> kinds of eval running, and why they don't replace each other.
    Your <strong>offline eval</strong> — the curated suite from Block 3 — is what gates changes in CI:
    stable, repeatable, the thing you compare against. Your <strong>online eval</strong> — sampling
    real production traffic and scoring it — is what catches drift, because it tracks the distribution
    that's actually arriving. Offline tells you a <em>change</em> is safe; online tells you the
    <em>world</em> moved. You need both.</p>

    <h2>When drift shows up, the flywheel turns</h2>

    <p>Catching drift isn't the end — it's the trigger for the loop you built in Block 7. The new
    failures your monitor surfaces get <strong>mined into your eval set</strong>, so your offline
    suite grows to include the cases reality just invented. Then you fix the prompt or the retrieval,
    verify the fix against the now-updated eval (gated by CI), and re-baseline. Monitoring feeds the
    flywheel, and the flywheel is how a deployed system stays good <em>after</em> launch instead of
    slowly rotting. A system nobody monitors isn't stable — it's just failing where you can't see.</p>

    ${Toolkit.instructorNote(
      `The idea students underestimate: LLM systems degrade with no code change, because the input
       distribution drifts out from under a static eval. Make it concrete — a support bot trained on
       last year's products fielding questions about this year's; a bot whose "success" quietly fell
       because users started asking a new kind of question it was never good at. The offline/online
       split is the clean mental model: offline = repeatable snapshot for gating (sec 40), online =
       live stream for detecting drift. Draw the connection to Block 7's flywheel explicitly — drift
       detection is the intake valve that keeps the flywheel spinning after launch. Good discussion
       prompt: "the model provider ships an update overnight and your prompt now behaves differently —
       how would you even know?" (answer: your online metrics move; nothing else tells you). This is
       also the honest counter to "we evaluated it, so we're done" — you're never done, you're
       watching.`
    )}

    <h2>What you learned</h2>
    <ul>
      <li><strong>Monitoring</strong> is your Block-7 traces aggregated over time into dashboards and
        <strong>alerts</strong> — success rate, cost, p95 latency, error and guardrail-block rates.</li>
      <li><strong>Drift</strong> is the LLM-specific rot: the input distribution moves (or the model
        updates), so a launch-correct system silently degrades with no code change.</li>
      <li>You run <strong>offline eval</strong> (a snapshot, to gate changes) <em>and</em>
        <strong>online eval</strong> (sampled live traffic, to catch drift) — they don't replace each
        other.</li>
      <li>Detected drift feeds the <strong>flywheel</strong>: new failures become eval cases, you fix
        and re-baseline — how a deployed system stays good after launch.</li>
    </ul>
  `,

  onMount(root) {
    const D = String.fromCharCode(36);
    /* ---- Production monitor: canvas time-series with an alert threshold ---- */
    const WEEKS = 12;
    const METRICS = {
      success: {
        label: "success rate", fmt: (v) => (v * 100).toFixed(0) + "%",
        series: [0.93,0.93,0.92,0.92,0.91,0.90,0.89,0.88,0.87,0.86,0.85,0.84],
        threshold: 0.88, below: true,
        drift: "Success drifted from 93% to 84% over the quarter — users began asking about newly launched products the bot was never evaluated on. No code changed; the world did.",
      },
      latency: {
        label: "p95 latency", fmt: (v) => v.toFixed(1) + "s",
        series: [1.8,1.9,1.8,1.9,2.0,1.9,2.1,2.2,2.6,3.4,3.9,4.2],
        threshold: 3.0, below: false,
        drift: "p95 latency crept up as the prompt grew and answers got longer — the slowest 5% of users now wait over 4 seconds. The mean still looks fine; the tail doesn't.",
      },
      cost: {
        label: "cost / request", fmt: (v) => D + v.toFixed(4),
        series: [0.0011,0.0011,0.0012,0.0012,0.0013,0.0014,0.0015,0.0017,0.0019,0.0021,0.0023,0.0025],
        threshold: 0.0020, below: false,
        drift: "Cost per request more than doubled as retrieved context and history grew unchecked — a slow leak that only a trend line reveals.",
      },
    };
    let cur = "success";
    const canvas = root.querySelector("#mo-canvas");
    const readoutEl = root.querySelector("#mo-readout");
    const tabs = Array.prototype.slice.call(root.querySelectorAll(".mo-tab"));
    if (!canvas) return;

    function draw() {
      const m = METRICS[cur];
      const { ctx, w, h } = Toolkit.fitCanvas(canvas, 170);
      ctx.clearRect(0, 0, w, h);
      const padL = 44, padR = 12, padT = 14, padB = 24;
      const all = m.series.concat([m.threshold]);
      let lo = Math.min.apply(null, all), hi = Math.max.apply(null, all);
      const span = (hi - lo) || 1; lo -= span * 0.15; hi += span * 0.15;
      const X = (i) => padL + (i / (WEEKS - 1)) * (w - padL - padR);
      const Y = (v) => padT + (1 - (v - lo) / (hi - lo)) * (h - padT - padB);

      // threshold line
      ctx.strokeStyle = "#be123c"; ctx.setLineDash([5, 4]); ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(padL, Y(m.threshold)); ctx.lineTo(w - padR, Y(m.threshold)); ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = "#be123c"; ctx.font = "10px -apple-system, sans-serif";
      ctx.fillText("alert " + m.fmt(m.threshold), padL, Y(m.threshold) - 4);

      // metric line
      ctx.strokeStyle = "#4f46e5"; ctx.lineWidth = 2; ctx.beginPath();
      m.series.forEach((v, i) => { const x = X(i), y = Y(v); i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); });
      ctx.stroke();
      // points, red once past the threshold
      m.series.forEach((v, i) => {
        const breached = m.below ? v < m.threshold : v > m.threshold;
        ctx.fillStyle = breached ? "#be123c" : "#4f46e5";
        ctx.beginPath(); ctx.arc(X(i), Y(v), 3, 0, 2 * Math.PI); ctx.fill();
      });
      // axis labels
      ctx.fillStyle = "#8a93a6"; ctx.font = "10px -apple-system, sans-serif";
      ctx.fillText("wk 1", padL - 2, h - 8); ctx.fillText("wk 12", w - padR - 28, h - 8);

      const last = m.series[m.series.length - 1];
      const breached = m.below ? last < m.threshold : last > m.threshold;
      readoutEl.innerHTML =
        `<div class="mo-now ${breached ? "alert" : "ok"}">
           ${breached ? "🔔 ALERT" : "OK"} · ${m.label} now <strong>${m.fmt(last)}</strong>
           (threshold ${m.fmt(m.threshold)})
         </div>
         <div class="mo-drift">${m.drift}</div>`;
      tabs.forEach((t) => t.classList.toggle("active-mode", t.dataset.m === cur));
    }
    tabs.forEach((t) => t.addEventListener("click", () => { cur = t.dataset.m; draw(); }));
    draw();
    window.addEventListener("resize", draw);
  },
};
