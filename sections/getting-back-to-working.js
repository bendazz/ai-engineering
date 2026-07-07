/* ============================================================
   Section: Getting back to a working version  (LAB)
   Setup block, section 5. The everyday, NON-DESTRUCTIVE safety net:
   how to return to a snapshot that worked. This is the single most
   wanted thing a beginner asks of version control ("my code broke —
   get me back"), and until now the course never taught it.
   Scope (kept deliberately safe):
     - git restore <file>  : discard uncommitted edits, back to last commit
       (the ONE move here that can lose work — flagged loudly).
     - git checkout <hash> : visit/run an older snapshot (detached HEAD),
       then git switch main to come back. Fully reversible.
   Undoing a COMMITTED change for good (revert vs reset) is the NEXT
   recovery section, placed after GitHub so "shared history" is real.
   Star interactive: a history TIME-MACHINE — click any commit to check
   it out, watch the working directory redraw to that snapshot and show
   whether it runs, with a detached-HEAD banner; a switch-main button
   brings you home.
   NOTE: no literal dollar signs (KaTeX-free section); no backtick chars
   in prose; every literal < or > in the html string is written &lt; &gt;
   (raw < in onMount JS is fine). Keep the block-comment terminator out
   of prose here, or it closes this comment early.
   ============================================================ */

