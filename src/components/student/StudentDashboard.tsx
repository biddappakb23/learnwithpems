import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import {
  getStudentProgress,
  getModules,
  getLessons,
  getCourses,
  enrollStudentInCourse
} from "../../services/db";
import { Course, Module, Lesson, StudentProgress } from "../../types";
import { TechIcon } from "../TechIcon";
import {
  BookOpen,
  CheckCircle2,
  Clock,
  Award,
  Play,
  ArrowRight,
  Sparkles,
  Terminal,
  FileText,
  HelpCircle,
  BarChart3,
  Flame,
  Layers,
  ChevronRight,
  GraduationCap
} from "lucide-react";

interface StudentDashboardProps {
  onNavigateToCourse: (courseId: string, lessonId?: string) => void;
  onNavigateToView: (view: string) => void;
  onOpenHelpline: () => void;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({
  onNavigateToCourse,
  onNavigateToView,
  onOpenHelpline
}) => {
  const { firebaseUser, userProfile, enrollment, enrolledCourse, refreshEnrollment } = useAuth();
  const [modules, setModules] = useState<Module[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [progress, setProgress] = useState<StudentProgress | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [allCourses, setAllCourses] = useState<Course[]>([]);
  const [isEnrolling, setIsEnrolling] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, [firebaseUser, enrollment]);

  const loadDashboardData = async () => {
    if (!firebaseUser) return;
    setIsLoading(true);

    try {
      if (enrollment && enrollment.courseId) {
        const [mods, les, prog] = await Promise.all([
          getModules(enrollment.courseId),
          getLessons(enrollment.courseId),
          getStudentProgress(firebaseUser.uid, enrollment.courseId)
        ]);
        setModules(mods);
        setLessons(les);
        setProgress(prog);
      } else {
        // Fetch all courses for fallback enrollment picker
        const courses = await getCourses();
        setAllCourses(courses.filter((c) => c.status === "Published" || !c.status));
      }
    } catch (err) {
      console.warn("Error loading student dashboard:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChooseCourse = async (courseId: string, courseTitle: string) => {
    if (!firebaseUser) return;
    setIsEnrolling(true);
    try {
      await enrollStudentInCourse(
        firebaseUser.uid,
        userProfile?.name || firebaseUser.displayName || "Student",
        firebaseUser.email || "",
        courseId,
        courseTitle
      );
      await refreshEnrollment();
      onNavigateToCourse(courseId);
    } catch (err) {
      console.error("Course selection error:", err);
    } finally {
      setIsEnrolling(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-medium text-slate-500">Loading your learning workspace...</p>
        </div>
      </div>
    );
  }

  // CASE 1: Student not yet enrolled in any course
  if (!enrollment || !enrollment.courseId) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-12">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 text-xs font-semibold mb-3">
            <GraduationCap className="w-4 h-4" /> Welcome, {userProfile?.name || "Student"}!
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Choose Your Primary Course to Start Learning
          </h1>
          <p className="mt-2 text-slate-600 dark:text-slate-400 text-sm">
            Select one active course from our university-curated curriculum. You will receive direct access to all lectures, practice labs, interactive compilers, and assessments.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {allCourses.map((course) => (
            <div
              key={course.id}
              className="group relative bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-xl hover:border-blue-500/50 transition-all duration-200 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-slate-700 text-blue-600 dark:text-blue-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <TechIcon name={course.techIcon || "c-lang"} className="w-6 h-6" />
                  </div>
                  <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                    {course.difficulty}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {course.title}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 line-clamp-3 leading-relaxed">
                  {course.shortDesc}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between">
                <span className="text-xs text-slate-500 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" /> {course.estimatedDurationHours || 40} Hours
                </span>
                <button
                  onClick={() => handleChooseCourse(course.id, course.title)}
                  disabled={isEnrolling}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-md shadow-blue-600/20 hover:shadow-lg transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <span>Enroll & Start</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // CASE 2: Active Student Dashboard
  const completedIds = progress?.completedLessonIds || [];
  const totalLessonsCount = lessons.length || 1;
  const completedCount = completedIds.length;
  const completionPercentage = Math.min(100, Math.round((completedCount / totalLessonsCount) * 100));

  // Determine next uncompleted lesson
  const nextLesson = lessons.find((l) => !completedIds.includes(l.id)) || lessons[0];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* 1. Welcome & Primary Course Hero Banner */}
      <div className="relative rounded-3xl bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white p-6 sm:p-8 lg:p-10 shadow-xl overflow-hidden border border-blue-800/40">
        {/* Ambient background blur elements */}
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-cyan-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-12 w-64 h-64 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-cyan-300 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" /> Active Course Enrollment
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight">
              {enrolledCourse?.title || enrollment.courseTitle || "My Course"}
            </h1>
            <p className="text-sm text-slate-300 leading-relaxed line-clamp-2">
              {enrolledCourse?.shortDesc ||
                "Access all syllabus units, chapter theory notes, live code compiler, and chapter assessments."}
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2 text-xs text-slate-300">
              <span className="flex items-center gap-1.5 bg-black/20 px-3 py-1 rounded-lg">
                <Clock className="w-4 h-4 text-cyan-400" /> {enrolledCourse?.estimatedDurationHours || 45} Total Hours
              </span>
              <span className="flex items-center gap-1.5 bg-black/20 px-3 py-1 rounded-lg">
                <BookOpen className="w-4 h-4 text-cyan-400" /> {modules.length} Modules ({lessons.length} Lessons)
              </span>
              <span className="flex items-center gap-1.5 bg-black/20 px-3 py-1 rounded-lg">
                <GraduationCap className="w-4 h-4 text-cyan-400" /> Instructor: {enrolledCourse?.instructorName || "Pemmaiah U. T."}
              </span>
            </div>
          </div>

          {/* Primary Action Button */}
          <div className="flex flex-col sm:flex-row lg:flex-col gap-3 shrink-0">
            <button
              onClick={() => onNavigateToCourse(enrollment.courseId, nextLesson?.id)}
              className="px-6 py-3.5 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-sm shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 transition-all flex items-center justify-center gap-2 cursor-pointer group"
            >
              <Play className="w-4 h-4 fill-current group-hover:scale-110 transition-transform" />
              <span>Continue Learning</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => onNavigateToCourse(enrollment.courseId)}
              className="px-6 py-3.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-semibold text-sm backdrop-blur-md border border-white/10 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <BookOpen className="w-4 h-4" />
              <span>Open Course Curriculum</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Key Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
            <BarChart3 className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900 dark:text-slate-100">{completionPercentage}%</div>
            <div className="text-xs text-slate-500 font-medium">Course Progress</div>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900 dark:text-slate-100">
              {completedCount} / {totalLessonsCount}
            </div>
            <div className="text-xs text-slate-500 font-medium">Completed Lessons</div>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
            <Flame className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900 dark:text-slate-100">{progress?.totalXP || completedCount * 50}</div>
            <div className="text-xs text-slate-500 font-medium">Learning XP</div>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900 dark:text-slate-100">{modules.length}</div>
            <div className="text-xs text-slate-500 font-medium">Syllabus Modules</div>
          </div>
        </div>
      </div>

      {/* 3. Quick Action Hub */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div
          onClick={() => onNavigateToCourse(enrollment.courseId)}
          className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 hover:border-blue-500 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
            <BookOpen className="w-5 h-5" />
          </div>
          <h4 className="font-bold text-slate-900 dark:text-slate-100 text-sm">Course Workspace</h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Read comprehensive lecture notes and diagrams.
          </p>
        </div>

        <div
          onClick={() => onNavigateToView("practice")}
          className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 hover:border-indigo-500 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
            <Terminal className="w-5 h-5" />
          </div>
          <h4 className="font-bold text-slate-900 dark:text-slate-100 text-sm">Interactive Compiler</h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Run, test, and debug native C & Python code.
          </p>
        </div>

        <div
          onClick={() => onNavigateToView("notes")}
          className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 hover:border-emerald-500 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
            <FileText className="w-5 h-5" />
          </div>
          <h4 className="font-bold text-slate-900 dark:text-slate-100 text-sm">PDF Documents & Notes</h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Download lecture slides and curriculum PDFs.
          </p>
        </div>

        <div
          onClick={onOpenHelpline}
          className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 hover:border-purple-500 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
            <HelpCircle className="w-5 h-5" />
          </div>
          <h4 className="font-bold text-slate-900 dark:text-slate-100 text-sm">Ask Academic Helpline</h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Get instant AI clarifications and ask HOD.
          </p>
        </div>
      </div>

      {/* 4. Course Curriculum Modules Overview */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">Course Curriculum & Modules</h2>
            <p className="text-xs text-slate-500 mt-0.5">Click any module to open lessons in the learning workspace</p>
          </div>
          <button
            onClick={() => onNavigateToCourse(enrollment.courseId)}
            className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
          >
            <span>View All Lessons</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-3">
          {modules.map((mod, idx) => {
            const modLessons = lessons.filter((l) => l.moduleId === mod.id);
            const modCompleted = modLessons.filter((l) => completedIds.includes(l.id)).length;
            const modPercent = modLessons.length > 0 ? Math.round((modCompleted / modLessons.length) * 100) : 0;

            return (
              <div
                key={mod.id}
                onClick={() => onNavigateToCourse(enrollment.courseId, modLessons[0]?.id)}
                className="p-5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-blue-500 hover:shadow-md transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-slate-700 text-blue-600 dark:text-blue-400 font-bold text-sm flex items-center justify-center shrink-0">
                    {idx + 1}
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">{mod.title}</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">{mod.shortDesc}</p>
                    <div className="flex items-center gap-3 mt-2 text-[11px] text-slate-500">
                      <span className="flex items-center gap-1">
                        <BookOpen className="w-3.5 h-3.5" /> {modLessons.length || 2} Lessons
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" /> {mod.estimatedDurationHours || 5} Hours
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 self-end sm:self-center">
                  <div className="text-right">
                    <div className="text-xs font-bold text-slate-700 dark:text-slate-300">{modPercent}%</div>
                    <div className="w-24 h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden mt-1">
                      <div
                        className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full"
                        style={{ width: `${modPercent}%` }}
                      />
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-400" />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
