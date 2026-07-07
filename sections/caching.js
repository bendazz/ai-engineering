/* ============================================================
   Section: Caching  (LAB) — Block 7 section 3 (course section 34).
     - the idea: much of a prompt repeats across requests (system prompt,
       tool defs, few-shot, retrieved context). Prompt caching stores the
       processed prefix so repeats are ~10x cheaper + faster.
     - the invariant: PREFIX MATCH. Any change in the prefix invalidates
       everything after. Render order tools -> system -> messages.
     - API (verified prompt-caching.md): cache_control {type:"ephemeral"}
       on the last stable block; 5-min TTL default, "1h" option; max 4
       breakpoints; top-level auto-places on last cacheable block.
     - MIN cacheable prefix: Haiku 4.5 (course default) needs >= 4096
       tokens or it silently won't cache (Fable 5 / Sonnet 4.6 = 2048).
     - economics: reads ~0.1x base input, writes 1.25x (5-min). Break-even
       at ~2 requests -> cache what repeats across many calls.
     - verify: usage.cache_read_input_tokens; if it stays 0 a SILENT
       INVALIDATOR (datetime/uuid/session id / unsorted json in the prefix)
       is at work. Keep the prefix frozen; put dynamic bits at the end.
     - app-level response caching (exact-match / semantic); semantic cache
       CAN return a wrong answer for a similar query -> you must EVAL it.
     - eval tie-in: prompt caching is safe (same output); semantic caching
       changes outputs, so measure its wrong-hit rate.
   LAB: predict-then-reveal; ends "What you accomplished".

   Star interactive: prompt-cache simulator — repeated long system prompt
   across N requests; toggle caching; show write vs read cost, cumulative
   savings, hit rate; a "silent invalidator" toggle (inject a timestamp)
   that kills the cache and drives cache_read to 0.

   VERIFIED (claude-api skill, prompt-caching.md): all API + economics +
   the Haiku-4.5 4096-token minimum + usage fields.

   NOTE (playbook): no literal dollar signs (String.fromCharCode in onMount;
   words in prose); no backtick chars in prose; no star-slash inside
   comments; NO literal backslash-n inside Toolkit.code bodies; no raw less-than in
   html/code; instructor notes hidden.
   ============================================================ */

