import type { ReactNode } from "react";
import { Link } from "@/i18n/navigation";
import { Button, buttonVariants } from "@/components/ui/button";
import { ErrorIllustration } from "@/components/errors/error-illustrations";
import { ErrorLearningShortcuts } from "@/components/errors/error-learning-shortcuts";
import { cn } from "@/lib/utils";
import type { HttpStatusCode } from "@/lib/error-page-copy";
import { statusAccentClass } from "@/lib/error-page-copy";

export type ErrorCtaPrimary = "home" | "dashboard" | "retry" | "login" | "explore";

export type HttpStatusPageProps = {
  code: HttpStatusCode;
  title: string;
  description: string;
  statusLabel?: string;
  className?: string;
  actions?: ReactNode;
  primaryCta?: ErrorCtaPrimary;
  showHome?: boolean;
  showDashboard?: boolean;
  showLogin?: boolean;
  showExplore?: boolean;
  showRetry?: boolean;
  showLearningShortcuts?: boolean;
  onRetry?: () => void;
  homeLabel?: string;
  dashboardLabel?: string;
  loginLabel?: string;
  retryLabel?: string;
  exploreLabel?: string;
  learningNavTitle?: string;
  grammarShortcutLabel?: string;
  examsShortcutLabel?: string;
  dashboardShortcutLabel?: string;
  brandLabel?: string;
};

function CtaRow({
  primaryCta = "home",
  showHome,
  showDashboard,
  showLogin,
  showExplore,
  showRetry,
  onRetry,
  homeLabel,
  dashboardLabel,
  loginLabel,
  retryLabel,
  exploreLabel,
}: Pick<
  HttpStatusPageProps,
  | "primaryCta"
  | "showHome"
  | "showDashboard"
  | "showLogin"
  | "showExplore"
  | "showRetry"
  | "onRetry"
  | "homeLabel"
  | "dashboardLabel"
  | "loginLabel"
  | "retryLabel"
  | "exploreLabel"
>) {
  const items: { id: ErrorCtaPrimary | "home2"; variant: "default" | "outline"; node: ReactNode }[] = [];

  if (showRetry && onRetry) {
    items.push({
      id: "retry",
      variant: primaryCta === "retry" ? "default" : "outline",
      node: (
        <Button type="button" variant={primaryCta === "retry" ? "default" : "outline"} onClick={onRetry}>
          {retryLabel}
        </Button>
      ),
    });
  }
  if (showLogin) {
    items.push({
      id: "login",
      variant: primaryCta === "login" ? "default" : "outline",
      node: (
        <Link
          href="/login"
          className={cn(buttonVariants({ variant: primaryCta === "login" ? "default" : "outline" }))}
        >
          {loginLabel}
        </Link>
      ),
    });
  }
  if (showExplore) {
    items.push({
      id: "explore",
      variant: primaryCta === "explore" ? "default" : "outline",
      node: (
        <Link
          href="/grammar"
          className={cn(buttonVariants({ variant: primaryCta === "explore" ? "default" : "outline" }))}
        >
          {exploreLabel}
        </Link>
      ),
    });
  }
  if (showDashboard) {
    items.push({
      id: "dashboard",
      variant: primaryCta === "dashboard" ? "default" : "outline",
      node: (
        <Link
          href="/dashboard"
          className={cn(buttonVariants({ variant: primaryCta === "dashboard" ? "default" : "outline" }))}
        >
          {dashboardLabel}
        </Link>
      ),
    });
  }
  if (showHome) {
    items.push({
      id: "home",
      variant: primaryCta === "home" ? "default" : "outline",
      node: (
        <Link
          href="/"
          className={cn(buttonVariants({ variant: primaryCta === "home" ? "default" : "outline" }))}
        >
          {homeLabel}
        </Link>
      ),
    });
  }

  items.sort((a, b) => {
    const order = (id: string) => (id === primaryCta ? 0 : 1);
    return order(a.id) - order(b.id);
  });

  return (
    <div className="flex flex-wrap items-center justify-center gap-2">
      {items.map((item) => (
        <span key={item.id}>{item.node}</span>
      ))}
    </div>
  );
}

export function HttpStatusPage({
  code,
  title,
  description,
  statusLabel,
  className,
  actions,
  primaryCta = "home",
  showHome = true,
  showDashboard = false,
  showLogin = false,
  showExplore = false,
  showRetry = false,
  showLearningShortcuts = false,
  onRetry,
  homeLabel = "Home",
  dashboardLabel = "Dashboard",
  loginLabel = "Sign in",
  retryLabel = "Try again",
  exploreLabel = "Explore lessons",
  learningNavTitle,
  grammarShortcutLabel,
  examsShortcutLabel,
  dashboardShortcutLabel,
  brandLabel = "English Zero2Hero",
}: HttpStatusPageProps) {
  const accent = statusAccentClass(code);

  return (
    <div
      className={cn(
        "relative flex min-h-dvh flex-col bg-gradient-to-b from-background via-background to-primary/[0.04] px-4 py-10",
        className,
      )}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        <div className="absolute -left-20 top-24 h-56 w-56 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute -right-16 bottom-20 h-48 w-48 rounded-full bg-secondary/10 blur-3xl" />
      </div>

      <header className="relative z-10 mx-auto w-full max-w-lg">
        <Link
          href="/"
          className="inline-flex font-heading text-lg font-semibold tracking-tight text-foreground focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50 rounded-md"
        >
          {brandLabel}
        </Link>
      </header>

      <main className="relative z-10 mx-auto flex w-full max-w-lg flex-1 flex-col items-center justify-center pb-8 pt-6 text-center">
        <ErrorIllustration code={code} className="mb-2" />

        <p
          className={cn(
            "mt-4 inline-flex items-center rounded-2xl border bg-gradient-to-br px-4 py-1.5 font-heading text-2xl font-bold tracking-tight sm:text-3xl",
            accent,
          )}
        >
          {statusLabel ?? code}
        </p>

        <h1 className="mt-5 font-heading text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
          {title}
        </h1>

        <p className="mt-3 max-w-md text-pretty text-base leading-relaxed text-muted-foreground">
          {description}
        </p>

        <div className="mt-8 w-full">
          {actions ?? (
            <CtaRow
              primaryCta={primaryCta}
              showHome={showHome}
              showDashboard={showDashboard}
              showLogin={showLogin}
              showExplore={showExplore}
              showRetry={showRetry}
              onRetry={onRetry}
              homeLabel={homeLabel}
              dashboardLabel={dashboardLabel}
              loginLabel={loginLabel}
              retryLabel={retryLabel}
              exploreLabel={exploreLabel}
            />
          )}
        </div>

        {showLearningShortcuts &&
        learningNavTitle &&
        grammarShortcutLabel &&
        examsShortcutLabel &&
        dashboardShortcutLabel ? (
          <ErrorLearningShortcuts
            sectionTitle={learningNavTitle}
            grammarLabel={grammarShortcutLabel}
            examsLabel={examsShortcutLabel}
            dashboardLabel={dashboardShortcutLabel}
          />
        ) : null}
      </main>
    </div>
  );
}
