import React, { useState } from 'react';
import {
  DamageGoreModality,
  DimensionalGoreGenre,
  EntityBlueprint,
  EntityRuntimeTelemetry,
  EvolutionaryLineageRecord,
  FrontierComplexSite,
  ManifoldWorldSpec,
  WorldCaveNestComplex,
  WorldFertilizedFloraPatch,
} from '../types/manifold';
import {
  ALL_DIMENSIONAL_GORE_GENRES,
  DIMENSIONAL_GORE_GENRE_CATALOG,
  resolveDimensionalGoreGenre,
} from '../utils/evolutionaryEcologyEngine';
import {
  Dna,
  Droplets,
  Compass,
  Mountain,
  Plus,
  Sparkles,
  Zap,
  Activity,
} from 'lucide-react';

interface EvolutionaryModMenuModalProps {
  currentWorld: ManifoldWorldSpec;
  entityTelemetry: EntityRuntimeTelemetry[];
  lineageArchive: EvolutionaryLineageRecord[];
  frontierComplexes: FrontierComplexSite[];
  caveNestComplexes: WorldCaveNestComplex[];
  fertilizedFloraPatches: WorldFertilizedFloraPatch[];
  goreGenreOverride: DimensionalGoreGenre | null;
  onChangeGoreGenreOverride: (genre: DimensionalGoreGenre | null) => void;
  evolutionSpeedMultiplier: number;
  onChangeEvolutionSpeedMultiplier: (mult: number) => void;
  globalRagdollActive: boolean;
  onToggleGlobalRagdoll: () => void;
  onSpawnEntityFromBlueprint: (blueprint: EntityBlueprint, count?: number) => void;
  onForceSpawnFrontierComplex: (kind: FrontierComplexSite['kind']) => void;
  onUpgradeTechHusbandryAll: () => void;
  onTriggerOrganizedPredatorRaid: () => void;
  onForceSpawnCaveNest: () => void;
  onForceDefecationFloraBloom: () => void;
  onTriggerComplexGoreSynergy: (modality: DamageGoreModality) => void;
}

export const EvolutionaryModMenuModal: React.FC<
  EvolutionaryModMenuModalProps
