import { notFound } from "next/navigation";
import { getTranslations, getLocale } from "next-intl/server";
import { getGroup } from "@/lib/grammar-data";
import { groupName } from "@/lib/grammar-i18n";
import type { Locale } from "@/i18n/routing";
import { PageHeader } from "@/components/layout/page-header";
import { GroupQuizLoader } from "./group-quiz-loader";

type Props = { params: Promise<{ slug: string }> };

export async function GroupQuizPageContent({ params }: Props) {
  const { slug } = await params;
  const group = getGroup(slug);
  if (!group) notFound();

  const locale = (await getLocale()) as Locale;
  const t = await getTranslations("grammar");
  const name = groupName(group, locale);

  return (
    <div className="space-y-6">
      <PageHeader title={t("quizTitle", { group: name })} description={t("quizIntro")} />
      <GroupQuizLoader slug={slug} groupName={name} />
    </div>
  );
}
