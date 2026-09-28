# NEXORA — Universal AI Infrastructure

An interactive, WebGL-driven enterprise landing experience for **NEXORA**, a fictional unified AI
infrastructure layer derived from the *NEXORA Universal AI Infrastructure v1.0* whitepaper.

The site presents the full platform story — unified gateway, 5-layer stack, smart router, visual
workflows, governance and roadmap — through a dark "cybernetic enterprise" aesthetic with a live 3D
core, custom GLSL shaders, scroll-driven 3D layers and an animated workflow builder.

## Highlights

- **3D Gateway Core** — React Three Fiber scene with a custom displacement/fresnel shader, counter-rotating
  hypercube wireframes, orbital rings with moving modality nodes and a particle field. It reacts to
  pointer position and scroll, and degrades to a pure-CSS orb when WebGL is unavailable or reduced
  motion is requested.
- **Smooth scrolling** — Lenis powers inertial scrolling; GSAP ScrollTrigger drives the horizontal
  roadmap timeline and is synchronised with Lenis.
- **Interactive sections** — architecture comparison toggle with animated SVG wiring, a live
  `nexora-auto` router terminal that streams failover traces, a draggable workflow canvas, an
  inspecting guardrails visual, and an animated bento grid.
- **Netlify Forms** — the API key request form is registered through a static skeleton
  (`public/__forms.html`) and submitted via AJAX so it works under the Next.js runtime.
- **Performance discipline** — the 3D tree is lazy-loaded and client-only, DPR is capped, animations
  use transform/opacity, and everything respects `prefers-reduced-motion`.

## Tech stack

| Layer      | Choice                                            |
| ---------- | ------------------------------------------------- |
| Framework  | Next.js 15 (App Router, React 19, TypeScript)     |
| 3D         | three.js, @react-three/fiber, custom GLSL         |
| Motion     | Framer Motion, GSAP ScrollTrigger                 |
| Scrolling  | Lenis                                             |
| Styling    | Tailwind CSS v4 + a small custom CSS design system |
| Hosting    | Netlify (`@netlify/plugin-nextjs`), Netlify Forms |

## Getting started

```bash
npm install
npm run dev
```

Open http://localhost:3000.

To emulate the full Netlify environment (including form handling) locally:

```bash
netlify dev --port 8889
```

Production build:

```bash
npm run build && npm start
```

## Project structure

```
app/                  App Router layout, page composition and global styles
components/
  nav/                Sticky site navigation
  providers/          Lenis smooth-scroll provider
  sections/           One component per landing section
  three/              R3F scene, canvas guard and CSS fallback
  ui/                 Reveal, Counter and section heading primitives
lib/
  content.ts          All site copy and structured data
  hooks.ts            Client/media/WebGL/pointer hooks
public/
  __forms.html        Netlify Forms detection skeleton
  nexora-whitepaper.pdf
```

## Notes

- The whitepaper PDF is served from `public/` and linked from the hero and footer.
- `netlify/` is not used; the only server-side behaviour is the built-in Netlify Forms endpoint.