import type { ReactNode } from "react";

type Props = {
  title: string;
  description?: string;
  actions?: ReactNode;
};

export function AdminPageHeader({ title, description, actions }: Props) {
  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <h1 className="font-[family-name:var(--font-heading)] text-2xl font-semibold text-[var(--admin-text)]">
          {title}
        </h1>
        {description ? (
          <p className="mt-1 text-sm text-[var(--admin-text-muted)]">{description}</p>
        ) : null}
      </div>
      {actions ? <div className="flex shrink-0 gap-2">{actions}</div> : null}
    </div>
  );
}
