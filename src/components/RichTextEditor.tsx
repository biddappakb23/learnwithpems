import React, { useState, useRef, useEffect } from "react";
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  ListChecks,
  Quote,
  Code,
  Link,
  Image as ImageIcon,
  Table as TableIcon,
  Eye,
  Edit3,
  Check,
  X,
  Type,
  UploadCloud,
  Sigma,
  Sparkles,
  Maximize2,
  Minimize2,
  Columns,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Subscript,
  Superscript,
  Highlighter,
  Palette,
  Undo,
  Redo,
  RemoveFormatting,
  Sparkle,
  ClipboardPaste,
  FileSpreadsheet,
  Layers,
  ArrowRight,
  Sliders,
  HelpCircle,
  Camera,
  Copy,
  Loader2
} from "lucide-react";
import { RichContentViewer } from "./RichContentViewer";
import {
  applyHeadingToText,
  applyBulletListToText,
  applyNumberedListToText,
  applyChecklistToText,
  applyBlockquoteToText,
  applyIndentToText,
  insertLineBreakToText
} from "../utils/editorFormatting";

import { MediaLibraryModal } from "./MediaLibraryModal";
import {
  convertHtmlTableToMarkdown,
  convertTsvOrCsvToMarkdown,
  cleanAndFormatPdfTheoryText
} from "../utils/smartPasteConverter";
import {
  C_DIAGRAM_PRESETS,
  C_TABLE_PRESETS,
  DiagramPreset,
  TablePreset
} from "../data/cArchitectureDiagrams";
import { uploadLessonImage, getNormalizedImageUrl } from "../services/imageStorage";

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minHeight?: string;
  label?: string;
  onOpenFullDocEditor?: () => void;
}

