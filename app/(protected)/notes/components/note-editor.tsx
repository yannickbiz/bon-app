"use client";

import { Eye, EyeOff } from "lucide-react";
import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { Note } from "@/types/notes";
import { SaveIndicator } from "./save-indicator";

type NoteEditorProps = {
  note: Note;
  onNoteChange: (updates: { title?: string; content?: string }) => void;
  saveStatus: "idle" | "saving" | "saved" | "error";
  lastSaved: Date | null;
};

export function NoteEditor({
  note,
  onNoteChange,
  saveStatus,
  lastSaved,
}: NoteEditorProps) {
  const [title, setTitle] = useState(note.title);
  const [content, setContent] = useState(note.content);
  const [showPreview, setShowPreview] = useState(false);

  // Update local state when note changes
  useEffect(() => {
    setTitle(note.title);
    setContent(note.content);
  }, [note.content, note.title]); // Only update when note ID changes (different note selected)

  const handleTitleChange = (newTitle: string) => {
    setTitle(newTitle);
    onNoteChange({ title: newTitle });
  };

  const handleContentChange = (newContent: string) => {
    setContent(newContent);
    onNoteChange({ content: newContent });
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b space-y-4">
        <div className="space-y-2">
          <Label htmlFor="note-title">Title</Label>
          <Input
            id="note-title"
            value={title}
            onChange={(e) => handleTitleChange(e.target.value)}
            placeholder="Note title..."
            maxLength={100}
            className="text-lg font-semibold"
          />
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">
              {title.length}/100 characters
            </p>
            <SaveIndicator status={saveStatus} lastSaved={lastSaved} />
          </div>
        </div>

        <div className="flex items-center justify-between">
          <Label>Content</Label>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowPreview(!showPreview)}
          >
            {showPreview ? (
              <>
                <EyeOff className="h-4 w-4 mr-2" />
                Edit
              </>
            ) : (
              <>
                <Eye className="h-4 w-4 mr-2" />
                Preview
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Editor / Preview */}
      <div className="flex-1 overflow-hidden">
        {showPreview ? (
          <div className="h-full overflow-y-auto p-4 prose prose-sm max-w-none text-foreground">
            {content ? (
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {content}
              </ReactMarkdown>
            ) : (
              <p className="text-muted-foreground italic">
                No content yet. Switch to edit mode to add content.
              </p>
            )}
          </div>
        ) : (
          <div className="h-full p-4">
            <Textarea
              value={content}
              onChange={(e) => handleContentChange(e.target.value)}
              placeholder="Start writing... (Markdown supported)"
              maxLength={50000}
              className="h-full resize-none font-mono text-sm"
            />
            <p className="text-xs text-muted-foreground mt-2">
              {content.length}/50,000 characters · Supports Markdown
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
