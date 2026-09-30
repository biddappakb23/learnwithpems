import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { Terminal, Play, RotateCcw, CheckCircle2, Code2, Sparkles, Copy, Check } from "lucide-react";

export const PracticePortal: React.FC<{ onBackToCourse: () => void }> = ({ onBackToCourse }) => {
  const { enrolledCourse } = useAuth();
  const [selectedLang, setSelectedLang] = useState<"c" | "python">("c");
  const [code, setCode] = useState<string>(
    `// C Programming Practice Sandbox\n#include <stdio.h>\n\nint main() {\n    int n = 5;\n    printf("Generating Factorials & Loops in C:\\n");\n    for (int i = 1; i <= n; i++) {\n        printf("Step %d: Running successfully!\\n", i);\n    }\n    return 0;\n}\n`
  );
  const [stdin, setStdin] = useState<string>("");
  const [output, setOutput] = useState<string>("");
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  const sampleChallenges = [
    {
      title: "1. Sum of Natural Numbers",
      desc: "Write a program to calculate the sum of first N natural numbers using a while or for loop.",
      templateC: `#include <stdio.h>\n\nint main() {\n    int n = 10, sum = 0;\n    for(int i = 1; i <= n; i++) {\n        sum += i;\n    }\n    printf("Sum of first %d natural numbers = %d\\n", n, sum);\n    return 0;\n}`,
      templatePy: `n = 10\nsum_val = sum(range(1, n + 1))\nprint(f"Sum of first {n} natural numbers = {sum_val}")`
    },
    {
      title: "2. Prime Number Check",
      desc: "Determine if an integer is a prime number.",
      templateC: `#include <stdio.h>\n#include <stdbool.h>\n\nint main() {\n    int num = 29;\n    bool isPrime = true;\n    for(int i = 2; i <= num/2; ++i) {\n        if(num % i == 0) {\n            isPrime = false;\n            break;\n        }\n    }\n    if (isPrime && num > 1)\n        printf("%d is a PRIME number.\\n", num);\n    else\n        printf("%d is NOT a prime number.\\n", num);\n    return 0;\n}`,
      templatePy: `num = 29\nis_prime = num > 1 and all(num % i != 0 for i in range(2, int(num**0.5) + 1))\nprint(f"{num} is {'a PRIME' if is_prime else 'NOT a prime'} number.")`
    },
    {
      title: "3. Fibonacci Sequence",
      desc: "Generate the first 10 terms of the Fibonacci sequence.",
      templateC: `#include <stdio.h>\n\nint main() {\n    int n = 10, t1 = 0, t2 = 1, nextTerm;\n    printf("Fibonacci Series: ");\n    for (int i = 1; i <= n; ++i) {\n        printf("%d ", t1);\n        nextTerm = t1 + t2;\n        t1 = t2;\n        t2 = nextTerm;\n    }\n    printf("\\n");\n    return 0;\n}`,
      templatePy: `n = 10\na, b = 0, 1\nfib = []\nfor _ in range(n):\n    fib.append(a)\n    a, b = b, a + b\nprint("Fibonacci Series:", " ".join(map(str, fib)))`
    }
  ];

  const handleLangChange = (lang: "c" | "python") => {
    setSelectedLang(lang);
    if (lang === "python") {
      setCode(`# Python 3 Interactive Sandbox\nprint("Welcome to LearnWithPems Python Console!")\nfor i in range(1, 6):\n    print(f"Step {i}: Dynamic Python Execution")\n`);
    } else {
      setCode(`// C Programming Practice Sandbox\n#include <stdio.h>\n\nint main() {\n    printf("Welcome to LearnWithPems C Practice Sandbox!\\n");\n    return 0;\n}\n`);
    }
    setOutput("");
  };

  const handleRunCode = async () => {
    if (!code.trim()) return;
    setIsRunning(true);
    setOutput("Executing your code on backend server...");

    const endpoint = selectedLang === "python" ? "/api/python-runner" : "/api/c-runner";
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, stdin })
      });
      const data = await res.json();
      if (res.ok) {
        setOutput(data.output || data.stdout || "Program exited successfully with no output.");
      } else {
        setOutput(data.output || data.stderr || "Execution error encountered.");
      }
    } catch (err: any) {
      setOutput(`Error: ${err.message || "Failed to execute"}`);
    } finally {
      setIsRunning(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 text-xs font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5" /> Interactive Coding Lab
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Practice Arena & Live Sandbox
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            Write, compile, and debug real C & Python code with standard input support.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-700">
          <button
            onClick={() => handleLangChange("c")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              selectedLang === "c"
                ? "bg-blue-600 text-white shadow-sm"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
            }`}
          >
            C Language
          </button>
          <button
            onClick={() => handleLangChange("python")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              selectedLang === "python"
                ? "bg-blue-600 text-white shadow-sm"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
            }`}
          >
            Python 3
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Sample Practice Challenges */}
        <div className="space-y-4">
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Code2 className="w-5 h-5 text-blue-600" /> Practice Challenges
          </h3>
          <div className="space-y-3">
            {sampleChallenges.map((ch, idx) => (
              <div
                key={idx}
                className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm hover:border-blue-500 transition-all cursor-pointer"
                onClick={() => setCode(selectedLang === "python" ? ch.templatePy : ch.templateC)}
              >
                <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">{ch.title}</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                  {ch.desc}
                </p>
                <div className="mt-3 flex items-center justify-between text-xs text-blue-600 dark:text-blue-400 font-semibold">
                  <span>Load Solution Template</span>
                  <span>→</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Code Editor & Terminal */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-slate-900 rounded-3xl border border-slate-800 shadow-xl overflow-hidden">
            {/* Header */}
            <div className="px-5 py-3 bg-slate-800/90 border-b border-slate-700 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <div className="w-3 h-3 rounded-full bg-amber-500" />
                <div className="w-3 h-3 rounded-full bg-emerald-500" />
                <span className="text-xs font-mono font-bold text-slate-300 ml-2 uppercase">
                  {selectedLang} Live Compiler
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopy}
                  className="p-1.5 text-slate-400 hover:text-slate-200 rounded-lg text-xs flex items-center gap-1 transition-colors"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
                <button
                  onClick={handleRunCode}
                  disabled={isRunning}
                  className="px-4 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-md shadow-emerald-500/20 flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>{isRunning ? "Running..." : "Run Code"}</span>
                </button>
              </div>
            </div>

            {/* Code Input */}
            <div className="p-4 bg-slate-950">
              <textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                rows={16}
                spellCheck={false}
                className="w-full font-mono text-xs text-emerald-400 bg-transparent resize-y focus:outline-none leading-relaxed"
                placeholder="Write your code here..."
              />
            </div>

            {/* Stdin */}
            <div className="px-4 py-3 bg-slate-900 border-t border-slate-800">
              <label className="block text-[11px] font-mono font-bold text-slate-400 uppercase tracking-wider mb-1">
                Standard Input (stdin)
              </label>
              <input
                type="text"
                value={stdin}
                onChange={(e) => setStdin(e.target.value)}
                placeholder="Optional input parameters for scanf() or input()..."
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-slate-200 placeholder-slate-600 focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* Output */}
            <div className="p-4 bg-slate-950 border-t border-slate-800">
              <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 uppercase tracking-wider mb-2">
                <span>Output Console</span>
                {isRunning && <span className="text-cyan-400 animate-pulse">Running on compiler engine...</span>}
              </div>
              <pre className="p-4 rounded-xl bg-black font-mono text-xs text-slate-200 whitespace-pre-wrap min-h-[120px] max-h-[300px] overflow-y-auto leading-relaxed border border-slate-800">
                {output || "Output will appear here after clicking 'Run Code'."}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
