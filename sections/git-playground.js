/* ============================================================
   Section: Git pointers playground  (INTERACTIVE LAB / PROTOTYPE)
   A course-native, faithful mini-git model rendered as a live graph:
   commits (immutable nodes) + branch labels (movable pointers) + HEAD.
   You run real git commands and watch the pointers move. Built to make
   the hidden state visible -- the thing that makes git hard.
   Two modes: FREE PLAY (type commands into a sandbox) and CHALLENGES
   (scripted goal-states to reach). Supports: commit, branch [<target>],
   branch -d/-D, switch, switch -c, checkout <ref>, reset [--hard] <ref>,
   with ref resolution (branch name / commit id / HEAD / ~n ancestors).

   ENGINE is exposed as window.GitVizEngine (a factory returning a pure
   state machine, no DOM) so it can be unit-tested headless AND reused as
   embedded scenario widgets in other git sections later.

   PROTOTYPE placement: registered at the END of the manifest with an
   UNNUMBERED eyebrow, so it does NOT disturb the global 1..47 numbering.
   Weave into the git thread (renumbering) only once it's approved.

   Reuses palette vars; adds a focused .gp-* CSS block to styles.css.
   NOTE: KaTeX-free (no literal dollar signs); no backtick chars in prose;
   every literal < or > in the html string is &lt; &gt;. Raw < in onMount
   JS is fine. Keep the block-comment terminator out of prose.
   ============================================================ */

/* ---- The engine: a faithful, DOM-free mini-git state machine ---------
   State = commits (id -> {id, parent, lane}) + refs (name -> commitId) +
   HEAD ({type:"branch",name} attached, or {type:"commit",id} detached).
   Every command is a well-defined transition on that structure. ---- */
