"use client";

import { useLayoutEffect } from "react";
import { saveDetailCurrent } from "@/lib/navigation/detail-return";

type DetailReturnAnchorProps = {
  mediaId: number;
  title: string;
};

/** Keeps the active detail page in sessionStorage for relation/recommendation links. */
export function DetailReturnAnchor({ mediaId, title }: DetailReturnAnchorProps) {
  useLayoutEffect(() => {
    saveDetailCurrent(mediaId, title);
  }, [mediaId, title]);

  return null;
}
