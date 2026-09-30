import React, { useState, useRef, useEffect } from "react";
import {
  FileText,
  Image as ImageIcon,
  Table as TableIcon,
  UploadCloud,
  Check,
  X,
  Copy,
  Scissors,
  Eye,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Trash2,
  RefreshCw,
  Layers,
  FileCheck,
  AlertCircle
} from "lucide-react";
import * as pdfjsLib from "pdfjs-dist";
import { uploadLessonImage } from "../services/imageStorage";

// Configure pdfjs worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version || "3.11.174"}/pdf.worker.min.js`;

interface PdfContentExtractorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInsertContent: (formattedMarkdown: string) => void;
}

type ExtractorTab = "snip-image" | "pdf-table" | "pdf-document";

export const PdfContentExtractorModal: React.FC<PdfContentExtractorModalProps> = ({
  isOpen,
  onClose,
  onInsertContent
}) => {
  const [activeTab, setActiveTab] = useState<ExtractorTab>("snip-image");

  // TAB 1: Snip Image State
  const [pastedImage, setPastedImage] = useState<string | null>(null);
  const [imageCaption, setImageCaption] = useState<string>("Architecture Diagram");
  const [imageAlt, setImageAlt] = useState<string>("Diagram extracted from lecture notes");
  const [imageAlign, setImageAlign] = useState<"center" | "left" | "right">("center");
  const [imageWidthPercent, setImageWidthPercent] = useState<number>(85);
  const [copiedNotification, setCopiedNotification] = useState(false);

  // TAB 2: PDF Table State
  const [rawTableText, setRawTableText] = useState<string>(
    "Feature\tC Language\tPython\nParadigm\tProcedural / Structured\tObject-Oriented & Scripting\nTyping\tStatically Typed\tDynamically Typed\nSpeed\tUltra Fast (Compiled to Machine Code)\tInterpreted / Bytecode\nMemory\tManual (Pointers, malloc/free)\tAutomatic Garbage Collection"
  );
  const [delimiterMode, setDelimiterMode] = useState<"auto" | "tab" | "multispace" | "comma" | "pipe">("auto");
  const [hasHeaderRow, setHasHeaderRow] = useState<boolean>(true);
  const [tableStyle, setTableStyle] = useState<"academic" | "striped" | "bordered" | "clean">("academic");
  const [parsedRows, setParsedRows] = useState<string[][]>([]);
  const [tableCaption, setTableCaption] = useState<string>("Language Comparison Table");

  // TAB 3: PDF Document Browser State
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfDoc, setPdfDoc] = useState<any>(null);
  const [currentPageNum, setCurrentPageNum] = useState<number>(1);
  const [numPages, setNumPages] = useState<number>(0);
  const [pdfScale, setPdfScale] = useState<number>(1.2);
  const [isPdfLoading, setIsPdfLoading] = useState<boolean>(false);
  const [pdfError, setPdfError] = useState<string | null>(null);
  const [extractedPageText, setExtractedPageText] = useState<string>("");

  // Bounding box cropping for PDF Canvas
  const [isSnippingMode, setIsSnippingMode] = useState<boolean>(false);
  const [cropStart, setCropStart] = useState<{ x: number; y: number } | null>(null);
  const [cropBox, setCropBox] = useState<{ x: number; y: number; width: number; height: number } | null>(null);
  const [isMouseDown, setIsMouseDown] = useState<boolean>(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pdfContainerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageDropZoneRef = useRef<HTMLDivElement>(null);

  // Parse Raw Table Text into grid
  useEffect(() => {
    if (!rawTableText.trim()) {
      setParsedRows([]);
      return;
    }

    const lines = rawTableText.trim().split(/\r?\n/).filter((l) => l.trim().length > 0);
    const rows: string[][] = [];

    lines.forEach((line) => {
      let cells: string[] = [];
      if (delimiterMode === "tab") {
        cells = line.split("\t");
      } else if (delimiterMode === "comma") {
        cells = line.split(",");
      } else if (delimiterMode === "pipe") {
        cells = line.split("|").map((c) => c.trim()).filter((c, i, arr) => i !== 0 || c !== "" || arr.length === 1);
      } else if (delimiterMode === "multispace") {
        cells = line.split(/\s{2,}/);
      } else {
        // Auto-detect
        if (line.includes("\t")) {
          cells = line.split("\t");
        } else if (line.includes("|")) {
          cells = line.split("|").map((c) => c.trim()).filter((c) => c !== "");
        } else if (line.includes(",") && line.split(",").length > 1) {
          cells = line.split(",");
        } else if (/\s{2,}/.test(line)) {
          cells = line.split(/\s{2,}/);
        } else {
          cells = [line];
        }
      }

      rows.push(cells.map((c) => c.trim()));
    });

    // Normalize column count
    const maxCols = Math.max(...rows.map((r) => r.length), 1);
    const normalized = rows.map((r) => {
      const copy = [...r];
      while (copy.length < maxCols) copy.push("");
      return copy;
    });

    setParsedRows(normalized);
  }, [rawTableText, delimiterMode]);

  // Global Paste Listener for Snip Image
  useEffect(() => {
    if (!isOpen) return;

    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf("image") !== -1) {
          e.preventDefault();
          const file = items[i].getAsFile();
          if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
              const dataUrl = event.target?.result as string;
              setPastedImage(dataUrl);
              setActiveTab("snip-image");
              if (!imageCaption || imageCaption === "Architecture Diagram") {
                setImageCaption(`Figure ${new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} Diagram`);
              }
            };
            reader.readAsDataURL(file);
          }
          break;
        }
      }
    };

    window.addEventListener("paste", handlePaste);
    return () => window.removeEventListener("paste", handlePaste);
  }, [isOpen, imageCaption]);

  // Render PDF Page when page or scale changes
  useEffect(() => {
    if (!pdfDoc || !canvasRef.current) return;

    let isMounted = true;
    const renderPage = async () => {
      try {
        setIsPdfLoading(true);
        const page = await pdfDoc.getPage(currentPageNum);
        const viewport = page.getViewport({ scale: pdfScale });
        const canvas = canvasRef.current;
        if (!canvas) return;

        const context = canvas.getContext("2d");
        if (!context) return;

        canvas.height = viewport.height;
        canvas.width = viewport.width;

        const renderContext = {
          canvasContext: context,
          viewport: viewport
        };

        await page.render(renderContext).promise;

        // Also extract text content
        const textContent = await page.getTextContent();
        const textItems = textContent.items.map((item: any) => item.str).join(" ");
        if (isMounted) {
          setExtractedPageText(textItems);
          setIsPdfLoading(false);
        }
      } catch (err: any) {
        if (isMounted) {
          console.error("Error rendering PDF page:", err);
          setPdfError(err?.message || "Failed to render PDF page");
          setIsPdfLoading(false);
        }
      }
    };

    renderPage();
    return () => {
      isMounted = false;
    };
  }, [pdfDoc, currentPageNum, pdfScale]);

  // Handle PDF File Upload
  const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== "application/pdf" && !file.name.endsWith(".pdf")) {
      setPdfError("Please select a valid .pdf file.");
      return;
    }

    setPdfFile(file);
    setPdfError(null);
    setIsPdfLoading(true);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
      const loadedPdf = await loadingTask.promise;
      setPdfDoc(loadedPdf);
      setNumPages(loadedPdf.numPages);
      setCurrentPageNum(1);
      setActiveTab("pdf-document");
    } catch (err: any) {
      console.error("Error loading PDF:", err);
      setPdfError(err?.message || "Unable to parse this PDF file.");
    } finally {
      setIsPdfLoading(false);
    }
  };

  // Image Snip from PDF Canvas Mouse Handlers
  const handleCanvasMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isSnippingMode) return;
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setCropStart({ x, y });
    setCropBox({ x, y, width: 0, height: 0 });
    setIsMouseDown(true);
  };

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isSnippingMode || !isMouseDown || !cropStart) return;
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const currentX = e.clientX - rect.left;
    const currentY = e.clientY - rect.top;

    const x = Math.min(cropStart.x, currentX);
    const y = Math.min(cropStart.y, currentY);
    const width = Math.abs(currentX - cropStart.x);
    const height = Math.abs(currentY - cropStart.y);

    setCropBox({ x, y, width, height });
  };

  const handleCanvasMouseUp = () => {
    if (!isSnippingMode || !isMouseDown || !cropBox || !canvasRef.current) {
      setIsMouseDown(false);
      return;
    }

    setIsMouseDown(false);

    if (cropBox.width > 20 && cropBox.height > 20) {
      // Capture the selected region from the canvas
      const canvas = canvasRef.current;
      const cropCanvas = document.createElement("canvas");
      cropCanvas.width = cropBox.width;
      cropCanvas.height = cropBox.height;
      const ctx = cropCanvas.getContext("2d");

      if (ctx) {
        ctx.drawImage(
          canvas,
          cropBox.x,
          cropBox.y,
          cropBox.width,
          cropBox.height,
          0,
          0,
          cropBox.width,
          cropBox.height
        );
        const dataUrl = cropCanvas.toDataURL("image/png");
        setPastedImage(dataUrl);
        setImageCaption(`Diagram from PDF Page ${currentPageNum}`);
        setActiveTab("snip-image");
        setIsSnippingMode(false);
        setCropBox(null);
      }
    }
  };

  // Convert Parsed Rows to Markdown Table
  const generateMarkdownTable = (): string => {
    if (parsedRows.length === 0) return "";

    const colCount = parsedRows[0].length;
    let md = "";

    if (tableCaption) {
      md += `### ${tableCaption}\n\n`;
    }

    const header = hasHeaderRow ? parsedRows[0] : Array(colCount).fill("Header").map((h, i) => `Column ${i + 1}`);
    const bodyRows = hasHeaderRow ? parsedRows.slice(1) : parsedRows;

    // Header row
    md += `| ${header.map((c) => c || "-").join(" | ")} |\n`;
    // Separator row
    md += `| ${header.map(() => "---").join(" | ")} |\n`;

    // Data rows
    bodyRows.forEach((row) => {
      md += `| ${row.map((c) => c || "-").join(" | ")} |\n`;
    });

    return md + "\n";
  };

  // Convert Parsed Rows to HTML Academic Table (for rich styled tables)
  const generateHtmlTable = (): string => {
    if (parsedRows.length === 0) return "";

    const header = hasHeaderRow ? parsedRows[0] : null;
    const bodyRows = hasHeaderRow ? parsedRows.slice(1) : parsedRows;

    let html = `<div class="academic-table-container my-6 overflow-x-auto">\n`;
    if (tableCaption) {
      html += `  <div class="font-bold text-slate-800 text-sm mb-2 uppercase tracking-wide">Table: ${tableCaption}</div>\n`;
    }
    html += `  <table class="w-full border-collapse border border-slate-300 text-sm text-left">\n`;

    if (header) {
      html += `    <thead class="bg-slate-100 border-b-2 border-slate-400 font-bold text-slate-900">\n      <tr>\n`;
      header.forEach((h) => {
        html += `        <th class="p-3 border border-slate-300">${h}</th>\n`;
      });
      html += `      </tr>\n    </thead>\n`;
    }

    html += `    <tbody>\n`;
    bodyRows.forEach((row, idx) => {
      const bg = idx % 2 === 1 && tableStyle === "striped" ? "bg-slate-50" : "bg-white";
      html += `      <tr class="${bg} border-b border-slate-200 hover:bg-blue-50/50 transition-colors">\n`;
      row.forEach((cell) => {
        html += `        <td class="p-3 border border-slate-300 text-slate-700">${cell}</td>\n`;
      });
      html += `      </tr>\n`;
    });
    html += `    </tbody>\n  </table>\n</div>\n`;

    return html;
  };

  // INSERT ACTIONS
  const handleInsertImage = async () => {
    if (!pastedImage) return;
    let finalImageUrl = pastedImage;
    try {
      const res = await uploadLessonImage(pastedImage, {
        alt: imageAlt || imageCaption || "Lecture Diagram",
        caption: imageCaption || "Captured diagram"
      });
      finalImageUrl = res.url;
    } catch (e) {
      console.warn("Using image data url fallback:", e);
    }
    const captionText = imageCaption ? `\n*Figure: ${imageCaption}*` : "";
    const markdown = `\n<div align="${imageAlign}" style="margin: 20px 0;">\n  <img src="${finalImageUrl}" alt="${imageAlt || imageCaption || "Figure"}" style="max-width: ${imageWidthPercent}%; border-radius: 8px; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);" />\n</div>\n${captionText}\n\n`;
    onInsertContent(markdown);
    onClose();
  };

  const handleInsertTable = () => {
    const markdownTable = generateMarkdownTable();
    if (!markdownTable) return;
    onInsertContent(markdownTable);
    onClose();
  };

  const handleInsertExtractedText = () => {
    if (!extractedPageText.trim()) return;
    onInsertContent(`\n\n> **Extracted Notes (PDF Page ${currentPageNum}):**\n\n${extractedPageText}\n\n`);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-5xl max-h-[92vh] flex flex-col overflow-hidden">
        {/* MODAL HEADER */}
        <div className="px-6 py-4 border-b border-slate-200 bg-gradient-to-r from-slate-900 to-slate-800 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/30">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-extrabold text-white flex items-center gap-2">
                <span>PDF & Snipping Tool for Course Content</span>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-blue-500/30 text-blue-300 border border-blue-400/30 px-2 py-0.5 rounded-full">
                  Instant Paste & Extract
                </span>
              </h2>
              <p className="text-xs text-slate-300">
                Easily copy figures, diagrams, tables, and notes from textbook PDFs and paste them directly into your chapters.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-2 rounded-lg hover:bg-slate-700/50 transition-colors cursor-pointer"
            title="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* TOOL NAVIGATION TABS */}
        <div className="flex items-center gap-2 px-6 pt-3 border-b border-slate-200 bg-slate-50 shrink-0">
          <button
            onClick={() => setActiveTab("snip-image")}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all cursor-pointer ${
              activeTab === "snip-image"
                ? "border-blue-600 text-blue-600 bg-white rounded-t-lg shadow-xs"
                : "border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-t-lg"
            }`}
          >
            <ImageIcon className="w-4 h-4 text-blue-600" />
            <span>1. Snip & Paste Image / Diagram</span>
            {pastedImage && (
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            )}
          </button>

          <button
            onClick={() => setActiveTab("pdf-table")}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all cursor-pointer ${
              activeTab === "pdf-table"
                ? "border-blue-600 text-blue-600 bg-white rounded-t-lg shadow-xs"
                : "border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-t-lg"
            }`}
          >
            <TableIcon className="w-4 h-4 text-emerald-600" />
            <span>2. PDF Table Converter & Paste</span>
            {parsedRows.length > 0 && (
              <span className="text-[10px] bg-emerald-100 text-emerald-700 px-1.5 py-0.2 rounded font-bold">
                {parsedRows.length} rows
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab("pdf-document")}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all cursor-pointer ${
              activeTab === "pdf-document"
                ? "border-blue-600 text-blue-600 bg-white rounded-t-lg shadow-xs"
                : "border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-t-lg"
            }`}
          >
            <FileText className="w-4 h-4 text-purple-600" />
            <span>3. Upload & Browse PDF File</span>
            {pdfDoc && (
              <span className="text-[10px] bg-purple-100 text-purple-700 px-1.5 py-0.2 rounded font-bold">
                Page {currentPageNum}/{numPages}
              </span>
            )}
          </button>
        </div>

        {/* MODAL BODY */}
        <div className="flex-1 p-6 overflow-y-auto min-h-0 bg-slate-50/50">
          {/* TAB 1: SNIP & PASTE IMAGE */}
          {activeTab === "snip-image" && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3 text-xs text-blue-800">
                <Scissors className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <div className="font-bold text-sm text-blue-900">
                    How to snip & copy from any PDF reader:
                  </div>
                  <p>
                    1. Open your textbook/notes PDF and use the Windows Snipping Tool (
                    <kbd className="px-1.5 py-0.5 bg-white border border-blue-300 rounded font-mono text-[11px]">Win + Shift + S</kbd>
                    ) or Mac screenshot (
                    <kbd className="px-1.5 py-0.5 bg-white border border-blue-300 rounded font-mono text-[11px]">Cmd + Shift + 4</kbd>
                    ) to copy any diagram, circuit, flowchart, or graph.
                  </p>
                  <p>
                    2. Come right here and press{" "}
                    <kbd className="px-1.5 py-0.5 bg-white border border-blue-300 rounded font-mono text-[11px] font-bold">Ctrl + V</kbd>{" "}
                    to paste instantly!
                  </p>
                </div>
              </div>

              {pastedImage ? (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                  {/* Image Preview Box */}
                  <div className="lg:col-span-7 flex flex-col items-center justify-center p-4 bg-slate-100 rounded-xl border border-slate-200 min-h-[320px]">
                    <div className="relative group max-h-[400px] overflow-hidden rounded-lg shadow-md border border-slate-300">
                      <img
                        src={pastedImage}
                        alt="Snipped Diagram"
                        className="max-h-[380px] w-auto object-contain mx-auto"
                      />
                      <button
                        onClick={() => setPastedImage(null)}
                        className="absolute top-2 right-2 p-1.5 bg-rose-600 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity shadow-lg hover:bg-rose-700 cursor-pointer"
                        title="Remove Image"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="text-[11px] text-slate-500 mt-2">
                      Image captured from clipboard • Ready to insert
                    </div>
                  </div>

                  {/* Figure Attributes */}
                  <div className="lg:col-span-5 space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                        Figure Caption / Title
                      </label>
                      <input
                        type="text"
                        value={imageCaption}
                        onChange={(e) => setImageCaption(e.target.value)}
                        placeholder="e.g. Figure 1.2: C Compilation Workflow Diagram"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 text-xs font-medium bg-white"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                        Accessibility Alt Text
                      </label>
                      <input
                        type="text"
                        value={imageAlt}
                        onChange={(e) => setImageAlt(e.target.value)}
                        placeholder="Brief visual description"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 text-xs font-medium bg-white"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                          Alignment
                        </label>
                        <select
                          value={imageAlign}
                          onChange={(e) => setImageAlign(e.target.value as any)}
                          className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium bg-white"
                        >
                          <option value="center">Center (Recommended)</option>
                          <option value="left">Left Aligned</option>
                          <option value="right">Right Aligned</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                          Display Width: {imageWidthPercent}%
                        </label>
                        <input
                          type="range"
                          min="30"
                          max="100"
                          step="5"
                          value={imageWidthPercent}
                          onChange={(e) => setImageWidthPercent(Number(e.target.value))}
                          className="w-full accent-blue-600 mt-2"
                        />
                      </div>
                    </div>

                    <div className="pt-4 border-t border-slate-200 flex flex-col gap-2">
                      <button
                        onClick={handleInsertImage}
                        className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-blue-600/30 transition-all cursor-pointer"
                      >
                        <Check className="w-4 h-4" />
                        Insert Diagram Figure into Chapter
                      </button>

                      <button
                        onClick={() => setPastedImage(null)}
                        className="w-full py-2 rounded-xl text-slate-600 hover:text-slate-900 text-xs font-medium hover:bg-slate-100 transition-colors cursor-pointer"
                      >
                        Clear & Snip Another
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                /* Paste Dropzone */
                <div
                  ref={imageDropZoneRef}
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-slate-300 hover:border-blue-500 bg-white hover:bg-blue-50/40 rounded-2xl p-12 text-center transition-all cursor-pointer flex flex-col items-center justify-center space-y-4"
                >
                  <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shadow-sm">
                    <ImageIcon className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-800">
                      Press <kbd className="px-2 py-1 bg-slate-100 border border-slate-300 rounded font-mono text-xs">Ctrl + V</kbd> to Paste Snipped Diagram
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">
                      or click to upload an image from your computer (PNG, JPG, WebP)
                    </p>
                  </div>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = (ev) => {
                          setPastedImage(ev.target?.result as string);
                          setImageCaption(file.name.replace(/\.[^/.]+$/, ""));
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                  />
                </div>
              )}
            </div>
          )}

          {/* TAB 2: PDF TABLE CONVERTER */}
          {activeTab === "pdf-table" && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-start gap-3 text-xs text-emerald-900">
                <TableIcon className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <div className="font-bold text-sm text-emerald-950">
                    How to copy & paste tables from PDF:
                  </div>
                  <p>
                    1. Highlight any table inside your PDF reader (Adobe Reader, Chrome, Edge, etc.) and press{" "}
                    <kbd className="px-1.5 py-0.5 bg-white border border-emerald-300 rounded font-mono text-[11px]">Ctrl + C</kbd>.
                  </p>
                  <p>
                    2. Paste the copied text below. Our parser automatically separates rows and columns into a clean academic table!
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Left: Input Textarea */}
                <div className="lg:col-span-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-emerald-600" />
                      Paste Copied Table Text Here
                    </label>
                    <button
                      onClick={() => setRawTableText("")}
                      className="text-[11px] text-rose-600 hover:underline cursor-pointer"
                    >
                      Clear
                    </button>
                  </div>

                  <textarea
                    rows={9}
                    value={rawTableText}
                    onChange={(e) => setRawTableText(e.target.value)}
                    placeholder="Paste table columns from PDF here..."
                    className="w-full p-3.5 rounded-xl border border-slate-300 font-mono text-xs text-slate-800 leading-relaxed bg-white focus:ring-2 focus:ring-emerald-500"
                  />

                  <div className="space-y-3 bg-white p-4 rounded-xl border border-slate-200">
                    <div className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Parsing & Column Detection
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[11px] text-slate-500 font-semibold block mb-1">
                          Delimiter Mode
                        </label>
                        <select
                          value={delimiterMode}
                          onChange={(e) => setDelimiterMode(e.target.value as any)}
                          className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs bg-white"
                        >
                          <option value="auto">Auto-Detect (Smart)</option>
                          <option value="tab">Tab Separated (\t)</option>
                          <option value="multispace">Multiple Spaces</option>
                          <option value="comma">Comma Separated (CSV)</option>
                          <option value="pipe">Pipe Separated (|)</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-[11px] text-slate-500 font-semibold block mb-1">
                          Header Row
                        </label>
                        <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer pt-1">
                          <input
                            type="checkbox"
                            checked={hasHeaderRow}
                            onChange={(e) => setHasHeaderRow(e.target.checked)}
                            className="rounded text-emerald-600 accent-emerald-600"
                          />
                          <span>First row is header</span>
                        </label>
                      </div>
                    </div>

                    <div>
                      <label className="text-[11px] text-slate-500 font-semibold block mb-1">
                        Table Caption / Title
                      </label>
                      <input
                        type="text"
                        value={tableCaption}
                        onChange={(e) => setTableCaption(e.target.value)}
                        placeholder="e.g. C Data Types & Memory Size Table"
                        className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs bg-white"
                      />
                    </div>
                  </div>
                </div>

                {/* Right: Live Table Preview */}
                <div className="lg:col-span-7 flex flex-col space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                      <Eye className="w-3.5 h-3.5 text-blue-600" />
                      Live Formatted Table Preview ({parsedRows.length} Rows, {parsedRows[0]?.length || 0} Columns)
                    </div>
                  </div>

                  <div className="flex-1 bg-white border border-slate-200 rounded-xl p-4 overflow-x-auto shadow-xs min-h-[260px] max-h-[360px]">
                    {parsedRows.length > 0 ? (
                      <table className="w-full border-collapse border border-slate-200 text-xs">
                        {hasHeaderRow && parsedRows.length > 0 && (
                          <thead className="bg-slate-100 font-bold text-slate-900 border-b-2 border-slate-300">
                            <tr>
                              {parsedRows[0].map((cell, idx) => (
                                <th key={idx} className="p-2.5 border border-slate-200 text-left font-bold">
                                  {cell || `Col ${idx + 1}`}
                                </th>
                              ))}
                            </tr>
                          </thead>
                        )}
                        <tbody>
                          {(hasHeaderRow ? parsedRows.slice(1) : parsedRows).map((row, rIdx) => (
                            <tr
                              key={rIdx}
                              className={`border-b border-slate-200 ${rIdx % 2 === 1 ? "bg-slate-50" : "bg-white"} hover:bg-emerald-50/40`}
                            >
                              {row.map((cell, cIdx) => (
                                <td key={cIdx} className="p-2.5 border border-slate-200 text-slate-700 font-medium">
                                  {cell || "-"}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    ) : (
                      <div className="h-full flex items-center justify-center text-xs text-slate-400">
                        Paste table text on the left to generate preview
                      </div>
                    )}
                  </div>

                  <div className="pt-2 flex items-center justify-between gap-3">
                    <button
                      onClick={handleInsertTable}
                      disabled={parsedRows.length === 0}
                      className="flex-1 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-emerald-600/30 transition-all cursor-pointer"
                    >
                      <Check className="w-4 h-4" />
                      Insert Formatted Table into Chapter
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: PDF DOCUMENT VIEWER & EXTRACTOR */}
          {activeTab === "pdf-document" && (
            <div className="space-y-6 animate-in fade-in duration-200">
              {!pdfDoc ? (
                <div className="border-2 border-dashed border-slate-300 hover:border-purple-500 bg-white hover:bg-purple-50/40 rounded-2xl p-12 text-center transition-all cursor-pointer flex flex-col items-center justify-center space-y-4">
                  <div className="w-16 h-16 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center shadow-sm">
                    <FileText className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-800">
                      Upload PDF Document (Course Textbook / Lecture Notes)
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">
                      Render pages directly in browser to crop diagram figures or extract text & tables
                    </p>
                  </div>
                  <label className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl cursor-pointer shadow-md shadow-purple-600/20">
                    Browse PDF File
                    <input
                      type="file"
                      accept=".pdf,application/pdf"
                      onChange={handlePdfUpload}
                      className="hidden"
                    />
                  </label>
                  {isPdfLoading && (
                    <div className="text-xs text-purple-600 font-semibold animate-pulse flex items-center gap-1.5">
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Loading PDF pages...
                    </div>
                  )}
                  {pdfError && (
                    <div className="text-xs text-rose-600 font-semibold flex items-center gap-1.5">
                      <AlertCircle className="w-3.5 h-3.5" /> {pdfError}
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  {/* PDF Viewer Controls Header */}
                  <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setCurrentPageNum((p) => Math.max(1, p - 1))}
                        disabled={currentPageNum <= 1}
                        className="p-1.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-100 disabled:opacity-40 cursor-pointer"
                        title="Previous Page"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>

                      <span className="text-xs font-bold text-slate-800">
                        Page {currentPageNum} of {numPages}
                      </span>

                      <button
                        onClick={() => setCurrentPageNum((p) => Math.min(numPages, p + 1))}
                        disabled={currentPageNum >= numPages}
                        className="p-1.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-100 disabled:opacity-40 cursor-pointer"
                        title="Next Page"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>

                      <div className="h-4 w-px bg-slate-200 mx-1" />

                      <button
                        onClick={() => setPdfScale((s) => Math.max(0.8, s - 0.2))}
                        className="p-1.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-100 cursor-pointer"
                        title="Zoom Out"
                      >
                        <ZoomOut className="w-4 h-4" />
                      </button>

                      <span className="text-xs text-slate-500 font-medium">
                        {Math.round(pdfScale * 100)}%
                      </span>

                      <button
                        onClick={() => setPdfScale((s) => Math.min(2.0, s + 0.2))}
                        className="p-1.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-100 cursor-pointer"
                        title="Zoom In"
                      >
                        <ZoomIn className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setIsSnippingMode(!isSnippingMode)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                          isSnippingMode
                            ? "bg-amber-500 text-white shadow-md"
                            : "bg-purple-50 text-purple-700 border border-purple-200 hover:bg-purple-100"
                        }`}
                      >
                        <Scissors className="w-3.5 h-3.5" />
                        {isSnippingMode ? "Snipping Active (Drag on Canvas)" : "Snip Diagram on Page"}
                      </button>

                      <button
                        onClick={handleInsertExtractedText}
                        disabled={!extractedPageText.trim()}
                        className="px-3 py-1.5 rounded-lg text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-1.5 shadow-xs cursor-pointer"
                      >
                        <Copy className="w-3.5 h-3.5" />
                        Insert Page Text
                      </button>

                      <button
                        onClick={() => {
                          setPdfDoc(null);
                          setPdfFile(null);
                        }}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-slate-100 cursor-pointer"
                        title="Close PDF"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Canvas Container */}
                  <div
                    ref={pdfContainerRef}
                    className="relative bg-slate-200/80 p-4 rounded-xl border border-slate-300 overflow-auto flex items-center justify-center min-h-[480px] max-h-[560px]"
                  >
                    <div className="relative shadow-xl rounded-sm bg-white">
                      <canvas
                        ref={canvasRef}
                        onMouseDown={handleCanvasMouseDown}
                        onMouseMove={handleCanvasMouseMove}
                        onMouseUp={handleCanvasMouseUp}
                        className={`block select-none ${isSnippingMode ? "cursor-crosshair" : "cursor-default"}`}
                      />

                      {/* Snipping selection box overlay */}
                      {cropBox && isMouseDown && (
                        <div
                          className="absolute border-2 border-amber-500 bg-amber-500/20 pointer-events-none z-10"
                          style={{
                            left: `${cropBox.x}px`,
                            top: `${cropBox.y}px`,
                            width: `${cropBox.width}px`,
                            height: `${cropBox.height}px`
                          }}
                        />
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* MODAL FOOTER */}
        <div className="px-6 py-3.5 border-t border-slate-200 bg-white flex items-center justify-between shrink-0">
          <div className="text-xs text-slate-500 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-blue-600" />
            <span>Figures and tables are formatted automatically for responsive web and mobile viewing.</span>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-slate-700 hover:bg-slate-100 font-semibold text-xs transition-colors cursor-pointer"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
