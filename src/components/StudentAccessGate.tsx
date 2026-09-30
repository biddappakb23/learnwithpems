import React from "react";
import {
  Lock,
  GraduationCap,
  Sparkles,
  ArrowRight,
  UserCheck,
  ShieldAlert,
  Mail,
  BookOpen,
  Code2,
  CheckCircle2
} from "lucide-react";
import { User } from "../types";

interface StudentAccessGateProps {
  currentUser: User | null;
  title?: string;
  description?: string;
  topicName?: string;
  courseTitle?: string;
  learningOutcomes?: string[];
  onOpenAuth: (mode: "LOGIN" | "REGISTER") => void;
  onNavigateHome?: () => void;
  contactEmail?: string;
}

export const StudentAccessGate: React.FC<StudentAccessGateProps> = ({
  currentUser,
  title = "Student Access Required",
  description,
  topicName,
  courseTitle,
  learningOutcomes,
  onOpenAuth,
  onNavigateHome,
  contactEmail = "pemmaiahoj@gmail.com"
}) => {
  // Scenario 1: Logged in, but status is PENDING
  if (currentUser && currentUser.status === "PENDING") {
    return (
      <div className="max-w-2xl mx-auto my-8 p-6 sm:p-10 rounded-3xl bg-gradient-to-b from-amber-950/40 via-slate-900 to-slate-950 border border-amber-500/40 shadow-2xl text-center space-y-6 animate-in fade-in">
        <div className="w-16 h-16 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center mx-auto text-amber-400">
          <ShieldAlert className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-400/30">
            Account Pending Approval
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
            Verification In Progress
          </h2>
          <p className="text-slate-300 text-sm sm:text-base max-w-lg mx-auto leading-relaxed">
            Welcome, <strong className="text-white">{currentUser.name}</strong>! Your student account registration is currently awaiting verification by Mr. Pemmaiah U.T. (Department of BCA). Full course lessons and interactive coding labs will unlock automatically once approved.
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 text-left space-y-2 text-xs text-slate-300 max-w-md mx-auto">
          <div className="flex items-center gap-2 text-slate-200 font-semibold">
            <Mail className="w-4 h-4 text-blue-400" />
            <span>Need expedited approval?</span>
          </div>
          <p className="text-slate-400">
            Reach out to faculty at{" "}
            <a href={`mailto:${contactEmail}`} className="text-blue-400 underline font-mono">
              {contactEmail}
            </a>{" "}
            with your registered College Roll No.
          </p>
        </div>

        {onNavigateHome && (
          <button
            onClick={onNavigateHome}
            className="px-6 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-medium transition-colors"
          >
            Back to Course Catalog
          </button>
        )}
      </div>
    );
  }

  // Scenario 2: Logged in, but status is REJECTED
  if (currentUser && currentUser.status === "REJECTED") {
    return (
      <div className="max-w-2xl mx-auto my-8 p-6 sm:p-10 rounded-3xl bg-gradient-to-b from-rose-950/40 via-slate-900 to-slate-950 border border-rose-500/40 shadow-2xl text-center space-y-6 animate-in fade-in">
        <div className="w-16 h-16 rounded-2xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center mx-auto text-rose-400">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-white">Account Access Restricted</h2>
          <p className="text-slate-300 text-sm max-w-md mx-auto">
            Your registration could not be verified. Please contact the department at <strong className="text-blue-400">{contactEmail}</strong>.
          </p>
        </div>
      </div>
    );
  }

  // Scenario 3: Unauthenticated / Visitor
  return (
    <div className="max-w-3xl mx-auto my-8 p-6 sm:p-10 rounded-3xl bg-gradient-to-b from-slate-900 via-slate-900/90 to-slate-950 border border-slate-800 shadow-2xl space-y-8 animate-in fade-in text-slate-100 font-sans">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
            <Lock className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-blue-400 flex items-center gap-1">
              <GraduationCap className="w-3.5 h-3.5" />
              Registered Student Portal
            </span>
            <h2 className="text-2xl font-black text-white">{title}</h2>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onOpenAuth("LOGIN")}
            className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs sm:text-sm flex items-center gap-1.5 shadow-lg shadow-blue-600/20 transition-all cursor-pointer"
          >
            <span>Student Login</span>
            <ArrowRight className="w-4 h-4" />
          </button>
          <button
            onClick={() => onOpenAuth("REGISTER")}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs sm:text-sm border border-slate-700 transition-colors cursor-pointer"
          >
            Register Free
          </button>
        </div>
      </div>

      {/* Main explanation & syllabus preview */}
      <div className="space-y-4">
        <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
          {topicName ? (
            <>
              To view full theory notes, live code compiler exercises, and module assessments for{" "}
              <strong className="text-white font-bold">"{topicName}"</strong>
              {courseTitle && ` in ${courseTitle}`}, please log in to your verified student account.
            </>
          ) : (
            "Complete educational lesson modules, hands-on programming compiler sandboxes, and certification quizzes are reserved for registered students of LearnWithPems."
          )}
        </p>

        {/* Benefits Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800/80 space-y-1.5">
            <div className="flex items-center gap-2 text-blue-400 font-bold text-xs">
              <BookOpen className="w-4 h-4" />
              <span>Full Curriculum Notes</span>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed">
              Step-by-step academic notes, memory layouts, pointer diagrams, and real-world examples.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800/80 space-y-1.5">
            <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs">
              <Code2 className="w-4 h-4" />
              <span>Live In-App Compiler</span>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed">
              Compile and run C code directly in your browser with instant test-case validation.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800/80 space-y-1.5">
            <div className="flex items-center gap-2 text-amber-400 font-bold text-xs">
              <Sparkles className="w-4 h-4" />
              <span>Quizzes & Progress</span>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed">
              Earn XP, track unit completion, take automated quizzes, and build academic competence.
            </p>
          </div>
        </div>

        {learningOutcomes && learningOutcomes.length > 0 && (
          <div className="p-4 rounded-2xl bg-slate-950/50 border border-slate-800 space-y-2 mt-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Topics Covered in This Unit
            </h4>
            <div className="space-y-1.5">
              {learningOutcomes.map((outcome, idx) => (
                <div key={idx} className="flex items-start gap-2 text-xs text-slate-300">
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-400 shrink-0 mt-0.5" />
                  <span>{outcome}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Action Footer */}
      <div className="pt-4 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400">
        <div>
          <span>New student? </span>
          <button
            onClick={() => onOpenAuth("REGISTER")}
            className="text-blue-400 font-semibold hover:underline cursor-pointer"
          >
            Create free account
          </button>
          <span> in 30 seconds.</span>
        </div>

        {onNavigateHome && (
          <button
            onClick={onNavigateHome}
            className="hover:text-slate-200 transition-colors cursor-pointer"
          >
            Browse All Courses →
          </button>
        )}
      </div>
    </div>
  );
};
