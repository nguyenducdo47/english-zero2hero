import { getTranslations } from "next-intl/server";
import { AdminRolesPageClient } from "./roles-page-client";

export const instant = false;

export async function generateMetadata() {
  const t = await getTranslations("admin");
  return { title: t("nav.roles") };
}

export default function AdminRolesPage() {
  return <AdminRolesPageClient />;
}
