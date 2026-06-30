export type AniListFieldItem = {
  label: string;
  value: string;
};

export type AniListDescriptionBlock =
  | { kind: "fields"; items: AniListFieldItem[] }
  | { kind: "paragraph"; text: string };

export type AniListInlinePart =
  | { type: "text"; text: string }
  | { type: "bold"; text: string }
  | { type: "link"; text: string; href: string };

const FIELD_LINE = /^__([^_]+?)__\s*(.*)$/;
const LINK_PATTERN = /\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/;
const BOLD_PATTERN = /__([^_]+?)__/;

function decodeHtmlEntities(text: string): string {
  return text
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

/** Normalize AniList HTML + markdown into plain markdown-like text. */
export function normalizeAniListDescription(raw: string): string {
  return decodeHtmlEntities(
    raw
      .replace(/\r\n/g, "\n")
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<\/p>\s*<p[^>]*>/gi, "\n\n")
      .replace(/<\/p>/gi, "\n")
      .replace(
        /<a\s+[^>]*href=["'](https?:\/\/[^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi,
        "[$2]($1)"
      )
      .replace(/<(?:b|strong)>([\s\S]*?)<\/(?:b|strong)>/gi, "__$1__")
      .replace(/<(?:i|em)>([\s\S]*?)<\/(?:i|em)>/gi, "_$1_")
      .replace(/<[^>]+>/g, "")
      .replace(/~!([\s\S]*?)!~/g, "$1")
  )
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export function parseAniListInline(text: string): AniListInlinePart[] {
  if (!text) {
    return [];
  }

  const parts: AniListInlinePart[] = [];

  function pushText(value: string) {
    if (value) {
      parts.push({ type: "text", text: value });
    }
  }

  function parseSegment(segment: string, allowBold: boolean) {
    if (!segment) {
      return;
    }

    const linkMatch = segment.match(LINK_PATTERN);
    if (linkMatch && linkMatch.index !== undefined) {
      pushText(segment.slice(0, linkMatch.index));
      parts.push({
        type: "link",
        text: linkMatch[1]!.trim(),
        href: linkMatch[2]!,
      });
      parseSegment(segment.slice(linkMatch.index + linkMatch[0].length), allowBold);
      return;
    }

    if (allowBold) {
      const boldMatch = segment.match(BOLD_PATTERN);
      if (boldMatch && boldMatch.index !== undefined) {
        pushText(segment.slice(0, boldMatch.index));
        parts.push({ type: "bold", text: boldMatch[1]!.trim() });
        parseSegment(segment.slice(boldMatch.index + boldMatch[0].length), true);
        return;
      }
    }

    pushText(segment);
  }

  parseSegment(text, true);
  return parts.length ? parts : [{ type: "text", text }];
}

export function parseAniListDescriptionBlocks(
  raw: string | null | undefined
): AniListDescriptionBlock[] {
  if (!raw?.trim()) {
    return [];
  }

  const normalized = normalizeAniListDescription(raw);
  const lines = normalized.split("\n");
  const blocks: AniListDescriptionBlock[] = [];

  let fieldItems: AniListFieldItem[] = [];
  let paragraphLines: string[] = [];

  const flushFields = () => {
    if (fieldItems.length) {
      blocks.push({ kind: "fields", items: fieldItems });
      fieldItems = [];
    }
  };

  const flushParagraph = () => {
    const text = paragraphLines.join("\n").trim();
    if (text) {
      blocks.push({ kind: "paragraph", text });
    }
    paragraphLines = [];
  };

  for (const line of lines) {
    const trimmed = line.trim();

    if (!trimmed) {
      flushFields();
      flushParagraph();
      continue;
    }

    const fieldMatch = trimmed.match(FIELD_LINE);
    if (fieldMatch) {
      flushParagraph();
      const label = fieldMatch[1]!.trim().replace(/:$/, "");
      fieldItems.push({
        label: label.endsWith(":") ? label : `${label}:`,
        value: fieldMatch[2]!.trim() || "—",
      });
      continue;
    }

    flushFields();
    paragraphLines.push(trimmed);
  }

  flushFields();
  flushParagraph();

  return blocks;
}
