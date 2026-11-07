import { Suspense } from "react";
import type { Metadata } from "next";
import { getLocale } from "next-intl/server";
import { getAllTenseSlugs, getTense } from "@/lib/grammar-data";
import { tenseName } from "@/lib/grammar-i18n";
import type { Locale } from "@/i18n/routing";
import {
  fetchSeoResolve,
  mergeMetadataWithSeo,
} from "@/lib/seo-metadata";
import { SeoJsonLd } from "@/components/seo/seo-json-ld";
import { TenseDetailContent } from "./tense-detail-content";

type Props = { params: Promise<{ slug: string }> };

export const instant = false;

export async function generateStaticParams() {
  return getAllTenseSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const tense = getTense(slug);
  if (!tense) return {};
  const locale = (await getLocale()) as Locale;
  const name = tenseName(tense, locale);
  const resolved = await fetchSeoResolve(`/grammar/${slug}`, locale);
  return mergeMetadataWithSeo(resolved, {
    title: resolved?.page_override && resolved.title ? resolved.title : name,
    description:
      resolved?.page_override && resolved.description
        ? resolved.description
        : `${tense.name_en} — ${name}`,
  });
}

function TenseDetailFallback() {
  return (
    <div className="animate-pulse space-y-4">
      <div className="h-8 w-2/3 rounded bg-slate-200" />
      <div className="h-24 rounded-xl bg-slate-200" />
      <div className="h-24 rounded-xl bg-slate-200" />
    </div>
  );
}

async function TenseDetailJsonLd({ slug }: { slug: string }) {
  const locale = (await getLocale()) as Locale;
  const seo = await fetchSeoResolve(`/grammar/${slug}`, locale);
  return <SeoJsonLd blocks={seo?.json_ld ?? []} />;
}

export default async function TenseDetailPage({ params }: Props) {
  const { slug } = await params;
  return (
    <>
      <TenseDetailJsonLd slug={slug} />
      <Suspense fallback={<TenseDetailFallback />}>
        <TenseDetailContent params={params} />
      </Suspense>
    </>
  );
}