window.GitVizEngine = function GitVizEngine() {
  let counter, commits, order, refs, head, laneNext, laneCont;

  function makeId() {
    let s;
    do {
      counter++;
      const n = (counter * 2654435761) >>> 0;
      s = ("0000000" + n.toString(16)).slice(-7);
    } while (commits[s]);
    return s;
  }

  function makeCommit(parent) {
    const id = makeId();
    let lane;
    if (parent == null) lane = laneNext++;
    else if (!laneCont[parent]) { laneCont[parent] = true; lane = commits[parent].lane; }
    else lane = laneNext++;
    commits[id] = { id: id, parent: parent, lane: lane };
    order.push(id);
    return id;
  }

  function headCommit() {
    return head.type === "branch" ? refs[head.name] : head.id;
  }

  function ancestors(id) {
    const s = {};
    let c = id;
    while (c != null && commits[c]) { s[c] = true; c = commits[c].parent; }
    return s;
  }

  // Resolve a ref string to a commit id: <branch> | <commitId> | HEAD, with
  // an optional ~n suffix walking parent links.
  function resolve(ref) {
    if (!ref) return null;
    let base = ref, ups = 0;
    const tilde = ref.indexOf("~");
    if (tilde >= 0) { base = ref.slice(0, tilde); ups = parseInt(ref.slice(tilde + 1) || "1", 10); }
    let id;
    if (base === "HEAD") id = headCommit();
    else if (refs[base] != null) id = refs[base];
    else if (commits[base]) id = base;
    else return null;
    while (ups-- > 0 && id != null) id = commits[id] ? commits[id].parent : null;
    return id;
  }

  function reset(seedCount) {
    counter = 0; commits = {}; order = []; refs = {}; laneNext = 0; laneCont = {};
    const n = seedCount == null ? 3 : seedCount;
    let prev = null;
    for (let i = 0; i < Math.max(1, n); i++) prev = makeCommit(prev);
    refs.main = prev;
    head = { type: "branch", name: "main" };
  }

  // Run one command string. Returns {ok, msg} or {ok:false, err}.
  function run(cmd) {
    const t = String(cmd).trim().split(/\s+/).filter(Boolean);
    if (!t.length) return { ok: false, err: "type a command" };
    const verb = t[0];

    if (verb === "commit") {
      const parent = headCommit();
      const id = makeCommit(parent);
      if (head.type === "branch") { refs[head.name] = id; return { ok: true, msg: "committed " + id + " on " + head.name }; }
      head = { type: "commit", id: id };
      return { ok: true, msg: "committed " + id + " in DETACHED HEAD (on no branch)" };
    }

    if (verb === "branch") {
      if (t[1] === "-d" || t[1] === "-D") {
        const name = t[2];
        if (!refs[name]) return { ok: false, err: "no such branch: " + name };
        if (head.type === "branch" && head.name === name) return { ok: false, err: "cannot delete the branch you are on (" + name + ")" };
        const merged = ancestors(headCommit())[refs[name]] === true;
        if (t[1] === "-d" && !merged) return { ok: false, err: "branch " + name + " is not merged; refusing. Use -D to force." };
        delete refs[name];
        return { ok: true, msg: "deleted branch " + name };
      }
      const name = t[1];
      if (!name) return { ok: false, err: "branch needs a name" };
      if (refs[name]) return { ok: false, err: "branch " + name + " already exists" };
      const target = resolve(t[2] || "HEAD");
      if (target == null) return { ok: false, err: "cannot resolve target: " + (t[2] || "HEAD") };
      refs[name] = target;
      return { ok: true, msg: "created branch " + name + " at " + target + " (HEAD did not move)" };
    }

    if (verb === "switch") {
      if (t[1] === "-c") {
        const name = t[2];
        if (!name) return { ok: false, err: "switch -c needs a name" };
        if (refs[name]) return { ok: false, err: "branch " + name + " already exists" };
        const target = resolve(t[3] || "HEAD");
        if (target == null) return { ok: false, err: "cannot resolve target" };
        refs[name] = target; head = { type: "branch", name: name };
        return { ok: true, msg: "created and switched to " + name };
      }
      const name = t[1];
      if (refs[name] == null) return { ok: false, err: "no such branch: " + name + " (switch needs a branch; use checkout for a commit)" };
      head = { type: "branch", name: name };
      return { ok: true, msg: "switched to branch " + name };
    }

    if (verb === "checkout") {
      const ref = t[1];
      if (refs[ref] != null) { head = { type: "branch", name: ref }; return { ok: true, msg: "switched to branch " + ref }; }
      const id = resolve(ref);
      if (id == null) return { ok: false, err: "cannot resolve: " + ref };
      head = { type: "commit", id: id };
      return { ok: true, msg: "HEAD is now DETACHED at " + id + " (you are not on a branch)" };
    }

    if (verb === "reset") {
      const args = t.slice(1).filter(function (x) { return x.slice(0, 2) !== "--"; });
      const ref = args[0];
      const id = resolve(ref);
      if (id == null) return { ok: false, err: "cannot resolve: " + (ref || "(missing)") };
      if (head.type === "branch") { refs[head.name] = id; return { ok: true, msg: "moved " + head.name + " to " + id }; }
      head = { type: "commit", id: id };
      return { ok: true, msg: "moved HEAD to " + id };
    }

    return { ok: false, err: "unknown command: " + verb };
  }

  function status() {
    if (head.type === "branch") return "On branch " + head.name;
    return "HEAD detached at " + head.id;
  }

  function snapshot() {
    const c = {};
    Object.keys(commits).forEach(function (k) { c[k] = { id: commits[k].id, parent: commits[k].parent, lane: commits[k].lane }; });
    const r = {}; Object.keys(refs).forEach(function (k) { r[k] = refs[k]; });
    return { commits: c, order: order.slice(), refs: r, head: { type: head.type, name: head.name, id: head.id } };
  }

  reset();
  return { run: run, reset: reset, status: status, snapshot: snapshot, resolve: resolve, refs: function () { return refs; }, head: function () { return head; } };
};

