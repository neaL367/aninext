import type { ReactNode } from "react";
import { PageContainer } from "@/components/layout/page-container";

// TODO: Cache Components adoption. Refactor this route so this opt-out can be removed.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false;

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
