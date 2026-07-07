/* ============================================================
   Section: LLM-as-judge  (CONCEPT, math/stats)
   Block 3 "Evaluation", section 3 (course section 13).
   Scales evals past exact-match to OPEN-ENDED outputs.
     - why == fails: summaries/answers/tone have no single gold string
     - humans are the real ground truth but don't scale
     - a MODEL as grader: rubric -> structured verdict {reasoning, score}
       (rubric as a DECISION PROCEDURE — 0/1/2 with concrete anchors;
       reasoning-before-score; pointwise vs pairwise; capable judge model)
     - but who judges the judge? known biases (position, verbosity,
       self-preference, leniency) -> you must VALIDATE the judge
     - measuring judge/human agreement: raw % double-counts CHANCE, so
       use Cohen's kappa = (p_o - p_e)/(1 - p_e); Landis-Koch bands
     - the workflow: hand-label a sample -> run judge -> compute kappa ->
       trust & scale if high enough, else fix the rubric and re-check
   Concept section: no inline problems; ends "What you learned".

   Star interactive: a Cohen's-kappa explorer — base-rate + judge-quality
   sliders drive a 2x2 human-vs-judge agreement matrix; observed agreement,
   chance agreement, and kappa are REAL arithmetic, surfacing the key
   lesson that high raw agreement under imbalance still gives low kappa.

   Facts: judge = ordinary messages.parse structured-output call (verified
   in [[verified-facts]]); kappa is standard statistics; sklearn has
   cohen_kappa_score. No new external API facts.

   NOTE (playbook): KaTeX double-backslashed (\\kappa,\\frac). No literal
   dollar signs. No backtick chars in prose. Multi-line Python via
   triple-quoted strings (never literal \\n in a code body). Instructor
   notes hidden via Toolkit.instructorNote.
   ============================================================ */

