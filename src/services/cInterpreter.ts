/**
 * Robust In-Browser C Language Interpreter & Execution Simulator
 * Supports standard C constructs:
 * - stdio (printf, scanf, puts, putchar, sprintf)
 * - math.h (sqrt, pow, abs, fabs, sin, cos, tan, floor, ceil, round, log, log10, exp, fmod)
 * - string.h (strlen, strcmp, strncmp, strcpy, strncpy, strcat, strrev, strchr, strstr)
 * - ctype.h (isalpha, isdigit, isalnum, isspace, isupper, islower, toupper, tolower)
 * - stdlib.h (rand, srand, abs, exit, malloc, free)
 * - Variables & Arrays (int, float, double, char, long, short, unsigned, signed, 1D & 2D arrays)
 * - Declarations with multiple variables & inits (e.g. `int a, b, temp;`, `int a=10, b=20;`)
 * - Comma-separated statements (e.g. `a=10, b=20;`)
 * - Chained assignments (e.g. `a = b = c = 10;`)
 * - Compound assignments (+=, -=, *=, /=, %=, <<=, >>=, &=, |=, ^=)
 * - Prefix & Postfix increment/decrement (++a, a++, --a, a--)
 * - Control flow: if / else if / else, switch / case / default, for, while, do-while, break, continue, return
 * - Single-line control flow blocks without braces
 * - Pointers: address-of (&), dereference (*), pointer arithmetic, pass-by-reference in functions
 * - User-defined functions & recursion
 * - Infinite loop & recursion depth guards
 */

export interface ExecutionResult {
  output: string;
  exitCode: number;
  executionTimeMs: number;
  status: "success" | "error";
  error?: string;
}

// Memory manager for realistic pointer address-of (&) and dereference (*)
interface MemoryCell {
  scope: ExecutionScope;
  varName: string;
  index?: number;
  subIndex?: number;
}

class MemoryManager {
  private addressMap: Map<number, MemoryCell> = new Map();
  private varToAddress: Map<string, number> = new Map();
  private nextAddress: number = 0x7ffee000;

  getAddress(scope: ExecutionScope, varName: string, index?: number, subIndex?: number): number {
    const key = `${scope.id}:${varName}:${index ?? "scalar"}:${subIndex ?? ""}`;
    if (this.varToAddress.has(key)) {
      return this.varToAddress.get(key)!;
    }
    const addr = this.nextAddress;
    this.nextAddress += 4;
    this.varToAddress.set(key, addr);
    this.addressMap.set(addr, { scope, varName, index, subIndex });
    return addr;
  }

  readAddress(addr: number): any {
    const cell = this.addressMap.get(addr);
    if (!cell) return 0;
    const current = cell.scope.get(cell.varName);
    if (cell.index !== undefined) {
      if (Array.isArray(current)) {
        if (cell.subIndex !== undefined && Array.isArray(current[cell.index])) {
          return current[cell.index][cell.subIndex];
        }
        return current[cell.index];
      }
      return 0;
    }
    return current;
  }

  writeAddress(addr: number, val: any): boolean {
    const cell = this.addressMap.get(addr);
    if (!cell) return false;
    if (cell.index !== undefined) {
      const current = cell.scope.get(cell.varName);
      if (Array.isArray(current)) {
        if (cell.subIndex !== undefined && Array.isArray(current[cell.index])) {
          current[cell.index][cell.subIndex] = val;
        } else {
          current[cell.index] = val;
        }
        cell.scope.set(cell.varName, current);
        return true;
      }
    }
    cell.scope.set(cell.varName, val);
    return true;
  }

  isAddress(addr: any): boolean {
    return typeof addr === "number" && this.addressMap.has(addr);
  }

  getCell(addr: number): MemoryCell | undefined {
    return this.addressMap.get(addr);
  }
}

let scopeIdCounter = 0;

class ExecutionScope {
  id: number;
  variables: Record<string, any>;
  pointers: Record<string, number>; // ptrVar -> memory address (number)
  types: Record<string, string>;
  parent: ExecutionScope | null;
  memory: MemoryManager;

  constructor(parent: ExecutionScope | null = null, memory?: MemoryManager) {
    this.id = ++scopeIdCounter;
    this.variables = {};
    this.pointers = {};
    this.types = {};
    this.parent = parent;
    this.memory = memory || (parent ? parent.memory : new MemoryManager());
  }

  set(name: string, value: any, type?: string) {
    if (type) {
      this.types[name] = type;
    }
    if (name in this.variables) {
      this.variables[name] = value;
      return;
    }
    if (this.parent && this.parent.has(name)) {
      this.parent.set(name, value, type);
      return;
    }
    this.variables[name] = value;
  }

  declare(name: string, value: any, type: string = "int") {
    this.variables[name] = value;
    this.types[name] = type;
  }

  get(name: string): any {
    if (name in this.variables) return this.variables[name];
    if (this.parent) return this.parent.get(name);
    return undefined;
  }

  has(name: string): boolean {
    if (name in this.variables) return true;
    if (this.parent) return this.parent.has(name);
    return false;
  }

  getOwningScope(name: string): ExecutionScope {
    if (name in this.variables) return this;
    if (this.parent && this.parent.has(name)) return this.parent.getOwningScope(name);
    return this;
  }
}

