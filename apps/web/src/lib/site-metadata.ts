import type { Metadata } from "next";

/** Static defaults — safe for Next.js 16 metadata prefetch (no `params` in `generateMetadata`). */
export const staticSiteMetadata: Metadata = {
  title: {
    default: "English Zero2Hero",
    template: "%s | English Zero2Hero",
  },
  description:
    "12 English tenses for beginners, TOEIC/IELTS prep — Ôn 12 thì, luyện thi và chấm bài.",
};
