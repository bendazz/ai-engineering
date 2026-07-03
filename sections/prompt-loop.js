/* ============================================================
   Section: The prompt-improvement loop  (LAB) — Block 4 section 4
   (course section 19). The professional workflow — prompting as a
   controlled experiment:
     baseline (eval + CI) -> read failures -> ONE hypothesis ->
     change ONE thing -> re-run the SAME eval -> CI on the difference
     -> keep if it clears 0, else revert -> repeat.
     - one change at a time (attribution; callback controlled experiment)
     - prompts are CODE: version them in files, templated, committed
       (git callback), with a changelog (foreshadows deploy versioning)
     - overfitting the loop: iterate too much against one eval and you
       fit its noise -> held-out test set (callback is-the-difference-real)
   LAB: predict-then-reveal; ends "What you accomplished".

   Star interactive: prompt-iteration tracker — click candidate changes,
   each "runs the eval" (real CI-gating on simulated-but-honest deltas),
   verdict keep/revert/inconclusive, building a version history + best.

   Facts: builds on the eval harness + paired CI (verified). No new API.

   NOTE (playbook): no literal dollar signs; no backtick chars in prose;
   templates in triple-quoted code strings (no literal \\n pitfalls);
   instructor notes hidden via Toolkit.instructorNote.
   ============================================================ */

