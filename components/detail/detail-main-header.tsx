import { DetailEntityHeader } from "@/components/detail/detail-entity-header";
import type { MediaDetail } from "@/lib/anilist/domain/types";
import { formatAlternateTitles, formatDisplayTitle } from "@/lib/anilist/display/format";

type DetailMainHeaderProps = {
  media: MediaDetail;
};

export function DetailMainHeader({ media }: DetailMainHeaderProps) {
  const title = formatDisplayTitle(media.title);
  const alternateTitles = formatAlternateTitles(media.title, title);

  return <DetailEntityHeader title={title} subtitle={alternateTitles || null} />;
}
