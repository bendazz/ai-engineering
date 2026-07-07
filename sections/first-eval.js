/* ============================================================
   Section: Your first eval  (LAB) — the spine kicks in
   Block 3 "Evaluation", section 1 (course section 11). The pivot the
   whole course points at: stop eyeballing, start MEASURING.
     - what an eval is: dataset (inputs + known answers) + task-under-test
       + scorer + runner -> a METRIC (accuracy) + the failures
     - build a real harness on the structured-output classifier
     - the eval-driven loop: baseline -> change the prompt -> re-run ->
       compare ("is it ACTUALLY better?")
     - honesty: accuracy is a NOISY estimate (non-determinism), and a
       tiny dataset proves little
   LAB: predict-then-reveal allowed; ends "What you accomplished".

   Star interactive: an eval dashboard — a 10-example labeled set, two
   prompt versions; "Run eval" fills predictions, scores each row (REAL
   comparison + accuracy), lists failures, and compares v1 vs v2. The
   predictions are canned + LABELED illustrative; scoring/accuracy real.

   Facts: builds on the VERIFIED structured-output classifier from
   `structured-outputs` (messages.parse -> parsed_output; Haiku 4.5 OK).
   No new external facts. See [[verified-facts]].

   NOTE (playbook): no literal dollar signs; no backtick chars in prose;
   avoid literal "\\n" pitfalls in code bodies (JS turns \n into a real
   newline) — used separate print()s instead. Instructor notes hidden via
   Toolkit.instructorNote.
   ============================================================ */

