"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

const LINKS = [
  { href: "#architecture", label: "Architecture" },
  { href: "#stack", label: "Stack" },
  { href: "#router", label: "Router" },
  { href: "#flow", label: "Flow" },
  { href: "#governance", label: "Governance" },
  { href: "#roadmap", label: "Roadmap" },
];

export function SiteNav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const lenis = window.__lenis;
    if (open) lenis?.stop();
    else lenis?.start();
  }, [open]);

  return (
    <header className="fixed inset-x-0 top-0 z-50">
      <div
        className={`transition-all duration-500 ${
          scrolled ? "border-b border-white/5 bg-ink/70 backdrop-blur-xl" : "border-b border-transparent"
        }`}
      >
        <nav className="shell flex h-16 items-center justify-between gap-6 md:h-[4.5rem]">
          <a href="#top" className="group flex items-center gap-3" aria-label="NEXORA home">
            <span className="relative grid h-8 w-8 place-items-center">
              <span className="absolute inset-0 rotate-45 rounded-[0.35rem] border border-cyan/60 transition-transform duration-500 group-hover:rotate-[135deg]" />
              <span className="absolute inset-[0.35rem] rounded-sm bg-gradient-to-br from-cyan to-violet opacity-80 blur-[1px]" />
            </span>
            <span className="display text-[1.05rem] font-bold tracking-[0.18em] text-mist">
              NEXORA
            </span>
          </a>

          <div className="hidden items-center gap-1 lg:flex">
            {LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="mono rounded-full px-3.5 py-2 text-[0.7rem] uppercase tracking-[0.18em] text-muted transition-colors hover:text-cyan"
              >
                {link.label}
              </a>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <a href="#access" className="btn btn-primary hidden! px-5! py-2.5! text-[0.68rem]! sm:inline-flex!">
              Get API Key
            </a>
            <button
              type="button"
              aria-label={open ? "Close menu" : "Open menu"}
              aria-expanded={open}
              onClick={() => setOpen((v) => !v)}
              className="grid h-10 w-10 place-items-center rounded-full border border-white/10 text-mist lg:hidden"
            >
              <span className="relative block h-3 w-4">
                <span
                  className={`absolute left-0 h-px w-full bg-current transition-all ${
                    open ? "top-1.5 rotate-45" : "top-0"
                  }`}
                />
                <span
                  className={`absolute left-0 top-1.5 h-px w-full bg-current transition-all ${
                    open ? "opacity-0" : "opacity-100"
                  }`}
                />
                <span
                  className={`absolute left-0 h-px w-full bg-current transition-all ${
                    open ? "top-1.5 -rotate-45" : "top-3"
                  }`}
                />
              </span>
            </button>
          </div>
        </nav>
      </div>

      <AnimatePresence>
        {open ? (
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="mx-4 mt-2 rounded-2xl border border-white/10 bg-ink-2/95 p-3 backdrop-blur-2xl lg:hidden"
          >
            {LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="mono block rounded-lg px-4 py-3 text-xs uppercase tracking-[0.2em] text-muted hover:bg-white/5 hover:text-cyan"
              >
                {link.label}
              </a>
            ))}
            <a
              href="#access"
              onClick={() => setOpen(false)}
              className="btn btn-primary mt-2 w-full"
            >
              Get API Key
            </a>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </header>
  );
}