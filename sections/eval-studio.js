/* ============================================================
   Section: Studio — build an eval suite  (STUDIO) — caps Block 3
   Course section 15. First big group studio. A project BRIEF (not
   step-by-step): teams pick a scenario and build the eval suite that
   decides whether the feature is good enough to ship, folding in
   everything from Block 3 (harness, precision/recall, LLM-judge +
   kappa, confidence intervals). Follows the studio pattern:
     - scenario switcher (A/B/C briefs)
     - test buckets (happy / hard / must-not-or-cant-answer)
     - an anchored 0/1/2 rubric (decision procedure)
     - a red-team swap round (+ a scorecard)
     - a deliverables checklist
     - a closing "this is the job" note
   Heavy INSTRUCTOR scaffolding (facilitation timeline, answer-key
   worked example, studio grading, failure modes) — all HIDDEN via
   Toolkit.instructorNote (?teach mode).

   Interactives: (1) scenario switcher rendering each brief + its
   buckets + fitting metrics; (2) a red-team SCORECARD — 7 quality
   dimensions as checkboxes tallying a live score + verdict.

   NOTE (playbook): studios are briefs, end with "this is the job" (no
   "What you learned"). No literal dollar signs; no backtick chars in
   prose; curly quotes/arrows as literal unicode in strings.
   ============================================================ */

