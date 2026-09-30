import React from "react";
import { ShieldAlert, ArrowRight, BookOpen, GraduationCap, Mail } from "lucide-react";
import { Course } from "../../types";

interface AccessDeniedViewProps {
  attemptedCourseTitle?: string;
  enrolledCourseTitle?: string;
  enrolledCourseId?: string;
  onGoToEnrolledCourse: (courseId: string) => void;
  onExploreCourses: () => void;
  onContactSupport: () => void;
}

export const AccessDeniedView: React.FC<AccessDeniedViewProps> = ({
  attemptedCourseTitle = "Requested Course",
  enrolledCourseTitle = "Your Enrolled Course",
  enrolledCourseId,
  onGoToEnrolledCourse,
  onExploreCourses,
  onContactSupport
}) => {
  return (
    <div className="min-h-[75vh] flex items-center justify-center p-4">
      <div className="max-w-xl w-full bg-white dark:bg-slate-900 rounded-3xl p-8 sm:p-10 border border-slate-200 dark:border-slate-800 shadow-2xl text-center space-y-6 animate-in fade-in zoom-in-95 duration-200">
        <div className="w-16 h-16 rounded-2xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto shadow-inner">
          <ShieldAlert className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 text-xs font-bold uppercase tracking-wider">
            Access Restricted
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Single Course Enrollment Policy
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed max-w-md mx-auto pt-1">
            You are currently registered for <span className="font-semibold text-slate-900 dark:text-slate-100">{enrolledCourseTitle}</span>. Students are granted focused access to one active curriculum track at a time.
          </p>
        </div>

        {enrolledCourseId && (
          <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800/60 text-left flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold shrink-0">
                <GraduationCap className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs text-blue-600 dark:text-blue-400 font-semibold uppercase tracking-wider">
                  Your Active Course
                </div>
                <div className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  {enrolledCourseTitle}
                </div>
              </div>
            </div>
            <button
              onClick={() => onGoToEnrolledCourse(enrolledCourseId)}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-md shadow-blue-600/20 transition-all flex items-center gap-1.5 shrink-0 cursor-pointer"
            >
              <span>Enter Workspace</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          {enrolledCourseId && (
            <button
              onClick={() => onGoToEnrolledCourse(enrolledCourseId)}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm shadow-md shadow-blue-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <BookOpen className="w-4 h-4" />
              <span>Go to My Course</span>
            </button>
          )}

          <button
            onClick={onExploreCourses}
            className="w-full sm:w-auto px-6 py-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-sm transition-all"
          >
            Explore Catalog
          </button>
        </div>

        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500">
          Need to change or switch your enrolled course?{" "}
          <button
            onClick={onContactSupport}
            className="text-blue-600 dark:text-blue-400 font-semibold hover:underline"
          >
            Request Faculty / Admin Assistance
          </button>
        </div>
      </div>
    </div>
  );
};
