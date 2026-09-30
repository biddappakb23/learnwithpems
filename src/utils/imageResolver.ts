/**
 * Academic Image and Diagram Graphics Generator for C Programming Curriculum
 * Provides verified high-resolution SVG diagrams for curriculum figures,
 * ensuring that legacy references (e.g. "sectionC", "c_structure", "compilation")
 * always render beautiful, crisp vector illustrations rather than broken images.
 */

// Section C - Structure and Sections of a C Program
export const SVG_SECTION_C_STRUCTURE = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 520" width="100%" height="100%">
  <defs>
    <linearGradient id="secGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0f172a"/>
      <stop offset="100%" stop-color="#1e293b"/>
    </linearGradient>
    <linearGradient id="headerGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#2563eb"/>
      <stop offset="100%" stop-color="#0284c7"/>
    </linearGradient>
    <linearGradient id="mainGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#1e3a8a"/>
      <stop offset="100%" stop-color="#1d4ed8"/>
    </linearGradient>
    <filter id="cardShadow" x="-5%" y="-5%" width="110%" height="115%">
      <feDropShadow dx="0" dy="4" stdDeviation="6" flood-color="#000000" flood-opacity="0.15"/>
    </filter>
  </defs>

  <!-- Background Canvas -->
  <rect width="100%" height="100%" fill="#f8fafc" rx="16"/>
  <rect x="10" y="10" width="780" height="500" fill="#ffffff" rx="12" stroke="#e2e8f0" stroke-width="2"/>

  <!-- Title Header -->
  <rect x="25" y="25" width="750" height="56" rx="10" fill="url(#headerGrad)"/>
  <text x="400" y="52" fill="#ffffff" font-family="system-ui, -apple-system, sans-serif" font-size="18" font-weight="bold" text-anchor="middle" letter-spacing="0.5">
    STRUCTURE &amp; MODULAR SECTIONS OF A C PROGRAM
  </text>
  <text x="400" y="70" fill="#bfdbfe" font-family="system-ui, -apple-system, sans-serif" font-size="12" text-anchor="middle">
    Standard ANSI C Source Code Layout &amp; Execution Pipeline
  </text>

  <!-- 1. Documentation Section -->
  <g transform="translate(45, 95)" filter="url(#cardShadow)">
    <rect width="330" height="60" rx="8" fill="#f1f5f9" stroke="#94a3b8" stroke-width="1.5" stroke-dasharray="4 3"/>
    <rect x="0" y="0" width="8" height="60" rx="4" fill="#64748b"/>
    <text x="20" y="24" fill="#0f172a" font-family="system-ui, sans-serif" font-size="13" font-weight="bold">1. Documentation Section</text>
    <text x="20" y="44" fill="#475569" font-family="monospace" font-size="11">/* Program Title, Author, Date */</text>
    <rect x="240" y="10" width="80" height="20" rx="4" fill="#e2e8f0"/>
    <text x="280" y="24" fill="#64748b" font-family="system-ui, sans-serif" font-size="10" font-weight="bold" text-anchor="middle">OPTIONAL</text>
  </g>

  <!-- 2. Link Section -->
  <g transform="translate(45, 165)" filter="url(#cardShadow)">
    <rect width="330" height="60" rx="8" fill="#eff6ff" stroke="#3b82f6" stroke-width="1.5"/>
    <rect x="0" y="0" width="8" height="60" rx="4" fill="#2563eb"/>
    <text x="20" y="24" fill="#1e3a8a" font-family="system-ui, sans-serif" font-size="13" font-weight="bold">2. Link Section (Preprocessor)</text>
    <text x="20" y="44" fill="#1d4ed8" font-family="monospace" font-size="11">#include &lt;stdio.h&gt;, &lt;stdlib.h&gt;</text>
    <rect x="240" y="10" width="80" height="20" rx="4" fill="#dbeafe"/>
    <text x="280" y="24" fill="#1e40af" font-family="system-ui, sans-serif" font-size="10" font-weight="bold" text-anchor="middle">ESSENTIAL</text>
  </g>

  <!-- 3. Definition Section -->
  <g transform="translate(45, 235)" filter="url(#cardShadow)">
    <rect width="330" height="60" rx="8" fill="#f1f5f9" stroke="#94a3b8" stroke-width="1.5" stroke-dasharray="4 3"/>
    <rect x="0" y="0" width="8" height="60" rx="4" fill="#64748b"/>
    <text x="20" y="24" fill="#0f172a" font-family="system-ui, sans-serif" font-size="13" font-weight="bold">3. Definition Section</text>
    <text x="20" y="44" fill="#475569" font-family="monospace" font-size="11">#define MAX 100, #define PI 3.14</text>
    <rect x="240" y="10" width="80" height="20" rx="4" fill="#e2e8f0"/>
    <text x="280" y="24" fill="#64748b" font-family="system-ui, sans-serif" font-size="10" font-weight="bold" text-anchor="middle">OPTIONAL</text>
  </g>

  <!-- 4. Global Declaration Section -->
  <g transform="translate(45, 305)" filter="url(#cardShadow)">
    <rect width="330" height="60" rx="8" fill="#f8fafc" stroke="#cbd5e1" stroke-width="1.5"/>
    <rect x="0" y="0" width="8" height="60" rx="4" fill="#0284c7"/>
    <text x="20" y="24" fill="#0f172a" font-family="system-ui, sans-serif" font-size="13" font-weight="bold">4. Global Variable &amp; Prototypes</text>
    <text x="20" y="44" fill="#0284c7" font-family="monospace" font-size="11">int totalCount; void calculate();</text>
    <rect x="240" y="10" width="80" height="20" rx="4" fill="#e0f2fe"/>
    <text x="280" y="24" fill="#0369a1" font-family="system-ui, sans-serif" font-size="10" font-weight="bold" text-anchor="middle">OPTIONAL</text>
  </g>

  <!-- 5. Subprogram / User-Defined Functions -->
  <g transform="translate(45, 375)" filter="url(#cardShadow)">
    <rect width="330" height="65" rx="8" fill="#fdf4ff" stroke="#d946ef" stroke-width="1.5"/>
    <rect x="0" y="0" width="8" height="65" rx="4" fill="#c026d3"/>
    <text x="20" y="24" fill="#701a75" font-family="system-ui, sans-serif" font-size="13" font-weight="bold">6. User-Defined Functions</text>
    <text x="20" y="44" fill="#a21caf" font-family="monospace" font-size="11">int sum(int a, int b) { return a+b; }</text>
    <rect x="240" y="10" width="80" height="20" rx="4" fill="#fae8ff"/>
    <text x="280" y="24" fill="#86198f" font-family="system-ui, sans-serif" font-size="10" font-weight="bold" text-anchor="middle">MODULAR</text>
  </g>

  <!-- 5. MAIN FUNCTION SECTION (Highlighted Right Panel) -->
  <g transform="translate(405, 95)" filter="url(#cardShadow)">
    <rect width="350" height="345" rx="10" fill="#ffffff" stroke="#2563eb" stroke-width="2.5"/>
    <!-- Main Header -->
    <path d="M 0 10 Q 0 0 10 0 L 340 0 Q 350 0 350 10 L 350 42 L 0 42 Z" fill="url(#mainGrad)"/>
    <text x="175" y="27" fill="#ffffff" font-family="system-ui, sans-serif" font-size="14" font-weight="bold" text-anchor="middle">
      5. main() FUNCTION SECTION (MANDATORY)
    </text>

    <!-- Subpart A: Header -->
    <rect x="15" y="55" width="320" height="40" rx="6" fill="#f8fafc" stroke="#cbd5e1"/>
    <text x="25" y="75" fill="#1e293b" font-family="monospace" font-size="12" font-weight="bold">int main(void) {</text>
    <text x="250" y="78" fill="#64748b" font-family="system-ui, sans-serif" font-size="10">ENTRY POINT</text>

    <!-- Subpart B: Declaration Part -->
    <rect x="25" y="105" width="300" height="70" rx="6" fill="#f0fdf4" stroke="#86efac"/>
    <text x="35" y="125" fill="#166534" font-family="system-ui, sans-serif" font-size="12" font-weight="bold">A. Declaration Part (Local Variables)</text>
    <text x="35" y="145" fill="#15803d" font-family="monospace" font-size="11">   int num1, num2, result;</text>
    <text x="35" y="162" fill="#15803d" font-family="monospace" font-size="11">   float average = 0.0;</text>

    <!-- Subpart C: Executable Part -->
    <rect x="25" y="185" width="300" height="95" rx="6" fill="#eff6ff" stroke="#93c5fd"/>
    <text x="35" y="205" fill="#1e40af" font-family="system-ui, sans-serif" font-size="12" font-weight="bold">B. Executable Part (Statements)</text>
    <text x="35" y="225" fill="#1d4ed8" font-family="monospace" font-size="11">   printf("Enter values: ");</text>
    <text x="35" y="242" fill="#1d4ed8" font-family="monospace" font-size="11">   scanf("%d %d", &amp;num1, &amp;num2);</text>
    <text x="35" y="260" fill="#1d4ed8" font-family="monospace" font-size="11">   result = num1 + num2;</text>

    <!-- Return Statement & Closing -->
    <rect x="15" y="290" width="320" height="42" rx="6" fill="#f8fafc" stroke="#cbd5e1"/>
    <text x="25" y="310" fill="#1e293b" font-family="monospace" font-size="12" font-weight="bold">   return 0;</text>
    <text x="25" y="325" fill="#1e293b" font-family="monospace" font-size="12" font-weight="bold">}</text>
  </g>

  <!-- Bottom Legend / Note -->
  <rect x="45" y="455" width="710" height="38" rx="8" fill="#f8fafc" stroke="#e2e8f0"/>
  <text x="60" y="478" fill="#475569" font-family="system-ui, sans-serif" font-size="11">
    <tspan font-weight="bold" fill="#0f172a">Rule of C Execution:</tspan> Execution unconditionally starts from the first line of <tspan font-family="monospace" font-weight="bold" fill="#2563eb">main()</tspan> and ends at <tspan font-family="monospace" font-weight="bold" fill="#2563eb">return 0</tspan>.
  </text>
