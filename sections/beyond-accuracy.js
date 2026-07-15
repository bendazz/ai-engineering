/* ============================================================
   Section: Beyond accuracy — precision & recall  (CONCEPT, math)
   Block 3 "Evaluation", section 2 (course section 12).
   Accuracy is the first metric and often the wrong one.
     - the imbalance trap: "always predict the majority" scores high
       accuracy and catches nothing
     - the confusion matrix (TP/FP/FN/TN) as the source of every metric
     - precision = TP/(TP+FP), recall = TP/(TP+FN); plain-English gloss
     - the precision/recall TRADEOFF (aggressiveness knob)
     - F1 = harmonic mean; but the RIGHT metric depends on error COSTS
     - extend the first-eval harness to report these on the class you
       care about
   Concept section: no inline problems; ends "What you learned".

   Star interactive: a decision-threshold explorer over a fixed,
   imbalanced (labeled illustrative) set of model "unsafe" scores — the
   slider thresholds them; the 2x2 confusion matrix + accuracy/precision/
   recall/F1 update with REAL arithmetic, and the caption surfaces the
   imbalance trap (high accuracy, ~0 recall at a strict threshold).

   Facts: pure statistics on eval outputs; no new external API facts.
   Example framing = a binary input guardrail (block vs allow); note
   multiclass (e.g. the sentiment classifier) computes these per class.

   NOTE (playbook): KaTeX commands double-backslashed (\\frac,\\text,
   \\cdot,\\qquad). No literal dollar signs. No backtick chars in prose.
   Instructor notes hidden via Toolkit.instructorNote.
   ============================================================ */

