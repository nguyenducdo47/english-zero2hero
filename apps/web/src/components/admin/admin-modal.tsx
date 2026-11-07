"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

type Props = {
  open: boolean;
  title: string;
  description?: string;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
  wide?: boolean;
};

export function AdminModal({
  open,
  title,
  description,
  onClose,
  children,
  footer,
  wide,
}: Props) {
  const ref = useRef<HTMLDialogElement>(null);
  const suppressBackdropCloseUntil = useRef(0);

  /** Native file pickers can emit pointer events outside the dialog on cancel. */
  const armNativePickerGrace = (target: EventTarget | null) => {
    if (!(target instanceof Element)) return;
    if (
      target.closest("[data-opens-file-picker]") ||
      (target instanceof HTMLInputElement && target.type === "file")
    ) {
      suppressBackdropCloseUntil.current = Date.now() + 2500;
    }
  };

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (open && !el.open) el.showModal();
    if (!open && el.open) el.close();
  }, [open]);

  useEffect(() => {
    if (!open) return;

    const el = ref.current;
    if (!el) return;

    const onInsidePointerDown = (e: PointerEvent) => {
      armNativePickerGrace(e.target);
    };
    el.addEventListener("pointerdown", onInsidePointerDown, true);

    const onPointerDown = (e: PointerEvent) => {
      if (Date.now() < suppressBackdropCloseUntil.current) return;
      if (!el.open) return;
      const rect = el.getBoundingClientRect();
      const insideDialog =
        e.clientX >= rect.left &&
        e.clientX <= rect.right &&
        e.clientY >= rect.top &&
        e.clientY <= rect.bottom;
      if (!insideDialog) onClose();
    };

    document.addEventListener("pointerdown", onPointerDown);
    return () => {
      el.removeEventListener("pointerdown", onInsidePointerDown, true);
      document.removeEventListener("pointerdown", onPointerDown);
    };
  }, [open, onClose]);

  return (
    <dialog
      ref={ref}
      className={`fixed inset-0 z-[100] m-auto max-h-[min(90vh,640px)] overflow-hidden rounded-xl border border-border bg-background p-0 text-foreground shadow-xl backdrop:bg-black/50 open:flex open:flex-col ${wide ? "w-[min(100%,70rem)]" : "w-[min(100%,40rem)]"}`}
      onCancel={(e) => {
        e.preventDefault();
        if (Date.now() < suppressBackdropCloseUntil.current) return;
        onClose();
      }}
      onClose={onClose}
    >
      <div className="flex items-start justify-between gap-2 border-b border-border px-4 py-3">
        <div>
          <h2 className="text-base font-semibold">{title}</h2>
          {description ? (
            <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
          ) : null}
        </div>
        <Button aria-label="Close" size="sm" type="button" variant="ghost" onClick={onClose}>
          <X className="size-4" />
        </Button>
      </div>
      <div className="flex-1 overflow-y-auto px-4 py-4">{children}</div>
      {footer ? (
        <div className="flex flex-wrap justify-end gap-2 border-t border-border bg-muted/30 px-4 py-3">
          {footer}
        </div>
      ) : null}
    </dialog>
  );
}
