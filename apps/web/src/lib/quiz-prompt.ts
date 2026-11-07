import type { Locale } from "@/i18n/routing";

/** Câu hỏi luôn EN; bản dịch theo locale UI khi khác en. */
export type QuizPromptFields = {
  prompt_en?: string | null;
  prompt_locale?: string | null;
  prompt_vi?: string | null;
  prompt?: string | null;
};

export function resolveQuizPrompt(
  question: QuizPromptFields,
  uiLocale: Locale,
): { promptEn: string; promptSubtitle: string | null } {
  const promptEn =
    question.prompt_en?.trim() ||
    question.prompt?.trim() ||
    "";

  if (uiLocale === "en") {
    return { promptEn, promptSubtitle: null };
  }

  const translated =
    question.prompt_locale?.trim() ||
    (uiLocale === "vi" ? question.prompt_vi?.trim() : undefined) ||
    null;

  if (!translated || translated === promptEn) {
    return { promptEn, promptSubtitle: null };
  }

  return { promptEn, promptSubtitle: translated };
}
