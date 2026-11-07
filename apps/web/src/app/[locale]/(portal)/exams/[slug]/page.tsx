import { Suspense } from "react";
import type { Metadata } from "next";
import { getLocale } from "next-intl/server";
import { ExamPageClient } from "./exam-page-client";
import { Skeleton } from "@/components/ui/skeleton";
import type { Locale } from "@/i18n/routing";
import { fetchSeoResolve, mergeMetadataWithSeo } from "@/lib/seo-metadata";

export const instant = false;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const locale = (await getLocale()) as Locale;
  const resolved = await fetchSeoResolve(`/exams/${slug}`, locale);
  return mergeMetadataWithSeo(resolved, {
    title: resolved?.title ?? slug,
    description: resolved?.description ?? undefined,
  });
}

export function generateStaticParams() {
  return [{ slug: "toeic-mini-lr-450" }, { slug: "ielts-mini-band-5" }];
}

function ExamLoadingFallback() {
  return (
    <div className="space-y-4" aria-busy>
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-64 w-full" />
    </div>
  );
}

export default function ExamDetailPage() {
  return (
    <Suspense fallback={<ExamLoadingFallback />}>
      <ExamPageClient />
    </Suspense>
  );
}
