import type { ReactNode } from "react";

type DetailFactsPanelProps = {
  title?: string;
  children: ReactNode;
};

export function DetailFactsPanel({ title = "Information", children }: DetailFactsPanelProps) {
  return (
    <div className="flex flex-col gap-2.5 rounded-xl border border-border bg-card/50 p-4">
      <p className="text-sm font-medium">{title}</p>
      <dl className="flex flex-col gap-2.5">{children}</dl>
    </div>
  );
}
