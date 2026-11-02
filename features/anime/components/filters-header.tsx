"use client";

export function FiltersHeader({
  facetCount,
  onClear,
  mobile = false,
}: {
  facetCount: number;
  onClear: () => void;
  mobile?: boolean;
}) {
  "use memo";
  if (mobile) {
    return facetCount > 0 ? (
      <div className="mb-3 flex justify-end">
        <button
          type="button"
          onClick={onClear}
          className="font-mono text-[0.58rem] uppercase tracking-[0.14em] text-muted-foreground transition-colors hover:text-foreground"
        >
          Reset
        </button>
      </div>
    ) : null;
  }

  return (
    <div className="mb-2 flex items-center justify-between border-b border-border-soft pb-2.5">
      <span className="font-mono text-[0.6rem] uppercase tracking-[0.16em] text-muted-foreground">
        Filter{facetCount > 0 ? ` · ${facetCount}` : ""}
      </span>
      {facetCount > 0 && (
        <button
          type="button"
          onClick={onClear}
          className="font-mono text-[0.56rem] uppercase tracking-[0.14em] text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal"
        >
          Reset
        </button>
      )}
    </div>
  );
}
