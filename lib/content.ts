export const NEXORA = {
  name: "NEXORA",
  tagline: "Universal AI Infrastructure",
  version: "v1.0",
} as const;

export const HERO = {
  badge: "NEXORA PLATFORM v1.0 — Universal AI Infrastructure",
  headline: ["One API.", "Every Model.", "Every Modality.", "Every Workflow."],
  subtitle:
    "Connecting developers, enterprise applications, autonomous agents, and multi-modal AI systems through a unified infrastructure layer.",
  primaryCta: "Get API Key (Instant Access)",
  secondaryCta: "Read Whitepaper",
} as const;

export const HERO_STATS = [
  { value: 1, suffix: "", label: "Unified Gateway", sub: "one endpoint, every provider" },
  { value: 12, prefix: "< ", suffix: "ms", label: "Routing Latency", sub: "median, global edge" },
  { value: 99.999, suffix: "%", decimals: 3, label: "Uptime", sub: "multi-region failover" },
] as const;

export const PILLARS = [
  { title: "Unified Gateway & Router", body: "Nexora Core abstracts every provider behind one contract." },
  { title: "LLM, Vision, Audio, 3D & Agents", body: "Native multi-modal capability, shared infrastructure." },
  { title: "Managed Cloud & Enterprise Private", body: "Deploy in our cloud or inside your perimeter." },
] as const;

export const ARCHITECTURE = {
  fragmented: {
    label: "Fragmented Direct Model",
    caption: "Every provider introduces its own SDK, quota, invoice and failure mode.",
    points: [
      "Multiple disparate API integrations",
      "Custom fallback logic per provider",
      "Decentralized billing and token monitoring",
      "Isolated agent and memory frameworks",
    ],
  },
  unified: {
    label: "Unified Nexora Model",
    caption: "One contract in front of the entire model network.",
    points: [
      "Single standardized gateway API",
      "Automated model routing & latency balancing",
      "Centralized wallet and usage telemetry",
      "Native agent, memory & workflow engines",
    ],
  },
} as const;

export const LAYERS = [
  {
    index: "05",
    name: "Nexora Studio",
    kind: "Applications",
    summary: "Business Automations & Enterprise Suites",
    detail:
      "The surface where operators, analysts and product teams compose intelligence without touching a query string. Studio ships opinionated suites for content, support, research and revenue operations.",
    tags: ["Nexora Studio", "Agents", "Business Automations", "Enterprise Suites"],
    accent: "#8B5CF6",
  },
  {
    index: "04",
    name: "Orchestration",
    kind: "Nexora Flow",
    summary: "Visual Workflows & Dynamic Branching",
    detail:
      "A directed graph runtime for intelligence. Visual workflows, event triggers, dynamic branching and webhooks execute as first-class durable jobs with replay and versioning.",
    tags: ["Visual Workflows", "Event Triggers", "Dynamic Branching", "Webhooks"],
    accent: "#6366F1",
  },
  {
    index: "03",
    name: "Agent Framework",
    kind: "Agent Infrastructure",
    summary: "Autonomous Planning, Memory, Tool Execution",
    detail:
      "Perception, planning, tool use, memory and action as a managed loop. Agents hold episodic memory, call tools with scoped credentials and prove every step.",
    tags: ["Autonomous Planning", "Episodic Memory", "Tool Execution Engine"],
    accent: "#22D3EE",
  },
  {
    index: "02",
    name: "Nexora Core",
    kind: "Core",
    summary: "Smart Router, Guardrails, Unified Billing",
    detail:
      "The control plane. Smart model router `nexora-auto`, API gateway, safety guardrails and unified billing with per-team budgets and live telemetry.",
    tags: ["Smart Model Router", "API Gateway", "Safety Guardrails", "Unified Billing"],
    accent: "#00F0FF",
  },
  {
    index: "01",
    name: "Multi-Modal Foundation Layer",
    kind: "Model Network",
    summary: "LLM, Vision/OCR, Video, Audio/Voice, Spatial 3D",
    detail:
      "The model network itself. Language and code, vision and OCR, image, video, audio and voice, 3D assets and embeddings — addressed through one normalized interface.",
    tags: ["LLMs", "Image & Video", "Audio & Voice", "3D Assets", "Embeddings"],
    accent: "#0EA5E9",
  },
] as const;

/* ---------- Smart Traffic Terminal ---------- */

export const TERMINAL_TABS = [
  { key: "routing", label: "Routing Logic" },
  { key: "fallback", label: "Fallback Switch" },
  { key: "latency", label: "Latency Graph" },
] as const;

export type TerminalTone = "cmd" | "ok" | "warn" | "err" | "dim" | "text" | "accent";
export type TerminalLine = { text: string; tone: TerminalTone; delay: number };

