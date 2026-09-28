"use client";

import { useMemo, useRef, useState } from "react";
import type { PointerEvent as ReactPointerEvent } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { FLOW_CAPABILITIES, FLOW_NODES, SAFETY_NODE, type FlowNode } from "@/lib/content";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/ui/Reveal";

const NODE_W = 19;
const NODE_H = 19;

type Edge = { from: FlowNode; to: FlowNode; branch?: boolean };

function connector(a: FlowNode, b: FlowNode) {
  const x1 = a.x + NODE_W / 2;
  const y1 = a.y + NODE_H / 2;
  const x2 = b.x + NODE_W / 2;
  const y2 = b.y + NODE_H / 2;
  const mx = (x1 + x2) / 2;
  return `M ${x1} ${y1} C ${mx} ${y1}, ${mx} ${y2}, ${x2} ${y2}`;
}

function Beam({ id, color, duration, delay }: { id: string; color: string; duration: number; delay: number }) {
  return (
    <circle r="2.4" fill={color} style={{ filter: `drop-shadow(0 0 5px ${color})` }}>
      <animateMotion dur={`${duration}s`} begin={`${delay}s`} repeatCount="indefinite" rotate="auto">
        <mpath href={`#${id}`} />
      </animateMotion>
    </circle>
  );
}

function NodePopover({ node }: { node: FlowNode }) {
  const below = node.y < 28;
  return (
    <motion.div
      initial={{ opacity: 0, y: below ? -6 : 6, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.97 }}
      transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
      className={`glass-strong pointer-events-none absolute left-1/2 z-40 w-56 -translate-x-1/2 rounded-xl border-white/15 p-3.5 ${
        below ? "top-[calc(100%+10px)]" : "bottom-[calc(100%+10px)]"
      }`}
      style={{ boxShadow: `0 24px 60px -24px ${node.color}` }}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="mono text-[0.56rem] uppercase tracking-[0.18em] text-muted">
          {node.kind}
        </span>
        <span className="live-dot" />
      </div>
      <div className="display mt-1.5 text-[0.9rem] font-bold text-mist">{node.label}</div>
      <div className="mono mt-2.5 space-y-1.5 text-[0.62rem]">
        <div className="flex items-center justify-between gap-2">
          <span className="text-muted">model</span>
          <span className="truncate text-cyan/90">{node.model}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-muted">latency</span>
          <span className="text-mist/85">{node.latency}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-muted">tokens</span>
          <span className="text-mist/85">{node.tokens}</span>
        </div>
      </div>
      <span
        className="absolute left-1/2 h-2.5 w-2.5 -translate-x-1/2 rotate-45 border border-white/15"
        style={{
          background: "linear-gradient(155deg, rgba(24,33,50,0.95), rgba(7,10,17,0.95))",
          [below ? "top" : "bottom"]: "-5px",
        }}
      />
    </motion.div>
  );
}

