'use client';

import {
  Loader2,
  LogIn,
  MoonStar,
  Shield,
  SlidersHorizontal,
  UserPlus,
  UserRound,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { SignOutButton } from '@/components/SignOutButton';

function NavLink({
  href,
  icon,
  children,
}: {
  href: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const active =
    pathname === href || (href !== '/' && pathname.startsWith(href));
  return (
    <Link
      href={href}
      className={`nb-nav-link ${active ? 'nb-nav-link-active' : ''}`}
    >
      <span className="size-4 shrink-0 [&>svg]:size-4" aria-hidden>
        {icon}
      </span>
      {children}
    </Link>
  );
}

export function SiteNav() {
  const { data: session, status } = useSession();

  return (
    <header className="sticky top-0 z-50 border-b-[3px] border-[var(--nb-black)] bg-[var(--nb-white)] shadow-[0_4px_0_0_var(--nb-black)]">
      <nav className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:gap-4">
        <Link
          href="/"
          className="group flex items-center gap-2 border-[3px] border-[var(--nb-black)] bg-[var(--nb-yellow)] px-3 py-2 shadow-[4px_4px_0_0_var(--nb-black)] transition-transform hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[6px_6px_0_0_var(--nb-black)]"
        >
          <MoonStar
            className="size-6 text-[var(--nb-black)]"
            strokeWidth={2.5}
            aria-hidden
          />
          <span className="font-display text-lg tracking-tight text-[var(--nb-black)]">
            BOTWOLF
          </span>
        </Link>

        <div className="flex flex-wrap items-center justify-end gap-1.5 sm:gap-2">
          {status === 'loading' ? (
            <span className="inline-flex items-center gap-2 px-2 py-1 text-[var(--nb-black)]">
              <Loader2 className="size-4 animate-spin" aria-hidden />
              <span className="text-xs font-bold uppercase tracking-wider">
                …
              </span>
            </span>
          ) : session?.user ? (
            <>
              <NavLink href="/profile" icon={<UserRound />}>
                Profil
              </NavLink>
              <NavLink href="/configs" icon={<SlidersHorizontal />}>
                Presets
              </NavLink>
              {session.user.siteRole === 'ADMIN' ? (
                <NavLink href="/admin" icon={<Shield />}>
                  Admin
                </NavLink>
              ) : null}
              <SignOutButton />
            </>
          ) : (
            <>
              <NavLink href="/login" icon={<LogIn />}>
                Connexion
              </NavLink>
              <Link
                href="/register"
                className="nb-btn-primary inline-flex !py-2 !text-xs"
              >
                <UserPlus className="size-4" strokeWidth={2.5} aria-hidden />
                Inscription
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
