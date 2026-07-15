/* ============================================================
   Section: Undoing a commit  (LAB)
   Setup block, section 7. The COMPANION to getting-back-to-working:
   that lab handled the NON-destructive, mostly-uncommitted cases
   (restore / checkout / switch). This one handles the third branch
   of that decision procedure: "I committed a change, it was wrong,
   undo it for good." Two tools, one gate:
     - git revert <hash> : append a NEW commit that is the inverse of
       a bad one. History is preserved (never rewritten). SAFE on
       shared/pushed history — the reason this section sits AFTER
       GitHub, so "shared history" is already real to the student.
     - git reset [--soft|--mixed|--hard] <ref> : move the branch
       pointer backwards. REWRITES history. Fine for local commits
       nobody has seen; a divergence trap once pushed. --hard is the
       one that also discards your files (the losing-work move here).
   The organizing question is exactly one: "did you push it yet?"
   Star interactive: a REVERT-vs-RESET visualizer on a 3-commit
   history whose tip is a bad commit, with a "did you push it?"
   toggle that shows an origin/main marker. Revert -> history grows,
   safe to push either way. Reset -> pointer moves back; if the bad
   commit was pushed, local and origin DIVERGE (force-push trap);
   if not, it is a clean private cleanup.
   Reuses existing git CSS: .git-commit/.gc-*, .tm-timeline/.tm-chip,
   .tm-note(.attached/.detached), .git-status*, .git-file(.red/.green),
   .gs-cap/.nd-cap/.controls/.btn/.steps/.checklist. Adds only three
   tiny rules to styles.css: .tm-note.danger, .gc-origin,
   .git-commit.ghost.
   NOTE: KaTeX-free (no literal dollar signs); no backtick chars in
   prose; every literal < or > in the html string is &lt; &gt; (raw
   < in onMount JS is fine). Keep the block-comment terminator out of
   prose, or it closes this comment early.
   ============================================================ */

