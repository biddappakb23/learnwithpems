import React, { useState, useEffect, useRef } from "react";
import {
  Play,
  RotateCcw,
  Trash2,
  Copy,
  Check,
  Terminal,
  Code2,
  FileCode2,
  Cpu,
  AlertTriangle,
  Clock,
  Sparkles,
  Layers,
  Wand2,
  Keyboard,
  Eye,
  Info
} from "lucide-react";
import { CourseExecutionProfile } from "../types";
import { getCourseExecutionProfile, getExecutionProfileSummary } from "../services/executionProfile";
import { executeCCode } from "../services/cInterpreter";

interface CPlaygroundProps {
  initialCode?: string;
  title?: string;
  onCodeChange?: (code: string) => void;
  showTemplates?: boolean;
  courseId?: string;
  executionProfile?: CourseExecutionProfile;
}

interface ServerCompilerInfo {
  defaultCompiler: "gcc" | "clang" | "none";
  activeCompiler: "gcc" | "clang" | "none";
  version: string;
  standard: string;
  isAvailable: boolean;
  availableCompilers: ("gcc" | "clang")[];
  compilers?: {
    gcc?: { compiler: string; version: string; isAvailable: boolean };
    clang?: { compiler: string; version: string; isAvailable: boolean };
  };
}

const TEMPLATES: Record<string, { name: string; category: string; desc: string; stdin?: string; code: string }> = {
  swap: {
    name: "Variable Value Swap",
    category: "Basics",
    desc: "Swap values between two variables",
    code: `#include <stdio.h>

int main(void) {
    int a = 10, b = 20, temp;

    printf("--- Before Swap ---\\n");
    printf("a = %d, b = %d\\n", a, b);

    // Swap using temporary variable
    temp = a;
    a = b;
    b = temp;

    printf("\\n--- After Swap ---\\n");
    printf("a = %d, b = %d\\n", a, b);

    return 0;
}`
  },
  hello: {
    name: "Hello World",
    category: "Basics",
    desc: "Standard C output stream greeting",
    code: `#include <stdio.h>

int main(void) {
    printf("Hello, World! Welcome to C Programming.\\n");
    printf("Learn C with clean syntax, pointers, and memory control.\\n");
    return 0;
}`
  },
  sum_scanf: {
    name: "User Input & Addition (scanf)",
    category: "I/O",
    desc: "Read input numbers via scanf and calculate sum",
    stdin: "25 17",
    code: `#include <stdio.h>

int main(void) {
    int num1, num2, sum;

    printf("Enter two integers: ");
    scanf("%d %d", &num1, &num2);

    sum = num1 + num2;
    printf("\\nFirst Number: %d\\n", num1);
    printf("Second Number: %d\\n", num2);
    printf("Calculated Sum = %d\\n", sum);

    return 0;
}`
  },
  pointer_swap: {
    name: "Pointer Swap Function",
    category: "Pointers",
    desc: "Pass-by-reference with pointer dereferencing",
    code: `#include <stdio.h>

// Function to swap two numbers using pointers
void swap(int *x, int *y) {
    int temp = *x;
    *x = *y;
    *y = temp;
}

int main(void) {
    int num1 = 50, num2 = 100;

    printf("Before swap: num1 = %d, num2 = %d\\n", num1, num2);
    printf("Address of num1: %p\\n", (void*)&num1);
    printf("Address of num2: %p\\n", (void*)&num2);

    swap(&num1, &num2);

    printf("\\nAfter swap: num1 = %d, num2 = %d\\n", num1, num2);
    return 0;
}`
  },
  array_sort: {
    name: "Array Traversal & Sum",
    category: "Arrays",
    desc: "Iterate through 1D array and compute average",
    code: `#include <stdio.h>

int main(void) {
    int numbers[5] = {12, 45, 78, 23, 56};
    int sum = 0;
    int size = 5;

    printf("Array elements: ");
    for(int i = 0; i < size; i++) {
        printf("%d ", numbers[i]);
        sum += numbers[i];
    }

    float avg = (float)sum / size;
    printf("\\n\\nTotal Sum: %d\\n", sum);
    printf("Calculated Average: %.2f\\n", avg);

    return 0;
}`
  },
  strings: {
    name: "String Operations (string.h)",
    category: "Strings",
    desc: "String concatenation, copying, and length",
    code: `#include <stdio.h>
#include <string.h>

int main(void) {
    char first[30] = "Learn";
    char second[] = " C Programming";

    printf("Initial first: %s (length: %d)\\n", first, (int)strlen(first));
    printf("Second string: %s (length: %d)\\n", second, (int)strlen(second));

    strcat(first, second);

    printf("\\nAfter strcat: %s\\n", first);
    printf("Combined length: %d\\n", (int)strlen(first));

    return 0;
}`
  },
  structures: {
    name: "Structures & Records",
    category: "Structures",
    desc: "Custom data record struct definitions",
    code: `#include <stdio.h>

struct Student {
    int rollNumber;
    int marks;
};

int main(void) {
    struct Student s1;
    s1.rollNumber = 101;
    s1.marks = 95;

    printf("=== Student Record ===\\n");
    printf("Roll Number: %d\\n", s1.rollNumber);
    printf("Total Marks: %d / 100\\n", s1.marks);

    if (s1.marks >= 90) {
        printf("Grade: Distinction (A+)\\n");
    } else {
        printf("Grade: Passed\\n");
    }

    return 0;
}`
  },
  factorial: {
    name: "Recursive Factorial",
    category: "Recursion",
    desc: "Mathematical factorial calculation using recursion",
    code: `#include <stdio.h>

int factorial(int n) {
    if (n <= 1) return 1;
    return n * factorial(n - 1);
}

int main(void) {
    int n = 6;
    printf("Calculating factorial of %d...\\n", n);
    printf("Factorial of %d = %d\\n", n, factorial(n));
    return 0;
}`
  }
};

