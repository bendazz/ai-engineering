/* ============================================================
   Section: Your API key and first contact  (LAB)
   Setup block, section 6 — the payoff. Get an Anthropic key,
   store it as a SECRET in .env (the .gitignore we seeded pays
   off), install the SDK, and make a real "hello, model" call.
   Then feel the non-determinism from Section 1 for real, and
   read the token meter that every later cost/eval decision rests
   on. Closes the Setup block; bridges to anatomy-of-a-call.

   Star interactive: a cost estimator (real prices, real
   arithmetic) — model tier x calls x tokens -> semester cost.
   Teaches metering + model selection as an engineering call.

   VERIFIED before writing (claude-api skill, 2026-07-02):
     - pip install anthropic ; anthropic.Anthropic() reads
       ANTHROPIC_API_KEY ; client.messages.create(model=,
       max_tokens=, messages=[{role,content}]) ; iterate
       response.content guarding block.type == "text" ;
       response.usage.input_tokens / output_tokens.
     - Model IDs + list prices (USD per 1M tokens):
       claude-haiku-4-5  1 / 5   (200K ctx)
       claude-sonnet-5   3 / 15
       claude-opus-4-8   5 / 25
   Key-acquisition flow reused from the prior course's verified
   Anthropic section (console.anthropic.com; prepaid credits;
   auto-reload OFF; Settings > API Keys > Create Key, shown once).

   NOTE (playbook): NO literal dollar-sign characters anywhere in
   this file (KaTeX would mis-parse them). Money is written in
   words / "USD"; the cost widget builds the sign at runtime with
   String.fromCharCode(36). No backtick chars in prose. Code-block
   bodies use &gt; for redirects.
   ============================================================ */

