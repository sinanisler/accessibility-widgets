"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { Button } from "@/components/ui";

/** Native <dialog> so focus trapping, Escape and the inert background come from the browser. */
export function ConfirmDialog({
  open,
  title,
  children,
  confirmLabel,
  tone = "primary",
  busy,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title: string;
  children?: ReactNode;
  confirmLabel: string;
  tone?: "primary" | "danger";
  busy?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      aria-labelledby="confirm-title"
      onCancel={(e) => {
        e.preventDefault();
        onCancel();
      }}
      className="m-auto w-[min(28rem,calc(100vw-2rem))] rounded-2xl border border-ink-200 bg-surface p-0 text-ink-900 shadow-pop"
    >
      <div className="space-y-3 p-6">
        <h2 id="confirm-title" className="text-lg font-bold">
          {title}
        </h2>
        {children && <div className="text-sm text-ink-600">{children}</div>}
      </div>
      <div className="flex flex-wrap justify-end gap-2 border-t border-ink-200 bg-ink-50 px-6 py-4">
        <Button variant="secondary" type="button" onClick={onCancel} disabled={busy}>
          إلغاء
        </Button>
        <Button
          variant={tone === "danger" ? "danger" : "primary"}
          type="button"
          onClick={onConfirm}
          disabled={busy}
          autoFocus
        >
          {confirmLabel}
        </Button>
      </div>
    </dialog>
  );
}
