import { Badge } from "@/components/ui/badge";
import type { MediaDetail } from "@/lib/anilist/types";
import {
  formatAlternateTitles,
  formatDisplayTitle,
} from "@/lib/anilist/utils/format";

type DetailMainHeaderProps = {
  media: MediaDetail;
};

export function DetailMainHeader({ media }: DetailMainHeaderProps) {
  const title = formatDisplayTitle(media.title);
  const alternateTitles = formatAlternateTitles(media.title, title);
  const tags =
    media.tags?.filter((t): t is NonNullable<typeof t> => Boolean(t)) ?? [];

  return (
    <header className="flex flex-col gap-3 border-b border-border pb-6">
      <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl lg:text-4xl">
        {title}
      </h1>
      {alternateTitles ? (
        <p className="text-sm leading-relaxed text-muted-foreground">
          {alternateTitles}
        </p>
      ) : null}
      {tags.length ? (
        <div className="flex flex-wrap gap-1.5 pt-1">
          {tags.slice(0, 12).map((tag) => (
            <Badge key={tag.id} variant="outline" className="font-normal">
              {tag.name}
            </Badge>
          ))}
        </div>
      ) : null}
    </header>
  );
}
