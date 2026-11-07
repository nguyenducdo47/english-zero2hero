import { getTranslations, getLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { loadGrammar } from "@/lib/grammar-data";
import { groupName, tenseName } from "@/lib/grammar-i18n";
import type { Locale } from "@/i18n/routing";
import { fetchSeoResolve, mergeMetadataWithSeo } from "@/lib/seo-metadata";

export const instant = false;

export async function generateMetadata() {
  const locale = (await getLocale()) as Locale;
  const t = await getTranslations({ locale, namespace: "grammar" });
  const resolved = await fetchSeoResolve("/grammar", locale);
  return mergeMetadataWithSeo(resolved, {
    title: t("title"),
    description: t("intro"),
  });
}

export default async function GrammarIndexPage() {
  const locale = (await getLocale()) as Locale;
  const t = await getTranslations("grammar");
  const { groups, tenses } = loadGrammar();

  return (
    <div className="space-y-8">
      <PageHeader title={t("title")} description={t("intro")} />
      {groups
        .slice()
        .sort((a, b) => a.sort_order - b.sort_order)
        .map((group) => (
          <section key={group.slug} className="space-y-3">
            <div className="flex flex-wrap items-end justify-between gap-2">
              <h2 className="text-lg font-semibold text-foreground">
                {groupName(group, locale)}
              </h2>
              <Link
                href={`/grammar/groups/${group.slug}/quiz`}
                className="text-sm font-medium text-primary hover:underline"
              >
                {t("groupQuiz")}
              </Link>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {tenses
                .filter((tense) => tense.group_slug === group.slug)
                .sort((a, b) => a.sort_order - b.sort_order)
                .map((tense) => (
                  <Link key={tense.slug} href={`/grammar/${tense.slug}`}>
                    <Card className="h-full transition-colors hover:border-primary/30">
                      <CardHeader className="p-4">
                        <CardTitle className="text-base">{tenseName(tense, locale)}</CardTitle>
                        <CardDescription>
                          {locale === "en" ? tense.name_vi : tense.name_en}
                        </CardDescription>
                      </CardHeader>
                    </Card>
                  </Link>
                ))}
            </div>
          </section>
        ))}
    </div>
  );
}