window.SectionContent["first-eval"] = {
  title: "Your first eval",

  html: `
    <div class="eyebrow">Evaluation · Section 13 · Lab</div>
    <h1>Your first eval</h1>

    <p>This is the section the whole course has been walking toward. You can call
    the model, and you can get answers your code can read. So here is the question a
    professional asks next, the one that never goes away: <strong>is it any good —
    and how do I know?</strong> You've seen that you can't just run it once and
    eyeball the answer, because the output wobbles. The professional replacement for
    eyeballing is an <strong>eval</strong>: a small, repeatable measurement of how
    well the system does its job. Today you build one.</p>

    <h2>What an eval actually is</h2>

    <p>Strip away the jargon and an eval is four plain pieces:</p>
    <ol>
      <li>A <strong>dataset</strong> — a list of example inputs, each paired with the
        <strong>known-correct answer</strong> you decided on yourself. This is your
        ground truth.</li>
      <li>The <strong>task under test</strong> — the function that calls the model,
        the thing you're trying to measure (your classifier from last section).</li>
      <li>A <strong>scorer</strong> — a rule for deciding whether one output is
        correct. For classification it's just equality: did the predicted label
        match the expected one?</li>
      <li>A <strong>runner</strong> — the loop that runs the task on every example,
        scores each, and <strong>aggregates</strong> into a single number (accuracy)
        while keeping the list of what failed.</li>
    </ol>

    <p>That's it. An eval is a test suite for a non-deterministic system: instead of
    pass/fail, it reports a <em>score</em>. Watch one run — pick a prompt version and
    press <strong>Run eval</strong>:</p>

    ${Toolkit.widget(
      "An eval, running",
      `<div class="ev-versions">
         <button class="btn ghost ev-vbtn active-mode" data-v="v1">Prompt v1 · basic</button>
         <button class="btn ghost ev-vbtn" data-v="v2">Prompt v2 · with examples</button>
         <button class="btn" id="ev-run">Run eval</button>
       </div>
       <div class="ev-prompt" id="ev-prompt"></div>
       <div class="ev-table" id="ev-table"></div>
       <div class="ev-summary" id="ev-summary"></div>
       <div class="ev-compare" id="ev-compare"></div>
       <div class="nd-cap">Illustrative run: in your repo the predictions come from
         real API calls. The scoring, the accuracy, and the failure list are exactly
         what your harness computes.</div>`
    )}

    <p>Notice what the dashboard gives you that a single eyeballed call never could:
    one honest number for the whole system, and — just as valuable — a precise list
    of <strong>which examples it got wrong.</strong></p>

    <h2>Step 1 — Build a dataset</h2>

    <p>Start small and hand-made. A dozen to a few dozen examples is plenty to begin;
    the point is that <em>you</em> decide the correct answer for each, carefully and
    independently of the model. Keep it as a list of dictionaries (later you might
    move it to a <code>data.jsonl</code> file your code reads):</p>

    ${Toolkit.code("data.py", `DATASET = [
    {"text": "Best purchase I have made all year!",        "label": "positive"},
    {"text": "It broke after two days. Total waste.",      "label": "negative"},
    {"text": "The package arrived on Tuesday.",            "label": "neutral"},
    {"text": "Not bad, but not great either.",             "label": "neutral"},
    {"text": "Customer service never answered my emails.", "label": "negative"},
    # ... a dozen or more, each labeled by hand
]`)}

    ${Toolkit.instructorNote(
      `Building the dataset is the part students undervalue and the part that matters
       most. Two things to insist on in class: (1) label the examples
       <em>independently</em> of what the model says — otherwise you are grading the
       model against itself; and (2) deliberately include <strong>hard cases</strong>
       — sarcasm, mixed sentiment, neutral-that-looks-positive. An eval made only of
       easy examples reports a flattering number that predicts nothing about real
       inputs. A good in-class exercise: have each student contribute two tricky
       examples and pool them.`
    )}

    <h2>Step 2 — Write the harness</h2>

    <p>The task under test is the structured-output classifier you already wrote —
    the fact that it returns a validated label instead of prose is exactly what makes
    it scorable:</p>

    ${Toolkit.code("sentiment.py", `from pydantic import BaseModel
from typing import Literal
import anthropic

client = anthropic.Anthropic()

class Sentiment(BaseModel):
    sentiment: Literal["positive", "negative", "neutral"]
    confidence: float

def classify(text):
    resp = client.messages.parse(
        model="claude-haiku-4-5",
        max_tokens=100,
        messages=[{"role": "user", "content": f"Classify the sentiment: {text}"}],
        output_format=Sentiment,
    )
    return resp.parsed_output.sentiment`)}

    <p>Now the runner and the scorer. This is the heart of the whole course, and it's
    remarkably short:</p>

    ${Toolkit.code("eval_sentiment.py", `from data import DATASET
from sentiment import classify

def run_eval(dataset):
    results = []
    for ex in dataset:
        pred = classify(ex["text"])          # the model's answer (structured)
        correct = (pred == ex["label"])      # the scorer: exact-match
        results.append({"text": ex["text"], "expected": ex["label"],
                        "pred": pred, "correct": correct})
    return results

results = run_eval(DATASET)

hits = sum(r["correct"] for r in results)
n = len(results)
print(f"accuracy: {hits/n:.0%}  ({hits}/{n})")

print("failures:")
for r in results:
    if not r["correct"]:
        print("  expected", r["expected"], "got", r["pred"], "|", r["text"])`)}

    <h2>Step 3 — Run it, and read the failures</h2>

    <p>Run <code>python eval_sentiment.py</code>. You'll get a line like
    <code>accuracy: 70% (7/10)</code> and then the list of misses. Resist the urge to
    look only at the headline number. <strong>The failures are the most valuable
    output of the whole run</strong> — they tell you precisely where the system is
    weak and what to fix. In our example the classifier trips on sarcasm and on
    neutral reviews it reads as positive. That's not a vague feeling; it's a concrete
    to-do list.</p>

    <h2>Step 4 — The loop: change, re-run, compare</h2>

    <p>Here is eval-driven development in one motion. You have a
    <strong>baseline</strong> number now — say 70%. You form a hypothesis from the
    failures (&ldquo;it doesn't know what counts as neutral&rdquo;), and you make one
    change: rewrite the prompt to define the categories and give a couple of
    examples. Then you <strong>run the exact same eval again</strong> and compare:</p>

    ${Toolkit.callout(
      `<code>v1 (basic prompt): 70%</code> &nbsp;→&nbsp;
       <code>v2 (with examples): 90%</code>. The change helped, and now you can say
       so with a number instead of a hunch. That single comparison —
       baseline, change one thing, re-measure — is the loop you'll repeat for every
       capability in this course. It's the difference between engineering and
       wishing.`,
      { type: "ai", label: "Eval-driven development" }
    )}

    <p>Two honest cautions before you trust any single number:</p>

    ${Toolkit.problem(
      `You run your eval twice without changing a line of code, and get
       <strong>85%</strong> the first time and <strong>80%</strong> the second. Did
       something break?`,
      `<p><strong>No — that's the non-determinism you already know.</strong> Because
       the model samples its output, the same example can be classified differently
       on different runs, so the accuracy itself is a <em>noisy estimate</em>, not a
       fixed constant. One consequence right away: a small change in the headline
       number might be real, or it might just be the wobble. When a difference is
       small or the dataset is small, run the eval a few times and look at the
       spread before you believe an improvement is real.</p>`,
      { label: "Predict: the number moved on its own" }
    )}

    ${Toolkit.problem(
      `Your eval reports <strong>100% (8/8)</strong>. Ship it?`,
      `<p><strong>Not yet.</strong> Eight examples is far too few to conclude much of
       anything — one lucky run on easy cases. A perfect score on a tiny, easy
       dataset mostly tells you the dataset is tiny and easy. Grow it, and
       deliberately add the hard and adversarial cases you expect in the real world;
       a good eval is one that can actually <em>fail</em>. The number is only as
       trustworthy as the examples behind it.</p>`,
      { label: "Predict: a perfect score" }
    )}

    ${Toolkit.instructorNote(
      `The mindset shift to sell here: an eval is not a grade you hope is high — it's
       an instrument you want to be <em>sensitive</em>. A student whose eval always
       reports 100% has a broken instrument, not a perfect system. Reward datasets
       that surface failures. This also sets up everything ahead: once they trust the
       instrument, every later technique (better prompts, tools, retrieval) gets the
       same treatment — change one thing, re-run the eval, keep it only if the number
       goes up.`
    )}

    <h2>What you accomplished</h2>
    <ul>
      <li>You built a real <strong>eval harness</strong>: a hand-labeled dataset, a
        scorer, and a runner that reports <strong>accuracy</strong> and the list of
        failures.</li>
      <li>You measured your classifier instead of eyeballing it, and you saw that the
        <strong>failures</strong> — not the headline number — are what tell you what
        to fix.</li>
      <li>You ran the <strong>eval-driven loop</strong>: baseline, change one thing,
        re-run, compare — turning &ldquo;I think it's better&rdquo; into a number.</li>
      <li>You know two ways a single number lies: <strong>non-determinism</strong>
        makes accuracy a noisy estimate, and a <strong>tiny or easy dataset</strong>
        makes it meaningless. A good eval is one that can fail.</li>
    </ul>
  `,

  onMount(root) {
    /* ---- Eval dashboard ------------------------------------------------
       Real scoring + accuracy over a fixed labeled set. Predictions are
       canned per prompt-version (LABELED illustrative) so the page needs
       no API key; everything else mirrors a real harness. */
    const DATASET = [
      { text: "Best purchase I've made all year!",              label: "positive" },
      { text: "It broke after two days. Complete waste.",       label: "negative" },
      { text: "The package arrived on Tuesday.",                label: "neutral"  },
      { text: "I was skeptical, but honestly? Blown away.",     label: "positive" },
      { text: "Does exactly what it says. No complaints.",      label: "positive" },
      { text: "Not bad, but not great either.",                 label: "neutral"  },
      { text: "Oh sure, works GREAT — if you like it dying.",   label: "negative" },
      { text: "Customer service never answered my emails.",     label: "negative" },
      { text: "It's a charger. It charges the phone.",          label: "neutral"  },
      { text: "Five stars, would recommend to anyone.",         label: "positive" },
    ];
    // Canned model predictions per prompt version (illustrative).
    const PREDS = {
      v1: ["positive","negative","neutral","positive","positive","positive","positive","negative","positive","positive"],
      v2: ["positive","negative","neutral","positive","positive","neutral","positive","negative","neutral","positive"],
    };
    const PROMPT_TEXT = {
      v1: "Prompt v1: “Classify the sentiment: {text}”",
      v2: "Prompt v2: adds category definitions and two worked examples (esp. what counts as neutral).",
    };

    let selV = "v1";
    const runAcc = {};   // version -> accuracy once run

    const vbtns   = Array.prototype.slice.call(root.querySelectorAll(".ev-vbtn"));
    const runBtn  = root.querySelector("#ev-run");
    const promptEl= root.querySelector("#ev-prompt");
    const tableEl = root.querySelector("#ev-table");
    const sumEl   = root.querySelector("#ev-summary");
    const cmpEl   = root.querySelector("#ev-compare");
    if (!tableEl) return;

    function esc(s) {
      return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    }
    function chip(label) {
      return `<span class="lbl-chip ${label}">${label}</span>`;
    }

    function renderTable(showPred) {
      const preds = PREDS[selV];
      tableEl.innerHTML = DATASET.map((ex, i) => {
        const pred = preds[i];
        const correct = pred === ex.label;
        const predCell = showPred
          ? `${chip(pred)} <span class="ev-mark ${correct ? "ok" : "bad"}">${correct ? "✓" : "✗"}</span>`
          : `<span class="ev-pending">—</span>`;
        return `<div class="ev-row${showPred ? (correct ? " good" : " bad") : ""}">
            <div class="ev-text">${esc(ex.text)}</div>
            <div class="ev-exp">${chip(ex.label)}</div>
            <div class="ev-pred">${predCell}</div>
          </div>`;
      }).join("");
    }

    function renderCompare() {
      const versions = Object.keys(runAcc);
      if (versions.length === 0) { cmpEl.innerHTML = ""; return; }
      const parts = versions.sort().map((v) =>
        `<span class="ev-cmp-item">${v}: <strong>${Math.round(runAcc[v] * 100)}%</strong></span>`
      ).join("");
      let verdict = "";
      if (runAcc.v1 !== undefined && runAcc.v2 !== undefined) {
        const d = Math.round((runAcc.v2 - runAcc.v1) * 100);
        verdict = d > 0
          ? ` — v2 is <strong>+${d} points</strong> better. The eval says the change helped.`
          : (d < 0 ? ` — v2 is ${d} points worse.` : " — no change.");
      }
      cmpEl.innerHTML = `<div class="ev-compare-inner">${parts}${verdict}</div>`;
    }

    function run() {
      const preds = PREDS[selV];
      let hits = 0;
      const fails = [];
      DATASET.forEach((ex, i) => {
        if (preds[i] === ex.label) hits += 1;
        else fails.push(ex.label + " vs " + preds[i] + "  |  " + ex.text);
      });
      const n = DATASET.length;
      runAcc[selV] = hits / n;
      renderTable(true);
      sumEl.className = "ev-summary shown";
      sumEl.innerHTML =
        `<div class="ev-acc">accuracy: <strong>${Math.round(hits / n * 100)}%</strong>
           <span class="ev-frac">(${hits}/${n})</span></div>
         <div class="ev-fails"><div class="ev-fails-head">failures (${fails.length})</div>` +
        (fails.length
          ? fails.map((f) => `<div class="ev-fail">${esc(f)}</div>`).join("")
          : `<div class="ev-fail">none</div>`) +
        `</div>`;
      renderCompare();
    }

    function selectVersion(v) {
      selV = v;
      vbtns.forEach((b) => b.classList.toggle("active-mode", b.dataset.v === v));
      promptEl.textContent = PROMPT_TEXT[v];
      sumEl.className = "ev-summary";
      sumEl.innerHTML = "";
      renderTable(false);
      renderCompare();
    }

    vbtns.forEach((b) => b.addEventListener("click", () => selectVersion(b.dataset.v)));
    runBtn.addEventListener("click", run);
    selectVersion("v1");
  },
};
