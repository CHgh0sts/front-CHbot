'use client';

import { ImageIcon, Loader2, RefreshCw, Save } from 'lucide-react';
import { useCallback, useState } from 'react';
import {
  RoleImageFileFields,
  type RoleImageFieldValue,
} from '@/components/RoleImageFileFields';
import { BOT_ROLE_KEYS, type BotRoleKey } from '@/lib/role-keys';
import type { RoleImageStored } from '@/lib/role-image-storage';

function mergeLoaded(
  raw: Record<string, string | RoleImageStored> | undefined
): Record<BotRoleKey, RoleImageFieldValue | null> {
  const o = {} as Record<BotRoleKey, RoleImageFieldValue | null>;
  for (const k of BOT_ROLE_KEYS) {
    const v = raw?.[k];
    if (v === undefined) o[k] = null;
    else if (typeof v === 'string') o[k] = v;
    else o[k] = v;
  }
  return o;
}

function buildPayload(
  values: Record<BotRoleKey, RoleImageFieldValue | null>
): Record<string, RoleImageFieldValue | null> {
  return Object.fromEntries(
    BOT_ROLE_KEYS.map((k) => {
      const v = values[k];
      if (v === undefined || v === null) return [k, null];
      if (typeof v === 'string' && !v.trim()) return [k, null];
      return [k, v];
    })
  );
}

export function PresetImagesEditor({
  publicCode,
  isPremium,
}: {
  publicCode: string;
  isPremium: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [values, setValues] = useState<Record<
    BotRoleKey,
    RoleImageFieldValue | null
  > | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setMsg(null);
    try {
      const res = await fetch(
        `/api/party-presets/${encodeURIComponent(publicCode)}`
      );
      const data = (await res.json().catch(() => ({}))) as {
        roleImageOverrides?: Record<string, string | RoleImageStored>;
        error?: string;
      };
      if (!res.ok) {
        setMsg(data.error ?? 'Erreur');
        return;
      }
      setValues(mergeLoaded(data.roleImageOverrides));
      setLoaded(true);
    } catch {
      setMsg('Réseau');
    }
    setLoading(false);
  }, [publicCode]);

  const onToggle = () => {
    const next = !open;
    setOpen(next);
    if (next && !loaded) void load();
  };

  async function onSave() {
    if (!values) return;
    setSaving(true);
    setMsg(null);
    try {
      const res = await fetch(
        `/api/party-presets/${encodeURIComponent(publicCode)}`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ roleImageOverrides: buildPayload(values) }),
        }
      );
      const data = (await res.json().catch(() => ({}))) as {
        error?: string;
        roleImageOverrides?: Record<string, string | RoleImageStored>;
      };
      if (!res.ok) {
        setMsg(data.error ?? 'Erreur');
        setSaving(false);
        return;
      }
      setValues(mergeLoaded(data.roleImageOverrides));
      setMsg('Enregistré.');
    } catch {
      setMsg('Réseau');
    }
    setSaving(false);
  }

  if (!isPremium) {
    return (
      <p className="text-xs text-[var(--bw-text-faint)]">
        Images par rôle : compte{' '}
        <span className="font-medium text-[var(--bw-text)]">Premium</span>{' '}
        requis.
      </p>
    );
  }

  return (
    <div className="mt-3 border-t border-[var(--bw-border)] pt-3">
      <button
        type="button"
        onClick={onToggle}
        className="inline-flex items-center gap-2 border-[3px] border-[var(--nb-black)] bg-[var(--nb-white)] px-3 py-2 text-xs font-extrabold uppercase tracking-wide text-[var(--nb-black)] shadow-[3px_3px_0_0_var(--nb-black)] transition hover:-translate-x-px hover:-translate-y-px hover:shadow-[4px_4px_0_0_var(--nb-black)]"
      >
        <ImageIcon className="size-4" strokeWidth={2.5} aria-hidden />
        {open ? 'Masquer images' : 'Éditer images'}
      </button>
      {open ? (
        <div className="mt-3 space-y-3">
          {loading || !values ? (
            <p className="flex items-center gap-2 text-sm font-bold text-[var(--nb-black)]">
              <Loader2 className="size-4 animate-spin" aria-hidden />
              Chargement…
            </p>
          ) : (
            <>
              <p className="text-xs leading-relaxed text-[var(--bw-text-muted)]">
                <strong className="text-[var(--bw-text)]">Clique sur la carte</strong>{' '}
                de chaque rôle ou glisse une image. PNG, JPEG, WebP, GIF — stockage
                en base. Retire pour l’image par défaut du site. Les anciennes URL
                HTTPS restent valides si tu ne les remplaces pas.
              </p>
              <RoleImageFileFields
                values={values}
                onChange={(patch) =>
                  setValues((prev) =>
                    prev ? { ...prev, ...patch } : prev
                  )
                }
              />
              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  disabled={saving}
                  onClick={() => void onSave()}
                  className="nb-btn-primary text-sm"
                >
                  {saving ? (
                    <>
                      <Loader2 className="size-4 animate-spin" aria-hidden />
                      …
                    </>
                  ) : (
                    <>
                      <Save className="size-4" strokeWidth={2.5} aria-hidden />
                      Enregistrer
                    </>
                  )}
                </button>
                <button
                  type="button"
                  disabled={saving}
                  onClick={() => void load()}
                  className="inline-flex items-center gap-1.5 border-[3px] border-[var(--nb-black)] bg-[var(--nb-mint)] px-3 py-2 text-xs font-extrabold uppercase tracking-wide text-[var(--nb-black)] shadow-[3px_3px_0_0_var(--nb-black)] hover:brightness-105 disabled:opacity-50"
                >
                  <RefreshCw className="size-4" strokeWidth={2.5} aria-hidden />
                  Recharger
                </button>
              </div>
              {msg ? (
                <p className="text-sm font-bold text-[var(--nb-black)]">{msg}</p>
              ) : null}
            </>
          )}
        </div>
      ) : null}
    </div>
  );
}
