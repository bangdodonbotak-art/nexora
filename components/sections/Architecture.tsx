"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ARCHITECTURE } from "@/lib/content";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/ui/Reveal";

type Mode = "fragmented" | "unified";

const FRAGMENTED_PROVIDERS = [
  { label: "OpenAI", y: 46 },
  { label: "Anthropic", y: 100 },
  { label: "Gemini", y: 154 },
  { label: "Vision API", y: 208 },
  { label: "Vector DB", y: 262 },
  { label: "Billing", y: 316 },
];

const UNIFIED_MODALITIES = [
  { label: "LLM", y: 48, color: "#00f0ff" },
  { label: "Vision", y: 104, color: "#22d3ee" },
  { label: "Audio", y: 160, color: "#38bdf8" },
  { label: "3D / Spatial", y: 216, color: "#8b5cf6" },
  { label: "Agents", y: 272, color: "#a78bfa" },
  { label: "Embeddings", y: 328, color: "#67e8f9" },
];

const VIEW = "0 0 560 380";

function fragmentedPath(y: number, i: number) {
  const drift = i % 2 === 0 ? 1 : -1;
  return `M 104 190 C 190 ${190 + drift * (70 + i * 16)}, 300 ${y - drift * 70}, 428 ${y}`;
}

function unifiedPath(y: number, i: number) {
  return `M 104 190 C 168 190, 180 190, 236 190 C 320 190, 330 ${y}, 428 ${y}`;
}