</svg>
`)}`;

// C Compilation Pipeline SVG
export const SVG_COMPILATION_PIPELINE = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 380" width="100%" height="100%">
  <rect width="100%" height="100%" fill="#ffffff" rx="12" stroke="#e2e8f0" stroke-width="2"/>
  <rect x="20" y="20" width="760" height="45" rx="8" fill="#0f172a"/>
  <text x="400" y="48" fill="#38bdf8" font-family="system-ui, sans-serif" font-size="16" font-weight="bold" text-anchor="middle">
    THE C COMPILATION &amp; BUILD PROCESS (Source to Executable)
  </text>

  <!-- Step 1: Source Code -->
  <g transform="translate(30, 90)">
    <rect width="115" height="180" rx="8" fill="#eff6ff" stroke="#3b82f6" stroke-width="1.5"/>
    <text x="57" y="30" fill="#1e3a8a" font-family="system-ui, sans-serif" font-size="12" font-weight="bold" text-anchor="middle">1. Source</text>
    <text x="57" y="55" fill="#2563eb" font-family="monospace" font-size="12" font-weight="bold" text-anchor="middle">program.c</text>
    <line x1="15" y1="75" x2="100" y2="75" stroke="#bfdbfe"/>
    <text x="57" y="100" fill="#64748b" font-family="system-ui, sans-serif" font-size="10" text-anchor="middle">Human readable</text>
    <text x="57" y="120" fill="#64748b" font-family="system-ui, sans-serif" font-size="10" text-anchor="middle">C Code with</text>
    <text x="57" y="140" fill="#64748b" font-family="system-ui, sans-serif" font-size="10" text-anchor="middle">#directives</text>
  </g>

  <!-- Arrow 1 -->
  <path d="M 155 180 L 180 180" stroke="#0284c7" stroke-width="2" marker-end="url(#arrow)"/>
  <text x="167" y="165" fill="#0284c7" font-family="system-ui, sans-serif" font-size="9" text-anchor="middle" font-weight="bold">Pre-proc</text>

  <!-- Step 2: Expanded Source -->
  <g transform="translate(185, 90)">
    <rect width="115" height="180" rx="8" fill="#f0fdf4" stroke="#22c55e" stroke-width="1.5"/>
    <text x="57" y="30" fill="#14532d" font-family="system-ui, sans-serif" font-size="12" font-weight="bold" text-anchor="middle">2. Expanded</text>
    <text x="57" y="55" fill="#16a34a" font-family="monospace" font-size="12" font-weight="bold" text-anchor="middle">program.i</text>
    <line x1="15" y1="75" x2="100" y2="75" stroke="#bbf7d0"/>
    <text x="57" y="100" fill="#64748b" font-family="system-ui, sans-serif" font-size="10" text-anchor="middle">Macros expanded</text>
    <text x="57" y="120" fill="#64748b" font-family="system-ui, sans-serif" font-size="10" text-anchor="middle">Header files</text>
    <text x="57" y="140" fill="#64748b" font-family="system-ui, sans-serif" font-size="10" text-anchor="middle">included</text>
  </g>

  <!-- Arrow 2 -->
  <path d="M 310 180 L 335 180" stroke="#16a34a" stroke-width="2"/>
  <text x="322" y="165" fill="#16a34a" font-family="system-ui, sans-serif" font-size="9" text-anchor="middle" font-weight="bold">Compiler</text>

  <!-- Step 3: Assembly -->
  <g transform="translate(340, 90)">
    <rect width="115" height="180" rx="8" fill="#fefce8" stroke="#eab308" stroke-width="1.5"/>
    <text x="57" y="30" fill="#713f12" font-family="system-ui, sans-serif" font-size="12" font-weight="bold" text-anchor="middle">3. Assembly</text>
    <text x="57" y="55" fill="#ca8a04" font-family="monospace" font-size="12" font-weight="bold" text-anchor="middle">program.s</text>
    <line x1="15" y1="75" x2="100" y2="75" stroke="#fef08a"/>
    <text x="57" y="100" fill="#64748b" font-family="system-ui, sans-serif" font-size="10" text-anchor="middle">Assembly</text>
    <text x="57" y="120" fill="#64748b" font-family="system-ui, sans-serif" font-size="10" text-anchor="middle">Mnemonics</text>
    <text x="57" y="140" fill="#64748b" font-family="system-ui, sans-serif" font-size="10" text-anchor="middle">(mov, add, jmp)</text>
  </g>

  <!-- Arrow 3 -->
  <path d="M 465 180 L 490 180" stroke="#ca8a04" stroke-width="2"/>
  <text x="477" y="165" fill="#ca8a04" font-family="system-ui, sans-serif" font-size="9" text-anchor="middle" font-weight="bold">Assembler</text>

  <!-- Step 4: Object Code -->
  <g transform="translate(495, 90)">
    <rect width="115" height="180" rx="8" fill="#faf5ff" stroke="#a855f7" stroke-width="1.5"/>
    <text x="57" y="30" fill="#581c87" font-family="system-ui, sans-serif" font-size="12" font-weight="bold" text-anchor="middle">4. Object File</text>
    <text x="57" y="55" fill="#9333ea" font-family="monospace" font-size="12" font-weight="bold" text-anchor="middle">program.o</text>
    <line x1="15" y1="75" x2="100" y2="75" stroke="#e9d5ff"/>
    <text x="57" y="100" fill="#64748b" font-family="system-ui, sans-serif" font-size="10" text-anchor="middle">Machine code</text>
    <text x="57" y="120" fill="#64748b" font-family="system-ui, sans-serif" font-size="10" text-anchor="middle">Binary format</text>
    <text x="57" y="140" fill="#64748b" font-family="system-ui, sans-serif" font-size="10" text-anchor="middle">(Unlinked)</text>
  </g>

  <!-- Arrow 4 -->
  <path d="M 620 180 L 645 180" stroke="#9333ea" stroke-width="2"/>
  <text x="632" y="165" fill="#9333ea" font-family="system-ui, sans-serif" font-size="9" text-anchor="middle" font-weight="bold">Linker</text>

  <!-- Step 5: Executable -->
  <g transform="translate(650, 90)">
    <rect width="120" height="180" rx="8" fill="#0f172a" stroke="#38bdf8" stroke-width="2"/>
    <text x="60" y="30" fill="#38bdf8" font-family="system-ui, sans-serif" font-size="12" font-weight="bold" text-anchor="middle">5. Binary</text>
    <text x="60" y="55" fill="#ffffff" font-family="monospace" font-size="12" font-weight="bold" text-anchor="middle">program.exe</text>
    <line x1="15" y1="75" x2="105" y2="75" stroke="#334155"/>
    <text x="60" y="100" fill="#94a3b8" font-family="system-ui, sans-serif" font-size="10" text-anchor="middle">Linked with</text>
    <text x="60" y="120" fill="#94a3b8" font-family="system-ui, sans-serif" font-size="10" text-anchor="middle">C Libraries</text>
    <text x="60" y="145" fill="#4ade80" font-family="system-ui, sans-serif" font-size="11" font-weight="bold" text-anchor="middle">READY TO RUN</text>
  </g>

  <!-- Bottom Command Summary -->
  <rect x="30" y="295" width="740" height="60" rx="8" fill="#f8fafc" stroke="#cbd5e1"/>
  <text x="45" y="318" fill="#0f172a" font-family="system-ui, sans-serif" font-size="11" font-weight="bold">One-Step GCC Command:</text>
  <text x="210" y="318" fill="#2563eb" font-family="monospace" font-size="11" font-weight="bold">gcc -Wall -O2 program.c -o program.exe</text>
  <text x="45" y="340" fill="#64748b" font-family="system-ui, sans-serif" font-size="11">The C Compiler Driver automatically chains Preprocessor (cpp) → Compiler (cc1) → Assembler (as) → Linker (ld).</text>
