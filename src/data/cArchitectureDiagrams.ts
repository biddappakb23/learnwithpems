/**
 * Pre-built Educational C Diagrams & Architecture Reference Templates
 * Provides high-clarity SVGs / Markdown templates for C Programming theory notes.
 */

export interface DiagramPreset {
  id: string;
  title: string;
  category: "Architecture" | "Flowchart" | "Memory" | "Classification";
  description: string;
  markdown: string;
}

export interface TablePreset {
  id: string;
  title: string;
  category: "Data Types" | "Operators" | "Tokens" | "Control Flow" | "I/O";
  description: string;
  markdown: string;
}

export const C_DIAGRAM_PRESETS: DiagramPreset[] = [
  {
    id: "diag-c-structure",
    title: "Structure of a C Program",
    category: "Architecture",
    description: "6 standard sections: Documentation, Link, Definition, Global Declaration, main(), and Subprogram.",
    markdown: `
<div align="center" style="margin: 24px 0; padding: 20px; background: #0f172a; border-radius: 12px; border: 1px solid #1e293b; color: #f8fafc;">
  <div style="font-size: 16px; font-weight: bold; color: #60a5fa; margin-bottom: 12px; letter-spacing: 0.05em; text-transform: uppercase;">
    Architecture: Structure of a C Program
  </div>
  <div style="display: flex; flex-direction: column; gap: 8px; max-width: 500px; margin: 0 auto; text-align: left; font-size: 13px;">
    <div style="padding: 10px 14px; background: #1e293b; border-left: 4px solid #3b82f6; border-radius: 6px;">
      <strong style="color: #93c5fd;">1. Documentation Section</strong> <span style="color: #94a3b8;">(/* Comments, Program info, Author */)</span>
    </div>
    <div style="padding: 10px 14px; background: #1e293b; border-left: 4px solid #06b6d4; border-radius: 6px;">
      <strong style="color: #67e8f9;">2. Link Section</strong> <span style="color: #94a3b8;">(#include &lt;stdio.h&gt;, #include &lt;conio.h&gt;)</span>
    </div>
    <div style="padding: 10px 14px; background: #1e293b; border-left: 4px solid #10b981; border-radius: 6px;">
      <strong style="color: #6ee7b7;">3. Definition Section</strong> <span style="color: #94a3b8;">(#define PI 3.14159)</span>
    </div>
    <div style="padding: 10px 14px; background: #1e293b; border-left: 4px solid #f59e0b; border-radius: 6px;">
      <strong style="color: #fcd34d;">4. Global Declaration Section</strong> <span style="color: #94a3b8;">(Global variables, user functions prototypes)</span>
    </div>
    <div style="padding: 12px 14px; background: #1e1b4b; border-left: 4px solid #8b5cf6; border-radius: 6px; border: 1px solid #4338ca;">
      <strong style="color: #c4b5fd;">5. main() Function Section</strong>
      <div style="padding-left: 16px; margin-top: 4px; color: #cbd5e1; font-family: monospace; font-size: 12px;">
        main() {<br/>
        &nbsp;&nbsp;Declaration part;<br/>
        &nbsp;&nbsp;Executable part;<br/>
        }
      </div>
    </div>
    <div style="padding: 10px 14px; background: #1e293b; border-left: 4px solid #ec4899; border-radius: 6px;">
      <strong style="color: #f472b6;">6. Subprogram Section</strong> <span style="color: #94a3b8;">(User Defined Functions func1(), func2()...)</span>
    </div>
  </div>
</div>
*Figure: Standard Structure and Modular Sections of a C Program*
`
  },
  {
    id: "diag-compilation-pipeline",
    title: "C Compilation & Execution Pipeline",
    category: "Architecture",
    description: "Source code (.c) -> Preprocessor -> Compiler (.s) -> Assembler (.obj) -> Linker -> Executable (.exe)",
    markdown: `
<div align="center" style="margin: 24px 0; padding: 20px; background: #0f172a; border-radius: 12px; border: 1px solid #1e293b; color: #f8fafc;">
  <div style="font-size: 16px; font-weight: bold; color: #34d399; margin-bottom: 16px; letter-spacing: 0.05em; text-transform: uppercase;">
    Compilation & Execution Pipeline in C
  </div>
  <div style="display: flex; flex-wrap: wrap; align-items: center; justify-content: center; gap: 10px; font-size: 12px;">
    <div style="padding: 12px; background: #1e293b; border: 1px solid #3b82f6; border-radius: 8px; text-align: center; min-width: 110px;">
      <div style="font-weight: bold; color: #93c5fd;">Source Code</div>
      <div style="font-family: monospace; color: #94a3b8; font-size: 11px;">program.c</div>
    </div>
    <div style="color: #60a5fa; font-size: 18px;">➔</div>
    <div style="padding: 12px; background: #1e293b; border: 1px solid #06b6d4; border-radius: 8px; text-align: center; min-width: 110px;">
      <div style="font-weight: bold; color: #67e8f9;">Preprocessor</div>
      <div style="font-size: 10px; color: #94a3b8;">Expands #include</div>
    </div>
    <div style="color: #06b6d4; font-size: 18px;">➔</div>
    <div style="padding: 12px; background: #1e293b; border: 1px solid #10b981; border-radius: 8px; text-align: center; min-width: 110px;">
      <div style="font-weight: bold; color: #6ee7b7;">C Compiler</div>
      <div style="font-size: 10px; color: #94a3b8;">Generates Assembly</div>
    </div>
    <div style="color: #10b981; font-size: 18px;">➔</div>
    <div style="padding: 12px; background: #1e293b; border: 1px solid #f59e0b; border-radius: 8px; text-align: center; min-width: 110px;">
      <div style="font-weight: bold; color: #fcd34d;">Linker &amp; Loader</div>
      <div style="font-size: 10px; color: #94a3b8;">Links C Libs</div>
    </div>
    <div style="color: #f59e0b; font-size: 18px;">➔</div>
    <div style="padding: 12px; background: #064e3b; border: 2px solid #10b981; border-radius: 8px; text-align: center; min-width: 110px;">
      <div style="font-weight: bold; color: #ecfdf5;">Executable</div>
      <div style="font-family: monospace; color: #a7f3d0; font-size: 11px;">program.exe</div>
    </div>
  </div>
</div>
*Figure: Step-by-Step Translation of C Source Code to Executable Binary*
`
  },
  {
    id: "diag-memory-layout",
    title: "Memory Layout of a C Program",
    category: "Memory",
    description: "Visual representation of Stack, Heap, Uninitialized Data (BSS), Initialized Data, and Text Segment.",
    markdown: `
<div align="center" style="margin: 24px 0; padding: 20px; background: #0f172a; border-radius: 12px; border: 1px solid #1e293b; color: #f8fafc;">
  <div style="font-size: 16px; font-weight: bold; color: #c084fc; margin-bottom: 14px; letter-spacing: 0.05em; text-transform: uppercase;">
    Memory Layout in RAM for C Process
  </div>
  <div style="max-width: 380px; margin: 0 auto; display: flex; flex-direction: column; gap: 6px; font-size: 12px;">
    <div style="padding: 12px; background: #312e81; border: 1px solid #6366f1; border-radius: 6px; text-align: center; font-weight: bold; color: #e0e7ff;">
      STACK Segment (Local Variables, Function Call Frames) ↓ Grows Downward
    </div>
    <div style="padding: 8px; background: #020617; border: 1px dashed #475569; text-align: center; color: #64748b; font-size: 11px;">
      ↕ Free Memory / Heap Expansion Space ↕
    </div>
    <div style="padding: 12px; background: #064e3b; border: 1px solid #10b981; border-radius: 6px; text-align: center; font-weight: bold; color: #d1fae5;">
      HEAP Segment (Dynamic Allocation: malloc, calloc) ↑ Grows Upward
    </div>
    <div style="padding: 10px; background: #78350f; border: 1px solid #d97706; border-radius: 6px; text-align: center; font-weight: bold; color: #fef3c7;">
      BSS Segment (Uninitialized Global & Static Variables)
    </div>
    <div style="padding: 10px; background: #701a75; border: 1px solid #c026d3; border-radius: 6px; text-align: center; font-weight: bold; color: #fae8ff;">
      DATA Segment (Initialized Global & Static Variables)
    </div>
    <div style="padding: 10px; background: #1e293b; border: 1px solid #64748b; border-radius: 6px; text-align: center; font-weight: bold; color: #f1f5f9;">
      TEXT Segment (Compiled Machine Code Instructions / Read-Only)
    </div>
  </div>
</div>
*Figure: Process Memory Segmentation in C*
`
  },
  {
    id: "diag-loop-comparison",
    title: "Entry-Controlled vs. Exit-Controlled Loops",
    category: "Flowchart",
    description: "Flowchart comparison between while/for loops (entry-controlled) and do-while loop (exit-controlled).",
    markdown: `
<div align="center" style="margin: 24px 0; padding: 20px; background: #0f172a; border-radius: 12px; border: 1px solid #1e293b; color: #f8fafc;">
  <div style="font-size: 16px; font-weight: bold; color: #38bdf8; margin-bottom: 16px; letter-spacing: 0.05em; text-transform: uppercase;">
    Loop Construct Classification & Flow
  </div>
  <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; text-align: left; font-size: 12px;">
    <div style="padding: 14px; background: #1e293b; border: 1px solid #0284c7; border-radius: 8px;">
      <div style="font-weight: bold; color: #38bdf8; font-size: 13px; margin-bottom: 8px;">1. Entry-Controlled (Pre-Test)</div>
      <div style="color: #94a3b8; margin-bottom: 6px;"><strong>Examples:</strong> <code>while</code> and <code>for</code> loops</div>
      <div style="background: #0f172a; padding: 8px; border-radius: 4px; font-family: monospace; color: #7dd3fc; margin-bottom: 8px;">
        1. Test condition evaluated FIRST<br/>
        2. If TRUE ➔ Execute loop body<br/>
        3. If FALSE ➔ Terminate (0 executions possible)
      </div>
    </div>
    <div style="padding: 14px; background: #1e293b; border: 1px solid #10b981; border-radius: 8px;">
      <div style="font-weight: bold; color: #34d399; font-size: 13px; margin-bottom: 8px;">2. Exit-Controlled (Post-Test)</div>
      <div style="color: #94a3b8; margin-bottom: 6px;"><strong>Example:</strong> <code>do...while</code> loop</div>
      <div style="background: #0f172a; padding: 8px; border-radius: 4px; font-family: monospace; color: #a7f3d0; margin-bottom: 8px;">
        1. Execute loop body FIRST<br/>
        2. Test condition evaluated at END<br/>
        3. Guaranteed at least 1 execution
      </div>
    </div>
  </div>
</div>
*Figure: Comparison of Entry-Controlled vs. Exit-Controlled Looping Mechanics*
`
  }
];

