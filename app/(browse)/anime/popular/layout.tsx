import { BrowsePageShell } from "@/features/anime/components/browse-page-shell";

export default function PopularLayout({ children }: { children: React.ReactNode }) {
  return <BrowsePageShell collection="popular">{children}</BrowsePageShell>;
}
