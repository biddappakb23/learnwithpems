export type UserRole = "MAIN_ADMIN" | "ADMIN" | "INSTRUCTOR" | "STUDENT";
export type AccountStatus = "PENDING" | "APPROVED" | "REJECTED" | "ACTIVE" | "INACTIVE";

export interface UserAccount {
  id: string;
  name: string;
  email: string;
  mobile?: string;
  collegeName?: string;
  passwordHash: string;
  role: UserRole;
  status: AccountStatus;
  assignedCourseIds?: string[];
  registeredAt: string;
  approvedAt?: string;
  rejectedReason?: string;
  lastActiveAt?: string;
  updatedAt?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  mobile?: string;
  collegeName?: string;
  role: UserRole;
  status?: AccountStatus;
  assignedCourseIds?: string[];
  avatarUrl?: string;
  createdAt: string;
  lastActiveAt?: string;
}

export enum EnrollmentStatus {
  PENDING = "PENDING",
  ACTIVE = "ACTIVE",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
  REVOKED = "REVOKED"
}

export interface CourseEnrollment {
  id: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  courseId: string;
  courseTitle: string;
  status: EnrollmentStatus | "PENDING" | "ACTIVE" | "APPROVED" | "REJECTED" | "REVOKED" | "Pending" | "Approved" | "Rejected" | "Revoked";
  requestedAt: string;
  approvedAt?: string;
  approvedBy?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  rejectedReason?: string;
  lastAccessedAt?: string;
}

export interface InstructorProfile {
  id: string;
  name: string;
  email: string;
  title?: string;
  designation: string;
  bio: string;
  photoUrl?: string;
  avatarUrl?: string;
  phone?: string;
  officeLocation?: string;
  qualification?: string;
  officeHours?: string;
  isLead?: boolean;
  socialLinks?: {
    github?: string;
    linkedin?: string;
    website?: string;
  };
  assignedCourseIds: string[];
  expertise: string[];
  status: "ACTIVE" | "INACTIVE";
  createdAt: string;
  updatedAt: string;
}

export interface AuditLog {
  id: string;
  actorId?: string;
  actorName?: string;
  actorRole?: UserRole;
  adminId?: string;
  adminName?: string;
  performedByName?: string;
  performedByEmail?: string;
  performedByRole?: string;
  action: string;
  targetType?: "COURSE" | "STUDENT" | "INSTRUCTOR" | "CONTENT" | "SETTINGS" | "ENROLLMENT" | string;
  targetId?: string;
  targetTitle?: string;
  details?: string;
  metadata?: Record<string, any>;
  timestamp: string;
}

export interface StudentDashboardMetrics {
  topicsCovered: number;
  totalTopics: number;
  topicsCoveredPercent: number;
  overallQuizRate: number;
  practiceExercisesCovered: number;
  totalPracticeExercises: number;
  practiceExercisesPercent: number;
  pendingQuizzesToAttend: number;
  totalQuizzes: number;
  practicalExercisesCompleted: number;
}

export type CourseStatus = "DRAFT" | "UNDER_REVIEW" | "PUBLISHED" | "UNPUBLISHED" | "ARCHIVED" | "Draft" | "Published" | "Archived";
export type ContentStatus = "Draft" | "Published" | "Archived" | "DRAFT" | "PUBLISHED" | "ARCHIVED";
export type DifficultyLevel = "Beginner" | "Intermediate" | "Advanced";
export type QuizDifficulty = "Easy" | "Medium" | "Hard";
export type QuizQuestionType = "mcq" | "true_false" | "fill_blank" | "code_output";

export interface SyllabusUnit {
  unit: string;
  title: string;
  topics: string[];
}

// ==========================================
// COURSE PROGRAMMING EXECUTION PROFILES
// ==========================================

export type SupportedProgrammingLanguage =
  | "c"
  | "python"
  | "java"
  | "cpp"
  | "javascript"
  | "sql"
  | "go"
  | "rust";

export type ExecutionParadigm = "COMPILED" | "INTERPRETED";
export type ExecutionType = "COMPILE_AND_RUN" | "RUN";

export type CCompilerFamily = "gcc" | "clang";
export type PythonRuntimeFamily = "cpython";

export interface BaseExecutionProfile {
  id: string;
  courseId: string;
  language: SupportedProgrammingLanguage;
  languageDisplayName: string;
  paradigm: ExecutionParadigm;
  executionType: ExecutionType;
  version: string;
  standard?: string;
  sourceFileName: string;
  entryPoint?: string;
  timeoutMs: number;
  memoryLimitMb: number;
  displayBadge: string;
  description: string;
}

