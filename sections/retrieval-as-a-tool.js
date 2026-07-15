/* ============================================================
   Section: Retrieval as a tool  (LAB) — Block 5 section 3
   (course section 23). RAG, folded in as a tool.
     - the idea: give the model a search_docs(query) tool; it retrieves
       relevant passages from YOUR corpus, then answers grounded in them
     - how search works: embeddings turn text into vectors (similar
       meaning -> nearby); COSINE SIMILARITY ranks (callback Math for AI);
       embed corpus once, embed query, return top-k
     - build it with a FREE LOCAL embedder (sentence-transformers, no API
       key, no cost) + numpy cosine; wrap as a tool; run the loop
     - grounding: the model answers from retrieved text, not hazy memory
       -> fresher, citable, and CHECKABLE (sets up groundedness eval)
   LAB: predict-then-reveal; ends "What you accomplished".

   Star interactive: retrieval demo — type a query, REAL cosine
   similarity (simplified word-frequency vectors, labeled) ranks a small
   corpus, top-k highlighted.

   Facts: tool loop verified (sec 22). Anthropic has NO first-party
   embeddings model -> free local sentence-transformers (see
   [[verified-facts]]). Cosine similarity = callback to Math for AI.

   NOTE (playbook): no literal dollar signs; no backtick chars in prose;
   no star-slash in comments; NO literal \\n inside Toolkit.code bodies (search
   returns a list; join with a space); instructor notes hidden.
   ============================================================ */

