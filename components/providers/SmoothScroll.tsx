"use client";

import { useEffect } from "react";
import type { ReactNode } from "react";
import Lenis from "lenis";

declare global {
  interface Window {
    __lenis?: Lenis;
  }
}

export function SmoothScroll({ children }: { children: ReactNode }) {
  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;

    const lenis = new Lenis({
      duration: 1.05,
      lerp: 0.11,
      smoothWheel: true,
      wheelMultiplier: 0.95,
      touchMultiplier: 1.4,
      anchors: true,
    });

    window.__lenis = lenis;

    let frame = 0;
    const loop = (time: number) => {
      lenis.raf(time);
      frame = requestAnimationFrame(loop);
    };
    frame = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(frame);
      lenis.destroy();
      window.__lenis = undefined;
    };
  }, []);

  return <>{children}</>;
}