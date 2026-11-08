import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getLocale } from "next-intl/server";
import { HubPostGrid } from "@/components/content/hub-post-grid";
import { PageHeader } from "@/components/layout/page-header";
import { RichHtml } from "@/components/ui/rich-html";
import { fetchHubPosts } from "@/lib/content-posts";
import type { Locale } from "@/i18n/routing";
import {
  fetchPublishedStaticSlugs,
  fetchStaticPage,
} from "@/lib/static-pages";
import {
  fetchSeoResolve,
  mergeMetadataWithSeo,
} from "@/lib/seo-metadata";

type Props = { params: Promise<{ slug: string }> };

export const instant = false;

export async function generateStaticParams() {
  const slugs = await fetchPublishedStaticSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const locale = (await getLocale()) as Locale;
  const page = await fetchStaticPage(slug, locale);
  if (!page) return {};
  const resolved = await fetchSeoResolve(`/${slug}`, locale);
  return mergeMetadataWithSeo(resolved, {
    title:
      resolved?.page_override && resolved.title
        ? resolved.title
        : page.title || slug,
    description:
      resolved?.page_override && resolved.description
        ? resolved.description
        : page.excerpt,
  });
}

export default async function StaticCmsPage({ params }: Props) {
  const { slug } = await params;
  const locale = (await getLocale()) as Locale;
  const page = await fetchStaticPage(slug, locale);
  if (!page) notFound();

  const isHub = page.page_kind === "blog" || page.page_kind === "news";
  const hubPosts = isHub ? await fetchHubPosts(slug, locale) : [];

  return (
    <article className="space-y-8">
      <PageHeader title={page.title} description={page.excerpt} />
      {page.body.trim() ? <RichHtml className="max-w-none" html={page.body} /> : null}
      {isHub ? (
        <HubPostGrid
          channel={page.page_kind as "blog" | "news"}
          posts={hubPosts}
        />
      ) : null}
    </article>
  );
}
