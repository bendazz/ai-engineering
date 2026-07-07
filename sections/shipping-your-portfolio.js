/* ============================================================
   Section: Shipping your portfolio  (CLOSING) — the last section of the
   course, section 44. Turn the capstone into a hireable artifact, then
   the course-wide send-off.
     - the repo is your resume; most candidates show a DEMO, the hired show
       EVIDENCE. Lead with the eval story + numbers with CIs.
     - the README that gets you hired: problem, architecture, the EVAL
       story (how measured + a change and how you knew it helped), the
       production/deploy story, honest limitations + next steps
     - a demo that shows a HARD/adversarial case (honesty as a strength);
       clean git history (Block 1 pays off one last time)
     - the course send-off: grand recap of the arc (non-determinism -> eval
       spine -> capability -> production -> deployment) + the core identity:
       an AI engineer makes being wrong small, visible, reversible, and
       proves the system works
   Closing section: ends with a course-wide "What you can now do" recap.

   Star interactives: weak-vs-strong README toggle (.pf-*, demo-led vs
   evidence-led) + a portfolio-readiness checklist (reuses .scorecard).

   NOTE (playbook): no literal dollar signs; no backtick chars in prose; no
   star-slash inside comments; no raw less-than in html; NO forward lead-in
   (this is the last section); curly quotes literal; instructor notes hidden.
   ============================================================ */

