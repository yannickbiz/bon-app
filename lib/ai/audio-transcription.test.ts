import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  clearTranscriptionCache,
  getCachedTranscription,
  transcribeAudio,
} from "./audio-transcription";

vi.mock("@/lib/supabase/storage", () => ({
  downloadFile: vi.fn(),
}));

global.fetch = vi.fn();

describe("Audio Transcription", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    clearTranscriptionCache();
  });

  describe("transcribeAudio", () => {
    it("should transcribe audio successfully", async () => {
      const { downloadFile } = await import("@/lib/supabase/storage");
      const mockAudioBlob = new Blob(["audio data"], { type: "audio/mpeg" });

      vi.mocked(downloadFile).mockResolvedValue({
        data: mockAudioBlob,
        error: null,
      });

      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        json: async () => ({ text: "Transcribed audio content" }),
      } as Response);

      const result = await transcribeAudio("test/audio.mp3");

      expect(result.transcription).toBe("Transcribed audio content");
      expect(result.error).toBeNull();
    });

    it("should handle download errors", async () => {
      const { downloadFile } = await import("@/lib/supabase/storage");

      vi.mocked(downloadFile).mockResolvedValue({
        data: null,
        error: new Error("Download failed"),
      });

      const result = await transcribeAudio("test/audio.mp3");

      expect(result.transcription).toBeNull();
      expect(result.error).toBeDefined();
    });

    it("should handle empty audio file", async () => {
      const { downloadFile } = await import("@/lib/supabase/storage");
      const emptyBlob = new Blob([], { type: "audio/mpeg" });

      vi.mocked(downloadFile).mockResolvedValue({
        data: emptyBlob,
        error: null,
      });

      const result = await transcribeAudio("test/empty.mp3");

      expect(result.transcription).toBeNull();
      expect(result.error?.message).toBe("Audio file is empty");
    });

    it("should handle API errors", async () => {
      const { downloadFile } = await import("@/lib/supabase/storage");
      const mockAudioBlob = new Blob(["audio data"], { type: "audio/mpeg" });

      vi.mocked(downloadFile).mockResolvedValue({
        data: mockAudioBlob,
        error: null,
      });

      vi.mocked(fetch).mockResolvedValue({
        ok: false,
        status: 429,
        text: async () => "Rate limit exceeded",
      } as Response);

      const result = await transcribeAudio("test/audio.mp3");

      expect(result.transcription).toBeNull();
      expect(result.error?.message).toContain("429");
    });

    it("should use cached transcription", async () => {
      const { downloadFile } = await import("@/lib/supabase/storage");
      const mockAudioBlob = new Blob(["audio data"], { type: "audio/mpeg" });

      vi.mocked(downloadFile).mockResolvedValue({
        data: mockAudioBlob,
        error: null,
      });

      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        json: async () => ({ text: "Cached transcription" }),
      } as Response);

      const result1 = await transcribeAudio("test/audio.mp3", "video-123");
      const result2 = await transcribeAudio("test/audio.mp3", "video-123");

      expect(result1.transcription).toBe("Cached transcription");
      expect(result2.transcription).toBe("Cached transcription");
      expect(downloadFile).toHaveBeenCalledTimes(1);
    });
  });

  describe("getCachedTranscription", () => {
    it("should return null for uncached key", () => {
      const result = getCachedTranscription("nonexistent");
      expect(result).toBeNull();
    });

    it("should return cached transcription", async () => {
      const { downloadFile } = await import("@/lib/supabase/storage");
      const mockAudioBlob = new Blob(["audio data"], { type: "audio/mpeg" });

      vi.mocked(downloadFile).mockResolvedValue({
        data: mockAudioBlob,
        error: null,
      });

      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        json: async () => ({ text: "Test transcription" }),
      } as Response);

      await transcribeAudio("test/audio.mp3", "test-key");
      const cached = getCachedTranscription("test-key");

      expect(cached).toBe("Test transcription");
    });
  });

  describe("clearTranscriptionCache", () => {
    it("should clear all cached transcriptions", async () => {
      const { downloadFile } = await import("@/lib/supabase/storage");
      const mockAudioBlob = new Blob(["audio data"], { type: "audio/mpeg" });

      vi.mocked(downloadFile).mockResolvedValue({
        data: mockAudioBlob,
        error: null,
      });

      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        json: async () => ({ text: "Test" }),
      } as Response);

      await transcribeAudio("test/audio.mp3", "key1");
      clearTranscriptionCache();
      const cached = getCachedTranscription("key1");

      expect(cached).toBeNull();
    });
  });
});
