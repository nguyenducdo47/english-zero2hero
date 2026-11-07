type Props = {
  blocks: Record<string, unknown>[];
};

export function SeoJsonLd({ blocks }: Props) {
  if (!blocks?.length) return null;

  return (
    <>
      {blocks.map((block, i) => (
        <script
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: JSON.stringify(block) }}
          key={`ld-${i}`}
          type="application/ld+json"
        />
      ))}
    </>
  );
}
