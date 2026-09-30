import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { getCourses, getModules } from "../services/db";
import { Course, Module } from "../types";
import { TechIcon } from "./TechIcon";
import {
  BookOpen,
  Clock,
  GraduationCap,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  Search,
  Filter
} from "lucide-react";

interface CourseCatalogViewProps {
  onOpenAuth: (mode?: "signin" | "signup", preselectedCourseId?: string) => void;
  onNavigateToCourse: (courseId: string) => void;
}

export const CourseCatalogView: React.FC<CourseCatalogViewProps> = ({
  onOpenAuth,
  onNavigateToCourse
}) => {
  const { firebaseUser, enrollment } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [search, setSearch] = useState("");
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("All");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCourses()
      .then((data) => {
        setCourses(data.filter((c) => c.status === "Published" || !c.status));
      })
      .finally(() => setLoading(false));
  }, []);

  const filteredCourses = courses.filter((c) => {
    const matchesSearch =
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.shortDesc?.toLowerCase().includes(search.toLowerCase());
    const matchesDiff =
      selectedDifficulty === "All" || c.difficulty === selectedDifficulty;
    return matchesSearch && matchesDiff;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 text-xs font-semibold">
          <BookOpen className="w-3.5 h-3.5" /> University Curriculum Catalog
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Explore Computer Science Tracks
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Structured semester course blueprints with chapter notes, live lab compilers, and problem solving mastery.
        </p>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="relative w-full sm:max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search courses, concepts, or languages..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
          {["All", "Beginner", "Intermediate", "Advanced"].map((level) => (
            <button
              key={level}
              onClick={() => setSelectedDifficulty(level)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                selectedDifficulty === level
                  ? "bg-blue-600 text-white shadow-xs"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
              }`}
            >
              {level}
            </button>
          ))}
        </div>
      </div>

      {/* Courses Grid */}
      {loading ? (
        <div className="text-center py-20 text-sm text-slate-500">Loading catalog...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course) => {
            const isEnrolled = enrollment?.courseId === course.id;

            return (
              <div
                key={course.id}
                className="bg-white dark:bg-slate-800 rounded-3xl p-6 sm:p-7 border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-xl hover:border-blue-500/50 transition-all flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-slate-700 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                      <TechIcon name={course.techIcon || "c-lang"} className="w-6 h-6" />
                    </div>
                    <span className="text-[11px] font-bold uppercase px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                      {course.difficulty}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                    {course.title}
                  </h3>

                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-3 leading-relaxed">
                    {course.shortDesc}
                  </p>

                  <div className="flex items-center gap-4 text-xs text-slate-500 pt-2 border-t border-slate-100 dark:border-slate-700">
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
                      <span>Open Workspace</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        if (firebaseUser) {
                          onNavigateToCourse(course.id);
                        } else {
                          onOpenAuth("signup", course.id);
                        }
                      }}
                      className="w-full py-2.5 px-4 rounded-xl bg-slate-900 dark:bg-slate-700 hover:bg-blue-600 text-white font-bold text-xs shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <span>Enroll in Course</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
