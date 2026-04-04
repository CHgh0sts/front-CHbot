import { adminUpdateRuleFromForm } from '@/actions/admin';
import prisma from '@/lib/prisma';
import { SubscriptionTier } from '@/generated/prisma';
import { COMPOSITION_KEYS } from '@/lib/composition-keys';
import { Lock, Unlock, Swords, Shield, Star, Cog } from 'lucide-react';

export const dynamic = 'force-dynamic';

/* ── Métadonnées par clé ──────────────────────────────────────────────────── */

type Camp = 'village' | 'loup' | 'solo';
type Category = 'role' | 'mode';

type KeyMeta = {
  label: string;
  description: string;
  /** Clé BotRoleKey pour afficher l'image par défaut du site */
  roleImageKey?: string;
  camp?: Camp;
  category: Category;
};

const KEY_META: Record<string, KeyMeta> = {
  /* ── Rôles ──────────────────────────────────────────────────────────────── */
  includeSeer: {
    label: 'Voyante',
    description:
      'Ajoute 1 Voyante en jeu (camp Village). Chaque nuit, elle choisit un joueur à observer dans son fil privé. En mode classique elle apprend s\'il est Loup-Garou ou non ; en mode "Voyante bavarde" elle voit son rôle exact. Rôle révélé publiquement à sa mort si la config le permet.',
    roleImageKey: 'SEER',
    camp: 'village',
    category: 'role',
  },
  includeWitch: {
    label: 'Sorcière',
    description:
      'Ajoute 1 Sorcière en jeu (camp Village). Elle possède deux potions à usage unique : une potion de vie (sauver la victime des loups cette nuit) et une potion de mort (empoisonner un joueur vivant). Elle agit chaque nuit dans son fil privé.',
    roleImageKey: 'WITCH',
    camp: 'village',
    category: 'role',
  },
  includeHunter: {
    label: 'Chasseur',
    description:
      'Ajoute 1 Chasseur en jeu (camp Village). À sa mort (quelle qu\'en soit la cause : loups, vote, chagrin…), il tire immédiatement sur un joueur vivant de son choix, qui est éliminé à son tour. Déclenche une chaîne de morts si ce joueur est amoureux.',
    roleImageKey: 'HUNTER',
    camp: 'village',
    category: 'role',
  },
  includeCupid: {
    label: 'Cupidon',
    description:
      'Ajoute 1 Cupidon en jeu (camp Village). La 1re nuit uniquement, il désigne 2 joueurs (ou 3 si le mode "Ménage à trois" est activé) qui deviennent amoureux dans un fil partagé. Si l\'un meurt, les autres meurent de chagrin. Les amoureux gagnent ensemble s\'ils sont les derniers survivants du lien.',
    roleImageKey: 'CUPID',
    camp: 'village',
    category: 'role',
  },
  includeGuard: {
    label: 'Garde',
    description:
      'Ajoute 1 Garde en jeu (camp Village). Chaque nuit, il protège un joueur vivant dans son fil privé : si les loups désignent cette personne, l\'attaque est annulée. Il ne peut pas protéger la même cible deux nuits consécutives. La protection est invisible (sauf si "Annonce de protection" est activée en config).',
    roleImageKey: 'GUARD',
    camp: 'village',
    category: 'role',
  },
  includeThief: {
    label: 'Voleur',
    description:
      'Ajoute 1 Voleur en jeu (camp Village). La 1re nuit uniquement, il choisit un autre joueur vivant avec qui échanger sa carte de rôle. Les deux joueurs reçoivent leur nouveau rôle en fil privé et jouent désormais ce rôle pour le reste de la partie.',
    roleImageKey: 'THIEF',
    camp: 'village',
    category: 'role',
  },
  includeAngel: {
    label: 'Ange',
    description:
      'Ajoute 1 Ange en jeu (camp Solo). S\'il est éliminé lors du tout premier vote du village, il gagne seul et la partie s\'arrête immédiatement. S\'il survit au premier vote (ou si un autre joueur est éliminé ce tour), il devient un villageois ordinaire pour le reste de la partie.',
    roleImageKey: 'ANGEL',
    camp: 'solo',
    category: 'role',
  },
  includeLittleGirl: {
    label: 'Petite fille',
    description:
      'Ajoute 1 Petite fille en jeu (camp Village). Pendant la phase de vote des loups (chaque nuit), elle peut choisir d\'espionner la meute : elle apprend la cible majoritaire des loups, mais elle a 50 % de risque d\'être repérée et de mourir à la place de cette cible (les loups l\'épargnent alors).',
    roleImageKey: 'LITTLE_GIRL',
    camp: 'village',
    category: 'role',
  },
  includeRaven: {
    label: 'Corbeau',
    description:
      'Ajoute 1 Corbeau en jeu (camp Village). Chaque nuit, il désigne un joueur vivant dans son fil privé : ce joueur reçoit +2 votes supplémentaires lors du vote du village du lendemain. Le salon annonce publiquement qu\'un joueur a été "marqué" sans révéler l\'identité du Corbeau. Si le Corbeau passe son tour, rien ne se passe.',
    roleImageKey: 'RAVEN',
    camp: 'village',
    category: 'role',
  },
  includeRedRidingHood: {
    label: 'Chaperon Rouge',
    description:
      'Ajoute 1 Chaperon Rouge en jeu (camp Village). Pouvoir entièrement passif : tant que le Chasseur est en vie, les loups ne peuvent pas la dévorer — leur attaque est absorbée et personne ne meurt de cette attaque. Si le Chasseur meurt avant elle, la protection disparaît et elle peut être mangée normalement. Nécessite que le Chasseur soit aussi activé dans la composition.',
    roleImageKey: 'RED_RIDING_HOOD',
    camp: 'village',
    category: 'role',
  },

  /* ── Modes de jeu ───────────────────────────────────────────────────────── */
  revealDeadRoles: {
    label: 'Révéler les rôles des morts',
    description:
      'Si activé, le rôle exact de chaque joueur éliminé est annoncé publiquement dans le salon (au lever du soleil, lors du vote, à la mort du Chasseur, de chagrin, etc.). Si désactivé ou si "Nuit sombre" est actif, les rôles restent cachés jusqu\'à la fin de la partie.',
    category: 'mode',
  },
  darkNightMode: {
    label: 'Nuit sombre',
    description:
      'Mode le plus opaque : les morts sont annoncées mais le rôle n\'est JAMAIS révélé publiquement, quelle que soit la valeur de "Révéler les rôles". Ce mode est prioritaire sur toutes les annonces de rôle et s\'applique pour toute la durée de la partie.',
    category: 'mode',
  },
  gossipSeerMode: {
    label: 'Voyante bavarde',
    description:
      'Modifie le comportement de la Voyante : elle voit le rôle exact de sa cible (et non juste Loup/Non-Loup). En revanche, le salon n\'annonce jamais ce rôle publiquement pour un joueur encore vivant — il n\'apparaît que dans les messages d\'annonce de mort. Nécessite que la Voyante soit activée.',
    category: 'mode',
  },
  tripleLoversMode: {
    label: 'Ménage à trois (Cupidon)',
    description:
      'Modifie le comportement de Cupidon : il lie 3 joueurs au lieu d\'un couple. Si l\'un des trois meurt, les deux autres meurent de chagrin. Les trois gagnent ensemble s\'ils sont les derniers survivants du lien. Nécessite que Cupidon soit activé.',
    category: 'mode',
  },
  announceNightProtection: {
    label: 'Annonce de protection (Garde)',
    description:
      'Si activé, quand le Garde protège un joueur, un message public vague est envoyé dans le salon ("quelqu\'un a passé la nuit à l\'abri des loups"), sans révéler ni l\'identité du Garde ni celle du joueur protégé. Désactivé par défaut pour ne pas donner d\'indice. Nécessite que le Garde soit activé.',
    category: 'mode',
  },
};