window.SectionContent["undoing-a-commit"] = {
  title: "Undoing a commit",

  html: `
    <div class="eyebrow">Setup &amp; First Contact · Section 7 · Lab</div>
    <h1>Undoing a commit</h1>

    <p>Last lab you learned to get back to a working version when the damage was
    still <em>uncommitted</em> — throw away a mess with <code>git restore</code>, or
    time-travel to an old snapshot with <code>git checkout</code>. We deliberately
    left one branch of that decision procedure for today: <em>"I already committed the
    change, I've decided it was wrong, and I want it undone for good."</em> The bad
    version is now part of your history. This is where two commands come in —
    <code>git revert</code> and <code>git reset</code> — and where most beginners pick
    the wrong one and make things worse.</p>

    ${Toolkit.callout(
      `The good news carries straight over from last lab: <strong>every commit is still
       there, permanently.</strong> So "undoing a commit" is never about deleting the
       past. The whole choice is between two philosophies: <strong>revert</strong>,
       which undoes a change by <em>adding</em> a new commit that reverses it (your
       history keeps growing, honestly recording that you tried something and took it
       back), and <strong>reset</strong>, which undoes a change by <em>moving your
       branch pointer backwards</em> (your history is rewritten as if the commit never
       happened). One appends; one rewrites. That single difference decides everything.`,
      { type: "", label: "Two philosophies of undo" }
    )}

    <h2>The one question that chooses for you</h2>

    <p>You do not have to memorize a table. There is a single gate, and it is the same
    reason this lab comes right after you put your work on GitHub:</p>

    <p style="font-size:1.05rem"><strong>Has anyone else seen this commit yet — that is,
    did you already <code>push</code> it?</strong></p>

    <ul>
      <li><strong>Yes, it's pushed / shared</strong> — other people (or GitHub itself,
        or a future you on another machine) have this commit. You must <strong>not</strong>
        rewrite history out from under them. → Use <code>git revert</code>.</li>
      <li><strong>No, it only exists on your machine</strong> — nobody has ever seen it,
        so rewriting is harmless. Either tool works, and <code>git reset</code> gives you
        the cleanest result. → <code>git reset</code> is fine (and often nicer).</li>
    </ul>

    <p>When in doubt, <code>revert</code> is <em>never</em> the wrong answer — it is
    always safe. <code>reset</code> is the sharp tool you reach for only when you're sure
    the commit was private. Let's take them one at a time.</p>

    <h2>Case 1 — undo a commit safely: <code>git revert</code></h2>

    <p>You committed <code>c04aa8e</code>, it introduced a bug, and you may already have
    pushed it. You want the bug gone without pretending it never happened. That is one
    command, pointed at the commit you regret:</p>

    ${Toolkit.code("Terminal", "git revert c04aa8e")}

    <p>git computes the <em>inverse</em> of that commit — whatever it added, the inverse
    removes; whatever it removed, the inverse restores — and lands it as a
    <strong>brand-new commit</strong> on top of your history. (It opens an editor for the
    new commit's message; the default message is fine — save and close, or add
    <code>--no-edit</code> to skip it.) Afterwards <code>git log</code> shows
    <em>both</em> the bad commit and the revert sitting above it. Nothing was erased; the
    net effect on your files is that the bad change is gone.</p>

    ${Toolkit.callout(
      `For the mathematician in you: <code>revert</code> applies the <strong>inverse
       operation</strong>. The bad commit and its revert compose to the identity on your
       files, but the <em>path</em> — the audit trail — is preserved. That is exactly why
       it is safe to share: everyone who already had <code>c04aa8e</code> can simply pull
       one more commit on top and end up in the same clean state as you. No one's history
       has to change; it only grows.`,
      { type: "ai", label: "Why revert is share-safe" }
    )}

    <h2>Case 2 — rewrite history: <code>git reset</code></h2>

    <p>Sometimes the commit was never shared — a half-baked experiment you committed and
    immediately regretted, still sitting only on your laptop. Here you can do something
    cleaner than leaving a bad-commit-plus-revert pair in the log: you can move your
    branch pointer backwards so the commit is simply <em>gone</em> from the branch. That
    is <code>git reset</code>:</p>

    ${Toolkit.code("Terminal", "git reset --soft HEAD~1")}

    <p><code>HEAD~1</code> means "one commit before where I am now," so this moves
    <code>main</code> back by one, un-committing the top commit. What happens to the
    <em>changes</em> from that commit depends on the flag — this is the part everyone
    gets confused about, so here is the whole story:</p>

    <ul>
      <li><strong><code>--soft</code></strong> — undo the commit, keep its changes
        <em>staged</em>. Perfect for "I committed too early; let me add more and
        re-commit."</li>
      <li><strong><code>--mixed</code></strong> (the default if you write no flag) — undo
        the commit, keep its changes in your working directory but <em>unstaged</em>.</li>
      <li><strong><code>--hard</code></strong> — undo the commit <em>and throw the changes
        away entirely</em>. Your files snap back as if the commit never existed.</li>
    </ul>

    ${Toolkit.callout(
      `<code>git reset --hard</code> is the second place in this whole setup block where
       you can genuinely <strong>lose work</strong> (the first was <code>git restore</code>
       last lab). <code>--soft</code> and <code>--mixed</code> keep your changes; only
       <code>--hard</code> discards them. Reach for <code>--hard</code> only when you are
       certain the work is junk — and never on a commit you've pushed.`,
      { type: "warn", label: "The move that can lose work" }
    )}

    <h2>Why the "did you push it?" gate is the whole game</h2>

    <p>Reset rewrites history, and rewriting history you've already shared is where people
    get burned. Picture it: you pushed <code>c04aa8e</code> to GitHub, so
    <code>origin/main</code> points at it. Then you <code>reset</code> your local
    <code>main</code> back one commit. Now your machine and GitHub disagree about what the
    latest commit is — your branch has <strong>diverged</strong> from the shared one. To
    make GitHub match, you'd have to <em>force</em>-push, overwriting the commit on the
    server — and anyone who already pulled <code>c04aa8e</code> is now out of sync in a way
    that is genuinely painful to untangle.</p>

    <p><code>revert</code> sidesteps all of it: because it only adds a commit, a plain
    <code>git push</code> works and everyone stays in sync. Play with both paths below —
    flip whether the bad commit was pushed, then try each undo and watch what happens to
    the shared <code>origin/main</code> marker.</p>

    ${Toolkit.widget(
      "Revert vs. reset: watch the history",
      `<div class="tm-timeline" id="rr-line"></div>
       <div class="tm-detached"><div class="tm-note" id="rr-note"></div></div>
       <div class="git-status-wrap">
         <div class="git-status-head" id="rr-file-head">Working directory · hello.py</div>
         <pre class="git-status" id="rr-file"></pre>
       </div>
       <div id="rr-runs"></div>
       <div class="gs-cap" id="rr-cap"></div>
       <div class="controls">
         <button class="btn ghost" id="rr-pushed">Did you push it? YES</button>
         <button class="btn" id="rr-revert">git revert c04aa8e</button>
         <button class="btn" id="rr-reset">git reset --hard HEAD~1</button>
         <button class="btn ghost" id="rr-again">Start over</button>
       </div>
       <div class="nd-cap">A model of the two undos on a 3-commit history whose tip
         (<code>c04aa8e</code>) is a bad commit. <strong>main</strong> is where your
         machine is; <strong>origin/main</strong> is what GitHub has. Revert grows the
         history; reset moves the pointer back.</div>`
    )}

    ${Toolkit.instructorNote(
      `The board line that makes it stick: <em>"revert adds the inverse; reset erases the
       record — and you may only erase what no one has read."</em> Demo it live on the
       class repo. Make a junk commit, push it, then <code>git revert HEAD</code> and show
       the class the log now has BOTH commits and that <code>git push</code> just works.
       Then contrast: make a second junk commit, do NOT push, <code>git reset --soft
       HEAD~1</code>, and show the change sitting back in staging — the commit gone, no
       force-push anywhere.<br><br>
       The escape hatch to keep in your back pocket (don't put it in the main flow, it
       scares more than it helps): a <code>reset --hard</code> does not instantly destroy
       the commit either — the commit object lingers in <code>git reflog</code> for about
       90 days, so <code>git reflog</code> then <code>git reset --hard &lt;that-hash&gt;</code>
       brings it back. What's gone for good is any edit that was <em>never committed</em>
       (last lab's lesson). So: committed-then-reset is usually recoverable; never-committed
       is not. Teach reflog only if a student panics.`
    )}

    <h2>Do it for real</h2>

    <p>Your <code>ai-engineering</code> repo is committed and pushed, which is exactly
    what you need to feel both cases. Open its terminal.</p>

    <h3>Part 1 — revert a committed change (the safe default)</h3>
    <ol class="steps">
      <li>Commit a mistake on purpose. Open <code>hello.py</code>, add a junk line like
        <code>this line is a bug</code>, save, then commit it:
        ${Toolkit.code("Terminal", "git add -A\ngit commit -m \"Break the greeting (on purpose)\"")}
      </li>
      <li>See it sitting at the top of your history:
        ${Toolkit.code("Terminal", "git log --oneline")}
      </li>
      <li>Undo it safely. This adds a new commit that reverses the last one
        (<code>HEAD</code> means "the commit I'm on"):
        ${Toolkit.code("Terminal", "git revert HEAD --no-edit")}
        Open <code>hello.py</code> — the junk line is gone. Run <code>git log --oneline</code>
        again: you now have <em>two</em> new lines, the break <strong>and</strong> its
        revert. Nothing was erased.
      </li>
      <li>Back it up. Because revert only added a commit, an ordinary push just works —
        no force, no divergence:
        ${Toolkit.code("Terminal", "git push")}
      </li>
    </ol>

    <h3>Part 2 — reset a local commit you haven't pushed</h3>
    <ol class="steps">
      <li>Make a throwaway commit and <strong>do not push it</strong>. Add any line to
        <code>hello.py</code>, save, then:
        ${Toolkit.code("Terminal", "git add -A\ngit commit -m \"WIP experiment\"")}
      </li>
      <li>Change your mind. Un-commit it but keep the change, so you could rework it —
        then look at <em>both</em> your history and your status:
        ${Toolkit.code("Terminal", "git reset --soft HEAD~1\ngit log --oneline\ngit status")}
        Notice the two things that happen at once, because this is exactly where people
        get disoriented. In <code>git log --oneline</code> the <code>WIP experiment</code>
        line is <strong>gone</strong> — the commit is off your branch. But
        <code>git status</code> shows your change is <strong>still there</strong>, sitting
        in staging: <code>--soft</code> rolled back only the branch pointer, not your
        files. So the <em>commit</em> left the branch while the <em>edit</em> stayed. You
        rewrote history — safely, because this commit never left your machine. (And even
        the commit isn't truly destroyed: git keeps it in the <code>reflog</code> for a
        while, so it's recoverable — it's simply no longer on your branch. "Off the branch"
        is not the same as "gone.")
      </li>
      <li>It was only junk, so discard the leftover change too and get fully clean
        (<code>restore</code> from last lab):
        ${Toolkit.code("Terminal", "git restore --staged hello.py\ngit restore hello.py")}
        Confirm: <code>git status</code> shows a clean tree, <code>git log --oneline</code>
        no longer lists the experiment, and because you never pushed it, GitHub never knew
        it existed.
      </li>
    </ol>

    ${Toolkit.problem(
      `Yesterday you pushed a commit that added a bug. This morning a teammate pulled your
       branch, so they already have that commit. You want the bug gone. Do you reach for
       <code>git revert</code> or <code>git reset</code> — and why?</p><p>(Predict, then
       reason it through.)`,
      `<strong><code>git revert</code>.</strong> The commit is <em>shared</em> — your
       teammate and GitHub both have it — so the "did you push it?" gate points straight at
       revert. Revert adds a new commit that undoes the bug; your teammate just pulls that
       one extra commit and ends up clean, no drama. <code>git reset</code> would move your
       local branch backwards and rewrite history, leaving your machine, GitHub, and your
       teammate all disagreeing about what the latest commit is. Fixing that means a
       force-push that clobbers the shared history and can wipe out or scramble your
       teammate's work. Rule of thumb: <em>shared history is append-only — undo it by
       adding, never by rewriting.</em>`,
      { label: "Predict: revert or reset?" }
    )}

    ${Toolkit.problem(
      `You run <code>git reset --hard HEAD~1</code> and then realize that commit had good
       work in it. Compare two situations: (a) the work was committed in that commit;
       (b) the work was only edits you'd made but never committed. In which case can you
       still get it back?`,
      `<strong>(a) is recoverable; (b) is gone.</strong> A <code>--hard</code> reset moves
       the branch pointer and throws away your working changes, but it does not immediately
       destroy the <em>commit object</em>: git keeps it referenced in the
       <code>git reflog</code> for around 90 days, so you can find its hash with
       <code>git reflog</code> and <code>git reset --hard &lt;that-hash&gt;</code> to bring
       the whole commit back. But an edit that was <em>never committed</em> was never
       snapshotted anywhere, so <code>--hard</code> overwriting it destroys it for good —
       the same sharp edge as <code>git restore</code> last lab. The lesson is the same one
       that keeps paying off: <strong>commit anything you might want, and you almost always
       have a way back.</strong>`,
      { label: "Predict: is --hard truly permanent?" }
    )}

    <h2>Undoing, checked</h2>

    <p>Confirm these before you stop:</p>

    <ul class="checklist">
      <li><input type="checkbox" id="u1"><label for="u1">I committed a change, then undid
        it with <code>git revert</code>, and saw <em>both</em> commits still in the log.</label></li>
      <li><input type="checkbox" id="u2"><label for="u2">I pushed the revert with a plain
        <code>git push</code> — no force needed.</label></li>
      <li><input type="checkbox" id="u3"><label for="u3">I made a local-only commit and
        removed it with <code>git reset --soft HEAD~1</code>, keeping the change.</label></li>
      <li><input type="checkbox" id="u4"><label for="u4">I can state the gate: <em>pushed →
        revert; local-only → reset</em>, and I know <code>--hard</code> is the one that
        discards files.</label></li>
    </ul>

    ${Toolkit.instructorNote(
      `Prerequisite check before the lab: everyone needs the pushed repo from last session.
       If someone never finished the GitHub push, Part 1's "a plain push just works" beat
       falls flat — have them publish first, or run Part 1 without the final push and just
       note that revert would push cleanly. Also warn the class off <code>--hard</code>
       during Part 2: we use <code>--soft</code> on purpose so nobody loses work; save
       <code>--hard</code> for the demo where you've shown the reflog rescue.`
    )}

    <h2>What you accomplished</h2>
    <ul>
      <li>You can undo a committed change two ways and know which to pick: <strong>revert
        adds an inverse commit</strong> (history preserved, safe to share) and
        <strong>reset moves the branch pointer back</strong> (history rewritten, local
        only).</li>
      <li>You know the single gate that decides: <em>did you push it? Pushed → revert;
        private → reset.</em></li>
      <li>You understand reset's three modes — <code>--soft</code> and <code>--mixed</code>
        keep your changes, <code>--hard</code> discards them — and that <code>--hard</code>
        is the losing-work move.</li>
      <li>You completed the recovery decision procedure from last lab: <em>uncommitted mess
        → restore; just looking → checkout then switch; a committed change to undo → revert
        (or reset if it never left your machine).</em></li>
    </ul>
  `,

  onMount(root) {
    /* ---- Revert-vs-reset visualizer -----------------------------------
       Honest model of both undos on a 3-commit history whose tip is bad.
       `main` = the student's local branch tip; `origin/main` = what GitHub
       has, positioned by the "pushed?" toggle. Revert appends an inverse
       commit (history grows; origin merely trails, so a normal push is
       clean). Reset moves main back one; if the bad commit was pushed,
       origin still points at it and the two DIVERGE (force-push trap); if
       not, main and origin agree again — a clean private cleanup.
       Illustrative (not the student's real file) — the nd-cap says so. ---- */
    const commits = [
      { hash: "7e3a1c0", msg: "Set up hello.py" },
      { hash: "b91f2d4", msg: "Add a greeting line" },
      { hash: "c04aa8e", msg: "Tidy up the greeting (oops)" },
    ];
    const REVERT = { hash: "a10bf6c", msg: 'Revert "Tidy up the greeting (oops)"' };

    const goodFile =
      'import sys\nprint("Python", sys.version.split()[0], "ready")\nprint("Hello from my workbench!")';
    const badFile =
      'import sys\nprint("Python" sys.version.split()[0] "ready")   # dropped the commas by mistake\nprint("Hello from my workbench!")';

    let mode = "base";   // base | revert | reset
    let pushed = true;    // did you push the bad commit c04aa8e?

    const lineEl   = root.querySelector("#rr-line");
    const noteEl   = root.querySelector("#rr-note");
    const fileHead = root.querySelector("#rr-file-head");
    const fileEl   = root.querySelector("#rr-file");
    const runsEl   = root.querySelector("#rr-runs");
    const capEl    = root.querySelector("#rr-cap");
    const pushBtn  = root.querySelector("#rr-pushed");
    const revertBtn= root.querySelector("#rr-revert");
    const resetBtn = root.querySelector("#rr-reset");
    const againBtn = root.querySelector("#rr-again");

    function chip(c, o) {
      let badges = "";
      if (o.head)   badges += '<span class="gc-head">main</span>';
      if (o.origin) badges += '<span class="gc-head gc-origin">origin/main</span>';
      return (
        '<div class="git-commit' + (o.head ? " head" : "") + (o.ghost ? " ghost" : "") + '">' +
          '<span class="gc-hash">' + c.hash + "</span>" +
          '<span class="gc-msg">' + c.msg + (o.bad ? "  ✗ broke hello.py" : "") + "</span>" +
          badges +
        "</div>"
      );
    }

    function render() {
      const originIdx = pushed ? 2 : 1; // GitHub has c04aa8e only if you pushed it

      if (mode === "reset") {
        // main moved back to b91f2d4; c04aa8e is a ghost (off the branch)
        lineEl.innerHTML = commits
          .map((c, i) => chip(c, { head: i === 1, origin: i === originIdx, bad: i === 2, ghost: i === 2 }))
          .join("");
      } else {
        const list = mode === "revert" ? commits.concat([REVERT]) : commits;
        lineEl.innerHTML = list
          .map((c, i) => chip(c, { head: i === list.length - 1, origin: i === originIdx, bad: i === 2 }))
          .join("");
      }

      const broken = mode === "base";
      fileEl.textContent = broken ? badFile : goodFile;
      runsEl.innerHTML = broken
        ? '<div class="git-file red"><div class="gf-name">python hello.py</div>' +
          '<div class="gf-tag">SyntaxError ✗ — the committed bug</div></div>'
        : '<div class="git-file green"><div class="gf-name">python hello.py</div>' +
          '<div class="gf-tag">runs cleanly ✓ — the bad change is undone</div></div>';

      let cls = "tm-note", note = "", cap = "";
      if (mode === "base") {
        cls += " detached";
        note = "You committed c04aa8e and it broke hello.py. It is in your history now — pick how to undo it." +
               (pushed ? " You have already pushed it to GitHub." : " You have not pushed it yet.");
        cap = "Try each undo. Toggle whether the bad commit was pushed and watch how much that changes the reset.";
      } else if (mode === "revert") {
        cls += " attached";
        note = "git revert added a NEW commit (a10bf6c) that is the exact inverse of c04aa8e. " +
               "The bug is gone from your files, and c04aa8e is still in history — nothing was rewritten. " +
               "A plain git push works whether or not you had shared it. ✓";
        cap = "History grew by one commit. origin/main just trails behind, so pushing is a clean fast-forward — no divergence, ever.";
      } else { // reset
        if (pushed) {
          cls += " danger";
          note = "git reset moved your LOCAL main back to b91f2d4 — but origin/main still points at c04aa8e on GitHub. " +
                 "Local and shared history have DIVERGED. Undoing it now needs a force-push that can clobber anyone who pulled. " +
                 "⚠ This is why reset is only for commits you have not shared.";
          cap = "See the split: main is on b91f2d4, origin/main is still on the ghosted c04aa8e. They disagree — that is a divergence.";
        } else {
          cls += " attached";
          note = "git reset moved main back to b91f2d4. The bad commit is gone from your branch, and since you never pushed it, " +
                 "nobody else ever had it — a clean, private cleanup. ✓";
          cap = "main and origin/main both sit on b91f2d4 — in sync. Rewriting was harmless because the commit was never shared.";
        }
      }
      noteEl.className = cls;
      noteEl.textContent = note;
      capEl.textContent = cap;

      pushBtn.textContent = pushed ? "Did you push it? YES" : "Did you push it? NO";
      revertBtn.disabled = mode !== "base";
      resetBtn.disabled = mode !== "base";
      againBtn.disabled = mode === "base";
    }

    pushBtn.addEventListener("click", () => { pushed = !pushed; render(); });
    revertBtn.addEventListener("click", () => { mode = "revert"; render(); });
    resetBtn.addEventListener("click", () => { mode = "reset"; render(); });
    againBtn.addEventListener("click", () => { mode = "base"; render(); });

    render();
  },
};
