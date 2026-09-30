import { Chapter, Lesson } from "../types";

export const PROBLEM_SOLVING_USING_C_CHAPTERS: Chapter[] = [
  // ==========================================
  // MODULE 1: Introduction to Programming & History of C
  // ==========================================
  {
    id: "chap-c-1-1",
    moduleId: "mod-c-1",
    courseId: "problem-solving-using-c",
    chapterNumber: 1,
    displayOrder: 1,
    title: "Introduction to Computer Programs & Programming Languages",
    shortDesc: "Definition of computer programs, language classification (low vs. high level), compiler mechanics, history of C, Dennis Ritchie at Bell Labs, and key features.",
    description: "Definition of computer programs, language classification (low vs. high level), compiler mechanics, history of C, Dennis Ritchie at Bell Labs, and key features.",
    status: "Published",
    difficulty: "Beginner",
    estimatedMinutes: 25,
    editorRequired: false,
    editorType: "none",
    learningObjectives: [
      "Define what constitutes a computer program.",
      "Distinguish between low-level languages (Machine, Assembly) and high-level languages.",
      "Understand the definition and function of a compiler.",
      "Chronologically trace the development of C from ALGOL, BCPL, and B to Bell Laboratories in 1972.",
      "Recognize Dennis Ritchie as the Father of C Programming.",
      "Identify the 8 major features of C programming language."
    ],
    theoryContent: `
> **Academic Note:** [www.bcacauverians.com](http://www.bcacauverians.com) — **C Notes**  
> **Author:** *Pemmaiah.U.T, HOD, Dept. of BCA, Cauvery College, Gonikoppal*

---

### What is a Computer Program?

A **computer program** is a collection of instructions for performing a specific task that is designed to solve a specific class of problems.

*Or*

A **Computer Program** is also known as set of instruction to solve a problem. A computer program is usually written by a **computer programmer** in a programming language.

---

### Types of Languages

#### 1. Low Level Languages
1. **Machine understandable Language.**
2. **Assembly** is common low level language.

#### 2. High Level Languages
1. High level Language is **Human understandable Language.**
2. **English** is Common example of High Level Language.

---

### Compiler

A **Compiler** is a program where the program written in high level language is converted to machine under stable language (Machine language).

---

### History of C Programming

* In **1960**, an international group found a programming language called **ALGOL** with basic features.
* Later in **1967**, a team headed by **Martin Richards** took few concepts from ALGOL and found a new programming language called **BCPL** (*Basic Combined Programming Language*).
* Later in the year **1970**, a team headed by **Ken Thompson** founded one more programming language called **B** which had the features from ALGOL and BCPL.
* In the year **1972**, team headed by **Dennis Ritchie** discovered a programming language called **C** at **Bell Laboratories**, ancestor of B which had the features of ALGOL, BCPL and C.
* **Dennis Ritchie** is also called as the **Father of C Programming**.
* By **1973**, **UNIX OS** was almost totally written in C.

---

### Programming Language Development Timeline

| Programming Language | Development Year | Developed by |
| :--- | :--- | :--- |
| **ALGOL** | 1960 | International Group |
| **BCPL** | 1967 | Martin Richards |
| **B** | 1970 | Ken Thompson |
| **Traditional C** | 1972 | Dennis Ritchie |
| **ANSI C** | 1989 | ANSI Committee |

---

### Founder of C, Dennis Ritchie

![Founder of C, Dennis Ritchie](/images/dennis_ritchie.svg)

---

### Features of C Programming

1. **Portable** — C is highly portable; this means that programs once written can be run on another machines with little or no modification.
2. **Structured programming language** — C is a structured programming language in the sense that we can break the program into parts using functions. So, it is easy to understand and modify.
3. **Speed** — The compilation and execution time of C language is fast.
4. **C can extend itself** — C language is extensible because it can easily adopt new features.
5. **Rich Library** — C provides a lot of inbuilt functions that makes the development fast.
6. **Programs written in C are efficient and fast.**
7. **C has rich set of operators.**
8. **Powerful**
   * Provides Wide verity of **'Data Types'**
   * Provides Wide verity of **'Functions'**
   * Provides useful **Control & Loop Control Statements**
`,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: new Date().toISOString()
  },
  {
    id: "chap-c-1-2",
    moduleId: "mod-c-1",
    courseId: "problem-solving-using-c",
    chapterNumber: 2,
    displayOrder: 2,
    title: "Structure of C Programming & Execution Steps",
    shortDesc: "The 6 structural sections of a C program (Documentation, Link, Definition, Global, main, Subprograms), steps to compile & run, and 10 core introduction tips.",
    description: "The 6 structural sections of a C program (Documentation, Link, Definition, Global, main, Subprograms), steps to compile & run, and 10 core introduction tips.",
    status: "Published",
    difficulty: "Beginner",
    estimatedMinutes: 30,
    editorRequired: true,
    editorType: "c",
    starterCode: `#include <stdio.h>

/* Documentation Section: First C Program */
void main()
{
    printf("Welcome to C Programming!\\n");
}`,
    learningObjectives: [
      "Memorize and describe the 6 sections comprising a standard C program structure.",
      "Understand the link section and header file inclusion.",
      "Explain the declaration and executable parts inside main().",
      "Execute the 4 steps to create, compile, run, and get output from C programs.",
      "Apply the 10 fundamental C programming rules and tips."
    ],
    theoryContent: `
> **Academic Note:** [www.bcacauverians.com](http://www.bcacauverians.com) — **C Notes**  
> **Author:** *Pemmaiah.U.T, HOD, Dept. of BCA, Cauvery College, Gonikoppal*

---

### Structure of C Programming

![Basic Structure of C Programs](/images/structure_of_c.svg)

---

### Structural Sections Explained

#### 1. Documentation Section
This section consists of comment lines which include the name of programmer, the author and other details like time and date of writing the program. Documentation section helps anyone to get an overview of the program.

#### 2. Link Section
The link section consists of the header files of the functions that are used in the program. It provides instructions to the compiler to link functions from the system library.

#### 3. Definition Section
All the symbolic constants are written in definition section. Macros are known as symbolic constants.

#### 4. Global Declaration Section
The global variables that can be used anywhere in the program are declared in global declaration section. This section also declares the user defined functions.

#### 5. main() Function Section
It is necessary have one \`main()\` function section in every C program. This section contains two parts:
* **Declaration part**
* **Executable part**

The declaration part declares all the variables that are used in executable part. These two parts must be written in between the opening and closing braces \`{ }\`. Each statement in the declaration and executable part must end with a semicolon (\`;\`). The execution of program starts at opening braces and ends at closing braces.

#### 6. Subprogram Section
The subprogram section contains all the user defined functions that are used to perform a specific task. These user defined functions are called in the \`main()\` function.

---

### STEPS TO WRITE C PROGRAMS AND GET THE OUTPUT:

Below are the steps to be followed for any C program to create and get the output. This is common to all C program and there is no exception whether its a very small C program or very large C program:

1. **Create the Program**
2. **Compile the Program** (Check Syntax Errors)
3. **Execute or Run** (Look for the logic Errors or link the library)
4. **Get the Output**

---

### C Programming Introduction: Tips

1. **Every C Program Should have exactly one main function**
2. **C Program Execution Always Starts from main.**
3. **Execution of C Program begins at Opening brace of function and ends at closing brace of the function**
4. **Generally all statements in c are written in Lowercase Letters.**
5. **Uppercase Letters are used for Symbolic names, output strings and messages**
6. **Every C statement must ends with semicolon**
7. **All variables must be declared with respective data types before using.**
8. **C is free form-Language**
9. **Comments can be inserted anywhere in C Program .**
10. **Braces are Generally Used for the Grouping of statements.**
`,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: new Date().toISOString()
  },

  // ==========================================
  // MODULE 2: C Tokens, Variables & Data Types
  // ==========================================
  {
    id: "chap-c-2-1",
    moduleId: "mod-c-2",
    courseId: "problem-solving-using-c",
    chapterNumber: 1,
    displayOrder: 1,
    title: "C Tokens & Identifiers",
    shortDesc: "The 6 types of C tokens, token breakdown in an example program, identifier definitions, rules for valid identifiers, and examples.",
    description: "The 6 types of C tokens, token breakdown in an example program, identifier definitions, rules for valid identifiers, and examples.",
    status: "Published",
    difficulty: "Beginner",
    estimatedMinutes: 30,
    editorRequired: true,
    editorType: "c",
    starterCode: `#include <stdio.h>

void main()
{
    int x, y, total;
    x = 10, y = 20;
    total = x + y;
    printf("Total = %d \\n", total);
}`,
    learningObjectives: [
      "Define what a C token is.",
      "List the 6 types of C tokens.",
      "Break down a C program into its constituent tokens, delimiters, and keywords.",
      "State the rules for declaring valid identifiers.",
      "Distinguish between valid and invalid identifier names."
    ],
    theoryContent: `
> **Academic Note:** [www.bcacauverians.com](http://www.bcacauverians.com) — **C Notes**  
> **Author:** *Pemmaiah.U.T, HOD, Dept. of BCA, Cauvery College, Gonikoppal*

---

### C Tokens

* A **programming token** is the basic component of source code.
* C tokens are the basic buildings blocks in C language which are constructed together to write a C program.
* Each and every smallest individual units in a C program are known as **C tokens**.

C tokens are of **six types**. They are:
1. **Keywords** (eg: \`int\`, \`while\`)
2. **Identifiers** (eg: \`main\`, \`total\`)
3. **Constants** (eg: \`10\`, \`20\`)
4. **Strings** (eg: \`"total"\`, \`"hello"\`)
5. **Special symbols** (eg: \`()\`, \`{}\`)
6. **Operators** (eg: \`+\`, \`/\`, \`-\`, \`*\`)

---

### C TOKENS EXAMPLE PROGRAM:

\`\`\`c
#include<stdio.h> 
void main()
{
int x, y, total; 
x = 10, y = 20;
total = x + y;
printf ("Total = %d \\n", total);
}
\`\`\`

**where,**
* \`main\` – identifier
* \`{,}\`, \`(,)\` – delimiter
* \`int\` – keyword
* \`x\`, \`y\`, \`total\` – identifier
* \`main\`, \`{\`, \`}\`, \`(\`, \`)\`, \`int\`, \`x\`, \`y\`, \`total\` – token

---

### Identifiers in C Program

* Each program elements in a C program are given a name called **identifiers**.
* Names given to identify Variables, functions and arrays are examples for identifiers. eg. \`x\` is a name given to integer variable in above program.

---

### Rules for Writing Identifiers

* An identifier can only have alphanumeric characters (\`a-z\`, \`A-Z\`, \`0-9\`) (i.e. letters & digits) and underscore (\`_\`) symbol.
* Identifier names must be unique.
* The first character must be an alphabet or underscore.
* You cannot use a keyword as identifiers.
* Only first thirty-one (31) characters are significant.
* Must not contain white spaces.
* Identifiers are case-sensitive.

#### Valid Examples:
\`a\`, \`b\`, \`add\`, \`_a\`, \`b1\`, \`a_b\`

#### Invalid Examples:
\`123\`, \`*ad\`, \`1a\`
`,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: new Date().toISOString()
  },
  {
    id: "chap-c-2-2",
    moduleId: "mod-c-2",
    courseId: "problem-solving-using-c",
    chapterNumber: 2,
    displayOrder: 2,
    title: "Keywords & Constants in C",
    shortDesc: "Complete list of 32 reserved keywords, constant definitions, const syntax, categories of constants (numeric & character), and examples.",
    description: "Complete list of 32 reserved keywords, constant definitions, const syntax, categories of constants (numeric & character), and examples.",
    status: "Published",
    difficulty: "Beginner",
    estimatedMinutes: 35,
    editorRequired: true,
    editorType: "c",
    starterCode: `#include <stdio.h>

void main()
{
    const int a = 20;
    printf("The value of a is %d\\n", a);
}`,
    learningObjectives: [
      "Understand reserve words and keywords in C.",
      "List all 32 reserved keywords in C language.",
      "Declare constants using the const keyword.",
      "Classify constants into numeric (integer, real) and character (single character, string) constants.",
      "Distinguish single character constants from string constants (e.g. 'G' vs \"G\")."
    ],
    theoryContent: `
> **Academic Note:** [www.bcacauverians.com](http://www.bcacauverians.com) — **C Notes**  
> **Author:** *Pemmaiah.U.T, HOD, Dept. of BCA, Cauvery College, Gonikoppal*

---

### Keywords in C

* Keywords are pre-defined words in a C compiler. The meaning of the word is already defined by the compiler.
* Keywords are also called as **Reserve Words**.
* Keywords can be used only for their intended purpose.
* Keywords can’t be used as programmer defined identifier.
* The keywords can’t be used as names for variables.
* There are around **32 keywords** in C Programming.

#### List of 32 reserved keywords in C language:

| | | |
| :--- | :--- | :--- |
| \`auto\` | \`double\` | \`int\` |
| \`break\` | \`else\` | \`long\` |
| \`case\` | \`enum\` | \`register\` |
| \`char\` | \`extern\` | \`return\` |
| \`const\` | \`float\` | \`short\` |
| \`continue\` | \`for\` | \`signed\` |
| \`default\` | \`goto\` | \`sizeof\` |
| \`do\` | \`if\` | \`static\` |
| \`struct\` | \`switch\` | \`typedef\` |
| \`union\` | \`unsigned\` | \`void\` |
| \`volatile\` | \`while\` | |

---

### Keywords Example Program:

\`\`\`c
#include<stdio.h> 
void main() 
{
int a;
float b; 
a=10,b=20;
printf("the values of a and b are %d , %f",a,b);
}
\`\`\`

**Output:**
\`\`\`
the values of a and b are 10 , 20.000000
\`\`\`

---

### Constant in C Program

Constants in C are the fixed values that are used in a program, and its value remains the same during the entire execution of the program.

\`const\` is a keyword and is used to declare constants.

#### Syntax:
\`\`\`c
const type constant_name;
\`\`\`

**Example:**
\`\`\`c
const int a=10;
\`\`\`

#### Constant Example Program:

\`\`\`c
#include<stdio.h>
void main()
{
const int a=20;
printf("The value of a is %d",a);
}
\`\`\`

**Output:**
\`\`\`
The value of a is 20.
\`\`\`

---

### Categories of Constants

Constants are categorized into two basic types, and each of these types has own subtypes/categories. These are:

#### Primary Constants:

##### 1. Numeric Constants
* **Integer Constants**
* **Real Constants**

##### 2. Character Constants
* **Single Character Constants**
* **String Constants**

---

### Integer Constant
It’s referring to a sequence of digits without fractional part. Integers are of three types viz:
1. **Decimal Integer** — The combination of numbers from 0-9. Examples: \`99\`, \`8\`, \`9000\`.
2. **Octal Integer** — The combination of numbers from 0-7 with the prefix \`0\`. Examples: \`04\`, \`02\`.
3. **Hexadecimal Integer** — The combination of numbers from 0-9 and A-f (10 to 15) with prefix \`0x\`. Examples: \`0xA\`, \`0x9\`, \`0xF\`.

---

### Real Constant
The numbers containing fractional parts is called as **Real Constant** or **Floating numbers**.  
Examples: \`99.00\`, \`45.6\`

---

### Character Constant
A character constant is a single alphabet, a single digit or a single special symbol enclosed within single quotes. The maximum length of a character constant is 1 character.  
Examples: \`'a'\`, \`'*'\`, \`'1'\`

---

### String Constant
These are a sequence of characters enclosed in double quotes, and they may include letters, digits, special characters, and blank spaces.

It is again to be noted that \`"G"\` and \`'G'\` are different – because \`"G"\` represents a string as it is enclosed within a pair of double quotes whereas \`'G'\` represents a single character.  
Examples: \`"Hello "\`, \`"a"\`.
`,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: new Date().toISOString()
  },
  {
    id: "chap-c-2-3",
    moduleId: "mod-c-2",
    courseId: "problem-solving-using-c",
    chapterNumber: 3,
    displayOrder: 3,
    title: "Data Types, Variables & Format Specifiers",
    shortDesc: "5 primary data types (int, float, double, char, void), memory sizes, variable declaration rules, and complete format specifiers table.",
    description: "5 primary data types (int, float, double, char, void), memory sizes, variable declaration rules, and complete format specifiers table.",
    status: "Published",
    difficulty: "Beginner",
    estimatedMinutes: 35,
    editorRequired: true,
    editorType: "c",
    starterCode: `#include <stdio.h>

void main()
{
    short int a = 10;
    int b = 20;
    long int c = 40000;
    float d = 1.2;
    double e = 90.3;
    char f = 'a';

    printf("%d, %d, %ld\\n", a, b, c);
    printf("%f, %lf, %c\\n", d, e, f);
}`,
    learningObjectives: [
      "Classify C data types into primary, derived, and user-defined.",
      "Understand the 5 primary data types and their memory storage sizes.",
      "Declare variables in C following identifier and syntax rules.",
      "Demonstrate format specifiers in printf statements.",
      "Memorize the format specifier and memory size table for all basic types."
    ],
    theoryContent: `
> **Academic Note:** [www.bcacauverians.com](http://www.bcacauverians.com) — **C Notes**  
> **Author:** *Pemmaiah.U.T, HOD, Dept. of BCA, Cauvery College, Gonikoppal*

---

### Data type in C

The type of a value a variable can store is called as **data type** in C.

C data types can be classified into 3 categories:
* **Primary data types or Fundamental data types.**
* **Derived data types.**
* **User defined data types.**

---

### Primary Data Types

There are basically 5 primary or fundamental data types available in C program. They are \`int\`, \`float\`, \`double\`, \`char\` and \`void\`.

#### 1. int –
* Integer data type allows a variable to store numeric values.
* \`"int"\` keyword is used to refer integer data type.
* \`int\` comes in two types: **signed** and **unsigned int**. \`signed int\` stores both positive and negative numbers whereas \`unsigned int\` stores only positive numbers.
* \`int\` again divided to 3 types based on the size of numbers it can store:
  * **short int** – 1 bytes and can store the numbers from the range \`-128\` to \`127\`.
  * **int** – 2 bytes and can store number from \`-32,768\` to \`+32,767\`.
  * **long int** – 4 bytes and can store number from \`-2,147,483,648\` to \`+2,147,483,647\`.

#### 2. Floating Point Data Types
Floating point data type consists of 2 types:
1. **float**
2. **double**

##### float:
* Float data type allows a variable to store decimal values.
* Storage size of float data type is 4 bytes. This also varies depend upon the processor in the CPU as \`"int"\` data type.
* We can use up-to 6 digits after decimal using float data type.
* For example, \`10.456789\` can be stored in a variable using float data type.

##### double:
* Double data type is also same as float data type which allows up-to 10 digits after decimal.
* The range for double datatype is from \`1E–37\` to \`1E+37\`.

#### 3. char:
* Character data type allows a variable to store only one character.
* Storage size of character data type is 1 byte. We can store only one character using character data type.
* \`"char"\` keyword is used to refer character data type.
* For example, \`'A'\` can be stored using char datatype. You can't store more than one character using char data type.

#### 4. void:
* \`void\` datatype does not return anything.

---

### Program Example: Demonstrating Primary Data Types

\`\`\`c
#include<stdio.h> 
void main()
{
short int a=10; 
int b=20;
long int c=40000; 
float d=1.2; 
double e=90.3; 
char f='a';
printf ("%d ,%d,%ld \\n",a,b,c);
printf("%f,%lf, %c", d,e,f);
}
\`\`\`

**Output:**
\`\`\`
10,20,40000.
1.200000,90.3000000000,a
\`\`\`

> **Note:**  
> \`%d\` specifiers are used to print short int and integer numbers.  
> \`%ld\` are used to print long integer numbers.  
> \`%f\` are used to print floating numbers.  
> \`%lf\` are used to print double numbers.  
> \`%c\` are used to print a single character.

---

### Variables in C

Variables are name given to memory location where data will be stored, retrieved and manipulated.

#### Syntax for declaring variables —
\`\`\`c
datatype variablename;
\`\`\`

**Example:**
\`\`\`c
int a; // here a is variable which can store integer numbers.
\`\`\`

#### Rules to be followed before declaring a variable name:
* A variable name can consist of Capital letters A-Z, lowercase letters a-z, digits 0-9, and the underscore character.
* The first character must be a letter or underscore.
* Blank spaces cannot be used in variable names.
* Special characters like \`#\`, \`$\` are not allowed.
* C keywords cannot be used as variable names.
* Variable names are case sensitive.

---

### Specifiers in C (Format) Table

| Data type | Format | Memory size |
| :--- | :--- | :--- |
| **unsigned char** | \`%c\` | 1 Byte |
| **char** | \`%c\` | 1 Byte |
| **int** | \`%d\` | 2 Bytes |
| **unsigned int** | \`%u\` | 2 Bytes |
| **long (or) long int** | \`%ld\` | 4 Bytes |
| **unsigned long (or) unsigned long int** | \`%lu\` | 4 Bytes |
| **float** | \`%f\` | 4 Bytes |
| **double** | \`%lf\` | 8 Bytes |
| **long double** | \`%Lf\` | 10 Bytes |
| **char[ ] (string)** | \`%s\` | |
| **Octal Base** | \`%o\` | |
| **Hexa decimal base** | \`%x\` | |
| **Memory address** | \`%p\` | |
`,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: new Date().toISOString()
  },

  // ==========================================
  // MODULE 3: Escape Sequences, Type Conversion & I/O Operations
  // ==========================================
  {
    id: "chap-c-3-1",
    moduleId: "mod-c-3",
    courseId: "problem-solving-using-c",
    chapterNumber: 1,
    displayOrder: 1,
    title: "Escape Sequences in C",
    shortDesc: "Definition of escape sequences, 9 escape characters (\\n, \\t, \\v, \\b, \\a, \\r, \\f, \\0, \\\"), newline example, and backspace example.",
    description: "Definition of escape sequences, 9 escape characters (\\n, \\t, \\v, \\b, \\a, \\r, \\f, \\0, \\\"), newline example, and backspace example.",
    status: "Published",
    difficulty: "Beginner",
    estimatedMinutes: 20,
    editorRequired: true,
    editorType: "c",
    starterCode: `#include <stdio.h>
#include <conio.h>

void main()
{
    printf("Welcome\\n");
    printf("Good Morning\\n");
}`,
    learningObjectives: [
      "Define escape sequence characters in C.",
      "Understand two-character combinations treated as a single formatting character.",
      "Implement newline \\n and backspace \\b in formatted output.",
      "Predict output when \\b overwrites preceding characters."
    ],
    theoryContent: `
> **Academic Note:** [www.bcacauverians.com](http://www.bcacauverians.com) — **C Notes**  
> **Author:** *Pemmaiah.U.T, HOD, Dept. of BCA, Cauvery College, Gonikoppal*

---

### Escape Sequence in C

C uses some backslash characters in output functions for formatting the output. These characters are called as **Escape sequence characters**. In these characters it consists of two characters, but it is treated as a single character.

* \`\\n\` – new line
* \`\\t\` – horizontal tab (default 8 spaces)
* \`\\v\` – vertical tab (default 1 line)
* \`\\b\` – back space
* \`\\a\` – alert (beep sound)
* \`\\r\` – Carriage return
* \`\\f\` – form feed
* \`\\0\` – null
* \`\\"\` – double quotes

---

### C – ESCAPE SEQUENCE EXAMPLE PROGRAM:

\`\`\`c
#include<stdio.h> 
#include<conio.h> 
void main()
{
printf("Welcome\\n"); 
printf("Good Morning");
}
\`\`\`

**Output:**
\`\`\`
Welcome 
Good Morning
\`\`\`

---

### C – EXAMPLE PROGRAM USING BACKSPACE:

\`\`\`c
#include<stdio.h> 
#include<conio.h> 
void main()
{
printf("Welcome\\b"); 
printf("Good Morning");
}
\`\`\`

**Output:**
\`\`\`
WelcomGood Morning
\`\`\`
`,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: new Date().toISOString()
  },
  {
    id: "chap-c-3-2",
    moduleId: "mod-c-3",
    courseId: "problem-solving-using-c",
    chapterNumber: 2,
    displayOrder: 2,
    title: "Type Conversion in C (Type Casting)",
    shortDesc: "Implicit type conversion (automatic promotion) with ASCII values, and explicit type casting with syntax (data_type)expression and worked examples.",
    description: "Implicit type conversion (automatic promotion) with ASCII values, and explicit type casting with syntax (data_type)expression and worked examples.",
    status: "Published",
    difficulty: "Beginner",
    estimatedMinutes: 25,
    editorRequired: true,
    editorType: "c",
    starterCode: `#include <stdio.h>

void main()
{
    // Implicit conversion
    int x = 10;
    char y = 'a'; // ASCII 97
    x = x + y;
    float z = x + 1.0;
    printf("x = %d, z = %f\\n", x, z);

    // Explicit conversion
    double d = 1.2;
    int sum = (int)d + 1;
    printf("sum = %d\\n", sum);
}`,
    learningObjectives: [
      "Define type casting and type conversion.",
      "Understand automatic type promotion (implicit conversion).",
      "Trace ASCII character promotion to integer in arithmetic operations.",
      "Apply explicit type casting syntax: (data_type)expression.",
      "Predict numerical outcomes of explicit float/double to integer truncation."
    ],
    theoryContent: `
> **Academic Note:** [www.bcacauverians.com](http://www.bcacauverians.com) — **C Notes**  
> **Author:** *Pemmaiah.U.T, HOD, Dept. of BCA, Cauvery College, Gonikoppal*

---

### Type Conversion in C

Type casting is a way to convert a variable from one data type to another data type.

For example, if you want to store a \`'long'\` value into a simple integer then you can type cast \`'long'\` to \`'int'\`.

There are two types of type conversion:
1. **Implicit Type Conversion**
2. **Explicit Type Conversion**

---

### Implicit Type Conversion (Automatic Type Conversion)

* When the type conversion is performed automatically by the compiler without programmers intervention, such type of conversion is known as **implicit type conversion** or **type promotion**.

#### Example of Type Implicit Conversion:

\`\`\`c
// An example of implicit conversion 
#include<stdio.h>
void main()
{
int x = 10; // integer x 
char y = 'a'; // character c

// y implicitly converted to int. ASCII
// value of 'a' is 97 
x = x + y;

// x is implicitly converted to float 
float z = x + 1.0;

printf("x = %d, z = %f", x, z);
}
\`\`\`

**Output:**
\`\`\`
x = 107, z = 108.000000
\`\`\`

---

### Explicit Type Conversion (Type Casting)

The type conversion performed by the programmer by posing the data type of the expression of specific type is known as **explicit type conversion**.

The explicit type conversion is also known as **type casting**.

#### Type casting in C is done in the following form:
\`\`\`c
(data_type)expression;
\`\`\`
*where \`data_type\` is any valid C data type, and \`expression\` may be constant, variable or expression.*

#### Example Program: Demonstrating Explicit Type Casting

\`\`\`c
// C program to demonstrate explicit type casting 
#include<stdio.h>
void main()
{
double x = 1.2;

// Explicit conversion from double to int 
int sum = (int)x + 1;

printf("sum = %d", sum);
}
\`\`\`

**Output:**
\`\`\`
sum = 2
\`\`\`
`,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: new Date().toISOString()
  },
  {
    id: "chap-c-3-3",
    moduleId: "mod-c-3",
    courseId: "problem-solving-using-c",
    chapterNumber: 3,
    displayOrder: 3,
    title: "Input and Output Statement in C (printf & scanf)",
    shortDesc: "printf() output function syntax & examples, scanf() input function syntax & address list, and interactive addition of two numbers program.",
    description: "printf() output function syntax & examples, scanf() input function syntax & address list, and interactive addition of two numbers program.",
    status: "Published",
    difficulty: "Beginner",
    estimatedMinutes: 25,
    editorRequired: true,
    editorType: "c",
    starterCode: `#include <stdio.h>

void main()
{
    int a, b, c;
    printf("Please enter any two numbers: \\n");
    scanf("%d %d", &a, &b);
    c = a + b;
    printf("The addition of two number is: %d\\n", c);
}`,
    learningObjectives: [
      "Use printf() as the standard C output library function.",
      "Use scanf() as the standard C input library function.",
      "Understand format strings and address-of (&) operator in scanf().",
      "Write interactive programs taking console input and displaying results."
    ],
    theoryContent: `
> **Academic Note:** [www.bcacauverians.com](http://www.bcacauverians.com) — **C Notes**  
> **Author:** *Pemmaiah.U.T, HOD, Dept. of BCA, Cauvery College, Gonikoppal*

---

### Input and Output Statement in C

#### printf()
* In C programming language, \`printf()\` function is used to print the *“character, string, float, integer, octal and hexadecimal values”* onto the output screen.
* \`printf\` statements are usually referred as **output statement**.
* It is one of the library functions.

##### Syntax:
\`\`\`c
printf("format string", argument list);
\`\`\`

**Example:**
\`\`\`c
printf("%d", a);
\`\`\`

---

#### scanf()
* This function is usually used as an **input statement**.
* The argument list contains a list of variables each preceded by the address list (\`&\`) and separated by comma.

##### Syntax:
\`\`\`c
scanf("format string", argument list);
\`\`\`

**Example:**
\`\`\`c
scanf("%d", &a);
\`\`\`

---

### Program Example: Demonstrating printf() and scanf()

\`\`\`c
#include<stdio.h>
void main()
{
int a,b,c;
printf("Please enter any two numbers: \\n"); 
scanf("%d %d", &a, &b);
c = a + b;
printf("The addition of two number is: %d", c);
}
\`\`\`

**Output:**
\`\`\`
Please enter any two numbers:
12
3
The addition of two number is: 15
\`\`\`

*The above program \`scanf()\` is used to take input from the user, and respectively \`printf()\` is used to display output result on the screen.*
`,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: new Date().toISOString()
  },

  // ==========================================
  // MODULE 4: Operators, Expressions & Error Types
  // ==========================================
  {
    id: "chap-c-4-1",
    moduleId: "mod-c-4",
    courseId: "problem-solving-using-c",
    chapterNumber: 1,
    displayOrder: 1,
    title: "Arithmetic, Relational & Assignment Operators",
    shortDesc: "Operators & expressions definitions, 8 types of operators, arithmetic (+, -, *, /, %), relational (<, >, <=, >=, ==, !=), and assignment (=, +=, -=, *=, /=, %=) operators with full code examples.",
    description: "Operators & expressions definitions, 8 types of operators, arithmetic (+, -, *, /, %), relational (<, >, <=, >=, ==, !=), and assignment (=, +=, -=, *=, /=, %=) operators with full code examples.",
    status: "Published",
    difficulty: "Beginner",
    estimatedMinutes: 35,
    editorRequired: true,
    editorType: "c",
    starterCode: `#include <stdio.h>

void main()
{
    int i = 3, j = 7, p, q, r, s, t;
    p = i + j;
    q = i - j;
    r = i * j;
    s = i / j;
    t = i % j;

    printf("sum of two numbers is %d .\\n", p);
    printf("sub of two numbers is %d .\\n", q);
    printf("mul of two numbers is %d .\\n", r);
    printf("div of two numbers is %d .\\n", s);
    printf("mod of two numbers is %d .\\n", t);
}`,
    learningObjectives: [
      "Define operators, operands, and algebraic expressions in C.",
      "List the 8 categories of C operators.",
      "Implement arithmetic operations including modulus (%).",
      "Evaluate relational conditions returning 0 for false and 1 for true.",
      "Use compound assignment operators (+=, -=, *=, /=, %=)."
    ],
    theoryContent: `
> **Academic Note:** [www.bcacauverians.com](http://www.bcacauverians.com) — **C Notes**  
> **Author:** *Pemmaiah.U.T, HOD, Dept. of BCA, Cauvery College, Gonikoppal*

---

### Operators and Expressions in C

* C operators are symbols that are used to perform mathematical or logical manipulations. C programming language is rich with built-in operators.
* These C operators join individual constants and variables to form expressions.
* Operators, functions, constants and variables are combined together to form expressions.
* Consider the expression \`A + B * 5\`. where, \`+\`, \`*\` are operators, \`A\`, \`B\` are variables, \`5\` is constant and \`A + B * 5\` is an expression.

---

### Types of Operators in C

C language offers many types of operators. They are:
1. **Arithmetic operators**
2. **Assignment operators**
3. **Relational operators**
4. **Logical operators**
5. **Bit wise operators**
6. **Conditional operators (ternary operators)**
7. **Increment/decrement operators**
8. **Special operators.**

---

### Arithmetic Operators

Arithmetic Operators are used to performing mathematical calculations like addition (\`+\`), subtraction (\`-\`), multiplication (\`*\`), division (\`/\`) and modulus (\`%\`).

| Operator | Description |
| :---: | :--- |
| **+** | Addition |
| **–** | Subtraction |
| ***** | Multiplication |
| **/** | Division |
| **%** | Modulus |

#### Program Example: Demonstrating Arithmetic Operators

\`\`\`c
#include <stdio.h>
void main()
{
int i=3,j=7,p,q,r,s,t; /* Variables Defining and Assign values */ 
p=i+j;
q=i-j; 
r=i*j; 
s=i/j; 
t=i%j;
printf("sum of two numbers is %d .\\n", p); 
printf("sub of two numbers is %d .\\n", q); 
printf("mul of two numbers is %d .\\n", r); 
printf("div of two numbers is %d .\\n", s); 
printf("mod of two numbers is %d .\\n", t);
}
\`\`\`

**Output:**
\`\`\`
sum of two numbers is 10 . 
sub of two numbers is -4 .
mul of two numbers is 21 . 
div of two numbers is 0 . 
mod of two numbers is 3 .
\`\`\`

---

### Relational Operators in C

Relational operators are used to find the relation between two variables or expressions. It evaluates to \`0\` if the condition is **false** and \`1\` if it is **true**.

There are basically 6 relational operators in C:

| Operator | Meaning |
| :---: | :--- |
| **<** | Less than |
| **>** | Greater than |
| **<=** | Less than or equal to |
| **>=** | Greater than or equal to |
| **==** | Equal to |
| **!=** | Not equal to |

#### Expression Evaluation Table (where \`a = 100\` and \`b = 4\`):

| Expression | Interpretation |
| :--- | :--- |
| \`a < b\` | **False** |
| \`a > b\` | **True** |
| \`a <= b\` | **False** |
| \`a >= b\` | **True** |
| \`a == b\` | **False** |
| \`a != b\` | **True** |

---

### Assignment Operator in C

An Assignment operator is used to form an assignment expression, which assigns the value to an identifier. The most commonly used assignment operator is \`=\`.

Other forms of assignment operators exist that are obtaining various operators such as \`+\`, \`-\`, \`*\`, \`/\`, \`%\` etc with the \`=\` sign:

| Operator | Equation |
| :---: | :--- |
| **+=** | \`i = i + 1\` |
| **-=** | \`i = i - 10\` |
| ***=** | \`i = i * 11\` |
| **/=** | \`i = i / 12\` |
| **%=** | \`i = i % 5\` |

#### Program Example: Assignment Operator

\`\`\`c
#include<stdio.h> 
#include<conio.h> 
void main()
{
int a=123,b; 
b=a+2; 
clrscr();
printf("Value of a = %d\\n",a); 
printf("Value of b =%d ",b); 
getch();
}
\`\`\`

**Output:**
\`\`\`
Value of a = 123
Value of b = 125
\`\`\`
`,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: new Date().toISOString()
  },
  {
    id: "chap-c-4-2",
    moduleId: "mod-c-4",
    courseId: "problem-solving-using-c",
    chapterNumber: 2,
    displayOrder: 2,
    title: "Increment/Decrement, Logical, Bitwise, Special Operators & Errors",
    shortDesc: "Pre/post increment & decrement, logical (&&, ||, !), bitwise binary math (&, |, ^, ~, <<, >>), conditional operator (? :), sizeof, clrscr(), getch(), Turbo C IDE layout, and compile vs. runtime errors.",
    description: "Pre/post increment & decrement, logical (&&, ||, !), bitwise binary math (&, |, ^, ~, <<, >>), conditional operator (? :), sizeof, clrscr(), getch(), Turbo C IDE layout, and compile vs. runtime errors.",
    status: "Published",
    difficulty: "Beginner",
    estimatedMinutes: 45,
    editorRequired: true,
    editorType: "c",
    starterCode: `#include <stdio.h>
#include <conio.h>

void main()
{
    int a = 10, b = 5;
    a > b ? printf("%d is the biggest\\n", a) : printf("%d is the biggest\\n", b);

    printf("Size of Integer: %lu bytes\\n", sizeof(a));
}`,
    learningObjectives: [
      "Differentiate pre-increment/decrement (++i, --i) from post-increment/decrement (i++, i--).",
      "Evaluate logical expressions with &&, ||, and ! operators.",
      "Perform bitwise AND, OR, and XOR calculations at the binary bit level.",
      "Use conditional ternary operator (? :) as concise decision expressions.",
      "Measure data type sizes using sizeof.",
      "Understand the purpose and placement of clrscr() and getch() in conio.h.",
      "Distinguish compile-time syntax errors from run-time logic errors."
    ],
    theoryContent: `
> **Academic Note:** [www.bcacauverians.com](http://www.bcacauverians.com) — **C Notes**  
> **Author:** *Pemmaiah.U.T, HOD, Dept. of BCA, Cauvery College, Gonikoppal*

---

### Increment and Decrement Operator

**Increment Operators** are used to increase the value of the variable by one and **Decrement Operators** are used to decrease the value of the variable by one in C programs.

Both increment and decrement operator are used on a single operand or variable, so it is called as a **unary operator**. Unary operators are having higher priority than the other operators it means unary operators are executed before other operators.

* \`++\` – increment operator
* \`--\` – decrement operator

#### Types of Increment Operator:
* **pre-increment**
* **post-increment**

---

#### 1. pre-increment (\`++variable\`)
In pre-increment, first increment the value of variable and then use inside the expression (initialize into another variable).

##### Syntax:
\`\`\`c
++variable;
\`\`\`

##### Example Program: pre-increment
\`\`\`c
#include<stdio.h> 
#include<conio.h>
void main()
{
int x,i; 
i=10;
x=++i;
printf("x: %d",x);
printf("i: %d",i); 
getch();
}
\`\`\`

**Output:**
\`\`\`
x: 11
i: 11
\`\`\`

---

#### 2. post-increment (\`variable++\`)
In post-increment, first the value of variable is used in the expression (initialize into another variable) and then increment the value of variable.

##### Syntax:
\`\`\`c
variable++;
\`\`\`

##### Example Program: post-increment
\`\`\`c
#include<stdio.h> 
#include<conio.h> 
void main()
{
int x,i; 
i=10;
x=i++;
printf("x: %d",x);
printf("i: %d",i); 
getch();
}
\`\`\`

**Output:**
\`\`\`
x: 10
i: 11
\`\`\`

---

### Types of Decrement Operator:
* **pre-decrement**
* **post-decrement**

#### 1. pre-decrement (\`--variable\`)
In pre-decrement, first decrement the value of variable and then use inside the expression.

##### Example Program: pre-decrement
\`\`\`c
#include<stdio.h> 
#include<conio.h>
void main() 
{
int x,i; 
i=10;
x=--i;
printf("x: %d",x);
printf("i: %d",i); 
getch();
}
\`\`\`

**Output:**
\`\`\`
x: 9
i: 9
\`\`\`

---

#### 2. post-decrement (\`variable--\`)
In post-decrement, first value of variable is used in the expression and then decrement the value of variable.

##### Example Program: post-decrement
\`\`\`c
#include<stdio.h> 
#include<conio.h>
void main()
{
int x,i; 
i=10;
x=i--;
printf("x: %d",x); 
printf("i: %d",i); 
getch();
}
\`\`\`

**Output:**
\`\`\`
x: 10
i: 9
\`\`\`

---

### Logical Operators

* A Logical operator is used to compare or evaluate logical and relational expression.
* There are three logical operators in C language:

| Operator | Meaning |
| :---: | :--- |
| **&&** | Logical AND |
| **\|\|** | Logical OR |
| **!** | Logical NOT |

Logical operators are used to calculate the value of logical expressions, i.e. expressions that the only values that can take operands are **True** or **False**.

#### Logical Operator Evaluation Table (Assume \`A = 1\` and \`B = 0\`):

| Operator | Description | Example |
| :---: | :--- | :--- |
| **&&** | Called Logical AND operator. If both the operands are non-zero, then the condition becomes true. | \`(A && B)\` is **false**. |
| **\|\|** | Called Logical OR Operator. If any of the two operands is non-zero, then the condition becomes true. | \`(A \|\| B)\` is **true**. |
| **!** | Called Logical NOT Operator. It is used to reverse the logical state of its operand. If a condition is true, then Logical NOT operator will make it false. | \`!(A && B)\` is **true**. |

---

### Bitwise Operator

In arithmetic-logic unit (which is within the CPU), mathematical operations like: addition, subtraction, multiplication and division are done in bit-level. To perform bit-level operations in C programming, **bitwise operators** are used.

| Operators | Meaning of operators |
| :---: | :--- |
| **&** | Bitwise AND |
| **\|** | Bitwise OR |
| **^** | Bitwise XOR |
| **~** | Bitwise complement |
| **<<** | Shift left |
| **>>** | Shift right |

---

#### 1. Bitwise AND operator \`&\`
The output of bitwise AND is \`1\` if the corresponding bits of two operands is \`1\`. If either bit of an operand is \`0\`, the result of corresponding bit is evaluated to \`0\`.

Let us suppose the bitwise AND operation of two integers **12** and **25**:
\`\`\`
12 = 00001100 (In Binary)
25 = 00011001 (In Binary)

Bit Operation of 12 and 25:
  00001100
& 00011001
----------
  00001000 = 8 (In decimal)
\`\`\`

---

#### 2. Bitwise OR operator \`|\`
The output of bitwise OR is \`1\` if at least one corresponding bit of two operands is \`1\`. In C Programming, bitwise OR operator is denoted by \`|\`.

\`\`\`
12 = 00001100 (In Binary)
25 = 00011001 (In Binary)

Bitwise OR Operation of 12 and 25:
  00001100
| 00011001
----------
  00011101 = 29 (In decimal)
\`\`\`

---

#### 3. Bitwise XOR (exclusive OR) operator \`^\`
The result of bitwise XOR operator is \`1\` if the corresponding bits of two operands are opposite. It is denoted by \`^\`.

\`\`\`
12 = 00001100 (In Binary)
25 = 00011001 (In Binary)

Bitwise XOR Operation of 12 and 25:
  00001100
^ 00011001
----------
  00010101 = 21 (In decimal)
\`\`\`

---

### Conditional Operator (Ternary Operator)

* The conditional expression can be used as shorthand for some if-else statements.
* Conditional operator is also called as **ternary operator**.
* This operator consist of two symbols: the question mark (\`?\`) and the colon (\`:\`).

#### General Syntax:
\`\`\`c
Identifier = (test expression) ? Expression1 : Expression2;
\`\`\`

*This is an expression, not a statement, so it represents a value. The operator works by evaluating test expression. If it is true (non-zero), it evaluates and returns expression1. Otherwise, it evaluates and returns expression2.*

#### Program Example: Conditional Operator
\`\`\`c
#include<stdio.h>
#include<conio.h> 
void main()
{
int a, b;
clrscr();
printf("Enter first number \\n"); 
scanf("%d",&a);
printf("Enter second number\\n"); 
scanf("%d",&b);
a>b?printf("%d no is the biggest no ",a):printf("%d no is the biggest no ",b); 
getch();
}
\`\`\`

**Case 1:** enter \`10\` for \`a\` and \`5\` for \`b\`  
**Output:** \`10 is the biggest no.\`

**Case 2:** enter \`5\` for \`a\` and \`10\` for \`b\`  
**Output:** \`10 is the biggest no.\`

---

### Special Operators

#### 1. Comma Operator \`,\`
Comma operator is a set of expression separated by comma is a valid constant in the C language. For example \`i\` and \`j\` are declared by the statements:
\`\`\`c
int i,j;
\`\`\`

#### 2. Sizeof Operator
The \`sizeof\` operator is used to get the size of data type or variables. This operator returns the size of its variable in bytes.

##### Syntax:
\`\`\`c
sizeof(variable)
\`\`\`

##### Program Example: sizeof Operator
\`\`\`c
#include<stdio.h> 
#include<conio.h>
void main()
{
int a; 
float b; 
double c; 
char d;
printf("Size of Integer: %d bytes\\n",sizeof(a)); 
printf("Size of float: %d bytes\\n",sizeof(b)); 
printf("Size of double: %d bytes\\n",sizeof(c)); 
printf("Size of character: %d byte\\n",sizeof(d)); 
getch();
}
\`\`\`

**Output:**
\`\`\`
Size of Integer: 2
Size of float: 4
Size of double: 8
Size of character: 1
\`\`\`

---

### Note and Know the Fact:

#### clrscr()
It is a predefined function in \`"conio.h"\` (*console input output header file*) used to clear the console screen. It is a predefined function, by using this function we can clear the data from console (Monitor). Using of \`clrscr()\` is always optional but it should be placed after variable or function declaration only.

#### getch()
It is a predefined function in \`"conio.h"\` (*console input output header file*) will tell to the console wait for some time until a key is hit given after running of program.

By using this function we can read a character directly from the keyboard. Generally \`getch()\` are placed at end of the program.

---

### Turbo C IDE Placement Diagram

![Turbo C IDE Screen Layout](/images/turboc_ide_layout.svg)

---

### Types of Error in C

Error is a abnormal condition whenever it occurs execution of the program is stopped. These are mainly classified into following types:

1. **Compile Time Error**
2. **Run time error**

#### Compile time error
If any error is generated at the time of compilation is known as **compile time error**, in general these are raised while breaking down the rules and regulations of programming language.

**Compile Time Error Examples:**  
Missing semicolon, writing keyword in upper case, writing variable declaration/initialization after calling \`clrscr()\` function.  
*Compile time errors are also known as **syntax errors**.*

#### Run time error
If any error is generated at run time is known as **runtime error**, in general these are raised because of writing wrong logics in the program.
`,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: new Date().toISOString()
  },

  // ==========================================
  // MODULE 5: Control Statements & Decision Making
  // ==========================================
  {
    id: "chap-c-5-1",
    moduleId: "mod-c-5",
    courseId: "problem-solving-using-c",
    chapterNumber: 1,
    displayOrder: 1,
    title: "If Statements & Decision Making Structures",
    shortDesc: "4 types of if statements: Simple if, if...else, nested if...else, and else if ladder with syntax, logic flow, and complete code examples.",
    description: "4 types of if statements: Simple if, if...else, nested if...else, and else if ladder with syntax, logic flow, and complete code examples.",
    status: "Published",
    difficulty: "Intermediate",
    estimatedMinutes: 40,
    editorRequired: true,
    editorType: "c",
    starterCode: `#include <stdio.h>
#include <conio.h>

void main()
{
    int a, b, c;
    printf("Enter 3 numbers: \\n");
    scanf("%d%d%d", &a, &b, &c);

    if (a > b && a > c)
    {
        printf("a is the biggest no\\n");
    }
    else if (b > c && b > a)
    {
        printf("b is the biggest\\n");
    }
    else
    {
        printf("c is the biggest\\n");
    }
}`,
    learningObjectives: [
      "Understand decision-making and conditional statements in C.",
      "Construct simple if statements.",
      "Implement if...else two-way branching.",
      "Nest multiple if...else statements to resolve complex decisions (e.g. greatest of 3 numbers).",
      "Structure multi-branch decisions using the else-if ladder construct."
    ],
    theoryContent: `
> **Academic Note:** [www.bcacauverians.com](http://www.bcacauverians.com) — **C Notes**  
> **Author:** *Pemmaiah.U.T, HOD, Dept. of BCA, Cauvery College, Gonikoppal*

---

### Decision Making Statements

C conditional statements allow you to make a decision, based upon the result of a condition. These statements are called as **Decision Making Statements** or **Conditional Statements**.

#### Conditional Statements in C:
Under if we have **four types** of if statements:
1. **If statement** (Simple if)
2. **If else**
3. **Nested if else**
4. **else if ladder**

*Other control statements include:*
* **Switch statements**
* **Unconditional statements – goto statements**

---

### 1. Simple if statement

The general form of a simple if statement is:

\`\`\`c
if(expression)
{
statement inside;
}
statement outside;
\`\`\`

*If the expression returns true, then the statement-inside will be executed, otherwise statement-inside is skipped and only the statement-outside is executed.*

#### Program Example: Simple if
\`\`\`c
#include <stdio.h> 
void main( )
{ 
int x, y; 
x = 15;
y = 13;
if (x > y )
{
printf("x is greater than y");
}
}
\`\`\`

**Output:**
\`\`\`
x is greater than y
\`\`\`

---

### 2. if...else statement

The general form of a simple if...else statement is:

\`\`\`c
if(expression)
{
statement block1;
}
else
{
statement block2;
}
\`\`\`

*If the expression is true, the statement-block1 is executed, else statement-block1 is skipped and statement-block2 is executed.*

#### Program Example: if...else
\`\`\`c
#include <stdio.h> 
#include<conio.h> 
void main( )
{
int x, y; 
x = 15;
y = 18;
if (x > y )
{
printf("x is greater than y");
}
else
{
printf("y is greater than x");
}
getch();
}
\`\`\`

**Output:**
\`\`\`
y is greater than x
\`\`\`

---

### 3. Nested if ... else statement

The general form of a nested if...else statement is:

\`\`\`c
if( expression )
{
if( expression1 )
{
statement block1;
}
else
{
statement block2;
}
}
else
{
statement block3;
}
\`\`\`

*If expression is false then statement-block3 will be executed, otherwise the execution continues and enters inside the first if to perform the check for the next if block, where if expression 1 is true the statement-block1 is executed otherwise statement-block2 is executed.*

#### Program Example: Nested if...else (Greatest of 3 Numbers)

\`\`\`c
#include <stdio.h>
void main( )
{
int a, b, c;
printf("Enter 3 numbers..."); 
scanf("%d%d%d",&a,&b,&c); 
if(a > b)
{
if(a > c)
{
printf("a is the greatest");
}
else
{
printf("c is the greatest"); 
}
}
else
{
if(b > c)
{
printf("b is the greatest");
}
else
{
printf("c is the greatest");
}
}
}
\`\`\`

**Output:**
\`\`\`
Enter 3 numbers
10 20 30
c is the greatest
\`\`\`

---

### 4. else if ladder

The general form of else-if ladder is:

\`\`\`c
if(expression1)
{
statement block1;
}
else if(expression2)
{
statement block2;
}
else if(expression3 )
{
statement block3;
}
else
default statement;
\`\`\`

*The expression is tested from the top (of the ladder) downwards. As soon as a true condition is found, the statement associated with it is executed.*

#### Program Example: else if ladder (Greatest of 3 Numbers)

\`\`\`c
#include<stdio.h> 
#include<conio.h>
void main()
{
int a,b,c;
clrscr();
printf("Enter 3 numbers \\n"); 
scanf("%d%d%d",&a,&b,&c); 
if(a>b && a>c)
{
printf("a is the biggest no ");
}
else if(b>c && b>a)
{
printf("b is the biggest ");
}
else
{
printf("c is the biggest ");
}
getch();
}
\`\`\`

**Output:**
\`\`\`
Enter 3 numbers
20 70 8
b is the biggest .
\`\`\`
`,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: new Date().toISOString()
  },
  {
    id: "chap-c-5-2",
    moduleId: "mod-c-5",
    courseId: "problem-solving-using-c",
    chapterNumber: 2,
    displayOrder: 2,
    title: "Switch Statement & Goto Statement",
    shortDesc: "Switch statement general syntax, 5 rules for applying switch, day of week example (1 to 7), and unconditional goto jumps (forward & backward).",
    description: "Switch statement general syntax, 5 rules for applying switch, day of week example (1 to 7), and unconditional goto jumps (forward & backward).",
    status: "Published",
    difficulty: "Intermediate",
    estimatedMinutes: 35,
    editorRequired: true,
    editorType: "c",
    starterCode: `#include <stdio.h>
#include <conio.h>

void main()
{
    int ch = 5;
    switch(ch)
    {
        case 1: printf("Today is Monday\\n"); break;
        case 2: printf("Today is Tuesday\\n"); break;
        case 3: printf("Today is Wednesday\\n"); break;
        case 4: printf("Today is Thursday\\n"); break;
        case 5: printf("Today is Friday\\n"); break;
        case 6: printf("Today is Saturday\\n"); break;
        case 7: printf("Today is Sunday\\n"); break;
        default: printf("Only enter value 1 to 7\\n");
    }
}`,
    learningObjectives: [
      "Understand multi-way branching using switch statements.",
      "List the 5 rules for applying switch statements in C.",
      "Write switch blocks with case values and default fallbacks.",
      "Understand unconditional jump transfers using goto.",
      "Distinguish forward jump from backward jump using goto labels."
    ],
    theoryContent: `
> **Academic Note:** [www.bcacauverians.com](http://www.bcacauverians.com) — **C Notes**  
> **Author:** *Pemmaiah.U.T, HOD, Dept. of BCA, Cauvery College, Gonikoppal*

---

### Switch Statements

**Switch statement** is a control statement that allows us to choose only one choice among the many given choices. The expression in switch evaluates to return an integral value, which is then compared to the values present in different cases. It executes that block of code which matches the case value. If there is no match, then default block is executed (if present).

#### General form of switch statement:

\`\`\`c
switch(expression)
{
case value-1:
block-1; 
break;
case value-2:
block-2; 
break;
case value-3:
block-3; 
break;
case value-4:
block-4; 
break;
default:
default-block; 
break;
}
\`\`\`

---

### Rules for apply switch

1. **With switch statement use only \`int\`, \`char\` data type.**
2. **You can use any number of case statements within a switch.**
3. **Value for a case must be same as the variable in switch .**
4. **The case label must end with a colon (\`:\`).**
5. **\`break\` statements are used to exit the switch block.**

---

### Program Example: Switch Statement (Days of Week)

\`\`\`c
#include<stdio.h> 
#include<conio.h>
void main()
{
int ch; 
clrscr();
printf("Enter any number (1 to 7)"); 
scanf("%d",&ch);
switch(ch)
{
case 1:
printf("Today is Monday");
break; 
case 2:
printf("Today is Tuesday");
break; 
case 3:
printf("Today is Wednesday");
break; 
case 4:
printf("Today is Thursday");
break; 
case 5:
printf("Today is Friday");
break; 
case 6:
printf("Today is Saturday");
break; 
case 7:
printf("Today is Sunday");
break; 
default:
printf("Only enter value 1 to 7");
}
getch();
}
\`\`\`

**Output:**
\`\`\`
Enter any number (1 to 7): 5 
Today is Friday
\`\`\`

---

### Goto Statement

* The **goto statement** is used to alter the normal sequence of program execution by transferring control to some other part of the program unconditionally.

#### Syntax:
\`\`\`c
goto label;
\`\`\`

A **label** is an identifier required for goto statement to a place where the branch is to be made. A label is a valid variable name which is followed by a colon (\`:\`) and is put immediately before the statement where the control needs to be jumped/transferred unconditionally.

---

#### 1. Forward Jump:
\`\`\`c
goto label;
- - - - - -
- - - - - - - - 
label:
statement - X;
/* This the forward jump of goto statement */
\`\`\`

#### 2. Backward Jump:
\`\`\`c
label:
- - - - - -
- - - - - - - -
goto label;
/* This is the backward jump of goto statement */
\`\`\`

---

### Program Example: Goto Statement (Printing 1 to 10)

\`\`\`c
#include<stdio.h>
void main()
{
int i = 1; 
Start:
printf("%d ", i); 
i = i + 1;
if (i <= 10) 
goto Start;
getch();
}
\`\`\`

**Output:**
\`\`\`
1 2 3 4 5 6 7 8 9 10 
\`\`\`
`,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: new Date().toISOString()
  },

  // ==========================================
  // MODULE 6: Looping Statements, Nested Loops & Jump Statements
  // ==========================================
  {
    id: "chap-c-6-1",
    moduleId: "mod-c-6",
    courseId: "problem-solving-using-c",
    chapterNumber: 1,
    displayOrder: 1,
    title: "Introduction to Loops, while, do..while & for Loops",
    shortDesc: "Loop mechanics, looping flowchart diagram, while entry-controlled loop, do..while exit-controlled loop, and for loop 5 sequential execution steps.",
    description: "Loop mechanics, looping flowchart diagram, while entry-controlled loop, do..while exit-controlled loop, and for loop 5 sequential execution steps.",
    status: "Published",
    difficulty: "Intermediate",
    estimatedMinutes: 40,
    editorRequired: true,
    editorType: "c",
    starterCode: `#include <stdio.h>

void main()
{
    // while loop: 1 to 10
    int i = 1;
    while (i <= 10)
    {
        printf("%d ", i);
        i++;
    }
    printf("\\n");

    // for loop: 1 to 10
    for (int x = 1; x <= 10; x++)
    {
        printf("%d\\t", x);
    }
}`,
    learningObjectives: [
      "Explain the fundamental mechanism of looping and condition verification in C.",
      "Trace loop execution using the standard looping flowchart.",
      "Implement entry-controlled while loops.",
      "Implement exit-controlled do..while loops guaranteed to run at least once.",
      "Understand the for loop syntax, the 2-semicolon rule, and the 5 execution steps."
    ],
    theoryContent: `
> **Academic Note:** [www.bcacauverians.com](http://www.bcacauverians.com) — **C Notes**  
> **Author:** *Pemmaiah.U.T, HOD, Dept. of BCA, Cauvery College, Gonikoppal*

---

### Looping Statements in C

Loops are used to execute a set of statements repeatedly until a particular condition is satisfied. When the condition gets false the loop will terminate.

![Looping Statements Flowchart](/images/loop_flowchart.svg)

As per the above diagram, if the **Test Condition is true**, then the loop is executed, and if it is **false** then the execution breaks out of the loop. After the loop is successfully executed the execution again starts from the Loop entry and again checks for the Test condition, and this keeps on repeating.

The sequence of statements to be executed is kept inside the curly braces \`{ }\` known as the **Loop body**. After every execution of the loop body, condition is verified, and if it is found to be true the loop body is executed again. When the condition check returns false, the loop body is not executed, and execution breaks out of the loop.

---

### Types of Loop in C

There are 3 types of Loop in C language, namely:
1. **while loop**
2. **for loop**
3. **do while loop**

---

### 1. while loop

* \`while\` loop can be addressed as an **entry control loop**. It is completed in 3 steps.
* In Entry Control loops the condition will be checked at the beginning. If the condition is true then the compiler will enter for the body of the loop. After the end of the loop again the loop will check for condition and if the condition is true then again it enters to the body of the loop. When the condition becomes false the loop will terminate.

#### Syntax:
\`\`\`c
while(Test condition)
{
Body of the loop.
}
\`\`\`

#### Program Example: while loop (Printing 1 to 10)
\`\`\`c
#include<stdio.h> 
#include<conio.h> 
void main()
{
int i=1; 
clrscr(); 
while(i<=10)
{
printf("%d ",i); 
i++;
}
getch();
}
\`\`\`

**Output:**
\`\`\`
1 2 3 4 5 6 7 8 9 10
\`\`\`

---

### 2. do..while loop

* It is also called as **Exit Control loop**. i.e., in this looping statement the condition is checked at the end of the body of the loop.
* In some situations it is necessary to execute body of the loop before testing the condition. Such situations can be handled with the help of \`do-while\` loop. \`do\` statement evaluates the body of the loop first and at the end, the condition is checked using \`while\` statement. It means that the body of the loop will be executed at least once before checking the condition.

#### Syntax:
\`\`\`c
do
{
Body of the loop
}
while(Test Condition); // note semicolon should be put here after while
\`\`\`

#### Program Example: do..while loop
\`\`\`c
#include<stdio.h> 
#include<conio.h> 
void main()
{
int i=1; 
do
{
printf("%d ",i); 
i++;
}while(i<=10); 
getch();
}
\`\`\`

**Output:**
\`\`\`
1 2 3 4 5 6 7 8 9 10
\`\`\`

---

### 3. for loop

* \`for\` loop is used to execute a set of statements repeatedly until a particular condition is satisfied. We can say it is an open ended loop. It is also called **Entry level loop**.

#### General format is:
\`\`\`c
for(initialization; condition; increment/decrement)
{
Statement of block;
}
\`\`\`

* In \`for\` loop we have **exactly two semicolons**, one after initialization and second after the condition. In this loop we can have more than one initialization or increment/decrement, separated using comma operator. But it can have only one condition.

#### The for loop is executed in 5 steps as follows:
1. **It first evaluates the initialization code.**
2. **Then it checks the condition expression.**
3. **If it is true, it executes the for-loop body.**
4. **Then it evaluates the increment/decrement condition and again follows from step 2.**
5. **When the condition expression becomes false, it exits the loop.**

#### Program Example: for loop (Printing First 10 Natural Numbers)
\`\`\`c
#include<stdio.h>
void main( )
{
int x;
for(x = 1; x <= 10; x++)
{
printf("%d\\t", x);
}
}
\`\`\`

**Output:**
\`\`\`
1   2   3   4   5   6   7   8   9   10
\`\`\`
`,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: new Date().toISOString()
  },
  {
    id: "chap-c-6-2",
    moduleId: "mod-c-6",
    courseId: "problem-solving-using-c",
    chapterNumber: 2,
    displayOrder: 2,
    title: "Nested Loops, break & continue Statements",
    shortDesc: "Nested for loops syntax, Half Pyramid of numbers program (1, 21, 321, 4321, 54321), break statement flow & example, and continue statement flow & example.",
    description: "Nested for loops syntax, Half Pyramid of numbers program (1, 21, 321, 4321, 54321), break statement flow & example, and continue statement flow & example.",
    status: "Published",
    difficulty: "Intermediate",
    estimatedMinutes: 40,
    editorRequired: true,
    editorType: "c",
    starterCode: `#include <stdio.h>

void main()
{
    // Half Pyramid of numbers
    int i, j;
    for (i = 1; i < 6; i++)
    {
        for (j = i; j > 0; j--)
        {
            printf("%d", j);
        }
        printf("\\n");
    }
}`,
    learningObjectives: [
      "Nest one for loop inside another for multi-dimensional iterations.",
      "Generate inverted and decreasing number pyramid patterns.",
      "Understand the mechanics and flow of the break statement.",
      "Understand the mechanics and flow of the continue statement.",
      "Predict and trace program execution when break and continue conditions trigger."
    ],
    theoryContent: `
> **Academic Note:** [www.bcacauverians.com](http://www.bcacauverians.com) — **C Notes**  
> **Author:** *Pemmaiah.U.T, HOD, Dept. of BCA, Cauvery College, Gonikoppal*

---

### Nested for loop

We can also have nested for loops, i.e one for loop inside another for loop.

#### Basic Syntax:
\`\`\`c
for(initialization; condition; increment/decrement)
{
for(initialization; condition; increment/decrement)
{
statement;
}
}
\`\`\`

---

### Program to print half Pyramid of numbers

\`\`\`c
#include<stdio.h>
void main( )
{
int i, j;
/* first for loop */ 
for(i = 1; i < 6; i++)
{
printf("\\n");
/* second for loop inside the first */ 
for(j = i; j > 0; j--)
{
printf("%d", j);
}
}
}
\`\`\`

**Output:**
\`\`\`
1
21
321
4321
54321
\`\`\`

---

### break and continue statements

#### 1. break statements
When \`break\` statement is encountered inside a loop, the loop is immediately exited and the program continues with the statement immediately following the loop.

![Break Statement Flow](/images/break_flowchart.svg)

##### Program Example: break statement
\`\`\`c
#include<stdio.h>
#include<conio.h> 
void main()
{
int i=1; 
clrscr(); 
while(i<=10)
{
if(i==3)
{
break;
}
printf("%d ",i);
i++;
}
getch();
}
\`\`\`

**Output:**
\`\`\`
1 2
\`\`\`

---

#### 2. continue statement
It causes the control to go directly to the test-condition and then continue the loop process. On encountering \`continue\`, cursor leaves the current cycle of loop, and starts with the next cycle.

![Continue Statement Flow](/images/continue_flowchart.svg)

##### Program Example: continue statement
\`\`\`c
#include<stdio.h>
#include<conio.h> 
void main() 
{
int i=0; 
clrscr(); 
while(i<10)
{
i++;
if(i==3)
{
continue;
}
printf("%d ",i);
}
getch();
}
\`\`\`

**Output:**
\`\`\`
1 2 4 5 6 7 8 9 10 
\`\`\`

---

> **Cauvery College BCA Lecture Notes**  
> *Pemmaiah.U.T, HOD, Dept. of BCA, Cauvery College, Gonikoppal*
`,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: new Date().toISOString()
  }
];

export const PROBLEM_SOLVING_USING_C_LESSONS: Lesson[] = PROBLEM_SOLVING_USING_C_CHAPTERS.map((chap) => ({
  ...chap,
  chapterId: chap.id
}));
