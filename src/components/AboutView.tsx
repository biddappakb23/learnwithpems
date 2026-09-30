import React from "react";
import {
  GraduationCap,
  Award,
  BookOpen,
  CheckCircle2,
  Code2,
  Cpu,
  ShieldCheck,
  Building2,
  MapPin,
  Mail,
  ArrowRight,
  ExternalLink,
  Users
} from "lucide-react";
import { Breadcrumbs } from "./Breadcrumbs";

interface AboutViewProps {
  onNavigateHome: () => void;
  onExploreCourses: () => void;
  onOpenContact: () => void;
}

export const AboutView: React.FC<AboutViewProps> = ({
  onNavigateHome,
  onExploreCourses,
  onOpenContact
}) => {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <Breadcrumbs
        items={[
          { name: "Home", onClick: onNavigateHome },
          { name: "About LearnWithPems & Instructor" }
        ]}
      />

      <main className="flex-1 max-w-5xl mx-auto px-4 py-10 sm:py-14 w-full">
        {/* Hero Section */}
        <header className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/25 text-blue-400 text-xs font-semibold mb-4">
            <GraduationCap className="w-4 h-4" />
            <span>Academic Leadership & Educational Excellence</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
            About <span className="text-blue-400">LearnWithPems</span>
          </h1>
          <p className="mt-4 text-slate-300 text-base sm:text-lg leading-relaxed">
            Empowering students with structured computer science foundations, rigorous programming concepts,
            and interactive hands-on coding practice.
          </p>
        </header>

        {/* Instructor Profile Card */}
        <section className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 sm:p-8 mb-10 shadow-xl">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6 sm:gap-8">
            <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white text-3xl sm:text-4xl font-black shadow-lg shadow-blue-600/20 shrink-0">
              PU
            </div>
            <div className="flex-1 text-center md:text-left">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                <div>
                  <h2 className="text-2xl font-bold text-white">Mr. Pemmaiah U. T.</h2>
                  <p className="text-blue-400 font-medium text-sm sm:text-base">
                    Head of the Department of Computer Science (BCA)
                  </p>
                </div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-semibold self-center md:self-auto">
                  <Award className="w-3.5 h-3.5" />
                  <span>Senior Academic Mentor</span>
                </div>
              </div>

              <div className="flex items-center justify-center md:justify-start gap-2 mt-2 text-slate-400 text-xs sm:text-sm">
                <Building2 className="w-4 h-4 text-slate-500" />
                <span>Cauvery College, Gonikoppal, Kodagu, Karnataka</span>
              </div>

              <p className="mt-4 text-slate-300 text-sm leading-relaxed">
                With over a decade of teaching and curriculum design experience in Computer Science, Mr. Pemmaiah U. T.
                has guided thousands of undergraduate students through fundamental procedural logic, Object-Oriented systems,
                algorithms, and secure computational architectures.
              </p>

              {/* Research & Focus Areas */}
              <div className="mt-5 pt-5 border-t border-slate-800/80">
                <h3 className="text-xs uppercase tracking-wider font-bold text-slate-400 mb-3">
                  Academic Specializations & Research Focus
                </h3>
                <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                  {[
                    "C Programming & Memory Architecture",
                    "Data Structures & Algorithms",
                    "Java & Enterprise OOP",
                    "Python & Automation",
                    "Cyber Security & Cryptography",
                    "Blockchain Systems & Tech Nexus (CTN)"
                  ].map((tag, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 rounded-lg bg-slate-800/70 border border-slate-700/60 text-slate-300 text-xs"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Platform Pillars */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-6">
            <div className="w-10 h-10 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center mb-4">
              <BookOpen className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Structured Curriculum</h3>
            <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
              Every course unit follows academic syllabi designed for BCA, B.Tech, and CS degrees with theoretical depth and complete code walk-throughs.
            </p>
          </div>

          <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-6">
            <div className="w-10 h-10 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center mb-4">
              <Code2 className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Browser-Based Interactive Labs</h3>
            <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
              Students can execute C programs, run test inputs, verify stdout outputs, and practice algorithmic problems directly in their browser.
            </p>
          </div>

          <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-6">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-4">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Practical Assessment</h3>
            <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
              Module-wise diagnostic quizzes, conceptual problem sets, and code tracing questions ensure genuine mastery before moving forward.
            </p>
          </div>
        </section>

        {/* CTA */}
        <section className="text-center bg-gradient-to-b from-blue-950/40 to-slate-900/60 border border-blue-900/40 rounded-2xl p-8">
          <h2 className="text-xl sm:text-2xl font-bold text-white">Ready to Start Learning?</h2>
          <p className="text-slate-400 text-sm max-w-xl mx-auto mt-2">
            Dive into comprehensive programming courses or contact the academic team for questions.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={onExploreCourses}
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm flex items-center gap-2 transition-all cursor-pointer"
            >
              <span>Explore All Courses</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={onOpenContact}
              className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs sm:text-sm border border-slate-700 transition-colors cursor-pointer"
            >
              <span>Contact Department</span>
            </button>
          </div>
        </section>
      </main>
    </div>
  );
};
