"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { LocaleSwitcher } from "@/components/locale-switcher";
import { ThemeToggle } from "@/components/theme-toggle";
import { HeaderAuthLink } from "@/components/layout/header-auth-link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { BookOpen, GraduationCap, LayoutDashboard, Map } from "lucide-react";

const navLinkClass = cn(
  buttonVariants({ variant: "ghost", size: "sm" }),
  "text-muted-foreground hover:text-foreground",
);

type SiteHeaderProps = {
  logoUrl?: string | null;
  brandName?: string | null;
};

export function SiteHeader({ logoUrl, brandName }: SiteHeaderProps) {
  const t = useTranslations("nav");
  const title = brandName?.trim() || t("brand");

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
        <Link
          href="/"
          className="flex items-center gap-2 text-base font-bold text-primary md:text-lg"
        >
          {logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              alt=""
              className="size-7 object-contain"
              height={28}
              src={logoUrl}
              width={28}
            />
          ) : (
            <GraduationCap className="size-5" aria-hidden />
          )}
          <span>{title}</span>
        </Link>
        <nav className="flex flex-wrap items-center justify-end gap-0.5 md:gap-1">
          <Link href="/dashboard" className={navLinkClass}>
            <LayoutDashboard className="size-4" aria-hidden />
            <span className="hidden sm:inline">{t("dashboard")}</span>
          </Link>
          <Link href="/grammar" className={navLinkClass}>
            <BookOpen className="size-4" aria-hidden />
            <span className="hidden sm:inline">{t("grammar")}</span>
          </Link>
          <Link href="/roadmap" className={navLinkClass}>
            <Map className="size-4" aria-hidden />
            <span className="hidden sm:inline">{t("roadmap")}</span>
          </Link>
          <Link href="/exams" className={navLinkClass}>
            {t("exams")}
          </Link>
          <Link href="/mock-exams" className={cn(navLinkClass, "hidden md:inline-flex")}>
            {t("mock")}
          </Link>
          <HeaderAuthLink />
          <ThemeToggle />
          <LocaleSwitcher />
        </nav>
      </div>
    </header>
  );
}
