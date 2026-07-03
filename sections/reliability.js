/* ============================================================
   Section: Reliability — retries, timeouts, fallbacks  (LAB)
   Block 7 section 4 (course section 35).
     - the API is a network call to a shared, non-deterministic service; it
       WILL fail: 429 rate_limit, 500 api_error, 529 overloaded, timeouts,
       connection errors. Production code must survive them.
     - retryable vs not (verified error-codes.md): 429/500/529/conn/timeout
       -> retry; 400/401/403/404/413 -> do NOT retry (your bug)
     - the SDK already retries: auto-retries connection errors, 408, 409,
       429, and >=500 with exponential backoff, default max_retries=2;
       configure via Anthropic(max_retries=) / .with_options(max_retries=);
       0 disables. Default timeout 10 min; APITimeoutError retried.
     - exponential backoff + JITTER: delay = min(base*2^attempt + rand, cap)
       -- jitter avoids the thundering herd
     - custom retry with typed exceptions (RateLimitError; APIStatusError
       with status >= 500 retry, else raise)
     - 429 has a retry-after header; respect it. x-ratelimit-* show quota.
     - fallbacks / graceful degradation: on persistent overload fall back to
       a different model (Haiku often less loaded) or a canned/cached answer
     - idempotency: retries can double-fire side effects (callback agent
       approval gates) -- careful retrying tool ACTIONS
   LAB: predict-then-reveal; ends "What you accomplished".

   Star interactive: retry/backoff simulator — set a failure rate, watch
   requests fail + retry with growing backoff + jitter, show success-after-N
   and the tail-latency cost; toggle jitter to show the thundering herd.

   VERIFIED (claude-api skill, error-codes.md + python README): retryable
   set, SDK auto-retry (max_retries default 2), with_options, timeout
   default 10 min, typed exceptions, the call_with_retry backoff+jitter
   pattern.

   NOTE (playbook): no literal dollar signs; no backtick chars in prose; no
   star-slash inside comments; NO literal backslash-n in Toolkit.code bodies;
   NO raw less-than in html/code (use >= and words); instructor notes hidden.
   ============================================================ */

