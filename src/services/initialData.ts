import { Course, Module, Chapter, Lesson, PracticeProblem, QuizQuestion, Category } from "../types";
import { PROBLEM_SOLVING_USING_C_COURSE, PROBLEM_SOLVING_USING_C_MODULES } from "../data/cProblemSolvingCourseData";
import { PROBLEM_SOLVING_USING_C_CHAPTERS, PROBLEM_SOLVING_USING_C_LESSONS } from "../data/cProblemSolvingChapters";

export const INITIAL_COURSES: Course[] = [PROBLEM_SOLVING_USING_C_COURSE];

export const INITIAL_CATEGORIES: Category[] = [
  { id: "cat-1", name: "Basics & Fundamentals", slug: "basics", description: "Syntax, variables, input/output, operators" },
  { id: "cat-2", name: "Control Flow", slug: "control-flow", description: "Conditionals, loops, decision making" },
  { id: "cat-3", name: "Data Structures & Pointers", slug: "structures", description: "Arrays, strings, pointers, structures, memory" },
];

export const INITIAL_MODULES: Module[] = PROBLEM_SOLVING_USING_C_MODULES;
export const INITIAL_CHAPTERS: Chapter[] = PROBLEM_SOLVING_USING_C_CHAPTERS;
export const INITIAL_LESSONS: Lesson[] = PROBLEM_SOLVING_USING_C_LESSONS;
export const INITIAL_PRACTICE_PROBLEMS: PracticeProblem[] = [];
export const INITIAL_QUIZ_QUESTIONS: QuizQuestion[] = [];