export const TERMINAL_SCRIPTS: Record<string, TerminalLine[]> = {
  routing: [
    { text: "$ nexora route --auto --optimize balanced", tone: "cmd", delay: 240 },
    { text: "› resolving candidate pool ......... 9 providers", tone: "dim", delay: 420 },
    { text: "› scoring latency · cost · quality · health", tone: "dim", delay: 400 },
    { text: "   openai/gpt-5 .................... score 0.91", tone: "text", delay: 260 },
    { text: "   anthropic/claude-opus-4 ......... score 0.94", tone: "text", delay: 260 },
    { text: "   google/gemini-3-flash ........... score 0.97   ✓ selected", tone: "ok", delay: 260 },
    { text: "› routing request → gemini-3-flash @ edge-iad", tone: "dim", delay: 460 },
    { text: "✓ 200 OK · 11.8ms · $0.0019 · cache miss", tone: "ok", delay: 500 },
  ],
  fallback: [
    { text: "$ nexora route --auto --resilience strict", tone: "cmd", delay: 240 },
    { text: "› primary: anthropic/claude-opus-4", tone: "dim", delay: 400 },
    { text: "› health probe → 2xx · 41ms", tone: "dim", delay: 420 },
    { text: "› standby chains primed: openai · google · mistral", tone: "dim", delay: 460 },
    { text: "› circuit breakers calibrated · replay buffer armed", tone: "dim", delay: 420 },
    { text: "✓ failover fabric ready · 0 dropped requests", tone: "ok", delay: 500 },
  ],
  outage: [
    { text: "$ nexora simulate --outage anthropic,openai", tone: "cmd", delay: 240 },
    { text: "!! provider anthropic → 503 service unavailable", tone: "err", delay: 520 },
    { text: "!! provider openai → 502 bad gateway", tone: "err", delay: 460 },
    { text: "› circuit breakers open · traffic quarantined", tone: "warn", delay: 440 },
    { text: "› rerouting in-flight requests → standby chain", tone: "dim", delay: 440 },
    { text: "   mistral/large-3 ................. healthy · 9.4ms ✓", tone: "text", delay: 300 },
    { text: "› replaying 1,204 requests idempotently (req_8f2a71)", tone: "dim", delay: 460 },
    { text: "› consensus re-verified · quality gate 0.95 pass", tone: "dim", delay: 420 },
    { text: "✓ zero-downtime failover · <12ms · 0 requests dropped", tone: "ok", delay: 520 },
  ],
};

export const ROUTER_FEATURES = [
  {
    key: "routing",
    title: "Latency Optimization",
    body: "Dynamic routing based on real-time provider response speeds. The router measures, then moves.",
    metric: "p50 11.8ms",
  },
  {
    key: "fallback",
    title: "Failover Resilience",
    body: "Instant fallback switching during provider outages with request-level replay semantics.",
    metric: "0 dropped req.",
  },
  {
    key: "latency",
    title: "Live Telemetry",
    body: "Every route is charted continuously, so optimisation is observable rather than assumed.",
    metric: "−41.7% spend",
  },
] as const;

export const ROUTING_LATENCY = {
  direct: [48, 44, 52, 47, 58, 51, 46, 61, 172, 55, 49, 53],
  optimised: [12, 11, 13, 12, 10, 12, 11, 12, 11, 10, 12, 11],
  outageIndex: 8,
} as const;

/* ---------- Nexora Flow ---------- */

export type FlowNode = {
  id: string;
  label: string;
  kind: string;
  meta: string;
  model: string;
  latency: string;
  tokens: string;
  x: number;
  y: number;
  color: string;
};

export const FLOW_NODES: FlowNode[] = [
  {
    id: "brief",
    label: "Product Brief",
    kind: "Trigger",
    meta: "inbound · payload",
    model: "—",
    latency: "4ms",
    tokens: "—",
    x: 3,
    y: 35,
    color: "#00f0ff",
  },
  {
    id: "script",
    label: "LLM Scripting",
    kind: "Model",
    meta: "nexora-auto · text",
    model: "nexora/text-v2",
    latency: "212ms",
    tokens: "1,840",
    x: 21,
    y: 5,
    color: "#22d3ee",
  },
  {
    id: "assets",
    label: "Asset Generation",
    kind: "Vision + Audio",
    meta: "image · video · voice",
    model: "nexora/vision-v1",
    latency: "1.64s",
    tokens: "3,120",
    x: 39,
    y: 50,
    color: "#38bdf8",
  },
  {
    id: "review",
    label: "Human Review",
    kind: "Gate",
    meta: "approval · SLA 4h",
    model: "human-in-the-loop",
    latency: "—",
    tokens: "—",
    x: 58,
    y: 4,
    color: "#8b5cf6",
  },
  {
    id: "deploy",
    label: "Auto Deploy",
    kind: "Action",
    meta: "webhook · publish",
    model: "nexora/flow-runtime",
    latency: "86ms",
    tokens: "—",
    x: 77,
    y: 39,
    color: "#a78bfa",
  },
];

export const SAFETY_NODE: FlowNode = {
  id: "guardrail",
  label: "Safety Guardrail",
  kind: "Branch",
  meta: "if toxicity > 0.7",
  model: "nexora/guard-v1",
  latency: "18ms",
  tokens: "96",
  x: 39,
  y: 76,
  color: "#ff4d6d",
};

