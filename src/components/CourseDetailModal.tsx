import React, { useState } from "react";
import {
  X,
  Clock,
  BookOpen,
  Award,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  User,
  Star,
  Users,
  PlayCircle,
  Share2,
  Sparkles,
  ArrowRight
} from "lucide-react";
import { Course } from "../types";
import { TechIcon } from "./TechIcon";

interface CourseDetailModalProps {
  course: Course | null;
  onClose: () => void;
  onStartLearning: (course: Course) => void;
}

export const CourseDetailModal: React.FC<CourseDetailModalProps> = ({
  course,
  onClose,
  onStartLearning
}) => {
  const [openUnit, setOpenUnit] = useState<number | null>(0);
  const [copied, setCopied] = useState(false);

  if (!course) return null;

  const toggleUnit = (idx: number) => {
    setOpenUnit(openUnit === idx ? null : idx);
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-in fade-in">
      <div
        className="bg-white border border-slate-200 rounded-3xl w-full max-w-4xl shadow-2xl overflow-hidden my-auto flex flex-col max-h-[90vh] text-slate-800"
        role="dialog"
        aria-modal="true"
      >
        {/* Modal Top Header with Gradient */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 text-white p-6 sm:p-8 relative">
          <button
            onClick={onClose}
            aria-label="Close modal"
            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-blue-500/20 text-blue-300 border border-blue-400/30">
              {course.courseCode}
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-white/10 text-slate-200 border border-white/15">
              {course.category}
            </span>
            {course.badge && (
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-400/40 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" />
                {course.badge}
              </span>
            )}
          </div>

          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-blue-600/30 border border-blue-400/30 flex items-center justify-center text-blue-300 shrink-0 shadow-inner">
              <TechIcon name={course.techIcon} className="w-8 h-8" />
            </div>

            <div className="space-y-1 flex-1">
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                {course.title}
              </h2>
              <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl">
                {course.shortDesc}
              </p>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-4 border-t border-white/10 text-xs sm:text-sm text-slate-200">
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-400" />
              <span>
                Level: <strong className="text-white">{course.difficulty}</strong>
              </span>
            </div>
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-blue-300" />
              <span>
                Curriculum: <strong className="text-white">{course.totalModules} Units</strong>
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-indigo-300" />
              <span>
                <strong className="text-white">{course.estimatedDurationHours} Hours</strong> Duration
              </span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-300" />
              <span>
                <strong className="text-white">{course.totalLessons}</strong> Lessons
              </span>
            </div>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="overflow-y-auto p-6 sm:p-8 space-y-8 divide-y divide-slate-100 flex-1">
          {/* About This Course */}
          <div className="space-y-3">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-blue-600" />
              About This Course
            </h3>
            <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-line">
              {course.detailedDesc}
            </p>
          </div>

          {/* What You Will Learn */}
          <div className="pt-6 space-y-3">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Award className="w-5 h-5 text-emerald-600" />
              What You'll Learn
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {course.learningOutcomes.map((outcome, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-xs sm:text-sm text-slate-700"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span className="leading-snug font-medium">{outcome}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Syllabus & Curriculum */}
          <div className="pt-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <PlayCircle className="w-5 h-5 text-indigo-600" />
                Structured Course Syllabus
              </h3>
              <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
                {course.syllabusOverview.length} Modules • {course.totalLessons} Lessons
              </span>
            </div>

            <div className="space-y-2.5">
              {course.syllabusOverview.map((mod, idx) => {
                const isOpen = openUnit === idx;
                return (
                  <div
                    key={idx}
                    className="border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-sm transition-all"
                  >
                    <button
                      onClick={() => toggleUnit(idx)}
                      className="w-full px-4 py-3.5 flex items-center justify-between text-left hover:bg-slate-50/80 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <span className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 font-bold text-xs font-mono">
                          {mod.unit}
                        </span>
                        <span className="font-semibold text-slate-800 text-sm">{mod.title}</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-400">
                        <span className="text-xs text-slate-500 hidden sm:inline">
                          {mod.topics.length} Topics
                        </span>
                        {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </div>
                    </button>

                    {isOpen && (
                      <div className="px-4 pb-4 pt-1 border-t border-slate-100 bg-slate-50/50">
                        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                          {mod.topics.map((t, tIdx) => (
                            <li
                              key={tIdx}
                              className="text-xs text-slate-600 flex items-center gap-2"
                            >
                              <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                              <span>{t}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Instructor Area */}
          <div className="pt-6 space-y-3">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <User className="w-5 h-5 text-blue-600" />
              Course Instructor
            </h3>
            <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-50 to-blue-50/30 border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white font-bold text-lg flex items-center justify-center shadow-md shrink-0">
                PUT
              </div>
              <div className="space-y-1 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h4 className="font-bold text-slate-900 text-base">{course.instructorName || "Pemmaiah U. T."}</h4>
                  <span className="text-[10px] font-semibold text-blue-700 bg-blue-100/70 px-2 py-0.5 rounded border border-blue-200">
                    HOD - Dept. of BCA
                  </span>
                </div>
                <p className="text-xs text-slate-500 font-medium">Cauvery College, Gonikoppal • Cauvery Tech Nexus (CTN)</p>
                <p className="text-xs text-slate-600 leading-relaxed pt-0.5">
                  Educator, academic leader, and technology enthusiast focusing on skill-based learning, innovation, Cyber Security, Blockchain, Post-Quantum Cryptography, AI, and industry-oriented development.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Bottom CTA Footer */}
        <div className="p-4 sm:p-6 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              onClick={handleShare}
              className="px-3.5 py-2.5 rounded-xl border border-slate-300 hover:bg-white text-slate-700 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5" />
              {copied ? "Link Copied!" : "Share"}
            </button>
            <div className="text-xs text-slate-500 hidden sm:block">
              Level: <strong className="text-slate-800">{course.difficulty}</strong>
            </div>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <button
              onClick={onClose}
              className="w-1/2 sm:w-auto px-4 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
            >
              Close
            </button>
            <button
              onClick={() => onStartLearning(course)}
              className="w-1/2 sm:w-auto px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30 transition-all cursor-pointer"
            >
              Start Learning Now
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
