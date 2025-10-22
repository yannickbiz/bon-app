"use client";

import { AlertCircle, Check, Loader2 } from "lucide-react";

type SaveIndicatorProps = {
  status: "idle" | "saving" | "saved" | "error";
  lastSaved: Date | null;
};

export function SaveIndicator({ status, lastSaved }: SaveIndicatorProps) {
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (status === "saving") {
    return (
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Loader2 className="h-3 w-3 animate-spin" />
        <span>Saving...</span>
      </div>
    );
  }

  if (status === "saved" && lastSaved) {
    return (
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Check className="h-3 w-3 text-green-600 dark:text-green-400" />
        <span>Saved at {formatTime(lastSaved)}</span>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="flex items-center gap-2 text-xs text-destructive">
        <AlertCircle className="h-3 w-3" />
        <span>Error saving</span>
      </div>
    );
  }

  return null;
}
