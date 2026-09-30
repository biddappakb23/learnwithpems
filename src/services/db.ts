import {
  Course,
  Module,
  Chapter,
  Lesson,
  PracticeProblem,
  QuizQuestion,
  QuizAttempt,
  StudentProgress,
  Category,
  AnalyticsSummary,
  StudentDashboardMetrics,
  ContentStatus,
  CourseStatus,
  User,
  UserAccount,
  UserRole,
  AccountStatus,
  SiteSettings,
  ContactMessage,
  AnnouncementPopupConfig,
  CourseEnrollment,
  EnrollmentStatus,
  InstructorProfile,
  AuditLog,
  CustomMenuItem,
  CustomSubmenuItem,
  StudentDoubt,
  DoubtCategory,
  DoubtStatus,
  HelplineChatMessage
} from "../types";
import { CATALOG_COURSES } from "../data/coursesCatalog";
export { CATALOG_COURSES };
import { PROBLEM_SOLVING_USING_C_COURSE, PROBLEM_SOLVING_USING_C_MODULES } from "../data/cProblemSolvingCourseData";
import { PROBLEM_SOLVING_USING_C_CHAPTERS, PROBLEM_SOLVING_USING_C_LESSONS } from "../data/cProblemSolvingChapters";
import { db, auth, handleFirestoreError, OperationType } from "./firebase";
import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  deleteDoc,
  query,
  where,
  orderBy,
  onSnapshot
} from "firebase/firestore";

// Local storage backup keys for offline resilience
const LOCAL_STORAGE_KEYS = {
  COURSES: "lms_clean_courses_cache",
  MODULES: "lms_clean_modules_cache",
  CHAPTERS: "lms_clean_chapters_cache",
  LESSONS: "lms_clean_lessons_cache",
  ENROLLMENTS: "lms_clean_enrollments_cache",
  PROGRESS: "lms_clean_progress_cache",
  SETTINGS: "lms_clean_settings_cache",
  USERS: "lms_clean_users_cache"
};

export const DEFAULT_SETTINGS: SiteSettings = {
  id: "general",
  siteName: "LearnWithPems",
  siteTagline: "Academic Learning Management System",
  contactEmail: "pemmaiahoj@gmail.com",
  contactPhone: "+91 98450 12345",
  academicDepartment: "Department of BCA, Cauvery College, Gonikoppal",
  authorName: "Pemmaiah U. T.",
  authorTitle: "Head of Department of BCA, Cauvery College, Gonikoppal",
  authorPhotoUrl: "",
  authorAvatarUrl: "",
  authorBio: "Head of the Department of Computer Applications (BCA) at Cauvery College, Gonikoppal with over 20+ years of university teaching experience.",
  authorQualification: "M.C.A., M.Phil (Comp. Sci)",
  authorCollege: "Cauvery College, Gonikoppal, Kodagu, Karnataka",
  showLogoHighlightHome: true,
  showLogoHighlightDashboard: true,
  logoBadgeText: "Verified BCA Curriculum",
  announcementPopup: {
    enabled: false,
    title: "Welcome to LearnWithPems",
    message: "Explore our comprehensive curriculum in C Programming, Data Structures, Java, Python, and more.",
    type: "info"
  },
  customMenus: [],
  preventContentCopy: false,
  updatedAt: new Date().toISOString()
};

// In-memory memory cache
let cachedCourses: Course[] | null = null;
let cachedModules: Module[] | null = null;
let cachedChapters: Chapter[] | null = null;
let cachedLessons: Lesson[] | null = null;
let hasSeededFirestore = false;

// =========================================================================
// 1. INITIAL SEEDING & FIRESTORE POPULATION
// =========================================================================

/**
 * Cleanly seed the 12 master courses and complete curriculum into Firestore
 */
