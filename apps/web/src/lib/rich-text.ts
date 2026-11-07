/** Visible character count for SEO hints (ignores HTML tags). */
export function plainTextLength(html: string | null | undefined): number {
  if (!html?.trim()) return 0;
  const stripped = html
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
  return stripped.length;
}

export function looksLikeHtml(value: string): boolean {
  return /<[a-z][\s\S]*>/i.test(value);
}

export function isRichTextEmpty(html: string | null | undefined): boolean {
  return plainTextLength(html) === 0;
}

/** Shared typography for stored HTML on the public site. */
export const richHtmlClassName =
  "[&_p]:my-1 [&_ul]:my-1 [&_ol]:my-1 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_blockquote]:border-l-2 [&_blockquote]:border-border [&_blockquote]:pl-3 [&_a]:text-primary [&_a]:underline";

export const RTE_IMAGE_DEFAULT_MAX_WIDTH = 360;

export const RTE_IMAGE_WIDTH_PRESETS = [200, 320, 480, 640] as const;

/** Width/height attrs from editor HTML or resize (number, string, or missing). */
export function parseImagePixelAttribute(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) {
    return Math.round(value);
  }
  if (typeof value === "string" && value.trim() !== "") {
    const n = Number.parseFloat(value);
    return Number.isFinite(n) ? Math.round(n) : null;
  }
  return null;
}

export function fitImageDimensions(
  naturalWidth: number,
  naturalHeight: number,
  maxWidth = RTE_IMAGE_DEFAULT_MAX_WIDTH,
): { width: number; height: number } {
  if (naturalWidth <= 0 || naturalHeight <= 0) {
    return { width: maxWidth, height: Math.round(maxWidth * 0.75) };
  }
  if (naturalWidth <= maxWidth) {
    return { width: naturalWidth, height: naturalHeight };
  }
  const width = maxWidth;
  const height = Math.max(1, Math.round((naturalHeight / naturalWidth) * width));
  return { width, height };
}

export function loadImageNaturalSize(src: string): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight });
    img.onerror = () => reject(new Error("Could not load image"));
    img.src = src;
  });
}

/** Treat empty editor output as blank for API payloads. */
export function normalizeRichTextHtml(html: string): string {
  const t = html.trim();
  if (t === "" || t === "<p></p>" || t === "<p><br></p>") return "";
  return html;
}
