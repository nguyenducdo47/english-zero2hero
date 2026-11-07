import Link from "next/link";
import type { Metadata } from "next";
import { loadGrammar } from "@/lib/grammar-data";

export const metadata: Metadata = {
  title: "12 thì tiếng Anh",
  description:
    "Tổng hợp 12 thì: cấu trúc, cách dùng, ví dụ tiếng Việt và bài ôn theo nhóm.",
};

export default function GrammarIndexPage() {
  const { groups, tenses } = loadGrammar();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">12 thì tiếng Anh</h1>
        <p className="mt-2 text-slate-600">
          Học theo nhóm, làm quiz ôn ngẫu nhiên cuối mỗi nhóm.
        </p>
      </div>
      {groups
        .slice()
        .sort((a, b) => a.sort_order - b.sort_order)
        .map((group) => (
          <section key={group.slug} className="space-y-3">
            <div className="flex flex-wrap items-end justify-between gap-2">
              <h2 className="text-lg font-semibold text-indigo-800">
                {group.name_vi}
              </h2>
              <Link
                href={`/grammar/groups/${group.slug}/quiz`}
                className="text-sm font-medium text-indigo-600 hover:underline"
              >
                Làm bài ôn nhóm →
              </Link>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {tenses
                .filter((t) => t.group_slug === group.slug)
                .sort((a, b) => a.sort_order - b.sort_order)
                .map((tense) => (
                  <Link
                    key={tense.slug}
                    href={`/grammar/${tense.slug}`}
                    className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-indigo-300"
                  >
                    <p className="font-medium">{tense.name_vi}</p>
                    <p className="text-sm text-slate-500">{tense.name_en}</p>
                  </Link>
                ))}
            </div>
          </section>
        ))}
    </div>
  );
}
