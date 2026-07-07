/* ============================================================
   Section: Safe rollouts  (CONCEPT) — Block 8 section 5 (course section 42),
   closes the teaching arc before the capstone.
     - push a change to LIVE traffic without breaking everyone
     - canary / gradual rollout: 5% -> 25% -> 100%, watching metrics; a bad
       version caught at 5% only hurt 5%
     - prod A/B with SIGNIFICANCE (callback is-the-difference-real): don't
       promote on a handful of requests; wait for the difference to be real
       (CIs separate), not noise
     - feature flags: decouple deploy from release; flip on/off instantly
     - instant rollback: always one switch from the last-good version
     - theme: never flip 100% to an unproven change; ramp + measure + revert
   Concept section: no inline problems; ends "What you learned".

   Star interactive: rollout simulator — accumulate live traffic to a canary
   vs the current version; REAL observed rates + 95% CIs that tighten with n;
   verdict promote / rollback / keep-gathering from CI overlap. Scenario
   toggle (new better / new worse).

   NOTE (playbook): no literal dollar signs; no backtick chars in prose; no
   star-slash inside comments; no raw less-than in html; instructor notes
   hidden.
   ============================================================ */

window.SectionContent["safe-rollouts"] = {
  title: "Safe rollouts",

  html: `
    <div class="eyebrow">Deployment · Section 44</div>
    <h1>Safe rollouts</h1>

    <p>Your change passed the CI gate — offline, it's an improvement. But offline is a snapshot, and
    the only true test is live traffic. So the last question of the course is: how do you push a change
    to real users without betting the whole system on it? The answer is a discipline, and it rhymes
    with everything you've learned: <strong>never flip everyone to an unproven change — ramp it up
    gradually, measure as you go, and stay one switch away from undoing it.</strong></p>

    <h2>Canary: let a little traffic go first</h2>

    <p>A <strong>canary rollout</strong> sends the new version to a small slice of traffic — say 5% —
    while everyone else stays on the old one. You watch the new slice's metrics (the monitoring you
    just built), and only if it's healthy do you ramp: 5% → 25% → 50% → 100%. The payoff is
    containment: if the new version is bad, <strong>only 5% of users ever saw it</strong>, and you
    caught it before it reached the other 95%. A bad deploy becomes a small, reversible incident
    instead of an outage.</p>

    <h2>The statistics come back one last time</h2>

    <p>Here's the trap, and it's <em>is-the-difference-real</em> from Block 3, now on live traffic. Your
    canary's success rate looks a touch better than the old version after an hour — do you promote it?
    <strong>Not yet.</strong> A small slice of traffic is a small sample, and a small sample has a wide
    confidence interval. If the two versions' intervals still overlap, the apparent difference is
    noise, and promoting on it is exactly the mistake you learned to avoid. You wait until the
    difference is <strong>real</strong> — until the intervals separate — before you call a winner.
    Gather traffic and watch the intervals tighten:</p>

    ${Toolkit.widget(
      "Canary rollout simulator",
      `<div class="controls">
         <button class="btn ghost ro-tab active-mode" data-s="better">New version is better</button>
         <button class="btn ghost ro-tab" data-s="worse">New version is worse</button>
       </div>
       <div class="ro-arms" id="ro-arms"></div>
       <div class="ro-verdict" id="ro-verdict"></div>
       <div class="controls">
         <button class="btn" id="ro-gather">Send more live traffic</button>
         <button class="btn ghost" id="ro-reset">Reset</button>
       </div>
       <div class="nd-cap">Real proportions and 95% intervals over the traffic you've sent. Early on the
         canary's interval is wide and overlaps the current version — inconclusive. Only once the
         intervals separate is the difference real enough to act on.</div>`
    )}

    <h2>Feature flags and instant rollback</h2>

    <p>Two more tools make this safe in practice. A <strong>feature flag</strong> decouples deploying
    code from releasing it: the new version ships behind a switch you can flip on (or off) instantly,
    for 5% or 100% of users, without another deploy. And <strong>rollback</strong> is the promise you
    make to yourself before every release — that you are always <em>one flip</em> from the last
    known-good version. Combined with prompt versioning from earlier this block, rolling back a bad
    prompt is changing one line and flipping one switch, not a fire drill.</p>

    <h2>The whole shape, one last time</h2>

    <p>Step back and look at what a change now goes through: you version it, an automated eval gate
    blocks it if it regresses, you roll it out to a canary, you watch it on live metrics, you promote
    only once the difference is statistically real, and you can undo it in one switch if you're wrong.
    That is what it means to ship reliably on top of a non-deterministic model — not never being wrong,
    but making being wrong <strong>small, visible, and reversible.</strong> That instinct, more than any
    single API, is the job.</p>

    ${Toolkit.instructorNote(
      `This section closes the teaching arc, so land the through-line: reliability isn't the absence of
       mistakes, it's making mistakes small, visible, and reversible — canary (small), monitoring
       (visible), rollback (reversible). The statistics callback is the satisfying one: is-the-
       difference-real, first met as an abstract worry about eval noise, is now the concrete rule that
       stops you promoting a canary on a lucky hour. Drive it home: a canary that looks 2 points better
       on 200 requests has a CI so wide it tells you nothing — wait for separation. Good closing
       discussion: walk the class through the full lifecycle of a one-line prompt change (version it →
       CI eval gate → canary at 5% → watch metrics → promote when significant → or one-line rollback)
       and note that every stage is something they built this term. The capstone is where they do the
       whole thing themselves.`
    )}

    <h2>What you learned</h2>
    <ul>
      <li><strong>Canary rollouts</strong> send a change to a small traffic slice first, so a bad
        version is contained to that slice and caught before it reaches everyone.</li>
      <li>Deciding to promote is <strong>is-the-difference-real</strong> on live traffic: wait until
        the version's confidence intervals <strong>separate</strong>, don't act on noise.</li>
      <li><strong>Feature flags</strong> decouple deploy from release, and <strong>instant rollback</strong>
        (with prompt versioning) keeps you one switch from known-good.</li>
      <li>Reliable deployment makes being wrong <strong>small, visible, and reversible</strong> — the
        core instinct of engineering on a non-deterministic model.</li>
    </ul>
  `,

  onMount(root) {
    /* ---- Canary rollout simulator: REAL proportions + CIs ---- */
    const TRUE_CUR = 0.88;
    const SCEN = { better: 0.94, worse: 0.80 };
    let scenario = "better";
    let nCur = 0, sCur = 0, nNew = 0, sNew = 0;
    const armsEl = root.querySelector("#ro-arms");
    const verdictEl = root.querySelector("#ro-verdict");
    const gatherBtn = root.querySelector("#ro-gather");
    const resetBtn = root.querySelector("#ro-reset");
    const tabs = Array.prototype.slice.call(root.querySelectorAll(".ro-tab"));
    if (!armsEl) return;

    function draws(n, p) { let s = 0; for (let i = 0; i < n; i++) if (Math.random() < p) s++; return s; }
    function ci(s, n) {
      if (!n) return { p: 0, lo: 0, hi: 1 };
      const p = s / n, se = Math.sqrt(p * (1 - p) / n), h = 1.96 * se;
      return { p: p, lo: Math.max(0, p - h), hi: Math.min(1, p + h) };
    }
    function gather() {
      // a batch of live traffic: current keeps the bulk, canary a ~25% slice
      nCur += 60; sCur += draws(60, TRUE_CUR);
      nNew += 20; sNew += draws(20, SCEN[scenario]);
      render();
    }
    function reset() { nCur = sCur = nNew = sNew = 0; render(); }

    function render() {
      const c = ci(sCur, nCur), nw = ci(sNew, nNew);
      function arm(name, x, n, cls) {
        const pct = (v) => (v * 100).toFixed(0) + "%";
        return `<div class="ro-arm ${cls}">
           <div class="ro-arm-name">${name}</div>
           <div class="ro-arm-p">${n ? pct(x.p) : "—"}</div>
           <div class="ro-arm-ci">${n ? "95% CI " + pct(x.lo) + "–" + pct(x.hi) : "no traffic yet"}</div>
           <div class="ro-arm-n">${n} requests</div>
         </div>`;
      }
      armsEl.innerHTML = arm("current (live)", c, nCur, "cur") + arm("canary (new)", nw, nNew, "new");

      let cls, msg;
      if (nNew < 40) { cls = "wait"; msg = "Not enough canary traffic yet — the interval is too wide to tell the versions apart. Keep gathering before you decide."; }
      else if (nw.lo > c.hi) { cls = "promote"; msg = "The intervals have separated and the canary is clearly better — the difference is real. Ramp it up: 25% → 50% → 100%."; }
      else if (nw.hi < c.lo) { cls = "rollback"; msg = "The intervals separated and the canary is clearly worse — ROLL BACK. Because it was only a small slice, few users were ever affected."; }
      else { cls = "wait"; msg = "The intervals still overlap — the apparent gap could be noise. This is is-the-difference-real: do NOT promote yet. Gather more traffic."; }
      verdictEl.className = "ro-verdict " + cls;
      verdictEl.innerHTML = "<strong>" + ({ wait: "Inconclusive", promote: "Promote", rollback: "Roll back" }[cls]) + "</strong> — " + msg;
      tabs.forEach((t) => t.classList.toggle("active-mode", t.dataset.s === scenario));
    }
    tabs.forEach((t) => t.addEventListener("click", () => { scenario = t.dataset.s; reset(); }));
    gatherBtn.addEventListener("click", gather);
    resetBtn.addEventListener("click", reset);
    render();
  },
};
