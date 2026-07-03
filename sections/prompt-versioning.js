/* ============================================================
   Section: Prompt versioning  (CONCEPT, light code) — Block 8 section 2
   (course section 39).
     - prompts are CODE that changes -> inline strings are unversioned
       landmines. Pull them into versioned files.
     - track in git (callback setup-git/github); log which prompt VERSION
       served each request (callback tracing-and-flywheel)
     - payoffs: reproducibility (which prompt made this output?), rollback
       (revert to a known-good version), prod A/B (serve v3 vs v4, compare)
     - a prompt registry: name -> version -> text
   Concept section: no inline problems; ends "What you learned".

   Star interactive: prompt-version timeline — versions with eval scores +
   which requests used which; a "roll back" control; because prompt_version
   is logged, a quality drop is attributable to a specific version.

   NOTE (playbook): no literal dollar signs; no backtick chars in prose; no
   star-slash inside comments; NO literal backslash-n in Toolkit.code
   bodies; no raw less-than in html/code; instructor notes hidden.
   ============================================================ */

window.SectionContent["prompt-versioning"] = {
  title: "Prompt versioning",

  html: `
    <div class="eyebrow">Deployment · Section 39</div>
    <h1>Prompt versioning</h1>

    <p>Your prompt is the single most-changed part of an LLM system — you tweak it constantly, and
    every tweak changes the behavior of the whole thing. Yet most people bury it as a string literal
    in the middle of their code, edit it in place, and keep no record. That's the equivalent of
    editing production code with no version control, and it costs you the moment something goes
    wrong: <em>which</em> prompt produced that bad answer last Tuesday? You have no idea, because you
    overwrote it. Prompts are code that changes — so you version them like code.</p>

    <h2>Prompts are files, not string literals</h2>

    <p>The whole discipline starts by pulling the prompt out of your code and into
    <strong>versioned files</strong>, loaded through a small registry:</p>

    ${Toolkit.code("prompts/registry.py", `# prompts/support_v1.txt, support_v2.txt, support_v3.txt ... on disk
from pathlib import Path

def load_prompt(name, version):
    return Path(f"prompts/{name}_{version}.txt").read_text()

ACTIVE = {"support": "v3"}          # which version is live right now

def support_prompt():
    return load_prompt("support", ACTIVE["support"])`)}

    <p>Now three things you couldn't do before fall into your lap — and each is really a callback to
    something you already built.</p>

    <h2>What versioning buys you</h2>
    <ul>
      <li><strong>History, via git.</strong> Because prompts are files, the git you set up in Block 1
        now tracks every change to every prompt — who changed it, when, and exactly what the diff
        was. Your prompt history is your git history, for free.</li>
      <li><strong>Reproducibility, via tracing.</strong> Log the <strong>prompt version</strong> on
        every request (your Block-7 trace already logs everything else). Now a bad answer in the logs
        carries the exact prompt that produced it — no guessing.</li>
      <li><strong>Rollback.</strong> A new prompt regressed something? Point <code>ACTIVE</code> back
        at the previous version and you've instantly reverted to known-good behavior, while you
        figure out what went wrong — no frantic re-editing under pressure.</li>
    </ul>

    <p>Add the version to the trace, and the loop closes:</p>

    ${Toolkit.code("versioned prompt in the trace", `record = {
    "id": response.id,
    "prompt_name": "support",
    "prompt_version": ACTIVE["support"],   # now every logged request is attributable
    "output": answer,
    # ... tokens, latency, cost from Block 7
}`)}

    <p>Explore a prompt's life over several versions — notice how logging the version lets you pin a
    quality change to the exact release that caused it, and roll back on the spot:</p>

    ${Toolkit.widget(
      "Prompt-version timeline",
      `<div class="pv-track" id="pv-track"></div>
       <div class="pv-detail" id="pv-detail"></div>
       <div class="pv-live" id="pv-live"></div>
       <div class="nd-cap">Eval scores are illustrative. The point is real: because each request logs
         its prompt version, a drop in production quality points straight at the version that shipped
         it — and rollback is one line.</div>`
    )}

    <h2>The habit</h2>

    <p>None of this needs a fancy tool — files, git, and one extra field in your trace. But the habit
    it builds is exactly how professional teams work: <strong>no prompt change is anonymous.</strong>
    Every version is recorded, every request knows which version served it, and any change can be
    undone in seconds. A prompt you can't name is a prompt you can't debug or defend.</p>

    ${Toolkit.instructorNote(
      `This is a short, high-leverage section that quietly pays off two earlier investments: the git
       block (which some students grumbled was not "AI") and tracing. The punchline to draw out:
       prompt versioning is the bridge between "I changed the prompt" and "I can prove which change
       helped" — and it's the precondition for the next section, where CI runs an eval on every
       prompt change automatically. If you want a vivid demo, show a git log of a prompts/ directory
       and a diff between two prompt versions; it makes "prompts are code" concrete. Emphasize the
       trace field: without prompt_version in the logs, the flywheel from Block 7 can't attribute a
       failure to a prompt, and rollback becomes archaeology. The whole idea is that a change to the
       prompt should leave the same paper trail as a change to the code, because it IS a change to
       the code.`
    )}

    <h2>What you learned</h2>
    <ul>
      <li>Prompts are <strong>code that changes</strong> — store them as <strong>versioned files</strong>
        loaded through a small registry, not as inline string literals.</li>
      <li>Versioning gives you <strong>git history</strong> (Block 1), <strong>reproducibility</strong>
        by logging <code>prompt_version</code> in the trace (Block 7), and instant <strong>rollback</strong>.</li>
      <li>Logging the version makes a production quality change <strong>attributable</strong> to the
        exact release that caused it.</li>
      <li>The habit: <strong>no prompt change is anonymous</strong> — recorded, attributable, and
        reversible, exactly like any code change.</li>
    </ul>
  `,

  onMount(root) {
    /* ---- Prompt-version timeline ---- */
    const VERSIONS = [
      { v: "v1", note: "first draft — terse, no grounding rule", score: 0.71, traffic: "launch", bad: false },
      { v: "v2", note: "added few-shot examples", score: 0.83, traffic: "weeks 2–5", bad: false },
      { v: "v3", note: "added 'always search the policy first'", score: 0.91, traffic: "weeks 6–9", bad: false },
      { v: "v4", note: "reworded for brevity — accidentally dropped the grounding rule", score: 0.79, traffic: "week 10 (rolled back)", bad: true },
    ];
    let live = 2;   // v3 is the known-good live version
    const trackEl = root.querySelector("#pv-track");
    const detailEl = root.querySelector("#pv-detail");
    const liveEl = root.querySelector("#pv-live");
    if (!trackEl) return;
    let sel = 3;   // start showing v4 (the regression)

    function render() {
      trackEl.innerHTML = VERSIONS.map((x, i) =>
        `<button class="pv-node ${i === sel ? "sel" : ""} ${x.bad ? "bad" : "good"} ${i === live ? "live" : ""}" data-i="${i}">
           <span class="pv-v">${x.v}</span>
           <span class="pv-score">${x.score.toFixed(2)}</span>
           ${i === live ? '<span class="pv-live-tag">live</span>' : ""}
         </button>` + (i < VERSIONS.length - 1 ? '<div class="pv-line"></div>' : "")).join("");
      Array.prototype.forEach.call(trackEl.querySelectorAll(".pv-node"), (b) =>
        b.addEventListener("click", () => { sel = +b.dataset.i; render(); }));
      const x = VERSIONS[sel];
      detailEl.innerHTML =
        `<div class="pv-d-head">${x.v} <span class="pv-d-score ${x.bad ? "bad" : "good"}">eval ${x.score.toFixed(2)}</span></div>
         <div class="pv-d-note">${x.note}</div>
         <div class="pv-d-traffic">served: ${x.traffic}</div>
         ${x.bad
           ? `<div class="pv-d-diag">Production success dropped the day v4 shipped. Because every request logged its <code>prompt_version</code>, the drop points straight at v4 — a reworded prompt that quietly dropped the grounding rule.
              ${sel === live ? "" : '<button class="btn pv-rollback">Roll back to ' + VERSIONS[live].v + '</button>'}</div>`
           : ""}`;
      const rb = detailEl.querySelector(".pv-rollback");
      if (rb) rb.addEventListener("click", () => { render(); flashLive(); });
      liveEl.innerHTML = `<span class="pv-live-k">live version</span> <strong>${VERSIONS[live].v}</strong> — <code>ACTIVE["support"] = "${VERSIONS[live].v}"</code>. One line reverts the regression while you investigate.`;
    }
    function flashLive() {
      liveEl.classList.add("pv-flash");
      // no timers needed; the message already reflects the known-good live version
    }
    render();
  },
};
