/* ============================================================
   Section: Rolling back further  (LAB)
   Setup block, section 8. The THIRD beat of the recovery arc, after
   getting-back-to-working (sec 5) and undoing-a-commit (sec 7). It
   scales the problem from "undo ONE commit" to "undo a whole STRETCH
   of commits" -- several days of work you've decided you don't want.
   The teaching point: it needs NO new rule. The same gate from sec 7
   ("did you push it?") decides, now applied to a RANGE.
   Framing that keeps main sacred (main is the trunk / GitHub default /
   PR target / Pages source, so it must never become the abandoned
   branch):
     - pushed/shared -> git revert --no-commit <good>..HEAD ; git commit
       (append the inverse of the whole range; main moves FORWARD to a
       clean state, stays canonical, pushes clean)
     - local-only    -> git branch <scrap> ; git reset --hard <good>
       (bookmark the tip you're LEAVING under a name, then move main
       BACK to the good commit; the branch names the scrap, never the
       keeper)
   Reconnaissance uses sec 5's checkout time-machine to scout the last
   good commit. Safety net: the bookmark branch + reflog make even a
   --hard reversible; nothing committed is ever truly lost.
   The hands-on drill runs entirely on a THROWAWAY branch so the
   student's real main is never touched -- modelling the very habit the
   section teaches.
   Star interactive: strategy switcher over a 6-commit history with a
   fixed rollback target -- revert-the-range vs bookmark-and-reset (with
   a pushed toggle showing divergence), main staying canonical in both.
   Reuses existing CSS only: .tm-timeline / .git-commit / .gc-* /
   .gc-origin / .git-commit.ghost, .tm-note(.attached/.detached/.danger),
   .gs-cap / .nd-cap / .controls / .btn / .steps / .checklist. NO new CSS.
   NOTE: KaTeX-free (no literal dollar signs); no backtick chars in
   prose; every literal < or > in the html string (and inside Toolkit.code
   arguments) is written &lt; &gt; -- raw < in onMount JS is fine. Keep the
   block-comment terminator out of prose, or it closes this comment early.
   ============================================================ */

