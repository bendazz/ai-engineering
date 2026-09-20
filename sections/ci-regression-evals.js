/* ============================================================
   Section: CI regression evals  (LAB) — Block 8 section 3
   (course section 40). THE KEYSTONE: git/GitHub (Block 1) + the eval suite
   (Block 3) + prompt versioning (sec 39) converge into an automatic gate.
     - the problem: change a prompt to fix one thing, silently break three;
       manual eval-running gets skipped under deadline pressure
     - the solution: run the eval suite automatically in CI (GitHub Actions)
       on every PR; a regression turns the check RED and BLOCKS the merge
     - the gate is NOISE-AWARE (callback is-the-difference-real): fail on a
       MEANINGFUL drop or a MUST-PASS-case failure, not a one-sample wobble
     - honesty: live API calls in CI cost money + are non-deterministic ->
       small representative subset per-PR (noise-tolerant threshold), full
       suite on a schedule / pre-release
   LAB: predict-then-reveal; ends "What you accomplished".

   Star interactive: PR-gate simulator — incoming PRs (one improves, one
   trips a hidden must-pass case, one is a real regression, one is noise);
   the gate computes green-check (merge) vs red-X (blocked) with the reason.

   VERIFIED (source, 2026-07-02): current GitHub Actions majors are
   actions/checkout@v6 and actions/setup-python@v6 (v6 adds Node 24
   support; recommended as of June 2026). Actions free on public repos.

   NOTE (playbook): no literal dollar signs; no backtick chars in prose; no
   star-slash inside comments; NO literal backslash-n in Toolkit.code
   bodies; no raw less-than in html/code (use > / words); instructor notes
   hidden.
   ============================================================ */

