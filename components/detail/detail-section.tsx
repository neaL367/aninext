import { cn } from "@/lib/utils";

type DetailSectionProps = {
  title: string;
  children: React.ReactNode;
  className?: string;
  bordered?: boolean;
};

export function DetailSection({ title, children, className, bordered = true }: DetailSectionProps) {
  return (
    <section
      className={cn(
        "flex flex-col gap-4 lg:gap-6",
        bordered && "border-t border-border pt-8 lg:pt-10",
        className,
      )}
    >
      <h2 className="text-lg font-medium tracking-tight sm:text-xl">{title}</h2>
      {children}
    </section>
  );
}
