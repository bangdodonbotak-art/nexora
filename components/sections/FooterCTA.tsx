"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { motion } from "framer-motion";
import { NEXORA } from "@/lib/content";

const FOOTER_LINKS = [
  {
    title: "Platform",
    links: [
      { label: "Architecture", href: "#architecture" },
      { label: "Technology Stack", href: "#stack" },
      { label: "Smart Router", href: "#router" },
      { label: "Nexora Flow", href: "#flow" },
    ],
  },
  {
    title: "Developers",
    links: [
      { label: "API Reference", href: "#access" },
      { label: "Status", href: "#access" },
      { label: "Changelog", href: "#access" },
      { label: "Whitepaper v1.0", href: "/nexora-whitepaper.pdf" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "Security", href: "#governance" },
      { label: "Governance", href: "#governance" },
      { label: "Roadmap", href: "#roadmap" },
      { label: "Strategic Partners", href: "#access" },
    ],
  },
];

type Status = "idle" | "submitting" | "success" | "error";

export function FooterCTA() {
  const [status, setStatus] = useState<Status>("idle");
  const [copied, setCopied] = useState(false);

  const command = "npx nexora init --agent multimodal";

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(command);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  };

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    const body = new URLSearchParams();
    formData.forEach((value, key) => body.append(key, String(value)));
    setStatus("submitting");
    try {
      const response = await fetch("/__forms.html", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: body.toString(),
      });
      if (!response.ok) throw new Error("request failed");
      setStatus("success");
      form.reset();
    } catch {
      setStatus("error");
    }
  };

  return (
    <footer id="access" className="relative pt-[clamp(3rem,8vh,6rem)]">
      <div className="shell">
        <div className="glass-strong hud relative overflow-hidden rounded-3xl p-7 sm:p-12">
          <div className="scanline top-0" aria-hidden />
          <div
            className="pointer-events-none absolute -right-20 -top-24 h-80 w-80 rounded-full bg-[radial-gradient(circle,rgba(0,240,255,0.22),transparent_65%)] blur-2xl"
            aria-hidden
          />

          <div className="relative grid gap-12 lg:grid-cols-[1.1fr_0.9fr]">
            <div>
              <div className="mono text-[0.68rem] tracking-[0.22em] text-cyan/80">
                $ nexora deploy --agent multimodal
              </div>
              <h2 className="display mt-6 max-w-xl text-[clamp(2rem,4.4vw,3.4rem)] font-extrabold leading-[1.02] text-mist">
                Deploy your first autonomous multi-modal agent in{" "}
                <span className="text-cyan-glow">60 seconds</span>.
              </h2>
              <p className="mt-5 max-w-lg text-[0.94rem] leading-relaxed text-muted">
                Request an API key and we provision a unified gateway, a default budget and a sandbox
                project scoped to your team — instantly.
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-4">
                <a href="#access-form" className="btn btn-primary">
                  Get API Key (Instant Access)
                </a>
                <button type="button" onClick={copy} className="btn btn-ghost">
                  <span className="mono normal-case tracking-normal text-[0.78rem] text-cyan/90">{command}</span>
                  <span className="mono text-[0.6rem] uppercase tracking-[0.2em] text-muted">
                    {copied ? "copied" : "copy"}
                  </span>
                </button>
              </div>
            </div>

            <div id="access-form" className="rounded-2xl border border-white/10 bg-ink/40 p-6">
              <div className="flex items-center justify-between">
                <span className="mono text-[0.6rem] uppercase tracking-[0.24em] text-muted">
                  Request access
                </span>
                <span className="chip">
                  <span className="live-dot" />
                  {NEXORA.version}
                </span>
              </div>

              {status === "success" ? (
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-6 rounded-xl border border-cyan/30 bg-cyan/[0.06] p-5"
                >
                  <div className="mono text-[0.8rem] text-cyan">✓ request queued</div>
                  <p className="mt-2 text-[0.82rem] leading-relaxed text-mist/80">
                    Your key request is in. Provisioning usually completes within a few minutes — watch
                    your inbox.
                  </p>
                </motion.div>
              ) : (
                <form
                  name="nexora-access"
                  method="POST"
                  data-netlify="true"
                  netlify-honeypot="bot-field"
                  onSubmit={onSubmit}
                  className="mt-6 space-y-4"
                >
                  <input type="hidden" name="form-name" value="nexora-access" />
                  <p className="hidden">
                    <label>
                      Do not fill this out: <input name="bot-field" />
                    </label>
                  </p>

                  <label className="block">
                    <span className="mono text-[0.6rem] uppercase tracking-[0.2em] text-muted">
                      Work email
                    </span>
                    <input
                      type="email"
                      name="email"
                      required
                      placeholder="you@company.com"
                      className="mt-2 w-full rounded-lg border border-white/12 bg-ink/70 px-3.5 py-3 text-[0.88rem] text-mist placeholder:text-muted/60 focus:border-cyan/50"
                    />
                  </label>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <label className="block">
                      <span className="mono text-[0.6rem] uppercase tracking-[0.2em] text-muted">
                        Company
                      </span>
                      <input
                        type="text"
                        name="company"
                        placeholder="Northwind Labs"
                        className="mt-2 w-full rounded-lg border border-white/12 bg-ink/70 px-3.5 py-3 text-[0.88rem] text-mist placeholder:text-muted/60 focus:border-cyan/50"
                      />
                    </label>
                    <label className="block">
                      <span className="mono text-[0.6rem] uppercase tracking-[0.2em] text-muted">
                        Primary modality
                      </span>
                      <select
                        name="modality"
                        defaultValue="LLM"
                        className="mt-2 w-full rounded-lg border border-white/12 bg-ink/70 px-3.5 py-3 text-[0.88rem] text-mist focus:border-cyan/50"
                      >
                        {["LLM", "Vision & OCR", "Audio & Voice", "Video", "3D & Spatial", "Agents"].map(
                          (m) => (
                            <option key={m} value={m} className="bg-ink">
                              {m}
                            </option>
                          ),
                        )}
                      </select>
                    </label>
                  </div>

                  <label className="block">
                    <span className="mono text-[0.6rem] uppercase tracking-[0.2em] text-muted">
                      What are you building?
                    </span>
                    <textarea
                      name="use_case"
                      rows={3}
                      placeholder="A support agent that reads PDFs, answers by voice and files tickets."
                      className="mt-2 w-full resize-none rounded-lg border border-white/12 bg-ink/70 px-3.5 py-3 text-[0.88rem] text-mist placeholder:text-muted/60 focus:border-cyan/50"
                    />
                  </label>

                  <button
                    type="submit"
                    disabled={status === "submitting"}
                    className="btn btn-primary w-full disabled:opacity-60"
                  >
                    {status === "submitting" ? "Provisioning…" : "Request API Key"}
                  </button>

                  {status === "error" ? (
                    <p className="mono text-[0.68rem] text-danger">
                      Submission failed — please try again or email access@nexora.ai.
                    </p>
                  ) : (
                    <p className="mono text-[0.6rem] leading-relaxed text-muted">
                      No sales call required. Sandbox keys are provisioned automatically.
                    </p>
                  )}
                </form>
              )}
            </div>
          </div>
        </div>

        <div className="mt-16 grid gap-10 border-t border-white/5 pt-12 sm:grid-cols-2 lg:grid-cols-[1.4fr_repeat(3,1fr)]">
          <div>
            <div className="flex items-center gap-3">
              <span className="relative grid h-8 w-8 place-items-center">
                <span className="absolute inset-0 rotate-45 rounded-[0.35rem] border border-cyan/60" />
                <span className="absolute inset-[0.35rem] rounded-sm bg-gradient-to-br from-cyan to-violet" />
              </span>
              <span className="display text-[1.05rem] font-bold tracking-[0.18em] text-mist">
                NEXORA
              </span>
            </div>
            <p className="mt-4 max-w-xs text-[0.82rem] leading-relaxed text-muted">
              The universal infrastructure layer for intelligence — connecting every model, agent and
              tool across digital and physical worlds.
            </p>
          </div>

          {FOOTER_LINKS.map((col) => (
            <div key={col.title}>
              <div className="mono text-[0.6rem] uppercase tracking-[0.24em] text-muted">
                {col.title}
              </div>
              <ul className="mt-4 space-y-2.5">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-[0.84rem] text-mist/70 transition-colors hover:text-cyan"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mono mt-12 flex flex-col items-start justify-between gap-3 border-t border-white/5 py-8 text-[0.62rem] uppercase tracking-[0.18em] text-muted sm:flex-row sm:items-center">
          <span>© {new Date().getFullYear()} Nexora Systems — Universal AI Infrastructure</span>
          <span className="flex items-center gap-4">
            <span>One API. Every Model.</span>
            <span className="text-cyan/70">status: nominal</span>
          </span>
        </div>
      </div>
    </footer>
  );
}