window.SectionContent["eval-studio"] = {
  title: "Studio: build an eval suite",

  html: `
    <div class="eyebrow">Evaluation · Section 17 · Studio</div>
    <h1>Studio: build an eval suite</h1>

    <p>You now own every piece: a harness that scores a dataset, the metrics that fit a
    task, an LLM judge you know how to validate, and the statistics to tell signal from
    noise. This studio puts them together the way the job actually demands. In a real AI
    team, <strong>the eval suite is the product's spec</strong> — it's the artifact that
    decides whether a change ships. Today, in teams, you build one.</p>

    <p>Work in groups of three or four. The goal is not a perfect system — it's an
    <strong>eval suite you'd trust to catch a regression before your users do.</strong></p>

    <h2>1. Pick a scenario</h2>

    <p>Each brief is a real feature with a different evaluation shape. Pick one:</p>

    ${Toolkit.widget(
      "Scenario briefs",
      `<div class="scn-tabs">
         <button class="btn ghost scn-tab active-mode" data-s="A">A · Ticket triage</button>
         <button class="btn ghost scn-tab" data-s="B">B · Meeting summarizer</button>
         <button class="btn ghost scn-tab" data-s="C">C · Homework tutor</button>
       </div>
       <div class="scn-card" id="scn-card"></div>`
    )}

    <h2>2. Build your test buckets</h2>

    <p>A dataset that is all easy cases reports a flattering number that predicts
    nothing. So build your labeled set in <strong>three deliberate buckets</strong>:</p>
    <ul>
      <li><strong>Happy path</strong> — ordinary inputs with a clear correct answer.
        Confirms the thing works at all.</li>
      <li><strong>Hard</strong> — ambiguous, adversarial, edge cases: sarcasm, mixed
        intent, borderline calls, messy text. This is the bucket that can actually
        <em>fail</em>, which is what makes the eval worth running.</li>
      <li><strong>Must-not / can't-answer</strong> — the dangerous failures: things the
        system must refuse, must not hallucinate, or genuinely cannot answer and should
        admit it. This bucket is where real products get hurt, and it's the one beginners
        forget.</li>
    </ul>

    <p>Aim for at least <strong>~30 examples per bucket</strong>, hand-labeled, and label
    them <em>independently</em> of what the model says — otherwise you're grading the
    model against itself. And keep the interval in mind: a 50-item eval carries a
    plus-or-minus of about 12 points, so if your buckets are small, only <em>big</em>
    differences will be real.</p>

    <h2>3. Choose your metrics — and justify them</h2>

    <p>Don't default to accuracy. Pick metrics that fit your scenario and the
    <strong>cost of each kind of mistake</strong>, and be ready to defend the choice:</p>
    <ul>
      <li>Classification with a rare, high-stakes class? Report
        <strong>precision and recall</strong> on that class, not just accuracy, and show
        the <strong>confusion matrix</strong>.</li>
      <li>Open-ended output? Build an <strong>LLM judge</strong> with an anchored rubric,
        and <strong>validate it against ~20 human-labeled examples with Cohen's
        kappa</strong> before you trust its numbers.</li>
      <li>Whatever you report, report it <strong>with a confidence interval</strong> — a
        bare number is not an answer.</li>
    </ul>

    <h2>4. Write the rubric as a decision procedure</h2>

    <p>If any part of your suite needs judgment (a human's or the model's), it needs a
    rubric that two graders would apply the same way. Write each level as a
    <strong>checkable condition</strong>, not a vibe. A 0/1/2 scale with concrete anchors
    is the template:</p>

    ${Toolkit.code("rubric.md (example — a summary judge)", `Score a summary against its source transcript.

2 - Captures every decision and action item, invents nothing.
1 - Captures the main decisions but misses a minor item, OR is
    slightly vague; still contains no invented facts.
0 - Misses a key decision, OR includes any fact/action not in
    the transcript (a hallucination).

Grade the reasoning first, then output the score.`)}

    <p>The test of a good rubric: hand it and one example to two teammates separately —
    if they land on different scores, the rubric isn't done.</p>

    <h2>5. Red-team round</h2>

    <p>Swap eval suites with another team. Your job is now to <strong>break their
    eval</strong> — not their system. A suite that can't be broken by an attacker is one
    you can trust; every hole you find is a gift. Score the suite you received against the
    seven checks below, then hand it back with your findings.</p>

    ${Toolkit.widget(
      "Red-team scorecard",
      `<div class="scorecard" id="sc-list">
         <label class="sc-item"><input type="checkbox" data-sc> Every bucket is populated — including a real <strong>must-not / can't-answer</strong> bucket, not just happy-path.</label>
         <label class="sc-item"><input type="checkbox" data-sc> The <strong>hard bucket</strong> actually contains cases the system plausibly gets wrong (the eval <em>can</em> fail).</label>
         <label class="sc-item"><input type="checkbox" data-sc> The <strong>metrics fit the task</strong> and the cost of each mistake (not just accuracy on an imbalanced problem).</label>
         <label class="sc-item"><input type="checkbox" data-sc> Any <strong>LLM judge</strong> has an anchored 0/1/2 rubric, validated against human labels (kappa reported).</label>
         <label class="sc-item"><input type="checkbox" data-sc> Results are reported <strong>with confidence intervals</strong>, not bare numbers.</label>
         <label class="sc-item"><input type="checkbox" data-sc> Labels were assigned <strong>independently of the model</strong> (not grading the model against itself).</label>
         <label class="sc-item"><input type="checkbox" data-sc> There is a <strong>held-out set</strong> not used while iterating (guards against fitting the eval).</label>
       </div>
       <div class="sc-verdict" id="sc-verdict"></div>`
    )}

    <h2>6. Deliverables</h2>
    <p>Each team turns in:</p>
    <ul class="checklist">
      <li><input type="checkbox" id="d1"><label for="d1">A labeled dataset with all three buckets, ~30+ examples each.</label></li>
      <li><input type="checkbox" id="d2"><label for="d2">A runnable harness that scores the system and prints the metric(s) <em>with</em> confidence intervals.</label></li>
      <li><input type="checkbox" id="d3"><label for="d3">A one-paragraph justification of the metrics you chose and why (tie each to a mistake's cost).</label></li>
      <li><input type="checkbox" id="d4"><label for="d4">Your rubric (if you used a judge) plus its kappa against human labels.</label></li>
      <li><input type="checkbox" id="d5"><label for="d5">The red-team findings you received, and what you'd fix.</label></li>
    </ul>

    ${Toolkit.instructorNote(
      `<strong>Facilitation timeline (~50 min).</strong> 5 min pick scenario + form teams ·
       15 min build the three buckets (this is where the learning is — push them on the
       must-not bucket) · 10 min choose metrics + draft the rubric · 10 min red-team swap
       and scorecard · 10 min debrief. If you are short on time, have teams build only the
       hard and must-not buckets live and stub the happy path — the hard buckets are where
       the thinking happens.`
    )}

    ${Toolkit.instructorNote(
      `<strong>Answer key — a strong Scenario A suite,</strong> so you have a model to grade
       against. Buckets: <em>happy</em> = clean single-category tickets; <em>hard</em> =
       a billing+technical hybrid, a calm-worded outage, a non-English ticket, pure venting
       with no request; <em>must-not</em> = an urgent outage phrased politely (must still
       flag urgent), spam dressed as a ticket, a ticket fitting no category. Metrics:
       accuracy for the 4-way category, but <em>precision and recall on the urgent flag</em>
       (a missed outage is the expensive error, so recall is king), plus a confusion matrix
       to reveal which categories bleed together. Reporting: bootstrap CIs on each number.
       A team that reports only overall accuracy has missed the whole point of the last four
       sections — that is the teachable failure.`
    )}

    ${Toolkit.instructorNote(
      `<strong>Grading the studio as a decision procedure.</strong> Score each team 0/1/2 on
       four axes: (1) <em>Buckets</em> — 2 if the must-not bucket is real and adversarial, 0
       if all-happy-path. (2) <em>Metrics</em> — 2 if the metric fits the cost of mistakes
       and they can defend it, 0 if reflexive accuracy. (3) <em>Rigor</em> — 2 if numbers
       carry CIs and any judge is kappa-validated, 0 if bare numbers. (4) <em>Red-team</em>
       — 2 if they found a real hole in the other team's suite and proposed a fix. An 8/8
       suite is one you would actually trust to gate a deploy.`
    )}

    ${Toolkit.instructorNote(
      `<strong>Failure modes to watch and name in the debrief:</strong> all-happy-path
       datasets (the eval can't fail); accuracy on an imbalanced flag (the 95%-useless
       trap); an LLM judge nobody validated; bare numbers with no interval; and labeling
       done by skimming the model's own output (self-grading). Each of these maps to one
       section they just did — call out which, so the block lands as a connected whole.`
    )}

    <h2>This is the job</h2>
    <p>At a real AI company, nobody asks &ldquo;does it feel better?&rdquo; They ask to see
    the evals. The person who owns the eval suite owns the definition of quality for the
    whole feature — what &ldquo;good enough to ship&rdquo; even means. That's not the
    grunt work around the edges of AI engineering; on a non-deterministic system, it
    <em>is</em> the engineering. If you can walk into a team and build the suite you built
    today, you can be trusted with the product.</p>
  `,

  onMount(root) {
    /* ---- Scenario switcher ---- */
    const SCN = {
      A: {
        name: "Support-ticket triage",
        kind: "Multi-class classification + an imbalanced 'urgent' flag",
        mission: "Sort each incoming support ticket into billing / technical / account / spam, and flag whether it is urgent.",
        happy: ["“I was charged twice this month.” → billing", "“The app won't open after the update.” → technical"],
        hard: ["A ticket that is both billing AND technical", "Polite venting with no actual request", "Typo-ridden or non-English text"],
        mustnot: ["An outage worded calmly — must STILL flag urgent", "Spam dressed up as a real ticket", "A ticket that fits no category (handle it, don't force one)"],
        metrics: "Accuracy for the 4-way category; precision & recall for the 'urgent' flag (a missed outage is far worse than a false alarm → protect recall); a confusion matrix to see which categories bleed together.",
      },
      B: {
        name: "Meeting-notes summarizer",
        kind: "Open-ended generation (no single gold answer)",
        mission: "Turn a meeting transcript into a short summary of the decisions and action items.",
        happy: ["A clear transcript with two decisions and three action items"],
        hard: ["A rambling transcript where the real decision is implicit", "Two speakers disagreeing — who actually 'decided'?"],
        mustnot: ["A summary that invents an action item nobody mentioned (hallucination)", "A transcript with NO decision — the summary must not fabricate one"],
        metrics: "An LLM judge with an anchored 0/1/2 rubric (faithful? captures the decisions? invents nothing?), validated against ~20 human-labeled summaries with Cohen's kappa before you trust it. Report the mean score with a bootstrap CI.",
      },
      C: {
        name: "Homework-help tutor",
        kind: "Assistance + a refusal guardrail",
        mission: "Answer student questions helpfully, but refuse to hand over answers to graded assessments, and stay on subject.",
        happy: ["“Explain how photosynthesis works.” → help"],
        hard: ["“Check my reasoning on this proof.” → help, but don't just hand over the answer", "A request that is borderline between learning and cheating"],
        mustnot: ["“Here is my graded final exam — give me the answers.” → must refuse", "An off-topic or unsafe request → refuse or redirect"],
        metrics: "Precision & recall on the 'refuse' decision (a missed must-refuse is the costly error → recall matters most); helpfulness of the allowed answers via an LLM-judge rubric. Report both with CIs.",
      },
    };

    const cardEl = root.querySelector("#scn-card");
    const tabs = Array.prototype.slice.call(root.querySelectorAll(".scn-tab"));

    function bucket(title, cls, items) {
      return `<div class="scn-bucket ${cls}">
          <div class="scn-bhead">${title}</div>
          <ul>${items.map((x) => "<li>" + x + "</li>").join("")}</ul>
        </div>`;
    }
    function renderScenario(key) {
      const s = SCN[key];
      if (!cardEl) return;
      cardEl.innerHTML =
        `<div class="scn-name">${s.name}</div>
         <div class="scn-kind">${s.kind}</div>
         <p class="scn-mission">${s.mission}</p>
         <div class="scn-buckets">
           ${bucket("Happy path", "happy", s.happy)}
           ${bucket("Hard", "hard", s.hard)}
           ${bucket("Must-not / can't-answer", "mustnot", s.mustnot)}
         </div>
         <div class="scn-metrics"><strong>Metrics that fit:</strong> ${s.metrics}</div>`;
      tabs.forEach((t) => t.classList.toggle("active-mode", t.dataset.s === key));
    }
    tabs.forEach((t) => t.addEventListener("click", () => renderScenario(t.dataset.s)));
    renderScenario("A");

    /* ---- Red-team scorecard ---- */
    const boxes = Array.prototype.slice.call(root.querySelectorAll("#sc-list [data-sc]"));
    const verdictEl = root.querySelector("#sc-verdict");
    function scoreCard() {
      const n = boxes.filter((b) => b.checked).length;
      let cls, msg;
      if (n >= 6) { cls = "real"; msg = "Would survive contact with reality — this is a ship-quality eval that could gate a deploy."; }
      else if (n >= 4) { cls = "inconc"; msg = "Usable, but the red team found real blind spots. Fix the unchecked items before you trust its verdicts."; }
      else { cls = "worse"; msg = "This eval flatters the system — it would wave junk through. It needs work before anyone relies on it."; }
      verdictEl.className = "sc-verdict " + cls;
      verdictEl.innerHTML = "<strong>" + n + " of 7</strong> — " + msg;
    }
    boxes.forEach((b) => b.addEventListener("change", scoreCard));
    scoreCard();
  },
};
