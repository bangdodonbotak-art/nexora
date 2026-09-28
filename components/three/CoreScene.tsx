"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import * as THREE from "three";
import { usePointer } from "@/lib/hooks";

const CYAN = "#00f0ff";
const VIOLET = "#7000ff";
const IRIS = "#8b5cf6";
const AQUA = "#22d3ee";

const PANEL_ASPECT = 788 / 1400;

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
    float core = smoothstep(0.5, 0.0, d);
    float halo = pow(core, 2.4);
    float pulse = 0.5 + 0.5 * sin(uTime * 1.25);
    vec3 col = mix(uColorB, uColorA, clamp(core * 1.25, 0.0, 1.0));
    float alpha = halo * (0.32 + 0.3 * pulse);
    gl_FragColor = vec4(col, alpha);
  }
`;

/** Loads the reactor render once and configures it for a color-correct GPU texture. */
function useReactorTexture() {
  const [texture, setTexture] = useState<THREE.Texture | null>(null);
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
        setTexture(t);
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

  return texture;
}

/** Soft neon aura behind the reactor, breathing on its own rhythm. */
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
    if (material.current) material.current.uniforms.uTime.value = state.clock.elapsedTime;
    if (mesh.current) {
      const pulse = 1 + Math.sin(state.clock.elapsedTime * 1.25) * 0.035;
      mesh.current.scale.setScalar(pulse);
    }
  });

  return (
    <mesh ref={mesh} position={[0, 0, -0.2]}>
      <planeGeometry args={[w * 1.95, h * 1.95]} />
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

/** The reactor render itself, floating as a double-sided holographic panel. */
function Panel({ texture, w, h }: { texture: THREE.Texture; w: number; h: number }) {
  return (
    <mesh position={[0, 0, 0]}>
      <planeGeometry args={[w, h, 1, 1]} />
      <meshBasicMaterial
        map={texture}
        transparent
        opacity={0.98}
        side={THREE.DoubleSide}
        blending={THREE.AdditiveBlending}
        toneMapped={false}
        depthWrite={false}
      />
    </mesh>
  );
}

/** Concentric energy waves that expand outward from the core and fade. */
function PulseRings({ w, h }: { w: number; h: number }) {
  const defs = useMemo(
    () => [
      { color: CYAN, phase: 0.0, max: 1.55 },
      { color: IRIS, phase: 0.34, max: 1.75 },
      { color: AQUA, phase: 0.67, max: 1.4 },
    ],
    [],
  );
  const base = Math.max(w, h) * 0.5;
  const meshes = useRef<(THREE.Mesh | null)[]>([]);
  const materials = useRef<(THREE.MeshBasicMaterial | null)[]>([]);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    defs.forEach((def, i) => {
      const p = (t * 0.16 + def.phase) % 1;
      meshes.current[i]?.scale.setScalar(0.35 + p * def.max);
      const mat = materials.current[i];
      if (mat) mat.opacity = (1 - p) * 0.5;
    });
  });

  return (
    <>
      {defs.map((def, i) => (
        <mesh
          key={i}
          ref={(el) => {
            meshes.current[i] = el;
          }}
          position={[0, 0, 0.08]}
        >
          <ringGeometry args={[base * 0.97, base, 96]} />
          <meshBasicMaterial
            ref={(el) => {
              materials.current[i] = el;
            }}
            color={def.color}
            transparent
            opacity={0}
            side={THREE.DoubleSide}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
            toneMapped={false}
          />
        </mesh>
      ))}
    </>
  );
}

/** Tilted neon rings that revolve around the core. */
function EnergyRings({ h }: { h: number }) {
  const rings = useMemo(
    () => [
      { r: h * 0.62, tilt: [1.32, 0.18, 0.1] as const, color: CYAN, speed: 0.22 },
      { r: h * 0.72, tilt: [-1.0, 0.5, 0.9] as const, color: IRIS, speed: -0.16 },
      { r: h * 0.52, tilt: [0.35, 1.4, -0.4] as const, color: AQUA, speed: 0.3 },
    ],
    [h],
  );
  const meshes = useRef<(THREE.Mesh | null)[]>([]);

  useFrame((_, delta) => {
    meshes.current.forEach((mesh, i) => {
      if (!mesh) return;
      mesh.rotation.z += delta * rings[i].speed;
      mesh.rotation.y += delta * rings[i].speed * 0.4;
    });
  });

  return (
    <>
      {rings.map((ring, i) => (
        <mesh
          key={i}
          ref={(el) => {
            meshes.current[i] = el;
          }}
          rotation={[ring.tilt[0], ring.tilt[1], ring.tilt[2]]}
        >
          <torusGeometry args={[ring.r, 0.0055, 6, 160]} />
          <meshBasicMaterial
            color={ring.color}
            transparent
            opacity={0.5}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
            toneMapped={false}
          />
        </mesh>
      ))}
    </>
  );
}

/** Small emissive motes riding the ring assembly for extra depth. */
function Nodes({ h }: { h: number }) {
  const positions = useMemo(() => {
    const items: { pos: [number, number, number]; color: string; size: number }[] = [];
    const r = h * 0.62;
    const count = 7;
    for (let i = 0; i < count; i++) {
      const a = (i / count) * Math.PI * 2;
      const y = Math.sin(a * 1.3 + i) * h * 0.34;
      items.push({
        pos: [Math.cos(a) * r, y, Math.sin(a) * r * 0.55],
        color: i % 3 === 0 ? IRIS : i % 3 === 1 ? CYAN : AQUA,
        size: 0.04 + (i % 3) * 0.008,
      });
    }
    return items;
  }, [h]);

  return (
    <>
      {positions.map((node, i) => (
        <mesh key={i} position={node.pos} scale={node.size}>
          <sphereGeometry args={[1, 12, 12]} />
          <meshBasicMaterial color={node.color} toneMapped={false} />
        </mesh>
      ))}
    </>
  );
}

function Particles({ count }: { count: number }) {
  const points = useRef<THREE.Points>(null);

  const { positions, colors } = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const cyan = new THREE.Color(CYAN);
    const violet = new THREE.Color(VIOLET);
    for (let i = 0; i < count; i++) {
      const r = 2.3 + Math.random() * 4.4;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta) * 0.72;
      positions[i * 3 + 2] = r * Math.cos(phi);
      const c = cyan.clone().lerp(violet, Math.random());
      colors[i * 3] = c.r;
      colors[i * 3 + 1] = c.g;
      colors[i * 3 + 2] = c.b;
    }
    return { positions, colors };
  }, [count]);

  useFrame((state, delta) => {
    if (!points.current) return;
    points.current.rotation.y += delta * 0.035;
    points.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.08) * 0.08;
  });

  return (
    <points ref={points}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-color" args={[colors, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.028}
        sizeAttenuation
        vertexColors
        transparent
        opacity={0.85}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

/** Group that eases toward the pointer and gently floats, driving mouse/touch parallax. */
function Rig({ children }: { children: ReactNode }) {
  const pointer = usePointer();
  const rig = useRef<THREE.Group>(null);

  useFrame((state, delta) => {
    if (!rig.current) return;
    const t = state.clock.elapsedTime;
    const damp = (current: number, target: number) => current + (target - current) * (1 - Math.exp(-4 * delta));
    rig.current.rotation.y = damp(rig.current.rotation.y, pointer.current.x * 0.4);
    rig.current.rotation.x = damp(rig.current.rotation.x, -pointer.current.y * 0.28);
    rig.current.position.y = Math.sin(t * 0.6) * 0.06;
    rig.current.position.x = Math.cos(t * 0.4) * 0.03;
  });

  return <group ref={rig}>{children}</group>;
}

/** Continuously revolves its children through a full turn. */
function Spinner({ children, speed = 0.16 }: { children: ReactNode; speed?: number }) {
  const spinner = useRef<THREE.Group>(null);
  useFrame((_, delta) => {
    if (spinner.current) spinner.current.rotation.y += delta * speed;
  });
  return <group ref={spinner}>{children}</group>;
}

function SceneContents() {
  const { viewport } = useThree();
  const texture = useReactorTexture();

  const isMobile =
    typeof window !== "undefined" &&
    (window.innerWidth < 768 || (navigator.maxTouchPoints ?? 0) > 1);
  const count = isMobile ? 520 : 1200;

  const fitH = viewport.height * 0.84;
  const fitW = viewport.width * 0.9;
  const h = Math.min(fitH, fitW / PANEL_ASPECT);
  const w = h * PANEL_ASPECT;

  return (
    <Rig>
      <Aura w={w} h={h} />
      {texture ? <Panel texture={texture} w={w} h={h} /> : null}
      <PulseRings w={w} h={h} />
      <Spinner>
        <EnergyRings h={h} />
        <Nodes h={h} />
        <Particles count={count} />
      </Spinner>
    </Rig>
  );
}

export default function CoreScene({ onContextLost }: { onContextLost?: () => void }) {
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
      <SceneContents />
    </Canvas>
  );
}
