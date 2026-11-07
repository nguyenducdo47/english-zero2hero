import { cn } from "@/lib/utils";
import { looksLikeHtml, richHtmlClassName } from "@/lib/rich-text";

type RichHtmlProps = {
  html: string;
  className?: string;
  as?: "div" | "p" | "span";
};

/** Renders admin-authored HTML or plain text (backward compatible). */
export function RichHtml({ html, className, as: Tag = "div" }: RichHtmlProps) {
  const trimmed = html.trim();
  if (!trimmed) return null;

  if (!looksLikeHtml(trimmed)) {
    return <Tag className={className}>{html}</Tag>;
  }

  return (
    <Tag
      className={cn(richHtmlClassName, className)}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