/* ── Helpers visuels ──────────────────────────────────────────────────────── */

const TIER_ORDER: Record<SubscriptionTier, number> = {
  FREE: 0,
  PREMIUM: 1,
};

function isLocked(tier: SubscriptionTier): boolean {
  return TIER_ORDER[tier] > 0;
}

const CAMP_STYLE: Record<Camp, { label: string; className: string }> = {
  village: {
    label: 'Village',
    className:
      'bg-emerald-100 text-emerald-800 border border-emerald-300 dark:bg-emerald-900/40 dark:text-emerald-300 dark:border-emerald-700',
  },
  loup: {
    label: 'Loups',
    className:
      'bg-red-100 text-red-800 border border-red-300 dark:bg-red-900/40 dark:text-red-300 dark:border-red-700',
  },
  solo: {
    label: 'Solo',
    className:
      'bg-purple-100 text-purple-800 border border-purple-300 dark:bg-purple-900/40 dark:text-purple-300 dark:border-purple-700',
  },
};

/* ── Page ─────────────────────────────────────────────────────────────────── */

export default async function AdminRulesPage() {
  const existing = await prisma.compositionAccessRule.findMany();
  const byKey = new Map(existing.map((r) => [r.compositionKey, r.minTier]));

  return (
    <div>
      <h1 className="font-display mb-2 text-3xl font-semibold text-[var(--bw-text)]">
        Règles d&apos;accès — Composition
      </h1>
      <p className="mb-8 text-sm leading-relaxed text-[var(--bw-text-muted)]">
        Palier minimum requis pour{' '}
        <strong className="text-[var(--bw-text)]">activer</strong> chaque
        option via{' '}
        <code className="rounded-md bg-[var(--bw-muted-bg)] px-1.5 py-0.5 font-mono text-xs">
          /lg-config
        </code>{' '}
        sur Discord.{' '}
        <span className="inline-flex items-center gap-1">
          <Lock className="inline size-3.5 text-[var(--bw-text-muted)]" />
          <span>= option verrouillée (palier payant requis).</span>
        </span>
      </p>

      {/* ── Section : Rôles ─────────────────────────────────────────────── */}
      <h2 className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[var(--bw-text-muted)]">
        <Shield className="size-3.5" />
        Rôles spéciaux
      </h2>
      <div className="mb-8 space-y-3">
        {COMPOSITION_KEYS.filter(
          (k) => KEY_META[k]?.category === 'role'
        ).map((key) => {
          const meta = KEY_META[key];
          if (!meta) return null;
          const tier = byKey.get(key) ?? SubscriptionTier.FREE;
          const locked = isLocked(tier);
          const camp = meta.camp;

          return (
            <div
              key={key}
              className="bw-card overflow-hidden p-0"
            >
              <div className="flex flex-wrap items-stretch gap-0">
                {/* Image de carte de rôle */}
                {meta.roleImageKey ? (
                  <div className="relative h-auto w-20 shrink-0 overflow-hidden bg-[var(--nb-black)]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={`/api/public/role-card-default/${encodeURIComponent(meta.roleImageKey)}`}
                      alt={meta.label}
                      className="absolute inset-0 size-full object-cover"
                      onError={undefined}
                    />
                    {/* overlay gradient */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent to-[var(--nb-black)]/20" />
                  </div>
                ) : null}

                {/* Contenu principal */}
                <div className="flex flex-1 flex-wrap items-center justify-between gap-3 p-4">
                  <div className="min-w-0 flex-1">
                    {/* Ligne titre */}
                    <div className="mb-1 flex flex-wrap items-center gap-2">
                      <span className="font-display text-base font-bold text-[var(--bw-text)]">
                        {meta.label}
                      </span>
                      {/* Badge camp */}
                      {camp ? (
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${CAMP_STYLE[camp].className}`}
                        >
                          {camp === 'village' && (
                            <Shield className="size-2.5" />
                          )}
                          {camp === 'loup' && (
                            <Swords className="size-2.5" />
                          )}
                          {camp === 'solo' && (
                            <Star className="size-2.5" />
                          )}
                          {CAMP_STYLE[camp].label}
                        </span>
                      ) : null}
                      {/* Badge lock */}
                      {locked ? (
                        <span className="inline-flex items-center gap-1 rounded-full border border-amber-400 bg-amber-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-amber-800 dark:border-amber-600 dark:bg-amber-900/40 dark:text-amber-300">
                          <Lock className="size-2.5" />
                          {tier}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full border border-gray-300 bg-gray-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-gray-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-400">
                          <Unlock className="size-2.5" />
                          Gratuit
                        </span>
                      )}
                    </div>
                    {/* Clé technique */}
                    <code className="mb-1.5 block font-mono text-[11px] text-[var(--bw-text-muted)]">
                      {key}
                    </code>
                    {/* Description */}
                    <p className="text-xs leading-relaxed text-[var(--bw-text-muted)]">
                      {meta.description}
                    </p>
                  </div>

                  {/* Formulaire */}
                  <form
                    action={adminUpdateRuleFromForm}
                    className="flex shrink-0 items-center gap-2"
                  >
                    <input type="hidden" name="compositionKey" value={key} />
                    <select
                      name="minTier"
                      defaultValue={tier}
                      className="bw-input w-auto py-1.5 text-sm"
                    >
                      {Object.values(SubscriptionTier).map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                    <button type="submit" className="bw-btn-primary py-2 text-sm">
                      OK
                    </button>
                  </form>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Section : Modes de jeu ──────────────────────────────────────── */}
      <h2 className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[var(--bw-text-muted)]">
        <Cog className="size-3.5" />
        Modes de jeu
      </h2>
      <div className="space-y-3">
        {COMPOSITION_KEYS.filter(
          (k) => KEY_META[k]?.category === 'mode'
        ).map((key) => {
          const meta = KEY_META[key];
          if (!meta) return null;
          const tier = byKey.get(key) ?? SubscriptionTier.FREE;
          const locked = isLocked(tier);

          return (
            <div
              key={key}
              className="bw-card flex flex-wrap items-center justify-between gap-4 p-4"
            >
              <div className="min-w-0 flex-1">
                {/* Ligne titre */}
                <div className="mb-1 flex flex-wrap items-center gap-2">
                  <span className="font-display text-base font-bold text-[var(--bw-text)]">
                    {meta.label}
                  </span>
                  {/* Badge lock */}
                  {locked ? (
                    <span className="inline-flex items-center gap-1 rounded-full border border-amber-400 bg-amber-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-amber-800 dark:border-amber-600 dark:bg-amber-900/40 dark:text-amber-300">
                      <Lock className="size-2.5" />
                      {tier}
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded-full border border-gray-300 bg-gray-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-gray-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-400">
                      <Unlock className="size-2.5" />
                      Gratuit
                    </span>
                  )}
                </div>
                {/* Clé technique */}
                <code className="mb-1.5 block font-mono text-[11px] text-[var(--bw-text-muted)]">
                  {key}
                </code>
                {/* Description */}
                <p className="text-xs leading-relaxed text-[var(--bw-text-muted)]">
                  {meta.description}
                </p>
              </div>

              {/* Formulaire */}
              <form
                action={adminUpdateRuleFromForm}
                className="flex shrink-0 items-center gap-2"
              >
                <input type="hidden" name="compositionKey" value={key} />
                <select
                  name="minTier"
                  defaultValue={tier}
                  className="bw-input w-auto py-1.5 text-sm"
                >
                  {Object.values(SubscriptionTier).map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
                <button type="submit" className="bw-btn-primary py-2 text-sm">
                  OK
                </button>
              </form>
            </div>
          );
        })}
      </div>

      {existing.length === 0 ? (
        <p className="mt-8 rounded-md border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-700 dark:bg-amber-900/20 dark:text-amber-300">
          Aucune règle en base — exécute{' '}
          <code className="rounded-md bg-amber-100 px-1.5 py-0.5 font-mono text-xs dark:bg-amber-900/50">
            npm run db:seed
          </code>{' '}
          après la première migration pour initialiser toutes les clés (FREE par défaut).
        </p>
      ) : null}
    </div>
  );
}
