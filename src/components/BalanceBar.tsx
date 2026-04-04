'use client';

import type { CompositionConfigJson } from '@/lib/party-preset-schema';

function autoWolfCount(minPlayers: number): number {
  return Math.max(1, Math.floor(minPlayers / 4));
}

interface BalanceResult {
  wolfPower: number;
  villagePower: number;
  soloPower: number;
  wolfCount: number;
  villageRoleCount: number;
  villagerCount: number;
  soloCount: number;
  totalSlots: number;
  wolfRatio: number;
  verdict: 'very-village' | 'village' | 'balanced' | 'wolf' | 'very-wolf';
}

function computeBalance(comp: CompositionConfigJson): BalanceResult {
  const wolves = comp.wolfCount ?? autoWolfCount(comp.minPlayers);

  // ── Puissance Loups ──────────────────────────────────────────────────────
  let wolfPower = wolves * 2.0;
  if (comp.includeBigBadWolf) wolfPower += 1.8; // kill x2 tant qu'aucun loup mort
  if (comp.includeWhiteWerewolf) wolfPower += 0.8; // +kill pair mais solo

  // ── Puissance Village ────────────────────────────────────────────────────
  let villagePower = (comp.villagerCount ?? 0) * 0.4;
  if (comp.includeSeer) villagePower += 1.5;
  if (comp.includeWitch) villagePower += 1.6;
  if (comp.includeHunter) villagePower += 1.1;
  if (comp.includeGuard) villagePower += 1.1;
  if (comp.includeCupid) villagePower += 0.4;
  if (comp.includeThief) villagePower += 0.3;
  if (comp.includeRaven) villagePower += 0.6;
  if (comp.includeRedRidingHood) villagePower += 0.5;
  if (comp.includeFoolOfVillage) villagePower += 0.3;
  if (comp.includeElder) villagePower += 1.0;
  if (comp.includeLittleGirl) villagePower += 0.4;
  if (comp.includeRustySwordKnight) villagePower += 0.9;
  if (comp.includeScapegoat) villagePower += 0.2;
  if (comp.includeWildChild) villagePower += 0.0; // neutre (peut flip)
  if (comp.includeFox) villagePower += 0.5;
  if (comp.includeBearTamer) villagePower += 0.4;
  if (comp.includeTwoSisters) villagePower += 0.5;
  if (comp.includeThreeBrothers) villagePower += 0.6;
  if (comp.includeDocteur) villagePower += 1.2;
  if (comp.includeNecromancer) villagePower += 0.8;
  if (comp.includeDevotedServant) villagePower += 0.7;
  if (comp.includeInfectFather) wolfPower += 1.5;
  if (comp.includeDogWolf) villagePower += 0.3;
  if (comp.includeDictateur) villagePower += 1.2;
  if (comp.includeHackeur) villagePower += 0.5;

  // ── Camps Solo (pénalisent tout le monde) ───────────────────────────────
  let soloPower = 0;
  if (comp.includeAngel) soloPower += 0.5;
  if (comp.includePiedPiper) { soloPower += 1.2; wolfPower -= 0.4; villagePower -= 0.4; }
  if (comp.includePyromaniac) { soloPower += 1.4; wolfPower -= 0.3; villagePower -= 0.5; }
  if (comp.includeSectarian) soloPower += 1.0;

  const total = wolfPower + villagePower + soloPower;
  const wolfRatio = total > 0 ? wolfPower / total : 0.5;

  let verdict: BalanceResult['verdict'];
  if (wolfRatio >= 0.60) verdict = 'very-wolf';
  else if (wolfRatio >= 0.52) verdict = 'wolf';
  else if (wolfRatio <= 0.30) verdict = 'very-village';
  else if (wolfRatio <= 0.40) verdict = 'village';
  else verdict = 'balanced';

  // Comptage des slots
  let villageRoleCount = 0;
  if (comp.includeSeer) villageRoleCount++;
  if (comp.includeWitch) villageRoleCount++;
  if (comp.includeHunter) villageRoleCount++;
  if (comp.includeCupid) villageRoleCount++;
  if (comp.includeGuard) villageRoleCount++;
  if (comp.includeThief) villageRoleCount++;
  if (comp.includeRaven) villageRoleCount++;
  if (comp.includeRedRidingHood) villageRoleCount++;
  if (comp.includeFoolOfVillage) villageRoleCount++;
  if (comp.includeElder) villageRoleCount++;
  if (comp.includeLittleGirl) villageRoleCount++;
  if (comp.includeRustySwordKnight) villageRoleCount++;
  if (comp.includeScapegoat) villageRoleCount++;
  if (comp.includeWildChild) villageRoleCount++;
  if (comp.includeFox) villageRoleCount++;
  if (comp.includeBearTamer) villageRoleCount++;
  if (comp.includeTwoSisters) villageRoleCount += 2;
  if (comp.includeThreeBrothers) villageRoleCount += 3;
  if (comp.includeDocteur) villageRoleCount += 1;
  if (comp.includeNecromancer) villageRoleCount += 1;
  if (comp.includeDevotedServant) villageRoleCount += 1;
  if (comp.includeDogWolf) villageRoleCount += 1;
  if (comp.includeDictateur) villageRoleCount += 1;
  if (comp.includeHackeur) villageRoleCount += 1;

  let wolfCount = wolves;
  if (comp.includeBigBadWolf) wolfCount++;
  if (comp.includeWhiteWerewolf) wolfCount++;
  if (comp.includeInfectFather) wolfCount++;

  let soloCount = 0;
  if (comp.includeAngel) soloCount++;
  if (comp.includePiedPiper) soloCount++;
  if (comp.includePyromaniac) soloCount++;
  if (comp.includeSectarian) soloCount++;

  const villagerCount = comp.villagerCount ?? 0;
  const totalSlots = wolfCount + villageRoleCount + soloCount + villagerCount;

  return {
    wolfPower,
    villagePower,
    soloPower,
    wolfCount,
    villageRoleCount,
    villagerCount,
    soloCount,
    totalSlots,
    wolfRatio,
    verdict,
  };
}

