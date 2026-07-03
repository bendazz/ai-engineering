/* ============================================================
   Section: Your Python workbench  (LAB)
   First hands-on session of the Setup block. Goal: every student
   leaves with a clean, REPRODUCIBLE project — a folder, an
   isolated virtual environment, a pinned requirements file, and a
   first script that runs. No git, no GitHub, no API key yet (those
   are the next three sessions).
   Big idea planted: reproducibility. "Works on my machine" is the
   enemy; a controlled environment is what later makes evals
   trustworthy (same setup -> same numbers).
   Interactives: an isolation visualizer (why venvs exist), an OS
   switcher for the commands, and a predict-then-reveal.
   NOTE: no literal dollar signs anywhere (keeps KaTeX out of the
   terminal text), and Windows backslashes are written as an escaped
   pair in source so a single one survives into the rendered path.
   ============================================================ */

window.SectionContent["setup-workbench"] = {
  title: "Your Python workbench",

  html: `
    <div class="eyebrow">Setup &amp; First Contact · Section 3 · Lab</div>
    <h1>Your Python workbench</h1>

    <p>You already know how to write Python. This session is about the part that
    self-taught coders usually skip and professionals never do: setting up the
    <strong>workbench</strong> around the code so that your project is
    <strong>reproducible</strong> — it runs the same way on your machine today, on
    your machine in three months, and on a teammate's machine that has never seen
    it. "It works on my machine" is the oldest excuse in software, and the whole
    point of a workbench is to make it stop being an excuse.</p>

    ${Toolkit.callout(
      `This matters more here than in most courses. Soon you'll be measuring your
       AI systems with <strong>evals</strong> — running them and reading off
       numbers. A number you can't reproduce is a number you can't trust. A
       controlled environment is the first link in that chain, which is why we
       build it before anything else.`,
      { type: "ai", label: "Why this comes first" }
    )}

    <h2>The problem a virtual environment solves</h2>

    <p>Here is the trouble with installing Python packages the obvious way — one
    big shared pile for your whole computer. Two projects can need
    <em>different, incompatible versions</em> of the same package, and a single
    shared pile can only hold one of them. Install what Project B needs and you
    silently break Project A. Flip the toggle below and watch it happen.</p>

    ${Toolkit.widget(
      "One shared pile vs. a box per project",
      `<div id="vv-root"></div>
       <div class="controls">
         <button class="btn" id="vv-toggle">Switch to a venv per project</button>
       </div>
       <div class="vv-cap" id="vv-cap"></div>`
    )}

    <p>A <strong>virtual environment</strong> (a "venv") is just that second
    picture: a private box that lives <em>inside your project folder</em> and
    holds this project's own copy of Python and its own packages. Activate it and
    <code>pip install</code> drops packages into the box, not into the shared
    pile. Every project gets its own box; nobody steps on anyone else.</p>

    <h2>Build your project — hands on</h2>

    <p>Open your project in VS Code (File → Open Folder) and open the
    <strong>integrated terminal</strong> (Terminal → New Terminal). Python is
    already installed from last session; confirm it's there and is version
    <strong>3.10 or newer</strong>. Pick your operating system — the commands
    differ a little:</p>

    <div class="osswitch" id="osswitch">
      <button class="os-tab" data-os="mac">macOS / Linux</button>
      <button class="os-tab" data-os="win">Windows (PowerShell)</button>
    </div>

    <div class="os-pane" data-os="mac">
      ${Toolkit.code("Terminal", "python3 --version")}
      <ol class="steps">
        <li>Make a project folder and step into it:
          ${Toolkit.code("Terminal", "mkdir ai-engineering\ncd ai-engineering")}
        </li>
        <li>Create a virtual environment named <code>.venv</code> inside it:
          ${Toolkit.code("Terminal", "python3 -m venv .venv")}
        </li>
        <li>Activate it. Your prompt will change to show <code>(.venv)</code>:
          ${Toolkit.code("Terminal", "source .venv/bin/activate")}
        </li>
      </ol>
    </div>

    <div class="os-pane" data-os="win" hidden>
      ${Toolkit.code("PowerShell", "python --version")}
      <ol class="steps">
        <li>Make a project folder and step into it:
          ${Toolkit.code("PowerShell", "mkdir ai-engineering\ncd ai-engineering")}
        </li>
        <li>Create a virtual environment named <code>.venv</code> inside it:
          ${Toolkit.code("PowerShell", "python -m venv .venv")}
        </li>
        <li>Activate it. Your prompt will change to show <code>(.venv)</code>:
          ${Toolkit.code("PowerShell", ".venv\\Scripts\\Activate.ps1")}
        </li>
      </ol>
    </div>

    <p>One more step, so the editor and the venv agree: open the
    <strong>command palette</strong> (Ctrl/Cmd + Shift + P), run
    <strong>Python: Select Interpreter</strong>, and choose the one inside
    <code>.venv</code>. Now VS Code's Run button and every new integrated terminal
    use this project's Python automatically, and the interpreter name appears in
    the status bar.</p>

    ${Toolkit.callout(
      `<strong>Windows activation blocked?</strong> If PowerShell refuses with an
       "execution policy" error, run
       <code>Set-ExecutionPolicy -Scope CurrentUser RemoteSigned</code> once,
       answer <em>Yes</em>, then try activating again. (If Python itself is
       missing, that's last session's install — send them back to it.)
       Budget real time here — a first environment is where a class most often
       gets stuck, and it is worth walking the room.`,
      { type: "note", label: "For you, the instructor" }
    )}

    <p>Once you see <code>(.venv)</code> at the start of your prompt, the box is
    active. From now on, <code>python</code> and <code>pip</code> mean
    <em>this project's</em> copies. Install a package to prove it, then write down
    exactly what you installed:</p>

    ${Toolkit.code("Terminal", "pip install requests\npip freeze &gt; requirements.txt")}

    <p>That second line is the professional habit. <code>pip freeze</code> lists
    every package and its exact version; the <code>&gt;</code> saves that list
    into <code>requirements.txt</code>. Hand someone that file and they can
    rebuild your exact environment with one command
    (<code>pip install -r requirements.txt</code>). That file <em>is</em>
    reproducibility, written down.</p>

    <h2>Run something</h2>

    <p>Create a file called <code>hello.py</code> in the project folder with this
    inside:</p>

    ${Toolkit.code("hello.py", "import sys\nprint(\"Python\", sys.version.split()[0], \"is ready in\", sys.prefix)")}

    <p>Run it (inside the activated venv):</p>

    ${Toolkit.code("Terminal", "python hello.py")}

    ${Toolkit.problem(
      `Before you run it — what will <code>sys.prefix</code> print, and why does
       it matter? Take a guess.`,
      `<code>sys.prefix</code> prints the path to the Python that is running, and
       inside an activated venv it points <em>into your project's
       <code>.venv</code> folder</em> — not the system Python. That is the whole
       proof that the box is working: your code is running against the isolated
       copy, so anything you install stays local to this project. If it points
       somewhere system-wide instead, the venv is not actually activated (look for
       <code>(.venv)</code> in your prompt).`,
      { label: "Predict, then run" }
    )}

    <h2>One folder, checked</h2>

    <p>Tick these off before you stop. This is the deliverable for the session — a
    clean, reproducible project you'll build on for the rest of the course:</p>

    <ul class="checklist">
      <li><input type="checkbox" id="c1"><label for="c1">A folder named
        <code>ai-engineering</code> exists.</label></li>
      <li><input type="checkbox" id="c2"><label for="c2">It contains a
        <code>.venv</code> folder, and I can activate it (I see
        <code>(.venv)</code> in my prompt).</label></li>
      <li><input type="checkbox" id="c3"><label for="c3">It contains a
        <code>requirements.txt</code> listing <code>requests</code>.</label></li>
      <li><input type="checkbox" id="c4"><label for="c4"><code>python hello.py</code>
        runs and prints a path pointing into my project's <code>.venv</code>.</label></li>
    </ul>

    ${Toolkit.callout(
      `The single most common mix-up all session: a student opens a
       <em>new</em> terminal and their commands "stop working" or install into the
       wrong place — because a venv is only active in the terminal where you ran
       <code>activate</code>. New terminal, new tab, reopened editor: activate
       again. Saying this out loud three times today saves a dozen confused
       questions later.`,
      { type: "note", label: "For you, the instructor" }
    )}

    <h2>What you accomplished</h2>
    <ul>
      <li>You built a <strong>reproducible project</strong>: a folder, an isolated
      <strong>virtual environment</strong>, and a pinned
      <code>requirements.txt</code>.</li>
      <li>You know <em>why</em> venvs exist — to stop projects with conflicting
      package versions from breaking each other — and how to activate one.</li>
      <li>You proved the isolation is real by reading <code>sys.prefix</code>.</li>
      <li>You set the habit the whole course leans on: a controlled environment,
      because reproducible setups are what make reproducible <strong>evals</strong>
      possible.</li>
    </ul>
  `,

  onMount(root) {
    /* ---- OS switcher: show the commands for the chosen platform ---- */
    const tabs  = root.querySelectorAll(".os-tab");
    const panes = root.querySelectorAll(".os-pane");
    function pickOS(os) {
      tabs.forEach((t) => t.classList.toggle("active", t.dataset.os === os));
      panes.forEach((p) => { p.hidden = p.dataset.os !== os; });
    }
    tabs.forEach((t) => t.addEventListener("click", () => pickOS(t.dataset.os)));
    // Default to the visitor's likely OS.
    pickOS(/win/i.test(navigator.platform || navigator.userAgent) ? "win" : "mac");

    /* ---- Isolation visualizer: shared pile vs. a box per project ---- */
    const vvRoot = root.querySelector("#vv-root");
    const vvCap  = root.querySelector("#vv-cap");
    const vvBtn  = root.querySelector("#vv-toggle");
    let isolated = false;

    function proj(name, need, ok) {
      return `<div class="vv-proj ${ok ? "ok" : "bad"}">
          <div class="vv-proj-name">${name}</div>
          <div class="vv-proj-need">needs chart-lib <strong>${need}</strong></div>
          <div class="vv-proj-flag">${ok ? "✓ works" : "✗ broken"}</div>
        </div>`;
    }

    function render() {
      if (!isolated) {
        vvRoot.innerHTML = `
          <div class="vv-row">
            ${proj("Project A", "v1", false)}
            ${proj("Project B", "v2", true)}
          </div>
          <div class="vv-pile">
            <div class="vv-pile-name">One shared Python (system-wide)</div>
            <div class="vv-pile-holds">holds chart-lib <strong>v2</strong> — only room for one</div>
          </div>`;
        vvCap.innerHTML = "Both projects draw from the same pile. It can hold only " +
          "one version of chart-lib, so installing what Project B needs " +
          "<strong>silently breaks Project A</strong>.";
        vvBtn.textContent = "Switch to a venv per project";
      } else {
        vvRoot.innerHTML = `
          <div class="vv-row">
            <div class="vv-unit">
              ${proj("Project A", "v1", true)}
              <div class="vv-box">.venv → chart-lib <strong>v1</strong></div>
            </div>
            <div class="vv-unit">
              ${proj("Project B", "v2", true)}
              <div class="vv-box">.venv → chart-lib <strong>v2</strong></div>
            </div>
          </div>`;
        vvCap.innerHTML = "Each project carries its own box with its own version. " +
          "Nobody steps on anyone else — <strong>both work</strong>.";
        vvBtn.textContent = "Back to one shared pile";
      }
    }
    vvBtn.addEventListener("click", () => { isolated = !isolated; render(); });
    render();
  },
};