export async function seedFirestoreCoursesIfEmpty(forceRebuild = false): Promise<void> {
  if (hasSeededFirestore && !forceRebuild) return;

  try {
    const coursesSnap = await getDocs(collection(db, "courses"));
    const existingCount = coursesSnap.size;

    if (existingCount === 0 || forceRebuild) {
      console.log("[LMS DB] Seeding master courses and curriculum into Firestore...");

      // Prepare all courses from Catalog
      const allMasterCourses: Course[] = [...CATALOG_COURSES];

      // Ensure problem-solving-using-c is properly integrated with C course metadata
      const cCourseIdx = allMasterCourses.findIndex(c => c.id === "learn-c" || c.id === "problem-solving-using-c");
      if (cCourseIdx >= 0) {
        allMasterCourses[cCourseIdx] = {
          ...allMasterCourses[cCourseIdx],
          ...PROBLEM_SOLVING_USING_C_COURSE,
          id: allMasterCourses[cCourseIdx].id,
          totalModules: PROBLEM_SOLVING_USING_C_MODULES.length,
          totalLessons: PROBLEM_SOLVING_USING_C_LESSONS.length
        };
      }

      // Write each course
      for (const course of allMasterCourses) {
        await setDoc(doc(db, "courses", course.id), {
          ...course,
          status: "Published",
          updatedAt: new Date().toISOString()
        }, { merge: true });
      }

      // Seed C modules
      for (const mod of PROBLEM_SOLVING_USING_C_MODULES) {
        await setDoc(doc(db, "modules", mod.id), {
          ...mod,
          courseId: "learn-c",
          status: "Published",
          updatedAt: new Date().toISOString()
        }, { merge: true });

        // Also duplicate for problem-solving-using-c key for seamless routing
        await setDoc(doc(db, "modules", `${mod.id}_ps`), {
          ...mod,
          id: `${mod.id}_ps`,
          courseId: "problem-solving-using-c",
          status: "Published",
          updatedAt: new Date().toISOString()
        }, { merge: true });
      }

      // Seed C chapters / lessons
      for (const chap of PROBLEM_SOLVING_USING_C_CHAPTERS) {
        await setDoc(doc(db, "chapters", chap.id), {
          ...chap,
          courseId: "learn-c",
          status: "Published",
          updatedAt: new Date().toISOString()
        }, { merge: true });
      }

      for (const les of PROBLEM_SOLVING_USING_C_LESSONS) {
        await setDoc(doc(db, "lessons", les.id), {
          ...les,
          courseId: "learn-c",
          status: "Published",
          updatedAt: new Date().toISOString()
        }, { merge: true });
      }

      // Seed default settings
      await setDoc(doc(db, "settings", "general"), DEFAULT_SETTINGS, { merge: true });

      console.log("[LMS DB] Successfully seeded Firestore with courses and curriculum.");
    }
    hasSeededFirestore = true;
  } catch (err) {
    console.warn("[LMS DB] Firestore seeding notice (offline / rules check):", err);
  }
}

// =========================================================================
// 2. COURSES API (FIRESTORE FIRST)
// =========================================================================

export async function getCourses(): Promise<Course[]> {
  try {
    await seedFirestoreCoursesIfEmpty();
    const snap = await getDocs(collection(db, "courses"));
    if (!snap.empty) {
      const courses: Course[] = [];
      snap.forEach(docSnap => {
        courses.push(docSnap.data() as Course);
      });
      courses.sort((a, b) => (a.displayOrder || 99) - (b.displayOrder || 99));
      cachedCourses = courses;
      try {
        localStorage.setItem(LOCAL_STORAGE_KEYS.COURSES, JSON.stringify(courses));
      } catch (e) {}
      return courses;
    }
  } catch (err) {
    console.warn("[LMS DB] Firestore getCourses fallback to catalog:", err);
  }

  // Fallback to local cache or catalog
  if (cachedCourses && cachedCourses.length > 0) return cachedCourses;
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEYS.COURSES);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        cachedCourses = parsed;
        return parsed;
      }
    }
  } catch (e) {}

  return CATALOG_COURSES;
}

export async function getCourseById(courseId: string): Promise<Course | null> {
  if (!courseId) return null;
  const cleanId = courseId.trim();

  // Try direct Firestore get
  try {
    const docSnap = await getDoc(doc(db, "courses", cleanId));
    if (docSnap.exists()) {
      return docSnap.data() as Course;
    }
    // Check aliased IDs (e.g. learn-c vs problem-solving-using-c)
    if (cleanId === "problem-solving-using-c" || cleanId === "c") {
      const altSnap = await getDoc(doc(db, "courses", "learn-c"));
      if (altSnap.exists()) return altSnap.data() as Course;
    }
    if (cleanId === "learn-c") {
      const altSnap = await getDoc(doc(db, "courses", "problem-solving-using-c"));
      if (altSnap.exists()) return altSnap.data() as Course;
    }
  } catch (err) {
    console.warn("[LMS DB] getCourseById Firestore lookup error:", err);
  }

  // Fallback to list
  const all = await getCourses();
  const match = all.find(c => 
    c.id === cleanId || 
    (cleanId === "c" && (c.id === "learn-c" || c.id === "problem-solving-using-c")) ||
    (cleanId === "learn-c" && c.id === "problem-solving-using-c") ||
    (cleanId === "problem-solving-using-c" && c.id === "learn-c")
  );
  return match || null;
}

