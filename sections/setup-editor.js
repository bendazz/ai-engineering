/* ============================================================
   Section: Set up your editor (and Python)  (LAB)
   Comes BEFORE the Python workbench. Goal: everyone leaves with
   VS Code + Python (3.10+) + the Python extension installed, and a
   working mental map of the four parts of the editor they'll touch
   every day (Explorer, editor, integrated terminal, status bar) plus
   the command palette. The workbench section then does venv work
   inside this editor.
   Interactive: an OS switcher for install steps; an honest LABELED
   SVG SCHEMATIC of the VS Code window (a diagram, not a fake app);
   a predict-then-reveal on PATH; a checklist deliverable.
   NOTE: no literal dollar signs (keeps KaTeX away from terminal
   text); no backtick characters in prose (they'd end the template).
   ============================================================ */

window.SectionContent["setup-editor"] = {
  title: "Set up your editor (and Python)",

  html: `
    <div class="eyebrow">Setup &amp; First Contact · Section 2 · Lab</div>
    <h1>Set up your editor (and Python)</h1>

    <p>Real AI engineers live inside a code editor all day, and the standard one
    across the industry is <strong>Visual Studio Code</strong> (VS Code) — free,
    from Microsoft. It is not just a place to type code: it bundles the
    <strong>terminal</strong>, your <strong>files</strong>, git, and a Run button
    into one window. This session installs it, installs
    <strong>Python</strong>, and gives you a map of the parts you'll use every
    day. Next session you'll build your actual project inside it.</p>

    <h2>Install the three pieces</h2>

    <p>You need three things: the editor, the language, and the extension that
    connects them. Pick your operating system:</p>

    <div class="osswitch" id="osswitch">
      <button class="os-tab" data-os="mac">macOS</button>
      <button class="os-tab" data-os="win">Windows</button>
    </div>

    <div class="os-pane" data-os="mac">
      <ol class="steps">
        <li>Download <strong>VS Code</strong> from
          <code>code.visualstudio.com</code>, open the downloaded file, and drag
          <em>Visual Studio Code</em> into your <strong>Applications</strong>
          folder. Open it.</li>
        <li>Download <strong>Python</strong> (get 3.10 or newer) from
          <code>python.org/downloads</code> and run the installer. Then confirm
          it worked — open the Terminal app and run:
          ${Toolkit.code("Terminal", "python3 --version")}</li>
        <li>Install the <strong>Python extension</strong>: in VS Code, click the
          Extensions icon in the left bar (or press
          <strong>Cmd + Shift + X</strong>), search <em>Python</em>, and install
          the one published by <strong>Microsoft</strong>.</li>
      </ol>
    </div>

    <div class="os-pane" data-os="win" hidden>
      <ol class="steps">
        <li>Download <strong>VS Code</strong> from
          <code>code.visualstudio.com</code> and run the installer (the default
          options are fine).</li>
        <li>Download <strong>Python</strong> (get 3.10 or newer) from
          <code>python.org/downloads</code> and run the installer. On the very
          first screen, <strong>check the box "Add python.exe to PATH"</strong>
          before clicking Install — this one checkbox saves the most common
          headache. Confirm in a new PowerShell window:
          ${Toolkit.code("PowerShell", "python --version")}</li>
        <li>Install the <strong>Python extension</strong>: in VS Code, click the
          Extensions icon in the left bar (or press
          <strong>Ctrl + Shift + X</strong>), search <em>Python</em>, and install
          the one published by <strong>Microsoft</strong>.</li>
      </ol>
    </div>

    ${Toolkit.problem(
      `That Windows step made you tick <em>"Add python.exe to PATH."</em> What is
       PATH, and why would skipping it mean the terminal "can't find Python" even
       though you just installed it?`,
      `<strong>PATH</strong> is a list of folders your terminal searches, in
       order, whenever you type a program's name. Type <code>python</code> and the
       shell walks that list looking for a program called <code>python</code>; the
       first one it finds is the one that runs. If the Python installer never adds
       its folder to PATH, the program is on your disk but not in any folder the
       shell looks in — so the terminal reports "command not found" even though
       Python is right there. Adding it to PATH is what makes the name
       <code>python</code> actually resolve to the program.`,
      { label: "Predict: what is PATH?" }
    )}

    <h2>A map of the window</h2>

    <p>Open VS Code and you'll see roughly this. Four regions do almost all the
    work; here is what each is for. (This is a diagram of the layout, not a live
    editor — your real window will have your own files in it.)</p>

    <div class="vscode-fig">
      <svg viewBox="0 0 680 400" width="100%" role="img"
           aria-label="Diagram of the VS Code window with its main regions labeled">
        <!-- window frame -->
        <rect x="8" y="8" width="664" height="384" rx="12" fill="#ffffff" stroke="#e6e8ef" stroke-width="1.5"/>
        <!-- title bar -->
        <rect x="8" y="8" width="664" height="28" rx="12" fill="#eef0ff"/>
        <rect x="8" y="24" width="664" height="12" fill="#eef0ff"/>
        <circle cx="26" cy="22" r="5" fill="#ff5f57"/>
        <circle cx="42" cy="22" r="5" fill="#febc2e"/>
        <circle cx="58" cy="22" r="5" fill="#28c840"/>
        <text x="340" y="26" text-anchor="middle" font-size="11" fill="#515a6e">ai-engineering — Visual Studio Code</text>

        <!-- activity bar -->
        <rect x="9" y="37" width="38" height="337" fill="#1f2430"/>
        <rect x="16" y="54" width="16" height="14" rx="2" fill="#cdd3e0"/>
        <rect x="16" y="86" width="16" height="14" rx="2" fill="#8a93a6"/>
        <rect x="16" y="118" width="16" height="14" rx="2" fill="#8a93a6"/>
        <rect x="16" y="150" width="16" height="14" rx="2" fill="#8a93a6"/>

        <!-- side bar (explorer) -->
        <rect x="47" y="37" width="168" height="337" fill="#f7f8fc" stroke="#e6e8ef"/>
        <text x="63" y="58" font-size="10" letter-spacing="1" fill="#8a93a6">EXPLORER</text>
        <text x="63" y="80" font-size="11" font-weight="700" fill="#515a6e">AI-ENGINEERING</text>
        <text x="78" y="100" font-size="11" fill="#8a93a6">.venv</text>
        <text x="78" y="120" font-size="11" fill="#515a6e">hello.py</text>
        <text x="78" y="140" font-size="11" fill="#515a6e">requirements.txt</text>

        <!-- editor -->
        <rect x="215" y="37" width="457" height="213" fill="#ffffff"/>
        <rect x="215" y="37" width="457" height="26" fill="#f2f3f8"/>
        <rect x="215" y="37" width="92" height="26" fill="#ffffff" stroke="#e6e8ef"/>
        <text x="230" y="54" font-size="11" fill="#1f2430">hello.py</text>
        <text x="235" y="92" font-size="12" font-family="monospace" fill="#8a5a08">import sys</text>
        <text x="235" y="114" font-size="12" font-family="monospace" fill="#515a6e">print(sys.prefix)</text>

        <!-- command palette popover -->
        <rect x="360" y="150" width="292" height="30" rx="6" fill="#ffffff" stroke="#4f46e5" stroke-width="1.5"/>
        <text x="374" y="169" font-size="11" font-family="monospace" fill="#515a6e">Python: Select Interpreter</text>

        <!-- integrated terminal -->
        <rect x="215" y="250" width="457" height="124" fill="#1f2430"/>
        <text x="235" y="270" font-size="10" letter-spacing="1" fill="#8a93a6">TERMINAL</text>
        <text x="235" y="296" font-size="11" font-family="monospace" fill="#9fe3c9">(.venv) ai-engineering %</text>
        <text x="235" y="316" font-size="11" font-family="monospace" fill="#e7ebf3">python hello.py</text>
        <text x="235" y="336" font-size="11" font-family="monospace" fill="#9fe3c9">Python 3.12 is ready</text>

        <!-- status bar -->
        <rect x="9" y="374" width="662" height="17" rx="3" fill="#4f46e5"/>
        <text x="20" y="386" font-size="10" fill="#ffffff">.venv (Python 3.12)</text>

        <!-- numbered callout badges -->
        <g font-size="12" font-weight="700" text-anchor="middle">
          <circle cx="57" cy="80" r="11" fill="#4f46e5" stroke="#fff" stroke-width="2"/>
          <text x="57" y="84" fill="#fff">1</text>
          <circle cx="225" cy="80" r="11" fill="#4f46e5" stroke="#fff" stroke-width="2"/>
          <text x="225" y="84" fill="#fff">2</text>
          <circle cx="225" cy="262" r="11" fill="#4f46e5" stroke="#fff" stroke-width="2"/>
          <text x="225" y="266" fill="#fff">3</text>
          <circle cx="20" cy="382" r="9" fill="#4f46e5" stroke="#fff" stroke-width="2"/>
          <text x="20" y="386" fill="#fff" font-size="10">4</text>
          <circle cx="360" cy="150" r="11" fill="#4f46e5" stroke="#fff" stroke-width="2"/>
          <text x="360" y="154" fill="#fff">5</text>
        </g>
      </svg>
    </div>

    <ol class="fig-legend">
      <li><strong>Explorer</strong> — your project's files. You open a
        <em>folder</em> here and it becomes your project.</li>
      <li><strong>Editor</strong> — where you read and write code.</li>
      <li><strong>Integrated terminal</strong> — a full terminal inside the
        window (Terminal → New Terminal). This is where you'll run venv, Python,
        and git commands, so you never leave the editor.</li>
      <li><strong>Status bar</strong> — shows which <strong>Python
        interpreter</strong> is active for this project (you'll set this next
        session).</li>
      <li><strong>Command palette</strong> — press
        <strong>Ctrl/Cmd + Shift + P</strong> and type; it's how you reach any
        command by name, including <em>Python: Select Interpreter</em>.</li>
    </ol>

    ${Toolkit.callout(
      `The two things worth demoing live, because they remove most "I'm lost in
       this window" friction: (1) <strong>File → Open Folder</strong> to open a
       project — students coming from notebooks often try to open single files and
       get confused; the folder is the unit of work here. (2) <strong>Terminal →
       New Terminal</strong> to show the terminal is <em>inside</em> VS Code.
       Everything else they'll pick up by using it.`,
      { type: "note", label: "For you, the instructor" }
    )}

    <h2>One tidy checkpoint</h2>

    <p>Before you stop, confirm all four are true. This is the deliverable for the
    session — a working editor you'll build your project in next time:</p>

    <ul class="checklist">
      <li><input type="checkbox" id="e1"><label for="e1">VS Code opens on my
        machine.</label></li>
      <li><input type="checkbox" id="e2"><label for="e2">Python 3.10+ is installed
        (<code>python --version</code> works in a terminal).</label></li>
      <li><input type="checkbox" id="e3"><label for="e3">The Microsoft
        <strong>Python</strong> extension is installed in VS Code.</label></li>
      <li><input type="checkbox" id="e4"><label for="e4">I can open a folder in the
        Explorer and open an integrated terminal.</label></li>
    </ul>

    <h2>What you accomplished</h2>
    <ul>
      <li>You installed the industry-standard editor, <strong>VS Code</strong>,
      plus <strong>Python</strong> and the <strong>Python extension</strong>.</li>
      <li>You can name the four regions you'll use daily — <strong>Explorer,
      editor, integrated terminal, status bar</strong> — and reach any command
      through the <strong>command palette</strong>.</li>
      <li>You understand <strong>PATH</strong>: why a program can be installed yet
      "not found," and what that checkbox really did.</li>
      <li>Your editor is ready to hold the reproducible project you'll build
      next.</li>
    </ul>
  `,

  onMount(root) {
    /* ---- OS switcher: show the install steps for the chosen platform ---- */
    const tabs  = root.querySelectorAll(".os-tab");
    const panes = root.querySelectorAll(".os-pane");
    function pickOS(os) {
      tabs.forEach((t) => t.classList.toggle("active", t.dataset.os === os));
      panes.forEach((p) => { p.hidden = p.dataset.os !== os; });
    }
    tabs.forEach((t) => t.addEventListener("click", () => pickOS(t.dataset.os)));
    pickOS(/win/i.test(navigator.platform || navigator.userAgent) ? "win" : "mac");
  },
};
