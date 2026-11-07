import { getTranslations, getLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { loadGrammar } from "@/lib/grammar-data";
import { groupName, tenseName } from "@/lib/grammar-i18n";
import type { Locale } from "@/i18n/routing";

export const instant = false;

export async function generateMetadata() {
  const locale = await getLocale();
  const t = await getTranslations({ locale, namespace: "grammar" });
  return {
    title: t("title"),
    description: t("intro"),
  };
}

export default async function GrammarIndexPage() {
  const locale = (await getLocale()) as Locale;
  const t = await getTranslations("grammar");
  const { groups, tenses } = loadGrammar();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">{t("title")}</h1>
        <p className="mt-2 text-slate-600 dark:text-slate-400">{t("intro")}</p>
      </div>
      {groups
        .slice()
        .sort((a, b) => a.sort_order - b.sort_order)
        .map((group) => (
          <section key={group.slug} className="space-y-3">
            <div className="flex flex-wrap items-end justify-between gap-2">
              <h2 className="text-lg font-semibold text-indigo-800 dark:text-indigo-300">
                {groupName(group, locale)}
              </h2>
              <Link
                href={`/grammar/groups/${group.slug}/quiz`}
                className="text-sm font-medium text-indigo-600 hover:underline dark:text-indigo-400"
              >
                {t("groupQuiz")}
              </Link>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {tenses
                .filter((tense) => tense.group_slug === group.slug)
                .sort((a, b) => a.sort_order - b.sort_order)
                .map((tense) => (
                  <Link
                    key={tense.slug}
                    href={`/grammar/${tense.slug}`}
                    className="rounded-xl border border-border bg-surface p-4 shadow-sm transition hover:border-indigo-300 dark:hover:border-indigo-500"
                  >
                    <p className="font-medium">{tenseName(tense, locale)}</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      {locale === "en" ? tense.name_vi : tense.name_en}
                    </p>
                  </Link>
                ))}
            </div>
          </section>
        ))}
    </div>
  );
}