const VERDICT_CONFIG = {
  'very-village': {
    label: 'Avantage Village',
    sub: 'Les loups sont en sous-nombre',
    barColor: 'bg-emerald-500',
    badgeBg: 'bg-emerald-100 text-emerald-800 border-emerald-400',
    emoji: '🏘️',
  },
  village: {
    label: 'Léger avantage Village',
    sub: 'Equilibre favorable au village',
    barColor: 'bg-emerald-400',
    badgeBg: 'bg-emerald-50 text-emerald-700 border-emerald-300',
    emoji: '🏘️',
  },
  balanced: {
    label: 'Équilibré',
    sub: 'Partie bien équilibrée',
    barColor: 'bg-amber-400',
    badgeBg: 'bg-amber-50 text-amber-800 border-amber-300',
    emoji: '⚖️',
  },
  wolf: {
    label: 'Léger avantage Loups',
    sub: 'Les loups ont un léger dessus',
    barColor: 'bg-red-400',
    badgeBg: 'bg-red-50 text-red-700 border-red-300',
    emoji: '🐺',
  },
  'very-wolf': {
    label: 'Avantage Loups',
    sub: 'Les loups sont très favorisés',
    barColor: 'bg-red-600',
    badgeBg: 'bg-red-100 text-red-800 border-red-400',
    emoji: '🐺',
  },
};

export function BalanceBar({ comp }: { comp: CompositionConfigJson }) {
  const b = computeBalance(comp);
  const cfg = VERDICT_CONFIG[b.verdict];

  // wolfRatio → position sur la barre (0 = tout village, 1 = tout loup)
  // On mappe wolfRatio [0, 1] → largeur barre rouge côté gauche
  const wolfPct = Math.round(Math.min(1, Math.max(0, b.wolfRatio)) * 100);

  return (
    <div className="space-y-2 rounded-sm border-[2.5px] border-[var(--nb-black)] bg-[var(--nb-white)] p-3 shadow-[3px_3px_0_0_var(--nb-black)]">
      {/* Titre + badge verdict */}
      <div className="flex items-center justify-between gap-2">
        <span className="text-[11px] font-extrabold uppercase tracking-widest text-[var(--nb-black)] opacity-60">
          Équilibrage
        </span>
        <span
          className={`inline-flex items-center gap-1 rounded-sm border px-2 py-0.5 text-[11px] font-bold ${cfg.badgeBg}`}
        >
          {cfg.emoji} {cfg.label}
        </span>
      </div>

      {/* Barre bicolore */}
      <div className="relative h-4 overflow-hidden rounded-sm border-[2px] border-[var(--nb-black)] bg-emerald-100">
        {/* Zone loups (gauche, rouge) */}
        <div
          className={`absolute left-0 top-0 h-full transition-all duration-300 ${cfg.barColor}`}
          style={{ width: `${wolfPct}%` }}
        />
        {/* Marqueur central (50 %) */}
        <div className="absolute left-1/2 top-0 h-full w-[2px] -translate-x-px bg-[var(--nb-black)] opacity-30" />
      </div>

      {/* Labels extrémités */}
      <div className="flex justify-between text-[10px] font-bold text-[var(--nb-black)] opacity-50">
        <span>🏘️ Village</span>
        <span>🐺 Loups</span>
      </div>

      {/* Stats texte */}
      <div className="flex flex-wrap gap-x-3 gap-y-1 pt-0.5 text-[11px] font-bold text-[var(--nb-black)]">
        <span className="text-red-700">
          🐺 {b.wolfCount} loup{b.wolfCount > 1 ? 's' : ''}
        </span>
        <span className="text-emerald-700">
          🏘️ {b.villageRoleCount + b.villagerCount} villageois
          {b.villageRoleCount > 0
            ? ` (dont ${b.villageRoleCount} rôle${b.villageRoleCount > 1 ? 's' : ''} spéciaux)`
            : ''}
        </span>
        {b.soloCount > 0 && (
          <span className="text-amber-700">
            ⭐ {b.soloCount} solo
          </span>
        )}
        {b.totalSlots > 0 && (
          <span className="opacity-50">
            = {b.totalSlots} slots
          </span>
        )}
      </div>

      {/* Sous-texte */}
      <p className="text-[10px] italic text-[var(--nb-black)] opacity-40">
        {cfg.sub}
      </p>
    </div>
  );
}
