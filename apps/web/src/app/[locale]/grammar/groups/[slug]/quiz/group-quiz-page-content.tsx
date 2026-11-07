import { notFound } from "next/navigation";
import { getTranslations, getLocale } from "next-intl/server";
import { getGroup } from "@/lib/grammar-data";
import { groupName } from "@/lib/grammar-i18n";
import type { Locale } from "@/i18n/routing";
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
      <div>
        <h1 className="text-2xl font-bold">{t("quizTitle", { group: name })}</h1>
        <p className="text-sm text-slate-600">{t("quizIntro")}</p>
      </div>
      <GroupQuizLoader slug={slug} groupName={name} />
    </div>
  );
}
