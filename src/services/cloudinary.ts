/**
 * Cloudinary Media & Document Storage Service
 * Handles uploading images and PDFs directly to Cloudinary or via server fallback.
 */

export interface CloudinaryUploadResult {
  url: string;
  publicId: string;
  format: string;
  resourceType: "image" | "raw" | "video" | "document";
  sizeBytes: number;
  width?: number;
  height?: number;
  originalFilename?: string;
  thumbnailUrl?: string;
  createdAt: string;
}

export interface CloudinaryConfig {
  cloudName: string;
  uploadPreset: string;
  apiKey?: string;
}

// Get configured or fallback Cloudinary credentials
export function getCloudinaryConfig(): CloudinaryConfig {
  const envObj = (import.meta as any).env || {};
  const envCloudName = envObj.VITE_CLOUDINARY_CLOUD_NAME || "";
  const envUploadPreset = envObj.VITE_CLOUDINARY_UPLOAD_PRESET || "";
  const envApiKey = envObj.VITE_CLOUDINARY_API_KEY || "";

  return {
    cloudName: envCloudName,
    uploadPreset: envUploadPreset,
    apiKey: envApiKey,
  };
}

export function isCloudinaryConfigured(): boolean {
  const cfg = getCloudinaryConfig();
  return Boolean(cfg.cloudName && cfg.uploadPreset);
}

/**
 * Upload Media helper alias
 */
export async function uploadMediaToCloudinary(
  file: File | Blob | string,
  folder = "learnwithpems_lms"
): Promise<CloudinaryUploadResult> {
  return await uploadToCloudinary(file, { folder });
}

/**
 * Upload an Image or PDF document to Cloudinary
 * If Cloudinary credentials are not set, falls back cleanly to local server storage
 */
export async function uploadToCloudinary(
  file: File | Blob | string,
  options: {
    folder?: string;
    resourceType?: "image" | "raw" | "auto";
    filename?: string;
    tags?: string[];
  } = {}
): Promise<CloudinaryUploadResult> {
  const cfg = getCloudinaryConfig();
  const folder = options.folder || "learnwithpems_lms";
  const resourceType = options.resourceType || "auto";

  // If Cloudinary is configured with Cloud Name & Upload Preset
  if (cfg.cloudName && cfg.uploadPreset) {
    try {
      const formData = new FormData();
      if (typeof file === "string") {
        formData.append("file", file);
      } else {
        formData.append("file", file);
      }
      formData.append("upload_preset", cfg.uploadPreset);
      formData.append("folder", folder);
      if (options.tags && options.tags.length > 0) {
        formData.append("tags", options.tags.join(","));
      }

      const endpoint = `https://api.cloudinary.com/v1_1/${cfg.cloudName}/${resourceType === "auto" ? "image" : resourceType}/upload`;
      const res = await fetch(endpoint, {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        const isPdf = data.format === "pdf" || (data.secure_url && data.secure_url.endsWith(".pdf"));
        const thumb = isPdf
          ? data.secure_url.replace(/\.pdf$/, ".jpg")
          : `https://res.cloudinary.com/${cfg.cloudName}/image/upload/c_thumb,w_300,h_200/${data.public_id}.${data.format || "jpg"}`;

        return {
          url: data.secure_url || data.url,
          publicId: data.public_id,
          format: data.format || "png",
          resourceType: isPdf ? "document" : data.resource_type || "image",
          sizeBytes: data.bytes || 0,
          width: data.width,
          height: data.height,
          originalFilename: options.filename || data.original_filename || "file",
          thumbnailUrl: thumb,
          createdAt: data.created_at || new Date().toISOString(),
        };
      } else {
        const errJson = await res.json().catch(() => ({}));
        console.warn("Cloudinary upload rejected, falling back to server:", errJson);
      }
    } catch (uploadError) {
      console.warn("Direct Cloudinary upload failed, attempting local server storage:", uploadError);
    }
  }

  // Fallback: Local Server Storage (/api/upload-image) or Data URL
  return await fallbackServerUpload(file, options);
}

/**
 * Fallback to Express backend upload or Client-side DataURL
 */
async function fallbackServerUpload(
  file: File | Blob | string,
  options: { filename?: string }
): Promise<CloudinaryUploadResult> {
  let dataUrl = "";
  let filename = options.filename || "media_asset";
  let mimeType = "image/png";

  if (typeof file === "string") {
    dataUrl = file;
  } else {
    filename = file instanceof File ? file.name : "upload.png";
    mimeType = file.type || "image/png";
    dataUrl = await new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.readAsDataURL(file);
    });
  }

  try {
    const res = await fetch("/api/upload-image", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        dataUrl,
        filename,
        mimeType,
      }),
    });

    if (res.ok) {
      const data = await res.json();
      return {
        url: data.url,
        publicId: data.id || `local_${Date.now()}`,
        format: data.mimeType?.split("/")[1] || "png",
        resourceType: mimeType.includes("pdf") ? "document" : "image",
        sizeBytes: data.sizeBytes || 0,
        originalFilename: filename,
        thumbnailUrl: data.url,
        createdAt: new Date().toISOString(),
      };
    }
  } catch (e) {
    console.warn("Server upload failed, using high-resolution data URL:", e);
  }

  // Direct dataUrl as safe guarantee
  return {
    url: dataUrl,
    publicId: `data_${Date.now()}`,
    format: "png",
    resourceType: "image",
    sizeBytes: dataUrl.length,
    originalFilename: filename,
    thumbnailUrl: dataUrl,
    createdAt: new Date().toISOString(),
  };
}

/**
 * Helper to build responsive, optimized Cloudinary image URLs
 */
export function getOptimizedCloudinaryUrl(
  url: string,
  options: { width?: number; height?: number; crop?: "fill" | "thumb" | "scale" | "fit" } = {}
): string {
  if (!url) return "";
  if (!url.includes("cloudinary.com")) return url;

  const { width, height, crop = "fill" } = options;
  const transforms: string[] = ["f_auto", "q_auto"];
  if (width) transforms.push(`w_${width}`);
  if (height) transforms.push(`h_${height}`);
  if (width || height) transforms.push(`c_${crop}`);

  const transformStr = transforms.join(",");
  return url.replace("/upload/", `/upload/${transformStr}/`);
}