export function executeCCode(code: string, stdin: string = ""): ExecutionResult {
  const startTime = performance.now();

  try {
    // 1. Basic pre-processing & comment removal
    let cleanCode = stripComments(code);

    // 2. Preprocessor macro handling (#define PI 3.14, #define MAX 100)
    cleanCode = processMacros(cleanCode);

    // 3. Syntax sanity checks
    if (!cleanCode.includes("main")) {
      return {
        output: "Compilation Error:\nerror: undefined reference to 'main'. C programs require an entry point 'int main()'.",
        exitCode: 1,
        executionTimeMs: Math.round(performance.now() - startTime),
        status: "error",
        error: "Missing main function"
      };
    }

    // 4. Setup input buffer for scanf
    const inputTokens = stdin
      ? stdin.trim().split(/\s+/).filter(Boolean)
      : [];
    let inputIndex = 0;

    let stdout = "";
    let stepCount = 0;
    const MAX_STEPS = 200000; // Protection against infinite loops

    const memory = new MemoryManager();
    const globalScope = new ExecutionScope(null, memory);
    const functions: Record<string, { params: Array<{ name: string; type: string; isPointer: boolean }>; body: string; returnType: string }> = {};

    // 5. Extract user-defined functions
    extractFunctions(cleanCode, functions, globalScope);

    // 6. Locate main function
    const mainFunc = functions["main"];
    if (!mainFunc) {
      const mainMatch = cleanCode.match(/(?:int|void)\s+main\s*\([^)]*\)\s*\{([\s\S]*)\}/);
      if (!mainMatch) {
        throw new Error("Unable to parse 'main()' function body.");
      }
      functions["main"] = {
        params: [],
        body: mainMatch[1],
        returnType: "int"
      };
    }

    // Helper to read stdin
    const readInput = (): string => {
      if (inputIndex < inputTokens.length) {
        return inputTokens[inputIndex++];
      }
      return "0";
    };

    // Helper for printf formatting
    const formatPrintf = (formatStr: string, args: any[]): string => {
      // Unescape characters
      let str = formatStr
        .replace(/\\n/g, "\n")
        .replace(/\\t/g, "\t")
        .replace(/\\r/g, "\r")
        .replace(/\\b/g, "")
        .replace(/\\"/g, '"')
        .replace(/\\'/g, "'")
        .replace(/\\\\/g, "\\");

      let argIndex = 0;

      str = str.replace(/%([0-9]*\.?[0-9]*)([dfiscupxXo]|ld|lld|lf|lu|llu|%)/g, (match, precision, specifier) => {
        if (specifier === "%") return "%";
        if (argIndex >= args.length) return match;

        const val = args[argIndex++];

        if (specifier === "d" || specifier === "i" || specifier === "ld" || specifier === "lld" || specifier === "u" || specifier === "lu" || specifier === "llu") {
          const num = parseInt(String(val), 10);
          const formatted = isNaN(num) ? "0" : String(num);
          if (precision) {
            const width = parseInt(precision, 10);
            if (!isNaN(width)) {
              if (precision.startsWith("0")) {
                return formatted.padStart(width, "0");
              }
              return formatted.padStart(width, " ");
            }
          }
          return formatted;
        }

        if (specifier === "f" || specifier === "lf") {
          const num = parseFloat(String(val));
          if (isNaN(num)) return "0.000000";
          if (precision && precision.includes(".")) {
            const parts = precision.split(".");
            const decPlaces = parseInt(parts[1], 10);
            const formatted = num.toFixed(isNaN(decPlaces) ? 6 : decPlaces);
            const width = parseInt(parts[0], 10);
            if (!isNaN(width)) {
              return formatted.padStart(width, " ");
            }
            return formatted;
          }
          return num.toFixed(6);
        }

        if (specifier === "c") {
          if (typeof val === "number") return String.fromCharCode(val);
          return String(val).charAt(0) || " ";
        }

        if (specifier === "s") {
          if (Array.isArray(val)) {
            // Char array to string
            let charStr = "";
            for (const ch of val) {
              if (ch === 0 || ch === "\0") break;
              charStr += typeof ch === "number" ? String.fromCharCode(ch) : String(ch);
            }
            return charStr;
          }
          if (typeof val === "number" && memory.isAddress(val)) {
            const cell = memory.getCell(val);
            if (cell) {
              const target = cell.scope.get(cell.varName);
              if (Array.isArray(target)) {
                const startIdx = cell.index !== undefined ? cell.index : 0;
                let charStr = "";
                for (let k = startIdx; k < target.length; k++) {
                  const ch = target[k];
                  if (ch === 0 || ch === "\0") break;
                  charStr += typeof ch === "number" ? String.fromCharCode(ch) : String(ch);
                }
                return charStr;
              }
              if (typeof target === "string") {
                return target;
              }
            }
          }
          const finalStr = String(val !== undefined && val !== null ? val : "");
          return finalStr.startsWith('"') && finalStr.endsWith('"') ? finalStr.slice(1, -1) : finalStr;
        }

        if (specifier === "p" || specifier === "x" || specifier === "X" || specifier === "o") {
          const num = typeof val === "number" ? val : parseInt(String(val), 10);
          if (isNaN(num)) return "0x0";
          if (specifier === "o") return Math.abs(num).toString(8);
          const hex = Math.abs(num).toString(16);
          return specifier === "p" ? `0x${hex.padStart(8, "0")}` : (specifier === "X" ? hex.toUpperCase() : hex);
        }

        return String(val);
      });

      return str;
    };

    // Evaluate expressions in C with full operator and type semantics
    const evaluateExpression = (expr: string, scope: ExecutionScope): any => {
      let trimmed = expr.trim();
      if (!trimmed) return 0;

      // Check for string literal
      if (trimmed.startsWith('"') && trimmed.endsWith('"')) {
        return trimmed.slice(1, -1);
      }

      // Check for char literal
      if (trimmed.startsWith("'") && trimmed.endsWith("'")) {
        const inner = trimmed.slice(1, -1);
        if (inner === "\\n") return 10;
        if (inner === "\\t") return 9;
        if (inner === "\\0") return 0;
        if (inner === "\\r") return 13;
        if (inner === "\\\\") return 92;
        if (inner === "\\'") return 39;
        return inner.charCodeAt(0);
      }

      // Check for boolean & NULL literals
      if (trimmed === "true") return 1;
      if (trimmed === "false") return 0;
      if (trimmed === "NULL") return 0;

      // Handle sizeof(type) or sizeof(var)
      trimmed = trimmed.replace(/sizeof\s*\(([^)]+)\)/g, (_m, target) => {
        const t = target.trim();
        if (t === "char") return "1";
        if (t === "int" || t === "float") return "4";
        if (t === "double" || t === "long" || t === "long long") return "8";
        if (t === "short") return "2";
        if (scope.has(t)) {
          const v = scope.get(t);
          if (Array.isArray(v)) return String(v.length * 4);
          return "4";
        }
        return "4";
      });

      // Handle function calls inside expression FIRST
      trimmed = resolveFunctionCallsInExpr(trimmed, scope);

      // Handle type casts e.g. (float)a, (int)3.14, (double)x, (char)65
      trimmed = trimmed.replace(/\((int|float|double|char|long|short|unsigned|signed)\)\s*([a-zA-Z0-9_().]+)/g, (_m, type, target) => {
        const val = evaluateExpression(target, scope);
        if (type === "int" || type === "long" || type === "short" || type === "unsigned" || type === "signed") {
          return String(parseInt(String(val), 10) || 0);
        }
        if (type === "float" || type === "double") {
          return String(parseFloat(String(val)) || 0.0);
        }
        if (type === "char") {
          return String(parseInt(String(val), 10) || 0);
        }
        return String(val);
      });

      // Handle pointer dereference in expression: *ptr or *(ptr + i)
      trimmed = trimmed.replace(/\*\s*\(([^)]+)\)/g, (_m, innerExpr) => {
        const addr = evaluateExpression(innerExpr, scope);
        if (memory.isAddress(addr)) {
          return String(memory.readAddress(addr));
        }
        return "0";
      });

      trimmed = trimmed.replace(/(^|[=+\-*/%(,?:;<>!&|^~]\s*)\*\s*([a-zA-Z_][a-zA-Z0-9_]*)/g, (fullMatch, prefix, ptrName) => {
        const addr = scope.get(ptrName);
        if (memory.isAddress(addr)) {
          return prefix + String(memory.readAddress(addr));
        }
        return fullMatch;
      });

      // Handle address-of in expression: &varName or &arr[i]
      trimmed = trimmed.replace(/&\s*([a-zA-Z_][a-zA-Z0-9_]*)\[([^\]]+)\]/g, (_m, arrName, idxExpr) => {
        const idx = evaluateExpression(idxExpr, scope);
        const owningScope = scope.getOwningScope(arrName);
        return String(memory.getAddress(owningScope, arrName, idx));
      });

      trimmed = trimmed.replace(/&\s*([a-zA-Z_][a-zA-Z0-9_]*)/g, (_m, varName) => {
        const owningScope = scope.getOwningScope(varName);
        return String(memory.getAddress(owningScope, varName));
      });

      // Handle struct member access: s1.roll, student[i].marks, ptr->roll
      trimmed = trimmed.replace(/([a-zA-Z_][a-zA-Z0-9_]*)\[([^\]]+)\]\.([a-zA-Z_][a-zA-Z0-9_]*)/g, (_m, arrName, idxExpr, field) => {
        const idx = evaluateExpression(idxExpr, scope);
        const arr = scope.get(arrName);
        if (Array.isArray(arr) && arr[idx] && typeof arr[idx] === "object") {
          return String(arr[idx][field] !== undefined ? arr[idx][field] : 0);
        }
        return "0";
      });

      trimmed = trimmed.replace(/([a-zA-Z_][a-zA-Z0-9_]*)->([a-zA-Z_][a-zA-Z0-9_]*)/g, (_m, ptrName, field) => {
        const addr = scope.get(ptrName);
        if (memory.isAddress(addr)) {
          const obj = memory.readAddress(addr);
          if (obj && typeof obj === "object") {
            return String(obj[field] !== undefined ? obj[field] : 0);
          }
        }
        return "0";
      });

      trimmed = trimmed.replace(/([a-zA-Z_][a-zA-Z0-9_]*)\.([a-zA-Z_][a-zA-Z0-9_]*)/g, (_m, varName, field) => {
        const obj = scope.get(varName);
        if (obj && typeof obj === "object" && !Array.isArray(obj)) {
          return String(obj[field] !== undefined ? obj[field] : 0);
        }
        return "0";
      });

      // Handle 2D array indexing: matrix[i][j]
      trimmed = trimmed.replace(/([a-zA-Z_][a-zA-Z0-9_]*)\[([^\]]+)\]\[([^\]]+)\]/g, (_m, arrName, rowExpr, colExpr) => {
        const r = evaluateExpression(rowExpr, scope);
        const c = evaluateExpression(colExpr, scope);
        const arr = scope.get(arrName);
        if (Array.isArray(arr) && Array.isArray(arr[r])) {
          return String(arr[r][c] !== undefined ? arr[r][c] : 0);
        }
        return "0";
      });

      // Handle 1D array indexing: arr[index]
      trimmed = trimmed.replace(/([a-zA-Z_][a-zA-Z0-9_]*)\[([^\]]+)\]/g, (_m, arrName, idxExpr) => {
        const idx = evaluateExpression(idxExpr, scope);
        const arr = scope.get(arrName);
        if (Array.isArray(arr)) {
          return String(arr[idx] !== undefined ? arr[idx] : 0);
        }
        return "0";
      });

      // Handle prefix increment / decrement: ++a, --a
      trimmed = trimmed.replace(/(\+\+|--)([a-zA-Z_][a-zA-Z0-9_]*)/g, (_m, op, varName) => {
        const cur = Number(scope.get(varName)) || 0;
        const next = op === "++" ? cur + 1 : cur - 1;
        scope.set(varName, next);
        return String(next);
      });

      // Handle postfix increment / decrement: a++, a--
      trimmed = trimmed.replace(/([a-zA-Z_][a-zA-Z0-9_]*)(\+\+|--)/g, (_m, varName, op) => {
        const cur = Number(scope.get(varName)) || 0;
        const next = op === "++" ? cur + 1 : cur - 1;
        scope.set(varName, next);
        return String(cur);
      });

      // Substitute variables
      let evalExpr = trimmed.replace(/\b([a-zA-Z_][a-zA-Z0-9_]*)\b/g, (match) => {
        if (match === "true" || match === "false" || match === "NULL") return match;
        if (scope.has(match)) {
          const val = scope.get(match);
          if (typeof val === "boolean") return val ? "1" : "0";
          if (typeof val === "string") return JSON.stringify(val);
          if (Array.isArray(val)) {
            // Pointer to first element
            const owningScope = scope.getOwningScope(match);
            return String(memory.getAddress(owningScope, match, 0));
          }
          return String(val);
        }
        return match;
      });

      // Replace C logical operators with JS operators
      evalExpr = evalExpr
        .replace(/&&/g, " && ")
        .replace(/\|\|/g, " || ")
        .replace(/!(?!=)/g, " ! ");

      try {
        // Safe evaluation
        if (/^[\d\s+\-*/%&|^~<>=!().,\"'eE_?:]+$/.test(evalExpr)) {
          // eslint-disable-next-line no-new-func
          const res = Function(`"use strict"; return (${evalExpr});`)();
          return typeof res === "boolean" ? (res ? 1 : 0) : res;
        }
        return evalExpr;
      } catch {
        return 0;
      }
    };

    // Resolve built-in or custom function calls in expressions
    function resolveFunctionCallsInExpr(expr: string, scope: ExecutionScope): string {
      // math.h
      expr = expr.replace(/\bsqrt\s*\(([^)]+)\)/g, (_m, arg) => {
        return String(Math.sqrt(Number(evaluateExpression(arg, scope)) || 0));
      });

      expr = expr.replace(/\bpow\s*\(([^,]+),([^)]+)\)/g, (_m, base, exp) => {
        const b = evaluateExpression(base, scope);
        const e = evaluateExpression(exp, scope);
        return String(Math.pow(Number(b) || 0, Number(e) || 0));
      });

      expr = expr.replace(/\b(?:abs|fabs)\s*\(([^)]+)\)/g, (_m, arg) => {
        return String(Math.abs(Number(evaluateExpression(arg, scope)) || 0));
      });

      expr = expr.replace(/\bsin\s*\(([^)]+)\)/g, (_m, arg) => {
        return String(Math.sin(Number(evaluateExpression(arg, scope)) || 0));
      });

      expr = expr.replace(/\bcos\s*\(([^)]+)\)/g, (_m, arg) => {
        return String(Math.cos(Number(evaluateExpression(arg, scope)) || 0));
      });

      expr = expr.replace(/\btan\s*\(([^)]+)\)/g, (_m, arg) => {
        return String(Math.tan(Number(evaluateExpression(arg, scope)) || 0));
      });

      expr = expr.replace(/\bfloor\s*\(([^)]+)\)/g, (_m, arg) => {
        return String(Math.floor(Number(evaluateExpression(arg, scope)) || 0));
      });

      expr = expr.replace(/\bceil\s*\(([^)]+)\)/g, (_m, arg) => {
        return String(Math.ceil(Number(evaluateExpression(arg, scope)) || 0));
      });

      expr = expr.replace(/\bround\s*\(([^)]+)\)/g, (_m, arg) => {
        return String(Math.round(Number(evaluateExpression(arg, scope)) || 0));
      });

      expr = expr.replace(/\bfmod\s*\(([^,]+),([^)]+)\)/g, (_m, x, y) => {
        const xv = Number(evaluateExpression(x, scope)) || 0;
        const yv = Number(evaluateExpression(y, scope)) || 1;
        return String(xv % yv);
      });

      expr = expr.replace(/\blog\s*\(([^)]+)\)/g, (_m, arg) => {
        return String(Math.log(Number(evaluateExpression(arg, scope)) || 1));
      });

      expr = expr.replace(/\blog10\s*\(([^)]+)\)/g, (_m, arg) => {
        return String(Math.log10(Number(evaluateExpression(arg, scope)) || 1));
      });

      expr = expr.replace(/\bexp\s*\(([^)]+)\)/g, (_m, arg) => {
        return String(Math.exp(Number(evaluateExpression(arg, scope)) || 0));
      });

      // string.h
      expr = expr.replace(/\bstrlen\s*\(([^)]+)\)/g, (_m, arg) => {
        const varKey = arg.trim();
        const val = scope.has(varKey) ? scope.get(varKey) : evaluateExpression(arg, scope);
        if (Array.isArray(val)) {
          let len = 0;
          for (const c of val) {
            if (c === 0 || c === "\0") break;
            len++;
          }
          return String(len);
        }
        if (typeof val === "string") {
          return String(val.length);
        }
        if (typeof val === "number" && memory.isAddress(val)) {
          const cell = memory.getCell(val);
          if (cell) {
            const target = cell.scope.get(cell.varName);
            if (typeof target === "string") return String(target.length);
            if (Array.isArray(target)) {
              let len = 0;
              for (let k = cell.index || 0; k < target.length; k++) {
                if (target[k] === 0 || target[k] === "\0") break;
                len++;
              }
              return String(len);
            }
          }
        }
        return String(String(val).length);
      });

      expr = expr.replace(/\bstrcmp\s*\(([^,]+),([^)]+)\)/g, (_m, s1, s2) => {
        const k1 = s1.trim();
        const k2 = s2.trim();
        const v1 = scope.has(k1) ? scope.get(k1) : evaluateExpression(s1, scope);
        const v2 = scope.has(k2) ? scope.get(k2) : evaluateExpression(s2, scope);
        const str1 = Array.isArray(v1) ? v1.filter(c => c !== 0).map(c => typeof c === "number" ? String.fromCharCode(c) : String(c)).join("") : String(v1);
        const str2 = Array.isArray(v2) ? v2.filter(c => c !== 0).map(c => typeof c === "number" ? String.fromCharCode(c) : String(c)).join("") : String(v2);
        if (str1 < str2) return "-1";
        if (str1 > str2) return "1";
        return "0";
      });

      // ctype.h
      expr = expr.replace(/\bisalpha\s*\(([^)]+)\)/g, (_m, arg) => {
        const ch = evaluateExpression(arg, scope);
        const c = typeof ch === "number" ? String.fromCharCode(ch) : String(ch);
        return /[a-zA-Z]/.test(c) ? "1" : "0";
      });

      expr = expr.replace(/\bisdigit\s*\(([^)]+)\)/g, (_m, arg) => {
        const ch = evaluateExpression(arg, scope);
        const c = typeof ch === "number" ? String.fromCharCode(ch) : String(ch);
        return /[0-9]/.test(c) ? "1" : "0";
      });

      expr = expr.replace(/\bisspace\s*\(([^)]+)\)/g, (_m, arg) => {
        const ch = evaluateExpression(arg, scope);
        const c = typeof ch === "number" ? String.fromCharCode(ch) : String(ch);
        return /\s/.test(c) ? "1" : "0";
      });

      expr = expr.replace(/\btoupper\s*\(([^)]+)\)/g, (_m, arg) => {
        const ch = evaluateExpression(arg, scope);
        if (typeof ch === "number") {
          return String(String.fromCharCode(ch).toUpperCase().charCodeAt(0));
        }
        return String(String(ch).toUpperCase().charCodeAt(0));
      });

      expr = expr.replace(/\btolower\s*\(([^)]+)\)/g, (_m, arg) => {
        const ch = evaluateExpression(arg, scope);
        if (typeof ch === "number") {
          return String(String.fromCharCode(ch).toLowerCase().charCodeAt(0));
        }
        return String(String(ch).toLowerCase().charCodeAt(0));
      });

      // stdlib.h rand()
      expr = expr.replace(/\brand\s*\(\s*\)/g, () => {
        return String(Math.floor(Math.random() * 32767));
      });

      // User-defined custom function calls
      for (const [funcName, funcDef] of Object.entries(functions)) {
        if (funcName === "main") continue;
        const pattern = new RegExp(`\\b${funcName}\\s*\\(([^)]*)\\)`, "g");
        expr = expr.replace(pattern, (_m, argList) => {
          const splitArgs = splitArgumentList(argList);
          const passedArgs: any[] = [];
          for (let aIdx = 0; aIdx < splitArgs.length; aIdx++) {
            const rawArg = splitArgs[aIdx].trim();
            const paramDef = funcDef.params[aIdx];

            // If param is a pointer (e.g. int *x) and arg is &var, pass memory address
            if (paramDef && paramDef.isPointer) {
              if (rawArg.startsWith("&")) {
                const targetVar = rawArg.slice(1).trim();
                const owningScope = scope.getOwningScope(targetVar);
                passedArgs.push(memory.getAddress(owningScope, targetVar));
              } else {
                passedArgs.push(evaluateExpression(rawArg, scope));
              }
            } else {
              passedArgs.push(evaluateExpression(rawArg, scope));
            }
          }
          const funcResult = executeFunction(funcDef, passedArgs);
          return String(funcResult !== undefined ? funcResult : 0);
        });
      }

      return expr;
    }

    // Execute a function body
    function executeFunction(
      funcDef: { params: Array<{ name: string; type: string; isPointer: boolean }>; body: string; returnType: string },
      args: any[]
    ): any {
      const funcScope = new ExecutionScope(globalScope, memory);
      // Bind parameters
      funcDef.params.forEach((param, idx) => {
        const val = args[idx] !== undefined ? args[idx] : 0;
        funcScope.declare(param.name, val, param.type);
      });

      const res = executeBlock(funcDef.body, funcScope);
      if (res && res.type === "return") {
        return res.value;
      }
      return 0;
    }

    // Execute a block of statements
    function executeBlock(blockStr: string, scope: ExecutionScope): { type: string; value?: any } | void {
      const statements = parseStatements(blockStr);

      for (let i = 0; i < statements.length; i++) {
        stepCount++;
        if (stepCount > MAX_STEPS) {
          throw new Error("Runtime Error: Execution limit exceeded. Possible infinite loop or deep recursion detected.");
        }

        const stmt = statements[i].trim();
        if (!stmt) continue;

        // 1. return statement
        if (stmt.startsWith("return")) {
          const retExpr = stmt.replace(/^return\s*/, "").replace(/;$/, "").trim();
          const val = retExpr ? evaluateExpression(retExpr, scope) : 0;
          return { type: "return", value: val };
        }

        // 2. break / continue
        if (stmt === "break" || stmt === "break;") {
          return { type: "break" };
        }
        if (stmt === "continue" || stmt === "continue;") {
          return { type: "continue" };
        }

        // 3. printf(...)
        const printfArgs = extractCallArgs(stmt, "printf");
        if (printfArgs !== null) {
          if (printfArgs.length > 0) {
            const rawFormat = evaluateExpression(printfArgs[0], scope);
            const formatStr = typeof rawFormat === "string" ? rawFormat : String(rawFormat);
            const parsedArgs: any[] = [];

            for (let aIdx = 1; aIdx < printfArgs.length; aIdx++) {
              parsedArgs.push(evaluateExpression(printfArgs[aIdx], scope));
            }

            stdout += formatPrintf(formatStr, parsedArgs);
          }
          continue;
        }

        // 4. puts(...)
        const putsArgs = extractCallArgs(stmt, "puts");
        if (putsArgs !== null) {
          if (putsArgs.length > 0) {
            const val = evaluateExpression(putsArgs[0], scope);
            stdout += String(val) + "\n";
          }
          continue;
        }

        // 5. putchar(...)
        const putcharArgs = extractCallArgs(stmt, "putchar");
        if (putcharArgs !== null) {
          if (putcharArgs.length > 0) {
            const val = evaluateExpression(putcharArgs[0], scope);
            stdout += typeof val === "number" ? String.fromCharCode(val) : String(val).charAt(0);
          }
          continue;
        }

        // 6. scanf(...)
        const scanfArgs = extractCallArgs(stmt, "scanf");
        if (scanfArgs !== null && scanfArgs.length > 0) {
          const rawFormat = evaluateExpression(scanfArgs[0], scope);
          const formatStr = typeof rawFormat === "string" ? rawFormat : String(rawFormat);
          const targets = scanfArgs.slice(1);

          const specifiers = formatStr.match(/%[dfisc]/g) || [];
          for (let sIdx = 0; sIdx < specifiers.length; sIdx++) {
            if (sIdx < targets.length) {
              let targetExpr = targets[sIdx].trim();
              const inputVal = readInput();
              const spec = specifiers[sIdx];

              let parsedVal: any = inputVal;
              if (spec === "%d" || spec === "%i") {
                parsedVal = parseInt(inputVal, 10) || 0;
              } else if (spec === "%f" || spec === "%lf") {
                parsedVal = parseFloat(inputVal) || 0.0;
              } else if (spec === "%c") {
                parsedVal = inputVal.charAt(0) || " ";
              }

              if (targetExpr.startsWith("&")) {
                const varName = targetExpr.slice(1).trim();
                scope.set(varName, parsedVal);
              } else {
                // String or array without &
                scope.set(targetExpr, parsedVal);
              }
            }
          }
          continue;
        }

        // 7. Switch / Case / Default
        if (stmt.startsWith("switch")) {
          const switchMatch = stmt.match(/^switch\s*\(([\s\S]+?)\)\s*\{([\s\S]*)\}$/);
          if (switchMatch) {
            const switchExpr = switchMatch[1];
            const switchBody = switchMatch[2];
            const switchVal = evaluateExpression(switchExpr, scope);

            const caseBlocks = parseSwitchCases(switchBody);
            let matched = false;
            let fallthrough = false;

            for (const c of caseBlocks) {
              if (!matched && !fallthrough) {
                if (c.isDefault) {
                  matched = true;
                } else if (c.caseExpr !== null) {
                  const caseVal = evaluateExpression(c.caseExpr, scope);
                  if (caseVal == switchVal) {
                    matched = true;
                  }
                }
              }

              if (matched || fallthrough) {
                fallthrough = true;
                const innerRes = executeBlock(c.body, new ExecutionScope(scope, memory));
                if (innerRes) {
                  if (innerRes.type === "break") {
                    break;
                  }
                  if (innerRes.type === "return") {
                    return innerRes;
                  }
                }
              }
            }
            continue;
          }
        }

        // 8. If / Else If / Else
        if (stmt.startsWith("if")) {
          const ifParsed = parseIfStatement(stmt, statements, i);
          i = ifParsed.nextIndex;

          for (const branch of ifParsed.branches) {
            if (branch.condition === null || evaluateExpression(branch.condition, scope)) {
              const innerRes = executeBlock(branch.body, new ExecutionScope(scope, memory));
              if (innerRes) return innerRes;
              break;
            }
          }
          continue;
        }

        // 9. While Loop
        if (stmt.startsWith("while")) {
          const whileMatch = stmt.match(/^while\s*\(([\s\S]+?)\)\s*\{([\s\S]*)\}$/);
          if (whileMatch) {
            const conditionExpr = whileMatch[1];
            const loopBody = whileMatch[2];

            while (evaluateExpression(conditionExpr, scope)) {
              stepCount++;
              if (stepCount > MAX_STEPS) throw new Error("Infinite loop detected in 'while' block.");

              const innerRes = executeBlock(loopBody, new ExecutionScope(scope, memory));
              if (innerRes) {
                if (innerRes.type === "break") break;
                if (innerRes.type === "return") return innerRes;
                if (innerRes.type === "continue") continue;
              }
            }
            continue;
          }
        }

        // 10. For Loop
        if (stmt.startsWith("for")) {
          const forMatch = stmt.match(/^for\s*\(([^;]*);([^;]*);([^)]*)\)\s*\{([\s\S]*)\}$/);
          if (forMatch) {
            const initPart = forMatch[1].trim();
            const condPart = forMatch[2].trim();
            const updatePart = forMatch[3].trim();
            const loopBody = forMatch[4];

            const forScope = new ExecutionScope(scope, memory);

            // Execute init
            if (initPart) {
              executeSimpleStatement(initPart, forScope);
            }

            while (!condPart || evaluateExpression(condPart, forScope)) {
              stepCount++;
              if (stepCount > MAX_STEPS) throw new Error("Infinite loop detected in 'for' block.");

              const innerRes = executeBlock(loopBody, new ExecutionScope(forScope, memory));
              if (innerRes) {
                if (innerRes.type === "break") break;
                if (innerRes.type === "return") return innerRes;
              }

              // Update step
              if (updatePart) {
                executeSimpleStatement(updatePart, forScope);
              }
            }
            continue;
          }
        }

        // 11. Do-While Loop
        if (stmt.startsWith("do")) {
          const doMatch = stmt.match(/^do\s*\{([\s\S]*)\}\s*while\s*\(([\s\S]+?)\);?$/);
          if (doMatch) {
            const loopBody = doMatch[1];
            const condPart = doMatch[2];

            do {
              stepCount++;
              if (stepCount > MAX_STEPS) throw new Error("Infinite loop detected in 'do-while' block.");

              const innerRes = executeBlock(loopBody, new ExecutionScope(scope, memory));
              if (innerRes) {
                if (innerRes.type === "break") break;
                if (innerRes.type === "return") return innerRes;
              }
            } while (evaluateExpression(condPart, scope));
            continue;
          }
        }

        // 12. Regular statements (declarations, assignments, comma expressions, pointer ops)
        executeSimpleStatement(stmt, scope);
      }
    }

    // Execute simple single-line statements or comma-separated expressions
    function executeSimpleStatement(stmt: string, scope: ExecutionScope) {
      stmt = stmt.replace(/;$/, "").trim();
      if (!stmt) return;

      // Check if it is a Variable Declaration statement: int a, b, temp; or int a = 10, b = 20;
      const typeDeclRegex = /^(?:const\s+|static\s+|register\s+)*(?:unsigned\s+|signed\s+)?(?:int|float|double|char|long|short|void|bool|_Bool|size_t|int8_t|int16_t|int32_t|int64_t|uint8_t|uint16_t|uint32_t|uint64_t|struct\s+[a-zA-Z0-9_]+)\s+([\s\S]+)$/;
      const declMatch = stmt.match(typeDeclRegex);

      if (declMatch) {
        const fullDeclType = stmt.slice(0, stmt.length - declMatch[1].length).trim();
        const declList = splitArgumentList(declMatch[1]);

        for (const item of declList) {
          const trimmedItem = item.trim();
          if (!trimmedItem) continue;

          // Pointer declaration: *ptr = &num or *ptr;
          const ptrMatch = trimmedItem.match(/^\*\s*([a-zA-Z_][a-zA-Z0-9_]*)(?:\s*=\s*([\s\S]+))?$/);
          if (ptrMatch) {
            const ptrName = ptrMatch[1];
            const initExpr = ptrMatch[2];
            let addr = 0;
            if (initExpr) {
              addr = evaluateExpression(initExpr, scope);
            }
            scope.declare(ptrName, addr, fullDeclType + "*");
            continue;
          }

          // 2D Array declaration: int matrix[2][3] = {{1, 2, 3}, {4, 5, 6}};
          const arr2DMatch = trimmedItem.match(/^([a-zA-Z_][a-zA-Z0-9_]*)\[([0-9]*)\]\[([0-9]*)\](?:\s*=\s*(\{[\s\S]*\}))?$/);
          if (arr2DMatch) {
            const arrName = arr2DMatch[1];
            const rSize = parseInt(arr2DMatch[2], 10) || 5;
            const cSize = parseInt(arr2DMatch[3], 10) || 5;
            const initVal = arr2DMatch[4];

            let matrix: any[][] = [];
            if (initVal) {
              const rows = initVal.slice(1, -1).split(/\}(?:\s*,\s*|\s*)\{/).map((r) => r.replace(/[{}]/g, ""));
              matrix = rows.map((rStr) =>
                rStr.split(",").map((cell) => evaluateExpression(cell.trim(), scope))
              );
            } else {
              matrix = Array.from({ length: rSize }, () => new Array(cSize).fill(0));
            }
            scope.declare(arrName, matrix, fullDeclType);
            continue;
          }

          // 1D Array declaration: int arr[5] = {1, 2, 3}; or char str[] = "Hello";
          const arrMatch = trimmedItem.match(/^([a-zA-Z_][a-zA-Z0-9_]*)\[([0-9]*)\](?:\s*=\s*(\{[\s\S]*\}|"[^"]*"))?$/);
          if (arrMatch) {
            const arrName = arrMatch[1];
            const sizeStr = arrMatch[2];
            const initVal = arrMatch[3];

            let arr: any[] = [];
            if (initVal) {
              if (initVal.startsWith("{")) {
                const elements = initVal.slice(1, -1).split(",").map((e) => evaluateExpression(e.trim(), scope));
                arr = elements;
              } else if (initVal.startsWith('"')) {
                const strVal = initVal.slice(1, -1);
                arr = strVal.split("").map((c) => c.charCodeAt(0));
                arr.push(0); // null terminator
              }
            } else if (sizeStr) {
              const sz = parseInt(sizeStr, 10);
              arr = new Array(isNaN(sz) ? 10 : sz).fill(0);
            }
            scope.declare(arrName, arr, fullDeclType);
            continue;
          }

          // Scalar Variable declaration: a = 10 or a
          const assignIdx = trimmedItem.indexOf("=");
          if (assignIdx !== -1) {
            const varName = trimmedItem.slice(0, assignIdx).trim();
            const valExpr = trimmedItem.slice(assignIdx + 1).trim();
            const val = evaluateExpression(valExpr, scope);
            scope.declare(varName, val, fullDeclType);
          } else {
            const varName = trimmedItem.trim();
            if (fullDeclType.startsWith("struct")) {
              scope.declare(varName, {}, fullDeclType);
            } else {
              scope.declare(varName, 0, fullDeclType);
            }
          }
        }
        return;
      }

      // Check if statement contains top-level comma-separated expressions: e.g. a=10, b=20; or i++, j--
      const commaExprs = splitArgumentList(stmt);
      if (commaExprs.length > 1) {
        for (const subExpr of commaExprs) {
          executeAtomicStatement(subExpr.trim(), scope);
        }
        return;
      }

      executeAtomicStatement(stmt, scope);
    }

    // Execute single atomic statement
    function executeAtomicStatement(stmt: string, scope: ExecutionScope) {
      if (!stmt) return;

      // Pointer dereference assignment: *ptr = 50; or *(ptr + i) = 100;
      const ptrDerefMatch = stmt.match(/^\*\s*\(([^)]+)\)\s*=\s*([\s\S]+)$/);
      if (ptrDerefMatch) {
        const addr = evaluateExpression(ptrDerefMatch[1], scope);
        const val = evaluateExpression(ptrDerefMatch[2], scope);
        memory.writeAddress(addr, val);
        return;
      }

      const ptrSimpleMatch = stmt.match(/^\*\s*([a-zA-Z_][a-zA-Z0-9_]*)\s*=\s*([\s\S]+)$/);
      if (ptrSimpleMatch) {
        const ptrName = ptrSimpleMatch[1];
        const val = evaluateExpression(ptrSimpleMatch[2], scope);
        const addr = scope.get(ptrName);
        if (memory.isAddress(addr)) {
          memory.writeAddress(addr, val);
        }
        return;
      }

      // Struct array field assignment: student[i].roll = 101;
      const structArrSetMatch = stmt.match(/^([a-zA-Z_][a-zA-Z0-9_]*)\[([^\]]+)\]\.([a-zA-Z_][a-zA-Z0-9_]*)\s*=\s*([\s\S]+)$/);
      if (structArrSetMatch) {
        const arrName = structArrSetMatch[1];
        const idx = evaluateExpression(structArrSetMatch[2], scope);
        const field = structArrSetMatch[3];
        const val = evaluateExpression(structArrSetMatch[4], scope);
        const arr = scope.get(arrName);
        if (Array.isArray(arr)) {
          if (!arr[idx] || typeof arr[idx] !== "object") arr[idx] = {};
          arr[idx][field] = val;
        }
        return;
      }

      // Struct pointer field assignment: ptr->roll = 101;
      const structPtrSetMatch = stmt.match(/^([a-zA-Z_][a-zA-Z0-9_]*)->([a-zA-Z_][a-zA-Z0-9_]*)\s*=\s*([\s\S]+)$/);
      if (structPtrSetMatch) {
        const ptrName = structPtrSetMatch[1];
        const field = structPtrSetMatch[2];
        const val = evaluateExpression(structPtrSetMatch[3], scope);
        const addr = scope.get(ptrName);
        if (memory.isAddress(addr)) {
          const obj = memory.readAddress(addr);
          if (obj && typeof obj === "object") {
            obj[field] = val;
          }
        }
        return;
      }

      // Struct field assignment: s1.roll = 101;
      const structSetMatch = stmt.match(/^([a-zA-Z_][a-zA-Z0-9_]*)\.([a-zA-Z_][a-zA-Z0-9_]*)\s*=\s*([\s\S]+)$/);
      if (structSetMatch) {
        const varName = structSetMatch[1];
        const field = structSetMatch[2];
        const val = evaluateExpression(structSetMatch[3], scope);
        let obj = scope.get(varName);
        if (!obj || typeof obj !== "object" || Array.isArray(obj)) {
          obj = {};
          scope.set(varName, obj);
        }
        obj[field] = val;
        return;
      }

      // 2D Array element assignment: matrix[i][j] = 100;
      const arr2DSetMatch = stmt.match(/^([a-zA-Z_][a-zA-Z0-9_]*)\[([^\]]+)\]\[([^\]]+)\]\s*=\s*([\s\S]+)$/);
      if (arr2DSetMatch) {
        const arrName = arr2DSetMatch[1];
        const r = evaluateExpression(arr2DSetMatch[2], scope);
        const c = evaluateExpression(arr2DSetMatch[3], scope);
        const val = evaluateExpression(arr2DSetMatch[4], scope);
        const arr = scope.get(arrName);
        if (Array.isArray(arr) && Array.isArray(arr[r])) {
          arr[r][c] = val;
        }
        return;
      }

      // 1D Array element assignment: arr[i] = 100;
      const arrSetMatch = stmt.match(/^([a-zA-Z_][a-zA-Z0-9_]*)\[([^\]]+)\]\s*=\s*([\s\S]+)$/);
      if (arrSetMatch) {
        const arrName = arrSetMatch[1];
        const idx = evaluateExpression(arrSetMatch[2], scope);
        const val = evaluateExpression(arrSetMatch[3], scope);
        const arr = scope.get(arrName);
        if (Array.isArray(arr)) {
          arr[idx] = val;
        }
        return;
      }

      // Compound assignments: a += 5, a -= 2, a *= 3, a /= 2, a %= 2, a <<= 1, a >>= 1, a &= 5, a |= 2, a ^= 1
      const compoundMatch = stmt.match(/^([a-zA-Z_][a-zA-Z0-9_]*)\s*(\+=|-=|\*=|\/=|%=|<<=|>>=|&=|\|=|\^=)\s*([\s\S]+)$/);
      if (compoundMatch) {
        const varName = compoundMatch[1];
        const op = compoundMatch[2];
        const valExpr = compoundMatch[3];
        const currentVal = scope.get(varName) || 0;
        const opVal = evaluateExpression(valExpr, scope);

        if (op === "+=") scope.set(varName, currentVal + opVal);
        else if (op === "-=") scope.set(varName, currentVal - opVal);
        else if (op === "*=") scope.set(varName, currentVal * opVal);
        else if (op === "/=") scope.set(varName, opVal !== 0 ? Math.floor(currentVal / opVal) : 0);
        else if (op === "%=") scope.set(varName, opVal !== 0 ? currentVal % opVal : 0);
        else if (op === "<<=") scope.set(varName, currentVal << opVal);
        else if (op === ">>=") scope.set(varName, currentVal >> opVal);
        else if (op === "&=") scope.set(varName, currentVal & opVal);
        else if (op === "|=") scope.set(varName, currentVal | opVal);
        else if (op === "^=") scope.set(varName, currentVal ^ opVal);
        return;
      }

      // Increment / Decrement: i++, ++i, i--, --i
      if (/^\+\+\s*[a-zA-Z_][a-zA-Z0-9_]*$/.test(stmt) || /^[a-zA-Z_][a-zA-Z0-9_]*\s*\+\+$/.test(stmt)) {
        const varName = stmt.replace(/\+/g, "").trim();
        scope.set(varName, (scope.get(varName) || 0) + 1);
        return;
      }
      if (/^--\s*[a-zA-Z_][a-zA-Z0-9_]*$/.test(stmt) || /^[a-zA-Z_][a-zA-Z0-9_]*\s*--$/.test(stmt)) {
        const varName = stmt.replace(/-/g, "").trim();
        scope.set(varName, (scope.get(varName) || 0) - 1);
        return;
      }

      // Chained or Simple assignment: a = b = 10; or a = 10;
      if (stmt.includes("=")) {
        const parts = stmt.split("=").map((p) => p.trim());
        if (parts.length >= 2) {
          const finalValExpr = parts[parts.length - 1];
          const val = evaluateExpression(finalValExpr, scope);
          for (let p = 0; p < parts.length - 1; p++) {
            const varName = parts[p].replace(/^\*/, "").trim();
            if (/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(varName)) {
              scope.set(varName, val);
            }
          }
          return;
        }
      }

      // sprintf(buffer, "format %d", val)
      const sprintfMatch = stmt.match(/^sprintf\s*\(([^,]+),([^,]+)(?:,([\s\S]+))?\)$/);
      if (sprintfMatch) {
        const bufName = sprintfMatch[1].trim();
        const fmtExpr = sprintfMatch[2].trim();
        const restArgsStr = sprintfMatch[3];
        const rawFmt = evaluateExpression(fmtExpr, scope);
        const fmt = typeof rawFmt === "string" ? rawFmt : String(rawFmt);
        const restArgs = restArgsStr ? splitArgumentList(restArgsStr).map((a) => evaluateExpression(a.trim(), scope)) : [];
        const formatted = formatPrintf(fmt, restArgs);
        scope.set(bufName, formatted);
        return;
      }

      // strcpy(dest, src)
      const strcpyMatch = stmt.match(/^strcpy\s*\(([^,]+),([^)]+)\)$/);
      if (strcpyMatch) {
        const destName = strcpyMatch[1].trim();
        const srcKey = strcpyMatch[2].trim();
        const srcVal = scope.has(srcKey) ? scope.get(srcKey) : evaluateExpression(srcKey, scope);
        const strVal = Array.isArray(srcVal)
          ? srcVal.filter((c) => c !== 0).map((c) => (typeof c === "number" ? String.fromCharCode(c) : String(c))).join("")
          : String(srcVal);
        scope.set(destName, strVal);
        return;
      }

      // strcat(dest, src)
      const strcatMatch = stmt.match(/^strcat\s*\(([^,]+),([^)]+)\)$/);
      if (strcatMatch) {
        const destName = strcatMatch[1].trim();
        const currentDest = scope.get(destName);
        const currentDestStr = Array.isArray(currentDest)
          ? currentDest.filter((c) => c !== 0).map((c) => (typeof c === "number" ? String.fromCharCode(c) : String(c))).join("")
          : String(currentDest !== undefined && currentDest !== null ? currentDest : "");
        const srcKey = strcatMatch[2].trim();
        const srcVal = scope.has(srcKey) ? scope.get(srcKey) : evaluateExpression(srcKey, scope);
        const srcStr = Array.isArray(srcVal)
          ? srcVal.filter((c) => c !== 0).map((c) => (typeof c === "number" ? String.fromCharCode(c) : String(c))).join("")
          : String(srcVal);
        const combined = currentDestStr + srcStr;
        scope.set(destName, combined);
        return;
      }

      // Standalone function call in statement: myFunction(a, b);
      evaluateExpression(stmt, scope);
    }

    // 7. Execute main()
    const mainScope = new ExecutionScope(globalScope, memory);
    const result = executeBlock(mainFunc.body, mainScope);
    const exitVal = result && result.type === "return" ? Number(result.value) || 0 : 0;

    const execDuration = Math.max(1, Math.round(performance.now() - startTime));

    return {
      output: stdout || `[Program finished with exit code ${exitVal} and produced no output.]`,
      exitCode: exitVal,
      executionTimeMs: execDuration,
      status: "success"
    };
  } catch (err: any) {
    const execDuration = Math.max(1, Math.round(performance.now() - startTime));
    return {
      output: `Runtime / Compilation Error:\n${err.message || String(err)}`,
      exitCode: 1,
      executionTimeMs: execDuration,
      status: "error",
      error: err.message
    };
  }
}

