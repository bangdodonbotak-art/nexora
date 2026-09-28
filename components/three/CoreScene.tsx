"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState, type ReactNode, type RefObject } from "react";
import * as THREE from "three";

const VIDEO_SRC = "/nexora-reactor-square.mp4";
const CYAN = "#00f0ff";
const VIOLET = "#7000ff";
const DEFAULT_ASPECT = 1;

type Interaction = {
  dragX: number;
  dragY: number;
  hoverX: number;
  hoverY: number;
  dragging: boolean;
  lastX: number;
  lastY: number;
};

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));

const auraVertex = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const auraFragment = /* glsl */ `
  uniform float uTime;
  uniform float uAspect;
  uniform vec3 uColorA;
  uniform vec3 uColorB;
  varying vec2 vUv;
  void main() {
    vec2 p = (vUv - 0.5) * vec2(uAspect, 1.0);
    float d = length(p);
    float core = smoothstep(0.62, 0.0, d);
    float halo = pow(core, 2.2);
    float pulse = 0.5 + 0.5 * sin(uTime * 0.9);
    vec3 col = mix(uColorB, uColorA, clamp(core * 1.3, 0.0, 1.0));
    float alpha = halo * (0.32 + 0.26 * pulse);
    gl_FragColor = vec4(col, alpha);
  }
`;

/**
 * Streams the reactor video into a GPU texture, keeping a stable aspect ratio
 * and surfacing load failures so the caller can fall back gracefully.
 */
function useVideoTexture(onError?: () => void) {
  const [state, setState] = useState<{ texture: THREE.VideoTexture | null; aspect: number }>({
    texture: null,
    aspect: DEFAULT_ASPECT,
  });
  const errorRef = useRef(onError);
  errorRef.current = onError;

  useEffect(() => {
    const video = document.createElement("video");
    video.src = VIDEO_SRC;
    video.crossOrigin = "anonymous";
    video.loop = true;
    video.muted = true;
    video.defaultMuted = true;
    video.autoplay = true;
    video.preload = "auto";
    video.setAttribute("playsinline", "");
    video.setAttribute("webkit-playsinline", "");
    video.setAttribute("muted", "");

    let active = true;
    let texture: THREE.VideoTexture | null = null;

    const ready = () => {
      if (!active || texture) return;
      const aspect =
        video.videoWidth && video.videoHeight
          ? video.videoWidth / video.videoHeight
          : DEFAULT_ASPECT;
      texture = new THREE.VideoTexture(video);
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.minFilter = THREE.LinearFilter;
      texture.magFilter = THREE.LinearFilter;
      texture.generateMipmaps = false;
      setState({ texture, aspect });
    };

    const failed = () => {
      if (!active) return;
      errorRef.current?.();
    };

    video.addEventListener("loadeddata", ready);
    video.addEventListener("canplay", ready);
    video.addEventListener("error", failed);
    video.load();

    const playPromise = video.play();
    if (playPromise && typeof playPromise.catch === "function") playPromise.catch(() => {});

    return () => {
      active = false;
      video.removeEventListener("loadeddata", ready);
      video.removeEventListener("canplay", ready);
      video.removeEventListener("error", failed);
      video.pause();
      video.removeAttribute("src");
      video.load();
      texture?.dispose();
    };
  }, []);

  return state;
}

/** Soft cyan/violet atmosphere that breathes behind the reactor. */
function Aura({ w, h }: { w: number; h: number }) {
  const material = useRef<THREE.ShaderMaterial>(null);
  const mesh = useRef<THREE.Mesh>(null);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uAspect: { value: w / h },
      uColorA: { value: new THREE.Color(CYAN) },
      uColorB: { value: new THREE.Color(VIOLET) },
    }),
    [w, h],
  );

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (material.current) material.current.uniforms.uTime.value = t;
    if (mesh.current) {
      const pulse = 1 + Math.sin(t * 0.9) * 0.03;
      mesh.current.scale.setScalar(pulse);
    }
  });

  return (
    <mesh ref={mesh} position={[0, 0, -0.4]}>
      <planeGeometry args={[w * 1.9, h * 1.9]} />
      <shaderMaterial
        ref={material}
        vertexShader={auraVertex}
        fragmentShader={auraFragment}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </mesh>
  );
}

/** The reactor video on a clearly lit, fully opaque 3D plane. */
function VideoPanel({ texture, w, h }: { texture: THREE.Texture; w: number; h: number }) {
  return (
    <mesh position={[0, 0, 0]}>
      <planeGeometry args={[w, h, 1, 1]} />
      <meshStandardMaterial
        map={texture}
        color="#ffffff"
        roughness={0.55}
        metalness={0.05}
        toneMapped={false}
        side={THREE.FrontSide}
      />
    </mesh>
  );
}

/** Coloured key lights add subtle depth while the video stays vivid and legible. */
function Lights({ mobile }: { mobile: boolean }) {
  return (
    <>
      <ambientLight intensity={1.05} />
      <pointLight
        position={[-3.2, 2.6, 4]}
        color={CYAN}
        intensity={mobile ? 7 : 12}
        distance={18}
        decay={2}
      />
      <pointLight
        position={[3.4, -1.8, 3.6]}
        color={VIOLET}
        intensity={mobile ? 6 : 10}
        distance={18}
        decay={2}
      />
      <directionalLight position={[0, 0.6, 6]} intensity={0.4} color="#bfefff" />
    </>
  );
}

