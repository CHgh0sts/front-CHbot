/** Clés alignées sur `CompositionConfig` du bot (lg-config). */
export const COMPOSITION_KEYS = [
  'includeSeer',
  'includeWitch',
  'includeHunter',
  'includeCupid',
  'includeGuard',
  'includeThief',
  'includeAngel',
  'includeLittleGirl',
  'includeRaven',
  'includeRedRidingHood',
  'includeFoolOfVillage',
  'includeElder',
  'includeBigBadWolf',
  'includeWhiteWerewolf',
  'includePiedPiper',
  'includeRustySwordKnight',
  'includeScapegoat',
  'includeWildChild',
  'includeFox',
  'includePyromaniac',
  'includeBearTamer',
  'includeTwoSisters',
  'includeThreeBrothers',
  'includeDocteur',
  'includeNecromancer',
  'includeSectarian',
  'includeDevotedServant',
  'includeInfectFather',
  'includeDogWolf',
  'tiebreakerRandom',
  'skipFirstNightKill',
  'revealDeadRoles',
  'darkNightMode',
  'gossipSeerMode',
  'tripleLoversMode',
  'announceNightProtection',
] as const;

export type CompositionKey = (typeof COMPOSITION_KEYS)[number];

export function isCompositionKey(k: string): k is CompositionKey {
  return (COMPOSITION_KEYS as readonly string[]).includes(k);
}
