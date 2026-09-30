import React, { useState } from "react";
import {
  X,
  Code2,
  Play,
  Terminal,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Lightbulb,
  FileCode,
  Settings2,
  Eye,
  Check,
  RotateCcw,
  Sparkles,
  Layers
} from "lucide-react";
import { PracticeProblem, DifficultyLevel, ContentStatus } from "../types";
import { executeCCode, ExecutionResult } from "../services/cInterpreter";

interface PracticeManagerModalProps {
  initialData: Partial<PracticeProblem> | null;
  onSave: (data: Partial<PracticeProblem> & { title: string }) => void;
  onClose: () => void;
}

const DEFAULT_CATEGORIES = [
  "Basics & Arithmetic",
  "Control Flow & Branching",
  "Loops & Iterations",
  "Functions & Recursion",
  "Arrays & Matrices",
  "Pointers & Memory",
  "Strings & ASCII",
  "Structures & Unions",
  "File I/O",
  "Bitwise Operations",
  "Algorithms & Sorting"
];

const DEFAULT_STARTER_CODE = `#include <stdio.h>

int main() {
    // Write your C solution here
    
    return 0;
}`;

export const PracticeManagerModal: React.FC<PracticeManagerModalProps> = ({
  initialData,
  onSave,
  onClose
}) => {
  const isEditing = Boolean(initialData?.id);

  // Form State
  const [title, setTitle] = useState<string>(initialData?.title || "");
  const [category, setCategory] = useState<string>(initialData?.category || "Basics & Arithmetic");
  const [customCategory, setCustomCategory] = useState<string>("");
  const [difficulty, setDifficulty] = useState<DifficultyLevel>(initialData?.difficulty || "Beginner");
  const [status, setStatus] = useState<ContentStatus>(initialData?.status || "Published");
  const [description, setDescription] = useState<string>(initialData?.description || "");
  const [inputFormat, setInputFormat] = useState<string>(
    initialData?.inputFormat || "A single line containing input values separated by spaces."
  );
  const [outputFormat, setOutputFormat] = useState<string>(
    initialData?.outputFormat || "Print the computed result followed by a newline."
  );
  const [exampleInput, setExampleInput] = useState<string>(initialData?.exampleInput || "");
  const [exampleOutput, setExampleOutput] = useState<string>(initialData?.exampleOutput || "");
  const [starterCode, setStarterCode] = useState<string>(
    initialData?.starterCode || DEFAULT_STARTER_CODE
  );
  const [solutionCode, setSolutionCode] = useState<string>(
    initialData?.solutionCode ||
      `#include <stdio.h>\n\nint main() {\n    printf("Hello, C Practice!\\n");\n    return 0;\n}`
  );
  const [hint, setHint] = useState<string>(initialData?.hint || "");
  const [relatedConcept, setRelatedConcept] = useState<string>(
    initialData?.relatedConcept || "Core C Syntax"
  );

  // View mode
  const [activeTab, setActiveTab] = useState<"configure" | "test_runner">("configure");
  const [validationError, setValidationError] = useState<string | null>(null);

  // In-Modal Test Runner State
  const [testCodeType, setTestCodeType] = useState<"solution" | "starter">("solution");
  const [testStdin, setTestStdin] = useState<string>(initialData?.exampleInput || "");
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [testResult, setTestResult] = useState<ExecutionResult | null>(null);

  const handleRunTest = () => {
    setIsRunning(true);
    setTestResult(null);

    setTimeout(() => {
      const codeToRun = testCodeType === "solution" ? solutionCode : starterCode;
      const res = executeCCode(codeToRun, testStdin);
      setTestResult(res);
      setIsRunning(false);
    }, 50);
  };

  const handleUseExampleAsInput = () => {
    setTestStdin(exampleInput);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    if (!title.trim()) {
      setValidationError("Problem title is required.");
      return;
    }
    if (!description.trim()) {
      setValidationError("Problem description is required.");
      return;
    }

    const finalCategory = category === "CUSTOM" ? customCategory.trim() || "General" : category;

    onSave({
      ...(initialData?.id ? { id: initialData.id } : {}),
      title: title.trim(),
      category: finalCategory,
      difficulty,
      status,
      description: description.trim(),
      inputFormat: inputFormat.trim(),
      outputFormat: outputFormat.trim(),
      exampleInput: exampleInput.trim(),
      exampleOutput: exampleOutput.trim(),
      starterCode: starterCode.trim(),
      solutionCode: solutionCode.trim(),
      hint: hint.trim(),
      relatedConcept: relatedConcept.trim()
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto font-sans">
      <div className="w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden my-6 flex flex-col max-h-[94vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <Code2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                {isEditing ? "Edit Practice Problem" : "Add New Practice Problem"}
              </h2>
              <p className="text-xs text-slate-400">
                Author coding challenges, starter boilerplates, reference solutions, and test them live
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Tab switch */}
            <div className="flex items-center bg-slate-900 border border-slate-800 rounded-xl p-1 text-xs">
              <button
                type="button"
                onClick={() => setActiveTab("configure")}
                className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 cursor-pointer transition-colors ${
                  activeTab === "configure"
                    ? "bg-blue-600 text-white shadow-sm"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <Settings2 className="w-3.5 h-3.5" /> Specification
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveTab("test_runner");
                  if (!testStdin && exampleInput) setTestStdin(exampleInput);
                }}
                className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 cursor-pointer transition-colors ${
                  activeTab === "test_runner"
                    ? "bg-emerald-600 text-white shadow-sm"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <Terminal className="w-3.5 h-3.5" /> Test Compiler
              </button>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Validation Alert */}
        {validationError && (
          <div className="mx-6 mt-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 text-red-400" />
            <span>{validationError}</span>
          </div>
        )}

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-5 text-xs text-slate-200">
          {activeTab === "configure" ? (
            <form id="practice-edit-form" onSubmit={handleSubmit} className="space-y-4">
              {/* Row 1: Title, Category, Difficulty, Status */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                <div className="sm:col-span-2">
                  <label className="text-slate-400 block mb-1 font-medium">Problem Title *</label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Reverse an Array in Place"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-slate-400 block mb-1 font-medium">Difficulty Level</label>
                  <select
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value as DifficultyLevel)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 focus:border-blue-500 focus:outline-none"
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-400 block mb-1 font-medium">Publication Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as ContentStatus)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 focus:border-blue-500 focus:outline-none"
                  >
                    <option value="Published">Published</option>
                    <option value="Draft">Draft</option>
                  </select>
                </div>
              </div>

              {/* Category & Concept */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1 font-medium">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 focus:border-blue-500 focus:outline-none"
                  >
                    {DEFAULT_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                    <option value="CUSTOM">+ Add Custom Category...</option>
                  </select>

                  {category === "CUSTOM" && (
                    <input
                      type="text"
                      value={customCategory}
                      onChange={(e) => setCustomCategory(e.target.value)}
                      placeholder="Type custom category name..."
                      className="mt-2 w-full bg-slate-950 border border-blue-500 rounded-xl p-2 text-slate-100 focus:outline-none"
                    />
                  )}
                </div>

                <div>
                  <label className="text-slate-400 block mb-1 font-medium">
                    Related Concept Tag (e.g., Pointers, Dynamic Memory)
                  </label>
                  <input
                    type="text"
                    value={relatedConcept}
                    onChange={(e) => setRelatedConcept(e.target.value)}
                    placeholder="e.g. Pointer Arithmetic, Memory Layout"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Problem Description */}
              <div>
                <label className="text-slate-400 block mb-1 font-medium">
                  Problem Description & Instructions (Markdown supported) *
                </label>
                <textarea
                  required
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe the challenge requirements, edge cases, and constraints clearly..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-100 focus:border-blue-500 focus:outline-none"
                />
              </div>

              {/* Input & Output Specifications */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1 font-medium">Input Format</label>
                  <textarea
                    rows={2}
                    value={inputFormat}
                    onChange={(e) => setInputFormat(e.target.value)}
                    placeholder="e.g. First line contains integer N. Second line contains N integers."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-slate-400 block mb-1 font-medium">Output Format</label>
                  <textarea
                    rows={2}
                    value={outputFormat}
                    onChange={(e) => setOutputFormat(e.target.value)}
                    placeholder="e.g. Print the reversed array elements separated by spaces."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Example Input & Example Output */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-950/60 p-4 rounded-xl border border-slate-800">
                <div>
                  <label className="text-slate-400 block mb-1 font-medium">
                    Sample Test Input (stdin)
                  </label>
                  <textarea
                    rows={3}
                    value={exampleInput}
                    onChange={(e) => setExampleInput(e.target.value)}
                    placeholder="e.g. 5\n10 20 30 40 50"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 font-mono text-cyan-300 text-xs focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-slate-400 block mb-1 font-medium">
                    Sample Expected Output (stdout)
                  </label>
                  <textarea
                    rows={3}
                    value={exampleOutput}
                    onChange={(e) => setExampleOutput(e.target.value)}
                    placeholder="e.g. 50 40 30 20 10"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 font-mono text-emerald-300 text-xs focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Starter Code vs Solution Code */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Starter Code */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-slate-400 font-medium flex items-center gap-1.5">
                      <FileCode className="w-3.5 h-3.5 text-blue-400" /> Student Starter C Code
                    </label>
                    <button
                      type="button"
                      onClick={() => setStarterCode(DEFAULT_STARTER_CODE)}
                      className="text-[11px] text-blue-400 hover:text-blue-300 cursor-pointer"
                    >
                      Reset Template
                    </button>
                  </div>
                  <textarea
                    rows={8}
                    value={starterCode}
                    onChange={(e) => setStarterCode(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 font-mono text-slate-200 text-xs focus:border-blue-500 focus:outline-none"
                  />
                </div>

                {/* Reference Solution Code */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-slate-400 font-medium flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Reference Solution Code
                    </label>
                    <span className="text-[11px] text-slate-500">Verified benchmark</span>
                  </div>
                  <textarea
                    rows={8}
                    value={solutionCode}
                    onChange={(e) => setSolutionCode(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 font-mono text-emerald-300 text-xs focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Hint */}
              <div>
                <label className="text-slate-400 block mb-1 font-medium flex items-center gap-1.5">
                  <Lightbulb className="w-3.5 h-3.5 text-amber-400" /> Helpful Hint / Clue (Optional)
                </label>
                <textarea
                  rows={2}
                  value={hint}
                  onChange={(e) => setHint(e.target.value)}
                  placeholder="Provide a clue (e.g. Use a two-pointer approach swapping elements from left and right)..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 focus:border-blue-500 focus:outline-none"
                />
              </div>
            </form>
          ) : (
            /* IN-MODAL TEST RUNNER COMPILER BENCH */
            <div className="space-y-4 animate-in fade-in">
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Terminal className="w-4 h-4 text-emerald-400" /> Live C Interpreter Test Bench
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Execute and verify solution code or student starter code against custom standard input (stdin)
                  </p>
                </div>

                {/* Code target selection */}
                <div className="flex items-center gap-2">
                  <div className="flex bg-slate-900 border border-slate-800 rounded-lg p-1 text-xs">
                    <button
                      type="button"
                      onClick={() => setTestCodeType("solution")}
                      className={`px-3 py-1 rounded-md font-semibold cursor-pointer transition-colors ${
                        testCodeType === "solution"
                          ? "bg-emerald-600 text-white"
                          : "text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      Test Solution Code
                    </button>
                    <button
                      type="button"
                      onClick={() => setTestCodeType("starter")}
                      className={`px-3 py-1 rounded-md font-semibold cursor-pointer transition-colors ${
                        testCodeType === "starter"
                          ? "bg-blue-600 text-white"
                          : "text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      Test Starter Code
                    </button>
                  </div>

                  <button
                    type="button"
                    disabled={isRunning}
                    onClick={handleRunTest}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold rounded-xl flex items-center gap-1.5 cursor-pointer shadow-md shadow-emerald-900/30"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>{isRunning ? "Compiling..." : "Run C Program"}</span>
                  </button>
                </div>
              </div>

              {/* Code Preview & Stdin */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                {/* Code Editor Preview */}
                <div className="lg:col-span-7 space-y-2">
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span className="font-semibold text-slate-300">
                      Target Source Code ({testCodeType === "solution" ? "Solution" : "Starter"}):
                    </span>
                    <span className="text-[11px] text-slate-500">ANSI C C99 Engine</span>
                  </div>
                  <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl font-mono text-xs text-slate-200 h-64 overflow-y-auto whitespace-pre">
                    {testCodeType === "solution" ? solutionCode : starterCode}
                  </div>
                </div>

                {/* Stdin and Terminal Output */}
                <div className="lg:col-span-5 space-y-3 flex flex-col">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-slate-400 font-medium">Standard Input (stdin):</label>
                      {exampleInput && (
                        <button
                          type="button"
                          onClick={handleUseExampleAsInput}
                          className="text-[10px] text-cyan-400 hover:underline cursor-pointer"
                        >
                          Load Sample Input
                        </button>
                      )}
                    </div>
                    <textarea
                      rows={3}
                      value={testStdin}
                      onChange={(e) => setTestStdin(e.target.value)}
                      placeholder="Input values provided to scanf..."
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 font-mono text-cyan-300 text-xs focus:border-cyan-500 focus:outline-none"
                    />
                  </div>

                  {/* Terminal Execution Output */}
                  <div className="flex-1 space-y-1.5">
                    <div className="flex items-center justify-between text-xs text-slate-400">
                      <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                        <Terminal className="w-3.5 h-3.5 text-emerald-400" /> Output Console (stdout):
                      </span>
                      {testResult && (
                        <span className="text-[10px] text-slate-500">
                          {testResult.executionTimeMs}ms • exit {testResult.exitCode}
                        </span>
                      )}
                    </div>

                    <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl font-mono text-xs h-40 overflow-y-auto">
                      {testResult ? (
                        <div
                          className={
                            testResult.status === "error"
                              ? "text-rose-400 whitespace-pre-wrap"
                              : "text-emerald-300 whitespace-pre-wrap"
                          }
                        >
                          {testResult.output || "[Program completed with no stdout]"}
                        </div>
                      ) : (
                        <div className="text-slate-600 italic">
                          Click "Run C Program" to execute and inspect compiler output...
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Expected Output Match Verification */}
              {testResult && exampleOutput && (
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2">
                    {testResult.output.trim() === exampleOutput.trim() ? (
                      <span className="flex items-center gap-1.5 font-bold text-emerald-400">
                        <CheckCircle2 className="w-4 h-4" />
                        Output Exactly Matches Sample Expected Output!
                      </span>
                    ) : (
                      <span className="flex items-center gap-1.5 font-bold text-amber-400">
                        <AlertTriangle className="w-4 h-4" />
                        Output differs from Sample Expected Output. Verify formatting/newlines.
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] text-slate-500">
                    Expected: <code className="text-slate-300">{exampleOutput.slice(0, 30)}</code>
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-slate-950/80 border-t border-slate-800 flex items-center justify-between shrink-0">
          <div className="text-slate-400 text-xs">
            {activeTab === "configure"
              ? "All changes save instantly to student practice catalog"
              : "Compiler verified for browser execution"}
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="practice-edit-form"
              onClick={(e) => {
                if (activeTab === "test_runner") {
                  setActiveTab("configure");
                  setTimeout(() => {
                    const form = document.getElementById("practice-edit-form") as HTMLFormElement;
                    form?.requestSubmit();
                  }, 50);
                }
              }}
              className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-lg shadow-blue-600/30"
            >
              <Check className="w-4 h-4" />
              <span>{isEditing ? "Update Practice Problem" : "Save Practice Problem"}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
