import React, { createContext, useContext, useEffect, useState } from "react";
import {
  User as FirebaseUser,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
  updateProfile
} from "firebase/auth";
import { auth } from "../services/firebase";
import {
  getUserProfile,
  saveUserProfile,
  getStudentEnrollment,
  enrollStudentInCourse,
  getCourseById,
  getCourses
} from "../services/db";
import { User, CourseEnrollment, Course, UserRole } from "../types";

interface AuthContextType {
  firebaseUser: FirebaseUser | null;
  userProfile: User | null;
  enrollment: CourseEnrollment | null;
  enrolledCourse: Course | null;
  isAdmin: boolean;
  isStudent: boolean;
  isLoading: boolean;
  signIn: (email: string, pass: string) => Promise<{ user: FirebaseUser; profile: User | null; enrollment: CourseEnrollment | null }>;
  signUp: (email: string, pass: string, name: string, courseId: string) => Promise<{ user: FirebaseUser; profile: User; enrollment: CourseEnrollment }>;
  signInWithGoogle: (targetCourseId?: string) => Promise<{ user: FirebaseUser; profile: User | null; enrollment: CourseEnrollment | null }>;
  signOut: () => Promise<void>;
  refreshEnrollment: () => Promise<CourseEnrollment | null>;
  enrollInCourse: (courseId: string) => Promise<CourseEnrollment>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Admin email and username identifiers
export const ADMIN_EMAILS = [
  "admin@learnwithpems.in",
  "pemmaiahoj@gmail.com",
  "admin@cauverycollege.edu.in",
  "learnadmin@learnwithpems.in",
  "learnadmin@cauverycollege.edu.in",
  "learnadmin@admin.com",
  "learnadmin"
];

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<User | null>(null);
  const [enrollment, setEnrollment] = useState<CourseEnrollment | null>(null);
  const [enrolledCourse, setEnrolledCourse] = useState<Course | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Sync user profile and enrollment when Firebase Auth state changes
  const refreshUserData = async (fUser: FirebaseUser | null) => {
    if (!fUser) {
      setUserProfile(null);
      setEnrollment(null);
      setEnrolledCourse(null);
      setIsLoading(false);
      return;
    }

    try {
      const email = fUser.email?.toLowerCase() || "";
      const isAdminEmail = ADMIN_EMAILS.some(e => e.toLowerCase() === email || email.startsWith("learnadmin"));

      // 1. Fetch or create Firestore user profile
      let profile = await getUserProfile(fUser.uid);
      if (!profile) {
        profile = await saveUserProfile({
          id: fUser.uid,
          name: fUser.displayName || (isAdminEmail ? "Administrator" : (email.split("@")[0] || "Student")),
          email: fUser.email || "",
          role: isAdminEmail ? (email === "pemmaiahoj@gmail.com" ? "MAIN_ADMIN" : "ADMIN") : "STUDENT",
          status: "APPROVED"
        });
      } else if (isAdminEmail && profile.role !== "ADMIN" && profile.role !== "MAIN_ADMIN") {
        profile = await saveUserProfile({
          id: fUser.uid,
          role: email === "pemmaiahoj@gmail.com" ? "MAIN_ADMIN" : "ADMIN"
        });
      }
      setUserProfile(profile);

      // 2. Fetch student enrollment from Firestore
      let activeEnrollment = await getStudentEnrollment(fUser.uid);
      
      // Auto-assign default course if user has no enrollment yet
      if (!activeEnrollment && !isAdminEmail) {
        const defaultCourseId = "problem-solving-using-c";
        const course = await getCourseById(defaultCourseId);
        activeEnrollment = await enrollStudentInCourse(
          fUser.uid,
          profile.name || fUser.displayName || "Student",
          fUser.email || "",
          defaultCourseId,
          course?.title || "Problem Solving Using C"
        );
      }

      setEnrollment(activeEnrollment);

      // 3. Fetch enrolled course object if enrolled
      if (activeEnrollment && activeEnrollment.courseId) {
        const course = await getCourseById(activeEnrollment.courseId);
        setEnrolledCourse(course);
      } else {
        setEnrolledCourse(null);
      }
    } catch (err) {
      console.warn("[AuthContext] Error loading user data:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Seed default admin in Firestore if not already present
    saveUserProfile({
      id: "admin-learnadmin-default",
      name: "Administrator (learnadmin)",
      email: "learnadmin@learnwithpems.in",
      role: "ADMIN",
      status: "APPROVED"
    }).catch(() => {});

    const unsubscribe = onAuthStateChanged(auth, (fUser) => {
      setFirebaseUser(fUser);
      refreshUserData(fUser);
    });

    return () => unsubscribe();
  }, []);

  const refreshEnrollment = async (): Promise<CourseEnrollment | null> => {
    if (!firebaseUser) return null;
    const active = await getStudentEnrollment(firebaseUser.uid);
    setEnrollment(active);
    if (active && active.courseId) {
      const course = await getCourseById(active.courseId);
      setEnrolledCourse(course);
    }
    return active;
  };

  // Sign in handler supporting email, username (e.g., learnadmin), and admin credentials
  const signIn = async (emailOrUsername: string, pass: string) => {
    setIsLoading(true);
    try {
      const inputTrimmed = emailOrUsername.trim();
      const isLearnAdmin = inputTrimmed.toLowerCase() === "learnadmin" || 
                           inputTrimmed.toLowerCase() === "learnadmin@learnwithpems.in" ||
                           inputTrimmed.toLowerCase() === "learnadmin@admin.com";
      
      // Resolve normalized email
      let normalizedEmail = inputTrimmed;
      if (isLearnAdmin) {
        normalizedEmail = "learnadmin@learnwithpems.in";
      } else if (!normalizedEmail.includes("@")) {
        normalizedEmail = `${normalizedEmail.toLowerCase()}@learnwithpems.in`;
      }

      let user: FirebaseUser | null = null;

      // Handle learnadmin + onish123 credentials
      if (isLearnAdmin && pass === "onish123") {
        try {
          const cred = await signInWithEmailAndPassword(auth, normalizedEmail, pass);
          user = cred.user;
        } catch (authErr: any) {
          // If account doesn't exist in Firebase Auth yet, automatically create it
          try {
            const newCred = await createUserWithEmailAndPassword(auth, normalizedEmail, pass);
            user = newCred.user;
            if (user) {
              await updateProfile(user, { displayName: "Administrator (learnadmin)" });
            }
          } catch (createErr: any) {
            console.warn("[AuthContext] Firebase Auth fallback for learnadmin:", createErr);
            try {
              const retryCred = await signInWithEmailAndPassword(auth, normalizedEmail, pass);
              user = retryCred.user;
            } catch (retryErr) {
              console.warn("[AuthContext] Proceeding with Firestore profile authentication:", retryErr);
            }
          }
        }
      } else {
        // Standard authentication
        const cred = await signInWithEmailAndPassword(auth, normalizedEmail, pass);
        user = cred.user;
      }

      if (user) {
        setFirebaseUser(user);
      }
      
      const emailLower = (user?.email || normalizedEmail).toLowerCase();
      const isAdminEmail = isLearnAdmin || ADMIN_EMAILS.some(e => e.toLowerCase() === emailLower);
      const uid = user ? user.uid : "admin-learnadmin-default";

      let profile = await getUserProfile(uid);
      if (!profile) {
        profile = await saveUserProfile({
          id: uid,
          name: isLearnAdmin ? "Administrator (learnadmin)" : (user?.displayName || emailLower.split("@")[0] || "User"),
          email: user?.email || normalizedEmail,
          role: isAdminEmail ? (emailLower === "pemmaiahoj@gmail.com" ? "MAIN_ADMIN" : "ADMIN") : "STUDENT",
          status: "APPROVED"
        });
      } else if (isAdminEmail && profile.role !== "ADMIN" && profile.role !== "MAIN_ADMIN") {
        profile = await saveUserProfile({
          id: uid,
          role: emailLower === "pemmaiahoj@gmail.com" ? "MAIN_ADMIN" : "ADMIN"
        });
      }
      setUserProfile(profile);

      let activeEnrollment: CourseEnrollment | null = null;
      if (!isAdminEmail && uid) {
        activeEnrollment = await getStudentEnrollment(uid);
        if (!activeEnrollment) {
          const defaultCourseId = "problem-solving-using-c";
          const course = await getCourseById(defaultCourseId);
          activeEnrollment = await enrollStudentInCourse(
            uid,
            profile.name || "Student",
            user?.email || normalizedEmail,
            defaultCourseId,
            course?.title || "Problem Solving Using C"
          );
        }
        setEnrollment(activeEnrollment);

        if (activeEnrollment?.courseId) {
          const course = await getCourseById(activeEnrollment.courseId);
          setEnrolledCourse(course);
        }
      }

      return { user: user || ({} as FirebaseUser), profile, enrollment: activeEnrollment };
    } finally {
      setIsLoading(false);
    }
  };

  // Sign up handler with mandatory single-course selection
  const signUp = async (email: string, pass: string, name: string, courseId: string) => {
    setIsLoading(true);
    try {
      const targetCourseId = courseId || "problem-solving-using-c";

      // 1. Create Firebase Auth account
      const cred = await createUserWithEmailAndPassword(auth, email.trim(), pass);
      const user = cred.user;
      setFirebaseUser(user);

      // Update display name
      if (name.trim()) {
        try {
          await updateProfile(user, { displayName: name.trim() });
        } catch (e) {}
      }

      const emailLower = user.email?.toLowerCase() || "";
      const isAdminEmail = ADMIN_EMAILS.includes(emailLower);

      // 2. Save User Profile in Firestore
      const profile = await saveUserProfile({
        id: user.uid,
        name: name.trim() || "Student",
        email: user.email || "",
        role: isAdminEmail ? "ADMIN" : "STUDENT",
        status: "APPROVED",
        assignedCourseIds: [targetCourseId]
      });
      setUserProfile(profile);

      // 3. Create active Enrollment in Firestore
      const course = await getCourseById(targetCourseId);
      const newEnrollment = await enrollStudentInCourse(
        user.uid,
        name.trim() || "Student",
        user.email || "",
        targetCourseId,
        course?.title || "Selected Course"
      );

      setEnrollment(newEnrollment);
      setEnrolledCourse(course);

      return { user, profile, enrollment: newEnrollment };
    } finally {
      setIsLoading(false);
    }
  };

  // Sign In or Register with Google
  const signInWithGoogle = async (targetCourseId?: string) => {
    setIsLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: "select_account" });
      const cred = await signInWithPopup(auth, provider);
      const user = cred.user;
      setFirebaseUser(user);

