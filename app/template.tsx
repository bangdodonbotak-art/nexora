"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";

/**
 * App Router template: re-mounts on navigation, giving each route a soft
 * opacity transition. Opacity-only so it never creates a containing block that
 * would break fixed/GSAP-pinned descendants.
 */
export default function Template({ children }: { children: ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}
