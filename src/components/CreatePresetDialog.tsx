'use client';

import {
  Loader2,
  ListChecks,
  Save,
  Settings2,
  Users,
  X,
} from 'lucide-react';
import { useEffect, useId, useRef, useState } from 'react';
import { PresetRoleCardsGrid } from '@/components/PresetRoleCardsGrid';
import type { RoleImageFieldValue } from '@/components/RoleImageFileFields';
import { BOT_ROLE_KEYS, type BotRoleKey } from '@/lib/role-keys';
import type { CompositionConfigJson } from '@/lib/party-preset-schema';
import {
  compositionConfigJsonSchema,
  defaultCompositionFormValues,
} from '@/lib/party-preset-schema';

const OPTION_ROWS: {
  label: string;
  comp: keyof CompositionConfigJson;
}[] = [
  { label: 'Rôles des morts visibles', comp: 'revealDeadRoles' },
  { label: 'Nuit sombre', comp: 'darkNightMode' },
  { label: 'Voyante bavarde', comp: 'gossipSeerMode' },
  { label: 'Ménage à trois (Cupidon)', comp: 'tripleLoversMode' },
  { label: 'Protection publique (nuit)', comp: 'announceNightProtection' },
];

type FormTab = 'config' | 'options' | 'roles';

const FORM_TABS: {
  id: FormTab;
  label: string;
  Icon: typeof Settings2;
}[] = [
  { id: 'config', label: 'Configuration', Icon: Settings2 },
  { id: 'options', label: 'Options', Icon: ListChecks },
  { id: 'roles', label: 'Rôles', Icon: Users },
];

function optionRow(
  fieldKey: keyof CompositionConfigJson,
  label: string,
  checked: boolean,
  onChange: (v: boolean) => void
) {
  return (
    <label
      key={fieldKey}
      className="flex cursor-pointer items-center gap-3 border-[2px] border-transparent py-1.5 pl-1 text-sm font-bold text-[var(--nb-black)] hover:border-[var(--nb-black)] hover:bg-[var(--nb-mint)]/30"
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="size-5 border-[3px] border-[var(--nb-black)] text-[var(--nb-coral)] focus:ring-[var(--nb-black)]"
      />
      {label}
    </label>
  );
}

