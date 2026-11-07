"use client";

import { useLocale, useTranslations } from "next-intl";
import type { Locale } from "@/i18n/routing";
import { Link, usePathname, useRouter } from "@/i18n/navigation";
import { adminBreadcrumbKey } from "@/lib/admin-nav";
import { useAuthToken } from "@/hooks/use-auth-token";
import { apiPost, setStoredToken } from "@/lib/api";
import { AdminClearCacheButton } from "@/components/admin/admin-clear-cache-button";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { LogOut, Menu, User } from "lucide-react";

type Props = {
  onMenuClick: () => void;
};

export function AdminHeader({ onMenuClick }: Props) {
  const t = useTranslations("admin");
  const pathname = usePathname();
  const router = useRouter();
  const locale = useLocale() as Locale;
  const token = useAuthToken();

  const segments = pathname.split("/").filter(Boolean);
  const crumbs = segments.slice(segments.indexOf("admin"));

  const onLogout = async () => {
    if (token) {
      try {
        await apiPost("/api/v1/auth/logout", {}, locale, token);
      } catch {
        /* ignore */
      }
    }
    setStoredToken(null);
    router.push("/login");
  };

  return (
    <header className="sticky top-0 z-20 flex h-14 items-center justify-between gap-3 border-b border-[var(--admin-border)] bg-[var(--admin-surface)] px-4">
      <div className="flex min-w-0 items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="icon-sm"
          className="lg:hidden"
          onClick={onMenuClick}
          aria-label={t("sidebarOpen")}
        >
          <Menu className="size-4" />
        </Button>
        <nav aria-label="Breadcrumb" className="hidden min-w-0 truncate text-sm sm:block">
          <ol className="flex flex-wrap items-center gap-1 text-[var(--admin-text-muted)]">
            {crumbs.map((seg, i) => {
              const key = adminBreadcrumbKey(seg);
              const label = key ? t(key) : seg;
              return (
                <li key={`${seg}-${i}`} className="flex items-center gap-1">
                  {i > 0 ? <span aria-hidden>/</span> : null}
                  <span
                    className={cn(
                      i === crumbs.length - 1 && "font-medium text-[var(--admin-text)]",
                    )}
                  >
                    {label}
                  </span>
                </li>
              );
            })}
          </ol>
        </nav>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <AdminClearCacheButton />
        <Link
          href="/dashboard"
          className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "hidden sm:inline-flex")}
        >
          {t("backPortal")}
        </Link>
        <Link
          href="/profile"
          className={cn(buttonVariants({ variant: "outline", size: "sm" }), "gap-1")}
        >
          <User className="size-4" aria-hidden />
          <span className="hidden sm:inline">{t("account")}</span>
        </Link>
        <Button type="button" variant="ghost" size="sm" className="gap-1" onClick={onLogout}>
          <LogOut className="size-4" aria-hidden />
          <span className="hidden sm:inline">{t("logout")}</span>
        </Button>
      </div>
    </header>
  );
}
