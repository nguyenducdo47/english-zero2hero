import { getTranslations } from "next-intl/server";
import { PageHeader } from "@/components/layout/page-header";
import { ProfilePageClient } from "./profile-page-client";

export const instant = false;

export default async function ProfilePage() {
  const t = await getTranslations("profile");

  return (
    <div className="space-y-8">
      <PageHeader title={t("title")} description={t("intro")} />
      <ProfilePageClient />
    </div>
  );
}
