import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { ProgressSummary } from "@/components/progress-badge";

/** Next 16: avoid awaiting `params` here — locale is set in `[locale]/layout`. */
export const instant = false;

export default async function Home() {
  const t = await getTranslations("home");

  return (
    <div className="space-y-8">
      <section className="rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-700 px-8 py-10 text-white shadow-lg">
        <h1 className="text-3xl font-bold tracking-tight">{t("title")}</h1>
        <p className="mt-3 max-w-2xl text-indigo-100">{t("subtitle")}</p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/grammar"
            className="rounded-full bg-surface px-5 py-2 text-sm font-semibold text-indigo-700 dark:text-indigo-300"
          >
            {t("ctaGrammar")}
          </Link>
          <Link
            href="/login"
            className="rounded-full border border-white/60 px-5 py-2 text-sm font-semibold text-white"
          >
            {t("ctaLogin")}
          </Link>
        </div>
      </section>
      <ProgressSummary />
      <section className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-border bg-surface p-5">
          <h2 className="font-semibold">{t("phase1Title")}</h2>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">{t("phase1Text")}</p>
        </div>
        <div className="rounded-xl border border-border bg-surface p-5">
          <h2 className="font-semibold">{t("phase2Title")}</h2>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">{t("phase2Text")}</p>
        </div>
      </section>
    </div>
  );
}