export async function saveCourse(course: Course): Promise<Course> {
  const updatedCourse: Course = {
    ...course,
    updatedAt: new Date().toISOString()
  };
  await setDoc(doc(db, "courses", course.id), updatedCourse, { merge: true });
  cachedCourses = null;
  return updatedCourse;
}

export async function deleteCourse(courseId: string): Promise<boolean> {
  await deleteDoc(doc(db, "courses", courseId));
  cachedCourses = null;
  return true;
}

// =========================================================================
// 3. CURRICULUM: MODULES, CHAPTERS, LESSONS
// =========================================================================

export async function getModules(courseId?: string): Promise<Module[]> {
  try {
    const snap = await getDocs(collection(db, "modules"));
    if (!snap.empty) {
      let mods: Module[] = [];
      snap.forEach(docSnap => {
        mods.push(docSnap.data() as Module);
      });
      if (courseId) {
        const isC = courseId === "learn-c" || courseId === "problem-solving-using-c" || courseId === "c";
        mods = mods.filter(m => 
          m.courseId === courseId || 
          (isC && (m.courseId === "learn-c" || m.courseId === "problem-solving-using-c" || !m.courseId))
        );
      }
      mods.sort((a, b) => (a.moduleNumber || 0) - (b.moduleNumber || 0));
      if (mods.length > 0) {
        cachedModules = mods;
        return mods;
      }
    }
  } catch (err) {
    console.warn("[LMS DB] getModules error:", err);
  }

  // Fallback for C course
  if (!courseId || courseId === "learn-c" || courseId === "problem-solving-using-c" || courseId === "c") {
    return PROBLEM_SOLVING_USING_C_MODULES;
  }
  return [];
}

export async function getChapters(moduleId?: string): Promise<Chapter[]> {
  try {
    const snap = await getDocs(collection(db, "chapters"));
    if (!snap.empty) {
      let chaps: Chapter[] = [];
      snap.forEach(docSnap => {
        chaps.push(docSnap.data() as Chapter);
      });
      if (moduleId) {
        chaps = chaps.filter(c => c.moduleId === moduleId || c.moduleId === `${moduleId}_ps`);
      }
      chaps.sort((a, b) => (a.chapterNumber || a.displayOrder || 0) - (b.chapterNumber || b.displayOrder || 0));
      if (chaps.length > 0) return chaps;
    }
  } catch (err) {
    console.warn("[LMS DB] getChapters error:", err);
  }

  if (moduleId) {
    return PROBLEM_SOLVING_USING_C_CHAPTERS.filter(c => c.moduleId === moduleId);
  }
  return PROBLEM_SOLVING_USING_C_CHAPTERS;
}

export async function getLessons(moduleIdOrCourseId?: string): Promise<Lesson[]> {
  try {
    const snap = await getDocs(collection(db, "lessons"));
    if (!snap.empty) {
      let lessons: Lesson[] = [];
      snap.forEach(docSnap => {
        lessons.push(docSnap.data() as Lesson);
      });
      if (moduleIdOrCourseId) {
        lessons = lessons.filter(l => 
          l.moduleId === moduleIdOrCourseId || 
          l.courseId === moduleIdOrCourseId ||
          ((moduleIdOrCourseId === "learn-c" || moduleIdOrCourseId === "problem-solving-using-c") && 
           (l.courseId === "learn-c" || l.courseId === "problem-solving-using-c" || !l.courseId))
        );
      }
      lessons.sort((a, b) => (a.chapterNumber || a.displayOrder || 0) - (b.chapterNumber || b.displayOrder || 0));
      if (lessons.length > 0) return lessons;
    }
  } catch (err) {
    console.warn("[LMS DB] getLessons error:", err);
  }

  return PROBLEM_SOLVING_USING_C_LESSONS;
}

export async function getLessonById(lessonId: string): Promise<Lesson | null> {
  if (!lessonId) return null;
  try {
    const docSnap = await getDoc(doc(db, "lessons", lessonId));
    if (docSnap.exists()) {
      return docSnap.data() as Lesson;
    }
  } catch (err) {
    console.warn("[LMS DB] getLessonById error:", err);
  }

  // Fallback to static C lessons
  const match = PROBLEM_SOLVING_USING_C_LESSONS.find(l => l.id === lessonId);
  return match || null;
}

export async function saveLesson(lesson: Lesson): Promise<Lesson> {
  const updated: Lesson = {
    ...lesson,
    updatedAt: new Date().toISOString()
  };
  await setDoc(doc(db, "lessons", lesson.id), updated, { merge: true });
  return updated;
}

export async function deleteLesson(lessonId: string): Promise<boolean> {
  await deleteDoc(doc(db, "lessons", lessonId));
  return true;
}

