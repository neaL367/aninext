import { Badge } from "@/components/ui/badge";

const DEFAULT_VISIBLE = 12;

type DetailTaxonomyTagsProps = {
  tags: readonly { id: number; name: string | null }[];
};

export function DetailTaxonomyTags({ tags }: DetailTaxonomyTagsProps) {
  const initial = tags.slice(0, DEFAULT_VISIBLE);
  const rest = tags.slice(DEFAULT_VISIBLE);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap gap-1.5">
        {initial.map((tag) =>
          tag.name ? (
            <Badge key={tag.id} variant="outline" className="font-normal">
              {tag.name}
            </Badge>
          ) : null
        )}
      </div>
      {rest.length > 0 ? (
        <details className="group">
          <summary className="cursor-pointer text-xs text-muted-foreground hover:text-foreground">
            Show {rest.length} more tags
          </summary>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {rest.map((tag) =>
              tag.name ? (
                <Badge key={tag.id} variant="outline" className="font-normal">
                  {tag.name}
                </Badge>
              ) : null
            )}
          </div>
        </details>
      ) : null}
    </div>
  );
}
