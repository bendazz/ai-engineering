/* ============================================================
   Section: Track your work with git  (LAB)
   Setup block, section 4. Local version control only — GitHub (the
   remote) is the NEXT session. Goal: every student turns their
   project into a git repository with at least one commit, and
   understands git's three areas (working directory -> staging ->
   repository) well enough that "add then commit" stops feeling
   arbitrary.
   Star interactive: a three-areas STEPPER that models the real
   edit -> add -> commit cycle with a live `git status` readout.
   NOTE: no literal dollar signs (KaTeX); no backtick characters in
   prose (they'd end the template literal).
   ============================================================ */

window.SectionContent["setup-git"] = {
  title: "Track your work with git",

  html: `
    <div class="eyebrow">Setup &amp; First Contact · Section 4 · Lab</div>
    <h1>Track your work with git</h1>

    <p>Every professional codebase on earth is under <strong>version control</strong>,
    and the tool is almost always <strong>git</strong>. Think of it as a save
    system with a perfect memory: at any moment you take a <em>snapshot</em> of
    your project, and git remembers every snapshot forever. You can see what
    changed, when, and why — and you can walk back to any earlier snapshot if you
    break something. For an AI engineer that history is also a lab notebook: it's
    how you'll later tie a jump in your eval scores to the exact change that caused
    it.</p>

    ${Toolkit.callout(
      `One clarification worth making out loud now, because it prevents a lot of
       confusion: <strong>git is not GitHub.</strong> git runs entirely on your own
       machine and needs no internet. GitHub (next session) is just a website that
       stores a <em>copy</em> of a git repository online. Everything today is local
       and yours.`,
      { type: "note", label: "git vs. GitHub" }
    )}

    <h2>Install git</h2>

    <p>VS Code doesn't come with git, so install it once. Pick your system:</p>

    <div class="osswitch" id="osswitch">
      <button class="os-tab" data-os="mac">macOS</button>
      <button class="os-tab" data-os="win">Windows</button>
    </div>

    <div class="os-pane" data-os="mac">
      <p>In VS Code's integrated terminal, just run:</p>
      ${Toolkit.code("Terminal", "git --version")}
      <p>If git is missing, macOS will pop up an offer to install the
      <em>Command Line Developer Tools</em> — accept it, wait, then run the command
      again.</p>
    </div>

    <div class="os-pane" data-os="win" hidden>
      <p>Download <strong>Git for Windows</strong> from
      <code>git-scm.com/download/win</code> and run the installer (the default
      options are fine). Open a <strong>new</strong> integrated terminal and
      confirm:</p>
      ${Toolkit.code("PowerShell", "git --version")}
    </div>

    <p>Then tell git who you are — it stamps your name onto every snapshot you
    take. Do this once; it applies to all your projects:</p>

    ${Toolkit.code("Terminal", "git config --global user.name \"Your Name\"\ngit config --global user.email \"you@example.com\"")}

    <h2>The one idea that makes git click: three areas</h2>

    <p>Beginners trip on git for exactly one reason: saving a snapshot takes
    <em>two</em> steps, <code>git add</code> then <code>git commit</code>, and it's
    not obvious why. The reason is that git keeps your work in <strong>three
    areas</strong>, and a snapshot is built up in the middle one before it's saved:</p>

    <ul>
      <li><strong>Working directory</strong> — your files exactly as they are right
      now, edits and all.</li>
      <li><strong>Staging area</strong> — a holding pen for the <em>next</em>
      snapshot. <code>git add</code> puts a copy of a change here. This is what
      lets you choose precisely which changes go into a commit.</li>
      <li><strong>Repository</strong> — the permanent history. <code>git commit</code>
      takes everything in the staging area and saves it as one snapshot, forever.</li>
    </ul>

    <p>Work the cycle below a few times. Edit the file, stage the change, commit it,
    and watch where <code>hello.py</code> lives and what <code>git status</code>
    says at each step.</p>

    ${Toolkit.widget(
      "The edit → add → commit cycle",
      `<div class="git-areas" id="gs-areas"></div>
       <div class="git-status-wrap">
         <div class="git-status-head">git status</div>
         <pre class="git-status" id="gs-status"></pre>
       </div>
       <div class="gs-cap" id="gs-cap"></div>
       <div class="controls">
         <button class="btn ghost" id="gs-edit">Make an edit</button>
         <button class="btn" id="gs-add">git add hello.py</button>
         <button class="btn" id="gs-commit">git commit</button>
         <button class="btn ghost" id="gs-reset">Reset</button>
       </div>
       <div class="nd-cap">A model of git's three areas — the same moves your real
         repository makes.</div>`
    )}

    ${Toolkit.callout(
      `The two-step "add then commit" is the single biggest stumbling block; the
       stepper is the fastest cure. The line to repeat: <em>staging is how you
       choose what goes in the snapshot; committing saves the snapshot.</em> If a
       student is stuck, have them run <code>git status</code> for real after every
       command — git literally tells you which area things are in and what to do
       next. It is the most useful command in git.`,
      { type: "note", label: "For you, the instructor" }
    )}

    <h2>Do it for real</h2>

    <p>Open your <code>ai-engineering</code> project in VS Code's terminal and turn
    it into a repository:</p>

    <ol class="steps">
      <li>Start tracking this folder. This creates a hidden <code>.git</code> folder
        — that's the whole repository:
        ${Toolkit.code("Terminal", "git init")}
      </li>
      <li>Tell git what to <strong>ignore</strong>. Create a file named
        <code>.gitignore</code> in the project with these lines. Your
        <code>.venv</code> should never be committed — it's large, machine-specific,
        and fully rebuildable from <code>requirements.txt</code>:
        ${Toolkit.code(".gitignore", "# Python\n.venv/\n__pycache__/\n\n# Secrets (you'll create this later — never commit it)\n.env\n\n# macOS\n.DS_Store")}
      </li>
      <li>See where everything stands. git will list your files as untracked:
        ${Toolkit.code("Terminal", "git status")}
      </li>
      <li>Stage everything that isn't ignored, then take your first snapshot:
        ${Toolkit.code("Terminal", "git add .\ngit commit -m \"Set up project: venv, requirements, hello.py\"")}
      </li>
      <li>Look at your history. You should see exactly one commit:
        ${Toolkit.code("Terminal", "git log --oneline")}
      </li>
    </ol>

    ${Toolkit.problem(
      `You commit your project. Later you edit <code>hello.py</code> again, then run
       <code>git commit -m "tweak"</code> — but you forget to run
       <code>git add</code> first. What gets saved?</p><p>(Predict, then try it for
       real.)`,
      `<strong>Nothing from that edit gets saved.</strong> A commit only records
       what's in the <em>staging area</em>, and your new edit is still sitting in
       the working directory, unstaged. git will tell you as much —
       <em>"no changes added to commit"</em>. This is the three-area model biting
       in practice: <code>git commit</code> never reaches back into your working
       directory on its own; you must <code>git add</code> the change first. (There
       is a shortcut, <code>git commit -am</code>, that stages already-tracked files
       and commits in one go — but it skips brand-new files, so
       <code>git add</code> is the habit to keep.)`,
      { label: "Predict: the forgotten add" }
    )}

    ${Toolkit.callout(
      `Make this your rhythm for the rest of the course: <strong>commit after every
       lab.</strong> A commit is a checkpoint you can always return to, and a
       message is a note to your future self. Small, frequent commits with plain
       messages ("Add sentiment eval", "Fix retry loop") beat one giant commit at
       the end — every time.`,
      { type: "ai", label: "The habit" }
    )}

    <h2>Your repository, checked</h2>

    <p>Confirm these before you stop:</p>

    <ul class="checklist">
      <li><input type="checkbox" id="g1"><label for="g1">Running <code>git status</code>
        in my project works (git is installed and the folder is a repo).</label></li>
      <li><input type="checkbox" id="g2"><label for="g2">I set my
        <code>user.name</code> and <code>user.email</code>.</label></li>
      <li><input type="checkbox" id="g3"><label for="g3">A <code>.gitignore</code>
        exists and excludes <code>.venv/</code>.</label></li>
      <li><input type="checkbox" id="g4"><label for="g4"><code>git log --oneline</code>
        shows at least one commit, and <code>.venv</code> is <em>not</em> in it.</label></li>
    </ul>

    ${Toolkit.callout(
      `Before the first commit, make sure everyone ran the two
       <code>git config</code> lines. Skipping them makes git refuse the commit with
       <em>"Author identity unknown"</em> — a confusing wall for a beginner that
       one command clears. Worth putting on the board.`,
      { type: "note", label: "For you, the instructor" }
    )}

    <h2>What you accomplished</h2>
    <ul>
      <li>You put your project under <strong>version control</strong> with
      <code>git init</code> and made your first <strong>commit</strong>.</li>
      <li>You can explain git's <strong>three areas</strong> — working directory,
      staging area, repository — and why saving takes <code>add</code> then
      <code>commit</code>.</li>
      <li>You used <strong><code>.gitignore</code></strong> to keep the rebuildable,
      machine-specific <code>.venv</code> out of history.</li>
      <li>You know the habit the course runs on: <strong>commit after every
      lab</strong>. Next you'll push these commits to GitHub so they're backed up
      and shareable.</li>
    </ul>
  `,

  onMount(root) {
    /* ---- OS switcher (install steps) ---- */
    const tabs  = root.querySelectorAll(".os-tab");
    const panes = root.querySelectorAll(".os-pane");
    function pickOS(os) {
      tabs.forEach((t) => t.classList.toggle("active", t.dataset.os === os));
      panes.forEach((p) => { p.hidden = p.dataset.os !== os; });
    }
    tabs.forEach((t) => t.addEventListener("click", () => pickOS(t.dataset.os)));
    pickOS(/win/i.test(navigator.platform || navigator.userAgent) ? "win" : "mac");

    /* ---- Three-areas stepper ------------------------------------------
       state: UNTRACKED | MODIFIED | STAGED | CLEAN
       This mirrors real git: the file always lives in the working
       directory; `git add` places a snapshot in the staging area; `git
       commit` writes that snapshot into the repository's history. ---- */
    let state = "UNTRACKED";
    let stagedKind = "new";      // 'new' | 'modified'
    const commits = [];          // { hash, msg }

    const areasEl  = root.querySelector("#gs-areas");
    const statusEl = root.querySelector("#gs-status");
    const capEl    = root.querySelector("#gs-cap");
    const editBtn  = root.querySelector("#gs-edit");
    const addBtn   = root.querySelector("#gs-add");
    const commitBtn= root.querySelector("#gs-commit");
    const resetBtn = root.querySelector("#gs-reset");

    function shortHash() {
      // illustrative 7-char id, like git's short hashes
      return (Math.random().toString(16) + "0000000").slice(2, 9);
    }

    const WORK_TAG = {
      UNTRACKED: { cls: "red",   text: "new · untracked" },
      MODIFIED:  { cls: "red",   text: "modified · unstaged" },
      STAGED:    { cls: "amber", text: "matches staging" },
      CLEAN:     { cls: "green", text: "clean · matches last commit" },
    };

    const STATUS = {
      UNTRACKED: "Untracked files:\n  (use \"git add\" to track)\n\n    hello.py",
      MODIFIED:  "Changes not staged for commit:\n  (use \"git add\" to stage them)\n\n    modified:  hello.py",
      STAGED:    () => "Changes to be committed:\n\n    " +
                 (stagedKind === "new" ? "new file:  hello.py" : "modified:  hello.py"),
      CLEAN:     "nothing to commit, working tree clean",
    };

    const CAP = {
      UNTRACKED: "hello.py exists, but git isn't tracking it yet. Stage it with git add.",
      MODIFIED:  "You changed hello.py. git sees it, but won't save it until you stage it.",
      STAGED:    "A snapshot of hello.py is waiting in the staging area. Commit it to save it to history.",
      CLEAN:     "Committed. The working directory matches the last saved snapshot. Make an edit to go around again.",
    };

    function area(title, sub, slotHTML) {
      return `<div class="git-area">
          <h4>${title}</h4>
          <div class="ga-sub">${sub}</div>
          <div class="git-slot">${slotHTML}</div>
        </div>`;
    }

    function fileCard() {
      const t = WORK_TAG[state];
      return `<div class="git-file ${t.cls}">
          <div class="gf-name">hello.py</div>
          <div class="gf-tag">${t.text}</div>
        </div>`;
    }

    function stagingSlot() {
      if (state === "STAGED") {
        return `<div class="git-file green">
            <div class="gf-name">hello.py</div>
            <div class="gf-tag">snapshot ready</div>
          </div>`;
      }
      return `<div class="gs-muted">empty</div>`;
    }

    function repoSlot() {
      if (commits.length === 0) return `<div class="gs-muted">no commits yet</div>`;
      return commits
        .map((c, i) => `<div class="git-commit${i === commits.length - 1 ? " head" : ""}">
            <span class="gc-hash">${c.hash}</span>
            <span class="gc-msg">${c.msg}</span>
            ${i === commits.length - 1 ? '<span class="gc-head">HEAD</span>' : ""}
          </div>`)
        .join("");
    }

    function render() {
      areasEl.innerHTML =
        area("Working directory", "the files as they are now", fileCard()) +
        area("Staging area", "the next snapshot", stagingSlot()) +
        area("Repository", "snapshots saved forever", repoSlot());

      const s = STATUS[state];
      statusEl.textContent = typeof s === "function" ? s() : s;
      capEl.textContent = CAP[state];

      editBtn.disabled   = state !== "CLEAN";
      addBtn.disabled    = !(state === "UNTRACKED" || state === "MODIFIED");
      commitBtn.disabled = state !== "STAGED";
    }

    editBtn.addEventListener("click", () => { state = "MODIFIED"; render(); });
    addBtn.addEventListener("click", () => {
      stagedKind = state === "UNTRACKED" ? "new" : "modified";
      state = "STAGED";
      render();
    });
    commitBtn.addEventListener("click", () => {
      const msg = commits.length === 0
        ? "Set up project"
        : "Update hello.py";
      commits.push({ hash: shortHash(), msg });
      state = "CLEAN";
      render();
    });
    resetBtn.addEventListener("click", () => {
      state = "UNTRACKED";
      commits.length = 0;
      render();
    });

    render();
  },
};
