"use client";

import { useRef, useState } from "react";
import {
  motion,
  useMotionValueEvent,
  useScroll,
  useTransform,
  type MotionValue,
} from "framer-motion";
import { LAYERS } from "@/lib/content";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/ui/Reveal";

const SPACING = 76;
const PERSPECTIVE = 1500;

function depth(i: number, v: number) {
  return Math.min(Math.abs(i - v * (LAYERS.length - 1)), LAYERS.length);
}

function LayerPlate({
  layer,
  index,
  progress,
}: {
  layer: (typeof LAYERS)[number];
  index: number;
  progress: MotionValue<number>;
}) {
  const y = useTransform(progress, (v) => (index - v * (LAYERS.length - 1)) * SPACING);
  const z = useTransform(progress, (v) => -depth(index, v) * 52);
  const rotate = useTransform(progress, (v) => depth(index, v) * 4);
  const scale = useTransform(progress, (v) => 1 - depth(index, v) * 0.05);
  const opacity = useTransform(progress, (v) => 1 - depth(index, v) * 0.13);
  const focus = useTransform(progress, (v) => Math.max(0, 1 - depth(index, v)));
  const glowOpacity = useTransform(focus, [0, 1], [0, 0.85]);

  return (
    <motion.div
      style={{ y, z, rotateX: rotate, scale, opacity, transformStyle: "preserve-3d" }}
      className="absolute inset-0"
    >
      <div className="absolute left-1/2 top-1/2 h-[104px] w-[320px] -translate-x-1/2 -translate-y-1/2 sm:w-[380px]">
        <div
          className="glass-strong relative flex h-full w-full items-center gap-5 overflow-hidden rounded-xl px-5"
          style={{ borderColor: `${layer.accent}55` }}
        >
          <span
            className="absolute inset-y-0 left-0 w-[3px]"
            style={{ background: `linear-gradient(180deg, ${layer.accent}, transparent)` }}
          />
          <motion.span
            className="absolute inset-0 rounded-xl"
            style={{
              opacity: glowOpacity,
              boxShadow: `inset 0 0 40px -10px ${layer.accent}, 0 0 50px -18px ${layer.accent}`,
            }}
          />
          <span
            className="display relative text-[2.35rem] font-extrabold leading-none"
            style={{ color: layer.accent }}
          >
            {layer.index}
          </span>
          <span className="relative">
            <span className="block text-[1.02rem] font-semibold tracking-tight text-mist">
              {layer.name}
            </span>
            <span className="mono mt-0.5 block text-[0.6rem] uppercase tracking-[0.22em] text-muted">
              {layer.kind}
            </span>
          </span>
        </div>
      </div>
    </motion.div>
  );
}

export function TechStack() {
  const trackRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

  const { scrollYProgress } = useScroll({
    target: trackRef,
    offset: ["start start", "end end"],
  });

  useMotionValueEvent(scrollYProgress, "change", (v) => {
    const next = Math.min(LAYERS.length - 1, Math.max(0, Math.round(v * (LAYERS.length - 1))));
    setActive(next);
  });

  const scrollToLayer = (index: number) => {
    const el = trackRef.current;
    if (!el) return;
    const top = el.offsetTop;
    const span = el.offsetHeight - window.innerHeight;
    const target = top + (index / (LAYERS.length - 1)) * span;
    if (window.__lenis) window.__lenis.scrollTo(target, { duration: 1.1 });
    else window.scrollTo({ top: target, behavior: "smooth" });
  };

  return (
    <section id="stack" className="relative">
      <div className="shell pt-[clamp(5rem,12vh,9rem)]">
        <SectionHeading
          index="02 / TOPOLOGY"
          eyebrow="Platform Architecture"
          title={
            <>
              The five-layer <span className="text-gradient">technology stack</span>
            </>
          }
          description="From raw model weights to business automations, each layer is independently addressable and observable. Scroll to traverse the stack."
        />
      </div>

      <div ref={trackRef} className="relative h-[340vh]">
        <div className="sticky top-0 flex h-[100svh] items-center overflow-hidden">
          <div className="shell grid w-full gap-10 lg:grid-cols-[0.92fr_1.08fr] lg:items-center">
            <div className="order-2 lg:order-1">
              <div className="space-y-1.5">
                {LAYERS.map((layer, i) => {
                  const isActive = i === active;
                  return (
                    <button
                      key={layer.name}
                      type="button"
                      onClick={() => scrollToLayer(i)}
                      className={`group w-full rounded-xl border px-4 py-3.5 text-left transition-all duration-500 ${
                        isActive
                          ? "border-white/15 bg-white/[0.04]"
                          : "border-transparent hover:bg-white/[0.02]"
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <span
                          className="mono text-[0.7rem] transition-colors"
                          style={{ color: isActive ? layer.accent : "#8a94a6" }}
                        >
                          {layer.index}
                        </span>
                        <span
                          className={`flex-1 text-[0.94rem] font-semibold transition-colors ${
                            isActive ? "text-mist" : "text-mist/55"
                          }`}
                        >
                          {layer.name}
                        </span>
                        <span className="mono text-[0.58rem] uppercase tracking-[0.2em] text-muted">
                          {layer.kind}
                        </span>
                      </div>
                      <motion.div
                        initial={false}
                        animate={{
                          height: isActive ? "auto" : 0,
                          opacity: isActive ? 1 : 0,
                        }}
                        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                        className="overflow-hidden"
                      >
                        <p className="pl-8 pt-2 text-[0.82rem] leading-relaxed text-muted">
                          {layer.detail}
                        </p>
                        <div className="flex flex-wrap gap-2 pb-1 pl-8 pt-3">
                          {layer.tags.map((tag) => (
                            <span key={tag} className="tag">
                              {tag}
                            </span>
                          ))}
                        </div>
                      </motion.div>
                    </button>
                  );
                })}
              </div>
              <div className="mt-8 flex items-center gap-4">
                <div className="h-1 flex-1 overflow-hidden rounded-full bg-white/10">
                  <motion.div
                    className="h-full rounded-full bg-gradient-to-r from-cyan to-violet"
                    style={{ scaleX: scrollYProgress, transformOrigin: "left" }}
                  />
                </div>
                <span className="mono text-[0.65rem] uppercase tracking-[0.2em] text-muted">
                  Layer {LAYERS[active].index}
                </span>
              </div>
            </div>

            <div
              className="relative order-1 h-[42vh] min-h-[300px] lg:order-2 lg:h-[70vh]"
              style={{ perspective: `${PERSPECTIVE}px` }}
            >
              <div
                className="relative h-full w-full"
                style={{ transform: "rotateX(52deg)", transformStyle: "preserve-3d" }}
              >
                <div className="absolute left-1/2 top-1/2 h-[520px] w-px -translate-x-1/2 -translate-y-1/2 bg-gradient-to-b from-transparent via-cyan/40 to-transparent" />
                {LAYERS.map((layer, i) => (
                  <LayerPlate key={layer.name} layer={layer} index={i} progress={scrollYProgress} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="shell pb-[clamp(4rem,10vh,7rem)]">
        <Reveal>
          <div className="glass mt-2 flex flex-col items-start justify-between gap-4 rounded-2xl p-6 sm:flex-row sm:items-center">
            <p className="max-w-2xl text-[0.92rem] leading-relaxed text-muted">
              Every request carries its layer ancestry: which model, which guardrail, which workflow,
              which team and which invoice line it belongs to.
            </p>
            <span className="chip shrink-0">
              <span className="live-dot" />
              Full observability
            </span>
          </div>
        </Reveal>
      </div>
    </section>
  );
}