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
    </header>
  );
}