export const C_TABLE_PRESETS: TablePreset[] = [
  {
    id: "table-data-types",
    title: "C Primary Data Types & Memory Sizes",
    category: "Data Types",
    description: "Standard memory sizes, format specifiers, and range for int, char, float, and double.",
    markdown: `
| Data Type | Memory Size | Format Specifier | Value Range |
| :--- | :--- | :--- | :--- |
| **char** | 1 Byte (8 bits) | \`%c\` | -128 to +127 (signed) or 0 to 255 (unsigned) |
| **int** | 2 / 4 Bytes | \`%d\` or \`%i\` | -32,768 to 32,767 (16-bit) or -2,147,483,648 to 2,147,483,647 (32-bit) |
| **float** | 4 Bytes (32 bits) | \`%f\` | 3.4E-38 to 3.4E+38 (6 decimal places precision) |
| **double** | 8 Bytes (64 bits) | \`%lf\` | 1.7E-308 to 1.7E+308 (14 decimal places precision) |
| **void** | 0 Bytes | None | Represents empty/valueless type |
`
  },
  {
    id: "table-keywords",
    title: "32 C Reserved Keywords Table",
    category: "Tokens",
    description: "Complete ANSI C 32 reserved keywords arranged alphabetically in a 4-column matrix.",
    markdown: `
| Keyword 1 | Keyword 2 | Keyword 3 | Keyword 4 |
| :--- | :--- | :--- | :--- |
| \`auto\` | \`double\` | \`int\` | \`struct\` |
| \`break\` | \`else\` | \`long\` | \`switch\` |
| \`case\` | \`enum\` | \`register\` | \`typedef\` |
| \`char\` | \`extern\` | \`return\` | \`union\` |
| \`const\` | \`float\` | \`short\` | \`unsigned\` |
| \`continue\` | \`for\` | \`signed\` | \`void\` |
| \`default\` | \`goto\` | \`sizeof\` | \`volatile\` |
| \`do\` | \`if\` | \`static\` | \`while\` |
`
  },
  {
    id: "table-escape-sequences",
    title: "Escape Sequences in C",
    category: "I/O",
    description: "Common escape sequences: \\n, \\t, \\b, \\r, \\\\, \\\", \\', and \\0.",
    markdown: `
| Escape Sequence | Description / Meaning | ASCII Code | Example in printf() |
| :--- | :--- | :--- | :--- |
| \`\\n\` | Newline (moves cursor to beginning of next line) | 10 | \`printf("Hello\\nWorld");\` |
| \`\\t\` | Horizontal Tab (shifts cursor by 8 spaces) | 9 | \`printf("Name:\\tPemmaiah");\` |
| \`\\b\` | Backspace (moves cursor back one character) | 8 | \`printf("Hello\\bC");\` |
| \`\\r\` | Carriage Return (moves cursor to start of current line) | 13 | \`printf("Over\\rWritten");\` |
| \`\\\\\` | Backslash character | 92 | \`printf("Path: C:\\\\Users");\` |
| \`\\"\` | Double quote character | 34 | \`printf("\\"BCA Cauverians\\"");\` |
| \`\\'\` | Single quote character | 39 | \`printf("\\'A\\'");\` |
| \`\\0\` | Null character (marks end of C string) | 0 | \`char str[] = {'C', '\\0'};\` |
`
  },
  {
    id: "table-operators-precedence",
    title: "C Operators & Precedence Hierarchy",
    category: "Operators",
    description: "Precedence and associativity of arithmetic, relational, logical, assignment, and special operators.",
    markdown: `
| Precedence Level | Operator Category | Operators | Associativity |
| :--- | :--- | :--- | :--- |
| **1 (Highest)** | Postfix | \`()\` \`[]\` \`->\` \`.\` \`++\` \`--\` | Left to Right |
| **2** | Unary | \`+\` \`-\` \`!\` \`~\` \`++\` \`--\` \`*\` \`&\` \`sizeof\` \`(type)\` | Right to Left |
| **3** | Multiplicative | \`*\` \`/\` \`%\` | Left to Right |
| **4** | Additive | \`+\` \`-\` | Left to Right |
| **5** | Shift | \`<<\` \`>>\` | Left to Right |
| **6** | Relational | \`<\` \`<=\` \`>\` \`>=\` | Left to Right |
| **7** | Equality | \`==\` \`!=\` | Left to Right |
| **8** | Bitwise AND | \`&\` | Left to Right |
| **9** | Bitwise XOR | \`^\` | Left to Right |
| **10** | Bitwise OR | \`\|\` | Left to Right |
| **11** | Logical AND | \`&&\` | Left to Right |
| **12** | Logical OR | \`\|\|\` | Left to Right |
| **13** | Conditional (Ternary) | \`? :\` | Right to Left |
| **14** | Assignment | \`=\` \`+=\` \`-=\` \`*=\` \`/=\` \`%=\` | Right to Left |
| **15 (Lowest)** | Comma | \`,\` | Left to Right |
`
  },
  {
    id: "table-format-specifiers",
    title: "Format Specifiers for scanf() & printf()",
    category: "I/O",
    description: "All format specifiers for input and output in C.",
    markdown: `
| Format Specifier | Associated Data Type | Input / Output Format |
| :--- | :--- | :--- |
| \`%d\` or \`%i\` | signed int | Signed decimal integer |
| \`%u\` | unsigned int | Unsigned decimal integer |
| \`%ld\` | signed long int | Long signed integer |
| \`%c\` | char | Single character |
| \`%s\` | string / char array | Sequence of characters (string) |
| \`%f\` | float | Floating point decimal number |
| \`%lf\` | double | Double precision floating point |
| \`%Lf\` | long double | Long double floating point |
| \`%o\` | octal int | Octal representation |
| \`%x\` or \`%X\` | hexadecimal int | Hexadecimal representation |
| \`%p\` | void* (pointer) | Memory address in hexadecimal |
| \`%%\` | literal % | Prints single '%' sign |
`
  }
];
