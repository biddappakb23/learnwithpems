import React, { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";
import rehypeRaw from "rehype-raw";
import {
  Check,
  Copy,
  Info,
  AlertTriangle,
  Lightbulb,
  AlertCircle,
  BookOpen,
  Sparkles,
  Award,
  Code2,
  FileQuestion,
  HelpCircle,
  ExternalLink,
  ZoomIn,
  X,
  Image as ImageIcon,
  Layers
} from "lucide-react";

import { handleProtectedCopy } from "../utils/antiCopy";
import { resolveLessonImage } from "../utils/imageResolver";

interface RichContentViewerProps {
  content: string;
  className?: string;
  allowCopy?: boolean;
}

/**
 * Resilient Image Renderer for Lesson Theory Content
 * Solves broken image references (such as "sectionC" or "sectionC.png"),
 * auto-resolves legacy filenames, supports click-to-zoom HD lightbox,
 * and renders clean fallback figures instead of broken browser icons.
 */
const LessonSmartImage: React.FC<{
  src?: string;
  alt?: string;
  title?: string;
  className?: string;
  style?: React.CSSProperties;
}> = ({ src, alt, title, style, className }) => {
  const [hasError, setHasError] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);
  const [resolvedSrc, setResolvedSrc] = useState<string>(() => resolveLessonImage(src || "", alt));

  // Sync resolvedSrc whenever src or alt prop changes
  React.useEffect(() => {
    setHasError(false);
    setResolvedSrc(resolveLessonImage(src || "", alt));
  }, [src, alt]);

  // Determine clean display caption (strip "Figure:" if already present to avoid duplication)
  const rawCaption = alt || title || "";
  const cleanCaption = rawCaption.replace(/^Figure:\s*/i, "").trim();

  // Retry with fallback resolver if primary URL fails
  const handleError = () => {
    if (!hasError) {
      console.warn(`[LessonImage] Image failed to load from: "${src}". Attempting vector/diagram fallback for: "${cleanCaption}"`);
      const fallback = resolveLessonImage(cleanCaption || "sectionC", cleanCaption);
      if (fallback && fallback !== resolvedSrc) {
        setResolvedSrc(fallback);
      } else {
        setHasError(true);
      }
    } else {
      setHasError(true);
    }
  };

  return (
    <div className="my-6 text-center not-prose select-none">
      <div className="inline-block max-w-full group relative" style={style}>
        <div className="p-1.5 bg-white border border-slate-200 rounded-2xl shadow-xs hover:shadow-md transition-shadow overflow-hidden max-w-full">
          {!hasError && resolvedSrc ? (
            <div className="relative overflow-hidden rounded-xl bg-slate-50 cursor-pointer" onClick={() => setIsZoomed(true)}>
              <img
                src={resolvedSrc}
                alt={cleanCaption || "Curriculum Figure"}
                onError={handleError}
                loading="lazy"
                referrerPolicy="no-referrer"
                className={`rounded-xl max-h-[560px] w-auto max-w-full object-contain mx-auto transition-transform duration-200 group-hover:scale-[1.01] ${className || ""}`}
                style={{ display: "block", margin: "0 auto", ...style }}
              />
              <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900/75 backdrop-blur-xs text-white p-1.5 rounded-lg text-xs flex items-center gap-1 shadow-sm">
                <ZoomIn className="w-3.5 h-3.5" />
                <span className="text-[10px] font-medium hidden sm:inline">Click to Zoom</span>
              </div>
            </div>
          ) : (
            /* Graceful Visual Fallback Card if image is completely missing */
            <div className="p-6 max-w-md mx-auto bg-gradient-to-br from-slate-50 to-blue-50/40 rounded-xl border border-blue-200/60 text-center space-y-2">
              <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mx-auto">
                <Layers className="w-5 h-5" />
              </div>
              <div className="text-xs font-bold text-slate-800">
                {cleanCaption || "Academic Lecture Illustration"}
              </div>
              <p className="text-[11px] text-slate-500 max-w-xs mx-auto">
                Theoretical structural concept illustrated in this section.
              </p>
            </div>
          )}
        </div>

        {/* Clean, Non-Duplicated Caption */}
        {cleanCaption && (
          <span className="block text-xs font-medium text-slate-600 mt-2 font-sans tracking-tight">
            <span className="italic text-slate-500">Figure:</span> {cleanCaption}
          </span>
        )}
      </div>

      {/* Lightbox Zoom Modal */}
      {isZoomed && resolvedSrc && !hasError && (
        <div
          className="fixed inset-0 z-100 bg-slate-950/90 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setIsZoomed(false)}
        >
          <div className="relative max-w-5xl max-h-[90vh] w-full flex flex-col items-center justify-center" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              onClick={() => setIsZoomed(false)}
              className="absolute -top-10 right-0 text-white/80 hover:text-white bg-slate-800/80 hover:bg-slate-700 p-2 rounded-full cursor-pointer transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="bg-white p-2 rounded-2xl shadow-2xl overflow-hidden max-h-[82vh] flex items-center justify-center">
              <img
                src={resolvedSrc}
                alt={cleanCaption}
                className="max-h-[78vh] max-w-full w-auto object-contain rounded-xl"
              />
            </div>
            {cleanCaption && (
              <div className="mt-3 text-center text-sm font-semibold text-slate-200 bg-slate-900/80 px-4 py-1.5 rounded-full border border-slate-700">
                Figure: {cleanCaption}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const CodeBlockRenderer: React.FC<{
  className?: string;
  children?: React.ReactNode;
  inline?: boolean;
}> = ({ className, children, inline }) => {
  const [copied, setCopied] = useState(false);
  const match = /language-(\w+)/.exec(className || "");
  const language = match ? match[1] : "code";
  const codeString = String(children).replace(/\n$/, "");

  if (inline) {
    return (
      <code className="font-mono text-xs font-semibold bg-slate-100 text-rose-600 px-1.5 py-0.5 rounded border border-slate-200">
        {children}
      </code>
    );
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(codeString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="my-5 rounded-xl overflow-hidden border border-slate-800 bg-slate-950 shadow-lg text-xs sm:text-sm font-mono not-prose">
      {/* Code Header Bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-slate-900 border-b border-slate-800 text-slate-400">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
            <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
          </div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-blue-400 ml-2">
            {language}
          </span>
        </div>
        <button
          type="button"
          onClick={handleCopy}
          className="flex items-center gap-1 text-slate-400 hover:text-white px-2 py-1 rounded bg-slate-800/80 hover:bg-slate-800 transition-colors text-xs font-sans cursor-pointer"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-emerald-400 font-semibold">Copied!</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span>Copy Code</span>
            </>
          )}
        </button>
      </div>

      {/* Code Body */}
      <pre className="p-4 overflow-x-auto text-slate-100 leading-relaxed font-mono selection:bg-blue-600 selection:text-white">
        <code>{codeString}</code>
      </pre>
    </div>
  );
};

export const RichContentViewer: React.FC<RichContentViewerProps> = ({
  content,
  className = "",
  allowCopy = false
}) => {
  if (!content || !content.trim()) {
    return (
      <div className="text-slate-400 italic text-sm py-4 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
        No detailed theoretical content provided for this chapter.
      </div>
    );
  }

  // Pre-process content to replace custom academic callout tags if needed
  return (
    <div
      onCopy={allowCopy ? undefined : handleProtectedCopy}
      onCut={allowCopy ? undefined : handleProtectedCopy}
      className={`prose rich-content-body max-w-none text-slate-800 text-sm sm:text-base leading-relaxed break-words ${
        allowCopy ? "" : "select-none"
      } ${className}`}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkBreaks]}
        rehypePlugins={[rehypeRaw]}
        components={{
          h1: ({ node, ...props }) => (
            <h1
              {...props}
              className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-8 mb-4 pb-2 border-b border-slate-200 leading-tight flex items-baseline gap-2"
            />
          ),
          h2: ({ node, ...props }) => (
            <h2
              {...props}
              className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight mt-7 mb-3 pb-1.5 border-b border-slate-100 leading-snug"
            />
          ),
          h3: ({ node, ...props }) => (
            <h3
              {...props}
              className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight mt-6 mb-2.5 leading-snug"
            />
          ),
          h4: ({ node, ...props }) => (
            <h4
              {...props}
              className="text-base sm:text-lg font-bold text-slate-800 tracking-tight mt-5 mb-2"
            />
          ),
          h5: ({ node, ...props }) => (
            <h5
              {...props}
              className="text-sm sm:text-base font-bold text-slate-800 mt-4 mb-1.5"
            />
          ),
          h6: ({ node, ...props }) => (
            <h6
              {...props}
              className="text-xs sm:text-sm font-bold text-slate-600 uppercase tracking-wider mt-3 mb-1"
            />
          ),
          p: ({ node, ...props }) => (
            <p
              {...props}
              className="my-3.5 text-slate-800 leading-relaxed text-sm sm:text-base"
            />
          ),
          ul: ({ node, ...props }) => (
            <ul
              {...props}
              className="my-3.5 pl-6 list-disc space-y-1.5 text-slate-800 text-sm sm:text-base"
            />
          ),
          ol: ({ node, ...props }) => (
            <ol
              {...props}
              className="my-3.5 pl-6 list-decimal space-y-1.5 text-slate-800 text-sm sm:text-base"
            />
          ),
          li: ({ node, ...props }) => (
            <li
              {...props}
              className="leading-relaxed pl-1 my-1"
            />
          ),
          strong: ({ node, ...props }) => (
            <strong {...props} className="font-bold text-slate-900" />
          ),
          b: ({ node, ...props }) => (
            <b {...props} className="font-bold text-slate-900" />
          ),
          em: ({ node, ...props }) => (
            <em {...props} className="italic text-slate-800" />
          ),
          i: ({ node, ...props }) => (
            <i {...props} className="italic text-slate-800" />
          ),
          hr: ({ node, ...props }) => (
            <hr {...props} className="my-6 border-slate-200" />
          ),
          br: ({ node, ...props }) => (
            <br {...props} />
          ),
          code: ({ node, className: codeClass, children, ...props }) => {
            const isInline = (props as { inline?: boolean }).inline;
            const isBlock = !isInline && (Boolean(codeClass) || String(children).includes("\n"));
            return (
              <CodeBlockRenderer className={codeClass} inline={!isBlock}>
                {children}
              </CodeBlockRenderer>
            );
          },
          blockquote: ({ node, children, ...props }) => {
            // Check text inside blockquote for Academic Callout headers
            const rawText = React.Children.toArray(children)
              .map((c) => (typeof c === "string" ? c : (c as any)?.props?.children || ""))
              .join(" ");

            const isWarning = /\[!WARNING\]|WARNING:|⚠️/i.test(rawText);
            const isImportant = /\[!IMPORTANT\]|IMPORTANT:|❗/i.test(rawText);
            const isDefinition = /\[!DEFINITION\]|DEFINITION:|📖/i.test(rawText);
            const isExample = /\[!EXAMPLE\]|EXAMPLE:|💡/i.test(rawText);
            const isTip = /\[!TIP\]|TIP:|PRO-TIP:|🌟/i.test(rawText);
            const isKeyPoints = /\[!KEY POINTS\]|KEY POINTS:|🎯/i.test(rawText);
            const isPractice = /\[!PRACTICE\]|PRACTICE:|📝/i.test(rawText);
            const isNote = /\[!NOTE\]|NOTE:|📌/i.test(rawText) || (!isWarning && !isImportant && !isDefinition && !isExample && !isTip && !isKeyPoints && !isPractice);

            if (isWarning) {
              return (
                <div className="my-5 p-4 rounded-xl border border-rose-200 bg-rose-50/80 text-rose-900 not-prose shadow-xs">
                  <div className="flex items-center gap-2 font-bold text-xs uppercase tracking-wider text-rose-700 mb-1.5">
                    <AlertTriangle className="w-4 h-4 text-rose-600" />
                    <span>Warning / Common Mistake</span>
                  </div>
                  <div className="text-xs sm:text-sm text-rose-950 leading-relaxed pl-6">
                    {children}
                  </div>
                </div>
              );
            }

            if (isImportant) {
              return (
                <div className="my-5 p-4 rounded-xl border border-amber-300 bg-amber-50/90 text-amber-950 not-prose shadow-xs">
                  <div className="flex items-center gap-2 font-bold text-xs uppercase tracking-wider text-amber-800 mb-1.5">
                    <AlertCircle className="w-4 h-4 text-amber-600" />
                    <span>Important Concept</span>
                  </div>
                  <div className="text-xs sm:text-sm text-amber-950 leading-relaxed pl-6">
                    {children}
                  </div>
                </div>
              );
            }

            if (isDefinition) {
              return (
                <div className="my-5 p-4 rounded-xl border border-purple-200 bg-purple-50/80 text-purple-950 not-prose shadow-xs">
                  <div className="flex items-center gap-2 font-bold text-xs uppercase tracking-wider text-purple-700 mb-1.5">
                    <BookOpen className="w-4 h-4 text-purple-600" />
                    <span>Academic Definition</span>
                  </div>
                  <div className="text-xs sm:text-sm text-purple-950 leading-relaxed pl-6 font-medium">
                    {children}
                  </div>
                </div>
              );
            }

            if (isExample) {
              return (
                <div className="my-5 p-4 rounded-xl border border-emerald-200 bg-emerald-50/80 text-emerald-950 not-prose shadow-xs">
                  <div className="flex items-center gap-2 font-bold text-xs uppercase tracking-wider text-emerald-800 mb-1.5">
                    <Lightbulb className="w-4 h-4 text-emerald-600" />
                    <span>Worked Example</span>
                  </div>
                  <div className="text-xs sm:text-sm text-emerald-950 leading-relaxed pl-6">
                    {children}
                  </div>
                </div>
              );
            }

            if (isTip) {
              return (
                <div className="my-5 p-4 rounded-xl border border-cyan-200 bg-cyan-50/80 text-cyan-950 not-prose shadow-xs">
                  <div className="flex items-center gap-2 font-bold text-xs uppercase tracking-wider text-cyan-800 mb-1.5">
                    <Sparkles className="w-4 h-4 text-cyan-600" />
                    <span>Pro Tip</span>
                  </div>
                  <div className="text-xs sm:text-sm text-cyan-950 leading-relaxed pl-6">
                    {children}
                  </div>
                </div>
              );
            }

            if (isKeyPoints) {
              return (
                <div className="my-5 p-4 rounded-xl border border-indigo-200 bg-indigo-50/80 text-indigo-950 not-prose shadow-xs">
                  <div className="flex items-center gap-2 font-bold text-xs uppercase tracking-wider text-indigo-800 mb-1.5">
                    <Award className="w-4 h-4 text-indigo-600" />
                    <span>Key Takeaway</span>
                  </div>
                  <div className="text-xs sm:text-sm text-indigo-950 leading-relaxed pl-6">
                    {children}
                  </div>
                </div>
              );
            }

            if (isPractice) {
              return (
                <div className="my-5 p-4 rounded-xl border border-slate-300 bg-slate-100/90 text-slate-900 not-prose shadow-xs">
                  <div className="flex items-center gap-2 font-bold text-xs uppercase tracking-wider text-slate-800 mb-1.5">
                    <FileQuestion className="w-4 h-4 text-slate-700" />
                    <span>Practice Exercise</span>
                  </div>
                  <div className="text-xs sm:text-sm text-slate-900 leading-relaxed pl-6">
                    {children}
                  </div>
                </div>
              );
            }

            return (
              <div className="my-5 p-4 rounded-xl border-l-4 border-blue-500 bg-blue-50/60 text-slate-800 not-prose shadow-xs">
                <div className="flex items-center gap-2 font-bold text-xs uppercase tracking-wider text-blue-700 mb-1">
                  <Info className="w-4 h-4 text-blue-600" />
                  <span>Note</span>
                </div>
                <div className="text-xs sm:text-sm text-slate-800 leading-relaxed pl-6">
                  {children}
                </div>
              </div>
            );
          },
          img: ({ node, ...props }) => (
            <LessonSmartImage {...props} />
          ),
          table: ({ node, ...props }) => (
            <div className="overflow-x-auto my-6 border border-slate-200 rounded-xl shadow-xs not-prose bg-white">
              <table {...props} className="min-w-full divide-y divide-slate-200 text-xs sm:text-sm" />
            </div>
          ),
          th: ({ node, ...props }) => (
            <th
              {...props}
              className="bg-slate-100 px-4 py-3 text-left text-xs font-bold text-slate-900 uppercase tracking-wider border-b border-slate-200"
            />
          ),
          td: ({ node, ...props }) => (
            <td
              {...props}
              className="px-4 py-3 text-xs sm:text-sm text-slate-700 border-b border-slate-100 leading-relaxed"
            />
          ),
          a: ({ node, ...props }) => (
            <a
              {...props}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 font-semibold underline underline-offset-2 hover:text-blue-800 inline-flex items-center gap-0.5"
            >
              <span>{props.children}</span>
              <ExternalLink className="w-3 h-3 inline-block opacity-70" />
            </a>
          )
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};