window.SectionContent["retrieval-as-a-tool"] = {
  title: "Retrieval as a tool",

  html: `
    <div class="eyebrow">Tool Use · Section 26 · Lab</div>
    <h1>Retrieval as a tool</h1>

    <p>The single most useful tool you can give a model is a way to look things up in
    <em>your</em> documents — your help center, your policies, your product manuals. That
    pattern is <strong>retrieval-augmented generation</strong> (RAG), and in modern
    practice it isn't a special architecture at all. It's just a
    <strong>search tool the model calls,</strong> exactly like the calculator — the model
    searches, reads what comes back, and answers grounded in it.</p>

    <h2>How the search works: embeddings and cosine similarity</h2>

    <p>Behind the tool is an idea you met in Math for AI. An <strong>embedding</strong>
    turns a piece of text into a vector, positioned so that texts with <em>similar
    meaning</em> land near each other. To find passages relevant to a question, you embed
    the question, then rank your passages by <strong>cosine similarity</strong> — the
    cosine of the angle between the query vector and each passage vector. High cosine means
    &ldquo;points the same way,&rdquo; means &ldquo;about the same thing.&rdquo; You embed
    the corpus <em>once</em>, then every query is a quick similarity search.</p>

    <p>Try it — the ranking here is real cosine similarity:</p>

    ${Toolkit.widget(
      "Semantic search, by cosine similarity",
      `<input type="text" id="rt-q" class="rt-input" value="how long do I have to get my money back?" />
       <div class="rt-rows" id="rt-rows"></div>
       <div class="nd-cap">The cosine-similarity ranking is genuinely computed. To run in
         your browser it uses a <em>simplified</em> word-frequency vector, not a neural
         embedding — so it matches on shared words, and would miss that &ldquo;money
         back&rdquo; means &ldquo;refund.&rdquo; A real embedder captures that meaning; the
         ranking step is identical.</div>`
    )}

    <h2>Build it</h2>

    <p>Anthropic doesn't sell an embedding model, and we're staying free, so we embed
    locally with <strong>sentence-transformers</strong> — a small model that runs on your
    machine, no API key, no cost:</p>

    ${Toolkit.code("search.py", `from sentence_transformers import SentenceTransformer
import numpy as np

embedder = SentenceTransformer("all-MiniLM-L6-v2")   # free, local, no API key

CORPUS = [
    "Refunds are available within 30 days of purchase with a receipt.",
    "Standard shipping takes 3 to 5 business days.",
    "Express shipping arrives the next business day for an extra fee.",
    "Gift cards never expire and are not refundable.",
    "Damaged items can be exchanged free within 90 days.",
]
corpus_vecs = embedder.encode(CORPUS)                # embed the corpus ONCE

def cosine(a, b):
    return (a @ b) / (np.linalg.norm(a) * np.linalg.norm(b))

def search_docs(query, k=2):
    q = embedder.encode([query])[0]
    scores = [cosine(v, q) for v in corpus_vecs]
    top = np.argsort(scores)[::-1][:k]
    return [CORPUS[i] for i in top]                  # the k most relevant passages`)}

    <p>Then it's just another tool. Define it, and in your loop, run
    <code>search_docs</code> when the model asks and hand the passages back:</p>

    ${Toolkit.code("wiring it into the loop", `search_tool = {
    "name": "search_docs",
    "description": (
        "Search the company help center for passages relevant to the question. "
        "Call this for any question about policies, shipping, refunds, or products."
    ),
    "input_schema": {
        "type": "object",
        "properties": {"query": {"type": "string", "description": "What to look up"}},
        "required": ["query"],
    },
}

# inside the tool-use loop, when the model calls search_docs:
if block.type == "tool_use" and block.name == "search_docs":
    passages = search_docs(block.input["query"])
    result = " ".join(passages)          # the text the model will answer from`)}

    <p>Now the model answers from <strong>retrieved text</strong> instead of its hazy,
    frozen memory. That's a big upgrade: the answers are <strong>current</strong> (change
    the corpus, change the answers — no retraining), <strong>specific to your world</strong>,
    and — the part this course cares about most — <strong>checkable</strong>, because you
    know exactly which passages the answer was supposed to come from.</p>

    ${Toolkit.problem(
      `Your retrieval returns the wrong passages — a question about refunds pulls back the
       shipping and gift-card entries instead. The model then answers confidently using
       them. Whose fault is the wrong answer, and what does that tell you about where to
       spend your effort?`,
      `<p>It's the <strong>retrieval's</strong> fault, not the model's — and this is the
       key mental model for RAG. The model can only be as good as the passages you feed it;
       hand it the wrong context and it will faithfully produce a wrong (or made-up) answer,
       often with total confidence. &ldquo;Garbage in, garbage out&rdquo; has teeth here.
       So a huge fraction of RAG quality is <em>retrieval</em> quality: if the right
       passage never comes back, no prompt fix downstream can save the answer. It also
       means the two halves fail differently and must be measured separately — which is
       exactly the next section.</p>`,
      { label: "Predict: wrong passages" }
    )}

    ${Toolkit.instructorNote(
      `The framing that makes RAG click: retrieval is a <em>tool</em>, full stop — the same
       loop as the calculator, with a fancier tool body. Students who have done RAG before
       often carry a heavier mental model ("pipelines," "vector databases"); collapsing it
       to "a search function the model calls" is clarifying, not dumbing-down. Do embed the
       corpus live if you can and show the cosine scores — the callback to cosine similarity
       from Math for AI lands hard and reassures them the AI magic bottoms out in geometry
       they already own. Deep retrieval infrastructure (chunking, vector DBs, reranking) is
       a later-course topic; here the goal is the fundamental loop plus the instinct that
       retrieval quality caps answer quality.`
    )}

    <h2>What you accomplished</h2>
    <ul>
      <li>You built <strong>RAG as a tool</strong>: a <code>search_docs</code> function the
        model calls, then answers grounded in what it retrieved.</li>
      <li>Retrieval is <strong>embeddings + cosine similarity</strong> (straight from Math
        for AI): embed the corpus once, embed the query, rank by cosine, return the top-k —
        with a free local embedder, no API cost.</li>
      <li>Grounded answers are <strong>current, specific, and checkable</strong> — and
        <strong>retrieval quality caps answer quality</strong>, so the two halves must be
        measured separately.</li>
    </ul>
  `,

  onMount(root) {
    /* ---- Retrieval demo: REAL cosine over simplified word-freq vectors ---- */
    const CORPUS = [
      "Refunds are available within 30 days of purchase with a receipt.",
      "Standard shipping takes 3 to 5 business days.",
      "Express shipping arrives the next business day for an extra fee.",
      "Gift cards never expire and are not refundable.",
      "Damaged items can be exchanged free within 90 days.",
    ];
    const qEl = root.querySelector("#rt-q");
    const rowsEl = root.querySelector("#rt-rows");
    if (!qEl) return;

    function toks(s) { return (s.toLowerCase().match(/[a-z]+/g) || []); }
    function vec(words) {
      const v = {};
      words.forEach((w) => { v[w] = (v[w] || 0) + 1; });
      return v;
    }
    function cosine(a, b) {
      let dot = 0, na = 0, nb = 0;
      for (const w in a) { na += a[w] * a[w]; if (b[w]) dot += a[w] * b[w]; }
      for (const w in b) { nb += b[w] * b[w]; }
      return (na && nb) ? dot / (Math.sqrt(na) * Math.sqrt(nb)) : 0;
    }
    const docVecs = CORPUS.map((d) => vec(toks(d)));

    function render() {
      const qv = vec(toks(qEl.value));
      const scored = CORPUS.map((d, i) => ({ d: d, s: cosine(qv, docVecs[i]) }));
      scored.sort((a, b) => b.s - a.s);
      const max = Math.max(0.0001, scored[0].s);
      rowsEl.innerHTML = scored.map((r, rank) =>
        `<div class="rt-row${rank < 2 && r.s > 0 ? " top" : ""}">
           <div class="rt-bar-wrap"><div class="rt-bar" style="width:${Math.round((r.s / max) * 100)}%"></div></div>
           <div class="rt-score">${r.s.toFixed(2)}</div>
           <div class="rt-doc">${r.d}${rank < 2 && r.s > 0 ? ' <span class="rt-tag">retrieved</span>' : ""}</div>
         </div>`).join("");
    }
    qEl.addEventListener("input", render);
    render();
  },
};
