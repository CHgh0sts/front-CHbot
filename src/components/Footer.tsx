import { BookOpen, MoonStar, Trophy } from 'lucide-react';
import Link from 'next/link';

export function Footer() {
  return (
    <footer className="mt-auto border-t-[3px] border-[var(--nb-black)] bg-[var(--nb-white)]">
      <div className="mx-auto flex max-w-5xl flex-col gap-6 px-4 py-8 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-center gap-2">
          <MoonStar
            className="size-5 text-[var(--nb-black)]"
            strokeWidth={2.5}
            aria-hidden
          />
          <span className="font-display text-sm tracking-tight text-[var(--nb-black)]">
            BOTWOLF
          </span>
        </div>

        <div className="flex flex-wrap gap-x-8 gap-y-3 text-xs font-bold uppercase tracking-wider text-[var(--bw-text-muted)]">
          <Link
            href="/"
            className="transition hover:text-[var(--nb-black)]"
          >
            Accueil
          </Link>
          <Link
            href="/leaderboard"
            className="inline-flex items-center gap-1 transition hover:text-[var(--nb-black)]"
          >
            <Trophy className="size-3" strokeWidth={2.5} aria-hidden />
            Classement
          </Link>
          <Link
            href="/roles"
            className="inline-flex items-center gap-1 transition hover:text-[var(--nb-black)]"
          >
            <BookOpen className="size-3" strokeWidth={2.5} aria-hidden />
            Rôles
          </Link>
          <a
            href="https://github.com/CHgh0sts/CHbot"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 transition hover:text-[var(--nb-black)]"
          >
            <svg className="size-3" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
            </svg>
            GitHub
          </a>
        </div>
      </div>
      <div className="border-t-[2px] border-[var(--bw-border)] px-4 py-3 text-center text-[10px] font-bold uppercase tracking-widest text-[var(--bw-text-faint)]">
        Botwolf &copy; {new Date().getFullYear()} &mdash; Loup-Garou Discord
      </div>
    </footer>
  );
}
