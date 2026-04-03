import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { isBotRoleKey } from '@/lib/role-keys';

/**
 * Image carte par défaut (admin) — pour affichage sur le site sans code preset.
 */
export async function GET(
  _req: Request,
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

  try {
    const buf = Buffer.from(row.imageBase64.trim(), 'base64');
    if (buf.length === 0) {
      return NextResponse.json({ error: 'aucune image' }, { status: 404 });
    }
    return new NextResponse(new Uint8Array(buf), {
      status: 200,
      headers: {
        'Content-Type': row.mimeType || 'image/png',
        'Cache-Control': 'public, max-age=3600',
      },
    });
  } catch {
    return NextResponse.json({ error: 'invalide' }, { status: 500 });
  }
}