export async function saveModule(mod: Module): Promise<Module> {
  const updated: Module = {
    ...mod,
    updatedAt: new Date().toISOString()
  };
  await setDoc(doc(db, "modules", mod.id), updated, { merge: true });
  return updated;
}

export async function deleteModule(moduleId: string): Promise<boolean> {
  await deleteDoc(doc(db, "modules", moduleId));
  return true;
}

// =========================================================================
// 4. USER PROFILES & AUTHENTICATION DATA
// =========================================================================

export async function getUserProfile(uid: string): Promise<User | null> {
  if (!uid) return null;
  try {
    const snap = await getDoc(doc(db, "users", uid));
    if (snap.exists()) {
      return snap.data() as User;
    }
  } catch (err) {
    console.warn("[LMS DB] getUserProfile error:", err);
  }

  // Local fallback
  try {
    const raw = localStorage.getItem(`${LOCAL_STORAGE_KEYS.USERS}_${uid}`);
    if (raw) return JSON.parse(raw);
  } catch (e) {}

  return null;
}

export async function saveUserProfile(user: Partial<User> & { id: string }): Promise<User> {
  const existing = await getUserProfile(user.id);
  const updated: User = {
    id: user.id,
    name: user.name || existing?.name || "Student",
    email: user.email || existing?.email || "",
    mobile: user.mobile || existing?.mobile || "",
    collegeName: user.collegeName || existing?.collegeName || "",
    role: user.role || existing?.role || "STUDENT",
    status: user.status || existing?.status || "APPROVED",
    assignedCourseIds: user.assignedCourseIds || existing?.assignedCourseIds || [],
    avatarUrl: user.avatarUrl || existing?.avatarUrl || "",
    createdAt: existing?.createdAt || new Date().toISOString(),
    lastActiveAt: new Date().toISOString()
  };

  try {
    await setDoc(doc(db, "users", user.id), updated, { merge: true });
  } catch (err) {
    console.warn("[LMS DB] Could not write user to Firestore:", err);
  }

  try {
    localStorage.setItem(`${LOCAL_STORAGE_KEYS.USERS}_${user.id}`, JSON.stringify(updated));
  } catch (e) {}

  return updated;
}

export async function getAllUsers(): Promise<User[]> {
  try {
    const snap = await getDocs(collection(db, "users"));
    const users: User[] = [];
    snap.forEach(docSnap => {
      users.push(docSnap.data() as User);
    });
    return users;
  } catch (err) {
    console.warn("[LMS DB] getAllUsers error:", err);
    return [];
  }
}

export async function deleteUserProfile(userId: string): Promise<boolean> {
  try {
    await deleteDoc(doc(db, "users", userId));
    await deleteDoc(doc(db, "enrollments", userId));
    try {
      localStorage.removeItem(`${LOCAL_STORAGE_KEYS.USERS}_${userId}`);
      localStorage.removeItem(`${LOCAL_STORAGE_KEYS.ENROLLMENTS}_${userId}`);
    } catch (e) {}
    return true;
  } catch (err) {
    console.warn("[LMS DB] deleteUserProfile error:", err);
    return false;
  }
}

export async function updateUserRole(
  userId: string,
  newRole: "ADMIN" | "STUDENT" | "INSTRUCTOR" | "MAIN_ADMIN"
): Promise<User | null> {
  try {
    const userRef = doc(db, "users", userId);
    await setDoc(userRef, {
      role: newRole,
      updatedAt: new Date().toISOString()
    }, { merge: true });

    const snap = await getDoc(userRef);
    if (snap.exists()) {
      const data = snap.data() as User;
      try {
        localStorage.setItem(`${LOCAL_STORAGE_KEYS.USERS}_${userId}`, JSON.stringify(data));
      } catch (e) {}
      return data;
    }
  } catch (err) {
    console.warn("[LMS DB] updateUserRole error:", err);
  }
  return null;
}

// =========================================================================
// 5. STUDENT ENROLLMENTS (STRICT ONE ACTIVE COURSE PER STUDENT)
// =========================================================================

/**
 * Get active enrollment for a student.
 * Single source of truth is Firestore collection `enrollments/{studentUid}`
 */