export const FLOW_CAPABILITIES = [
  { k: "Durable execution", v: "replay · resume · version" },
  { k: "Human-in-the-loop", v: "approval gates + SLA" },
  { k: "Branching logic", v: "conditions · guardrails" },
] as const;

/* ---------- Enterprise Governance Bento ---------- */

export const GUARDRAIL_CONTROLS = [
  {
    id: "pii",
    label: "PII Masking",
    body: "Redact emails, cards, national IDs and secrets before they leave the perimeter.",
  },
  {
    id: "injection",
    label: "Prompt Injection Shield",
    body: "Neutralise instruction overrides, tool hijacks and jailbreak patterns in-flight.",
  },
] as const;

export const IDENTITY_SESSIONS = [
  { user: "a.reyes", role: "Platform Admin", provider: "Okta SSO", scope: "full", status: "active" },
  { user: "m.tanaka", role: "ML Engineer", provider: "Google OAuth", scope: "models:write", status: "active" },
  { user: "svc.billing", role: "Service Account", provider: "OIDC", scope: "wallet:read", status: "rotating" },
] as const;

export const WALLET_RATES = {
  disparatePer1k: 0.018,
  unifiedPer1k: 0.0105,
  minMillions: 5,
  maxMillions: 500,
  defaultMillions: 120,
} as const;

export const OBSERVABILITY = {
  reliability: 99.982,
  latencyMs: 11.8,
  costPerReq: 0.0019,
} as const;

/* ---------- Expansion Roadmap ---------- */

export type RoadmapStatus = "live" | "progress" | "upcoming" | "visionary";

export const ROADMAP_PHASES: {
  phase: number;
  title: string;
  status: RoadmapStatus;
  statusLabel: string;
  accent: string;
  body: string;
  points: string[];
}[] = [
  {
    phase: 1,
    title: "Unified API",
    status: "live",
    statusLabel: "Active / Live",
    accent: "#00f0ff",
    body: "The standardized gateway contract lands: one endpoint, one SDK, every provider behind it.",
    points: ["Single standardized gateway API", "Provider-agnostic SDK", "First multi-modal routes"],
  },
  {
    phase: 2,
    title: "Core Gateway",
    status: "live",
    statusLabel: "Active / Live",
    accent: "#22d3ee",
    body: "The control plane matures with the nexora-auto router, guardrails and unified billing.",
    points: ["nexora-auto smart router", "Safety guardrails inline", "Unified billing wallet"],
  },
  {
    phase: 3,
    title: "Autonomous Agents",
    status: "progress",
    statusLabel: "In Progress",
    accent: "#8b5cf6",
    body: "Planning, memory and tool execution as a managed loop with scoped credentials.",
    points: ["Episodic memory store", "Tool execution engine", "Signed step traces"],
  },
  {
    phase: 4,
    title: "Flow Automation",
    status: "progress",
    statusLabel: "In Progress",
    accent: "#a78bfa",
    body: "Visual workflows become durable jobs: branching, event triggers and webhooks.",
    points: ["Durable job runtime", "Dynamic branching", "Human approval gates"],
  },
  {
    phase: 5,
    title: "Enterprise Private Cloud",
    status: "upcoming",
    statusLabel: "Upcoming",
    accent: "#38bdf8",
    body: "Deploy the same infrastructure inside your own perimeter with customer-managed keys.",
    points: ["Customer-managed keys", "Regional data residency", "Private model routing"],
  },
  {
    phase: 6,
    title: "Developer Marketplace",
    status: "upcoming",
    statusLabel: "Upcoming",
    accent: "#818cf8",
    body: "A marketplace for tools, agents and workflow templates with metered distribution.",
    points: ["Tool & agent registry", "Metered payouts", "One-click install"],
  },
  {
    phase: 7,
    title: "Physical AI",
    status: "visionary",
    statusLabel: "Visionary",
    accent: "#7000ff",
    body: "Robotics, spatial AI and digital twins connected to the same infrastructure layer.",
    points: ["Spatial 3D & digital twins", "Robotics perception loop", "Sim-to-real orchestration"],
  },
];

export const CAPABILITY_MATRIX = [
  { title: "Language & Code", body: "Reasoning models and general LLMs." },
  { title: "Vision & OCR", body: "Document understanding and visual search." },
  { title: "Image Generation", body: "Inpainting, outpainting and upscaling." },
  { title: "Video Production", body: "Storyboard creation and video generation." },
  { title: "Audio & Voice", body: "Speech recognition and voice synthesis." },
  { title: "3D & Avatar", body: "Spatial assets and virtual presenters." },
] as const;

export const AGENT_STEPS = [
  { step: "01", title: "Perception", body: "Contextual parsing of intent, files and environment." },
  { step: "02", title: "Planning", body: "Task decomposition into verifiable units of work." },
  { step: "03", title: "Tool Use", body: "Web and API execution with scoped credentials." },
  { step: "04", title: "Memory", body: "Persistent episodic storage across sessions." },
  { step: "05", title: "Action", body: "Final synthesis, delivery and audit trail." },
] as const;