window.SectionContent["rolling-back-further"] = {
  title: "Rolling back further",

  html: `
    <div class="eyebrow">Setup &amp; First Contact · Section 8 · Lab</div>
    <h1>Rolling back further</h1>

    <p>Last lab you undid a <em>single</em> committed change. But sometimes the regret is
    bigger: you look at the last few days of work — a refactor that went sideways, a
    direction you've soured on — and you want the project back the way it was
    <em>several commits ago</em>. This feels like a scarier, different problem. It isn't.
    It's the <strong>exact same problem as last lab, scaled from one commit to a
    range</strong> — and it needs no new rule, just the same gate you already know.</p>

    ${Toolkit.callout(
      `The reassurance still holds, and it's the reason none of this is dangerous:
       <strong>every commit you made along the way is still there.</strong> "Going back
       several days" is not reconstruction — the good version is a snapshot sitting in
       your history, and rolling back is just choosing to stand on it again. The only new
       wrinkle is that you're undoing <em>many</em> commits at once instead of one, and
       git has clean ways to do exactly that.`,
      { type: "", label: "Nothing is lost, still" }
    )}

    <h2>Step 0 — find the last good commit (reconnaissance)</h2>

    <p>Before you undo anything, you have to know <em>where</em> "good" is. This is where
    the time-machine from the getting-back lab earns its keep as a <em>scouting</em> tool.
    List your history, then visit candidates to confirm which snapshot still worked:</p>

    ${Toolkit.code("Terminal", "git log --oneline\ngit checkout &lt;a candidate hash&gt;")}

    <p>Run the code at that snapshot, poke around, and when you've found the last commit
    you're happy with, come back to the present with <code>git switch main</code> and note
    that commit's hash. Call it <strong>&lt;good&gt;</strong>. Everything below is about
    getting <code>main</code> back to <strong>&lt;good&gt;</strong>.</p>

    <h2>The same gate, at range: did you push it?</h2>

    <p>Here is the whole decision, unchanged from last lab — only now the "it" is a
    <em>stretch</em> of commits rather than one:</p>

    <ul>
      <li><strong>You already pushed the bad stretch</strong> — others (or GitHub) have
        those commits. Don't rewrite shared history. → <strong>Revert the range.</strong></li>
      <li><strong>The bad stretch is local-only</strong> — nobody has seen it. → You can
        safely <strong>reset <code>main</code> back</strong> (after bookmarking the
        scrap).</li>
    </ul>

    ${Toolkit.callout(
      `Whatever you do, one branch is <strong>sacred: <code>main</code></strong>. It's your
       trunk, it's what GitHub shows by default, it's what a pull request targets, it's
       what your site deploys from. So the goal is never "abandon <code>main</code> and go
       work somewhere else" — it's always "get <code>main</code> <em>itself</em> back to a
       good state." Keep that fixed and both recovery moves below fall out cleanly.`,
      { type: "note", label: "main stays canonical" }
    )}

    <h2>Case A — the stretch was pushed: revert the range</h2>

    <p>Same tool as last lab (<code>revert</code>), just aimed at many commits at once. This
    stages the inverse of <em>everything</em> since <strong>&lt;good&gt;</strong> and lands
    it as a single tidy commit:</p>

    ${Toolkit.code("Terminal", "git revert --no-commit &lt;good&gt;..HEAD\ngit commit -m \"Roll back the refactor\"")}

    <p>The range <code>&lt;good&gt;..HEAD</code> means "every commit <em>after</em>
    &lt;good&gt;, up to now" (&lt;good&gt; itself is excluded — it's the point you want to
    keep). <code>--no-commit</code> collects all those inversions without committing each
    one, so your single <code>git commit</code> writes <strong>one</strong> clean "roll
    back" commit whose contents match &lt;good&gt; exactly. History is preserved, and
    because you only <em>added</em> a commit, <code>main</code> is still a descendant of
    what GitHub has — a plain <code>git push</code> fast-forwards. <code>main</code> stayed
    canonical and moved <em>forward</em> into a clean state.</p>

    <h2>Case B — the stretch is local-only: bookmark, then reset <code>main</code> back</h2>

    <p>If nobody has seen those commits, you can do something cleaner than leaving a big
    revert in the log: move <code>main</code>'s pointer back to <strong>&lt;good&gt;</strong>
    so the stretch is simply gone from the branch. But first — and this is the move your
    intuition is reaching for — <strong>name the thing you're leaving</strong> so it's never
    lost:</p>

    ${Toolkit.code("Terminal", "git branch abandoned-refactor\ngit reset --hard &lt;good&gt;")}

    <p>Read those two lines carefully, because their <em>order</em> is the whole idea.
    <code>git branch abandoned-refactor</code> drops a <strong>label on your current
    (bad) tip</strong> — a branch is just a name pointing at a commit, so this costs
    nothing and saves everything. <em>Then</em> <code>git reset --hard &lt;good&gt;</code>
    slides <code>main</code> back to the good commit. Now <code>main</code> <em>is</em> the
    good line again (exactly as a trunk should be), and every regretted commit lives safely
    on <code>abandoned-refactor</code>, retrievable any time. The funny-named branch is the
    <em>scrap pile</em> — which is precisely where a throwaway name belongs. You never
    abandon <code>main</code>; you bookmark what you discard and bring <code>main</code>
    home.</p>

    ${Toolkit.callout(
      `<code>git reset --hard</code> also throws away any <em>uncommitted</em> edits in your
       working tree — the same sharp edge as always. That's why the <code>git branch</code>
       bookmark goes <strong>first</strong>: committed work on the label is safe, but unsaved
       edits are not. Habit worth keeping for any risky move: <em>bookmark a branch (or
       commit) before you reset.</em>`,
      { type: "warn", label: "Reset --hard still discards unsaved work" }
    )}

    <h2>See it both ways</h2>

    <p>Below is a six-commit history you've decided to roll back to its third commit. Try
    each strategy and watch what happens to <code>main</code>, to the shared
    <code>origin/main</code> marker, and to the commits you're leaving behind. Flip whether
    the bad stretch was pushed, and notice how much that changes the reset.</p>

    ${Toolkit.widget(
      "Rolling back a range: revert vs. bookmark-and-reset",
      `<div id="rb-view"></div>
       <div class="tm-detached"><div class="tm-note" id="rb-note"></div></div>
       <div class="gs-cap" id="rb-cap"></div>
       <div class="controls">
         <button class="btn ghost" id="rb-pushed">Did you push the bad stretch? YES</button>
         <button class="btn" id="rb-revert">Revert the range</button>
         <button class="btn" id="rb-reset">Bookmark &amp; reset main back</button>
         <button class="btn ghost" id="rb-again">Start over</button>
       </div>
       <div class="nd-cap">A model of rolling a 6-commit history back to
         <code>c3d4e5f</code> (the last good commit). <strong>main</strong> is your trunk;
         <strong>origin/main</strong> is what GitHub has. In both strategies main stays
         canonical — it either moves forward (revert) or back (reset); it never becomes the
         abandoned branch.</div>`
    )}

    ${Toolkit.instructorNote(
      `The reframe here fixes a real student confusion, so make it explicit on the board.
       The naive "just start a new branch and work there" leaves <code>main</code> as the
       junk you walked away from — backwards, and it quietly confuses people forever. The
       fix is one sentence: <em>"name the branch after what you're LEAVING, not what you're
       keeping; main always comes home."</em> Draw it: the <code>main</code> pointer slides
       back to the good commit while a labeled tag holds the discarded tail off to the side.
       <br><br>
       The board picture that makes the two cases obvious: a horizontal chain of commits.
       Pushed case — you can't move the shared part, so you <em>extend</em> it with an
       inverse (revert). Local case — nothing is shared, so you slide the <code>main</code>
       pointer back and let a bookmark hold the tail. Same chain, two directions.`
    )}

    <h2>Do it for real (in a safe sandbox)</h2>

    <p>We'll practice on a <strong>throwaway branch</strong> so your actual <code>main</code>
    is never touched — which is itself the safety habit this lab is about. Open your
    <code>ai-engineering</code> terminal.</p>

    <h3>Part 1 — build a sandbox and a stretch to regret</h3>
    <ol class="steps">
      <li>Make a practice branch. Your real <code>main</code> is now frozen exactly as it is
        — everything below happens over here and cannot hurt it:
        ${Toolkit.code("Terminal", "git switch -c rollback-drill\ngit log --oneline")}
        The commit at the top of that log is your <strong>&lt;good&gt;</strong> for this
        drill — copy its hash.
      </li>
      <li>Now manufacture a few commits to regret. Add a line to <code>hello.py</code>, save,
        commit — three times, so you have a real <em>stretch</em>:
        ${Toolkit.code("Terminal", "git commit -am \"drill: change 1\"\ngit commit -am \"drill: change 2\"\ngit commit -am \"drill: change 3\"")}
        (Edit and save <code>hello.py</code> before each commit — <code>-am</code> stages the
        tracked change and commits in one step.) Confirm with <code>git log --oneline</code>:
        three "drill" commits sit on top of &lt;good&gt;.
      </li>
    </ol>

    <h3>Part 2 — roll the whole stretch back, keeping the scrap</h3>
    <ol class="steps">
      <li>Bookmark the tip you're about to leave, <em>then</em> move the branch back to
        &lt;good&gt; (use your real &lt;good&gt; hash):
        ${Toolkit.code("Terminal", "git branch drill-scrap\ngit reset --hard &lt;good&gt;")}
      </li>
      <li>See what happened — look at both your branch and the bookmark:
        ${Toolkit.code("Terminal", "git log --oneline\ngit log --oneline drill-scrap")}
        <code>rollback-drill</code> is back at &lt;good&gt; — the three commits are gone from
        it. But <code>git log drill-scrap</code> shows all three, alive and well: the bookmark
        held them. You rolled back a whole stretch and lost <em>nothing</em>.
      </li>
    </ol>

    <h3>Part 3 — clean up, and prove main was untouched</h3>
    <ol class="steps">
      <li>Leave the sandbox and return to your trunk:
        ${Toolkit.code("Terminal", "git switch main")}
      </li>
      <li>Now delete the two practice branches — but reach for the <em>safe</em> lowercase
        <code>-d</code> first, and watch what git does:
        ${Toolkit.code("Terminal", "git branch -d rollback-drill drill-scrap")}
        git deletes <code>rollback-drill</code> without complaint — it sat at
        <strong>&lt;good&gt;</strong>, already part of <code>main</code>, so nothing is lost.
        But it <strong>refuses</strong> <code>drill-scrap</code>, because those three commits
        live nowhere else, and it points you at <code>-D</code>. That refusal is git
        protecting you from throwing away work by accident: lowercase <code>-d</code> means
        "delete only if it's safe," uppercase <code>-D</code> means "I know — force it."
      </li>
      <li>You <em>do</em> want the scrap gone here, so force it, then confirm your real work
        never moved:
        ${Toolkit.code("Terminal", "git branch -D drill-scrap\ngit log --oneline")}
        Your <code>main</code> is exactly as you left it at the start — the entire drill
        happened on branches and evaporated when you deleted them. <em>That</em> is the
        habit: when unsure, branch, experiment, and throw the branches away.
      </li>
    </ol>

    ${Toolkit.problem(
      `In Part 2 you ran <code>git branch drill-scrap</code> and <em>then</em>
       <code>git reset --hard &lt;good&gt;</code>. Suppose you had skipped the bookmark and
       run only the <code>reset --hard</code>. Are the three "drill" commits gone for good?`,
      `<strong>No — not right away.</strong> A <code>--hard</code> reset moves the branch
       pointer and discards <em>uncommitted</em> changes, but it does not immediately destroy
       the commit <em>objects</em>: git keeps them referenced in the <code>reflog</code> for
       about 90 days. So <code>git reflog</code> would still show the three "drill" commits,
       and <code>git reset --hard &lt;that-hash&gt;</code> would bring the whole stretch back.
       The bookmark just makes recovery <em>trivial and named</em> instead of a reflog
       archaeology dig. What <em>is</em> gone for good after <code>--hard</code> is any edit
       you never committed at all — the one truly unrecoverable thing, every time.`,
      { label: "Predict: no bookmark — is the scrap lost?" }
    )}

    ${Toolkit.problem(
      `Your team's <code>main</code> has ten commits from this week that everyone has pulled,
       and the team decides to abandon all of them. Do you <code>git reset --hard</code> back
       ten commits and force-push, or revert the range?`,
      `<strong>Revert the range</strong> —
       <code>git revert --no-commit &lt;good&gt;..HEAD</code> then one commit. The commits are
       <em>shared</em>, so the gate points at revert, exactly as it did for a single commit.
       A <code>reset --hard</code> plus force-push would rewrite ten commits of history that
       your teammates already have: their local <code>main</code> now conflicts with the
       rewritten remote, forcing painful re-syncs and risking lost work on their machines. The
       range-revert adds <em>one</em> clean commit everyone pulls normally, and
       <code>main</code> moves forward into a good state without anyone's history being
       rewritten. Shared history is append-only — even when you're rolling back ten commits.`,
      { label: "Predict: rolling back a pushed stretch" }
    )}

    ${Toolkit.instructorNote(
      `Prereq and safety: the drill runs on <code>rollback-drill</code> on purpose, so nobody
       can wreck their real repo while practicing — have them notice at the end that
       <code>main</code> never moved. Great moment to demo the reflog rescue live: after a
       <code>reset --hard</code> with <em>no</em> bookmark, run <code>git reflog</code>, grab
       the hash, and resurrect the stretch — seeing that dissolves the fear of reset for good.
       <br><br>
       One syntax trap to pre-empt: the range <code>&lt;good&gt;..HEAD</code> <em>excludes</em>
       &lt;good&gt; (it's "commits after good"), which is what you want — you're undoing what
       came after the good commit, not the good commit itself. And <code>revert</code>
       processes the range newest-first automatically; the <code>--no-commit</code> +
       single <code>commit</code> keeps it to one tidy rollback commit instead of one revert
       per undone commit.`
    )}

    <h2>Rolled back, checked</h2>

    <p>Confirm before you stop:</p>

    <ul class="checklist">
      <li><input type="checkbox" id="b1"><label for="b1">I scouted my history with
        <code>git log</code>/<code>checkout</code> and identified a "last good" commit.</label></li>
      <li><input type="checkbox" id="b2"><label for="b2">I rolled a whole stretch back by
        <strong>bookmarking the scrap</strong> then <code>git reset --hard &lt;good&gt;</code>,
        and saw the discarded commits still alive on the bookmark.</label></li>
      <li><input type="checkbox" id="b3"><label for="b3">I can state the gate at range scale:
        <em>pushed → revert the range; local-only → bookmark &amp; reset</em>.</label></li>
      <li><input type="checkbox" id="b4"><label for="b4">I understand that <code>main</code>
        stays canonical either way — it moves forward (revert) or back (reset), never becomes
        the abandoned branch.</label></li>
    </ul>

    <h2>What you accomplished</h2>
    <ul>
      <li>You can undo a <strong>whole stretch of commits</strong>, not just one — and you saw
        it needs no new rule, only last lab's gate applied to a <em>range</em>.</li>
      <li><strong>Pushed stretch → revert the range</strong>
        (<code>git revert --no-commit &lt;good&gt;..HEAD</code> then commit): <code>main</code>
        moves forward to a clean state, history preserved, push stays clean.</li>
      <li><strong>Local stretch → bookmark, then reset</strong>
        (<code>git branch &lt;scrap&gt;</code> then <code>git reset --hard &lt;good&gt;</code>):
        <code>main</code> comes back to good while the discarded work is saved under a name.</li>
      <li>You kept the principle that makes it all sane: <strong><code>main</code> is
        canonical</strong> — you name the branch after what you're <em>leaving</em>, never
        after what you're keeping — and a bookmark plus the reflog make even a hard reset
        reversible.</li>
    </ul>
  `,

  onMount(root) {
    /* ---- Rolling-back-a-range visualizer -------------------------------
       Honest model of two range-rollback strategies on a 6-commit history
       whose last 3 commits are regretted; target = index 2 (c3d4e5f).
       `main` = the local trunk tip; `origin/main` = what GitHub has,
       positioned by the "pushed?" toggle. In BOTH strategies main stays
       canonical: revert extends it forward with one inverse commit (clean
       fast-forward push); bookmark-and-reset slides main back to the good
       commit while a labeled branch (abandoned-refactor) holds the tail --
       and, if the stretch was pushed, local main and origin/main DIVERGE
       (the force-push trap). Illustrative (not the student's real repo) --
       the nd-cap says so. ---- */
    const HIST = [
      { hash: "a1b2c3d", msg: "Start the feature" },
      { hash: "b2c3d4e", msg: "Add core logic" },
      { hash: "c3d4e5f", msg: "Wire up the UI" },        // index 2 = last good (target)
      { hash: "d4e5f6a", msg: "Big refactor (regret)" },
      { hash: "e5f6a7b", msg: "More churn" },
      { hash: "f6a7b8c", msg: "It's all broken now" },   // index 5 = HEAD
    ];
    const ROLLBACK = { hash: "90abed1", msg: "Roll back the refactor" };
    const TARGET = 2;
    const TIP = HIST.length - 1;

    let strategy = "base";  // base | revert | reset
    let pushed = true;       // was the bad stretch pushed?

    const viewEl  = root.querySelector("#rb-view");
    const noteEl  = root.querySelector("#rb-note");
    const capEl   = root.querySelector("#rb-cap");
    const pushBtn = root.querySelector("#rb-pushed");
    const revBtn  = root.querySelector("#rb-revert");
    const resBtn  = root.querySelector("#rb-reset");
    const againBtn= root.querySelector("#rb-again");

    function chip(c, o) {
      o = o || {};
      let b = "";
      if (o.head)   b += '<span class="gc-head">HEAD</span>';
      if (o.main)   b += '<span class="gc-head">main</span>';
      if (o.origin) b += '<span class="gc-head gc-origin">origin/main</span>';
      if (o.branch) b += '<span class="gc-head gc-origin">' + o.branch + "</span>";
      return (
        '<div class="git-commit' + (o.hl ? " head" : "") + (o.ghost ? " ghost" : "") + '">' +
          '<span class="gc-hash">' + c.hash + "</span>" +
          '<span class="gc-msg">' + c.msg + (o.tag ? "  " + o.tag : "") + "</span>" +
          b +
        "</div>"
      );
    }

    function timeline(html) {
      return '<div class="tm-timeline">' + html + "</div>";
    }

    function render() {
      const originIdx = pushed ? TIP : TARGET; // GitHub has the stretch only if you pushed it

      if (strategy === "base") {
        viewEl.innerHTML = timeline(
          HIST.map((c, i) =>
            chip(c, {
              main: i === TIP,
              head: i === TIP,
              origin: i === originIdx,
              hl: i === TIP,
              tag: i === TARGET ? "← last good version" : "",
            })
          ).join("")
        );
        noteEl.className = "tm-note detached";
        noteEl.textContent =
          "You want the project back at c3d4e5f (Wire up the UI). Three regretted commits sit on top." +
          (pushed ? " You've already pushed them to GitHub." : " You haven't pushed them.");
        capEl.textContent =
          "Same gate as undoing one commit — did you push the bad stretch? Try each strategy; watch main and origin/main.";
      } else if (strategy === "revert") {
        const list = HIST.concat([ROLLBACK]);
        viewEl.innerHTML = timeline(
          list.map((c, i) =>
            chip(c, {
              main: i === list.length - 1,
              head: i === list.length - 1,
              origin: i === originIdx,
              hl: i === list.length - 1,
              tag: i === list.length - 1 ? "← contents == c3d4e5f" : "",
            })
          ).join("")
        );
        noteEl.className = "tm-note attached";
        noteEl.textContent =
          "git revert --no-commit c3d4e5f..HEAD then one commit appended a single new commit that undoes all three. " +
          "main moved FORWARD to a clean state, the whole history is intact, and it's still a descendant of what GitHub has — " +
          "so git push fast-forwards. Clean no matter what you'd shared. main stayed canonical. ✓";
        capEl.textContent =
          "History grew by one commit; nothing rewritten. origin/main just fast-forwards to catch up.";
      } else { // reset
        viewEl.innerHTML = timeline(
          HIST.map((c, i) =>
            chip(c, {
              main: i === TARGET,
              head: i === TARGET,
              hl: i === TARGET,
              ghost: i > TARGET,
              origin: i === originIdx,
              branch: i === TIP ? "abandoned-refactor" : "",
            })
          ).join("")
        );
        if (pushed) {
          noteEl.className = "tm-note danger";
          noteEl.textContent =
            "git branch abandoned-refactor then git reset --hard c3d4e5f: main is back at Wire up the UI and the three commits " +
            "are safe on abandoned-refactor. But you'd pushed them, so origin/main still holds f6a7b8c — local and shared history " +
            "DIVERGED. Making GitHub match needs a force-push that clobbers anyone who pulled. ⚠ Reset only what you haven't shared.";
          capEl.textContent =
            "See the split: main is on c3d4e5f, origin/main is still on f6a7b8c. They disagree — that's a divergence.";
        } else {
          noteEl.className = "tm-note attached";
          noteEl.textContent =
            "git branch abandoned-refactor then git reset --hard c3d4e5f: main slid back to Wire up the UI, the three regretted " +
            "commits are parked on abandoned-refactor (and in the reflog). You never pushed them, so origin/main was already at " +
            "c3d4e5f — you're in sync. main stayed canonical, and nothing was lost. ✓";
          capEl.textContent =
            "main and origin/main both sit on c3d4e5f — in sync. The scrap is bookmarked; rewriting was safe because it was private.";
        }
      }

      pushBtn.textContent = pushed ? "Did you push the bad stretch? YES" : "Did you push the bad stretch? NO";
      revBtn.disabled = strategy !== "base";
      resBtn.disabled = strategy !== "base";
      againBtn.disabled = strategy === "base";
    }

    pushBtn.addEventListener("click", () => { pushed = !pushed; render(); });
    revBtn.addEventListener("click", () => { strategy = "revert"; render(); });
    resBtn.addEventListener("click", () => { strategy = "reset"; render(); });
    againBtn.addEventListener("click", () => { strategy = "base"; render(); });

    render();
  },
};
