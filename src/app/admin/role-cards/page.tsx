import { redirect } from 'next/navigation';
import { requireAdminSession } from '@/lib/admin-server';
import { RoleCardDefaultsAdminForm } from './RoleCardDefaultsAdminForm';

export const dynamic = 'force-dynamic';

export default async function AdminRoleCardsPage() {
  const session = await requireAdminSession();
  if (!session) {
    redirect('/login?callbackUrl=/admin/role-cards');
  }

  return (
    <div>
      <h1 className="font-display mb-3 text-3xl font-semibold text-[var(--bw-text)]">
        Images des cartes (défaut)
      </h1>
      <p className="mb-6 text-sm leading-relaxed text-[var(--bw-text-muted)]">
        Fichiers en base pour chaque rôle. Le bot peut aussi servir des URLs via{' '}
        <code className="rounded-md bg-[var(--bw-muted-bg)] px-1.5 py-0.5 font-mono text-xs">
          /api/public/role-card/[code]/[rôle]
        </code>
        .
      </p>
      <RoleCardDefaultsAdminForm />
    </div>
  );
}
