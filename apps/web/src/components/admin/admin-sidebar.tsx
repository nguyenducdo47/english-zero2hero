"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { ADMIN_NAV_GROUPS } from "@/lib/admin-nav";
import { cn } from "@/lib/utils";
import { ChevronDown, ChevronLeft, ChevronRight, GraduationCap } from "lucide-react";

type Props = {
  collapsed: boolean;
  onCollapsedChange: (v: boolean) => void;
  mobileOpen: boolean;
  onMobileClose: () => void;
};

export function AdminSidebar({
  collapsed,
  onCollapsedChange,
  mobileOpen,
  onMobileClose,
}: Props) {
  const t = useTranslations("admin");
  const pathname = usePathname();
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({
    overview: true,
    content: true,
    system: true,
  });

  const toggleGroup = (id: string) => {
    setOpenGroups((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const isActive = (href: string) => {
    if (href === "/admin") return pathname === "/admin";
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  const nav = (
    <div className="flex h-full min-h-0 flex-col">
      <div
        className={cn(
          "flex h-14 shrink-0 items-center border-b border-[var(--admin-border)] px-3",
          collapsed && "justify-center px-2",
        )}
      >
        <GraduationCap className="size-6 shrink-0 text-[var(--admin-primary)]" aria-hidden />
        {!collapsed ? (
          <span className="ml-2 truncate font-semibold text-[var(--admin-text)]">
            {t("brand")}
          </span>
        ) : null}
      </div>
      <nav
        className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-2"
        aria-label={t("title")}
      >
        {ADMIN_NAV_GROUPS.map((group) => (
          <div key={group.id} className="mb-3">
            {!collapsed ? (
              <button
                type="button"
                className="mb-1 flex w-full items-center justify-between rounded-md px-2 py-1 text-xs font-medium uppercase tracking-wide text-[var(--admin-text-muted)] hover:bg-slate-100 dark:hover:bg-slate-800"
                onClick={() => toggleGroup(group.id)}
              >
                {t(group.labelKey)}
                {openGroups[group.id] ? (
                  <ChevronDown className="size-3.5" />
                ) : (
                  <ChevronRight className="size-3.5" />
                )}
              </button>
            ) : null}
            {(collapsed || openGroups[group.id]) &&
              group.items.map((item) => {
                const active = isActive(item.href);
                const Icon = item.icon;
                return (
                  <Link
                    key={item.id}
                    href={item.href}
                    onClick={onMobileClose}
                    title={collapsed ? t(item.labelKey) : undefined}
                    className={cn(
                      "mb-0.5 flex items-center gap-2 rounded-lg px-2.5 py-2 text-sm transition-colors",
                      active
                        ? "border-l-2 border-[var(--admin-primary)] bg-[var(--admin-sidebar-active)] font-medium text-[var(--admin-primary)]"
                        : "text-[var(--admin-sidebar-text)] hover:bg-slate-100 dark:hover:bg-slate-800",
                      collapsed && "justify-center px-2",
                    )}
                  >
                    <Icon className="size-4 shrink-0" aria-hidden />
                    {!collapsed ? <span>{t(item.labelKey)}</span> : null}
                  </Link>
                );
              })}
          </div>
        ))}
      </nav>
      <div className="shrink-0 border-t border-[var(--admin-border)] p-2">
        <button
          type="button"
          className="flex w-full items-center justify-center gap-2 rounded-lg py-2 text-sm text-[var(--admin-text-muted)] hover:bg-slate-100 dark:hover:bg-slate-800"
          onClick={() => onCollapsedChange(!collapsed)}
          aria-label={collapsed ? t("sidebarExpand") : t("sidebarCollapse")}
        >
          {collapsed ? <ChevronRight className="size-4" /> : <ChevronLeft className="size-4" />}
          {!collapsed ? <span>{t("sidebarCollapse")}</span> : null}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {mobileOpen ? (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          aria-label={t("sidebarClose")}
          onClick={onMobileClose}
        />
      ) : null}
      <aside
        className={cn(
          "admin-root z-50 flex h-dvh max-h-dvh shrink-0 flex-col overflow-hidden border-r border-[var(--admin-border)] bg-[var(--admin-sidebar-bg)] transition-transform",
          "fixed inset-y-0 left-0 lg:sticky lg:top-0 lg:z-30 lg:translate-x-0",
          collapsed ? "w-[72px]" : "w-[260px]",
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        )}
      >
        {nav}
      </aside>
    </>
  );
}
