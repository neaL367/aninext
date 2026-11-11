import { cn } from "@/lib/utils";

export function SectionHeader({
  index,
  title,
  description,
  action,
  className,
}: {
  index?: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}) {
  "use memo";
  return (
    <div
      className={cn(
        "mb-6 flex flex-wrap items-end justify-between gap-x-6 gap-y-3 border-b border-border-soft pb-4 sm:mb-8",
        className,
      )}
    >
      <div className="min-w-0">
        <div className="flex items-baseline gap-3">
          {index && (
            <span className="font-mono text-[0.8125rem] tracking-[0.14em] text-signal">
              {index}
            </span>
          )}
          <h2 className="display text-3xl sm:text-[2.6rem]">{title}</h2>
        </div>
        {description && (
          <p className="mt-2 max-w-xl text-xs leading-6 text-muted-foreground">{description}</p>
        )}
      </div>
      {action}
    </div>
  );
}
