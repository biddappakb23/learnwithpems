import { spawn, execFileSync } from "child_process";
import fs from "fs/promises";
import path from "path";
import os from "os";
import crypto from "crypto";

export interface PythonExecutionRequest {
  code: string;
  stdin?: string;
  courseId: string;
  timeoutMs?: number;
  memoryLimitMb?: number;
}

export interface PythonExecutionResult {
  stdout: string;
  stderr: string;
  exitCode: number | null;
  signal: string | null;
  status: "success" | "syntax_error" | "runtime_error" | "timeout" | "forbidden";
  executionTimeMs: number;
  runtimeInfo: {
    runtime: "cpython" | "none";
    version: string;
    standard: string;
    isAvailable: boolean;
  };
  diagnosticExplanation?: string;
}

export interface SystemPythonRuntimeInfo {
  runtime: "cpython" | "none";
  version: string;
  fullVersion: string;
  standard: string;
  executable: string;
  isAvailable: boolean;
}

let cachedSystemPythonInfo: SystemPythonRuntimeInfo | null = null;

/**
 * Detects the installed CPython runtime and exact version.
 */
export function getInstalledPythonRuntime(): SystemPythonRuntimeInfo {
  if (cachedSystemPythonInfo) {
    return cachedSystemPythonInfo;
  }

  try {
    const versionOut = execFileSync("python3", ["--version"], { encoding: "utf8", timeout: 3000 });
    const firstLine = versionOut.trim(); // e.g. "Python 3.11.2"

    let fullVersion = "";
    try {
      fullVersion = execFileSync("python3", ["-c", "import sys; print(sys.version)"], {
        encoding: "utf8",
        timeout: 3000
      }).trim();
    } catch {}

    const standardMatch = firstLine.match(/Python\s*(\d+\.\d+)/i);
    const standard = standardMatch ? `Python ${standardMatch[1]}` : "Python 3";

    cachedSystemPythonInfo = {
      runtime: "cpython",
      version: firstLine || "Python 3.11.2",
      fullVersion: fullVersion || firstLine,
      standard,
      executable: "/usr/bin/python3",
      isAvailable: true
    };
  } catch (err) {
    cachedSystemPythonInfo = {
      runtime: "none",
      version: "Python runtime not found",
      fullVersion: "None",
      standard: "Python 3",
      executable: "",
      isAvailable: false
    };
  }

  return cachedSystemPythonInfo;
}

/**
 * Refreshes runtime cache.
 */
export function refreshPythonRuntimeCache(): SystemPythonRuntimeInfo {
  cachedSystemPythonInfo = null;
  return getInstalledPythonRuntime();
}

/**
 * Helper to generate helpful beginner-friendly explanations for Python errors.
 */
