import { cn } from "@/lib/utils";

type PageContainerProps = {
  children: React.ReactNode;
  className?: string;
};

export function PageContainer({ children, className }: PageContainerProps) {
  return (
    <div className={cn("mx-auto min-w-0 w-full px-4 sm:px-6 lg:px-8 xl:px-10", className)}>
      {children}
    </div>
  );
}
