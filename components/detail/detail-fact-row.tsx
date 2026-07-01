type DetailFactRowProps = {
  label: string;
  value: string;
};

export function DetailFactRow({ label, value }: DetailFactRowProps) {
  if (!value || value === "—") return null;

  return (
    <div className="flex items-start justify-between gap-3 text-sm">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="text-right font-medium leading-snug">{value}</dd>
    </div>
  );
}