</svg>
`)}`;

// C Memory Architecture Layout SVG
export const SVG_MEMORY_LAYOUT = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 440" width="100%" height="100%">
  <rect width="100%" height="100%" fill="#ffffff" rx="12" stroke="#e2e8f0" stroke-width="2"/>
  <rect x="20" y="20" width="760" height="45" rx="8" fill="#1e293b"/>
  <text x="400" y="48" fill="#f8fafc" font-family="system-ui, sans-serif" font-size="16" font-weight="bold" text-anchor="middle">
    C PROCESS MEMORY ARCHITECTURE (RAM LAYOUT)
  </text>

  <!-- Left: Memory Segment Stack -->
  <g transform="translate(60, 85)">
    <!-- High Address Label -->
    <text x="-40" y="20" fill="#64748b" font-family="monospace" font-size="11">0xFFFFFFFF</text>
    <text x="-40" y="35" fill="#94a3b8" font-family="system-ui, sans-serif" font-size="9">(High Memory)</text>

    <!-- Stack Segment -->
    <rect x="50" y="10" width="340" height="65" fill="#fef2f2" stroke="#ef4444" stroke-width="2" rx="6"/>
    <text x="220" y="35" fill="#991b1b" font-family="system-ui, sans-serif" font-size="13" font-weight="bold" text-anchor="middle">STACK SEGMENT</text>
    <text x="220" y="55" fill="#b91c1c" font-family="monospace" font-size="11" text-anchor="middle">Local Variables, Function Call Frames, Return Addresses (Grows ↓)</text>

    <!-- Free Space / Dynamic Growth Zone -->
    <rect x="50" y="80" width="340" height="60" fill="#f8fafc" stroke="#94a3b8" stroke-dasharray="4 4" rx="6"/>
    <text x="220" y="115" fill="#64748b" font-family="system-ui, sans-serif" font-size="11" font-weight="bold" text-anchor="middle">FREE MEMORY (Heap &amp; Stack Growth Zone)</text>

    <!-- Heap Segment -->
    <rect x="50" y="145" width="340" height="65" fill="#eff6ff" stroke="#3b82f6" stroke-width="2" rx="6"/>
    <text x="220" y="170" fill="#1e3a8a" font-family="system-ui, sans-serif" font-size="13" font-weight="bold" text-anchor="middle">HEAP SEGMENT</text>
    <text x="220" y="190" fill="#1d4ed8" font-family="monospace" font-size="11" text-anchor="middle">Dynamic Memory: malloc(), calloc(), realloc(), free() (Grows ↑)</text>

    <!-- BSS Segment -->
    <rect x="50" y="215" width="340" height="40" fill="#f0fdf4" stroke="#22c55e" stroke-width="1.5" rx="6"/>
    <text x="220" y="240" fill="#14532d" font-family="system-ui, sans-serif" font-size="12" font-weight="bold" text-anchor="middle">BSS SEGMENT (Uninitialized Global &amp; Static Variables = 0)</text>

    <!-- Data Segment -->
    <rect x="50" y="260" width="340" height="40" fill="#faf5ff" stroke="#a855f7" stroke-width="1.5" rx="6"/>
    <text x="220" y="285" fill="#581c87" font-family="system-ui, sans-serif" font-size="12" font-weight="bold" text-anchor="middle">DATA SEGMENT (Initialized Global &amp; Static Variables)</text>

    <!-- Text / Code Segment -->
    <rect x="50" y="305" width="340" height="40" fill="#0f172a" stroke="#38bdf8" stroke-width="1.5" rx="6"/>
    <text x="220" y="330" fill="#38bdf8" font-family="system-ui, sans-serif" font-size="12" font-weight="bold" text-anchor="middle">TEXT / CODE SEGMENT (Read-Only Machine Instructions)</text>

    <!-- Low Address Label -->
    <text x="-40" y="335" fill="#64748b" font-family="monospace" font-size="11">0x00000000</text>
    <text x="-40" y="350" fill="#94a3b8" font-family="system-ui, sans-serif" font-size="9">(Low Memory)</text>
  </g>

  <!-- Right: Explanatory Legend -->
  <g transform="translate(480, 90)">
    <rect width="280" height="320" rx="8" fill="#f8fafc" stroke="#cbd5e1"/>
    <text x="20" y="30" fill="#0f172a" font-family="system-ui, sans-serif" font-size="13" font-weight="bold">Key Memory Takeaways:</text>

    <circle cx="25" cy="65" r="4" fill="#ef4444"/>
    <text x="38" y="70" fill="#1e293b" font-family="system-ui, sans-serif" font-size="11" font-weight="bold">Stack vs Heap Collision:</text>
    <text x="38" y="87" fill="#475569" font-family="system-ui, sans-serif" font-size="10">If stack &amp; heap meet, a Stack Overflow occurs.</text>

    <circle cx="25" cy="120" r="4" fill="#3b82f6"/>
    <text x="38" y="125" fill="#1e293b" font-family="system-ui, sans-serif" font-size="11" font-weight="bold">Heap Lifecycle:</text>
    <text x="38" y="142" fill="#475569" font-family="system-ui, sans-serif" font-size="10">Must be manually released via free() to prevent memory leaks.</text>

    <circle cx="25" cy="175" r="4" fill="#22c55e"/>
    <text x="38" y="180" fill="#1e293b" font-family="system-ui, sans-serif" font-size="11" font-weight="bold">BSS vs Data:</text>
    <text x="38" y="197" fill="#475569" font-family="system-ui, sans-serif" font-size="10">BSS is auto-zeroed at runtime start. Data segment stores initialized constants.</text>

    <circle cx="25" cy="230" r="4" fill="#0284c7"/>
    <text x="38" y="235" fill="#1e293b" font-family="system-ui, sans-serif" font-size="11" font-weight="bold">Text Protection:</text>
    <text x="38" y="252" fill="#475569" font-family="system-ui, sans-serif" font-size="10">Code segment is marked Read-Only (attempting to write causes Segmentation Fault).</text>
  </g>
