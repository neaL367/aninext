"use client";

import { usePathname } from "next/navigation";
import { EntityNotFound } from "@/components/shared/entity-not-found";

const NOT_FOUND_COPY: Record<string, { title: string; description: string; browseLabel: string }> =
  {
    anime: {
      title: "Anime not found",
      description: "This anime could not be found on AniList.",
      browseLabel: "Browse anime",
    },
    manga: {
      title: "Manga not found",
      description: "This manga could not be found on AniList.",
      browseLabel: "Browse titles",
    },
    character: {
      title: "Character not found",
      description: "This character could not be found on AniList.",
      browseLabel: "Browse anime",
    },
    staff: {
      title: "Staff member not found",
      description: "This staff member could not be found on AniList.",
      browseLabel: "Browse anime",
    },
  };

export function EntityDetailNotFound() {
  const pathname = usePathname() ?? "";
  const category = pathname.split("/").filter(Boolean)[0] ?? "anime";
  const copy = NOT_FOUND_COPY[category] ?? NOT_FOUND_COPY.anime!;

  return (
    <EntityNotFound
      title={copy.title}
      description={copy.description}
      browseHref="/anime"
      browseLabel={copy.browseLabel}
    />
  );
}
