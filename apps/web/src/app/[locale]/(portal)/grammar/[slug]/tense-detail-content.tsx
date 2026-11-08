import { getTranslations, getLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { ExampleList } from "@/components/learning/example-list";
import { TenseStructureBlock } from "@/components/learning/tense-structure-block";
import { TenseReadTracker } from "./tense-read-tracker";
import { getTense, loadGrammar } from "@/lib/grammar-data";
import { groupName, tenseName, tensePitfalls, tenseUsage } from "@/lib/grammar-i18n";
import type { Locale } from "@/i18n/routing";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RichHtml } from "@/components/ui/rich-html";
import { cn } from "@/lib/utils";
import { TriangleAlert } from "lucide-react";

type Props = { params: Promise<{ slug: string }> };

export async function TenseDetailContent({ params }: Props) {
  const { slug } = await params;
  const tense = getTense(slug);
  if (!tense) notFound();

  const locale = (await getLocale()) as Locale;
  const t = await getTranslations("grammar");
  const group = loadGrammar().groups.find((g) => g.slug === tense.group_slug);
  const subtitle = locale === "en" ? tense.name_vi : tense.name_en;

  return (
    <article className="space-y-8">
      <TenseReadTracker slug={slug} />

      <PageHeader
        title={tenseName(tense, locale)}
        description={subtitle}
        actions={
          group ? (
            <Badge variant="secondary" className="font-normal">
              {groupName(group, locale)}
            </Badge>
          ) : undefined
        }
      />

      <TenseStructureBlock title={t("structure")} structure={tense.structure} />

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{t("usage")}</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="list-disc space-y-2 pl-5 text-sm leading-relaxed text-muted-foreground">
            {tenseUsage(tense, locale).map((u) => (
              <li key={u}>{u}</li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{t("signals")}</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          {tense.signals.map((signal) => (
            <Badge key={signal} variant="outline" className="font-mono text-xs font-normal">
              {signal}
            </Badge>
          ))}
        </CardContent>
      </Card>

      {tensePitfalls(tense, locale) && (
        <Alert className="border-warning/40 bg-warning/10">
          <TriangleAlert className="text-warning" aria-hidden />
          <AlertTitle>{t("pitfalls")}</AlertTitle>
          <AlertDescription className="text-foreground/90">
            <RichHtml html={tensePitfalls(tense, locale) ?? ""} />
          </AlertDescription>
        </Alert>
      )}

      <ExampleList title={t("examples")} examples={tense.examples} />

      <div className="flex flex-wrap gap-3">
        <Link
          href={`/grammar/${tense.slug}/quiz`}
          className={cn(buttonVariants({ size: "lg" }), "inline-flex")}
        >
          {t("quizTense", { tense: tenseName(tense, locale) })}
        </Link>
        {group ? (
          <Link
            href={`/grammar/groups/${group.slug}/quiz`}
            className={cn(buttonVariants({ variant: "outline", size: "lg" }), "inline-flex")}
          >
            {t("quizGroup", { group: groupName(group, locale) })}
          </Link>
        ) : null}
      </div>
    </article>
  );
}
