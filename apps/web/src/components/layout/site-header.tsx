"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { LocaleSwitcher } from "@/components/locale-switcher";
import { ThemeToggle } from "@/components/theme-toggle";
import { HeaderAuthLink } from "@/components/layout/header-auth-link";
import { useAuthToken } from "@/hooks/use-auth-token";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  BookOpen,
  ClipboardList,
  FileText,
  GraduationCap,
  Languages,
  LayoutDashboard,
  Map,
  LogIn,
  Menu,
  Timer,
  User,
  X,
  type LucideIcon,
} from "lucide-react";

const navLinkBase = cn(
  buttonVariants({ variant: "ghost", size: "sm" }),
  "text-muted-foreground hover:text-foreground",
);

const mobileMenuLinkBase = cn(
  buttonVariants({ variant: "ghost" }),
  "h-auto min-h-12 w-full justify-start whitespace-normal text-left text-muted-foreground hover:text-foreground",
);

function isNavActive(
  pathname: string,
  href: string,
  opts?: { except?: string },
): boolean {
  if (pathname === href) return true;
  if (!pathname.startsWith(`${href}/`)) return false;
  const except = opts?.except;
  if (except && (pathname === except || pathname.startsWith(`${except}/`))) {
    return false;
  }
  return true;
}

function navLinkClass(
  active: boolean,
  extra?: string,
  mode: "bar" | "menu" = "bar",
) {
  return cn(
    mode === "menu" ? mobileMenuLinkBase : navLinkBase,
    extra,
    active &&
      "bg-primary/12 font-semibold text-primary shadow-sm ring-1 ring-primary/25 hover:bg-primary/18 hover:text-primary",
  );
}

export type CmsNavLink = { slug: string; title: string };

type SiteNavItem = {
  key: string;
  href: string;
  label: string;
  Icon: LucideIcon;
  activeExcept?: string;
  hideBelow?: "md" | "lg" | "xl";
};

type SiteHeaderProps = {
  logoUrl?: string | null;
  brandName?: string | null;
  cmsLinks?: CmsNavLink[];
};

type HeaderNavLinkProps = {
  href: string;
  pathname: string;
  className?: string;
  hideBelow?: "md" | "lg" | "xl";
  activeExcept?: string;
  label: string;
  icon: ReactNode;
  mode?: "bar" | "menu";
  onNavigate?: () => void;
};

function responsiveHideClass(hideBelow?: "md" | "lg" | "xl") {
  if (hideBelow === "md") return "max-md:hidden";
  if (hideBelow === "lg") return "max-lg:hidden";
  if (hideBelow === "xl") return "max-xl:hidden";
  return undefined;
}

function HeaderNavLink({
  href,
  pathname,
  className,
  hideBelow,
  activeExcept,
  label,
  icon,
  mode = "bar",
  onNavigate,
}: HeaderNavLinkProps) {
  const active = isNavActive(pathname, href, { except: activeExcept });
  const isMenu = mode === "menu";
  return (
    <Link
      href={href}
      onClick={onNavigate}
      aria-current={active ? "page" : undefined}
      aria-label={label}
      title={label}
      className={navLinkClass(
        active,
        cn(
          isMenu
            ? "gap-3.5 rounded-xl px-4 py-3.5 text-base font-medium sm:text-lg"
            : "gap-1.5",
          !isMenu && responsiveHideClass(hideBelow),
          className,
        ),
        mode,
      )}
    >
      {isMenu ? (
        <>
          <span className="inline-flex shrink-0" aria-hidden>
            {icon}
          </span>
          <span>{label}</span>
        </>
      ) : (
        <>
          <span className="inline-flex shrink-0 sm:hidden" aria-hidden>
            {icon}
          </span>
          <span className="hidden sm:inline">{label}</span>
        </>
      )}
    </Link>
  );
}

function buildNavItems(
  t: (key: string) => string,
  cmsLinks: CmsNavLink[],
): SiteNavItem[] {
  const core: SiteNavItem[] = [
    {
      key: "dashboard",
      href: "/dashboard",
      label: t("dashboard"),
      Icon: LayoutDashboard,
    },
    {
      key: "grammar",
      href: "/grammar",
      label: t("grammar"),
      Icon: BookOpen,
      activeExcept: "/grammar/analyze",
    },
    {
      key: "grammarAnalyze",
      href: "/grammar/analyze",
      label: t("grammarAnalyze"),
      Icon: Languages,
      hideBelow: "lg",
    },
    {
      key: "roadmap",
      href: "/roadmap",
      label: t("roadmap"),
      Icon: Map,
    },
    {
      key: "exams",
      href: "/exams",
      label: t("exams"),
      Icon: ClipboardList,
    },
    {
      key: "mock",
      href: "/mock-exams",
      label: t("mock"),
      Icon: Timer,
      hideBelow: "md",
    },
  ];
  const cms: SiteNavItem[] = cmsLinks.map((item) => ({
    key: `cms-${item.slug}`,
    href: `/${item.slug}`,
    label: item.title,
    Icon: FileText,
    hideBelow: "lg" as const,
  }));
  return [...core, ...cms];
}

