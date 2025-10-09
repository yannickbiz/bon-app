import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  cleanupOldFiles,
  deleteFile,
  downloadFile,
  generateSignedUrl,
  uploadFile,
} from "./storage";

vi.mock("@supabase/supabase-js", () => ({
  createClient: vi.fn(() => ({
    storage: {
      from: vi.fn(() => ({
        upload: vi.fn(),
        download: vi.fn(),
        remove: vi.fn(),
        createSignedUrl: vi.fn(),
        list: vi.fn(),
      })),
    },
  })),
}));

describe("Supabase Storage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("uploadFile", () => {
    it("should upload file successfully", async () => {
      const mockUpload = vi.fn().mockResolvedValue({
        data: { path: "test/file.mp4" },
        error: null,
      });

      const { createClient } = await import("@supabase/supabase-js");
      vi.mocked(createClient).mockReturnValue({
        storage: {
          from: vi.fn(() => ({
            upload: mockUpload,
          })),
        },
      } as any);

      const result = await uploadFile({
        path: "test/file.mp4",
        file: Buffer.from("test"),
        contentType: "video/mp4",
      });

      expect(result.path).toBe("test/file.mp4");
      expect(result.error).toBeNull();
    });

    it("should handle upload errors", async () => {
      const mockError = new Error("Upload failed");
      const mockUpload = vi.fn().mockResolvedValue({
        data: null,
        error: mockError,
      });

      const { createClient } = await import("@supabase/supabase-js");
      vi.mocked(createClient).mockReturnValue({
        storage: {
          from: vi.fn(() => ({
            upload: mockUpload,
          })),
        },
      } as any);

      const result = await uploadFile({
        path: "test/file.mp4",
        file: Buffer.from("test"),
      });

      expect(result.path).toBe("");
      expect(result.error).toBe(mockError);
    });
  });

  describe("downloadFile", () => {
    it("should download file successfully", async () => {
      const mockBlob = new Blob(["test content"]);
      const mockDownload = vi.fn().mockResolvedValue({
        data: mockBlob,
        error: null,
      });

      const { createClient } = await import("@supabase/supabase-js");
      vi.mocked(createClient).mockReturnValue({
        storage: {
          from: vi.fn(() => ({
            download: mockDownload,
          })),
        },
      } as any);

      const result = await downloadFile({
        path: "test/file.mp4",
      });

      expect(result.data).toBe(mockBlob);
      expect(result.error).toBeNull();
    });
  });

  describe("deleteFile", () => {
    it("should delete file successfully", async () => {
      const mockRemove = vi.fn().mockResolvedValue({
        data: null,
        error: null,
      });

      const { createClient } = await import("@supabase/supabase-js");
      vi.mocked(createClient).mockReturnValue({
        storage: {
          from: vi.fn(() => ({
            remove: mockRemove,
          })),
        },
      } as any);

      const result = await deleteFile({
        path: "test/file.mp4",
      });

      expect(result.error).toBeNull();
    });
  });

  describe("generateSignedUrl", () => {
    it("should generate signed URL successfully", async () => {
      const mockSignedUrl = vi.fn().mockResolvedValue({
        data: { signedUrl: "https://example.com/signed-url" },
        error: null,
      });

      const { createClient } = await import("@supabase/supabase-js");
      vi.mocked(createClient).mockReturnValue({
        storage: {
          from: vi.fn(() => ({
            createSignedUrl: mockSignedUrl,
          })),
        },
      } as any);

      const result = await generateSignedUrl({
        path: "test/file.mp4",
        expiresIn: 3600,
      });

      expect(result.url).toBe("https://example.com/signed-url");
      expect(result.error).toBeNull();
    });
  });

  describe("cleanupOldFiles", () => {
    it("should cleanup old files successfully", async () => {
      const oldDate = new Date(Date.now() - 48 * 60 * 60 * 1000);
      const mockFiles = [
        { name: "old-file.mp4", created_at: oldDate.toISOString() },
        { name: "new-file.mp4", created_at: new Date().toISOString() },
      ];

      const mockList = vi.fn().mockResolvedValue({
        data: mockFiles,
        error: null,
      });

      const mockRemove = vi.fn().mockResolvedValue({
        data: null,
        error: null,
      });

      const { createClient } = await import("@supabase/supabase-js");
      vi.mocked(createClient).mockReturnValue({
        storage: {
          from: vi.fn(() => ({
            list: mockList,
            remove: mockRemove,
          })),
        },
      } as any);

      const result = await cleanupOldFiles(undefined, 24);

      expect(result.deletedCount).toBe(1);
      expect(result.error).toBeNull();
    });
  });
});
