import React, { useState, useRef, useMemo } from 'react';
import {
  BehaviorEvaluationOutput,
  BiocomplexInterstitialOrigin,
  ContinuumNovelEvent,
  Edge4D,
  FavoritedManifoldAnchor,
  ForeroomsDispositionLocus,
  ForeroomsTelemetry,
  ManifoldGameVersionLog,
  Node4D,
  Node4DCategory,
} from '../types/manifold';
import { NODE_4D_PRESETS, NodeGraphPreset } from '../utils/node4dSystem';
import {
  ALL_FOREROOMS_DISPOSITIONS,
  FOREROOMS_DISPOSITION_CATALOG,
  FOREROOMS_SPELLING_VARIANTS,
  synthesizeBiocomplexInterstitialOrigin,
} from '../utils/foreroomsEngine';
import {
  Compass,
  GitBranch,
  Layers,
  Plus,
  Zap,
  Play,
  Pause,
  Sparkles,
  Trash2,
} from 'lucide-react';

interface Node4DGraphPanelProps {
  nodes: Node4D[];
  edges: Edge4D[];
  wCoord: number;
  autoOscillateW: boolean;
  evaluationOutput: BehaviorEvaluationOutput;
  onChangeWCoord: (w: number) => void;
  onToggleAutoOscillateW: () => void;
  onUpdateNode: (updated: Node4D) => void;
  onAddNode: (node: Node4D, connectFromId?: string, connectToId?: string) => void;
  onDeleteNode: (nodeId: string) => void;
  onLoadPreset: (preset: NodeGraphPreset) => void;
  onTriggerShockwave: () => void;
  onToggleGlobalRagdoll: () => void;
  globalRagdollActive: boolean;
  foreroomsTelemetry?: ForeroomsTelemetry | null;
  foreroomsDispositionOverride?: ForeroomsDispositionLocus | null;
  onChangeForeroomsDisposition?: (
    disp: ForeroomsDispositionLocus | null
  ) => void;
  favoritedManifolds?: FavoritedManifoldAnchor[];
  gameVersionArchive?: ManifoldGameVersionLog[];
  activeVersionId?: string;
  novelEvents?: ContinuumNovelEvent[];
  onSelectGameVersion?: (ver: ManifoldGameVersionLog) => void;
  onJumpToInterstitialOrigin?: (origin: BiocomplexInterstitialOrigin) => void;
  onManifestInterstitialInWorld?: (
    origin: BiocomplexInterstitialOrigin
  ) => void;
  onCondense5DMatterToFoundation?: () => void;
}

const CATEGORY_STYLES: Record<
  Node4DCategory,
  { label: string; border: string; accent: string; badgeText: string }
> = {
  'sensor-4d': {
    label: '4D Sensor Input',
    border: 'border-cyan-500/40',
    accent: '#06b6d4',
    badgeText: 'text-cyan-400',
  },
  'gateway-4d': {
    label: 'Possibility Gateway',
    border: 'border-amber-500/40',
    accent: '#f59e0b',
    badgeText: 'text-amber-400',
  },
  'behavior-driver': {
    label: 'Locomotion Driver',
    border: 'border-emerald-500/40',
    accent: '#10b981',
    badgeText: 'text-emerald-400',
  },
  'ragdoll-actuator': {
    label: 'Ragdoll Actuator',
    border: 'border-rose-500/40',
    accent: '#f43f5e',
    badgeText: 'text-rose-400',
  },
};