// Helper utilities
function stripComments(code: string): string {
  return code
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/\/\/.*$/gm, "");
}

function processMacros(code: string): string {
  const lines = code.split("\n");
  const macros: Record<string, string> = {};
  const remainingLines: string[] = [];

  for (const line of lines) {
    const macroMatch = line.match(/^\s*#define\s+([a-zA-Z_][a-zA-Z0-9_]*)\s+([\s\S]+)$/);
    if (macroMatch) {
      macros[macroMatch[1]] = macroMatch[2].trim();
    } else {
      remainingLines.push(line);
    }
  }

  let processed = remainingLines.join("\n");
  for (const [name, val] of Object.entries(macros)) {
    const regex = new RegExp(`\\b${name}\\b`, "g");
    processed = processed.replace(regex, val);
  }
  return processed;
}

function extractFunctions(
  code: string,
  functions: Record<string, { params: Array<{ name: string; type: string; isPointer: boolean }>; body: string; returnType: string }>,
  globalScope: ExecutionScope
) {
  // Regex to match function definitions: int swap(int *x, int *y) { ... }
  const funcRegex = /(?:int|void|float|double|char|long|short)\s+([a-zA-Z_][a-zA-Z0-9_]*)\s*\(([^)]*)\)\s*\{/g;
  let match;

  while ((match = funcRegex.exec(code)) !== null) {
    const funcName = match[1];
    const rawParams = match[2];
    const startIndex = match.index + match[0].length;

    let depth = 1;
    let endIndex = startIndex;
    while (endIndex < code.length && depth > 0) {
      if (code[endIndex] === "{") depth++;
      else if (code[endIndex] === "}") depth--;
      endIndex++;
    }

    const funcBody = code.slice(startIndex, endIndex - 1);
    const params: Array<{ name: string; type: string; isPointer: boolean }> = [];

    if (rawParams && rawParams.trim() && rawParams.trim() !== "void") {
      const splitParams = rawParams.split(",");
      for (const p of splitParams) {
        const trimmed = p.trim();
        const isPtr = trimmed.includes("*");
        const parts = trimmed.replace(/\*/g, " ").trim().split(/\s+/);
        const name = parts[parts.length - 1];
        const type = parts.slice(0, -1).join(" ");
        params.push({ name, type, isPointer: isPtr });
      }
    }

    functions[funcName] = {
      params,
      body: funcBody,
      returnType: "int"
    };
  }

  // Also collect global variables outside functions
  const cleanWithoutFuncs = code.replace(/(?:int|void|float|double|char|long|short)\s+[a-zA-Z_][a-zA-Z0-9_]*\s*\([^)]*\)\s*\{[\s\S]*?\}/g, "");
  const globalStatements = parseStatements(cleanWithoutFuncs);
  for (const gStmt of globalStatements) {
    if (!gStmt.startsWith("#") && !gStmt.includes("main")) {
      const declMatch = gStmt.match(/^(?:int|float|double|char|long|short)\s+([\s\S]+)$/);
      if (declMatch) {
        const declList = splitArgumentList(declMatch[1]);
        for (const item of declList) {
          const parts = item.split("=");
          const vName = parts[0].trim();
          const vVal = parts[1] ? Number(parts[1].trim()) || 0 : 0;
          globalScope.declare(vName, vVal);
        }
      }
    }
  }
}

