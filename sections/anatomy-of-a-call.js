/* ============================================================
   Section: Anatomy of a call  (CONCEPT)
   Block 2 "Working with the Model", section 1 (course section 7).
   Opens up the messages.create() call the students just ran:
     - request = model + system + messages (+ knobs)
     - roles: system is a TOP-LEVEL param (NOT a message), user &
       assistant alternate
     - the big idea: the API is STATELESS; a conversation is just a
       list you resend every turn (the model has no memory)
     - the response object: content is a list of blocks, stop_reason,
       usage
   Concept section: no inline problems; ends at "What you learned".

   Star interactive: a stateless-conversation stepper — reveal a
   scripted multi-turn chat one message at a time while the messages[]
   array grows beside it, driving home "you carry the memory, not the
   API." Assistant replies are canned + LABELED illustrative (honesty).

   Facts (claude-api skill, verified this session 2026-07-02):
     - system prompt is the top-level `system=` parameter (Anthropic
       differs from the "role: system" message convention).
     - messages alternate user/assistant, must start with user.
     - response.content is a list of blocks (guard block.type=="text");
       response.stop_reason in {end_turn, max_tokens, stop_sequence,
       tool_use, refusal}; response.role == "assistant";
       response.usage.input_tokens/output_tokens.

   NOTE (playbook): no literal dollar signs (KaTeX); no backtick chars
   in prose; code redirects/comparators as words or &gt;/&lt;.
   ============================================================ */

