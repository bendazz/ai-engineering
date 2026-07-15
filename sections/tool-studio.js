/* ============================================================
   Section: Studio — a tool-using assistant  (STUDIO) — caps Block 5
   (course section 25). Teams build an assistant with 2-3 tools (incl.
   retrieval over a small corpus), then EVALUATE it (tool-call
   correctness + groundedness + recall@k, with CIs) and red-team.
   Studio pattern: scenario switcher A/B/C + build rules + red-team
   scorecard + deliverables + "this is the job".
   Reuses the .scn- and .sc- and .scorecard CSS from eval-studio.
   Heavy instructor scaffolding, all HIDDEN via Toolkit.instructorNote.

   NOTE (playbook): studio = brief; ends "this is the job". No literal
   dollar signs; no backtick chars in prose; no star-slash in comments; curly
   quotes literal.
   ============================================================ */

window.SectionContent["tool-studio"] = {
  title: "Studio: a tool-using assistant",

  html: `
    <div class="eyebrow">Tool Use · Section 28 · Studio</div>
    <h1>Studio: a tool-using assistant</h1>

    <p>Time to put the whole block together. Your team builds a small assistant that can
    <strong>call tools</strong> — including a retrieval tool over a real corpus — and then
    does the thing that makes it engineering: <strong>measures it.</strong> Tool-call
    correctness, groundedness, and whether retrieval even surfaces the right passage. A
    working demo is the easy part; the deliverable is the demo <em>plus the evidence it
    works.</em></p>

    <p>Teams of three or four. Pick a brief:</p>

    ${Toolkit.widget(
      "Studio briefs",
      `<div class="scn-tabs">
         <button class="btn ghost scn-tab active-mode" data-s="A">A · Help-center bot</button>
         <button class="btn ghost scn-tab" data-s="B">B · Travel planner</button>
         <button class="btn ghost scn-tab" data-s="C">C · Study assistant</button>
       </div>
       <div class="scn-card" id="ts-card"></div>`
    )}

    <h2>Build rules</h2>
    <ul>
      <li><strong>Two or three tools</strong>, one of which is <code>search_docs</code> over
        a small corpus you assemble (a dozen or so passages). Manual loop or the tool
        runner — your call.</li>
      <li><strong>Write clear tool descriptions.</strong> Remember the description is how the
        model decides <em>when</em> to call — be prescriptive about the trigger.</li>
      <li><strong>Include a must-not-call path.</strong> At least one tool should have a
        clear &ldquo;don't use me for this&rdquo; boundary you can test.</li>
    </ul>

    <h2>Evaluate it (this is the point)</h2>
    <ul>
      <li><strong>Tool-call correctness</strong> — a dataset of inputs with the expected tool
        (or <code>None</code>) and arguments; score tool selection and args. Include cases
        where calling a tool would be <em>wrong</em>.</li>
      <li><strong>Groundedness</strong> — for the retrieval answers, a rubric-based judge
        (validated against a few human labels with kappa) scoring whether each answer sticks
        to its sources.</li>
      <li><strong>recall@k</strong> — for questions whose answer is in your corpus, does the
        needed passage show up in the top <em>k</em>? This tells you if a wrong answer is a
        retrieval miss or a generation problem.</li>
      <li><strong>Report with confidence intervals.</strong> Bare numbers don't count.</li>
    </ul>

    <h2>Red-team round</h2>
    <p>Swap with another team and audit their <strong>evidence</strong>, not their demo:</p>

    ${Toolkit.widget(
      "Tool-and-grounding scorecard",
      `<div class="scorecard" id="ts-sc">
         <label class="sc-item"><input type="checkbox" data-sc> The tool-eval set includes <strong>must-not-call</strong> cases, not just happy-path calls.</label>
         <label class="sc-item"><input type="checkbox" data-sc> <strong>Tool selection and arguments</strong> are scored — not just "it worked once in the demo".</label>
         <label class="sc-item"><input type="checkbox" data-sc> <strong>Groundedness</strong> is measured by a rubric judge, validated (kappa) against human labels.</label>
         <label class="sc-item"><input type="checkbox" data-sc> <strong>recall@k</strong> is checked, so retrieval misses and hallucinations are told apart.</label>
         <label class="sc-item"><input type="checkbox" data-sc> Numbers are reported <strong>with confidence intervals</strong>.</label>
         <label class="sc-item"><input type="checkbox" data-sc> At least one failure is <strong>diagnosed</strong> (retrieval miss vs ungrounded generation), not just noted.</label>
       </div>
       <div class="sc-verdict" id="ts-verdict"></div>`
    )}

    <h2>Deliverables</h2>
    <ul class="checklist">
      <li><input type="checkbox" id="t1"><label for="t1">The assistant: its tools (with descriptions) and the loop.</label></li>
      <li><input type="checkbox" id="t2"><label for="t2">A tool-call-correctness eval — including must-not-call cases — with the score and a CI.</label></li>
      <li><input type="checkbox" id="t3"><label for="t3">A groundedness check on the retrieval answers, plus recall@k on the corpus.</label></li>
      <li><input type="checkbox" id="t4"><label for="t4">One diagnosed failure: was it a retrieval miss or an ungrounded answer, and what would you fix?</label></li>
    </ul>

    ${Toolkit.instructorNote(
      `<strong>Facilitation (~50-75 min; consider a double block).</strong> 10 pick brief +
       assemble the corpus · 20 build tools + loop (the tool runner saves time here; let them
       use it) · 20 build the two evals — this is where the learning is, and where they'll
       want to skip · 10 red-team swap · 10 debrief. If time is tight, the corpus can be
       tiny (10 passages) and the eval sets small; a small honest eval beats a big demo.`
    )}

    ${Toolkit.instructorNote(
      `<strong>Answer key — a strong Scenario A.</strong> Tools: <code>search_docs</code> over
       ~12 help-center passages + a <code>calculator</code> (for order totals/tax). Tool-eval:
       policy questions → expect search_docs; a math question → expect calculator; a greeting
       and an off-topic question → expect <em>no</em> tool. Groundedness set: ~15 policy
       questions, judge each answer against the retrieved passages; also compute recall@k by
       checking whether the gold passage was retrieved. A team that shows a slick demo but
       reports no groundedness number, or never tests a must-not-call case, has missed the
       block — that gap is the teachable moment.`
    )}

    ${Toolkit.instructorNote(
      `<strong>Grade the evidence, 0/1/2 each:</strong> (1) Tools — sensible tools with
       trigger-prescriptive descriptions and a must-not-call boundary. (2) Tool eval —
       selection + args scored, must-not-call included. (3) Grounding — groundedness measured
       with a validated judge AND recall@k, so misses vs hallucinations are separable. (4)
       Rigor — CIs, and one real diagnosed failure. 8/8 is an assistant whose quality you
       could actually vouch for. Failure modes to name: demo-instead-of-eval, no must-not-call
       case, conflating retrieval misses with hallucinations, bare numbers.`
    )}

    <h2>This is the job</h2>
    <p>Anyone can wire a model to a search box and get a convincing demo in an afternoon. What
    a team pays you for is the next part: knowing whether it calls the right tools, whether its
    answers are actually grounded in your data, and — when it's wrong — <em>which half broke.</em>
    That's the difference between a demo that impresses a meeting and a system a business can
    put in front of its customers. Build the second one.</p>
  `,

  onMount(root) {
    /* ---- Scenario switcher ---- */
    const SCN = {
      A: {
        name: "Help-center assistant",
        tools: "search_docs (over ~12 help-center passages) + calculator (order totals, tax).",
        eval: "Tool-selection: policy Qs → search_docs, a math Q → calculator, a greeting/off-topic Q → NO tool. Groundedness on the policy answers + recall@k on the corpus.",
        watch: "The must-not-call case (don't search for 'hi'), and answers that drift past the retrieved policy text.",
      },
      B: {
        name: "Travel planner",
        tools: "search_docs (destination facts) + calculator (budget/currency) + a STUB book_trip tool (just records the request).",
        eval: "book_trip must be called ONLY when the user actually asks to book — never on a fact question. Groundedness of the destination facts against the sources.",
        watch: "The model booking when it should only inform (a costly false action), and invented 'facts' not in the corpus.",
      },
      C: {
        name: "Study assistant",
        tools: "search_docs (over the course notes) + calculator.",
        eval: "It should SEARCH the notes rather than answer factual course questions from memory. Groundedness against the notes + recall@k.",
        watch: "Confident answers from the model's own memory when it should have retrieved — measure how often it skips the search it needed.",
      },
    };
    const cardEl = root.querySelector("#ts-card");
    const tabs = Array.prototype.slice.call(root.querySelectorAll(".scn-tab"));
    function renderScenario(key) {
      const s = SCN[key];
      if (!cardEl) return;
      cardEl.innerHTML =
        `<div class="scn-name">${s.name}</div>
         <div class="scn-kind">Tools: ${s.tools}</div>
         <p class="scn-mission"><strong>Evaluate:</strong> ${s.eval}</p>
         <div class="scn-metrics"><strong>Red-team will watch for:</strong> ${s.watch}</div>`;
      tabs.forEach((t) => t.classList.toggle("active-mode", t.dataset.s === key));
    }
    tabs.forEach((t) => t.addEventListener("click", () => renderScenario(t.dataset.s)));
    renderScenario("A");

    /* ---- Scorecard ---- */
    const boxes = Array.prototype.slice.call(root.querySelectorAll("#ts-sc [data-sc]"));
    const verdictEl = root.querySelector("#ts-verdict");
    function score() {
      const n = boxes.filter((b) => b.checked).length;
      let cls, msg;
      if (n >= 5) { cls = "real"; msg = "Real evidence — you'd trust this assistant's quality claims and could hand it to a business."; }
      else if (n >= 3) { cls = "inconc"; msg = "Partly evidenced. The unchecked items are where a confident-looking bot could still be quietly wrong."; }
      else { cls = "worse"; msg = "This is a demo, not a measured system — impressive in a meeting, unproven in production."; }
      verdictEl.className = "sc-verdict " + cls;
      verdictEl.innerHTML = "<strong>" + n + " of 6</strong> — " + msg;
    }
    boxes.forEach((b) => b.addEventListener("change", score));
    score();
  },
};
