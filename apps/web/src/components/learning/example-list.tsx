import { TtsButton } from "@/components/tts-button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import type { GrammarExample } from "@/lib/grammar-data";

type Props = {
  title: string;
  examples: GrammarExample[];
};

export function ExampleList({ title, examples }: Props) {
  return (
    <section className="space-y-3">
      <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
      <div className="grid gap-3">
        {examples.map((ex) => (
          <Card key={ex.en} className="border-border/80 shadow-sm">
            <CardHeader className="flex flex-row items-start justify-between gap-2 space-y-0 p-4 pb-2">
              <p className="text-base font-medium leading-snug text-foreground">{ex.en}</p>
              <TtsButton text={ex.en} />
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <p className="text-sm leading-relaxed text-muted-foreground">{ex.vi}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