      const emailLower = user.email?.toLowerCase() || "";
      const isAdminEmail = ADMIN_EMAILS.some(e => e.toLowerCase() === emailLower || emailLower.startsWith("learnadmin"));

      let profile = await getUserProfile(user.uid);
      if (!profile) {
        profile = await saveUserProfile({
          id: user.uid,
          name: user.displayName || emailLower.split("@")[0] || (isAdminEmail ? "Administrator" : "Student"),
          email: user.email || "",
          role: isAdminEmail ? (emailLower === "pemmaiahoj@gmail.com" ? "MAIN_ADMIN" : "ADMIN") : "STUDENT",
          status: "APPROVED",
          assignedCourseIds: targetCourseId ? [targetCourseId] : ["problem-solving-using-c"]
        });
      } else if (isAdminEmail && profile.role !== "ADMIN" && profile.role !== "MAIN_ADMIN") {
        profile = await saveUserProfile({
          id: user.uid,
          role: emailLower === "pemmaiahoj@gmail.com" ? "MAIN_ADMIN" : "ADMIN"
        });
      }
      setUserProfile(profile);

      let activeEnrollment = await getStudentEnrollment(user.uid);
      if (!activeEnrollment && !isAdminEmail) {
        const chosenCourseId = targetCourseId || "problem-solving-using-c";
        const course = await getCourseById(chosenCourseId);
        activeEnrollment = await enrollStudentInCourse(
          user.uid,
          profile.name || user.displayName || "Student",
          user.email || "",
          chosenCourseId,
          course?.title || "Enrolled Course"
        );
      }
      setEnrollment(activeEnrollment);

