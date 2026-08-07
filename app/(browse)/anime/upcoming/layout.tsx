import { BrowsePageShell } from "@/features/anime/components/browse-page-shell";

export default function UpcomingLayout({ children }: { children: React.ReactNode }) {
  return <BrowsePageShell collection="upcoming">{children}</BrowsePageShell>;
}
