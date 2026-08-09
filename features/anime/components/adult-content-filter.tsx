"use client";

import { ChevronDownIcon } from "lucide-react";
import { useState } from "react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

export function AdultContentFilter({
  enabled,
  open,
  onOpenChange,
  onChange,
}: {
  enabled: boolean;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onChange: (enabled: boolean) => void;
}) {
  "use memo";
  const [confirmOpen, setConfirmOpen] = useState(false);

  return (
    <section className="border-b border-border-soft py-3">
      <button
        type="button"
        aria-expanded={open}
        onClick={() => onOpenChange(!open)}
        className="flex min-h-9 w-full items-center gap-2 text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal"
      >
        <ChevronDownIcon className={cn("size-3.5 transition-transform", open && "rotate-180")} />
        <span className="font-mono text-[0.68rem] font-medium uppercase tracking-[0.08em] text-foreground">
          Adult content
        </span>
        {enabled && (
          <span className="ml-auto rounded-sm bg-live-badge/10 px-1.5 py-0.5 font-mono text-[0.6rem] font-medium text-live-badge">
            Enabled
          </span>
        )}
      </button>
      {open && (
        <div className="flex flex-col gap-3 pt-3">
          <p className="text-xs leading-5 text-muted-foreground">
            Includes mature themes and graphic material. Age confirmation required.
          </p>
          <div className="flex min-h-9 items-center justify-between gap-4">
            <span className="text-xs text-muted-foreground">Show adult content</span>
            <Switch
              checked={enabled}
              onCheckedChange={(checked: boolean) => {
                if (checked) setConfirmOpen(true);
                else onChange(false);
              }}
            />
          </div>
        </div>
      )}
      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Age confirmation</AlertDialogTitle>
            <AlertDialogDescription>
              This content is intended for mature audiences and may include graphic material. You
              must be 18 years or older to view adult content.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                setConfirmOpen(false);
                onChange(true);
              }}
            >
              I am 18 or older
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  );
}
