import React from "react";
import { GraduationCap, Award, BookOpen, Mail, MapPin, Building, Sparkles, CheckCircle2, Shield } from "lucide-react";

export const FacultyView: React.FC = () => {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      {/* Faculty Profile Hero */}
      <div className="relative rounded-3xl bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950 text-white p-8 sm:p-12 shadow-2xl border border-blue-800/40 overflow-hidden">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-8 relative z-10">
          {/* Avatar / Photo */}
          <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-3xl bg-gradient-to-tr from-blue-600 to-cyan-400 p-1 shadow-2xl shrink-0">
            <div className="w-full h-full rounded-[22px] bg-slate-900 flex flex-col items-center justify-center text-center p-2">
              <GraduationCap className="w-12 h-12 text-cyan-400 mb-1" />
              <span className="font-extrabold text-sm text-white">H.O.D.</span>
              <span className="text-[10px] text-cyan-300">Dept. of BCA</span>
            </div>
          </div>

          {/* Details */}
          <div className="space-y-4 text-center md:text-left flex-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" /> Course Author & Chief Academician
            </div>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
              Prof. Pemmaiah U. T.
            </h1>
            <p className="text-sm sm:text-base text-cyan-100 font-medium">
              Head of Department (H.O.D.), Department of Computer Applications (BCA)
            </p>
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-xs text-slate-300 pt-1">
              <span className="flex items-center gap-1.5 bg-black/30 px-3 py-1.5 rounded-xl border border-white/10">
                <Building className="w-4 h-4 text-cyan-400" /> Cauvery College, Gonikoppal, Kodagu
              </span>
              <span className="flex items-center gap-1.5 bg-black/30 px-3 py-1.5 rounded-xl border border-white/10">
                <MapPin className="w-4 h-4 text-cyan-400" /> Karnataka, India
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Academic Credentials & Pedagogy */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <Award className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">About the Author</h3>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            With decades of distinguished academic leadership and classroom instruction at Cauvery College Gonikoppal, Prof. Pemmaiah U. T. has mentored thousands of BCA and computer science undergraduates into successful software engineers, researchers, and technologists.
          </p>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            LearnWithPems is built to extend this rigorous university pedagogy to all students with structured curriculum units, solved problem blueprints, and interactive live execution.
          </p>
        </div>

        <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
            <BookOpen className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">Curriculum Highlights</h3>
          <ul className="space-y-2.5 text-xs text-slate-600 dark:text-slate-400">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
              <span>Aligned directly with University BCA & NEP (National Education Policy) syllabi.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
              <span>Extensive dry-run memory trace tables and algorithmic flowcharts.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
              <span>Over 100+ verified practical programming laboratory assignments.</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};
