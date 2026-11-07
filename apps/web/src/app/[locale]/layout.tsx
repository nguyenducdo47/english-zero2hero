import { Inter, Noto_Sans, Plus_Jakarta_Sans } from "next/font/google";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { getLocale, getMessages, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { ThemeInit } from "@/components/theme-init";
import { Toaster } from "@/components/ui/sonner";
import { routing } from "@/i18n/routing";
import { staticSiteMetadata } from "@/lib/site-metadata";
import "../globals.css";

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

const notoSans = Noto_Sans({
  subsets: ["latin", "vietnamese"],
  variable: "--font-ipa",
  display: "swap",
});

type Props = {
  children: React.ReactNode;
};

/** Static defaults — dynamic SEO comes from portal page `generateMetadata` (cached API). */
export const metadata = staticSiteMetadata;

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({ children }: Props) {
  const locale = await getLocale();
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  setRequestLocale(locale);
  const messages = await getMessages();

  return (
    <html
      lang={locale}
      className={`${inter.variable} ${plusJakarta.variable} ${notoSans.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body
        className="min-h-full bg-background text-foreground"
        suppressHydrationWarning
      >
        <ThemeInit />
        <NextIntlClientProvider messages={messages}>
          <Toaster />
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