window.SectionContent["getting-back-to-working"] = {
  title: "Getting back to a working version",

  html: `
    <div class="eyebrow">Setup &amp; First Contact · Section 5 · Lab</div>
    <h1>Getting back to a working version</h1>

    <p>Here is the question every programmer eventually asks, usually at 11pm:
    <em>"My code worked an hour ago. Now it doesn't, and I can't see what I broke.
    How do I get back to the version that worked?"</em> This is the moment version
    control earns its keep — and it is the whole reason you committed in the first
    place. A commit isn't just a save; it's a <strong>restore point</strong> you can
    return to.</p>

    ${Toolkit.callout(
      `The reassuring fact to hold onto: <strong>every commit you have ever made is
       still there, in full, forever.</strong> git never overwrites a commit when you
       make a new one — it stacks a new snapshot on top. So "getting back to a working
       version" is never about <em>reconstructing</em> anything. The good version is
       already saved; recovery is just <em>choosing which snapshot to stand on</em>.
       That is exactly why the habit is "commit after every lab": each commit is one
       more point you can fall back to.`,
      { type: "", label: "Why this works at all" }
    )}

    <h2>Three kinds of "go back" — a decision procedure</h2>

    <p>"Go back" is vague, and the right command depends on <em>one</em> question:
    <strong>had you already saved the good version in a commit?</strong> Walk the
    checklist — each branch has a single, unambiguous answer:</p>

    <ul>
      <li><strong>You messed up a file but have <em>not</em> committed the mess yet</strong>
        — the good version is your last commit, and the damage is only in your working
        directory. → Throw the mess away with <code>git restore</code>.
        <em>(This lesson.)</em></li>
      <li><strong>You just want to <em>see or run</em> an older commit</strong> — to find
        which snapshot still worked, without changing anything. → Visit it with
        <code>git checkout</code>, then come home with <code>git switch main</code>.
        <em>(This lesson.)</em></li>
      <li><strong>You committed a change, decided it was wrong, and want it undone for
        good</strong> — the bad version is now in your history. → Undo it with
        <code>git revert</code>. <em>(Next recovery section.)</em></li>
    </ul>

    <p>The first two are completely safe to practice — with one small exception we'll
    flag — so let's take them both.</p>

    <h2>Case 1 — "Undo my uncommitted mess": <code>git restore</code></h2>

    <p>You edited <code>hello.py</code>, made it worse, and you have <em>not</em>
    committed. You want the file back exactly as it was in your last commit. That's one
    command:</p>

    ${Toolkit.code("Terminal", "git restore hello.py")}

    <p>This overwrites the file in your working directory with the version from your
    last commit — the mess is gone, the good version is back. To discard <em>all</em>
    uncommitted changes across every tracked file at once, use the same command with a
    dot:</p>

    ${Toolkit.code("Terminal", "git restore .")}

    ${Toolkit.callout(
      `<code>git restore</code> is the one recovery move in this lesson that can
       <strong>lose work</strong>, and it does so on purpose. Your uncommitted edits
       were never saved anywhere, so when <code>restore</code> overwrites them with the
       last commit, they are <strong>gone for good</strong> — there is no snapshot to
       fish them back out of. That's fine when the edit was a mistake you <em>want</em>
       thrown away. Just never run it on changes you might still want. Rule of thumb:
       <em>if in doubt, commit first, then decide</em> — a commit is always recoverable;
       an unsaved edit is not.`,
      { type: "warn", label: "The one place you can lose work" }
    )}

    <h2>Case 2 — "Let me see the version that worked": <code>git checkout</code></h2>

    <p>This is the big one, and the safest tool in git. Suppose your latest commit is
    broken and you're not even sure which earlier commit was the last good one. You'd
    like to <em>step back in time</em>, look at an old snapshot, even <em>run</em> it —
    all without disturbing your current work. That's <code>git checkout</code> pointed
    at a commit:</p>

    ${Toolkit.code("Terminal", "git log --oneline\ngit checkout &lt;the good commit's hash&gt;")}

    <p>Your whole working directory transforms into that snapshot: the files become
    exactly what they were at that commit. Run the code, poke around, confirm it works.
    When you're done, one command brings you back to the present:</p>

    ${Toolkit.code("Terminal", "git switch main")}

    <p>Nothing was changed and nothing was risked — <code>checkout</code> here is pure
    <em>time travel</em>, a way to <em>look</em>. Try it in the model below: click any
    commit to check it out and watch the working directory become that snapshot. Notice
    which snapshots run and which don't, and watch the <strong>HEAD</strong> marker
    move.</p>

    ${Toolkit.widget(
      "Time-machine: checking out history",
      `<div class="tm-timeline" id="tm-line"></div>
       <div class="tm-detached" id="tm-detached"></div>
       <div class="git-status-wrap">
         <div class="git-status-head" id="tm-file-head">Working directory · hello.py</div>
         <pre class="git-status" id="tm-file"></pre>
       </div>
       <div id="tm-runs"></div>
       <div class="gs-cap" id="tm-cap"></div>
       <div class="controls">
         <button class="btn" id="tm-home">git switch main</button>
       </div>
       <div class="nd-cap">A model of travelling through history with
         <code>git checkout</code> — the same move you'll run for real below. The tip
         of <code>main</code> is broken here; an earlier snapshot still runs.</div>`
    )}

    ${Toolkit.callout(
      `When you check out an old commit, git says you are in
       <strong>"detached HEAD"</strong> state — an intimidating phrase for a harmless
       situation. Remember that <strong>HEAD</strong> just means "where I am right now."
       Normally HEAD points at a branch (<code>main</code>), which points at the newest
       commit — that's why you see <code>HEAD -&gt; main</code>. When you check out an
       older commit directly, HEAD points straight at that commit instead of at a
       branch: it is <em>detached</em> from <code>main</code>. You're simply standing on
       an old snapshot, looking around. <code>git switch main</code> re-attaches you to
       the branch and the present.`,
      { type: "note", label: "\"Detached HEAD\" is not an error" }
    )}

    ${Toolkit.instructorNote(
      `The line that dissolves the fear on the board: <em>"checkout is a time machine
       that only lets you look; switch brings you home."</em> Demo it live — check out
       the root commit, show the class that <code>hello.py</code> visibly loses its
       latest lines, then <code>git switch main</code> and watch them reappear. Seeing
       the file's text change in the editor is what makes "every snapshot is still
       there" concrete.<br><br>
       One trap a curious student <em>will</em> hit: while in detached HEAD they make an
       edit and <code>git commit</code> it. That commit is real but sits on no branch —
       after <code>git switch main</code> it seems to vanish, and git warns about
       "leaving commits behind." Nothing is lost yet, but it's now hard to find. The fix
       to teach if it comes up: don't commit in detached HEAD; if you already did,
       <code>git switch -c newbranch</code> right there to keep it on a branch. Keep
       this out of the main flow — mention it only if asked.`
    )}

    <h2>A quick word on <code>checkout</code> vs. <code>switch</code></h2>

    <p>You may notice git has two commands that feel related. That's history: for years
    <code>git checkout</code> did <em>everything</em> — switch branches, visit old
    commits, and restore files — which made it famously confusing. In 2019 git split
    that overloaded command into two clearer ones:</p>

    <ul>
      <li><strong><code>git switch</code></strong> — move between branches (and back to
        the present with <code>git switch main</code>).</li>
      <li><strong><code>git restore</code></strong> — put files back to a saved version
        (Case 1 above).</li>
    </ul>

    <p>The older <code>git checkout</code> still works and is still the idiomatic way to
    say "go visit this specific commit," so you'll see all three in the wild. Use
    <code>restore</code> and <code>switch</code> for the two everyday jobs; reach for
    <code>checkout &lt;hash&gt;</code> when you want to time-travel to a snapshot.</p>

    <h2>Do it for real</h2>

    <p>Your <code>ai-engineering</code> repo has two commits now, which is exactly
    enough to practice both moves. Open its terminal.</p>

    <h3>Part 1 — discard an uncommitted change</h3>
    <ol class="steps">
      <li>Break <code>hello.py</code> on purpose: open it and add a junk line like
        <code>this is not valid python</code>, then save. Confirm git sees it:
        ${Toolkit.code("Terminal", "git status")}
        It should report <code>hello.py</code> as <em>modified</em> and unstaged.
      </li>
      <li>Change your mind — throw the junk away and get the file back:
        ${Toolkit.code("Terminal", "git restore hello.py")}
      </li>
      <li>Confirm it worked. The junk line is gone and git is clean again:
        ${Toolkit.code("Terminal", "git status")}
        You should see <em>"nothing to commit, working tree clean."</em>
      </li>
    </ol>

    <h3>Part 2 — visit an older snapshot, then come home</h3>
    <ol class="steps">
      <li>List your history and find the hash of your <strong>first</strong> commit
        (the bottom line):
        ${Toolkit.code("Terminal", "git log --oneline")}
      </li>
      <li>Travel back to it. Use your own root-commit hash in place of the placeholder:
        ${Toolkit.code("Terminal", "git checkout &lt;root-hash&gt;")}
        git prints a "detached HEAD" notice — that's expected, not an error. Now open
        <code>hello.py</code>: the lines you added in your second commit are
        <strong>gone</strong>, because you're standing on the earlier snapshot.
      </li>
      <li>Come back to the present:
        ${Toolkit.code("Terminal", "git switch main")}
        Open <code>hello.py</code> again — the later lines are back. You just proved
        both snapshots still exist and that moving between them is safe.
      </li>
    </ol>

    ${Toolkit.problem(
      `In Part 1 you ran <code>git restore hello.py</code> to throw away the junk line.
       Suppose that "junk" had actually been a good idea you wanted after all. Can you
       get it back? Why or why not?</p><p>(Predict, then reason it through.)`,
      `<strong>No — it's gone.</strong> <code>git restore</code> replaced your working
       copy with the version from the last <em>commit</em>, and your edit had never been
       committed (or even staged) — it existed only as unsaved text in the working
       directory. There is no snapshot of it anywhere for git to recover, so overwriting
       it destroyed it. This is the one sharp edge in this lesson, and it points at the
       habit that removes the risk entirely: <strong>commit anything you might want to
       keep before you run a destructive command.</strong> Had you committed the line
       first, it would still be sitting safely in history — recoverable by checking out
       that commit. Committed work is safe; uncommitted work is not.`,
      { label: "Predict: can you undo an undo?" }
    )}

    <h2>Recovery, checked</h2>

    <p>Confirm these before you stop:</p>

    <ul class="checklist">
      <li><input type="checkbox" id="r1"><label for="r1">I made an uncommitted edit and
        undid it with <code>git restore</code>, returning to a clean tree.</label></li>
      <li><input type="checkbox" id="r2"><label for="r2">I checked out an older commit,
        saw my files change to that snapshot, and understood the "detached HEAD"
        notice.</label></li>
      <li><input type="checkbox" id="r3"><label for="r3">I returned to the present with
        <code>git switch main</code> and my latest work was all there.</label></li>
      <li><input type="checkbox" id="r4"><label for="r4">I can say which recovery move
        can lose work (<code>restore</code>) and which cannot
        (<code>checkout</code>/<code>switch</code>).</label></li>
    </ul>

    ${Toolkit.instructorNote(
      `Before the lab, make sure everyone actually has two commits — a student who
       skipped the "note to hello.py" commit last session has only the root commit and
       Part 2 falls flat (checkout and main look identical). Have them run
       <code>git log --oneline</code> first; if they see one line, have them make any
       small edit and commit it before starting. Also warn them <em>not</em> to commit
       while in detached HEAD during the lab — keep it to looking and switching back.`
    )}

    <h2>What you accomplished</h2>
    <ul>
      <li>You learned the reassurance behind version control: <strong>every commit is a
        permanent restore point</strong>, so "getting back" is just choosing a
        snapshot.</li>
      <li>You can <strong>discard an uncommitted mess</strong> with
        <code>git restore</code> — and you know it's the one move that can lose work.</li>
      <li>You can <strong>visit and run any past snapshot</strong> with
        <code>git checkout &lt;hash&gt;</code> and return safely with
        <code>git switch main</code>, understanding "detached HEAD" as harmless time
        travel.</li>
      <li>You know the decision procedure: <em>uncommitted mess → restore; just looking
        → checkout then switch; a committed change to undo for good → revert</em>.</li>
    </ul>
  `,

  onMount(root) {
    /* ---- History time-machine ----------------------------------------
       An honest model of `git checkout <hash>` on a 3-commit history whose
       TIP is broken. Clicking a commit checks it out: the working-directory
       panel redraws to that snapshot and reports whether it runs; a detached
       -HEAD banner shows whenever you're not on the tip of main. `git switch
       main` returns you to the present. Illustrative (not the student's real
       file) — the nd-cap says so. ---- */
    const commits = [
      {
        hash: "7e3a1c0",
        msg: "Set up hello.py",
        ok: true,
        file: 'import sys\nprint("Python", sys.version.split()[0], "ready in", sys.prefix)',
      },
      {
        hash: "b91f2d4",
        msg: "Add a greeting line",
        ok: true,
        file: 'import sys\nprint("Python", sys.version.split()[0], "ready in", sys.prefix)\nprint("Hello from my workbench!")',
      },
      {
        hash: "c04aa8e",
        msg: "Tidy up the greeting (oops)",
        ok: false,
        file: 'import sys\nprint("Python" sys.version.split()[0] "ready in" sys.prefix)   # removed the commas by mistake\nprint("Hello from my workbench!")',
      },
    ];
    const TIP = commits.length - 1;
    let head = TIP; // index of the commit currently checked out

    const lineEl     = root.querySelector("#tm-line");
    const detachedEl = root.querySelector("#tm-detached");
    const fileHeadEl = root.querySelector("#tm-file-head");
    const fileEl     = root.querySelector("#tm-file");
    const runsEl     = root.querySelector("#tm-runs");
    const capEl      = root.querySelector("#tm-cap");
    const homeBtn    = root.querySelector("#tm-home");

    const onTip = () => head === TIP;

    function chip(c, i) {
      const badges =
        (i === TIP ? '<span class="gc-head">main</span>' : "") +
        (i === head ? '<span class="gc-head">HEAD</span>' : "");
      return `<button class="git-commit tm-chip${i === head ? " head" : ""}" data-idx="${i}">
          <span class="gc-hash">${c.hash}</span>
          <span class="gc-msg">${c.msg}</span>
          ${badges}
        </button>`;
    }

    function render() {
      lineEl.innerHTML = commits.map(chip).join("");

      detachedEl.innerHTML = onTip()
        ? '<div class="tm-note attached">HEAD → main · you are on the latest commit</div>'
        : '<div class="tm-note detached">HEAD detached at ' + commits[head].hash +
          ' · you are viewing history, not on a branch</div>';

      const c = commits[head];
      fileHeadEl.textContent = "Working directory · hello.py @ " + c.hash;
      fileEl.textContent = c.file;

      runsEl.innerHTML = c.ok
        ? '<div class="git-file green"><div class="gf-name">python hello.py</div>' +
          '<div class="gf-tag">runs cleanly ✓</div></div>'
        : '<div class="git-file red"><div class="gf-name">python hello.py</div>' +
          '<div class="gf-tag">SyntaxError ✗ — this snapshot is broken</div></div>';

      capEl.textContent = onTip()
        ? (c.ok
            ? "You're on the latest commit, and it runs."
            : "You're on the latest commit — and it's broken. Click an earlier commit to find the last version that worked.")
        : "Standing on an older snapshot (" + c.hash + "). Nothing on your machine is at risk — this is just looking. Click 'git switch main' to return.";

      homeBtn.disabled = onTip();
    }

    lineEl.addEventListener("click", (e) => {
      const btn = e.target.closest(".tm-chip");
      if (!btn) return;
      head = Number(btn.dataset.idx);
      render();
    });
    homeBtn.addEventListener("click", () => { head = TIP; render(); });

    render();
  },
};
