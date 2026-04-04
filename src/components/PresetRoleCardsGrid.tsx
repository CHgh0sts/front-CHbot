'use client';

import { ImagePlus, Pencil, Trash2 } from 'lucide-react';
import { useCallback, useId, useState, type CSSProperties } from 'react';
import type { RoleImageFieldValue } from '@/components/RoleImageFileFields';
import {
  BOT_ROLE_KEYS,
  BOT_ROLE_LABELS_FR,
  type BotRoleKey,
} from '@/lib/role-keys';
import type { CompositionConfigJson } from '@/lib/party-preset-schema';
import { parseDataUrlToStored } from '@/lib/role-image-storage';

const OPTIONAL_COMP: Partial<Record<BotRoleKey, keyof CompositionConfigJson>> = {
  SEER: 'includeSeer',
  WITCH: 'includeWitch',
  HUNTER: 'includeHunter',
  CUPID: 'includeCupid',
  GUARD: 'includeGuard',
  THIEF: 'includeThief',
  ANGEL: 'includeAngel',
  LITTLE_GIRL: 'includeLittleGirl',
  RAVEN: 'includeRaven',
  RED_RIDING_HOOD: 'includeRedRidingHood',
  FOOL_OF_VILLAGE: 'includeFoolOfVillage',
  ELDER: 'includeElder',
  BIG_BAD_WOLF: 'includeBigBadWolf',
};

const CORE_ROLES = new Set<BotRoleKey>(['WEREWOLF', 'VILLAGER']);

function previewSrc(v: RoleImageFieldValue | null | undefined): string | undefined {
  if (v == null || v === undefined) return undefined;
  if (typeof v === 'string') {
    const t = v.trim();
    return t || undefined;
  }
  return `data:${v.mime};base64,${v.data}`;
}

function isRoleSelected(key: BotRoleKey, comp: CompositionConfigJson): boolean {
  if (CORE_ROLES.has(key)) return true;
  const ck = OPTIONAL_COMP[key];
  if (!ck) return false;
  return comp[ck] as boolean;
}

const NAME_SHADOW: CSSProperties = {
  textShadow:
    '0 1px 0 #000, 0 2px 6px rgba(0,0,0,0.95), 0 0 12px rgba(0,0,0,0.9), 0 -1px 2px rgba(0,0,0,0.8)',
};

function PresetRoleNameBar({ roleKey }: { roleKey: BotRoleKey }) {
  return (
    <div
      className="pointer-events-none absolute inset-x-0 bottom-0 z-10 bg-gradient-to-t from-black/75 via-black/35 to-transparent px-1.5 pb-1.5 pt-6 text-center"
      aria-hidden
    >
      <span
        className="text-[10px] font-extrabold uppercase leading-tight tracking-wide text-[#fffef8]"
        style={NAME_SHADOW}
      >
        {BOT_ROLE_LABELS_FR[roleKey]}
      </span>
    </div>
  );
}

