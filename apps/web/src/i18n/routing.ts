import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["vi", "en"],
  defaultLocale: "vi",
  localePrefix: "as-needed",
  /** Không đoán theo Accept-Language trình duyệt — mặc định luôn tiếng Việt. */
  localeDetection: false,
});

export type Locale = (typeof routing.locales)[number];
