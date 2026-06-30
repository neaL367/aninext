import "server-only";

import { notFound } from "next/navigation";

export function parseDetailId(id: string): number {
  const numericId = Number(id);

  if (!Number.isFinite(numericId)) {
    notFound();
  }

  return numericId;
}