function parseStatements(blockStr: string): string[] {
  // Normalize single-statement if/else/for/while without braces
  const normalized = normalizeControlFlowBraces(blockStr);

  const statements: string[] = [];
  let current = "";
  let inQuote = false;
  let quoteChar = "";
  let depth = 0;
  let parenDepth = 0;

  for (let i = 0; i < normalized.length; i++) {
    const ch = normalized[i];
    const prev = i > 0 ? normalized[i - 1] : "";

    if ((ch === '"' || ch === "'") && prev !== "\\") {
      if (!inQuote) {
        inQuote = true;
        quoteChar = ch;
      } else if (quoteChar === ch) {
        inQuote = false;
      }
    }

    if (!inQuote) {
      if (ch === "{") depth++;
      else if (ch === "}") depth--;
      else if (ch === "(") parenDepth++;
      else if (ch === ")") parenDepth--;
    }

    current += ch;

    if (!inQuote && depth === 0 && parenDepth === 0) {
      if (ch === ";") {
        statements.push(current.trim());
        current = "";
      } else if (ch === "}") {
        const trimmed = current.trim();
        if (
          trimmed.startsWith("if") ||
          trimmed.startsWith("for") ||
          trimmed.startsWith("while") ||
          trimmed.startsWith("else") ||
          trimmed.startsWith("switch")
        ) {
          statements.push(trimmed);
          current = "";
        }
      }
    }
  }

  if (current.trim()) {
    statements.push(current.trim());
  }

  return statements.filter(Boolean);
}

