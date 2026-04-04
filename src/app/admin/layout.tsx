import { ArrowLeft, ImageIcon, Scale, Shield, Users } from 'lucide-react';
import Link from 'next/link';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen">
      <div className="border-b-[3px] border-[var(--nb-black)] bg-[var(--nb-white)] px-4 py-4 shadow-[0_4px_0_0_var(--nb-black)]">
        <div className="mx-auto flex max-w-4xl flex-wrap items-center gap-x-2 gap-y-2 text-sm">
          <Link
            href="/admin"
            className="inline-flex items-center gap-2 border-[3px] border-[var(--nb-black)] bg-[var(--nb-yellow)] px-3 py-2 font-display text-sm font-bold uppercase tracking-wide text-[var(--nb-black)] shadow-[3px_3px_0_0_var(--nb-black)]"
          >
            <Shield className="size-4" strokeWidth={2.5} />
            Admin
          </Link>
          <Link
            href="/admin/users"
            className="inline-flex items-center gap-1.5 border-[3px] border-transparent px-2 py-1.5 font-bold uppercase tracking-wide text-[var(--nb-black)] hover:border-[var(--nb-black)] hover:bg-[var(--nb-mint)]"
          >
            <Users className="size-4" strokeWidth={2.5} />
            Utilisateurs
          </Link>
          <Link
            href="/admin/rules"
            className="inline-flex items-center gap-1.5 border-[3px] border-transparent px-2 py-1.5 font-bold uppercase tracking-wide text-[var(--nb-black)] hover:border-[var(--nb-black)] hover:bg-[var(--nb-mint)]"
          >
            <Scale className="size-4" strokeWidth={2.5} />
            Règles
          </Link>
          <Link
            href="/admin/role-cards"
            className="inline-flex items-center gap-1.5 border-[3px] border-transparent px-2 py-1.5 font-bold uppercase tracking-wide text-[var(--nb-black)] hover:border-[var(--nb-black)] hover:bg-[var(--nb-mint)]"
          >
            <ImageIcon className="size-4" strokeWidth={2.5} />
            Cartes
          </Link>
          <Link
            href="/"
            className="ml-auto inline-flex items-center gap-1 font-extrabold uppercase tracking-wide text-[var(--nb-black)] hover:underline"
          >
            <ArrowLeft className="size-4" strokeWidth={2.5} />
            Site
          </Link>
        </div>
      </div>
      <div className="mx-auto max-w-4xl px-4 py-10" suppressHydrationWarning>{children}</div>
    </div>
  );
}
