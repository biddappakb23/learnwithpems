import React, { useState, useEffect } from "react";
import {
  Play,
  RotateCcw,
  Trash2,
  Copy,
  Check,
  Terminal,
  Code2,
  Sparkles,
  FileCode2,
  Cpu,
  AlertTriangle,
  Clock,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import { CourseExecutionProfile } from "../types";
import { getCourseExecutionProfile, getExecutionProfileSummary } from "../services/executionProfile";

interface PythonPlaygroundProps {
  initialCode?: string;
  title?: string;
  onCodeChange?: (code: string) => void;
  showTemplates?: boolean;
  courseId?: string;
  executionProfile?: CourseExecutionProfile;
}

interface ServerPythonInfo {
  runtime: "cpython" | "none";
  version: string;
  fullVersion: string;
  standard: string;
  executable: string;
  isAvailable: boolean;
}

const PYTHON_TEMPLATES: Record<string, { name: string; desc: string; code: string; stdin?: string }> = {
  hello: {
    name: "1. Hello World",
    desc: "Basic Python 3 print statement",
    code: `# Standard Hello World in Python 3\nprint("Hello, Learnwithpems!")`
  },
  input_demo: {
    name: "2. Standard Input",
    desc: "Interactive input() with stdin",
    code: `# Read input from standard input\nname = input()\nprint("Hello,", name)`,
    stdin: "Pemmaiah"
  },
  variables: {
    name: "3. Variables & Math",
    desc: "Arithmetic and variables",
    code: `a = 10\nb = 20\n\nprint(a + b)\nprint(a * b)`
  },
  conditionals: {
    name: "4. Conditionals",
    desc: "if-else branch with input",
    code: `number = int(input())\n\nif number % 2 == 0:\n    print("Even")\nelse:\n    print("Odd")`,
    stdin: "10"
  },
  loops: {
    name: "5. Loops & Iteration",
    desc: "for-in range() loop",
    code: `for i in range(1, 6):\n    print(i)`
  },
  functions: {
    name: "6. Functions",
    desc: "Custom function definition",
    code: `def square(n):\n    return n * n\n\nprint(square(5))`
  },
  data_structures: {
    name: "7. Lists & Dictionaries",
    desc: "Built-in data structures",
    code: `numbers = [10, 20, 30, 40]\nprint(sum(numbers))\n\nstudent = {\n    "name": "Alex",\n    "marks": 90\n}\nprint(student["name"])`
  },
  classes: {
    name: "8. Classes & OOP",
    desc: "Object-oriented class definition",
    code: `class Student:\n    def __init__(self, name):\n        self.name = name\n\n    def display(self):\n        print(self.name)\n\nstudent = Student("Alex")\nstudent.display()`
  },
  exceptions: {
    name: "9. Exception Handling",
    desc: "try / except ZeroDivisionError",
    code: `try:\n    value = int(input())\n    print(100 / value)\nexcept ZeroDivisionError:\n    print("Cannot divide by zero")`,
    stdin: "0"
  }
};

export const PythonPlayground: React.FC<PythonPlaygroundProps> = ({
  initialCode,
  title = "Interactive Python Code Playground",
  onCodeChange,
  showTemplates = true,
  courseId = "learn-python",
  executionProfile
}) => {
  const activeProfile = executionProfile || getCourseExecutionProfile(courseId || "learn-python");
  const profileSummary = getExecutionProfileSummary(activeProfile);

  const defaultCode = initialCode || PYTHON_TEMPLATES.hello.code;
  const [code, setCode] = useState<string>(defaultCode);
  const [stdin, setStdin] = useState<string>("");
  const [output, setOutput] = useState<string>("Click 'Run Code' to execute your Python program via CPython 3.");
  const [stdout, setStdout] = useState<string>("");
  const [stderr, setStderr] = useState<string>("");
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [execTime, setExecTime] = useState<number | null>(null);
  const [exitCode, setExitCode] = useState<number | null>(null);
  const [execStatus, setExecStatus] = useState<"idle" | "success" | "syntax_error" | "runtime_error" | "timeout">("idle");
  const [diagnosticHint, setDiagnosticHint] = useState<string | null>(null);
  const [serverPythonInfo, setServerPythonInfo] = useState<ServerPythonInfo | null>(null);
  const [activeTemplate, setActiveTemplate] = useState<string>("hello");
  const [activeOutputTab, setActiveOutputTab] = useState<"combined" | "stdout" | "stderr">("combined");

  // Query actual host CPython runtime on mount
  useEffect(() => {
    let isMounted = true;
    fetch("/api/python-runtime-info")
      .then((res) => res.json())
      .then((data: ServerPythonInfo) => {
        if (isMounted && data && data.isAvailable) {
          setServerPythonInfo(data);
        }
      })
      .catch(() => {});
    return () => {
      isMounted = false;
    };
  }, []);

  const handleRun = async () => {
    setIsRunning(true);
    setExecStatus("idle");
    setDiagnosticHint(null);
    setOutput("Executing Python code through isolated CPython process...");
    const startTime = performance.now();

    try {
      const res = await fetch("/api/python-runner", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code,
          stdin,
          courseId: courseId || "learn-python",
          timeoutMs: 5000
        })
      });

      const contentType = res.headers.get("content-type") || "";
      if (res.ok && contentType.includes("application/json")) {
        const data = await res.json();
        setOutput(data.output || (data.exitCode === 0 ? "Program finished with no output." : ""));
        setStdout(data.stdout || "");
        setStderr(data.stderr || "");
        setExecTime(data.executionTimeMs ?? Math.round(performance.now() - startTime));
        setExitCode(data.exitCode ?? 0);
        setExecStatus(data.status || (data.exitCode === 0 ? "success" : "runtime_error"));
        setDiagnosticHint(data.diagnosticExplanation || null);
      } else {
        const errText = await res.text();
        setOutput(`Server Execution Error (${res.status}):\n${errText}`);
        setExecStatus("runtime_error");
        setExitCode(1);
      }
    } catch (err: any) {
      setOutput(`Network / Execution Request Error:\n${err?.message || "Failed to reach Python execution service"}`);
      setExecStatus("runtime_error");
      setExitCode(1);
    } finally {
      setIsRunning(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReset = () => {
    setCode(defaultCode);
    setOutput("Editor reset to default code.");
    setStdout("");
    setStderr("");
    setExecTime(null);
    setExitCode(null);
    setExecStatus("idle");
    setDiagnosticHint(null);
    if (onCodeChange) onCodeChange(defaultCode);
  };

  const handleClear = () => {
    setCode("");
    setOutput("Editor cleared.");
    setStdout("");
    setStderr("");
    setExecTime(null);
    setExitCode(null);
    setExecStatus("idle");
    setDiagnosticHint(null);
    if (onCodeChange) onCodeChange("");
  };

  const loadTemplate = (key: string) => {
    const tmpl = PYTHON_TEMPLATES[key];
    if (tmpl) {
      setCode(tmpl.code);
      if (typeof tmpl.stdin === "string") {
        setStdin(tmpl.stdin);
      } else {
        setStdin("");
      }
      setActiveTemplate(key);
      setOutput(`Loaded template '${tmpl.name}'. Click 'Run Code' to execute.`);
      setStdout("");
      setStderr("");
      setExecTime(null);
      setExitCode(null);
      setExecStatus("idle");
      setDiagnosticHint(null);
      if (onCodeChange) onCodeChange(tmpl.code);
    }
  };

  const lineCount = code.split("\n").length;
  const lineNumbers = Array.from({ length: Math.max(lineCount, 12) }, (_, i) => i + 1);

  return (
    <div id="python-playground" className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl text-slate-100 flex flex-col">
      {/* Top Header Bar */}
      <div className="bg-slate-950/80 border-b border-slate-800/80 px-4 py-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold">
            <Terminal className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-semibold text-white tracking-wide">{title}</h2>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                <Cpu className="w-2.5 h-2.5" /> Language: Python
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-blue-500/10 text-blue-300 border border-blue-500/20">
                Runtime: CPython ({serverPythonInfo?.version || "Python 3.11+"})
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Genuine CPython process sandbox with real standard input & terminal execution
            </p>
          </div>
        </div>

        {/* Runtime info display (Non-selectable, course-determined) */}
        <div className="flex items-center gap-2">
          <div className="hidden sm:flex items-center gap-1.5 bg-slate-900 border border-slate-700/60 rounded-lg px-2.5 py-1 text-xs text-slate-300">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="font-mono text-[11px]">{serverPythonInfo?.version || "CPython 3.11"}</span>
          </div>

          <button
            onClick={handleRun}
            disabled={isRunning}
            id="python-run-btn"
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 disabled:opacity-50 text-white font-medium text-xs px-4 py-2 rounded-xl transition-all shadow-md hover:shadow-emerald-600/25 cursor-pointer"
          >
            {isRunning ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Executing...</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-white" />
                <span>Run Code</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Template Selector Bar (Optional) */}
      {showTemplates && (
        <div className="bg-slate-950/40 border-b border-slate-800/60 px-4 py-2 overflow-x-auto flex items-center gap-1.5 scrollbar-thin">
          <span className="text-[11px] text-slate-400 flex items-center gap-1 mr-2 whitespace-nowrap">
            <FileCode2 className="w-3 h-3 text-emerald-400" /> Templates:
          </span>
          {Object.entries(PYTHON_TEMPLATES).map(([key, item]) => (
            <button
              key={key}
              onClick={() => loadTemplate(key)}
              title={item.desc}
              className={`text-[11px] px-2.5 py-1 rounded-lg border whitespace-nowrap transition-colors cursor-pointer ${
                activeTemplate === key
                  ? "bg-emerald-950/60 border-emerald-500/40 text-emerald-300 font-medium"
                  : "bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700"
              }`}
            >
              {item.name}
            </button>
          ))}
        </div>
      )}

      {/* Editor & Console Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[460px]">
        {/* Code Editor Panel */}
        <div className="lg:col-span-7 border-b lg:border-b-0 lg:border-r border-slate-800 flex flex-col bg-slate-950/60">
          {/* Editor Header */}
          <div className="bg-slate-950/80 px-4 py-2 border-b border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
            <div className="flex items-center gap-2 font-mono text-[11px] text-slate-300">
              <Code2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>main.py</span>
              <span className="text-[10px] text-slate-500">({activeProfile.displayBadge})</span>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={handleCopy}
                title="Copy code"
                className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
              <button
                onClick={handleReset}
                title="Reset code"
                className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={handleClear}
                title="Clear editor"
                className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-rose-400 transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Editor Textarea with Line Numbers */}
          <div className="relative flex-1 flex font-mono text-xs bg-slate-950/90 overflow-hidden">
            {/* Line Numbers */}
            <div className="select-none py-3 px-2 bg-slate-950 text-slate-600 text-right font-mono text-[11px] border-r border-slate-800/60 min-w-[2.5rem]">
              {lineNumbers.map((num) => (
                <div key={num} className="leading-6">
                  {num}
                </div>
              ))}
            </div>

            {/* Code Input */}
            <textarea
              id="python-code-editor"
              value={code}
              onChange={(e) => {
                setCode(e.target.value);
                if (onCodeChange) onCodeChange(e.target.value);
              }}
              spellCheck={false}
              className="w-full flex-1 p-3 bg-transparent text-emerald-300/95 font-mono text-[12px] leading-6 resize-none focus:outline-none focus:ring-0 selection:bg-emerald-900/50"
              placeholder="# Write your Python 3 code here..."
            />
          </div>

          {/* Standard Input (stdin) Panel */}
          <div className="border-t border-slate-800/80 bg-slate-950/95 p-3">
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor="python-stdin-input" className="text-[11px] font-semibold text-slate-400 flex items-center gap-1.5">
                <Terminal className="w-3 h-3 text-blue-400" /> Standard Input (stdin for input()):
              </label>
              <span className="text-[10px] text-slate-500">Provide line-separated values</span>
            </div>
            <textarea
              id="python-stdin-input"
              value={stdin}
              onChange={(e) => setStdin(e.target.value)}
              placeholder="e.g. Pemmaiah or 10 or line 1..."
              rows={2}
              className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 font-mono text-xs text-slate-200 focus:outline-none focus:border-blue-500/50 resize-none"
            />
          </div>
        </div>

        {/* Output Console Panel */}
        <div className="lg:col-span-5 flex flex-col bg-slate-950">
          {/* Console Header */}
          <div className="bg-slate-950/80 px-4 py-2 border-b border-slate-800/80 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <Terminal className="w-3.5 h-3.5 text-emerald-400" />
              <span className="font-semibold text-slate-300 text-xs">Output Console</span>
              {execStatus === "success" && (
                <span className="inline-flex items-center gap-1 text-[10px] bg-emerald-950/80 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-800/50">
                  <CheckCircle2 className="w-2.5 h-2.5" /> Success
                </span>
              )}
              {execStatus === "syntax_error" && (
                <span className="inline-flex items-center gap-1 text-[10px] bg-rose-950/80 text-rose-400 px-2 py-0.5 rounded-full border border-rose-800/50">
                  <AlertTriangle className="w-2.5 h-2.5" /> Syntax Error
                </span>
              )}
              {execStatus === "runtime_error" && (
                <span className="inline-flex items-center gap-1 text-[10px] bg-amber-950/80 text-amber-400 px-2 py-0.5 rounded-full border border-amber-800/50">
                  <AlertCircle className="w-2.5 h-2.5" /> Runtime Error
                </span>
              )}
              {execStatus === "timeout" && (
                <span className="inline-flex items-center gap-1 text-[10px] bg-rose-950/80 text-rose-400 px-2 py-0.5 rounded-full border border-rose-800/50">
                  <Clock className="w-2.5 h-2.5" /> Timeout
                </span>
              )}
            </div>

            {/* Output view toggles */}
            <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 rounded-lg p-0.5 text-[10px]">
              <button
                onClick={() => setActiveOutputTab("combined")}
                className={`px-2 py-0.5 rounded ${activeOutputTab === "combined" ? "bg-slate-800 text-white font-medium" : "text-slate-400 hover:text-slate-200"}`}
              >
                All
              </button>
              <button
                onClick={() => setActiveOutputTab("stdout")}
                className={`px-2 py-0.5 rounded ${activeOutputTab === "stdout" ? "bg-slate-800 text-emerald-300 font-medium" : "text-slate-400 hover:text-slate-200"}`}
              >
                stdout
              </button>
              <button
                onClick={() => setActiveOutputTab("stderr")}
                className={`px-2 py-0.5 rounded ${activeOutputTab === "stderr" ? "bg-slate-800 text-rose-300 font-medium" : "text-slate-400 hover:text-slate-200"}`}
              >
                stderr
              </button>
            </div>
          </div>

          {/* Diagnostic Guidance Banner (If hints available) */}
          {diagnosticHint && (
            <div className="bg-amber-950/40 border-b border-amber-900/60 p-3 text-xs text-amber-200 flex items-start gap-2.5">
              <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <strong className="font-semibold text-amber-300 block mb-0.5">Diagnostic Guidance:</strong>
                <p className="text-[11px] text-amber-200/90 whitespace-pre-line leading-relaxed">{diagnosticHint}</p>
              </div>
            </div>
          )}

          {/* Terminal Output Viewer */}
          <div className="flex-1 p-4 font-mono text-xs overflow-auto bg-slate-950 text-slate-200 leading-relaxed selection:bg-blue-900/40">
            {activeOutputTab === "combined" && (
              <pre className={`whitespace-pre-wrap ${execStatus === "syntax_error" || execStatus === "runtime_error" || execStatus === "timeout" ? "text-rose-300" : "text-emerald-300"}`}>
                {output}
              </pre>
            )}
            {activeOutputTab === "stdout" && (
              <pre className="whitespace-pre-wrap text-emerald-300">
                {stdout || "[stdout is empty]"}
              </pre>
            )}
            {activeOutputTab === "stderr" && (
              <pre className="whitespace-pre-wrap text-rose-300">
                {stderr || "[stderr is empty]"}
              </pre>
            )}
          </div>

          {/* Terminal Footer Metrics */}
          <div className="bg-slate-950/90 border-t border-slate-800/80 px-4 py-2 flex flex-wrap items-center justify-between text-[11px] text-slate-500 font-mono gap-2">
            <div className="flex items-center gap-3">
              {execTime !== null && (
                <span className="flex items-center gap-1 text-slate-400">
                  <Clock className="w-3 h-3 text-slate-500" /> {execTime}ms
                </span>
              )}
              {exitCode !== null && (
                <span className={`px-1.5 py-0.5 rounded text-[10px] ${exitCode === 0 ? "bg-emerald-950 text-emerald-400 border border-emerald-800/50" : "bg-rose-950 text-rose-400 border border-rose-800/50"}`}>
                  Exit Code: {exitCode}
                </span>
              )}
            </div>

            <div className="text-[10px] text-slate-500 flex items-center gap-1.5">
              <span>{serverPythonInfo?.version || "CPython"}</span>
              <span>•</span>
              <span>Isolated Sandbox</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
