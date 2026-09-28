"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import * as THREE from "three";
import { usePointer } from "@/lib/hooks";

const VIDEO_SRC = "/nexora-reactor.mp4";
const CYAN = "#00f0ff";
const VIOLET = "#7000ff";
const DEFAULT_ASPECT = 788 / 1400;

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
    float alpha = halo * (0.3 + 0.26 * pulse);
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
        video.videoWidth && video.videoHeight ? video.videoWidth / video.videoHeight : DEFAULT_ASPECT;
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
    <mesh ref={mesh} position={[0, 0, -0.35]}>
      <planeGeometry args={[w * 2.1, h * 2.1]} />
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

/** The reactor video rendered on a subtly lit, physically shaded plane. */
function VideoPanel({ texture, w, h }: { texture: THREE.Texture; w: number; h: number }) {
  return (
    <mesh position={[0, 0, 0]}>
      <planeGeometry args={[w, h, 1, 1]} />
      <meshStandardMaterial
        map={texture}
        color="#ffffff"
        roughness={0.45}
        metalness={0.1}
        toneMapped={false}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        side={THREE.FrontSide}
      />
    </mesh>
  );
}

/** Coloured key lights give the plane real shading that shifts with parallax. */
function Lights({ mobile }: { mobile: boolean }) {
  return (
    <>
      <ambientLight intensity={0.9} />
      <pointLight
        position={[-3.2, 2.6, 4]}
        color={CYAN}
        intensity={mobile ? 8 : 14}
        distance={16}
        decay={2}
      />
      <pointLight
        position={[3.4, -1.8, 3.6]}
        color={VIOLET}
        intensity={mobile ? 7 : 12}
        distance={16}
        decay={2}
      />
      <directionalLight position={[0, 0.4, 6]} intensity={0.25} color="#bfefff" />
    </>
  );
}

/** Floating, pointer-reactive rig: gentle depth, tilt and parallax. */
function Rig({ children }: { children: ReactNode }) {
  const pointer = usePointer();
  const rig = useRef<THREE.Group>(null);

  useFrame((state, delta) => {
    if (!rig.current) return;
    const t = state.clock.elapsedTime;
    const damp = (current: number, target: number) =>
      current + (target - current) * (1 - Math.exp(-4 * delta));
    rig.current.rotation.y = damp(rig.current.rotation.y, pointer.current.x * 0.34);
    rig.current.rotation.x = damp(rig.current.rotation.x, -0.035 - pointer.current.y * 0.22);
    rig.current.position.y = Math.sin(t * 0.55) * 0.07;
    rig.current.position.x = Math.cos(t * 0.38) * 0.035;
    rig.current.position.z = Math.sin(t * 0.45) * 0.06;
  });

  return <group ref={rig}>{children}</group>;
}

function SceneContents({ onVideoError }: { onVideoError?: () => void }) {
  const { viewport } = useThree();
  const { texture, aspect } = useVideoTexture(onVideoError);

  const isMobile =
    typeof window !== "undefined" &&
    (window.innerWidth < 768 || (navigator.maxTouchPoints ?? 0) > 1);

  const fitH = viewport.height * 0.84;
  const fitW = viewport.width * 0.88;
  const h = Math.min(fitH, fitW / aspect);
  const w = h * aspect;

  return (
    <>
      <Lights mobile={isMobile} />
      <Rig>
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

  const isMobile =
    typeof window !== "undefined" &&
    (window.innerWidth < 768 || (navigator.maxTouchPoints ?? 0) > 1);

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
      <SceneContents onVideoError={onVideoError} />
    </Canvas>
  );
}
