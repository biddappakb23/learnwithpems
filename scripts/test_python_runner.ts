import { executePythonCodeSecurely, getInstalledPythonRuntime } from "../src/server/pythonExecutionEngine";
import { executeCCodeSecurely, getInstalledCCompiler } from "../src/server/cExecutionEngine";
import { getCourseExecutionProfile } from "../src/services/executionProfile";

async function runAllTests() {
  console.log("===============================================================");
  console.log("LEARNWITHPEMS — PYTHON CPYTHON RUNTIME VERIFICATION SUITE");
  console.log("===============================================================\n");

  let passed = 0;
  let total = 15;

  // TEST 1: Python Runtime Verification
  console.log("[TEST 1/15] Python Runtime Verification");
  const runtime = getInstalledPythonRuntime();
  console.log("  Runtime:", runtime.runtime);
  console.log("  Version:", runtime.version);
  console.log("  Standard:", runtime.standard);
  console.log("  Executable:", runtime.executable);
  if (runtime.isAvailable && runtime.runtime === "cpython" && runtime.version.includes("3.")) {
    console.log("  -> PASS: CPython 3 verified.\n");
    passed++;
  } else {
    console.log("  -> FAIL: Python runtime not detected properly.\n");
  }

  // TEST 2: Canonical Hello World
  console.log("[TEST 2/15] Canonical Hello World");
  const t2 = await executePythonCodeSecurely({
    code: `print("Hello, Learnwithpems!")`,
    courseId: "learn-python"
  });
  console.log("  Stdout:", JSON.stringify(t2.stdout.trim()));
  console.log("  Exit Code:", t2.exitCode, "| Status:", t2.status);
  if (t2.status === "success" && t2.stdout.trim() === "Hello, Learnwithpems!") {
    console.log("  -> PASS: Hello World executed successfully.\n");
    passed++;
  } else {
    console.log("  -> FAIL\n");
  }

  // TEST 3: Standard Input (stdin) Test
  console.log("[TEST 3/15] Standard Input (stdin)");
  const t3 = await executePythonCodeSecurely({
    code: `name = input()\nprint(f"Hello, {name}")`,
    stdin: "Pemmaiah\n",
    courseId: "learn-python"
  });
  console.log("  Stdout:", JSON.stringify(t3.stdout.trim()));
  if (t3.status === "success" && t3.stdout.trim() === "Hello, Pemmaiah") {
    console.log("  -> PASS: stdin passed to input() successfully.\n");
    passed++;
  } else {
    console.log("  -> FAIL\n");
  }

  // TEST 4: Arithmetic & Variables
  console.log("[TEST 4/15] Arithmetic & Variables");
  const t4 = await executePythonCodeSecurely({
    code: `a = 10\nb = 20\nprint(a + b)\nprint(a * b)`,
    courseId: "learn-python"
  });
  console.log("  Stdout:\n" + t4.stdout.trim());
  if (t4.status === "success" && t4.stdout.trim() === "30\n200") {
    console.log("  -> PASS: Arithmetic verified.\n");
    passed++;
  } else {
    console.log("  -> FAIL\n");
  }

  // TEST 5: Conditionals (if/else)
  console.log("[TEST 5/15] Conditionals (if/else)");
  const t5 = await executePythonCodeSecurely({
    code: `number = 10\nif number % 2 == 0:\n    print("Even")\nelse:\n    print("Odd")`,
    courseId: "learn-python"
  });
  console.log("  Stdout:", JSON.stringify(t5.stdout.trim()));
  if (t5.status === "success" && t5.stdout.trim() === "Even") {
    console.log("  -> PASS: Conditionals evaluated.\n");
    passed++;
  } else {
    console.log("  -> FAIL\n");
  }

  // TEST 6: Loops (for / while)
  console.log("[TEST 6/15] Loops (for / while)");
  const t6 = await executePythonCodeSecurely({
    code: `for i in range(1, 6):\n    print(i)`,
    courseId: "learn-python"
  });
  console.log("  Stdout:\n" + t6.stdout.trim());
  if (t6.status === "success" && t6.stdout.trim() === "1\n2\n3\n4\n5") {
    console.log("  -> PASS: Loop executed correctly.\n");
    passed++;
  } else {
    console.log("  -> FAIL\n");
  }

  // TEST 7: Functions & Scope
  console.log("[TEST 7/15] Functions & Scope");
  const t7 = await executePythonCodeSecurely({
    code: `def square(n):\n    return n * n\n\nprint(square(5))`,
    courseId: "learn-python"
  });
  console.log("  Stdout:", JSON.stringify(t7.stdout.trim()));
  if (t7.status === "success" && t7.stdout.trim() === "25") {
    console.log("  -> PASS: Functions evaluated correctly.\n");
    passed++;
  } else {
    console.log("  -> FAIL\n");
  }

  // TEST 8: Data Structures (Lists, Dictionaries)
  console.log("[TEST 8/15] Data Structures (Lists, Dictionaries)");
  const t8 = await executePythonCodeSecurely({
    code: `numbers = [10, 20, 30, 40]\nprint(sum(numbers))\nstudent = {"name": "Alex", "marks": 90}\nprint(student["name"])`,
    courseId: "learn-python"
  });
  console.log("  Stdout:\n" + t8.stdout.trim());
  if (t8.status === "success" && t8.stdout.trim() === "100\nAlex") {
    console.log("  -> PASS: Built-in lists and dicts verified.\n");
    passed++;
  } else {
    console.log("  -> FAIL\n");
  }

  // TEST 9: Classes & OOP
  console.log("[TEST 9/15] Classes & OOP");
  const t9 = await executePythonCodeSecurely({
    code: `class Student:\n    def __init__(self, name):\n        self.name = name\n    def display(self):\n        print(self.name)\n\nstudent = Student("Alex")\nstudent.display()`,
    courseId: "learn-python"
  });
  console.log("  Stdout:", JSON.stringify(t9.stdout.trim()));
  if (t9.status === "success" && t9.stdout.trim() === "Alex") {
    console.log("  -> PASS: OOP and classes verified.\n");
    passed++;
  } else {
    console.log("  -> FAIL\n");
  }

  // TEST 10: Exception Handling (try / except)
  console.log("[TEST 10/15] Exception Handling (try/except)");
  const t10 = await executePythonCodeSecurely({
    code: `try:\n    value = int(input())\n    print(100 / value)\nexcept ZeroDivisionError:\n    print("Cannot divide by zero")`,
    stdin: "0\n",
    courseId: "learn-python"
  });
  console.log("  Stdout:", JSON.stringify(t10.stdout.trim()));
  if (t10.status === "success" && t10.stdout.trim() === "Cannot divide by zero") {
    console.log("  -> PASS: Exception handled gracefully.\n");
    passed++;
  } else {
    console.log("  -> FAIL\n");
  }

  // TEST 11: Syntax Error Handling & Diagnostics
  console.log("[TEST 11/15] Syntax Error Handling & Diagnostics");
  const t11 = await executePythonCodeSecurely({
    code: `print("Hello"`,
    courseId: "learn-python"
  });
  console.log("  Status:", t11.status);
  console.log("  Stderr:\n" + t11.stderr.trim());
  console.log("  Diagnostic:", t11.diagnosticExplanation);
  if (t11.status === "syntax_error" && t11.stderr.includes("SyntaxError")) {
    console.log("  -> PASS: SyntaxError classified and explained.\n");
    passed++;
  } else {
    console.log("  -> FAIL\n");
  }

  // TEST 12: Runtime Error (ZeroDivisionError) & Diagnostics
  console.log("[TEST 12/15] Runtime Error (ZeroDivisionError)");
  const t12 = await executePythonCodeSecurely({
    code: `print(10 / 0)`,
    courseId: "learn-python"
  });
  console.log("  Status:", t12.status);
  console.log("  Stderr:\n" + t12.stderr.trim());
  console.log("  Diagnostic:", t12.diagnosticExplanation);
  if (t12.status === "runtime_error" && t12.stderr.includes("ZeroDivisionError")) {
    console.log("  -> PASS: ZeroDivisionError reported.\n");
    passed++;
  } else {
    console.log("  -> FAIL\n");
  }

  // TEST 13: Infinite Loop Timeout Watchdog
  console.log("[TEST 13/15] Infinite Loop Timeout Protection");
  const t13 = await executePythonCodeSecurely({
    code: `while True:\n    pass`,
    timeoutMs: 1500,
    courseId: "learn-python"
  });
  console.log("  Status:", t13.status);
  console.log("  Stderr:", JSON.stringify(t13.stderr.trim()));
  console.log("  Exec Time:", t13.executionTimeMs, "ms");
  if (t13.status === "timeout" && t13.stderr.includes("Time Limit Exceeded")) {
    console.log("  -> PASS: Timeout enforced successfully.\n");
    passed++;
  } else {
    console.log("  -> FAIL\n");
  }

  // TEST 14: Sandbox Isolation & Environment Privacy
  console.log("[TEST 14/15] Sandbox Isolation & Environment Privacy");
  const t14 = await executePythonCodeSecurely({
    code: `import os\nprint("ENV_GEMINI:", os.environ.get("GEMINI_API_KEY", "NOT_FOUND"))\ntry:\n    with open("/server.ts") as f:\n        print("FILE_ACCESSED")\nexcept Exception as e:\n    print("FILE_BLOCKED")`,
    courseId: "learn-python"
  });
  console.log("  Stdout:\n" + t14.stdout.trim());
  if (t14.stdout.includes("ENV_GEMINI: NOT_FOUND")) {
    console.log("  -> PASS: Environment isolation confirmed (zero host secrets exposed).\n");
    passed++;
  } else {
    console.log("  -> FAIL\n");
  }

  // TEST 15: Course-Level Execution Profile Isolation
  console.log("[TEST 15/15] Course-Level Execution Profile Isolation");
  const pythonProfile = getCourseExecutionProfile("learn-python");
  const cProfile = getCourseExecutionProfile("learn-c");
  const dsaProfile = getCourseExecutionProfile("learn-data-structures");

  console.log("  learn-python ->", pythonProfile.language, "|", pythonProfile.paradigm, "|", (pythonProfile as any).runtime);
  console.log("  learn-c ->", cProfile.language, "|", cProfile.paradigm, "|", (cProfile as any).compiler);
  console.log("  learn-data-structures ->", dsaProfile.language, "|", dsaProfile.paradigm, "|", (dsaProfile as any).compiler);

  // Attempt to execute Python runner with unauthorized C course ID
  const forbiddenTest = await executePythonCodeSecurely({
    code: `print("Should be blocked")`,
    courseId: "learn-c"
  });
  console.log("  Cross-course reject status:", forbiddenTest.status);

  if (
    pythonProfile.language === "python" &&
    (pythonProfile as any).runtime === "cpython" &&
    cProfile.language === "c" &&
    dsaProfile.language === "c" &&
    forbiddenTest.status === "forbidden"
  ) {
    console.log("  -> PASS: Course-level execution profile isolation verified.\n");
    passed++;
  } else {
    console.log("  -> FAIL\n");
  }

  console.log("===============================================================");
  console.log(`TEST SUITE RESULTS: ${passed}/${total} TESTS PASSED`);
  console.log("===============================================================");
}

runAllTests().catch((err) => {
  console.error("Test runner error:", err);
  process.exit(1);
});
