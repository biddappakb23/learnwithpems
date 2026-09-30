import { db } from "./firebase";
import { doc, setDoc, getDocs, deleteDoc, collection } from "firebase/firestore";
import * as pdfjsLib from "pdfjs-dist";
import {
  SVG_SECTION_C_STRUCTURE,
  SVG_COMPILATION_PIPELINE,
  SVG_MEMORY_LAYOUT,
  SVG_DENNIS_RITCHIE
} from "../utils/imageResolver";
import { optimizeImageToDataUrl, uploadLessonImage } from "./imageStorage";

// Ensure PDF.js worker is properly configured
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version || "3.11.174"}/pdf.worker.min.js`;

export interface MediaAsset {
  id: string;
  title: string;
  alt: string;
  caption: string;
  url: string;
  dataUrl?: string;
  mimeType: string;
  fileType: "image" | "pdf" | "diagram" | "pdf_extracted";
  filename: string;
  sizeBytes: number;
  width?: number;
  height?: number;
  pageNumber?: number;
  totalPages?: number;
  createdAt: string;
  source: "upload" | "pdf_extracted" | "preset" | "screenshot" | "url";
}

const LOCAL_MEDIA_KEY = "c_learn_media_assets_v2";

/**
 * Built-in Curated Vector Diagram Assets
 */
export const PRESET_DIAGRAM_ASSETS: MediaAsset[] = [
  {
    id: "preset_section_c",
    title: "C Program Structure (Section C)",
    alt: "Basic Structure of a C Program - Section C Layout",
    caption: "Six standard sections of a modular ANSI C program",
    url: SVG_SECTION_C_STRUCTURE,
    dataUrl: SVG_SECTION_C_STRUCTURE,
    mimeType: "image/svg+xml",
    fileType: "diagram",
    filename: "section_c_program_structure.svg",
    sizeBytes: 12400,
    width: 800,
    height: 520,
    createdAt: "2026-01-01T00:00:00.000Z",
    source: "preset"
  },
  {
    id: "preset_compilation_pipeline",
    title: "GCC Compilation Process Pipeline",
    alt: "4 Stages of C Compilation: Preprocessing, Compiling, Assembly, Linking",
    caption: "Step-by-step transformation from .c source to executable binary",
    url: SVG_COMPILATION_PIPELINE,
    dataUrl: SVG_COMPILATION_PIPELINE,
    mimeType: "image/svg+xml",
    fileType: "diagram",
    filename: "gcc_compilation_pipeline.svg",
    sizeBytes: 14200,
    width: 840,
    height: 400,
    createdAt: "2026-01-01T00:00:00.000Z",
    source: "preset"
  },
  {
    id: "preset_memory_architecture",
    title: "C Memory Architecture & Layout",
    alt: "Virtual Memory Layout: Stack, Heap, BSS, Data, and Text Segments",
    caption: "Runtime memory segmentation in 32-bit & 64-bit C systems",
    url: SVG_MEMORY_LAYOUT,
    dataUrl: SVG_MEMORY_LAYOUT,
    mimeType: "image/svg+xml",
    fileType: "diagram",
    filename: "c_memory_layout_architecture.svg",
    sizeBytes: 16800,
    width: 800,
    height: 520,
    createdAt: "2026-01-01T00:00:00.000Z",
    source: "preset"
  },
  {
    id: "preset_dennis_ritchie",
    title: "Dennis Ritchie - Father of C & UNIX",
    alt: "Dennis Ritchie (1941 - 2011) Creator of C Programming Language",
    caption: "Bell Laboratories (1972) — Turing Award Laureate",
    url: SVG_DENNIS_RITCHIE,
    dataUrl: SVG_DENNIS_RITCHIE,
    mimeType: "image/svg+xml",
    fileType: "diagram",
    filename: "dennis_ritchie_portrait.svg",
    sizeBytes: 8500,
    width: 600,
    height: 400,
    createdAt: "2026-01-01T00:00:00.000Z",
    source: "preset"
  }
];

/**
 * Load local media assets from localStorage cache
 */
export function getLocalMediaAssets(): MediaAsset[] {
  try {
    const raw = localStorage.getItem(LOCAL_MEDIA_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    return [];
  }
}

/**
 * Save media assets to localStorage cache
 */
export function saveLocalMediaAssets(assets: MediaAsset[]): void {
  try {
    localStorage.setItem(LOCAL_MEDIA_KEY, JSON.stringify(assets));
  } catch (e) {
    console.warn("Local media cache quota exceeded or error:", e);
  }
}

/**
 * Fetch all media assets combined from Server, Firestore, Presets, and Local Cache
 */
export async function getAllMediaAssets(): Promise<MediaAsset[]> {
  const assetMap = new Map<string, MediaAsset>();

  // 1. Add Presets first
  for (const preset of PRESET_DIAGRAM_ASSETS) {
    assetMap.set(preset.id, preset);
  }

  // 2. Add Local Storage Cache
  const localAssets = getLocalMediaAssets();
  for (const asset of localAssets) {
    assetMap.set(asset.id, asset);
  }

  // 3. Fetch from Server filesystem (/api/media)
  try {
    const res = await fetch("/api/media");
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data.media)) {
        for (const file of data.media) {
          const cleanName = file.filename.replace(/\.[^/.]+$/, "");
          const existing = assetMap.get(file.id);
          assetMap.set(file.id, {
            id: file.id,
            title: existing?.title || cleanName.replace(/_/g, " "),
            alt: existing?.alt || cleanName,
            caption: existing?.caption || "",
            url: file.url,
            mimeType: file.mimeType,
            fileType: file.mimeType.startsWith("image/") ? "image" : file.mimeType.includes("pdf") ? "pdf" : "diagram",
            filename: file.filename,
            sizeBytes: file.sizeBytes,
            createdAt: file.createdAt || new Date().toISOString(),
            source: existing?.source || "upload"
          });
        }
      }
    }
  } catch (e) {
    console.warn("Server media fetch skipped:", e);
  }

  // 4. Fetch from Firestore if available
  try {
    const snap = await getDocs(collection(db, "mediaAssets"));
    snap.forEach((docSnap) => {
      const data = docSnap.data() as MediaAsset;
      if (data && data.id) {
        assetMap.set(data.id, { ...assetMap.get(data.id), ...data });
      }
    });
  } catch (e) {
    // Firestore error fallback
  }

  const result = Array.from(assetMap.values());
  // Sort newest first
  result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  return result;
}

/**
 * Upload single Image or Screenshot to Media Library
 */
export async function uploadMediaAsset(
  fileOrDataUrl: File | Blob | string,
  metadata: {
    title?: string;
    alt?: string;
    caption?: string;
    filename?: string;
    source?: MediaAsset["source"];
  } = {}
): Promise<MediaAsset> {
  const uploadRes = await uploadLessonImage(fileOrDataUrl, {
    alt: metadata.alt || metadata.title,
    caption: metadata.caption,
    filename: metadata.filename
  });

  const assetId = uploadRes.id || `media_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const cleanTitle = metadata.title || (uploadRes.originalName || "Uploaded Media").replace(/\.[^/.]+$/, "").replace(/_/g, " ");

  const asset: MediaAsset = {
    id: assetId,
    title: cleanTitle,
    alt: metadata.alt || cleanTitle,
    caption: metadata.caption || "",
    url: uploadRes.url,
    dataUrl: typeof fileOrDataUrl === "string" ? fileOrDataUrl : undefined,
    mimeType: uploadRes.mimeType || "image/png",
    fileType: "image",
    filename: uploadRes.originalName || "image.png",
    sizeBytes: uploadRes.sizeBytes || 10240,
    createdAt: new Date().toISOString(),
    source: metadata.source || "upload"
  };

  // Save to Firestore
  try {
    await setDoc(doc(db, "mediaAssets", asset.id), asset);
  } catch (err) {
    console.warn("Could not save media asset to Firestore:", err);
  }

  // Save to Local Cache
  const existing = getLocalMediaAssets();
  const updated = [asset, ...existing.filter((a) => a.id !== asset.id)];
  saveLocalMediaAssets(updated);

  // Dispatch global event for instant UI sync
  window.dispatchEvent(new CustomEvent("c_learn_media_updated"));

  return asset;
}

