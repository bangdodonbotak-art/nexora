"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useInView } from "framer-motion";
import {
  ROUTER_FEATURES,
  ROUTING_LATENCY,
  TERMINAL_SCRIPTS,
  TERMINAL_TABS,
  type TerminalLine,
  type TerminalTone,
} from "@/lib/content";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/ui/Reveal";

const TONE_CLASS: Record<TerminalTone, string> = {
  cmd: "text-mist",
  ok: "text-cyan",
  warn: "text-amber-300",
  err: "text-danger",
  dim: "text-muted",
  text: "text-mist/75",
  accent: "text-iris",
};

const CHART_W = 660;
const CHART_H = 230;
const PAD = 30;
const CHART_MAX = 190;

function toPath(values: readonly number[]) {
  const step = (CHART_W - PAD * 2) / (values.length - 1);
  return values
    .map((v, i) => {
      const x = PAD + i * step;
      const y = CHART_H - PAD - (Math.min(v, CHART_MAX) / CHART_MAX) * (CHART_H - PAD * 2);
      return `${i === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`;
    })
    .join(" ");
}

function point(values: readonly number[], i: number) {
  const step = (CHART_W - PAD * 2) / (values.length - 1);
  const v = values[i] ?? 0;
  return {
    x: PAD + i * step,
    y: CHART_H - PAD - (Math.min(v, CHART_MAX) / CHART_MAX) * (CHART_H - PAD * 2),
  };
}

