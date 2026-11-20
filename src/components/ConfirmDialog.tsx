import { useEffect, useId, useRef } from 'react';
import type { ReactNode } from 'react';

type Props = { open: boolean; title: string; children: ReactNode; confirmLabel: string; danger?: boolean; onConfirm: () => void; onCancel: () => void };

// Native <dialog> gives focus trapping and Escape handling without a dependency.
export default function ConfirmDialog({ open, title, children, confirmLabel, danger, onConfirm, onCancel }: Props) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);
  return <dialog ref={ref} className="dialog" aria-labelledby={titleId} onClose={onCancel} onClick={event => { if (event.target === ref.current) onCancel(); }}>
    <h2 id={titleId}>{title}</h2>
    <div className="dialog-body">{children}</div>
    <div className="dialog-actions">
      <button type="button" className="btn btn-secondary" onClick={onCancel}>Cancel</button>
      <button type="button" className={danger ? 'btn btn-danger' : 'btn btn-primary'} onClick={onConfirm}>{confirmLabel}</button>
    </div>
  </dialog>;
}
