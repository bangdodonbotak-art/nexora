# AGENTS.md

Guidance for AI agents working in this repository.

## What this is

A single-page marketing/enterprise experience for "NEXORA — Universal AI Infrastructure", built with
Next.js 15 (App Router) and heavy client-side 3D/animation. Content is derived from the NEXORA v1.0
whitepaper.

## Commands

```bash
npm run dev     # local dev server
npm run build   # production build
npm start       # serve the production build
```

There is no test suite and no lint script. Do not add build artifacts to the repo.

## Architecture

- `app/layout.tsx` — fonts (`next/font/google`: Syne display, Instrument Sans body, JetBrains Mono),
  metadata, and the global shell. Wraps everything in `SmoothScroll` and `SiteNav`.
- `app/page.tsx` — composes the sections in order: Hero, Marquee, Architecture, TechStack,
  SmartTrafficTerminal, NexoraFlowCanvas, EnterpriseGovernanceBento, ExpansionRoadmap3D, FooterCTA.
- `app/template.tsx` — App Router page-transition wrapper (opacity-only, so it never creates a
  containing block that would break fixed/pinned descendants).
- `middleware.ts` — edge middleware that mocks the router contract headers (`x-nexora-router`,
  `x-nexora-edge-region`, `x-nexora-routing-latency`, `x-nexora-failover`, `x-nexora-trace-id`).
- `components/sections/*` — one client component per section. All interactive/animated sections are
  `"use client"`.
- `components/three/*` — `CoreScene.tsx` is the R3F canvas; `CoreCanvas.tsx` is the client-only
  mounted/WebGL/reduced-motion guard with a CSS fallback. Keep the 3D tree out of server rendering.
- `components/ui/*` — `Reveal` (scroll reveal), `Counter` (animated number), `SectionHeading`.
- `components/providers/SmoothScroll.tsx` — initialises Lenis and exposes it on `window.__lenis` for
  other components (nav stop/start, programmatic scrolling, ScrollTrigger sync).
- `lib/content.ts` — **all copy and structured data lives here.** Change wording and data here rather
  than hard-coding inside components.
- `lib/hooks.ts` — `useClientReady`, `usePrefersReducedMotion`, `useWebGLAvailable`, `useMediaQuery`,
  `usePointer`.

## Styling

- Tailwind CSS v4. Tokens are declared in `app/globals.css` under `@theme`
  (`--color-ink`, `--color-cyan`, `--color-violet`, `--color-iris`, `--color-mist`, `--color-muted`,
  `--color-danger`, plus font families). Prefer these tokens over raw hex values.
- Bespoke primitives (`glass`, `glass-strong`, `hud`, `chip`, `tag`, `btn`, `display`, `mono`,
  `hairline`, `live-dot`, `scanline`, `noise-overlay`, `shell`, `section-pad`) are plain CSS classes in
  `globals.css`. Because they are unlayered they win over Tailwind utilities; use the `!` suffix
  (Tailwind v4 syntax, e.g. `px-5!`) when a utility must override them.

## Non-obvious decisions

- **Lenis uses native scroll**, so GSAP ScrollTrigger and Framer Motion's `useScroll` work without
  transform-based scroll maths. The Roadmap section registers `lenis.on("scroll", ScrollTrigger.update)`.
- **Netlify Forms under SSR**: `public/__forms.html` is the static skeleton Netlify's build bot scans.
  The React form POSTs to `/__forms.html` (not `/`) with `application/x-www-form-urlencoded`. If you
  add or rename fields, update both the skeleton and the component.
- **3D fallback**: `CoreCanvas` renders `CoreFallback` until mounted and when WebGL is missing or
  reduced motion is on. Keep new 3D additions inside `CoreScene` only.
- **GSAP is imported dynamically** in `Roadmap.tsx` so ScrollTrigger never evaluates during SSR.
- Section ids (`#top`, `#architecture`, `#stack`, `#router`, `#flow`, `#governance`, `#roadmap`,
  `#access`) are referenced by `SiteNav` and the footer; keep them in sync.