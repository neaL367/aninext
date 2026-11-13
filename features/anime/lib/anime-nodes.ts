/**
 * AniList connection payloads are not as tidy as their GraphQL schema claims:
 * removed entries come back as `null` edges, `null` relation nodes, or
 * recommendations whose `mediaRecommendation` is null. Rendering code assumes
 * present objects, so every read is compacted here, at the data boundary.
 */

export function compact<T>(items: ReadonlyArray<T | null | undefined> | null | undefined): T[] {
  return (items ?? []).filter((item): item is T => item != null);
}

/** Drops null edges and edges whose node was removed upstream. */
export function compactEdges<T extends { node?: unknown }>(
  edges: ReadonlyArray<T | null | undefined> | null | undefined,
): T[] {
  return compact(edges).filter((edge) => edge.node != null);
}

/** Drops recommendations that no longer point at a readable media entry. */
export function compactRecommendations<T extends { mediaRecommendation?: unknown }>(
  nodes: ReadonlyArray<T | null | undefined> | null | undefined,
): T[] {
  return compact(nodes).filter((node) => node.mediaRecommendation != null);
}