export interface CompiledCourseExecutionProfile extends BaseExecutionProfile {
  paradigm: "COMPILED";
  executionType: "COMPILE_AND_RUN";
  compiler: CCompilerFamily | string;
  compilerDisplayName: string;
  compileCommandTemplate: string;
  runCommandTemplate: string;
  compilerFlags: string[];
  runtime?: null;
}

export interface InterpretedCourseExecutionProfile extends BaseExecutionProfile {
  paradigm: "INTERPRETED";
  executionType: "RUN";
  runtime: PythonRuntimeFamily | string;
  runtimeDisplayName: string;
  runCommandTemplate: string;
  runtimeFlags: string[];
  compiler?: null;
}

export type CourseExecutionProfile =
  | CompiledCourseExecutionProfile
  | InterpretedCourseExecutionProfile;

export type CourseEditorLanguage =
  | "C"
  | "C++"
  | "Java"
  | "Python"
  | "JavaScript"
  | "SQL"
  | "HTML/CSS";

export interface Course {
  id: string;
  courseCode: string;
  title: string;
  shortDesc: string;
  detailedDesc: string;
  category: string;
  difficulty: DifficultyLevel | string;
  estimatedDurationHours: number;
  totalLessons?: number;
  totalModules?: number;
  instructorId?: string;
  instructorName: string;
  instructorTitle?: string;
  instructorPhotoUrl?: string;
  thumbnailUrl?: string;
  badge?: string;
  rating?: number;
  enrolledCount?: number;
  tags: string[];
  techIcon?: string;
  accentColor?: string;
  isInteractiveLive?: boolean;
  learningOutcomes: string[];
  syllabusOverview?: SyllabusUnit[];
  status: CourseStatus;
  displayOrder: number;
  editorEnabled?: boolean;
  editorLanguage?: CourseEditorLanguage;
  executionProfile?: CourseExecutionProfile;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
}

export type CatalogCourse = Course;

export interface Module {
  id: string;
  courseId?: string;
  moduleNumber: number;
  title: string;
  shortDesc: string;
  detailedDesc: string;
  learningObjectives: string[];
  thumbnailUrl?: string;
  difficulty: DifficultyLevel;
  estimatedDurationHours: number;
  status: ContentStatus;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface ChapterVersion {
  versionId: string;
  versionNumber: number;
  timestamp: string;
  savedBy?: string;
  title: string;
  description: string;
  content: string;
  status: ContentStatus;
}

export type ChapterEditorType = "none" | "c" | "python" | "java" | "cpp" | "javascript" | "html" | "sql";

export interface Chapter {
  id: string;
  moduleId: string;
  courseId?: string;
  chapterNumber?: number;
  order?: number;
  title: string;
  description?: string;
  shortDesc?: string;
  content?: string;
  theoryContent?: string;
  learningObjectives?: string[];
  importantPoints?: string[];
  syntax?: string;
  codeExamples?: CodeExample[];
  commonMistakes?: string[];
  tips?: string[];
  practiceQuestions?: string[];
  references?: string[];
  estimatedMinutes?: number;
  difficulty?: DifficultyLevel;
  displayOrder?: number;
  status: ContentStatus;
  
  // Online Editor Configuration (No Editor vs C / Python / Java / etc.)
  editorRequired?: boolean;
  editorType?: ChapterEditorType;
  starterCode?: string;