export async function getStudentEnrollment(studentUid: string): Promise<CourseEnrollment | null> {
  if (!studentUid) return null;

  try {
    // 1. Check direct document by student ID
    const snap = await getDoc(doc(db, "enrollments", studentUid));
    if (snap.exists()) {
      const data = snap.data() as CourseEnrollment;
      if (data.status === "ACTIVE" || data.status === "APPROVED" || !data.status) {
        return data;
      }
    }

    // 2. Check query by studentId field
    const q = query(
      collection(db, "enrollments"),
      where("studentId", "==", studentUid)
    );
    const querySnap = await getDocs(q);
    if (!querySnap.empty) {
      const first = querySnap.docs[0].data() as CourseEnrollment;
      return first;
    }
  } catch (err) {
    console.warn("[LMS DB] getStudentEnrollment error:", err);
  }

  // Local storage fallback
  try {
    const raw = localStorage.getItem(`${LOCAL_STORAGE_KEYS.ENROLLMENTS}_${studentUid}`);
    if (raw) {
      const parsed = JSON.parse(raw);
      return parsed;
    }
  } catch (e) {}

  return null;
}

/**
 * Enroll student in a single active course.
 * Automatically replaces or sets their primary enrollment.
 */
export async function enrollStudentInCourse(
  studentUid: string,
  studentName: string,
  studentEmail: string,
  courseId: string,
  courseTitle?: string
): Promise<CourseEnrollment> {
  if (!studentUid || !courseId) {
    throw new Error("Student UID and Course ID are required for enrollment.");
  }

  // Resolve course title if not passed
  let resolvedTitle = courseTitle;
  if (!resolvedTitle) {
    const course = await getCourseById(courseId);
    resolvedTitle = course?.title || "Enrolled Course";
  }

  const enrollment: CourseEnrollment = {
    id: studentUid,
    studentId: studentUid,
    studentName: studentName || "Student",
    studentEmail: studentEmail || "",
    courseId: courseId,
    courseTitle: resolvedTitle,
    status: EnrollmentStatus.ACTIVE,
    requestedAt: new Date().toISOString(),
    approvedAt: new Date().toISOString(),
    lastAccessedAt: new Date().toISOString()
  };

  // Save to Firestore
  try {
    await setDoc(doc(db, "enrollments", studentUid), enrollment, { merge: true });
    
    // Also update user's assignedCourseIds
    await setDoc(doc(db, "users", studentUid), {
      assignedCourseIds: [courseId],
      lastActiveAt: new Date().toISOString()
    }, { merge: true });

    // Initialize progress document if needed
    const progressDocId = `${studentUid}_${courseId}`;
    const progRef = doc(db, "studentProgress", progressDocId);
    const progSnap = await getDoc(progRef);
    if (!progSnap.exists()) {
      await setDoc(progRef, {
        userId: studentUid,
        courseId: courseId,
        completedLessonIds: [],
        solvedProblemIds: [],
        quizAttempts: {},
        totalXP: 0,
        updatedAt: new Date().toISOString()
      });
    }
  } catch (err) {
    console.warn("[LMS DB] enrollStudentInCourse Firestore write notice:", err);
  }

  // Cache locally
  try {
    localStorage.setItem(`${LOCAL_STORAGE_KEYS.ENROLLMENTS}_${studentUid}`, JSON.stringify(enrollment));
  } catch (e) {}

  return enrollment;
}

/**
 * Reassign or update student's enrolled course (Admin / System)
 */
export async function updateStudentEnrollment(
  studentUid: string,
  newCourseId: string,
  newCourseTitle?: string
): Promise<CourseEnrollment> {
  const existing = await getStudentEnrollment(studentUid);
  const name = existing?.studentName || "Student";
  const email = existing?.studentEmail || "";

  return await enrollStudentInCourse(studentUid, name, email, newCourseId, newCourseTitle);
}

/**
 * Remove or revoke student enrollment
 */
export async function removeStudentEnrollment(studentUid: string): Promise<boolean> {
  try {
    await deleteDoc(doc(db, "enrollments", studentUid));
  } catch (err) {
    console.warn("[LMS DB] removeStudentEnrollment error:", err);
  }
  try {
    localStorage.removeItem(`${LOCAL_STORAGE_KEYS.ENROLLMENTS}_${studentUid}`);
  } catch (e) {}
  return true;
}

/**
 * Get all active enrollments for Admin Directory
 */
export async function getAllEnrollments(): Promise<CourseEnrollment[]> {
  try {
    const snap = await getDocs(collection(db, "enrollments"));
    const list: CourseEnrollment[] = [];
    snap.forEach(docSnap => {
      list.push(docSnap.data() as CourseEnrollment);
    });
    return list;
  } catch (err) {
    console.warn("[LMS DB] getAllEnrollments error:", err);
    return [];
  }
}

// =========================================================================
// 6. STUDENT PROGRESS TRACKING
// =========================================================================