</svg>
`)}`;

// Dennis Ritchie Portrait / Tribute Vector SVG
export const SVG_DENNIS_RITCHIE = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 400" width="100%" height="100%">
  <rect width="100%" height="100%" fill="#0f172a" rx="16"/>
  <circle cx="300" cy="140" r="70" fill="#1e293b" stroke="#38bdf8" stroke-width="3"/>
  <circle cx="300" cy="120" r="35" fill="#f8fafc"/>
  <path d="M 255 185 Q 300 155 345 185" fill="#f8fafc"/>
  <text x="300" y="250" fill="#ffffff" font-family="system-ui, sans-serif" font-size="20" font-weight="bold" text-anchor="middle">
    Dennis Ritchie (1941 – 2011)
  </text>
  <text x="300" y="275" fill="#38bdf8" font-family="system-ui, sans-serif" font-size="14" font-weight="bold" text-anchor="middle">
    Creator of the C Programming Language &amp; Co-Developer of UNIX
  </text>
  <rect x="50" y="305" width="500" height="60" rx="8" fill="#1e293b" stroke="#334155"/>
  <text x="300" y="330" fill="#94a3b8" font-family="system-ui, sans-serif" font-size="12" text-anchor="middle">
    "UNIX is basically a simple operating system, but you have to be a genius to understand the simplicity."
  </text>
  <text x="300" y="350" fill="#64748b" font-family="system-ui, sans-serif" font-size="11" text-anchor="middle">
    Bell Laboratories, 1972 — Turing Award Laureate
  </text>
