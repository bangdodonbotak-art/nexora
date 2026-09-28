"use client";

import { useEffect, useRef, useState } from "react";

export function useClientReady() {
  const [ready, setReady] = useState(false);
  useEffect(() => setReady(true), []);
  return ready;
}

export function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);
  return reduced;
}

export function useWebGLAvailable() {
  const [available, setAvailable] = useState<boolean | null>(null);
  useEffect(() => {
    try {
      const canvas = document.createElement("canvas");
      const gl =
        canvas.getContext("webgl2") ||
        canvas.getContext("webgl") ||
        canvas.getContext("experimental-webgl");
      setAvailable(Boolean(gl));
    } catch {
      setAvailable(false);
    }
  }, []);
  return available;
}

export function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia(query);
    const update = () => setMatches(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, [query]);
  return matches;
}

/** Pointer-tracked values, normalized to -1..1, throttled to animation frames. */
export function usePointer(enabled = true) {
  const target = useRef({ x: 0, y: 0 });
  const raf = useRef(0);

  useEffect(() => {
    if (!enabled) return;
    const onMove = (e: PointerEvent) => {
      if (raf.current) return;
      raf.current = requestAnimationFrame(() => {
        target.current.x = (e.clientX / window.innerWidth) * 2 - 1;
        target.current.y = (e.clientY / window.innerHeight) * 2 - 1;
        raf.current = 0;
      });
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      window.removeEventListener("pointermove", onMove);
      if (raf.current) cancelAnimationFrame(raf.current);
    };
  }, [enabled]);

  return target;
}