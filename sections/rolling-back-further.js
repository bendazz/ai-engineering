/* ============================================================
   Section: Rolling back further  (LAB)
   Setup block, section 8. The THIRD beat of the recovery arc, after
   getting-back-to-working (sec 5) and undoing-a-commit (sec 7). It
   scales the problem from "undo ONE commit" to "undo a whole STRETCH
   of commits" -- several days of work you've decided you don't want.
   The teaching point: it needs NO new rule. The same gate from sec 7
   ("did you push it?") decides, now applied to a RANGE.

   MAIN-FIRST design (students only know the main trunk; no branching
   has been taught): the core rollback requires NO branch at all --
     - pushed/shared -> git revert --no-commit <good>..HEAD ; git commit
       (main moves FORWARD to a clean state; history preserved; clean push)
     - local-only    -> git reset --hard <good>
       (main slides BACK along its own line; the discarded commits are
       NOT destroyed -- they linger in the reflog ~90 days, the safety net
       students already met in sec 7)
   Framing that keeps main sacred: main is the trunk / GitHub default / PR
   target / Pages source, so it must never become the abandoned branch --
   here main simply moves back (reset) or forward (revert), never away.

   FEATURED OPTIONAL HABIT (a gentle first taste of a branch, explicitly
   not required): drop a bookmark BEFORE a local reset --
     git branch scrap ; git reset --hard <good>
   so the discarded work has an easy NAME instead of a reflog dig. This is
   where we teach "a branch is just a movable name pointing at a commit"
   in one sentence -- the minimal branch concept, used where it earns its
   keep. The reflog is the base net; the bookmark is the nicer net.

   The hands-on drill runs on MAIN itself (throwaway UNPUSHED commits ->
   bookmark -> reset --hard <good> -> recover), so no sandbox branch is
   needed; main returns to exactly where it began. Cleanup keeps the
   git branch -d (safe, refuses unmerged) vs -D (force) guard beat.

   Star interactive: strategy switcher over a 6-commit history with a
   fixed rollback target -- revert-the-range vs reset-main-back (bookmark
   optional; pushed toggle shows the divergence trap), main staying
   canonical in both.
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
    range</strong> — and it needs no new rule, and (this is the part to hold onto) no
    branching. You stay right where you've always worked: on <code>main</code>.</p>

    ${Toolkit.callout(
      `The reassurance still holds, and it's the reason none of this is dangerous:
       <strong>every commit you made along the way is still there.</strong> "Going back
       several days" is not reconstruction — the good version is a snapshot sitting in your
       history, and rolling back is just choosing to stand on it again. And your safety net
       is one you already met last lab: even after you throw commits away, they linger in
       the <strong><code>reflog</code></strong> for about 90 days, fully recoverable. So you
       can roll back boldly.`,
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
      <li><strong>The bad stretch is local-only</strong> — nobody has seen it. → <strong>Reset
        <code>main</code> back.</strong></li>
    </ul>

    ${Toolkit.callout(
      `Whatever you do, one branch is <strong>sacred: <code>main</code></strong>. It's your
       trunk, it's what GitHub shows by default, it's what a pull request targets, it's what
       your site deploys from. So the goal is never "abandon <code>main</code> and go work
       somewhere else" — it's always "get <code>main</code> <em>itself</em> back to a good
       state." In both moves below, <code>main</code> simply moves: forward (revert) or back
       (reset). It never becomes the branch you walked away from.`,
      { type: "note", label: "main stays canonical" }
    )}

    <h2>Case A — the stretch was pushed: revert the range</h2>

    <p>Same tool as last lab (<code>revert</code>), just aimed at many commits at once. This
    stages the inverse of <em>everything</em> since <strong>&lt;good&gt;</strong> and lands
    it as a single tidy commit on <code>main</code>:</p>

    ${Toolkit.code("Terminal", "git revert --no-commit &lt;good&gt;..HEAD\ngit commit -m \"Roll back the refactor\"")}

    <p>The range <code>&lt;good&gt;..HEAD</code> means "every commit <em>after</em>
    &lt;good&gt;, up to now" (&lt;good&gt; itself is excluded — it's the point you want to
    keep). <code>--no-commit</code> collects all those inversions without committing each
    one, so your single <code>git commit</code> writes <strong>one</strong> clean "roll
    back" commit whose contents match &lt;good&gt; exactly. History is preserved, and
    because you only <em>added</em> a commit, <code>main</code> is still a descendant of what
    GitHub has — a plain <code>git push</code> fast-forwards. <code>main</code> stayed
    canonical and moved <em>forward</em> into a clean state.</p>

    <h2>Case B — the stretch is local-only: reset <code>main</code> back</h2>

    <p>If nobody has seen those commits, the simplest thing in git does exactly what you
    want: move <code>main</code>'s pointer back to <strong>&lt;good&gt;</strong> so the whole
    stretch is gone from the branch. That is one command:</p>

    ${Toolkit.code("Terminal", "git reset --hard &lt;good&gt;")}

    <p>That slides <code>main</code> back along its own line to the good commit and snaps your
    files to that snapshot — the regretted commits drop off the end of <code>main</code>. No
    branch, no ceremony; you never left the trunk. And they aren't destroyed: as you saw last
    lab, <code>git reflog</code> still lists them for about 90 days, so
    <code>git reset --hard &lt;that-hash&gt;</code> would bring the whole stretch back if you
    changed your mind.</p>

    <h3>The one nice habit worth adding: bookmark before you reset</h3>

    <p>Fishing a commit out of the reflog works, but it's a bit of a dig. There's a friendlier
    way to keep the discarded work close by — give it a <strong>name</strong> before you reset:</p>

    ${Toolkit.code("Terminal", "git branch scrap\ngit reset --hard &lt;good&gt;")}

    <p>This is your first meeting with a <strong>branch</strong>, and the whole idea fits in one
    sentence: <strong>a branch is just a movable name that points at a commit.</strong>
    <code>git branch scrap</code> sticks the name <code>scrap</code> onto your current (bad)
    tip — it doesn't move you, doesn't change a file, costs nothing. <em>Then</em>
    <code>git reset --hard &lt;good&gt;</code> slides <code>main</code> back as before. Now
    <code>main</code> is the good line again, and every discarded commit is sitting under the
    name <code>scrap</code>, retrievable at a glance instead of via a reflog dig. You didn't
    <em>need</em> the branch to roll back — <code>reset</code> did that on <code>main</code>
    alone — the bookmark just makes the leftovers easy to find. Notice the naming, too: the
    branch is named after the <em>scrap you're discarding</em>, never after your real work.
    <code>main</code> always stays your good line.</p>

    ${Toolkit.callout(
      `<code>git reset --hard</code> also throws away any <em>uncommitted</em> edits in your
       working tree — the same sharp edge as always. Committed work is safe (reflog, or the
       bookmark); unsaved edits are not. So if you have edits in progress you might want,
       commit or stash them before you reset.`,
      { type: "warn", label: "Reset --hard still discards unsaved work" }
    )}

    <h2>See it both ways</h2>

    <p>Below is a six-commit history you've decided to roll back to its third commit. Try each
    strategy and watch what happens to <code>main</code>, to the shared <code>origin/main</code>
    marker, and to the commits you're leaving behind. Flip whether the bad stretch was pushed,
    and notice how much that changes the reset.</p>

    ${Toolkit.widget(
      "Rolling back a range: revert vs. reset main back",
      `<div id="rb-view"></div>
       <div class="tm-detached"><div class="tm-note" id="rb-note"></div></div>
       <div class="gs-cap" id="rb-cap"></div>
       <div class="controls">
         <button class="btn ghost" id="rb-pushed">Did you push the bad stretch? YES</button>
         <button class="btn" id="rb-revert">Revert the range</button>
         <button class="btn" id="rb-reset">Reset main back (bookmark the scrap)</button>
         <button class="btn ghost" id="rb-again">Start over</button>
       </div>
       <div class="nd-cap">A model of rolling a 6-commit history back to
         <code>c3d4e5f</code> (the last good commit). <strong>main</strong> is your trunk;
         <strong>origin/main</strong> is what GitHub has. In both strategies main stays
         canonical — it moves forward (revert) or back (reset); it never becomes the abandoned
         branch. The <code>scrap</code> bookmark shown on the reset is the optional
         name-your-leftovers habit.</div>`
    )}

    ${Toolkit.instructorNote(
      `The whole point of this rewrite: your students only know the <code>main</code> trunk, so
       lead with the branch-free truth — <em>rolling back a stretch is just
       <code>git reset --hard &lt;good&gt;</code> (local) or a range revert (pushed)</em>, with
       the reflog (from last lab) as the net. Say plainly: "you do not need branching to roll
       back." Then introduce the bookmark as a <em>nicety</em>, and use it to teach the one
       true sentence about branches — <em>a branch is a movable name pointing at a commit</em> —
       which is also the seed you'll grow if you ever teach real branching later. On the board:
       the <code>main</code> pointer slides back to the good commit; a sticky note labeled
       <code>scrap</code> stays on the discarded tip. That single picture carries the section.
       <br><br>
       The other board picture makes the two cases obvious: a horizontal chain of commits.
       Pushed — you can't move the shared part, so you <em>extend</em> it with an inverse
       (revert). Local — nothing is shared, so you slide the <code>main</code> pointer back.
       Same chain, two directions.`
    )}

    <h2>Do it for real</h2>

    <p>You'll practice the local case on <code>main</code> itself — which is exactly how you'll
    do it in real life. It's safe because you'll roll back to your <em>current</em> tip, so
    <code>main</code> ends precisely where it began, and nothing you care about ever changes.
    Open your <code>ai-engineering</code> terminal.</p>

    <h3>Part 1 — make a stretch to regret (and don't push it)</h3>
    <ol class="steps">
      <li>Check where <code>main</code> is now — this top commit is your
        <strong>&lt;good&gt;</strong>. Copy its hash:
        ${Toolkit.code("Terminal", "git log --oneline")}
      </li>
      <li>Manufacture a few commits to regret. Add a line to <code>hello.py</code>, save,
        commit — three times — and <strong>do not push them</strong> (keeping them local is
        what makes reset the right tool):
        ${Toolkit.code("Terminal", "git commit -am \"drill: change 1\"\ngit commit -am \"drill: change 2\"\ngit commit -am \"drill: change 3\"")}
        (Edit and save <code>hello.py</code> before each commit — <code>-am</code> stages the
        tracked change and commits in one step.) Confirm with <code>git log --oneline</code>:
        three "drill" commits now sit on top of &lt;good&gt;.
      </li>
    </ol>

    <h3>Part 2 — bookmark the scrap, then roll <code>main</code> back</h3>
    <ol class="steps">
      <li>Drop a name on the tip you're about to leave, <em>then</em> reset <code>main</code>
        to &lt;good&gt; (use your real &lt;good&gt; hash):
        ${Toolkit.code("Terminal", "git branch scrap\ngit reset --hard &lt;good&gt;")}
      </li>
      <li>See what happened — look at both <code>main</code> and the bookmark:
        ${Toolkit.code("Terminal", "git log --oneline\ngit log --oneline scrap")}
        <code>main</code> is back at &lt;good&gt; — the three commits are gone from it. But
        <code>git log scrap</code> shows all three, alive and well: the bookmark held them.
        You rolled back a whole stretch and lost <em>nothing</em> — and notice you never
        needed a branch to move <code>main</code> back; <code>reset</code> did that on the
        trunk alone. The bookmark just gave the leftovers a name (the reflog would have held
        them regardless).
      </li>
    </ol>

    <h3>Part 3 — drop the bookmark, and confirm you're clean</h3>
    <ol class="steps">
      <li>The scrap has served its purpose. Try to delete it with the <em>safe</em> lowercase
        <code>-d</code> first, and watch git think about it:
        ${Toolkit.code("Terminal", "git branch -d scrap")}
        git <strong>refuses</strong>, because <code>scrap</code> holds three commits that live
        nowhere else — that refusal is git protecting you from throwing away work by accident.
        Lowercase <code>-d</code> means "delete only if it's safe"; uppercase <code>-D</code>
        means "I know — force it."
      </li>
      <li>You <em>do</em> want it gone, so force it, then confirm your real work is intact and
        in sync with GitHub:
        ${Toolkit.code("Terminal", "git branch -D scrap\ngit status\ngit log --oneline")}
        <code>main</code> reads exactly as it did before Part 1, <code>git status</code> shows
        you in sync with <code>origin/main</code> (you never pushed the drill), and the whole
        detour has evaporated. That is the habit: on the trunk, roll back freely — reset moves
        <code>main</code>, and a bookmark (or the reflog) keeps a way back.
      </li>
    </ol>

    ${Toolkit.problem(
      `In Part 2 you ran <code>git branch scrap</code> and <em>then</em>
       <code>git reset --hard &lt;good&gt;</code>. Suppose you had skipped the bookmark and run
       only the <code>reset --hard</code>. Are the three "drill" commits gone for good?`,
      `<strong>No — not right away.</strong> A <code>--hard</code> reset moves the branch
       pointer and discards <em>uncommitted</em> changes, but it does not immediately destroy
       the commit <em>objects</em>: git keeps them referenced in the <code>reflog</code> for
       about 90 days. So <code>git reflog</code> would still show the three "drill" commits, and
       <code>git reset --hard &lt;that-hash&gt;</code> would bring the whole stretch back. That
       is exactly why you can reset without fear — the bookmark just upgrades "recoverable with
       a reflog dig" to "sitting under a name you chose." What <em>is</em> gone for good after
       <code>--hard</code> is any edit you never committed at all — the one truly unrecoverable
       thing, every time.`,
      { label: "Predict: no bookmark — is the scrap lost?" }
    )}

    ${Toolkit.problem(
      `Your team's <code>main</code> has ten commits from this week that everyone has pulled,
       and the team decides to abandon all of them. Do you <code>git reset --hard</code> back
       ten commits, or revert the range?`,
      `<strong>Revert the range</strong> —
       <code>git revert --no-commit &lt;good&gt;..HEAD</code> then one commit. The commits are
       <em>shared</em>, so the gate points at revert, exactly as it did for a single commit. A
       <code>reset --hard</code> here would move your local <code>main</code> back while
       everyone else's <code>main</code> (and GitHub's) still holds those ten commits: your
       history and theirs would diverge, and forcing GitHub to match would rewrite ten commits
       of shared history and scramble your teammates' repos. The range-revert adds <em>one</em>
       clean commit everyone pulls normally, and <code>main</code> moves forward into a good
       state without anyone's history being rewritten. Shared history is append-only — even
       when you're rolling back ten commits.`,
      { label: "Predict: rolling back a pushed stretch" }
    )}

    ${Toolkit.instructorNote(
      `Prereq and safety: the drill happens on <code>main</code> on purpose (that's the honest
       real-world move) but is safe because they roll back to their <em>current</em> tip, so
       <code>main</code> ends where it began and nothing pushed is touched. Great moment to demo
       the reflog rescue live: after a <code>reset --hard</code> with <em>no</em> bookmark, run
       <code>git reflog</code>, grab the hash, and resurrect the stretch — seeing that dissolves
       the fear of reset for good, and shows the bookmark is a convenience, not a necessity.
       <br><br>
       One syntax trap to pre-empt: the range <code>&lt;good&gt;..HEAD</code> <em>excludes</em>
       &lt;good&gt; (it's "commits after good"), which is what you want — you're undoing what
       came after the good commit, not the good commit itself. And <code>revert</code> processes
       the range newest-first automatically; the <code>--no-commit</code> + single
       <code>commit</code> keeps it to one tidy rollback commit instead of one revert per undone
       commit.`
    )}

    <h2>Rolled back, checked</h2>

    <p>Confirm before you stop:</p>

    <ul class="checklist">
      <li><input type="checkbox" id="b1"><label for="b1">I scouted my history with
        <code>git log</code>/<code>checkout</code> and identified a "last good" commit.</label></li>
      <li><input type="checkbox" id="b2"><label for="b2">I rolled a whole stretch back on
        <code>main</code> with <code>git reset --hard &lt;good&gt;</code> — no branching
        needed.</label></li>
      <li><input type="checkbox" id="b3"><label for="b3">I know the discarded commits survive
        (in the <code>reflog</code>, or under a <code>git branch</code> bookmark I drop
        first).</label></li>
      <li><input type="checkbox" id="b4"><label for="b4">I can state the gate at range scale:
        <em>pushed → revert the range; local-only → reset <code>main</code> back</em>, with
        <code>main</code> always staying canonical.</label></li>
    </ul>

    <h2>What you accomplished</h2>
    <ul>
      <li>You can undo a <strong>whole stretch of commits</strong>, not just one — and you saw
        it needs no new rule and no branching, only last lab's gate applied to a
        <em>range</em>.</li>
      <li><strong>Pushed stretch → revert the range</strong>
        (<code>git revert --no-commit &lt;good&gt;..HEAD</code> then commit): <code>main</code>
        moves forward to a clean state, history preserved, push stays clean.</li>
      <li><strong>Local stretch → reset <code>main</code> back</strong>
        (<code>git reset --hard &lt;good&gt;</code>): <code>main</code> slides back along the
        trunk, with the <code>reflog</code> as your safety net.</li>
      <li>You met the one-sentence idea of a <strong>branch — a movable name pointing at a
        commit</strong> — and used it as an optional <strong>bookmark</strong> to name the
        scrap before resetting. And you kept the principle that makes it all sane:
        <strong><code>main</code> is canonical</strong>, so you name a branch after what you
        <em>discard</em>, never after your real work.</li>
    </ul>
  `,

  onMount(root) {
    /* ---- Rolling-back-a-range visualizer -------------------------------
       Honest model of two range-rollback strategies on a 6-commit history
       whose last 3 commits are regretted; target = index 2 (c3d4e5f).
       `main` = the local trunk tip; `origin/main` = what GitHub has,
       positioned by the "pushed?" toggle. In BOTH strategies main stays
       canonical: revert extends it forward with one inverse commit (clean
       fast-forward push); reset slides main back to the good commit while
       an optional `scrap` bookmark names the discarded tail (the reflog
       holds it either way). If the stretch was pushed, a local reset makes
       main and origin/main DIVERGE (the force-push trap). Illustrative
       (not the student's real repo) -- the nd-cap says so. ---- */
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
              branch: i === TIP ? "scrap" : "",
            })
          ).join("")
        );
        if (pushed) {
          noteEl.className = "tm-note danger";
          noteEl.textContent =
            "git reset --hard c3d4e5f slid main back to Wire up the UI (the optional scrap bookmark names the discarded tail; " +
            "the reflog holds it too). But you'd PUSHED those commits, so origin/main still holds f6a7b8c — local and shared " +
            "history DIVERGED. Making GitHub match needs a force-push that clobbers anyone who pulled. ⚠ Reset only what you haven't shared.";
          capEl.textContent =
            "See the split: main is on c3d4e5f, origin/main is still on f6a7b8c. They disagree — that's a divergence.";
        } else {
          noteEl.className = "tm-note attached";
          noteEl.textContent =
            "git reset --hard c3d4e5f slid main back to Wire up the UI. The three regretted commits dropped off main but are safe " +
            "(under the optional scrap bookmark, and in the reflog ~90 days). You never pushed them, so origin/main was already at " +
            "c3d4e5f — you're in sync. main stayed canonical, no branch required, nothing lost. ✓";
          capEl.textContent =
            "main and origin/main both sit on c3d4e5f — in sync. Rewriting was safe because the stretch was never shared.";
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
