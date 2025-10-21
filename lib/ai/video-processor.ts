import axios from "axios";
import ffmpeg from "fluent-ffmpeg";
import { deleteFile, uploadFile } from "@/lib/supabase/storage";

const MAX_FILE_SIZE_MB = 100;
const MAX_DURATION_SECONDS = Number.parseInt(
  process.env.MAX_VIDEO_DURATION_SECONDS || "300",
  10,
);

export interface VideoMetadata {
  duration: number;
  size: number;
}

export interface DownloadVideoResult {
  path: string;
  metadata: VideoMetadata;
  error: Error | null;
}

export interface ExtractAudioResult {
  path: string;
  error: Error | null;
}

export async function downloadVideo(
  videoUrl: string,
): Promise<DownloadVideoResult> {
  try {
    const response = await axios.get(videoUrl, {
      responseType: "arraybuffer",
      maxContentLength: MAX_FILE_SIZE_MB * 1024 * 1024,
      timeout: 60000,
    });

    const videoBuffer = Buffer.from(response.data);
    const fileSizeMB = videoBuffer.length / (1024 * 1024);

    if (fileSizeMB > MAX_FILE_SIZE_MB) {
      return {
        path: "",
        metadata: { duration: 0, size: videoBuffer.length },
        error: new Error(
          `Video file too large: ${fileSizeMB.toFixed(2)}MB (max: ${MAX_FILE_SIZE_MB}MB)`,
        ),
      };
    }

    const timestamp = Date.now();
    const videoPath = `temp/videos/${timestamp}/video.mp4`;

    const { path, error: uploadError } = await uploadFile({
      path: videoPath,
      file: videoBuffer,
      contentType: "video/mp4",
    });

    if (uploadError) {
      return {
        path: "",
        metadata: { duration: 0, size: videoBuffer.length },
        error: uploadError,
      };
    }

    return {
      path,
      metadata: {
        duration: 0,
        size: videoBuffer.length,
      },
      error: null,
    };
  } catch (error) {
    return {
      path: "",
      metadata: { duration: 0, size: 0 },
      error:
        error instanceof Error ? error : new Error("Failed to download video"),
    };
  }
}

export async function getVideoDuration(
  videoBuffer: Buffer,
): Promise<{ duration: number; error: Error | null }> {
  return new Promise((resolve) => {
    const tempFile = `/tmp/temp-${Date.now()}.mp4`;
    const fs = require("node:fs");

    try {
      fs.writeFileSync(tempFile, videoBuffer);

      ffmpeg.ffprobe(tempFile, (err, metadata) => {
        fs.unlinkSync(tempFile);

        if (err) {
          resolve({ duration: 0, error: err });
          return;
        }

        const duration = metadata.format.duration || 0;
        resolve({ duration, error: null });
      });
    } catch (error) {
      if (fs.existsSync(tempFile)) {
        fs.unlinkSync(tempFile);
      }
      resolve({
        duration: 0,
        error:
          error instanceof Error
            ? error
            : new Error("Failed to get video duration"),
      });
    }
  });
}

export async function extractAudio(
  videoBuffer: Buffer,
  outputPath: string,
): Promise<ExtractAudioResult> {
  return new Promise((resolve) => {
    const tempVideoFile = `/tmp/video-${Date.now()}.mp4`;
    const tempAudioFile = `/tmp/audio-${Date.now()}.mp3`;
    const fs = require("node:fs");

    try {
      fs.writeFileSync(tempVideoFile, videoBuffer);

      ffmpeg(tempVideoFile)
        .noVideo()
        .audioCodec("libmp3lame")
        .audioBitrate(128)
        .on("end", async () => {
          try {
            const audioBuffer = fs.readFileSync(tempAudioFile);

            const { path, error: uploadError } = await uploadFile({
              path: outputPath,
              file: audioBuffer,
              contentType: "audio/mpeg",
            });

            fs.unlinkSync(tempVideoFile);
            fs.unlinkSync(tempAudioFile);

            if (uploadError) {
              resolve({ path: "", error: uploadError });
              return;
            }

            resolve({ path, error: null });
          } catch (error) {
            if (fs.existsSync(tempVideoFile)) fs.unlinkSync(tempVideoFile);
            if (fs.existsSync(tempAudioFile)) fs.unlinkSync(tempAudioFile);

            resolve({
              path: "",
              error:
                error instanceof Error
                  ? error
                  : new Error("Failed to process audio"),
            });
          }
        })
        .on("error", (err) => {
          if (fs.existsSync(tempVideoFile)) fs.unlinkSync(tempVideoFile);
          if (fs.existsSync(tempAudioFile)) fs.unlinkSync(tempAudioFile);

          resolve({ path: "", error: err });
        })
        .save(tempAudioFile);
    } catch (error) {
      if (fs.existsSync(tempVideoFile)) fs.unlinkSync(tempVideoFile);
      if (fs.existsSync(tempAudioFile)) fs.unlinkSync(tempAudioFile);

      resolve({
        path: "",
        error:
          error instanceof Error ? error : new Error("Failed to extract audio"),
      });
    }
  });
}

export async function cleanupFiles(paths: string[]): Promise<void> {
  await Promise.all(paths.map((path) => deleteFile({ path })));
}

export function validateVideoDuration(duration: number): {
  valid: boolean;
  error: string | null;
} {
  if (duration > MAX_DURATION_SECONDS) {
    return {
      valid: false,
      error: `Video duration ${duration}s exceeds maximum allowed ${MAX_DURATION_SECONDS}s`,
    };
  }
  return { valid: true, error: null };
}
