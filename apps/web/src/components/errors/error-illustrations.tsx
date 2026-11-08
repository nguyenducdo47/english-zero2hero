import type { HttpStatusCode } from "@/lib/error-page-copy";
import { cn } from "@/lib/utils";

type IllustrationProps = {
  className?: string;
};

function IllustrationFrame({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        "relative flex h-44 w-full max-w-xs items-center justify-center sm:h-52 sm:max-w-sm",
        className,
      )}
      aria-hidden
    >
      {children}
    </div>
  );
}

/** 404 — Lost in Learning: open book + map pin + floating letters */
export function ErrorIllustration404({ className }: IllustrationProps) {
  return (
    <IllustrationFrame className={className}>
      <svg viewBox="0 0 280 200" className="h-full w-full drop-shadow-sm" role="presentation">
        <ellipse cx="140" cy="175" rx="95" ry="14" className="fill-primary/10" />
        <rect x="78" y="52" width="88" height="112" rx="8" className="fill-card stroke-border" strokeWidth="2" />
        <path d="M122 52 v112" className="stroke-border" strokeWidth="2" />
        <path
          d="M88 78 h72 M88 98 h56 M88 118 h64"
          className="stroke-muted-foreground/40"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <circle cx="198" cy="88" r="36" className="fill-secondary/15 stroke-secondary" strokeWidth="2" />
        <path
          d="M198 64 v20 M188 74 h20"
          className="stroke-secondary"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <circle cx="62" cy="40" r="14" className="fill-primary/25" />
        <circle cx="218" cy="136" r="12" className="fill-primary/20" />
        <circle cx="48" cy="122" r="10" className="fill-primary/15" />
      </svg>
    </IllustrationFrame>
  );
}

/** 403 — Locked learning content */
export function ErrorIllustration403({ className }: IllustrationProps) {
  return (
    <IllustrationFrame className={className}>
      <svg viewBox="0 0 280 200" className="h-full w-full drop-shadow-sm" role="presentation">
        <ellipse cx="140" cy="175" rx="95" ry="14" className="fill-warning/10" />
        <rect x="85" y="48" width="110" height="120" rx="10" className="fill-card stroke-border" strokeWidth="2" />
        <rect x="100" y="70" width="80" height="72" rx="6" className="fill-muted/50" />
        <rect
          x="118"
          y="88"
          width="44"
          height="52"
          rx="6"
          className="fill-warning/20 stroke-warning"
          strokeWidth="2"
        />
        <path
          d="M128 88 v-10 a16 16 0 0 1 32 0 v10"
          className="fill-none stroke-warning"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <circle cx="140" cy="108" r="5" className="fill-warning" />
        <rect x="118" y="114" width="24" height="18" rx="4" className="fill-warning/80" />
      </svg>
    </IllustrationFrame>
  );
}

/** 500 — Learning system glitch */
export function ErrorIllustration500({ className }: IllustrationProps) {
  return (
    <IllustrationFrame className={className}>
      <svg viewBox="0 0 280 200" className="h-full w-full drop-shadow-sm" role="presentation">
        <ellipse cx="140" cy="175" rx="95" ry="14" className="fill-muted/30" />
        <rect x="70" y="118" width="48" height="14" rx="4" className="fill-primary/30" transform="rotate(-18 94 125)" />
        <rect x="120" y="108" width="52" height="14" rx="4" className="fill-primary/40" transform="rotate(8 146 115)" />
        <rect x="168" y="122" width="44" height="14" rx="4" className="fill-primary/25" transform="rotate(-6 190 129)" />
        <rect x="96" y="52" width="88" height="64" rx="10" className="fill-card stroke-border" strokeWidth="2" />
        <rect x="108" y="64" width="64" height="40" rx="4" className="fill-muted/60" />
        <path d="M118 84 h44 M118 94 h32" className="stroke-muted-foreground/50" strokeWidth="2" strokeLinecap="round" />
        <circle cx="200" cy="76" r="28" className="fill-secondary/20 stroke-secondary" strokeWidth="2" />
        <path
          d="M188 76 h24 M200 64 v24"
          className="stroke-secondary"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        <path
          d="M124 140 l8 8 m0-8 l-8 8"
          className="stroke-destructive/70"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
      </svg>
    </IllustrationFrame>
  );
}

/** 503 — Library maintenance */
export function ErrorIllustration503({ className }: IllustrationProps) {
  return (
    <IllustrationFrame className={className}>
      <svg viewBox="0 0 280 200" className="h-full w-full drop-shadow-sm" role="presentation">
        <ellipse cx="140" cy="175" rx="95" ry="14" className="fill-secondary/10" />
        <path
          d="M60 58 h160 v88 H60z"
          className="fill-card stroke-border"
          strokeWidth="2"
          strokeLinejoin="round"
        />
        <path d="M60 82 h160" className="stroke-border" strokeWidth="2" />
        <rect x="78" y="96" width="36" height="36" rx="4" className="fill-primary/15" />
        <rect x="122" y="96" width="36" height="36" rx="4" className="fill-primary/10" />
        <rect x="166" y="96" width="36" height="36" rx="4" className="fill-primary/15" />
        <circle cx="194" cy="68" r="22" className="fill-secondary/25 stroke-secondary" strokeWidth="2" />
        <path
          d="M186 68 h16 M194 60 v16"
          className="stroke-secondary"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <rect x="118" y="138" width="44" height="8" rx="4" className="fill-warning/60" />
      </svg>
    </IllustrationFrame>
  );
}

export function ErrorIllustration({ code, className }: { code: HttpStatusCode; className?: string }) {
  switch (code) {
    case 404:
      return <ErrorIllustration404 className={className} />;
    case 403:
    case 401:
      return <ErrorIllustration403 className={className} />;
    case 503:
      return <ErrorIllustration503 className={className} />;
    case 500:
    default:
      return <ErrorIllustration500 className={className} />;
  }
}
