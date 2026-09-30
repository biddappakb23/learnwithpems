import { Course, Module, Chapter, Lesson } from "../types";

export const PROBLEM_SOLVING_USING_C_COURSE: Course = {
  id: "problem-solving-using-c",
  courseCode: "CS-101",
  title: "Problem Solving Using C",
  shortDesc: "Complete foundation course in C programming based on lecture notes by Pemmaiah.U.T, HOD, Dept. of BCA, Cauvery College, Gonikoppal. Covers C history, tokens, variables, data types, type conversion, operators, I/O, control statements, loops, and jump statements.",
  detailedDesc: "Problem Solving Using C provides an exhaustive, curriculum-aligned exploration of structured C programming. Directly transcribed from the academic notes by Pemmaiah.U.T (HOD, Department of BCA, Cauvery College, Gonikoppal), this course covers everything from low-level vs. high-level language concepts, 32 reserved keywords, data type memory sizes, format specifiers, escape sequences, arithmetic, bitwise and logical operators, to decision-making statements and looping constructs with exact worked examples, tables, and architectural flow diagrams.",
  category: "Programming Fundamentals",
  difficulty: "Beginner",
  estimatedDurationHours: 40,
  totalLessons: 12,
  totalModules: 6,
  instructorId: "inst-1",
  instructorName: "Pemmaiah.U.T",
  instructorTitle: "HOD, Dept. of BCA, Cauvery College, Gonikoppal",
  instructorPhotoUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80",
  thumbnailUrl: "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?auto=format&fit=crop&w=800&q=80",
  badge: "Core Curriculum",
  rating: 4.9,
  enrolledCount: 142,
  tags: ["C", "Problem Solving", "Programming Fundamentals", "BCA", "Control Flow", "Loops", "Operators", "Data Types"],
  techIcon: "c-lang",
  accentColor: "blue",
  isInteractiveLive: true,
  learningOutcomes: [
    "Understand the evolution of C from ALGOL, BCPL, and B developed by Dennis Ritchie at Bell Laboratories.",
    "Master C basic program structure, compiler mechanics, and steps to write, compile, and execute C programs.",
    "Identify and apply C tokens: 32 keywords, identifiers, constants, strings, special symbols, and operators.",
    "Utilize primary data types (int, float, double, char, void), format specifiers, and escape sequences accurately.",
    "Implement implicit and explicit type conversions (type casting) in expressions.",
    "Handle standard input/output using scanf() and printf() with variable address pointers.",
    "Evaluate arithmetic, relational, assignment, increment/decrement, logical, bitwise, conditional, and special operators.",
    "Construct decision-making logic using simple if, if-else, nested if-else, else-if ladder, switch, and goto statements.",
    "Build iterative algorithms using entry-controlled while and for loops, exit-controlled do-while loops, and nested loops.",
    "Control program flow dynamically using break and continue jump statements."
  ],
  syllabusOverview: [
    {
      unit: "Unit 1",
      title: "Introduction to Programming & History of C",
      topics: ["Computer Programs & Languages", "Compiler Mechanics", "History & Dennis Ritchie", "Features of C", "Structure of C Program", "Execution Steps & Tips"]
    },
    {
      unit: "Unit 2",
      title: "C Tokens, Variables & Data Types",
      topics: ["6 Types of C Tokens", "Identifiers & Rules", "32 Reserved Keywords", "Constants Categories", "Primary Data Types", "Variables Declaration", "Format Specifiers"]
    },
    {
      unit: "Unit 3",
      title: "Escape Sequences, Type Conversion & I/O Operations",
      topics: ["Escape Sequence Characters", "Backspace Behavior", "Implicit Type Conversion", "Explicit Type Casting", "printf() Output Statement", "scanf() Input Statement"]
    },
    {
      unit: "Unit 4",
      title: "Operators, Expressions & Error Types",
      topics: ["Arithmetic Operators", "Relational Operators", "Assignment Operators", "Increment & Decrement", "Logical & Bitwise Operators", "Conditional & Special Operators", "clrscr() & getch()", "Compile-Time vs Run-Time Errors"]
    },
    {
      unit: "Unit 5",
      title: "Control Statements & Decision Making",
      topics: ["Simple if Statement", "if...else Statement", "Nested if...else", "else-if Ladder", "Switch Case Rules & Example", "Goto Statement (Forward & Backward)"]
    },
    {
      unit: "Unit 6",
      title: "Looping Statements, Nested Loops & Jump Statements",
      topics: ["Looping Concept & Flowchart", "while Loop", "do..while Loop", "for Loop (5 Execution Steps)", "Nested for Loop & Number Pyramid", "break Statement", "continue Statement"]
    }
  ],
  status: "Published",
  displayOrder: 1,
  editorEnabled: true,
  editorLanguage: "C",
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: new Date().toISOString(),
  publishedAt: new Date().toISOString()
};

