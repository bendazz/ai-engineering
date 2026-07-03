/* ============================================================
   Section: Studio — harden a system for production  (STUDIO) — caps Block 7
   (course section 37). Take an earlier tool/agent system and make it
   production-grade: add tracing, measure cost + p95 latency + right-size the
   model, add retries + timeout + a fallback, add input+output guardrails
   (measured), and prove a caching win. Then a CHAOS/ADVERSARIAL red-team
   round (inject API failures + hostile inputs). Studio pattern: scenario
   switcher A/B/C + build rules + red-team scorecard + deliverables + "this
   is the job". Reuses .scn- and .sc- and .scorecard CSS.
   Heavy instructor scaffolding, all HIDDEN via Toolkit.instructorNote.

   NOTE (playbook): studio = brief; ends "this is the job". No literal dollar
   signs; no backtick chars in prose; no star-slash inside comments; curly
   quotes literal.
   ============================================================ */

window.SectionContent["production-studio"] = {
  title: "Studio: harden a system for production",

  html: `
    <div class="eyebrow">Production · Section 37 · Studio</div>
    <h1>Studio: harden a system for production</h1>

    <p>You have a system that works. This studio makes it one you'd actually put in front of real
    users and real traffic. Your team takes an earlier build — the tool assistant or the agent — and
    hardens it: you make it <strong>observable, affordable, reliable, and safe</strong>, and then you
    deliberately try to break it. The deliverable isn't a working demo (you already have that); it's
    the evidence that it survives contact with production.</p>

    <p>Teams of three or four. Pick a brief:</p>

    ${Toolkit.widget(
      "Studio briefs",
      `<div class="scn-tabs">
         <button class="btn ghost scn-tab active-mode" data-s="A">A · High-traffic support bot</button>
         <button class="btn ghost scn-tab" data-s="B">B · Internal ops agent</button>
         <button class="btn ghost scn-tab" data-s="C">C · Public content generator</button>
       </div>
       <div class="scn-card" id="ph-card"></div>`
    )}

    <h2>Harden it</h2>
    <ul>
      <li><strong>Trace every call</strong> — structured logs (input, output, tokens, latency, cost).
        You'll need them for the chaos round.</li>
      <li><strong>Measure cost and latency</strong> — cost per request and <strong>p95</strong> (not
        the mean) — and <strong>right-size the model</strong>: show the cheapest model that still
        clears your eval bar.</li>
      <li><strong>Survive failure</strong> — retries with backoff on transient errors, a sane timeout,
        fail-fast on 4xx, and one <strong>fallback / degradation</strong> path.</li>
      <li><strong>Guard both sides</strong> — an input guard and an output guard, and
        <strong>measure the input guard's precision and recall</strong> on a labeled set (know your
        false-positive rate).</li>
      <li><strong>Prove a caching win</strong> — a prompt-cache (or response-cache) that measurably
        cuts cost/latency, verified <em>not</em> to change output quality.</li>
    </ul>

    <h2>The chaos / adversarial round</h2>
    <p>Now break it on purpose, then swap and break another team's:</p>
    <ul>
      <li><strong>Inject failures</strong> — simulate 429s and 529s (or just point at a bad model id):
        does it retry, degrade, and stay up, or does it throw a stack trace at the user?</li>
      <li><strong>Send hostile inputs</strong> — prompt injections, extraction attempts, off-topic
        abuse: do the guards hold, and what's the false-positive cost on the legit inputs mixed in?</li>
      <li><strong>Then read the trace</strong> — can you reconstruct exactly what happened on a failed
        request, or are you guessing?</li>
    </ul>

    ${Toolkit.widget(
      "Production-readiness scorecard",
      `<div class="scorecard" id="ph-sc">
         <label class="sc-item"><input type="checkbox" data-sc> <strong>Every call is traced</strong> (input, output, tokens, latency, cost) — any request can be reconstructed.</label>
         <label class="sc-item"><input type="checkbox" data-sc> <strong>Cost per request and p95 latency</strong> are measured, and the model is <strong>right-sized against an eval</strong>.</label>
         <label class="sc-item"><input type="checkbox" data-sc> <strong>Retries + timeout</strong> handle transient failures, 4xx fails fast, and there's a <strong>fallback</strong> path.</label>
         <label class="sc-item"><input type="checkbox" data-sc> <strong>Input and output guardrails</strong> exist, and the input guard's <strong>precision/recall</strong> is measured.</label>
         <label class="sc-item"><input type="checkbox" data-sc> A <strong>caching win is measured</strong> and verified not to change output quality.</label>
         <label class="sc-item"><input type="checkbox" data-sc> A <strong>chaos + adversarial round</strong> was run, and the trace let you diagnose what broke.</label>
       </div>
       <div class="sc-verdict" id="ph-verdict"></div>`
    )}

    <h2>Deliverables</h2>
    <ul class="checklist">
      <li><input type="checkbox" id="p1"><label for="p1">The hardened system: tracing, retries + fallback, input/output guardrails, caching.</label></li>
      <li><input type="checkbox" id="p2"><label for="p2">A cost + latency report: cost per request, p95 latency, and the eval-backed model choice.</label></li>
      <li><input type="checkbox" id="p3"><label for="p3">The input guard's precision/recall on a labeled real-vs-malicious set, with your chosen threshold.</label></li>
      <li><input type="checkbox" id="p4"><label for="p4">A chaos-round writeup: what you injected, what broke, what held, and one failure diagnosed from the trace.</label></li>
    </ul>

    ${Toolkit.instructorNote(
      `<strong>Facilitation (~60-90 min; a double block is ideal).</strong> 10 pick brief + choose the
       earlier system to harden · 25 add tracing + cost/latency + right-sizing · 20 retries + guardrails
       + caching · 15 chaos/adversarial swap round · 10 debrief. Don't let teams rebuild the underlying
       assistant — they harden something they already have. If time is tight, drop caching to a
       stretch goal; tracing + retries + measured guardrails are the core.`
    )}

    ${Toolkit.instructorNote(
      `<strong>Answer key — a strong Scenario A.</strong> Trace wrapper logging tokens/latency/cost per
       call. Right-sizing: run the support eval on Haiku vs Sonnet, show Haiku clears the bar, ship
       Haiku (and say what you saved). p95 latency reported, not the mean. Retries on 429/5xx with
       backoff, timeout ~10s, fail-fast on 4xx, fallback to a canned FAQ answer on sustained overload.
       Input guard (injection + PII) with a measured precision/recall and a stated false-positive rate;
       output guard checks groundedness. Prompt-cache the big system prompt (above the 4,096 floor),
       show cache_read_input_tokens climbing. Chaos: point at a bad model id and a burst of injections;
       the system degrades gracefully and the trace pinpoints the failure. A team that reports &ldquo;it
       works&rdquo; with no p95, no false-positive rate, no trace, and no fallback has built a demo, not
       a production system.`
    )}

    ${Toolkit.instructorNote(
      `<strong>Grade the evidence, 0/1/2 each:</strong> (1) Observability — real tracing; a failure
       reconstructed from it. (2) Efficiency — cost/request + p95 (not mean) + eval-backed right-sizing;
       bonus for a measured caching win. (3) Reliability — correct retry/fail-fast split + a fallback,
       shown surviving injected failures. (4) Safety — layered guards with the input guard's
       precision/recall and a stated false-positive rate. 8/8 is a system whose cost, reliability, and
       safety you could defend to an operator. Failure modes to name: reporting the mean latency,
       over-strict guards that block real users, retrying 4xx, no fallback, and no trace so nothing can
       be diagnosed.`
    )}

    <h2>This is the job</h2>
    <p>The gap between a notebook demo and a production system is this studio, and it's most of what a
    company actually pays an AI engineer for. Anyone can get a good answer once. You're being paid to
    know what it costs, to see the p95 latency your slowest users feel, to keep the thing standing when
    the API has a bad minute, to stop the hostile input before it becomes a screenshot, and — when
    something does break — to open the trace and say exactly what happened. Make it observable,
    affordable, reliable, and safe. Then prove it.</p>
  `,

  onMount(root) {
    /* ---- Scenario switcher ---- */
    const SCN = {
      A: {
        name: "High-traffic support bot",
        focus: "Millions of requests, cost-sensitive, and adversarial users in the mix.",
        hard: "Cost + p95 latency matter most (right-size hard); prompt-cache the big system prompt; input guards against injection; graceful degradation under load.",
        watch: "Reporting mean instead of p95, an over-strict guard blocking real customers, and no fallback when the API is overloaded.",
      },
      B: {
        name: "Internal ops agent",
        focus: "Lower traffic, but it takes real, sometimes irreversible actions.",
        hard: "Reliability + safety over raw cost: retries with idempotency care on actions, a human gate on the irreversible tool, output guards, and airtight tracing for audits.",
        watch: "Blindly retrying a side-effecting action (double-firing it), a missing approval gate, and a trace too thin to reconstruct what the agent did.",
      },
      C: {
        name: "Public content generator",
        focus: "Public-facing output at scale — brand safety and injection are the risk.",
        hard: "Output guardrails first (safety, brand, groundedness), input guards against injection, cost control at scale via caching, and p95 latency for a snappy feel.",
        watch: "An output that ends up in a screenshot, ungrounded claims shipped to the public, and caching that silently changed the outputs.",
      },
    };
    const cardEl = root.querySelector("#ph-card");
    const tabs = Array.prototype.slice.call(root.querySelectorAll(".scn-tab"));
    function renderScenario(key) {
      const s = SCN[key];
      if (!cardEl) return;
      cardEl.innerHTML =
        `<div class="scn-name">${s.name}</div>
         <div class="scn-kind">${s.focus}</div>
         <p class="scn-mission"><strong>Harden for:</strong> ${s.hard}</p>
         <div class="scn-metrics"><strong>Red-team will watch for:</strong> ${s.watch}</div>`;
      tabs.forEach((t) => t.classList.toggle("active-mode", t.dataset.s === key));
    }
    tabs.forEach((t) => t.addEventListener("click", () => renderScenario(t.dataset.s)));
    renderScenario("A");

    /* ---- Scorecard ---- */
    const boxes = Array.prototype.slice.call(root.querySelectorAll("#ph-sc [data-sc]"));
    const verdictEl = root.querySelector("#ph-verdict");
    function score() {
      const n = boxes.filter((b) => b.checked).length;
      let cls, msg;
      if (n >= 5) { cls = "real"; msg = "Production-ready — observable, affordable, reliable, and safe, and you can prove each one. You'd put this in front of real traffic."; }
      else if (n >= 3) { cls = "inconc"; msg = "Partway. The unchecked items are exactly where a system that demos well falls over under real load or real attackers."; }
      else { cls = "worse"; msg = "Still a demo — unobservable, unpriced, or undefended. It will surprise you the first bad minute in production."; }
      verdictEl.className = "sc-verdict " + cls;
      verdictEl.innerHTML = "<strong>" + n + " of 6</strong> — " + msg;
    }
    boxes.forEach((b) => b.addEventListener("change", score));
    score();
  },
};
