import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const BUCKET_NAME = process.env.SUPABASE_STORAGE_BUCKET || "video-processing";

export interface UploadFileOptions {
  bucket?: string;
  path: string;
  file: Buffer | Blob;
  contentType?: string;
}

export interface DownloadFileOptions {
  bucket?: string;
  path: string;
}

export interface DeleteFileOptions {
  bucket?: string;
  path: string;
}

export interface SignedUrlOptions {
  bucket?: string;
  path: string;
  expiresIn?: number;
}

export async function uploadFile(
  options: UploadFileOptions,
): Promise<{ path: string; error: Error | null }> {
  const bucket = options.bucket || BUCKET_NAME;

  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(options.path, options.file, {
      contentType: options.contentType,
      upsert: true,
    });

  if (error) {
    return { path: "", error };
  }

  return { path: data.path, error: null };
}

export async function downloadFile(
  options: DownloadFileOptions,
): Promise<{ data: Blob | null; error: Error | null }> {
  const bucket = options.bucket || BUCKET_NAME;

  const { data, error } = await supabase.storage
    .from(bucket)
    .download(options.path);

  if (error) {
    return { data: null, error };
  }

  return { data, error: null };
}

export async function deleteFile(
  options: DeleteFileOptions,
): Promise<{ error: Error | null }> {
  const bucket = options.bucket || BUCKET_NAME;

  const { error } = await supabase.storage.from(bucket).remove([options.path]);

  if (error) {
    return { error };
  }

  return { error: null };
}

export async function generateSignedUrl(
  options: SignedUrlOptions,
): Promise<{ url: string | null; error: Error | null }> {
  const bucket = options.bucket || BUCKET_NAME;
  const expiresIn = options.expiresIn || 3600;

  const { data, error } = await supabase.storage
    .from(bucket)
    .createSignedUrl(options.path, expiresIn);

  if (error) {
    return { url: null, error };
  }

  return { url: data.signedUrl, error: null };
}

export async function cleanupOldFiles(
  bucket?: string,
  olderThanHours = 24,
): Promise<{ deletedCount: number; error: Error | null }> {
  const targetBucket = bucket || BUCKET_NAME;
  const cutoffDate = new Date(Date.now() - olderThanHours * 60 * 60 * 1000);

  try {
    const { data: files, error: listError } = await supabase.storage
      .from(targetBucket)
      .list();

    if (listError) {
      return { deletedCount: 0, error: listError };
    }

    const oldFiles = files?.filter((file) => {
      const fileDate = new Date(file.created_at);
      return fileDate < cutoffDate;
    });

    if (!oldFiles || oldFiles.length === 0) {
      return { deletedCount: 0, error: null };
    }

    const filePaths = oldFiles.map((file) => file.name);
    const { error: deleteError } = await supabase.storage
      .from(targetBucket)
      .remove(filePaths);

    if (deleteError) {
      return { deletedCount: 0, error: deleteError };
    }

    return { deletedCount: oldFiles.length, error: null };
  } catch (error) {
    return {
      deletedCount: 0,
      error: error instanceof Error ? error : new Error("Unknown error"),
    };
  }
}
