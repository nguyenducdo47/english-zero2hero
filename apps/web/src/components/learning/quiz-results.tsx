"use client";

import { useTranslations } from "next-intl";
import { RichHtml } from "@/components/ui/rich-html";
import { Link } from "@/i18n/navigation";
import { CheckCircle2, XCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

export type QuizResultRow = {
  question_id: number;
  is_correct: boolean;
  correct_answer: unknown;
  explanation?: string;
};

type Props = {
  groupName: string;
  score: number;
  maxScore: number;
  results: QuizResultRow[];
  grammarHref: string;
};

export function QuizResults({ groupName, score, maxScore, results, grammarHref }: Props) {
  const t = useTranslations("quiz");
  const pct = maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;

  return (
    <div className="space-y-6">
      <Alert className="border-secondary/30 bg-secondary/10">
        <AlertTitle className="text-lg">
          {t("result", { group: groupName, score, max: maxScore })}
        </AlertTitle>
        <AlertDescription className="mt-2 space-y-2">
          <Progress value={pct} className="h-2" />
          <p className="text-sm text-muted-foreground">{t("scorePercent", { pct })}</p>
        </AlertDescription>
      </Alert>

      <ul className="space-y-3">
        {results.map((r, idx) => (
          <li key={r.question_id}>
            <Card
              className={cn(
                "border-l-4",
                r.is_correct ? "border-l-secondary" : "border-l-destructive",
              )}
            >
              <CardHeader className="flex flex-row items-center justify-between gap-2 p-4 pb-2">
                <CardTitle className="flex items-center gap-2 text-base font-medium">
                  {r.is_correct ? (
                    <CheckCircle2 className="size-5 text-secondary" aria-hidden />
                  ) : (
                    <XCircle className="size-5 text-destructive" aria-hidden />
                  )}
                  {t("question", { n: idx + 1 })}
                </CardTitle>
                <Badge variant={r.is_correct ? "secondary" : "destructive"}>
                  {r.is_correct ? t("correct") : t("wrong")}
                </Badge>
              </CardHeader>
              <CardContent className="space-y-2 p-4 pt-0 text-sm">
                {!r.is_correct && (
                  <p className="text-muted-foreground">
                    {t("correctAnswer")}{" "}
                    <span className="font-medium text-foreground">
                      {formatAnswer(r.correct_answer)}
                    </span>
                  </p>
                )}
                {r.explanation ? (
                  <RichHtml
                    as="p"
                    className="leading-relaxed text-muted-foreground"
                    html={r.explanation}
                  />
                ) : null}
              </CardContent>
            </Card>
          </li>
        ))}
      </ul>

      <Link href={grammarHref} className={cn(buttonVariants({ variant: "outline" }))}>
        {t("backToGrammar")}
      </Link>
    </div>
  );
}

function formatAnswer(answer: unknown): string {
  if (answer === null || answer === undefined) return "—";
  if (typeof answer === "object" && answer !== null && "index" in answer) {
    return String((answer as { index: number }).index);
  }
  if (typeof answer === "object") return JSON.stringify(answer);
  return String(answer);
}
