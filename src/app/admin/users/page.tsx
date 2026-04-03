import { adminUpdateUserFromForm } from '@/actions/admin';
import prisma from '@/lib/prisma';
import { SiteRole, SubscriptionTier } from '@/generated/prisma';

export const dynamic = 'force-dynamic';

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const query = q?.trim() ?? '';

  const users = await prisma.user.findMany({
    where: query
      ? {
          OR: [
            { email: { contains: query, mode: 'insensitive' } },
            { discordId: { contains: query } },
            { name: { contains: query, mode: 'insensitive' } },
            { id: { equals: query } },
          ],
        }
      : undefined,
    take: 80,
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      email: true,
      name: true,
      discordId: true,
      siteRole: true,
      tier: true,
      xp: true,
      level: true,
      createdAt: true,
    },
  });

  return (
    <div>
      <h1 className="font-display mb-8 text-3xl font-semibold text-[var(--bw-text)]">
        Utilisateurs
      </h1>

      <form method="get" className="mb-8 flex flex-wrap gap-2">
        <input
          type="search"
          name="q"
          placeholder="Email, Discord ID, nom, id…"
          defaultValue={query}
          className="bw-input max-w-md min-w-[12rem] flex-1 text-sm"
        />
        <button type="submit" className="bw-btn-primary text-sm">
          Rechercher
        </button>
      </form>

      <div className="space-y-6">
        {users.map((u) => (
          <div key={u.id} className="bw-card p-5">
            <div className="mb-3 font-mono text-xs text-[var(--bw-text-faint)]">
              {u.id}
            </div>
            <div className="mb-4 grid gap-1 text-sm text-[var(--bw-text-muted)]">
              <div>
                <strong>{u.name ?? '—'}</strong>{' '}
                {u.email ? <span>({u.email})</span> : null}
              </div>
              <div>Discord: {u.discordId ?? '—'}</div>
              <div>
                XP {u.xp} · Niveau {u.level}
              </div>
            </div>
            <form action={adminUpdateUserFromForm} className="flex flex-wrap gap-3">
              <input type="hidden" name="userId" value={u.id} />
              <label className="flex items-center gap-2 text-sm">
                <span className="text-[var(--bw-text-muted)]">Rôle site</span>
                <select
                  name="siteRole"
                  defaultValue={u.siteRole}
                  className="bw-input w-auto py-1.5 text-sm"
                >
                  {Object.values(SiteRole).map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </label>
              <label className="flex items-center gap-2 text-sm">
                <span className="text-[var(--bw-text-muted)]">Grade</span>
                <select
                  name="tier"
                  defaultValue={u.tier}
                  className="bw-input w-auto py-1.5 text-sm"
                >
                  {Object.values(SubscriptionTier).map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </label>
              <button type="submit" className="bw-btn-primary text-sm py-2">
                Enregistrer
              </button>
            </form>
          </div>
        ))}
      </div>

      {users.length === 0 ? (
        <p className="text-[var(--bw-text-muted)]">Aucun résultat.</p>
      ) : null}
    </div>
  );
}
