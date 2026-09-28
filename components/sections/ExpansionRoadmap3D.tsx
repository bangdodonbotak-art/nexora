"use client";

import { useRef } from "react";
import { AnimatePresence, motion, useInView, useScroll, useTransform } from "framer-motion";
import { ROADMAP_PHASES, type RoadmapStatus } from "@/lib/content";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/ui/Reveal";

const STATUS_META: Record<RoadmapStatus, { tone: string; pulse: boolean }> = {
  live: { tone: "#00f0ff", pulse: true },
  progress: { tone: "#8b5cf6", pulse: true },
  upcoming: { tone: "#38bdf8", pulse: false },
  visionary: { tone: "#7000ff", pulse: false },
};

function PhaseRow({
  phase,
  side,
}: {
  phase: (typeof ROADMAP_PHASES)[number];
  side: "left" | "right";
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const active = useInView(cardRef, { amount: 0.55, margin: "-15% 0px -15% 0px" });
  const meta = STATUS_META[phase.status];

  return (
    <div className="relative pl-12 md:grid md:grid-cols-2 md:gap-12 md:pl-0">
      <span
        className="absolute left-4 top-7 z-10 -translate-x-1/2 md:left-1/2"
        aria-hidden
      >
        <span
          className="relative grid h-4 w-4 place-items-center rounded-full border"
          style={{ borderColor: meta.tone, background: "#04070d" }}
        >
          <span className="h-1.5 w-1.5 rounded-full" style={{ background: meta.tone }} />
          {meta.pulse ? (
            <motion.span
              className="absolute inset-0 rounded-full border"
              style={{ borderColor: meta.tone }}
              animate={{ scale: [1, 2.4], opacity: [0.7, 0] }}
              transition={{ duration: 2.2, repeat: Infinity, ease: "easeOut" }}
            />
          ) : null}
        </span>
      </span>

      <div
        ref={cardRef}
        className={`${
          side === "left" ? "md:col-start-1 md:pr-2 md:text-right" : "md:col-start-2 md:pl-2"
        }`}
      >
        <motion.article
          initial={{ opacity: 0, y: 30, scale: 0.97 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          whileHover={{ rotateY: side === "left" ? 3 : -3, rotateX: 2, scale: 1.012 }}
          style={{ transformStyle: "preserve-3d" }}
          className="glass hud relative overflow-hidden rounded-2xl p-6"
        >
          <motion.span
            className="pointer-events-none absolute inset-0 rounded-2xl"
            animate={{
              boxShadow: active
                ? `inset 0 0 60px -22px ${meta.tone}, 0 0 70px -32px ${meta.tone}`
                : "inset 0 0 0 -20px transparent, 0 0 0 -30px transparent",
              opacity: active ? 1 : 0,
            }}
            transition={{ duration: 0.6 }}
          />
          <span
            className="pointer-events-none absolute inset-x-0 top-0 h-px"
            style={{ background: `linear-gradient(90deg, transparent, ${meta.tone}, transparent)` }}
          />

          <div
            className={`relative flex items-center gap-3 ${
              side === "left" ? "md:justify-end" : ""
            }`}
          >
            <span
              className="display text-[2.2rem] font-extrabold leading-none"
              style={{ color: meta.tone }}
            >
              {String(phase.phase).padStart(2, "0")}
            </span>
            <span
              className="mono rounded-full border px-3 py-1 text-[0.56rem] uppercase tracking-[0.2em]"
              style={{
                borderColor: `${meta.tone}55`,
                color: meta.tone,
                background: `${meta.tone}12`,
              }}
            >
              {phase.statusLabel}
            </span>
          </div>

          <h3 className="display relative mt-4 text-[clamp(1.4rem,2.4vw,2rem)] font-bold leading-tight text-mist">
            {phase.title}
          </h3>
          <p className="relative mt-3 text-[0.88rem] leading-relaxed text-muted">{phase.body}</p>

          <AnimatePresence initial={false}>
            {active ? (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                className="relative overflow-hidden"
              >
                <ul
                  className={`mt-5 grid gap-2 ${
                    side === "left" ? "md:justify-items-end" : ""
                  }`}
                >
                  {phase.points.map((point, i) => (
                    <motion.li
                      key={point}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: 0.1 + i * 0.08 }}
                      className="flex items-center gap-2 text-[0.78rem] text-mist/80"
                    >
                      <span
                        className="h-1 w-1 shrink-0 rounded-full"
                        style={{ background: meta.tone }}
                      />
                      {point}
                    </motion.li>
                  ))}
                </ul>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </motion.article>
      </div>
    </div>
  );
}

export function ExpansionRoadmap3D() {
  const trackRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: trackRef,
    offset: ["start 70%", "end 60%"],
  });
  const scaleY = useTransform(scrollYProgress, [0, 1], [0, 1]);

  return (
    <section id="roadmap" className="section-pad relative border-y border-white/5">
      <div className="shell">
        <SectionHeading
          index="06 / HORIZON"
          eyebrow="Strategic Execution"
          title={
            <>
              From unified API to <span className="text-gradient">physical AI</span>
            </>
          }
          description="Seven phases, one continuous infrastructure layer. Scroll to expand each phase as it becomes the active frontier."
        />

        <div ref={trackRef} className="relative mt-16">
          <span className="absolute bottom-0 left-4 top-0 w-px bg-white/10 md:left-1/2" aria-hidden />
          <motion.span
            className="absolute bottom-0 left-4 top-0 w-px origin-top bg-gradient-to-b from-cyan via-iris to-violet md:left-1/2"
            style={{ scaleY }}
            aria-hidden
          />

          <div className="space-y-12 md:space-y-16">
            {ROADMAP_PHASES.map((phase, i) => (
              <Reveal key={phase.phase} y={18}>
                <PhaseRow phase={phase} side={i % 2 === 0 ? "left" : "right"} />
              </Reveal>
            ))}
          </div>
        </div>

        <Reveal>
          <div className="glass mt-14 flex flex-col items-start justify-between gap-4 rounded-2xl p-6 sm:flex-row sm:items-center">
            <p className="max-w-2xl text-[0.92rem] leading-relaxed text-muted">
              Each phase ships behind the same gateway contract, so today&apos;s integrations keep
              working as the layer expands — from language models to autonomous agents to physical AI.
            </p>
            <span className="chip shrink-0">
              <span className="live-dot" />
              2026 → beyond
            </span>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
