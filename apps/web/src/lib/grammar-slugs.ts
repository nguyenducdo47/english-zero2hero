/** Slug order cho client (không import fs). Đồng bộ với packages/content/grammar.json */
export const TENSE_SLUGS_BY_ORDER = [
  "present-simple",
  "present-continuous",
  "present-perfect",
  "past-simple",
  "past-continuous",
  "past-perfect",
  "future-simple",
  "future-continuous",
  "future-perfect",
  "present-perfect-continuous",
  "past-perfect-continuous",
  "future-perfect-continuous",
] as const;

export const TENSE_COUNT = TENSE_SLUGS_BY_ORDER.length;
export const GROUP_COUNT = 4;