/* ---- The section: UI wrapping the engine --------------------------- */
window.SectionContent["git-playground"] = {
  title: "Git pointers playground",

  html: `
    <div class="eyebrow">Interactive Lab</div>
    <h1>Git pointers playground</h1>

    <p>Git is hard mostly because its state is <em>invisible</em>. Underneath, it is a
    small, clean machine: <strong>commits</strong> are immutable nodes; <strong>branch
    names</strong> are movable labels pointing at commits; and <strong>HEAD</strong> marks
    where you are. Almost every git command just <em>moves one of those pointers</em>. This
    sandbox makes them visible — run commands and watch the labels move.</p>

    ${Toolkit.callout(
      `<strong>How to read the graph.</strong> Circles are commits (newest to the right),
       with an arrow back to each parent. A coloured pill is a <strong>branch label</strong>
       sitting on a commit. The indigo <code>HEAD → name</code> pill is the branch you're on
       (where the next <code>commit</code> lands). An amber <strong>HEAD</strong> pill means
       you're in <em>detached HEAD</em> — standing on a commit directly, on no branch. Watch
       which pills move when you run a command, and which stay put.`,
      { type: "note", label: "Reading the picture" }
    )}

    ${Toolkit.widget(
      "The playground",
      `<div class="gp-modes">
         <button class="gp-modebtn active" id="gp-mode-free">Free play</button>
         <button class="gp-modebtn" id="gp-mode-chal">Challenges</button>
       </div>

       <div class="gp-graph" id="gp-graph"></div>
       <div class="gp-status" id="gp-status"></div>

       <div class="gp-cmdrow">
         <input class="gp-input" id="gp-input" type="text" spellcheck="false"
           placeholder="type a git command, e.g. branch feature" />
         <button class="btn gp-run" id="gp-run">Run</button>
       </div>
       <div class="gp-msg" id="gp-msg"></div>

       <div id="gp-free">
         <div class="gp-hint">Click a command to load it, edit if you like, then Run (or press Enter):</div>
         <div class="gp-palette" id="gp-palette"></div>
         <div class="controls"><button class="btn ghost" id="gp-reset">Reset the sandbox</button></div>
       </div>

       <div id="gp-chal" style="display:none">
         <div class="gp-challist" id="gp-challist"></div>
       </div>`
    )}

    ${Toolkit.instructorNote(
      `This is your live board tool. The demos that dissolve the classic confusions:
       (1) run <code>checkout HEAD~1</code> and show the amber HEAD pill detach while every
       branch label stays put — "moving yourself does not move a label"; (2) put two labels
       on one commit (<code>branch idea</code>), then <code>commit</code> once and watch only
       the HEAD branch advance while the other stays — "a commit moves only the branch HEAD is
       on"; (3) <code>branch keep</code> then <code>reset --hard idea</code> to drag
       <code>main</code> onto another line while the old tip keeps a name. The Challenges mode
       scripts these as goals. It is a faithful model (real pointer semantics), not a cartoon —
       the same rules as real git, so nothing here can teach something false.`
    )}
  `,

  onMount(root) {
    const engine = window.GitVizEngine();

    const graphEl = root.querySelector("#gp-graph");
    const statusEl = root.querySelector("#gp-status");
    const inputEl = root.querySelector("#gp-input");
    const runEl = root.querySelector("#gp-run");
    const msgEl = root.querySelector("#gp-msg");
    const paletteEl = root.querySelector("#gp-palette");
    const resetEl = root.querySelector("#gp-reset");
    const freeEl = root.querySelector("#gp-free");
    const chalWrap = root.querySelector("#gp-chal");
    const chalListEl = root.querySelector("#gp-challist");
    const modeFree = root.querySelector("#gp-mode-free");
    const modeChal = root.querySelector("#gp-mode-chal");

    const PALETTE = [
      "commit", "branch idea", "switch idea", "switch -c feature",
      "switch main", "checkout HEAD~1", "reset --hard main~1",
      "branch keep", "branch -d idea", "branch -D idea",
    ];
    paletteEl.innerHTML = PALETTE.map(function (c) {
      return '<button class="gp-chip" data-cmd="' + c + '">' + c + "</button>";
    }).join("");

    /* ----- render the live graph as SVG ----- */
    function render() {
      const s = engine.snapshot();
      const depth = {};
      function d(id) {
        if (id == null) return -1;
        if (depth[id] != null) return depth[id];
        depth[id] = d(s.commits[id].parent) + 1;
        return depth[id];
      }
      s.order.forEach(function (id) { d(id); });
      let maxD = 0, maxL = 0;
      s.order.forEach(function (id) { if (depth[id] > maxD) maxD = depth[id]; if (s.commits[id].lane > maxL) maxL = s.commits[id].lane; });

      const COLW = 96, ROWH = 92, PADX = 54, PADY = 66;
      const W = PADX * 2 + maxD * COLW + 40;
      const H = PADY * 2 + maxL * ROWH + 24;
      const X = function (id) { return PADX + depth[id] * COLW; };
      const Y = function (id) { return PADY + s.commits[id].lane * ROWH; };

      const headC = s.head.type === "branch" ? s.refs[s.head.name] : s.head.id;

      let svg = '<svg viewBox="0 0 ' + W + " " + H + '" width="' + W + '" height="' + H + '" class="gp-svg">';
      s.order.forEach(function (id) {
        const c = s.commits[id];
        if (c.parent != null) svg += '<line class="gp-edge" x1="' + X(c.parent) + '" y1="' + Y(c.parent) + '" x2="' + X(id) + '" y2="' + Y(id) + '"/>';
      });

      const labels = {};
      Object.keys(s.refs).forEach(function (name) {
        const cid = s.refs[name];
        const isHead = s.head.type === "branch" && s.head.name === name;
        (labels[cid] = labels[cid] || []).push({ text: (isHead ? "HEAD → " : "") + name, cls: isHead ? "head" : "branch" });
      });
      if (s.head.type === "commit") (labels[s.head.id] = labels[s.head.id] || []).push({ text: "HEAD", cls: "detached" });

      s.order.forEach(function (id) {
        const x = X(id), y = Y(id);
        svg += '<circle class="gp-node' + (id === headC ? " current" : "") + '" cx="' + x + '" cy="' + y + '" r="15"/>';
        svg += '<text class="gp-id" x="' + x + '" y="' + (y + 33) + '">' + id + "</text>";
        (labels[id] || []).forEach(function (l, i) {
          const ly = y - 26 - i * 23;
          const w = l.text.length * 7 + 16;
          svg += '<rect class="gp-pill ' + l.cls + '" x="' + (x - w / 2) + '" y="' + (ly - 14) + '" width="' + w + '" height="20" rx="5"/>';
          svg += '<text class="gp-pillt ' + l.cls + '" x="' + x + '" y="' + (ly + 1) + '">' + l.text + "</text>";
        });
      });
      svg += "</svg>";
      graphEl.innerHTML = svg;
      statusEl.textContent = engine.status();
    }

    function say(res) {
      msgEl.textContent = res.ok ? res.msg : ("✗ " + res.err);
      msgEl.className = "gp-msg " + (res.ok ? "ok" : "err");
    }

    /* ----- challenges ----- */
    let current = null; // {def, data}
    const CHALLENGES = [
      {
        title: "1 · Advance main",
        brief: "Run a command that adds a new commit on top of main.",
        setup: function (e) { e.reset(3); return { start: e.snapshot().refs.main }; },
        check: function (e, d) { return e.snapshot().refs.main !== d.start; },
      },
      {
        title: "2 · A label that doesn't move you",
        brief: "Create a branch named feature at your current commit WITHOUT moving HEAD off main. (Hint: git branch &lt;name&gt;.)",
        setup: function (e) { e.reset(3); return {}; },
        check: function (e) { const s = e.snapshot(); return s.refs.feature != null && s.head.type === "branch" && s.head.name === "main" && s.refs.feature === s.refs.main; },
      },
      {
        title: "3 · Detach, then come home",
        brief: "Get into DETACHED HEAD (stand on a commit, not a branch) using checkout — then get back onto main. Solved once you've detached and returned.",
        setup: function (e) { e.reset(3); return { detached: false }; },
        check: function (e, d) { const s = e.snapshot(); if (s.head.type === "commit") d.detached = true; return d.detached && s.head.type === "branch" && s.head.name === "main"; },
      },
      {
        title: "4 · Move main onto the other line, keep the old one named",
        brief: "main is on one line; idea is bookmarked on another (both fork from an earlier commit). Make main point at idea's tip, but leave the old main line under some branch name. (Hint: bookmark first, then reset --hard.)",
        setup: function (e) {
          e.reset(1);
          e.run("branch idea"); e.run("commit"); e.run("commit"); // main line
          e.run("switch idea"); e.run("commit"); e.run("commit");  // idea line
          e.run("switch main");
          const s = e.snapshot();
          return { oldMain: s.refs.main, ideaTip: s.refs.idea };
        },
        check: function (e, d) {
          const s = e.snapshot();
          const mainOnIdea = s.refs.main === d.ideaTip;
          let oldKept = false;
          Object.keys(s.refs).forEach(function (n) { if (n !== "main" && n !== "idea" && s.refs[n] === d.oldMain) oldKept = true; });
          return mainOnIdea && oldKept;
        },
      },
    ];

    function renderChalList() {
      chalListEl.innerHTML = CHALLENGES.map(function (c, i) {
        const active = current && current.i === i;
        return '<button class="gp-chalitem' + (active ? " active" : "") + (c._solved ? " solved" : "") + '" data-i="' + i + '">' +
          '<span class="gp-chaltitle">' + (c._solved ? "✓ " : "") + c.title + "</span>" +
          '<span class="gp-chalbrief">' + c.brief + "</span></button>";
      }).join("");
    }

    function loadChallenge(i) {
      const def = CHALLENGES[i];
      const data = def.setup(engine);
      current = { i: i, def: def, data: data };
      render(); renderChalList();
      msgEl.textContent = "Challenge loaded — " + def.title; msgEl.className = "gp-msg";
    }

    function afterRun() {
      render();
      if (current && !current.def._solved) {
        if (current.def.check(engine, current.data)) {
          current.def._solved = true;
          msgEl.textContent = "✓ Solved: " + current.def.title;
          msgEl.className = "gp-msg ok";
          renderChalList();
        }
      }
    }

    /* ----- run a command from the input ----- */
    function runInput() {
      const cmd = inputEl.value.trim();
      if (!cmd) return;
      const res = engine.run(cmd);
      say(res);
      inputEl.value = "";
      afterRun();
    }

    runEl.addEventListener("click", runInput);
    inputEl.addEventListener("keydown", function (e) { if (e.key === "Enter") runInput(); });
    paletteEl.addEventListener("click", function (e) {
      const b = e.target.closest(".gp-chip");
      if (!b) return;
      inputEl.value = b.dataset.cmd;
      inputEl.focus();
    });
    resetEl.addEventListener("click", function () {
      engine.reset(); current = null;
      msgEl.textContent = ""; msgEl.className = "gp-msg";
      render();
    });
    chalListEl.addEventListener("click", function (e) {
      const b = e.target.closest(".gp-chalitem");
      if (b) loadChallenge(Number(b.dataset.i));
    });

    function setMode(mode) {
      const free = mode === "free";
      modeFree.classList.toggle("active", free);
      modeChal.classList.toggle("active", !free);
      freeEl.style.display = free ? "" : "none";
      chalWrap.style.display = free ? "none" : "";
      if (free) { engine.reset(); current = null; render(); msgEl.textContent = ""; msgEl.className = "gp-msg"; }
      else { renderChalList(); if (current == null) loadChallenge(0); }
    }
    modeFree.addEventListener("click", function () { setMode("free"); });
    modeChal.addEventListener("click", function () { setMode("chal"); });

    render();
  },
};
