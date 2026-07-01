import {
  parseAniListDescriptionBlocks,
  parseAniListInline,
} from "@/lib/anilist/display/parse-anilist-description";
import { cn } from "@/lib/utils";

type AniListDescriptionProps = {
  text: string | null | undefined;
  className?: string;
};

function AniListInlineText({ text }: { text: string }) {
  const parts = parseAniListInline(text);

  return (
    <>
      {parts.map((part, index) => {
        if (part.type === "bold") {
          return (
            <strong key={index} className="font-medium text-foreground">
              {part.text}
            </strong>
          );
        }

        if (part.type === "link") {
          return (
            <a
              key={index}
              href={part.href}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-primary underline-offset-2 hover:underline"
            >
              {part.text}
            </a>
          );
        }

        return <span key={index}>{part.text}</span>;
      })}
    </>
  );
}

export function AniListDescription({ text, className }: AniListDescriptionProps) {
  const blocks = parseAniListDescriptionBlocks(text);

  if (!blocks.length) {
    return null;
  }

  return (
    <div className={cn("flex flex-col gap-4 text-base leading-relaxed", className)}>
      {blocks.map((block, index) => {
        if (block.kind === "fields") {
          return (
            <dl
              key={`fields-${index}`}
              className="flex flex-col gap-3 rounded-lg border border-border/60 bg-muted/20 p-4"
            >
              {block.items.map((item) => (
                <div
                  key={item.label}
                  className="grid grid-cols-1 gap-0.5 sm:grid-cols-[minmax(7rem,auto)_1fr] sm:items-baseline sm:gap-x-6"
                >
                  <dt className="text-sm font-medium text-foreground">{item.label}</dt>
                  <dd className="text-sm text-muted-foreground sm:text-base">
                    <AniListInlineText text={item.value} />
                  </dd>
                </div>
              ))}
            </dl>
          );
        }

        return (
          <p key={`paragraph-${index}`} className="whitespace-pre-line text-muted-foreground">
            <AniListInlineText text={block.text} />
          </p>
        );
      })}
    </div>
  );
}
