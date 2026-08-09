import { cn } from "@/lib/utils";

export function SectionHeader({
  eyebrow,
  title,
  description,
  count,
  action,
  eyebrowClassName,
  className,
}: {
  eyebrow: string;
  title: string;
  description?: string;
  count?: string;
  action?: React.ReactNode;
  eyebrowClassName?: string;
  className?: string;
}) {
  "use memo";
  return (
    <div className={cn("mb-5 flex items-end justify-between gap-5", className)}>
      <div className="min-w-0">
        <p className={cn("eyebrow", eyebrowClassName)}>{eyebrow}</p>
        <div className="mt-2 flex items-baseline gap-3">
          <h2 className="text-2xl font-semibold tracking-[-0.035em] sm:text-3xl">{title}</h2>
          {count && <span className="font-mono text-xs text-muted-foreground">{count}</span>}
        </div>
        {description && (
          <p className="mt-1.5 max-w-xl text-sm leading-6 text-muted-foreground">{description}</p>
        )}
      </div>
      {action}
    </div>
  );
}
