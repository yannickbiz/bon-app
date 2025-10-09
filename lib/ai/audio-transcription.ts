import { downloadFile } from "@/lib/supabase/storage";

interface TranscriptionCache {
  [key: string]: string;
}

const transcriptionCache: TranscriptionCache = {};

export async function transcribeAudio(
  audioPath: string,
  cacheKey?: string,
): Promise<{ transcription: string | null; error: Error | null }> {
  try {
    if (cacheKey && transcriptionCache[cacheKey]) {
      return { transcription: transcriptionCache[cacheKey], error: null };
    }

    const { data: audioBlob, error: downloadError } = await downloadFile({
      path: audioPath,
    });

    if (downloadError || !audioBlob) {
      return {
        transcription: null,
        error: downloadError || new Error("Failed to download audio file"),
      };
    }

    const audioBuffer = Buffer.from(await audioBlob.arrayBuffer());

    if (audioBuffer.length === 0) {
      return {
        transcription: null,
        error: new Error("Audio file is empty"),
      };
    }

    const audioFile = new File([audioBuffer], "audio.mp3", {
      type: "audio/mpeg",
    });

    const response = await fetch(
      "https://api.groq.com/openai/v1/audio/transcriptions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
        },
        body: (() => {
          const formData = new FormData();
          formData.append("file", audioFile);
          formData.append("model", "whisper-large-v3-turbo");
          formData.append("response_format", "json");
          return formData;
        })(),
      },
    );

    if (!response.ok) {
      const errorText = await response.text();
      return {
        transcription: null,
        error: new Error(
          `Transcription API error: ${response.status} - ${errorText}`,
        ),
      };
    }

    const result = await response.json();
    const transcription = result.text || null;

    if (cacheKey && transcription) {
      transcriptionCache[cacheKey] = transcription;
    }

    return { transcription, error: null };
  } catch (error) {
    return {
      transcription: null,
      error:
        error instanceof Error
          ? error
          : new Error("Failed to transcribe audio"),
    };
  }
}

export function getCachedTranscription(cacheKey: string): string | null {
  return transcriptionCache[cacheKey] || null;
}

export function clearTranscriptionCache(): void {
  Object.keys(transcriptionCache).forEach((key) => {
    delete transcriptionCache[key];
  });
}
