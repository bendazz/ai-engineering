/* ============================================================
   Section: Back up your work on GitHub  (LAB)
   Setup block, section 5. Push the local repo to a remote. Primary
   path is VS Code's built-in "Publish to GitHub" (browser auth, no
   tokens) on a PLAIN free account — deliberately NOT the Student
   Developer Pack (see toolchain-decisions memory). Also teaches the
   remote/origin/push model on the command line for understanding.
   Key reassurance (addresses the instructor's past GitHub pain): git
   is DISTRIBUTED — your full history lives locally, so a GitHub freeze
   or outage costs you a backup, never your work.
   Star interactive: a local<->remote SYNC visualizer with an outage
   toggle that proves the safety net.
   Steps verified 2026-07-02 against code.visualstudio.com and
   docs.github.com (see verified-facts memory).
   NOTE: no literal dollar signs (KaTeX); no backtick chars in prose.
   ============================================================ */

window.SectionContent["setup-github"] = {
  title: "Back up your work on GitHub",

  html: `
    <div class="eyebrow">Setup &amp; First Contact · Section 5 · Lab</div>
    <h1>Back up your work on GitHub</h1>

    <p>Your commits from last session live on your machine and nowhere else. Today
    you'll push a copy to <strong>GitHub</strong> — a website that stores git
    repositories online. That copy earns its keep three ways: it's a
    <strong>backup</strong> if your laptop dies, it's a <strong>portfolio</strong>
    you can show an employer, and it's the foundation we'll build on later for
    automated testing and deployment. Keep one thing in perspective, though: GitHub
    is a <em>mirror</em> of your work, never the original.</p>

    <h2>The mental model: a local repo and a remote</h2>

    <p>git calls an online copy of your repository a <strong>remote</strong>. By
    convention your main remote is named <strong>origin</strong>. You do all your
    real work locally — edit, stage, commit — and every so often you
    <strong>push</strong>: send your new local commits up to the remote. (Pulling
    is the reverse, for when a teammate — or a future you on another machine — has
    added commits you don't have yet.)</p>

    <p>The picture below is the whole relationship. Make a couple of local commits,
    push them to GitHub, and then — this is the important part — flip GitHub
    <em>offline</em> and see what happens to your work.</p>

    ${Toolkit.widget(
      "Local repo ↔ GitHub (origin)",
      `<div class="sync-panes" id="sy-panes"></div>
       <div class="gs-cap" id="sy-cap"></div>
       <div class="controls">
         <button class="btn ghost" id="sy-commit">Make a local commit</button>
         <button class="btn" id="sy-push">git push</button>
         <button class="btn ghost" id="sy-toggle">Toggle GitHub connection</button>
         <button class="btn ghost" id="sy-reset">Reset</button>
       </div>
       <div class="nd-cap">A model of pushing. Notice that your local column never
         loses a commit — no matter what GitHub is doing.</div>`
    )}

    ${Toolkit.callout(
      `This is the reassurance to say plainly, because it is genuinely true and it
       removes a real fear: <strong>git is distributed.</strong> Every clone is a
       full copy — all your files and the entire history. GitHub going down,
       rate-limiting you, or even freezing an account costs you a
       <em>backup</em>, not your project. Your work is never hostage to a website.`,
      { type: "ai", label: "Why GitHub is never the critical path" }
    )}

    <h2>Step 1 — Get a free GitHub account</h2>

    <p>Go to <code>github.com</code> and sign up for a <strong>free</strong> account
    — the plain one; you don't need any student or paid plan for this course. Pick a
    username you wouldn't mind an employer seeing.</p>

    <h2>Step 2 — Publish from VS Code (the easy way)</h2>

    <p>Because you're already in VS Code, publishing is nearly one click, and it
    handles sign-in for you — no passwords or tokens to manage.</p>

    <ol class="steps">
      <li>Open the <strong>Source Control</strong> view (the branch icon in the
        left Activity Bar). Your project already has commits but no online copy, so
        you'll see a <strong>Publish Branch</strong> button. Click it. (The same
        thing lives in the Command Palette as <strong>Publish to GitHub</strong>.)</li>
      <li>The first time, a browser window opens to <strong>sign in to
        GitHub</strong> and authorize VS Code. Approve it and return to VS Code —
        that's the built-in sign-in doing its job.</li>
      <li>VS Code asks whether to publish a <strong>public</strong> or
        <strong>private</strong> repository. Choose <strong>public</strong> so it
        can double as a portfolio. (Your <code>.gitignore</code> keeps
        <code>.venv</code> and secrets out — which is exactly why we set it up
        first.)</li>
    </ol>

    <p>That single action did three things: created a repository on GitHub, linked
    it to your local repo as the remote named <strong>origin</strong>, and pushed
    your commits. Confirm the link from the integrated terminal:</p>

    ${Toolkit.code("Terminal", "git remote -v")}

    <p>You should see <code>origin</code> pointing at your new GitHub URL. Refresh
    the repository page on <code>github.com</code> and your files are there — but
    <strong>not</strong> <code>.venv</code>, because git is ignoring it.</p>

    ${Toolkit.callout(
      `The one place a student can stall is the browser authorization popup — it can
       hide behind the editor or get dismissed. If "Publish" seems to hang, it's
       almost always waiting on that browser tab; have them look for it and click
       <em>Authorize</em>. We use plain free accounts on purpose — no Student
       Developer Pack, no eligibility check that can leave someone locked out for
       weeks. Publishing works the moment they have an account.`,
      { type: "note", label: "For you, the instructor" }
    )}

    <h2>Step 3 — What that did, on the command line</h2>

    <p>The button is convenient, but you should know what it stands in for, because
    you'll type these yourself in other projects. Publishing an existing repo by
    hand is: create an <strong>empty</strong> repository on GitHub (with
    <em>no</em> README, license, or .gitignore — your project already has its own),
    then connect and push:</p>

    ${Toolkit.code("Terminal", "git remote add origin https://github.com/you/ai-engineering.git\ngit push -u origin main")}

    <p>The <code>-u</code> ties your local <code>main</code> branch to
    <code>origin/main</code>, so from then on a bare <strong><code>git push</code></strong>
    (or VS Code's <strong>Sync Changes</strong> button) is all it takes.</p>

    ${Toolkit.callout(
      `Extend last session's rhythm by one word: <strong>commit after every lab,
       push at the end of class.</strong> Committing checkpoints your work; pushing
       backs it up and keeps your portfolio current. In VS Code that's the
       <strong>Sync Changes</strong> button; on the command line it's
       <code>git push</code>.`,
      { type: "ai", label: "The habit, extended" }
    )}

    ${Toolkit.problem(
      `Suppose GitHub freezes your account the night before your project is due, for
       no reason you can find. You've been committing and pushing all semester. How
       much of your work have you actually lost?`,
      `<strong>None of it.</strong> Because git is distributed, the complete
       repository — every file and the entire commit history — is sitting in the
       <code>.git</code> folder on your own machine. A frozen GitHub account means
       you've temporarily lost the <em>online mirror</em>, not the project. You can
       keep working locally exactly as before, and push the whole history to a new
       remote (a fresh GitHub repo, GitLab, a classmate's fork, a USB drive) in
       under a minute. This is the concrete reason we never let GitHub sit on the
       critical path.`,
      { label: "Predict: the frozen account" }
    )}

    <h2>Pushed and checked</h2>

    <p>Confirm before you stop:</p>

    <ul class="checklist">
      <li><input type="checkbox" id="h1"><label for="h1">I have a free GitHub
        account.</label></li>
      <li><input type="checkbox" id="h2"><label for="h2">My <code>ai-engineering</code>
        repository shows up on <code>github.com</code> with my files.</label></li>
      <li><input type="checkbox" id="h3"><label for="h3"><code>git remote -v</code>
        shows an <code>origin</code>, and <code>.venv</code> is <em>not</em> in the
        online repo.</label></li>
      <li><input type="checkbox" id="h4"><label for="h4">I know how to push new
        commits (Sync Changes, or <code>git push</code>).</label></li>
    </ul>

    <h2>What you accomplished</h2>
    <ul>
      <li>You published your local repo to <strong>GitHub</strong> — a backup, a
      portfolio, and the base for automated testing and deployment later.</li>
      <li>You understand the <strong>remote / origin / push</strong> model, both the
      VS Code button and the <code>git remote add</code> / <code>git push</code>
      commands it stands for.</li>
      <li>You saw, first-hand, that <strong>git is distributed</strong>: your full
      history lives locally, so GitHub is never the critical path.</li>
      <li>Your setup is complete — a reproducible, version-controlled, backed-up
      project. Next you'll put a real model to work inside it.</li>
    </ul>
  `,

  onMount(root) {
    /* ---- Local <-> remote sync visualizer -----------------------------
       local: commits on the student's machine. remote: what GitHub has.
       remote is always a prefix of local (you can only push what you have).
       online=false models a GitHub outage/freeze — local is untouched. */
    const seed = () => ([
      { hash: shortHash(), msg: "Set up project" },
      { hash: shortHash(), msg: "Add hello.py" },
    ]);
    function shortHash() {
      return (Math.random().toString(16) + "0000000").slice(2, 9);
    }

    let local = seed();
    let remote = [];      // nothing pushed yet
    let online = true;
    let nextN = 1;

    const panesEl  = root.querySelector("#sy-panes");
    const capEl    = root.querySelector("#sy-cap");
    const commitBtn= root.querySelector("#sy-commit");
    const pushBtn  = root.querySelector("#sy-push");
    const toggleBtn= root.querySelector("#sy-toggle");
    const resetBtn = root.querySelector("#sy-reset");

    function chips(list) {
      if (list.length === 0) return `<div class="gs-muted">nothing here yet</div>`;
      return list
        .map((c, i) => `<div class="git-commit${i === list.length - 1 ? " head" : ""}">
            <span class="gc-hash">${c.hash}</span>
            <span class="gc-msg">${c.msg}</span>
            ${i === list.length - 1 ? '<span class="gc-head">HEAD</span>' : ""}
          </div>`)
        .join("");
    }

    function render() {
      const ahead = local.length - remote.length;
      panesEl.innerHTML =
        `<div class="sync-panel">
           <h4>Your machine</h4>
           <div class="ga-sub">local repository — where you work</div>
           <div class="sync-list">${chips(local)}</div>
         </div>
         <div class="sync-panel${online ? "" : " offline"}">
           <h4>GitHub (origin)</h4>
           <div class="ga-sub">${online ? "online mirror" : "unreachable"}</div>
           <div class="sync-list">${online ? chips(remote) : '<div class="sync-off">GitHub unreachable</div>'}</div>
         </div>`;

      if (!online) {
        capEl.textContent = ahead > 0
          ? "GitHub is unreachable — but your " + local.length + " commit(s) are all safe on your machine. Push when it's back."
          : "GitHub is unreachable — your work is untouched on your machine either way.";
      } else if (ahead > 0) {
        capEl.textContent = "Your machine is ahead of GitHub by " + ahead +
          " commit(s). Push to back them up.";
      } else {
        capEl.textContent = "In sync — GitHub has every commit your machine does.";
      }

      commitBtn.disabled = false;
      pushBtn.disabled   = !online || ahead === 0;
      toggleBtn.textContent = online ? "Take GitHub offline" : "Bring GitHub back";
    }

    commitBtn.addEventListener("click", () => {
      local.push({ hash: shortHash(), msg: "Work on lab " + nextN++ });
      render();
    });
    pushBtn.addEventListener("click", () => {
      if (!online) return;
      remote = local.slice();
      render();
    });
    toggleBtn.addEventListener("click", () => { online = !online; render(); });
    resetBtn.addEventListener("click", () => {
      local = seed(); remote = []; online = true; nextN = 1; render();
    });

    render();
  },
};