export function SiteHeader({ logoUrl, brandName, cmsLinks = [] }: SiteHeaderProps) {
  const t = useTranslations("nav");
  const pathname = usePathname();
  const title = brandName?.trim() || t("brand");
  const [menuOpen, setMenuOpen] = useState(false);
  const navItems = buildNavItems(t, cmsLinks);
  const loggedIn = Boolean(useAuthToken());

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!menuOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [menuOpen]);

  const closeMenu = () => setMenuOpen(false);

  return (
    <>
    <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-3 px-4 py-3 2xl:max-w-screen-2xl">
        <Link
          href="/"
          className="flex min-w-0 items-center gap-2 text-base font-bold text-primary md:text-lg"
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
            <GraduationCap className="size-5 shrink-0" aria-hidden />
          )}
          <span className="truncate">{title}</span>
        </Link>

        <div className="flex shrink-0 items-center justify-end gap-0.5 md:gap-1">
          <nav
            className="hidden items-center gap-0.5 md:gap-1 lg:flex lg:flex-nowrap"
            aria-label={t("menuTitle")}
          >
            {navItems.map((item) => (
              <HeaderNavLink
                key={item.key}
                href={item.href}
                pathname={pathname}
                hideBelow={item.hideBelow}
                activeExcept={item.activeExcept}
                label={item.label}
                icon={<item.Icon className="size-4" />}
              />
            ))}
            <HeaderAuthLink />
          </nav>

          <div className="flex items-center gap-0.5 md:gap-1">
            <HeaderAuthLink className="ml-0 shrink-0 lg:hidden" />
            <ThemeToggle />
            <LocaleSwitcher />
            <Button
              type="button"
              variant="outline"
              size="icon-sm"
              className="lg:hidden"
              aria-expanded={menuOpen}
              aria-controls="site-mobile-nav"
              aria-label={menuOpen ? t("menuClose") : t("menuOpen")}
              onClick={() => setMenuOpen((open) => !open)}
            >
              {menuOpen ? <X className="size-4" /> : <Menu className="size-4" />}
            </Button>
          </div>
        </div>
      </div>
    </header>

      {menuOpen ? (
        <>
          <button
            type="button"
            className="fixed inset-0 z-40 bg-black/40 lg:hidden"
            aria-label={t("menuClose")}
            onClick={closeMenu}
          />
          <aside
            id="site-mobile-nav"
            className="fixed inset-y-0 right-0 z-50 flex w-[min(24rem,92vw)] flex-col border-l border-border bg-background text-foreground shadow-xl lg:hidden"
          >
            <div className="flex items-center justify-between border-b border-border px-4 py-4">
              <span className="text-base font-semibold text-foreground">
                {t("menuTitle")}
              </span>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                aria-label={t("menuClose")}
                onClick={closeMenu}
              >
                <X className="size-4" />
              </Button>
            </div>
            <nav
              className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto bg-white px-3 py-4 dark:bg-background sm:px-4"
              aria-label={t("menuTitle")}
            >
              {navItems.map((item) => (
                <HeaderNavLink
                  key={item.key}
                  href={item.href}
                  pathname={pathname}
                  mode="menu"
                  activeExcept={item.activeExcept}
                  label={item.label}
                  icon={<item.Icon className="size-6 shrink-0" />}
                  onNavigate={closeMenu}
                />
              ))}
              {loggedIn ? (
                <HeaderNavLink
                  href="/profile"
                  pathname={pathname}
                  mode="menu"
                  label={t("profile")}
                  icon={<User className="size-6 shrink-0" />}
                  onNavigate={closeMenu}
                />
              ) : (
                <HeaderNavLink
                  href="/login"
                  pathname={pathname}
                  mode="menu"
                  label={t("login")}
                  icon={<LogIn className="size-6 shrink-0" />}
                  onNavigate={closeMenu}
                />
              )}
            </nav>
            {!loggedIn ? (
              <div className="border-t border-border p-4">
                <HeaderAuthLink
                  className="ml-0 h-11 w-full justify-center text-base"
                  onNavigate={closeMenu}
                />
              </div>
            ) : null}
          </aside>
        </>
      ) : null}
    </>
  );
}
