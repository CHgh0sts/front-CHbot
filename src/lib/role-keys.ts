/** Aligné sur l’enum `Role` du bot Discord. */
export const BOT_ROLE_KEYS = [
  'WEREWOLF',
  'VILLAGER',
  'SEER',
  'WITCH',
  'HUNTER',
  'CUPID',
  'GUARD',
  'THIEF',
  'ANGEL',
  'LITTLE_GIRL',
  'RAVEN',
  'RED_RIDING_HOOD',
  'FOOL_OF_VILLAGE',
  'ELDER',
  'BIG_BAD_WOLF',
] as const;

export type BotRoleKey = (typeof BOT_ROLE_KEYS)[number];

export const BOT_ROLE_LABELS_FR: Record<BotRoleKey, string> = {
  WEREWOLF: 'Loup-Garou',
  VILLAGER: 'Villageois',
  SEER: 'Voyante',
  WITCH: 'Sorcière',
  HUNTER: 'Chasseur',
  CUPID: 'Cupidon',
  GUARD: 'Garde',
  THIEF: 'Voleur',
  ANGEL: 'Ange',
  LITTLE_GIRL: 'Petite fille',
  RAVEN: 'Corbeau',
  RED_RIDING_HOOD: 'Chaperon Rouge',
  FOOL_OF_VILLAGE: 'Idiot du village',
  ELDER: 'Ancien',
  BIG_BAD_WOLF: 'Grand Méchant Loup',
};

export const BOT_ROLE_DESCRIPTIONS_FR: Record<BotRoleKey, string> = {
  WEREWOLF: 'Chaque nuit, les loups-garous se réveillent et choisissent un villageois à dévorer. Ils doivent rester discrets le jour.',
  VILLAGER: 'Simple villageois sans pouvoir spécial. Son seul atout : son vote le jour pour éliminer les loups-garous.',
  SEER: 'Chaque nuit, la voyante peut espionner un joueur et découvrir sa véritable identité. Pouvoir crucial mais dangereux si les loups la repèrent.',
  WITCH: 'La sorcière possède deux potions : une de guérison et une de mort. Chacune est utilisable une seule fois dans la partie.',
  HUNTER: 'Quand le chasseur est éliminé, il tire une dernière balle sur le joueur de son choix. Un pouvoir qui peut renverser la partie.',
  CUPID: 'En début de partie, Cupidon désigne deux amoureux. Si l\'un meurt, l\'autre meurt aussi de chagrin.',
  GUARD: 'Chaque nuit, le garde protège un joueur de l\'attaque des loups-garous. Il ne peut pas protéger la même personne deux nuits de suite.',
  THIEF: 'En début de partie, le voleur choisit entre deux cartes face cachée pour échanger son rôle.',
  ANGEL: 'L\'ange gagne s\'il est éliminé au premier vote du village. S\'il survit, il devient un simple villageois.',
  LITTLE_GIRL: 'La petite fille peut espionner les loups-garous pendant la nuit en entrouvrant les yeux, mais gare à se faire repérer.',
  RAVEN: 'Chaque nuit, le corbeau désigne un joueur qui recevra +2 votes supplémentaires lors du vote du village le lendemain. Le salon annonce qu\'un joueur a été marqué, sans révéler l\'identité du corbeau.',
  RED_RIDING_HOOD: 'Tant que le Chasseur est en vie, les loups ne peuvent pas dévorer le Chaperon Rouge (attaque absorbée — personne ne meurt). Si le Chasseur meurt, cette protection disparaît. Pouvoir entièrement passif, sans action nocturne.',
  FOOL_OF_VILLAGE: 'Si le village vote pour l\'éliminer, l\'Idiot du village ne meurt pas (une seule fois). Son identité est révélée publiquement et il perd son droit de vote pour le reste de la partie. Il peut toutefois être mangé par les loups ou tué par d\'autres effets.',
  ELDER: 'L\'Ancien peut survivre à la première attaque des loups (annoncé comme une résistance mystérieuse, sans révéler son identité). Si le village le vote pour l\'éliminer, tous les rôles spéciaux du camp Village perdent leurs pouvoirs pour le reste de la partie.',
  BIG_BAD_WOLF: 'Vote chaque nuit avec la meute comme un loup-garou. En plus, tant qu\'aucun loup n\'est mort, il peut tuer un joueur supplémentaire seul dans son fil privé. Si un loup meurt, il perd ce pouvoir bonus mais continue de jouer avec la meute.',
};

export const BOT_ROLE_CAMPS: Record<BotRoleKey, 'loup' | 'village' | 'solo'> = {
  WEREWOLF: 'loup',
  VILLAGER: 'village',
  SEER: 'village',
  WITCH: 'village',
  HUNTER: 'village',
  CUPID: 'village',
  GUARD: 'village',
  THIEF: 'village',
  ANGEL: 'solo',
  LITTLE_GIRL: 'village',
  RAVEN: 'village',
  RED_RIDING_HOOD: 'village',
  FOOL_OF_VILLAGE: 'village',
  ELDER: 'village',
  BIG_BAD_WOLF: 'loup',
};

export function isBotRoleKey(s: string): s is BotRoleKey {
  return (BOT_ROLE_KEYS as readonly string[]).includes(s);
}