function LatencyChart({ outage }: { outage: boolean }) {
  const direct = toPath(ROUTING_LATENCY.direct);
  const optimised = toPath(ROUTING_LATENCY.optimised);
  const spike = point(ROUTING_LATENCY.direct, ROUTING_LATENCY.outageIndex);
  const spikeY = point(ROUTING_LATENCY.optimised, ROUTING_LATENCY.outageIndex);

  return (
    <div className="relative">
      <div className="mono mb-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-[0.6rem] uppercase tracking-[0.18em] text-muted">
        <span className="flex items-center gap-1.5">
          <span className="h-1.5 w-3 rounded-full bg-danger/80" /> direct provider
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-1.5 w-3 rounded-full bg-cyan" /> nexora-auto
        </span>
        <span className="ml-auto text-cyan/80">p50 11.8ms · p99 14.6ms</span>
      </div>

      <svg
        viewBox={`0 0 ${CHART_W} ${CHART_H}`}
        className="h-[230px] w-full"
        role="img"
        aria-label="Routing latency comparison chart"
      >
        {[0.25, 0.5, 0.75, 1].map((g) => {
          const y = PAD + (CHART_H - PAD * 2) * (1 - g);
          return (
            <g key={g}>
              <line
                x1={PAD}
                x2={CHART_W - PAD}
                y1={y}
                y2={y}
                stroke="rgba(140,170,210,0.12)"
                strokeWidth={1}
              />
              <text x={4} y={y + 3} className="mono" fontSize="9" fill="rgba(138,148,166,0.7)">
                {Math.round(CHART_MAX * g)}ms
              </text>
            </g>
          );
        })}

        {outage ? (
          <rect
            x={spike.x - 26}
            y={PAD}
            width={52}
            height={CHART_H - PAD * 2}
            fill="rgba(255,77,109,0.08)"
            stroke="rgba(255,77,109,0.28)"
            strokeDasharray="3 4"
          />
        ) : null}

        <motion.path
          d={direct}
          fill="none"
          stroke="rgba(255,77,109,0.75)"
          strokeWidth={2}
          strokeLinejoin="round"
          initial={{ pathLength: 0, opacity: 0.2 }}
          whileInView={{ pathLength: 1, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1.4, ease: "easeInOut" }}
        />
        <motion.path
          d={optimised}
          fill="none"
          stroke="#00f0ff"
          strokeWidth="2.4"
          strokeLinejoin="round"
          style={{ filter: "drop-shadow(0 0 6px rgba(0,240,255,0.6))" }}
          initial={{ pathLength: 0 }}
          whileInView={{ pathLength: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1.4, delay: 0.25, ease: "easeInOut" }}
        />

        <circle cx={spikeY.x} cy={spikeY.y} r={3.5} fill="#00f0ff" />
        {outage ? (
          <motion.circle
            cx={spike.x}
            cy={spike.y}
            r={4}
            fill="#ff4d6d"
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: [1, 1.6, 1], opacity: [1, 0.5, 1] }}
            transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
          />
        ) : null}
      </svg>

      <AnimatePresence>
        {outage ? (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mono absolute right-3 top-8 rounded-lg border border-danger/30 bg-danger/[0.08] px-3 py-2 text-right text-[0.62rem] leading-relaxed text-danger"
          >
            anthropic + openai offline
            <br />
            <span className="text-cyan">rerouted in 9.4ms</span>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

export function SmartTrafficTerminal() {
  const [tab, setTab] = useState<string>("routing");
  const [lines, setLines] = useState<TerminalLine[]>([]);
  const [running, setRunning] = useState(false);
  const [outage, setOutage] = useState(false);
  const timers = useRef<number[]>([]);
  const shellRef = useRef<HTMLDivElement>(null);
  const inView = useInView(shellRef, { once: true, margin: "-15%" });

  const clearTimers = () => {
    timers.current.forEach((t) => window.clearTimeout(t));
    timers.current = [];
  };

  const play = (script: TerminalLine[]) => {
    clearTimers();
    setLines([]);
    setRunning(true);
    let acc = 0;
    script.forEach((line, i) => {
      acc += line.delay;
      const id = window.setTimeout(() => {
        setLines((prev) => [...prev, line]);
        if (i === script.length - 1) setRunning(false);
      }, acc);
      timers.current.push(id);
    });
  };

  const selectTab = (key: string) => {
    setTab(key);
    if (key === "latency") {
      clearTimers();
      setRunning(false);
      return;
    }
    play(TERMINAL_SCRIPTS[key]);
  };

  const simulateOutage = () => {
    setTab("fallback");
    setOutage(true);
    play(TERMINAL_SCRIPTS.outage);
    const id = window.setTimeout(() => setOutage(false), 6000);
    timers.current.push(id);
  };

  useEffect(() => {
    if (!inView) return;
    play(TERMINAL_SCRIPTS.routing);
    return clearTimers;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView]);

  const chartKey = useMemo(() => `${tab}-${outage}`, [tab, outage]);

  return (
    <section id="router" className="section-pad relative">
      <div className="shell">
        <SectionHeading
          index="03 / ROUTER"
          eyebrow="Smart Traffic Engine"
          title={
            <>
              <span className="mono text-[0.65em] text-cyan">nexora-auto</span> decides route, model
              and price
            </>
          }
          description="The router continuously scores every provider on latency, cost, quality and health. Requests land on the best route before your users notice anything moved."
        />

        <div className="mt-12 grid gap-8 lg:grid-cols-[0.85fr_1.15fr]">
          <div className="space-y-3">
            {ROUTER_FEATURES.map((feature, i) => {
              const isActive = tab === feature.key;
              return (
                <Reveal key={feature.key} delay={i * 0.06}>
                  <button
                    type="button"
                    onClick={() => selectTab(feature.key)}
                    className={`group w-full rounded-2xl border p-5 text-left transition-all duration-300 ${
                      isActive
                        ? "border-cyan/40 bg-cyan/[0.04] shadow-[0_0_50px_-24px_rgba(0,240,255,0.7)]"
                        : "border-white/10 bg-white/[0.015] hover:border-white/20"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-[1rem] font-semibold text-mist">{feature.title}</span>
                      <span className="mono text-[0.66rem] text-cyan/80">{feature.metric}</span>
                    </div>
                    <p className="mt-2 text-[0.84rem] leading-relaxed text-muted">{feature.body}</p>
                  </button>
                </Reveal>
              );
            })}

            <Reveal delay={0.18}>
              <button
                type="button"
                onClick={simulateOutage}
                disabled={running && outage}
                className="group relative flex w-full items-center gap-3 overflow-hidden rounded-2xl border border-danger/40 bg-danger/[0.06] p-5 text-left transition-all duration-300 hover:border-danger/70 hover:bg-danger/[0.1] disabled:cursor-wait disabled:opacity-70"
              >
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-danger/40 bg-danger/10 text-danger">
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" aria-hidden>
                    <path
                      d="M13 2 4.5 13.5H11l-1 8.5 8.5-11.5H12l1-8.5Z"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
                <span>
                  <span className="block text-[0.95rem] font-semibold text-mist">
                    Simulate Vendor Outage
                  </span>
                  <span className="mono mt-0.5 block text-[0.62rem] uppercase tracking-[0.16em] text-danger/80">
                    {outage ? "failover in progress…" : "openai + anthropic · failover drill"}
                  </span>
                </span>
                <span className="ml-auto text-danger/70 transition-transform group-hover:translate-x-0.5">
                  →
                </span>
              </button>
            </Reveal>
          </div>

          <Reveal delay={0.08}>
            <div ref={shellRef} className="glass hud relative overflow-hidden rounded-2xl">
              <div className="flex items-center gap-3 border-b border-white/10 px-4 py-3">
                <span className="flex gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-danger/70" />
                  <span className="h-2.5 w-2.5 rounded-full bg-amber-400/70" />
                  <span className="h-2.5 w-2.5 rounded-full bg-cyan/70" />
                </span>
                <span className="mono flex-1 text-center text-[0.66rem] uppercase tracking-[0.2em] text-muted">
                  nexora-auto · live router trace
                </span>
                <span
                  className={`h-2 w-2 rounded-full ${
                    running ? "bg-cyan shadow-[0_0_10px_#00f0ff]" : "bg-muted/50"
                  }`}
                />
              </div>

              <div className="flex flex-wrap gap-1 border-b border-white/10 bg-white/[0.015] px-3 py-2">
                {TERMINAL_TABS.map((t) => {
                  const active = tab === t.key;
                  return (
                    <button
                      key={t.key}
                      type="button"
                      onClick={() => selectTab(t.key)}
                      className={`mono relative rounded-lg px-3 py-1.5 text-[0.62rem] uppercase tracking-[0.14em] transition-colors ${
                        active ? "text-cyan" : "text-muted hover:text-mist"
                      }`}
                    >
                      {active ? (
                        <motion.span
                          layoutId="terminal-tab"
                          className="absolute inset-0 rounded-lg border border-cyan/30 bg-cyan/[0.08]"
                          transition={{ type: "spring", stiffness: 420, damping: 32 }}
                        />
                      ) : null}
                      <span className="relative">{t.label}</span>
                    </button>
                  );
                })}
              </div>

              <div className="scanline top-24" />

              <AnimatePresence mode="wait">
                {tab === "latency" ? (
                  <motion.div
                    key={`chart-${chartKey}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="relative min-h-[320px] bg-[#04070d]/70 p-4 sm:p-5"
                  >
                    <LatencyChart outage={outage} />
                  </motion.div>
                ) : (
                  <motion.div
                    key={`logs-${tab}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="mono relative min-h-[320px] overflow-hidden bg-[#04070d]/70 p-4 text-[0.78rem] leading-relaxed sm:min-h-[360px] sm:p-5 sm:text-[0.82rem]"
                  >
                    {lines.map((line, i) => (
                      <div
                        key={`${tab}-${i}`}
                        className={`whitespace-pre-wrap ${TONE_CLASS[line.tone]} ${
                          i === lines.length - 1 && !running ? "caret" : ""
                        }`}
                      >
                        {line.text}
                      </div>
                    ))}
                    {lines.length === 0 ? (
                      <div className="text-muted">initializing router telemetry…</div>
                    ) : null}
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="grid grid-cols-3 gap-px border-t border-white/10 bg-white/[0.02]">
                {[
                  { k: "p50 route", v: "11.8ms" },
                  { k: "spend delta", v: "−41.7%" },
                  { k: "dropped", v: "0" },
                ].map((m) => (
                  <div key={m.k} className="bg-ink/50 px-4 py-3">
                    <div className="mono text-[0.58rem] uppercase tracking-[0.2em] text-muted">
                      {m.k}
                    </div>
                    <div className="mono mt-1 text-[0.92rem] text-cyan">{m.v}</div>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