      if (activeEnrollment?.courseId) {
        const course = await getCourseById(activeEnrollment.courseId);
        setEnrolledCourse(course);
      }

      return { user, profile, enrollment: activeEnrollment };
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    await firebaseSignOut(auth);
    setFirebaseUser(null);
    setUserProfile(null);
    setEnrollment(null);
    setEnrolledCourse(null);
  };

  const enrollInCourse = async (courseId: string): Promise<CourseEnrollment> => {
    if (!firebaseUser) {
      throw new Error("You must be logged in to enroll in a course.");
    }
    const course = await getCourseById(courseId);
    const newEnrollment = await enrollStudentInCourse(
      firebaseUser.uid,
      userProfile?.name || firebaseUser.displayName || "Student",
      firebaseUser.email || "",
      courseId,
      course?.title || "Selected Course"
    );
    setEnrollment(newEnrollment);
    setEnrolledCourse(course);
    return newEnrollment;
  };

  const isAdmin = Boolean(
    userProfile?.role === "ADMIN" ||
    userProfile?.role === "MAIN_ADMIN" ||
    (firebaseUser?.email && ADMIN_EMAILS.includes(firebaseUser.email.toLowerCase()))
  );

  const isStudent = !isAdmin;

  return (
    <AuthContext.Provider
      value={{
        firebaseUser,
        userProfile,
        enrollment,
        enrolledCourse,
        isAdmin,
        isStudent,
        isLoading,
        signIn,
        signUp,
        signInWithGoogle,
        signOut,
        refreshEnrollment,
        enrollInCourse
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
