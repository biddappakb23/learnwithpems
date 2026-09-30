import React, { useState, useEffect } from "react";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { seedFirestoreCoursesIfEmpty } from "./services/db";
import { Navbar } from "./components/Navbar";
import { HomePage } from "./components/HomePage";
import { CourseCatalogView } from "./components/CourseCatalogView";
import { StudentDashboard } from "./components/student/StudentDashboard";
import { CourseWorkspace } from "./components/student/CourseWorkspace";
import { AccessDeniedView } from "./components/student/AccessDeniedView";
import { PracticePortal } from "./components/student/PracticePortal";
import { NotesLibrary } from "./components/student/NotesLibrary";
import { FacultyView } from "./components/FacultyView";
import { AdminDashboard } from "./components/admin/AdminDashboard";
import { AuthModal } from "./components/auth/AuthModal";
import { StudentHelplineModal } from "./components/student/StudentHelplineModal";
import { BrandLogo } from "./components/BrandLogo";

function MainApp() {
  const { firebaseUser, enrollment, enrolledCourse, isAdmin, isStudent, isLoading: authLoading } = useAuth();
  const [currentView, setCurrentView] = useState<string>("home");
  const [activeCourseId, setActiveCourseId] = useState<string>("");
  const [activeLessonId, setActiveLessonId] = useState<string | undefined>(undefined);

  // Auth modal state
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"signin" | "signup" | "admin">("signin");
  const [preselectedCourseId, setPreselectedCourseId] = useState<string | undefined>(undefined);

  // Helpline modal state
  const [helplineOpen, setHelplineOpen] = useState(false);
  const [helplineContext, setHelplineContext] = useState<{ courseTitle?: string; lessonTitle?: string } | undefined>(undefined);

  // Seed Firestore on startup if empty
  useEffect(() => {
    seedFirestoreCoursesIfEmpty().catch((err) => {
      console.warn("Auto-seed Firestore check:", err);
    });
  }, []);

  const handleOpenAuth = (mode: "signin" | "signup" | "admin" = "signin", courseId?: string) => {
    setAuthMode(mode);
    setPreselectedCourseId(courseId);
    setAuthModalOpen(true);
  };

  const handleAuthSuccess = (courseId?: string, userRole?: string) => {
    // If logging in as admin/faculty or profile role is ADMIN, route directly to Admin Center!
    if (authMode === "admin" || userRole === "ADMIN" || userRole === "MAIN_ADMIN" || isAdmin) {
      setCurrentView("admin");
      return;
    }

    // When a student registers or signs in, direct them immediately to their course!
    if (courseId) {
      setActiveCourseId(courseId);
      setCurrentView("student_course");
    } else if (enrollment?.courseId) {
      setActiveCourseId(enrollment.courseId);
      setCurrentView("student_course");
    } else {
      setCurrentView("dashboard");
    }
  };

  const handleNavigate = (view: string, param?: string) => {
    if (view === "student_course" && param) {
      setActiveCourseId(param);
      setActiveLessonId(undefined);
      setCurrentView("student_course");
    } else if (view === "helpline") {
      setHelplineContext(undefined);
      setHelplineOpen(true);
    } else {
      setCurrentView(view);
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleNavigateToCourse = (courseId: string, lessonId?: string) => {
    setActiveCourseId(courseId);
    setActiveLessonId(lessonId);
    setCurrentView("student_course");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleOpenHelpline = (context?: { courseTitle?: string; lessonTitle?: string }) => {
    setHelplineContext(context);
    setHelplineOpen(true);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white space-y-4">
        <div className="w-12 h-12 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-semibold tracking-wider text-cyan-300">
          Initializing LearnWithPems LMS...
        </p>
      </div>
    );
  }

  // Render view logic
  const renderCurrentView = () => {
    switch (currentView) {
      case "courses":
        return (
          <CourseCatalogView
            onOpenAuth={handleOpenAuth}
            onNavigateToCourse={(cId) => {
              if (firebaseUser) {
                handleNavigateToCourse(cId);
              } else {
                handleOpenAuth("signup", cId);
              }
            }}
          />
        );

      case "dashboard":
        return (
          <StudentDashboard
            onNavigateToCourse={handleNavigateToCourse}
            onNavigateToView={handleNavigate}
            onOpenHelpline={() => handleOpenHelpline()}
          />
        );

      case "student_course":
        // 1 Student = 1 Active Course Access Gate Enforcement
        if (!firebaseUser) {
          // If not logged in, prompt sign in with preselected course
          return (
            <div className="min-h-[70vh] flex items-center justify-center p-4">
              <div className="text-center space-y-4 max-w-md bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">Authentication Required</h3>
                <p className="text-xs text-slate-500">Please sign in or register to access this course track.</p>
                <button
                  onClick={() => handleOpenAuth("signup", activeCourseId)}
                  className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md cursor-pointer"
                >
                  Sign In / Register
                </button>
              </div>
            </div>
          );
        }

        // If logged in as student, verify they are enrolled in this active course (or is admin)
        if (!isAdmin && enrollment && enrollment.courseId && enrollment.courseId !== activeCourseId) {
          return (
            <AccessDeniedView
              attemptedCourseTitle={activeCourseId}
              enrolledCourseTitle={enrollment.courseTitle || enrolledCourse?.title || "Your Enrolled Course"}
              enrolledCourseId={enrollment.courseId}
              onGoToEnrolledCourse={(cId) => handleNavigateToCourse(cId)}
              onExploreCourses={() => setCurrentView("courses")}
              onContactSupport={() => handleOpenHelpline()}
            />
          );
        }

        return (
          <CourseWorkspace
            courseId={activeCourseId || enrollment?.courseId || "c-problem-solving"}
            initialLessonId={activeLessonId}
            onNavigateToDashboard={() => setCurrentView("dashboard")}
            onOpenHelpline={handleOpenHelpline}
          />
        );

      case "practice":
        return <PracticePortal onBackToCourse={() => setCurrentView("dashboard")} />;

      case "notes":
        return <NotesLibrary />;

      case "about":
        return <FacultyView />;

      case "admin":
        if (!isAdmin) {
          return (
            <div className="min-h-[70vh] flex items-center justify-center p-4">
              <div className="text-center space-y-3 max-w-md bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl">
                <h3 className="text-xl font-bold text-red-600">Access Restricted</h3>
                <p className="text-xs text-slate-500">Only verified administrative accounts can access this panel.</p>
                <button
                  onClick={() => setCurrentView("home")}
                  className="px-6 py-2 rounded-xl bg-slate-900 text-white text-xs font-semibold cursor-pointer"
                >
                  Return to Home
                </button>
              </div>
            </div>
          );
        }
        return <AdminDashboard />;

      case "home":
      default:
        return (
          <HomePage
            onOpenAuth={handleOpenAuth}
            onNavigateToCourse={handleNavigateToCourse}
            onNavigateToView={handleNavigate}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      {/* Top Navigation */}
      <Navbar
        onOpenAuth={handleOpenAuth}
        onNavigate={handleNavigate}
        currentView={currentView}
      />

      {/* Main App Content View */}
      <main className="flex-1">{renderCurrentView()}</main>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <BrandLogo size="sm" showTagline={false} />
            <span className="text-xs text-slate-500">
              © {new Date().getFullYear()} LearnWithPems. Dept. of Computer Applications, Cauvery College, Gonikoppal.
            </span>
          </div>

          <div className="flex items-center gap-6 text-xs text-slate-500 font-medium">
            <button onClick={() => handleNavigate("courses")} className="hover:text-blue-600">
              Courses
            </button>
            <button onClick={() => handleNavigate("notes")} className="hover:text-blue-600">
              Notes & PDFs
            </button>
            <button onClick={() => handleNavigate("about")} className="hover:text-blue-600">
              Faculty
            </button>
            <button onClick={() => handleOpenHelpline()} className="hover:text-blue-600">
              Academic Helpline
            </button>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        initialMode={authMode}
        preselectedCourseId={preselectedCourseId}
        onSuccess={handleAuthSuccess}
      />

      <StudentHelplineModal
        isOpen={helplineOpen}
        onClose={() => setHelplineOpen(false)}
        initialContext={helplineContext}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