window.SectionContent["beyond-accuracy"] = {
  title: "Beyond accuracy: precision & recall",

  html: `
    <div class="eyebrow">Evaluation · Section 15</div>
    <h1>Beyond accuracy: precision &amp; recall</h1>

    <p>Accuracy was a fine first metric — one honest number for the whole system.
    But it has a blind spot that can quietly wreck an evaluation, and any AI engineer
    who ships classifiers needs to see it coming. Two situations break accuracy:
    when the classes are <strong>imbalanced</strong>, and when the two kinds of
    mistake cost very different amounts. Both are the rule, not the exception, in
    real systems.</p>

    <p>To make it concrete, switch tasks to one you'll actually meet: a small
    <strong>input guardrail</strong> that reads each incoming user message and
    decides <strong>block</strong> (unsafe) or <strong>allow</strong> (fine). Call
    <em>block</em> the &ldquo;positive&rdquo; class — the thing we're trying to
    catch.</p>

    <h2>When accuracy lies</h2>

    <p>Suppose that out of every 100 messages, about 5 are genuinely unsafe. Now
    consider the laziest possible classifier: one that <strong>allows
    everything.</strong> It never blocks a thing. What's its accuracy?</p>

    ${Toolkit.callout(
      `It's right on all 95 safe messages and wrong on all 5 unsafe ones:
       <strong>95% accuracy</strong> — while catching <strong>zero</strong> unsafe
       messages. A number that looks like an A-minus belongs to a guardrail that
       does literally nothing. That is the imbalance trap: when one class is rare,
       accuracy is dominated by the easy majority and can be high for all the wrong
       reasons.`,
      { type: "warn", label: "95% accurate, completely useless" }
    )}

    <p>Accuracy treats both kinds of error the same and lets the common class drown
    out the rare one. To see what's really happening, you have to split the errors
    apart — which is what the confusion matrix does.</p>

    <h2>The confusion matrix</h2>

    <p>Every prediction for a binary classifier falls into one of four boxes,
    depending on what was true and what the model said:</p>

    <div class="cm-legend">
      <div><span class="cm-swatch tp"></span><strong>True Positive (TP)</strong> — unsafe, and we blocked it. A catch.</div>
      <div><span class="cm-swatch fn"></span><strong>False Negative (FN)</strong> — unsafe, but we allowed it. A miss (the dangerous one).</div>
      <div><span class="cm-swatch fp"></span><strong>False Positive (FP)</strong> — safe, but we blocked it. A false alarm.</div>
      <div><span class="cm-swatch tn"></span><strong>True Negative (TN)</strong> — safe, and we allowed it. Correct.</div>
    </div>

    <p>Arrange those four counts in a grid — actual down the side, predicted across
    the top — and you have the <strong>confusion matrix</strong>. It's the raw
    material every classifier metric is built from, and it's worth always looking at,
    because it shows you the <em>shape</em> of the mistakes, not just how many.</p>

    <h2>Precision and recall</h2>

    <p>Two metrics read the matrix from two different directions, and the whole art
    is knowing which one you need.</p>

    <p class="mathline">$$\\text{precision} = \\frac{TP}{TP + FP} \\qquad\\qquad \\text{recall} = \\frac{TP}{TP + FN}$$</p>

    <ul>
      <li><strong>Precision</strong> asks: <em>when the model flags something, how
        often is it right?</em> It's judged only on the things you blocked. Low
        precision means lots of false alarms — you're blocking safe messages.</li>
      <li><strong>Recall</strong> asks: <em>of everything that was actually unsafe,
        how much did we catch?</em> It's judged on the things that were truly
        positive. Low recall means lots of misses — unsafe messages slipping
        through.</li>
    </ul>

    <p>The lazy &ldquo;allow everything&rdquo; classifier from before has
    <strong>zero recall</strong> (it caught none of the unsafe messages), and its
    precision is undefined (it never flagged anything). Either number instantly
    exposes what 95% accuracy hid.</p>

    <h2>The tradeoff you can't escape</h2>

    <p>Here's the tension. You can make the guardrail more <strong>aggressive</strong>
    — block on the slightest suspicion — and catch more of the unsafe messages
    (recall goes up), but you'll also block more innocent ones (precision goes down).
    Or make it more <strong>conservative</strong> — block only when it's sure — and
    your blocks will almost all be correct (precision up), but more unsafe messages
    slip past (recall down). Precision and recall pull against each other. Drag the
    decision threshold and watch both move — and watch the confusion matrix reshape:</p>

    ${Toolkit.widget(
      "Confusion matrix and the precision / recall tradeoff",
      `<label class="grow-slider">Block when the model's unsafe-score is at least
         <strong><span id="cm-tlabel">0.50</span></strong>
         <input type="range" id="cm-thresh" min="0.05" max="0.95" step="0.05" value="0.50" />
       </label>
       <div class="cm-grid">
         <div class="cm-corner"></div>
         <div class="cm-chead">predicted: block</div>
         <div class="cm-chead">predicted: allow</div>
         <div class="cm-rhead">actual: unsafe</div>
         <div class="cm-cell tp"><span class="cm-n" id="cm-tp">0</span><span class="cm-lab">TP</span></div>
         <div class="cm-cell fn"><span class="cm-n" id="cm-fn">0</span><span class="cm-lab">FN · missed</span></div>
         <div class="cm-rhead">actual: safe</div>
         <div class="cm-cell fp"><span class="cm-n" id="cm-fp">0</span><span class="cm-lab">FP · false alarm</span></div>
         <div class="cm-cell tn"><span class="cm-n" id="cm-tn">0</span><span class="cm-lab">TN</span></div>
       </div>
       <div class="metric-row" id="cm-metrics"></div>
       <div class="cm-caption" id="cm-caption"></div>
       <div class="nd-cap">30 messages, 6 truly unsafe (an imbalanced set). Each
         message's unsafe-score is hand-picked for illustration; the thresholding,
         the confusion matrix, and every metric are computed for real.</div>`
    )}

    <h2>F1, and choosing what to optimize</h2>

    <p>Often you want a single number that balances the two. The usual choice is the
    <strong>F1 score</strong>, the <em>harmonic</em> mean of precision and recall:</p>

    <p class="mathline">$$F_1 = \\frac{2 \\cdot \\text{precision} \\cdot \\text{recall}}{\\text{precision} + \\text{recall}}$$</p>

    <p>The harmonic mean is used on purpose: unlike a plain average, it stays low
    unless <em>both</em> numbers are decent, so you can't game F1 by maxing one and
    ignoring the other. But — and this is the real lesson — <strong>F1 is not
    automatically the right target either.</strong> The metric you optimize should
    follow the <strong>cost of each mistake</strong>:</p>
    <ul>
      <li>When a <strong>false positive</strong> is the expensive error, favor
        <strong>precision</strong>. A spam filter that dumps a real invoice into junk
        has done real harm; better to let some spam through than lose good mail.</li>
      <li>When a <strong>false negative</strong> is the expensive error, favor
        <strong>recall</strong>. A safety guardrail, a disease screen, a fraud
        flag — missing a true case is far worse than a false alarm, so you accept
        extra false positives to catch more.</li>
    </ul>

    ${Toolkit.instructorNote(
      `The single habit to instill: <em>never report accuracy alone on an imbalanced
       problem.</em> A quick, memorable in-class beat — ask the class for the
       accuracy of the &ldquo;always allow&rdquo; guardrail on a 5%-unsafe stream
       (95%), then ask its recall (0%). The gap does the teaching. Then push the
       harder question, which has no universal answer: &ldquo;which mistake is worse
       here?&rdquo; Make them argue it per scenario — that judgment, tying a metric
       to a real-world cost, is the actual skill. It also foreshadows why safety
       guardrails later are tuned for recall.`
    )}

    ${Toolkit.instructorNote(
      `For the math-minded: it's worth a minute on <em>why</em> the harmonic mean.
       Because precision and recall are both rates with the same numerator (TP) over
       different denominators, the harmonic mean is the natural average of rates, and
       geometrically it sits below the arithmetic mean, pulled toward the smaller
       value — which is exactly the &ldquo;both must be good&rdquo; property you
       want. A short derivation that 1/F1 = (1/2)(1/precision + 1/recall) makes the
       point cleanly.`
    )}

    <h2>Add it to your harness</h2>

    <p>This is a small extension of the eval you already built. Your runner produced
    a list of results with an <code>expected</code> and a <code>pred</code> label per
    example; precision and recall are just four counts away:</p>

    ${Toolkit.code("metrics.py", `POS = "block"                      # the class we care about catching

tp = sum(1 for r in results if r["pred"] == POS and r["expected"] == POS)
fp = sum(1 for r in results if r["pred"] == POS and r["expected"] != POS)
fn = sum(1 for r in results if r["pred"] != POS and r["expected"] == POS)

precision = tp / (tp + fp) if (tp + fp) else 0.0
recall    = tp / (tp + fn) if (tp + fn) else 0.0
f1 = 2 * precision * recall / (precision + recall) if (precision + recall) else 0.0

print(f"precision {precision:.2f}   recall {recall:.2f}   f1 {f1:.2f}")`)}

    <p>In practice you don't have to hand-roll these — <code>scikit-learn</code> will
    do it and more:</p>

    ${Toolkit.code("Python", `from sklearn.metrics import classification_report

y_true = [r["expected"] for r in results]
y_pred = [r["pred"] for r in results]
print(classification_report(y_true, y_pred))   # precision, recall, F1 per class`)}

    <p>For a multiclass task like the sentiment classifier, you compute precision and
    recall <strong>per class</strong> (positive vs. the rest, and so on) and then
    average them — which is exactly what <code>classification_report</code> prints.
    The binary case is just the version that's easiest to see.</p>

    <h2>What you learned</h2>
    <ul>
      <li><strong>Accuracy alone is misleading</strong> on imbalanced problems: a
        do-nothing classifier can post a high accuracy while catching none of the
        rare class.</li>
      <li>The <strong>confusion matrix</strong> (TP, FP, FN, TN) shows the
        <em>shape</em> of the errors and is the source of every classifier metric.</li>
      <li><strong>Precision</strong> = TP/(TP+FP) — of what you flagged, how much was
        right; <strong>recall</strong> = TP/(TP+FN) — of the real cases, how many you
        caught. They <strong>trade off</strong> as you tune aggressiveness.</li>
      <li><strong>F1</strong> (harmonic mean) balances them, but the metric you
        optimize should follow the <strong>cost of each mistake</strong> — precision
        when false alarms hurt, recall when misses hurt.</li>
    </ul>
  `,

  onMount(root) {
    /* ---- Decision-threshold / confusion-matrix explorer ----------------
       Fixed imbalanced set: 6 unsafe (label 1) + 24 safe (label 0), each
       with an illustrative model "unsafe-score". Predict block if score >=
       threshold. Confusion matrix + metrics are real arithmetic. */
    const DATA = [
      // unsafe (truly should be blocked) — note the two low-score "hard" ones
      { y: 1, s: 0.95 }, { y: 1, s: 0.88 }, { y: 1, s: 0.72 },
      { y: 1, s: 0.61 }, { y: 1, s: 0.44 }, { y: 1, s: 0.37 },
      // safe (should be allowed) — a few elevated scores cause false alarms
      { y: 0, s: 0.05 }, { y: 0, s: 0.08 }, { y: 0, s: 0.10 }, { y: 0, s: 0.13 },
      { y: 0, s: 0.16 }, { y: 0, s: 0.19 }, { y: 0, s: 0.22 }, { y: 0, s: 0.25 },
      { y: 0, s: 0.28 }, { y: 0, s: 0.31 }, { y: 0, s: 0.34 }, { y: 0, s: 0.37 },
      { y: 0, s: 0.41 }, { y: 0, s: 0.44 }, { y: 0, s: 0.48 }, { y: 0, s: 0.52 },
      { y: 0, s: 0.58 }, { y: 0, s: 0.66 }, { y: 0, s: 0.07 }, { y: 0, s: 0.12 },
      { y: 0, s: 0.18 }, { y: 0, s: 0.24 }, { y: 0, s: 0.30 }, { y: 0, s: 0.15 },
    ];

    const threshEl = root.querySelector("#cm-thresh");
    const tlabelEl = root.querySelector("#cm-tlabel");
    const tpEl = root.querySelector("#cm-tp");
    const fpEl = root.querySelector("#cm-fp");
    const fnEl = root.querySelector("#cm-fn");
    const tnEl = root.querySelector("#cm-tn");
    const metricsEl = root.querySelector("#cm-metrics");
    const capEl = root.querySelector("#cm-caption");
    if (!threshEl) return;

    function metricCard(name, val, defined) {
      const pct = defined ? Math.round(val * 100) : 0;
      const shown = defined ? pct + "%" : "—";
      return `<div class="metric-card">
          <div class="metric-name">${name}</div>
          <div class="metric-val">${shown}</div>
          <div class="metric-bar"><div class="metric-fill" style="width:${pct}%"></div></div>
        </div>`;
    }

    function render() {
      const t = parseFloat(threshEl.value);
      tlabelEl.textContent = t.toFixed(2);
      let tp = 0, fp = 0, fn = 0, tn = 0;
      DATA.forEach((d) => {
        const block = d.s >= t;
        if (d.y === 1 && block) tp += 1;
        else if (d.y === 1 && !block) fn += 1;
        else if (d.y === 0 && block) fp += 1;
        else tn += 1;
      });
      tpEl.textContent = tp; fpEl.textContent = fp;
      fnEl.textContent = fn; tnEl.textContent = tn;

      const n = DATA.length;
      const accuracy = (tp + tn) / n;
      const precDef = (tp + fp) > 0;
      const recDef = (tp + fn) > 0;
      const precision = precDef ? tp / (tp + fp) : 0;
      const recall = recDef ? tp / (tp + fn) : 0;
      const f1Def = precDef && recDef && (precision + recall) > 0;
      const f1 = f1Def ? 2 * precision * recall / (precision + recall) : 0;

      metricsEl.innerHTML =
        metricCard("accuracy", accuracy, true) +
        metricCard("precision", precision, precDef) +
        metricCard("recall", recall, recDef) +
        metricCard("F1", f1, f1Def);

      let msg;
      if (recall <= 0.01) {
        msg = "Almost nothing gets blocked. Accuracy looks high because the safe majority is easy — but recall is near zero: the guardrail is barely catching any unsafe messages. This is the imbalance trap.";
      } else if (precision < 0.5 && recall >= 0.99) {
        msg = "Nearly every unsafe message is caught (high recall), but so many safe messages are blocked that most blocks are false alarms (low precision). Very aggressive.";
      } else if (precision >= 0.8 && recall < 0.7) {
        msg = "Blocks are almost always correct (high precision), but several unsafe messages slip through (lower recall). Conservative — good when false alarms are costly, risky when misses are.";
      } else {
        msg = "A middle ground: catching most unsafe messages while keeping false alarms modest. Where you set the line should depend on which mistake costs more.";
      }
      capEl.textContent = msg;
    }

    threshEl.addEventListener("input", render);
    render();
  },
};
