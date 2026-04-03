import { adminUpdateRuleFromForm } from '@/actions/admin';
import prisma from '@/lib/prisma';
import { SubscriptionTier } from '@/generated/prisma';
import { COMPOSITION_KEYS } from '@/lib/composition-keys';

export const dynamic = 'force-dynamic';

export default async function AdminRulesPage() {
  const existing = await prisma.compositionAccessRule.findMany();
  const byKey = new Map(existing.map((r) => [r.compositionKey, r.minTier]));

  return (
    <div>
      <h1 className="font-display mb-3 text-3xl font-semibold text-[var(--bw-text)]">
        Règles d’accès (composition)
      </h1>
      <p className="mb-8 text-sm leading-relaxed text-[var(--bw-text-muted)]">
        Palier minimum pour <strong className="text-[var(--bw-text)]">activer</strong>{' '}
        chaque option via{' '}
        <code className="rounded-md bg-[var(--bw-muted-bg)] px-1.5 py-0.5 font-mono text-xs">
          /lg-config
        </code>{' '}
        (celui qui modifie la config doit avoir au moins ce grade).
      </p>

      <div className="space-y-4">
        {COMPOSITION_KEYS.map((key) => (
          <div
            key={key}
            className="bw-card flex flex-wrap items-center justify-between gap-4 p-4"
          >
            <code className="text-sm font-medium text-[var(--bw-text)]">
              {key}
            </code>
            <form action={adminUpdateRuleFromForm} className="flex items-center gap-2">
              <input type="hidden" name="compositionKey" value={key} />
              <select
                name="minTier"
                defaultValue={byKey.get(key) ?? SubscriptionTier.FREE}
                className="bw-input w-auto py-1.5 text-sm"
              >
                {Object.values(SubscriptionTier).map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
              <button type="submit" className="bw-btn-primary text-sm py-2">
                OK
              </button>
            </form>
          </div>
        ))}
      </div>

      {existing.length === 0 ? (
        <p className="mt-8 text-amber-900 dark:text-amber-300">
          Aucune règle en base : exécute{' '}
          <code className="rounded-md bg-[var(--bw-muted-bg)] px-1.5 py-0.5 font-mono text-xs">
            npm run db:seed
          </code>{' '}
          après la première migration pour initialiser les clés (toutes en FREE).
        </p>
      ) : null}
    </div>
  );
}