window.SectionContent["reliability"] = {
  title: "Reliability: retries, timeouts, fallbacks",

  html: `
    <div class="eyebrow">Production · Section 35 · Lab</div>
    <h1>Reliability: retries, timeouts, fallbacks</h1>

    <p>Every API call is a request over the network to a busy, shared service. Most of the time it
    answers in a second. Sometimes it doesn't: you hit a rate limit, the service is briefly
    overloaded, a server hiccups, the connection drops. In a notebook you shrug and re-run the cell.
    In production, &ldquo;just re-run it&rdquo; has to be <strong>code</strong> — because at a
    million requests a month, one-in-a-thousand failures is a thousand angry users a month.</p>

    <h2>Which failures you retry — and which you must not</h2>

    <p>The first discipline is telling apart failures worth retrying from failures that will fail
    identically forever. The line is whether the problem is <em>transient</em> (on their end,
    temporary) or <em>your fault</em> (on your end, permanent until you fix the code):</p>

    ${Toolkit.callout(
      `<strong>Retry these — transient:</strong> 429 rate limit, 500 server error, 529 overloaded,
       timeouts, and connection errors. Waiting and trying again genuinely helps.<br>
       <strong>Never retry these — your bug:</strong> 400 bad request, 401 auth, 403 permission,
       404 bad model id, 413 too large. The request is malformed; retrying just burns time and
       money on the same guaranteed failure. Fix the code instead.`,
      { type: "note", label: "Retryable vs not" }
    )}

    <h2>The good news: the SDK already does the basics</h2>

    <p>You don't start from zero. The Anthropic SDK <strong>automatically retries</strong>
    connection errors, 408, 409, 429, and 5xx with exponential backoff — <code>max_retries=2</code>
    by default. You can turn it up (or off) on the client or per call:</p>

    ${Toolkit.code("configuring the built-in retries", `client = anthropic.Anthropic(max_retries=5)   # default is 2; 0 disables

# or override for a single call, without mutating the client:
client.with_options(max_retries=5, timeout=20.0).messages.create(
    model="claude-haiku-4-5",
    max_tokens=500,
    messages=messages,
)`)}

    <p>The default request <strong>timeout is 10 minutes</strong>; for anything user-facing you'll
    want that much lower, and a timeout raises <code>APITimeoutError</code> (which is itself retried
    per <code>max_retries</code>). For most apps, raising <code>max_retries</code> and setting a
    sane timeout is all the reliability you need.</p>

    <h2>When you need your own retry loop</h2>

    <p>Sometimes you want control the SDK doesn't give you — custom logging per attempt, a different
    backoff, an approval step. The pattern uses <strong>typed exceptions</strong> (never string-match
    the error message) and <strong>exponential backoff with jitter</strong>:</p>

    ${Toolkit.code("call_with_retry.py", `import time, random, anthropic

def call_with_retry(client, max_retries=5, base=1.0, cap=60.0, **kwargs):
    last = None
    for attempt in range(max_retries):
        try:
            return client.messages.create(**kwargs)
        except anthropic.RateLimitError as e:          # 429 — back off
            last = e
        except anthropic.APIStatusError as e:
            if e.status_code >= 500:                    # 5xx — transient, retry
                last = e
            else:
                raise                                   # 4xx — your bug, do not retry
        delay = min(base * (2 ** attempt) + random.uniform(0, 1), cap)
        time.sleep(delay)                               # exponential backoff + jitter
    raise last`)}

    <p>Two ideas do the work. <strong>Exponential backoff</strong> — wait 1s, then 2s, 4s, 8s —
    gives an overloaded service room to recover instead of hammering it. <strong>Jitter</strong>,
    the small random addition, is the non-obvious one: without it, a thousand clients that all
    failed at the same instant would all retry at the same instant, re-creating the overload — a
    &ldquo;thundering herd.&rdquo; The randomness spreads the retries out.</p>

    <h2>Fallbacks: degrade, don't die</h2>

    <p>Retries handle blips. For a sustained problem — the service is overloaded for a full minute —
    you want a <strong>fallback</strong> so one struggling dependency doesn't take your whole feature
    down. Common moves: fall back to a <em>different model</em> (Haiku is often less loaded than the
    frontier models), serve a cached or templated answer, or degrade the feature gracefully
    (&ldquo;we're busy — here's the FAQ&rdquo;) instead of showing an error. The goal is that a bad
    minute on Anthropic's side is a slightly-worse minute for your users, not an outage.</p>

    ${Toolkit.widget(
      "Retry/backoff simulator",
      `<div class="rl-controls">
         <label class="cl-field">transient failure rate
           <input type="range" id="rl-fail" min="0" max="80" step="5" value="40"><span id="rl-fail-v"></span></label>
         <label class="ca-check"><input type="checkbox" id="rl-jitter" checked> jitter on</label>
       </div>
       <div class="controls">
         <button class="btn" id="rl-run">Send 1 request</button>
         <button class="btn ghost" id="rl-reset">Reset</button>
       </div>
       <div class="rl-track" id="rl-track"></div>
       <div class="rl-summary" id="rl-summary"></div>
       <div class="nd-cap">Each attempt fails with the probability you set; on failure the wait
         doubles (backoff) plus a random slice (jitter). Watch the total latency the retries add —
         reliability isn't free, it's paid in tail latency.</div>`
    )}

    ${Toolkit.callout(
      `Retrying a read is safe; retrying an <strong>action</strong> is not. If a call that
       <em>issued a refund</em> times out, the refund may have gone through anyway — retry it and
       you've paid twice. Side-effecting tool calls need idempotency keys or the human approval gate
       from the agents block. Retry the question; be careful retrying the deed.`,
      { type: "warn", label: "Retries and side effects" }
    )}

    ${Toolkit.problem(
      `A classmate's retry loop catches every exception and retries up to five times. It works, but
       their logs show requests that fail instantly, retry five times with growing delays, and then
       fail anyway — taking 30+ seconds to report an error that was obvious on attempt one. What did
       they get wrong?`,
      `<p>They retried a non-retryable error. Catching <em>every</em> exception means a
       <code>400</code> (malformed request), a <code>401</code> (bad API key), or a <code>404</code>
       (typo in the model id) gets the full backoff treatment — but those fail <strong>identically
       every time</strong>, because the problem is in their own request, not on the server. So the
       loop waits 1s, 2s, 4s, 8s, 16s and then reports the same error it had at t=0, turning an
       instant, fixable bug into a 30-second dead end. The fix is exactly the split in the code
       above: retry <code>RateLimitError</code> and <code>5xx</code> (transient), but
       <strong>re-raise 4xx immediately</strong> so a bug in your request surfaces fast instead of
       hiding behind a minute of pointless waiting. Retry the transient; fail fast on the permanent.</p>`,
      { label: "Predict: the 30-second failure" }
    )}

    <h2>What you accomplished</h2>
    <ul>
      <li>You retry <strong>transient</strong> failures (429, 5xx, 529, timeouts, connection) and
        <strong>fail fast</strong> on 4xx that will never succeed.</li>
      <li>The SDK auto-retries with backoff (<code>max_retries=2</code> by default); raise it and set
        a sane <strong>timeout</strong> for most needs, or write a custom loop with
        <strong>typed exceptions</strong> when you need control.</li>
      <li><strong>Exponential backoff + jitter</strong> lets an overloaded service recover and avoids
        the thundering herd.</li>
      <li><strong>Fall back</strong> (a cheaper model, a cached/templated answer) to degrade instead
        of failing — and <strong>don't blindly retry side-effecting actions</strong>.</li>
    </ul>
  `,

  onMount(root) {
    /* ---- Retry/backoff simulator ---- */
    const failEl = root.querySelector("#rl-fail");
    const failV = root.querySelector("#rl-fail-v");
    const jitterEl = root.querySelector("#rl-jitter");
    const runBtn = root.querySelector("#rl-run");
    const resetBtn = root.querySelector("#rl-reset");
    const trackEl = root.querySelector("#rl-track");
    const summaryEl = root.querySelector("#rl-summary");
    if (!failEl) return;
    const MAX = 5, BASE = 1.0, CAP = 60;
    let runs = [];   // each: {attempts:[{ok, delay}], total, success}

    function simulate() {
      const p = +failEl.value / 100;
      const jitter = jitterEl.checked;
      const attempts = [];
      let total = 0, success = false;
      for (let a = 0; a < MAX; a++) {
        const ok = Math.random() >= p;
        attempts.push({ ok: ok, delay: 0 });
        if (ok) { success = true; break; }
        // failed -> wait before next attempt (no wait needed after the last)
        if (a < MAX - 1) {
          const j = jitter ? Math.random() : 0.5;   // fixed 0.5 when jitter off (all clients identical)
          const delay = Math.min(BASE * Math.pow(2, a) + j, CAP);
          attempts[a].delay = delay;
          total += delay;
        }
      }
      runs.push({ attempts: attempts, total: total, success: success });
      render();
    }
    function render() {
      trackEl.innerHTML = runs.map((r, i) =>
        `<div class="rl-run">
           <span class="rl-run-n">#${i + 1}</span>
           ${r.attempts.map((at) =>
             `<span class="rl-att ${at.ok ? "ok" : "fail"}">${at.ok ? "✓" : "✗"}${at.delay ? '<span class="rl-wait">wait ' + at.delay.toFixed(1) + "s</span>" : ""}</span>`).join('<span class="rl-arrow">→</span>')}
           <span class="rl-out ${r.success ? "ok" : "dead"}">${r.success ? "succeeded (+" + r.total.toFixed(1) + "s)" : "gave up after " + r.total.toFixed(1) + "s"}</span>
         </div>`).join("");
      const n = runs.length;
      if (n) {
        const succ = runs.filter((r) => r.success).length;
        const avgAdded = runs.reduce((a, r) => a + r.total, 0) / n;
        summaryEl.innerHTML =
          `<strong>${succ}/${n}</strong> eventually succeeded · avg extra latency from retries
           <strong>+${avgAdded.toFixed(1)}s</strong>. Reliability is paid in tail latency.`;
      } else summaryEl.innerHTML = "";
    }
    failEl.addEventListener("input", () => { failV.textContent = failEl.value + "%"; });
    failV.textContent = failEl.value + "%";
    runBtn.addEventListener("click", simulate);
    resetBtn.addEventListener("click", () => { runs = []; render(); });
    render();
  },
};
