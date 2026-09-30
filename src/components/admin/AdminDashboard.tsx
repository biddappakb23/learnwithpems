import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import {
  getCourses,
  saveCourse,
  deleteCourse,
  getAllEnrollments,
  getAllUsers,
  enrollStudentInCourse,
  deleteUserProfile,
  updateUserRole,
  saveUserProfile,
  saveModule,
  saveLesson,
  getModules,
  getLessons,
  seedFirestoreCoursesIfEmpty
} from "../../services/db";
import { uploadMediaToCloudinary } from "../../services/cloudinary";
import { Course, Module, Lesson, User, CourseEnrollment, UserRole } from "../../types";
import { TechIcon } from "../TechIcon";
import {
  Shield,
  Users,
  BookOpen,
  Plus,
  Trash2,
  Edit,
  Upload,
  Image as ImageIcon,
  FileText,
  CheckCircle2,
  RefreshCw,
  Search,
  ExternalLink,
  Copy,
  Check,
  AlertCircle,
  Database,
  Sliders,
  Sparkles,
  BarChart3,
  UserPlus,
  UserCheck,
  GraduationCap,
  Crown,
  KeyRound,
  Filter
} from "lucide-react";

export const AdminDashboard: React.FC = () => {
  const { userProfile, firebaseUser } = useAuth();
  const [activeTab, setActiveTab] = useState<
    "analytics" | "courses" | "curriculum" | "students" | "media" | "database"
  >("analytics");

  const [courses, setCourses] = useState<Course[]>([]);
  const [students, setStudents] = useState<User[]>([]);
  const [enrollments, setEnrollments] = useState<CourseEnrollment[]>([]);
  const [modules, setModules] = useState<Module[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  // Media upload state
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [isUploadingMedia, setIsUploadingMedia] = useState(false);
  const [uploadedMediaList, setUploadedMediaList] = useState<
    Array<{ url: string; publicId: string; format: string; name: string }>
  >([]);
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);

  // Course editing state
  const [editingCourse, setEditingCourse] = useState<Partial<Course> | null>(null);
  const [isCourseModalOpen, setIsCourseModalOpen] = useState(false);

  // Student & User Management State
  const [studentSearch, setStudentSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<"ALL" | "ADMIN" | "INSTRUCTOR" | "STUDENT">("ALL");
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [newUserForm, setNewUserForm] = useState<{
    name: string;
    email: string;
    role: UserRole;
    courseId: string;
  }>({
    name: "",
    email: "",
    role: "ADMIN",
    courseId: "problem-solving-using-c"
  });

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    setIsLoading(true);
    try {
      const [cList, uList, eList] = await Promise.all([
        getCourses(),
        getAllUsers(),
        getAllEnrollments()
      ]);
      setCourses(cList);
      setStudents(uList);
      setEnrollments(eList);
      if (cList.length > 0 && !selectedCourseId) {
        setSelectedCourseId(cList[0].id);
        loadCurriculum(cList[0].id);
      }
    } catch (err) {
      console.error("Error loading admin data:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const loadCurriculum = async (cId: string) => {
    try {
      const [mList, lList] = await Promise.all([getModules(cId), getLessons(cId)]);
      setModules(mList);
      setLessons(lList);
    } catch (e) {
      console.warn("Curriculum fetch error:", e);
    }
  };

  const handleSaveCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCourse || !editingCourse.title) return;

    try {
      const courseId = editingCourse.id || editingCourse.title.toLowerCase().replace(/[^a-z0-9]/g, "-");
      const updated = await saveCourse({
        ...editingCourse,
        id: courseId,
        title: editingCourse.title,
        shortDesc: editingCourse.shortDesc || "",
        status: editingCourse.status || "Published",
        difficulty: editingCourse.difficulty || "Beginner",
        estimatedDurationHours: Number(editingCourse.estimatedDurationHours) || 45,
        instructorName: editingCourse.instructorName || "Prof. Pemmaiah U. T.",
        techIcon: editingCourse.techIcon || "c-lang",
        editorLanguage: editingCourse.editorLanguage || "C"
      } as Course);

      setStatusMessage({ text: "Course saved successfully!", type: "success" });
      setIsCourseModalOpen(false);
      setEditingCourse(null);
      await loadAllData();
    } catch (err: any) {
      setStatusMessage({ text: err.message || "Failed to save course", type: "error" });
    }
  };

  const handleDeleteCourse = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this course and its curriculum?")) return;
    try {
      await deleteCourse(id);
      setStatusMessage({ text: "Course deleted", type: "success" });
      await loadAllData();
    } catch (e: any) {
      setStatusMessage({ text: e.message || "Delete failed", type: "error" });
    }
  };

  const handleReassignStudentCourse = async (studentUid: string, studentName: string, studentEmail: string, newCourseId: string) => {
    const targetCourse = courses.find((c) => c.id === newCourseId);
    if (!targetCourse) return;

    try {
      await enrollStudentInCourse(
        studentUid,
        studentName,
        studentEmail,
        newCourseId,
        targetCourse.title
      );
      setStatusMessage({ text: `Reassigned ${studentName} to ${targetCourse.title}`, type: "success" });
      const updatedEnrollments = await getAllEnrollments();
      setEnrollments(updatedEnrollments);
    } catch (err: any) {
      setStatusMessage({ text: err.message || "Reassignment failed", type: "error" });
    }
  };

  const handleDeleteStudent = async (studentUid: string) => {
    if (!window.confirm("Delete this user profile and revoke enrollment?")) return;
    try {
      await deleteUserProfile(studentUid);
      setStatusMessage({ text: "User account deleted", type: "success" });
      await loadAllData();
    } catch (err: any) {
      setStatusMessage({ text: err.message || "Delete failed", type: "error" });
    }
  };

  const handleUpdateUserRole = async (
    userId: string,
    userName: string,
    userEmail: string,
    newRole: UserRole
  ) => {
    const isRootAdmin = userEmail.toLowerCase() === "pemmaiahoj@gmail.com";
    if (isRootAdmin && newRole !== "ADMIN" && newRole !== "MAIN_ADMIN") {
      alert("The primary master admin account (pemmaiahoj@gmail.com) cannot be demoted.");
      return;
    }

    try {
      await updateUserRole(userId, newRole);
      setStatusMessage({
        text: `Updated role for ${userName || userEmail} to ${newRole} in Firestore!`,
        type: "success"
      });
      setStudents((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
      );
    } catch (err: any) {
      setStatusMessage({ text: err.message || "Failed to update role", type: "error" });
    }
  };

  const handleCreateUserByAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserForm.email || !newUserForm.name) return;

    try {
      const generatedId = `usr_${newUserForm.email.toLowerCase().replace(/[^a-z0-9]/g, "_")}`;
      await saveUserProfile({
        id: generatedId,
        name: newUserForm.name,
        email: newUserForm.email.toLowerCase(),
        role: newUserForm.role,
        status: "APPROVED",
        assignedCourseIds: [newUserForm.courseId]
      });

      const targetCourse = courses.find((c) => c.id === newUserForm.courseId);
      await enrollStudentInCourse(
        generatedId,
        newUserForm.name,
        newUserForm.email.toLowerCase(),
        newUserForm.courseId,
        targetCourse?.title || "Assigned Course"
      );

      setStatusMessage({
        text: `User account created for ${newUserForm.name} (${newUserForm.role}) in Firestore!`,
        type: "success"
      });
      setIsAddUserModalOpen(false);
      setNewUserForm({
        name: "",
        email: "",
        role: "ADMIN",
        courseId: courses[0]?.id || "problem-solving-using-c"
      });
      await loadAllData();
    } catch (err: any) {
      setStatusMessage({ text: err.message || "Failed to create user", type: "error" });
    }
  };

  const handleUploadMedia = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mediaFile) return;

    setIsUploadingMedia(true);
    try {
      const result = await uploadMediaToCloudinary(mediaFile, "lwp_curriculum_assets");
      setUploadedMediaList((prev) => [
        {
          url: result.url,
          publicId: result.publicId,
          format: result.format,
          name: mediaFile.name
        },
        ...prev
      ]);
      setMediaFile(null);
      setStatusMessage({ text: "Media uploaded successfully to Cloudinary!", type: "success" });
    } catch (err: any) {
      setStatusMessage({ text: err.message || "Upload failed", type: "error" });
    } finally {
      setIsUploadingMedia(false);
    }
  };

  const handleReconstructDatabase = async () => {
    if (!window.confirm("Do you want to re-seed all courses and modules into Firestore from the master catalog?")) return;
    setIsLoading(true);
    try {
      await seedFirestoreCoursesIfEmpty();
      setStatusMessage({ text: "Database reconstructed & synchronized with Firestore!", type: "success" });
      await loadAllData();
    } catch (err: any) {
      setStatusMessage({ text: err.message || "Reconstruction error", type: "error" });
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedUrl(text);
    setTimeout(() => setCopiedUrl(null), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-gradient-to-r from-purple-950 via-slate-900 to-indigo-950 p-6 sm:p-8 rounded-3xl text-white border border-purple-800/40 shadow-xl">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-xs font-semibold">
            <Shield className="w-3.5 h-3.5" /> Administrative Master Control
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            LearnWithPems Admin Center
          </h1>
          <p className="text-xs sm:text-sm text-slate-300">
            Manage course curriculum, student enrollments, Cloudinary media, and database records.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadAllData}
            className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all cursor-pointer"
            title="Refresh Data"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              setEditingCourse({
                title: "",
                shortDesc: "",
                difficulty: "Beginner",
                status: "Published",
                estimatedDurationHours: 45,
                instructorName: "Prof. Pemmaiah U. T.",
                techIcon: "c-lang",
                editorLanguage: "C"
              });
              setIsCourseModalOpen(true);
            }}
            className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-md shadow-purple-600/25 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Create Course</span>
          </button>
        </div>
      </div>

      {/* Status Notice */}
      {statusMessage && (
        <div
          className={`p-4 rounded-2xl border flex items-center justify-between text-xs font-semibold ${
            statusMessage.type === "success"
              ? "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 text-emerald-800 dark:text-emerald-300"
              : "bg-red-50 dark:bg-red-950/40 border-red-300 text-red-800 dark:text-red-300"
          }`}
        >
          <span>{statusMessage.text}</span>
          <button onClick={() => setStatusMessage(null)} className="text-slate-400 hover:text-slate-600">
            ✕
          </button>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab("analytics")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
            activeTab === "analytics"
              ? "bg-purple-600 text-white shadow-md shadow-purple-600/20"
              : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>Overview & Stats</span>
        </button>

        <button
          onClick={() => setActiveTab("courses")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
            activeTab === "courses"
              ? "bg-purple-600 text-white shadow-md shadow-purple-600/20"
              : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Courses ({courses.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("students")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
            activeTab === "students"
              ? "bg-purple-600 text-white shadow-md shadow-purple-600/20"
              : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          }`}
        >
          <KeyRound className="w-4 h-4" />
          <span>Users & Role Permissions ({students.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("media")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
            activeTab === "media"
              ? "bg-purple-600 text-white shadow-md shadow-purple-600/20"
              : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          }`}
        >
          <ImageIcon className="w-4 h-4" />
          <span>Cloudinary Media Assets</span>
        </button>

        <button
          onClick={() => setActiveTab("database")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
            activeTab === "database"
              ? "bg-purple-600 text-white shadow-md shadow-purple-600/20"
              : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          }`}
        >
          <Database className="w-4 h-4" />
          <span>Database Maintenance</span>
        </button>
      </div>

      {/* TAB 1: Analytics & Metrics */}
      {activeTab === "analytics" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 flex items-center justify-center">
                <Users className="w-6 h-6" />
              </div>
              <div className="text-3xl font-black text-slate-900 dark:text-white">{students.length}</div>
              <div className="text-xs text-slate-500 font-medium">Total Registered Students</div>
            </div>

            <div className="p-6 rounded-3xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-purple-50 dark:bg-purple-950/50 text-purple-600 flex items-center justify-center">
                <BookOpen className="w-6 h-6" />
              </div>
              <div className="text-3xl font-black text-slate-900 dark:text-white">{courses.length}</div>
              <div className="text-xs text-slate-500 font-medium">Published University Courses</div>
            </div>

            <div className="p-6 rounded-3xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div className="text-3xl font-black text-slate-900 dark:text-white">{enrollments.length}</div>
              <div className="text-xs text-slate-500 font-medium">Active Enrolled Track Records</div>
            </div>

            <div className="p-6 rounded-3xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 flex items-center justify-center">
                <Database className="w-6 h-6" />
              </div>
              <div className="text-3xl font-black text-slate-900 dark:text-white">Firestore</div>
              <div className="text-xs text-slate-500 font-medium">Persistent Cloud DB Active</div>
            </div>
          </div>

          {/* Quick summary of enrollments per course */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Course Enrollment Breakdown</h3>
            <div className="space-y-3">
              {courses.map((course) => {
                const count = enrollments.filter((e) => e.courseId === course.id).length;
                const percentage = enrollments.length > 0 ? Math.round((count / enrollments.length) * 100) : 0;
                return (
                  <div key={course.id} className="space-y-1">
                    <div className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
                      <span>{course.title}</span>
                      <span>
                        {count} students ({percentage}%)
                      </span>
                    </div>
                    <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Courses Manager */}
      {activeTab === "courses" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => (
              <div
                key={course.id}
                className="p-6 rounded-3xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-slate-700 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                      <TechIcon name={course.techIcon || "c-lang"} className="w-5 h-5" />
                    </div>
                    <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                      {course.status || "Published"}
                    </span>
                  </div>
                  <h4 className="text-base font-bold text-slate-900 dark:text-white">{course.title}</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">{course.shortDesc}</p>
                  <div className="mt-3 text-xs text-slate-400 font-medium">
                    {course.difficulty} • {course.estimatedDurationHours || 40} Hours
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between">
                  <button
                    onClick={() => {
                      setEditingCourse(course);
                      setIsCourseModalOpen(true);
                    }}
                    className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 text-xs font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <Edit className="w-3.5 h-3.5" />
                    <span>Edit</span>
                  </button>
                  <button
                    onClick={() => handleDeleteCourse(course.id)}
                    className="p-2 rounded-xl text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 text-xs font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: User Accounts & Role Permissions Directory */}
      {activeTab === "students" && (
        <div className="space-y-6">
          {/* Quick Metric Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm space-y-1">
              <div className="flex items-center justify-between text-slate-500">
                <span className="text-xs font-semibold">Total Accounts</span>
                <Users className="w-4 h-4 text-purple-600" />
              </div>
              <div className="text-2xl font-extrabold text-slate-900 dark:text-white">
                {students.length}
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-purple-200 dark:border-purple-900/50 shadow-sm space-y-1">
              <div className="flex items-center justify-between text-purple-600">
                <span className="text-xs font-semibold">Administrators</span>
                <Crown className="w-4 h-4 text-purple-600" />
              </div>
              <div className="text-2xl font-extrabold text-purple-600">
                {students.filter((s) => s.role === "ADMIN" || s.role === "MAIN_ADMIN").length}
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-indigo-200 dark:border-indigo-900/50 shadow-sm space-y-1">
              <div className="flex items-center justify-between text-indigo-600">
                <span className="text-xs font-semibold">Faculty / Instructors</span>
                <GraduationCap className="w-4 h-4 text-indigo-600" />
              </div>
              <div className="text-2xl font-extrabold text-indigo-600">
                {students.filter((s) => s.role === "INSTRUCTOR").length}
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-blue-200 dark:border-blue-900/50 shadow-sm space-y-1">
              <div className="flex items-center justify-between text-blue-600">
                <span className="text-xs font-semibold">Enrolled Students</span>
                <UserCheck className="w-4 h-4 text-blue-600" />
              </div>
              <div className="text-2xl font-extrabold text-blue-600">
                {students.filter((s) => s.role !== "ADMIN" && s.role !== "MAIN_ADMIN" && s.role !== "INSTRUCTOR").length}
              </div>
            </div>
          </div>

          {/* Search, Filter Pills & Add User Button */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search by name, email, or role..."
                value={studentSearch}
                onChange={(e) => setStudentSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-purple-500 shadow-sm"
              />
            </div>

            <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
              <div className="inline-flex rounded-xl bg-slate-100 dark:bg-slate-800 p-1 border border-slate-200 dark:border-slate-700 text-[11px] font-semibold">
                <button
                  onClick={() => setRoleFilter("ALL")}
                  className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                    roleFilter === "ALL"
                      ? "bg-white dark:bg-slate-700 text-purple-600 dark:text-purple-300 shadow-xs"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
                  }`}
                >
                  All ({students.length})
                </button>
                <button
                  onClick={() => setRoleFilter("ADMIN")}
                  className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                    roleFilter === "ADMIN"
                      ? "bg-purple-600 text-white shadow-xs"
                      : "text-slate-600 dark:text-slate-400 hover:text-purple-600"
                  }`}
                >
                  Admins ({students.filter((s) => s.role === "ADMIN" || s.role === "MAIN_ADMIN").length})
                </button>
                <button
                  onClick={() => setRoleFilter("INSTRUCTOR")}
                  className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                    roleFilter === "INSTRUCTOR"
                      ? "bg-indigo-600 text-white shadow-xs"
                      : "text-slate-600 dark:text-slate-400 hover:text-indigo-600"
                  }`}
                >
                  Instructors ({students.filter((s) => s.role === "INSTRUCTOR").length})
                </button>
                <button
                  onClick={() => setRoleFilter("STUDENT")}
                  className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                    roleFilter === "STUDENT"
                      ? "bg-blue-600 text-white shadow-xs"
                      : "text-slate-600 dark:text-slate-400 hover:text-blue-600"
                  }`}
                >
                  Students ({students.filter((s) => s.role !== "ADMIN" && s.role !== "MAIN_ADMIN" && s.role !== "INSTRUCTOR").length})
                </button>
              </div>

              <button
                onClick={() => setIsAddUserModalOpen(true)}
                className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-md shadow-purple-600/20 transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
              >
                <UserPlus className="w-4 h-4" />
                <span>Add User / Admin</span>
              </button>
            </div>
          </div>

          {/* User Directory Table */}
          <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-700 text-slate-500 uppercase tracking-wider font-semibold">
                  <tr>
                    <th className="px-6 py-4">User Account</th>
                    <th className="px-6 py-4">Role & Access</th>
                    <th className="px-6 py-4">Change Role (Firestore)</th>
                    <th className="px-6 py-4">Active Enrolled Course</th>
                    <th className="px-6 py-4">Reassign Course</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                  {students
                    .filter((s) => {
                      if (roleFilter === "ADMIN") return s.role === "ADMIN" || s.role === "MAIN_ADMIN";
                      if (roleFilter === "INSTRUCTOR") return s.role === "INSTRUCTOR";
                      if (roleFilter === "STUDENT") return s.role !== "ADMIN" && s.role !== "MAIN_ADMIN" && s.role !== "INSTRUCTOR";
                      return true;
                    })
                    .filter((s) => {
                      const q = studentSearch.toLowerCase();
                      return (
                        s.name?.toLowerCase().includes(q) ||
                        s.email?.toLowerCase().includes(q) ||
                        s.role?.toLowerCase().includes(q)
                      );
                    })
                    .map((st) => {
                      const studentEnrollment = enrollments.find(
                        (e) => e.studentId === st.id || (e as any).studentUid === st.id
                      );
                      const isSuperAdmin = st.email?.toLowerCase() === "pemmaiahoj@gmail.com";

                      return (
                        <tr key={st.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/40 transition-colors">
                          {/* User Column */}
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs ${
                                st.role === "ADMIN" || st.role === "MAIN_ADMIN"
                                  ? "bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300"
                                  : st.role === "INSTRUCTOR"
                                  ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300"
                                  : "bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300"
                              }`}>
                                {st.name ? st.name.charAt(0).toUpperCase() : "U"}
                              </div>
                              <div>
                                <div className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                                  <span>{st.name || "Student Learner"}</span>
                                  {isSuperAdmin && (
                                    <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-amber-100 text-amber-800 text-[10px] font-bold" title="Primary Master Admin">
                                      <Crown className="w-3 h-3 text-amber-600" /> Owner
                                    </span>
                                  )}
                                </div>
                                <div className="text-slate-400 text-[11px]">{st.email}</div>
                              </div>
                            </div>
                          </td>

                          {/* Role Badge */}
                          <td className="px-6 py-4">
                            <span
                              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-bold text-[11px] ${
                                st.role === "ADMIN" || st.role === "MAIN_ADMIN"
                                  ? "bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300 border border-purple-200 dark:border-purple-800"
                                  : st.role === "INSTRUCTOR"
                                  ? "bg-indigo-100 text-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800"
                                  : "bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-800"
                              }`}
                            >
                              {st.role === "ADMIN" || st.role === "MAIN_ADMIN" ? (
                                <Shield className="w-3.5 h-3.5 text-purple-600" />
                              ) : st.role === "INSTRUCTOR" ? (
                                <GraduationCap className="w-3.5 h-3.5 text-indigo-600" />
                              ) : (
                                <Users className="w-3.5 h-3.5 text-blue-500" />
                              )}
                              <span>{st.role || "STUDENT"}</span>
                            </span>
                          </td>

                          {/* Dynamic Role Change Dropdown */}
                          <td className="px-6 py-4">
                            {isSuperAdmin ? (
                              <span className="text-[11px] text-slate-400 font-medium italic">
                                Permanent Admin
                              </span>
                            ) : (
                              <select
                                value={st.role || "STUDENT"}
                                onChange={(e) =>
                                  handleUpdateUserRole(
                                    st.id,
                                    st.name,
                                    st.email,
                                    e.target.value as UserRole
                                  )
                                }
                                className="px-2.5 py-1.5 rounded-xl border border-purple-200 dark:border-purple-900/60 bg-purple-50/50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-purple-500 cursor-pointer"
                              >
                                <option value="ADMIN">🛡️ Admin (Full Control)</option>
                                <option value="INSTRUCTOR">🎓 Instructor / Faculty</option>
                                <option value="STUDENT">👤 Student (Course Learner)</option>
                              </select>
                            )}
                          </td>

                          {/* Enrolled Course */}
                          <td className="px-6 py-4 font-semibold text-slate-800 dark:text-slate-200">
                            {studentEnrollment?.courseTitle || (
                              <span className="text-amber-600 font-normal italic">None assigned</span>
                            )}
                          </td>

                          {/* Reassign Course */}
                          <td className="px-6 py-4">
                            <select
                              value={studentEnrollment?.courseId || ""}
                              onChange={(e) =>
                                handleReassignStudentCourse(st.id, st.name, st.email, e.target.value)
                              }
                              className="px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 text-xs focus:outline-none cursor-pointer"
                            >
                              <option value="" disabled>
                                Reassign to...
                              </option>
                              {courses.map((c) => (
                                <option key={c.id} value={c.id}>
                                  {c.title}
                                </option>
                              ))}
                            </select>
                          </td>

                          {/* Actions */}
                          <td className="px-6 py-4 text-right">
                            {isSuperAdmin ? (
                              <span className="text-slate-400 text-[10px]">Protected</span>
                            ) : (
                              <button
                                onClick={() => handleDeleteStudent(st.id)}
                                className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg transition-colors cursor-pointer"
                                title="Delete User Account"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>

              {students.length === 0 && (
                <div className="p-12 text-center space-y-2">
                  <Users className="w-8 h-8 mx-auto text-slate-300" />
                  <p className="text-xs font-semibold text-slate-500">No user accounts found.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: Cloudinary Media Uploader & Asset Library */}
      {activeTab === "media" && (
        <div className="space-y-6">
          <div className="p-8 rounded-3xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Upload className="w-5 h-5 text-purple-600" /> Cloudinary Media Uploader (Images & PDFs)
            </h3>
            <p className="text-xs text-slate-500">
              Upload diagrams, flowcharts, code screenshots, or lecture PDF documents directly to Cloudinary.
            </p>

            <form onSubmit={handleUploadMedia} className="flex flex-col sm:flex-row items-center gap-4 pt-2">
              <input
                type="file"
                accept="image/*,application/pdf"
                onChange={(e) => setMediaFile(e.target.files?.[0] || null)}
                className="block w-full text-xs text-slate-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100 cursor-pointer"
              />
              <button
                type="submit"
                disabled={!mediaFile || isUploadingMedia}
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-md shadow-purple-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isUploadingMedia ? <span>Uploading...</span> : <span>Upload Media</span>}
              </button>
            </form>
          </div>

          {/* Uploaded Media Grid */}
          {uploadedMediaList.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Recently Uploaded Media Assets
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {uploadedMediaList.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-3"
                  >
                    {item.format === "pdf" ? (
                      <div className="h-32 rounded-xl bg-red-50 flex items-center justify-center text-red-600">
                        <FileText className="w-12 h-12" />
                      </div>
                    ) : (
                      <img
                        src={item.url}
                        alt={item.name}
                        className="h-32 w-full object-cover rounded-xl border border-slate-100"
                      />
                    )}
                    <div className="text-xs font-bold text-slate-800 truncate">{item.name}</div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => copyToClipboard(`![${item.name}](${item.url})`)}
                        className="flex-1 py-1.5 px-3 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-semibold flex items-center justify-center gap-1"
                      >
                        {copiedUrl === `![${item.name}](${item.url})` ? (
                          <Check className="w-3 h-3 text-emerald-600" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                        <span>Copy Markdown Embed</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 5: Database Maintenance */}
      {activeTab === "database" && (
        <div className="p-8 rounded-3xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm space-y-6">
          <div className="space-y-2">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Database className="w-5 h-5 text-purple-600" /> Clean Database Reconstruction & Reseed
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed max-w-2xl">
              Synchronize the persistent Firestore database collections with the master BCA curriculum data. This will recreate all modules, chapters, and rich theoretical lessons while preserving all student accounts.
            </p>
          </div>

          <button
            onClick={handleReconstructDatabase}
            className="px-6 py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold text-xs shadow-md shadow-purple-600/20 transition-all flex items-center gap-2 cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Reconstruct & Seed Firestore Database</span>
          </button>
        </div>
      )}

      {/* Course Edit / Create Modal */}
      {isCourseModalOpen && editingCourse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-xl w-full p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              {editingCourse.id ? "Edit Course" : "Create New Course"}
            </h3>

            <form onSubmit={handleSaveCourse} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Course Title
                </label>
                <input
                  type="text"
                  required
                  value={editingCourse.title || ""}
                  onChange={(e) => setEditingCourse({ ...editingCourse, title: e.target.value })}
                  placeholder="e.g. Object-Oriented Programming with Java"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Short Description
                </label>
                <textarea
                  rows={3}
                  value={editingCourse.shortDesc || ""}
                  onChange={(e) => setEditingCourse({ ...editingCourse, shortDesc: e.target.value })}
                  placeholder="Brief overview of curriculum..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Difficulty
                  </label>
                  <select
                    value={editingCourse.difficulty || "Beginner"}
                    onChange={(e) => setEditingCourse({ ...editingCourse, difficulty: e.target.value as any })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Duration (Hours)
                  </label>
                  <input
                    type="number"
                    value={editingCourse.estimatedDurationHours || 45}
                    onChange={(e) =>
                      setEditingCourse({ ...editingCourse, estimatedDurationHours: Number(e.target.value) })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsCourseModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold cursor-pointer"
                >
                  Save Course
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add User / Admin Modal */}
      {isAddUserModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-5">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-100 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 text-xs font-bold">
                <KeyRound className="w-3.5 h-3.5" /> Direct Firestore Provisioning
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Add New User, Admin or Faculty
              </h3>
              <p className="text-xs text-slate-500">
                Create a persistent Firestore profile. The user can sign in with this email via Google or password to immediately inherit these permissions.
              </p>
            </div>

            <form onSubmit={handleCreateUserByAdmin} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={newUserForm.name}
                  onChange={(e) => setNewUserForm({ ...newUserForm, name: e.target.value })}
                  placeholder="e.g. Prof. Anand Kumar or Suman R."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-purple-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={newUserForm.email}
                  onChange={(e) => setNewUserForm({ ...newUserForm, email: e.target.value })}
                  placeholder="user@example.com or user@cauverycollege.edu.in"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-purple-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    System Role
                  </label>
                  <select
                    value={newUserForm.role}
                    onChange={(e) => setNewUserForm({ ...newUserForm, role: e.target.value as UserRole })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-purple-500 focus:outline-none font-semibold cursor-pointer"
                  >
                    <option value="ADMIN">🛡️ Admin (Full Access)</option>
                    <option value="INSTRUCTOR">🎓 Instructor / Faculty</option>
                    <option value="STUDENT">👤 Student Learner</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Default Course Assignment
                  </label>
                  <select
                    value={newUserForm.courseId}
                    onChange={(e) => setNewUserForm({ ...newUserForm, courseId: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-purple-500 focus:outline-none font-semibold cursor-pointer"
                  >
                    {courses.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.title}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddUserModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-semibold cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold cursor-pointer shadow-md shadow-purple-600/20"
                >
                  Provision User Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