/** Floating, drag-and-hover reactive rig driving the interactive presentation. */
function Rig({ children, interaction }: { children: ReactNode; interaction: RefObject<Interaction> }) {
  const rig = useRef<THREE.Group>(null);

  useFrame((state, delta) => {
    if (!rig.current) return;
    const t = state.clock.elapsedTime;
    const s = interaction.current;
    const damp = (current: number, target: number) =>
      current + (target - current) * (1 - Math.exp(-5 * delta));

    const targetY = clamp(s.dragX + s.hoverX * 0.14, -0.8, 0.8) + Math.sin(t * 0.35) * 0.045;
    const targetX = clamp(s.dragY - 0.04 - s.hoverY * 0.1, -0.5, 0.5);

    rig.current.rotation.y = damp(rig.current.rotation.y, targetY);
    rig.current.rotation.x = damp(rig.current.rotation.x, targetX);
    const targetScale = 1 - 0.06 * Math.abs(targetY) - 0.04 * Math.abs(targetX);
    rig.current.scale.setScalar(damp(rig.current.scale.x, targetScale));
    rig.current.position.y = Math.sin(t * 0.55) * 0.07;
    rig.current.position.x = Math.cos(t * 0.38) * 0.035;
    rig.current.position.z = Math.sin(t * 0.45) * 0.06;
  });

  return <group ref={rig}>{children}</group>;
}

function SceneContents({
  interaction,
  mobile,
  onVideoError,
}: {
  interaction: RefObject<Interaction>;
  mobile: boolean;
  onVideoError?: () => void;
}) {
  const { viewport } = useThree();
  const { texture, aspect } = useVideoTexture(onVideoError);

  const MARGIN = 0.96;
  const fitH = viewport.height * MARGIN;
  const fitW = viewport.width * MARGIN;
  const h = Math.min(fitH, fitW / aspect);
  const w = h * aspect;

  return (
    <>
      <Lights mobile={mobile} />
      <Rig interaction={interaction}>
        <Aura w={w} h={h} />
        {texture ? <VideoPanel texture={texture} w={w} h={h} /> : null}
      </Rig>
    </>
  );
}

export default function CoreScene({
  onContextLost,
  onVideoError,
}: {
  onContextLost?: () => void;
  onVideoError?: () => void;
}) {
  const [canvasEl, setCanvasEl] = useState<HTMLCanvasElement | null>(null);
  const [onScreen, setOnScreen] = useState(true);
  const [visible, setVisible] = useState(true);
  const interaction = useRef<Interaction>({
    dragX: 0,
    dragY: 0,
    hoverX: 0,
    hoverY: 0,
    dragging: false,
    lastX: 0,
    lastY: 0,
  });

  const isMobile =
    typeof window !== "undefined" &&
    (window.innerWidth < 768 || (navigator.maxTouchPoints ?? 0) > 1);

  useEffect(() => {
    if (!canvasEl) return;
    const s = interaction.current;

    const onDown = (e: PointerEvent) => {
      s.dragging = true;
      s.lastX = e.clientX;
      s.lastY = e.clientY;
      canvasEl.style.cursor = "grabbing";
    };
    const onMove = (e: PointerEvent) => {
      if (s.dragging) {
        const dx = e.clientX - s.lastX;
        const dy = e.clientY - s.lastY;
        s.lastX = e.clientX;
        s.lastY = e.clientY;
        s.dragX = clamp(s.dragX + dx * 0.006, -0.7, 0.7);
        s.dragY = clamp(s.dragY + dy * 0.006, -0.45, 0.45);
      } else {
        s.hoverX = (e.clientX / window.innerWidth) * 2 - 1;
        s.hoverY = (e.clientY / window.innerHeight) * 2 - 1;
      }
    };
    const onUp = () => {
      s.dragging = false;
      canvasEl.style.cursor = "grab";
    };

    canvasEl.style.cursor = "grab";
    canvasEl.style.touchAction = "pan-y";
    canvasEl.addEventListener("pointerdown", onDown);
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);
    return () => {
      canvasEl.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
    };
  }, [canvasEl]);

  useEffect(() => {
    if (!canvasEl) return;
    const io = new IntersectionObserver(([entry]) => setOnScreen(entry.isIntersecting), {
      rootMargin: "200px",
    });
    io.observe(canvasEl);
    return () => io.disconnect();
  }, [canvasEl]);

  useEffect(() => {
    const update = () => setVisible(document.visibilityState !== "hidden");
    update();
    document.addEventListener("visibilitychange", update);
    return () => document.removeEventListener("visibilitychange", update);
  }, []);

  return (
    <Canvas
      frameloop={onScreen && visible ? "always" : "never"}
      dpr={[1, isMobile ? 1.5 : 1.9]}
      camera={{ position: [0, 0, 6.2], fov: 42 }}
      gl={{ antialias: !isMobile, alpha: true, powerPreference: "high-performance" }}
      onCreated={({ gl }) => {
        gl.setClearColor(new THREE.Color("#030712"), 0);
        gl.domElement.addEventListener(
          "webglcontextlost",
          (event) => {
            event.preventDefault();
            onContextLost?.();
          },
          false,
        );
        setCanvasEl(gl.domElement);
      }}
    >
      <SceneContents interaction={interaction} mobile={isMobile} onVideoError={onVideoError} />
    </Canvas>
  );
}
