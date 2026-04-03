import type { Metadata } from 'next';
import { DM_Sans, Geist_Mono, Space_Grotesk } from 'next/font/google';
import { Toaster } from 'sonner';
import './globals.css';
import { Footer } from '@/components/Footer';
import { SessionProvider } from '@/components/SessionProvider';
import { SiteNav } from '@/components/SiteNav';

const dmSans = DM_Sans({
  variable: '--font-dm',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
});

const spaceGrotesk = Space_Grotesk({
  variable: '--font-space',
  subsets: ['latin'],
  weight: ['500', '600', '700'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: {
    default: 'Botwolf — Espace joueur Loup-Garou',
    template: '%s | Botwolf',
  },
  description:
    'Hub Loup-Garou Discord : presets de partie, progression XP, classement, images de cartes et administration.',
  keywords: ['loup-garou', 'discord', 'bot', 'botwolf', 'jeu', 'werewolf'],
  authors: [{ name: 'Botwolf' }],
  openGraph: {
    type: 'website',
    locale: 'fr_FR',
    siteName: 'Botwolf',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="fr"
      className={`${dmSans.variable} ${spaceGrotesk.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <link rel="preconnect" href="https://cdn.discordapp.com" />
        <link rel="dns-prefetch" href="https://cdn.discordapp.com" />
      </head>
      <body
        className="nb-app-bg flex min-h-full flex-col text-[var(--nb-black)]"
        suppressHydrationWarning
      >
        <div className="nb-stripe shrink-0" aria-hidden />
        <SessionProvider>
          <SiteNav />
          <div className="flex-1">{children}</div>
          <Footer />
          <Toaster
            position="bottom-right"
            toastOptions={{
              className:
                'border-[3px] border-[var(--nb-black)] bg-[var(--nb-white)] text-[var(--nb-black)] shadow-[4px_4px_0_0_var(--nb-black)] font-bold text-sm',
            }}
          />
        </SessionProvider>
      </body>
    </html>
  );
}