export function CreatePresetDialog({
  open,
  onClose,
  isPremium,
  mode,
  editPublicCode,
  onSuccess,
}: {
  open: boolean;
  onClose: () => void;
  isPremium: boolean;
  mode: 'create' | 'edit';
  editPublicCode: string | null;
  onSuccess: (payload: {
    publicCode: string;
    name: string | null;
    mode: 'create' | 'edit';
  }) => void;
}) {
  const titleId = useId();
  const closeRef = useRef<HTMLButtonElement>(null);

  const [comp, setComp] =
    useState<CompositionConfigJson>(defaultCompositionFormValues);
  const [presetName, setPresetName] = useState('');
  const [roleImages, setRoleImages] = useState<
    Partial<Record<BotRoleKey, RoleImageFieldValue | null>>
  >({});
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [formTab, setFormTab] = useState<FormTab>('config');

  const busy = loading || fetchLoading;
  const showForm =
    mode === 'create' ? !fetchLoading : !fetchLoading && loadError === null;

  useEffect(() => {
    if (!open) {
      setFetchLoading(false);
      return;
    }
    setError(null);
    setLoadError(null);
    setFormTab('config');
    setLoading(false);

    if (mode === 'create' || !editPublicCode) {
      setFetchLoading(false);
      setComp(defaultCompositionFormValues);
      setPresetName('');
      setRoleImages({});
      const t = window.setTimeout(() => closeRef.current?.focus(), 0);
      return () => window.clearTimeout(t);
    }

    let cancelled = false;
    setFetchLoading(true);
    (async () => {
      try {
        const res = await fetch(
          `/api/party-presets/${encodeURIComponent(editPublicCode)}`
        );
        const data = (await res.json().catch(() => ({}))) as {
          composition?: unknown;
          name?: string | null;
          roleImageOverrides?: Record<string, RoleImageFieldValue | null>;
          error?: string;
        };
        if (cancelled) return;
        if (!res.ok) {
          setLoadError(data.error ?? 'Chargement impossible');
          setFetchLoading(false);
          return;
        }
        const compParsed = compositionConfigJsonSchema.safeParse(
          data.composition
        );
        if (!compParsed.success) {
          setLoadError('Composition en base invalide');
          setFetchLoading(false);
          return;
        }
        setComp(compParsed.data);
        setPresetName(data.name ?? '');
        const imgs: Partial<Record<BotRoleKey, RoleImageFieldValue | null>> =
          {};
        for (const k of BOT_ROLE_KEYS) {
          const v = data.roleImageOverrides?.[k];
          imgs[k] = v === undefined ? null : v;
        }
        setRoleImages(imgs);
      } catch {
        if (!cancelled) setLoadError('Réseau');
      }
      if (!cancelled) setFetchLoading(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [open, mode, editPublicCode]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !busy) onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, busy, onClose]);

  function set<K extends keyof CompositionConfigJson>(
    key: K,
    value: CompositionConfigJson[K]
  ) {
    setComp((c) => ({ ...c, [key]: value }));
  }

  function setRoleImage(key: BotRoleKey, next: RoleImageFieldValue | null) {
    setRoleImages((prev) => ({ ...prev, [key]: next }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const roleImageOverrides = Object.fromEntries(
        BOT_ROLE_KEYS.map((k) => [k, roleImages[k] ?? null])
      );
      const hasAnyImage = BOT_ROLE_KEYS.some((k) => {
        const v = roleImages[k];
        if (v == null) return false;
        if (typeof v === 'string') return v.trim() !== '';
        return Boolean(v.data?.trim());
      });

      if (mode === 'edit' && editPublicCode) {
        const body: Record<string, unknown> = {
          name: presetName.trim() || null,
          composition: comp,
        };
        if (isPremium) {
          body.roleImageOverrides = roleImageOverrides;
        }
        const res = await fetch(
          `/api/party-presets/${encodeURIComponent(editPublicCode)}`,
          {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
          }
        );
        const data = (await res.json().catch(() => ({}))) as {
          error?: string;
        };
        if (!res.ok) {
          setError(data.error ?? 'Erreur');
          setLoading(false);
          return;
        }
        onSuccess({
          publicCode: editPublicCode,
          name: presetName.trim() || null,
          mode: 'edit',
        });
        onClose();
        setLoading(false);
        return;
      }

      const res = await fetch('/api/party-presets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: presetName.trim() || undefined,
          composition: comp,
          ...(isPremium && hasAnyImage ? { roleImageOverrides } : {}),
        }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        publicCode?: string;
        error?: string;
      };
      if (!res.ok) {
        setError(data.error ?? 'Erreur');
        setLoading(false);
        return;
      }
      if (data.publicCode) {
        onSuccess({
          publicCode: data.publicCode,
          name: presetName.trim() || null,
          mode: 'create',
        });
        onClose();
      }
    } catch {
      setError('Réseau');
    }
    setLoading(false);
  }

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[200] flex items-end justify-center p-0 sm:items-center sm:p-4"
      role="presentation"
    >
      <button
        type="button"
        aria-label="Fermer"
        disabled={busy}
        className="absolute inset-0 bg-black/60 backdrop-blur-[2px]"
        onClick={() => {
          if (!busy) onClose();
        }}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative flex max-h-[min(92dvh,900px)] w-full max-w-2xl flex-col border-[3px] border-[var(--nb-black)] bg-[var(--nb-cream)] shadow-[8px_8px_0_0_var(--nb-black)] sm:rounded-sm"
      >
        <header className="flex shrink-0 items-start justify-between gap-3 border-b-[3px] border-[var(--nb-black)] bg-[var(--nb-yellow)] px-4 py-3 sm:px-5">
          <h2
            id={titleId}
            className="font-display text-lg font-bold leading-tight text-[var(--nb-black)] sm:text-xl"
          >
            {mode === 'edit' && editPublicCode
              ? `Modifier · ${editPublicCode}`
              : 'Nouveau preset'}
          </h2>
          <button
            ref={closeRef}
            type="button"
            disabled={busy}
            onClick={() => !busy && onClose()}
            className="flex size-10 shrink-0 items-center justify-center border-[3px] border-[var(--nb-black)] bg-[var(--nb-white)] text-[var(--nb-black)] shadow-[3px_3px_0_0_var(--nb-black)] transition hover:bg-[var(--nb-mint)] disabled:opacity-50"
            aria-label="Fermer la fenêtre"
          >
            <X className="size-5" strokeWidth={2.5} />
          </button>
        </header>

        <form
          onSubmit={(e) => void onSubmit(e)}
          className="flex min-h-0 flex-1 flex-col"
        >
          <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4 sm:px-5 sm:py-5">
            <div className="space-y-6">
              {fetchLoading ? (
                <p className="flex items-center gap-2 font-bold text-[var(--nb-black)]">
                  <Loader2 className="size-5 animate-spin" aria-hidden />
                  Chargement du preset…
                </p>
              ) : null}
              {loadError ? (
                <p className="border-[3px] border-[var(--nb-black)] bg-[#ffb4a8] px-4 py-3 text-sm font-bold text-[var(--nb-black)] shadow-[4px_4px_0_0_var(--nb-black)]">
                  {loadError}
                </p>
              ) : null}
              {error ? (
                <p className="border-[3px] border-[var(--nb-black)] bg-[#ffb4a8] px-4 py-3 text-sm font-bold text-[var(--nb-black)] shadow-[4px_4px_0_0_var(--nb-black)]">
                  {error}
                </p>
              ) : null}

              {showForm ? (
              <>
              <div
                className="flex flex-col gap-2 sm:flex-row sm:flex-wrap"
                role="tablist"
                aria-label="Sections du formulaire"
              >
                {FORM_TABS.map(({ id, label, Icon }) => {
                  const selected = formTab === id;
                  return (
                    <button
                      key={id}
                      type="button"
                      role="tab"
                      aria-selected={selected}
                      aria-controls={`dialog-panel-${id}`}
                      id={`dialog-tab-${id}`}
                      onClick={() => setFormTab(id)}
                      className={`inline-flex flex-1 items-center justify-center gap-2 border-[3px] border-[var(--nb-black)] px-3 py-3 text-[10px] font-extrabold uppercase tracking-wide transition sm:min-w-[7.5rem] sm:text-xs ${
                        selected
                          ? 'bg-[var(--nb-yellow)] text-[var(--nb-black)] shadow-[4px_4px_0_0_var(--nb-black)]'
                          : 'bg-[var(--nb-white)] text-[var(--nb-black)] shadow-[2px_2px_0_0_var(--nb-black)] hover:bg-[var(--nb-mint)]/40'
                      }`}
                    >
                      <Icon
                        className="size-4 shrink-0 sm:size-5"
                        strokeWidth={2.5}
                        aria-hidden
                      />
                      {label}
                    </button>
                  );
                })}
              </div>

              {formTab === 'config' ? (
                <fieldset
                  id="dialog-panel-config"
                  className="nb-card space-y-4 p-4 sm:p-5"
                  role="tabpanel"
                  aria-labelledby="dialog-tab-config"
                >
                  <legend className="font-display flex items-center gap-2 px-1 text-base font-bold text-[var(--nb-black)]">
                    <Settings2 className="size-5 shrink-0" strokeWidth={2.5} />
                    Configuration
                  </legend>
                  <div>
                    <label className="mb-2 block text-xs font-extrabold uppercase tracking-wider text-[var(--nb-black)]">
                      Nom du preset (optionnel)
                    </label>
                    <input
                      type="text"
                      value={presetName}
                      onChange={(e) => setPresetName(e.target.value)}
                      maxLength={120}
                      className="bw-input max-w-md"
                      placeholder="ex. Soirée classique"
                    />
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <label className="block text-sm font-bold text-[var(--nb-black)]">
                      <span className="mb-2 block text-xs font-extrabold uppercase tracking-wide opacity-80">
                        Min. joueurs (4–18)
                      </span>
                      <input
                        type="number"
                        min={4}
                        max={18}
                        value={comp.minPlayers}
                        onChange={(e) =>
                          set(
                            'minPlayers',
                            Number.parseInt(e.target.value, 10) || 4
                          )
                        }
                        className="bw-input"
                      />
                    </label>
                    <label className="block text-sm font-bold text-[var(--nb-black)]">
                      <span className="mb-2 block text-xs font-extrabold uppercase tracking-wide opacity-80">
                        Loups (auto si vide)
                      </span>
                      <select
                        value={
                          comp.wolfCount === null ? '' : String(comp.wolfCount)
                        }
                        onChange={(e) => {
                          const v = e.target.value;
                          set(
                            'wolfCount',
                            v === '' ? null : Number.parseInt(v, 10)
                          );
                        }}
                        className="bw-input"
                      >
                        <option value="">Auto</option>
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                          <option key={n} value={n}>
                            {n}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className="block text-sm font-bold text-[var(--nb-black)] sm:col-span-2">
                      <span className="mb-2 block text-xs font-extrabold uppercase tracking-wide opacity-80">
                        Villageois fixes
                      </span>
                      <select
                        value={
                          comp.villagerCount === null
                            ? ''
                            : String(comp.villagerCount)
                        }
                        onChange={(e) => {
                          const v = e.target.value;
                          set(
                            'villagerCount',
                            v === '' ? null : Number.parseInt(v, 10)
                          );
                        }}
                        className="bw-input max-w-xl"
                      >
                        <option value="">Auto (recommandé)</option>
                        {Array.from({ length: 19 }, (_, i) => i).map((n) => (
                          <option key={n} value={n}>
                            {n}
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>
                </fieldset>
              ) : null}

              {formTab === 'options' ? (
                <fieldset
                  id="dialog-panel-options"
                  className="nb-card space-y-3 p-4 sm:p-5"
                  role="tabpanel"
                  aria-labelledby="dialog-tab-options"
                >
                  <legend className="font-display flex items-center gap-2 px-1 text-base font-bold text-[var(--nb-black)]">
                    <ListChecks className="size-5 shrink-0" strokeWidth={2.5} />
                    Options
                  </legend>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {OPTION_ROWS.map(({ label, comp: field }) =>
                      optionRow(
                        field,
                        label,
                        comp[field] as boolean,
                        (v) => set(field, v)
                      )
                    )}
                  </div>
                </fieldset>
              ) : null}

              {formTab === 'roles' ? (
                <>
                  <fieldset
                    id="dialog-panel-roles"
                    className="nb-card space-y-3 p-4 sm:p-5"
                    role="tabpanel"
                    aria-labelledby="dialog-tab-roles"
                  >
                    <legend className="font-display flex items-center gap-2 px-1 text-base font-bold text-[var(--nb-black)]">
                      <Users className="size-5 shrink-0" strokeWidth={2.5} />
                      Rôles
                    </legend>
                    <PresetRoleCardsGrid
                      comp={comp}
                      onCompositionChange={set}
                      roleImages={roleImages}
                      onRoleImageChange={setRoleImage}
                      isPremium={isPremium}
                    />
                  </fieldset>
                  {!isPremium ? (
                    <p className="nb-card border-[var(--nb-black)] bg-[var(--nb-lilac)]/20 px-3 py-2 text-xs font-bold text-[var(--nb-black)]">
                      Sans Premium : images du site uniquement ici ; tu pourras
                      éditer par code après création.
                    </p>
                  ) : null}
                </>
              ) : null}
              </>
              ) : null}
            </div>
          </div>

          <footer className="shrink-0 border-t-[3px] border-[var(--nb-black)] bg-[var(--nb-white)] px-4 py-3 sm:px-5">
            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                disabled={loading}
                onClick={() => !loading && onClose()}
                className="nb-btn-ghost px-6 py-3 text-xs"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={loading || !showForm}
                className="nb-btn-primary inline-flex items-center justify-center gap-2 px-8 py-3 text-xs sm:text-sm"
              >
                {loading ? (
                  <>
                    <Loader2 className="size-5 animate-spin" aria-hidden />
                    Enregistrement…
                  </>
                ) : (
                  <>
                    <Save className="size-5" strokeWidth={2.5} aria-hidden />
                    {mode === 'edit'
                      ? 'Enregistrer'
                      : 'Créer le preset'}
                  </>
                )}
              </button>
            </div>
          </footer>
        </form>
      </div>
    </div>
  );
}
