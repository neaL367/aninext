import type { MediaRelation } from "@/lib/anilist/domain/types";

export const MEDIA_RELATION_LABELS: Record<MediaRelation, string> = {
  ADAPTATION: "Adaptation",
  PREQUEL: "Prequel",
  SEQUEL: "Sequel",
  PARENT: "Parent Story",
  SIDE_STORY: "Side Story",
  CHARACTER: "Character",
  SUMMARY: "Summary",
  ALTERNATIVE: "Alternative",
  SPIN_OFF: "Spin-off",
  OTHER: "Other",
  SOURCE: "Source",
  COMPILATION: "Compilation",
  CONTAINS: "Contains",
};

export function formatMediaRelationType(
  relation: MediaRelation | null | undefined
): string {
  if (!relation) {
    return "—";
  }
  return MEDIA_RELATION_LABELS[relation] ?? relation.replaceAll("_", " ");
}
