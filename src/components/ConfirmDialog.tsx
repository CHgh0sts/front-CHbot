'use client';

import { AlertTriangle, X } from 'lucide-react';
import { useEffect, useId, useRef, useState, useCallback } from 'react';

type Props = {
  open: boolean;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'warning';
  onConfirm: () => void | Promise<void>;
  onCancel: () => void;
};

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = 'Confirmer',
  cancelLabel = 'Annuler',
  variant = 'danger',
  onConfirm,
  onCancel,
}: Props) {
  const titleId = useId();
  const cancelRef = useRef<HTMLButtonElement>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (open) cancelRef.current?.focus();
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !busy) onCancel();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, busy, onCancel]);

  const handleConfirm = useCallback(async () => {
    setBusy(true);
    try {
      await onConfirm();
    } finally {
      setBusy(false);
    }
  }, [onConfirm]);

  if (!open) return null;

  const accentBg =
    variant === 'danger' ? 'bg-[var(--nb-coral)]' : 'bg-[var(--nb-yellow)]';
  const confirmBtnClass =
    variant === 'danger'
      ? 'nb-btn-coral'
      : 'nb-btn-primary';

  return (
    <div
      className="fixed inset-0 z-[300] flex items-center justify-center p-4"
      role="presentation"
    >
      <button
        type="button"
        aria-label="Fermer"
        disabled={busy}
        className="absolute inset-0 bg-black/60 backdrop-blur-[2px]"
        onClick={() => !busy && onCancel()}
      />
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative w-full max-w-sm border-[3px] border-[var(--nb-black)] bg-[var(--nb-cream)] shadow-[8px_8px_0_0_var(--nb-black)]"
      >
        <header
          className={`flex items-center gap-3 border-b-[3px] border-[var(--nb-black)] ${accentBg} px-4 py-3`}
        >
          <AlertTriangle className="size-5 shrink-0" strokeWidth={2.5} />
          <h2
            id={titleId}
            className="font-display text-base font-bold leading-tight text-[var(--nb-black)]"
          >
            {title}
          </h2>
          <button
            type="button"
            disabled={busy}
            onClick={() => !busy && onCancel()}
            className="ml-auto flex size-8 items-center justify-center border-[3px] border-[var(--nb-black)] bg-[var(--nb-white)] text-[var(--nb-black)] shadow-[2px_2px_0_0_var(--nb-black)] transition hover:bg-[var(--nb-mint)]"
            aria-label="Fermer"
          >
            <X className="size-4" strokeWidth={2.5} />
          </button>
        </header>
        {description && (
          <div className="px-4 py-4 text-sm font-medium leading-relaxed text-[var(--nb-black)]">
            {description}
          </div>
        )}
        <footer className="flex gap-2 border-t-[3px] border-[var(--nb-black)] bg-[var(--nb-white)] px-4 py-3">
          <button
            ref={cancelRef}
            type="button"
            disabled={busy}
            onClick={() => !busy && onCancel()}
            className="nb-btn-ghost flex-1 px-4 py-2.5 text-xs"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={() => void handleConfirm()}
            className={`${confirmBtnClass} flex-1 px-4 py-2.5 text-xs`}
          >
            {confirmLabel}
          </button>
        </footer>
      </div>
    </div>
  );
}
