import { Suspense } from "react";
import type { Metadata } from "next";
import { getLocale } from "next-intl/server";
import { getAllTenseSlugs, getTense } from "@/lib/grammar-data";
import { tenseName } from "@/lib/grammar-i18n";
import type { Locale } from "@/i18n/routing";
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
  return {
    title: name,
    description: `${tense.name_en} — ${name}`,
  };
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

export default function TenseDetailPage({ params }: Props) {
  return (
    <Suspense fallback={<TenseDetailFallback />}>
      <TenseDetailContent params={params} />
    </Suspense>
  );
}
