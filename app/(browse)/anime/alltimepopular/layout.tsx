import { BrowsePageShell } from "@/features/anime/components/browse-page-shell";

export default function AllTimePopularLayout({ children }: { children: React.ReactNode }) {
  return <BrowsePageShell collection="alltimepopular">{children}</BrowsePageShell>;
}
