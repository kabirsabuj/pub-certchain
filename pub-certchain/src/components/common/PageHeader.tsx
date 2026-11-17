import type { ReactNode } from "react";

export function PageHeader({ eyebrow, title, description, actions }: { eyebrow: string; title: string; description?: string; actions?: ReactNode }) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4 border-b pb-6">
      <div>
        <p className="flex items-center gap-2 font-mono text-xs uppercase tracking-[0.2em] text-primary">
          <span className="inline-block h-px w-8 bg-accent" />
          {eyebrow}
        </p>
        <h1 className="mt-2 text-4xl font-semibold">{title}</h1>
        {description && <p className="mt-2 max-w-2xl text-muted-foreground">{description}</p>}
      </div>
      {actions}
    </div>
  );
}
