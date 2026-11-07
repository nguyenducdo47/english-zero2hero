import fs from "fs";
import path from "path";

export type GrammarExample = { en: string; vi: string };

export type Tense = {
  slug: string;
  name_en: string;
  name_vi: string;
  translations?: Record<string, Record<string, unknown>>;
  group_slug: string;
  sort_order: number;
  structure: string;
  usage_vi: string[];
  signals: string[];
  pitfalls_vi?: string;
  examples: GrammarExample[];
};

export type TenseGroup = {
  slug: string;
  name_vi: string;
  name_en: string;
  translations?: Record<string, Record<string, unknown>>;
  sort_order: number;
};

export type GrammarBundle = {
  groups: TenseGroup[];
  tenses: Tense[];
};

function contentPath(file: string): string {
  return path.join(process.cwd(), "..", "..", "packages", "content", file);
}

export function loadGrammar(): GrammarBundle {
  const raw = fs.readFileSync(contentPath("grammar.json"), "utf-8");
  return JSON.parse(raw) as GrammarBundle;
}

export function getTense(slug: string): Tense | undefined {
  return loadGrammar().tenses.find((t) => t.slug === slug);
}

export function getAllTenseSlugs(): string[] {
  return loadGrammar().tenses.map((t) => t.slug);
}

export function getGroup(slug: string): TenseGroup | undefined {
  return loadGrammar().groups.find((g) => g.slug === slug);
}
