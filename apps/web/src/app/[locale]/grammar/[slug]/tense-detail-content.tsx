import { getTranslations, getLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { notFound } from "next/navigation";
import { TtsButton } from "@/components/tts-button";
import { TenseReadTracker } from "./tense-read-tracker";
import { getTense, loadGrammar } from "@/lib/grammar-data";
import { groupName, tenseName, tensePitfalls, tenseUsage } from "@/lib/grammar-i18n";
import type { Locale } from "@/i18n/routing";

type Props = { params: Promise<{ slug: string }> };

export async function TenseDetailContent({ params }: Props) {
  const { slug } = await params;
  const tense = getTense(slug);
  if (!tense) notFound();

  const locale = (await getLocale()) as Locale;
  const t = await getTranslations("grammar");
  const group = loadGrammar().groups.find((g) => g.slug === tense.group_slug);

  return (
    <article className="space-y-6">
      <TenseReadTracker slug={slug} />
      <div>
        {group && (
          <p className="text-sm text-indigo-600">{groupName(group, locale)}</p>
        )}
        <h1 className="text-2xl font-bold">{tenseName(tense, locale)}</h1>
        <p className="text-slate-600">
          {locale === "en" ? tense.name_vi : tense.name_en}
        </p>
      </div>

      <section className="rounded-xl bg-surface p-5 shadow-sm dark:shadow-black/20">
        <h2 className="font-semibold">{t("structure")}</h2>
        <p className="mt-2 font-mono text-sm text-slate-800">{tense.structure}</p>
      </section>

      <section className="rounded-xl bg-surface p-5 shadow-sm dark:shadow-black/20">
        <h2 className="font-semibold">{t("usage")}</h2>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-700">
          {tenseUsage(tense, locale).map((u) => (
            <li key={u}>{u}</li>
          ))}
        </ul>
      </section>

      <section className="rounded-xl bg-surface p-5 shadow-sm dark:shadow-black/20">
        <h2 className="font-semibold">{t("signals")}</h2>
        <p className="mt-2 text-sm text-slate-700">
          {tense.signals.join(", ")}
        </p>
      </section>

      {tensePitfalls(tense, locale) && (
        <section className="rounded-xl border border-amber-200 bg-amber-50 p-5 dark:border-amber-800 dark:bg-amber-950/50">
          <h2 className="font-semibold text-amber-900 dark:text-amber-200">{t("pitfalls")}</h2>
          <p className="mt-2 text-sm text-amber-900 dark:text-amber-100">
            {tensePitfalls(tense, locale)}
          </p>
        </section>
      )}

      <section className="space-y-4">
        <h2 className="font-semibold">{t("examples")}</h2>
        {tense.examples.map((ex) => (
          <div
            key={ex.en}
            className="rounded-xl border border-border bg-surface p-4"
          >
            <div className="flex items-start justify-between gap-2">
              <p className="font-medium text-slate-900">{ex.en}</p>
              <TtsButton text={ex.en} />
            </div>
            <p className="mt-2 text-sm text-slate-600">{ex.vi}</p>
          </div>
        ))}
      </section>

      {group && (
        <Link
          href={`/grammar/groups/${group.slug}/quiz`}
          className="inline-block text-sm font-medium text-indigo-600 hover:underline"
        >
          {t("quizGroup", { group: groupName(group, locale) })}
        </Link>
      )}
    </article>
  );
}
