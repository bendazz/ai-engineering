/* ============================================================
   Section: Studio — iterate a prompt to a target  (STUDIO) — caps
   Block 4, course section 20. Teams take a WEAK starter prompt + an
   eval + a target metric and run the measured loop to hit it — the
   deliverable is the DOCUMENTED loop (change / eval delta / kept),
   not just a better prompt. Red-team for overfitting.
   Studio pattern: scenario switcher (A/B/C) + loop rules + red-team
   scorecard + deliverables + "this is the job".
   Reuses the .scn-, .sc-, and .scorecard CSS from eval-studio.
   Heavy instructor scaffolding, all HIDDEN via Toolkit.instructorNote.

   NOTE (playbook): studio = brief; ends "this is the job". No literal
   dollar signs; no backtick chars in prose; curly quotes literal.
   ============================================================ */

window.SectionContent["prompt-studio"] = {
  title: "Studio: iterate a prompt to a target",

  html: `
    <div class="eyebrow">Prompt Engineering · Section 23 · Studio</div>
    <h1>Studio: iterate a prompt to a target</h1>

    <p>You've got the loop; now run it under pressure. Each brief hands your team a
    deliberately <strong>weak</strong> starter prompt, a labeled eval, and a
    <strong>target</strong> to reach. Your job is to close the gap — but the thing you
    turn in is not just a better prompt. It's the <strong>documented loop</strong>: what
    you changed, what the eval said each time, and what you kept. In a real team, that
    trail <em>is</em> the work.</p>

    <p>Teams of three or four. Pick a brief:</p>

    ${Toolkit.widget(
      "Studio briefs",
      `<div class="scn-tabs">
         <button class="btn ghost scn-tab active-mode" data-s="A">A · Sentiment</button>
         <button class="btn ghost scn-tab" data-s="B">B · Urgent-ticket flag</button>
         <button class="btn ghost scn-tab" data-s="C">C · Meeting summary</button>
       </div>
       <div class="scn-card" id="ps-card"></div>`
    )}

    <h2>The rules of the loop (non-negotiable)</h2>
    <ul>
      <li><strong>One change per round.</strong> One hypothesis, one edit, then re-run.</li>
      <li><strong>Gate on the CI.</strong> Keep a change only if the confidence interval on
        the improvement clears zero; otherwise revert it.</li>
      <li><strong>Version every prompt.</strong> Each round is a committed file with a note:
        what you changed and what it did to the eval.</li>
      <li><strong>Hold out a test set.</strong> Set aside examples you never iterate against,
        and check the final prompt on them <em>once</em>, at the end. That number is the one
        you report.</li>
    </ul>

    <h2>Red-team round</h2>

    <p>Swap with another team. Don't judge their prompt — audit their <strong>process</strong>,
    because a good number reached by a sloppy loop won't survive. Score what you receive:</p>

    ${Toolkit.widget(
      "Loop-discipline scorecard",
      `<div class="scorecard" id="ps-sc">
         <label class="sc-item"><input type="checkbox" data-sc> The reported gain comes with a <strong>CI on the difference</strong>, not a bare number.</label>
         <label class="sc-item"><input type="checkbox" data-sc> Changes were made <strong>one at a time</strong>, with a version log you can read.</label>
         <label class="sc-item"><input type="checkbox" data-sc> The prompt lives in a <strong>file / template</strong>, not pasted inline in code.</label>
         <label class="sc-item"><input type="checkbox" data-sc> The final number was confirmed on a <strong>held-out set</strong> not used while iterating.</label>
         <label class="sc-item"><input type="checkbox" data-sc> The <strong>target metric fits the task's cost</strong> (e.g. recall for the urgent flag, not accuracy).</label>
         <label class="sc-item"><input type="checkbox" data-sc> Any few-shot examples are <strong>not</strong> drawn from the test set (no leakage).</label>
       </div>
       <div class="sc-verdict" id="ps-verdict"></div>`
    )}

    <h2>Deliverables</h2>
    <ul class="checklist">
      <li><input type="checkbox" id="p1"><label for="p1">The starting prompt and the final prompt (a diff).</label></li>
      <li><input type="checkbox" id="p2"><label for="p2">A version log: each change, its eval result with a CI, and kept/reverted.</label></li>
      <li><input type="checkbox" id="p3"><label for="p3">The final metric on the dev set <em>and</em> on the held-out set.</label></li>
      <li><input type="checkbox" id="p4"><label for="p4">One paragraph: which ingredient helped most, and what it cost (tokens/latency).</label></li>
    </ul>

    ${Toolkit.instructorNote(
      `<strong>Facilitation (~50 min).</strong> 5 pick brief + split each team's data into
       dev/held-out · 10 run the baseline and read the failures out loud · 20 iterate
       (walk the room enforcing ONE change per round — this is where they'll cheat) · 10
       held-out check + red-team swap · 5 debrief. The single most common violation is
       bundling changes; when you catch it, make them undo two of the three edits and
       re-run — the teachable moment is worth the interruption.`
    )}

    ${Toolkit.instructorNote(
      `<strong>Setting targets.</strong> Pick a target that is reachable in ~4-6 disciplined
       rounds from the weak baseline, and phrase it as a CI-real improvement, not a magic
       number: &ldquo;beat the baseline by an interval that clears zero on the held-out
       set.&rdquo; That framing rewards honest measurement over a lucky run. For Scenario B,
       insist the target is <em>recall</em> on urgent (with a precision floor), so they can't
       game it by flagging everything.`
    )}

    ${Toolkit.instructorNote(
      `<strong>Grade the process, 0/1/2 each:</strong> (1) Disciplined loop — one change per
       round with a version log. (2) CI-gated decisions — kept/reverted on the interval, not
       the point. (3) Held-out honesty — reported the held-out number even if lower than dev.
       (4) Result — a real, CI-clear improvement toward the target. An 8/8 team has produced
       something a senior engineer would approve as a pull request; that is the bar.
       Failure modes to name in debrief: many-changes-at-once, chasing a noisy bump, no
       held-out, and optimizing the wrong metric.`
    )}

    <h2>This is the job</h2>
    <p>No one on a real team ships &ldquo;I made the prompt better, trust me.&rdquo; They ship
    a diff, the eval delta with its interval, and the held-out number that says it holds up —
    a change a senior engineer can review and approve. If you can hand that over, you're not
    tinkering with prompts anymore. You're doing the job.</p>
  `,

  onMount(root) {
    /* ---- Scenario switcher ---- */
    const SCN = {
      A: {
        name: "Sentiment classifier",
        target: "Accuracy at least 85% on the labeled set — and a held-out improvement whose CI clears zero.",
        starter: "Tell me if this review is good or bad: {review}",
        aim: "The weak prompt has no neutral category, no output format, and no escape hatch — so it forces neutrals into good/bad and mangles sarcasm. Likely wins: add the neutral label + an explicit format, add an escape hatch, then two hard few-shot examples.",
      },
      B: {
        name: "Urgent-ticket flag",
        target: "Recall on 'urgent' at least 0.90, with precision no worse than 0.60.",
        starter: "Is this support ticket urgent? {ticket}",
        aim: "The baseline misses calmly-worded outages (the costly false negatives). Likely wins: define what 'urgent' means, show a calm-but-urgent example, and add an escape-hatch-free explicit yes/no format. Watch precision so you don't just flag everything.",
      },
      C: {
        name: "Meeting summarizer",
        target: "LLM-judge score at least 1.6 / 2, with zero hallucinated action items.",
        starter: "Summarize this meeting: {transcript}",
        aim: "The baseline invents action items and misses implicit decisions. Likely wins: instruct it to list only decisions/actions actually stated, add an escape hatch ('if no decision was made, say so'), and give the judge an anchored rubric so 'good' is defined.",
      },
    };
    const cardEl = root.querySelector("#ps-card");
    const tabs = Array.prototype.slice.call(root.querySelectorAll(".scn-tab"));
    function renderScenario(key) {
      const s = SCN[key];
      if (!cardEl) return;
      cardEl.innerHTML =
        `<div class="scn-name">${s.name}</div>
         <div class="scn-kind">Target: ${s.target}</div>
         <div class="scn-starter">Starter prompt (weak):  ${s.starter}</div>
         <p class="scn-mission"><strong>Where it fails / aim here:</strong> ${s.aim}</p>`;
      tabs.forEach((t) => t.classList.toggle("active-mode", t.dataset.s === key));
    }
    tabs.forEach((t) => t.addEventListener("click", () => renderScenario(t.dataset.s)));
    renderScenario("A");

    /* ---- Loop-discipline scorecard ---- */
    const boxes = Array.prototype.slice.call(root.querySelectorAll("#ps-sc [data-sc]"));
    const verdictEl = root.querySelector("#ps-verdict");
    function score() {
      const n = boxes.filter((b) => b.checked).length;
      let cls, msg;
      if (n >= 5) { cls = "real"; msg = "A disciplined loop — this gain will hold up, and it's reviewable like a real pull request."; }
      else if (n >= 3) { cls = "inconc"; msg = "Some discipline, real gaps. The unchecked items are where the reported gain could quietly be noise or leakage."; }
      else { cls = "worse"; msg = "This is tinkering, not engineering — the number isn't trustworthy yet. Fix the process before believing the result."; }
      verdictEl.className = "sc-verdict " + cls;
      verdictEl.innerHTML = "<strong>" + n + " of 6</strong> — " + msg;
    }
    boxes.forEach((b) => b.addEventListener("change", score));
    score();
  },
};