window.SectionContent["setup-first-call"] = {
  title: "Your API key and first contact",

  html: `
    <div class="eyebrow">Setup &amp; First Contact · Section 8 · Lab</div>
    <h1>Your API key and first contact</h1>

    <p>Everything so far has been groundwork: an editor, an isolated
    environment, version control, a backup. Today it pays off. You'll get an
    <strong>API key</strong>, tuck it away as a secret, install the Claude
    <strong>SDK</strong>, and run the line of code this whole course is about —
    your program sending a prompt to a real model and getting an answer back.
    By the end you'll have made contact, watched the model
    <em>wobble</em> from Section 1 with your own eyes, and read the
    <strong>token meter</strong> that every cost and eval decision later will
    rest on.</p>

    <h2>The plan</h2>
    <ol class="steps">
      <li>Get an Anthropic API key, with money guardrails on.</li>
      <li>Store it as a <strong>secret</strong> in a <code>.env</code> file —
        never in your code, never in git.</li>
      <li>Install the <code>anthropic</code> SDK into your venv.</li>
      <li>Write and run <code>first_call.py</code> — hello, model.</li>
      <li>Run it a few times, look at the cost, then commit and push.</li>
    </ol>

    <h2>Step 1 — Get an API key (with guardrails)</h2>

    <p>The Claude API costs real money — not much (coursework is pennies), but
    real. The trick is to make an alarming bill <em>impossible</em> before you
    ever write a line of code.</p>

    <ol class="steps">
      <li>Go to the Anthropic Console:
        <a href="https://console.anthropic.com" target="_blank" rel="noopener">console.anthropic.com</a>,
        and sign up or sign in.</li>
      <li>Open <strong>Settings → Billing</strong> and buy a <strong>small</strong>
        amount of prepaid credits — about <strong>five dollars</strong> is plenty
        for the whole term.</li>
      <li>On that same Billing page, make sure <strong>auto-reload is OFF</strong>
        (it is off by default — just confirm it).</li>
      <li>Open <strong>Settings → API Keys</strong>, click <strong>Create Key</strong>,
        and name it something like <strong>ai-engineering</strong>.</li>
      <li><strong>Copy the key immediately.</strong> Anthropic shows it only
        <em>once</em>. If you lose it, you don't recover it — you delete that key
        and make a new one.</li>
    </ol>

    ${Toolkit.callout(
      `Read this once and relax: the API is <strong>prepaid</strong>, and with
       <strong>auto-reload off</strong> the credits you bought are a hard
       ceiling. When they run out the API simply stops answering until
       <em>you</em> choose to add more — there is no subscription and no monthly
       bill. Load five dollars and five dollars is the most you can ever spend.`,
      { type: "warn", label: "Why you can't get a scary bill" }
    )}

    ${Toolkit.callout(
      `Most of your students met this Console in the prior course, so this can be
       a five-minute refresher — but do it live. The two things that actually
       trip people up are (1) forgetting to buy any credits, so the very first
       call fails, and (2) closing the tab before copying the key. Buy credits,
       confirm auto-reload is off, copy the key into a scratch file for the next
       step — then move on.`,
      { type: "note", label: "For you, the instructor" }
    )}

    <h2>Step 2 — Store the key as a secret (<code>.env</code>)</h2>

    <p>Here is where the <code>.gitignore</code> we set up two sessions ago earns
    its keep. Your key is a password: anyone who has it can spend your money. So
    it must never appear in your source code and never get committed to git. The
    standard way to handle this is a file named <code>.env</code> that lives in
    your project but that git deliberately <strong>ignores</strong>.</p>

    <p>Create a file called <code>.env</code> in your project folder with one
    line (paste your real key in place of the placeholder):</p>

    ${Toolkit.code(".env", `ANTHROPIC_API_KEY=sk-ant-your-real-key-goes-here`)}

    <p>Now prove that git is ignoring it. In the integrated terminal:</p>

    ${Toolkit.code("Terminal", `git status`)}

    <p><code>.env</code> should <strong>not</strong> appear in the list of
    changes — because <code>.gitignore</code> already contains a line for it. If
    it <em>does</em> show up, stop and fix <code>.gitignore</code> before you
    commit anything.</p>

    ${Toolkit.callout(
      `This is not paranoia. Bots scrape public GitHub for leaked keys within
       <em>minutes</em> of a push, and a leaked key gets drained on someone
       else's workload — on your prepaid balance. The pattern that keeps you safe
       is universal in real codebases: <strong>secrets live in the environment,
       never in the code.</strong> Code says "read the key from the environment";
       the actual key sits in <code>.env</code>, which never leaves your machine.
       If a key ever does leak, the fix is one click: delete it in the Console and
       make a new one.`,
      { type: "ai", label: "Why secrets never go in code" }
    )}

    <h2>Step 3 — Install the SDK</h2>

    <p>Make sure your virtual environment is <strong>active</strong> (you should
    see <code>(.venv)</code> in the terminal prompt; if not, re-activate it as in
    the workbench lab). Then install two packages: the official
    <strong>anthropic</strong> SDK, and <strong>python-dotenv</strong>, a tiny
    helper that loads your <code>.env</code> file into the environment.</p>

    ${Toolkit.code("Terminal", `pip install anthropic python-dotenv
pip freeze &gt; requirements.txt`)}

    <p>The second line updates <code>requirements.txt</code> so your environment
    stays reproducible — anyone (including future you) can recreate it exactly.
    That's the habit from the workbench lab, still paying off.</p>

    <h2>Step 4 — First contact</h2>

    <p>Create a file named <code>first_call.py</code>. This is the whole program;
    read the comments, they explain each moving part.</p>

    ${Toolkit.code("first_call.py", `import os
from dotenv import load_dotenv
import anthropic

load_dotenv()                      # read .env into the environment
client = anthropic.Anthropic()     # picks up ANTHROPIC_API_KEY for you

response = client.messages.create(
    model="claude-haiku-4-5",
    max_tokens=200,
    messages=[
        {"role": "user", "content": "In one sentence, what is an AI engineer?"}
    ],
)

# A response can hold several content blocks; print the text ones.
for block in response.content:
    if block.type == "text":
        print(block.text)`)}

    <p>Run it from the integrated terminal:</p>

    ${Toolkit.code("Terminal", `python first_call.py`)}

    <p>You should see a sentence come back from the model. <strong>That is the
    entire course in one program:</strong> your code, a prompt, a model, an
    answer. Everything else — structure, testing, evals, deployment — is built
    around this exchange.</p>

    <p>A quick tour of the five things that matter:</p>
    <ul>
      <li><code>load_dotenv()</code> reads <code>.env</code> so the key is in the
        environment. It must run <em>before</em> you create the client.</li>
      <li><code>anthropic.Anthropic()</code> — the client. With no arguments it
        looks for <code>ANTHROPIC_API_KEY</code> in the environment, which is why
        the key never appears in this file.</li>
      <li><code>model="claude-haiku-4-5"</code> — which model answers. We picked
        the small, cheap one on purpose; more on that below.</li>
      <li><code>max_tokens=200</code> — a ceiling on the length of the reply (and
        so on its cost).</li>
      <li><code>messages=[...]</code> — the conversation so far, as a list of
        <code>{"role", "content"}</code> turns. We'll open this up in the next
        section.</li>
    </ul>

    ${Toolkit.callout(
      `If the first run errors, it is almost always one of two things, and both
       are quick: an <strong>authentication error</strong> means the key is
       missing or wrong — check that <code>.env</code> exists, sits in the folder
       you ran <code>python</code> from, and has the real key; a
       <strong>credit / billing error</strong> means Step 1's credits didn't go
       through. A live "let's read the error message together" moment here teaches
       more than any slide: the class learns that errors are specific and
       readable, not scary.`,
      { type: "note", label: "For you, the instructor" }
    )}

    <h2>Now feel the wobble</h2>

    <p>Back in Section 1 you watched a simulated model give different answers to
    the same prompt. Now make the <em>real</em> thing do it. Add a short loop
    (a new file, or edit <code>first_call.py</code>):</p>

    ${Toolkit.code("wobble.py", `import os
from dotenv import load_dotenv
import anthropic

load_dotenv()
client = anthropic.Anthropic()

prompt = "Give me a five-word phrase to inspire a new programmer."

for i in range(5):
    response = client.messages.create(
        model="claude-haiku-4-5",
        max_tokens=40,
        messages=[{"role": "user", "content": prompt}],
    )
    print(response.content[0].text)`)}

    <p>Run it. Five identical requests; five different answers. This is not a bug
    and it is not randomness you can simply switch off — it is the defining fact
    of the whole field, and the reason a plain pass/fail test won't do. The rest
    of this course is one long answer to the question it raises: <strong>if the
    output changes every time, how do I know my system is any good?</strong></p>

    <h2>What did that cost?</h2>

    <p>Every response comes with a meter. The model bills by
    <strong>tokens</strong> — roughly, pieces of words — counting both what you
    sent (input) and what came back (output). You can read the exact counts off
    any response:</p>

    ${Toolkit.code("Python", `usage = response.usage
print("input tokens: ", usage.input_tokens)
print("output tokens:", usage.output_tokens)`)}

    <p>Different models charge very different rates per million tokens, and this
    is a real engineering decision — not a detail. There are three tiers:</p>
    <ul>
      <li><strong>Haiku 4.5</strong> — fastest and cheapest (about
        <strong>USD 1</strong> per million input tokens, <strong>USD 5</strong>
        per million output). The right default for graders, classification, and
        high-volume eval runs.</li>
      <li><strong>Sonnet 5</strong> — the balanced middle (about
        <strong>USD 3 / USD 15</strong> per million).</li>
      <li><strong>Opus 4.8</strong> — the most capable, and the most expensive
        (about <strong>USD 5 / USD 25</strong> per million). Reach for it when the
        task genuinely needs the strongest reasoning.</li>
    </ul>

    <p>The professional instinct — and a recurring theme in this course — is to
    <strong>use the cheapest model that does the job well enough</strong>, and to
    let an <em>eval</em> (coming soon) tell you whether a cheaper model really is
    good enough. Play with the numbers below to feel the economics before we get
    there.</p>

    ${Toolkit.widget(
      "Cost estimator",
      `<div class="cost-tool" id="ct-root">
         <div class="ct-models" id="ct-models"></div>
         <div class="ct-fields">
           <label>Number of calls
             <input type="number" id="ct-calls" value="1000" min="1" step="100" />
           </label>
           <label>Input tokens / call
             <input type="number" id="ct-in" value="200" min="0" step="50" />
           </label>
           <label>Output tokens / call
             <input type="number" id="ct-out" value="150" min="0" step="50" />
           </label>
         </div>
         <div class="ct-readout" id="ct-readout"></div>
       </div>
       <div class="nd-cap">List prices, mid-2026 (USD per million tokens).
         Always confirm current prices in the Console.</div>`
    )}

    ${Toolkit.problem(
      `Look at the estimator with Haiku selected and realistic classwork numbers
       (say a thousand calls of a couple hundred tokens each). Roughly how much of
       a five-dollar balance does a whole project's worth of calls actually use —
       and what does that tell you about running evals often?`,
      `<p>Almost nothing — typically a <strong>few cents</strong>. A thousand
       small Haiku calls lands well under a dollar, so five dollars buys you
       <em>many thousands</em> of calls. The practical lesson is the one the whole
       course leans on: because measurement is so cheap on the small model, you
       can afford to <strong>run an eval every time you change something</strong>
       rather than guessing. Cost stops being a reason not to measure. (Switch the
       model to Opus and watch the same workload jump ten-to-twenty-fold — that is
       exactly the trade-off you'll be making deliberately, backed by eval
       numbers, not vibes.)</p>`,
      { label: "Predict: can you afford to measure?" }
    )}

    <h2>Step 5 — Commit and push</h2>

    <p>You made something today — save it. First, one more sanity check that your
    secret is safe:</p>

    ${Toolkit.code("Terminal", `git status`)}

    <p>Confirm <code>.env</code> is <strong>not</strong> in the list. Then stage
    your real work, commit, and push:</p>

    ${Toolkit.code("Terminal", `git add first_call.py wobble.py requirements.txt
git commit -m "Make first Claude API call"
git push`)}

    <p>Refresh your repository on <code>github.com</code>: <code>first_call.py</code>
    is there for the world (and future employers) to see — and <code>.env</code>,
    with your key in it, is nowhere on the page. That is exactly the outcome all
    that setup was for.</p>

    <h2>Made contact — checklist</h2>
    <ul class="checklist">
      <li><input type="checkbox" id="f1"><label for="f1">I have an API key, with a
        small prepaid balance and auto-reload OFF.</label></li>
      <li><input type="checkbox" id="f2"><label for="f2">My key is in
        <code>.env</code>, and <code>git status</code> confirms git ignores
        it.</label></li>
      <li><input type="checkbox" id="f3"><label for="f3"><code>first_call.py</code>
        runs and prints a real answer from the model.</label></li>
      <li><input type="checkbox" id="f4"><label for="f4">I ran it several times and
        saw the answers change.</label></li>
      <li><input type="checkbox" id="f5"><label for="f5">I committed and pushed my
        code — with the secret left behind.</label></li>
    </ul>

    <h2>What you accomplished</h2>
    <ul>
      <li>You made a real <strong>API call</strong> from your own code — the core
        exchange the entire course is built on.</li>
      <li>You learned the secrets-management pattern every real codebase uses:
        <strong>keys live in <code>.env</code>, read from the environment, never
        committed</strong>.</li>
      <li>You saw <strong>non-determinism</strong> first-hand — the same prompt,
        different answers — and you can read the <strong>token meter</strong> that
        prices every call.</li>
      <li>You met the three <strong>model tiers</strong> and the habit of picking
        the cheapest one that does the job, to be settled later by evals.</li>
      <li>Your setup is complete. Next we open up that
        <code>messages.create</code> call — <strong>roles, tokens, and
        temperature</strong> — and start shaping what the model does.</li>
    </ul>
  `,

  onMount(root) {
    /* ---- Cost estimator ------------------------------------------------
       Real list prices (USD per 1,000,000 tokens), real arithmetic. The
       dollar sign is built at runtime so no literal one sits in this file
       (KaTeX would try to parse it). onMount content is injected AFTER
       app.js typesets, so nothing here is ever seen by KaTeX anyway. */
    const D = String.fromCharCode(36);            // a dollar sign
    const BALANCE = 5;                            // the five-dollar balance

    const MODELS = [
      { id: "haiku",  name: "Haiku 4.5", inP: 1, outP: 5  },
      { id: "sonnet", name: "Sonnet 5",  inP: 3, outP: 15 },
      { id: "opus",   name: "Opus 4.8",  inP: 5, outP: 25 },
    ];
    let sel = "haiku";

    const modelsEl  = root.querySelector("#ct-models");
    const callsEl   = root.querySelector("#ct-calls");
    const inEl      = root.querySelector("#ct-in");
    const outEl     = root.querySelector("#ct-out");
    const readoutEl = root.querySelector("#ct-readout");
    if (!modelsEl) return;

    function num(el, min) {
      const v = parseInt(el.value, 10);
      return isNaN(v) || v < min ? min : v;
    }

    // Human-friendly money: more decimals for tiny amounts.
    function money(n) {
      if (n < 0.01)  return D + n.toFixed(4);
      if (n < 1)     return D + n.toFixed(3);
      return D + n.toFixed(2);
    }
    function commas(n) {
      return Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }

    function renderModels() {
      modelsEl.innerHTML = MODELS.map((m) =>
        `<button class="ct-model${m.id === sel ? " sel" : ""}" data-id="${m.id}">
           <span class="ct-mname">${m.name}</span>
           <span class="ct-mprice">USD ${m.inP} / ${m.outP} per 1M</span>
         </button>`
      ).join("");
      modelsEl.querySelectorAll(".ct-model").forEach((b) => {
        b.addEventListener("click", () => { sel = b.dataset.id; renderModels(); compute(); });
      });
    }

    function compute() {
      const m = MODELS.find((x) => x.id === sel);
      const calls = num(callsEl, 1);
      const inTok = num(inEl, 0);
      const outTok = num(outEl, 0);

      const perCall = (inTok / 1e6) * m.inP + (outTok / 1e6) * m.outP;
      const total = perCall * calls;
      const affordable = perCall > 0 ? Math.floor(BALANCE / perCall) : Infinity;

      readoutEl.innerHTML =
        `<div class="ct-line"><span>Cost per call</span><span>${money(perCall)}</span></div>
         <div class="ct-line ct-big"><span>${commas(calls)} calls</span><span>${money(total)}</span></div>
         <div class="ct-line ct-note">A five-dollar balance covers about
           <strong>${affordable === Infinity ? "unlimited" : commas(affordable)}</strong>
           calls like these on <strong>${m.name}</strong>.</div>`;
    }

    [callsEl, inEl, outEl].forEach((el) => el.addEventListener("input", compute));
    renderModels();
    compute();
  },
};
