import { BrowsePageShell } from "@/features/anime/components/browse-page-shell";

export default function TrendingLayout({ children }: { children: React.ReactNode }) {
  return <BrowsePageShell collection="trending">{children}</BrowsePageShell>;
}
