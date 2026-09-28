"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState, type ReactNode, type RefObject } from "react";
import * as THREE from "three";

const CYAN = "#00f0ff";
const VIOLET = "#7000ff";
const DEFAULT_ASPECT = 788 / 1400;

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
    float alpha = halo * (0.3 + 0.26 * pulse);
    gl_FragColor = vec4(col, alpha);
  }
`;

/** Loads the reactor render once and reports its aspect ratio and texel size. */
function useReactorTexture() {
  const [state, setState] = useState<{
    texture: THREE.Texture | null;
    aspect: number;
    texel: THREE.Vector2;
  }>({
    texture: null,
    aspect: DEFAULT_ASPECT,
    texel: new THREE.Vector2(1 / 788, 1 / 1400),
  });
  const ref = useRef<THREE.Texture | null>(null);

  useEffect(() => {
    let active = true;
    const small = typeof window !== "undefined" && window.innerWidth < 768;
    const loader = new THREE.TextureLoader();
    loader.load(
      small ? "/reactor-720.webp" : "/reactor.webp",
      (t) => {
        if (!active) {
          t.dispose();
          return;
        }
        t.colorSpace = THREE.SRGBColorSpace;
        t.minFilter = THREE.LinearMipmapLinearFilter;
        t.magFilter = THREE.LinearFilter;
        t.generateMipmaps = true;
        t.anisotropy = 4;
        t.needsUpdate = true;
        ref.current = t;
        const image = t.image as { width: number; height: number };
        setState({
          texture: t,
          aspect: image.width / image.height,
          texel: new THREE.Vector2(1 / image.width, 1 / image.height),
        });
      },
      undefined,
      () => {},
    );
    return () => {
      active = false;
      ref.current?.dispose();
      ref.current = null;
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

/**
 * The reactor image, displaced into a depth relief on the GPU. Luminance drives
 * vertex height, neighbouring texels derive real normals, and the mesh is lit by
 * coloured lights so the relief reads as a solid, interactive 3D object.
 */
function ReactorRelief({
  texture,
  texel,
  w,
  h,
  mobile,
}: {
  texture: THREE.Texture;
  texel: THREE.Vector2;
  w: number;
  h: number;
  mobile: boolean;
}) {
  const geometry = useMemo(() => {
    const segY = mobile ? 150 : 260;
    const segX = Math.max(2, Math.round(segY * (w / h)));
    return new THREE.PlaneGeometry(w, h, segX, segY);
  }, [w, h, mobile]);

  const material = useMemo(() => {
    const mat = new THREE.MeshLambertMaterial({
      map: texture,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      toneMapped: false,
      side: THREE.FrontSide,
    });

    mat.onBeforeCompile = (shader) => {
      shader.uniforms.uHeightMap = { value: texture };
      shader.uniforms.uTexel = { value: texel };
      shader.uniforms.uSize = { value: new THREE.Vector2(w, h) };
      shader.uniforms.uDepth = { value: h * 0.14 };

      shader.vertexShader = shader.vertexShader
        .replace(
          "#include <common>",
          /* glsl */ `#include <common>
          uniform sampler2D uHeightMap;
          uniform vec2 uTexel;
          uniform vec2 uSize;
          uniform float uDepth;
          float nexoraHeight(vec2 p) {
            vec3 c = texture2D(uHeightMap, clamp(p, 0.0, 1.0)).rgb;
            float l = dot(c, vec3(0.299, 0.587, 0.114));
            return pow(clamp(l, 0.0, 1.0), 0.85);
          }`,
        )
        .replace(
          "#include <beginnormal_vertex>",
          /* glsl */ `vec3 objectNormal = vec3( normal );
          {
            float hL = nexoraHeight(uv - vec2(uTexel.x, 0.0));
            float hR = nexoraHeight(uv + vec2(uTexel.x, 0.0));
            float hD = nexoraHeight(uv - vec2(0.0, uTexel.y));
            float hU = nexoraHeight(uv + vec2(0.0, uTexel.y));
            float dzdx = uDepth * (hR - hL) / (2.0 * uTexel.x * uSize.x);
            float dzdy = uDepth * (hU - hD) / (2.0 * uTexel.y * uSize.y);
            objectNormal = normalize(vec3(-dzdx, -dzdy, 1.0));
          }`,
        )
        .replace(
          "#include <begin_vertex>",
          /* glsl */ `#include <begin_vertex>
          transformed.z += nexoraHeight(uv) * uDepth;`,
        );
    };
    mat.customProgramCacheKey = () => "nexora-relief";
    return mat;
  }, [texture, texel, w, h]);

  useEffect(() => {
    return () => {
      geometry.dispose();
      material.dispose();
    };
  }, [geometry, material]);

  return <mesh material={material} geometry={geometry} />;
}

/** Coloured key lights give the relief directional shading that shifts with parallax. */
function Lights({ mobile }: { mobile: boolean }) {
  return (
    <>
      <ambientLight intensity={0.72} />
      <pointLight
        position={[-3.2, 2.6, 4]}
        color={CYAN}
        intensity={mobile ? 9 : 15}
        distance={16}
        decay={2}
      />
      <pointLight
        position={[3.4, -1.8, 3.6]}
        color={VIOLET}
        intensity={mobile ? 8 : 13}
        distance={16}
        decay={2}
      />
      <directionalLight position={[0, 0.6, 6]} intensity={0.55} color="#bfefff" />
    </>
  );
}

/** Floating, drag-and-hover reactive rig driving the interactive 3D presentation. */
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
    rig.current.position.y = Math.sin(t * 0.55) * 0.07;
    rig.current.position.x = Math.cos(t * 0.38) * 0.035;
    rig.current.position.z = Math.sin(t * 0.45) * 0.06;
  });

  return <group ref={rig}>{children}</group>;
}

function SceneContents({
  interaction,
  mobile,
}: {
  interaction: RefObject<Interaction>;
  mobile: boolean;
}) {
  const { viewport } = useThree();
  const { texture, aspect, texel } = useReactorTexture();

  const fitH = viewport.height * 0.84;
  const fitW = viewport.width * 0.88;
  const h = Math.min(fitH, fitW / aspect);
  const w = h * aspect;

  return (
    <>
      <Lights mobile={mobile} />
      <Rig interaction={interaction}>
        <Aura w={w} h={h} />
        {texture ? (
          <ReactorRelief texture={texture} texel={texel} w={w} h={h} mobile={mobile} />
        ) : null}
      </Rig>
    </>
  );
}

export default function CoreScene({ onContextLost }: { onContextLost?: () => void }) {
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
      <SceneContents interaction={interaction} mobile={isMobile} />
    </Canvas>
  );
}
