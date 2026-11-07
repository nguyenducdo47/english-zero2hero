/** Slug-friendly input: lowercase, spaces → `-`, only `a-z`, `0-9`, `-`. */
export function normalizeSlugInput(raw: string): string {
  return raw
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
}