  createdAt?: string;
  updatedAt?: string;
  lastSavedAt?: string;
  publishedAt?: string;
  versionHistory?: ChapterVersion[];
  versions?: ChapterVersion[];
}

export interface CodeExample {
  id: string;
  title: string;
  code: string;
  expectedOutput: string;
  explanation: string;
}

// Backward compatibility alias for Lesson
export interface Lesson extends Chapter {
  chapterId?: string;
}

export interface QuizQuestion {
  id: string;
  moduleId: string;
  lessonId?: string;
  type: QuizQuestionType;
  question: string;
  codeSnippet?: string;
  options: string[];
  correctAnswer: number | string; // Index for MCQ/True-False or String for fill-blank
  explanation: string;
  marks: number;
  difficulty: QuizDifficulty;
  createdAt: string;
}

export interface PracticeProblem {
  id: string;
  courseId?: string;
  title: string;
  category: string;
  difficulty: DifficultyLevel;
  description: string;
  inputFormat: string;
  outputFormat: string;
  exampleInput: string;
  exampleOutput: string;
  starterCode: string;
  solutionCode: string;
  hint: string;
  relatedConcept: string;
  displayOrder: number;
  status: ContentStatus;
  createdAt: string;
}

export interface QuizAttemptAnswer {
  questionId: string;
  selectedAnswer: number | string;
  isCorrect: boolean;
  marksObtained: number;
}

export interface QuizAttempt {
  id: string;
  userId: string;
  moduleId: string;
  score: number;
  totalMarks: number;
  totalQuestions: number;
  answers: QuizAttemptAnswer[];
  attemptedAt: string;
}

export interface StudentProgress {
  userId: string;
  completedLessonIds: string[];
  solvedProblemIds: string[];
  quizAttempts: Record<string, number>; // moduleId -> highest score %
  lastVisitedLessonId?: string;
  totalXP: number;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
}

export interface AnnouncementPopupConfig {
  id?: string;
  enabled: boolean;
  title: string;
  message: string;
  badgeText?: string;
  linkText?: string;
  linkUrl?: string;
  type?: "info" | "success" | "warning" | "achievement";
  startDate?: string;
  endDate?: string;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject?: string;
  message: string;
  submittedAt: string;
  read?: boolean;
}

export interface CustomSubmenuItem {
  id: string;
  label: string;
  path: string;
  type?: "course" | "route" | "custom_page" | "external";
  targetCourseId?: string;
  slug?: string;
  badge?: string;
  isExternal?: boolean;
  content?: string;
  order: number;
  isActive?: boolean;
}

export interface CustomMenuItem {
  id: string;
  label: string;
  path?: string;
  type?: "dropdown" | "course" | "route" | "custom_page" | "external";
  targetCourseId?: string;
  slug?: string;
  badge?: string;
  submenus: CustomSubmenuItem[];
  order: number;
  isActive: boolean;
  isExternal?: boolean;
  content?: string;
  icon?: string;
}

export interface SiteSettings {
  id: string;
  siteLogo?: string;
  siteName?: string;
  siteTagline?: string;
  contactEmail: string;
  contactPhone?: string;
  academicDepartment?: string;
  // Author Profile Picture & Bio Settings
  authorName?: string;
  authorTitle?: string;
  authorPhotoUrl?: string;
  authorAvatarUrl?: string;
  authorBio?: string;
  authorQualification?: string;
  authorCollege?: string;
  authorOfficeHours?: string;
  // Logo & Highlights
  showLogoHighlightHome?: boolean;
  showLogoHighlightDashboard?: boolean;
  logoBadgeText?: string;
  announcementPopup?: AnnouncementPopupConfig;
  customMenus?: CustomMenuItem[];
  preventContentCopy?: boolean;
  updatedAt?: string;
}

export type DoubtCategory = "CONCEPT_CLARIFICATION" | "CODE_DEBUG" | "PRACTICE_DOUBT" | "EXAM_PREP" | "GENERAL";
export type DoubtStatus = "PENDING_AUTHOR_REPLY" | "AUTHOR_REPLIED" | "RESOLVED";

export interface HelplineChatMessage {
  id: string;
  sender: "student" | "ai" | "author";
  senderName: string;
  senderRole?: "STUDENT" | "AI_TUTOR" | "AUTHOR" | "INSTRUCTOR";
  text: string;
  codeSnippet?: string;
  timestamp: string;
}

export interface StudentDoubt {
  id: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  studentCollege?: string;
  subjectId: string;
  subjectTitle: string;
  topic?: string;
  question: string;
  codeSnippet?: string;
  programmingLanguage?: string;
  category: DoubtCategory;
  status: DoubtStatus;
  aiResponse?: string;
  aiRespondedAt?: string;
  authorReply?: string;
  authorRepliedBy?: string;
  authorRepliedAt?: string;
  chatHistory?: HelplineChatMessage[];
  createdAt: string;
  updatedAt: string;
}

export interface AnalyticsSummary {
  totalCourses?: number;
  totalModules: number;
  totalChapters: number;
  totalLessons: number;
  totalPracticeProblems: number;
  totalQuizQuestions: number;
  totalStudents: number;
  pendingStudentsCount: number;
  approvedStudentsCount: number;
  publishedCount: number;
  draftCount: number;
  avgQuizScore: number;
  completionRate: number;
}
