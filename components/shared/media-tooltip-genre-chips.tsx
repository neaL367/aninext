import { Badge } from "@/components/ui/badge";
import { getDisplayGenres } from "@/lib/anilist/display/tooltip";

type MediaTooltipGenreChipsProps = {
  genres: readonly (string | null)[] | null | undefined;
  limit?: number;
};

export function MediaTooltipGenreChips({ genres, limit = 6 }: MediaTooltipGenreChipsProps) {
  const visible = getDisplayGenres(genres, limit);

  if (!visible.length) {
    return null;
  }

  return (
    <div className="flex flex-wrap gap-1.5">
      {visible.map((genre) => (
        <Badge key={genre} variant="secondary" className="px-2 py-0 text-xs font-normal">
          {genre}
        </Badge>
      ))}
    </div>
  );
}
