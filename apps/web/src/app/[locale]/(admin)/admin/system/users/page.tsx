import { getTranslations } from "next-intl/server";
import { AdminUsersPageClient } from "./users-page-client";

export const instant = false;

export async function generateMetadata() {
  const t = await getTranslations("admin");
  return { title: t("nav.users") };
}

export default function AdminUsersPage() {
  return <AdminUsersPageClient />;
}
