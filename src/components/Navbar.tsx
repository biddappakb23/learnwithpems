import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { BrandLogo } from "./BrandLogo";
import { TechIcon } from "./TechIcon";
import {
  BookOpen,
  LayoutDashboard,
  Shield,
  LogOut,
  User as UserIcon,
  Menu,
  X,
  Sparkles,
  ChevronRight,
  HelpCircle,
  FolderDown,
  GraduationCap
} from "lucide-react";

interface NavbarProps {
  onOpenAuth: (mode?: "signin" | "signup" | "admin", preselectedCourseId?: string) => void;
  onNavigate: (view: string, param?: string) => void;
  currentView: string;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenAuth, onNavigate, currentView }) => {
  const { firebaseUser, userProfile, enrollment, enrolledCourse, isAdmin, isStudent, signOut } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    setUserDropdownOpen(false);
    setMobileMenuOpen(false);
    onNavigate("home");
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Top Left: Brand Logo & Admin Access */}
          <div className="flex items-center gap-3 sm:gap-4">
            <div
              onClick={() => onNavigate("home")}
              className="cursor-pointer transition-transform hover:scale-[1.02] duration-150"
            >
              <BrandLogo size="md" />
            </div>

            {/* Top-Left Admin Login / Quick Access Badge */}
            <button
              onClick={() => {
                if (isAdmin) {
                  onNavigate("admin");
                } else {
                  onOpenAuth("admin");
                }
              }}
              className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border shadow-xs bg-purple-50 dark:bg-purple-950/60 hover:bg-purple-100 dark:hover:bg-purple-900/60 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800"
              title="Administrator & Faculty Portal Login"
            >
              <Shield className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400 shrink-0" />
              <span className="hidden xs:inline sm:inline">
                {isAdmin ? "Admin Panel" : "Admin Login"}
              </span>
              <span className="xs:hidden sm:hidden">Admin</span>
            </button>
          </div>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-1.5 lg:gap-3">
            <button
              onClick={() => onNavigate("courses")}
              className={`px-3.5 py-2 rounded-xl text-sm font-medium transition-all ${
                currentView === "courses"
                  ? "bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 font-semibold"
                  : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
            >
              Explore Courses
            </button>

            <button
              onClick={() => onNavigate("notes")}
              className={`px-3.5 py-2 rounded-xl text-sm font-medium transition-all ${
                currentView === "notes"
                  ? "bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 font-semibold"
                  : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
            >
              Lecture Notes
            </button>

            <button
              onClick={() => onNavigate("about")}
              className={`px-3.5 py-2 rounded-xl text-sm font-medium transition-all ${
                currentView === "about"
                  ? "bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 font-semibold"
                  : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
            >
              Faculty & Author
            </button>

            <button
              onClick={() => onNavigate("helpline")}
              className={`px-3.5 py-2 rounded-xl text-sm font-medium transition-all ${
                currentView === "helpline"
                  ? "bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 font-semibold"
                  : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
            >
              Ask Helpline
            </button>
          </nav>

          {/* Right Action Area */}
          <div className="hidden md:flex items-center gap-3">
            {firebaseUser ? (
              <div className="flex items-center gap-3">
                {/* Active Enrolled Course Quick Access Button */}
                {enrollment && enrollment.courseId && (
                  <button
                    onClick={() => onNavigate("student_course", enrollment.courseId)}
                    className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs shadow-md shadow-blue-600/20 transition-all cursor-pointer"
                  >
                    <GraduationCap className="w-4 h-4" />
                    <span className="max-w-[160px] truncate">{enrollment.courseTitle || "My Course"}</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                )}

                {/* Student Dashboard Button */}
                <button
                  onClick={() => onNavigate("dashboard")}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl border text-xs font-medium transition-all ${
                    currentView === "dashboard"
                      ? "bg-slate-100 dark:bg-slate-800 border-blue-500 text-blue-600 dark:text-blue-400 font-semibold"
                      : "border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                  }`}
                >
                  <LayoutDashboard className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <span>Dashboard</span>
                </button>

                {/* Admin Button if Admin */}
                {isAdmin && (
                  <button
                    onClick={() => onNavigate("admin")}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold shadow-md shadow-purple-600/20 transition-all cursor-pointer"
                  >
                    <Shield className="w-4 h-4" />
                    <span>Admin Panel</span>
                  </button>
                )}

                {/* Profile Pill & Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    className="flex items-center gap-2.5 p-1.5 pr-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-slate-300 bg-white dark:bg-slate-800 transition-all"
                  >
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold text-xs shadow-sm">
                      {(userProfile?.name || firebaseUser.displayName || "S")[0].toUpperCase()}
                    </div>
                    <div className="text-left">
                      <div className="text-xs font-bold text-slate-800 dark:text-slate-200 max-w-[100px] truncate leading-tight">
                        {userProfile?.name || firebaseUser.displayName || "Student"}
                      </div>
                      <div className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">
                        {isAdmin ? "Admin" : "Student"}
                      </div>
                    </div>
                  </button>

                  {userDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white dark:bg-slate-800 shadow-xl border border-slate-200 dark:border-slate-700 py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                      <div className="px-4 py-2.5 border-b border-slate-100 dark:border-slate-700/60">
                        <p className="text-xs font-bold text-slate-900 dark:text-slate-100">
                          {userProfile?.name || firebaseUser.displayName || "Student"}
                        </p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                          {firebaseUser.email}
                        </p>
                      </div>

                      <div className="py-1">
                        <button
                          onClick={() => {
                            setUserDropdownOpen(false);
                            onNavigate("dashboard");
                          }}
                          className="w-full text-left px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-2.5"
                        >
                          <LayoutDashboard className="w-4 h-4 text-slate-400" />
                          Student Dashboard
                        </button>

                        {enrollment?.courseId && (
                          <button
                            onClick={() => {
                              setUserDropdownOpen(false);
                              onNavigate("student_course", enrollment.courseId);
                            }}
                            className="w-full text-left px-4 py-2 text-xs font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40 flex items-center gap-2.5"
                          >
                            <BookOpen className="w-4 h-4" />
                            My Course Workspace
                          </button>
                        )}

                        {isAdmin && (
                          <button
                            onClick={() => {
                              setUserDropdownOpen(false);
                              onNavigate("admin");
                            }}
                            className="w-full text-left px-4 py-2 text-xs font-medium text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-950/40 flex items-center gap-2.5"
                          >
                            <Shield className="w-4 h-4" />
                            Admin Center
                          </button>
                        )}
                      </div>

                      <div className="border-t border-slate-100 dark:border-slate-700/60 pt-1">
                        <button
                          onClick={handleSignOut}
                          className="w-full text-left px-4 py-2 text-xs font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 flex items-center gap-2.5"
                        >
                          <LogOut className="w-4 h-4" />
                          Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2.5">
                <button
                  onClick={() => onOpenAuth("signin")}
                  className="px-4 py-2 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-200 hover:text-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer"
                >
                  Sign In
                </button>
                <button
                  onClick={() => onOpenAuth("signup")}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-sm font-semibold shadow-md shadow-blue-600/20 hover:shadow-lg hover:shadow-blue-600/30 transition-all cursor-pointer"
                >
                  Register Now
                </button>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden items-center gap-2">
            {firebaseUser && enrollment?.courseId && (
              <button
                onClick={() => onNavigate("student_course", enrollment.courseId)}
                className="p-2 rounded-xl bg-blue-600 text-white"
              >
                <GraduationCap className="w-5 h-5" />
              </button>
            )}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-600 dark:text-slate-300 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-4 space-y-3">
          <div className="space-y-1">
            <button
              onClick={() => {
                onNavigate("home");
                setMobileMenuOpen(false);
              }}
              className="w-full text-left px-3 py-2.5 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Home
            </button>
            <button
              onClick={() => {
                onNavigate("courses");
                setMobileMenuOpen(false);
              }}
              className="w-full text-left px-3 py-2.5 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Explore Courses
            </button>
            <button
              onClick={() => {
                onNavigate("notes");
                setMobileMenuOpen(false);
              }}
              className="w-full text-left px-3 py-2.5 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Lecture Notes & PDFs
            </button>
            <button
              onClick={() => {
                onNavigate("about");
                setMobileMenuOpen(false);
              }}
              className="w-full text-left px-3 py-2.5 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Faculty & Author
            </button>
            <button
              onClick={() => {
                onNavigate("helpline");
                setMobileMenuOpen(false);
              }}
              className="w-full text-left px-3 py-2.5 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Academic Helpline
            </button>
          </div>

          <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
            {firebaseUser ? (
              <div className="space-y-2">
                <div className="flex items-center gap-3 p-2 bg-slate-50 dark:bg-slate-800/60 rounded-xl">
                  <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-xs">
                    {(userProfile?.name || "S")[0].toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                      {userProfile?.name || firebaseUser.displayName}
                    </p>
                    <p className="text-[10px] text-slate-500 truncate">{firebaseUser.email}</p>
                  </div>
                </div>

                {enrollment?.courseId && (
                  <button
                    onClick={() => {
                      onNavigate("student_course", enrollment.courseId);
                      setMobileMenuOpen(false);
                    }}
                    className="w-full py-2.5 px-3 rounded-xl bg-blue-600 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-sm"
                  >
                    <BookOpen className="w-4 h-4" />
                    <span>Open My Course Workspace</span>
                  </button>
                )}

                <button
                  onClick={() => {
                    onNavigate("dashboard");
                    setMobileMenuOpen(false);
                  }}
                  className="w-full py-2 px-3 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs font-medium flex items-center justify-center gap-2"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  <span>Student Dashboard</span>
                </button>

                {isAdmin && (
                  <button
                    onClick={() => {
                      onNavigate("admin");
                      setMobileMenuOpen(false);
                    }}
                    className="w-full py-2 px-3 rounded-xl bg-purple-600 text-white text-xs font-semibold flex items-center justify-center gap-2"
                  >
                    <Shield className="w-4 h-4" />
                    <span>Admin Panel</span>
                  </button>
                )}

                <button
                  onClick={handleSignOut}
                  className="w-full py-2 px-3 rounded-xl text-red-600 dark:text-red-400 text-xs font-medium flex items-center justify-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => {
                      onOpenAuth("signin");
                      setMobileMenuOpen(false);
                    }}
                    className="w-full py-2.5 text-center rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200"
                  >
                    Student Sign In
                  </button>
                  <button
                    onClick={() => {
                      onOpenAuth("signup");
                      setMobileMenuOpen(false);
                    }}
                    className="w-full py-2.5 text-center rounded-xl bg-blue-600 text-xs font-semibold text-white shadow-sm"
                  >
                    Register
                  </button>
                </div>
                <button
                  onClick={() => {
                    onOpenAuth("admin");
                    setMobileMenuOpen(false);
                  }}
                  className="w-full py-2.5 text-center rounded-xl border border-purple-200 dark:border-purple-800 bg-purple-50 dark:bg-purple-950/40 text-xs font-bold text-purple-700 dark:text-purple-300 flex items-center justify-center gap-2"
                >
                  <Shield className="w-3.5 h-3.5" />
                  <span>Admin / Faculty Portal Login</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