/**
 * Extract entire PDF or specific pages into High-Resolution Media Assets
 */
export async function extractPdfToMediaAssets(
  file: File,
  options: {
    pageNumbers?: number[];
    scale?: number;
    titlePrefix?: string;
  } = {}
): Promise<MediaAsset[]> {
  const arrayBuffer = await file.arrayBuffer();
  const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
  const pdfDoc = await loadingTask.promise;
  const totalPages = pdfDoc.numPages;
  const pagesToExtract = options.pageNumbers || Array.from({ length: Math.min(totalPages, 20) }, (_, i) => i + 1);
  const extractedAssets: MediaAsset[] = [];
  const cleanBaseName = file.name.replace(/\.[^/.]+$/, "");

  for (const pageNum of pagesToExtract) {
    try {
      const page = await pdfDoc.getPage(pageNum);
      const scale = options.scale || 2.0; // High-res 2x scale for crystal clear readability
      const viewport = page.getViewport({ scale });

      const canvas = document.createElement("canvas");
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      const ctx = canvas.getContext("2d");

      if (ctx) {
        await (page.render as any)({
          canvasContext: ctx,
          viewport: viewport
        }).promise;

        const dataUrl = canvas.toDataURL("image/png", 0.92);
        const pageTitle = `${options.titlePrefix || cleanBaseName} - Page ${pageNum}`;
        const pageFilename = `${cleanBaseName}_page_${pageNum}.png`;

        const asset = await uploadMediaAsset(dataUrl, {
          title: pageTitle,
          alt: `${cleanBaseName} Lecture Notes Page ${pageNum}`,
          caption: `Extracted from ${file.name} (Page ${pageNum} of ${totalPages})`,
          filename: pageFilename,
          source: "pdf_extracted"
        });

        asset.width = viewport.width;
        asset.height = viewport.height;
        asset.pageNumber = pageNum;
        asset.totalPages = totalPages;
        asset.fileType = "pdf_extracted";

        extractedAssets.push(asset);
      }
    } catch (pageErr) {
      console.error(`Failed to extract PDF page ${pageNum}:`, pageErr);
    }
  }

  return extractedAssets;
}

