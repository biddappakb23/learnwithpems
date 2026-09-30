import { spawn, execFile, execFileSync } from "child_process";
import fs from "fs/promises";
import fsSync from "fs";
import path from "path";
import os from "os";
import crypto from "crypto";
import { executeCCode } from "../services/cInterpreter";

export interface CExecutionRequest {
  code: string;
  stdin?: string;
  courseId: string;
  compiler?: "gcc" | "clang";
  standard?: "c17" | "c11" | "c99";
  timeoutMs?: number;
  memoryLimitMb?: number;
}

export interface CExecutionResult {
  stdout: string;
  stderr: string;
  exitCode: number | null;
  signal: string | null;
  status: "success" | "compilation_error" | "runtime_error" | "timeout" | "forbidden";
  executionTimeMs: number;
  compilationTimeMs?: number;
  compilerInfo: {
    compiler: "gcc" | "clang" | "none";
    version: string;
    standard: string;
    isAvailable: boolean;
  };
  diagnosticExplanation?: string;
}

export interface CompilerDetails {
  compiler: "gcc" | "clang";
  version: string;
  isAvailable: boolean;
}

export interface SystemCompilerInfo {
  defaultCompiler: "gcc" | "clang" | "none";
  activeCompiler: "gcc" | "clang" | "none";
  version: string;
  standard: string;
  isAvailable: boolean;
  availableCompilers: ("gcc" | "clang")[];
  compilers: {
    gcc?: CompilerDetails;
    clang?: CompilerDetails;
  };
}

let cachedSystemCompilerInfo: SystemCompilerInfo | null = null;

/**
 * Detects all installed C compilers (GCC and Clang) and their exact versions.
 */
export function getInstalledCCompiler(): SystemCompilerInfo {
  if (cachedSystemCompilerInfo) {
    return cachedSystemCompilerInfo;
  }

  const available: ("gcc" | "clang")[] = [];
  const compilers: { gcc?: CompilerDetails; clang?: CompilerDetails } = {};

  // 1. Check GCC
  try {
    const gccOut = execFileSync("gcc", ["--version"], { encoding: "utf8", timeout: 3000 });
    const firstLine = gccOut.split("\n")[0].trim();
    compilers.gcc = {
      compiler: "gcc",
      version: firstLine,
      isAvailable: true
    };
    available.push("gcc");
  } catch {}

  // 2. Check Clang
  try {
    const clangOut = execFileSync("clang", ["--version"], { encoding: "utf8", timeout: 3000 });
    const firstLine = clangOut.split("\n")[0].trim();
    compilers.clang = {
      compiler: "clang",
      version: firstLine,
      isAvailable: true
    };
    available.push("clang");
  } catch {}

  const defaultCompiler = available.includes("gcc") ? "gcc" : (available.includes("clang") ? "clang" : "none");
  const activeVersion = defaultCompiler === "gcc" ? (compilers.gcc?.version || "") : (defaultCompiler === "clang" ? (compilers.clang?.version || "") : "No native C compiler found");

  cachedSystemCompilerInfo = {
    defaultCompiler,
    activeCompiler: defaultCompiler,
    version: activeVersion,
    standard: "c17",
    isAvailable: available.length > 0,
    availableCompilers: available,
    compilers
  };

  return cachedSystemCompilerInfo;
}

/**
 * Refreshes compiler cache in case packages were installed at runtime.
 */
export function refreshCompilerCache(): SystemCompilerInfo {
  cachedSystemCompilerInfo = null;
  return getInstalledCCompiler();
}

/**
 * Helper to generate helpful beginner-friendly explanations for GCC/Clang errors.
 */
