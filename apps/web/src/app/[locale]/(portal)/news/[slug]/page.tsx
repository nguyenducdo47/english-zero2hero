import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getLocale } from "next-intl/server";
import { PageHeader } from "@/components/layout/page-header";
import { RichHtml } from "@/components/ui/rich-html";
import type { Locale } from "@/i18n/routing";
import {
  fetchContentPost,
  fetchPublishedPostSlugs,
} from "@/lib/content-posts";
import {
  fetchSeoResolve,
  mergeMetadataWithSeo,
} from "@/lib/seo-metadata";

type Props = { params: Promise<{ slug: string }> };

export const instant = false;

export async function generateStaticParams() {
  const slugs = await fetchPublishedPostSlugs("news");
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const locale = (await getLocale()) as Locale;
  const post = await fetchContentPost("news", slug, locale);
  if (!post) return {};
  const resolved = await fetchSeoResolve(`/news/${slug}`, locale);
  return mergeMetadataWithSeo(resolved, {
    title: resolved?.page_override && resolved.title ? resolved.title : post.title,
    description:
      resolved?.page_override && resolved.description
        ? resolved.description
        : post.excerpt,
  });
}

export default async function NewsPostPage({ params }: Props) {
  const { slug } = await params;
  const locale = (await getLocale()) as Locale;
  const post = await fetchContentPost("news", slug, locale);
  if (!post) notFound();

  return (
    <article className="space-y-6">
      <PageHeader title={post.title} description={post.excerpt} />
      <RichHtml className="max-w-none" html={post.body} />
    </article>
  );
}
