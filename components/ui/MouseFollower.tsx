"use client";

import { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

/**
 * Ambient cursor glow. Renders only for fine pointers with motion enabled, so
 * touch devices and reduced-motion users keep a plain, static experience.
 */
export function MouseFollower() {
  const x = useMotionValue(-200);
  const y = useMotionValue(-200);

  const glowX = useSpring(x, { stiffness: 210, damping: 28, mass: 0.7 });
  const glowY = useSpring(y, { stiffness: 210, damping: 28, mass: 0.7 });
  const ringX = useSpring(x, { stiffness: 650, damping: 40, mass: 0.3 });
  const ringY = useSpring(y, { stiffness: 650, damping: 40, mass: 0.3 });

  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const fine = window.matchMedia("(pointer: fine)").matches;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!fine || reduce) return;

    setEnabled(true);
    const onMove = (e: PointerEvent) => {
      x.set(e.clientX);
      y.set(e.clientY);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [x, y]);

  if (!enabled) return null;

  return (
    <>
      <motion.div
        aria-hidden
        className="pointer-events-none fixed left-0 top-0 z-[45] h-[440px] w-[440px] rounded-full opacity-80 mix-blend-screen"
        style={{
          x: glowX,
          y: glowY,
          marginLeft: -220,
          marginTop: -220,
          background:
            "radial-gradient(circle, rgba(0,240,255,0.12), rgba(112,0,255,0.07) 42%, transparent 70%)",
        }}
      />
      <motion.div
        aria-hidden
        className="pointer-events-none fixed left-0 top-0 z-[46] h-6 w-6 rounded-full border border-cyan/50 mix-blend-screen"
        style={{ x: ringX, y: ringY, marginLeft: -12, marginTop: -12 }}
      />
    </>
  );
}
