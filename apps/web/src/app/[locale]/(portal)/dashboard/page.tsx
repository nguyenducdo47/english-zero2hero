import { getTranslations } from "next-intl/server";
import { ContinueLearningSection } from "@/components/learning/continue-learning-section";
import { LearningStatsBar } from "@/components/learning/learning-stats-bar";
import { DashboardProgress } from "@/components/learning/dashboard-progress";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "@/i18n/navigation";

export const instant = false;

export default async function DashboardPage() {
  const t = await getTranslations("dashboard");

  return (
    <div className="space-y-8">
      <PageHeader title={t("title")} description={t("intro")} />
      <LearningStatsBar />
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <ContinueLearningSection />
        </div>
        <DashboardProgress />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t("quickGrammar")}</CardTitle>
          </CardHeader>
          <CardContent>
            <Link href="/grammar" className="text-sm text-primary hover:underline">
              {t("openGrammar")} →
            </Link>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t("quickExams")}</CardTitle>
          </CardHeader>
          <CardContent>
            <Link href="/exams" className="text-sm text-primary hover:underline">
              {t("openExams")} →
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