export function PresetRoleCardsGrid({
  comp,
  onCompositionChange,
  roleImages,
  onRoleImageChange,
  isPremium,
}: {
  comp: CompositionConfigJson;
  onCompositionChange: <K extends keyof CompositionConfigJson>(
    key: K,
    value: CompositionConfigJson[K]
  ) => void;
  roleImages: Partial<Record<BotRoleKey, RoleImageFieldValue | null>>;
  onRoleImageChange: (key: BotRoleKey, next: RoleImageFieldValue | null) => void;
  isPremium: boolean;
}) {
  const baseId = useId();
  const [fileError, setFileError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState<BotRoleKey | null>(null);
  const [defaultBroken, setDefaultBroken] = useState<Partial<Record<BotRoleKey, boolean>>>(
    {}
  );

  const applyFile = useCallback(
    (file: File | undefined, key: BotRoleKey) => {
      if (!file) return;
      if (!file.type.startsWith('image/')) {
        setFileError(
          `${BOT_ROLE_LABELS_FR[key]} : choisis une image (PNG, JPEG, WebP, GIF).`
        );
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        const text = reader.result;
        if (typeof text !== 'string') return;
        const parsed = parseDataUrlToStored(text);
        if ('error' in parsed) {
          setFileError(`${BOT_ROLE_LABELS_FR[key]} : ${parsed.error}`);
          return;
        }
        setFileError(null);
        onRoleImageChange(key, parsed);
      };
      reader.readAsDataURL(file);
    },
    [onRoleImageChange]
  );

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
      {fileError ? (
        <p className="col-span-full border-[3px] border-[var(--nb-black)] bg-[#ffb4a8] px-4 py-3 text-sm font-bold text-[var(--nb-black)] shadow-[4px_4px_0_0_var(--nb-black)]">
          {fileError}
        </p>
      ) : null}
      {BOT_ROLE_KEYS.map((key) => {
        const selected = isRoleSelected(key, comp);
        const optional = OPTIONAL_COMP[key] !== undefined;
        const compKey = OPTIONAL_COMP[key];
        const v = roleImages[key];
        const customSrc = previewSrc(v);
        const defaultUrl = `/api/public/role-card-default/${encodeURIComponent(key)}`;
        const showDefault = !customSrc && !defaultBroken[key];
        const displaySrc = customSrc ?? (showDefault ? defaultUrl : undefined);
        const inputId = `${baseId}-${key}`;
        const isDrag = dragOver === key;

        const borderSelected = 'border-[3px] border-solid border-emerald-500';
        const borderUnselected = 'border-[3px] border-solid border-red-500';

        function toggleOptional() {
          if (!optional || !compKey) return;
          onCompositionChange(compKey, !comp[compKey] as boolean);
        }

        return (
          <div key={key} className="nb-card overflow-hidden p-0">
            <div
              role={optional ? 'button' : undefined}
              tabIndex={optional ? 0 : undefined}
              onKeyDown={
                optional
                  ? (e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        toggleOptional();
                      }
                    }
                  : undefined
              }
              onClick={(e) => {
                if (!optional) return;
                if ((e.target as HTMLElement).closest('[data-preset-role-action]')) return;
                toggleOptional();
              }}
              className={`relative aspect-square w-full overflow-hidden bg-[var(--nb-black)] ${
                selected ? borderSelected : borderUnselected
              } ${optional ? 'cursor-pointer' : ''} ${
                isDrag && isPremium
                  ? 'ring-[3px] ring-[var(--nb-coral)] ring-offset-2 ring-offset-[var(--nb-white)]'
                  : ''
              }`}
              onDragOver={
                isPremium
                  ? (e) => {
                      e.preventDefault();
                      e.dataTransfer.dropEffect = 'copy';
                      setDragOver(key);
                    }
                  : undefined
              }
              onDragLeave={
                isPremium
                  ? () => setDragOver((d) => (d === key ? null : d))
                  : undefined
              }
              onDrop={
                isPremium
                  ? (e) => {
                      e.preventDefault();
                      setDragOver(null);
                      const f = e.dataTransfer.files?.[0];
                      applyFile(f, key);
                    }
                  : undefined
              }
            >
              {isPremium ? (
                <input
                  id={inputId}
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/gif"
                  className="sr-only"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    e.target.value = '';
                    applyFile(file, key);
                  }}
                />
              ) : null}

              {displaySrc ? (
                <>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={displaySrc}
                    alt=""
                    className={`pointer-events-none absolute inset-0 size-full object-cover ${!selected ? 'opacity-45 grayscale' : ''}`}
                    onError={() => {
                      if (!customSrc) {
                        setDefaultBroken((b) => ({ ...b, [key]: true }));
                      }
                    }}
                  />
                  {isPremium ? (
                    <div
                      className="absolute right-0.5 top-0.5 z-20 flex gap-0.5"
                      data-preset-role-action
                    >
                      <button
                        type="button"
                        className="inline-flex size-6 shrink-0 items-center justify-center rounded-[var(--nb-radius)] border-2 border-[var(--nb-black)] bg-[var(--nb-yellow)] p-0 text-[#0c0c0c] shadow-[2px_2px_0_0_var(--nb-black)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--nb-black)]"
                        title="Image personnalisée"
                        aria-label={`Changer l’image pour ${BOT_ROLE_LABELS_FR[key]}`}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          document.getElementById(inputId)?.click();
                        }}
                      >
                        <Pencil
                          size={12}
                          strokeWidth={2.25}
                          className="shrink-0"
                          aria-hidden
                        />
                      </button>
                      {customSrc ? (
                        <button
                          type="button"
                          className="inline-flex size-6 shrink-0 items-center justify-center rounded-[var(--nb-radius)] border-2 border-[var(--nb-black)] bg-[var(--nb-coral)] p-0 text-[#fffef8] shadow-[2px_2px_0_0_var(--nb-black)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--nb-black)]"
                          title="Retirer l’image perso"
                          aria-label={`Retirer l’image pour ${BOT_ROLE_LABELS_FR[key]}`}
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setFileError(null);
                            onRoleImageChange(key, null);
                          }}
                        >
                          <Trash2
                            size={12}
                            strokeWidth={2.25}
                            className="shrink-0"
                            aria-hidden
                          />
                        </button>
                      ) : null}
                    </div>
                  ) : null}
                  <PresetRoleNameBar roleKey={key} />
                </>
              ) : (
                <div
                  className={`relative flex h-full w-full flex-col items-center justify-center gap-2 px-2 pb-10 pt-4 text-center ${
                    selected ? 'bg-[var(--nb-mint)]/35' : 'bg-red-950/25'
                  }`}
                >
                  {isPremium ? (
                    <label
                      htmlFor={inputId}
                      data-preset-role-action
                      className="inline-flex cursor-pointer flex-col items-center gap-1"
                    >
                      <span className="flex size-10 items-center justify-center border-[3px] border-[var(--nb-black)] bg-[var(--nb-white)] text-[var(--nb-coral)] shadow-[3px_3px_0_0_var(--nb-black)]">
                        <ImagePlus className="size-5" strokeWidth={2.5} />
                      </span>
                      <span className="text-[9px] font-bold uppercase text-[#fffef8] [text-shadow:0_1px_3px_rgba(0,0,0,0.95)]">
                        Ajouter
                      </span>
                    </label>
                  ) : null}
                  <PresetRoleNameBar roleKey={key} />
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
