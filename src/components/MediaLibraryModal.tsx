import React, { useState, useEffect, useRef } from "react";
import {
  X,
  UploadCloud,
  Image as ImageIcon,
  FileText,
  Layers,
  Search,
  Check,
  Trash2,
  Copy,
  ExternalLink,
  ZoomIn,
  Loader2,
  ClipboardPaste,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  Crop,
  Download,
  Sparkles,
  Info,
  CheckCircle2
} from "lucide-react";
import * as pdfjsLib from "pdfjs-dist";
import {
  MediaAsset,
  getAllMediaAssets,
  uploadMediaAsset,
  extractPdfToMediaAssets,
  updateMediaAssetMetadata,
  deleteMediaAsset,
  PRESET_DIAGRAM_ASSETS
} from "../services/mediaService";
import { C_DIAGRAM_PRESETS } from "../data/cArchitectureDiagrams";

// Configure worker for pdfjs
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version || "3.11.174"}/pdf.worker.min.js`;

interface MediaLibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInsertMedia: (formattedContent: string, asset: MediaAsset) => void;
  initialTab?: "library" | "upload" | "pdf" | "presets";
  title?: string;
}

export const MediaLibraryModal: React.FC<MediaLibraryModalProps> = ({
  isOpen,
  onClose,
  onInsertMedia,
  initialTab = "library",
  title = "Media & Asset Library"
}) => {
  const [activeTab, setActiveTab] = useState<"library" | "upload" | "pdf" | "presets">(initialTab);
  const [assets, setAssets] = useState<MediaAsset[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedAsset, setSelectedAsset] = useState<MediaAsset | null>(null);

  // Search & Filter States
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [typeFilter, setTypeFilter] = useState<string>("ALL");
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "title" | "size">("newest");

  // Editable Attachment Details
  const [editAlt, setEditAlt] = useState<string>("");
  const [editTitle, setEditTitle] = useState<string>("");
  const [editCaption, setEditCaption] = useState<string>("");
  const [imageAlignment, setImageAlignment] = useState<"center" | "left" | "right" | "none">("center");
  const [imageWidthPercent, setImageWidthPercent] = useState<number>(85);
  const [insertFormat, setInsertFormat] = useState<"figure" | "markdown" | "html">("figure");

  // Upload States
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [uploadQueue, setUploadQueue] = useState<Array<{ name: string; status: "uploading" | "done" | "error"; progress: number }>>([]);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pdfInputRef = useRef<HTMLInputElement>(null);

  // PDF Extractor State
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfDoc, setPdfDoc] = useState<pdfjsLib.PDFDocumentProxy | null>(null);
  const [pdfTotalPages, setPdfTotalPages] = useState<number>(0);
  const [pdfCurrentPage, setPdfCurrentPage] = useState<number>(1);
  const [pdfScale, setPdfScale] = useState<number>(1.5);
  const [pdfRendering, setPdfRendering] = useState<boolean>(false);
  const [pdfExtracting, setPdfExtracting] = useState<boolean>(false);
  const [pdfExtractSuccess, setPdfExtractSuccess] = useState<string | null>(null);
  const pdfCanvasRef = useRef<HTMLCanvasElement>(null);
  const [snipMode, setSnipMode] = useState<boolean>(false);
  const [snipRect, setSnipRect] = useState<{ x: number; y: number; w: number; h: number } | null>(null);
  const [snipStart, setSnipStart] = useState<{ x: number; y: number } | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Load all assets
  const loadAssets = async () => {
    setLoading(true);
    try {
      const list = await getAllMediaAssets();
      setAssets(list);
      if (!selectedAsset && list.length > 0) {
        handleSelectAsset(list[0]);
      } else if (selectedAsset) {
        const found = list.find((a) => a.id === selectedAsset.id);
        if (found) setSelectedAsset(found);
      }
    } catch (err) {
      console.error("Failed to load media assets:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadAssets();
    }
  }, [isOpen]);

  useEffect(() => {
    const handleMediaSync = () => {
      loadAssets();
    };
    window.addEventListener("c_learn_media_updated", handleMediaSync);
    return () => window.removeEventListener("c_learn_media_updated", handleMediaSync);
  }, []);

  const handleSelectAsset = (asset: MediaAsset) => {
    setSelectedAsset(asset);
    setEditAlt(asset.alt || "");
    setEditTitle(asset.title || "");
    setEditCaption(asset.caption || "");
  };

  // Save metadata changes
  const handleSaveMetadata = async () => {
    if (!selectedAsset) return;
    try {
      await updateMediaAssetMetadata(selectedAsset.id, {
        alt: editAlt,
        title: editTitle,
        caption: editCaption
      });
      setSelectedAsset({
        ...selectedAsset,
        alt: editAlt,
        title: editTitle,
        caption: editCaption
      });
      showToast("Metadata saved!");
    } catch (e) {
      console.error("Save metadata error:", e);
    }
  };

  // Delete selected asset
  const handleDeleteAsset = async (asset: MediaAsset) => {
    if (asset.source === "preset") {
      alert("Built-in academic vector presets cannot be deleted.");
      return;
    }
    if (window.confirm(`Are you sure you want to permanently delete "${asset.title}"?`)) {
      await deleteMediaAsset(asset.id, asset.filename);
      if (selectedAsset?.id === asset.id) {
        setSelectedAsset(null);
      }
      showToast("Media asset deleted.");
      loadAssets();
    }
  };

  // Copy Link
  const handleCopyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    showToast("URL copied to clipboard!");
  };

  // Process Files Upload (Images and PDFs)
  const processFiles = async (files: FileList | File[]) => {
    setUploadError(null);
    const fileArray = Array.from(files);
    if (fileArray.length === 0) return;

    for (const file of fileArray) {
      const isPdf = file.type === "application/pdf" || file.name.endsWith(".pdf");
      const isImage = file.type.startsWith("image/");

      if (!isPdf && !isImage) {
        setUploadError(`File "${file.name}" is not a supported image or PDF document.`);
        continue;
      }

      // Add to upload queue
      setUploadQueue((prev) => [...prev, { name: file.name, status: "uploading", progress: 20 }]);

      try {
        if (isPdf) {
          // Extract PDF pages as high-res images
          const extracted = await extractPdfToMediaAssets(file);
          setUploadQueue((prev) =>
            prev.map((item) => (item.name === file.name ? { ...item, status: "done", progress: 100 } : item))
          );
          if (extracted.length > 0) {
            handleSelectAsset(extracted[0]);
          }
          showToast(`Extracted ${extracted.length} pages from PDF!`);
        } else {
          // Upload Image
          const asset = await uploadMediaAsset(file, {
            title: file.name.replace(/\.[^/.]+$/, "").replace(/_/g, " "),
            alt: file.name.replace(/\.[^/.]+$/, ""),
            filename: file.name,
            source: "upload"
          });
          setUploadQueue((prev) =>
            prev.map((item) => (item.name === file.name ? { ...item, status: "done", progress: 100 } : item))
          );
          handleSelectAsset(asset);
          showToast("Image uploaded successfully!");
        }
      } catch (err: any) {
        console.error("Upload error:", err);
        setUploadQueue((prev) =>
          prev.map((item) => (item.name === file.name ? { ...item, status: "error", progress: 100 } : item))
        );
        setUploadError(`Failed to upload ${file.name}. Please try again.`);
      }
    }

    // Refresh list and switch to library tab
    await loadAssets();
    setActiveTab("library");
  };

  // Paste from clipboard in modal
  const handlePasteClipboard = async () => {
    try {
      if (!navigator.clipboard?.read) {
        setUploadError("Clipboard access not supported by browser. Press Ctrl+V directly.");
        return;
      }
      const items = await navigator.clipboard.read();
      for (const item of items) {
        const imageType = item.types.find((t) => t.startsWith("image/"));
        if (imageType) {
          const blob = await item.getType(imageType);
          const asset = await uploadMediaAsset(blob, {
            title: `Pasted Screenshot ${new Date().toLocaleTimeString()}`,
            alt: "Captured Clipboard Diagram",
            caption: "Embedded lecture illustration",
            source: "screenshot"
          });
          await loadAssets();
          handleSelectAsset(asset);
          setActiveTab("library");
          showToast("Clipboard screenshot uploaded!");
          return;
        }
      }
      setUploadError("No image found in clipboard. Take a screenshot (Win+Shift+S) first.");
    } catch (e) {
      setUploadError("Could not access clipboard. Paste directly using Ctrl+V.");
    }
  };

  // Insert Action
  const handleInsertSelected = () => {
    if (!selectedAsset) return;

    const alt = editAlt || selectedAsset.alt || selectedAsset.title || "Lecture Diagram";
    const caption = editCaption || selectedAsset.caption || "";
    const url = selectedAsset.url;
    const captionBlock = caption ? `\n*Figure: ${caption}*` : "";

    let formatted = "";
    if (insertFormat === "markdown") {
      formatted = `\n![${alt}](${url})${captionBlock}\n\n`;
    } else if (insertFormat === "html") {
      const alignAttr = imageAlignment !== "none" ? ` align="${imageAlignment}"` : "";
      formatted = `\n<div${alignAttr} style="margin: 20px 0;">\n  <img src="${url}" alt="${alt}" style="max-width: ${imageWidthPercent}%; border-radius: 12px; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);" />\n</div>${captionBlock}\n\n`;
    } else {
      // Default: Responsive Zoomable Figure Card
      const alignAttr = imageAlignment !== "none" ? ` align="${imageAlignment}"` : ` align="center"`;
      formatted = `\n<div${alignAttr} style="margin: 24px 0;">\n  <img src="${url}" alt="${alt}" style="max-width: ${imageWidthPercent}%; border-radius: 12px; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);" />\n</div>${captionBlock}\n\n`;
    }

    onInsertMedia(formatted, {
      ...selectedAsset,
      alt,
      caption
    });
    onClose();
  };

  // PDF Extractor rendering
  const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPdfFile(file);
    try {
      const buffer = await file.arrayBuffer();
      const loadingTask = pdfjsLib.getDocument({ data: buffer });
      const doc = await loadingTask.promise;
      setPdfDoc(doc);
      setPdfTotalPages(doc.numPages);
      setPdfCurrentPage(1);
      renderPdfPage(doc, 1, pdfScale);
    } catch (err) {
      console.error("PDF load error:", err);
      setUploadError("Failed to open PDF document.");
    }
  };

  const renderPdfPage = async (doc: pdfjsLib.PDFDocumentProxy, pageNum: number, scale: number) => {
    if (!doc || !pdfCanvasRef.current) return;
    setPdfRendering(true);
    try {
      const page = await doc.getPage(pageNum);
      const viewport = page.getViewport({ scale });
      const canvas = pdfCanvasRef.current;
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        await (page.render as any)({
          canvasContext: ctx,
          viewport: viewport
        }).promise;
      }
    } catch (err) {
      console.error("Error rendering PDF page:", err);
    } finally {
      setPdfRendering(false);
    }
  };

  useEffect(() => {
    if (pdfDoc && activeTab === "pdf") {
      renderPdfPage(pdfDoc, pdfCurrentPage, pdfScale);
    }
  }, [pdfCurrentPage, pdfScale, activeTab, pdfDoc]);

  // Snip Tool on PDF Canvas
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!snipMode || !pdfCanvasRef.current) return;
    const rect = pdfCanvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setSnipStart({ x, y });
    setSnipRect({ x, y, w: 0, h: 0 });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!snipMode || !snipStart || !pdfCanvasRef.current) return;
    const rect = pdfCanvasRef.current.getBoundingClientRect();
    const currentX = e.clientX - rect.left;
    const currentY = e.clientY - rect.top;
    const w = currentX - snipStart.x;
    const h = currentY - snipStart.y;
    setSnipRect({
      x: w < 0 ? currentX : snipStart.x,
      y: h < 0 ? currentY : snipStart.y,
      w: Math.abs(w),
      h: Math.abs(h)
    });
  };

  const handleMouseUp = () => {
    setSnipStart(null);
  };

  // Capture current PDF page or snipped region as Media Asset
  const handleCapturePdfRegion = async () => {
    if (!pdfCanvasRef.current || !pdfFile) return;
    setPdfExtracting(true);
    try {
      const mainCanvas = pdfCanvasRef.current;
      let dataUrl: string;

      if (snipRect && snipRect.w > 20 && snipRect.h > 20) {
        // Crop the snipped rectangular region
        const cropCanvas = document.createElement("canvas");
        cropCanvas.width = snipRect.w;
        cropCanvas.height = snipRect.h;
        const cropCtx = cropCanvas.getContext("2d");
        if (cropCtx) {
          cropCtx.drawImage(
            mainCanvas,
            snipRect.x,
            snipRect.y,
            snipRect.w,
            snipRect.h,
            0,
            0,
            snipRect.w,
            snipRect.h
          );
        }
        dataUrl = cropCanvas.toDataURL("image/png", 0.95);
      } else {
        // Full Page
        dataUrl = mainCanvas.toDataURL("image/png", 0.92);
      }

      const cleanName = pdfFile.name.replace(/\.[^/.]+$/, "");
      const isSnipped = snipRect && snipRect.w > 20;
      const assetTitle = `${cleanName} - ${isSnipped ? "Diagram Snip" : "Page " + pdfCurrentPage}`;

      const asset = await uploadMediaAsset(dataUrl, {
        title: assetTitle,
        alt: `${cleanName} Figure (Page ${pdfCurrentPage})`,
        caption: `Captured from ${pdfFile.name} (Page ${pdfCurrentPage})`,
        filename: `${cleanName}_p${pdfCurrentPage}_${Date.now().toString(36)}.png`,
        source: "pdf_extracted"
      });

      await loadAssets();
      handleSelectAsset(asset);
      setPdfExtractSuccess(`Captured successfully and saved to Media Library!`);
      setTimeout(() => setPdfExtractSuccess(null), 3500);
      setSnipRect(null);
      setSnipMode(false);
      setActiveTab("library");
    } catch (err) {
      console.error("PDF capture error:", err);
      setUploadError("Failed to capture diagram from PDF.");
    } finally {
      setPdfExtracting(false);
    }
  };

  if (!isOpen) return null;

  // Filtered and Sorted Assets
  const filteredAssets = assets.filter((asset) => {
    if (typeFilter !== "ALL") {
      if (typeFilter === "images" && asset.fileType !== "image") return false;
      if (typeFilter === "pdf" && asset.fileType !== "pdf_extracted" && asset.fileType !== "pdf") return false;
      if (typeFilter === "diagrams" && asset.fileType !== "diagram") return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const titleMatch = (asset.title || "").toLowerCase().includes(q);
      const altMatch = (asset.alt || "").toLowerCase().includes(q);
      const filenameMatch = (asset.filename || "").toLowerCase().includes(q);
      const captionMatch = (asset.caption || "").toLowerCase().includes(q);
      if (!titleMatch && !altMatch && !filenameMatch && !captionMatch) return false;
    }
    return true;
  });

  filteredAssets.sort((a, b) => {
    if (sortBy === "newest") return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    if (sortBy === "oldest") return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    if (sortBy === "title") return (a.title || "").localeCompare(b.title || "");
    if (sortBy === "size") return (b.sizeBytes || 0) - (a.sizeBytes || 0);
    return 0;
  });

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 select-none animate-fadeIn">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-60 bg-emerald-600 text-white px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-2 text-xs font-bold animate-bounce">
          <CheckCircle2 className="w-4 h-4" />
          <span>{toastMessage}</span>
        </div>
      )}

      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-6xl h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* WordPress Style Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-600/20 text-blue-400 flex items-center justify-center border border-blue-500/30">
              <ImageIcon className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">{title}</h2>
              <p className="text-xs text-slate-400">Upload, organize, crop PDF diagrams, and embed media</p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setActiveTab("library")}
              className={`px-3.5 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
                activeTab === "library" ? "bg-blue-600 text-white shadow-xs" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Media Library ({assets.length})</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("upload")}
              className={`px-3.5 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
                activeTab === "upload" ? "bg-blue-600 text-white shadow-xs" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <UploadCloud className="w-3.5 h-3.5" />
              <span>Upload Files</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("pdf")}
              className={`px-3.5 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
                activeTab === "pdf" ? "bg-blue-600 text-white shadow-xs" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>PDF Diagram Extractor</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("presets")}
              className={`px-3.5 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
                activeTab === "presets" ? "bg-blue-600 text-white shadow-xs" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>C Architecture Presets</span>
            </button>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-hidden flex flex-col">
          {/* TAB 1: MEDIA LIBRARY (WordPress Layout) */}
          {activeTab === "library" && (
            <div className="flex-1 flex overflow-hidden">
              {/* Left Column: Filter Bar & Media Grid */}
              <div className="flex-1 flex flex-col border-r border-slate-800 overflow-hidden">
                {/* Search & Filter Toolbar */}
                <div className="p-3 bg-slate-900/60 border-b border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2 flex-1 min-w-[240px]">
                    <div className="relative flex-1">
                      <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search media by name, caption, alt text..."
                        className="w-full pl-9 pr-3 py-1.5 bg-slate-950 border border-slate-700/80 rounded-lg text-xs text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none"
                      />
                      {searchQuery && (
                        <button
                          type="button"
                          onClick={() => setSearchQuery("")}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      )}
                    </div>

                    <select
                      value={typeFilter}
                      onChange={(e) => setTypeFilter(e.target.value)}
                      className="px-3 py-1.5 bg-slate-950 border border-slate-700/80 rounded-lg text-xs text-slate-300 focus:border-blue-500"
                    >
                      <option value="ALL">All Types</option>
                      <option value="images">Images (PNG/JPG/WebP)</option>
                      <option value="pdf">PDF Extracted Pages</option>
                      <option value="diagrams">Architecture Presets</option>
                    </select>

                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as any)}
                      className="px-3 py-1.5 bg-slate-950 border border-slate-700/80 rounded-lg text-xs text-slate-300 focus:border-blue-500"
                    >
                      <option value="newest">Newest First</option>
                      <option value="oldest">Oldest First</option>
                      <option value="title">Title (A-Z)</option>
                      <option value="size">File Size</option>
                    </select>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setActiveTab("upload")}
                      className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-bold flex items-center gap-1.5 cursor-pointer"
                    >
                      <UploadCloud className="w-3.5 h-3.5" />
                      <span>Upload New</span>
                    </button>
                    <button
                      type="button"
                      onClick={handlePasteClipboard}
                      title="Paste Screenshot from Clipboard (Ctrl+V)"
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg font-semibold flex items-center gap-1.5 cursor-pointer"
                    >
                      <ClipboardPaste className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Paste Clipboard</span>
                    </button>
                  </div>
                </div>

                {/* Media Grid */}
                <div className="flex-1 p-4 overflow-y-auto bg-slate-950">
                  {loading ? (
                    <div className="h-full flex flex-col items-center justify-center text-slate-400">
                      <Loader2 className="w-8 h-8 text-blue-500 animate-spin mb-2" />
                      <p className="text-xs">Loading media assets...</p>
                    </div>
                  ) : filteredAssets.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center p-8">
                      <div className="w-14 h-14 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500 mb-3">
                        <ImageIcon className="w-7 h-7" />
                      </div>
                      <h3 className="text-sm font-bold text-slate-200">No media assets found</h3>
                      <p className="text-xs text-slate-400 max-w-sm mt-1">
                        {searchQuery ? "No assets match your search query." : "Upload images, PDF lecture notes, or diagrams to get started."}
                      </p>
                      <button
                        type="button"
                        onClick={() => setActiveTab("upload")}
                        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-500 cursor-pointer"
                      >
                        Upload First File
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5">
                      {filteredAssets.map((asset) => {
                        const isSelected = selectedAsset?.id === asset.id;
                        return (
                          <div
                            key={asset.id}
                            onClick={() => handleSelectAsset(asset)}
                            className={`group relative rounded-xl border overflow-hidden cursor-pointer bg-slate-900 transition-all ${
                              isSelected
                                ? "border-blue-500 ring-2 ring-blue-500/50 shadow-lg shadow-blue-500/10"
                                : "border-slate-800 hover:border-slate-600 hover:shadow-md"
                            }`}
                          >
                            {/* Thumbnail Container */}
                            <div className="aspect-square bg-slate-950 flex items-center justify-center p-2 relative overflow-hidden">
                              <img
                                src={asset.url}
                                alt={asset.alt || asset.title}
                                loading="lazy"
                                className="w-full h-full object-contain transition-transform group-hover:scale-105"
                              />

                              {/* Selection Badge */}
                              {isSelected && (
                                <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-md">
                                  <Check className="w-3 h-3 stroke-[3]" />
                                </div>
                              )}

                              {/* Asset Type Badge */}
                              <div className="absolute bottom-2 left-2">
                                {asset.fileType === "pdf_extracted" && (
                                  <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-rose-950/90 text-rose-300 border border-rose-800/80">
                                    PDF {asset.pageNumber ? `p.${asset.pageNumber}` : "Extract"}
                                  </span>
                                )}
                                {asset.fileType === "diagram" && (
                                  <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-950/90 text-amber-300 border border-amber-800/80">
                                    SVG Preset
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Caption / Title Tag */}
                            <div className="p-2 border-t border-slate-800/80">
                              <p className="text-[11px] font-medium text-slate-200 truncate" title={asset.title}>
                                {asset.title}
                              </p>
                              <p className="text-[10px] text-slate-500 mt-0.5">
                                {(asset.sizeBytes / 1024).toFixed(0)} KB
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column: Attachment Details Sidebar */}
              <div className="w-80 lg:w-96 bg-slate-900 p-4 border-l border-slate-800 overflow-y-auto flex flex-col">
                {selectedAsset ? (
                  <div className="space-y-4 text-xs">
                    <div className="pb-3 border-b border-slate-800">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-bold text-slate-200 uppercase tracking-wider text-[11px]">
                          Attachment Details
                        </span>
                        <button
                          type="button"
                          onClick={() => handleDeleteAsset(selectedAsset)}
                          title="Delete Permanently"
                          className="text-slate-500 hover:text-rose-400 p-1 rounded-md transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Preview Box */}
                      <div className="p-2 bg-slate-950 rounded-xl border border-slate-800 mb-3 flex items-center justify-center min-h-[160px] max-h-[220px] overflow-hidden">
                        <img
                          src={selectedAsset.url}
                          alt={selectedAsset.alt}
                          className="max-h-[200px] w-auto max-w-full object-contain rounded-lg"
                        />
                      </div>

                      {/* Metadata Summary */}
                      <div className="space-y-1 text-[11px] text-slate-400">
                        <p className="font-semibold text-slate-200 truncate">{selectedAsset.filename}</p>
                        <p>Uploaded: {new Date(selectedAsset.createdAt).toLocaleDateString()}</p>
                        <p>File Size: {(selectedAsset.sizeBytes / 1024).toFixed(1)} KB ({selectedAsset.mimeType})</p>
                        <div className="pt-2 flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleCopyUrl(selectedAsset.url)}
                            className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg flex items-center gap-1 cursor-pointer"
                          >
                            <Copy className="w-3 h-3" />
                            <span>Copy URL</span>
                          </button>
                          <a
                            href={selectedAsset.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg flex items-center gap-1 cursor-pointer"
                          >
                            <ExternalLink className="w-3 h-3" />
                            <span>Open</span>
                          </a>
                        </div>
                      </div>
                    </div>

                    {/* Editable Fields */}
                    <div className="space-y-3">
                      <div>
                        <label className="block font-semibold text-slate-300 mb-1">Alt Text (Alternative Text)</label>
                        <input
                          type="text"
                          value={editAlt}
                          onChange={(e) => setEditAlt(e.target.value)}
                          onBlur={handleSaveMetadata}
                          placeholder="Describe the image for students & accessibility"
                          className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white focus:border-blue-500 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block font-semibold text-slate-300 mb-1">Title</label>
                        <input
                          type="text"
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          onBlur={handleSaveMetadata}
                          className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white focus:border-blue-500 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block font-semibold text-slate-300 mb-1">Figure Caption (Shown in Lecture)</label>
                        <textarea
                          rows={2}
                          value={editCaption}
                          onChange={(e) => setEditCaption(e.target.value)}
                          onBlur={handleSaveMetadata}
                          placeholder="e.g. Figure 1.2: Virtual Memory Segmentation Structure"
                          className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white focus:border-blue-500 focus:outline-none resize-none"
                        />
                      </div>
                    </div>

                    {/* Attachment Display Settings */}
                    <div className="pt-3 border-t border-slate-800 space-y-3">
                      <span className="font-bold text-slate-200 uppercase tracking-wider text-[11px] block">
                        Display Settings
                      </span>

                      <div>
                        <label className="block text-slate-400 mb-1">Alignment</label>
                        <div className="grid grid-cols-4 gap-1">
                          {(["left", "center", "right", "none"] as const).map((align) => (
                            <button
                              key={align}
                              type="button"
                              onClick={() => setImageAlignment(align)}
                              className={`py-1 rounded-md text-[11px] capitalize cursor-pointer border ${
                                imageAlignment === align
                                  ? "bg-blue-600 text-white border-blue-500"
                                  : "bg-slate-950 text-slate-400 border-slate-800 hover:text-white"
                              }`}
                            >
                              {align}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-slate-400 mb-1">
                          <span>Max Width</span>
                          <span className="text-white font-bold">{imageWidthPercent}%</span>
                        </div>
                        <input
                          type="range"
                          min={25}
                          max={100}
                          step={5}
                          value={imageWidthPercent}
                          onChange={(e) => setImageWidthPercent(Number(e.target.value))}
                          className="w-full accent-blue-500 cursor-pointer"
                        />
                        <div className="flex justify-between text-[10px] text-slate-500 mt-0.5">
                          <span>25% (Thumb)</span>
                          <span>50% (Med)</span>
                          <span>85% (Optimal)</span>
                          <span>100% (Full)</span>
                        </div>
                      </div>

                      <div>
                        <label className="block text-slate-400 mb-1">Embedding Format</label>
                        <select
                          value={insertFormat}
                          onChange={(e) => setInsertFormat(e.target.value as any)}
                          className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs text-slate-300"
                        >
                          <option value="figure">Interactive Zoomable Figure Card (Recommended)</option>
                          <option value="html">Aligned HTML Block</option>
                          <option value="markdown">Standard Markdown ![alt](url)</option>
                        </select>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-center text-slate-500 p-6">
                    <SlidersHorizontal className="w-8 h-8 mb-2 opacity-50" />
                    <p className="text-xs">Select a media item on the left to view and customize its properties.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: UPLOAD FILES */}
          {activeTab === "upload" && (
            <div className="flex-1 p-8 bg-slate-950 flex flex-col items-center justify-center">
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setIsDragging(false);
                  if (e.dataTransfer.files) {
                    processFiles(e.dataTransfer.files);
                  }
                }}
                onClick={() => fileInputRef.current?.click()}
                className={`w-full max-w-2xl border-2 border-dashed rounded-3xl p-10 text-center cursor-pointer transition-all ${
                  isDragging
                    ? "border-blue-500 bg-blue-950/30 scale-[1.01]"
                    : "border-slate-700 hover:border-blue-500 bg-slate-900/60"
                }`}
              >
                <div className="w-16 h-16 rounded-2xl bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center mx-auto mb-4">
                  <UploadCloud className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold text-white mb-1">Drag &amp; Drop Images or PDF Documents here</h3>
                <p className="text-xs text-slate-400 max-w-md mx-auto mb-6">
                  Supports PNG, JPG, WebP, SVG, GIF, and PDF Lecture Notes up to 25MB. PDF files are automatically parsed into crisp high-res diagram pages.
                </p>

                <div className="flex items-center justify-center gap-3">
                  <button
                    type="button"
                    className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold cursor-pointer shadow-lg shadow-blue-600/20"
                  >
                    Browse Files from Computer
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePasteClipboard();
                    }}
                    className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                  >
                    <ClipboardPaste className="w-4 h-4 text-cyan-400" />
                    <span>Paste Screenshot (Ctrl+V)</span>
                  </button>
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/*,.pdf"
                  onChange={(e) => {
                    if (e.target.files) processFiles(e.target.files);
                  }}
                  className="hidden"
                />
              </div>

              {uploadError && (
                <div className="mt-4 p-3 bg-rose-950/60 border border-rose-800 rounded-xl text-xs text-rose-300 max-w-xl text-center">
                  {uploadError}
                </div>
              )}

              {/* Upload Queue */}
              {uploadQueue.length > 0 && (
                <div className="mt-6 w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-2">
                  <h4 className="text-xs font-bold text-slate-300">Upload Activity</h4>
                  {uploadQueue.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between text-xs p-2 bg-slate-950 rounded-lg">
                      <span className="text-slate-300 truncate max-w-md">{item.name}</span>
                      {item.status === "uploading" && (
                        <div className="flex items-center gap-1.5 text-blue-400">
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Processing...</span>
                        </div>
                      )}
                      {item.status === "done" && (
                        <div className="flex items-center gap-1 text-emerald-400 font-bold">
                          <Check className="w-3.5 h-3.5" />
                          <span>Ready</span>
                        </div>
                      )}
                      {item.status === "error" && <span className="text-rose-400 font-bold">Failed</span>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: PDF DIAGRAM EXTRACTOR */}
          {activeTab === "pdf" && (
            <div className="flex-1 flex flex-col overflow-hidden bg-slate-950">
              {/* PDF Toolbar */}
              <div className="p-3 bg-slate-900 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => pdfInputRef.current?.click()}
                    className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-bold flex items-center gap-1.5 cursor-pointer"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>{pdfFile ? "Change PDF" : "Open PDF Document"}</span>
                  </button>
                  <input
                    ref={pdfInputRef}
                    type="file"
                    accept=".pdf"
                    onChange={handlePdfUpload}
                    className="hidden"
                  />

                  {pdfFile && (
                    <span className="text-slate-300 font-medium truncate max-w-xs">{pdfFile.name}</span>
                  )}
                </div>

                {pdfDoc && (
                  <div className="flex items-center gap-2">
                    {/* Page Nav */}
                    <div className="flex items-center gap-1 bg-slate-950 px-2 py-1 rounded-lg border border-slate-800">
                      <button
                        type="button"
                        disabled={pdfCurrentPage <= 1}
                        onClick={() => setPdfCurrentPage((p) => Math.max(1, p - 1))}
                        className="p-1 text-slate-400 hover:text-white disabled:opacity-30 cursor-pointer"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <span className="text-xs text-slate-300 font-bold px-2">
                        {pdfCurrentPage} / {pdfTotalPages}
                      </span>
                      <button
                        type="button"
                        disabled={pdfCurrentPage >= pdfTotalPages}
                        onClick={() => setPdfCurrentPage((p) => Math.min(pdfTotalPages, p + 1))}
                        className="p-1 text-slate-400 hover:text-white disabled:opacity-30 cursor-pointer"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Zoom Select */}
                    <select
                      value={pdfScale}
                      onChange={(e) => setPdfScale(Number(e.target.value))}
                      className="px-2 py-1 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-300"
                    >
                      <option value={1.0}>100% Zoom</option>
                      <option value={1.5}>150% Zoom</option>
                      <option value={2.0}>200% High-Res</option>
                    </select>

                    {/* Snip Tool Toggle */}
                    <button
                      type="button"
                      onClick={() => {
                        setSnipMode(!snipMode);
                        setSnipRect(null);
                      }}
                      className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 cursor-pointer transition-colors ${
                        snipMode
                          ? "bg-amber-600 text-white shadow-md shadow-amber-600/20"
                          : "bg-slate-800 text-slate-300 hover:text-white"
                      }`}
                    >
                      <Crop className="w-3.5 h-3.5" />
                      <span>{snipMode ? "Snip Mode Active" : "Snip Diagram Box"}</span>
                    </button>

                    {/* Capture / Extract Button */}
                    <button
                      type="button"
                      disabled={pdfExtracting}
                      onClick={handleCapturePdfRegion}
                      className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-lg font-bold flex items-center gap-1.5 cursor-pointer shadow-md shadow-emerald-600/20"
                    >
                      {pdfExtracting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
                      <span>{snipRect && snipRect.w > 20 ? "Save Snipped Box" : "Extract Page Figure"}</span>
                    </button>
                  </div>
                )}
              </div>

              {pdfExtractSuccess && (
                <div className="p-2.5 bg-emerald-950 border-b border-emerald-800 text-emerald-300 text-xs text-center font-bold">
                  {pdfExtractSuccess}
                </div>
              )}

              {/* PDF Canvas Viewport */}
              <div className="flex-1 overflow-auto p-6 flex items-center justify-center relative">
                {pdfDoc ? (
                  <div className="relative inline-block border border-slate-700 rounded-xl shadow-2xl overflow-hidden bg-white">
                    <canvas
                      ref={pdfCanvasRef}
                      onMouseDown={handleMouseDown}
                      onMouseMove={handleMouseMove}
                      onMouseUp={handleMouseUp}
                      className={snipMode ? "cursor-crosshair" : "cursor-default"}
                    />

                    {/* Snip Selection Box */}
                    {snipRect && snipRect.w > 0 && (
                      <div
                        className="absolute border-2 border-dashed border-amber-500 bg-amber-500/20 pointer-events-none"
                        style={{
                          left: `${snipRect.x}px`,
                          top: `${snipRect.y}px`,
                          width: `${snipRect.w}px`,
                          height: `${snipRect.h}px`
                        }}
                      >
                        <span className="absolute -top-5 left-0 bg-amber-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded shadow">
                          Selected Diagram Area
                        </span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center p-8 max-w-md">
                    <div className="w-16 h-16 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500 mx-auto mb-4">
                      <FileText className="w-8 h-8" />
                    </div>
                    <h3 className="text-sm font-bold text-slate-200">Load a PDF Textbook or Notes</h3>
                    <p className="text-xs text-slate-400 mt-1 mb-4">
                      Open any PDF to snip specific architecture diagrams or export lecture pages straight into your media library.
                    </p>
                    <button
                      type="button"
                      onClick={() => pdfInputRef.current?.click()}
                      className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold cursor-pointer"
                    >
                      Choose PDF File
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 4: C ARCHITECTURE PRESETS */}
          {activeTab === "presets" && (
            <div className="flex-1 p-6 bg-slate-950 overflow-y-auto">
              <div className="max-w-4xl mx-auto space-y-4">
                <div>
                  <h3 className="text-base font-bold text-white">Built-in C Architecture Vector Presets</h3>
                  <p className="text-xs text-slate-400">
                    High-definition vector SVG diagrams ready for 1-click embedding into lecture notes and course theory.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {PRESET_DIAGRAM_ASSETS.map((preset) => (
                    <div
                      key={preset.id}
                      onClick={() => {
                        handleSelectAsset(preset);
                        setActiveTab("library");
                      }}
                      className="p-4 bg-slate-900 border border-slate-800 hover:border-blue-500 rounded-2xl cursor-pointer transition-all group space-y-3"
                    >
                      <div className="h-44 bg-slate-950 rounded-xl border border-slate-800 p-2 flex items-center justify-center overflow-hidden">
                        <img
                          src={preset.url}
                          alt={preset.alt}
                          className="max-h-full max-w-full object-contain transition-transform group-hover:scale-105"
                        />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-white group-hover:text-blue-400 transition-colors">
                          {preset.title}
                        </h4>
                        <p className="text-[11px] text-slate-400 mt-1">{preset.caption}</p>
                      </div>
                      <button
                        type="button"
                        className="w-full py-1.5 bg-slate-800 group-hover:bg-blue-600 text-slate-300 group-hover:text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
                      >
                        Select &amp; Customize
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Action Footer */}
        <div className="flex items-center justify-between px-6 py-3.5 border-t border-slate-800 bg-slate-950">
          <div className="flex items-center gap-3">
            {selectedAsset ? (
              <div className="flex items-center gap-2.5">
                <img
                  src={selectedAsset.url}
                  alt="Thumb"
                  className="w-8 h-8 rounded-lg object-contain bg-slate-900 border border-slate-700"
                />
                <div className="text-xs">
                  <span className="font-bold text-slate-200 truncate max-w-xs block">{selectedAsset.title}</span>
                  <span className="text-[10px] text-slate-400">
                    {imageAlignment !== "none" ? `Align: ${imageAlignment}` : "Default"} • Width: {imageWidthPercent}%
                  </span>
                </div>
              </div>
            ) : (
              <span className="text-xs text-slate-500">No media asset selected</span>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold cursor-pointer transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={!selectedAsset}
              onClick={handleInsertSelected}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white rounded-xl text-xs font-bold cursor-pointer transition-all shadow-lg shadow-blue-600/20"
            >
              Insert into Lesson / Theory
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
