import { notFound } from "next/navigation";
import { getGroup, loadGrammar } from "@/lib/grammar-data";
import { GroupQuizLoader } from "./group-quiz-loader";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return loadGrammar().groups.map((g) => ({ slug: g.slug }));
}

export default async function GroupQuizPage({ params }: Props) {
  const { slug } = await params;
  const group = getGroup(slug);
  if (!group) notFound();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Quiz — {group.name_vi}</h1>
        <p className="text-sm text-slate-600">
          Câu hỏi ngẫu nhiên; kết quả đúng/sai và đáp án sau khi nộp.
        </p>
      </div>
      <GroupQuizLoader slug={slug} groupName={group.name_vi} />
    </div>
  );
}
