/* ============================================================
   Section: Is the difference real?  (CONCEPT, math/stats) — stats
   capstone of Block 3 "Evaluation" (course section 14).
   Treat every eval number as a MEASUREMENT WITH ERROR, and decide
   when a change is signal vs. noise.
     - two noise sources: model non-determinism + the dataset is a
       sample -> accuracy is a random variable
     - confidence interval on a proportion: SE = sqrt(p(1-p)/n),
       95% CI = p +/- 1.96 SE; the interval on 50 examples is HUGE
     - the general tool: BOOTSTRAP (resample examples, recompute the
       metric, take the middle 95%) — works for any metric
     - comparing two systems: PAIRED design (same examples) + CI on the
       difference (paired bootstrap); real iff it excludes 0
     - power: SE ~ 1/sqrt(n) -> small gains need big evals
     - reporting discipline: number +/- CI, never a bare point; and the
       multiple-comparisons trap -> keep a held-out test set
   Concept section: no inline problems; ends "What you learned".

   Star interactive: an "is the difference real?" simulator — set the
   TRUE gap and dataset size n, draw a size-n eval, and watch the two
   95% CIs (real math) overlap or separate, with a verdict; resampling
   shows the run-to-run wobble (a true gap is invisible at small n).

   Facts: pure statistics + numpy; no external API facts to verify.

   NOTE (playbook): KaTeX double-backslashed (\\sqrt,\\frac,\\hat,\\pm,
   \\approx,\\times,\\,); keep "%" OUT of math (it starts a KaTeX
   comment) — percentages live in prose. No literal dollar signs. No
   backtick chars in prose. Multi-line Python via triple-quoted strings.
   Instructor notes hidden via Toolkit.instructorNote.
   ============================================================ */