</svg>
`)}`;

/**
 * Intelligent Image & Diagram Resolver
 * Analyzes image src, alt text, and filenames to return a valid image URL or high-res vector SVG
 */
export function resolveLessonImage(src: string, altText?: string): string {
  if (!src || !src.trim()) {
    // If no src provided but altText exists, try to find a matching diagram
    if (altText) {
      const cleanAlt = altText.toLowerCase().replace(/[^a-z0-9]/g, "");
      if (cleanAlt.includes("dennis") || cleanAlt.includes("ritchie")) return SVG_DENNIS_RITCHIE;
      if (cleanAlt.includes("compilat") || cleanAlt.includes("pipeline")) return SVG_COMPILATION_PIPELINE;
      if (cleanAlt.includes("memory") || cleanAlt.includes("stack") || cleanAlt.includes("heap")) return SVG_MEMORY_LAYOUT;
      if (cleanAlt.includes("structure") || cleanAlt.includes("sectionc")) return SVG_SECTION_C_STRUCTURE;
    }
    return "";
  }

  const trimmed = src.trim();

  // 1. Direct valid URLs, Base64 Data URLs, blobs, or server uploads: ALWAYS RETURN DIRECTLY
  if (
    trimmed.startsWith("http://") ||
    trimmed.startsWith("https://") ||
    trimmed.startsWith("data:image/") ||
    trimmed.startsWith("blob:") ||
    trimmed.startsWith("/uploads/") ||
    trimmed.startsWith("/api/images/") ||
    trimmed.startsWith("/api/media/") ||
    trimmed.startsWith("/")
  ) {
    return trimmed;
  }

  // 2. Check local browser cache for uploaded images by key or filename
  try {
    const cached = localStorage.getItem(`img_cache_${trimmed}`);
    if (cached) return cached;
    const cleanKey = trimmed.toLowerCase().replace(/[^a-z0-9._-]/g, "");
    const cachedKey = localStorage.getItem(`img_cache_${cleanKey}`);
    if (cachedKey) return cachedKey;
  } catch (e) {
    // Ignore storage errors
  }

  // 3. If it is a relative image filename like 'diagram.png' or 'slide_1.jpg', resolve to /uploads/
  if (/^[a-zA-Z0-9_\-.]+\.(png|jpe?g|webp|gif|svg)$/i.test(trimmed)) {
    return `/uploads/${trimmed}`;
  }

  // 4. Normalize placeholder search key (for legacy shorthand tags like "sectionC" or "dennis_ritchie")
  const cleanKey = trimmed.toLowerCase().replace(/[^a-z0-9]/g, "");

  // Match Dennis Ritchie
  if (
    cleanKey === "dennis" ||
    cleanKey === "ritchie" ||
    cleanKey.includes("dennisritchie") ||
    cleanKey.includes("founderofc") ||
    cleanKey.includes("fatherofc")
  ) {
    return SVG_DENNIS_RITCHIE;
  }

  // Match Section C / Structure of C
  if (
    cleanKey === "sectionc" ||
    cleanKey === "structureofc" ||
    cleanKey === "cstructure" ||
    cleanKey.includes("sectionc") ||
    cleanKey.includes("structureofc") ||
    cleanKey.includes("cprogramstructure")
  ) {
    return SVG_SECTION_C_STRUCTURE;
  }

  // Match Compilation Process / Build Pipeline
  if (
    cleanKey === "compilation" ||
    cleanKey === "pipeline" ||
    cleanKey.includes("compilationpipeline") ||
    cleanKey.includes("gccstages") ||
    cleanKey.includes("buildprocess")
  ) {
    return SVG_COMPILATION_PIPELINE;
  }

  // Match Memory Architecture / Stack & Heap
  if (
    cleanKey === "memory" ||
    cleanKey === "memorylayout" ||
    cleanKey === "stackheap" ||
    cleanKey.includes("memorylayout") ||
    cleanKey.includes("stackandheap")
  ) {
    return SVG_MEMORY_LAYOUT;
  }

  // Fallback: If it was just a generic figure tag like "sectionC"
  if (cleanKey.startsWith("sectionc") || cleanKey.startsWith("figurec")) {
    return SVG_SECTION_C_STRUCTURE;
  }

  return trimmed;
}
