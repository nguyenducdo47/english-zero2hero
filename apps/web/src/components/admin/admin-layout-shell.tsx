"use client";

import { useState, type ReactNode } from "react";
import { AdminAuthGate } from "./admin-auth-gate";
import { AdminHeader } from "./admin-header";
import { AdminSidebar } from "./admin-sidebar";
import "@/styles/admin-theme.css";

export function AdminLayoutShell({ children }: { children: ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <AdminAuthGate>
      <div className="admin-root flex h-dvh overflow-hidden bg-[var(--admin-bg)] text-[var(--admin-text)]">
        <AdminSidebar
          collapsed={collapsed}
          onCollapsedChange={setCollapsed}
          mobileOpen={mobileOpen}
          onMobileClose={() => setMobileOpen(false)}
        />
        <div className="flex min-h-0 min-w-0 flex-1 flex-col">
          <AdminHeader onMenuClick={() => setMobileOpen(true)} />
          <main className="min-h-0 flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">{children}</main>
        </div>
      </div>
    </AdminAuthGate>
  );
}
