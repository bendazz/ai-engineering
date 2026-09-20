/* ============================================================
   sections/manifest.js
   The ONE place section order & grouping is defined.
   window.SECTIONS = [ { id, title, group? }, ... ]
     - id    : matches the key a section registers in SectionContent
               and the <script src="sections/<id>.js"> tag in index.html
     - title : shown in the sidebar and pager
     - group : optional shared label that buckets sections in the sidebar
   Add a section = add a line here (+ its <script> tag + its file).
   ============================================================ */

// Each section file registers itself onto this map; create it here so the
// section <script>s (which load after manifest.js, before app.js) can write to it.
window.SectionContent = window.SectionContent || {};

window.SECTIONS = [
  {
    id: "what-is-ai-engineering",
    title: "What AI engineering is (and isn't)",
    group: "Setup & First Contact",
  },
  {
    id: "setup-editor",
    title: "Set up your editor (and Python)",
    group: "Setup & First Contact",
  },
  {
    id: "setup-workbench",
    title: "Your Python workbench",
    group: "Setup & First Contact",
  },
  {
    id: "setup-git",
    title: "Track your work with git",
    group: "Setup & First Contact",
  },
  {
    id: "getting-back-to-working",
    title: "Getting back to a working version",
    group: "Setup & First Contact",
  },
  {
    id: "setup-github",
    title: "Back up your work on GitHub",
    group: "Setup & First Contact",
  },
  {
    id: "undoing-a-commit",
    title: "Undoing a commit",
    group: "Setup & First Contact",
  },
  {
    id: "rolling-back-further",
    title: "Rolling back further",
    group: "Setup & First Contact",
  },
  {
    id: "setup-first-call",
    title: "Your API key and first contact",
    group: "Setup & First Contact",
  },
  {
    id: "anatomy-of-a-call",
    title: "Anatomy of a call",
    group: "Working with the Model",
  },
  {
    id: "tokens-and-context",
    title: "Tokens and the context window",
    group: "Working with the Model",
  },
  {
    id: "sampling-and-temperature",
    title: "Sampling and temperature",
    group: "Working with the Model",
  },
  {
    id: "structured-outputs",
    title: "Structured outputs",
    group: "Working with the Model",
  },
  {
    id: "first-eval",
    title: "Your first eval",
    group: "Evaluation",
  },
  {
    id: "beyond-accuracy",
    title: "Beyond accuracy: precision & recall",
    group: "Evaluation",
  },
  {
    id: "llm-as-judge",
    title: "LLM-as-judge",
    group: "Evaluation",
  },
  {
    id: "kappa-practice",
    title: "Practice: Cohen's kappa",
    group: "Evaluation",
  },
  {
    id: "is-the-difference-real",
    title: "Is the difference real?",
    group: "Evaluation",
  },
  {
    id: "eval-studio",
    title: "Studio: build an eval suite",
    group: "Evaluation",
  },
  {
    id: "prompt-anatomy",
    title: "Anatomy of a good prompt",
    group: "Prompt Engineering",
  },
  {
    id: "few-shot",
    title: "Few-shot prompting",
    group: "Prompt Engineering",
  },
  {
    id: "let-it-think",
    title: "Let the model think",
    group: "Prompt Engineering",
  },
  {
    id: "prompt-loop",
    title: "The prompt-improvement loop",
    group: "Prompt Engineering",
  },
  {
    id: "prompt-studio",
    title: "Studio: iterate a prompt to a target",
    group: "Prompt Engineering",
  },
  {
    id: "giving-the-model-tools",
    title: "Giving the model tools",
    group: "Tool Use",
  },
  {
    id: "tool-use-loop",
    title: "The tool-use loop",
    group: "Tool Use",
  },
  {
    id: "retrieval-as-a-tool",
    title: "Retrieval as a tool",
    group: "Tool Use",
  },
  {
    id: "evaluating-tools",
    title: "Evaluating tools and groundedness",
    group: "Tool Use",
  },
  {
    id: "tool-studio",
    title: "Studio: a tool-using assistant",
    group: "Tool Use",
  },
  {
    id: "what-makes-an-agent",
    title: "What makes it an agent",
    group: "Agents",
  },
  {
    id: "build-an-agent",
    title: "Build an agent",
    group: "Agents",
  },
  {
    id: "evaluating-agents",
    title: "Evaluating agents",
    group: "Agents",
  },
  {
    id: "when-agents-go-wrong",
    title: "When agents go wrong",
    group: "Agents",
  },
  {
    id: "multiple-agents",
    title: "Multiple agents",
    group: "Agents",
  },
  {
    id: "agent-studio",
    title: "Studio: build and evaluate an agent",
    group: "Agents",
  },
  {
    id: "tracing-and-flywheel",
    title: "Tracing and the data flywheel",
    group: "Production",
  },
  {
    id: "cost-and-latency",
    title: "Cost and latency as engineering",
    group: "Production",
  },
  {
    id: "caching",
    title: "Caching",
    group: "Production",
  },
  {
    id: "reliability",
    title: "Reliability: retries, timeouts, fallbacks",
    group: "Production",
  },
  {
    id: "guardrails",
    title: "Guardrails",
    group: "Production",
  },
  {
    id: "production-studio",
    title: "Studio: harden a system for production",
    group: "Production",
  },
  {
    id: "script-to-service",
    title: "From script to service",
    group: "Deployment",
  },
  {
    id: "prompt-versioning",
    title: "Prompt versioning",
    group: "Deployment",
  },
  {
    id: "ci-regression-evals",
    title: "CI regression evals",
    group: "Deployment",
  },
  {
    id: "monitoring-and-drift",
    title: "Monitoring and drift",
    group: "Deployment",
  },
  {
    id: "safe-rollouts",
    title: "Safe rollouts",
    group: "Deployment",
  },
  {
    id: "capstone-brief",
    title: "Capstone: build a real AI system",
    group: "Capstone",
  },
  {
    id: "shipping-your-portfolio",
    title: "Shipping your portfolio",
    group: "Capstone",
  },
];