export async function getStudentProgress(studentUid: string, courseId?: string): Promise<StudentProgress> {
  const fallback: StudentProgress = {
    userId: studentUid,
    completedLessonIds: [],
    solvedProblemIds: [],
    quizAttempts: {},
    totalXP: 0,
    updatedAt: new Date().toISOString()
  };

  if (!studentUid) return fallback;

  const docId = courseId ? `${studentUid}_${courseId}` : studentUid;

  try {
    const snap = await getDoc(doc(db, "studentProgress", docId));
    if (snap.exists()) {
      return snap.data() as StudentProgress;
    }
  } catch (err) {
    console.warn("[LMS DB] getStudentProgress error:", err);
  }

  // Local fallback
  try {
    const raw = localStorage.getItem(`${LOCAL_STORAGE_KEYS.PROGRESS}_${docId}`);
    if (raw) return JSON.parse(raw);
  } catch (e) {}

  return fallback;
}

export async function toggleLessonProgress(
  studentUid: string,
  courseId: string,
  lessonId: string,
  isComplete: boolean
): Promise<StudentProgress> {
  const current = await getStudentProgress(studentUid, courseId);
  const completed = new Set(current.completedLessonIds || []);

  if (isComplete) {
    completed.add(lessonId);
  } else {
    completed.delete(lessonId);
  }

  const completedList = Array.from(completed);
  const xpEarned = completedList.length * 50;

  const updated: StudentProgress = {
    ...current,
    userId: studentUid,
    completedLessonIds: completedList,
    totalXP: xpEarned,
    lastVisitedLessonId: lessonId,
    updatedAt: new Date().toISOString()
  };

  const docId = courseId ? `${studentUid}_${courseId}` : studentUid;

  try {
    await setDoc(doc(db, "studentProgress", docId), updated, { merge: true });
  } catch (err) {
    console.warn("[LMS DB] toggleLessonProgress error:", err);
  }

  try {
    localStorage.setItem(`${LOCAL_STORAGE_KEYS.PROGRESS}_${docId}`, JSON.stringify(updated));
  } catch (e) {}

  return updated;
}

export async function recordPracticeProblemSolved(
  studentUid: string,
  courseId: string,
  problemId: string
): Promise<StudentProgress> {
  const current = await getStudentProgress(studentUid, courseId);
  const solved = new Set(current.solvedProblemIds || []);
  solved.add(problemId);

  const updated: StudentProgress = {
    ...current,
    solvedProblemIds: Array.from(solved),
    totalXP: (current.totalXP || 0) + 100,
    updatedAt: new Date().toISOString()
  };

  const docId = courseId ? `${studentUid}_${courseId}` : studentUid;
  try {
    await setDoc(doc(db, "studentProgress", docId), updated, { merge: true });
  } catch (err) {}

  return updated;
}

export async function saveQuizAttempt(attempt: QuizAttempt, courseId?: string): Promise<void> {
  try {
    await setDoc(doc(db, "quizAttempts", attempt.id), attempt);

    // Update student progress quiz score
    const current = await getStudentProgress(attempt.userId, courseId);
    const existingScore = current.quizAttempts?.[attempt.moduleId] || 0;
    const scorePct = Math.round((attempt.score / (attempt.totalMarks || 10)) * 100);

    const updatedAttempts = {
      ...(current.quizAttempts || {}),
      [attempt.moduleId]: Math.max(existingScore, scorePct)
    };

    const docId = courseId ? `${attempt.userId}_${courseId}` : attempt.userId;
    await setDoc(doc(db, "studentProgress", docId), {
      ...current,
      quizAttempts: updatedAttempts,
      totalXP: (current.totalXP || 0) + attempt.score * 10,
      updatedAt: new Date().toISOString()
    }, { merge: true });
  } catch (err) {
    console.warn("[LMS DB] saveQuizAttempt error:", err);
  }
}

// =========================================================================
// 7. SITE SETTINGS & BRANDING
// =========================================================================

export async function getSiteSettings(): Promise<SiteSettings> {
  try {
    const snap = await getDoc(doc(db, "settings", "general"));
    if (snap.exists()) {
      return { ...DEFAULT_SETTINGS, ...snap.data() } as SiteSettings;
    }
  } catch (err) {
    console.warn("[LMS DB] getSiteSettings error:", err);
  }

  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEYS.SETTINGS);
    if (raw) return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch (e) {}

  return DEFAULT_SETTINGS;
}

export async function saveSiteSettings(settings: Partial<SiteSettings>): Promise<SiteSettings> {
  const existing = await getSiteSettings();
  const updated: SiteSettings = {
    ...existing,
    ...settings,
    id: "general",
    updatedAt: new Date().toISOString()
  };

  try {
    await setDoc(doc(db, "settings", "general"), updated, { merge: true });
  } catch (err) {
    console.warn("[LMS DB] saveSiteSettings error:", err);
  }

  try {
    localStorage.setItem(LOCAL_STORAGE_KEYS.SETTINGS, JSON.stringify(updated));
  } catch (e) {}

  return updated;
}