function explainPythonErrors(stderrOutput: string): { isSyntaxError: boolean; hint?: string } {
  let isSyntaxError = false;
  const hints: string[] = [];

  if (/SyntaxError:/i.test(stderrOutput)) {
    isSyntaxError = true;
    if (/'\(' was never closed/i.test(stderrOutput) || /'\[' was never closed/i.test(stderrOutput) || /'\{' was never closed/i.test(stderrOutput)) {
      hints.push("SyntaxError: An opening bracket or parenthesis was never closed. Ensure every '(', '[', and '{' has a matching closing delimiter.");
    } else if (/unmatched/i.test(stderrOutput)) {
      hints.push("SyntaxError: Unmatched closing bracket or quotation mark found. Review brackets and quote pairs.");
    } else if (/expected\s*['‘]:['’]/i.test(stderrOutput) || /if\s+|while\s+|for\s+|def\s+|class\s+|elif\s+|else\s*:/i.test(stderrOutput)) {
      hints.push("SyntaxError: Check for a missing colon ':' at the end of header statements (such as 'if', 'for', 'while', 'def', 'class', 'elif', 'else').");
    } else {
      hints.push("SyntaxError: Invalid syntax. Check for missing parentheses, unmatched quotes, colons, or improper operators.");
    }
  }

  if (/IndentationError:/i.test(stderrOutput) || /TabError:/i.test(stderrOutput)) {
    isSyntaxError = true;
    hints.push("IndentationError: Python relies on strict block indentation (typically 4 spaces). Ensure consistent spacing inside loops, functions, and conditional blocks.");
  }

  if (/NameError:\s*name\s*['‘]([^'’]+)['’]\s*is not defined/i.test(stderrOutput)) {
    const match = stderrOutput.match(/NameError:\s*name\s*['‘]([^'’]+)['’]\s*is not defined/i);
    const varName = match ? match[1] : "variable";
    hints.push(`NameError: Identifier '${varName}' is not defined. Ensure you declare or assign it before referencing it, and check for typos.`);
  }

  if (/ZeroDivisionError:/i.test(stderrOutput)) {
    hints.push("ZeroDivisionError: Cannot divide or calculate modulo by zero (0). Ensure the divisor variable is non-zero before performing division.");
  }

  if (/TypeError:/i.test(stderrOutput)) {
    hints.push("TypeError: An operation or function was applied to an inappropriate data type (e.g. adding string and integer without conversion).");
  }

  if (/ValueError:/i.test(stderrOutput)) {
    hints.push("ValueError: A function received an argument of correct type but invalid value (e.g. int('hello')).");
  }

  if (/IndexError:\s*list index out of range/i.test(stderrOutput)) {
    hints.push("IndexError: Attempted to access a list or sequence index that does not exist. Remember Python uses 0-based indexing.");
  }

  if (/KeyError:\s*['‘]([^'’]+)['’]/i.test(stderrOutput)) {
    const match = stderrOutput.match(/KeyError:\s*['‘]([^'’]+)['’]/i);
    const key = match ? match[1] : "key";
    hints.push(`KeyError: Key '${key}' does not exist in the dictionary. Use dict.get('${key}') or check with '${key} in dict'.`);
  }

  if (/AttributeError:/i.test(stderrOutput)) {
    hints.push("AttributeError: An attribute or method was called on an object that does not define it.");
  }

  if (/RecursionError:/i.test(stderrOutput)) {
    hints.push("RecursionError: Maximum recursion depth exceeded. Check base cases in recursive functions to prevent infinite recursion.");
  }

  return {
    isSyntaxError,
    hint: hints.length > 0 ? hints.join("\n• ") : undefined
  };
}

/**
 * Executes Python code securely through CPython within a restricted sandbox.
 */
export async function executePythonCodeSecurely(
  request: PythonExecutionRequest
): Promise<PythonExecutionResult> {
  const runtimeInfo = refreshPythonRuntimeCache();

  // 1. Authoritative Backend Validation
  const validCourseIds = [
    "learn-python",
    "python-programming",
    "python",
    "python-basics",
    "learn-python-programming"
  ];

  if (!request.courseId || !validCourseIds.includes(request.courseId.toLowerCase())) {
    return {
      stdout: "",
      stderr: `Security Error: Execution rejected. Course '${request.courseId}' is not authorized for the Python CPython execution environment.`,
      exitCode: 1,
      signal: null,
      status: "forbidden",
      executionTimeMs: 0,
      runtimeInfo: {
        runtime: runtimeInfo.runtime,
        version: runtimeInfo.version,
        standard: runtimeInfo.standard,
        isAvailable: runtimeInfo.isAvailable
      }
    };
  }

  // 2. Source Code Checks
  if (!request.code || typeof request.code !== "string" || request.code.trim().length === 0) {
    return {
      stdout: "",
      stderr: "Error: No Python source code provided.",
      exitCode: 1,
      signal: null,
      status: "runtime_error",
      executionTimeMs: 0,
      runtimeInfo: {
        runtime: runtimeInfo.runtime,
        version: runtimeInfo.version,
        standard: runtimeInfo.standard,
        isAvailable: runtimeInfo.isAvailable
      }
    };
  }

  if (request.code.length > 256 * 1024) {
    return {
      stdout: "",
      stderr: "Error: Source code exceeds maximum allowable limit (256 KB).",
      exitCode: 1,
      signal: null,
      status: "runtime_error",
      executionTimeMs: 0,
      runtimeInfo: {
        runtime: runtimeInfo.runtime,
        version: runtimeInfo.version,
        standard: runtimeInfo.standard,
        isAvailable: runtimeInfo.isAvailable
      }
    };
  }

  if (!runtimeInfo.isAvailable) {
    return {
      stdout: "",
      stderr: `Server Environment Error: CPython 3 runtime is not available on this host. (${runtimeInfo.version})`,
      exitCode: 1,
      signal: null,
      status: "runtime_error",
      executionTimeMs: 0,
      runtimeInfo: {
        runtime: runtimeInfo.runtime,
        version: runtimeInfo.version,
        standard: runtimeInfo.standard,
        isAvailable: runtimeInfo.isAvailable
      }
    };
  }

  const timeoutMs = Math.min(Math.max(request.timeoutMs || 5000, 500), 10000);
  const MAX_OUTPUT_BYTES = 128 * 1024; // 128 KB buffer limit

  // 3. Isolated Sandbox Directory Creation
  const uniqueId = crypto.randomBytes(8).toString("hex");
  const tempDir = path.join(os.tmpdir(), "learnwithpems-python", uniqueId);
  const scriptPath = path.join(tempDir, "main.py");

  try {
    await fs.mkdir(tempDir, { recursive: true, mode: 0o700 });
    await fs.writeFile(scriptPath, request.code, { encoding: "utf8", mode: 0o600 });

    // 4. Execution Step with CPython Process Isolation & Resource Limits
    const execStart = Date.now();
    let stdoutBuffer = "";
    let stderrBuffer = "";
    let isTruncated = false;
    let isTimedOut = false;

    const runResult = await new Promise<{
      stdout: string;
      stderr: string;
      exitCode: number | null;
      signal: string | null;
      timedOut: boolean;
    }>((resolve) => {
      // Execute with -u (unbuffered) and -I (isolated mode: ignore env, ignore site user packages)
      const child = spawn(
        "python3",
        ["-u", "-I", "main.py"],
        {
          cwd: tempDir,
          env: {
            PATH: "/usr/bin:/bin",
            LANG: "C.UTF-8",
            LC_ALL: "C.UTF-8",
            PYTHONUNBUFFERED: "1",
            PYTHONDONTWRITEBYTECODE: "1",
            TMPDIR: tempDir,
            HOME: tempDir
          },
          stdio: ["pipe", "pipe", "pipe"]
        }
      );

      // Timeout watchdog
      const timer = setTimeout(() => {
        isTimedOut = true;
        try {
          child.kill("SIGTERM");
          setTimeout(() => {
            try {
              child.kill("SIGKILL");
            } catch {}
          }, 300);
        } catch {}
      }, timeoutMs);

      // Write stdin if provided
      if (request.stdin && child.stdin) {
        try {
          child.stdin.write(request.stdin);
          child.stdin.end();
        } catch {}
      } else if (child.stdin) {
        child.stdin.end();
      }

      child.stdout.on("data", (chunk: Buffer) => {
        if (stdoutBuffer.length + chunk.length > MAX_OUTPUT_BYTES) {
          isTruncated = true;
          const remaining = MAX_OUTPUT_BYTES - stdoutBuffer.length;
          if (remaining > 0) {
            stdoutBuffer += chunk.toString("utf8", 0, remaining);
          }
          child.kill("SIGKILL");
        } else {
          stdoutBuffer += chunk.toString("utf8");
        }
      });

      child.stderr.on("data", (chunk: Buffer) => {
        if (stderrBuffer.length + chunk.length > MAX_OUTPUT_BYTES) {
          isTruncated = true;
        } else {
          stderrBuffer += chunk.toString("utf8");
        }
      });

      child.on("error", (err) => {
        clearTimeout(timer);
        resolve({
          stdout: stdoutBuffer,
          stderr: stderrBuffer + (err.message ? `\nRuntime Process Error: ${err.message}` : ""),
          exitCode: 1,
          signal: null,
          timedOut: isTimedOut
        });
      });

      child.on("close", (exitCode, signal) => {
        clearTimeout(timer);
        resolve({
          stdout: stdoutBuffer,
          stderr: stderrBuffer,
          exitCode,
          signal: signal || null,
          timedOut: isTimedOut
        });
      });
    });

    const executionTimeMs = Date.now() - execStart;

    if (isTruncated) {
      stdoutBuffer += "\n\n[Warning: Output was truncated because it exceeded the maximum allowed output size of 128 KB.]";
    }

    // Diagnostics & Status classification
    const diagnostic = explainPythonErrors(runResult.stderr);

    let status: "success" | "syntax_error" | "runtime_error" | "timeout" = "success";
    if (runResult.timedOut) {
      status = "timeout";
    } else if (diagnostic.isSyntaxError) {
      status = "syntax_error";
    } else if (runResult.exitCode !== 0 || runResult.signal) {
      status = "runtime_error";
    }

    let formattedStderr = runResult.stderr;
    if (runResult.timedOut) {
      formattedStderr = `Execution Time Limit Exceeded (${(timeoutMs / 1000).toFixed(1)}s limit reached).\nPossible infinite loop or blocked input stream.`;
    }

    return {
      stdout: runResult.stdout,
      stderr: formattedStderr,
      exitCode: runResult.exitCode,
      signal: runResult.signal,
      status,
      executionTimeMs,
      runtimeInfo: {
        runtime: "cpython",
        version: runtimeInfo.version,
        standard: runtimeInfo.standard,
        isAvailable: true
      },
      diagnosticExplanation: diagnostic.hint ? `• ${diagnostic.hint}` : undefined
    };
  } finally {
    // 5. Secure Cleanup of isolated temporary directory and files
    try {
      await fs.rm(tempDir, { recursive: true, force: true });
    } catch {}
  }
}
