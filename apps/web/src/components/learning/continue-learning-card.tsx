"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import { ArrowRight } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { TENSE_COUNT } from "@/lib/grammar-slugs";
import { cn } from "@/lib/utils";
import { suggestNextTenseSlug } from "@/lib/learning-stats";
import { useLearningStats } from "@/hooks/use-learning-stats";

type TenseOption = { slug: string; label: string };

type Props = {
  tenseOptions: TenseOption[];
};

export function ContinueLearningCard({ tenseOptions }: Props) {
  const t = useTranslations("dashboard");
  const stats = useLearningStats();
  const nextSlug = useMemo(() => suggestNextTenseSlug(stats), [stats]);
  const percent = Math.round((stats.completedTenses.length / TENSE_COUNT) * 100);

  const label =
    tenseOptions.find((o) => o.slug === nextSlug)?.label ??
    tenseOptions[0]?.label ??
    t("startGrammar");

  return (
    <Card className="border-primary/15 bg-card shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg">{t("continueTitle")}</CardTitle>
        <CardDescription>{t("continueDesc")}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{t("tenseProgress")}</span>
            <span>{percent}%</span>
          </div>
          <Progress value={percent} className="h-2" />
        </div>
        <p className="text-sm font-medium text-foreground">{label}</p>
        <Link
          href={nextSlug ? `/grammar/${nextSlug}` : "/grammar"}
          className={cn(buttonVariants({ size: "lg" }), "inline-flex gap-2")}
        >
          {t("continueCta")}
          <ArrowRight className="size-4" aria-hidden />
        </Link>
      </CardContent>
    </Card>
  );
}