export const CPlayground: React.FC<CPlaygroundProps> = ({
  initialCode,
  title = "Interactive C Code Playground",
  onCodeChange,
  showTemplates = true,
  courseId = "learn-c",
  executionProfile
}) => {
  const activeProfile = executionProfile || getCourseExecutionProfile(courseId);
  const profileSummary = getExecutionProfileSummary(activeProfile);

  const defaultCode = initialCode || TEMPLATES.swap.code;
  const [code, setCode] = useState<string>(defaultCode);
  const [stdin, setStdin] = useState<string>("");
  const [output, setOutput] = useState<string>("Ready to execute. Click 'Run Code' or press Ctrl+Enter.");
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [outputCopied, setOutputCopied] = useState<boolean>(false);
  const [execTime, setExecTime] = useState<number | null>(null);
  const [compileTime, setCompileTime] = useState<number | null>(null);
  const [exitCode, setExitCode] = useState<number | null>(null);
  const [execStatus, setExecStatus] = useState<"idle" | "success" | "compilation_error" | "runtime_error" | "timeout">("idle");
  const [selectedCompiler, setSelectedCompiler] = useState<"gcc" | "clang">("gcc");
  const [serverCompilerInfo, setServerCompilerInfo] = useState<ServerCompilerInfo | null>(null);
  const [activeTab, setActiveTab] = useState<"terminal" | "stdin" | "shortcuts">("terminal");

  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const lineNumbersRef = useRef<HTMLDivElement | null>(null);

  // Fetch real host compiler info on mount
  useEffect(() => {
    let isMounted = true;
    fetch("/api/c-compiler-info")
      .then((res) => res.json())
      .then((data: ServerCompilerInfo) => {
        if (isMounted && data && data.isAvailable) {
          setServerCompilerInfo(data);
          if (data.defaultCompiler === "clang" || data.defaultCompiler === "gcc") {
            setSelectedCompiler(data.defaultCompiler);
          }
        }
      })
      .catch(() => {});
    return () => {
      isMounted = false;
    };
  }, []);

  // Synchronize textarea scroll with line numbers
  const handleScroll = () => {
    if (textareaRef.current && lineNumbersRef.current) {
      lineNumbersRef.current.scrollTop = textareaRef.current.scrollTop;
    }
  };

  // Run C Program
  const handleRun = async () => {
    if (isRunning) return;
    setIsRunning(true);
    setExecStatus("idle");
    setOutput(`[1/2] Compiling C source code (-std=c17)...\n[2/2] Running in secure isolated sandbox...`);
    setActiveTab("terminal");
    const startTime = performance.now();

    try {
      const res = await fetch("/api/c-runner", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code,
          stdin,
          courseId: courseId || "learn-c",
          compiler: selectedCompiler,
          standard: "c17",
          timeoutMs: 5000
        })
      });

      const contentType = res.headers.get("content-type") || "";
      if (res.ok && contentType.includes("application/json")) {
        const data = await res.json();
        setOutput(data.output || (data.stdout ? data.stdout : "[Program finished with exit code 0 and produced no output.]"));
        setExecTime(data.executionTimeMs ?? Math.round(performance.now() - startTime));
        setCompileTime(data.compilationTimeMs ?? 10);
        setExitCode(data.exitCode ?? 0);
        setExecStatus(data.status || "success");
      } else {
        // Run via built-in C interpreter engine
        const simResult = executeCCode(code, stdin);
        const elapsed = Math.round(performance.now() - startTime);
        setExecTime(elapsed);
        setCompileTime(10);
        setExitCode(simResult.exitCode);
        if (simResult.status === "error") {
          setOutput(simResult.output);
          setExecStatus("compilation_error");
        } else {
          setOutput(simResult.output || "[Program finished with exit code 0 and produced no output.]");
          setExecStatus("success");
        }
      }
    } catch {
      // Offline / network fallback
      const simResult = executeCCode(code, stdin);
      const elapsed = Math.round(performance.now() - startTime);
      setExecTime(elapsed);
      setCompileTime(10);
      setExitCode(simResult.exitCode);
      if (simResult.status === "error") {
        setOutput(simResult.output);
        setExecStatus("compilation_error");
      } else {
        setOutput(simResult.output || "[Program finished with exit code 0 and produced no output.]");
        setExecStatus("success");
      }
    } finally {
      setIsRunning(false);
    }
  };

  // Keyboard shortcut handler (Ctrl+Enter / Cmd+Enter to Run, Tab to indent)
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      e.preventDefault();
      handleRun();
      return;
    }

    if (e.key === "Tab") {
      e.preventDefault();
      const target = e.currentTarget;
      const start = target.selectionStart;
      const end = target.selectionEnd;
      const indent = "    "; // 4 spaces

      if (e.shiftKey) {
        // Dedent
        const lines = code.substring(0, start).split("\n");
        const currentLine = lines[lines.length - 1];
        if (currentLine.startsWith(indent)) {
          const newCode = code.substring(0, start - indent.length) + code.substring(start);
          setCode(newCode);
          if (onCodeChange) onCodeChange(newCode);
          setTimeout(() => {
            target.selectionStart = target.selectionEnd = Math.max(0, start - indent.length);
          }, 0);
        }
      } else {
        // Indent 4 spaces
        const newCode = code.substring(0, start) + indent + code.substring(end);
        setCode(newCode);
        if (onCodeChange) onCodeChange(newCode);
        setTimeout(() => {
          target.selectionStart = target.selectionEnd = start + indent.length;
        }, 0);
      }
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyOutput = () => {
    navigator.clipboard.writeText(output);
    setOutputCopied(true);
    setTimeout(() => setOutputCopied(false), 2000);
  };

  const handleReset = () => {
    setCode(defaultCode);
    setOutput("Editor reset to default starter code.");
    setExecTime(null);
    setCompileTime(null);
    setExitCode(null);
    setExecStatus("idle");
    if (onCodeChange) onCodeChange(defaultCode);
  };

  const handleClear = () => {
    setCode("");
    setOutput("Editor cleared. Write your C program and click 'Run Code'.");
    setExecTime(null);
    setCompileTime(null);
    setExitCode(null);
    setExecStatus("idle");
    if (onCodeChange) onCodeChange("");
  };

  const handleCodeEdit = (val: string) => {
    setCode(val);
    if (onCodeChange) onCodeChange(val);
  };

  const lineCount = Math.max(code.split("\n").length, 12);
  const lineNumbers = Array.from({ length: lineCount }, (_, i) => i + 1);
  const activeCompilerVersion =
    serverCompilerInfo?.compilers?.[selectedCompiler]?.version ||
    serverCompilerInfo?.version ||
    `${selectedCompiler.toUpperCase()} (-std=c17)`;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-2xl my-4 text-slate-100 font-sans">
      {/* Editor Header Bar */}
      <div className="bg-slate-950 px-3 sm:px-4 py-2.5 border-b border-slate-800 flex flex-wrap items-center justify-between gap-2.5">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5 mr-1">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block shadow-sm"></span>
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block shadow-sm"></span>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block shadow-sm"></span>
          </div>
          <Code2 className="w-4 h-4 text-cyan-400 shrink-0" />
          <span className="text-xs sm:text-sm font-semibold tracking-wide text-slate-200 truncate">{title}</span>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-950/80 text-blue-300 border border-blue-800/60 hidden sm:inline-flex items-center gap-1 shrink-0">
            <Cpu className="w-2.5 h-2.5" /> {profileSummary.badge}
          </span>
        </div>

        {/* Compiler and Templates selector */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Templates dropdown */}
          {showTemplates && (
            <div className="flex items-center gap-1.5 text-xs max-w-full">
              <span className="text-slate-400 hidden sm:flex items-center gap-1 text-[11px]">
                <FileCode2 className="w-3.5 h-3.5 text-cyan-400" /> Examples:
              </span>
              <select
                onChange={(e) => {
                  const key = e.target.value;
                  if (TEMPLATES[key]) {
                    setCode(TEMPLATES[key].code);
                    if (TEMPLATES[key].stdin !== undefined) {
                      setStdin(TEMPLATES[key].stdin || "");
                    }
                    setOutput(`Loaded example: ${TEMPLATES[key].name}\nPress 'Run Code' or Ctrl+Enter to execute.`);
                    setExecStatus("idle");
                    if (onCodeChange) onCodeChange(TEMPLATES[key].code);
                  }
                }}
                defaultValue="swap"
                className="bg-slate-800 border border-slate-700 hover:border-slate-600 rounded px-2.5 py-1 text-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-cyan-500 cursor-pointer max-w-[150px] sm:max-w-xs truncate"
              >
                {Object.entries(TEMPLATES).map(([k, t]) => (
                  <option key={k} value={k}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Action Controls */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1 text-xs px-2.5 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
              title="Copy C source code"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span className="hidden xs:inline">{copied ? "Copied" : "Copy"}</span>
            </button>

            <button
              onClick={handleReset}
              className="flex items-center gap-1 text-xs px-2.5 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
              title="Reset code"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Reset</span>
            </button>

            <button
              onClick={handleClear}
              className="flex items-center gap-1 text-xs px-2.5 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-rose-300 hover:text-rose-200 transition-colors cursor-pointer"
              title="Clear editor"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Clear</span>
            </button>

            <button
              onClick={handleRun}
              disabled={isRunning}
              className="flex items-center gap-1.5 text-xs font-semibold px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-950/40 transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
              title="Compile and run (Ctrl+Enter)"
            >
              <Play className={`w-3.5 h-3.5 ${isRunning ? "animate-spin" : "fill-current"}`} />
              <span>{isRunning ? "Compiling..." : "Run Code"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Editor & Terminal Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[460px]">
        {/* Code Editor Panel (Left 7 cols on Desktop) */}
        <div className="lg:col-span-7 border-b lg:border-b-0 lg:border-r border-slate-800 flex flex-col bg-slate-900/95">
          {/* File Header */}
          <div className="bg-slate-950/70 px-3 py-1.5 border-b border-slate-800/80 flex justify-between items-center text-[11px] text-slate-400 font-mono">
            <span className="flex items-center gap-1.5 text-slate-200">
              <FileCode2 className="w-3.5 h-3.5 text-cyan-400" /> main.c
            </span>
            <div className="flex items-center gap-3 text-slate-400 text-[10px]">
              <span>Lines: <strong className="text-slate-300">{code.split("\n").length}</strong></span>
              <span className="hidden sm:inline">Encoding: <strong className="text-slate-300">UTF-8</strong></span>
              <span>Standard: <strong className="text-emerald-400">C17 / C99</strong></span>
            </div>
          </div>

          {/* Editor Core with Synchronized Line Numbers */}
          <div className="relative flex-1 flex overflow-hidden min-h-[340px]">
            {/* Line numbers gutter */}
            <div
              ref={lineNumbersRef}
              className="w-10 sm:w-12 bg-slate-950/50 select-none py-3 text-right pr-2 text-slate-600 font-mono text-xs leading-6 border-r border-slate-800/60 overflow-hidden shrink-0"
            >
              {lineNumbers.map((num) => (
                <div key={num}>{num}</div>
              ))}
            </div>

            {/* Code Input Area */}
            <div className="relative flex-1 p-3 overflow-hidden">
              <textarea
                ref={textareaRef}
                value={code}
                onChange={(e) => handleCodeEdit(e.target.value)}
                onKeyDown={handleKeyDown}
                onScroll={handleScroll}
                placeholder="// Write or paste your C code here (e.g. int main(void) { ... })"
                spellCheck={false}
                className="w-full h-full min-h-[320px] bg-transparent text-emerald-300 focus:outline-none resize-none font-mono text-xs sm:text-sm leading-6 selection:bg-cyan-900/60 placeholder:text-slate-600"
              />
            </div>
          </div>

          {/* Editor Footer / Shortcuts Reminder */}
          <div className="border-t border-slate-800/80 px-3 py-1.5 bg-slate-950/60 flex items-center justify-between text-[11px] text-slate-400 font-mono">
            <span className="flex items-center gap-1 text-[10px] text-slate-400">
              <Keyboard className="w-3 h-3 text-cyan-400" />
              Press <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300 text-[10px]">Ctrl+Enter</kbd> to run
            </span>
            <span className="text-[10px] text-slate-500 hidden sm:inline">Tab = 4 Spaces Indentation</span>
          </div>
        </div>

        {/* Output & Terminal Panel (Right 5 cols on Desktop) */}
        <div className="lg:col-span-5 flex flex-col bg-slate-950 font-mono">
          {/* Terminal Tabs */}
          <div className="bg-slate-900/90 px-3 py-1 border-b border-slate-800 flex items-center justify-between text-[11px]">
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setActiveTab("terminal")}
                className={`px-2.5 py-1 rounded text-xs flex items-center gap-1.5 transition-colors cursor-pointer ${
                  activeTab === "terminal"
                    ? "bg-slate-800 text-slate-100 font-semibold shadow-inner border border-slate-700/60"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <Terminal className="w-3.5 h-3.5 text-emerald-400" /> Output Terminal
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("stdin")}
                className={`px-2.5 py-1 rounded text-xs flex items-center gap-1.5 transition-colors cursor-pointer ${
                  activeTab === "stdin"
                    ? "bg-slate-800 text-slate-100 font-semibold shadow-inner border border-slate-700/60"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <Layers className="w-3.5 h-3.5 text-cyan-400" /> Standard Input (stdin)
                {stdin.trim().length > 0 && <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>}
              </button>
            </div>

            {/* Performance metric chips */}
            <div className="flex items-center gap-2 text-[10px]">
              {execTime !== null && (
                <span className="text-emerald-400 flex items-center gap-0.5">
                  <Clock className="w-2.5 h-2.5" /> {execTime}ms
                  {exitCode !== null && ` (exit: ${exitCode})`}
                </span>
              )}
            </div>
          </div>

          {/* Tab 1: Terminal Output View */}
          {activeTab === "terminal" && (
            <div className="flex-1 flex flex-col min-h-[300px]">
              {/* Status banner if compilation error or runtime issue */}
              {execStatus === "compilation_error" && (
                <div className="bg-amber-950/70 border-b border-amber-800/80 px-3 py-1.5 text-[11px] text-amber-300 flex items-center justify-between gap-1.5">
                  <div className="flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span>Compilation Warning / Error</span>
                  </div>
                  <span className="text-[10px] text-amber-400/80">Exit Code: {exitCode ?? 1}</span>
                </div>
              )}

              {execStatus === "runtime_error" && (
                <div className="bg-rose-950/70 border-b border-rose-800/80 px-3 py-1.5 text-[11px] text-rose-300 flex items-center justify-between gap-1.5">
                  <div className="flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                    <span>Runtime Execution Failure</span>
                  </div>
                  <span className="text-[10px] text-rose-400/80">Exit Code: {exitCode ?? 1}</span>
                </div>
              )}

              {execStatus === "timeout" && (
                <div className="bg-purple-950/70 border-b border-purple-800/80 px-3 py-1.5 text-[11px] text-purple-300 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                  <span>Execution Timeout (Limit: 5 seconds)</span>
                </div>
              )}

              {/* Output Content */}
              <div className="p-3.5 flex-1 text-xs text-slate-100 overflow-auto whitespace-pre-wrap leading-relaxed font-mono selection:bg-cyan-900/80">
                {output}
              </div>

              {/* Bottom Output Toolbar */}
              <div className="p-2 border-t border-slate-800/60 bg-slate-900/40 text-[10px] text-slate-400 flex justify-between items-center">
                <div className="flex items-center gap-2 truncate">
                  <span className="truncate max-w-[200px]" title={activeCompilerVersion}>
                    {activeCompilerVersion}
                  </span>
                  <span className="text-slate-600">|</span>
                  <span className="text-emerald-400 font-semibold">C Execution Engine</span>
                </div>
                <button
                  type="button"
                  onClick={handleCopyOutput}
                  className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center gap-1 cursor-pointer transition-colors"
                  title="Copy terminal output"
                >
                  {outputCopied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{outputCopied ? "Copied" : "Copy Output"}</span>
                </button>
              </div>
            </div>
          )}

          {/* Tab 2: Standard Input (stdin) Configuration */}
          {activeTab === "stdin" && (
            <div className="flex-1 p-3.5 flex flex-col justify-between space-y-3">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <label className="text-slate-300 font-medium flex items-center gap-1.5">
                    <Terminal className="w-3.5 h-3.5 text-cyan-400" /> Standard Input (stdin for scanf):
                  </label>
                  <span className="text-[10px] text-slate-400">Passed line-by-line / tokenized</span>
                </div>

                <textarea
                  value={stdin}
                  onChange={(e) => setStdin(e.target.value)}
                  placeholder="e.g. 10 20&#10;or multiple lines of values..."
                  className="w-full h-32 bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-slate-200 font-mono text-xs focus:outline-none focus:border-cyan-500 resize-none shadow-inner"
                />

                <div className="space-y-1.5">
                  <span className="text-[11px] text-slate-400 font-sans block">Quick Input Presets:</span>
                  <div className="flex flex-wrap gap-1.5">
                    <button
                      type="button"
                      onClick={() => setStdin("10 20")}
                      className="text-[10px] px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors cursor-pointer"
                    >
                      Two Numbers (10 20)
                    </button>
                    <button
                      type="button"
                      onClick={() => setStdin("5 12 18 24 30")}
                      className="text-[10px] px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors cursor-pointer"
                    >
                      5 Array Elements
                    </button>
                    <button
                      type="button"
                      onClick={() => setStdin("Programming")}
                      className="text-[10px] px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors cursor-pointer"
                    >
                      Single String
                    </button>
                    <button
                      type="button"
                      onClick={() => setStdin("")}
                      className="text-[10px] px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-rose-300 border border-slate-700 transition-colors cursor-pointer"
                    >
                      Clear Stdin
                    </button>
                  </div>
                </div>
              </div>

              <div className="bg-slate-900/60 border border-slate-800 rounded-lg p-2.5 text-[11px] text-slate-400 font-sans flex items-start gap-2">
                <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                <span>
                  When your C program calls <code className="text-cyan-300 font-mono">scanf("%d", &amp;var)</code>, values from this stdin buffer are consumed in order.
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
