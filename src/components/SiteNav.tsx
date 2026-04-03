'use client';

import {
  Loader2,
  LogIn,
  Menu,
  MoonStar,
  Shield,
  SlidersHorizontal,
  Trophy,
  UserPlus,
  UserRound,
  X,
  BookOpen,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { SignOutButton } from '@/components/SignOutButton';

function NavLink({
  href,
  icon,
  children,
  onClick,
}: {
  href: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  onClick?: () => void;
}) {
  const pathname = usePathname();
  const active =
    pathname === href || (href !== '/' && pathname.startsWith(href));
  return (
    <Link
      href={href}
      onClick={onClick}
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
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!mobileOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [mobileOpen]);

  const closeMobile = () => setMobileOpen(false);

  const navLinks = (
    <>
      {status === 'loading' ? (
        <span className="inline-flex items-center gap-2 px-2 py-1 text-[var(--nb-black)]">
          <Loader2 className="size-4 animate-spin" aria-hidden />
          <span className="text-xs font-bold uppercase tracking-wider">
            ...
          </span>
        </span>
      ) : session?.user ? (
        <>
          <NavLink href="/profile" icon={<UserRound />} onClick={closeMobile}>
            Profil
          </NavLink>
          <NavLink href="/configs" icon={<SlidersHorizontal />} onClick={closeMobile}>
            Presets
          </NavLink>
          <NavLink href="/leaderboard" icon={<Trophy />} onClick={closeMobile}>
            Classement
          </NavLink>
          <NavLink href="/roles" icon={<BookOpen />} onClick={closeMobile}>
            Rôles
          </NavLink>
          {session.user.siteRole === 'ADMIN' && (
            <NavLink href="/admin" icon={<Shield />} onClick={closeMobile}>
              Admin
            </NavLink>
          )}
          <SignOutButton />
        </>
      ) : (
        <>
          <NavLink href="/leaderboard" icon={<Trophy />} onClick={closeMobile}>
            Classement
          </NavLink>
          <NavLink href="/roles" icon={<BookOpen />} onClick={closeMobile}>
            Rôles
          </NavLink>
          <NavLink href="/login" icon={<LogIn />} onClick={closeMobile}>
            Connexion
          </NavLink>
          <Link
            href="/register"
            onClick={closeMobile}
            className="nb-btn-primary inline-flex !py-2 !text-xs"
          >
            <UserPlus className="size-4" strokeWidth={2.5} aria-hidden />
            Inscription
          </Link>
        </>
      )}
    </>
  );

  return (
    <>
      <header className="sticky top-0 z-50 border-b-[3px] border-[var(--nb-black)] bg-[var(--nb-white)] shadow-[0_4px_0_0_var(--nb-black)]">
        <nav className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-3">
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

          {/* Avatar + user info for connected users (desktop) */}
          {session?.user && (
            <div className="hidden items-center gap-2 sm:flex">
              {session.user.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={session.user.image}
                  alt=""
                  className="size-8 border-[2px] border-[var(--nb-black)] object-cover shadow-[2px_2px_0_0_var(--nb-black)]"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="flex size-8 items-center justify-center border-[2px] border-[var(--nb-black)] bg-[var(--nb-lilac)] text-xs font-black text-[var(--nb-black)] shadow-[2px_2px_0_0_var(--nb-black)]">
                  {(session.user.name ?? '?')[0].toUpperCase()}
                </div>
              )}
            </div>
          )}

          {/* Desktop nav */}
          <div className="hidden flex-wrap items-center justify-end gap-1.5 sm:flex sm:gap-2">
            {navLinks}
          </div>

          {/* Mobile burger button */}
          <button
            type="button"
            onClick={() => setMobileOpen((v) => !v)}
            className="flex size-10 items-center justify-center border-[3px] border-[var(--nb-black)] bg-[var(--nb-white)] text-[var(--nb-black)] shadow-[3px_3px_0_0_var(--nb-black)] transition hover:bg-[var(--nb-mint)] sm:hidden"
            aria-label={mobileOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
          >
            {mobileOpen ? (
              <X className="size-5" strokeWidth={2.5} />
            ) : (
              <Menu className="size-5" strokeWidth={2.5} />
            )}
          </button>
        </nav>
      </header>

      {/* Mobile drawer */}
      {mobileOpen && (
        <>
          <button
            type="button"
            className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-[2px] sm:hidden"
            onClick={closeMobile}
            aria-label="Fermer le menu"
          />
          <div className="fixed inset-y-0 right-0 z-[70] flex w-72 flex-col border-l-[3px] border-[var(--nb-black)] bg-[var(--nb-cream)] shadow-[-6px_0_0_0_var(--nb-black)] sm:hidden">
            <div className="flex items-center justify-between border-b-[3px] border-[var(--nb-black)] bg-[var(--nb-yellow)] px-4 py-3">
              <span className="font-display text-sm font-bold text-[var(--nb-black)]">
                Menu
              </span>
              <button
                type="button"
                onClick={closeMobile}
                className="flex size-8 items-center justify-center border-[3px] border-[var(--nb-black)] bg-[var(--nb-white)] text-[var(--nb-black)] shadow-[2px_2px_0_0_var(--nb-black)] transition hover:bg-[var(--nb-mint)]"
                aria-label="Fermer"
              >
                <X className="size-4" strokeWidth={2.5} />
              </button>
            </div>

            {session?.user && (
              <div className="flex items-center gap-3 border-b-[3px] border-[var(--nb-black)] bg-[var(--nb-white)] px-4 py-3">
                {session.user.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={session.user.image}
                    alt=""
                    className="size-10 border-[2px] border-[var(--nb-black)] object-cover shadow-[2px_2px_0_0_var(--nb-black)]"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="flex size-10 items-center justify-center border-[2px] border-[var(--nb-black)] bg-[var(--nb-lilac)] text-sm font-black text-[var(--nb-black)] shadow-[2px_2px_0_0_var(--nb-black)]">
                    {(session.user.name ?? '?')[0].toUpperCase()}
                  </div>
                )}
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold text-[var(--nb-black)]">
                    {session.user.name ?? 'Joueur'}
                  </p>
                  <p className="text-[10px] font-bold uppercase tracking-wide text-[var(--bw-text-muted)]">
                    Connecté
                  </p>
                </div>
              </div>
            )}

            <div className="flex flex-1 flex-col gap-1 overflow-y-auto p-3">
              {navLinks}
            </div>
          </div>
        </>
      )}
    </>
  );
}
