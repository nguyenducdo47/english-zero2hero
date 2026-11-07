type Props = {
  title: string;
  structure: string;
};

/** Hiển thị cấu trúc thì — dễ quét, font mono, viền primary. */
export function TenseStructureBlock({ title, structure }: Props) {
  const lines = structure
    .split(/(?=Affirmative:|Negative:|Question:|Khẳng định:|Phủ định:|Câu hỏi:)/i)
    .map((s) => s.trim())
    .filter(Boolean);

  return (
    <section className="space-y-3">
      <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
      <div className="space-y-2 rounded-xl border border-border bg-muted/30 p-4">
        {lines.length > 1 ? (
          lines.map((line) => (
            <p
              key={line.slice(0, 24)}
              className="border-l-4 border-primary/80 py-1 pl-3 font-mono text-sm leading-relaxed text-foreground"
            >
              {line}
            </p>
          ))
        ) : (
          <p className="border-l-4 border-primary/80 py-1 pl-3 font-mono text-sm leading-relaxed text-foreground">
            {structure}
          </p>
        )}
      </div>
    </section>
  );
}
