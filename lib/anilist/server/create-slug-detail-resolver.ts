import "server-only";

import type { Route } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import { cache } from "react";
import { matchesDetailSlug } from "@/lib/anilist/display/media-links";
import type { SlugDetailParams } from "@/lib/anilist/domain/detail-route-params";
import { parseDetailId } from "@/lib/anilist/server/parse-detail-id";

type SlugDetailResolverConfig<T> = {
  fetch: (id: number) => Promise<T | null>;
  getSlugName: (entity: T) => string;
  getCanonicalPath: (entity: T, slugName: string) => Route;
  /** Runs after a successful fetch; call `notFound()` or `permanentRedirect()` as needed. */
  beforeCanonicalRedirect?: (entity: T) => void;
};

/** Shared parse → fetch → slug-canonicalize → redirect resolver for entity detail routes. */
export function createSlugDetailResolver<T>(config: SlugDetailResolverConfig<T>) {
  return cache(async (params: SlugDetailParams) => {
    const { id, slug } = await params;
    const entityId = parseDetailId(id);
    const entity = await config.fetch(entityId);

    if (!entity) {
      notFound();
    }

    config.beforeCanonicalRedirect?.(entity);

    const slugName = config.getSlugName(entity);
    const canonicalPath = config.getCanonicalPath(entity, slugName);

    if (!matchesDetailSlug(slugName, slug)) {
      permanentRedirect(canonicalPath);
    }

    return entity;
  });
}
