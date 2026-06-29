import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

type SectionErrorProps = {
  title?: string;
  message?: string;
};

export function SectionError({
  title = "Unable to load this section",
  message = "This section failed to load. Other sections are still available.",
}: SectionErrorProps) {
  return (
    <Alert variant="destructive">
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription>{message}</AlertDescription>
    </Alert>
  );
}
