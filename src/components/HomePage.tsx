import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { getCourses } from "../services/db";
import { Course } from "../types";
import { TechIcon } from "./TechIcon";
import { BrandLogo } from "./BrandLogo";
import {
  Sparkles,
  BookOpen,
  ArrowRight,
  Clock,
  GraduationCap,
  Terminal,
  ShieldCheck,
  CheckCircle2,
  Users,
  Award,
  Layers,
  ChevronRight
} from "lucide-react";

interface HomePageProps {
  onOpenAuth: (mode?: "signin" | "signup" | "admin", preselectedCourseId?: string) => void;
  onNavigateToCourse: (courseId: string) => void;
  onNavigateToView: (view: string) => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  onOpenAuth,
  onNavigateToCourse,
  onNavigateToView
}) => {
  const { firebaseUser, enrollment, enrolledCourse, isAdmin } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCourses()
      .then((data) => {
        setCourses(data.filter((c) => c.status === "Published" || !c.status));
      })
      .catch((e) => console.warn(e))
      .finally(() => setLoading(false));
  }, []);

  const handleEnrollClick = (courseId: string) => {
    if (firebaseUser) {
      onNavigateToCourse(courseId);
    } else {
      onOpenAuth("signup", courseId);
    }
  };

  return (
    <div className="space-y-16 sm:space-y-24 pb-20">
      {/* 1. Hero Section */}
      <section className="relative pt-6 sm:pt-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {/* Top Control Bar with Top-Left Admin Login Option */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mb-8 sm:mb-12">
          {/* Top Left: Admin / Faculty Login Option */}
          <div className="w-full sm:w-auto flex items-center justify-start">
            <button
              onClick={() => {
                if (isAdmin) {
                  onNavigateToView("admin");
                } else {
                  onOpenAuth("admin");
                }
              }}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-50 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300 text-xs font-bold hover:bg-purple-100 dark:hover:bg-purple-900/60 transition-all shadow-xs group cursor-pointer"
              title="Administrator & Faculty Portal"
            >
              <ShieldCheck className="w-4 h-4 text-purple-600 dark:text-purple-400 group-hover:scale-110 transition-transform" />
              <span>{isAdmin ? "Admin Control Center" : "Admin & Faculty Login"}</span>
              <span className="text-[10px] bg-purple-200/80 dark:bg-purple-900 px-1.5 py-0.5 rounded text-purple-900 dark:text-purple-200 font-semibold uppercase tracking-wider">
                {isAdmin ? "Active" : "Portal"}
              </span>
            </button>
          </div>

          {/* Top Right: Institutional Header */}
          <div className="w-full sm:w-auto flex items-center justify-center sm:justify-end">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-cyan-300 text-xs font-semibold shadow-xs">
              <Sparkles className="w-4 h-4 text-blue-600 dark:text-cyan-400" />
              <span>Academic Platform • Dept. of Computer Applications, Cauvery College</span>
            </div>
          </div>
        </div>

        <div className="text-center max-w-3xl mx-auto space-y-6">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 dark:text-white tracking-tight leading-[1.1]">
            Master Computer Science & Programming with{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-cyan-500 to-indigo-600">
              Confidence
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl mx-auto">
            University-curated BCA curriculum, rich theoretical diagrams, live interactive code execution, and direct mentoring by <span className="font-semibold text-slate-900 dark:text-white">Prof. Pemmaiah U. T.</span>
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            {firebaseUser ? (
              <button
                onClick={() => onNavigateToView("dashboard")}
                className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-sm shadow-xl shadow-blue-600/25 hover:shadow-blue-600/40 transition-all flex items-center justify-center gap-2 cursor-pointer group"
              >
                <GraduationCap className="w-5 h-5" />
                <span>Open Student Dashboard</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </button>
            ) : (
              <>
                <button
                  onClick={() => onOpenAuth("signup")}
                  className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-sm shadow-xl shadow-blue-600/25 hover:shadow-blue-600/40 transition-all flex items-center justify-center gap-2 cursor-pointer group"
                >
                  <span>Start Learning for Free</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </button>
                <button
                  onClick={() => onNavigateToView("courses")}
                  className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 font-bold text-sm shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <BookOpen className="w-4 h-4 text-blue-600" />
                  <span>Browse Syllabus</span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* Feature Pill Highlights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mt-16">
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
              <Terminal className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100">Live Code Compiler</h4>
              <p className="text-xs text-slate-500 mt-1">Run and debug C & Python code directly in your browser.</p>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-cyan-50 dark:bg-cyan-950 text-cyan-600 dark:text-cyan-400 flex items-center justify-center shrink-0">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100">University Aligned</h4>
              <p className="text-xs text-slate-500 mt-1">Curated directly for BCA semester examinations and lab manuals.</p>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100">Dedicated Mentorship</h4>
              <p className="text-xs text-slate-500 mt-1">Direct academic doubt clarifications with university faculty.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Course Catalog Section (Queried Live from Firestore) */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
              Curriculum Tracks
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
              Available University Courses
            </h2>
          </div>
          <button
            onClick={() => onNavigateToView("courses")}
            className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
          >
            <span>View All Tracks</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {loading ? (
          <div className="text-center py-16 text-sm text-slate-500">Loading courses catalog...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => {
              const isEnrolled = enrollment?.courseId === course.id;

              return (
                <div
                  key={course.id}
                  className="group bg-white dark:bg-slate-800 rounded-3xl p-6 sm:p-7 border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-xl hover:border-blue-500/50 transition-all duration-200 flex flex-col justify-between"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-slate-700 text-blue-600 dark:text-blue-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <TechIcon name={course.techIcon || "c-lang"} className="w-6 h-6" />
                      </div>
                      <span className="text-[11px] font-bold uppercase px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                        {course.difficulty || "All Levels"}
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {course.title}
                    </h3>

                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-3 leading-relaxed">
                      {course.shortDesc}
                    </p>

                    <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-700/60">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" /> {course.estimatedDurationHours || 45} Hours
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <GraduationCap className="w-3.5 h-3.5" /> {course.instructorName || "Prof. Pemmaiah"}
                      </span>
                    </div>
                  </div>

                  <div className="mt-6 pt-4">
                    {isEnrolled ? (
                      <button
                        onClick={() => onNavigateToCourse(course.id)}
                        className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-600/20 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Enter My Workspace</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => handleEnrollClick(course.id)}
                        className="w-full py-2.5 px-4 rounded-xl bg-slate-900 dark:bg-slate-700 hover:bg-blue-600 text-white font-bold text-xs shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <span>Enroll & Access Course</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
};
