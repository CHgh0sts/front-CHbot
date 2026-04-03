'use client';

import {
  Check,
  Copy,
  Pencil,
  PartyPopper,
  Plus,
  Ticket,
  Trash2,
} from 'lucide-react';
import { useCallback, useState } from 'react';
import { toast } from 'sonner';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { CreatePresetDialog } from '@/components/CreatePresetDialog';
import { PresetImagesEditor } from '@/components/PresetImagesEditor';

type ExistingRow = {
  publicCode: string;
  name: string | null;
  createdAt: Date | string;
};

export function PartyConfigForm({
  existing,
  isPremium,
}: {
  existing: ExistingRow[];
  isPremium: boolean;
}) {
  const [createdCode, setCreatedCode] = useState<string | null>(null);
  const [list, setList] = useState(existing);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<'create' | 'edit'>('create');
  const [editPublicCode, setEditPublicCode] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const flashCopied = useCallback((code: string) => {
    void navigator.clipboard.writeText(code);
    setCopiedCode(code);
    toast.success(`Code ${code} copié`);
    window.setTimeout(() => setCopiedCode((c) => (c === code ? null : c)), 2000);
  }, []);

  const executeDelete = useCallback(async (publicCode: string) => {
    const res = await fetch(
      `/api/party-presets/${encodeURIComponent(publicCode)}`,
      { method: 'DELETE' }
    );
    if (!res.ok) {
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      toast.error(data.error ?? 'Suppression impossible');
      return;
    }
    setList((prev) => prev.filter((p) => p.publicCode !== publicCode));
    if (createdCode === publicCode) setCreatedCode(null);
    setConfirmDelete(null);
    toast.success(`Preset ${publicCode} supprimé`);
  }, [createdCode]);

  return (
    <div className="space-y-10">
      <ConfirmDialog
        open={confirmDelete !== null}
        title="Supprimer le preset"
        description={`Le preset « ${confirmDelete} » sera supprimé définitivement. Cette action est irréversible.`}
        confirmLabel="Supprimer"
        cancelLabel="Annuler"
        variant="danger"
        onConfirm={() => { if (confirmDelete) void executeDelete(confirmDelete); }}
        onCancel={() => setConfirmDelete(null)}
      />
      <CreatePresetDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        isPremium={isPremium}
        mode={dialogMode}
        editPublicCode={editPublicCode}
        onSuccess={({ publicCode, name, mode }) => {
          if (mode === 'create') {
            setCreatedCode(publicCode);
            setList((prev) => [
              {
                publicCode,
                name,
                createdAt: new Date(),
              },
              ...prev,
            ]);
          } else {
            setList((prev) =>
              prev.map((r) =>
                r.publicCode === publicCode ? { ...r, name } : r
              )
            );
          }
        }}
      />

      {createdCode ? (
        <div className="nb-card border-[var(--nb-black)] bg-[var(--nb-mint)] p-6 text-[var(--nb-black)]">
          <p className="flex items-center gap-2 font-display text-xl font-bold">
            <PartyPopper className="size-7 shrink-0" strokeWidth={2.5} />
            Preset créé
          </p>
          <p className="mt-4 inline-block border-[3px] border-[var(--nb-black)] bg-[var(--nb-white)] px-4 py-3 font-mono text-2xl font-black tracking-[0.35em] shadow-[4px_4px_0_0_var(--nb-black)]">
            {createdCode}
          </p>
          <p className="mt-4 text-sm font-bold leading-relaxed">
            Discord →{' '}
            <code className="border-[2px] border-[var(--nb-black)] bg-[var(--nb-yellow)] px-1.5 py-0.5 font-mono text-xs">
              /lg-init
            </code>{' '}
            · option <strong>preset</strong> ={' '}
            <span className="font-mono">{createdCode}</span>
          </p>
        </div>
      ) : null}

      <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
        <button
          type="button"
          onClick={() => {
            setDialogMode('create');
            setEditPublicCode(null);
            setDialogOpen(true);
          }}
          className="nb-btn-primary inline-flex w-full items-center justify-center gap-2 px-8 py-4 text-sm sm:w-auto"
        >
          <Plus className="size-5 shrink-0" strokeWidth={2.5} aria-hidden />
          Créer un nouveau preset
        </button>
      </div>

      {list.length > 0 ? (
        <section>
          <h2 className="font-display mb-4 flex items-center gap-2 text-xl font-bold text-[var(--nb-black)]">
            <Ticket className="size-6" strokeWidth={2.5} />
            Tes codes
          </h2>
          <ul className="space-y-3 text-sm">
            {list.map((p) => (
              <li key={p.publicCode} className="bw-card px-4 py-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex min-w-0 flex-1 flex-wrap items-baseline gap-x-3 gap-y-1">
                    <span className="font-mono font-semibold tracking-wider">
                      {p.publicCode}
                    </span>
                    <span className="text-[var(--bw-text-muted)]">
                      {p.name ?? '—'} ·{' '}
                      {new Date(p.createdAt).toLocaleDateString('fr-FR')}
                    </span>
                  </div>
                  <div className="flex shrink-0 items-center gap-1">
                    <button
                      type="button"
                      onClick={() => flashCopied(p.publicCode)}
                      className="flex size-10 items-center justify-center border-[3px] border-[var(--nb-black)] bg-[var(--nb-white)] text-[var(--nb-black)] shadow-[2px_2px_0_0_var(--nb-black)] transition hover:bg-[var(--nb-mint)]/50"
                      title="Copier le code"
                      aria-label={`Copier le code ${p.publicCode}`}
                    >
                      {copiedCode === p.publicCode ? (
                        <Check
                          className="size-5 text-green-700"
                          strokeWidth={2.5}
                          aria-hidden
                        />
                      ) : (
                        <Copy className="size-5" strokeWidth={2.5} aria-hidden />
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setDialogMode('edit');
                        setEditPublicCode(p.publicCode);
                        setDialogOpen(true);
                      }}
                      className="flex size-10 items-center justify-center border-[3px] border-[var(--nb-black)] bg-[var(--nb-white)] text-[var(--nb-black)] shadow-[2px_2px_0_0_var(--nb-black)] transition hover:bg-[var(--nb-yellow)]/60"
                      title="Modifier le preset"
                      aria-label={`Modifier le preset ${p.publicCode}`}
                    >
                      <Pencil className="size-5" strokeWidth={2.5} aria-hidden />
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmDelete(p.publicCode)}
                      className="flex size-10 items-center justify-center border-[3px] border-[var(--nb-black)] bg-[var(--nb-white)] text-[var(--nb-black)] shadow-[2px_2px_0_0_var(--nb-black)] transition hover:bg-[#ffb4a8]/80"
                      title="Supprimer le preset"
                      aria-label={`Supprimer le preset ${p.publicCode}`}
                    >
                      <Trash2 className="size-5" strokeWidth={2.5} aria-hidden />
                    </button>
                  </div>
                </div>
                <PresetImagesEditor
                  publicCode={p.publicCode}
                  isPremium={isPremium}
                />
              </li>
            ))}
          </ul>
        </section>
      ) : (
        <div className="nb-card flex flex-col items-center p-10 text-center">
          <div className="mb-4 inline-flex border-[3px] border-[var(--nb-black)] bg-[var(--nb-yellow)] p-3 shadow-[3px_3px_0_0_var(--nb-black)]">
            <Ticket className="size-8 text-[var(--nb-black)]" strokeWidth={2.5} />
          </div>
          <p className="font-display text-lg font-bold text-[var(--nb-black)]">
            Pas encore de preset
          </p>
          <p className="mt-2 max-w-sm text-sm text-[var(--bw-text-muted)]">
            Crée ton premier preset pour sauvegarder ta composition de
            Loup-Garou favorite et la lancer rapidement sur Discord.
          </p>
        </div>
      )}
    </div>
  );
}