window.SectionContent["caching"] = {
  title: "Caching",

  html: `
    <div class="eyebrow">Production · Section 36 · Lab</div>
    <h1>Caching</h1>

    <p>Look at what you send the model on a typical request: a long system prompt, your tool
    definitions, maybe a page of retrieved context and few-shot examples — and then, at the very
    end, the one line that's actually new (the user's question). You resend that whole preamble
    every single time, and pay to process it every single time. <strong>Prompt caching</strong>
    lets the model keep the processed preamble around, so repeats cost about a tenth as much and
    return faster.</p>

    <h2>The one rule: it's a prefix match</h2>

    <p>Everything about caching follows from a single fact: <strong>the cache matches on a prefix,
    and any change anywhere in that prefix invalidates everything after it.</strong> The prompt is
    assembled in a fixed order — <code>tools</code>, then <code>system</code>, then
    <code>messages</code> — and the cache stores the processed bytes up to a marker you place. Put
    the stable stuff first and the volatile stuff last, and caching mostly works for free. Get the
    order wrong and no marker will save you.</p>

    <h2>Marking a cache point</h2>

    <p>You add a <code>cache_control</code> breakpoint to the last block you want cached — usually
    the end of your big system prompt:</p>

    ${Toolkit.code("caching a shared system prompt", `response = client.messages.create(
    model="claude-haiku-4-5",
    max_tokens=500,
    system=[
        {
            "type": "text",
            "text": BIG_SHARED_SYSTEM_PROMPT,          # stable across requests
            "cache_control": {"type": "ephemeral"},    # cache up to here
        }
    ],
    messages=[{"role": "user", "content": user_question}],   # the varying part
)`)}

    <p>The breakpoint has a <strong>5-minute</strong> time-to-live by default (a <code>"1h"</code>
    option exists for bursty traffic), you get up to <strong>four</strong> breakpoints per request,
    and a top-level <code>cache_control</code> will auto-place on the last cacheable block if you
    don't want to think about placement.</p>

    ${Toolkit.callout(
      `<strong>A trap specific to our default model.</strong> Caching only kicks in above a minimum
       prefix size, and on <strong>Haiku 4.5 that minimum is 4,096 tokens</strong> (on Fable 5 and
       Sonnet 4.6 it's 2,048). A shorter prompt <em>silently</em> won't cache — no error, just
       <code>cache_creation_input_tokens: 0</code> and full-price reads. If your cache seems to do
       nothing, check that your prefix actually clears the bar.`,
      { type: "warn", label: "The 4096-token floor" }
    )}

    <h2>The economics, and when it pays</h2>

    <p>A cache <strong>read</strong> costs about a tenth of the normal input price; a cache
    <strong>write</strong> costs about 1.25× (you pay a small premium the first time to store it).
    So caching pays off after just a couple of requests that reuse the prefix — which is exactly
    the situation you're in with a shared system prompt hit thousands of times an hour. Cache what
    <em>repeats across many requests</em>; don't bother caching a one-off.</p>

    <p>Watch the savings accrue — and watch a single mistake destroy them:</p>

    ${Toolkit.widget(
      "Prompt-cache simulator",
      `<div class="ca-controls">
         <label class="cl-field">requests sharing the prefix
           <input type="range" id="ca-req" min="1" max="200" step="1" value="50"></label>
         <label class="ca-check"><input type="checkbox" id="ca-cache" checked> caching on</label>
         <label class="ca-check"><input type="checkbox" id="ca-bad"> put the current time in the system prompt</label>
       </div>
       <div class="ca-readout" id="ca-readout"></div>
       <div class="nd-cap">A 6,000-token shared system prompt (above Haiku's 4,096 floor). Costs use
         the real ratios: reads about 0.1×, writes about 1.25×. The timestamp toggle is the classic
         silent invalidator — it changes the prefix every request, so nothing is ever read from cache.</div>`
    )}

    <h2>Silent invalidators</h2>

    <p>Because caching is a prefix match, anything that makes the prefix differ between requests
    quietly kills it. The usual culprits all live near the front of the prompt:</p>
    <ul>
      <li>A <strong>timestamp or date</strong> interpolated into the system prompt
        (&ldquo;current time: …&rdquo;) — different every request.</li>
      <li>A <strong>UUID or request id</strong> early in the content.</li>
      <li>A <strong>per-user id or name</strong> baked into the system prompt — no two users share
        a prefix, so nothing caches across them.</li>
      <li><strong>Non-deterministic serialization</strong> — <code>json.dumps</code> without
        <code>sort_keys=True</code>, or iterating a <code>set</code>, so the bytes differ run to run.</li>
    </ul>
    <p>The fix is always the same: <strong>keep the prefix frozen</strong> and push anything dynamic
    to the <em>end</em> of the prompt, after the last breakpoint. Then confirm it's working by
    reading <code>usage.cache_read_input_tokens</code> — if it stays zero across identical requests,
    something up front is changing.</p>

    <h2>Caching the answer, not just the prompt</h2>

    <p>There's a second kind of caching, at the application level: cache the whole
    <strong>response</strong> so an identical question doesn't hit the model at all. Exact-match
    caching (a dictionary keyed by the request) is safe and free money for repeated queries.
    <strong>Semantic</strong> caching — returning a stored answer for a <em>similar</em> question —
    is tempting but dangerous: &ldquo;similar&rdquo; is not &ldquo;the same,&rdquo; and it can serve
    a confidently wrong cached answer to a subtly different question. If you do it, you must
    <strong>measure how often it returns a wrong answer</strong> — it's a quality change, so it goes
    through an eval like any other.</p>

    ${Toolkit.problem(
      `A teammate proudly adds prompt caching, but <code>cache_read_input_tokens</code> is zero on
       every request even though the system prompt is identical each time. You look at their code
       and the first line of the system prompt is <code>f"You are a support agent. Current time:
       {now}."</code> What's wrong, and what's the fix?`,
      `<p>The timestamp is the bug. Caching is a <strong>prefix match</strong>, and that
       <code>{now}</code> makes the very first line of the prefix different on every single request
       — so the cached prefix never matches, every request writes a fresh cache entry, and nothing
       is ever read (hence <code>cache_read_input_tokens</code> stuck at zero, and a bill that's
       actually <em>higher</em> than no caching because of the write premium). The fix: get the
       volatile value out of the prefix. Freeze the system prompt, and if the model genuinely needs
       the current time, pass it <strong>later</strong> — in a message near the end of the prompt,
       after the cache breakpoint, where changing it invalidates nothing before it. General rule:
       stable content first, volatile content last, and never a clock or a UUID in the system prompt.</p>`,
      { label: "Predict: the cache that never hits" }
    )}

    <h2>What you accomplished</h2>
    <ul>
      <li>Prompt caching stores the processed <strong>prefix</strong> so repeats cost about a tenth
        and return faster — via a <code>cache_control</code> breakpoint on the last stable block.</li>
      <li>It's a <strong>prefix match</strong> (order: tools → system → messages): stable content
        first, volatile content last, and mind Haiku 4.5's <strong>4,096-token floor</strong>.</li>
      <li>Reads are ~0.1×, writes ~1.25×, so caching pays after a couple of reuses; verify with
        <strong><code>cache_read_input_tokens</code></strong> and hunt <strong>silent
        invalidators</strong> (clocks, UUIDs, per-user ids) when it stays zero.</li>
      <li><strong>Response caching</strong> can skip the model entirely — exact-match is safe;
        <strong>semantic caching changes outputs, so you must eval it</strong>.</li>
    </ul>
  `,

  onMount(root) {
    const D = String.fromCharCode(36);
    /* ---- Prompt-cache simulator: real ratios ---- */
    const PREFIX_TOK = 6000;       // shared system prompt (above Haiku's 4096 floor)
    const SUFFIX_TOK = 80;         // the varying question
    const IN_PRICE = 1 / 1e6;      // USD per input token (Haiku 4.5)
    const READ = 0.1, WRITE = 1.25;
    const reqEl = root.querySelector("#ca-req");
    const cacheEl = root.querySelector("#ca-cache");
    const badEl = root.querySelector("#ca-bad");
    const outEl = root.querySelector("#ca-readout");
    if (!reqEl) return;

    function render() {
      const n = +reqEl.value;
      const caching = cacheEl.checked;
      const invalidated = badEl.checked;   // timestamp in prefix -> every request is a fresh prefix
      const perReqSuffix = SUFFIX_TOK * IN_PRICE;

      // Baseline: no caching -> pay full prefix every request
      const noCache = n * (PREFIX_TOK + SUFFIX_TOK) * IN_PRICE;

      let actual, reads = 0, writes = 0;
      if (!caching) {
        actual = noCache;
      } else if (invalidated) {
        // prefix differs every request: a write every time, never a read
        writes = n;
        actual = n * (PREFIX_TOK * IN_PRICE * WRITE) + n * perReqSuffix;
      } else {
        // first request writes, the rest read
        writes = 1; reads = n - 1;
        actual = (PREFIX_TOK * IN_PRICE * WRITE) + reads * (PREFIX_TOK * IN_PRICE * READ) + n * perReqSuffix;
      }
      const saved = noCache - actual;
      const hitRate = caching && !invalidated ? Math.round((reads / n) * 100) : 0;
      const savingClass = saved > 0.0000001 ? "good" : (saved < -0.0000001 ? "bad" : "");

      outEl.innerHTML =
        `<div class="ca-grid">
           <div class="ca-stat"><span class="ca-n">${D}${noCache.toFixed(4)}</span><span class="ca-l">no caching<br>(full price every time)</span></div>
           <div class="ca-stat"><span class="ca-n">${D}${actual.toFixed(4)}</span><span class="ca-l">with your settings</span></div>
           <div class="ca-stat"><span class="ca-n">${hitRate}%</span><span class="ca-l">cache hit rate</span></div>
         </div>
         <div class="ca-verdict ${savingClass}">
           ${!caching
             ? "Caching off — you pay to process the 6,000-token preamble on all " + n + " requests."
             : invalidated
               ? "The timestamp changes the prefix every request, so every request is a cache WRITE and none is a read. You pay the 1.25× write premium " + n + " times — caching is now COSTING you " + D + Math.abs(saved).toFixed(4) + " more than doing nothing."
               : "One write, then " + reads + " reads at ~0.1×. You saved " + D + saved.toFixed(4) + " (" + (noCache > 0 ? Math.round((saved / noCache) * 100) : 0) + "%) across " + n + " requests."}
         </div>`;
    }
    [reqEl, cacheEl, badEl].forEach((el) => el.addEventListener("input", render));
    render();
  },
};
