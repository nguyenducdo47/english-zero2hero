import { getTranslations } from "next-intl/server";
import { AdminDashboardClient } from "@/components/admin/admin-dashboard-client";

export const instant = false;

export async function generateMetadata() {
  const t = await getTranslations("admin");
  return { title: t("nav.dashboard") };
}

export default function AdminDashboardPage() {
  return <AdminDashboardClient />;
}
