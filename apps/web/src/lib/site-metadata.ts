import type { Metadata } from "next";

/** Static defaults — safe for Next.js 16 metadata prefetch (no `params` in `generateMetadata`). */
export const staticSiteMetadata: Metadata = {
  title: {
    default: "English Zero2Hero",
    template: "%s | English Zero2Hero",
  },
  description:
    "Ôn 12 thì tiếng Anh cho người mất gốc, luyện TOEIC/IELTS, chấm bài và AI review.",
};
