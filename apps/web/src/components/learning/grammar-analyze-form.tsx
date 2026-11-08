"use client";

import { useEffect, useState } from "react";
import { useActiveLocales } from "@/hooks/use-active-locales";
import { useLocale, useTranslations } from "next-intl";
import { ArrowLeftRight, Loader2 } from "lucide-react";
import type { Locale } from "@/i18n/routing";
import { useAuthToken } from "@/hooks/use-auth-token";
import { apiPost } from "@/lib/api";
import { formatApiError } from "@/lib/api-error";
import type {
  GrammarAnalyzeMode,
  GrammarAnalyzeResponse,
  GrammarAnalysisQuota,
  GrammarAnalysisResult,
} from "@/lib/grammar-analysis";
import { toast } from "@/lib/toast";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { GrammarAnalyzeResult } from "./grammar-analyze-result";

const selectClassName =
  "flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";

type GrammarLangValue = "auto" | string;

type Props = {
  onQuotaChange?: (quota: GrammarAnalysisQuota | null) => void;
};

export function GrammarAnalyzeForm({ onQuotaChange }: Props) {
  const t = useTranslations("grammarAnalyze");
  const locale = useLocale() as Locale;
  const token = useAuthToken();
  const { locales, loading: localesLoading, localeOptionLabel } = useActiveLocales();

  const [text, setText] = useState("");
  const [mode, setMode] = useState<GrammarAnalyzeMode>("sentence");
  const [sourceLang, setSourceLang] = useState<GrammarLangValue>("vi");
  const [targetLang, setTargetLang] = useState<GrammarLangValue>("en");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<GrammarAnalysisResult | null>(null);

  useEffect(() => {
    if (localesLoading || locales.length === 0) return;
    const codes = new Set(locales.map((loc) => loc.code));
    setSourceLang((prev) => (codes.has(prev) ? prev : codes.has("vi") ? "vi" : locales[0].code));
    setTargetLang((prev) =>
      codes.has(prev)
        ? prev
        : codes.has("en")
          ? "en"
          : (locales.find((loc) => loc.code !== "vi") ?? locales[0]).code,
    );
  }, [locales, localesLoading]);

  const swapLangs = () => {
    setSourceLang(targetLang);
    setTargetLang(sourceLang);
  };

  const submit = async () => {
    const trimmed = text.trim();
    if (!trimmed) {
      toast.error(t("errorEmpty"));
      return;
    }
    setLoading(true);
    setResult(null);
    try {
      const res = await apiPost<GrammarAnalyzeResponse>(
        "/api/v1/grammar/analyze",
        {
          text: trimmed,
          mode,
          source_lang: sourceLang,
          target_lang: targetLang,
        },
        locale,
        token ?? undefined,
      );
      setResult(res.data);
      onQuotaChange?.(res.meta.quota ?? null);
    } catch (e) {
      toast.error(t("errorTitle"), formatApiError(e));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="space-y-4 rounded-xl border border-border bg-card p-4 shadow-sm md:p-6">
        <div className="grid gap-4">
          <div className="space-y-2 sm:max-w-xs">
            <Label htmlFor="grammar-mode">{t("modeLabel")}</Label>
            <select
              id="grammar-mode"
              className={selectClassName}
              value={mode}
              onChange={(e) => setMode(e.target.value as GrammarAnalyzeMode)}
            >
              <option value="word">{t("modeWord")}</option>
              <option value="sentence">{t("modeSentence")}</option>
              <option value="paragraph">{t("modeParagraph")}</option>
            </select>
          </div>
          <div className="grid gap-3 sm:grid-cols-[1fr_auto_1fr] sm:items-end">
            <div className="space-y-2">
              <Label htmlFor="grammar-source">{t("sourceLang")}</Label>
              <select
                id="grammar-source"
                className={selectClassName}
                disabled={localesLoading}
                value={sourceLang}
                onChange={(e) => setSourceLang(e.target.value)}
              >
                <option value="auto">{t("langAuto")}</option>
                {locales.map((loc) => (
                  <option key={`src-${loc.code}`} value={loc.code}>
                    {localeOptionLabel(loc)}
                  </option>
                ))}
              </select>
            </div>
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="mx-auto size-10 shrink-0 sm:mb-0.5"
              disabled={loading}
              aria-label={t("swapLangs")}
              title={t("swapLangs")}
              onClick={swapLangs}
            >
              <ArrowLeftRight className="size-4" aria-hidden />
            </Button>
            <div className="space-y-2">
              <Label htmlFor="grammar-target">{t("targetLang")}</Label>
              <select
                id="grammar-target"
                className={selectClassName}
                disabled={localesLoading}
                value={targetLang}
                onChange={(e) => setTargetLang(e.target.value)}
              >
                <option value="auto">{t("langAuto")}</option>
                {locales.map((loc) => (
                  <option key={`tgt-${loc.code}`} value={loc.code}>
                    {localeOptionLabel(loc)}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="grammar-text">{t("textLabel")}</Label>
          <textarea
            id="grammar-text"
            rows={mode === "paragraph" ? 8 : 4}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            placeholder={t("textPlaceholder")}
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
        </div>

        <Button type="button" disabled={loading} onClick={() => void submit()}>
          {loading ? <Loader2 className="size-4 animate-spin" aria-hidden /> : null}
          {t("submit")}
        </Button>
      </div>

      {result ? <GrammarAnalyzeResult result={result} /> : null}
    </div>
  );
}
