import { BrowsePageShell } from "@/features/anime/components/browse-page-shell";

export default function SeasonalLayout({ children }: { children: React.ReactNode }) {
  return <BrowsePageShell collection="seasonal">{children}</BrowsePageShell>;
}
