import React from "react";
import { ArrowLeft, BookOpen, Clock, Calendar, Share2, Sparkles, ExternalLink, GraduationCap } from "lucide-react";
import { CustomMenuItem, CustomSubmenuItem, Course } from "../types";

interface CustomPageViewProps {
  title: string;
  subtitle?: string;
  content?: string;
  category?: string;
  updatedAt?: string;
  menuItem?: CustomMenuItem;
  submenuItem?: CustomSubmenuItem;
  onNavigateHome: () => void;
  onNavigateCourse?: (courseId: string) => void;
  courses?: Course[];
}

export const CustomPageView: React.FC<CustomPageViewProps> = ({
  title,
  subtitle,
  content,
  category = "Academic Resource",
  updatedAt = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }),
  menuItem,
  submenuItem,
  onNavigateHome,
  onNavigateCourse,
  courses = []
}) => {
  // Default academic template if content is empty
  const defaultBody = `# ${title}

Welcome to the **${title}** page. This section contains official academic resources, syllabus notes, and curriculum guidelines maintained by the faculty and administration.

---

### Overview & Objectives
- Comprehensive reference material aligned with Department syllabus
- Guided programming exercises, architecture insights, and practical methodologies
- Verified educational content curated by faculty members and academic leads

### Key Guidelines & Highlights
1. **Curriculum Alignment**: Designed in harmony with BCA / CS system programming standards.
2. **Structured Execution**: Follows step-by-step problem-solving principles.
3. **Assessment & Practice**: Work through interactive coding modules and chapter quizzes in your course dashboard.

> For additional assistance, laboratory schedules, or departmental inquiries, please reach out via the Contact portal.
`;

  const displayContent = content && content.trim().length > 0 ? content : defaultBody;

  return (
    <div className="min-h-[85vh] bg-slate-900 text-slate-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Navigation Breadcrumb & Back */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <button
            onClick={onNavigateHome}
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-400 hover:text-cyan-400 transition-colors cursor-pointer group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span>Back to Home</span>
          </button>

          <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
            <span>Portal</span>
            <span>/</span>
            {menuItem && (
              <>
                <span className="text-slate-300 font-medium">{menuItem.label}</span>
                <span>/</span>
              </>
            )}
            <span className="text-cyan-400 font-semibold truncate max-w-[200px]">{title}</span>
          </div>
        </div>

        {/* Header Hero Card */}
        <div className="bg-slate-950/80 border border-slate-800 rounded-3xl p-6 sm:p-8 relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />

          <div className="relative z-10 space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-950/80 text-cyan-300 border border-cyan-800 text-xs font-semibold">
                <Sparkles className="w-3.5 h-3.5" />
                {category}
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800 text-slate-400 text-xs font-mono">
                <Calendar className="w-3.5 h-3.5" />
                {updatedAt}
              </span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-100 tracking-tight leading-tight">
              {title}
            </h1>

            {subtitle && (
              <p className="text-sm sm:text-base text-slate-400 max-w-2xl leading-relaxed">
                {subtitle}
              </p>
            )}
          </div>
        </div>

        {/* Content Body Container */}
        <div className="bg-slate-950/50 border border-slate-800/80 rounded-3xl p-6 sm:p-10 shadow-xl space-y-6">
          <div className="prose prose-invert prose-cyan max-w-none prose-headings:font-bold prose-h1:text-2xl prose-h2:text-xl prose-h3:text-lg prose-p:text-slate-300 prose-p:leading-relaxed prose-li:text-slate-300 prose-blockquote:border-l-cyan-500 prose-blockquote:bg-slate-900/60 prose-blockquote:py-1 prose-blockquote:px-4 prose-blockquote:rounded-r-xl prose-blockquote:text-slate-300 prose-code:text-cyan-300 prose-code:bg-slate-900 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded">
            {displayContent.split("\n\n").map((block, idx) => {
              if (block.startsWith("# ")) {
                return (
                  <h1 key={idx} className="text-2xl font-bold text-slate-100 mt-6 mb-3 border-b border-slate-800 pb-2">
                    {block.replace("# ", "")}
                  </h1>
                );
              }
              if (block.startsWith("## ")) {
                return (
                  <h2 key={idx} className="text-xl font-bold text-slate-100 mt-6 mb-3 text-cyan-400">
                    {block.replace("## ", "")}
                  </h2>
                );
              }
              if (block.startsWith("### ")) {
                return (
                  <h3 key={idx} className="text-lg font-bold text-slate-200 mt-5 mb-2">
                    {block.replace("### ", "")}
                  </h3>
                );
              }
              if (block.startsWith("> ")) {
                return (
                  <blockquote key={idx} className="border-l-4 border-cyan-500 bg-slate-900/80 p-4 rounded-r-2xl my-4 text-slate-300 italic">
                    {block.replace("> ", "")}
                  </blockquote>
                );
              }
              if (block.startsWith("- ") || block.startsWith("* ")) {
                const items = block.split("\n").filter((line) => line.trim().length > 0);
                return (
                  <ul key={idx} className="space-y-2 my-3 pl-5 list-disc text-slate-300">
                    {items.map((it, i) => (
                      <li key={i}>{it.replace(/^[-*]\s+/, "")}</li>
                    ))}
                  </ul>
                );
              }
              if (/^\d+\.\s/.test(block)) {
                const items = block.split("\n").filter((line) => line.trim().length > 0);
                return (
                  <ol key={idx} className="space-y-2 my-3 pl-5 list-decimal text-slate-300">
                    {items.map((it, i) => (
                      <li key={i}>{it.replace(/^\d+\.\s+/, "")}</li>
                    ))}
                  </ol>
                );
              }
              if (block.startsWith("```")) {
                const lines = block.split("\n");
                const code = lines.slice(1, -1).join("\n");
                return (
                  <pre key={idx} className="bg-slate-900 text-cyan-300 p-4 rounded-2xl border border-slate-800 font-mono text-xs overflow-x-auto my-4">
                    <code>{code}</code>
                  </pre>
                );
              }
              if (block === "---") {
                return <hr key={idx} className="border-slate-800 my-6" />;
              }
              return (
                <p key={idx} className="text-slate-300 leading-relaxed my-3">
                  {block}
                </p>
              );
            })}
          </div>
        </div>

        {/* Quick Relevant Course Links if matching */}
        {courses.length > 0 && onNavigateCourse && (
          <div className="bg-slate-950/60 border border-slate-800 rounded-3xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-cyan-400" />
                <h3 className="text-base font-bold text-slate-100">Featured Course Curriculum</h3>
              </div>
              <button
                onClick={onNavigateHome}
                className="text-xs font-semibold text-cyan-400 hover:underline"
              >
                View Catalog
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {courses.slice(0, 2).map((course) => (
                <div
                  key={course.id}
                  onClick={() => onNavigateCourse(course.id)}
                  className="bg-slate-900/80 hover:bg-slate-900 border border-slate-800 hover:border-cyan-500/40 rounded-2xl p-4 transition-all cursor-pointer group flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between text-xs font-mono text-cyan-400 mb-1.5">
                      <span>{course.courseCode}</span>
                      <span className="text-[10px] text-slate-500">{course.difficulty}</span>
                    </div>
                    <h4 className="font-bold text-sm text-slate-100 group-hover:text-cyan-300 transition-colors">
                      {course.title}
                    </h4>
                    <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                      {course.shortDesc}
                    </p>
                  </div>
                  <div className="mt-3 pt-2 border-t border-slate-800 flex items-center justify-between text-xs text-cyan-400 font-semibold">
                    <span>Open Dashboard</span>
                    <ExternalLink className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