window.SectionContent["anatomy-of-a-call"] = {
  title: "Anatomy of a call",

  html: `
    <div class="eyebrow">Working with the Model · Section 7</div>
    <h1>Anatomy of a call</h1>

    <p>You've made the call this whole course is built on. Now let's take it
    apart. That one <code>messages.create</code> has only a few pieces, but
    knowing exactly what each one is — and, just as important, what the API
    <em>remembers</em> (nothing) — is the line between poking at the model and
    engineering with it.</p>

    <h2>The shape of every request</h2>

    <p>Every call you'll ever write has the same skeleton: which model, an
    optional set of standing instructions, the conversation so far, and a few
    knobs. Here it is with each part labeled:</p>

    ${Toolkit.code("Python", `response = client.messages.create(
    model="claude-haiku-4-5",              # which model answers
    max_tokens=200,                        # a cap on the reply length
    system="You are a terse assistant.",   # standing instructions (optional)
    messages=[                             # the conversation so far
        {"role": "user", "content": "What is a token?"},
    ],
)`)}

    <p>Four ideas do all the work: the <strong>model</strong>, the
    <strong>system</strong> prompt, the <strong>messages</strong> list, and the
    knobs like <strong>max_tokens</strong>. The messages list is where almost all
    of the action is, so start there.</p>

    <h2>Roles: system, user, assistant</h2>

    <p>A conversation is a list of turns, and every turn has a
    <strong>role</strong>:</p>
    <ul>
      <li><strong>user</strong> — you (or your program) talking to the model.</li>
      <li><strong>assistant</strong> — the model's replies.</li>
      <li><strong>system</strong> — standing instructions that sit above the whole
        conversation: who the model should be, rules it must follow, the format
        you want. It isn't part of the back-and-forth; it's the frame around it.</li>
    </ul>

    ${Toolkit.callout(
      `One detail that trips up people coming from other APIs: with Claude the
       <strong>system prompt is a separate top-level parameter</strong>
       (<code>system="..."</code>), <em>not</em> a message with a
       <code>"system"</code> role inside the list. The <code>messages</code> list
       holds only <strong>user</strong> and <strong>assistant</strong> turns, and
       they <strong>alternate</strong> — starting with a user turn. Put persona and
       rules in <code>system</code>; put the actual dialogue in
       <code>messages</code>.`,
      { type: "note", label: "Where the system prompt goes" }
    )}

    <h2>The big idea: the API has no memory</h2>

    <p>Here is the single most important thing to understand about calling a
    model, and it surprises almost everyone: <strong>the API is stateless.</strong>
    The model does not remember your last message. There is no session, no thread
    living on Anthropic's servers between calls. Each request is judged entirely on
    what you send in that one request.</p>

    <p>So how does a chatbot &ldquo;remember&rdquo; the earlier parts of a
    conversation? <strong>You resend them.</strong> Every turn, you pass the whole
    growing <code>messages</code> list back again — all the previous user and
    assistant turns — so the model can read the history fresh each time. The
    &ldquo;memory&rdquo; lives in <em>your</em> code, not in the model. Step through
    a conversation below and watch the list that gets sent grow:</p>

    ${Toolkit.widget(
      "A conversation is a list you resend",
      `<div class="anat-wrap">
         <div class="anat-chat" id="an-chat"></div>
         <div class="anat-json-wrap">
           <div class="anat-json-head">messages sent on this request</div>
           <pre class="anat-json" id="an-json"></pre>
         </div>
       </div>
       <div class="anat-cap" id="an-cap"></div>
       <div class="controls">
         <button class="btn" id="an-next">Send next turn</button>
         <button class="btn ghost" id="an-reset">Reset</button>
       </div>
       <div class="nd-cap">The assistant replies here are canned, for
         illustration — but the growing list is exactly the real structure you
         send each turn.</div>`
    )}

    <p>Two consequences fall out of this, and both matter later:</p>
    <ul>
      <li><strong>You are in charge of memory.</strong> Want the model to forget
        something? Leave it out of the list. Want a fresh start? Send a new list.
        Nothing carries over on its own.</li>
      <li><strong>Longer conversations cost more.</strong> Because you resend the
        entire history every turn, a long chat means more input tokens on
        <em>every</em> call. Memory isn't free — you pay to recarry it.</li>
    </ul>

    <h2>The system prompt is your highest-leverage text</h2>

    <p>Because the system prompt frames every single turn, it's the most valuable
    real estate you have. It's where you set the model's role
    (&ldquo;You are a careful medical-billing assistant&rdquo;), its rules
    (&ldquo;Never guess a diagnosis code; say &lsquo;unsure&rsquo; instead&rdquo;),
    and the shape of its answers (&ldquo;Reply with a single JSON object&rdquo;).
    A great deal of the engineering you'll do in this course is really
    <em>system-prompt</em> engineering — and, in the spirit of the course, you'll
    learn to tell whether a change to it actually helped by measuring, not
    guessing.</p>

    <h2>Reading the response</h2>

    <p>The object that comes back has a matching anatomy. It's worth knowing the
    four fields you'll reach for constantly:</p>

    ${Toolkit.code("Python", `response.content       # a LIST of content blocks, not a bare string
response.content[0].text   # the text of the first block

response.stop_reason   # WHY it stopped: "end_turn", "max_tokens", ...
response.usage         # the meter: .input_tokens and .output_tokens
response.role          # always "assistant"`)}

    <ul>
      <li><strong>content is a list.</strong> That's why we loop with
        <code>for block in response.content</code> and check
        <code>block.type == "text"</code> — a response can contain more than one
        block, and later (with tools) not every block is text.</li>
      <li><strong>stop_reason tells you why it stopped.</strong>
        <code>"end_turn"</code> means the model finished naturally;
        <code>"max_tokens"</code> means it hit your length cap and got
        <em>cut off</em> mid-thought — a common cause of mysteriously truncated
        answers, and the first thing to check when a reply looks chopped.</li>
      <li><strong>usage is the meter</strong> from last section — the exact token
        counts this call was billed on.</li>
    </ul>

    ${Toolkit.callout(
      `A high-value five minutes at the board: draw the request as an envelope —
       <em>system</em> written on the outside, the <em>messages list</em> inside —
       and show that the envelope is built fresh and mailed in full every single
       turn. The students who really absorb "the API is stateless; you carry the
       history" stop writing a whole class of confused bugs later (wondering why
       the model "forgot," or why a long chat suddenly costs more). It's the one
       idea from this section worth over-teaching.`,
      { type: "note", label: "For you, the instructor" }
    )}

    <h2>What you learned</h2>
    <ul>
      <li>Every call has the same skeleton: a <strong>model</strong>, an optional
        <strong>system</strong> prompt, a <strong>messages</strong> list, and
        knobs like <strong>max_tokens</strong>.</li>
      <li><strong>Roles:</strong> <code>system</code> is a top-level parameter (not
        a message); <code>user</code> and <code>assistant</code> turns alternate
        inside the list, starting with the user.</li>
      <li>The API is <strong>stateless</strong>: the model has no memory between
        calls. A conversation is a <strong>list you resend</strong> each turn — so
        you own the memory, and longer histories cost more.</li>
      <li>The <strong>system prompt</strong> frames every turn, which makes it your
        highest-leverage text.</li>
      <li>The <strong>response</strong> is an object: <code>content</code> is a list
        of blocks, <code>stop_reason</code> says why it stopped
        (watch for <code>"max_tokens"</code> truncation), and <code>usage</code> is
        the token meter.</li>
    </ul>
  `,

  onMount(root) {
    /* ---- Stateless-conversation stepper --------------------------------
       Reveal a scripted chat one message at a time; the messages[] JSON on
       the right grows with it. Assistant lines are canned + labeled. The
       point: every request re-sends the whole list; the model keeps nothing. */
    const SYSTEM = "You are a playful pet-naming assistant.";
    const SCRIPT = [
      { role: "user",      content: "Suggest a name for my new turtle." },
      { role: "assistant", content: "How about Shelldon?" },
      { role: "user",      content: "Ha! Two more in that style." },
      { role: "assistant", content: "Sir Hiss-a-lot and Leonardo." },
      { role: "user",      content: "Leonardo is perfect." },
      { role: "assistant", content: "Great choice — Leonardo it is." },
    ];

    let shown = 0;

    const chatEl  = root.querySelector("#an-chat");
    const jsonEl  = root.querySelector("#an-json");
    const capEl   = root.querySelector("#an-cap");
    const nextBtn = root.querySelector("#an-next");
    const resetBtn= root.querySelector("#an-reset");
    if (!chatEl) return;

    function esc(s) {
      return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    }

    function renderChat() {
      let html = `<div class="anat-sys">
          <span class="anat-role">system</span>${esc(SYSTEM)}
        </div>`;
      for (let i = 0; i < shown; i++) {
        const m = SCRIPT[i];
        html += `<div class="anat-msg ${m.role}">
            <span class="anat-role">${m.role}</span>${esc(m.content)}
          </div>`;
      }
      if (shown === 0) {
        html += `<div class="anat-empty">Press &ldquo;Send next turn&rdquo; to
          begin the conversation.</div>`;
      }
      chatEl.innerHTML = html;
    }

    function renderJson() {
      if (shown === 0) {
        jsonEl.textContent = "messages = []";
        return;
      }
      let lines = ["messages = ["];
      for (let i = 0; i < shown; i++) {
        const m = SCRIPT[i];
        lines.push(
          '  { "role": "' + m.role + '", "content": "' + m.content + '" },'
        );
      }
      lines.push("]");
      jsonEl.textContent = lines.join("\n");
    }

    function renderCap() {
      if (shown === 0) {
        capEl.innerHTML = "Nothing sent yet. Every request will also carry the " +
          "<strong>system</strong> prompt shown at the top.";
        return;
      }
      const last = SCRIPT[shown - 1];
      const count = shown;
      if (last.role === "user") {
        capEl.innerHTML = "A request just went out. The <strong>entire list of " +
          count + " message(s)</strong> above — plus the system prompt — was sent, " +
          "because the model remembers none of it. This is the request; now it replies.";
      } else {
        capEl.innerHTML = "The model replied, and we <strong>append its answer to " +
          "the list</strong>. The API kept no copy — your <code>messages</code> " +
          "list is the only record of this conversation.";
      }
    }

    function render() {
      renderChat();
      renderJson();
      renderCap();
      nextBtn.disabled = shown >= SCRIPT.length;
      nextBtn.textContent = shown >= SCRIPT.length ? "Conversation complete" : "Send next turn";
    }

    nextBtn.addEventListener("click", () => {
      if (shown < SCRIPT.length) { shown++; render(); }
    });
    resetBtn.addEventListener("click", () => { shown = 0; render(); });

    render();
  },
};
