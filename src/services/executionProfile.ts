import {
  Course,
  CourseExecutionProfile,
  CompiledCourseExecutionProfile,
  InterpretedCourseExecutionProfile,
  SupportedProgrammingLanguage
} from "../types";

/**
 * Canonical Default Course Execution Profiles
 *
 * Each programming course explicitly defines its runtime paradigm,
 * language, compiler/runtime, standard, commands, and sandboxing limits.
 */
export const DEFAULT_EXECUTION_PROFILES: Record<string, CourseExecutionProfile> = {
  // 1. C Programming Execution Profile
  "learn-c": {
    id: "exec-prof-c-gcc",
    courseId: "learn-c",
    language: "c",
    languageDisplayName: "C (C99 / C11)",
    paradigm: "COMPILED",
    executionType: "COMPILE_AND_RUN",
    compiler: "gcc",
    compilerDisplayName: "GCC / Clang C Compiler",
    version: "GCC 13.2 / Clang 17",
    standard: "c99",
    sourceFileName: "main.c",
    compileCommandTemplate: "gcc -std=c99 -O2 -Wall main.c -o main -lm",
    runCommandTemplate: "./main",
    compilerFlags: ["-std=c99", "-O2", "-Wall", "-lm"],
    timeoutMs: 5000,
    memoryLimitMb: 128,
    displayBadge: "GCC (C99)",
    description: "Standard ANSI/ISO C99 compilation environment with standard math and utility libraries."
  },

  // 2. Data Structures in C Execution Profile
  "learn-data-structures": {
    id: "exec-prof-dsa-c-gcc",
    courseId: "learn-data-structures",
    language: "c",
    languageDisplayName: "C for Data Structures & Algorithms",
    paradigm: "COMPILED",
    executionType: "COMPILE_AND_RUN",
    compiler: "gcc",
    compilerDisplayName: "GCC / Clang C Compiler",
    version: "GCC 13.2 / Clang 17",
    standard: "c99",
    sourceFileName: "solution.c",
    compileCommandTemplate: "gcc -std=c99 -O2 -Wall solution.c -o solution -lm",
    runCommandTemplate: "./solution",
    compilerFlags: ["-std=c99", "-O2", "-Wall", "-lm"],
    timeoutMs: 5000,
    memoryLimitMb: 128,
    displayBadge: "GCC (C99)",
    description: "Strict C compilation environment tailored for data structures, pointers, structs, and dynamic memory allocation (malloc/free)."
  },

  // 3. Python 3 Execution Profile
  "learn-python": {
    id: "exec-prof-python-cpython",
    courseId: "learn-python",
    language: "python",
    languageDisplayName: "Python 3",
    paradigm: "INTERPRETED",
    executionType: "RUN",
    runtime: "cpython",
    runtimeDisplayName: "CPython 3",
    version: "3.11+",
    standard: "Python 3.11",
    sourceFileName: "main.py",
    runCommandTemplate: "python3 main.py",
    runtimeFlags: ["-u"],
    timeoutMs: 5000,
    memoryLimitMb: 128,
    displayBadge: "CPython 3.11",
    description: "Standard CPython 3 runtime environment with full standard library support."
  }
};

/**
 * Course ID alias mapping to ensure backwards compatibility across legacy and canonical identifiers.
 */
const COURSE_ID_ALIASES: Record<string, string> = {
  "c": "learn-c",
  "c-programming": "learn-c",
  "c-mastery": "learn-c",
  "course-c-mastery": "learn-c",
  "embedded-c": "learn-c",
  "data-structures": "learn-data-structures",
  "ds": "learn-data-structures",
  "learn-dsa": "learn-data-structures",
  "c-ds-algo": "learn-data-structures",
  "python": "learn-python",
  "py": "learn-python",
  "python-programming": "learn-python",
  "cpp": "learn-cpp",
  "java": "learn-java",
  "dbms": "learn-dbms",
  "cyber-security": "learn-cyber-security"
};

/**
 * Normalizes course ID to the canonical primary course identifier.
 */
export function normalizeCanonicalCourseId(courseId?: string): string {
  if (!courseId) return "learn-c";
  const lower = courseId.trim().toLowerCase();
  return COURSE_ID_ALIASES[lower] || (lower.startsWith("learn-") ? lower : `learn-${lower}`);
}

/**
 * Resolves the authoritative Execution Profile for a given Course.
 * Guaranteed to return a valid profile even if course or ID is missing.
 *
 * Precedence:
 * 1. Explicit course.executionProfile defined on the Course document (if present and valid)
 * 2. Canonical Profile mapped by normalized courseId
 * 3. Default fallback to C Execution Profile
 */
