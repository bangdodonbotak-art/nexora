"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import { useClientReady, usePrefersReducedMotion, useWebGLAvailable } from "@/lib/hooks";

const CoreScene = dynamic(() => import("@/components/three/CoreScene"), {
  ssr: false,
  loading: () => <CoreFallback />,
});

const VIDEO_SRC = "/nexora-reactor.mp4";
const POSTER = "/reactor.webp";

/**
 * Graceful reactor fallback. Rendered before hydration, when WebGL is unavailable,
 * when reduced motion is requested, after a context loss, and when the video
 * itself cannot be decoded — degrading to the static reactor render.
 */
export function CoreFallback() {
  const [failed, setFailed] = useState(false);

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
          {failed ? (
            <img
              src={POSTER}
              alt=""
              width={788}
              height={1400}
              decoding="async"
              className="mesh-drift-slow relative h-full w-auto object-contain drop-shadow-[0_0_60px_rgba(0,240,255,0.35)]"
            />
          ) : (
            <video
              className="relative h-full w-auto max-w-full object-contain drop-shadow-[0_0_60px_rgba(0,240,255,0.35)]"
              src={VIDEO_SRC}
              poster={POSTER}
              autoPlay
              loop
              muted
              playsInline
              preload="metadata"
              onError={() => setFailed(true)}
            />
          )}
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
  const [videoFailed, setVideoFailed] = useState(false);

  if (!ready || webgl === null) return <CoreFallback />;
  if (!webgl || reduce || contextLost || videoFailed) return <CoreFallback />;
  return (
    <CoreScene
      onContextLost={() => setContextLost(true)}
      onVideoError={() => setVideoFailed(true)}
    />
  );
}