export const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  onChange,
  placeholder = "Write comprehensive educational content, theory, insert images, tables, formulas, and formatted notes...",
  minHeight = "280px",
  label,
  onOpenFullDocEditor
}) => {
  const [activeTab, setActiveTab] = useState<"edit" | "preview" | "split">("edit");
  const [ribbonTab, setRibbonTab] = useState<"home" | "insert" | "academic" | "view">("home");
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Undo / Redo state
  const [historyStack, setHistoryStack] = useState<string[]>([value || ""]);
  const [historyIndex, setHistoryIndex] = useState<number>(0);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Modals
  const [linkModalOpen, setLinkModalOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const [linkText, setLinkText] = useState("");

  // Image Modal
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [imageTab, setImageTab] = useState<"upload" | "url" | "clipboard" | "diagrams">("upload");
  const [imageUrl, setImageUrl] = useState("");
  const [imageAlt, setImageAlt] = useState("");
  const [imageCaption, setImageCaption] = useState("");
  const [imageUploadError, setImageUploadError] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  // Table Modal
  const [tableModalOpen, setTableModalOpen] = useState(false);
  const [tableTab, setTableTab] = useState<"grid" | "custom" | "presets">("grid");
  const [tableRows, setTableRows] = useState(3);
  const [tableCols, setTableCols] = useState(3);
  const [hoverGridRow, setHoverGridRow] = useState(3);
  const [hoverGridCol, setHoverGridCol] = useState(3);
  const [columnAlignments, setColumnAlignments] = useState<("left" | "center" | "right")[]>([
    "left",
    "left",
    "left"
  ]);
  const [customHeaderNames, setCustomHeaderNames] = useState<string[]>([
    "Column 1",
    "Column 2",
    "Column 3"
  ]);

  // Smart Paste Assistant Modal
  const [smartPasteModalOpen, setSmartPasteModalOpen] = useState(false);
  const [pasteRawText, setPasteRawText] = useState("");
  const [pasteMode, setPasteMode] = useState<"auto" | "table" | "theory" | "code">("auto");
  const [pastePreview, setPastePreview] = useState("");

  // Code, Math & Callout Modals
  const [codeModalOpen, setCodeModalOpen] = useState(false);
  const [codeLang, setCodeLang] = useState("c");
  const [codeContent, setCodeContent] = useState(
    `// C Code Example\n#include <stdio.h>\n\nint main() {\n    printf("Hello LearnWithPems!\\n");\n    return 0;\n}`
  );

  const [mathModalOpen, setMathModalOpen] = useState(false);
  const [mathFormula, setMathFormula] = useState("x^2 + y^2 = z^2");

  const [calloutModalOpen, setCalloutModalOpen] = useState(false);
  const [calloutType, setCalloutType] = useState("NOTE");
  const [calloutText, setCalloutText] = useState("");

  const [symbolsModalOpen, setSymbolsModalOpen] = useState(false);

  // Notification Toast for clipboard actions
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Font styling state
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showHighlightPicker, setShowHighlightPicker] = useState(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleContentUpdate = (newVal: string) => {
    onChange(newVal);
    const newStack = historyStack.slice(0, historyIndex + 1);
    newStack.push(newVal);
    if (newStack.length > 50) newStack.shift();
    setHistoryStack(newStack);
    setHistoryIndex(newStack.length - 1);
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      const prev = historyIndex - 1;
      setHistoryIndex(prev);
      onChange(historyStack[prev]);
    }
  };

  const handleRedo = () => {
    if (historyIndex < historyStack.length - 1) {
      const next = historyIndex + 1;
      setHistoryIndex(next);
      onChange(historyStack[next]);
    }
  };

  const insertFormatting = (prefix: string, suffix = "", defaultText = "") => {
    const textarea = textareaRef.current;
    if (!textarea) {
      handleContentUpdate(value + prefix + defaultText + suffix);
      return;
    }

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = value.substring(start, end) || defaultText;
    const replacement = `${prefix}${selected}${suffix}`;
    const newValue = value.substring(0, start) + replacement + value.substring(end);

    handleContentUpdate(newValue);

    setTimeout(() => {
      textarea.focus();
      const newCursorPos = start + prefix.length + selected.length;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 10);
  };

  const insertLinePrefix = (prefix: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;

    const prevNewline = value.lastIndexOf("\n", start - 1);
    const lineStart = prevNewline === -1 ? 0 : prevNewline + 1;

    const newValue = value.substring(0, lineStart) + prefix + value.substring(lineStart);
    handleContentUpdate(newValue);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + prefix.length, end + prefix.length);
    }, 10);
  };

  const handleApplyHeading = (level: 1 | 2 | 3 | 4 | 0) => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const res = applyHeadingToText(value, start, end, level);
    handleContentUpdate(res.newText);
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(res.newStart, res.newEnd);
    }, 10);
  };

  const handleApplyBulletList = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const res = applyBulletListToText(value, start, end);
    handleContentUpdate(res.newText);
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(res.newStart, res.newEnd);
    }, 10);
  };

  const handleApplyNumberedList = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const res = applyNumberedListToText(value, start, end);
    handleContentUpdate(res.newText);
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(res.newStart, res.newEnd);
    }, 10);
  };

  const handleApplyChecklist = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const res = applyChecklistToText(value, start, end);
    handleContentUpdate(res.newText);
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(res.newStart, res.newEnd);
    }, 10);
  };

  const handleApplyBlockquote = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const res = applyBlockquoteToText(value, start, end);
    handleContentUpdate(res.newText);
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(res.newStart, res.newEnd);
    }, 10);
  };

  const handleInsertLineBreak = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const res = insertLineBreakToText(value, start, end);
    handleContentUpdate(res.newText);
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(res.newStart, res.newEnd);
    }, 10);
  };


  const clearFormattingFromSelection = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = value.substring(start, end);
    if (!selected) return;

    const cleaned = selected.replace(/[*_~`#>\-+]/g, "").replace(/<[^>]*>/g, "");

    const newValue = value.substring(0, start) + cleaned + value.substring(end);
    handleContentUpdate(newValue);
  };

  // =========================================================
  // SMART ONPASTE INTERCEPTOR (AUTO TABLE & IMAGE DETECTION)
  // =========================================================
  const handleSmartPaste = async (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const clipboard = e.clipboardData;
    if (!clipboard) return;

    // 1. Check if clipboard has image files/data
    const items = clipboard.items;
    if (items && items.length > 0) {
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf("image") !== -1) {
          e.preventDefault();
          const file = items[i].getAsFile();
          if (file) {
            showToast("⏳ Uploading and embedding image permanently...");
            try {
              const res = await uploadLessonImage(file, {
                alt: "Captured Lecture Diagram",
                caption: "Captured lecture diagram"
              });
              const imageMd = `\n![${res.alt}](${res.url})\n*Figure: ${res.alt}*\n\n`;
              insertFormatting(imageMd, "", "");
              showToast("📷 Image uploaded & embedded permanently!");
            } catch (err) {
              console.error("Clipboard image upload error:", err);
              showToast("⚠️ Image upload failed, please retry.");
            }
          }
          return;
        }
      }
    }

    // 2. Check for HTML Table (copied from Word / Excel / Google Docs / Web)
    const htmlData = clipboard.getData("text/html");
    if (htmlData && htmlData.includes("<table")) {
      const tableMd = convertHtmlTableToMarkdown(htmlData);
      if (tableMd) {
        e.preventDefault();
        insertFormatting(tableMd, "", "");
        showToast("📊 Formatted table from Word/Excel converted to Markdown!");
        return;
      }
    }

    // 3. Check for TSV (copied from Excel or PDF columns)
    const plainText = clipboard.getData("text/plain");
    if (plainText) {
      const tsvTable = convertTsvOrCsvToMarkdown(plainText);
      if (tsvTable) {
        e.preventDefault();
        insertFormatting(tsvTable, "", "");
        showToast("📊 Tabular data auto-converted to Markdown table!");
        return;
      }
    }
  };

  // Keyboard Shortcuts Listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!textareaRef.current || document.activeElement !== textareaRef.current) return;

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "b") {
        e.preventDefault();
        insertFormatting("**", "**", "bold text");
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "i") {
        e.preventDefault();
        insertFormatting("*", "*", "italic text");
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "u") {
        e.preventDefault();
        insertFormatting("<u>", "</u>", "underlined text");
      } else if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === "t") {
        e.preventDefault();
        setTableModalOpen(true);
      } else if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === "i") {
        e.preventDefault();
        setImageModalOpen(true);
      } else if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === "p") {
        e.preventDefault();
        setSmartPasteModalOpen(true);
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "z" && !e.shiftKey) {
        e.preventDefault();
        handleUndo();
      } else if (
        ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "y") ||
        ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === "z")
      ) {
        e.preventDefault();
        handleRedo();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [value, historyIndex, historyStack]);

  // =========================================================
  // TABLE INSERTION LOGIC
  // =========================================================
  const handleInsertGridTable = (rows: number, cols: number) => {
    let tableMd = "\n";
    const headers = Array.from({ length: cols }, (_, i) => `Header ${i + 1}`);
    tableMd += `| ${headers.join(" | ")} |\n`;
    tableMd += `| ${headers.map(() => ":---").join(" | ")} |\n`;
    for (let r = 0; r < rows; r++) {
      const rowCells = Array.from({ length: cols }, (_, c) => `Item ${r + 1}.${c + 1}`);
      tableMd += `| ${rowCells.join(" | ")} |\n`;
    }
    tableMd += "\n";
    insertFormatting(tableMd, "", "");
    setTableModalOpen(false);
    showToast(`📊 Inserted ${rows}x${cols} table!`);
  };

  const handleInsertCustomTable = () => {
    let tableMd = "\n";
    const headers = Array.from({ length: tableCols }, (_, i) => customHeaderNames[i] || `Header ${i + 1}`);
    tableMd += `| ${headers.join(" | ")} |\n`;

    const alignMap = { left: ":---", center: ":---:", right: "---:" };
    const alignRow = Array.from({ length: tableCols }, (_, i) => alignMap[columnAlignments[i] || "left"]);
    tableMd += `| ${alignRow.join(" | ")} |\n`;

    for (let r = 0; r < tableRows; r++) {
      const rowCells = Array.from({ length: tableCols }, (_, c) => `Data ${r + 1}.${c + 1}`);
      tableMd += `| ${rowCells.join(" | ")} |\n`;
    }
    tableMd += "\n";
    insertFormatting(tableMd, "", "");
    setTableModalOpen(false);
    showToast(`📊 Inserted custom ${tableRows}x${tableCols} table!`);
  };

  const handleInsertTablePreset = (preset: TablePreset) => {
    insertFormatting(`\n${preset.markdown.trim()}\n\n`, "", "");
    setTableModalOpen(false);
    showToast(`📊 Inserted table: ${preset.title}!`);
  };

  // =========================================================
  // IMAGE INSERTION LOGIC
  // =========================================================
  const handleInsertImage = () => {
    if (!imageUrl) return;
    const finalUrl = getNormalizedImageUrl(imageUrl, imageAlt);
    const alt = imageAlt || "Figure";
    const caption = imageCaption ? `\n*Figure: ${imageCaption}*` : "";
    insertFormatting(`\n![${alt}](${finalUrl})${caption}\n\n`, "", "");
    setImageUrl("");
    setImageAlt("");
    setImageCaption("");
    setImageModalOpen(false);
    setImageUploadError(null);
    showToast("📷 Image inserted into Theory content!");
  };

  const handleInsertDiagramPreset = (preset: DiagramPreset) => {
    insertFormatting(`\n${preset.markdown.trim()}\n\n`, "", "");
    setImageModalOpen(false);
    showToast(`📐 Inserted diagram: ${preset.title}!`);
  };

  const processFileToUpload = async (file: File) => {
    setImageUploadError(null);
    if (file.size > 15 * 1024 * 1024) {
      setImageUploadError("Image file exceeds 15MB limit.");
      return;
    }

    const validTypes = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/svg+xml"];
    if (!validTypes.includes(file.type)) {
      setImageUploadError("Supported formats: PNG, JPG, WebP, GIF, SVG.");
      return;
    }

    setIsUploadingImage(true);
    try {
      const cleanName = file.name.replace(/\.[^/.]+$/, "");
      const res = await uploadLessonImage(file, {
        alt: imageAlt || cleanName,
        caption: imageCaption || cleanName,
        filename: file.name
      });
      setImageUrl(res.url);
      if (!imageAlt) setImageAlt(cleanName);
      if (!imageCaption) setImageCaption(cleanName);
      showToast("✅ Image uploaded permanently to course storage!");
    } catch (err: any) {
      console.error("Image upload failed:", err);
      setImageUploadError("Failed to upload image. Please try again.");
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleLocalImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFileToUpload(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith("image/")) {
      processFileToUpload(file);
    }
  };

  const handlePasteClipboardImageInModal = async () => {
    try {
      if (!navigator.clipboard?.read) {
        setImageUploadError("Direct clipboard reading is not supported by your browser. Please press Ctrl+V inside the editor.");
        return;
      }
      setIsUploadingImage(true);
      const clipboardItems = await navigator.clipboard.read();
      for (const item of clipboardItems) {
        const imageType = item.types.find((type) => type.startsWith("image/"));
        if (imageType) {
          const blob = await item.getType(imageType);
          const res = await uploadLessonImage(blob, {
            alt: "Pasted Clipboard Diagram",
            caption: "Embedded Lecture Diagram"
          });
          setImageUrl(res.url);
          setImageAlt("Pasted Clipboard Diagram");
          setImageCaption("Embedded Lecture Diagram");
          showToast("✅ Screenshot uploaded permanently!");
          setIsUploadingImage(false);
          return;
        }
      }
      setIsUploadingImage(false);
      setImageUploadError("No image found in clipboard. Copy an image or screenshot first (Win+Shift+S or PrtScn).");
    } catch (err) {
      setIsUploadingImage(false);
      setImageUploadError("Unable to access clipboard. Use Ctrl+V directly in the editor textarea.");
    }
  };

  // =========================================================
  // SMART PASTE ASSISTANT PROCESSING
  // =========================================================
  const updatePastePreview = (text: string, mode: "auto" | "table" | "theory" | "code") => {
    if (!text.trim()) {
      setPastePreview("");
      return;
    }

    if (mode === "table") {
      const table = convertTsvOrCsvToMarkdown(text) || convertHtmlTableToMarkdown(text);
      setPastePreview(table || "Could not automatically detect table structure. Make sure data has tabs or commas.");
    } else if (mode === "theory") {
      setPastePreview(cleanAndFormatPdfTheoryText(text));
    } else if (mode === "code") {
      setPastePreview(`\`\`\`c\n${text}\n\`\`\``);
    } else {
      // Auto mode
      const table = convertTsvOrCsvToMarkdown(text) || convertHtmlTableToMarkdown(text);
      if (table) {
        setPastePreview(table);
      } else {
        setPastePreview(cleanAndFormatPdfTheoryText(text));
      }
    }
  };

  const handleInsertSmartPaste = () => {
    if (!pastePreview) return;
    insertFormatting(`\n${pastePreview.trim()}\n\n`, "", "");
    setPasteRawText("");
    setPastePreview("");
    setSmartPasteModalOpen(false);
    showToast("📋 Processed content inserted into Theory!");
  };

  const wordCount = value.trim() ? value.trim().split(/\s+/).length : 0;
  const charCount = value.length;

  return (
    <div
      className={`border border-slate-700/80 rounded-2xl bg-slate-900 overflow-hidden shadow-xl flex flex-col font-sans transition-all ${
        isFullscreen ? "fixed inset-3 z-60 shadow-2xl" : ""
      }`}
    >
      {/* Toast Notification */}
      {toastMessage && (
        <div className="bg-emerald-600 text-white px-4 py-2 text-xs font-bold flex items-center justify-between animate-in fade-in slide-in-from-top-1 z-50">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4" />
            <span>{toastMessage}</span>
          </div>
          <button onClick={() => setToastMessage(null)} className="text-white/80 hover:text-white">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Header Bar */}
      <div className="px-4 py-2.5 bg-slate-950 border-b border-slate-800 text-xs font-semibold text-slate-300 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Type className="w-3.5 h-3.5 text-blue-400" />
          <span className="font-bold text-slate-200">{label || "MS Office Rich Theory & Document Editor"}</span>
          <span className="text-[10px] bg-cyan-950 text-cyan-400 px-2 py-0.5 rounded border border-cyan-800 hidden sm:inline">
            Images &amp; Tables Ready
          </span>
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          <span className="text-[11px] text-slate-500 font-mono hidden md:inline">
            {wordCount} words &bull; {charCount} chars
          </span>
          <button
            type="button"
            onClick={() => setSmartPasteModalOpen(true)}
            className="px-2.5 py-1 bg-amber-600/20 hover:bg-amber-600 text-amber-300 hover:text-white border border-amber-500/40 rounded-lg text-[11px] font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Paste & Convert PDF/Word/Excel Theory Content"
          >
            <ClipboardPaste className="w-3 h-3" />
            <span className="hidden sm:inline">Smart Paste</span>
          </button>
          {onOpenFullDocEditor && (
            <button
              type="button"
              onClick={onOpenFullDocEditor}
              className="px-2.5 py-1 bg-cyan-600/20 hover:bg-cyan-600 text-cyan-300 hover:text-white border border-cyan-500/40 rounded-lg text-[11px] font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Launch Full MS Word Document Editor"
            >
              <Maximize2 className="w-3 h-3" />
              <span className="hidden sm:inline">Full Document Canvas</span>
            </button>
          )}
          <button
            type="button"
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-1 text-slate-400 hover:text-white rounded transition-colors cursor-pointer"
            title="Toggle Expanded Editor"
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* MS Office Ribbon Tabs */}
      <div className="flex items-center justify-between px-3 pt-1 bg-slate-950/90 border-b border-slate-800 text-xs">
        <div className="flex items-center gap-1">
          {[
            { id: "home", label: "Home" },
            { id: "insert", label: "Insert (Tables & Images)" },
            { id: "academic", label: "Academic Tools" },
            { id: "view", label: "Layout & View" }
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setRibbonTab(tab.id as any)}
              className={`px-3 py-1.5 rounded-t-lg font-semibold text-xs transition-colors cursor-pointer ${
                ribbonTab === tab.id
                  ? "bg-slate-900 text-blue-400 border-t-2 border-blue-500 border-x border-slate-800"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* View Switchers */}
        <div className="flex items-center bg-slate-900 rounded-lg p-0.5 border border-slate-800 text-xs">
          <button
            type="button"
            onClick={() => setActiveTab("edit")}
            className={`px-2 py-0.5 rounded flex items-center gap-1 text-[11px] cursor-pointer ${
              activeTab === "edit" ? "bg-blue-600 text-white font-bold" : "text-slate-400 hover:text-white"
            }`}
          >
            <Edit3 className="w-3 h-3" /> Edit
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("split")}
            className={`px-2 py-0.5 rounded flex items-center gap-1 text-[11px] cursor-pointer ${
              activeTab === "split" ? "bg-blue-600 text-white font-bold" : "text-slate-400 hover:text-white"
            }`}
          >
            <Columns className="w-3 h-3" /> Split
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("preview")}
            className={`px-2 py-0.5 rounded flex items-center gap-1 text-[11px] cursor-pointer ${
              activeTab === "preview" ? "bg-blue-600 text-white font-bold" : "text-slate-400 hover:text-white"
            }`}
          >
            <Eye className="w-3 h-3" /> Preview
          </button>
        </div>
      </div>

      {/* Ribbon Toolbar Controls */}
      <div className="p-2 bg-slate-900 border-b border-slate-800 flex flex-wrap items-center gap-2 text-xs">
        {/* ================= HOME TAB ================= */}
        {ribbonTab === "home" && (
          <div className="flex flex-wrap items-center gap-1.5 w-full">
            {/* Undo / Redo */}
            <div className="flex items-center bg-slate-950 rounded-lg p-0.5 border border-slate-800">
              <button
                type="button"
                title="Undo (Ctrl+Z)"
                disabled={historyIndex <= 0}
                onClick={handleUndo}
                className="p-1.5 hover:bg-slate-800 hover:text-white rounded disabled:opacity-30 text-slate-400 cursor-pointer"
              >
                <Undo className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                title="Redo (Ctrl+Y)"
                disabled={historyIndex >= historyStack.length - 1}
                onClick={handleRedo}
                className="p-1.5 hover:bg-slate-800 hover:text-white rounded disabled:opacity-30 text-slate-400 cursor-pointer"
              >
                <Redo className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Headings */}
            <div className="flex items-center bg-slate-950 rounded-lg p-0.5 border border-slate-800">
              <button
                type="button"
                title="Heading 1 (Main Topic / # )"
                onClick={() => handleApplyHeading(1)}
                className="px-2 py-1 hover:bg-slate-800 hover:text-white rounded text-slate-300 cursor-pointer font-bold text-xs"
              >
                H1
              </button>
              <button
                type="button"
                title="Heading 2 (Section Title / ## )"
                onClick={() => handleApplyHeading(2)}
                className="px-2 py-1 hover:bg-slate-800 hover:text-white rounded text-slate-300 cursor-pointer font-bold text-xs"
              >
                H2
              </button>
              <button
                type="button"
                title="Heading 3 (Sub-Topic / ### )"
                onClick={() => handleApplyHeading(3)}
                className="px-2 py-1 hover:bg-slate-800 hover:text-white rounded text-slate-300 cursor-pointer font-bold text-xs"
              >
                H3
              </button>
              <button
                type="button"
                title="Paragraph / Normal Text"
                onClick={() => handleApplyHeading(0)}
                className="px-2 py-1 hover:bg-slate-800 hover:text-white rounded text-slate-400 cursor-pointer text-xs"
              >
                Body
              </button>
            </div>

            {/* Basic Typography */}
            <div className="flex items-center bg-slate-950 rounded-lg p-0.5 border border-slate-800">
              <button
                type="button"
                title="Bold (Ctrl+B)"
                onClick={() => insertFormatting("**", "**", "bold text")}
                className="p-1.5 hover:bg-slate-800 hover:text-white rounded text-slate-300 cursor-pointer font-bold"
              >
                <Bold className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                title="Italic (Ctrl+I)"
                onClick={() => insertFormatting("*", "*", "italic text")}
                className="p-1.5 hover:bg-slate-800 hover:text-white rounded text-slate-300 cursor-pointer italic"
              >
                <Italic className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                title="Underline (Ctrl+U)"
                onClick={() => insertFormatting("<u>", "</u>", "underlined text")}
                className="p-1.5 hover:bg-slate-800 hover:text-white rounded text-slate-300 cursor-pointer underline"
              >
                <Underline className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                title="Strikethrough"
                onClick={() => insertFormatting("~~", "~~", "strikethrough text")}
                className="p-1.5 hover:bg-slate-800 hover:text-white rounded text-slate-300 cursor-pointer line-through"
              >
                <Strikethrough className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                title="Subscript (e.g. H₂O)"
                onClick={() => insertFormatting("<sub>", "</sub>", "2")}
                className="p-1.5 hover:bg-slate-800 hover:text-white rounded text-slate-300 cursor-pointer"
              >
                <Subscript className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                title="Superscript (e.g. x²)"
                onClick={() => insertFormatting("<sup>", "</sup>", "2")}
                className="p-1.5 hover:bg-slate-800 hover:text-white rounded text-slate-300 cursor-pointer"
              >
                <Superscript className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Bullet Forms & Lists */}
            <div className="flex items-center bg-slate-950 rounded-lg p-0.5 border border-slate-800">
              <button
                type="button"
                title="Bullet Points List (Toggle Bullet)"
                onClick={handleApplyBulletList}
                className="p-1.5 hover:bg-slate-800 hover:text-cyan-300 rounded text-slate-300 cursor-pointer flex items-center gap-1"
              >
                <List className="w-3.5 h-3.5 text-cyan-400" />
                <span className="text-[10px] hidden md:inline">Bullets</span>
              </button>
              <button
                type="button"
                title="Numbered List (1. 2. 3.)"
                onClick={handleApplyNumberedList}
                className="p-1.5 hover:bg-slate-800 hover:text-cyan-300 rounded text-slate-300 cursor-pointer flex items-center gap-1"
              >
                <ListOrdered className="w-3.5 h-3.5 text-cyan-400" />
                <span className="text-[10px] hidden md:inline">1. 2. 3.</span>
              </button>
              <button
                type="button"
                title="Task Checklist (- [ ])"
                onClick={handleApplyChecklist}
                className="p-1.5 hover:bg-slate-800 hover:text-emerald-300 rounded text-slate-300 cursor-pointer flex items-center gap-1"
              >
                <ListChecks className="w-3.5 h-3.5 text-emerald-400" />
              </button>
              <button
                type="button"
                title="Quote Block (>)"
                onClick={handleApplyBlockquote}
                className="p-1.5 hover:bg-slate-800 hover:text-amber-300 rounded text-slate-300 cursor-pointer"
              >
                <Quote className="w-3.5 h-3.5 text-amber-400" />
              </button>
            </div>


            {/* Quick Insert Table & Image Actions */}
            <div className="flex items-center bg-slate-950 rounded-lg p-0.5 border border-indigo-900/60">
              <button
                type="button"
                title="Insert Table (Ctrl+Shift+T)"
                onClick={() => setTableModalOpen(true)}
                className="px-2.5 py-1 bg-indigo-950/60 hover:bg-indigo-900 text-indigo-300 rounded text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
              >
                <TableIcon className="w-3.5 h-3.5 text-indigo-400" />
                <span>Insert Table</span>
              </button>
              <button
                type="button"
                title="Insert Image / Upload Diagram (Ctrl+Shift+I)"
                onClick={() => setImageModalOpen(true)}
                className="px-2.5 py-1 bg-emerald-950/60 hover:bg-emerald-900 text-emerald-300 rounded text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
              >
                <ImageIcon className="w-3.5 h-3.5 text-emerald-400" />
                <span>Insert Image</span>
              </button>
              <button
                type="button"
                title="Insert Link"
                onClick={() => setLinkModalOpen(true)}
                className="px-2 py-1 hover:bg-slate-800 text-blue-300 rounded text-xs font-semibold flex items-center gap-1 cursor-pointer"
              >
                <Link className="w-3.5 h-3.5 text-blue-400" />
              </button>
              <button
                type="button"
                title="Insert Code Snippet"
                onClick={() => setCodeModalOpen(true)}
                className="px-2 py-1 hover:bg-slate-800 text-rose-300 rounded text-xs font-semibold flex items-center gap-1 cursor-pointer"
              >
                <Code className="w-3.5 h-3.5 text-rose-400" />
              </button>
            </div>

            {/* Colors & Clear */}
            <div className="relative flex items-center bg-slate-950 rounded-lg p-0.5 border border-slate-800">
              <button
                type="button"
                title="Highlight Text"
                onClick={() => setShowHighlightPicker(!showHighlightPicker)}
                className="p-1.5 hover:bg-slate-800 hover:text-amber-300 rounded text-slate-300 cursor-pointer"
              >
                <Highlighter className="w-3.5 h-3.5 text-amber-400" />
              </button>
              {showHighlightPicker && (
                <div className="absolute top-full left-0 mt-1 z-30 bg-slate-900 border border-slate-700 rounded-xl p-2 shadow-2xl flex gap-1">
                  {[
                    { name: "Yellow", color: "#fef08a" },
                    { name: "Green", color: "#bbf7d0" },
                    { name: "Cyan", color: "#a5f3fc" },
                    { name: "Pink", color: "#fbcfe8" },
                    { name: "Orange", color: "#fed7aa" }
                  ].map((c) => (
                    <button
                      key={c.name}
                      type="button"
                      onClick={() => {
                        insertFormatting(
                          `<mark style="background-color: ${c.color}; color: #000; padding: 2px 4px; border-radius: 3px;">`,
                          "</mark>",
                          "highlighted text"
                        );
                        setShowHighlightPicker(false);
                      }}
                      className="w-5 h-5 rounded-full border border-white/20 hover:scale-110 transition-transform"
                      style={{ backgroundColor: c.color }}
                      title={c.name}
                    />
                  ))}
                </div>
              )}

              <button
                type="button"
                title="Clear Formatting"
                onClick={clearFormattingFromSelection}
                className="p-1.5 hover:bg-slate-800 hover:text-rose-400 rounded text-slate-400 cursor-pointer"
              >
                <RemoveFormatting className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* ================= INSERT TAB ================= */}
        {ribbonTab === "insert" && (
          <div className="flex flex-wrap items-center gap-2 w-full">
            <button
              type="button"
              onClick={() => setTableModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-900/60 hover:bg-indigo-800 text-indigo-100 rounded-lg border border-indigo-700/60 font-semibold cursor-pointer shadow-sm"
            >
              <TableIcon className="w-4 h-4 text-indigo-300" />
              <span>Table Wizard &amp; Presets</span>
            </button>
            <button
              type="button"
              onClick={() => setImageModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-900/60 hover:bg-emerald-800 text-emerald-100 rounded-lg border border-emerald-700/60 font-semibold cursor-pointer shadow-sm"
            >
              <ImageIcon className="w-4 h-4 text-emerald-300" />
              <span>Image &amp; Diagram Library</span>
            </button>
            <button
              type="button"
              onClick={() => setSmartPasteModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-900/60 hover:bg-amber-800 text-amber-100 rounded-lg border border-amber-700/60 font-semibold cursor-pointer shadow-sm"
            >
              <ClipboardPaste className="w-4 h-4 text-amber-300" />
              <span>Smart Paste &amp; PDF Converter</span>
            </button>
            <button
              type="button"
              onClick={() => setCodeModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-950 hover:bg-slate-800 text-slate-200 rounded-lg border border-slate-800 cursor-pointer"
            >
              <Code className="w-3.5 h-3.5 text-rose-400" /> Code Block
            </button>
            <button
              type="button"
              onClick={() => setMathModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-950 hover:bg-slate-800 text-slate-200 rounded-lg border border-slate-800 cursor-pointer"
            >
              <Sigma className="w-3.5 h-3.5 text-amber-400" /> Math Equation (LaTeX)
            </button>
            <button
              type="button"
              onClick={() => setSymbolsModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-950 hover:bg-slate-800 text-slate-200 rounded-lg border border-slate-800 cursor-pointer"
            >
              <Sparkle className="w-3.5 h-3.5 text-cyan-400" /> Math &amp; Greek Symbols
            </button>
          </div>
        )}

        {/* ================= ACADEMIC TOOLS TAB ================= */}
        {ribbonTab === "academic" && (
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              type="button"
              onClick={() => setCalloutModalOpen(true)}
              className="flex items-center gap-1 px-2.5 py-1 bg-blue-900/60 hover:bg-blue-800 text-blue-200 rounded border border-blue-700/50 font-semibold cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-blue-400" /> Insert Academic Callout
            </button>
            <button
              type="button"
              onClick={() => insertFormatting("\n---\n\n", "", "")}
              className="px-2.5 py-1 bg-slate-950 hover:bg-slate-800 text-slate-300 rounded border border-slate-800 cursor-pointer"
            >
              Horizontal Divider Line
            </button>
            <button
              type="button"
              onClick={() => insertFormatting("`", "`", "inlineCode")}
              className="px-2.5 py-1 bg-slate-950 hover:bg-slate-800 text-amber-300 font-mono rounded border border-slate-800 cursor-pointer"
            >
              Inline `Code`
            </button>
            <button
              type="button"
              onClick={() => insertFormatting("<kbd>", "</kbd>", "Ctrl+C")}
              className="px-2.5 py-1 bg-slate-950 hover:bg-slate-800 text-slate-300 rounded border border-slate-800 cursor-pointer text-xs"
            >
              Keyboard Key &lt;kbd&gt;
            </button>
          </div>
        )}

        {/* ================= LAYOUT & VIEW TAB ================= */}
        {ribbonTab === "view" && (
          <div className="flex items-center gap-2">
            <span className="text-slate-400 text-xs">Active Editor View:</span>
            <div className="flex items-center bg-slate-950 rounded-lg p-1 border border-slate-800 gap-1">
              <button
                type="button"
                onClick={() => setActiveTab("edit")}
                className={`px-3 py-1 rounded text-xs cursor-pointer ${
                  activeTab === "edit" ? "bg-blue-600 text-white font-bold" : "text-slate-400"
                }`}
              >
                Code/Markdown Only
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("split")}
                className={`px-3 py-1 rounded text-xs cursor-pointer ${
                  activeTab === "split" ? "bg-blue-600 text-white font-bold" : "text-slate-400"
                }`}
              >
                Side-by-Side Split View
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("preview")}
                className={`px-3 py-1 rounded text-xs cursor-pointer ${
                  activeTab === "preview" ? "bg-blue-600 text-white font-bold" : "text-slate-400"
                }`}
              >
                Rendered Student View
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Editor Body Area */}
      <div className="flex-1 overflow-hidden bg-slate-950">
        {activeTab === "edit" && (
          <textarea
            ref={textareaRef}
            value={value}
            onPaste={handleSmartPaste}
            onChange={(e) => handleContentUpdate(e.target.value)}
            placeholder={placeholder}
            className="w-full h-full p-4 bg-transparent text-slate-100 placeholder:text-slate-600 focus:outline-hidden font-mono text-xs sm:text-sm leading-relaxed resize-y border-none"
            style={{ minHeight }}
          />
        )}

        {activeTab === "preview" && (
          <div className="p-6 bg-white overflow-y-auto text-slate-900 rounded-b-xl" style={{ minHeight }}>
            <RichContentViewer content={value} />
          </div>
        )}

        {activeTab === "split" && (
          <div
            className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-800"
            style={{ minHeight }}
          >
            <textarea
              ref={textareaRef}
              value={value}
              onPaste={handleSmartPaste}
              onChange={(e) => handleContentUpdate(e.target.value)}
              placeholder={placeholder}
              className="w-full h-full p-4 bg-slate-950 text-slate-100 placeholder:text-slate-600 focus:outline-hidden font-mono text-xs leading-relaxed resize-none border-none"
            />
            <div className="p-6 bg-white overflow-y-auto text-slate-900">
              <RichContentViewer content={value} />
            </div>
          </div>
        )}
      </div>

      {/* ========================================================= */}
      {/* 1. MODAL: ADVANCED TABLE GENERATOR & PRESETS               */}
      {/* ========================================================= */}
      {tableModalOpen && (
        <div className="fixed inset-0 z-70 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-xl w-full p-5 text-slate-100 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
                  <TableIcon className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Insert Table</h4>
                  <p className="text-[11px] text-slate-400">Quick grid matrix, custom dimensions, or C preset tables</p>
                </div>
              </div>
              <button onClick={() => setTableModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Tab switcher */}
            <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
              <button
                type="button"
                onClick={() => setTableTab("grid")}
                className={`flex-1 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer ${
                  tableTab === "grid" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-white"
                }`}
              >
                1. Visual Grid Matrix
              </button>
              <button
                type="button"
                onClick={() => setTableTab("custom")}
                className={`flex-1 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer ${
                  tableTab === "custom" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-white"
                }`}
              >
                2. Custom Table Builder
              </button>
              <button
                type="button"
                onClick={() => setTableTab("presets")}
                className={`flex-1 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer ${
                  tableTab === "presets" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-white"
                }`}
              >
                3. Academic C Presets
              </button>
            </div>

            {/* Tab 1: Visual Grid Matrix */}
            {tableTab === "grid" && (
              <div className="space-y-4 py-2">
                <div className="text-center text-xs text-slate-300 font-semibold">
                  Hover to select table dimensions: <span className="text-indigo-400 font-bold">{hoverGridRow} Rows &times; {hoverGridCol} Columns</span>
                </div>
                <div className="flex flex-col items-center justify-center gap-1 p-4 bg-slate-950 rounded-xl border border-slate-800">
                  {Array.from({ length: 8 }, (_, r) => (
                    <div key={r} className="flex gap-1">
                      {Array.from({ length: 8 }, (_, c) => {
                        const isSelected = r < hoverGridRow && c < hoverGridCol;
                        return (
                          <div
                            key={c}
                            onMouseEnter={() => {
                              setHoverGridRow(r + 1);
                              setHoverGridCol(c + 1);
                            }}
                            onClick={() => handleInsertGridTable(r + 1, c + 1)}
                            className={`w-6 h-6 rounded cursor-pointer transition-colors border ${
                              isSelected
                                ? "bg-indigo-600 border-indigo-400 scale-105"
                                : "bg-slate-900 border-slate-800 hover:bg-indigo-950"
                            }`}
                            title={`Create ${r + 1}x${c + 1} Table`}
                          />
                        );
                      })}
                    </div>
                  ))}
                </div>
                <div className="flex justify-center">
                  <button
                    type="button"
                    onClick={() => handleInsertGridTable(hoverGridRow, hoverGridCol)}
                    className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-indigo-950 cursor-pointer"
                  >
                    Insert {hoverGridRow} &times; {hoverGridCol} Table
                  </button>
                </div>
              </div>
            )}

            {/* Tab 2: Custom Table Builder */}
            {tableTab === "custom" && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs text-slate-400 font-semibold">Number of Rows (1-20)</label>
                    <input
                      type="number"
                      min={1}
                      max={20}
                      value={tableRows}
                      onChange={(e) => setTableRows(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-slate-400 font-semibold">Number of Columns (1-8)</label>
                    <input
                      type="number"
                      min={1}
                      max={8}
                      value={tableCols}
                      onChange={(e) => {
                        const count = Math.max(1, Math.min(8, parseInt(e.target.value) || 1));
                        setTableCols(count);
                        setColumnAlignments(Array(count).fill("left"));
                        setCustomHeaderNames(Array.from({ length: count }, (_, i) => `Column ${i + 1}`));
                      }}
                      className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white"
                    />
                  </div>
                </div>

                {/* Column Headers & Alignments */}
                <div className="space-y-2">
                  <div className="text-xs font-bold text-slate-300">Column Headers &amp; Text Alignments</div>
                  <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                    {Array.from({ length: tableCols }, (_, i) => (
                      <div key={i} className="flex items-center gap-2 p-2 bg-slate-950 rounded-lg border border-slate-800 text-xs">
                        <span className="w-16 text-slate-400 font-mono text-[11px]">Col {i + 1}:</span>
                        <input
                          type="text"
                          value={customHeaderNames[i] || `Column ${i + 1}`}
                          onChange={(e) => {
                            const newNames = [...customHeaderNames];
                            newNames[i] = e.target.value;
                            setCustomHeaderNames(newNames);
                          }}
                          placeholder={`Column ${i + 1} Name`}
                          className="flex-1 px-2.5 py-1 bg-slate-900 border border-slate-700 rounded text-slate-100 text-xs"
                        />
                        <select
                          value={columnAlignments[i] || "left"}
                          onChange={(e) => {
                            const newAlign = [...columnAlignments];
                            newAlign[i] = e.target.value as any;
                            setColumnAlignments(newAlign);
                          }}
                          className="bg-slate-900 border border-slate-700 rounded px-2 py-1 text-[11px] text-slate-300"
                        >
                          <option value="left">Left Align</option>
                          <option value="center">Center Align</option>
                          <option value="right">Right Align</option>
                        </select>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                  <button onClick={() => setTableModalOpen(false)} className="px-4 py-1.5 bg-slate-800 text-slate-300 rounded-lg text-xs">
                    Cancel
                  </button>
                  <button onClick={handleInsertCustomTable} className="px-5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold">
                    Insert Custom Table
                  </button>
                </div>
              </div>
            )}

            {/* Tab 3: Academic C Presets */}
            {tableTab === "presets" && (
              <div className="space-y-3">
                <p className="text-xs text-slate-400">
                  1-Click insertion of curriculum-verified tables with format specifiers, operators, and keywords:
                </p>
                <div className="grid grid-cols-1 gap-2 max-h-64 overflow-y-auto pr-1">
                  {C_TABLE_PRESETS.map((preset) => (
                    <div
                      key={preset.id}
                      className="p-3 bg-slate-950 rounded-xl border border-slate-800 hover:border-indigo-500/50 flex items-center justify-between gap-3 transition-colors"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] bg-indigo-950 text-indigo-400 font-mono px-1.5 py-0.5 rounded border border-indigo-800">
                            {preset.category}
                          </span>
                          <span className="text-xs font-bold text-slate-200">{preset.title}</span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">{preset.description}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleInsertTablePreset(preset)}
                        className="px-3 py-1.5 bg-indigo-600/30 hover:bg-indigo-600 text-indigo-300 hover:text-white border border-indigo-500/40 rounded-lg text-xs font-bold transition-colors cursor-pointer shrink-0"
                      >
                        Insert
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 2. MODAL: WORDPRESS-STYLE MEDIA & ASSET LIBRARY           */}
      {/* ========================================================= */}
      <MediaLibraryModal
        isOpen={imageModalOpen}
        onClose={() => setImageModalOpen(false)}
        onInsertMedia={(formattedContent) => {
          insertFormatting(formattedContent, "", "");
          showToast("📷 Media inserted into Lesson Theory!");
        }}
        title="Insert Media & Architecture Diagram"
      />

      {/* ========================================================= */}
      {/* 3. MODAL: SMART PASTE & PDF CONTENT CONVERTER              */}
      {/* ========================================================= */}
      {smartPasteModalOpen && (
        <div className="fixed inset-0 z-70 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-2xl w-full p-5 text-slate-100 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
                  <ClipboardPaste className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Smart Paste &amp; PDF Theory Converter</h4>
                  <p className="text-[11px] text-slate-400">
                    Paste raw text from lecture notes, PDFs, or tables — auto-converts to clean formatted Markdown
                  </p>
                </div>
              </div>
              <button onClick={() => setSmartPasteModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Mode selection */}
            <div className="grid grid-cols-4 gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
              <button
                type="button"
                onClick={() => {
                  setPasteMode("auto");
                  updatePastePreview(pasteRawText, "auto");
                }}
                className={`py-1.5 rounded-lg font-semibold cursor-pointer ${
                  pasteMode === "auto" ? "bg-amber-600 text-white" : "text-slate-400"
                }`}
              >
                Auto-Detect
              </button>
              <button
                type="button"
                onClick={() => {
                  setPasteMode("table");
                  updatePastePreview(pasteRawText, "table");
                }}
                className={`py-1.5 rounded-lg font-semibold cursor-pointer ${
                  pasteMode === "table" ? "bg-amber-600 text-white" : "text-slate-400"
                }`}
              >
                Convert to Table
              </button>
              <button
                type="button"
                onClick={() => {
                  setPasteMode("theory");
                  updatePastePreview(pasteRawText, "theory");
                }}
                className={`py-1.5 rounded-lg font-semibold cursor-pointer ${
                  pasteMode === "theory" ? "bg-amber-600 text-white" : "text-slate-400"
                }`}
              >
                Clean PDF Theory
              </button>
              <button
                type="button"
                onClick={() => {
                  setPasteMode("code");
                  updatePastePreview(pasteRawText, "code");
                }}
                className={`py-1.5 rounded-lg font-semibold cursor-pointer ${
                  pasteMode === "code" ? "bg-amber-600 text-white" : "text-slate-400"
                }`}
              >
                Wrap as C Code
              </button>
            </div>

            {/* Paste Area */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs text-slate-400 font-semibold">1. Paste Raw Clipboard Text Here:</label>
                <textarea
                  rows={8}
                  value={pasteRawText}
                  onChange={(e) => {
                    setPasteRawText(e.target.value);
                    updatePastePreview(e.target.value, pasteMode);
                  }}
                  placeholder="Paste text copied from PDF, Word document, Excel spreadsheet, or lecture notes..."
                  className="w-full p-3 bg-slate-950 border border-slate-700 rounded-xl text-xs font-mono text-slate-200"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-emerald-400 font-semibold">2. Formatted Markdown Preview:</label>
                <div className="w-full h-44 p-3 bg-slate-950 border border-slate-700 rounded-xl text-xs font-mono text-emerald-300 overflow-y-auto whitespace-pre-wrap">
                  {pastePreview || <span className="text-slate-600 italic">Preview of formatted table or cleaned theory will appear here...</span>}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
              <button onClick={() => setSmartPasteModalOpen(false)} className="px-4 py-1.5 bg-slate-800 text-slate-300 rounded-lg text-xs">
                Cancel
              </button>
              <button
                onClick={handleInsertSmartPaste}
                disabled={!pastePreview}
                className="px-5 py-1.5 bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white rounded-lg text-xs font-bold cursor-pointer"
              >
                Insert Into Theory Content
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: CODE SNIPPET ================= */}
      {codeModalOpen && (
        <div className="fixed inset-0 z-70 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-5 text-slate-100 space-y-3 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <Code className="w-4 h-4 text-rose-400" /> Insert Formatted Code Block
              </h4>
              <button onClick={() => setCodeModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-1">
              <label className="text-xs text-slate-400">Language</label>
              <select
                value={codeLang}
                onChange={(e) => setCodeLang(e.target.value)}
                className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white"
              >
                <option value="c">C (ANSI / C99 / C11)</option>
                <option value="cpp">C++</option>
                <option value="python">Python</option>
                <option value="java">Java</option>
                <option value="javascript">JavaScript</option>
                <option value="sql">SQL</option>
                <option value="bash">Bash / Terminal Shell</option>
                <option value="text">Plain Text / Output</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs text-slate-400">Code Content</label>
              <textarea
                rows={7}
                value={codeContent}
                onChange={(e) => setCodeContent(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs font-mono text-white"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <button onClick={() => setCodeModalOpen(false)} className="px-3 py-1.5 bg-slate-800 rounded-lg text-xs">
                Cancel
              </button>
              <button
                onClick={() => {
                  const block = `\n\`\`\`${codeLang}\n${codeContent}\n\`\`\`\n\n`;
                  insertFormatting(block, "", "");
                  setCodeModalOpen(false);
                }}
                className="px-4 py-1.5 bg-blue-600 rounded-lg text-xs font-bold text-white cursor-pointer"
              >
                Insert Code
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: MATH EQUATION ================= */}
      {mathModalOpen && (
        <div className="fixed inset-0 z-70 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-sm w-full p-5 text-slate-100 space-y-3 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <Sigma className="w-4 h-4 text-amber-400" /> Insert Math Equation (LaTeX)
              </h4>
              <button onClick={() => setMathModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-1">
              <label className="text-xs text-slate-400">Formula</label>
              <textarea
                rows={3}
                value={mathFormula}
                onChange={(e) => setMathFormula(e.target.value)}
                className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs font-mono text-white"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <button onClick={() => setMathModalOpen(false)} className="px-3 py-1.5 bg-slate-800 rounded-lg text-xs">
                Cancel
              </button>
              <button
                onClick={() => {
                  insertFormatting(`\n$$ ${mathFormula} $$\n\n`, "", "");
                  setMathModalOpen(false);
                }}
                className="px-4 py-1.5 bg-blue-600 rounded-lg text-xs font-bold text-white cursor-pointer"
              >
                Insert Math
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: CALLOUT BANNER ================= */}
      {calloutModalOpen && (
        <div className="fixed inset-0 z-70 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-5 text-slate-100 space-y-3 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-blue-400" /> Insert Academic Callout
              </h4>
              <button onClick={() => setCalloutModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="grid grid-cols-4 gap-1.5">
              {["NOTE", "IMPORTANT", "DEFINITION", "EXAMPLE", "WARNING", "TIP", "KEY POINTS", "PRACTICE"].map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setCalloutType(t)}
                  className={`p-1.5 rounded text-[10px] font-bold cursor-pointer ${
                    calloutType === t ? "bg-blue-600 text-white" : "bg-slate-950 text-slate-300 border border-slate-800"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
            <div className="space-y-1">
              <label className="text-xs text-slate-400">Content</label>
              <textarea
                rows={3}
                value={calloutText}
                onChange={(e) => setCalloutText(e.target.value)}
                placeholder="Important explanation for students..."
                className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <button onClick={() => setCalloutModalOpen(false)} className="px-3 py-1.5 bg-slate-800 rounded-lg text-xs">
                Cancel
              </button>
              <button
                onClick={() => {
                  const text = calloutText || "Insert explanatory note or key takeaway here.";
                  insertFormatting(`\n> [!${calloutType}]\n> **${calloutType}:** ${text}\n\n`, "", "");
                  setCalloutText("");
                  setCalloutModalOpen(false);
                }}
                className="px-4 py-1.5 bg-blue-600 rounded-lg text-xs font-bold text-white cursor-pointer"
              >
                Insert Callout
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: HYPERLINK ================= */}
      {linkModalOpen && (
        <div className="fixed inset-0 z-70 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-sm w-full p-5 text-slate-100 space-y-3 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <Link className="w-4 h-4 text-blue-400" /> Insert Hyperlink
              </h4>
              <button onClick={() => setLinkModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-2">
              <input
                type="text"
                value={linkText}
                onChange={(e) => setLinkText(e.target.value)}
                placeholder="Display text (e.g. C Standard Reference)"
                className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white"
              />
              <input
                type="url"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                placeholder="https://..."
                className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <button onClick={() => setLinkModalOpen(false)} className="px-3 py-1.5 bg-slate-800 rounded-lg text-xs">
                Cancel
              </button>
              <button
                onClick={() => {
                  if (!linkUrl) return;
                  const text = linkText || linkUrl;
                  insertFormatting(`[${text}](${linkUrl})`, "", "");
                  setLinkUrl("");
                  setLinkText("");
                  setLinkModalOpen(false);
                }}
                disabled={!linkUrl}
                className="px-4 py-1.5 bg-blue-600 disabled:opacity-50 rounded-lg text-xs font-bold text-white cursor-pointer"
              >
                Insert Link
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: MATH & GREEK SYMBOLS ================= */}
      {symbolsModalOpen && (
        <div className="fixed inset-0 z-70 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-5 text-slate-100 shadow-2xl space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <Sparkle className="w-4 h-4 text-cyan-400" /> Academic &amp; Math Symbols
              </h4>
              <button onClick={() => setSymbolsModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-1">
              {[
                {
                  category: "Math & Relations",
                  symbols: ["±", "×", "÷", "≠", "≤", "≥", "≈", "∞", "√", "∑", "∏", "∫", "∂", "∇", "∈", "∉", "⊂", "⊆", "∪", "∩", "∅"]
                },
                {
                  category: "Greek Alphabet",
                  symbols: ["α", "β", "γ", "δ", "ε", "ζ", "η", "θ", "λ", "μ", "π", "ρ", "σ", "τ", "φ", "ψ", "ω", "Δ", "Σ", "Ω", "Θ", "Λ"]
                },
                {
                  category: "Logic & Arrows",
                  symbols: ["←", "→", "↑", "↓", "↔", "⇒", "⇐", "⇔", "↦", "∧", "∨", "¬", "⊕", "∴", "∵", "∀", "∃", "≡"]
                }
              ].map((group) => (
                <div key={group.category} className="space-y-1">
                  <div className="text-[11px] font-bold text-slate-400">{group.category}</div>
                  <div className="grid grid-cols-7 gap-1">
                    {group.symbols.map((sym) => (
                      <button
                        key={sym}
                        type="button"
                        onClick={() => insertFormatting(sym, "", "")}
                        className="p-1.5 bg-slate-800 hover:bg-cyan-600 hover:text-white rounded text-sm font-mono flex items-center justify-center transition-colors cursor-pointer"
                      >
                        {sym}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-end pt-2 border-t border-slate-800">
              <button onClick={() => setSymbolsModalOpen(false)} className="px-4 py-1.5 bg-slate-800 rounded-lg text-xs cursor-pointer">
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
