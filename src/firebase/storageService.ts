import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from './config';

export const MAX_IMAGE_SIZE_BYTES = 1 * 1024 * 1024; // 1MB exact limit

export interface UploadResult {
  success: boolean;
  url?: string;
  error?: string;
}

/**
 * Uploads an image file to Firebase Storage with a strict 1MB limit.
 * If Firebase Storage is unreachable or unconfigured, falls back to a base64 Data URL.
 */
export async function uploadImageToFirebase(
  file: File,
  folder: 'students' | 'lecturers' | 'users' | 'books' | 'general' = 'general'
): Promise<UploadResult> {
  // 1. Strict 1MB size validation
  if (file.size > MAX_IMAGE_SIZE_BYTES) {
    const sizeInMb = (file.size / (1024 * 1024)).toFixed(2);
    return {
      success: false,
      error: `File size exceeds 1MB limit (selected file is ${sizeInMb}MB). Please select an image under 1MB.`
    };
  }

  // 2. Validate image MIME type
  if (!file.type.startsWith('image/')) {
    return {
      success: false,
      error: 'Please select a valid image file (PNG, JPG, JPEG, WebP, GIF).'
    };
  }

  // 3. Attempt upload to Firebase Storage
  try {
    const cleanFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const storagePath = `${folder}/${Date.now()}_${cleanFileName}`;
    const storageRef = ref(storage, storagePath);

    const snapshot = await uploadBytes(storageRef, file, {
      contentType: file.type
    });

    const downloadUrl = await getDownloadURL(snapshot.ref);
    return { success: true, url: downloadUrl };
  } catch (err: any) {
    console.warn('[Firebase Storage] Direct upload notice:', err.code, err.message);

    // Fallback: Convert to Base64 so the user can continue smoothly without being blocked
    try {
      const base64Url = await fileToBase64(file);
      return { success: true, url: base64Url };
    } catch (b64Err: any) {
      return {
        success: false,
        error: err.message || 'Failed to upload image. Please try again.'
      };
    }
  }
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (e) => reject(e);
    reader.readAsDataURL(file);
  });
}
