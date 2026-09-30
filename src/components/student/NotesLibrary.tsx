import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { getCourses, getModules } from "../../services/db";
import { Course, Module } from "../../types";
import { FileText, Download, ExternalLink, Sparkles, BookOpen, Clock, FolderDown } from "lucide-react";

export const NotesLibrary: React.FC = () => {
  const { enrollment, enrolledCourse } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<string>("");
  const [modules, setModules] = useState<Module[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getCourses().then((cList) => {
      setCourses(cList);
      if (enrollment?.courseId) {
        setSelectedCourseId(enrollment.courseId);
      } else if (cList.length > 0) {
        setSelectedCourseId(cList[0].id);
      }
      setIsLoading(false);
    });
  }, [enrollment]);

  useEffect(() => {
    if (selectedCourseId) {
      getModules(selectedCourseId).then((mList) => {
        setModules(mList);
      });
    }
  }, [selectedCourseId]);

  const activeCourse = courses.find((c) => c.id === selectedCourseId);

  // Sample curated notes repository for university courses
  const defaultDocuments = [
    {
      title: "Unit 1: Fundamentals & Control Structures Handbook",
      desc: "Complete reference covering variables, data types, operators, if-else conditionals, switch statements, and loop constructs with flowcharts.",
      size: "2.4 MB",
      format: "PDF Document",
      downloadUrl: "#"
    },
    {
      title: "Unit 2: Modular Programming, Arrays & Pointers Deep Dive",
      desc: "Detailed lecture slides on 1D/2D arrays, pointer arithmetic, dynamic memory allocation (malloc, calloc, free), and modular function design.",
      size: "3.8 MB",
      format: "PDF Document",
      downloadUrl: "#"
    },
    {
      title: "Unit 3: User-Defined Types (Structures & Unions) & File I/O",
      desc: "Explanatory notes on typedef, struct alignment, nested structures, file streams (fopen, fread, fwrite, fprintf), and error handling.",
      size: "1.9 MB",
      format: "PDF Document",
      downloadUrl: "#"
    },
    {
      title: "Complete BCA Semester Question Bank & Solved Lab Manual",
      desc: "Official university lab exercises with verified source codes, algorithm specifications, and dry-run execution tables.",
      size: "5.1 MB",
      format: "PDF Document",
      downloadUrl: "#"
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-xs font-semibold mb-2">
            <FolderDown className="w-3.5 h-3.5" /> Curated University Materials
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Lecture Notes & Resource Documents
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            Download comprehensive chapter handbooks, lab manuals, and revision slides.
          </p>
        </div>

        {/* Course Filter */}
        <select
          value={selectedCourseId}
          onChange={(e) => setSelectedCourseId(e.target.value)}
          className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
        >
          {courses.map((c) => (
            <option key={c.id} value={c.id}>
              {c.title}
            </option>
          ))}
        </select>
      </div>

      {/* Course Info Card */}
      {activeCourse && (
        <div className="p-6 rounded-3xl bg-gradient-to-r from-slate-900 to-blue-950 text-white border border-slate-800 shadow-md">
          <div className="flex items-center gap-3 mb-2">
            <span className="px-2.5 py-0.5 rounded-full bg-blue-500/20 text-cyan-300 text-xs font-bold uppercase">
              {activeCourse.courseCode || "BCA-101"}
            </span>
            <h2 className="text-lg font-bold">{activeCourse.title}</h2>
          </div>
          <p className="text-xs text-slate-300 max-w-2xl">{activeCourse.shortDesc}</p>
        </div>
      )}

      {/* Documents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {defaultDocuments.map((doc, idx) => (
          <div
            key={idx}
            className="p-6 rounded-3xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-lg hover:border-emerald-500/50 transition-all flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                  <FileText className="w-6 h-6" />
                </div>
                <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                  {doc.format}
                </span>
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">{doc.title}</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{doc.desc}</p>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between">
              <span className="text-xs text-slate-400 font-medium">File Size: {doc.size}</span>
              <a
                href={doc.downloadUrl}
                download
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-md shadow-emerald-600/20 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download PDF</span>
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
