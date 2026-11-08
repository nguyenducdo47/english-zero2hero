"use client";

import { Link } from "@/i18n/navigation";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { GrammarAnalysisResult } from "@/lib/grammar-analysis";
import { useTranslations } from "next-intl";

type Props = {
  result: GrammarAnalysisResult;
};

export function GrammarAnalyzeResult({ result }: Props) {
  const t = useTranslations("grammarAnalyze");

  const translationBadge =
    result.translation_source === "libretranslate"
      ? t("badgeTranslateLibre")
      : result.translation_source === "mymemory"
        ? t("badgeTranslateMyMemory")
        : t("badgeTranslatePlaceholder");

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        <Badge variant="secondary">{translationBadge}</Badge>
        <Badge variant="outline">{t("badgeAnalysisDemo")}</Badge>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t("translationTitle")}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-pretty leading-relaxed text-foreground">{result.translation}</p>
          <p className="mt-2 text-sm text-muted-foreground">{result.summary_vi}</p>
        </CardContent>
      </Card>

      {result.links.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          <span className="text-sm text-muted-foreground">{t("relatedTenses")}</span>
          {result.links.map((link) => (
            <Link
              key={link.tense_slug}
              href={`/grammar/${link.tense_slug}`}
              className="text-sm font-medium text-primary underline-offset-4 hover:underline"
            >
              {link.label}
            </Link>
          ))}
        </div>
      ) : null}

      <div className="space-y-4">
        <h2 className="text-lg font-semibold">{t("sentenceBreakdown")}</h2>
        {result.sentences.map((row, i) => (
          <Card key={`${i}-${row.original.slice(0, 24)}`}>
            <CardContent className="space-y-3 pt-5">
              <p className="font-medium text-foreground">{row.original}</p>
              <p className="text-muted-foreground">{row.translation}</p>
              <p className="border-l-4 border-primary/70 py-0.5 pl-3 font-mono text-sm">{row.structure}</p>
              <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
                {row.grammar_notes_vi.map((note) => (
                  <li key={note}>{note}</li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
