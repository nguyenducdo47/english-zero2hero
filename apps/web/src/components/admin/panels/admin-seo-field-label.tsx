"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { CircleHelp } from "lucide-react";
import { Label } from "@/components/ui/label";

type Props = {
  htmlFor?: string;
  label: string;
  help: string;
};

/** Label + ? icon; hover/focus shows field help (portal — not clipped by Card overflow). */
export function AdminSeoFieldLabel({ htmlFor, label, help }: Props) {
  const btnRef = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0 });

  const syncPosition = useCallback(() => {
    const el = btnRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    setCoords({
      top: r.top,
      left: r.left + r.width / 2,
    });
  }, []);

  const show = useCallback(() => {
    syncPosition();
    setOpen(true);
  }, [syncPosition]);

  const hide = useCallback(() => {
    setOpen(false);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onScrollOrResize = () => syncPosition();
    window.addEventListener("scroll", onScrollOrResize, true);
    window.addEventListener("resize", onScrollOrResize);
    return () => {
      window.removeEventListener("scroll", onScrollOrResize, true);
      window.removeEventListener("resize", onScrollOrResize);
    };
  }, [open, syncPosition]);

  const tooltip =
    open && typeof document !== "undefined"
      ? createPortal(
          <span
            className="pointer-events-none fixed z-[9999] w-64 max-w-[min(16rem,calc(100vw-2rem))] -translate-x-1/2 -translate-y-[calc(100%+8px)] rounded-md border border-border bg-popover px-2.5 py-2 text-xs leading-snug text-popover-foreground shadow-lg ring-1 ring-foreground/5"
            role="tooltip"
            style={{ top: coords.top, left: coords.left }}
          >
            {help}
          </span>,
          document.body,
        )
      : null;

  return (
    <div className="flex items-center gap-1.5">
      <Label htmlFor={htmlFor}>{label}</Label>
      <button
        ref={btnRef}
        aria-label={help}
        className="inline-flex shrink-0 rounded-full text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        type="button"
        onBlur={hide}
        onFocus={show}
        onMouseEnter={show}
        onMouseLeave={hide}
      >
        <CircleHelp aria-hidden className="size-3.5" />
      </button>
      {tooltip}
    </div>
  );
}
