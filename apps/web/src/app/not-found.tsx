import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, getTranslations, setRequestLocale } from "next-intl/server";
import { ThemeInit } from "@/components/theme-init";
import { HttpStatusPage } from "@/components/errors/http-status-page";
import { buildErrorPageProps } from "@/lib/error-page-props";
import { routing } from "@/i18n/routing";
import "./globals.css";

const inter = Inter({
  subsets: ["latin", "vietnamese"],
  variable: "--font-sans",
  display: "swap",
});

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin", "vietnamese"],
  variable: "--font-heading",
  display: "swap",
});

/** Không qua `[locale]/layout` — bọc intl + CSS giống portal. */
export async function generateMetadata() {
  setRequestLocale(routing.defaultLocale);
  const t = await getTranslations("errors");
  return {
    title: t("metaTitle404"),
    robots: { index: false, follow: false },
  };
}

export default async function RootNotFound() {
  setRequestLocale(routing.defaultLocale);
  const messages = await getMessages();
  const t = await getTranslations("errors");
  const nav = await getTranslations("nav");

  const props = buildErrorPageProps(404, t, nav("brand"), {
    primaryCta: "home",
    showHome: true,
    showExplore: true,
    showLearningShortcuts: true,
  });

  return (
    <html
      lang={routing.defaultLocale}
      className={`${inter.variable} ${plusJakarta.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full bg-background text-foreground" suppressHydrationWarning>
        <ThemeInit />
        <NextIntlClientProvider locale={routing.defaultLocale} messages={messages}>
          <HttpStatusPage {...props} />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
