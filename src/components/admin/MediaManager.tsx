import React, { useState, useEffect, useRef } from "react";
import {
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
  CheckCircle2,
  Eye,
  RefreshCw,
  Plus
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
} from "../../services/mediaService";
import { resolveLessonImage } from "../../utils/imageResolver";

// Ensure worker is configured
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version || "3.11.174"}/pdf.worker.min.js`;

export const MediaManager: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<"library" | "upload" | "pdf" | "presets">("library");
  const [assets, setAssets] = useState<MediaAsset[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedAsset, setSelectedAsset] = useState<MediaAsset | null>(null);

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [typeFilter, setTypeFilter] = useState<string>("ALL");
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "title" | "size">("newest");

  // Metadata Edit
  const [editAlt, setEditAlt] = useState<string>("");
  const [editTitle, setEditTitle] = useState<string>("");
  const [editCaption, setEditCaption] = useState<string>("");

  // Upload States
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [uploadQueue, setUploadQueue] = useState<Array<{ name: string; status: "uploading" | "done" | "error" }>>([]);
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
  const pdfCanvasRef = useRef<HTMLCanvasElement>(null);
  const [snipMode, setSnipMode] = useState<boolean>(false);
  const [snipRect, setSnipRect] = useState<{ x: number; y: number; w: number; h: number } | null>(null);
  const [snipStart, setSnipStart] = useState<{ x: number; y: number } | null>(null);

  // Toast / Zoom
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [previewZoomUrl, setPreviewZoomUrl] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

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
    loadAssets();
  }, []);

  const handleSelectAsset = (asset: MediaAsset) => {
    setSelectedAsset(asset);
    setEditAlt(asset.alt || "");
    setEditTitle(asset.title || "");
    setEditCaption(asset.caption || "");
  };

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
      showToast("Metadata saved successfully!");
    } catch (e) {
      console.error("Save metadata error:", e);
    }
  };

  const handleDelete = async (asset: MediaAsset) => {
    if (asset.source === "preset") {
      alert("Built-in architectural presets cannot be deleted.");
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

  const handleCopyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    showToast("URL copied to clipboard!");
  };

  const processFiles = async (files: FileList | File[]) => {
    setUploadError(null);
    const fileArray = Array.from(files);
    if (fileArray.length === 0) return;

    for (const file of fileArray) {
      const isPdf = file.type === "application/pdf" || file.name.endsWith(".pdf");
      const isImage = file.type.startsWith("image/");

      if (!isPdf && !isImage) {
        setUploadError(`File "${file.name}" is not a supported image or PDF.`);
        continue;
      }

      setUploadQueue((prev) => [...prev, { name: file.name, status: "uploading" }]);

      try {
        if (isPdf) {
          const extracted = await extractPdfToMediaAssets(file);
          setUploadQueue((prev) =>
            prev.map((item) => (item.name === file.name ? { ...item, status: "done" } : item))
          );
          if (extracted.length > 0) handleSelectAsset(extracted[0]);
          showToast(`Extracted ${extracted.length} pages from PDF!`);
        } else {
          const asset = await uploadMediaAsset(file, {
            title: file.name.replace(/\.[^/.]+$/, "").replace(/_/g, " "),
            alt: file.name.replace(/\.[^/.]+$/, ""),
            filename: file.name,
            source: "upload"
          });
          setUploadQueue((prev) =>
            prev.map((item) => (item.name === file.name ? { ...item, status: "done" } : item))
          );
          handleSelectAsset(asset);
          showToast("Image uploaded successfully!");
        }
      } catch (err: any) {
        console.error("Upload error:", err);
        setUploadQueue((prev) =>
          prev.map((item) => (item.name === file.name ? { ...item, status: "error" } : item))
        );
        setUploadError(`Failed to upload ${file.name}.`);
      }
    }

    await loadAssets();
    setActiveSubTab("library");
  };

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
            title: `Pasted Diagram ${new Date().toLocaleTimeString()}`,
            alt: "Captured Clipboard Image",
            caption: "Lecture theory illustration",
            source: "screenshot"
          });
          await loadAssets();
          handleSelectAsset(asset);
          setActiveSubTab("library");
          showToast("Clipboard screenshot uploaded!");
          return;
        }
      }
      setUploadError("No image found in clipboard. Take a screenshot (Win+Shift+S) first.");
    } catch (e) {
      setUploadError("Could not access clipboard. Paste directly using Ctrl+V.");
    }
  };

  // PDF Page Renderer
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
        await (page.render as any)({ canvasContext: ctx, viewport }).promise;
      }
    } catch (err) {
      console.error("PDF render error:", err);
    } finally {
      setPdfRendering(false);
    }
  };

  useEffect(() => {
    if (pdfDoc && activeSubTab === "pdf") {
      renderPdfPage(pdfDoc, pdfCurrentPage, pdfScale);
    }
  }, [pdfCurrentPage, pdfScale, activeSubTab, pdfDoc]);

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

  const handleCapturePdfRegion = async () => {
    if (!pdfCanvasRef.current || !pdfFile) return;
    setPdfExtracting(true);
    try {
      const mainCanvas = pdfCanvasRef.current;
      let dataUrl: string;

      if (snipRect && snipRect.w > 20 && snipRect.h > 20) {
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
        dataUrl = mainCanvas.toDataURL("image/png", 0.92);
      }

      const cleanName = pdfFile.name.replace(/\.[^/.]+$/, "");
      const isSnipped = snipRect && snipRect.w > 20;
      const assetTitle = `${cleanName} - ${isSnipped ? "Diagram Snip" : "Page " + pdfCurrentPage}`;

      const asset = await uploadMediaAsset(dataUrl, {
        title: assetTitle,
        alt: `${cleanName} Figure (Page ${pdfCurrentPage})`,
        caption: `Extracted from ${pdfFile.name} (Page ${pdfCurrentPage})`,
        filename: `${cleanName}_p${pdfCurrentPage}_${Date.now().toString(36)}.png`,
        source: "pdf_extracted"
      });

      await loadAssets();
      handleSelectAsset(asset);
      showToast("Diagram snip captured and saved to Media Library!");
      setSnipRect(null);
      setSnipMode(false);
      setActiveSubTab("library");
    } catch (err) {
      console.error("PDF capture error:", err);
      setUploadError("Failed to snip diagram.");
    } finally {
      setPdfExtracting(false);
    }
  };

  // Filter & Sort
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
    <div className="space-y-6">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-60 bg-emerald-600 text-white px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-2 text-xs font-bold animate-bounce">
          <CheckCircle2 className="w-4 h-4" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Lightbox Zoom */}
      {previewZoomUrl && (
        <div
          className="fixed inset-0 z-100 bg-slate-950/90 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setPreviewZoomUrl(null)}
        >
          <div className="relative max-w-5xl max-h-[90vh] bg-white p-2 rounded-2xl shadow-2xl">
            <img src={previewZoomUrl} alt="HD Preview" className="max-h-[82vh] max-w-full object-contain rounded-xl" />
          </div>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center">
              <ImageIcon className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight">Media Library &amp; Asset Hub</h2>
              <p className="text-xs text-slate-400">
                Manage all curriculum images, extracted PDF textbook diagrams, and academic vector presets
              </p>
            </div>
          </div>
        </div>

        {/* Top Controls */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs font-semibold">
            <button
              onClick={() => setActiveSubTab("library")}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
                activeSubTab === "library" ? "bg-blue-600 text-white shadow-xs" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Library ({assets.length})</span>
            </button>
            <button
              onClick={() => setActiveSubTab("upload")}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
                activeSubTab === "upload" ? "bg-blue-600 text-white shadow-xs" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <UploadCloud className="w-3.5 h-3.5" />
              <span>Upload</span>
            </button>
            <button
              onClick={() => setActiveSubTab("pdf")}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
                activeSubTab === "pdf" ? "bg-blue-600 text-white shadow-xs" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>PDF Extractor</span>
            </button>
            <button
              onClick={() => setActiveSubTab("presets")}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
                activeSubTab === "presets" ? "bg-blue-600 text-white shadow-xs" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>C Presets</span>
            </button>
          </div>

          <button
            onClick={loadAssets}
            title="Refresh Media List"
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-colors cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* SUB TAB 1: MEDIA LIBRARY (WordPress Style View) */}
      {activeSubTab === "library" && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden flex flex-col lg:flex-row min-h-[600px] shadow-sm">
          {/* Left Grid & Filter Toolbar */}
          <div className="flex-1 flex flex-col border-b lg:border-b-0 lg:border-r border-slate-800">
            {/* Filter Bar */}
            <div className="p-3.5 bg-slate-950/80 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2 flex-1 min-w-[260px]">
                <div className="relative flex-1">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search media by title, alt text, or file name..."
                    className="w-full pl-9 pr-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-slate-300"
                >
                  <option value="ALL">All Media Items</option>
                  <option value="images">Images (PNG/JPG/WebP)</option>
                  <option value="pdf">PDF Extracted Pages</option>
                  <option value="diagrams">Architecture Presets</option>
                </select>

                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-slate-300"
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="title">Title (A-Z)</option>
                  <option value="size">File Size</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveSubTab("upload")}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-bold flex items-center gap-1.5 cursor-pointer text-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add New</span>
                </button>
                <button
                  onClick={handlePasteClipboard}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg font-semibold flex items-center gap-1.5 cursor-pointer text-xs"
                >
                  <ClipboardPaste className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Paste Screenshot</span>
                </button>
              </div>
            </div>

            {/* Media Thumbnails Grid */}
            <div className="p-5 flex-1 bg-slate-950 overflow-y-auto max-h-[680px]">
              {loading ? (
                <div className="h-64 flex flex-col items-center justify-center text-slate-400">
                  <Loader2 className="w-8 h-8 text-blue-500 animate-spin mb-2" />
                  <p className="text-xs">Loading media library...</p>
                </div>
              ) : filteredAssets.length === 0 ? (
                <div className="h-64 flex flex-col items-center justify-center text-center p-6">
                  <ImageIcon className="w-10 h-10 text-slate-600 mb-2" />
                  <p className="text-sm font-bold text-slate-300">No media assets found</p>
                  <p className="text-xs text-slate-500 mt-1">Upload images or snip textbook pages from PDF.</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-3.5">
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
                        <div className="aspect-square bg-slate-950 flex items-center justify-center p-2 relative overflow-hidden">
                          <img
                            src={asset.url}
                            alt={asset.alt || asset.title}
                            loading="lazy"
                            className="w-full h-full object-contain transition-transform group-hover:scale-105"
                          />

                          {isSelected && (
                            <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-md">
                              <Check className="w-3 h-3 stroke-[3]" />
                            </div>
                          )}

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

                        <div className="p-2 border-t border-slate-800">
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

          {/* Right Details Sidebar */}
          <div className="w-full lg:w-88 bg-slate-900 p-5 overflow-y-auto flex flex-col">
            {selectedAsset ? (
              <div className="space-y-4 text-xs">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <span className="font-bold text-slate-200 uppercase tracking-wider text-[11px]">
                    Attachment Details
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setPreviewZoomUrl(selectedAsset.url)}
                      title="Open Fullscreen HD Preview"
                      className="text-slate-400 hover:text-white p-1 rounded-md transition-colors cursor-pointer"
                    >
                      <ZoomIn className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(selectedAsset)}
                      title="Delete Permanently"
                      className="text-slate-400 hover:text-rose-400 p-1 rounded-md transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Preview Box */}
                <div
                  onClick={() => setPreviewZoomUrl(selectedAsset.url)}
                  className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-center min-h-[180px] max-h-[240px] overflow-hidden cursor-pointer group relative"
                >
                  <img
                    src={selectedAsset.url}
                    alt={selectedAsset.alt}
                    className="max-h-[220px] w-auto max-w-full object-contain rounded-lg transition-transform group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold gap-1">
                    <ZoomIn className="w-4 h-4" /> Click to Zoom
                  </div>
                </div>

                {/* Metadata */}
                <div className="space-y-1 text-[11px] text-slate-400">
                  <p className="font-bold text-slate-200 truncate">{selectedAsset.filename}</p>
                  <p>Uploaded: {new Date(selectedAsset.createdAt).toLocaleDateString()}</p>
                  <p>Size: {(selectedAsset.sizeBytes / 1024).toFixed(1)} KB ({selectedAsset.mimeType})</p>
                  <div className="pt-2 flex items-center gap-2">
                    <button
                      onClick={() => handleCopyUrl(selectedAsset.url)}
                      className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg flex items-center gap-1 cursor-pointer font-medium"
                    >
                      <Copy className="w-3 h-3" />
                      <span>Copy URL</span>
                    </button>
                    <a
                      href={selectedAsset.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg flex items-center gap-1 cursor-pointer font-medium"
                    >
                      <ExternalLink className="w-3 h-3" />
                      <span>Open Link</span>
                    </a>
                  </div>
                </div>

                {/* Form Fields */}
                <div className="space-y-3 pt-2">
                  <div>
                    <label className="block font-semibold text-slate-300 mb-1">Alt Text</label>
                    <input
                      type="text"
                      value={editAlt}
                      onChange={(e) => setEditAlt(e.target.value)}
                      onBlur={handleSaveMetadata}
                      placeholder="Describes the figure for accessibility"
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
                    <label className="block font-semibold text-slate-300 mb-1">Figure Caption</label>
                    <textarea
                      rows={2}
                      value={editCaption}
                      onChange={(e) => setEditCaption(e.target.value)}
                      onBlur={handleSaveMetadata}
                      placeholder="e.g. Figure 1.1: Standard C Program Execution Pipeline"
                      className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white focus:border-blue-500 focus:outline-none resize-none"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    onClick={handleSaveMetadata}
                    className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold cursor-pointer transition-colors shadow-sm"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center text-slate-500 p-6">
                <SlidersHorizontal className="w-8 h-8 mb-2 opacity-50" />
                <p className="text-xs">Select any media item on the left to inspect and edit its details.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* SUB TAB 2: UPLOAD FILES */}
      {activeSubTab === "upload" && (
        <div className="p-8 bg-slate-900 border border-slate-800 rounded-2xl flex flex-col items-center justify-center">
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setIsDragging(false);
              if (e.dataTransfer.files) processFiles(e.dataTransfer.files);
            }}
            onClick={() => fileInputRef.current?.click()}
            className={`w-full max-w-2xl border-2 border-dashed rounded-3xl p-12 text-center cursor-pointer transition-all ${
              isDragging
                ? "border-blue-500 bg-blue-950/30 scale-[1.01]"
                : "border-slate-700 hover:border-blue-500 bg-slate-950"
            }`}
          >
            <div className="w-16 h-16 rounded-2xl bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center mx-auto mb-4">
              <UploadCloud className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-white mb-1">Drag and Drop Media or PDF Documents</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto mb-6">
              Upload PNG, JPG, WebP, SVG, GIF, or PDF textbooks. PDF pages are converted to crisp diagrams automatically.
            </p>

            <div className="flex items-center justify-center gap-3">
              <button
                type="button"
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold cursor-pointer"
              >
                Browse Files from Device
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
                <span>Paste Screenshot</span>
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
        </div>
      )}

      {/* SUB TAB 3: PDF DIAGRAM EXTRACTOR */}
      {activeSubTab === "pdf" && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden flex flex-col min-h-[600px]">
          {/* PDF Bar */}
          <div className="p-4 bg-slate-950 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => pdfInputRef.current?.click()}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold flex items-center gap-1.5 cursor-pointer"
              >
                <FileText className="w-4 h-4" />
                <span>{pdfFile ? "Choose Another PDF" : "Open PDF Lecture Notes"}</span>
              </button>
              <input
                ref={pdfInputRef}
                type="file"
                accept=".pdf"
                onChange={handlePdfUpload}
                className="hidden"
              />
              {pdfFile && <span className="text-slate-300 font-semibold">{pdfFile.name}</span>}
            </div>

            {pdfDoc && (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1 bg-slate-900 px-2 py-1 rounded-lg border border-slate-800">
                  <button
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
                    disabled={pdfCurrentPage >= pdfTotalPages}
                    onClick={() => setPdfCurrentPage((p) => Math.min(pdfTotalPages, p + 1))}
                    className="p-1 text-slate-400 hover:text-white disabled:opacity-30 cursor-pointer"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

                <select
                  value={pdfScale}
                  onChange={(e) => setPdfScale(Number(e.target.value))}
                  className="px-2.5 py-1 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-300"
                >
                  <option value={1.0}>100% Scale</option>
                  <option value={1.5}>150% Scale</option>
                  <option value={2.0}>200% High-DPI</option>
                </select>

                <button
                  onClick={() => {
                    setSnipMode(!snipMode);
                    setSnipRect(null);
                  }}
                  className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 cursor-pointer transition-colors ${
                    snipMode ? "bg-amber-600 text-white shadow" : "bg-slate-800 text-slate-300 hover:text-white"
                  }`}
                >
                  <Crop className="w-3.5 h-3.5" />
                  <span>{snipMode ? "Snip Active" : "Snip Diagram Box"}</span>
                </button>

                <button
                  disabled={pdfExtracting}
                  onClick={handleCapturePdfRegion}
                  className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-lg font-bold flex items-center gap-1.5 cursor-pointer shadow-md"
                >
                  {pdfExtracting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
                  <span>{snipRect && snipRect.w > 20 ? "Save Snipped Figure" : "Save Page Figure"}</span>
                </button>
              </div>
            )}
          </div>

          {/* PDF Canvas View */}
          <div className="flex-1 p-8 bg-slate-950 flex items-center justify-center overflow-auto">
            {pdfDoc ? (
              <div className="relative inline-block border border-slate-700 rounded-2xl shadow-2xl overflow-hidden bg-white">
                <canvas
                  ref={pdfCanvasRef}
                  onMouseDown={handleMouseDown}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                  className={snipMode ? "cursor-crosshair" : "cursor-default"}
                />

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
                      Snip Area
                    </span>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center p-8 max-w-md">
                <FileText className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                <h3 className="text-base font-bold text-slate-200">Load a PDF Textbook to Snip Visuals</h3>
                <p className="text-xs text-slate-400 mt-1 mb-4">
                  Extract crystal clear vector diagrams and flowcharts directly into your course media library.
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

      {/* SUB TAB 4: C PRESETS */}
      {activeSubTab === "presets" && (
        <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl">
          <div className="max-w-4xl mx-auto space-y-4">
            <div>
              <h3 className="text-base font-bold text-white">Curated C Architecture Vector Diagrams</h3>
              <p className="text-xs text-slate-400">
                Pre-built computer science architectural figures ready for instant reference in lessons and theory.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {PRESET_DIAGRAM_ASSETS.map((preset) => (
                <div
                  key={preset.id}
                  onClick={() => {
                    handleSelectAsset(preset);
                    setActiveSubTab("library");
                  }}
                  className="p-4 bg-slate-950 border border-slate-800 hover:border-blue-500 rounded-2xl cursor-pointer transition-all group space-y-3"
                >
                  <div className="h-44 bg-slate-900 rounded-xl border border-slate-800 p-2 flex items-center justify-center overflow-hidden">
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
                    View in Media Library
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
