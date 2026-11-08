import { notFound } from "next/navigation";
import { getTranslations, getLocale } from "next-intl/server";
import { getGroup, getTense } from "@/lib/grammar-data";
import { groupName, tenseName } from "@/lib/grammar-i18n";
import type { Locale } from "@/i18n/routing";
import { PageHeader } from "@/components/layout/page-header";
import { TenseQuizLoader } from "./tense-quiz-loader";

type Props = { params: Promise<{ slug: string }> };

export async function TenseQuizPageContent({ params }: Props) {
  const { slug } = await params;
  const tense = getTense(slug);
  if (!tense) notFound();

  const group = getGroup(tense.group_slug);
  if (!group) notFound();

  const locale = (await getLocale()) as Locale;
  const t = await getTranslations("grammar");
  const name = tenseName(tense, locale);
  const gName = groupName(group, locale);

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("quizTitleTense", { tense: name })}
        description={t("quizIntroTense", { tense: name, group: gName })}
      />
      <TenseQuizLoader
        tenseSlug={slug}
        tenseName={name}
        groupSlug={group.slug}
        groupName={gName}
      />
    </div>
  );
}
