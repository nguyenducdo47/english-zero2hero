import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { TtsButton } from "@/components/tts-button";
import { TenseReadTracker } from "./tense-read-tracker";
import { getAllTenseSlugs, getTense, loadGrammar } from "@/lib/grammar-data";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return getAllTenseSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const tense = getTense(slug);
  if (!tense) return {};
  return {
    title: tense.name_vi,
    description: `Cấu trúc và cách dùng ${tense.name_en} — ${tense.name_vi}`,
  };
}

export default async function TenseDetailPage({ params }: Props) {
  const { slug } = await params;
  const tense = getTense(slug);
  if (!tense) notFound();

  const group = loadGrammar().groups.find((g) => g.slug === tense.group_slug);

  return (
    <article className="space-y-6">
      <TenseReadTracker slug={slug} />
      <div>
        <p className="text-sm text-indigo-600">{group?.name_vi}</p>
        <h1 className="text-2xl font-bold">{tense.name_vi}</h1>
        <p className="text-slate-600">{tense.name_en}</p>
      </div>

      <section className="rounded-xl bg-white p-5 shadow-sm">
        <h2 className="font-semibold">Cấu trúc</h2>
        <p className="mt-2 font-mono text-sm text-slate-800">{tense.structure}</p>
      </section>

      <section className="rounded-xl bg-white p-5 shadow-sm">
        <h2 className="font-semibold">Cách dùng</h2>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-700">
          {tense.usage_vi.map((u) => (
            <li key={u}>{u}</li>
          ))}
        </ul>
      </section>

      <section className="rounded-xl bg-white p-5 shadow-sm">
        <h2 className="font-semibold">Dấu hiệu nhận biết</h2>
        <p className="mt-2 text-sm text-slate-700">
          {tense.signals.join(", ")}
        </p>
      </section>

      {tense.pitfalls_vi && (
        <section className="rounded-xl border border-amber-200 bg-amber-50 p-5">
          <h2 className="font-semibold text-amber-900">Lưu ý</h2>
          <p className="mt-2 text-sm text-amber-900">{tense.pitfalls_vi}</p>
        </section>
      )}

      <section className="space-y-4">
        <h2 className="font-semibold">Ví dụ</h2>
        {tense.examples.map((ex) => (
          <div
            key={ex.en}
            className="rounded-xl border border-slate-200 bg-white p-4"
          >
            <div className="flex items-start justify-between gap-2">
              <p className="font-medium text-slate-900">{ex.en}</p>
              <TtsButton text={ex.en} />
            </div>
            <p className="mt-2 text-sm text-slate-600">{ex.vi}</p>
          </div>
        ))}
      </section>

      {group && (
        <Link
          href={`/grammar/groups/${group.slug}/quiz`}
          className="inline-block text-sm font-medium text-indigo-600 hover:underline"
        >
          Ôn quiz nhóm {group.name_vi} →
        </Link>
      )}
    </article>
  );
}
