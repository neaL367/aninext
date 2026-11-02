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
    <section className="border-b border-border-soft py-2.5">
      <button
        type="button"
        aria-expanded={open}
        onClick={() => onOpenChange(!open)}
        className="flex min-h-8 w-full items-center gap-2 text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal"
      >
        <ChevronDownIcon
          className={cn(
            "size-3 text-muted-foreground transition-transform duration-200",
            open && "rotate-180",
          )}
        />
        <span className="font-mono text-[0.62rem] uppercase tracking-[0.14em] text-foreground/85">
          Adult content
        </span>
        {enabled && (
          <span className="ml-auto font-mono text-[0.56rem] uppercase tracking-[0.12em] text-signal">
            On
          </span>
        )}
      </button>
      {open && (
        <div className="flex min-h-9 items-center justify-between gap-4 pt-3">
          <span className="text-xs text-muted-foreground">Include mature titles</span>
          <Switch
            checked={enabled}
            onCheckedChange={(checked: boolean) => {
              if (checked) setConfirmOpen(true);
              else onChange(false);
            }}
          />
        </div>
      )}
      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Age confirmation</AlertDialogTitle>
            <AlertDialogDescription>
              Adult titles may include graphic material. Confirm you are 18 or older.
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