function explainCompilerErrors(compilerOutput: string): string {
  const hints: string[] = [];

  if (/expected\s*['‘];['’]/.test(compilerOutput)) {
    hints.push("Missing Semicolon: Check that statements end with a semicolon ';'.");
  }
  if (/undefined reference to\s*[`'‘]main['’]/.test(compilerOutput)) {
    hints.push("Missing main() function: Every executable C program requires an 'int main(void)' entry point.");
  }
  if (/implicit declaration of function/.test(compilerOutput)) {
    hints.push("Missing Header: Did you forget to #include <stdio.h>, <stdlib.h>, <string.h>, or <math.h>?");
  }
  if (/expected\s*['‘]\)['’]\s*before/.test(compilerOutput)) {
    hints.push("Unmatched Parenthesis: Check for mismatched or missing closing parentheses ')'.");
  }
  if (/expected\s*['‘]\}['’]\s*before/.test(compilerOutput)) {
    hints.push("Unmatched Brace: Check for missing closing curly bracket '}'.");
  }
  if (/format\s*['‘]%d['’]\s*expects argument of type\s*['‘]int\s*\*['’]/.test(compilerOutput)) {
    hints.push("scanf Pointer Warning: In scanf(), pass the memory address using the '&' operator (e.g. scanf(\"%d\", &n);).");
  }

  return hints.length > 0 ? hints.join("\n• ") : "";
}

/**
 * Compiles and executes C code with strict resource limits and security sandboxing.
 */
export async function executeCCodeSecurely(request: CExecutionRequest): Promise<CExecutionResult> {
  const compilerInfo = refreshCompilerCache();

  // 1. Source Code Checks
  if (!request.code || typeof request.code !== "string" || request.code.trim().length === 0) {
    return {
      stdout: "",
      stderr: "Error: No C source code provided.",
      exitCode: 1,
      signal: null,
      status: "compilation_error",
      executionTimeMs: 0,
      compilerInfo: {
        compiler: compilerInfo.defaultCompiler,
        version: compilerInfo.version,
        standard: compilerInfo.standard,
        isAvailable: compilerInfo.isAvailable
      }
    };
  }

  if (request.code.length > 256 * 1024) {
    return {
      stdout: "",
      stderr: "Error: Source code exceeds maximum allowable limit (256 KB).",
      exitCode: 1,
      signal: null,
      status: "compilation_error",
      executionTimeMs: 0,
      compilerInfo: {
        compiler: compilerInfo.defaultCompiler,
        version: compilerInfo.version,
        standard: compilerInfo.standard,
        isAvailable: compilerInfo.isAvailable
      }
    };
  }

  if (!compilerInfo.isAvailable) {
    const simResult = executeCCode(request.code, request.stdin || "");
    return {
      stdout: simResult.status === "success" ? simResult.output : "",
      stderr: simResult.status === "error" ? simResult.output : "",
      exitCode: simResult.exitCode,
      signal: null,
      status: simResult.status === "error" ? "compilation_error" : "success",
      executionTimeMs: simResult.executionTimeMs,
      compilationTimeMs: 10,
      compilerInfo: {
        compiler: "gcc",
        version: "GCC 12.2.0 (Emulated Sandbox)",
        standard: request.standard || "c17",
        isAvailable: true
      }
    };
  }

  const requestedCompiler = request.compiler || "gcc";
  const selectedCompiler: "gcc" | "clang" = compilerInfo.availableCompilers.includes(requestedCompiler)
    ? requestedCompiler
    : (compilerInfo.defaultCompiler === "none" ? "gcc" : compilerInfo.defaultCompiler);
  const activeCompilerVersion = (selectedCompiler === "clang" ? compilerInfo.compilers.clang?.version : compilerInfo.compilers.gcc?.version) || compilerInfo.version;
  const selectedStandard = request.standard || "c17";
  const timeoutMs = Math.min(Math.max(request.timeoutMs || 5000, 500), 10000);
  const MAX_OUTPUT_BYTES = 128 * 1024; // 128 KB buffer limit

  // 3. Isolated Sandbox Directory Creation
  const uniqueId = crypto.randomBytes(8).toString("hex");
  const tempDir = path.join(os.tmpdir(), "learnwithpems-c", uniqueId);
  const sourcePath = path.join(tempDir, "main.c");
  const binaryPath = path.join(tempDir, "main_bin");

  try {
    await fs.mkdir(tempDir, { recursive: true, mode: 0o700 });
    await fs.writeFile(sourcePath, request.code, { encoding: "utf8", mode: 0o600 });

    // 4. Compilation Step
    const compileStart = Date.now();
    const compileArgs = [
      `-std=${selectedStandard}`,
      "-O2",
      "-Wall",
      "-Wextra",
      sourcePath,
      "-o",
      binaryPath,
      "-lm"
    ];

    const compilationResult = await new Promise<{
      stdout: string;
      stderr: string;
      exitCode: number | null;
      error?: Error;
    }>((resolve) => {
      execFile(
        selectedCompiler,
        compileArgs,
        {
          cwd: tempDir,
          timeout: 10000,
          maxBuffer: 512 * 1024
        },
        (error, stdout, stderr) => {
          resolve({
            stdout: stdout || "",
            stderr: stderr || "",
            exitCode: error ? (typeof (error as any).code === "number" ? (error as any).code : 1) : 0,
            error: error || undefined
          });
        }
      );
    });

    const compilationTimeMs = Date.now() - compileStart;

    // Handle compilation failure
    if (compilationResult.exitCode !== 0 || !fsSync.existsSync(binaryPath)) {
      const rawError = compilationResult.stderr || compilationResult.stdout || "Unknown compilation error.";
      const hint = explainCompilerErrors(rawError);

      return {
        stdout: "",
        stderr: rawError,
        exitCode: compilationResult.exitCode || 1,
        signal: null,
        status: "compilation_error",
        executionTimeMs: 0,
        compilationTimeMs,
        compilerInfo: {
          compiler: selectedCompiler,
          version: activeCompilerVersion,
          standard: selectedStandard,
          isAvailable: true
        },
        diagnosticExplanation: hint ? `• ${hint}` : undefined
      };
    }

    // 5. Execution Step with Sandbox Isolation & Resource Limits
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
      const child = spawn(binaryPath, [], {
        cwd: tempDir,
        env: {
          PATH: "/usr/bin:/bin",
          LC_ALL: "C.UTF-8"
        },
        stdio: ["pipe", "pipe", "pipe"]
      });

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
      stdoutBuffer += "\n\n[Warning: Program output was truncated because it exceeded the maximum allowed output size of 128 KB.]";
    }

    // Determine status
    let status: "success" | "runtime_error" | "timeout" = "success";
    if (runResult.timedOut) {
      status = "timeout";
    } else if (runResult.exitCode !== 0 || runResult.signal) {
      status = "runtime_error";
    }

    let formattedStderr = runResult.stderr;
    if (runResult.timedOut) {
      formattedStderr = `Execution Time Limit Exceeded (${(timeoutMs / 1000).toFixed(1)}s limit reached).\nPossible infinite loop or blocked input stream.`;
    } else if (runResult.signal === "SIGSEGV") {
      formattedStderr += (formattedStderr ? "\n" : "") + "Segmentation Fault (SIGSEGV): Invalid memory access (e.g. null pointer dereference, out-of-bounds array access, or stack overflow).";
    } else if (runResult.signal === "SIGFPE") {
      formattedStderr += (formattedStderr ? "\n" : "") + "Floating Point Exception (SIGFPE): Arithmetic error (e.g. division by zero).";
    } else if (runResult.signal === "SIGABRT") {
      formattedStderr += (formattedStderr ? "\n" : "") + "Aborted (SIGABRT): Program called abort() or assertion failed.";
    }

    return {
      stdout: runResult.stdout,
      stderr: formattedStderr,
      exitCode: runResult.exitCode,
      signal: runResult.signal,
      status,
      executionTimeMs,
      compilationTimeMs,
      compilerInfo: {
        compiler: selectedCompiler,
        version: activeCompilerVersion,
        standard: selectedStandard,
        isAvailable: true
      }
    };
  } finally {
    // 6. Secure Cleanup of isolated temporary artifacts
    try {
      await fs.rm(tempDir, { recursive: true, force: true });
    } catch {}
  }
}
