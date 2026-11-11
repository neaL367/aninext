"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

// cmdk + dialog primitives are ~50 KB of the shell budget. Nothing renders them
// until the palette is actually opened, so keep them off the initial payload.
const SearchDialog = dynamic(() => import("./search-dialog").then((mod) => mod.SearchDialog), {
  ssr: false,
});

export function SearchCommand() {
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const down = (event: KeyboardEvent) => {
      if (event.key === "k" && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        setMounted(true);
        setOpen((current) => !current);
      }
    };

    const customOpen = () => {
      setMounted(true);
      setOpen(true);
    };

    document.addEventListener("keydown", down);
    document.addEventListener("open-search", customOpen);
    return () => {
      document.removeEventListener("keydown", down);
      document.removeEventListener("open-search", customOpen);
    };
  }, []);

  if (!mounted) return null;

  return <SearchDialog open={open} onOpenChange={setOpen} />;
}
