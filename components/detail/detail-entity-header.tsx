type DetailEntityHeaderProps = {
  title: string;
  subtitle?: string | null;
  entityLabel?: string;
};

export function DetailEntityHeader({
  title,
  subtitle,
  entityLabel,
}: DetailEntityHeaderProps) {
  return (
    <header className="flex flex-col gap-3 border-b border-border pb-6">
      {entityLabel ? (
        <p className="text-sm font-medium text-muted-foreground">{entityLabel}</p>
      ) : null}
      <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl lg:text-4xl">
        {title}
      </h1>
      {subtitle ? (
        <p className="text-sm leading-relaxed text-muted-foreground">{subtitle}</p>
      ) : null}
    </header>
  );
}