window.SectionContent["ci-regression-evals"] = {
  title: "CI regression evals",

  html: `
    <div class="eyebrow">Deployment · Section 44 · Lab</div>
    <h1>CI regression evals</h1>

    <p>This is the section the whole course has been walking toward. Back in the setup block you
    learned git and GitHub even though it didn't feel like AI. The eval spine has run through every
    block since. Prompt versioning, last section, made every change trackable. Now they fuse into the
    single most important habit in professional AI engineering: <strong>every change is automatically
    checked against your eval suite before it's allowed to ship — and a regression cannot merge.</strong></p>

    <h2>The problem it solves</h2>

    <p>You change the prompt to fix one annoying case. Did you break three others you weren't looking
    at? You <em>could</em> re-run your whole eval suite by hand every time — but under a deadline, at
    5 p.m., you won't, and neither will anyone on your team. Discipline that depends on remembering is
    discipline that fails. So you take the human out of it: the machine runs the eval, every time,
    automatically, and refuses the change if it made things worse.</p>

    <h2>The gate: an eval that runs on every pull request</h2>

    <p><strong>Continuous integration</strong> (CI) means a server runs your checks automatically on
    every change. On GitHub that's <strong>GitHub Actions</strong> — free on public repos, which is
    exactly the free-tier setup you've been using. A tiny workflow file wires your eval into every
    pull request:</p>

    ${Toolkit.code(".github/workflows/regression-eval.yml", `name: regression-eval
on: pull_request                    # run on every proposed change
jobs:
  eval:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v6
      - uses: actions/setup-python@v6
        with:
          python-version: "3.12"
      - run: pip install -r requirements.txt
      - run: python eval_gate.py    # exits nonzero -> the check fails -> merge blocked
        env:
          ANTHROPIC_API_KEY: \${{ secrets.ANTHROPIC_API_KEY }}`)}

    <p>The magic is in the last line's exit code. If <code>eval_gate.py</code> exits nonzero, the
    GitHub check turns red, and with <strong>branch protection</strong> turned on (require this check
    to pass before merging), a red check <em>physically blocks the merge button.</em> You literally
    cannot merge a regression. The discipline is now enforced by the machine, not by willpower.</p>

    <h2>The gate has to be noise-aware</h2>

    <p>Here's where Block 3 comes back with teeth. Evals are <strong>noisy</strong> — run the same
    suite twice and the score wobbles a little just from sampling. If your gate fails on <em>any</em>
    drop, it'll block good changes over pure noise and everyone will start ignoring it. So the gate
    fails on two well-defined conditions instead:</p>

    ${Toolkit.code("eval_gate.py", `import sys

BASELINE = 0.88                              # the score to beat (from main)
MARGIN   = 0.03                              # tolerance for sampling noise
MUST_PASS = ["refund_out_of_policy", "block_injection"]   # never allowed to regress

score, results = run_eval(EVAL_SUBSET)       # a small representative subset

# 1) hard gate: specific cases that must ALWAYS pass
failed = [c for c in MUST_PASS if not results[c]]
if failed:
    print("BLOCKED - must-pass cases failed:", failed)
    sys.exit(1)

# 2) noise-aware gate: block only a MEANINGFUL drop, not a wobble
if BASELINE - score > MARGIN:
    print("BLOCKED - score", round(score, 3), "regressed from", BASELINE)
    sys.exit(1)

print("PASS - score", round(score, 3))
sys.exit(0)`)}

    <p>Two gates, two jobs. The <strong>must-pass</strong> list is your set of non-negotiables — the
    refund that must be refused, the injection that must be blocked — and any one of them failing
    blocks the merge outright, even if the average score looks fine. The <strong>margin</strong> lets
    ordinary noise through while still catching a real drop. Together they're strict about what
    matters and forgiving about what doesn't.</p>

    <p>Watch the gate judge a queue of pull requests:</p>

    ${Toolkit.widget(
      "Pull-request gate",
      `<div class="cg-baseline" id="cg-baseline"></div>
       <div class="cg-list" id="cg-list"></div>
       <div class="nd-cap">Each PR's decision is computed live from the same two rules as the code
         above (must-pass cases, then a noise margin against the baseline). Green merges; red is
         blocked, with the reason.</div>`
    )}

    <h2>The honest cost of evals in CI</h2>

    <p>One caveat a pro thinks about: a real eval makes <strong>live API calls</strong>, which cost
    money and aren't perfectly repeatable. Running your entire suite on every push would be slow,
    flaky, and expensive. The usual answer is a two-speed setup: a <strong>small, representative
    subset</strong> runs on every pull request (fast, cheap, and the noise margin absorbs the
    wobble), while the <strong>full suite</strong> runs on a schedule — nightly, or before a
    release. You gate cheaply on every change and measure thoroughly on a cadence.</p>

    ${Toolkit.problem(
      `A teammate's PR changes the prompt and the average eval score actually goes <em>up</em>, from
       0.88 to 0.90. But the CI check is red and won't let them merge. They're annoyed — how can a
       higher score be blocked? What most likely happened, and why is the gate right to block it?`,
      `<p>A <strong>must-pass case failed.</strong> The average score rising to 0.90 means the change
       helped on balance — but the two gates are independent, and the must-pass list is a hard floor
       that the average can't buy its way past. Almost certainly their reworded prompt improved a lot
       of ordinary cases while quietly breaking a non-negotiable one — say, it now fails to block a
       prompt injection, or approves a refund that's out of policy. Averaged in with everything else,
       that one catastrophic failure barely dents the mean, which is exactly why you <em>don't</em>
       rely on the average alone. The gate is right: a system that's 2% better on average but now
       leaks customer data on one input is not an improvement you can ship. This is the whole reason
       the must-pass gate exists separately from the score threshold — some failures are not
       averageable.</p>`,
      { label: "Predict: higher score, still blocked" }
    )}

    ${Toolkit.instructorNote(
      `This is the climax of the course — treat it that way. The emotional beat: everything they
       grumbled about (git, GitHub, writing eval suites, confidence intervals) was setup for THIS.
       Say it out loud: "a red eval check blocks the merge" is the single most hireable sentence in
       the field, and most working teams still don't do it well. Two ideas to hammer: (1) the gate
       must be noise-aware or it becomes the check everyone disables — tie it explicitly to
       is-the-difference-real (a drop within the margin is noise, not a regression); (2) must-pass
       cases are separate from the aggregate because some failures (safety, injection, out-of-policy
       actions) can never be averaged away. If you have a live repo, actually show a red X blocking a
       merge — it lands harder than any slide. The cost caveat (subset per-PR, full suite nightly) is
       where students learn that even the eval itself is an engineering tradeoff, not a free good.`
    )}

    <h2>What you accomplished</h2>
    <ul>
      <li>You wired your <strong>eval suite into CI</strong> (GitHub Actions on every pull request),
        so a regression turns the check red and <strong>branch protection blocks the merge</strong> —
        discipline enforced by the machine, not willpower.</li>
      <li>The gate is <strong>noise-aware</strong>: it blocks on a <strong>must-pass failure</strong>
        or a drop beyond a <strong>margin</strong> that absorbs sampling wobble (callback to
        <em>is-the-difference-real</em>).</li>
      <li>Some failures aren't averageable — <strong>must-pass cases</strong> are a hard floor the
        mean can't buy past.</li>
      <li>Evals in CI cost real money and aren't repeatable, so you gate on a <strong>small subset
        per PR</strong> and run the <strong>full suite on a schedule</strong>.</li>
    </ul>
  `,

  onMount(root) {
    /* ---- PR-gate simulator: real gate logic over scripted PRs ---- */
    const BASELINE = 0.88, MARGIN = 0.03;
    const PRS = [
      { num: 41, title: "shorten the refund prompt", score: 0.90, mustPass: { refund_out_of_policy: true, block_injection: true } },
      { num: 42, title: "reword system prompt for brevity", score: 0.90, mustPass: { refund_out_of_policy: true, block_injection: false } },
      { num: 43, title: "swap in new few-shot examples", score: 0.79, mustPass: { refund_out_of_policy: true, block_injection: true } },
      { num: 44, title: "fix a typo in a code comment", score: 0.875, mustPass: { refund_out_of_policy: true, block_injection: true } },
    ];
    const baseEl = root.querySelector("#cg-baseline");
    const listEl = root.querySelector("#cg-list");
    if (!listEl) return;

    baseEl.innerHTML = `baseline <strong>${BASELINE.toFixed(2)}</strong> · noise margin <strong>${MARGIN.toFixed(2)}</strong> · must-pass: <code>refund_out_of_policy</code>, <code>block_injection</code>`;

    function gate(pr) {
      const failed = Object.keys(pr.mustPass).filter((c) => !pr.mustPass[c]);
      if (failed.length) return { ok: false, reason: "must-pass case failed: " + failed.join(", ") };
      if (BASELINE - pr.score > MARGIN) return { ok: false, reason: "score " + pr.score.toFixed(3) + " regressed from " + BASELINE.toFixed(2) + " (beyond the " + MARGIN.toFixed(2) + " margin)" };
      const within = Math.abs(pr.score - BASELINE) <= MARGIN;
      return { ok: true, reason: pr.score > BASELINE + 0.0001 && !within ? "score improved to " + pr.score.toFixed(3) : "score " + pr.score.toFixed(3) + " is within noise of the baseline" };
    }
    listEl.innerHTML = PRS.map((pr) => {
      const g = gate(pr);
      return `<div class="cg-pr ${g.ok ? "pass" : "block"}">
           <div class="cg-pr-top">
             <span class="cg-check">${g.ok ? "✓" : "✗"}</span>
             <span class="cg-pr-num">PR #${pr.num}</span>
             <span class="cg-pr-title">${pr.title}</span>
             <span class="cg-pr-score">eval ${pr.score.toFixed(3)}</span>
           </div>
           <div class="cg-pr-verdict">${g.ok ? "MERGE ALLOWED" : "MERGE BLOCKED"} — ${g.reason}</div>
         </div>`;
    }).join("");
  },
};
