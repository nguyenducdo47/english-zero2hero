import type { Locale } from "@/i18n/routing";
import type { Tense, TenseGroup } from "@/lib/grammar-data";

type Translatable = {
  translations?: Partial<Record<Locale, Record<string, unknown>>>;
  name_vi?: string;
  name_en?: string;
  usage_vi?: string[];
  pitfalls_vi?: string;
};

function pickTranslation(
  item: Translatable,
  locale: Locale,
  field: string,
  legacy?: string,
): string | undefined {
  const fromBag = item.translations?.[locale]?.[field];
  if (typeof fromBag === "string") return fromBag;
  if (Array.isArray(fromBag)) return undefined;
  return legacy;
}

export function tenseName(tense: Tense, locale: Locale): string {
  return (
    pickTranslation(tense, locale, "name", locale === "en" ? tense.name_en : tense.name_vi) ??
    tense.name_en
  );
}

export function groupName(group: TenseGroup, locale: Locale): string {
  return (
    pickTranslation(group, locale, "name", locale === "en" ? group.name_en : group.name_vi) ??
    group.name_en
  );
}

export function tenseUsage(tense: Tense, locale: Locale): string[] {
  const fromBag = tense.translations?.[locale]?.usage;
  if (Array.isArray(fromBag)) return fromBag as string[];
  return tense.usage_vi;
}

export function tensePitfalls(tense: Tense, locale: Locale): string | undefined {
  const fromBag = tense.translations?.[locale]?.pitfalls;
  if (typeof fromBag === "string") return fromBag;
  return tense.pitfalls_vi;
}
