"use client";

import { FileText } from "lucide-react";
import { Button } from "@/components/ui/button";

type EmptyStateProps = {
  onCreateNote: () => void;
};

export function EmptyState({ onCreateNote }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center h-full py-12 px-4 text-center">
      <FileText className="h-16 w-16 text-muted-foreground mb-4" />
      <h3 className="text-lg font-semibold mb-2">No notes yet</h3>
      <p className="text-sm text-muted-foreground mb-6 max-w-sm">
        Get started by creating your first note. Capture your thoughts, ideas,
        and important information all in one place.
      </p>
      <Button onClick={onCreateNote}>Create your first note</Button>
    </div>
  );
}