window.SectionContent["shipping-your-portfolio"] = {
  title: "Shipping your portfolio",

  html: `
    <div class="eyebrow">Capstone · Section 46</div>
    <h1>Shipping your portfolio</h1>

    <p>You built something real. Now for the part almost nobody teaches and everybody needs: making
    sure the world can see how good it is. In this field the honest truth is that
    <strong>your repo is your resume</strong> — a hiring engineer will click your GitHub link and
    decide a lot in ninety seconds. And here's the edge you now have: most candidates show a
    <em>demo</em>, and you can show <strong>evidence</strong>.</p>

    <h2>The README that gets you hired</h2>

    <p>A great project with a weak README reads as a weak project. The difference isn't polish or
    emoji — it's whether a reader can see, fast, that you <em>measured</em> what you built. Flip
    between what most people ship and what actually lands:</p>

    ${Toolkit.widget(
      "Two READMEs, same project",
      `<div class="controls">
         <button class="btn ghost pf-tab active-mode" data-v="weak">What most candidates ship</button>
         <button class="btn ghost pf-tab" data-v="strong">What gets you hired</button>
       </div>
       <div class="pf-readme" id="pf-readme"></div>
       <div class="pf-note" id="pf-note"></div>`
    )}

    <p>The strong one isn't longer or fancier — it <strong>leads with results</strong>, and the
    results carry <strong>confidence intervals</strong>. That single habit signals more engineering
    maturity than any amount of &ldquo;powered by AI.&rdquo; It says: I know what my system does,
    I measured it, and I'm telling you the truth about it.</p>

    <h2>What belongs in it</h2>
    <ul>
      <li><strong>The problem</strong> — one honest paragraph on what this does and for whom.</li>
      <li><strong>The results, up top</strong> — your headline metric <em>with a CI</em>, and the
        capability-specific numbers (groundedness, tool-correctness, accuracy). Lead here.</li>
      <li><strong>The eval story</strong> — how you measured it, and <em>one change you made and how
        you knew it helped</em> (a before/after your eval gated). This is the part that proves you can
        do the job, not just build a toy.</li>
      <li><strong>Architecture</strong> — a simple diagram or description: the pipeline, the tools,
        the guardrails, the deploy.</li>
      <li><strong>Production &amp; deployment</strong> — cost per request, p95 latency, and that a CI
        gate blocks regressions. Say it plainly; few candidates can.</li>
      <li><strong>Honest limitations &amp; next steps</strong> — what doesn't work yet and what you'd
        do about it.</li>
    </ul>

    <h2>The demo, and the honesty that signals strength</h2>

    <p>Include a short demo — a recording or a live link — but do the thing that separates you:
    <strong>show it handling a hard case, not just the happy path.</strong> Anyone can screenshot the
    question their system answers well. Showing an adversarial input your guardrail catches, or a
    tricky case and an honest note about where it still struggles, reads as <em>confidence</em>, not
    weakness. Naming your system's limits is how an experienced engineer signals they actually
    understand it. Overselling is the tell of someone who doesn't.</p>

    <p>And your <strong>git history</strong> is part of the picture — the version control you set up
    on day one of this course is now your professional face. Clean, meaningful commits and a real
    README say &ldquo;this person works like a pro&rdquo; before anyone reads a line of your code.</p>

    <p>Audit your own portfolio the way a hiring engineer would:</p>

    ${Toolkit.widget(
      "Portfolio-readiness check",
      `<div class="scorecard" id="pf-sc">
         <label class="sc-item"><input type="checkbox" data-sc> The README <strong>leads with results</strong> (numbers, with confidence intervals) — not a demo GIF.</label>
         <label class="sc-item"><input type="checkbox" data-sc> There's an <strong>eval story</strong>: how you measured it, and a change you made with the before/after.</label>
         <label class="sc-item"><input type="checkbox" data-sc> The <strong>architecture</strong> and the production/deploy story (cost, p95, CI gate) are stated plainly.</label>
         <label class="sc-item"><input type="checkbox" data-sc> The demo shows a <strong>hard/adversarial case</strong>, not only the happy path.</label>
         <label class="sc-item"><input type="checkbox" data-sc> There's an <strong>honest limitations</strong> section — what doesn't work yet, and what's next.</label>
         <label class="sc-item"><input type="checkbox" data-sc> The repo is clean: real <strong>git history</strong>, sensible structure, no secrets committed.</label>
       </div>
       <div class="sc-verdict" id="pf-verdict"></div>`
    )}

    ${Toolkit.instructorNote(
      `Grade the README/portfolio as its own artifact — in this field it genuinely is a deliverable.
       The rubric that matters: does a stranger learn, in under two minutes, WHAT it does, HOW GOOD it
       is (with a CI), and HOW you know? Reward the honest-limitations section explicitly and loudly —
       students are trained by every other class to oversell, and you want to un-train that here,
       because in AI engineering claiming more than you measured is a firing offense, not a flourish.
       Run a demo day: each team leads with their numbers, not their UI, and shows one hard case. The
       weak-vs-strong README contrast is worth doing live — put a real (anonymized) demo-led README next
       to an evidence-led one and let the class feel which one they'd hire. This closes the loop the
       whole course has been drawing: the eval evidence is not homework, it is the product you sell.`
    )}

    <h2>What you can now do</h2>

    <p>Step back and look at where you started. Three courses ago, a language model was magic. Two
    courses ago, you learned the ideas behind it. And in this one you became the thing those ideas
    were building toward: someone who can <strong>engineer a reliable system on top of a model they
    didn't train and can't fully predict.</strong> Concretely, you can now:</p>
    <ul>
      <li>Call the Claude API and reason about <strong>tokens, cost, sampling, and
        non-determinism</strong> instead of being surprised by them.</li>
      <li>Get <strong>structured, reliable output</strong> from a probabilistic model.</li>
      <li>Build an <strong>eval</strong> — the spine of everything — and answer &ldquo;is it actually
        better?&rdquo; with real statistics: precision and recall, an LLM judge you validated, and
        <strong>confidence intervals</strong> instead of vibes.</li>
      <li>Do <strong>prompt engineering as measured engineering</strong>, and give a model
        <strong>tools, retrieval, and agency</strong> — and evaluate each of those honestly.</li>
      <li>Make a system <strong>production-grade</strong>: observable, affordable, reliable, and
        guarded.</li>
      <li>And <strong>deploy</strong> it so changes are versioned, gated by an automatic eval, watched
        for drift, and rolled out safely — able to prove, at every step, that it works.</li>
    </ul>

    <p>If there's one idea to carry out the door, it's this. Engineering on a non-deterministic model
    is not about never being wrong — the model <em>will</em> surprise you, forever. It's about making
    being wrong <strong>small, visible, and reversible</strong>, and about <strong>proving your
    claims</strong> instead of asserting them. A demo says &ldquo;look what it did once.&rdquo; An
    engineer says &ldquo;here's how well it does, here's how I know, and here's what happens when it
    doesn't.&rdquo; You can say the second thing now. That's the job — go do it.</p>
  `,

  onMount(root) {
    /* ---- Weak-vs-strong README toggle ---- */
    const READMES = {
      weak: {
        lines: [
          "# SupportBot 🤖✨",
          "",
          "An AI-powered customer support assistant, built with Claude!",
          "It can answer ANY question about your orders instantly. 🚀",
          "",
          "## Features",
          "- Super smart AI answers",
          "- Fast and easy to use",
          "- Powered by cutting-edge LLMs",
          "",
          "## Demo",
          "Just run it and ask anything!",
        ],
        note: "What a hiring engineer sees: enthusiasm, zero evidence. No idea if it works, how well, or how they'd know. Reads as a weekend toy. Next repo, please.",
        cls: "weak",
      },
      strong: {
        lines: [
          "# Support Assistant — retrieval-grounded, evaluated",
          "",
          "## Results (n=200, held-out)",
          "- Task success: 91%  (95% CI: 86–94%)",
          "- Groundedness: 96% of answers fully supported by sources",
          "- Cost: 0.0009 / request   ·   p95 latency: 1.8s",
          "",
          "## How I measured it",
          "Labeled eval set + a kappa-validated judge (k=0.81).",
          "v2 to v3 added a grounding rule: +8 pts, CI excludes 0.",
          "",
          "## Architecture · Production · Limitations",
          "Retrieval tool + input/output guardrails; traced; a CI",
          "eval gate blocks regressions. Weak on multi-part questions",
          "(next: query decomposition).",
        ],
        note: "What a hiring engineer sees: this person measures, reports uncertainty, gated a real improvement, hardened it, and is honest about limits. That is the job. Interview them.",
        cls: "strong",
      },
    };
    const tabs = Array.prototype.slice.call(root.querySelectorAll(".pf-tab"));
    const readmeEl = root.querySelector("#pf-readme");
    const noteEl = root.querySelector("#pf-note");
    function esc(s) { return s.replace(/&/g, "&amp;").replace(/</g, "&lt;"); }
    function renderReadme(v) {
      const r = READMES[v];
      readmeEl.className = "pf-readme " + r.cls;
      readmeEl.innerHTML = r.lines.map((l) => `<div class="pf-line">${esc(l) || "&nbsp;"}</div>`).join("");
      noteEl.className = "pf-note " + r.cls;
      noteEl.innerHTML = r.note;
      tabs.forEach((t) => t.classList.toggle("active-mode", t.dataset.v === v));
    }
    tabs.forEach((t) => t.addEventListener("click", () => renderReadme(t.dataset.v)));
    if (readmeEl) renderReadme("weak");

    /* ---- Portfolio-readiness checklist ---- */
    const boxes = Array.prototype.slice.call(root.querySelectorAll("#pf-sc [data-sc]"));
    const verdictEl = root.querySelector("#pf-verdict");
    function score() {
      const n = boxes.filter((b) => b.checked).length;
      let cls, msg;
      if (n >= 5) { cls = "real"; msg = "Hireable. A stranger learns what it does, how good it is, and how you know — in under two minutes. Put it at the top of your resume."; }
      else if (n >= 3) { cls = "inconc"; msg = "Getting there. The unchecked items are the ones a hiring engineer weighs most — evidence and honesty. Close them."; }
      else { cls = "worse"; msg = "This reads as a demo, not a portfolio piece. The work may be great; right now the evidence of it isn't visible."; }
      verdictEl.className = "sc-verdict " + cls;
      verdictEl.innerHTML = "<strong>" + n + " of 6</strong> — " + msg;
    }
    boxes.forEach((b) => b.addEventListener("change", score));
    if (verdictEl) score();
  },
};
