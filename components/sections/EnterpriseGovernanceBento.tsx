"use client";

import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  GUARDRAIL_CONTROLS,
  IDENTITY_SESSIONS,
  OBSERVABILITY,
  WALLET_RATES,
} from "@/lib/content";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/ui/Reveal";

function BentoCard({
  children,
  className = "",
  accent = "#00f0ff",
  label,
}: {
  children: ReactNode;
  className?: string;
  accent?: string;
  label: string;
}) {
  return (
    <div
      className={`relative rounded-2xl bg-gradient-to-br p-px transition-shadow duration-500 ${className}`}
      style={{
        backgroundImage: `linear-gradient(140deg, ${accent}66, rgba(255,255,255,0.05) 34%, rgba(255,255,255,0.02) 62%, ${accent}33)`,
      }}
    >
      <article className="glass-strong relative flex h-full flex-col overflow-hidden rounded-[15px] p-6">
        <span className="mono mb-4 flex items-center gap-2 text-[0.58rem] uppercase tracking-[0.24em] text-muted">
          <span className="h-1.5 w-1.5 rounded-full" style={{ background: accent }} />
          {label}
        </span>
        {children}
      </article>
    </div>
  );
}

function Toggle({
  on,
  accent,
  onClick,
  label,
}: {
  on: boolean;
  accent: string;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={label}
      onClick={onClick}
      className="relative h-6 w-11 shrink-0 rounded-full border transition-colors"
      style={{
        borderColor: on ? `${accent}80` : "rgba(140,170,210,0.2)",
        background: on ? `${accent}22` : "rgba(255,255,255,0.06)",
      }}
    >
      <motion.span
        layout
        transition={{ type: "spring", stiffness: 520, damping: 34 }}
        className="absolute top-1/2 h-4 w-4 -translate-y-1/2 rounded-full"
        style={{
          left: on ? "calc(100% - 1.125rem)" : "0.25rem",
          background: on ? accent : "rgba(138,148,166,0.9)",
          boxShadow: on ? `0 0 12px ${accent}` : "none",
        }}
      />
    </button>
  );
}