export function NexoraFlowCanvas() {
  const [nodes, setNodes] = useState<FlowNode[]>(FLOW_NODES);
  const [dragId, setDragId] = useState<string | null>(null);
  const [hoverId, setHoverId] = useState<string | null>(null);
  const [branch, setBranch] = useState(false);
  const canvasRef = useRef<HTMLDivElement>(null);
  const drag = useRef<{
    id: string;
    ox: number;
    oy: number;
    w: number;
    h: number;
    startX: number;
    startY: number;
  } | null>(null);

  const allNodes = useMemo(() => (branch ? [...nodes, SAFETY_NODE] : nodes), [nodes, branch]);

  const lookup = (id: string) => allNodes.find((n) => n.id === id)!;

  const edges = useMemo<Edge[]>(() => {
    const main: Edge[] = [];
    for (let i = 0; i < FLOW_NODES.length - 1; i++) {
      main.push({ from: lookup(FLOW_NODES[i].id), to: lookup(FLOW_NODES[i + 1].id) });
    }
    if (branch) {
      main.push({ from: lookup("script"), to: SAFETY_NODE, branch: true });
      main.push({ from: SAFETY_NODE, to: lookup("deploy"), branch: true });
    }
    return main;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allNodes, branch]);

  const onPointerDown = (node: FlowNode) => (e: ReactPointerEvent) => {
    if (node.id === SAFETY_NODE.id) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    drag.current = {
      id: node.id,
      ox: node.x,
      oy: node.y,
      w: rect.width,
      h: rect.height,
      startX: e.clientX,
      startY: e.clientY,
    };
    setDragId(node.id);
    setHoverId(null);
    (e.currentTarget as Element).setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: ReactPointerEvent) => {
    const d = drag.current;
    if (!d) return;
    const dx = ((e.clientX - d.startX) / d.w) * 100;
    const dy = ((e.clientY - d.startY) / d.h) * 100;
    setNodes((prev) =>
      prev.map((n) =>
        n.id === d.id
          ? {
              ...n,
              x: Math.min(100 - NODE_W, Math.max(0, d.ox + dx)),
              y: Math.min(100 - NODE_H, Math.max(0, d.oy + dy)),
            }
          : n,
      ),
    );
  };

  const endDrag = (e: ReactPointerEvent) => {
    if (drag.current) (e.currentTarget as Element).releasePointerCapture?.(e.pointerId);
    drag.current = null;
    setDragId(null);
  };

  return (
    <section id="flow" className="section-pad relative">
      <div className="shell">
        <SectionHeading
          index="04 / ORCHESTRATION"
          eyebrow="Nexora Flow"
          title={
            <>
              Visual workflows that <span className="text-gradient">actually execute</span>
            </>
          }
          description="Drag nodes onto the canvas, branch on any condition, and ship the graph as a durable job. Below: an e-commerce publishing workflow, running end to end."
        />

        <Reveal className="mt-10">
          <div className="glass hud rounded-2xl p-3 sm:p-5">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3 px-1">
              <div className="flex items-center gap-3">
                <span className="chip">
                  <span className="live-dot" />
                  workflow / ecommerce-publishing
                </span>
                <span className="mono hidden text-[0.62rem] uppercase tracking-[0.2em] text-muted sm:inline">
                  live particle routing
                </span>
              </div>

              <button
                type="button"
                role="switch"
                aria-checked={branch}
                onClick={() => setBranch((v) => !v)}
                className={`flex items-center gap-3 rounded-full border px-3.5 py-2 transition-colors ${
                  branch ? "border-danger/45 bg-danger/[0.08]" : "border-white/12 bg-white/[0.02]"
                }`}
              >
                <span className="mono text-[0.62rem] uppercase tracking-[0.16em] text-muted">
                  Branching Logic
                </span>
                <span
                  className={`relative h-5 w-9 rounded-full transition-colors ${
                    branch ? "bg-danger/70" : "bg-white/15"
                  }`}
                >
                  <motion.span
                    layout
                    transition={{ type: "spring", stiffness: 520, damping: 34 }}
                    className={`absolute top-0.5 h-4 w-4 rounded-full bg-mist shadow ${
                      branch ? "right-0.5" : "left-0.5"
                    }`}
                  />
                </span>
              </button>
            </div>

            <div className="overflow-x-auto pb-1">
              <div
                ref={canvasRef}
                className="relative aspect-[2.15/1] min-w-[820px] overflow-hidden rounded-xl border border-white/10 bg-[#04070d]/60"
                onPointerMove={onPointerMove}
                onPointerUp={endDrag}
                onPointerLeave={endDrag}
              >
                <div
                  className="absolute inset-0 opacity-60"
                  style={{
                    backgroundImage: "radial-gradient(rgba(120,150,190,0.18) 1px, transparent 1px)",
                    backgroundSize: "26px 26px",
                  }}
                  aria-hidden
                />

                <svg
                  viewBox="0 0 100 100"
                  preserveAspectRatio="none"
                  className="absolute inset-0 h-full w-full"
                  aria-hidden
                >
                  {edges.map((edge, i) => {
                    const d = connector(edge.from, edge.to);
                    const id = `edge-${edge.from.id}-${edge.to.id}`;
                    const color = edge.branch ? "#ff4d6d" : "#00f0ff";
                    return (
                      <g key={id}>
                        <path
                          id={id}
                          d={d}
                          fill="none"
                          stroke={edge.branch ? "rgba(255,77,109,0.35)" : "rgba(120,150,190,0.25)"}
                          strokeWidth={1.4}
                          strokeDasharray={edge.branch ? "4 4" : undefined}
                          vectorEffect="non-scaling-stroke"
                        />
                        <path
                          d={d}
                          fill="none"
                          stroke={color}
                          strokeWidth={1.6}
                          strokeDasharray={edge.branch ? "3 6" : "6 8"}
                          vectorEffect="non-scaling-stroke"
                          className="animate-[dash_1.6s_linear_infinite]"
                          style={{ opacity: edge.branch ? 0.9 : 0.55 }}
                        />
                        <Beam id={id} color={color} duration={edge.branch ? 3 : 2.4} delay={i * 0.35} />
                        {edge.branch ? <Beam id={id} color={color} duration={3} delay={1.5} /> : null}
                      </g>
                    );
                  })}
                </svg>

                {allNodes.map((node) => {
                  const active = dragId === node.id;
                  const hovered = hoverId === node.id;
                  return (
                    <motion.div
                      key={node.id}
                      initial={node.id === SAFETY_NODE.id ? { opacity: 0, scale: 0.85 } : false}
                      animate={{ scale: active ? 1.04 : 1, opacity: 1 }}
                      transition={{ type: "spring", stiffness: 320, damping: 26 }}
                      onPointerDown={onPointerDown(node)}
                      onPointerMove={onPointerMove}
                      onPointerUp={endDrag}
                      onPointerCancel={endDrag}
                      onPointerEnter={() => setHoverId(node.id)}
                      onPointerLeave={() => setHoverId((h) => (h === node.id ? null : h))}
                      style={{
                        left: `${node.x}%`,
                        top: `${node.y}%`,
                        width: `${NODE_W}%`,
                        height: `${NODE_H}%`,
                        touchAction: "none",
                        borderColor: hovered ? `${node.color}cc` : `${node.color}55`,
                        boxShadow: hovered ? `0 0 42px -12px ${node.color}` : `0 0 24px -18px ${node.color}`,
                      }}
                      className={`absolute z-10 flex flex-col justify-center gap-1 rounded-xl border bg-ink-2/90 px-3.5 backdrop-blur-md ${
                        node.id === SAFETY_NODE.id ? "cursor-default" : "cursor-grab active:cursor-grabbing"
                      } ${active ? "z-20" : ""}`}
                    >
                      <span
                        className="absolute bottom-3 left-0 top-3 w-[3px] rounded-full"
                        style={{ background: node.color }}
                      />
                      <span className="mono text-[0.55rem] uppercase tracking-[0.2em] text-muted">
                        {node.kind}
                      </span>
                      <span className="text-[0.86rem] font-semibold leading-tight text-mist">
                        {node.label}
                      </span>
                      <span className="mono text-[0.56rem] text-cyan/70">{node.meta}</span>
                      <span
                        className="absolute right-[-5px] top-1/2 h-2.5 w-2.5 -translate-y-1/2 rounded-full"
                        style={{ background: node.color }}
                      />
                      <AnimatePresence>
                        {hovered && !active ? <NodePopover node={node} /> : null}
                      </AnimatePresence>
                    </motion.div>
                  );
                })}
              </div>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              {FLOW_CAPABILITIES.map((f) => (
                <div key={f.k} className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
                  <div className="text-[0.82rem] font-semibold text-mist">{f.k}</div>
                  <div className="mono mt-1 text-[0.65rem] uppercase tracking-[0.14em] text-muted">
                    {f.v}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