window.SectionContent["prompt-loop"] = {
  title: "The prompt-improvement loop",

  html: `
    <div class="eyebrow">Prompt Engineering · Section 19 · Lab</div>
    <h1>The prompt-improvement loop</h1>

    <p>You have the ingredients, few-shot, and reasoning. This section is the workflow
    that turns them from a grab-bag into engineering. It's short to state and it's the
    professional core of the whole block: <strong>a prompt change is a controlled
    experiment, and the eval is the experiment.</strong></p>

    <h2>The loop</h2>
    <ol>
      <li><strong>Baseline.</strong> Run your eval on the current prompt. Record the
        number <em>and its confidence interval.</em></li>
      <li><strong>Read the failures.</strong> Not the score — the misses. They're your
        hypotheses.</li>
      <li><strong>Change one thing.</strong> Pick a single change aimed at a failure
        pattern (an escape hatch, a format line, two few-shot examples).</li>
      <li><strong>Re-run the same eval.</strong> Identical dataset, so it's paired.</li>
      <li><strong>Put a CI on the difference.</strong> Keep the change only if the
        interval on the improvement <strong>clears zero</strong>; otherwise revert.</li>
      <li><strong>Repeat</strong> from the new baseline.</li>
    </ol>

    <p>That's it. Everything fancy in prompt engineering is this loop, run patiently.
    Try a few rounds — click candidate changes and watch which survive the eval:</p>

    ${Toolkit.widget(
      "Prompt-iteration tracker",
      `<div class="it-cands" id="it-cands"></div>
       <div class="it-current" id="it-current"></div>
       <div class="it-log" id="it-log"></div>
       <div class="controls"><button class="btn ghost" id="it-reset">Reset to baseline</button></div>
       <div class="nd-cap">Each click runs a size-400 eval and applies the real rule:
         keep the change only if the 95% CI on the difference clears zero. The per-change
         effects are illustrative; the noise, the interval, and the keep/revert decision
         behave exactly like the real thing — including that small real gains sometimes
         read as inconclusive.</div>`
    )}

    <h2>One change at a time — and why</h2>

    <p>The discipline that makes the loop <em>work</em> is changing exactly one thing per
    round. Bundle three edits together, watch the score rise, and you've learned nothing
    you can use: you don't know which edit helped, whether one of them secretly hurt, or
    whether the whole move was noise. It's the same reason a controlled experiment varies
    one factor — attribution. Slow is fast here, because every kept change is a change you
    <em>understand.</em></p>

    <h2>Prompts are code — so version them</h2>

    <p>The moment you're iterating seriously, a prompt buried in a string literal becomes
    a liability. Pull it into a file, template the variable parts, and commit each version
    with a note on what you changed and what it did to the eval:</p>

    ${Toolkit.code("prompts/sentiment.py", `SENTIMENT_PROMPT = """You are a precise sentiment classifier.
Classify the review as positive, negative, or neutral.
If you genuinely cannot tell, use neutral.

Review:
{review}"""

def build(review):
    return SENTIMENT_PROMPT.format(review=review)`)}

    <p>Now git is doing real work for you: every prompt version is a commit you can
    <code>diff</code>, revert, or bisect, and your commit messages become a changelog of
    &ldquo;v3: added an escape hatch, eval 74% → 78%.&rdquo; This is exactly the habit
    that pays off when a prompt change has to ship safely later.</p>

    ${Toolkit.problem(
      `You rewrote the prompt — added an escape hatch, two examples, and a reasoning
       field, all at once — re-ran the eval, and it climbed from 71% to 77%. Your
       teammate asks which change did it. What do you say, and what should you have done?`,
      `<p><strong>You can't say — and that's the problem.</strong> With three changes in
       one round, the +6 points could be all from the escape hatch, or the examples might
       have helped +9 while the reasoning field quietly cost you −3, or part of it is just
       noise. You've improved the number without <em>learning</em> anything, and you can't
       safely trust or transfer any single piece. The fix is the loop's core rule:
       <strong>one change per round</strong>, re-run, CI on the difference, keep or revert
       — then start the next change from there. Slower, but every kept edit is one you
       understand and can defend.</p>`,
      { label: "Predict: which change helped?" }
    )}

    <h2>Don't overfit your own eval</h2>

    <p>There's a trap waiting at the end of a long loop. If you try twenty or thirty prompt
    variants and keep whatever nudges the eval up, some of those &ldquo;wins&rdquo; are you
    fitting the <strong>noise</strong> in that particular dataset — the multiple-comparisons
    problem from the stats section, in daily practice. Your eval number drifts optimistic.
    The guard is the same as in any modeling: hold out a <strong>test set</strong> you don't
    iterate against, and check it only at the end to see how much of your gain was real.</p>

    ${Toolkit.problem(
      `After 25 rounds of tweaking, your eval has climbed from 70% to 95%. You're thrilled.
       Should you believe the 95%?`,
      `<p><strong>Be suspicious.</strong> Twenty-five rounds of keeping whatever helped on
       one fixed dataset is a lot of chances to fit its noise — the number is very likely
       <em>optimistic</em>. The honest check is a <strong>held-out test set</strong> you
       never tuned against: run the final prompt on it once. If it also scores near 95%,
       wonderful, the gains were real. If it scores 82%, then a chunk of your climb was you
       memorizing the quirks of the dev set, and 82% is the honest number to report.</p>`,
      { label: "Predict: is 95% real?" }
    )}

    ${Toolkit.instructorNote(
      `The two habits to drill are one-change-per-round and the held-out set — both are
       transfers of things the students already believe from statistics (controlled
       experiments; train/test split), which makes them easy to sell. A good live moment:
       run the tracker, deliberately keep a &ldquo;reword politely&rdquo; change that reads
       as inconclusive, and show that chasing a noisy bump just adds a step that a
       held-out check would later erase. The deeper point for their careers: a prompt they
       can <em>version and diff</em> is the difference between a demo and a maintainable
       system.`
    )}

    <h2>What you accomplished</h2>
    <ul>
      <li>You ran the <strong>prompt-improvement loop</strong>: baseline → read failures →
        change one thing → re-run the eval → CI on the difference → keep or revert.</li>
      <li>You saw why <strong>one change at a time</strong> is non-negotiable — it's the
        only way to attribute a gain (or catch a hidden regression).</li>
      <li>You treat <strong>prompts as code</strong>: in files, templated, and committed,
        so every version can be diffed and reverted.</li>
      <li>You know the endgame trap — <strong>overfitting your own eval</strong> — and the
        guard, a held-out test set checked once at the end.</li>
    </ul>
  `,

  onMount(root) {
    /* ---- Prompt-iteration tracker -------------------------------------
       Real CI-gating (paired-difference logic) on honest-but-illustrative
       per-change effects. Keep a change iff its 95% CI on the difference
       clears zero. n = 400 so small real effects are sometimes ambiguous —
       which is the honest lesson. */
    const N = 400, Z = 1.96;
    const CANDS = [
      { id: "format", label: "Add an explicit output format", eff: 0.06 },
      { id: "hatch", label: "Add an escape hatch (say 'neutral' if unsure)", eff: 0.05 },
      { id: "examples", label: "Add two few-shot examples", eff: 0.05 },
      { id: "polite", label: "Reword the prompt more politely", eff: 0.00 },
      { id: "reason", label: "Add a reasoning-first field", eff: 0.015 },
      { id: "more_ex", label: "Add six more examples", eff: 0.01 },
    ];
    const BASE = 0.70;
    let current = BASE;
    let log = [];

    const candsEl = root.querySelector("#it-cands");
    const curEl = root.querySelector("#it-current");
    const logEl = root.querySelector("#it-log");
    const resetBtn = root.querySelector("#it-reset");
    if (!candsEl) return;

    // approx standard normal via sum of uniforms
    function gauss() { let s = 0; for (let i = 0; i < 12; i++) s += Math.random(); return s - 6; }

    function renderCands() {
      candsEl.innerHTML = CANDS.map((c) =>
        `<button class="btn ghost it-cand" data-id="${c.id}">${c.label}</button>`
      ).join("");
      candsEl.querySelectorAll(".it-cand").forEach((b) => {
        b.addEventListener("click", () => tryChange(b.dataset.id));
      });
    }
    function renderCurrent() {
      curEl.innerHTML = "current prompt accuracy: <strong>" + Math.round(current * 100) +
        "%</strong>  ·  kept changes: " + log.filter((r) => r.kept).length;
    }
    function renderLog() {
      if (!log.length) { logEl.innerHTML = ""; return; }
      logEl.innerHTML = log.map((r, i) => {
        const cls = r.kept ? "keep" : (r.verdict === "worse" ? "worse" : "inconc");
        const sign = r.obs >= 0 ? "+" : "";
        return `<div class="it-row ${cls}">
            <span class="it-n">${i + 1}</span>
            <span class="it-lab">${r.label}</span>
            <span class="it-delta">${sign}${(r.obs * 100).toFixed(1)} pts · CI [${(r.lo * 100).toFixed(1)}, ${(r.hi * 100).toFixed(1)}]</span>
            <span class="it-verd">${r.kept ? "KEPT" : (r.verdict === "worse" ? "reverted (worse)" : "reverted (noise)")}</span>
          </div>`;
      }).join("");
    }

    function tryChange(id) {
      const c = CANDS.find((x) => x.id === id);
      // observed difference = true effect + sampling noise
      const p = current;
      const sd = Math.sqrt(2 * p * (1 - p) / N);
      const obs = c.eff + gauss() * sd;
      const lo = obs - Z * sd, hi = obs + Z * sd;
      let kept = false, verdict = "inconc";
      if (lo > 0) { kept = true; verdict = "keep"; current = Math.min(0.99, current + obs); }
      else if (hi < 0) { verdict = "worse"; }
      log.push({ label: c.label, obs: obs, lo: lo, hi: hi, kept: kept, verdict: verdict });
      renderCurrent(); renderLog();
    }

    resetBtn.addEventListener("click", () => { current = BASE; log = []; renderCurrent(); renderLog(); });
    renderCands(); renderCurrent(); renderLog();
  },
};
