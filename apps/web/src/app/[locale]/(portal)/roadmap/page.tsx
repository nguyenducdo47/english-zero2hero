import { getTranslations } from "next-intl/server";
import { PageHeader } from "@/components/layout/page-header";
import { RoadmapLevels } from "@/components/learning/roadmap-levels";

export const instant = false;

export default async function RoadmapPage() {
  const t = await getTranslations("roadmap");

  return (
    <div className="space-y-8">
      <PageHeader title={t("title")} description={t("intro")} />
      <RoadmapLevels />
    </div>
  );
}