export const Node4DGraphPanel: React.FC<Node4DGraphPanelProps> = ({
  nodes,
  edges,
  wCoord,
  autoOscillateW,
  evaluationOutput,
  onChangeWCoord,
  onToggleAutoOscillateW,
  onUpdateNode,
  onAddNode,
  onDeleteNode,
  onLoadPreset,
  onTriggerShockwave,
  onToggleGlobalRagdoll,
  globalRagdollActive,
  foreroomsTelemetry,
  foreroomsDispositionOverride = null,
  onChangeForeroomsDisposition,
  favoritedManifolds = [],
  gameVersionArchive = [],
  activeVersionId,
  novelEvents = [],
  onSelectGameVersion,
  onJumpToInterstitialOrigin,
  onManifestInterstitialInWorld,
  onCondense5DMatterToFoundation,
}) => {
  const [matrixSubView, setMatrixSubView] = useState<
    'interdimensional-map' | 'forerooms' | 'nodes-4d'
  >('interdimensional-map');

  // Interactive Higher-D Map Pan, Zoom & 4D Perspective Tilt State
  const [mapZoom, setMapZoom] = useState<number>(1.0);
  const [projectionTiltDeg, setProjectionTiltDeg] = useState<number>(34);
  const [mapPan, setMapPan] = useState<{ x: number; y: number }>({
    x: 0,
    y: 0,
  });
  const [isPanningMap, setIsPanningMap] = useState<boolean>(false);
  const panStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  const [selectedTimelineId, setSelectedTimelineId] = useState<string | null>(
    activeVersionId ?? null
  );
  const [selectedInterstitialId, setSelectedInterstitialId] = useState<
    string | null
  >(null);

  const [selectedNodeId, setSelectedNodeId] = useState<string>(
    nodes[0]?.id ?? 'act-pd-balance'
  );
  const [draggingNodeId, setDraggingNodeId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number }>({
    x: 0,
    y: 0,
  });
  const canvasRef = useRef<HTMLDivElement>(null);

  const selectedNode =
    nodes.find((n) => n.id === selectedNodeId) ?? nodes[0] ?? null;

  // Build Multiversal Local Group of 3D Timeline Planes (combining Epoch Archive + Favorited Anchors + Synthetic Parallel Continuums if only 1 epoch exists yet)
  const timelinePlanes = useMemo(() => {
    const map = new Map<string, ManifoldGameVersionLog>();
    for (const v of gameVersionArchive) {
      map.set(v.id, v);
    }
    for (const fav of favoritedManifolds) {
      if (!map.has(fav.versionLog.id)) {
        map.set(fav.versionLog.id, fav.versionLog);
      }
    }
    const list = Array.from(map.values()).slice(0, 7);
    if (list.length === 1) {
      // Provide 2 adjacent shadow continuums in the local group so inter-timeline boundary bleed is immediately visible & interactable
      const base = list[0];
      const shadowA: ManifoldGameVersionLog = {
        ...base,
        id: `${base.id}-continuum-alpha`,
        versionCode: 'CONT-α (Adjacent)',
        gameTitle: `${base.world.name} · Alpha`,
        wCoord: -0.48,
        world: {
          ...base.world,
          seed: base.world.seed + 108,
          name: `${base.world.name} α`,
        },
      };
      const shadowB: ManifoldGameVersionLog = {
        ...base,
        id: `${base.id}-continuum-omega`,
        versionCode: 'CONT-Ω (Horizon)',
        gameTitle: `${base.world.name} · Omega`,
        wCoord: 0.56,
        world: {
          ...base.world,
          seed: base.world.seed + 314,
          name: `${base.world.name} Ω`,
        },
      };
      return [base, shadowA, shadowB];
    }
    return list;
  }, [gameVersionArchive, favoritedManifolds]);

  // Compute In-Between Biocomplex Originalities where adjacent 3D Timeline Planes bleed their boundary conditions
  const interstitialOrigins = useMemo(() => {
    const origins: BiocomplexInterstitialOrigin[] = [];
    const actionSec = foreroomsTelemetry?.playerActionTimeSec ?? 18;
    for (let i = 0; i < timelinePlanes.length - 1; i++) {
      const verA = timelinePlanes[i];
      const verB = timelinePlanes[i + 1];
      origins.push(
        synthesizeBiocomplexInterstitialOrigin({
          versionA: verA,
          versionB: verB,
          novelEvents,
          playerActionTimeSec: actionSec,
          pairIndex: i,
        })
      );
    }
    if (timelinePlanes.length >= 3) {
      origins.push(
        synthesizeBiocomplexInterstitialOrigin({
          versionA: timelinePlanes[timelinePlanes.length - 1],
          versionB: timelinePlanes[0],
          novelEvents,
          playerActionTimeSec: actionSec,
          pairIndex: timelinePlanes.length,
        })
      );
    }
    return origins;
  }, [timelinePlanes, novelEvents, foreroomsTelemetry?.playerActionTimeSec]);

  const activeSelectedInterstitial =
    interstitialOrigins.find((o) => o.id === selectedInterstitialId) ??
    interstitialOrigins[0] ??
    null;

  const activeSelectedTimeline =
    timelinePlanes.find((t) => t.id === selectedTimelineId) ??
    timelinePlanes[0] ??
    null;

  // Position each 3D Timeline Plane in Higher-D Interdimensional Map coordinates
  const positionedPlanes = useMemo(() => {
    const count = timelinePlanes.length;
    const cx = 360;
    const cy = 205;
    return timelinePlanes.map((ver, idx) => {
      const angle = (idx / Math.max(1, count)) * Math.PI * 2 - Math.PI * 0.45;
      const radiusX = count <= 2 ? 155 : 195;
      const radiusY = count <= 2 ? 85 : 112;
      const x =
        idx === 0 && count > 3
          ? cx
          : cx + Math.cos(angle) * radiusX + ((ver.wCoord ?? 0) * 28);
      const y =
        idx === 0 && count > 3
          ? cy
          : cy + Math.sin(angle) * radiusY - ((ver.wCoord ?? 0) * 18);
      const planeEvents = novelEvents.filter(
        (e) =>
          e.timelineVersionId === ver.id || e.worldSeed === ver.world.seed
      );
      return {
        ver,
        idx,
        x,
        y,
        planeEvents,
      };
    });
  }, [timelinePlanes, novelEvents]);

  const omniversalPct = foreroomsTelemetry?.omniversalSubstratePct ?? 42;
  const isOmniversal = Boolean(foreroomsTelemetry?.isOmniversallyIdentified);

  const handlePointerDownNode = (e: React.PointerEvent, node: Node4D) => {
    e.stopPropagation();
    setSelectedNodeId(node.id);
    if (!canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    setDraggingNodeId(node.id);
    setDragOffset({
      x: e.clientX - rect.left - node.x,
      y: e.clientY - rect.top - node.y,
    });
  };

  const handlePointerMoveCanvas = (e: React.PointerEvent) => {
    if (!draggingNodeId || !canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const targetNode = nodes.find((n) => n.id === draggingNodeId);
    if (!targetNode) return;

    const newX = Math.max(
      12,
      Math.min(rect.width - 210, e.clientX - rect.left - dragOffset.x)
    );
    const newY = Math.max(
      12,
      Math.min(rect.height - 96, e.clientY - rect.top - dragOffset.y)
    );

    onUpdateNode({
      ...targetNode,
      x: Math.round(newX),
      y: Math.round(newY),
      anchorX: Math.round(newX),
      anchorY: Math.round(newY),
    });
  };

  const handlePointerUpCanvas = () => {
    setDraggingNodeId(null);
  };

  const handleSpawnCustom4DNode = () => {
    const id = `node-custom-${Date.now().toString().slice(-4)}`;
    const newNode: Node4D = {
      id,
      label: `Phase Attractor ${nodes.length + 1}`,
      category: 'gateway-4d',
      subtype: 'quantum-fork',
      x: 320 + ((nodes.length * 25) % 140),
      y: 140 + ((nodes.length * 40) % 220),
      zWeight: 1.25,
      wPhase: Number(wCoord.toFixed(2)),
      wSigma: 0.48,
      temporalFreq: 1.5,
      paramValue: 0.9,
      activation: 0.5,
      description:
        'Custom 4D possibility branching node synthesized at current W-coordinate.',
    };
    const sensorSource = nodes.find((n) => n.category === 'sensor-4d')?.id;
    const actuatorTarget = nodes.find(
      (n) => n.category === 'ragdoll-actuator'
    )?.id;
    onAddNode(newNode, sensorSource, actuatorTarget);
    setSelectedNodeId(id);
  };

  return (
    <div className="flex flex-col lg:flex-row gap-4 w-full h-full bg-slate-950/92 backdrop-blur-md border border-white/10 rounded-xl p-4 text-slate-100 overflow-hidden">
      {/* Left/Center Main Viewport */}
      <div className="flex-1 flex flex-col min-w-0 gap-3">
        {/* Top Control Bar: 3 Sub-Views */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-white/10">
          <div className="flex items-center gap-1 p-1 bg-slate-900 rounded-lg border border-white/10">
            <button
              onClick={() => setMatrixSubView('interdimensional-map')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                matrixSubView === 'interdimensional-map'
                  ? 'bg-cyan-400 text-slate-950 font-semibold'
                  : 'text-cyan-300 hover:text-white'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              Higher-D Interdimensional Map (3D Planes)
            </button>
            <button
              onClick={() => setMatrixSubView('forerooms')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                matrixSubView === 'forerooms'
                  ? 'bg-purple-500 text-slate-950 font-semibold'
                  : 'text-purple-300 hover:text-white'
              }`}
            >
              <Compass className="w-3.5 h-3.5" />
              Sheathed Core ({foreroomsTelemetry?.activeSpelling ?? '4RumEs'})
            </button>
            <button
              onClick={() => setMatrixSubView('nodes-4d')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                matrixSubView === 'nodes-4d'
                  ? 'bg-amber-500 text-slate-950 font-semibold'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <GitBranch className="w-3.5 h-3.5" />
              4D Node Graph
            </button>
          </div>

          {matrixSubView === 'nodes-4d' ? (
            <div className="flex items-center gap-1.5 bg-slate-900/90 p-1 rounded-lg border border-white/10">
              {NODE_4D_PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => onLoadPreset(preset)}
                  className="px-2.5 py-1 text-xs font-medium rounded-md text-slate-300 hover:text-white hover:bg-white/10 transition-colors whitespace-nowrap cursor-pointer"
                >
                  {preset.name.split(' ')[0]} {preset.name.split(' ')[1]}
                </button>
              ))}
              <button
                onClick={handleSpawnCustom4DNode}
                className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-md bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 transition-colors whitespace-nowrap cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                Add 4D Node
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-xs font-mono-tabular">
              <span className="px-2.5 py-1 rounded bg-cyan-500/15 border border-cyan-400/30 text-cyan-200">
                Biocomplexity: {foreroomsTelemetry?.biocomplexityIndex ?? 2.4}
              </span>
              <span
                className={`px-2.5 py-1 rounded border ${
                  isOmniversal
                    ? 'bg-amber-400/25 border-amber-300 text-amber-200 font-semibold'
                    : 'bg-purple-500/15 border-purple-400/30 text-purple-200'
                }`}
              >
                Omniversal Substrate: {omniversalPct}%
              </span>
            </div>
          )}
        </div>

        {/* 4th Dimension (W-Axis) Possibility Scrubber Bar */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center bg-slate-900/75 border border-white/10 rounded-lg px-3.5 py-2">
          <div className="md:col-span-4 flex items-center justify-between md:justify-start gap-2">
            <span className="text-xs font-medium text-slate-300">
              4D Phase (W):
            </span>
            <span className="font-mono-tabular text-xs font-semibold text-amber-400">
              {wCoord >= 0 ? `+${wCoord.toFixed(2)}` : wCoord.toFixed(2)}
            </span>
            <button
              onClick={onToggleAutoOscillateW}
              className={`ml-1 flex items-center gap-1 px-2 py-1 rounded text-xs font-medium transition-colors whitespace-nowrap cursor-pointer ${
                autoOscillateW
                  ? 'bg-amber-500 text-slate-950 font-semibold'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {autoOscillateW ? (
                <>
                  <Pause className="w-3 h-3" />4D Wave On
                </>
              ) : (
                <>
                  <Play className="w-3 h-3" />Oscillate W
                </>
              )}
            </button>
          </div>

          <div className="md:col-span-5 flex items-center gap-2.5">
            <span className="text-[11px] font-mono-tabular text-rose-400 whitespace-nowrap">
              -1.0 Below
            </span>
            <input
              type="range"
              min={-1.0}
              max={1.0}
              step={0.01}
              value={wCoord}
              onChange={(e) => onChangeWCoord(parseFloat(e.target.value))}
              className="w-full accent-amber-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
            />
            <span className="text-[11px] font-mono-tabular text-cyan-400 whitespace-nowrap">
              +1.0 Beyond
            </span>
          </div>

          <div className="md:col-span-3 flex items-center justify-end gap-2">
            <button
              onClick={onTriggerShockwave}
              className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 rounded-md transition-colors whitespace-nowrap cursor-pointer"
            >
              <Zap className="w-3.5 h-3.5" />
              Shockwave
            </button>
            <button
              onClick={onToggleGlobalRagdoll}
              className={`px-2.5 py-1 text-xs font-medium rounded-md border transition-colors whitespace-nowrap cursor-pointer ${
                globalRagdollActive
                  ? 'bg-rose-600 text-white border-rose-400'
                  : 'bg-slate-800 text-slate-300 border-white/10 hover:bg-slate-700'
              }`}
            >
              {globalRagdollActive ? 'Restore Torque' : 'Drop Ragdolls'}
            </button>
          </div>
        </div>

        {/* SUB-VIEW 1: ARTISTIC HIGHER-D INTERDIMENSIONAL CONTINUUM MAP */}
        {matrixSubView === 'interdimensional-map' ? (
          <div className="relative flex-1 min-h-[360px] rounded-xl bg-[#050811] border border-cyan-500/25 overflow-hidden flex flex-col">
            {/* Top Map Controls Overlay */}
            <div className="z-10 flex flex-wrap items-center justify-between gap-2 px-3.5 py-2 bg-slate-950/80 border-b border-white/10 text-[11px]">
              <div className="flex items-center gap-2 text-slate-300">
                <span className="w-2 h-2 rounded-full bg-cyan-400" />
                <span className="font-semibold text-white">
                  Higher-D Top-Down Projection of 3D Timeline Planes
                </span>
                <span className="hidden sm:inline text-slate-400">
                  · Drag to pan · Click any 3D Plane or In-Between Ω-Origin
                </span>
              </div>
              <div className="flex items-center gap-3 font-mono-tabular">
                <label className="flex items-center gap-1.5 text-slate-300">
                  <span>4D Tilt {projectionTiltDeg}°</span>
                  <input
                    type="range"
                    min={14}
                    max={56}
                    value={projectionTiltDeg}
                    onChange={(e) =>
                      setProjectionTiltDeg(Number(e.target.value))
                    }
                    className="w-16 accent-cyan-400 h-1 bg-slate-800 rounded cursor-pointer"
                  />
                </label>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() =>
                      setMapZoom((z) => Math.max(0.65, Number((z - 0.15).toFixed(2))))
                    }
                    className="px-1.5 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 cursor-pointer"
                  >
                    -
                  </button>
                  <span className="text-cyan-300">{Math.round(mapZoom * 100)}%</span>
                  <button
                    onClick={() =>
                      setMapZoom((z) => Math.min(1.6, Number((z + 0.15).toFixed(2))))
                    }
                    className="px-1.5 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 cursor-pointer"
                  >
                    +
                  </button>
                  <button
                    onClick={() => {
                      setMapPan({ x: 0, y: 0 });
                      setMapZoom(1.0);
                    }}
                    className="ml-1 px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer"
                  >
                    Reset
                  </button>
                </div>
              </div>
            </div>

            {/* Interactive SVG Higher-D Interdimensional Plane Canvas */}
            <div
              onPointerDown={(e) => {
                setIsPanningMap(true);
                panStartRef.current = {
                  x: e.clientX - mapPan.x,
                  y: e.clientY - mapPan.y,
                };
              }}
              onPointerMove={(e) => {
                if (!isPanningMap) return;
                setMapPan({
                  x: e.clientX - panStartRef.current.x,
                  y: e.clientY - panStartRef.current.y,
                });
              }}
              onPointerUp={() => setIsPanningMap(false)}
              onPointerLeave={() => setIsPanningMap(false)}
              className="relative flex-1 w-full h-full cursor-grab active:cursor-grabbing select-none overflow-hidden"
            >
              <svg
                viewBox="0 0 720 410"
                className="w-full h-full"
                style={{
                  transform: `translate(${mapPan.x}px, ${mapPan.y}px) scale(${mapZoom})`,
                  transformOrigin: 'center center',
                }}
              >
                <defs>
                  <radialGradient id="omniversalGlow" cx="50%" cy="50%" r="50%">
                    <stop
                      offset="0%"
                      stopColor={isOmniversal ? '#f59e0b' : '#38bdf8'}
                      stopOpacity={0.22 + (omniversalPct / 100) * 0.25}
                    />
                    <stop
                      offset="65%"
                      stopColor="#a855f7"
                      stopOpacity={0.08 + (omniversalPct / 100) * 0.12}
                    />
                    <stop offset="100%" stopColor="#050811" stopOpacity="0" />
                  </radialGradient>
                </defs>

                {/* 1. OMNIVERSAL SUBSTRATE FOUNDATION FIELD (Underlies the entire Multiversal Local Group) */}
                <ellipse
                  cx={360}
                  cy={210}
                  rx={310}
                  ry={165}
                  fill="url(#omniversalGlow)"
                  stroke={isOmniversal ? '#fbbf24' : '#38bdf8'}
                  strokeOpacity={0.18 + (omniversalPct / 100) * 0.45}
                  strokeDasharray={isOmniversal ? undefined : '6 6'}
                  strokeWidth={isOmniversal ? 2 : 1.2}
                />
                <ellipse
                  cx={360}
                  cy={210}
                  rx={225}
                  ry={118}
                  fill="none"
                  stroke="#a855f7"
                  strokeOpacity={0.16 + (omniversalPct / 100) * 0.3}
                  strokeDasharray="3 5"
                />
                <text
                  x={360}
                  y={392}
                  textAnchor="middle"
                  fill={isOmniversal ? '#fde68a' : '#94a3b8'}
                  fontSize="10"
                  fontFamily="monospace"
                >
                  {isOmniversal
                    ? '★ MULTIVERSAL LOCAL GROUP: OMNIVERSALLY SUBSTRATE IDENTIFIED (100% UNIFIED FOUNDATION)'
                    : `MULTIVERSAL LOCAL GROUP SUBSTRATE COHERENCE: ${omniversalPct}% · ACTION TIME τ = ${
                        foreroomsTelemetry?.playerActionTimeSec ?? 12.4
                      }s`}
                </text>

                {/* 2. BOUNDARY CONDITION BLEED BRIDGES & IN-BETWEEN BIOCOMPLEX ORIGINALITIES */}
                {interstitialOrigins.map((origin, idx) => {
                  const pA =
                    positionedPlanes.find(
                      (p) => p.ver.id === origin.parentVersionIdA
                    ) ?? positionedPlanes[idx % positionedPlanes.length];
                  const pB =
                    positionedPlanes.find(
                      (p) => p.ver.id === origin.parentVersionIdB
                    ) ?? positionedPlanes[(idx + 1) % positionedPlanes.length];
                  if (!pA || !pB) return null;

                  const midX = (pA.x + pB.x) * 0.5;
                  const midY = (pA.y + pB.y) * 0.5 - 12;
                  const bleedWidth = 1.5 + origin.boundaryBleedDifferential * 5;
                  const isSelOrigin =
                    selectedInterstitialId === origin.id;

                  return (
                    <g key={origin.id}>
                      {/* Boundary Bleed Filaments weaving the two 3D planes together */}
                      <path
                        d={`M ${pA.x} ${pA.y} Q ${midX} ${midY - 18} ${pB.x} ${pB.y}`}
                        fill="none"
                        stroke="#a855f7"
                        strokeOpacity={0.35 + origin.boundaryBleedDifferential * 0.45}
                        strokeWidth={bleedWidth}
                        strokeDasharray="5 3"
                      />
                      <path
                        d={`M ${pA.x} ${pA.y} Q ${midX} ${midY + 18} ${pB.x} ${pB.y}`}
                        fill="none"
                        stroke="#22d3ee"
                        strokeOpacity={0.3 + origin.boundaryBleedDifferential * 0.45}
                        strokeWidth={bleedWidth * 0.7}
                      />

                      {/* In-Between Biocomplex Originality Node (Formed mathematically between the two 3D planes!) */}
                      <g
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedInterstitialId(origin.id);
                          setSelectedTimelineId(null);
                        }}
                        className="cursor-pointer"
                      >
                        <circle
                          cx={midX}
                          cy={midY}
                          r={isSelOrigin ? 19 : 15}
                          fill="#0f172a"
                          stroke={isSelOrigin ? '#fbbf24' : '#c084fc'}
                          strokeWidth={isSelOrigin ? 2.5 : 1.5}
                        />
                        <polygon
                          points={`${midX},${midY - 8} ${midX + 8},${midY} ${midX},${midY + 8} ${midX - 8},${midY}`}
                          fill={isSelOrigin ? '#fbbf24' : '#38bdf8'}
                          fillOpacity={0.85}
                        />
                        <text
                          x={midX}
                          y={midY + 28}
                          textAnchor="middle"
                          fill="#e2e8f0"
                          fontSize="9"
                          fontFamily="monospace"
                        >
                          {origin.title} (Δ∂={origin.boundaryBleedDifferential})
                        </text>
                      </g>
                    </g>
                  );
                })}

                {/* 3. PROJECTED 3D WORLDSPACE PLANES (Viewed Top-Down from Higher-D Perspective) */}
                {positionedPlanes.map(({ ver, x, y, planeEvents }) => {
                  const isCurrentActive = ver.id === activeVersionId;
                  const isSelectedPlane =
                    selectedTimelineId === ver.id && !selectedInterstitialId;
                  const w = 132;
                  const h = Math.round(
                    84 * Math.cos((projectionTiltDeg * Math.PI) / 180)
                  );
                  const skew = Math.round(
                    26 * Math.sin((projectionTiltDeg * Math.PI) / 180)
                  );

                  // Isometric 3D Plane Parallelogram vertices centered at (x, y)
                  const p1 = `${x - w * 0.5 + skew},${y - h * 0.5}`;
                  const p2 = `${x + w * 0.5 + skew},${y - h * 0.5}`;
                  const p3 = `${x + w * 0.5 - skew},${y + h * 0.5}`;
                  const p4 = `${x - w * 0.5 - skew},${y + h * 0.5}`;

                  // Sub-foundation depth plane (showing the 3D world's foundation coupling to the Omniversal Substrate)
                  const depth = 11;
                  const f3 = `${x + w * 0.5 - skew},${y + h * 0.5 + depth}`;
                  const f4 = `${x - w * 0.5 - skew},${y + h * 0.5 + depth}`;

                  const accent = ver.world.palette.accentColor || '#38bdf8';

                  return (
                    <g
                      key={ver.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedTimelineId(ver.id);
                        setSelectedInterstitialId(null);
                      }}
                      className="cursor-pointer"
                    >
                      {/* Vertical Substrate Anchors linking the 3D Plane's foundation to the Omniversal Substrate */}
                      <line
                        x1={x}
                        y1={y + h * 0.5}
                        x2={360}
                        y2={210}
                        stroke={isOmniversal ? '#fbbf24' : accent}
                        strokeOpacity={0.22 + (omniversalPct / 100) * 0.35}
                        strokeDasharray="2 4"
                      />

                      {/* 3D Foundation Slab thickness */}
                      <polygon
                        points={`${p4} ${p3} ${f3} ${f4}`}
                        fill="#0f172a"
                        stroke={isOmniversal ? '#fbbf24' : accent}
                        strokeOpacity={0.55}
                        strokeWidth={1}
                      />

                      {/* Main Projected 3D Worldspace Plane */}
                      <polygon
                        points={`${p1} ${p2} ${p3} ${p4}`}
                        fill="#090d16"
                        fillOpacity={0.9}
                        stroke={
                          isSelectedPlane
                            ? '#fbbf24'
                            : isCurrentActive
                            ? '#22d3ee'
                            : accent
                        }
                        strokeWidth={isSelectedPlane || isCurrentActive ? 2.4 : 1.3}
                      />

                      {/* Internal 3D Topographic Grid & Elevation Contours inside the 3D Plane */}
                      <line
                        x1={x - w * 0.25}
                        y1={y - h * 0.5}
                        x2={x - w * 0.25 - skew * 0.8}
                        y2={y + h * 0.5}
                        stroke={accent}
                        strokeOpacity={0.22}
                      />
                      <line
                        x1={x + w * 0.25}
                        y1={y - h * 0.5}
                        x2={x + w * 0.25 - skew * 0.8}
                        y2={y + h * 0.5}
                        stroke={accent}
                        strokeOpacity={0.22}
                      />
                      <path
                        d={`M ${x - w * 0.42} ${y} Q ${x} ${
                          y - 14 - (ver.world.seed % 10)
                        } ${x + w * 0.42} ${y}`}
                        fill="none"
                        stroke={accent}
                        strokeOpacity={0.65}
                        strokeWidth={1.3}
                      />

                      {/* Encoded Novel Continuum Events plotted directly on this 3D Plane */}
                      {planeEvents.slice(0, 6).map((ev, eIdx) => {
                        const ex =
                          x +
                          ((((ev.position[0] * 7 + eIdx * 19) % 70) - 35) *
                            0.9);
                        const ey =
                          y +
                          ((((ev.position[2] * 7 + eIdx * 13) % 36) - 18) *
                            0.8);
                        return (
                          <circle
                            key={ev.id}
                            cx={ex}
                            cy={ey}
                            r={3.2}
                            fill="#fbbf24"
                            stroke="#ffffff"
                            strokeWidth={0.8}
                          >
                            <title>{`${ev.label} (τ=${ev.actionTimeSec.toFixed(
                              1
                            )}s)`}</title>
                          </circle>
                        );
                      })}

                      {/* Plane Header Label */}
                      <text
                        x={x}
                        y={y - h * 0.5 - 7}
                        textAnchor="middle"
                        fill={isCurrentActive ? '#22d3ee' : '#f8fafc'}
                        fontSize="10"
                        fontWeight="bold"
                        fontFamily="monospace"
                      >
                        {ver.versionCode} · #{ver.world.seed}
                      </text>
                      <text
                        x={x}
                        y={y + h * 0.5 + 22}
                        textAnchor="middle"
                        fill="#94a3b8"
                        fontSize="9"
                        fontFamily="monospace"
                      >
                        W={ver.wCoord >= 0 ? `+${ver.wCoord}` : ver.wCoord} ·{' '}
                        {planeEvents.length} Events
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>
          </div>
        ) : matrixSubView === 'forerooms' ? (
          /* SUB-VIEW 2: SHEATHED CONTINUUM CORE & 4 ONTOLOGICAL DISPOSITIONS */
          <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-3 overflow-y-auto pr-1">
            <div className="lg:col-span-6 flex flex-col justify-between gap-3 bg-slate-900/70 border border-white/10 rounded-lg p-3.5">
              <div className="space-y-2.5">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <span className="text-[11px] font-mono-tabular text-purple-300 uppercase tracking-wider">
                      Sheathed Inside Player Vessel (8-Cell Continuum Core)
                    </span>
                    <h3 className="text-base font-bold font-display text-white">
                      {foreroomsTelemetry?.activeSpelling ?? '4RumEs'} — The Forerooms
                    </h3>
                  </div>
                  <span className="px-2 py-1 rounded bg-slate-950 border border-white/10 text-[11px] font-mono-tabular text-amber-300">
                    Action τ = {foreroomsTelemetry?.playerActionTimeSec ?? 14.2}s
                  </span>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">
                  {foreroomsTelemetry?.spellingMeaning ??
                    'Sheathed inside the player model’s translucent torso cavity, the 4D tesseract encodes player action time and cross-timeline novel events without external visual clutter.'}
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 pt-1">
                  {FOREROOMS_SPELLING_VARIANTS.map((v, idx) => {
                    const isCurrentSpelling =
                      (foreroomsTelemetry?.activeSpelling ?? '4RumEs') ===
                      v.spelling;
                    return (
                      <button
                        key={v.spelling}
                        onClick={() =>
                          onChangeWCoord(
                            Number(((idx / 3.5 - 1) * 0.85).toFixed(2))
                          )
                        }
                        className={`p-2 rounded-lg border text-left transition-colors cursor-pointer ${
                          isCurrentSpelling
                            ? 'bg-purple-500/25 border-purple-400 text-white'
                            : 'bg-slate-950/80 border-white/10 text-slate-400 hover:text-white'
                        }`}
                        title={v.ideologicalMeaning}
                      >
                        <div className="text-xs font-bold font-display text-amber-300">
                          {v.spelling}
                        </div>
                        <div className="text-[10px] font-mono-tabular truncate text-slate-400">
                          {v.dominantCellName.split(' ')[0]}{' '}
                          {v.dominantCellName.split(' ')[1]}
                        </div>
                      </button>
                    );
                  })}
                </div>

                <div className="p-3 rounded-lg bg-slate-950/90 border border-amber-400/30 space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-amber-300 font-display">
                      Sheathed Deeper-Than-Inside Locus (Ω)
                    </span>
                    <span className="font-mono-tabular text-[11px] text-cyan-300">
                      {foreroomsTelemetry?.spawnedArtformsCount ?? 3} L-System Artforms
                      · {foreroomsTelemetry?.activeLSystemTotalBranches ?? 96} Branches
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center justify-between gap-2 text-[10px] font-mono-tabular">
                    <span className="text-emerald-300">
                      {foreroomsTelemetry?.activeVitalityStateLabel ??
                        'Homeostatic Arbor (Depth 3 · Var ±18.5°)'}
                    </span>
                    <span className="text-amber-300">
                      W-Influence η_W ={' '}
                      {(
                        foreroomsTelemetry?.activeWCoordinateInfluenceFactor ??
                        0
                      ).toFixed(2)}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    Scrubbing the W-axis dynamically modulates the{' '}
                    <strong className="text-slate-100">
                      w-coordinate influence factor
                    </strong>{' '}
                    (η_W), driving fractal recursion depth (1–5) and branch-angle
                    variance so Worldspace Procedural Artforms bloom or wither
                    based on their dimensional position.
                  </p>
                </div>
              </div>

              {onCondense5DMatterToFoundation && (
                <button
                  onClick={onCondense5DMatterToFoundation}
                  className="w-full py-2 px-3 bg-purple-500 hover:bg-purple-400 text-slate-950 font-semibold text-xs rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  Catalyze Cross-Timeline Karmic Event & Condense 5D Matter
                </button>
              )}
            </div>

            <div className="lg:col-span-6 flex flex-col justify-between gap-2.5 bg-slate-900/70 border border-white/10 rounded-lg p-3.5">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <span className="text-[11px] font-mono-tabular text-cyan-300 uppercase tracking-wider">
                    4 Ontological Continuum Dispositions
                  </span>
                  <h4 className="text-xs font-bold text-white font-display">
                    Beyond · Below · Inside · Deeper-Than-Inside
                  </h4>
                </div>
                {onChangeForeroomsDisposition && (
                  <button
                    onClick={() => onChangeForeroomsDisposition(null)}
                    className={`px-2 py-1 rounded text-[11px] font-mono-tabular border transition-colors cursor-pointer ${
                      foreroomsDispositionOverride === null
                        ? 'bg-cyan-400 text-slate-950 border-cyan-300 font-semibold'
                        : 'bg-slate-950 text-slate-300 border-white/10 hover:text-white'
                    }`}
                  >
                    Auto Perspective
                  </button>
                )}
              </div>

              <div className="space-y-2 flex-1 overflow-y-auto pr-1">
                {ALL_FOREROOMS_DISPOSITIONS.map((dispId) => {
                  const meta = FOREROOMS_DISPOSITION_CATALOG[dispId];
                  const isActive =
                    (foreroomsDispositionOverride ??
                      foreroomsTelemetry?.activeDisposition ??
                      'inside-present-continuum') === dispId;

                  return (
                    <button
                      key={dispId}
                      onClick={() =>
                        onChangeForeroomsDisposition &&
                        onChangeForeroomsDisposition(dispId)
                      }
                      className={`w-full text-left p-2.5 rounded-lg border transition-colors cursor-pointer space-y-1 ${
                        isActive
                          ? 'bg-amber-500/15 border-amber-400 text-white'
                          : 'bg-slate-950/80 border-white/10 text-slate-300 hover:border-white/25'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-bold font-display text-white">
                          {meta.title}
                        </span>
                        <span className="text-[10px] font-mono-tabular text-amber-300 shrink-0">
                          {meta.spatialEquation}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-300 leading-snug">
                        {meta.ontologicalThesis}
                      </p>
                      <div className="text-[10px] font-mono-tabular text-cyan-300">
                        Effect: {meta.matterTranslationEffect}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        ) : (
          /* SUB-VIEW 3: INTERACTIVE 4D SPATIOTEMPORAL NODE GRAPH */
          <div
            ref={canvasRef}
            onPointerMove={handlePointerMoveCanvas}
            onPointerUp={handlePointerUpCanvas}
            onPointerLeave={handlePointerUpCanvas}
            className="relative flex-1 min-h-[340px] rounded-lg bg-[#070a10] border border-white/10 overflow-hidden select-none"
            style={{
              backgroundImage:
                'radial-gradient(rgba(148, 163, 184, 0.12) 1px, transparent 1px)',
              backgroundSize: '24px 24px',
            }}
          >
            <div
              className="absolute top-0 bottom-0 w-0.5 bg-amber-400/20 pointer-events-none transition-transform duration-75"
              style={{
                left: `${((wCoord + 1) / 2) * 100}%`,
              }}
            />

            <svg className="absolute inset-0 w-full h-full pointer-events-none">
              {edges.map((edge) => {
                const fromNode = nodes.find((n) => n.id === edge.from);
                const toNode = nodes.find((n) => n.id === edge.to);
                if (!fromNode || !toNode) return null;

                const x1 = fromNode.x + 192;
                const y1 = fromNode.y + 38;
                const x2 = toNode.x;
                const y2 = toNode.y + 38;
                const dx = Math.max(40, Math.abs(x2 - x1) * 0.5);
                const pathData = `M ${x1} ${y1} C ${x1 + dx} ${y1}, ${x2 - dx} ${y2}, ${x2} ${y2}`;

                const signalStrength =
                  fromNode.activation * Math.abs(edge.weight);
                const isInhibitory = edge.weight < 0;
                const strokeColor = isInhibitory
                  ? 'rgba(244, 63, 94, 0.65)'
                  : signalStrength > 0.45
                  ? 'rgba(245, 158, 11, 0.85)'
                  : 'rgba(148, 163, 184, 0.28)';

                return (
                  <g key={edge.id}>
                    <path
                      d={pathData}
                      fill="none"
                      stroke={strokeColor}
                      strokeWidth={1.5 + signalStrength * 2.2}
                      strokeDasharray={isInhibitory ? '5,4' : undefined}
                    />
                  </g>
                );
              })}
            </svg>

            {nodes.map((node) => {
              const style = CATEGORY_STYLES[node.category];
              const isSelected = node.id === selectedNodeId;
              const actPct = Math.round(node.activation * 100);

              return (
                <div
                  key={node.id}
                  onPointerDown={(e) => handlePointerDownNode(e, node)}
                  style={{
                    transform: `translate3d(${node.x}px, ${node.y}px, 0)`,
                  }}
                  className={`absolute top-0 left-0 w-48 rounded-lg bg-slate-900/95 border p-2.5 cursor-grab active:cursor-grabbing transition-shadow ${
                    isSelected
                      ? 'border-amber-400 shadow-lg shadow-amber-500/10'
                      : style.border
                  }`}
                >
                  <div className="flex items-center justify-between gap-1 text-[11px] text-slate-400 mb-1">
                    <span className={`font-medium truncate ${style.badgeText}`}>
                      {style.label}
                    </span>
                    <span className="font-mono-tabular text-slate-300">
                      W:{node.wPhase >= 0 ? `+${node.wPhase}` : node.wPhase}
                    </span>
                  </div>

                  <div className="text-xs font-semibold text-white truncate mb-2">
                    {node.label}
                  </div>

                  <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden mb-1">
                    <div
                      className="h-full transition-all duration-75"
                      style={{
                        width: `${Math.min(100, actPct)}%`,
                        backgroundColor: style.accent,
                      }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[10px] font-mono-tabular text-slate-400">
                    <span>Act: {actPct}%</span>
                    <span>·</span>
                    <span>Z:{node.zWeight.toFixed(1)}</span>
                    <span>·</span>
                    <span>
                      {globalRagdollActive
                        ? `Stretch ${Math.round((node.elasticStretch ?? 0) * 100)}%`
                        : `${node.temporalFreq}Hz`}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Right Column: Context-Aware Inspector (Higher-D Plane / In-Between Ω-Originality / 4D Node) */}
      <div className="w-full lg:w-80 shrink-0 flex flex-col justify-between gap-4 bg-slate-900/75 border border-white/10 rounded-lg p-4 overflow-y-auto">
        {matrixSubView === 'interdimensional-map' &&
        selectedInterstitialId &&
        activeSelectedInterstitial ? (
          /* IN-BETWEEN BIOCOMPLEX ORIGINALITY INSPECTOR */
          <div className="space-y-3">
            <div className="pb-2.5 border-b border-white/10">
              <div className="text-[11px] font-mono-tabular text-purple-300 uppercase">
                In-Between Biocomplex Originality
              </div>
              <h3 className="text-sm font-bold text-white font-display">
                {activeSelectedInterstitial.title} · Seed #
                {activeSelectedInterstitial.interstitialSeed}
              </h3>
              <div className="text-[11px] font-mono-tabular text-amber-300 mt-0.5">
                Boundary Bleed Δ∂ ={' '}
                {activeSelectedInterstitial.boundaryBleedDifferential} · W ={' '}
                {activeSelectedInterstitial.wMidpoint}
              </div>
            </div>

            <div className="p-2.5 rounded-lg bg-slate-950/90 border border-purple-400/30 space-y-1">
              <div className="text-xs font-semibold text-purple-200">
                {activeSelectedInterstitial.karmicEventName}
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                {activeSelectedInterstitial.karmicMechanicDescription}
              </p>
            </div>

            <div className="p-2.5 rounded-lg bg-slate-950/90 border border-cyan-400/30 space-y-1.5">
              <div className="text-[10px] font-mono-tabular text-cyan-300 uppercase">
                Emergent 4D L-System Worldspace Artform
              </div>
              <div className="text-xs font-bold text-white">
                {activeSelectedInterstitial.emergentArtform.title}
              </div>
              <p className="text-[11px] text-slate-400">
                {activeSelectedInterstitial.emergentArtform.karmicOriginSummary}
              </p>
              {activeSelectedInterstitial.emergentArtform.lSystemGrammar && (
                <div className="pt-1.5 border-t border-white/10 space-y-1 text-[10px] font-mono-tabular text-slate-300">
                  <div className="text-amber-300 truncate">
                    ω: {activeSelectedInterstitial.emergentArtform.lSystemGrammar.axiom}
                  </div>
                  <div className="text-cyan-200 truncate">
                    P₁: {activeSelectedInterstitial.emergentArtform.lSystemGrammar.primaryProductionRule}
                  </div>
                  <div className="flex items-center justify-between text-slate-400">
                    <span>
                      Div: {activeSelectedInterstitial.emergentArtform.lSystemGrammar.divergenceAngleDeg}°
                    </span>
                    <span>
                      φ-Torsion: {activeSelectedInterstitial.emergentArtform.lSystemGrammar.goldenTorsionRatio}
                    </span>
                  </div>
                </div>
              )}
            </div>

            <div className="p-2.5 rounded-lg bg-slate-950/90 border border-emerald-400/30 space-y-1">
              <div className="text-[10px] font-mono-tabular text-emerald-300 uppercase">
                Emergent Biocomplex Organism
              </div>
              <div className="text-xs font-bold text-white">
                {activeSelectedInterstitial.emergentEntityBlueprint.name}
              </div>
              <div className="text-[11px] font-mono-tabular text-slate-300">
                Morphology:{' '}
                {activeSelectedInterstitial.emergentEntityBlueprint.morphology}{' '}
                · Stiffness:{' '}
                {Math.round(
                  activeSelectedInterstitial.emergentEntityBlueprint
                    .baseStiffness * 100
                )}
                %
              </div>
            </div>

            <div className="space-y-2 pt-1">
              {onManifestInterstitialInWorld && (
                <button
                  onClick={() =>
                    onManifestInterstitialInWorld(activeSelectedInterstitial)
                  }
                  className="w-full py-2 px-3 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 font-semibold text-xs transition-colors cursor-pointer"
                >
                  Manifest 3D Artform & Biocomplex Entity in World
                </button>
              )}
              {onJumpToInterstitialOrigin && (
                <button
                  onClick={() =>
                    onJumpToInterstitialOrigin(activeSelectedInterstitial)
                  }
                  className="w-full py-2 px-3 rounded-lg bg-purple-500/25 hover:bg-purple-500/35 text-purple-200 border border-purple-400/40 font-semibold text-xs transition-colors cursor-pointer"
                >
                  Enter In-Between Timeline (#
                  {activeSelectedInterstitial.interstitialSeed})
                </button>
              )}
            </div>
          </div>
        ) : matrixSubView === 'interdimensional-map' &&
          activeSelectedTimeline ? (
          /* SELECTED 3D TIMELINE PLANE INSPECTOR */
          <div className="space-y-3">
            <div className="pb-2.5 border-b border-white/10">
              <div className="text-[11px] font-mono-tabular text-cyan-300 uppercase">
                Projected 3D Worldspace Plane
              </div>
              <h3 className="text-sm font-bold text-white font-display">
                {activeSelectedTimeline.gameTitle}
              </h3>
              <div className="text-[11px] font-mono-tabular text-amber-400 mt-0.5">
                {activeSelectedTimeline.versionCode} · Seed #
                {activeSelectedTimeline.world.seed}
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              {activeSelectedTimeline.meaningAndLore}
            </p>

            <div className="space-y-1.5">
              <div className="text-[11px] font-mono-tabular text-slate-400 uppercase">
                Encoded Continuum Events ({novelEvents.length})
              </div>
              <div className="max-h-36 overflow-y-auto space-y-1 pr-1">
                {novelEvents.slice(0, 6).map((ev) => (
                  <div
                    key={ev.id}
                    className="p-2 rounded bg-slate-950/90 border border-white/10 text-[11px] flex items-center justify-between gap-2"
                  >
                    <span className="text-slate-200 truncate">{ev.label}</span>
                    <span className="font-mono-tabular text-amber-300 shrink-0">
                      τ={ev.actionTimeSec.toFixed(0)}s
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2 pt-1">
              {onSelectGameVersion &&
                activeSelectedTimeline.id !== activeVersionId &&
                !activeSelectedTimeline.id.includes('-continuum-') && (
                  <button
                    onClick={() => onSelectGameVersion(activeSelectedTimeline)}
                    className="w-full py-2 px-3 rounded-lg bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-semibold text-xs transition-colors cursor-pointer"
                  >
                    Project Into This 3D Worldspace Plane
                  </button>
                )}
              {interstitialOrigins[0] && onManifestInterstitialInWorld && (
                <button
                  onClick={() =>
                    onManifestInterstitialInWorld(interstitialOrigins[0])
                  }
                  className="w-full py-2 px-3 rounded-lg bg-purple-500/25 hover:bg-purple-500/35 text-purple-200 border border-purple-400/40 font-semibold text-xs transition-colors cursor-pointer"
                >
                  Synthesize Cross-Timeline Karmic Artform & Entity
                </button>
              )}
            </div>
          </div>
        ) : selectedNode ? (
          <div className="space-y-3.5">
            <div className="flex items-start justify-between gap-2 pb-2.5 border-b border-white/10">
              <div>
                <div className="text-xs text-amber-400 font-medium">
                  {CATEGORY_STYLES[selectedNode.category].label}
                </div>
                <h3 className="text-sm font-semibold text-white font-display">
                  {selectedNode.label}
                </h3>
              </div>
              {nodes.length > 4 && (
                <button
                  onClick={() => onDeleteNode(selectedNode.id)}
                  className="p-1.5 text-slate-400 hover:text-rose-400 rounded-md hover:bg-white/5 transition-colors"
                  title="Delete Node"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              {selectedNode.description}
            </p>

            <div className="space-y-3 pt-1">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-300">
                    4D Phase Center (W-Resonance)
                  </span>
                  <span className="font-mono-tabular text-amber-400">
                    {selectedNode.wPhase.toFixed(2)}
                  </span>
                </div>
                <input
                  type="range"
                  min={-1.0}
                  max={1.0}
                  step={0.02}
                  value={selectedNode.wPhase}
                  onChange={(e) =>
                    onUpdateNode({
                      ...selectedNode,
                      wPhase: parseFloat(e.target.value),
                    })
                  }
                  className="w-full accent-amber-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-300">
                    W-Bandwidth Aperture (σ)
                  </span>
                  <span className="font-mono-tabular text-slate-200">
                    {selectedNode.wSigma.toFixed(2)}
                  </span>
                </div>
                <input
                  type="range"
                  min={0.15}
                  max={1.2}
                  step={0.02}
                  value={selectedNode.wSigma}
                  onChange={(e) =>
                    onUpdateNode({
                      ...selectedNode,
                      wSigma: parseFloat(e.target.value),
                    })
                  }
                  className="w-full accent-cyan-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-300">
                    Z-Dimension Synaptic Gain
                  </span>
                  <span className="font-mono-tabular text-slate-200">
                    {selectedNode.zWeight.toFixed(2)}x
                  </span>
                </div>
                <input
                  type="range"
                  min={0.2}
                  max={2.0}
                  step={0.05}
                  value={selectedNode.zWeight}
                  onChange={(e) =>
                    onUpdateNode({
                      ...selectedNode,
                      zWeight: parseFloat(e.target.value),
                    })
                  }
                  className="w-full accent-emerald-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                />
              </div>
            </div>
          </div>
        ) : null}

        {/* Synthesized 4D Output State Summary */}
        <div className="pt-3 border-t border-white/10 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400 font-medium">
              Real-Time Continuum Output
            </span>
            <span className="font-mono-tabular text-amber-400 font-semibold">
              {evaluationOutput.steeringMode}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2 pt-1 text-xs font-mono-tabular">
            <div className="bg-slate-950/80 rounded p-2 border border-white/5">
              <div className="text-[10px] text-slate-400">P-D Stiffness</div>
              <div className="text-sm font-semibold text-emerald-400">
                {(evaluationOutput.muscleStiffness * 100).toFixed(0)}%
              </div>
            </div>
            <div className="bg-slate-950/80 rounded p-2 border border-white/5">
              <div className="text-[10px] text-slate-400">Elastic Sway</div>
              <div className="text-sm font-semibold text-cyan-300">
                {Math.round(
                  (evaluationOutput.elasticDeformationRatio ?? 0.15) * 100
                )}
                %
              </div>
            </div>
            <div className="bg-slate-950/80 rounded p-2 border border-white/5">
              <div className="text-[10px] text-slate-400">Omniversal Sub.</div>
              <div className="text-sm font-semibold text-amber-400">
                {omniversalPct}%
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
