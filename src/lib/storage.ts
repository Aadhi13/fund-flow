import { supabase } from './supabase';

const BUCKET_NAME = 'receipts';
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB limit
const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/gif',
  'application/pdf',
];

export interface UploadReceiptResult {
  url: string;
  path: string;
}

export function validateReceiptFile(file: File): { valid: boolean; error?: string } {
  if (!file) {
    return { valid: false, error: 'No file selected' };
  }

  const mimeType = file.type.toLowerCase();
  const fileExt = file.name.split('.').pop()?.toLowerCase() || '';

  const isAllowedMime = ALLOWED_MIME_TYPES.includes(mimeType);
  const isAllowedExt = ['jpg', 'jpeg', 'png', 'webp', 'gif', 'pdf'].includes(fileExt);

  if (!isAllowedMime && !isAllowedExt) {
    return {
      valid: false,
      error: 'Invalid file format. Please upload a JPEG, PNG, WebP, GIF image, or PDF document.',
    };
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    const sizeInMB = (file.size / (1024 * 1024)).toFixed(1);
    return {
      valid: false,
      error: `File size (${sizeInMB}MB) exceeds the 5MB maximum limit.`,
    };
  }

  return { valid: true };
}

export async function uploadReceiptFile(
  file: File,
  onProgress?: (progress: number) => void
): Promise<UploadReceiptResult> {
  const validation = validateReceiptFile(file);
  if (!validation.valid) {
    throw new Error(validation.error);
  }

  onProgress?.(25);

  const fileExt = file.name.split('.').pop() || 'png';
  const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${fileExt}`;
  const filePath = `receipt_docs/${fileName}`;

  onProgress?.(50);

  const { data, error } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: true,
    });

  onProgress?.(85);

  if (error) {
    throw new Error(`Receipt upload failed: ${error.message}`);
  }

  // Get public URL for storage object
  const { data: publicUrlData } = supabase.storage
    .from(BUCKET_NAME)
    .getPublicUrl(data.path);

  onProgress?.(100);

  return {
    url: publicUrlData.publicUrl,
    path: data.path,
  };
}

export async function deleteReceiptFile(path: string): Promise<void> {
  if (!path) return;
  try {
    let relativePath = path;
    if (path.includes(`${BUCKET_NAME}/`)) {
      relativePath = path.split(`${BUCKET_NAME}/`)[1];
    }
    await supabase.storage.from(BUCKET_NAME).remove([relativePath]);
  } catch (err) {
    console.warn('Storage delete warning:', err);
  }
}
