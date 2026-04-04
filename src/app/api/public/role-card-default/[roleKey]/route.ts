import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { isBotRoleKey } from '@/lib/role-keys';

/**
 * Image carte par défaut (admin) — pour affichage sur le site sans code preset.
 *
 * Cache strategy : ETag basé sur updatedAt + Cache-Control: no-cache
 * → le navigateur revalide à chaque requête, mais reçoit 304 Not Modified
 *   si l'image n'a pas changé (pas de re-téléchargement inutile).
 *   Dès qu'un admin change l'image, le nouvel ETag invalide le cache côté client.
 */
export async function GET(
  req: Request,
  context: { params: Promise<{ roleKey: string }> }
) {
  const { roleKey: raw } = await context.params;
  const roleKey = decodeURIComponent(raw ?? '')
    .trim()
    .toUpperCase();
  if (!isBotRoleKey(roleKey)) {
    return NextResponse.json({ error: 'rôle invalide' }, { status: 400 });
  }

  const row = await prisma.roleCardDefault.findUnique({
    where: { roleKey },
  });

  if (!row?.imageBase64?.trim()) {
    return NextResponse.json({ error: 'aucune image' }, { status: 404 });
  }

  const etag = `"${row.updatedAt.getTime().toString(16)}"`;
  const ifNoneMatch = req.headers.get('if-none-match');
  if (ifNoneMatch === etag) {
    return new NextResponse(null, {
      status: 304,
      headers: {
        ETag: etag,
        'Cache-Control': 'no-cache',
      },
    });
  }

  try {
    const buf = Buffer.from(row.imageBase64.trim(), 'base64');
    if (buf.length === 0) {
      return NextResponse.json({ error: 'aucune image' }, { status: 404 });
    }
    return new NextResponse(new Uint8Array(buf), {
      status: 200,
      headers: {
        'Content-Type': row.mimeType || 'image/png',
        'Cache-Control': 'no-cache',
        ETag: etag,
      },
    });
  } catch {
    return NextResponse.json({ error: 'invalide' }, { status: 500 });
  }
}
