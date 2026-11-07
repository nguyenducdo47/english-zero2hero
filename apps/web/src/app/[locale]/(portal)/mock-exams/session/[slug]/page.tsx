import { MockSessionClient } from "./mock-session-client";

export const instant = false;

export function generateStaticParams() {
  return [{ slug: "toeic-mini-lr-450" }, { slug: "ielts-mini-band-5" }];
}

export default async function MockSessionPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <MockSessionClient slug={slug} />;
}