/**
 * Update media asset metadata (Alt text, title, caption)
 */
export async function updateMediaAssetMetadata(
  assetId: string,
  updates: Partial<Pick<MediaAsset, "title" | "alt" | "caption">>
): Promise<void> {
  // Update Firestore
  try {
    await setDoc(doc(db, "mediaAssets", assetId), updates, { merge: true });
  } catch (err) {
    console.warn("Firestore media update failed:", err);
  }

  // Update Local Cache
  const local = getLocalMediaAssets();
  const updated = local.map((a) => (a.id === assetId ? { ...a, ...updates } : a));
  saveLocalMediaAssets(updated);

  window.dispatchEvent(new CustomEvent("c_learn_media_updated"));
}

/**
 * Delete a media asset from Server, Firestore, and Local Cache
 */
export async function deleteMediaAsset(assetId: string, filename?: string): Promise<boolean> {
  // 1. Delete from Server
  try {
    const fileToDelete = filename || assetId;
    await fetch(`/api/media/${encodeURIComponent(fileToDelete)}`, { method: "DELETE" });
  } catch (e) {
    console.warn("Server media delete failed:", e);
  }

  // 2. Delete from Firestore
  try {
    await deleteDoc(doc(db, "mediaAssets", assetId));
  } catch (e) {
    console.warn("Firestore media delete failed:", e);
  }

  // 3. Delete from Local Cache
  const local = getLocalMediaAssets();
  const filtered = local.filter((a) => a.id !== assetId);
  saveLocalMediaAssets(filtered);

  window.dispatchEvent(new CustomEvent("c_learn_media_updated"));
  return true;
}
