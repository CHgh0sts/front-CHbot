/** XP de base par partie jouée */
export const XP_BASE = 10;
/** Bonus si le camp du joueur gagne */
export const XP_WIN_BONUS = 15;

export function xpAwardForGame(won: boolean): number {
  return XP_BASE + (won ? XP_WIN_BONUS : 0);
}

/**
 * Niveau progressif : seuils qui augmentent ~12 % à chaque niveau.
 */
export function levelFromXp(xp: number): number {
  if (xp < 0) return 1;
  let level = 1;
  let spent = 0;
  let need = 100;
  const maxLevel = 500;
  while (spent + need <= xp && level < maxLevel) {
    spent += need;
    level += 1;
    need = Math.floor(need * 1.12);
  }
  return level;
}

/** Même boucle que `levelFromXp` : progression dans le niveau courant (barre, XP manquant). */
export function xpLevelProgress(xp: number): {
  level: number;
  /** XP accumulés depuis le début du niveau actuel */
  xpInCurrentLevel: number;
  /** XP à gagner pour passer au niveau suivant (largeur du segment courant) */
  xpNeededForNextLevel: number;
  /** XP qu’il reste pour level up */
  xpUntilNextLevel: number;
  /** 0–100 pour une barre */
  percentToNextLevel: number;
} {
  if (xp < 0) xp = 0;
  let level = 1;
  let spent = 0;
  let need = 100;
  const maxLevel = 500;
  while (spent + need <= xp && level < maxLevel) {
    spent += need;
    level += 1;
    need = Math.floor(need * 1.12);
  }
  const xpInCurrentLevel = xp - spent;
  const xpUntilNextLevel = Math.max(0, need - xpInCurrentLevel);
  const percentToNextLevel =
    need > 0 ? Math.min(100, Math.max(0, (xpInCurrentLevel / need) * 100)) : 100;
  return {
    level,
    xpInCurrentLevel,
    xpNeededForNextLevel: need,
    xpUntilNextLevel,
    percentToNextLevel,
  };
}