window.SectionContent["llm-as-judge"] = {
  title: "LLM-as-judge",

  html: `
    <div class="eyebrow">Evaluation · Section 15</div>
    <h1>LLM-as-judge</h1>

    <p>Your eval so far rests on <code>==</code>: the model returns a label, you
    compare it to the gold answer. That works beautifully for classification. But
    most of what you'll actually build produces <strong>open-ended</strong> output —
    a summary, an answer to a question, a rewritten email, a chatbot reply. There is
    no single correct string to compare against, so exact-match is useless. This
    section is how you evaluate those, at scale, without giving up on measuring.</p>

    <h2>Why equality isn't enough</h2>

    <p>Ask a model to summarize an article and two perfectly good summaries can share
    almost no words. &ldquo;Correct&rdquo; has been replaced by fuzzier questions:
    is it <em>faithful</em> to the source? Does it capture the <em>main point</em>?
    Is it the right <em>length</em> and <em>tone</em>? A human reading it can answer
    those in seconds — which is why <strong>human judgment is the real ground
    truth</strong> for open-ended tasks. The trouble is only that humans are slow,
    expensive, and don't scale to the thousands of outputs an eval loop wants to
    grade every time you change a prompt.</p>

    <h2>A model as the grader</h2>

    <p>The scalable move is to use a <strong>second model as the judge</strong>: give
    it the output (and whatever it needs to grade against — the source article, the
    question, a reference answer) plus a <strong>rubric</strong>, and have it return
    a score. The whole trick is that a vague rubric produces a vague, noisy judge, so
    you write the rubric as a <strong>decision procedure</strong> — explicit,
    independently checkable conditions, not &ldquo;rate it 1 to 10.&rdquo; A 0/1/2
    scale with concrete anchors is a good default:</p>

    ${Toolkit.code("Python", `from pydantic import BaseModel
from typing import Literal
import anthropic

client = anthropic.Anthropic()

class Judgment(BaseModel):
    reasoning: str                    # force the reasoning to come FIRST
    score: Literal[0, 1, 2]           # then a score from a fixed set

RUBRIC = """You grade a summary against its source article.
Score exactly 0, 1, or 2 by these rules:
  2 - captures the main point AND contains no factual errors.
  1 - captures the main point BUT has a minor omission or error.
  0 - misses the main point OR contains a clear factual error.
Explain your reasoning first, then give the score."""

def judge(article, summary):
    content = f"""ARTICLE:
{article}

SUMMARY:
{summary}"""
    resp = client.messages.parse(
        model="claude-sonnet-5",      # a capable judge; the system under test can be cheaper
        max_tokens=500,
        system=RUBRIC,
        messages=[{"role": "user", "content": content}],
        output_format=Judgment,
    )
    return resp.parsed_output`)}

    <p>Three design choices in there earn their keep:</p>
    <ul>
      <li><strong>Reasoning before the score.</strong> The <code>reasoning</code>
        field comes first in the schema, so the judge has to justify itself
        <em>before</em> committing to a number. That both improves the judgment and
        gives you an audit trail for every grade.</li>
      <li><strong>Anchored levels.</strong> Each score has a rule you could check
        yourself. Two people (or two runs) reading the same rubric should land on the
        same number — that's the whole point of a decision procedure.</li>
      <li><strong>A capable judge, a cheap contestant.</strong> Grading is often
        harder than the task, so it's normal to judge with a stronger model
        (Sonnet or Opus) even when the system under test runs on Haiku.</li>
    </ul>

    <p>A common and often more reliable variant is <strong>pairwise</strong> judging:
    instead of scoring one output in isolation, show the judge <em>two</em> (say, from
    your old prompt and your new one) and ask which is better. Relative calls tend to
    be steadier than absolute scores — the same reason it's easier to say which of two
    coffees you prefer than to rate one on a ten-point scale.</p>

    <h2>But who judges the judge?</h2>

    <p>Here's the catch you cannot skip. The judge is itself a non-deterministic model,
    and it has real, documented biases:</p>
    <ul>
      <li><strong>Position bias</strong> — in pairwise mode, a tendency to favor
        whichever answer came first.</li>
      <li><strong>Verbosity bias</strong> — a pull toward the longer, more elaborate
        answer even when it isn't better.</li>
      <li><strong>Self-preference</strong> — favoring outputs written in its own
        style or by its own model family.</li>
      <li><strong>Leniency</strong> — drifting toward the high end of the scale unless
        the rubric pins it down.</li>
    </ul>

    <p>So an unvalidated judge is just a confident opinion. Before you trust its
    numbers, you have to <strong>evaluate the judge itself</strong> — and you already
    know how, because it's the same move as always: get ground truth (a batch of
    outputs graded by <em>humans</em>) and measure how well the judge matches it.
    Mitigations help too — randomize the order in pairwise to cancel position bias,
    keep the rubric tight, demand reasoning — but you confirm they worked by
    measuring agreement.</p>

    <h2>Measuring agreement — why raw percent lies</h2>

    <p>The obvious metric is: what fraction of items did the judge and the human label
    the same way? But raw agreement has a familiar problem — it gives free credit for
    <strong>agreeing by chance.</strong> If 90% of summaries are &ldquo;good,&rdquo;
    then a judge that blindly says &ldquo;good&rdquo; every time agrees with humans
    90% of the time while knowing nothing. (That's the imbalance trap again, wearing a
    new hat.)</p>

    <p><strong>Cohen's kappa</strong> corrects for this. It compares the observed
    agreement to the agreement you'd expect purely by chance, and rescales:</p>

    <p class="mathline">$$\\kappa = \\frac{p_o - p_e}{1 - p_e}$$</p>

    <p>where <em>p</em><sub>o</sub> is the observed agreement and <em>p</em><sub>e</sub>
    is the agreement expected by chance from each rater's overall rates. If they only
    ever agree at the chance level, <em>p</em><sub>o</sub> = <em>p</em><sub>e</sub> and
    kappa is 0; perfect agreement gives kappa = 1; worse-than-chance goes negative. A
    common reading of the scale (Landis &amp; Koch):</p>

    <div class="kappa-bands">
      <div class="kb-item"><span class="kb-chip poor">&lt; 0.20</span> slight</div>
      <div class="kb-item"><span class="kb-chip fair">0.21–0.40</span> fair</div>
      <div class="kb-item"><span class="kb-chip mod">0.41–0.60</span> moderate</div>
      <div class="kb-item"><span class="kb-chip sub">0.61–0.80</span> substantial</div>
      <div class="kb-item"><span class="kb-chip perf">0.81–1.0</span> almost perfect</div>
    </div>

    <p>Move the sliders below to feel why the correction matters. Watch what happens to
    kappa when the classes get imbalanced, even while raw agreement stays high:</p>

    ${Toolkit.widget(
      "Cohen's kappa: judge vs. human",
      `<label class="grow-slider">How often a human rates the output &ldquo;good&rdquo;
         (base rate): <strong><span id="ka-rate">50</span>%</strong>
         <input type="range" id="ka-rate-i" min="10" max="90" step="5" value="50" />
       </label>
       <label class="grow-slider">How often the judge matches the human
         (raw agreement): <strong><span id="ka-q">85</span>%</strong>
         <input type="range" id="ka-q-i" min="50" max="100" step="1" value="85" />
       </label>
       <div class="ka-grid">
         <div class="cm-corner"></div>
         <div class="cm-chead">judge: good</div>
         <div class="cm-chead">judge: bad</div>
         <div class="cm-rhead">human: good</div>
         <div class="ka-cell agree" id="ka-a">0</div>
         <div class="ka-cell dis" id="ka-b">0</div>
         <div class="cm-rhead">human: bad</div>
         <div class="ka-cell dis" id="ka-c">0</div>
         <div class="ka-cell agree" id="ka-d">0</div>
       </div>
       <div class="metric-row" id="ka-metrics"></div>
       <div class="cm-caption" id="ka-caption"></div>
       <div class="nd-cap">50 outputs, each labeled by a human and by the judge. The
         cell counts follow the two sliders; observed agreement, chance agreement, and
         kappa are all computed for real.</div>`
    )}

    <p>In code you don't compute it by hand — <code>scikit-learn</code> has it:</p>

    ${Toolkit.code("Python", `from sklearn.metrics import cohen_kappa_score

# human_labels: your hand-graded scores; judge_labels: the judge's scores, same items
kappa = cohen_kappa_score(human_labels, judge_labels)
print(f"Cohen's kappa: {kappa:.2f}")`)}

    <h2>The workflow: validate, then scale</h2>

    <p>Putting it together, an LLM-judge eval is a small bootstrap:</p>
    <ol>
      <li><strong>Hand-label a sample</strong> — say 50–100 outputs — with humans,
        against the same rubric. This is your ground truth for the judge.</li>
      <li><strong>Run the judge</strong> on those same outputs and compute
        <strong>kappa</strong> against the human labels.</li>
      <li><strong>Decide:</strong> if agreement is strong enough (often
        &ldquo;moderate&rdquo; to &ldquo;substantial&rdquo; is the working bar,
        depending on stakes), you can trust the judge to grade thousands of new
        outputs cheaply. If it's weak, the judge isn't ready — fix the rubric,
        address a bias, and re-measure.</li>
      <li><strong>Keep a human-labeled holdout</strong> and re-check periodically, so
        judge drift doesn't quietly rot your eval.</li>
    </ol>

    <p>Notice the shape of this: you used an eval to validate the tool that runs your
    evals. That recursion is the whole ethos of the course — you don't trust a
    measurement instrument until you've measured <em>it</em>.</p>

    ${Toolkit.instructorNote(
      `The rubric is where mathematicians shine and where most students underinvest.
       Push them to write each score level as a condition they could check without the
       model, the way an epsilon-delta definition replaces &ldquo;gets close.&rdquo;
       A concrete exercise that lands: give the class one article, one summary, and a
       loose rubric (&ldquo;score 1-10 for quality&rdquo;) and have them grade
       independently — the spread is embarrassing. Then give them the anchored 0/1/2
       rubric and repeat; the spread collapses. That before/after is the entire
       argument for decision-procedure rubrics, and it doubles as a lesson in
       inter-annotator agreement.`
    )}

    ${Toolkit.instructorNote(
      `Two honesty points worth stating out loud. (1) Kappa has a ceiling set by how
       much <em>humans</em> agree with each other — if two trained graders only reach
       kappa 0.7 on a task, no judge will (or should) beat that; measure human-human
       agreement first and treat it as the target. (2) The Landis-Koch bands are a
       convention, not a law of nature; the acceptable bar depends on what a wrong
       grade costs downstream. Resist the urge to present the bands as objective
       truth — they're a shared vocabulary, and the students should know that.`
    )}

    <h2>What you learned</h2>
    <ul>
      <li>Exact-match can't grade <strong>open-ended</strong> output; human judgment
        is the ground truth but doesn't scale.</li>
      <li><strong>LLM-as-judge</strong> scales grading: a rubric written as a
        <strong>decision procedure</strong> (anchored 0/1/2), structured output with
        <strong>reasoning before the score</strong>, a capable judge model, and often
        <strong>pairwise</strong> comparisons.</li>
      <li>The judge has <strong>biases</strong> (position, verbosity, self-preference,
        leniency), so you must <strong>validate it against human labels</strong> — you
        can't trust an unmeasured judge.</li>
      <li>Judge/human agreement needs <strong>Cohen's kappa</strong>, not raw percent,
        because raw agreement rewards agreeing by <strong>chance</strong> — glaringly
        so when classes are imbalanced. Validate the judge, then let it scale.</li>
    </ul>
  `,

  onMount(root) {
    /* ---- Cohen's kappa explorer ---------------------------------------
       N outputs, each labeled good/bad by a human and by the judge. The
       two sliders (human base rate r, raw agreement q) determine integer
       cell counts; observed/chance agreement and kappa are real. Shows
       that high raw agreement under imbalance still yields low kappa. */
    const N = 50;
    const rateEl  = root.querySelector("#ka-rate-i");
    const rateLab = root.querySelector("#ka-rate");
    const qEl     = root.querySelector("#ka-q-i");
    const qLab    = root.querySelector("#ka-q");
    const aEl = root.querySelector("#ka-a"), bEl = root.querySelector("#ka-b");
    const cEl = root.querySelector("#ka-c"), dEl = root.querySelector("#ka-d");
    const metricsEl = root.querySelector("#ka-metrics");
    const capEl = root.querySelector("#ka-caption");
    if (!rateEl) return;

    function band(k) {
      if (k < 0.001) return { name: "none / chance", cls: "poor" };
      if (k <= 0.20) return { name: "slight", cls: "poor" };
      if (k <= 0.40) return { name: "fair", cls: "fair" };
      if (k <= 0.60) return { name: "moderate", cls: "mod" };
      if (k <= 0.80) return { name: "substantial", cls: "sub" };
      return { name: "almost perfect", cls: "perf" };
    }

    function stat(name, val) {
      return `<div class="metric-card">
          <div class="metric-name">${name}</div>
          <div class="metric-val">${val}</div>
        </div>`;
    }

    function render() {
      const r = parseInt(rateEl.value, 10) / 100;   // human "good" base rate
      const q = parseInt(qEl.value, 10) / 100;      // raw agreement
      rateLab.textContent = Math.round(r * 100);
      qLab.textContent = Math.round(q * 100);

      // integer cells that sum to N; agreement mass q split across the two
      // agree cells in proportion to the base rate.
      let a = Math.round(r * q * N);              // human good & judge good
      let b = Math.round(r * (1 - q) * N);        // human good & judge bad
      let c = Math.round((1 - r) * (1 - q) * N);  // human bad  & judge good
      let d = N - a - b - c;                       // human bad  & judge bad
      if (d < 0) { d = 0; }

      aEl.textContent = a; bEl.textContent = b; cEl.textContent = c; dEl.textContent = d;

      const total = a + b + c + d;
      const po = (a + d) / total;
      const humanGood = (a + b) / total;
      const judgeGood = (a + c) / total;
      const pe = humanGood * judgeGood + (1 - humanGood) * (1 - judgeGood);
      const kappa = (1 - pe) > 1e-9 ? (po - pe) / (1 - pe) : 0;
      const bnd = band(kappa);

      metricsEl.innerHTML =
        stat("observed (p_o)", Math.round(po * 100) + "%") +
        stat("by chance (p_e)", Math.round(pe * 100) + "%") +
        `<div class="metric-card kappa-card ${bnd.cls}">
           <div class="metric-name">Cohen's kappa</div>
           <div class="metric-val">${kappa.toFixed(2)}</div>
           <div class="kb-tag">${bnd.name}</div>
         </div>`;

      let msg;
      if (kappa < 0.4 && po >= 0.8) {
        msg = "The judge matches humans " + Math.round(po * 100) +
          "% of the time — which looks great until you notice one label is so common " +
          "that most of that agreement is just chance. Kappa = " + kappa.toFixed(2) +
          " (" + bnd.name + "): the judge has barely earned any credit. This is exactly why raw agreement is not enough.";
      } else if (kappa >= 0.6) {
        msg = "Observed agreement is " + Math.round(po * 100) + "% and, corrected for chance, kappa = " +
          kappa.toFixed(2) + " (" + bnd.name + "). With balanced-enough classes, this judge is genuinely tracking human judgment — trustworthy enough to scale.";
      } else {
        msg = "Kappa = " + kappa.toFixed(2) + " (" + bnd.name + "). Observed agreement is " +
          Math.round(po * 100) + "%, but once you subtract chance there's only modest real agreement. Tighten the rubric and re-measure before trusting this judge.";
      }
      capEl.textContent = msg;
    }

    rateEl.addEventListener("input", render);
    qEl.addEventListener("input", render);
    render();
  },
};
