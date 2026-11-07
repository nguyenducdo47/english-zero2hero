"use client";

import { useLocale, useTranslations } from "next-intl";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import type { Locale } from "@/i18n/routing";
import { RichHtml } from "@/components/ui/rich-html";
import { resolveQuizPrompt, type QuizPromptFields } from "@/lib/quiz-prompt";

export type QuizQuestion = QuizPromptFields & {
  id: number;
  type: string;
  options?: string[] | null;
};

type Props = {
  index: number;
  total: number;
  question: QuizQuestion;
  value: string | number | undefined;
  onChange: (value: string | number) => void;
};

export function QuizQuestionStep({
  index,
  total,
  question,
  value,
  onChange,
}: Props) {
  const t = useTranslations("quiz");
  const locale = useLocale() as Locale;
  const { promptEn, promptSubtitle } = resolveQuizPrompt(question, locale);

  return (
    <Card className="border-primary/10 shadow-sm">
      <CardHeader className="pb-2">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {t("questionOf", { current: index + 1, total })}
        </p>
        <RichHtml
          as="div"
          className="text-base font-semibold leading-snug"
          html={promptEn}
        />
        {promptSubtitle ? (
          <RichHtml
            as="p"
            className="text-sm font-normal leading-relaxed text-muted-foreground"
            html={promptSubtitle}
          />
        ) : null}
      </CardHeader>
      <CardContent>
        {question.type === "multiple_choice" && question.options && (
          <RadioGroup
            value={value !== undefined ? String(value) : ""}
            onValueChange={(v) => onChange(Number(v))}
            className="gap-3"
          >
            {question.options.map((opt, oi) => (
              <div key={oi} className="flex items-center gap-2">
                <RadioGroupItem value={String(oi)} id={`opt-${question.id}-${oi}`} />
                <Label
                  htmlFor={`opt-${question.id}-${oi}`}
                  className="font-normal leading-snug"
                  lang="en"
                >
                  {opt}
                </Label>
              </div>
            ))}
          </RadioGroup>
        )}
        {question.type === "fill_blank" && (
          <Input
            placeholder={t("fillPlaceholder")}
            value={String(value ?? "")}
            onChange={(e) => onChange(e.target.value)}
            aria-label={promptEn}
            lang="en"
          />
        )}
      </CardContent>
    </Card>
  );
}
