import type { ReactNode } from "react";
import { PageContainer } from "@/components/layout/page-container";

type HomeLayoutProps = {
  children: ReactNode;
};

export default function HomeLayout({ children }: HomeLayoutProps) {
  return (
    <PageContainer className="flex flex-col gap-10 py-8 lg:gap-12 lg:py-10">
      {children}
    </PageContainer>
  );
}
