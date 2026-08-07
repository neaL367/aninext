import { BrowsePageShell } from "@/features/anime/components/browse-page-shell";

export default function AlltimepopularLayout({ children }: { children: React.ReactNode }) {
  return <BrowsePageShell collection="alltimepopular">{children}</BrowsePageShell>;
}