function GuardrailsCard() {
  const [state, setState] = useState<Record<string, boolean>>({ pii: true, injection: true });

  return (
    <div className="flex h-full flex-col">
      <h3 className="display text-2xl font-bold text-mist">Safety runs before the model</h3>
      <p className="mt-3 max-w-md text-[0.88rem] leading-relaxed text-muted">
        Every request is inspected for injection risk and sensitive data before it reaches a provider —
        then re-checked on the way out.
      </p>

      <div className="mt-6 space-y-3">
        {GUARDRAIL_CONTROLS.map((control) => {
          const on = state[control.id];
          return (
            <div
              key={control.id}
              className={`flex items-start gap-4 rounded-xl border p-4 transition-colors duration-500 ${
                on ? "border-cyan/25 bg-cyan/[0.05]" : "border-danger/25 bg-danger/[0.05]"
              }`}
            >
              <span
                className={`mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-lg border text-[0.7rem] transition-colors duration-500 ${
                  on
                    ? "border-cyan/40 bg-cyan/10 text-cyan"
                    : "border-danger/40 bg-danger/10 text-danger"
                }`}
              >
                {on ? "✓" : "✕"}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-[0.92rem] font-semibold text-mist">{control.label}</span>
                  <Toggle
                    on={on}
                    accent="#00f0ff"
                    label={control.label}
                    onClick={() => setState((s) => ({ ...s, [control.id]: !s[control.id] }))}
                  />
                </div>
                <p className="mt-1.5 text-[0.78rem] leading-relaxed text-muted">{control.body}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mono mt-auto flex items-center justify-between pt-6 text-[0.6rem] uppercase tracking-[0.18em]">
        <span className="text-muted">inspection layer</span>
        <AnimatePresence mode="wait">
          <motion.span
            key={state.pii && state.injection ? "armed" : "bypassed"}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className={state.pii && state.injection ? "text-cyan" : "text-danger"}
          >
            {state.pii && state.injection ? "● all guardrails armed" : "● degraded mode"}
          </motion.span>
        </AnimatePresence>
      </div>
    </div>
  );
}

function WalletCard() {
  const [millions, setMillions] = useState<number>(WALLET_RATES.defaultMillions);

  const { disparate, unified, savings, pct } = useMemo(() => {
    const tokens = millions * 1_000_000;
    const disparate = (tokens / 1000) * WALLET_RATES.disparatePer1k;
    const unified = (tokens / 1000) * WALLET_RATES.unifiedPer1k;
    return {
      disparate,
      unified,
      savings: disparate - unified,
      pct: disparate > 0 ? ((disparate - unified) / disparate) * 100 : 0,
    };
  }, [millions]);

  const money = (n: number) =>
    n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

  return (
    <div className="flex h-full flex-col">
      <h3 className="display text-xl font-bold text-mist">Unified billing wallet</h3>
      <p className="mt-2 text-[0.82rem] leading-relaxed text-muted">
        One invoice replaces the stack of provider bills. Drag to estimate monthly spend.
      </p>

      <div className="mt-5 flex items-baseline justify-between">
        <span className="mono text-[1.6rem] font-medium text-mist">{millions}M</span>
        <span className="mono text-[0.62rem] uppercase tracking-[0.18em] text-muted">tokens / month</span>
      </div>

      <input
        type="range"
        min={WALLET_RATES.minMillions}
        max={WALLET_RATES.maxMillions}
        step={5}
        value={millions}
        onChange={(e) => setMillions(Number(e.target.value))}
        aria-label="Estimated tokens per month"
        className="mt-3 h-1.5 w-full cursor-pointer appearance-none rounded-full bg-white/10 accent-cyan [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-cyan [&::-webkit-slider-thumb]:shadow-[0_0_12px_#00f0ff]"
      />

      <div className="mt-5 grid grid-cols-2 gap-3">
        <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3.5">
          <div className="mono text-[0.56rem] uppercase tracking-[0.16em] text-muted">
            disparate providers
          </div>
          <div className="mono mt-1.5 text-[1.05rem] text-danger/90 line-through decoration-danger/50">
            {money(disparate)}
          </div>
        </div>
        <div className="rounded-xl border border-cyan/25 bg-cyan/[0.05] p-3.5">
          <div className="mono text-[0.56rem] uppercase tracking-[0.16em] text-cyan/80">
            nexora unified
          </div>
          <div className="mono mt-1.5 text-[1.05rem] text-cyan">{money(unified)}</div>
        </div>
      </div>

      <div className="mono mt-auto flex items-center justify-between pt-5 text-[0.66rem]">
        <span className="text-muted">
          est. savings <span className="text-mist/85">{money(savings)}</span>
        </span>
        <span className="rounded-full border border-cyan/30 bg-cyan/[0.06] px-2.5 py-1 text-cyan">
          −{pct.toFixed(1)}%
        </span>
      </div>
    </div>
  );
}

function IdentityCard() {
  return (
    <div className="flex h-full flex-col">
      <h3 className="display text-xl font-bold text-mist">Identity &amp; RBAC</h3>
      <p className="mt-2 text-[0.82rem] leading-relaxed text-muted">
        SSO, OAuth and service identities resolve to scoped permissions on every call.
      </p>

      <div className="mt-5 space-y-2.5">
        {IDENTITY_SESSIONS.map((session, i) => (
          <motion.div
            key={session.user}
            initial={{ opacity: 0, x: -10 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: i * 0.1 }}
            className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.02] px-3.5 py-2.5"
          >
            <span className="relative grid h-8 w-8 shrink-0 place-items-center">
              <span className="absolute inset-0 rounded-full border border-violet/40" />
              <motion.span
                className="absolute inset-0 rounded-full border border-cyan/50"
                animate={{ rotate: 360 }}
                transition={{ duration: 6 + i * 2, repeat: Infinity, ease: "linear" }}
                style={{ borderTopColor: "transparent", borderRightColor: "transparent" }}
              />
              <span className="h-2 w-2 rounded-full bg-gradient-to-br from-cyan to-violet" />
            </span>
            <div className="min-w-0 flex-1">
              <div className="mono truncate text-[0.7rem] text-mist/90">{session.user}</div>
              <div className="mono truncate text-[0.58rem] uppercase tracking-[0.12em] text-muted">
                {session.provider} · {session.scope}
              </div>
            </div>
            <span
              className={`mono shrink-0 rounded-full px-2 py-0.5 text-[0.55rem] uppercase tracking-[0.12em] ${
                session.status === "active"
                  ? "bg-cyan/10 text-cyan"
                  : "bg-iris/10 text-iris"
              }`}
            >
              {session.role.split(" ")[0]}
            </span>
          </motion.div>
        ))}
      </div>

      <div className="mono mt-auto flex items-center gap-2 pt-5 text-[0.58rem] uppercase tracking-[0.16em] text-muted">
        <span className="live-dot" />
        enforce identity on every route
      </div>
    </div>
  );
}

function Gauge({ value }: { value: number }) {
  const r = 52;
  const c = 2 * Math.PI * r;
  return (
    <div className="relative grid place-items-center">
      <svg viewBox="0 0 140 140" className="h-32 w-32 -rotate-90">
        <circle cx="70" cy="70" r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="9" />
        <motion.circle
          cx="70"
          cy="70"
          r={r}
          fill="none"
          stroke="url(#gaugeGrad)"
          strokeWidth="9"
          strokeLinecap="round"
          strokeDasharray={c}
          initial={{ strokeDashoffset: c }}
          whileInView={{ strokeDashoffset: c * (1 - value / 100) }}
          viewport={{ once: true }}
          transition={{ duration: 1.8, ease: [0.22, 1, 0.36, 1] }}
        />
        <defs>
          <linearGradient id="gaugeGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#22d3ee" />
            <stop offset="100%" stopColor="#8b5cf6" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute grid place-items-center">
        <span className="mono text-[1.05rem] text-mist">{value.toFixed(3)}%</span>
        <span className="mono text-[0.5rem] uppercase tracking-[0.16em] text-muted">reliability</span>
      </div>
    </div>
  );
}

function ObservabilityCard() {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const id = window.setInterval(() => setTick((t) => t + 1), 2000);
    return () => window.clearInterval(id);
  }, []);

  const latency = OBSERVABILITY.latencyMs + Math.sin(tick * 1.3) * 0.6;
  const cost = OBSERVABILITY.costPerReq + Math.cos(tick * 0.9) * 0.0002;

  return (
    <div className="flex h-full flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <h3 className="display text-xl font-bold text-mist">Full observability</h3>
        <p className="mt-2 max-w-sm text-[0.82rem] leading-relaxed text-muted">
          Latency, cost and reliability stream in real time — per model, per team, per request.
        </p>

        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {[
            { k: "p50 latency", v: `${latency.toFixed(1)}ms`, c: "text-cyan" },
            { k: "cost / req", v: `$${cost.toFixed(4)}`, c: "text-iris" },
            { k: "traces / s", v: "1,204", c: "text-mist" },
          ].map((m) => (
            <div key={m.k} className="rounded-xl border border-white/10 bg-white/[0.02] px-3.5 py-3">
              <div className="mono text-[0.54rem] uppercase tracking-[0.16em] text-muted">{m.k}</div>
              <div className={`mono mt-1 text-[0.95rem] ${m.c}`}>{m.v}</div>
            </div>
          ))}
        </div>
      </div>
      <Gauge value={OBSERVABILITY.reliability} />
    </div>
  );
}

export function EnterpriseGovernanceBento() {
  return (
    <section id="governance" className="section-pad relative">
      <div className="shell">
        <SectionHeading
          index="05 / GOVERNANCE"
          eyebrow="Enterprise Controls"
          title={
            <>
              Govern every token, <span className="text-gradient">every actor, every dollar</span>
            </>
          }
          description="Guardrails, identity, billing and telemetry are not bolt-ons. They are the control plane that makes autonomous systems safe to deploy in regulated environments."
        />

        <div className="mt-12 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <Reveal className="h-full md:col-span-2 xl:row-span-2">
            <BentoCard label="guardrails · layer 02" accent="#00f0ff" className="h-full">
              <GuardrailsCard />
            </BentoCard>
          </Reveal>

          <Reveal delay={0.05} className="h-full md:col-span-2">
            <BentoCard label="wallet · unified billing" accent="#22d3ee" className="h-full">
              <WalletCard />
            </BentoCard>
          </Reveal>

          <Reveal delay={0.1} className="h-full md:col-span-2">
            <BentoCard label="identity · RBAC" accent="#8b5cf6" className="h-full">
              <IdentityCard />
            </BentoCard>
          </Reveal>

          <Reveal delay={0.1} className="h-full md:col-span-2 xl:col-span-4">
            <BentoCard label="observability · telemetry" accent="#38bdf8" className="h-full">
              <ObservabilityCard />
            </BentoCard>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