window.SectionContent["is-the-difference-real"] = {
  title: "Is the difference real?",

  html: `
    <div class="eyebrow">Evaluation · Section 18</div>
    <h1>Is the difference real?</h1>

    <p>You run your eval on the baseline and get 70%. You rewrite the prompt, run it
    again, and get 74%. Time to celebrate? Maybe — or maybe you just got lucky on a
    handful of examples and the &ldquo;improvement&rdquo; will evaporate the next time
    you look. This is the question that separates someone who runs evals from someone
    who can be <em>trusted</em> by them: <strong>when is a difference real, and when
    is it noise?</strong> Answering it is a statistics problem, and a beautiful one.</p>

    <h2>Every eval score is an estimate</h2>

    <p>An accuracy of 74% is not a fact about your system; it's a <strong>measurement</strong>,
    and measurements have error. Two separate sources of randomness feed into it:</p>
    <ul>
      <li><strong>The model wobbles.</strong> You already know a call is a sample —
        run the same example twice and the label can change. So the score has noise
        baked in from the model itself.</li>
      <li><strong>Your dataset is a sample.</strong> Those 50 examples are a tiny draw
        from the vast space of inputs your system will actually see. A different 50
        would give a different number.</li>
    </ul>

    <p>Put together: the accuracy you measured is a <strong>random variable</strong>.
    Report it as a bare point (&ldquo;74%&rdquo;) and you're hiding that. The honest
    unit of an eval result is a number <em>with an interval around it.</em></p>

    <h2>How uncertain is one number?</h2>

    <p>Accuracy is a <strong>proportion</strong> — the fraction of <em>n</em> examples
    the system got right — and the uncertainty of a proportion has a clean form. If the
    observed accuracy is <span class="nowrap">$\\hat{p}$</span> on <em>n</em> examples,
    its <strong>standard error</strong> (the typical size of the wobble) is:</p>

    <p class="mathline">$$\\text{SE} = \\sqrt{\\frac{\\hat{p}\\,(1-\\hat{p})}{n}}$$</p>

    <p>and an approximate 95% confidence interval is
    <span class="nowrap">$\\hat{p} \\pm 1.96\\,\\text{SE}$</span>. Now plug in the
    numbers that should scare you a little. At 74% on 50 examples:</p>

    ${Toolkit.callout(
      `SE = sqrt(0.74 &times; 0.26 / 50) &approx; 0.062, so the 95% interval is roughly
       <strong>74% plus or minus 12 points</strong> — about <strong>62% to 86%</strong>.
       Your crisp-looking &ldquo;74%&rdquo; is really &ldquo;somewhere in a 24-point
       band.&rdquo; A 4-point jump from a 50-example eval is comfortably inside the
       noise. This is the single most common way beginners fool themselves.`,
      { type: "warn", label: "The interval is wider than you think" }
    )}

    <p>(That plus-or-minus formula, the Wald interval, is rough for small <em>n</em> or
    for accuracies near 0 or 100%. The Wilson interval and the bootstrap below behave
    better; reach for them when you're near the edges.)</p>

    <h2>The tool that always works: the bootstrap</h2>

    <p>Formulas exist for proportions, but you'll compute F1, or a win rate, or Cohen's
    kappa, and you won't remember the standard error for each. The <strong>bootstrap</strong>
    sidesteps all of it with one idea: your dataset is a stand-in for the real world, so
    <strong>resample it, with replacement, many times</strong>, recompute the metric on
    each resample, and the spread of those numbers is your uncertainty. It works for
    <em>any</em> metric, with no formula to look up:</p>

    ${Toolkit.code("bootstrap.py", `import numpy as np

def bootstrap_ci(correct, n_boot=10000, level=0.95):
    """correct: a 0/1 array of per-example results. Returns (low, high)."""
    correct = np.asarray(correct)
    n = len(correct)
    means = [np.random.choice(correct, size=n, replace=True).mean()
             for _ in range(n_boot)]
    lo = np.percentile(means, 100 * (1 - level) / 2)
    hi = np.percentile(means, 100 * (1 + level) / 2)
    return lo, hi`)}

    <p>Resampling <em>with replacement</em> is the whole trick: it simulates &ldquo;what
    if I'd drawn a slightly different dataset of the same size?&rdquo; ten thousand
    times, and lets the data show you how much the metric would have bounced around.</p>

    <h2>Comparing two systems — the right way</h2>

    <p>Now the real question: is v2 better than v1? Two rules make the comparison honest.</p>

    <p>First, <strong>use the same examples for both systems</strong> — a
    <strong>paired</strong> design. If v2 happened to be tested on easier examples, of
    course it looks better; running both on the identical set cancels that out and, as a
    bonus, makes the comparison far more sensitive to a genuine difference. Second,
    don't eyeball the two numbers — <strong>put a confidence interval on the
    difference</strong> and see whether it clears zero. A paired bootstrap does exactly
    this, resampling the example <em>pairs</em> together:</p>

    ${Toolkit.code("compare.py", `def paired_diff_ci(v1_correct, v2_correct, n_boot=10000, level=0.95):
    v1 = np.asarray(v1_correct)
    v2 = np.asarray(v2_correct)          # both scored on the SAME examples
    n = len(v1)
    diffs = []
    for _ in range(n_boot):
        idx = np.random.randint(0, n, size=n)   # resample example indices...
        diffs.append(v2[idx].mean() - v1[idx].mean())   # ...apply to BOTH (paired)
    lo = np.percentile(diffs, 100 * (1 - level) / 2)
    hi = np.percentile(diffs, 100 * (1 + level) / 2)
    return lo, hi   # if this interval excludes 0, the improvement is real`)}

    <p>If that interval is <code>[+1%, +9%]</code>, you can claim the win. If it's
    <code>[-2%, +10%]</code>, you cannot — zero is still on the table, so &ldquo;v2 is
    better&rdquo; is not yet supported, however much you want it to be. (The classical
    named test for paired yes/no outcomes is <strong>McNemar's test</strong>; the paired
    bootstrap gets you the same conclusion with less to memorize.)</p>

    <h2>Why small gains need big evals</h2>

    <p>Look back at the standard error: it shrinks like
    <span class="nowrap">$1/\\sqrt{n}$</span>. That has a hard consequence — to
    <strong>halve</strong> your uncertainty you must <strong>quadruple</strong> the
    dataset. Detecting a big, obvious improvement takes few examples; detecting a
    genuine-but-small two-point gain can take <em>many hundreds or thousands</em>. There
    is no way around it: if you want to resolve small differences, you have to pay for
    them in data. Set the true gap and the dataset size below and watch a real
    improvement fade in and out of view:</p>

    ${Toolkit.widget(
      "Is the difference real? — a simulator",
      `<label class="grow-slider">True hidden gap (v2 minus v1, with v1 = 70%):
         <strong>+<span id="ir-gap">5</span> points</strong>
         <input type="range" id="ir-gap-i" min="0" max="20" step="1" value="5" />
       </label>
       <label class="grow-slider">Eval size <em>n</em> (examples):
         <strong><span id="ir-n">50</span></strong>
         <input type="range" id="ir-n-i" min="10" max="500" step="10" value="50" />
       </label>
       <div class="ci-scale"><span>0%</span><span>25%</span><span>50%</span><span>75%</span><span>100%</span></div>
       <div class="ci-row"><div class="ci-name">v1</div><div class="ci-track" id="ir-t1"></div><div class="ci-val" id="ir-val1"></div></div>
       <div class="ci-row"><div class="ci-name">v2</div><div class="ci-track" id="ir-t2"></div><div class="ci-val" id="ir-val2"></div></div>
       <div class="ci-diff" id="ir-diff"></div>
       <div class="cm-caption" id="ir-cap"></div>
       <div class="controls"><button class="btn" id="ir-resample">Resample (same settings)</button></div>
       <div class="nd-cap">We set each version's TRUE skill (something you never know in
         real life), then draw one size-<em>n</em> eval. The bars are 95% confidence
         intervals, computed for real; resample to see the run-to-run wobble.</div>`
    )}

    <h2>The reporting discipline</h2>
    <ul>
      <li><strong>Never report a bare number.</strong> An eval result is
        <em>accuracy plus a confidence interval</em>; a comparison is
        <em>the difference plus a confidence interval on the difference.</em></li>
      <li><strong>To shrink the interval:</strong> more examples (the big lever),
        average multiple model runs per example (this specifically tames the
        <em>model's</em> wobble), and always pair.</li>
      <li><strong>Beware the multiple-comparisons trap.</strong> If you try twenty
        prompt variants and keep whichever scored highest, that winning number is
        <em>optimistic</em> — you've partly fit the noise in your eval set. Guard against
        it the way you would in any modeling: hold out a final <strong>test set</strong>
        you look at only once, at the end.</li>
    </ul>

    ${Toolkit.instructorNote(
      `Do the 50-example interval on the board — it genuinely changes behavior. Most
       students (and plenty of practitioners) treat a 3-4 point eval bump as a win;
       showing that a 50-item eval carries a plus-or-minus of ~12 points makes the
       point permanently. If you want a live jaw-drop, run the simulator with the true
       gap at +3 and n at 30 and resample a few times — v2 will sometimes measure
       *worse* than v1 despite genuinely being better. That image does more than any
       lecture on standard error.`
    )}

    ${Toolkit.instructorNote(
      `The multiple-comparisons point is where your students' instincts from statistics
       transfer directly: iterating prompts against a fixed eval is exactly train/test
       leakage wearing new clothes, and a held-out test set is the same discipline they
       know from modeling. Worth naming that connection explicitly — it reassures the
       math-literate students that this isn't a new bag of tricks, just their existing
       statistics applied to a new kind of system. The bootstrap is also a nice moment
       to note that resampling *approximates the sampling distribution* you can't
       observe directly — the same logic underneath a lot of modern inference.`
    )}

    <h2>What you learned</h2>
    <ul>
      <li>An eval score is a <strong>measurement with error</strong>, noisy from both
        the model's sampling and the finiteness of your dataset — so report it with a
        <strong>confidence interval</strong>, not as a bare number.</li>
      <li>For a proportion, SE = <span class="nowrap">$\\sqrt{\\hat{p}(1-\\hat{p})/n}$</span>
        and the 95% interval is <span class="nowrap">$\\hat{p} \\pm 1.96\\,\\text{SE}$</span>;
        the <strong>bootstrap</strong> gives an interval for <em>any</em> metric by
        resampling.</li>
      <li>To compare two systems, use a <strong>paired</strong> design and put a
        <strong>confidence interval on the difference</strong> — the improvement is real
        only if that interval <strong>excludes zero</strong>.</li>
      <li>Because SE shrinks like <span class="nowrap">$1/\\sqrt{n}$</span>, small gains
        need large evals — and if you tune against one eval many times, keep a
        <strong>held-out test set</strong> so you don't fool yourself.</li>
    </ul>
  `,

  onMount(root) {
    /* ---- "Is the difference real?" simulator --------------------------
       v1 true = 0.70 (fixed); v2 true = 0.70 + gap. Draw n Bernoulli
       results for each, compute Wald 95% CIs and the difference CI — real
       arithmetic. Independent (unpaired) draw for simplicity; the paired
       point is made in prose. Math.random is fine in a browser onMount. */
    const P1 = 0.70;
    const Z = 1.96;

    const gapEl = root.querySelector("#ir-gap-i");
    const gapLab= root.querySelector("#ir-gap");
    const nEl   = root.querySelector("#ir-n-i");
    const nLab  = root.querySelector("#ir-n");
    const t1El  = root.querySelector("#ir-t1");
    const t2El  = root.querySelector("#ir-t2");
    const v1El  = root.querySelector("#ir-val1");
    const v2El  = root.querySelector("#ir-val2");
    const diffEl= root.querySelector("#ir-diff");
    const capEl = root.querySelector("#ir-cap");
    const resampleBtn = root.querySelector("#ir-resample");
    if (!gapEl) return;

    function draw(p, n) {
      let h = 0;
      for (let i = 0; i < n; i++) if (Math.random() < p) h += 1;
      return h;
    }
    function clamp01(x) { return Math.max(0, Math.min(1, x)); }
    function pct(x) { return (x * 100).toFixed(0) + "%"; }
    function pp(x) { return (x >= 0 ? "+" : "") + (x * 100).toFixed(1); }

    function paintTrack(el, lo, hi, p, cls) {
      const L = clamp01(lo) * 100, H = clamp01(hi) * 100, P = clamp01(p) * 100;
      el.innerHTML =
        `<div class="ci-whisker ${cls}" style="left:${L}%;width:${Math.max(0, H - L)}%"></div>
         <div class="ci-dot ${cls}" style="left:${P}%"></div>`;
    }

    function simulate() {
      const gap = parseInt(gapEl.value, 10) / 100;
      const n = parseInt(nEl.value, 10);
      gapLab.textContent = Math.round(gap * 100);
      nLab.textContent = n;
      const p2true = P1 + gap;

      const h1 = draw(P1, n), h2 = draw(p2true, n);
      const p1 = h1 / n, p2 = h2 / n;
      const se1 = Math.sqrt(p1 * (1 - p1) / n);
      const se2 = Math.sqrt(p2 * (1 - p2) / n);

      paintTrack(t1El, p1 - Z * se1, p1 + Z * se1, p1, "c1");
      paintTrack(t2El, p2 - Z * se2, p2 + Z * se2, p2, "c2");
      v1El.textContent = pct(p1);
      v2El.textContent = pct(p2);

      const diff = p2 - p1;
      const seD = Math.sqrt(se1 * se1 + se2 * se2);
      const dlo = diff - Z * seD, dhi = diff + Z * seD;

      let cls, verdict;
      if (dlo > 0) { cls = "real"; verdict = "v2 is significantly better"; }
      else if (dhi < 0) { cls = "worse"; verdict = "v2 measured worse"; }
      else { cls = "inconc"; verdict = "can't tell — the interval includes 0"; }

      diffEl.className = "ci-diff " + cls;
      diffEl.innerHTML =
        `measured gap <strong>${pp(diff)} pts</strong> · 95% CI [${pp(dlo)}, ${pp(dhi)}] · ` +
        `<strong>${verdict}</strong>`;

      let msg;
      if (gap === 0) {
        msg = "Here the two versions are truly identical. Any gap you see is pure noise — " +
          "and notice it is often not zero. This is your null case: if your 'improvement' " +
          "looks like this, you have nothing.";
      } else if (cls === "inconc") {
        msg = "There really is a +" + Math.round(gap * 100) + " point improvement built in, but at n = " +
          n + " the eval can't resolve it: the confidence interval on the difference still " +
          "straddles zero. Bigger eval, or a bigger true gap, to see it.";
      } else if (cls === "worse") {
        msg = "A genuine +" + Math.round(gap * 100) + " point improvement exists — yet this draw measured v2 " +
          "as worse. That is sampling noise at n = " + n + ", and it is exactly why a single " +
          "small eval can point you the wrong way.";
      } else {
        msg = "The interval on the difference clears zero, so at n = " + n + " this eval can " +
          "actually support the claim that v2 is better. Resample a few times to confirm it holds up.";
      }
      capEl.textContent = msg;
    }

    gapEl.addEventListener("input", simulate);
    nEl.addEventListener("input", simulate);
    resampleBtn.addEventListener("click", simulate);
    simulate();
  },
};