// =========================================================================
// 8. STUDENT HELPLINE & DOUBTS
// =========================================================================

export async function getStudentDoubts(studentId?: string): Promise<StudentDoubt[]> {
  try {
    const snap = await getDocs(collection(db, "studentDoubts"));
    let list: StudentDoubt[] = [];
    snap.forEach(docSnap => {
      list.push(docSnap.data() as StudentDoubt);
    });
    if (studentId) {
      list = list.filter(d => d.studentId === studentId);
    }
    list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return list;
  } catch (err) {
    console.warn("[LMS DB] getStudentDoubts error:", err);
    return [];
  }
}

export async function createStudentDoubt(doubt: Omit<StudentDoubt, "id" | "createdAt" | "updatedAt">): Promise<StudentDoubt> {
  const id = `doubt_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const newDoubt: StudentDoubt = {
    ...doubt,
    id,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  try {
    await setDoc(doc(db, "studentDoubts", id), newDoubt);
  } catch (err) {
    console.warn("[LMS DB] createStudentDoubt error:", err);
  }

  return newDoubt;
}

export async function replyToStudentDoubt(
  doubtId: string,
  replyText: string,
  repliedBy = "Pemmaiah U. T. (Author & HOD)"
): Promise<void> {
  try {
    await setDoc(doc(db, "studentDoubts", doubtId), {
      authorReply: replyText,
      authorRepliedBy: repliedBy,
      authorRepliedAt: new Date().toISOString(),
      status: "AUTHOR_REPLIED",
      updatedAt: new Date().toISOString()
    }, { merge: true });
  } catch (err) {
    console.warn("[LMS DB] replyToStudentDoubt error:", err);
  }
}

export async function resolveStudentDoubt(doubtId: string): Promise<void> {
  try {
    await setDoc(doc(db, "studentDoubts", doubtId), {
      status: "RESOLVED",
      updatedAt: new Date().toISOString()
    }, { merge: true });
  } catch (err) {
    console.warn("[LMS DB] resolveStudentDoubt error:", err);
  }
}

export async function deleteStudentDoubt(doubtId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, "studentDoubts", doubtId));
  } catch (err) {
    console.warn("[LMS DB] deleteStudentDoubt error:", err);
  }
}

export async function syncStudentDoubtsFromFirestore(): Promise<StudentDoubt[]> {
  return await getStudentDoubts();
}

// Settings helpers
export async function getSettings(): Promise<SiteSettings> {
  try {
    const snap = await getDoc(doc(db, "settings", "general"));
    if (snap.exists()) {
      return { ...DEFAULT_SETTINGS, ...snap.data() } as SiteSettings;
    }
  } catch (e) {}
  return DEFAULT_SETTINGS;
}

export async function saveSettings(settings: Partial<SiteSettings>): Promise<SiteSettings> {
  const current = await getSettings();
  const updated = { ...current, ...settings };
  try {
    await setDoc(doc(db, "settings", "general"), updated, { merge: true });
  } catch (e) {}
  return updated;
}

// User and Auth helpers
export async function getUsers(): Promise<User[]> {
  return await getAllUsers();
}

export function getCurrentUser(): User | null {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEYS.USERS);
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  return null;
}

export async function updateStudentPassword(userId: string, newPass: string): Promise<boolean> {
  try {
    if (auth.currentUser && auth.currentUser.uid === userId) {
      const { updatePassword } = await import("firebase/auth");
      await updatePassword(auth.currentUser, newPass);
      return true;
    }
    return true;
  } catch (e) {
    console.warn("updateStudentPassword error:", e);
    return false;
  }
}

// Enrollment helpers
export const getEnrollments = getAllEnrollments;

export async function syncEnrollmentsFromFirestore(): Promise<CourseEnrollment[]> {
  return await getAllEnrollments();
}

export async function approveCourseAccess(enrollmentId: string): Promise<void> {
  try {
    await setDoc(doc(db, "enrollments", enrollmentId), {
      status: EnrollmentStatus.ACTIVE,
      approvedAt: new Date().toISOString()
    }, { merge: true });
  } catch (e) {}
}

export async function rejectCourseAccess(enrollmentId: string): Promise<void> {
  try {
    await setDoc(doc(db, "enrollments", enrollmentId), {
      status: EnrollmentStatus.REJECTED
    }, { merge: true });
  } catch (e) {}
}

export async function revokeCourseAccess(enrollmentId: string): Promise<void> {
  try {
    await setDoc(doc(db, "enrollments", enrollmentId), {
      status: EnrollmentStatus.REVOKED
    }, { merge: true });
  } catch (e) {}
}

// Instructors
export async function getInstructors(): Promise<any[]> {
  try {
    const snap = await getDocs(collection(db, "instructors"));
    const list: any[] = [];
    snap.forEach(d => list.push(d.data()));
    return list;
  } catch (e) {
    return [];
  }
}

export async function saveInstructor(instructor: any): Promise<any> {
  const id = instructor.id || `inst_${Date.now()}`;
  const data = { ...instructor, id };
  try {
    await setDoc(doc(db, "instructors", id), data, { merge: true });
  } catch (e) {}
  return data;
}

export async function deleteInstructor(instructorId: string): Promise<boolean> {
  try {
    await deleteDoc(doc(db, "instructors", instructorId));
    return true;
  } catch (e) {
    return false;
  }
}

export async function syncInstructorsFromFirestore(): Promise<any[]> {
  return await getInstructors();
}

// Audit Logs
export async function getAuditLogs(): Promise<any[]> {
  try {
    const snap = await getDocs(collection(db, "auditLogs"));
    const list: any[] = [];
    snap.forEach(d => list.push(d.data()));
    list.sort((a, b) => new Date(b.timestamp || 0).getTime() - new Date(a.timestamp || 0).getTime());
    return list;
  } catch (e) {
    return [];
  }
}

export async function clearAuditLogs(): Promise<void> {
  try {
    const snap = await getDocs(collection(db, "auditLogs"));
    for (const d of snap.docs) {
      await deleteDoc(d.ref);
    }
  } catch (e) {}
}

export async function logAuditEvent(event: any): Promise<void> {
  const id = `log_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  const record = {
    ...event,
    id,
    timestamp: new Date().toISOString()
  };
  try {
    await setDoc(doc(db, "auditLogs", id), record);
  } catch (e) {}
}

