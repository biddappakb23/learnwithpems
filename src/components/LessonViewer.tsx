import React, { useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  HelpCircle,
  Lightbulb,
  AlertTriangle,
  Code2,
  BookOpen,
  Sparkles,
  Bookmark,
  Share2,
  Check,
  FileQuestion,
  Play
} from "lucide-react";
import confetti from "canvas-confetti";
import { Lesson, Module, StudentProgress } from "../types";
import { CodePlayground } from "./CodePlayground";
import { getCourseExecutionProfile } from "../services/executionProfile";
import { RichContentViewer } from "./RichContentViewer";
import { handleProtectedCopy } from "../utils/antiCopy";

interface LessonViewerProps {
  lesson: Lesson;
  allLessons: Lesson[];
  modules: Module[];
  progress: StudentProgress;
  onToggleComplete: (lessonId: string) => void;
  onSelectLesson: (lessonId: string) => void;
  onBackToCourse: () => void;
  onTakeQuiz: (moduleId: string, lessonId?: string) => void;
  onOpenPractice: () => void;
}

export const LessonViewer: React.FC<LessonViewerProps> = ({
  lesson,
  allLessons,
  modules,
  progress,
  onToggleComplete,
  onSelectLesson,
  onBackToCourse,
  onTakeQuiz,
  onOpenPractice
}) => {
  const isCompleted = progress.completedLessonIds.includes(lesson.id);
  const [copiedSyntax, setCopiedSyntax] = useState(false);

  // Find previous and next lessons
  const currentIndex = allLessons.findIndex((l) => l.id === lesson.id);
  const prevLesson = currentIndex > 0 ? allLessons[currentIndex - 1] : null;
  const nextLesson = currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1] : null;

  const currentModule = modules.find((m) => m.id === lesson.moduleId);
  const courseId = currentModule?.courseId || "learn-c";

  const handleMarkComplete = () => {
    onToggleComplete(lesson.id);
    if (!isCompleted) {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
    }
  };

  const copySyntax = () => {
    if (lesson.syntax) {
      navigator.clipboard.writeText(lesson.syntax);
      setCopiedSyntax(true);
      setTimeout(() => setCopiedSyntax(false), 2000);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in duration-300 pb-12 font-sans">
      {/* Top Breadcrumb Nav & Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white border border-slate-200 rounded-xl p-3.5 sm:p-4 shadow-sm">
        <div className="flex items-center gap-2 text-xs truncate max-w-full">
          <button
            onClick={onBackToCourse}
            className="flex items-center gap-1.5 text-slate-500 hover:text-slate-900 font-medium transition-colors cursor-pointer shrink-0"
          >
            <ArrowLeft className="w-4 h-4" /> <span className="hidden xs:inline">Back to</span> Modules
          </button>
          <span className="text-slate-300">/</span>
          <span className="text-blue-600 font-semibold truncate">{currentModule?.title || "Module"}</span>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <button
            onClick={handleMarkComplete}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm ${
              isCompleted
                ? "bg-emerald-100 text-emerald-800 border border-emerald-300 hover:bg-emerald-200"
                : "bg-blue-600 hover:bg-blue-700 text-white"
            }`}
          >
            <CheckCircle className="w-4 h-4" />
            {isCompleted ? "Completed ✓" : "Mark Done"}
          </button>
        </div>
      </div>

      {/* Lesson Title Header */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider bg-blue-50 text-blue-600 border border-blue-100 px-3 py-1 rounded-md">
            Lesson {lesson.displayOrder}
          </span>
          <span className="text-xs text-slate-500 font-medium">{lesson.difficulty}</span>
          <span className="text-xs text-slate-400 font-medium">• Est. {lesson.estimatedMinutes} mins</span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          {lesson.title}
        </h1>

        <p className="text-sm text-slate-600 leading-relaxed">{lesson.shortDesc}</p>

        {/* Learning Objectives Box */}
        {lesson.learningObjectives && lesson.learningObjectives.length > 0 && (
          <div className="bg-blue-50/60 border border-blue-100 rounded-xl p-4 space-y-2 mt-4">
            <h3 className="text-xs font-bold text-blue-700 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" /> Learning Objectives
            </h3>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-slate-700">
              {lesson.learningObjectives.map((obj, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                  <span>{obj}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Theory Content */}
      <div
        onCopy={handleProtectedCopy}
        onCut={handleProtectedCopy}
        className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm space-y-6 select-none"
      >
        <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-blue-600" /> Concept & Theory
        </h2>

        <RichContentViewer content={lesson.theoryContent} />

        {/* Important Points */}
        {lesson.importantPoints && lesson.importantPoints.length > 0 && (
          <div className="bg-amber-50/80 border border-amber-200 rounded-xl p-4 space-y-2">
            <h3 className="text-xs font-bold text-amber-800 uppercase tracking-wider flex items-center gap-1.5">
              <Lightbulb className="w-4 h-4 text-amber-600" /> Key Takeaways
            </h3>
            <ul className="space-y-1.5 text-xs text-amber-900">
              {lesson.importantPoints.map((pt, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-amber-600 font-bold">•</span>
                  <span>{pt}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Syntax Block */}
        {lesson.syntax && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Code2 className="w-4 h-4 text-blue-600" /> Syntax Definition
              </h3>
              <button
                onClick={copySyntax}
                className="text-[11px] text-slate-500 hover:text-blue-600 flex items-center gap-1 cursor-pointer"
              >
                {copiedSyntax ? "Copied!" : "Copy Syntax"}
              </button>
            </div>
            <pre className="bg-slate-900 border border-slate-800 rounded-xl p-4 font-mono text-xs text-emerald-300 overflow-x-auto leading-relaxed">
              {lesson.syntax}
            </pre>
          </div>
        )}
      </div>

      {/* Code Examples & Interactive Playground (Only if online editor is required) */}
      {(lesson.editorRequired !== false && lesson.editorType !== "none") && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Code2 className="w-5 h-5 text-blue-600" /> Interactive {getCourseExecutionProfile(courseId).languageDisplayName} Code Runner
            </h2>
            <span className="text-xs text-slate-500">Run & test code live in browser</span>
          </div>

          {lesson.codeExamples && lesson.codeExamples.length > 0 ? (
            lesson.codeExamples.map((ex) => (
              <div key={ex.id} className="space-y-3">
                <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
                  <h3 className="text-sm font-bold text-slate-900 mb-1">{ex.title}</h3>
                  <p className="text-xs text-slate-600 mb-3">{ex.explanation}</p>

                  {/* Interactive Code Runner component */}
                  <CodePlayground initialCode={ex.code} title={ex.title} showTemplates={false} courseId={courseId} />
                </div>
              </div>
            ))
          ) : (
            <CodePlayground
              initialCode={
                lesson.starterCode ||
                lesson.syntax ||
                (getCourseExecutionProfile(courseId).language === "python"
                  ? `# Practice Python Code Here\nprint("Hello, Learnwithpems!")`
                  : `#include <stdio.h>\n\nint main(void) {\n    printf("Practice C Code Here\\n");\n    return 0;\n}`)
              }
              courseId={courseId}
            />
          )}
        </div>
      )}

      {/* Common Mistakes & Pro Tips Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Common Mistakes */}
        {lesson.commonMistakes && lesson.commonMistakes.length > 0 && (
          <div className="bg-rose-50/60 border border-rose-200 rounded-2xl p-5 space-y-3">
            <h3 className="text-sm font-bold text-rose-800 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600" /> Common Pitfalls & Mistakes
            </h3>
            <ul className="space-y-2 text-xs text-slate-700">
              {lesson.commonMistakes.map((mistake, idx) => (
                <li key={idx} className="flex items-start gap-2 bg-white p-2.5 rounded-lg border border-rose-100 shadow-xs">
                  <span className="text-rose-600 font-bold text-xs shrink-0">✕</span>
                  <span>{mistake}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Pro Tips */}
        {lesson.tips && lesson.tips.length > 0 && (
          <div className="bg-emerald-50/60 border border-emerald-200 rounded-2xl p-5 space-y-3">
            <h3 className="text-sm font-bold text-emerald-800 flex items-center gap-2">
              <Lightbulb className="w-4 h-4 text-emerald-600" /> Developer Tips & Best Practices
            </h3>
            <ul className="space-y-2 text-xs text-slate-700">
              {lesson.tips.map((tip, idx) => (
                <li key={idx} className="flex items-start gap-2 bg-white p-2.5 rounded-lg border border-emerald-100 shadow-xs">
                  <span className="text-emerald-600 font-bold text-xs shrink-0">✓</span>
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* References & Citations */}
      {lesson.references && lesson.references.length > 0 && (
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs text-slate-500 space-y-1">
          <div className="font-semibold text-slate-700 uppercase text-[10px] tracking-wider">References & Citation</div>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
            {lesson.references.map((ref, idx) => (
              <span key={idx} className="flex items-center gap-1">
                • {ref.includes("http") ? (
                  <a href={ref} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                    {ref}
                  </a>
                ) : (
                  <span>{ref}</span>
                )}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Practice & Quiz Triggers Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-slate-900">Ready to test your knowledge?</h3>
          <p className="text-xs text-slate-500">Take a module quiz or solve practice problems related to this lesson.</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onOpenPractice}
            className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer"
          >
            <Code2 className="w-4 h-4 text-blue-600" />
            Practice Lab
          </button>

          <button
            onClick={() => onTakeQuiz(lesson.moduleId, lesson.id)}
            className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-2 transition-all shadow-sm cursor-pointer"
          >
            <FileQuestion className="w-4 h-4" />
            Take Module Quiz
          </button>
        </div>
      </div>

      {/* Bottom Previous / Next Lesson Navigation */}
      <div className="flex items-center justify-between pt-4 border-t border-slate-200">
        {prevLesson ? (
          <button
            onClick={() => onSelectLesson(prevLesson.id)}
            className="px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer shadow-xs"
          >
            <ArrowLeft className="w-4 h-4" />
            Previous: {prevLesson.title}
          </button>
        ) : (
          <div />
        )}

        {nextLesson ? (
          <button
            onClick={() => onSelectLesson(nextLesson.id)}
            className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-2 transition-all shadow-sm cursor-pointer"
          >
            Next: {nextLesson.title}
            <ArrowRight className="w-4 h-4" />
          </button>
        ) : (
          <button
            onClick={onBackToCourse}
            className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-2 transition-all shadow-sm cursor-pointer"
          >
            Course Completed!
            <CheckCircle className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};
