import { getLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { BookOpen, Headphones, Target, Trophy } from "lucide-react";
import { ContinueLearningSection } from "@/components/learning/continue-learning-section";
import { LearningStatsBar } from "@/components/learning/learning-stats-bar";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { Locale } from "@/i18n/routing";
import { fetchSeoResolve, mergeMetadataWithSeo } from "@/lib/seo-metadata";

export const instant = false;

export async function generateMetadata() {
  const locale = (await getLocale()) as Locale;
  const resolved = await fetchSeoResolve("/", locale);
  const t = await getTranslations("home");
  return mergeMetadataWithSeo(resolved, {
    title: resolved?.page_override && resolved.title ? resolved.title : t("title"),
    description:
      resolved?.page_override && resolved.description
        ? resolved.description
        : t("subtitle"),
  });
}

export default async function Home() {
  const t = await getTranslations("home");

  const benefits = [
    { icon: BookOpen, title: t("benefit1Title"), text: t("benefit1Text") },
    { icon: Target, title: t("benefit2Title"), text: t("benefit2Text") },
    { icon: Headphones, title: t("benefit3Title"), text: t("benefit3Text") },
    { icon: Trophy, title: t("benefit4Title"), text: t("benefit4Text") },
  ];

  return (
    <div className="space-y-12">
      <section className="relative overflow-hidden rounded-2xl border border-primary/10 bg-gradient-to-br from-primary/95 via-primary to-primary/80 px-6 py-10 text-primary-foreground shadow-md md:px-10 md:py-14">
        <div className="relative z-10 max-w-2xl space-y-4">
          <LearningStatsBar />
          <h1 className="text-3xl font-bold tracking-tight md:text-4xl">{t("title")}</h1>
          <p className="text-base leading-relaxed text-primary-foreground/90 md:text-lg">
            {t("subtitle")}
          </p>
          <div className="flex flex-wrap gap-3 pt-2">
            <Link
              href="/grammar"
              className={cn(
                buttonVariants({ size: "lg" }),
                "bg-background text-primary hover:bg-background/90",
              )}
            >
              {t("ctaGrammar")}
            </Link>
            <Link
              href="/dashboard"
              className={cn(
                buttonVariants({ variant: "outline", size: "lg" }),
                "border-primary-foreground/40 bg-transparent text-primary-foreground hover:bg-primary-foreground/10",
              )}
            >
              {t("ctaDashboard")}
            </Link>
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <ContinueLearningSection />
        <Card>
          <CardHeader>
            <CardTitle>{t("pathsTitle")}</CardTitle>
            <CardDescription>{t("pathsDesc")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="rounded-lg border border-border bg-muted/40 p-4">
              <p className="font-medium">{t("phase1Title")}</p>
              <p className="mt-1 text-muted-foreground">{t("phase1Text")}</p>
              <Link href="/grammar" className="mt-2 inline-block text-primary hover:underline">
                {t("ctaGrammar")} →
              </Link>
            </div>
            <div className="rounded-lg border border-border bg-muted/40 p-4">
              <p className="font-medium">{t("phase2Title")}</p>
              <p className="mt-1 text-muted-foreground">{t("phase2Text")}</p>
              <Link href="/exams" className="mt-2 inline-block text-primary hover:underline">
                {t("ctaLogin")} →
              </Link>
            </div>
          </CardContent>
        </Card>
      </section>

      <section>
        <h2 className="mb-4 text-xl font-bold">{t("benefitsTitle")}</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {benefits.map(({ icon: Icon, title, text }) => (
            <Card key={title} className="border-border/80 shadow-sm">
              <CardHeader className="flex flex-row items-start gap-3 space-y-0">
                <div className="rounded-lg bg-secondary/15 p-2 text-secondary">
                  <Icon className="size-5" aria-hidden />
                </div>
                <div>
                  <CardTitle className="text-base">{title}</CardTitle>
                  <CardDescription className="mt-2 text-sm leading-relaxed">
                    {text}
                  </CardDescription>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-4 text-xl font-bold">{t("faqTitle")}</h2>
        <div className="space-y-3">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">{t("faq1q")}</CardTitle>
              <CardDescription className="text-sm leading-relaxed">
                {t("faq1a")}
              </CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">{t("faq2q")}</CardTitle>
              <CardDescription className="text-sm leading-relaxed">
                {t("faq2a")}
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>
    </div>
  );
}