export const PROBLEM_SOLVING_USING_C_MODULES: Module[] = [
  {
    id: "mod-c-1",
    courseId: "problem-solving-using-c",
    moduleNumber: 1,
    title: "Introduction to Programming & History of C",
    shortDesc: "Foundational concepts of computer programs, language hierarchy, compiler role, C history from ALGOL/BCPL/B to Dennis Ritchie, features of C, and basic program structure.",
    detailedDesc: "Covers the fundamental definitions of computer programs, low level vs. high level languages, compilers, the chronological history of C programming, Dennis Ritchie's contribution, key features of C, the 6-section structure of a C program, steps to write/compile/run programs, and practical tips.",
    learningObjectives: [
      "Define computer programs and distinguish between low-level and high-level languages.",
      "Understand the purpose and function of a compiler.",
      "Trace the history of C from ALGOL (1960), BCPL (1967), and B (1970) to C (1972) by Dennis Ritchie at Bell Laboratories.",
      "Identify the 8 key features that make C portable, structured, fast, and powerful.",
      "Outline the 6 standard sections of a C program: Documentation, Link, Definition, Global Declaration, main(), and Subprogram.",
      "Follow the 4 essential steps to create, compile, run, and get output from C programs."
    ],
    thumbnailUrl: "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?auto=format&fit=crop&w=600&q=80",
    difficulty: "Beginner",
    estimatedDurationHours: 5,
    status: "Published",
    displayOrder: 1,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: new Date().toISOString()
  },
  {
    id: "mod-c-2",
    courseId: "problem-solving-using-c",
    moduleNumber: 2,
    title: "C Tokens, Variables & Data Types",
    shortDesc: "Comprehensive study of C tokens (keywords, identifiers, constants, strings, symbols, operators), 32 reserved keywords, constant categories, primary data types, and format specifiers.",
    detailedDesc: "Detailed breakdown of the 6 fundamental types of C tokens, rules for creating valid identifiers, the complete list of 32 C keywords, primary numeric and character constants, fundamental data types (int, float, double, char, void) with memory sizes, variable declarations, and format specifiers.",
    learningObjectives: [
      "Categorize C source code elements into the 6 fundamental C tokens.",
      "Construct valid identifier names adhering to naming rules and case sensitivity.",
      "Memorize and correctly use the 32 reserved keywords in C.",
      "Classify constants into numeric (integer, real) and character (single character, string) constants.",
      "Select appropriate primary data types based on range and memory footprint.",
      "Declare variables and map them to their corresponding format specifiers in C."
    ],
    thumbnailUrl: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=600&q=80",
    difficulty: "Beginner",
    estimatedDurationHours: 7,
    status: "Published",
    displayOrder: 2,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: new Date().toISOString()
  },
  {
    id: "mod-c-3",
    courseId: "problem-solving-using-c",
    moduleNumber: 3,
    title: "Escape Sequences, Type Conversion & I/O Operations",
    shortDesc: "Formatting output using escape sequences, understanding backspace effects, implicit and explicit type conversions (type casting), and interactive I/O with printf() and scanf().",
    detailedDesc: "Covers backslash escape characters in C, program examples demonstrating \\n and \\b backspace behavior, automatic implicit type promotion, explicit type casting with syntax and examples, and formatted input/output using printf() and scanf() with memory address operators.",
    learningObjectives: [
      "Format console output using C escape sequences (\\n, \\t, \\v, \\b, \\a, \\r, \\f, \\0, \\\").",
      "Explain the exact behavior of backspace escape character \\b in console output.",
      "Differentiate between implicit type conversion (type promotion) and explicit type casting.",
      "Apply explicit type casting syntax: (data_type)expression.",
      "Execute interactive I/O operations using printf() and scanf() with format specifiers and variable addresses."
    ],
    thumbnailUrl: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=600&q=80",
    difficulty: "Beginner",
    estimatedDurationHours: 6,
    status: "Published",
    displayOrder: 3,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: new Date().toISOString()
  },
  {
    id: "mod-c-4",
    courseId: "problem-solving-using-c",
    moduleNumber: 4,
    title: "Operators, Expressions & Error Types",
    shortDesc: "In-depth analysis of 8 types of C operators, bitwise binary math, increment/decrement semantics, ternary operator, sizeof operator, conio.h utilities, and error classifications.",
    detailedDesc: "Covers arithmetic, relational, assignment, increment/decrement (pre vs post), logical, bitwise (&, |, ^, ~, <<, >>), conditional (ternary), and special operators (comma, sizeof). Includes conio.h functions (clrscr, getch) with IDE placement guidelines and compile-time vs. run-time error distinctions.",
    learningObjectives: [
      "Perform mathematical calculations and compound assignments using C operators.",
      "Evaluate relational and logical expressions returning boolean 0 (false) or 1 (true).",
      "Distinguish pre-increment/decrement (++i, --i) from post-increment/decrement (i++, i--).",
      "Execute bit-level operations (AND, OR, XOR) with binary bitwise mathematics.",
      "Use the ternary conditional operator (? :) as shorthand for decision statements.",
      "Measure data type and variable memory sizes using sizeof().",
      "Position clrscr() and getch() accurately in C source programs.",
      "Distinguish syntax compile-time errors from logical run-time errors."
    ],
    thumbnailUrl: "https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&w=600&q=80",
    difficulty: "Beginner",
    estimatedDurationHours: 8,
    status: "Published",
    displayOrder: 4,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: new Date().toISOString()
  },
  {
    id: "mod-c-5",
    courseId: "problem-solving-using-c",
    moduleNumber: 5,
    title: "Control Statements & Decision Making",
    shortDesc: "Mastering conditional branching in C: simple if, if-else, nested if-else, else-if ladder, multi-way switch case statements with rules, and unconditional goto jumps.",
    detailedDesc: "Covers all four variations of if statements with complete syntax, flow logic, and worked examples (including finding the greatest of three numbers), switch-case statements with 5 operational rules and weekday matching example, and unconditional goto forward and backward branching.",
    learningObjectives: [
      "Construct single-branch decision structures using simple if statements.",
      "Implement dual-branch alternatives using if...else statements.",
      "Nest multiple conditional checks using nested if...else logic.",
      "Build multi-condition decision ladders using the else-if ladder construct.",
      "Implement multi-way selection using switch statements adhering to the 5 switch rules.",
      "Understand forward and backward unconditional branching using goto labels."
    ],
    thumbnailUrl: "https://images.unsplash.com/photo-1516116211227-bbc1b452834b?auto=format&fit=crop&w=600&q=80",
    difficulty: "Intermediate",
    estimatedDurationHours: 7,
    status: "Published",
    displayOrder: 5,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: new Date().toISOString()
  },
  {
    id: "mod-c-6",
    courseId: "problem-solving-using-c",
    moduleNumber: 6,
    title: "Looping Statements, Nested Loops & Jump Statements",
    shortDesc: "Repetitive execution constructs: while loop, do-while loop, for loop (5 execution stages), nested loops with number pyramid generation, and loop control via break and continue.",
    detailedDesc: "Covers the mechanics of iteration with flowcharts, entry-controlled while loops, exit-controlled do-while loops, open-ended for loops with the 5 execution steps, nested loops producing half pyramid number patterns, and jump statements (break vs continue) with flow diagrams.",
    learningObjectives: [
      "Understand loop mechanics, loop entry, condition testing, and termination.",
      "Implement entry-controlled iteration using the while loop.",
      "Implement exit-controlled iteration guaranteed to execute at least once using do..while.",
      "Master the for loop syntax, 2-semicolon rule, and the 5 sequential execution steps.",
      "Construct nested loops to generate two-dimensional number patterns like half pyramids.",
      "Alter loop execution dynamically using break (exit loop) and continue (skip to next cycle) jump statements."
    ],
    thumbnailUrl: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=600&q=80",
    difficulty: "Intermediate",
    estimatedDurationHours: 7,
    status: "Published",
    displayOrder: 6,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: new Date().toISOString()
  }
];
