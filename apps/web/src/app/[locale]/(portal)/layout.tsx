import type { Metadata } from "next";
import { getLocale } from "next-intl/server";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { SeoJsonLd } from "@/components/seo/seo-json-ld";
import { fetchSeoResolve } from "@/lib/seo-metadata";
import { fetchHeaderNavLinks } from "@/lib/static-pages";
import type { Locale } from "@/i18n/routing";

export async function generateMetadata(): Promise<Metadata> {
  const locale = (await getLocale()) as Locale;
  const seo = await fetchSeoResolve("/", locale);
  if (!seo?.favicon_url) return {};
  return {
    icons: {
      icon: [{ url: seo.favicon_url }],
      shortcut: seo.favicon_url,
    },
  };
}

export default async function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = (await getLocale()) as Locale;
  const [seo, cmsLinks] = await Promise.all([
    fetchSeoResolve("/", locale),
    fetchHeaderNavLinks(locale),
  ]);

  return (
    <div className="flex min-h-dvh flex-col overflow-x-hidden">
      <SeoJsonLd blocks={seo?.json_ld ?? []} />
      <SiteHeader
        brandName={seo?.site_name}
        cmsLinks={cmsLinks}
        logoUrl={seo?.site_logo_url}
      />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 md:py-10">
        {children}
      </main>
      <SiteFooter />
    </div>
  );
}
