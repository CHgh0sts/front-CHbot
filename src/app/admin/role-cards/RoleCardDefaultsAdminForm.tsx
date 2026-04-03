'use client';

import { Loader2 } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import {
  RoleImageFileFields,
  type RoleImageFieldValue,
} from '@/components/RoleImageFileFields';
import { BOT_ROLE_KEYS, type BotRoleKey } from '@/lib/role-keys';

function emptyValues(): Record<BotRoleKey, RoleImageFieldValue | null> {
  return Object.fromEntries(BOT_ROLE_KEYS.map((k) => [k, null])) as Record<
    BotRoleKey,
    RoleImageFieldValue | null
  >;
}

export function RoleCardDefaultsAdminForm() {
  const [values, setValues] =
    useState<Record<BotRoleKey, RoleImageFieldValue | null>>(emptyValues);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const persistDefaults = useCallback(
    async (next: Record<BotRoleKey, RoleImageFieldValue | null>) => {
      setSaving(true);
      setMsg(null);
      try {
        const defaults: Record<string, { mime: string; data: string } | null> = {};
        for (const k of BOT_ROLE_KEYS) {
          const v = next[k];
          if (v === null || v === undefined) {
            defaults[k] = null;
            continue;
          }
          if (typeof v === 'string') {
            defaults[k] = null;
            continue;
          }
          defaults[k] = { mime: v.mime, data: v.data };
        }
        const res = await fetch('/api/admin/role-card-defaults', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ defaults }),
        });
        const data = (await res.json().catch(() => ({}))) as {
          error?: string;
          defaults?: Record<string, { mime: string; data: string }>;
        };
        if (!res.ok) {
          setMsg(data.error ?? 'Erreur');
          setSaving(false);
          return;
        }
        if (data.defaults) {
          const merged = emptyValues();
          for (const k of BOT_ROLE_KEYS) {
            const row = data.defaults[k];
            merged[k] = row ? { mime: row.mime as never, data: row.data } : null;
          }
          setValues(merged);
        }
        setMsg('Enregistré.');
      } catch {
        setMsg('Réseau');
      }
      setSaving(false);
    },
    []
  );

  const handleValuesChange = useCallback(
    (partial: Partial<Record<BotRoleKey, RoleImageFieldValue>>) => {
      setValues((prev) => {
        const next = { ...prev, ...partial } as Record<
          BotRoleKey,
          RoleImageFieldValue | null
        >;
        void persistDefaults(next);
        return next;
      });
    },
    [persistDefaults]
  );

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/admin/role-card-defaults');
        const data = (await res.json().catch(() => ({}))) as {
          defaults?: Record<string, { mime: string; data: string }>;
          error?: string;
        };
        if (!cancelled && res.ok && data.defaults) {
          const next = emptyValues();
          for (const k of BOT_ROLE_KEYS) {
            const row = data.defaults[k];
            next[k] = row ? { mime: row.mime as never, data: row.data } : null;
          }
          setValues(next);
        }
      } catch {
        /* ignore */
      }
      if (!cancelled) setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return <p className="text-[var(--bw-text-muted)]">Chargement…</p>;
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start gap-3">
        <p className="min-w-0 flex-1 text-sm leading-relaxed text-[var(--bw-text-muted)]">
          <strong className="text-[var(--bw-text)]">Survole l’image</strong> pour voir le
          nom du rôle et les actions (icônes crayon / poubelle), ou glisse un fichier.
          Les changements sont <strong className="text-[var(--bw-text)]">enregistrés
          automatiquement</strong>. Formats <strong>PNG, JPEG, WebP ou GIF</strong> (≈
          1,5 Mo max).
        </p>
        {saving ? (
          <span
            className="inline-flex shrink-0 items-center gap-1.5 border-[3px] border-[var(--nb-black)] bg-[var(--nb-white)] px-2 py-1 text-xs font-bold uppercase tracking-wide text-[var(--nb-black)] shadow-[3px_3px_0_0_var(--nb-black)]"
            aria-live="polite"
          >
            <Loader2 className="size-3.5 animate-spin" aria-hidden />
            Enregistrement…
          </span>
        ) : null}
      </div>
      <RoleImageFileFields values={values} onChange={handleValuesChange} />
      {msg ? (
        <p className="text-sm text-[var(--bw-text-muted)]">{msg}</p>
      ) : null}
    </div>
  );
}
