import type { Metadata } from "next";
import { AdminAuthGate } from "@/components/admin/admin-auth-gate";
import { AdminLayoutShell } from "@/components/admin/admin-layout-shell";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function AdminSegmentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminAuthGate>
      <AdminLayoutShell>{children}</AdminLayoutShell>
    </AdminAuthGate>
  );
}