export function getCourseExecutionProfile(
  courseId?: string,
  course?: Course | null
): CourseExecutionProfile {
  // 1. If the passed course object already has a defined execution profile, use it
  if (course?.executionProfile && course.executionProfile.language) {
    return course.executionProfile;
  }

  // 2. Resolve via canonical ID lookup
  const rawId = courseId || course?.id;
  if (rawId) {
    const canonicalId = normalizeCanonicalCourseId(rawId);
    if (DEFAULT_EXECUTION_PROFILES[canonicalId]) {
      return DEFAULT_EXECUTION_PROFILES[canonicalId];
    }
    const directLower = rawId.trim().toLowerCase();
    if (DEFAULT_EXECUTION_PROFILES[directLower]) {
      return DEFAULT_EXECUTION_PROFILES[directLower];
    }
  }

  // Fallback: Default to standard C profile
  return DEFAULT_EXECUTION_PROFILES["learn-c"];
}

/**
 * Resolves the inherited Execution Profile for any coding activity inside a lesson.
 * Coding activities inherit the course's execution profile by default.
 */
export function resolveExecutionProfileForLesson(
  courseId: string,
  _lessonId?: string
): CourseExecutionProfile {
  return getCourseExecutionProfile(courseId);
}

/**
 * Type guard for Compiled execution profiles (e.g. C, C++)
 */
export function isCompiledProfile(
  profile?: CourseExecutionProfile | null
): profile is CompiledCourseExecutionProfile {
  return !!profile && profile.paradigm === "COMPILED" && profile.executionType === "COMPILE_AND_RUN";
}

/**
 * Type guard for Interpreted execution profiles (e.g. Python, JS)
 */
export function isInterpretedProfile(
  profile?: CourseExecutionProfile | null
): profile is InterpretedCourseExecutionProfile {
  return !!profile && profile.paradigm === "INTERPRETED" && profile.executionType === "RUN";
}

/**
 * Validates an execution profile to prevent invalid or conflicting language/compiler/runtime combinations.
 */
export function validateExecutionProfile(profile?: CourseExecutionProfile | null): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!profile) {
    return { isValid: false, errors: ["Execution profile is missing."] };
  }

  if (!profile.id || profile.id.trim() === "") {
    errors.push("Execution profile ID is required.");
  }
  if (!profile.courseId || profile.courseId.trim() === "") {
    errors.push("Target courseId is required.");
  }

  // Language & Paradigm Validation
  if (profile.language === "c" || profile.language === "cpp") {
    if (profile.paradigm !== "COMPILED") {
      errors.push(`Language "${profile.language}" must use COMPILED paradigm.`);
    }
    if (profile.executionType !== "COMPILE_AND_RUN") {
      errors.push(`Language "${profile.language}" must use COMPILED_AND_RUN execution type.`);
    }
    const compiled = profile as CompiledCourseExecutionProfile;
    if (!compiled.compiler || (compiled.compiler !== "gcc" && compiled.compiler !== "clang")) {
      errors.push(`C/C++ courses require a valid compiler (e.g. "gcc" or "clang").`);
    }
    if (!compiled.compileCommandTemplate || compiled.compileCommandTemplate.trim() === "") {
      errors.push("A compile command template is required for compiled languages.");
    }
  } else if (profile.language === "python") {
    if (profile.paradigm !== "INTERPRETED") {
      errors.push(`Language "${profile.language}" must use INTERPRETED paradigm.`);
    }
    if (profile.executionType !== "RUN") {
      errors.push(`Language "${profile.language}" must use RUN execution type.`);
    }
    const interpreted = profile as InterpretedCourseExecutionProfile;
    if (!interpreted.runtime || interpreted.runtime !== "cpython") {
      errors.push(`Python courses require a valid runtime (e.g. "cpython").`);
    }
    if (!interpreted.runCommandTemplate || interpreted.runCommandTemplate.trim() === "") {
      errors.push("A run command template is required for interpreted languages.");
    }
  }

  // Safety limits validation
  if (profile.timeoutMs < 500 || profile.timeoutMs > 30000) {
    errors.push("Timeout must be between 500ms and 30,000ms.");
  }
  if (profile.memoryLimitMb < 16 || profile.memoryLimitMb > 512) {
    errors.push("Memory limit must be between 16MB and 512MB.");
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Returns summary metadata for UI display in Course Dashboards or Admin Panels.
 * Never throws, safely handles missing or partial profile definitions.
 */
export function getExecutionProfileSummary(profile?: CourseExecutionProfile | null): {
  badge: string;
  language: SupportedProgrammingLanguage;
  displayName: string;
  toolchain: string;
  standard: string;
  timeout: string;
  memory: string;
} {
  if (!profile) {
    return {
      badge: "Standard",
      language: "c",
      displayName: "Standard C Environment",
      toolchain: "GCC (C99)",
      standard: "c99",
      timeout: "5.0s",
      memory: "128 MB"
    };
  }

  return {
    badge: profile.displayBadge || "Standard",
    language: profile.language || "c",
    displayName: profile.languageDisplayName || "Standard",
    toolchain: isCompiledProfile(profile)
      ? `${profile.compilerDisplayName || "Compiler"} (${profile.version || "latest"})`
      : `${profile.runtimeDisplayName || "Runtime"} (${profile.version || "latest"})`,
    standard: profile.standard || "Default Standard",
    timeout: `${((profile.timeoutMs || 5000) / 1000).toFixed(1)}s`,
    memory: `${profile.memoryLimitMb || 128} MB`
  };
}