> = ({
  currentWorld,
  entityTelemetry,
  lineageArchive,
  frontierComplexes,
  caveNestComplexes,
  fertilizedFloraPatches,
  goreGenreOverride,
  onChangeGoreGenreOverride,
  evolutionSpeedMultiplier,
  onChangeEvolutionSpeedMultiplier,
  globalRagdollActive,
  onToggleGlobalRagdoll,
  onSpawnEntityFromBlueprint,
  onForceSpawnFrontierComplex,
  onUpgradeTechHusbandryAll,
  onTriggerOrganizedPredatorRaid,
  onForceSpawnCaveNest,
  onForceDefecationFloraBloom,
  onTriggerComplexGoreSynergy,
}) => {
  const [activeTab, setActiveTab] = useState<
    'dna-lineage' | 'gore-liquid' | 'frontier-husbandry' | 'caves-flora'
  >('dna-lineage');

  const activeGoreSpec = resolveDimensionalGoreGenre(
    currentWorld.archetype,
    goreGenreOverride
  );

  return (
    <div className="flex flex-col w-full h-full bg-slate-950/95 backdrop-blur-xl border border-white/15 rounded-2xl p-5 text-slate-100 overflow-hidden shadow-2xl">
      {/* Header & Creative Mode Sub-Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3.5 mb-3.5 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded bg-amber-500/20 border border-amber-400/40 text-[10px] font-mono-tabular text-amber-300 font-semibold uppercase">
              Creative Mode & Evolutionary Mod Menu (Key M)
            </span>
            <span className="text-xs font-mono-tabular text-slate-400">
              {lineageArchive.length} Logged Genomes · {frontierComplexes.length}{' '}
              Frontier Complexes
            </span>
          </div>
          <h2 className="text-lg font-bold font-display text-white mt-0.5">
            Evolutionary DNA Codex, Dimensional Liquid Gore & Frontier Husbandry
          </h2>
        </div>

        <div className="flex flex-wrap items-center gap-1 p-1 bg-slate-900 rounded-xl border border-white/10 pr-9">
          <button
            onClick={() => setActiveTab('dna-lineage')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
              activeTab === 'dna-lineage'
                ? 'bg-emerald-400 text-slate-950 font-semibold'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <Dna className="w-3.5 h-3.5" />
            DNA Lineage ({lineageArchive.length})
          </button>
          <button
            onClick={() => setActiveTab('gore-liquid')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
              activeTab === 'gore-liquid'
                ? 'bg-rose-500 text-white font-semibold'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <Droplets className="w-3.5 h-3.5" />
            Gore Genres & Liquid Physics
          </button>
          <button
            onClick={() => setActiveTab('frontier-husbandry')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
              activeTab === 'frontier-husbandry'
                ? 'bg-cyan-400 text-slate-950 font-semibold'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            Frontier & Tech Farming ({frontierComplexes.length})
          </button>
          <button
            onClick={() => setActiveTab('caves-flora')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
              activeTab === 'caves-flora'
                ? 'bg-amber-400 text-slate-950 font-semibold'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <Mountain className="w-3.5 h-3.5" />
            Caves, Nests & Flora ({caveNestComplexes.length + fertilizedFloraPatches.length})
          </button>
        </div>
      </div>

      {/* Global Creative Mode Speed & Spring-Damper Bar */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center bg-slate-900/80 border border-white/10 rounded-xl px-4 py-2.5 mb-3.5">
        <div className="md:col-span-5 flex items-center gap-3">
          <span className="text-xs font-medium text-emerald-300 whitespace-nowrap">
            Evolution & Exploration Rate:
          </span>
          <input
            type="range"
            min={0.5}
            max={5.0}
            step={0.25}
            value={evolutionSpeedMultiplier}
            onChange={(e) =>
              onChangeEvolutionSpeedMultiplier(parseFloat(e.target.value))
            }
            className="flex-1 accent-emerald-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
          />
          <span className="font-mono-tabular text-xs font-bold text-white">
            {evolutionSpeedMultiplier.toFixed(2)}×
          </span>
        </div>

        <div className="md:col-span-7 flex flex-wrap items-center justify-end gap-2">
          <button
            onClick={onToggleGlobalRagdoll}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors cursor-pointer ${
              globalRagdollActive
                ? 'bg-amber-400 text-slate-950 border-amber-300'
                : 'bg-slate-950 text-amber-300 border-amber-500/40 hover:bg-amber-500/15'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            {globalRagdollActive
              ? '4D Spring-Damper Ragdoll: ACTIVE'
              : 'Enable 4D Spring-Damper Ragdoll & Limb Sway'}
          </button>
          <button
            onClick={onTriggerOrganizedPredatorRaid}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-rose-500/20 hover:bg-rose-500/35 text-rose-200 border border-rose-400/40 transition-colors cursor-pointer"
          >
            <Zap className="w-3.5 h-3.5" />
            Launch Predator Pack Pincer Raid
          </button>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'dna-lineage' ? (
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-4 overflow-y-auto pr-1">
          {/* Left 7 Cols: Logged Evolutionary Lineage Records */}
          <div className="lg:col-span-7 flex flex-col gap-3 bg-slate-900/70 border border-white/10 rounded-xl p-4 overflow-y-auto">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white font-display">
                  Logged Ancestral & Mutated Entity Archive ({lineageArchive.length})
                </h3>
                <p className="text-xs text-slate-400">
                  Every organism that migrates, adapts to caves, or differentiates in husbandry paddocks is permanently logged for instant Creative Mode spawning.
                </p>
              </div>
            </div>

            <div className="space-y-2.5 overflow-y-auto max-h-96 pr-1">
              {lineageArchive.map((rec) => (
                <div
                  key={rec.id}
                  className="p-3 rounded-xl bg-slate-950/90 border border-white/10 hover:border-emerald-400/40 transition-colors flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
                >
                  <div className="space-y-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-2 py-0.5 rounded bg-emerald-500/20 border border-emerald-400/30 text-[10px] font-mono-tabular text-emerald-300 font-semibold">
                        GEN-{rec.generation} · {rec.dna.dnaHash}
                      </span>
                      <span className="text-xs font-bold text-white">
                        {rec.entityName}
                      </span>
                      <span className="text-[11px] font-mono-tabular text-amber-300">
                        ({rec.evolutionTrigger})
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 leading-snug">
                      {rec.loreSummary}
                    </p>
                    <div className="flex flex-wrap items-center gap-3 text-[11px] font-mono-tabular text-slate-400">
                      <span>
                        Morph: [{rec.dna.torsoScaleMorph.join('×')}]
                      </span>
                      <span>·</span>
                      <span>
                        Limb Span: {(rec.dna.limbElongationFactor * 100).toFixed(0)}%
                      </span>
                      <span>·</span>
                      <span className="text-cyan-300">
                        Cognition: {Math.round(rec.dna.husbandryCognitionScore * 100)}%
                      </span>
                      <span>·</span>
                      <span className="text-rose-300">
                        DNA Yield: {Math.round(rec.dna.dnaNutritionalValue * 100)}%
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => onSpawnEntityFromBlueprint(rec.blueprint, 1)}
                    className="px-3 py-2 rounded-lg bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-semibold text-xs whitespace-nowrap transition-colors cursor-pointer shrink-0"
                  >
                    + Spawn Gen-{rec.generation}
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Right 5 Cols: Live Population DNA & Ecological Activity */}
          <div className="lg:col-span-5 flex flex-col gap-3 bg-slate-900/70 border border-white/10 rounded-xl p-4 overflow-y-auto">
            <div>
              <h3 className="text-sm font-bold text-white font-display">
                Live Active Population DNA ({entityTelemetry.length} Entities)
              </h3>
              <p className="text-xs text-slate-400">
                Real-time frontier migration, cave adaptation, and predator pack targeting
              </p>
            </div>

            <div className="space-y-2 overflow-y-auto max-h-96 pr-1">
              {entityTelemetry.map((ent) => {
                const dna = ent.geneticDNA;
                return (
                  <div
                    key={ent.id}
                    className="p-2.5 rounded-lg bg-slate-950/85 border border-white/10 space-y-1 text-xs"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-bold text-white truncate">
                        {ent.name}
                      </span>
                      {dna && (
                        <span className="px-2 py-0.5 rounded bg-cyan-500/15 text-cyan-300 font-mono-tabular text-[10px]">
                          Gen-{dna.generation} · DNA Yield{' '}
                          {Math.round(dna.dnaNutritionalValue * 100)}%
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-amber-300 font-mono-tabular truncate">
                      {ent.activeEcologicalActivity ?? ent.activeBehavior}
                    </div>
                    {dna && (
                      <div className="text-[10px] font-mono-tabular text-slate-400">
                        {dna.mutationSummary}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : activeTab === 'gore-liquid' ? (
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-4 overflow-y-auto pr-1">
          {/* Left 7 Cols: 5 Dimensional Gore Genres */}
          <div className="lg:col-span-7 flex flex-col gap-3 bg-slate-900/70 border border-white/10 rounded-xl p-4">
            <div className="flex items-center justify-between gap-2">
              <div>
                <h3 className="text-sm font-bold text-white font-display">
                  Dimensional Gore Genres & Aesthetic Liquid Bleed Physics
                </h3>
                <p className="text-xs text-slate-400">
                  Each dimension alters blood viscosity, surface tension, anti-gravity buoyancy, and clot crystallization.
                </p>
              </div>
              <button
                onClick={() => onChangeGoreGenreOverride(null)}
                className={`px-2.5 py-1 rounded text-xs font-mono-tabular border cursor-pointer ${
                  goreGenreOverride === null
                    ? 'bg-amber-400 text-slate-950 border-amber-300 font-semibold'
                    : 'bg-slate-950 text-slate-300 border-white/10'
                }`}
              >
                Auto-Match Dimension
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {ALL_DIMENSIONAL_GORE_GENRES.map((genreId) => {
                const spec = DIMENSIONAL_GORE_GENRE_CATALOG[genreId];
                const isSelected = activeGoreSpec.id === genreId;
                return (
                  <button
                    key={genreId}
                    onClick={() => onChangeGoreGenreOverride(genreId)}
                    className={`text-left p-3 rounded-xl border transition-colors cursor-pointer space-y-1.5 ${
                      isSelected
                        ? 'bg-rose-500/20 border-rose-400 text-white'
                        : 'bg-slate-950/85 border-white/10 text-slate-300 hover:border-white/25'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-bold text-white">
                        {spec.title}
                      </span>
                      <div className="flex items-center gap-1">
                        <span
                          className="w-2.5 h-2.5 rounded-full"
                          style={{ backgroundColor: spec.primaryLiquidHex }}
                        />
                        <span
                          className="w-2.5 h-2.5 rounded-full"
                          style={{ backgroundColor: spec.secondaryClotHex }}
                        />
                      </div>
                    </div>
                    <div className="text-[11px] text-rose-300 font-mono-tabular">
                      {spec.subtitle}
                    </div>
                    <p className="text-[11px] text-slate-400 leading-snug">
                      {spec.physicsDescription}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right 5 Cols: Active Liquid Physics Parameters & Complex Damage Interactions */}
          <div className="lg:col-span-5 flex flex-col justify-between gap-3 bg-slate-900/70 border border-white/10 rounded-xl p-4">
            <div className="space-y-3">
              <div>
                <span className="text-[11px] font-mono-tabular text-rose-400 uppercase">
                  Active Liquid Bleed Rheology
                </span>
                <h3 className="text-base font-bold text-white font-display">
                  {activeGoreSpec.title}
                </h3>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs font-mono-tabular">
                <div className="p-2.5 rounded-lg bg-slate-950/90 border border-white/10">
                  <div className="text-[10px] text-slate-400">VISCOSITY</div>
                  <div className="text-sm font-bold text-rose-300 mt-0.5">
                    {Math.round(activeGoreSpec.viscosity * 100)}%
                  </div>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-950/90 border border-white/10">
                  <div className="text-[10px] text-slate-400">
                    SURFACE TENSION
                  </div>
                  <div className="text-sm font-bold text-amber-300 mt-0.5">
                    {Math.round(activeGoreSpec.surfaceTension * 100)}%
                  </div>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-950/90 border border-white/10">
                  <div className="text-[10px] text-slate-400">
                    BUOYANCY LIFT
                  </div>
                  <div className="text-sm font-bold text-cyan-300 mt-0.5">
                    {activeGoreSpec.buoyancyLift >= 0
                      ? `+${activeGoreSpec.buoyancyLift}`
                      : activeGoreSpec.buoyancyLift}
                  </div>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-950/90 border border-white/10">
                  <div className="text-[10px] text-slate-400">
                    SHEAR-THICKENING
                  </div>
                  <div className="text-sm font-bold text-purple-300 mt-0.5">
                    {Math.round(activeGoreSpec.shearThickening * 100)}%
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-white/10 space-y-2">
                <div className="text-xs font-semibold text-white">
                  Test Complex Multi-Modality Damage Interactions
                </div>
                <p className="text-[11px] text-slate-400">
                  Combine Laceration + Hydrostatic Rupture or Marrow Shatter + Corrosive Ichor on active entities to trigger synergistic arterial jets.
                </p>
                <div className="grid grid-cols-1 gap-1.5">
                  {(
                    [
                      {
                        id: 'laceration-hemorrhage',
                        label: 'Inflict Arterial Laceration Hemorrhage',
                      },
                      {
                        id: 'hydrostatic-viscera-rupture',
                        label: 'Inflict Hydrostatic Viscera Rupture (Synergy Jet)',
                      },
                      {
                        id: 'calcified-marrow-shatter',
                        label: 'Inflict Calcified Marrow Shatter (Sever Tendons)',
                      },
                      {
                        id: 'corrosive-ichor-dissolution',
                        label: 'Inflict Corrosive Ichor Dissolution Boil',
                      },
                      {
                        id: 'neural-synapse-hemolysis',
                        label: 'Inflict Neural Synapse Hemolysis Spasm',
                      },
                    ] as { id: DamageGoreModality; label: string }[]
                  ).map((item) => (
                    <button
                      key={item.id}
                      onClick={() => onTriggerComplexGoreSynergy(item.id)}
                      className="w-full py-2 px-3 rounded-lg bg-rose-500/20 hover:bg-rose-500/35 text-rose-200 border border-rose-400/35 text-xs font-semibold text-left transition-colors cursor-pointer"
                    >
                      + {item.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : activeTab === 'frontier-husbandry' ? (
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-4 overflow-y-auto pr-1">
          {/* Left 7 Cols: Frontier Biomes & Tech-Species Husbandry Paddocks */}
          <div className="lg:col-span-7 flex flex-col gap-3 bg-slate-900/70 border border-white/10 rounded-xl p-4 overflow-y-auto">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white font-display">
                  Map-Edge Frontier Biocomplexes & Tech-Species Farming Hubs
                </h3>
                <p className="text-xs text-slate-400">
                  Generated as entities explore the map perimeter; tech-advancing species domesticate and farm other mobs smarter over time.
                </p>
              </div>
            </div>

            <div className="space-y-2.5 overflow-y-auto max-h-96 pr-1">
              {frontierComplexes.map((fc) => (
                <div
                  key={fc.id}
                  className="p-3 rounded-xl bg-slate-950/90 border border-white/10 flex flex-col gap-1.5"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-white">
                      {fc.name}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-mono-tabular font-semibold ${
                        fc.kind === 'tech-species-husbandry-paddock'
                          ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/30'
                          : 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/30'
                      }`}
                    >
                      {fc.kind === 'tech-species-husbandry-paddock'
                        ? `Tech Farming Tier ${fc.techAdvancementLevel.toFixed(1)}`
                        : `Fertility ${Math.round(fc.fertilityIndex * 100)}%`}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-[11px] font-mono-tabular text-slate-400">
                    <span>
                      Coords: [{fc.x}, {fc.y}, {fc.z}]
                    </span>
                    <span>·</span>
                    <span>Radius: {fc.radius}m</span>
                    <span>·</span>
                    <span className="text-amber-300">
                      Differentiated Offspring: {fc.farmedSpeciesCount}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right 5 Cols: Creative Mode Frontier Actions */}
          <div className="lg:col-span-5 flex flex-col justify-between gap-3 bg-slate-900/70 border border-white/10 rounded-xl p-4">
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-white font-display">
                Frontier Expansion & Husbandry Controls
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Spawn new perimeter Biocomplex Sanctuaries or Autonomous Tech-Husbandry Paddocks, or upgrade the intelligence of farming species so they selectively breed high-yield DNA organisms faster.
              </p>

              <div className="space-y-2 pt-2">
                <button
                  onClick={() =>
                    onForceSpawnFrontierComplex('biocomplex-nature-sanctuary')
                  }
                  className="w-full py-2.5 px-4 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-semibold text-xs transition-colors cursor-pointer flex items-center justify-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Generate Frontier Biocomplex Nature Sanctuary
                </button>
                <button
                  onClick={() =>
                    onForceSpawnFrontierComplex(
                      'tech-species-husbandry-paddock'
                    )
                  }
                  className="w-full py-2.5 px-4 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-semibold text-xs transition-colors cursor-pointer flex items-center justify-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Generate Tech-Species Husbandry Farming Paddock
                </button>
                <button
                  onClick={onUpgradeTechHusbandryAll}
                  className="w-full py-2.5 px-4 rounded-xl bg-purple-500/25 hover:bg-purple-500/40 text-purple-200 border border-purple-400/40 font-semibold text-xs transition-colors cursor-pointer flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  Advance Tech-Farming Species Intelligence (+0.6 Tier)
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-4 overflow-y-auto pr-1">
          {/* Left 6 Cols: High-Elevation Caves & Nests */}
          <div className="lg:col-span-6 flex flex-col justify-between gap-3 bg-slate-900/70 border border-white/10 rounded-xl p-4">
            <div className="space-y-2.5">
              <h3 className="text-sm font-bold text-white font-display">
                Vertical Elevation Caves & Incubating Nests ({caveNestComplexes.length})
              </h3>
              <p className="text-xs text-slate-400">
                Creatures vertically advance up terrain elevations, excavate 3D caves, and weave incubating nests.
              </p>
              <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                {caveNestComplexes.map((cave) => (
                  <div
                    key={cave.id}
                    className="p-2.5 rounded-lg bg-slate-950/90 border border-white/10 flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="font-semibold text-white">
                        {cave.builderEntityName} Cave-Nest ({cave.dnaHash})
                      </div>
                      <div className="text-[11px] font-mono-tabular text-slate-400">
                        Elevation +{cave.elevationTier}m · [{cave.x}, {cave.z}] ·{' '}
                        {cave.nestEggCount} Incubating Eggs
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <button
              onClick={onForceSpawnCaveNest}
              className="w-full py-2.5 px-4 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-semibold text-xs transition-colors cursor-pointer"
            >
              + Excavate High-Elevation 3D Cave & Nest Complex
            </button>
          </div>

          {/* Right 6 Cols: Defecation-Fertilized Vegetation Clusters */}
          <div className="lg:col-span-6 flex flex-col justify-between gap-3 bg-slate-900/70 border border-white/10 rounded-xl p-4">
            <div className="space-y-2.5">
              <h3 className="text-sm font-bold text-white font-display">
                Defecation-Fertilized Biocomplex Vegetation ({fertilizedFloraPatches.length})
              </h3>
              <p className="text-xs text-slate-400">
                Nutrient guano-spore deposition from roaming creatures sprouts multi-stem phyllotactic flora clusters.
              </p>
              <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                {fertilizedFloraPatches.map((patch) => (
                  <div
                    key={patch.id}
                    className="p-2.5 rounded-lg bg-slate-950/90 border border-white/10 flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="font-semibold text-emerald-300">
                        {patch.depositorEntityName} Spore-Flora Cluster
                      </div>
                      <div className="text-[11px] font-mono-tabular text-slate-400">
                        Potency {patch.nutrientPotency}× · {patch.stemCount} Stems · [{patch.x}, {patch.z}]
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <button
              onClick={onForceDefecationFloraBloom}
              className="w-full py-2.5 px-4 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-semibold text-xs transition-colors cursor-pointer"
            >
              + Trigger Nutrient Defecation & Flora Bloom Wave
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