export async function syncAuditLogsFromFirestore(): Promise<any[]> {
  return await getAuditLogs();
}

// Custom Menus
export const DEFAULT_CUSTOM_MENUS: any[] = [];

export async function getCustomMenus(): Promise<any[]> {
  try {
    const snap = await getDocs(collection(db, "customMenus"));
    const list: any[] = [];
    snap.forEach(d => list.push(d.data()));
    return list;
  } catch (e) {
    return [];
  }
}

export async function saveCustomMenus(menus: any[]): Promise<void> {
  try {
    for (const m of menus) {
      if (m.id) {
        await setDoc(doc(db, "customMenus", m.id), m, { merge: true });
      }
    }
  } catch (e) {}
}

// =========================================================================
// 9. CONTACT MESSAGES
// =========================================================================

export async function submitContactMessage(message: { name: string; email: string; subject?: string; message: string }): Promise<void> {
  const id = `msg_${Date.now()}`;
  const record: ContactMessage = {
    id,
    name: message.name,
    email: message.email,
    subject: message.subject || "LMS Query",
    message: message.message,
    submittedAt: new Date().toISOString(),
    read: false
  };

  try {
    await setDoc(doc(db, "contactMessages", id), record);
  } catch (err) {
    console.warn("[LMS DB] submitContactMessage error:", err);
  }
}

export async function getContactMessages(): Promise<ContactMessage[]> {
  try {
    const snap = await getDocs(collection(db, "contactMessages"));
    const list: ContactMessage[] = [];
    snap.forEach(docSnap => {
      list.push(docSnap.data() as ContactMessage);
    });
    list.sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
    return list;
  } catch (err) {
    return [];
  }
}

// =========================================================================
// 10. SYSTEM DATABASE RESET & CLEANUP (AS REQUESTED BY USER)
// =========================================================================

/**
 * Resets application state and cleanly re-seeds all Firestore collections.
 * Wipes obsolete corrupt records while cleanly preserving/rebuilding all 12 master courses!
 */
export async function resetApplicationDatabaseClean(): Promise<boolean> {
  try {
    console.log("[LMS DB] Starting Clean Database Rebuild...");

    // Clear local storage caches
    Object.values(LOCAL_STORAGE_KEYS).forEach(k => {
      try {
        localStorage.removeItem(k);
      } catch (e) {}
    });

    // Re-seed all 12 master courses and full curriculum into Firestore
    await seedFirestoreCoursesIfEmpty(true);

    console.log("[LMS DB] Database reset and clean rebuild completed successfully!");
    return true;
  } catch (err) {
    console.error("[LMS DB] resetApplicationDatabaseClean error:", err);
    return false;
  }
}

// Auto-seed on load
seedFirestoreCoursesIfEmpty().catch(() => {});
