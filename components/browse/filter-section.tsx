import { Label } from "@/components/ui/label";

export function FilterSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <Label className="text-xs font-medium text-muted-foreground">{title}</Label>
      {children}
    </div>
  );
}
