import { getTranslations } from "next-intl/server";
import { AdminTenseGroupsPageClient } from "./tense-groups-page-client";

export const instant = false;

export async function generateMetadata() {
  const t = await getTranslations("admin");
  return { title: t("nav.tenseGroups") };
}

export default function AdminTenseGroupsPage() {
  return <AdminTenseGroupsPageClient />;
}
