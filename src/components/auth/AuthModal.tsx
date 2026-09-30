import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { getCourses } from "../../services/db";
import { Course } from "../../types";
import { TechIcon } from "../TechIcon";
import { BrandLogo } from "../BrandLogo";
import {
  X,
  Lock,
  Mail,
  User as UserIcon,
  CheckCircle2,
  ArrowRight,
  BookOpen,
  Sparkles,
  AlertCircle,
  Clock,
  GraduationCap
} from "lucide-react";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: "signin" | "signup" | "admin";
  preselectedCourseId?: string;
  onSuccess?: (courseId?: string, userRole?: string) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialMode = "signin",
  preselectedCourseId,
  onSuccess
}) => {
  const { signIn, signUp, signInWithGoogle } = useAuth();
  const [mode, setMode] = useState<"signin" | "signup" | "admin">(initialMode);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [selectedCourseId, setSelectedCourseId] = useState<string>(preselectedCourseId || "");
  const [availableCourses, setAvailableCourses] = useState<Course[]>([]);
  const [loadingCourses, setLoadingCourses] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleSubmitting, setIsGoogleSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setMode(initialMode);
    if (preselectedCourseId) {
      setSelectedCourseId(preselectedCourseId);
    }
  }, [initialMode, preselectedCourseId, isOpen]);

  // Fetch real-time available courses from Firestore
  useEffect(() => {
    if (isOpen) {
      setLoadingCourses(true);
      getCourses()
        .then((courses) => {
          const published = courses.filter((c) => c.status === "Published" || !c.status);
          setAvailableCourses(published);
          if (published.length > 0) {
            if (!selectedCourseId || !published.some(c => c.id === selectedCourseId)) {
              setSelectedCourseId(preselectedCourseId || published[0].id);
            }
          }
        })
        .catch((err) => {
          console.warn("Could not load courses for registration:", err);
        })
        .finally(() => {
          setLoadingCourses(false);
        });
    }
  }, [isOpen, preselectedCourseId]);

  if (!isOpen) return null;

  const handleGoogleAuth = async () => {
    setError(null);
    setIsGoogleSubmitting(true);
    try {
      const chosenCourse = selectedCourseId || (availableCourses[0]?.id) || "problem-solving-using-c";
      const result = await signInWithGoogle(chosenCourse);
      onClose();
      if (onSuccess) {
        onSuccess(result.enrollment?.courseId || chosenCourse, result.profile?.role);
      }
    } catch (err: any) {
      console.error("Google Auth error:", err);
      if (err.code === "auth/popup-closed-by-user") {
        setError("Sign in popup was closed before completing. Please click again to sign in with Google.");
      } else if (err.code === "auth/cancelled-popup-request") {
        setError("Authentication was cancelled.");
      } else if (err.code === "auth/popup-blocked") {
        setError("Google Sign-In popup was blocked by your browser. Please allow popups or use Username/Password login below.");
      } else if (err.code === "auth/unauthorized-domain") {
        setError("This domain is being authorized by Firebase. In the meantime, you can sign in with Username 'learnadmin' and Password 'onish123'.");
      } else {
        setError(err.message || "Google authentication encountered an issue. Try the Email/Username login below.");
      }
    } finally {
      setIsGoogleSubmitting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (mode === "signup") {
      if (!name.trim()) {
        setError("Please enter your full name.");
        return;
      }
      const chosenCourse = selectedCourseId || (availableCourses[0]?.id) || "problem-solving-using-c";
      if (password.length < 6) {
        setError("Password must be at least 6 characters long.");
        return;
      }
      if (password !== confirmPassword) {
        setError("Passwords do not match. Please re-enter.");
        return;
      }

      setIsSubmitting(true);
      try {
        const result = await signUp(email, password, name, chosenCourse);
        onClose();
        if (onSuccess) {
          onSuccess(result.enrollment.courseId, result.profile?.role);
        }
      } catch (err: any) {
        console.error("Registration error:", err);
        if (err.code === "auth/email-already-in-use") {
          setError("An account with this email already exists. Please switch to Sign In.");
        } else if (err.code === "auth/operation-not-allowed") {
          setError(
            "Email/Password registration is not yet enabled in the Firebase Console. You can use 'Continue with Google' above for 1-Click registration."
          );
        } else if (err.code === "auth/invalid-email") {
          setError("Please enter a valid email address.");
        } else if (err.code === "auth/weak-password") {
          setError("Password is too weak. Please use at least 6 characters.");
        } else {
          setError(err.message || "Failed to create student account. Please try again.");
        }
      } finally {
        setIsSubmitting(false);
      }
    } else {
      // Sign In or Admin Mode
      if (!email.trim() || !password) {
        setError(mode === "admin" ? "Please enter your admin username/email and password." : "Please enter your email and password.");
        return;
      }

      setIsSubmitting(true);
      try {
        const result = await signIn(email.trim(), password);
        onClose();
        if (onSuccess) {
          onSuccess(result.enrollment?.courseId, result.profile?.role);
        }
      } catch (err: any) {
        console.error("Sign in error:", err);
        if (
          err.code === "auth/user-not-found" ||
          err.code === "auth/wrong-password" ||
          err.code === "auth/invalid-credential"
        ) {
          setError("Invalid username/email or password. Please verify your credentials.");
        } else if (err.code === "auth/operation-not-allowed") {
          setError(
            "Email/Password provider is not enabled in Firebase Console. Please use 'Continue with Google' to sign in."
          );
        } else {
          setError(err.message || "Sign in failed. Please try again.");
        }
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
        {/* Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/70">
          <BrandLogo size="sm" showTagline={false} />
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          <button
            type="button"
            onClick={() => {
              setMode("signin");
              setError(null);
            }}
            className={`flex-1 py-3 text-center font-medium text-xs sm:text-sm transition-all cursor-pointer ${
              mode === "signin"
                ? "text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400 bg-blue-50/40 dark:bg-blue-950/20 font-bold"
                : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
            }`}
          >
            Student Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setMode("signup");
              setError(null);
            }}
            className={`flex-1 py-3 text-center font-medium text-xs sm:text-sm transition-all cursor-pointer ${
              mode === "signup"
                ? "text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400 bg-blue-50/40 dark:bg-blue-950/20 font-bold"
                : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
            }`}
          >
            New Student
          </button>
          <button
            type="button"
            onClick={() => {
              setMode("admin");
              setError(null);
            }}
            className={`flex-1 py-3 text-center font-medium text-xs sm:text-sm transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              mode === "admin"
                ? "text-purple-600 dark:text-purple-300 border-b-2 border-purple-600 dark:border-purple-400 bg-purple-50/40 dark:bg-purple-950/30 font-bold"
                : "text-slate-500 dark:text-slate-400 hover:text-purple-600 dark:hover:text-purple-300"
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Admin / Faculty</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5">
          {mode === "admin" && (
            <div className="space-y-3">
              <div className="p-3.5 rounded-xl bg-purple-50 dark:bg-purple-950/50 border border-purple-200 dark:border-purple-900/60 text-purple-900 dark:text-purple-200 text-xs flex items-start gap-2.5">
                <Sparkles className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">Faculty & Administrator Portal:</span> Sign in with your registered administrator Google Account or administrative credentials to manage courses, students, and compiler settings.
                </div>
              </div>

              {/* Quick Fill Credentials Banner */}
              <div className="p-3 rounded-xl bg-slate-900 text-white dark:bg-slate-800 border border-purple-500/30 flex items-center justify-between text-xs shadow-xs">
                <div>
                  <div className="text-[11px] text-purple-300 font-semibold tracking-wider uppercase">Default Admin Login</div>
                  <div className="text-xs font-mono font-medium text-slate-200 mt-0.5">
                    User: <span className="text-yellow-300 font-bold">learnadmin</span> • Pass: <span className="text-yellow-300 font-bold">onish123</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setEmail("learnadmin");
                    setPassword("onish123");
                    setError(null);
                  }}
                  className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 active:scale-95 text-white font-semibold text-xs transition-all cursor-pointer shadow-xs"
                >
                  Autofill
                </button>
              </div>
            </div>
          )}

          {/* Quick Google Sign In */}
          <button
            type="button"
            onClick={handleGoogleAuth}
            disabled={isGoogleSubmitting || isSubmitting}
            className={`w-full py-3 px-4 rounded-xl border font-semibold text-sm shadow-xs flex items-center justify-center gap-3 transition-all disabled:opacity-50 cursor-pointer ${
              mode === "admin"
                ? "border-purple-200 dark:border-purple-900/80 bg-purple-50/30 dark:bg-slate-800 hover:bg-purple-50 dark:hover:bg-slate-700/80 text-purple-900 dark:text-purple-100"
                : "border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/80 text-slate-800 dark:text-slate-100"
            }`}
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>
              {isGoogleSubmitting
                ? "Connecting to Google..."
                : mode === "admin"
                ? "Sign in as Admin with Google"
                : mode === "signup"
                ? "Register with Google (1-Click)"
                : "Continue with Google"}
            </span>
          </button>

          <div className="relative flex py-1 items-center">
            <div className="flex-grow border-t border-slate-200 dark:border-slate-800"></div>
            <span className="flex-shrink mx-4 text-xs font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              {mode === "admin" ? "Or Admin Login" : "Or with Email"}
            </span>
            <div className="flex-grow border-t border-slate-200 dark:border-slate-800"></div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/60 text-red-700 dark:text-red-300 text-sm">
                <AlertCircle className="w-5 h-5 shrink-0 text-red-500 mt-0.5" />
                <span className="leading-relaxed">{error}</span>
              </div>
            )}

            {mode === "signup" && (
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                  Full Name
                </label>
                <div className="relative">
                  <UserIcon className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Anand Kumar"
                    className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                {mode === "admin" ? "Admin Username or Email" : "Email Address"}
              </label>
              <div className="relative">
                <Mail className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type={mode === "admin" ? "text" : "email"}
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={mode === "admin" ? "learnadmin or admin@learnwithpems.in" : "student@example.com"}
                  className={`w-full pl-11 pr-4 py-2.5 rounded-xl border bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 text-sm ${
                    mode === "admin"
                      ? "border-purple-200 dark:border-purple-800 focus:ring-purple-500"
                      : "border-slate-200 dark:border-slate-700 focus:ring-blue-500"
                  }`}
                />
              </div>
            </div>

            <div className={mode === "signup" ? "grid grid-cols-1 sm:grid-cols-2 gap-4" : ""}>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className={`w-full pl-11 pr-4 py-2.5 rounded-xl border bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 text-sm ${
                      mode === "admin"
                        ? "border-purple-200 dark:border-purple-800 focus:ring-purple-500"
                        : "border-slate-200 dark:border-slate-700 focus:ring-blue-500"
                    }`}
                  />
                </div>
              </div>

              {mode === "signup" && (
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Lock className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="password"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* COURSE SELECTION (MANDATORY ON REGISTRATION) */}
            {mode === "signup" && (
              <div className="pt-2">
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    Choose Your Enrolled Course Track <span className="text-blue-600">*</span>
                  </label>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                    1 Active Course per Student
                  </span>
                </div>

                {loadingCourses ? (
                  <div className="p-6 text-center text-sm text-slate-500">Loading available courses...</div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-52 overflow-y-auto p-1 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50/50 dark:bg-slate-950/40">
                    {availableCourses.map((course) => {
                      const isSelected = selectedCourseId === course.id;
                      return (
                        <div
                          key={course.id}
                          onClick={() => setSelectedCourseId(course.id)}
                          className={`p-3 rounded-xl border cursor-pointer transition-all flex items-start gap-3 ${
                            isSelected
                              ? "bg-blue-50 dark:bg-blue-950/50 border-blue-500 dark:border-blue-400 ring-2 ring-blue-500/20 shadow-sm"
                              : "bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600"
                          }`}
                        >
                          <div
                            className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                              isSelected
                                ? "bg-blue-600 text-white"
                                : "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300"
                            }`}
                          >
                            <TechIcon name={course.techIcon || "c-lang"} className="w-5 h-5" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between gap-1">
                              <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                                {course.title}
                              </h4>
                              {isSelected && (
                                <CheckCircle2 className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                              )}
                            </div>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                                {course.shortDesc}
                            </p>
                            <div className="flex items-center gap-2 mt-1 text-[10px] text-slate-500 dark:text-slate-400">
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" /> {course.estimatedDurationHours || 40}h
                              </span>
                              <span>•</span>
                              <span className="font-medium text-blue-600 dark:text-blue-400">{course.difficulty}</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Submit Action */}
            <button
              type="submit"
              disabled={isSubmitting || isGoogleSubmitting}
              className={`w-full py-3 px-4 rounded-xl text-white font-semibold text-sm shadow-md flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer ${
                mode === "admin"
                  ? "bg-purple-600 hover:bg-purple-700 shadow-purple-600/20 hover:shadow-purple-600/30"
                  : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-blue-600/20 hover:shadow-blue-600/30"
              }`}
            >
              {isSubmitting ? (
                <span>Authenticating...</span>
              ) : mode === "admin" ? (
                <>
                  <Lock className="w-4 h-4" />
                  <span>Access Admin Control Center</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              ) : mode === "signup" ? (
                <>
                  <span>Complete Student Registration</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              ) : (
                <>
                  <span>Sign In with Email</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            {/* Switch Prompt */}
            <div className="text-center pt-1">
              {mode === "signin" ? (
                <div className="space-y-1.5">
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Don't have an account?{" "}
                    <button
                      type="button"
                      onClick={() => {
                        setMode("signup");
                        setError(null);
                      }}
                      className="font-semibold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                    >
                      Register as a New Student
                    </button>
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Faculty or Admin?{" "}
                    <button
                      type="button"
                      onClick={() => {
                        setMode("admin");
                        setError(null);
                      }}
                      className="font-semibold text-purple-600 dark:text-purple-400 hover:underline cursor-pointer"
                    >
                      Admin / Faculty Login
                    </button>
                  </p>
                </div>
              ) : mode === "signup" ? (
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Already registered?{" "}
                  <button
                    type="button"
                    onClick={() => {
                      setMode("signin");
                      setError(null);
                    }}
                    className="font-semibold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                  >
                    Sign in here
                  </button>
                </p>
              ) : (
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Looking for student learning portal?{" "}
                  <button
                    type="button"
                    onClick={() => {
                      setMode("signin");
                      setError(null);
                    }}
                    className="font-semibold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                  >
                    Student Sign In
                  </button>
                </p>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

