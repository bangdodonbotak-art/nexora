"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState, type ReactNode, type RefObject } from "react";
import * as THREE from "three";

const VIDEO_SRC = "/nexora-reactor-square.mp4";
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

/**
 * The reactor plane. Video colour is kept raw in the GPU texture and the dark
 * background is removed per-pixel in the fragment stage. Screen-space normals
 * derived from luminance give the flat plane subtle 3D shading, so the object
 * reads as lit volume without ever rotating its rectangular boundary into view.
 */
const reactorVertex = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const reactorFragment = /* glsl */ `
  uniform sampler2D uMap;
  uniform vec2 uTexel;
  uniform float uTime;
  uniform float uLow;
  uniform float uHigh;
  uniform float uBump;
  varying vec2 vUv;

  float reactorLuma(vec3 c) {
    return dot(c, vec3(0.299, 0.587, 0.114));
  }

  void main() {
    vec3 rgb = texture2D(uMap, vUv).rgb;
    float l = reactorLuma(rgb);
    float mx = max(rgb.r, max(rgb.g, rgb.b));
    float mn = min(rgb.r, min(rgb.g, rgb.b));
    float chroma = mx - mn;

    // Estimate the flat backdrop from the frame corners, trusting only a dark
    // one. If the corners are bright there is no dark background to remove.
    vec3 c0 = texture2D(uMap, vec2(0.03, 0.03)).rgb;
    vec3 c1 = texture2D(uMap, vec2(0.97, 0.03)).rgb;
    vec3 c2 = texture2D(uMap, vec2(0.03, 0.97)).rgb;
    vec3 c3 = texture2D(uMap, vec2(0.97, 0.97)).rgb;
    vec3 bg = c0;
    if (reactorLuma(c1) < reactorLuma(bg)) bg = c1;
    if (reactorLuma(c2) < reactorLuma(bg)) bg = c2;
    if (reactorLuma(c3) < reactorLuma(bg)) bg = c3;
    float bgDark = 1.0 - smoothstep(0.14, 0.34, reactorLuma(bg));
    vec3 key = mix(vec3(0.0), bg, bgDark);

    // Anything close to the backdrop becomes transparent, so black and dark
    // navy alike disappear; whatever differs visually survives. Soft edge, no
    // hard rectangle.
    float dist = length(rgb - key);
    float alpha = smoothstep(uLow, uHigh, dist);

    // Keep bright cyan / blue / violet emissive details.
    float emissive = smoothstep(0.32, 0.6, l) * smoothstep(0.05, 0.22, chroma);
    alpha = clamp(max(alpha, emissive), 0.0, 1.0);

    // Screen-space normals from the luminance field: cheap embossed lighting.
    vec2 t = uTexel * 2.0;
    float hl = reactorLuma(texture2D(uMap, vUv - vec2(t.x, 0.0)).rgb);
    float hr = reactorLuma(texture2D(uMap, vUv + vec2(t.x, 0.0)).rgb);
    float hd = reactorLuma(texture2D(uMap, vUv - vec2(0.0, t.y)).rgb);
    float hu = reactorLuma(texture2D(uMap, vUv + vec2(0.0, t.y)).rgb);
    vec3 N = normalize(vec3((hl - hr) * uBump, (hd - hu) * uBump, 1.0));

    vec3 L1 = normalize(vec3(-0.42, 0.55, 0.72));
    vec3 L2 = normalize(vec3(0.5, -0.35, 0.79));
    vec3 V = vec3(0.0, 0.0, 1.0);
    float d1 = max(dot(N, L1), 0.0);
    float d2 = max(dot(N, L2), 0.0);
    float s1 = pow(max(dot(reflect(-L1, N), V), 0.0), 30.0);
    float s2 = pow(max(dot(reflect(-L2, N), V), 0.0), 30.0);

    vec3 cyan = vec3(0.0, 0.94, 1.0);
    vec3 violet = vec3(0.44, 0.0, 1.0);

    vec3 col = rgb * (0.86 + 0.26 * d1 + 0.2 * d2);
    col += cyan * s1 * 0.3 + violet * s2 * 0.26;
    float rim = pow(1.0 - clamp(N.z, 0.0, 1.0), 2.5);
    col += (cyan + violet) * 0.5 * rim * 0.2;
    col *= 1.0 + 0.015 * sin(uTime * 0.9);

    gl_FragColor = vec4(col, alpha);
  }
`;

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

