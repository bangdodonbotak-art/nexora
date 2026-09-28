"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import { useClientReady, usePrefersReducedMotion, useWebGLAvailable } from "@/lib/hooks";

const CoreScene = dynamic(() => import("@/components/three/CoreScene"), {
  ssr: false,
  loading: () => <CoreFallback />,
});

/**
 * Static reactor fallback. Rendered before hydration, when WebGL is unavailable,
 * when reduced motion is requested, and after a context loss.
 */
export function CoreFallback() {
  return (
    <div className="relative h-full w-full overflow-hidden" aria-hidden>
      <div
        className="absolute inset-0 opacity-80"
        style={{
          background:
            "radial-gradient(46% 46% at 50% 46%, rgba(0,240,255,0.16), transparent 66%), radial-gradient(50% 50% at 58% 62%, rgba(112,0,255,0.2), transparent 68%), radial-gradient(38% 38% at 44% 84%, rgba(34,211,238,0.12), transparent 64%)",
        }}
      />

      <div className="absolute inset-0 grid place-items-center">
        <div className="relative h-[84%] max-h-full">
          <div className="absolute inset-[-16%] rounded-[50%] bg-[radial-gradient(closest-side,rgba(0,240,255,0.22),rgba(112,0,255,0.16),transparent)] blur-2xl" />
          <img
            src="/reactor.webp"
            alt=""
            width={788}
            height={1400}
            decoding="async"
            className="mesh-drift-slow relative h-full w-auto object-contain drop-shadow-[0_0_60px_rgba(0,240,255,0.35)]"
          />
        </div>
      </div>
    </div>
  );
}

export function CoreCanvas() {
  const ready = useClientReady();
  const webgl = useWebGLAvailable();
  const reduce = usePrefersReducedMotion();
  const [contextLost, setContextLost] = useState(false);

  if (!ready || webgl === null) return <CoreFallback />;
  if (!webgl || reduce || contextLost) return <CoreFallback />;
  return <CoreScene onContextLost={() => setContextLost(true)} />;
}
