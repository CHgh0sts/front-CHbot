'use client';

import { ImagePlus, Pencil, Trash2 } from 'lucide-react';
import { useCallback, useId, useState } from 'react';
import {
  BOT_ROLE_KEYS,
  BOT_ROLE_LABELS_FR,
  type BotRoleKey,
} from '@/lib/role-keys';
import type { RoleImageStored } from '@/lib/role-image-storage';
import { parseDataUrlToStored } from '@/lib/role-image-storage';

/** `string` = URL HTTPS encore présente en base (legacy) ; objet = fichier uploadé. */
export type RoleImageFieldValue = RoleImageStored | string | null;

function previewSrc(v: RoleImageFieldValue | undefined): string | undefined {
  if (v == null || v === undefined) return undefined;
  if (typeof v === 'string') {
    const t = v.trim();
    return t || undefined;
  }
  return `data:${v.mime};base64,${v.data}`;
}

export function RoleImageFileFields({
  values,
  onChange,
}: {
  values: Partial<Record<BotRoleKey, RoleImageFieldValue>>;
  onChange: (next: Partial<Record<BotRoleKey, RoleImageFieldValue>>) => void;
}) {
  const baseId = useId();
  const [fileError, setFileError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState<BotRoleKey | null>(null);

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
        onChange({ ...values, [key]: parsed });
      };
      reader.readAsDataURL(file);
    },
    [onChange, values]
  );

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
      {fileError ? (
        <p className="col-span-full border-[3px] border-[var(--nb-black)] bg-[#ffb4a8] px-4 py-3 text-sm font-bold text-[var(--nb-black)] shadow-[4px_4px_0_0_var(--nb-black)]">
          {fileError}
        </p>
      ) : null}
      {BOT_ROLE_KEYS.map((key) => {
        const v = values[key];
        const src = previewSrc(v);
        const inputId = `${baseId}-${key}`;
        const isDrag = dragOver === key;

        return (
          <div key={key} className="nb-card overflow-hidden p-0">
            <div
              className={`group relative aspect-square w-full overflow-hidden bg-[var(--nb-black)] ${!src ? 'border-[3px] border-dashed border-[var(--nb-black)] bg-[var(--nb-mint)]/35' : ''} ${isDrag ? 'ring-[3px] ring-[var(--nb-coral)] ring-offset-2 ring-offset-[var(--nb-white)]' : ''} transition-shadow`}
              onDragOver={(e) => {
                e.preventDefault();
                e.dataTransfer.dropEffect = 'copy';
                setDragOver(key);
              }}
              onDragLeave={() => setDragOver((d) => (d === key ? null : d))}
              onDrop={(e) => {
                e.preventDefault();
                setDragOver(null);
                const f = e.dataTransfer.files?.[0];
                applyFile(f, key);
              }}
            >
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

              {src ? (
                <>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={src}
                    alt=""
                    className="pointer-events-none absolute inset-0 size-full object-cover"
                  />
                  <div className="pointer-events-none absolute inset-0 flex flex-col bg-[var(--nb-black)]/0 transition-colors group-hover:pointer-events-auto group-hover:bg-[var(--nb-black)]/50 group-focus-within:pointer-events-auto group-focus-within:bg-[var(--nb-black)]/50">
                    <div className="flex justify-center px-2 pt-2 opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">
                      <span className="text-center text-xs font-extrabold uppercase tracking-wider text-[#fffef8] drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]">
                        {BOT_ROLE_LABELS_FR[key]}
                      </span>
                    </div>
                    <div className="flex flex-1 items-center justify-center gap-2 opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">
                      <button
                        type="button"
                        className="inline-flex size-9 shrink-0 items-center justify-center overflow-visible rounded-[var(--nb-radius)] border-[3px] border-[var(--nb-black)] bg-[var(--nb-yellow)] p-0 text-[#0c0c0c] shadow-[var(--nb-shadow-sm)] transition-[transform,box-shadow,background,filter] duration-100 ease-out hover:-translate-x-px hover:-translate-y-px hover:bg-[#fff200] hover:shadow-[var(--nb-shadow-hover)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--nb-black)] active:translate-x-[3px] active:translate-y-[3px] active:shadow-[2px_2px_0_var(--nb-black)]"
                        title="Changer l’image"
                        aria-label={`Changer l’image pour ${BOT_ROLE_LABELS_FR[key]}`}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          document.getElementById(inputId)?.click();
                        }}
                      >
                        <Pencil
                          size={18}
                          strokeWidth={2.5}
                          className="shrink-0"
                          aria-hidden
                        />
                      </button>
                      <button
                        type="button"
                        className="inline-flex size-9 shrink-0 items-center justify-center overflow-visible rounded-[var(--nb-radius)] border-[3px] border-[var(--nb-black)] bg-[var(--nb-coral)] p-0 text-[#fffef8] shadow-[var(--nb-shadow-sm)] transition-[transform,box-shadow,filter] duration-100 ease-out hover:-translate-x-px hover:-translate-y-px hover:shadow-[var(--nb-shadow-hover)] hover:brightness-105 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--nb-black)] active:translate-x-[3px] active:translate-y-[3px] active:brightness-100 active:shadow-[2px_2px_0_var(--nb-black)]"
                        title="Supprimer l’image"
                        aria-label={`Supprimer l’image pour ${BOT_ROLE_LABELS_FR[key]}`}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setFileError(null);
                          onChange({ ...values, [key]: null });
                        }}
                      >
                        <Trash2
                          size={18}
                          strokeWidth={2.5}
                          className="shrink-0"
                          aria-hidden
                        />
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <label
                  htmlFor={inputId}
                  className="flex h-full w-full cursor-pointer flex-col items-center justify-center gap-3 px-4 text-center transition-colors hover:bg-[var(--nb-yellow)]/50"
                >
                  <span
                    className="flex size-14 items-center justify-center border-[3px] border-[var(--nb-black)] bg-[var(--nb-white)] text-[var(--nb-coral)] shadow-[4px_4px_0_0_var(--nb-black)]"
                    aria-hidden
                  >
                    <ImagePlus className="size-7" strokeWidth={2.5} />
                  </span>
                  <span className="text-xs font-extrabold uppercase tracking-wide text-[var(--nb-black)]">
                    {BOT_ROLE_LABELS_FR[key]}
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--nb-black)] opacity-60">
                    Cliquer ou glisser · PNG · JPEG · WebP · GIF
                  </span>
                </label>
              )}
            </div>

            {typeof v === 'string' && v.trim().startsWith('https://') ? (
              <p className="border-t-[3px] border-[var(--nb-black)] bg-[var(--nb-lilac)]/40 px-2 py-1.5 text-[11px] font-bold leading-snug text-[var(--nb-black)]">
                URL actuelle — envoie un fichier pour passer en base.
              </p>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
