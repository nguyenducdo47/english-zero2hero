export type GrammarAnalyzeMode = "word" | "sentence" | "paragraph";

export type GrammarAnalyzeRequest = {
  text: string;
  source_lang: "auto" | string;
  target_lang: "auto" | string;
  mode: GrammarAnalyzeMode;
};

export type GrammarAnalysisSentence = {
  original: string;
  translation: string;
  tense_slugs: string[];
  structure: string;
  grammar_notes_vi: string[];
};

export type GrammarAnalysisResult = {
  version: number;
  translation: string;
  translation_source: "libretranslate" | "mymemory" | "placeholder" | "openai";
  detected_source_lang: string;
  target_lang: string;
  summary_vi: string;
  provider: string;
  capabilities: {
    translation: string;
    analysis: string;
  };
  sentences: GrammarAnalysisSentence[];
  keywords: Array<{
    term: string;
    translation: string | null;
    part_of_speech: string | null;
    note_vi: string | null;
  }>;
  links: Array<{ tense_slug: string; label: string }>;
};

export type GrammarAnalysisQuota = {
  allowed: boolean;
  limit: number;
  remaining: number;
  resets_at: string;
  used: number;
};

export type GrammarAnalyzeResponse = {
  data: GrammarAnalysisResult;
  meta: {
    locale?: string;
    quota?: GrammarAnalysisQuota;
  };
};