export function Architecture() {
  const [mode, setMode] = useState<Mode>("unified");
  const data = ARCHITECTURE[mode];

  return (
    <section id="architecture" className="section-pad relative">
      <div className="shell">
        <SectionHeading
          index="01 / ARCHITECTURE"
          eyebrow="Paradigm Shift"
          title={
            <>
              Direct integration is a tax.
              <br />
              <span className="text-gradient">Nexora is the abstraction.</span>
            </>
          }
          description="Every model vendor ships its own SDK, quota model, invoice and failure mode. NEXORA normalizes the entire ecosystem behind one contract — without removing your choice of model."
        />

        <Reveal className="mt-12">
          <div className="inline-flex rounded-full border border-white/10 bg-ink-2/70 p-1 backdrop-blur">
            {(["fragmented", "unified"] as Mode[]).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setMode(m)}
                aria-pressed={mode === m}
                className={`mono rounded-full px-4 py-2.5 text-[0.68rem] uppercase tracking-[0.18em] transition-all duration-300 ${
                  mode === m
                    ? m === "unified"
                      ? "bg-gradient-to-r from-cyan/90 to-violet/80 text-ink shadow-[0_0_24px_rgba(0,240,255,0.4)]"
                      : "bg-danger/20 text-danger shadow-[0_0_24px_rgba(255,77,109,0.25)]"
                    : "text-muted hover:text-mist"
                }`}
              >
                {m === "fragmented" ? "Fragmented Direct" : "Unified Nexora"}
              </button>
            ))}
          </div>
        </Reveal>

        <div className="mt-8 grid gap-8 lg:grid-cols-[1.35fr_1fr]">
          <Reveal delay={0.05}>
            <div className="glass hud relative overflow-hidden rounded-2xl p-3 sm:p-5">
              <div
                className={`absolute inset-0 transition-opacity duration-700 ${
                  mode === "fragmented"
                    ? "bg-[radial-gradient(circle_at_70%_50%,rgba(255,77,109,0.09),transparent_60%)] opacity-100"
                    : "bg-[radial-gradient(circle_at_50%_50%,rgba(0,240,255,0.1),transparent_62%)] opacity-100"
                }`}
              />
              <div className="scanline top-0" />
              <AnimatePresence mode="wait">
                <motion.svg
                  key={mode}
                  viewBox={VIEW}
                  className="relative h-auto w-full"
                  role="img"
                  aria-label={`${data.label} architecture diagram`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.45 }}
                >
                  <defs>
                    <linearGradient id="nexGrad" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor="#00f0ff" />
                      <stop offset="100%" stopColor="#7000ff" />
                    </linearGradient>
                    <filter id="softGlow" x="-60%" y="-60%" width="220%" height="220%">
                      <feGaussianBlur stdDeviation="5" result="b" />
                      <feMerge>
                        <feMergeNode in="b" />
                        <feMergeNode in="SourceGraphic" />
                      </feMerge>
                    </filter>
                  </defs>

                  {/* App node */}
                  <g>
                    <rect
                      x="40"
                      y="158"
                      width="68"
                      height="64"
                      rx="10"
                      fill="rgba(16,22,34,0.9)"
                      stroke={mode === "fragmented" ? "rgba(255,77,109,0.5)" : "rgba(0,240,255,0.5)"}
                    />
                    <text x="74" y="186" textAnchor="middle" className="fill-mist" fontSize="11" fontFamily="var(--font-mono)">
                      YOUR
                    </text>
                    <text x="74" y="201" textAnchor="middle" className="fill-mist" fontSize="11" fontFamily="var(--font-mono)">
                      APP
                    </text>
                  </g>

                  {mode === "fragmented" ? (
                    <g>
                      {FRAGMENTED_PROVIDERS.map((p, i) => (
                        <g key={p.label}>
                          <motion.path
                            d={fragmentedPath(p.y, i)}
                            fill="none"
                            stroke="rgba(255,77,109,0.75)"
                            strokeWidth="1.4"
                            strokeDasharray="5 4"
                            initial={{ pathLength: 0, opacity: 0 }}
                            animate={{ pathLength: 1, opacity: 1 }}
                            transition={{ duration: 0.9, delay: i * 0.06 }}
                          />
                          <rect
                            x="428"
                            y={p.y - 14}
                            width="100"
                            height="28"
                            rx="6"
                            fill="rgba(24,12,18,0.85)"
                            stroke="rgba(255,77,109,0.4)"
                          />
                          <text
                            x="478"
                            y={p.y + 4}
                            textAnchor="middle"
                            className="fill-danger/90"
                            fontSize="10.5"
                            fontFamily="var(--font-mono)"
                          >
                            {p.label}
                          </text>
                        </g>
                      ))}
                      <text x="240" y="30" textAnchor="middle" fontSize="10" fontFamily="var(--font-mono)" className="fill-danger/70">
                        N DISPARATE INTEGRATIONS · NO SHARED FAILOVER
                      </text>
                    </g>
                  ) : (
                    <g>
                      {/* feed into hub */}
                      <motion.path
                        d="M 104 190 L 236 190"
                        fill="none"
                        stroke="url(#nexGrad)"
                        strokeWidth="2"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ duration: 0.8 }}
                      />
                      {/* hub */}
                      <g filter="url(#softGlow)">
                        <motion.circle
                          cx="236"
                          cy="190"
                          r="34"
                          fill="rgba(0,240,255,0.08)"
                          stroke="url(#nexGrad)"
                          strokeWidth="1.6"
                          initial={{ scale: 0.4, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ duration: 0.7, delay: 0.25 }}
                          style={{ transformOrigin: "236px 190px" }}
                        />
                        <motion.circle
                          cx="236"
                          cy="190"
                          r="20"
                          fill="none"
                          stroke="#00f0ff"
                          strokeWidth="1"
                          strokeDasharray="3 5"
                          initial={{ scale: 0.4, opacity: 0 }}
                          animate={{ scale: 1, opacity: 0.8, rotate: 360 }}
                          transition={{
                            scale: { duration: 0.7, delay: 0.25 },
                            opacity: { duration: 0.7, delay: 0.25 },
                            rotate: { duration: 22, repeat: Infinity, ease: "linear" },
                          }}
                          style={{ transformOrigin: "236px 190px" }}
                        />
                      </g>
                      <text x="236" y="187" textAnchor="middle" fontSize="11" fontFamily="var(--font-mono)" className="fill-mist">
                        NEXORA
                      </text>
                      <text x="236" y="201" textAnchor="middle" fontSize="8.5" fontFamily="var(--font-mono)" className="fill-cyan/80">
                        CORE
                      </text>

                      {UNIFIED_MODALITIES.map((m, i) => (
                        <g key={m.label}>
                          <motion.path
                            id={`uni-${i}`}
                            d={unifiedPath(m.y, i)}
                            fill="none"
                            stroke="rgba(0,240,255,0.5)"
                            strokeWidth="1.4"
                            initial={{ pathLength: 0, opacity: 0 }}
                            animate={{ pathLength: 1, opacity: 1 }}
                            transition={{ duration: 0.8, delay: 0.35 + i * 0.08 }}
                          />
                          <circle cx="428" cy={m.y} r="7" fill={m.color} filter="url(#softGlow)" />
                          <rect
                            x="444"
                            y={m.y - 14}
                            width="100"
                            height="28"
                            rx="6"
                            fill="rgba(10,18,26,0.85)"
                            stroke="rgba(140,170,210,0.22)"
                          />
                          <text
                            x="494"
                            y={m.y + 4}
                            textAnchor="middle"
                            className="fill-mist/90"
                            fontSize="10.5"
                            fontFamily="var(--font-mono)"
                          >
                            {m.label}
                          </text>
                          <circle r="3" fill="#e6fdff">
                            <animateMotion
                              dur={`${2.6 + i * 0.35}s`}
                              repeatCount="indefinite"
                              path={unifiedPath(m.y, i)}
                              begin={`${i * 0.4}s`}
                            />
                          </circle>
                        </g>
                      ))}
                      <text x="236" y="30" textAnchor="middle" fontSize="10" fontFamily="var(--font-mono)" className="fill-cyan/70">
                        ONE CONTRACT · ROUTING · FAILOVER · BILLING
                      </text>
                    </g>
                  )}
                </motion.svg>
              </AnimatePresence>
            </div>
          </Reveal>

          <Reveal delay={0.1}>
            <div className="glass flex h-full flex-col justify-between rounded-2xl p-6 sm:p-8">
              <AnimatePresence mode="wait">
                <motion.div
                  key={mode}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -14 }}
                  transition={{ duration: 0.4 }}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`h-2 w-2 rounded-full ${
                        mode === "unified" ? "bg-cyan shadow-[0_0_14px_#00f0ff]" : "bg-danger shadow-[0_0_14px_#ff4d6d]"
                      }`}
                    />
                    <span className="mono text-[0.68rem] uppercase tracking-[0.22em] text-muted">
                      {mode === "unified" ? "Target State" : "Current State"}
                    </span>
                  </div>
                  <h3 className="display mt-4 text-2xl font-bold text-mist">{data.label}</h3>
                  <p className="mt-2 text-[0.9rem] leading-relaxed text-muted">{data.caption}</p>
                  <ul className="mt-7 space-y-3.5">
                    {data.points.map((point) => (
                      <li key={point} className="flex items-start gap-3 text-[0.88rem] text-mist/85">
                        <span
                          className={`mt-[0.45rem] h-1.5 w-1.5 shrink-0 rotate-45 ${
                            mode === "unified" ? "bg-cyan" : "bg-danger"
                          }`}
                        />
                        {point}
                      </li>
                    ))}
                  </ul>
                </motion.div>
              </AnimatePresence>

              <div className="mt-8 rounded-xl border border-white/10 bg-white/[0.02] p-4">
                <div className="mono text-[0.62rem] uppercase tracking-[0.22em] text-muted">
                  Migration surface
                </div>
                <div className="mono mt-2 text-[0.8rem] text-cyan">
                  change: base_url → api.nexora.ai/v1
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}