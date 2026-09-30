import { Module, Chapter, Lesson, QuizQuestion, PracticeProblem, Course } from "../types";

export function generateCurriculumForCourse(_course: Course): {
  modules: Module[];
  chapters: Chapter[];
  lessons: Lesson[];
  quizzes: QuizQuestion[];
  practiceProblems: PracticeProblem[];
} {
  // Demo materials auto-generation is disabled. All course contents are authored from scratch by the instructor.
  return {
    modules: [],
    chapters: [],
    lessons: [],
    quizzes: [],
    practiceProblems: []
  };
}