/** Streams the square reactor video into a GPU texture, reading its real aspect. */
function useVideoTexture(onError?: () => void) {
  const [state, setState] = useState<{
    texture: THREE.VideoTexture | null;
    aspect: number;
    texel: THREE.Vector2;
  }>({
    texture: null,
    aspect: DEFAULT_ASPECT,
    texel: new THREE.Vector2(1 / 720, 1 / 720),
  });
  const ref = useRef<THREE.VideoTexture | null>(null);
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
      const w = video.videoWidth || 720;
      const h = video.videoHeight || 720;
      texture = new THREE.VideoTexture(video);
      // Raw colour data: the shader consumes it directly and writes the final
      // pixels, so no sRGB decode/encode is applied around it.
      texture.colorSpace = THREE.NoColorSpace;
      texture.minFilter = THREE.LinearFilter;
      texture.magFilter = THREE.LinearFilter;
      texture.generateMipmaps = false;
      ref.current = texture;
      setState({ texture, aspect: w / h, texel: new THREE.Vector2(1 / w, 1 / h) });
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
      video.removeEventListener("error", ready);
      video.pause();
      video.removeAttribute("src");
      video.load();
      texture?.dispose();
      ref.current = null;
    };
  }, []);

  return state;
}

/** Soft cyan/violet atmosphere behind the reactor; its edges fade to nothing. */
function Aura({ w, h }: { w: number; h: number }) {
  const material = useRef<THREE.ShaderMaterial>(null);
  const mesh = useRef<THREE.Mesh>(null);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uAspect: { value: w / h },
      uColorA: { value: new THREE.Color("#00f0ff") },
      uColorB: { value: new THREE.Color("#7000ff") },
    }),
    [w, h],
  );

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (material.current) material.current.uniforms.uTime.value = t;
    if (mesh.current) mesh.current.scale.setScalar(1 + Math.sin(t * 0.9) * 0.03);
  });

  return (
    <mesh ref={mesh} position={[0, 0, -0.4]}>
      <planeGeometry args={[w * 1.7, h * 1.7]} />
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

/** The keyed reactor surface, transparent everywhere except the reactor itself. */
function ReactorPanel({
  texture,
  texel,
  w,
  h,
}: {
  texture: THREE.Texture;
  texel: THREE.Vector2;
  w: number;
  h: number;
}) {
  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms: {
          uMap: { value: texture },
          uTexel: { value: texel },
          uTime: { value: 0 },
          uLow: { value: 0.04 },
          uHigh: { value: 0.16 },
          uBump: { value: 4.0 },
        },
        vertexShader: reactorVertex,
        fragmentShader: reactorFragment,
        transparent: true,
        depthWrite: false,
        side: THREE.FrontSide,
      }),
    [texture, texel],
  );

  useFrame((state) => {
    material.uniforms.uTime.value = state.clock.elapsedTime;
  });

  useEffect(() => () => material.dispose(), [material]);

  return (
    <mesh material={material}>
      <planeGeometry args={[w, h, 1, 1]} />
    </mesh>
  );
}

/**
 * Very restrained motion: a slow float plus a whisper of pointer parallax.
 * The plane is not rotated far enough to expose any edge of its source frame.
 */
function Rig({ children, interaction }: { children: ReactNode; interaction: RefObject<Interaction> }) {
  const rig = useRef<THREE.Group>(null);

  useFrame((state, delta) => {
    if (!rig.current) return;
    const t = state.clock.elapsedTime;
    const s = interaction.current;
    const damp = (current: number, target: number) =>
      current + (target - current) * (1 - Math.exp(-5 * delta));

    const targetY = clamp(s.dragX + s.hoverX * 0.05, -0.16, 0.16) + Math.sin(t * 0.3) * 0.015;
    const targetX = clamp(s.dragY - 0.015 - s.hoverY * 0.04, -0.12, 0.12);

    rig.current.rotation.y = damp(rig.current.rotation.y, targetY);
    rig.current.rotation.x = damp(rig.current.rotation.x, targetX);
    rig.current.position.y = Math.sin(t * 0.55) * 0.05;
    rig.current.position.x = Math.cos(t * 0.38) * 0.025;
    rig.current.position.z = Math.sin(t * 0.45) * 0.03;
  });

  return <group ref={rig}>{children}</group>;
}

function SceneContents({
  interaction,
  onVideoError,
}: {
  interaction: RefObject<Interaction>;
  onVideoError?: () => void;
}) {
  const { viewport } = useThree();
  const { texture, aspect, texel } = useVideoTexture(onVideoError);

  // Largest square the actual canvas allows, with a slim safety margin.
  const MARGIN = 0.92;
  const fitH = viewport.height * MARGIN;
  const fitW = viewport.width * MARGIN;
  const h = Math.min(fitH, fitW / aspect);
  const w = h * aspect;

  return (
    <Rig interaction={interaction}>
      <Aura w={w} h={h} />
      {texture ? <ReactorPanel texture={texture} texel={texel} w={w} h={h} /> : null}
    </Rig>
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
        s.dragX = clamp(s.dragX + dx * 0.0015, -0.14, 0.14);
        s.dragY = clamp(s.dragY + dy * 0.0015, -0.1, 0.1);
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
      dpr={[1, isMobile ? 1.5 : 1.75]}
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
      <SceneContents interaction={interaction} onVideoError={onVideoError} />
    </Canvas>
  );
}
