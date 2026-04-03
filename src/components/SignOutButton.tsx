'use client';

import { LogOut } from 'lucide-react';
import { signOut } from 'next-auth/react';

export function SignOutButton() {
  return (
    <button
      type="button"
      onClick={() => signOut({ callbackUrl: '/' })}
      className="nb-nav-link border-2 border-transparent hover:border-[var(--nb-black)] hover:bg-[var(--nb-coral)] hover:!text-[#fffef8]"
    >
      <LogOut className="size-4" strokeWidth={2.5} aria-hidden />
      <span className="hidden min-[400px]:inline">Déconnexion</span>
      <span className="min-[400px]:hidden">Out</span>
    </button>
  );
}
