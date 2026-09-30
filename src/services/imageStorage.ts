import { db } from "./firebase";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { resolveLessonImage } from "../utils/imageResolver";

export interface UploadedImageResult {
  url: string;
  id: string;
  alt: string;
  caption?: string;
  originalName?: string;
  sizeBytes?: number;
  mimeType?: string;
}

/**
 * Compresses an image File or Blob to an efficient, high-quality Data URL
 */
export async function optimizeImageToDataUrl(
  file: File | Blob,
  maxDimension = 1920,
  quality = 0.88
): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let { width, height } = img;
        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve(e.target?.result as string);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        // Format as WebP or JPEG for maximum compression efficiency
        const mime = file.type === "image/png" ? "image/png" : "image/jpeg";
        const resultUrl = canvas.toDataURL(mime, quality);
        resolve(resultUrl);
      };
      img.onerror = () => {
        resolve(e.target?.result as string);
      };
      img.src = e.target?.result as string;
    };
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
}

/**
 * Uploads an image permanently to the server or cloud storage
 * Returns a permanent, accessible image URL for use in Markdown
 */
export async function uploadLessonImage(
  fileOrDataUrl: File | Blob | string,
  options: {
    alt?: string;
    caption?: string;
    filename?: string;
  } = {}
): Promise<UploadedImageResult> {
  let dataUrl: string;
  let filename = options.filename || "image.png";
  let mimeType = "image/png";

  if (typeof fileOrDataUrl === "string") {
    dataUrl = fileOrDataUrl;
    if (dataUrl.startsWith("data:image/jpeg")) mimeType = "image/jpeg";
    if (dataUrl.startsWith("data:image/webp")) mimeType = "image/webp";
    if (dataUrl.startsWith("data:image/svg")) mimeType = "image/svg+xml";
  } else {
    filename = (fileOrDataUrl as File).name || `image_${Date.now()}.png`;
    mimeType = fileOrDataUrl.type || "image/png";
    dataUrl = await optimizeImageToDataUrl(fileOrDataUrl);
  }

  const cleanAlt = options.alt || filename.replace(/\.[^/.]+$/, "");
  const imageId = `img_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;

  // 1. Try uploading to Express Backend Server (/api/upload-image)
  try {
    const response = await fetch("/api/upload-image", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        dataUrl,
        filename,
        mimeType,
        alt: cleanAlt,
        caption: options.caption || ""
      })
    });

    if (response.ok) {
      const data = await response.json();
      if (data.url) {
        // Cache locally for instant retrieval
        try {
          localStorage.setItem(`img_cache_${filename}`, data.url);
          localStorage.setItem(`img_cache_${cleanAlt}`, data.url);
          localStorage.setItem(`img_cache_${imageId}`, data.url);
        } catch (e) {
          // Ignore quota
        }

        return {
          url: data.url,
          id: data.id || imageId,
          alt: cleanAlt,
          caption: options.caption,
          originalName: filename,
          mimeType
        };
      }
    }
  } catch (err) {
    console.warn("Backend image upload endpoint not reachable, using optimized persistent storage fallback.", err);
  }

  // 2. Cache in Firestore if available & document is reasonable size (< 800KB)
  try {
    if (dataUrl.length < 800000) {
      const docRef = doc(db, "uploadedImages", imageId);
      await setDoc(docRef, {
        id: imageId,
        dataUrl,
        filename,
        alt: cleanAlt,
        caption: options.caption || "",
        createdAt: new Date().toISOString()
      });
    }
  } catch (err) {
    console.warn("Firestore image persistence skipped or failed:", err);
  }

  // 3. Cache locally in browser
  try {
    localStorage.setItem(`img_cache_${filename}`, dataUrl);
    localStorage.setItem(`img_cache_${cleanAlt}`, dataUrl);
    localStorage.setItem(`img_cache_${imageId}`, dataUrl);
  } catch (e) {
    // Ignore quota
  }

  return {
    url: dataUrl,
    id: imageId,
    alt: cleanAlt,
    caption: options.caption,
    originalName: filename,
    mimeType
  };
}

/**
 * Validates and normalizes any image URL or legacy reference
 */
export function getNormalizedImageUrl(src: string, alt?: string): string {
  return resolveLessonImage(src, alt);
}
