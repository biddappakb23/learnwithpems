import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import {
  getCourseById,
  getModules,
  getChapters,
  getLessons,
  getStudentProgress,
  toggleLessonProgress
} from "../../services/db";
import { Course, Module, Chapter, Lesson, StudentProgress } from "../../types";
import { RichContentViewer } from "../RichContentViewer";
import { TechIcon } from "../TechIcon";
import {
  BookOpen,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Play,
  Terminal,
  Code2,
  FileText,
  HelpCircle,
  Clock,
  Sparkles,
  Share2,
  Download,
  Menu,
  X,
  Search,
  ExternalLink,
  RotateCcw,
  Check
} from "lucide-react";

interface CourseWorkspaceProps {
  courseId: string;
  initialLessonId?: string;
  onNavigateToDashboard: () => void;
  onOpenHelpline: (lessonContext?: { courseTitle?: string; lessonTitle?: string }) => void;
}

export const CourseWorkspace: React.FC<CourseWorkspaceProps> = ({
  courseId,
  initialLessonId,
  onNavigateToDashboard,
  onOpenHelpline
}) => {
  const { firebaseUser, enrollment, isAdmin } = useAuth();
  const [course, setCourse] = useState<Course | null>(null);
  const [modules, setModules] = useState<Module[]>([]);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);
  const [progress, setProgress] = useState<StudentProgress | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"notes" | "compiler" | "resources">("notes");
  const [isLoading, setIsLoading] = useState(true);

  // Live Compiler State
  const [code, setCode] = useState<string>("");
  const [stdin, setStdin] = useState<string>("");
  const [compilerOutput, setCompilerOutput] = useState<string>("");
  const [isRunningCode, setIsRunningCode] = useState<boolean>(false);

  useEffect(() => {
    loadCourseData();
  }, [courseId]);

  const loadCourseData = async () => {
    setIsLoading(true);
    try {
      const [c, mods, chaps, les] = await Promise.all([
        getCourseById(courseId),
        getModules(courseId),
        getChapters(),
        getLessons(courseId)
      ]);

      setCourse(c);
      setModules(mods);
      setChapters(chaps);
      setLessons(les);

      // Select active lesson
      let targetLesson = les[0] || null;
      if (initialLessonId) {
        const match = les.find((l) => l.id === initialLessonId);
        if (match) targetLesson = match;
      }
      setActiveLesson(targetLesson);

      if (targetLesson) {
        initCompilerCode(targetLesson, c);
      }

      // Load progress
      if (firebaseUser) {
        const prog = await getStudentProgress(firebaseUser.uid, courseId);
        setProgress(prog);
      }
    } catch (err) {
      console.error("Error loading course workspace:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const initCompilerCode = (lesson: Lesson, courseObj: Course | null) => {
    if (lesson.starterCode) {
      setCode(lesson.starterCode);
    } else if (lesson.codeExamples && lesson.codeExamples.length > 0) {
      setCode(lesson.codeExamples[0].code);
    } else if (courseObj?.editorLanguage === "Python" || courseId.includes("python")) {
      setCode(`# Python 3 - ${lesson.title}\n\ndef main():\n    print("Welcome to LearnWithPems Python Workspace!")\n\nif __name__ == "__main__":\n    main()\n`);
    } else {
      setCode(`// C Programming - ${lesson.title}\n#include <stdio.h>\n\nint main() {\n    printf("Welcome to LearnWithPems C Learning Workspace!\\n");\n    return 0;\n}\n`);
    }
    setCompilerOutput("");
  };

  const handleSelectLesson = (lesson: Lesson) => {
    setActiveLesson(lesson);
    initCompilerCode(lesson, course);
    if (window.innerWidth < 1024) {
      setSidebarOpen(false);
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleToggleComplete = async () => {
    if (!firebaseUser || !activeLesson) return;
    const isCompleted = progress?.completedLessonIds?.includes(activeLesson.id) || false;
    const updated = await toggleLessonProgress(firebaseUser.uid, courseId, activeLesson.id, !isCompleted);
    setProgress(updated);
  };

  const handleNextLesson = () => {
    if (!activeLesson) return;
    const currentIndex = lessons.findIndex((l) => l.id === activeLesson.id);
    if (currentIndex >= 0 && currentIndex < lessons.length - 1) {
      handleSelectLesson(lessons[currentIndex + 1]);
    }
  };

  const handlePrevLesson = () => {
    if (!activeLesson) return;
    const currentIndex = lessons.findIndex((l) => l.id === activeLesson.id);
    if (currentIndex > 0) {
      handleSelectLesson(lessons[currentIndex - 1]);
    }
  };

  const handleRunCode = async () => {
    if (!code.trim()) return;
    setIsRunningCode(true);
    setCompilerOutput("Compiling and executing code securely...");

    const isPython = course?.editorLanguage === "Python" || courseId.includes("python") || activeLesson?.editorType === "python";
    const endpoint = isPython ? "/api/python-runner" : "/api/c-runner";

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code,
          stdin,
          courseId
        })
      });

      if (res.ok) {
        const data = await res.json();
        setCompilerOutput(data.output || data.stdout || "Program finished with no output.");
      } else {
        const err = await res.json().catch(() => ({}));
        setCompilerOutput(err.output || err.stderr || "Execution failed. Please check your syntax.");
      }
    } catch (err: any) {
      setCompilerOutput(`Network Error: ${err.message || "Failed to reach execution runner"}`);
    } finally {
      setIsRunningCode(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-medium text-slate-500">Preparing lecture materials & workspace...</p>
        </div>
      </div>
    );
  }

  const completedIds = progress?.completedLessonIds || [];
  const isCurrentComplete = activeLesson ? completedIds.includes(activeLesson.id) : false;
  const currentIdx = activeLesson ? lessons.findIndex((l) => l.id === activeLesson.id) : 0;
  const progressPct = lessons.length > 0 ? Math.round((completedIds.length / lessons.length) * 100) : 0;

  // Filter lessons based on search query
  const filteredLessons = searchQuery
    ? lessons.filter(
        (l) =>
          l.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          l.shortDesc?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : lessons;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col">
      {/* Top Workspace Header Bar */}
      <div className="sticky top-16 z-30 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 sm:px-6 py-3 flex items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Toggle Curriculum Sidebar"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="min-w-0">
            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
              <button
                onClick={onNavigateToDashboard}
                className="hover:text-blue-600 dark:hover:text-blue-400 font-medium truncate max-w-[120px]"
              >
                Dashboard
              </button>
              <span>/</span>
              <span className="truncate max-w-[150px] font-semibold text-slate-700 dark:text-slate-300">
                {course?.title || "Course"}
              </span>
            </div>
            <h1 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white truncate">
              {activeLesson?.title || "Select a Lesson"}
            </h1>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Progress Indicator */}
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-semibold">
            <span className="text-blue-600 dark:text-blue-400">{progressPct}%</span>
            <div className="w-16 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-600 rounded-full transition-all duration-300"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>

          {/* Mark Complete Checkmark */}
          {activeLesson && (
            <button
              onClick={handleToggleComplete}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                isCurrentComplete
                  ? "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800"
                  : "bg-slate-100 dark:bg-slate-800 hover:bg-emerald-50 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700"
              }`}
            >
              <Check className={`w-4 h-4 ${isCurrentComplete ? "text-emerald-600" : "text-slate-400"}`} />
              <span className="hidden sm:inline">{isCurrentComplete ? "Completed" : "Mark Complete"}</span>
            </button>
          )}

          {/* Ask Faculty */}
          <button
            onClick={() => onOpenHelpline({ courseTitle: course?.title, lessonTitle: activeLesson?.title })}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-50 dark:bg-purple-950/50 hover:bg-purple-100 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800/60 text-xs font-semibold transition-all cursor-pointer"
          >
            <HelpCircle className="w-4 h-4 text-purple-600" />
            <span className="hidden sm:inline">Ask Faculty</span>
          </button>

          {/* Prev / Next Buttons */}
          <div className="flex items-center gap-1">
            <button
              onClick={handlePrevLesson}
              disabled={currentIdx <= 0}
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
              title="Previous Lesson"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleNextLesson}
              disabled={currentIdx >= lessons.length - 1}
              className="p-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer shadow-sm"
              title="Next Lesson"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Workspace Body with Sidebar & Content */}
      <div className="flex-1 flex max-w-full">
        {/* Left Sidebar Curriculum Navigation */}
        {sidebarOpen && (
          <aside className="w-80 shrink-0 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col h-[calc(100vh-8rem)] sticky top-32 overflow-hidden shadow-lg z-20">
            {/* Search Box */}
            <div className="p-3.5 border-b border-slate-100 dark:border-slate-800">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search lessons & topics..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Modules and Chapters Tree */}
            <div className="flex-1 overflow-y-auto p-3 space-y-4">
              {modules.map((mod, modIdx) => {
                const modLessons = filteredLessons.filter((l) => l.moduleId === mod.id);
                if (modLessons.length === 0 && searchQuery) return null;

                return (
                  <div key={mod.id} className="space-y-1.5">
                    <div className="px-2 py-1 flex items-center justify-between text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider bg-slate-50 dark:bg-slate-800/40 rounded-lg">
                      <span className="truncate">
                        Module {modIdx + 1}: {mod.title}
                      </span>
                    </div>

                    <div className="space-y-1 pl-1">
                      {modLessons.map((les) => {
                        const isActive = activeLesson?.id === les.id;
                        const isDone = completedIds.includes(les.id);

                        return (
                          <button
                            key={les.id}
                            onClick={() => handleSelectLesson(les)}
                            className={`w-full text-left p-2 rounded-xl text-xs flex items-start gap-2.5 transition-all cursor-pointer ${
                              isActive
                                ? "bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-bold shadow-xs border border-blue-200 dark:border-blue-800"
                                : "text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60"
                            }`}
                          >
                            <div className="mt-0.5 shrink-0">
                              {isDone ? (
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                              ) : (
                                <div
                                  className={`w-3.5 h-3.5 rounded-full border ${
                                    isActive ? "border-blue-600 bg-blue-600" : "border-slate-300 dark:border-slate-600"
                                  }`}
                                />
                              )}
                            </div>
                            <span className="line-clamp-2 leading-relaxed">{les.title}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Bottom Course Progress Card */}
            <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/70">
              <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                <span>Course Completion</span>
                <span>{progressPct}%</span>
              </div>
              <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full transition-all duration-300"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-[11px] text-slate-500 mt-2">
                <span>{completedIds.length} done</span>
                <span>{lessons.length} total lessons</span>
              </div>
            </div>
          </aside>
        )}

        {/* Main Content Workspace */}
        <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 space-y-6 max-w-5xl mx-auto">
          {activeLesson ? (
            <div className="space-y-6">
              {/* Tab Selector: Theory Notes vs Interactive Compiler */}
              <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
                <button
                  onClick={() => setActiveTab("notes")}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    activeTab === "notes"
                      ? "bg-blue-600 text-white shadow-md shadow-blue-600/20"
                      : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                  }`}
                >
                  <BookOpen className="w-4 h-4" />
                  <span>Lecture Theory Notes</span>
                </button>

                <button
                  onClick={() => setActiveTab("compiler")}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    activeTab === "compiler"
                      ? "bg-blue-600 text-white shadow-md shadow-blue-600/20"
                      : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                  }`}
                >
                  <Terminal className="w-4 h-4" />
                  <span>Live Code Compiler</span>
                </button>
              </div>

              {/* TAB 1: Theory Notes & Rich Content Viewer */}
              {activeTab === "notes" && (
                <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 lg:p-10 border border-slate-200 dark:border-slate-800 shadow-sm space-y-8">
                  {/* Lesson Title Header */}
                  <div className="space-y-2 border-b border-slate-100 dark:border-slate-800 pb-6">
                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                      <BookOpen className="w-4 h-4" />
                      <span>{course?.title}</span>
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                      {activeLesson.title}
                    </h1>
                    {activeLesson.shortDesc && (
                      <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed pt-1">
                        {activeLesson.shortDesc}
                      </p>
                    )}
                  </div>

                  {/* Learning Objectives Box if available */}
                  {activeLesson.learningObjectives && activeLesson.learningObjectives.length > 0 && (
                    <div className="p-5 rounded-2xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200/80 dark:border-blue-800/60 space-y-2.5">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-blue-900 dark:text-cyan-300 flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4 text-blue-600 dark:text-cyan-400" /> Learning Objectives
                      </h4>
                      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-700 dark:text-slate-300">
                        {activeLesson.learningObjectives.map((obj, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 dark:text-cyan-400 shrink-0 mt-0.5" />
                            <span>{obj}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Main Markdown / Rich Theory Content */}
                  <div className="prose prose-slate dark:prose-invert max-w-none text-slate-800 dark:text-slate-200">
                    <RichContentViewer
                      content={activeLesson.theoryContent || activeLesson.content || activeLesson.description || "Lecture content loading..."}
                    />
                  </div>

                  {/* Embedded Code Examples */}
                  {activeLesson.codeExamples && activeLesson.codeExamples.length > 0 && (
                    <div className="space-y-4 pt-6 border-t border-slate-100 dark:border-slate-800">
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <Code2 className="w-5 h-5 text-blue-600" /> Working Code Examples
                      </h3>

                      {activeLesson.codeExamples.map((ex, idx) => (
                        <div
                          key={ex.id || idx}
                          className="rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden bg-slate-900 text-slate-100"
                        >
                          <div className="px-4 py-2.5 bg-slate-800 flex items-center justify-between border-b border-slate-700">
                            <span className="text-xs font-bold text-cyan-300">{ex.title}</span>
                            <button
                              onClick={() => {
                                setCode(ex.code);
                                setActiveTab("compiler");
                              }}
                              className="px-3 py-1 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                            >
                              <Play className="w-3 h-3" />
                              <span>Open in Compiler</span>
                            </button>
                          </div>
                          <pre className="p-4 text-xs font-mono overflow-x-auto text-emerald-400 leading-relaxed">
                            {ex.code}
                          </pre>
                          {ex.expectedOutput && (
                            <div className="p-3 bg-black/40 border-t border-slate-800 text-xs font-mono text-slate-300">
                              <span className="text-slate-500 font-bold uppercase text-[10px]">Expected Output:</span>
                              <pre className="mt-1 whitespace-pre-wrap">{ex.expectedOutput}</pre>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Next Lesson Action Card */}
                  <div className="p-6 rounded-2xl bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 dark:from-slate-800 dark:to-slate-800/80 border border-blue-200 dark:border-slate-700 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                        {isCurrentComplete ? "Ready for the next lesson?" : "Completed this lesson?"}
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        Mark as completed to track your curriculum progress and earn learning XP.
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={handleToggleComplete}
                        className={`px-4 py-2.5 rounded-xl font-bold text-xs shadow-sm transition-all cursor-pointer ${
                          isCurrentComplete
                            ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                            : "bg-white dark:bg-slate-700 hover:bg-slate-50 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-600"
                        }`}
                      >
                        {isCurrentComplete ? "✓ Completed (+50 XP)" : "Mark Complete"}
                      </button>
                      <button
                        onClick={handleNextLesson}
                        disabled={currentIdx >= lessons.length - 1}
                        className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-600/20 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-40"
                      >
                        <span>Next Lesson</span>
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: Live Code Compiler & Execution Terminal */}
              {activeTab === "compiler" && (
                <div className="space-y-4">
                  <div className="bg-slate-900 rounded-3xl border border-slate-800 shadow-xl overflow-hidden">
                    {/* Compiler Toolbar */}
                    <div className="px-5 py-3 bg-slate-800/90 border-b border-slate-700 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-red-500" />
                        <div className="w-3 h-3 rounded-full bg-amber-500" />
                        <div className="w-3 h-3 rounded-full bg-emerald-500" />
                        <span className="text-xs font-mono font-bold text-slate-300 ml-2">
                          {course?.editorLanguage || "C"} Interactive Sandbox
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => initCompilerCode(activeLesson, course)}
                          className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-700 rounded-lg text-xs flex items-center gap-1 transition-colors"
                          title="Reset Code"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={handleRunCode}
                          disabled={isRunningCode}
                          className="px-4 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-md shadow-emerald-500/20 flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
                        >
                          <Play className="w-3.5 h-3.5 fill-current" />
                          <span>{isRunningCode ? "Running..." : "Run Code"}</span>
                        </button>
                      </div>
                    </div>

                    {/* Code Editor TextArea */}
                    <div className="p-4 bg-slate-950">
                      <textarea
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                        rows={16}
                        spellCheck={false}
                        className="w-full font-mono text-xs text-emerald-400 bg-transparent resize-y focus:outline-none leading-relaxed"
                        placeholder="Type your source code here..."
                      />
                    </div>

                    {/* STDIN Input Box */}
                    <div className="px-4 py-3 bg-slate-900 border-t border-slate-800">
                      <label className="block text-[11px] font-mono font-bold text-slate-400 uppercase tracking-wider mb-1">
                        Standard Input (stdin)
                      </label>
                      <input
                        type="text"
                        value={stdin}
                        onChange={(e) => setStdin(e.target.value)}
                        placeholder="Values to feed into scanf() or input()..."
                        className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-slate-200 placeholder-slate-600 focus:outline-none focus:border-blue-500"
                      />
                    </div>

                    {/* Output Terminal */}
                    <div className="p-4 bg-slate-950 border-t border-slate-800">
                      <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 uppercase tracking-wider mb-2">
                        <span>Terminal Output</span>
                        {isRunningCode && <span className="text-cyan-400 animate-pulse">Executing on backend...</span>}
                      </div>
                      <pre className="p-4 rounded-xl bg-black font-mono text-xs text-slate-200 whitespace-pre-wrap min-h-[100px] max-h-[300px] overflow-y-auto leading-relaxed border border-slate-800">
                        {compilerOutput || "Click 'Run Code' above to compile and execute."}
                      </pre>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-20 text-slate-500">
              <BookOpen className="w-12 h-12 mx-auto mb-3 text-slate-400" />
              <h3 className="text-lg font-bold text-slate-700 dark:text-slate-300">No Lesson Selected</h3>
              <p className="text-xs">Choose a topic from the curriculum sidebar to begin reading.</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};