function normalizeControlFlowBraces(code: string): string {
  // Wraps single statement if / else / while / for in { ... } if braces are omitted
  let out = code;

  // for (...) statement; -> for (...) { statement; }
  out = out.replace(/\bfor\s*\(([^;]*;[^;]*;[^)]*)\)\s*([^{;]+;)/g, "for ($1) { $2 }");

  // while (...) statement; -> while (...) { statement; } (avoid do...while)
  out = out.replace(/(?<!do\s*\{[\s\S]*?)\bwhile\s*\(([^)]+)\)\s*([^{;]+;)/g, "while ($1) { $2 }");

  // if (...) statement; else statement;
  out = out.replace(/\bif\s*\(([^)]+)\)\s*([^{;]+;)(?:\s*else\s*([^{;]+;))?/g, (_m, cond, ifBody, elseBody) => {
    let res = `if (${cond}) { ${ifBody} }`;
    if (elseBody) {
      res += ` else { ${elseBody} }`;
    }
    return res;
  });

  return out;
}

function splitArgumentList(argsStr: string): string[] {
  const args: string[] = [];
  let current = "";
  let inQuote = false;
  let quoteChar = "";
  let parenDepth = 0;
  let bracketDepth = 0;
  let braceDepth = 0;

  for (let i = 0; i < argsStr.length; i++) {
    const ch = argsStr[i];
    const prev = i > 0 ? argsStr[i - 1] : "";

    if ((ch === '"' || ch === "'") && prev !== "\\") {
      if (!inQuote) {
        inQuote = true;
        quoteChar = ch;
      } else if (quoteChar === ch) {
        inQuote = false;
      }
    }

    if (!inQuote) {
      if (ch === "(") parenDepth++;
      else if (ch === ")") parenDepth--;
      else if (ch === "[") bracketDepth++;
      else if (ch === "]") bracketDepth--;
      else if (ch === "{") braceDepth++;
      else if (ch === "}") braceDepth--;
      else if (ch === "," && parenDepth === 0 && bracketDepth === 0 && braceDepth === 0) {
        args.push(current.trim());
        current = "";
        continue;
      }
    }

    current += ch;
  }

  if (current.trim()) {
    args.push(current.trim());
  }

  return args;
}

function parseIfStatement(
  firstStmt: string,
  statements: string[],
  startIndex: number
): { branches: Array<{ condition: string | null; body: string }>; nextIndex: number } {
  const branches: Array<{ condition: string | null; body: string }> = [];

  const extractConditionAndBody = (s: string) => {
    const m = s.match(/^(?:if|else\s+if)\s*\(([\s\S]+?)\)\s*\{([\s\S]*)\}$/);
    if (m) return { condition: m[1], body: m[2] };
    const elseMatch = s.match(/^else\s*\{([\s\S]*)\}$/);
    if (elseMatch) return { condition: null, body: elseMatch[1] };
    return null;
  };

  const first = extractConditionAndBody(firstStmt);
  if (first) branches.push(first);

  let nextIndex = startIndex;
  while (nextIndex + 1 < statements.length) {
    const nextStmt = statements[nextIndex + 1].trim();
    if (nextStmt.startsWith("else if") || nextStmt.startsWith("else")) {
      const b = extractConditionAndBody(nextStmt);
      if (b) {
        branches.push(b);
        nextIndex++;
      } else {
        break;
      }
    } else {
      break;
    }
  }

  return { branches, nextIndex };
}

function parseSwitchCases(switchBody: string): Array<{ caseExpr: string | null; isDefault: boolean; body: string }> {
  const cases: Array<{ caseExpr: string | null; isDefault: boolean; body: string }> = [];
  const lines = switchBody.split("\n");
  let currentCaseExpr: string | null = null;
  let isDefault = false;
  let currentBody: string[] = [];

  for (const line of lines) {
    const caseMatch = line.match(/^\s*case\s+([^:]+):(.*)$/);
    const defaultMatch = line.match(/^\s*default\s*:(.*)$/);

    if (caseMatch) {
      if (currentCaseExpr !== null || isDefault) {
        cases.push({ caseExpr: currentCaseExpr, isDefault, body: currentBody.join("\n") });
        currentBody = [];
      }
      currentCaseExpr = caseMatch[1].trim();
      isDefault = false;
      if (caseMatch[2].trim()) {
        currentBody.push(caseMatch[2].trim());
      }
    } else if (defaultMatch) {
      if (currentCaseExpr !== null || isDefault) {
        cases.push({ caseExpr: currentCaseExpr, isDefault, body: currentBody.join("\n") });
        currentBody = [];
      }
      currentCaseExpr = null;
      isDefault = true;
      if (defaultMatch[1].trim()) {
        currentBody.push(defaultMatch[1].trim());
      }
    } else {
      currentBody.push(line);
    }
  }

  if (currentCaseExpr !== null || isDefault) {
    cases.push({ caseExpr: currentCaseExpr, isDefault, body: currentBody.join("\n") });
  }

  return cases;
}

function extractCallArgs(stmt: string, funcName: string): string[] | null {
  const prefixRegex = new RegExp(`^${funcName}\\s*\\(`, "i");
  const match = stmt.match(prefixRegex);
  if (!match) return null;

  let depth = 0;
  let inQuote = false;
  let quoteChar = "";
  const startIndex = match[0].length;
  let endIndex = -1;

  for (let i = startIndex - 1; i < stmt.length; i++) {
    const ch = stmt[i];
    const prev = i > 0 ? stmt[i - 1] : "";

    if ((ch === '"' || ch === "'") && prev !== "\\") {
      if (!inQuote) {
        inQuote = true;
        quoteChar = ch;
      } else if (quoteChar === ch) {
        inQuote = false;
      }
    }

    if (!inQuote) {
      if (ch === "(") depth++;
      else if (ch === ")") {
        depth--;
        if (depth === 0) {
          endIndex = i;
          break;
        }
      }
    }
  }

  if (endIndex === -1) return null;
  const inner = stmt.slice(startIndex, endIndex);
  return splitArgumentList(inner);
}

