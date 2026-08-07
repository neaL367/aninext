import { BrowsePageShell } from "@/features/anime/components/browse-page-shell";

export default function Top100Layout({ children }: { children: React.ReactNode }) {
  return <BrowsePageShell collection="top100">{children}</BrowsePageShell>;
}
