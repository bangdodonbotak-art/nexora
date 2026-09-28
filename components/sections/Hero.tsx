"use client";

import { motion, useReducedMotion, type Variants } from "framer-motion";
import { CoreCanvas } from "@/components/three/CoreCanvas";
import { Counter } from "@/components/ui/Counter";
import { HERO, HERO_STATS, PILLARS } from "@/lib/content";

const container: Variants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.09, delayChildren: 0.1 },
  },
};

const item: Variants = {
  hidden: { opacity: 0, y: 28 },
  show: { opacity: 1, y: 0, transition: { duration: 0.85, ease: [0.22, 1, 0.36, 1] } },
};

export function Hero() {
  const reduce = useReducedMotion();
  const anim = { variants: item };

  return (
    <section id="top" className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-px bg-gradient-to-r from-transparent via-cyan/40 to-transparent" />
      <div className="shell relative grid min-h-[100svh] items-center gap-12 pb-20 pt-28 lg:grid-cols-[1.02fr_0.98fr] lg:gap-6 lg:pt-24">
        <motion.div
          variants={container}
          initial={reduce ? false : "hidden"}
          animate="show"
          className="relative z-20 max-w-2xl"
        >
          <motion.div {...anim} className="chip hud">
            <span className="live-dot" />
            {HERO.badge}
          </motion.div>

          <h1 className="display mt-7 text-[clamp(2.7rem,6.6vw,5.5rem)] font-extrabold leading-[0.97] tracking-[-0.035em]">
            {HERO.headline.map((line, i) => (
              <motion.span
                key={line}
                {...anim}
                className={`block ${
                  i === 0
                    ? "text-mist"
                    : i === 1
                      ? "text-gradient"
                      : i === 2
                        ? "text-mist/80"
                        : "text-mist/55"
                }`}
              >
                {line}
              </motion.span>
            ))}
          </h1>

          <motion.p
            {...anim}
            className="mt-7 max-w-xl text-[1rem] leading-relaxed text-muted md:text-[1.08rem]"
          >
            {HERO.subtitle}
          </motion.p>

          <motion.div {...anim} className="mt-9 flex flex-wrap items-center gap-4">
            <a href="#access" className="btn btn-primary">
              {HERO.primaryCta}
            </a>
            <a
              href="/nexora-whitepaper.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-ghost"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden>
                <path
                  d="M12 3v12m0 0 4.5-4.5M12 15l-4.5-4.5M5 19h14"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              {HERO.secondaryCta}
            </a>
          </motion.div>

          <motion.div
            {...anim}
            className="mt-12 grid max-w-xl grid-cols-3 gap-px overflow-hidden rounded-xl border border-white/10 bg-white/[0.02]"
          >
            {HERO_STATS.map((stat) => (
              <div key={stat.label} className="bg-ink/40 px-4 py-5 backdrop-blur-sm">
                <div className="mono text-[1.05rem] font-medium text-cyan md:text-[1.35rem]">
                  <Counter
                    value={stat.value}
                    decimals={"decimals" in stat ? (stat.decimals as number) : 0}
                    prefix={"prefix" in stat ? (stat.prefix as string) : ""}
                    suffix={stat.suffix as string}
                  />
                </div>
                <div className="mt-2 text-[0.72rem] font-medium uppercase tracking-[0.12em] text-mist/80">
                  {stat.label}
                </div>
                <div className="mt-1 text-[0.68rem] leading-tight text-muted">{stat.sub}</div>
              </div>
            ))}
          </motion.div>
        </motion.div>

        <div className="relative z-10 h-[44vh] min-h-[320px] w-full sm:h-[52vh] lg:h-[76vh]">
          <div className="absolute inset-0 [mask-image:radial-gradient(circle_at_50%_50%,black_66%,transparent_96%)]">
            <CoreCanvas />
          </div>
        </div>
      </div>

      <div className="shell relative z-20 -mt-6 flex flex-col gap-8 pb-14 lg:mt-0">
        <div className="hairline" />
        <div className="grid gap-6 sm:grid-cols-3">
          {PILLARS.map((pillar, i) => (
            <div key={pillar.title} className="flex gap-3">
              <span className="mono pt-1 text-[0.65rem] text-cyan/70">0{i + 1}</span>
              <div>
                <div className="text-[0.86rem] font-semibold text-mist">{pillar.title}</div>
                <div className="mt-1 text-[0.78rem] leading-relaxed text-muted">{pillar.body}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}