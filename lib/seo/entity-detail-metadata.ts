import type { Metadata } from "next";
import type { DetailCategory } from "@/lib/anilist/domain/detail-categories";
import {
  toSlugDetailParams,
  type EntityDetailRouteParams,
} from "@/lib/anilist/domain/detail-route-params";
import { formatDisplayTitle, formatPersonName, stripHtml } from "@/lib/anilist/display/format";
import { resolveAnimeDetailMedia } from "@/lib/anilist/server/resolve-anime-detail-media";
import { resolveCharacterDetail } from "@/lib/anilist/server/resolve-character-detail";
import { resolveMangaDetailMedia } from "@/lib/anilist/server/resolve-manga-detail-media";
import { resolveStaffDetail } from "@/lib/anilist/server/resolve-staff-detail";
import {
  animeDetailPath,
  characterDetailPath,
  mangaDetailPath,
  staffDetailPath,
} from "@/lib/navigation/detail-paths";
import { createDetailMetadata } from "@/lib/seo/metadata";

export async function createEntityDetailMetadata(
  category: DetailCategory,
  params: EntityDetailRouteParams,
): Promise<Metadata> {
  const slugParams = toSlugDetailParams(params);

  switch (category) {
    case "anime": {
      const media = await resolveAnimeDetailMedia(slugParams);
      const title = formatDisplayTitle(media.title);
      const description = media.description
        ? stripHtml(media.description).slice(0, 160)
        : `Anime details for ${title} on AniNext.`;

      return createDetailMetadata(title, description, animeDetailPath(media.id, title));
    }
    case "manga": {
      const media = await resolveMangaDetailMedia(slugParams);
      const title = formatDisplayTitle(media.title);
      const description = media.description
        ? stripHtml(media.description).slice(0, 160)
        : `Manga details for ${title} on AniNext.`;

      return createDetailMetadata(title, description, mangaDetailPath(media.id, title));
    }
    case "character": {
      const character = await resolveCharacterDetail(slugParams);
      const name = formatPersonName(character.name);
      const description = character.description
        ? stripHtml(character.description).slice(0, 160)
        : `Character profile for ${name} on AniNext.`;

      return createDetailMetadata(name, description, characterDetailPath(character.id, name));
    }
    case "staff": {
      const staff = await resolveStaffDetail(slugParams);
      const name = formatPersonName(staff.name);
      const description = staff.description
        ? stripHtml(staff.description).slice(0, 160)
        : `Staff profile for ${name} on AniNext.`;

      return createDetailMetadata(name, description, staffDetailPath(staff.id, name));
    }
  }
}
