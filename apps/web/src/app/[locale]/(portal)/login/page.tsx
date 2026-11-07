import { Suspense } from "react";
import { getTranslations } from "next-intl/server";
import { PageHeader } from "@/components/layout/page-header";
import { LoginPageClient } from "./login-page-client";

export const instant = false;

export default async function LoginPage() {
  const t = await getTranslations("login");

  return (
    <div className="space-y-8">
      <PageHeader title={t("title")} description={t("pageLead")} />
      <Suspense fallback={null}>
        <LoginPageClient />
      </Suspense>
    </div>
  );
}
