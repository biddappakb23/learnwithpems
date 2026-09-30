import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import { executeCCodeSecurely, getInstalledCCompiler } from "./src/server/cExecutionEngine";
import { executePythonCodeSecurely, getInstalledPythonRuntime } from "./src/server/pythonExecutionEngine";

dotenv.config();

// In-memory image registry to ensure instant retrieval even across container boundaries
const inMemoryImageCache = new Map<string, { buffer: Buffer; mimeType: string; filename: string }>();

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Support up to 25MB for crisp image diagrams & uploads
  app.use(express.json({ limit: "25mb" }));
  app.use(express.urlencoded({ extended: true, limit: "25mb" }));

  // Ensure uploads directory exists in both development and production paths
  const uploadsDir = path.join(process.cwd(), "public", "uploads");
  const distUploadsDir = path.join(process.cwd(), "dist", "uploads");
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }
  if (!fs.existsSync(distUploadsDir)) {
    fs.mkdirSync(distUploadsDir, { recursive: true });
  }

  // Serve static uploaded images with 1-year browser cache and permissive CORS
  app.use("/uploads", (req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
    next();
  }, express.static(uploadsDir, { maxAge: "1y", immutable: true }));

  // API Route: Image Upload
  app.post("/api/upload-image", (req, res) => {
    try {
      const { dataUrl, filename, mimeType, alt } = req.body;
      if (!dataUrl || typeof dataUrl !== "string") {
        return res.status(400).json({ error: "No image data provided." });
      }

      // Extract MIME type and Base64 buffer
      let determinedMime = mimeType || "image/png";
      let base64Data = dataUrl;

      const matches = dataUrl.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
      if (matches && matches.length === 3) {
        determinedMime = matches[1];
        base64Data = matches[2];
      }

      const buffer = Buffer.from(base64Data, "base64");

      // Determine clean extension
      let ext = ".png";
      if (determinedMime.includes("jpeg") || determinedMime.includes("jpg")) ext = ".jpg";
      else if (determinedMime.includes("webp")) ext = ".webp";
      else if (determinedMime.includes("svg")) ext = ".svg";
      else if (determinedMime.includes("gif")) ext = ".gif";

      const originalBase = (filename || "image").replace(/\.[^/.]+$/, "").replace(/[^a-zA-Z0-9_-]/g, "_");
      const uniqueFilename = `${originalBase}_${Date.now()}_${Math.random().toString(36).substring(2, 7)}${ext}`;

      // Write to public uploads directory
      const filePath = path.join(uploadsDir, uniqueFilename);
      fs.writeFileSync(filePath, buffer);

      // Also copy to dist uploads if running in production
      try {
        fs.writeFileSync(path.join(distUploadsDir, uniqueFilename), buffer);
      } catch (e) {
        // Ignore if dist doesn't exist in dev
      }

      // Cache in-memory for instant high-speed retrieval
      inMemoryImageCache.set(uniqueFilename, { buffer, mimeType: determinedMime, filename: uniqueFilename });
      if (originalBase) {
        inMemoryImageCache.set(originalBase.toLowerCase(), { buffer, mimeType: determinedMime, filename: uniqueFilename });
        inMemoryImageCache.set(`${originalBase.toLowerCase()}${ext}`, { buffer, mimeType: determinedMime, filename: uniqueFilename });
      }
      if (alt) {
        const cleanAlt = alt.toLowerCase().replace(/[^a-z0-9]/g, "");
        inMemoryImageCache.set(cleanAlt, { buffer, mimeType: determinedMime, filename: uniqueFilename });
      }

      const publicUrl = `/uploads/${uniqueFilename}`;
      console.log(`[Image Storage] Successfully saved image: ${publicUrl} (${(buffer.length / 1024).toFixed(1)} KB)`);

      return res.json({
        success: true,
        url: publicUrl,
        id: uniqueFilename,
        filename: uniqueFilename,
        sizeBytes: buffer.length,
        mimeType: determinedMime
      });
    } catch (err: any) {
      console.error("[Image Upload Error]:", err);
      return res.status(500).json({ error: "Failed to process image upload", details: err.message });
    }
  });

  // API Route: List all uploaded media files (/api/media)
  app.get("/api/media", (req, res) => {
    try {
      const files: Array<{
        id: string;
        filename: string;
        url: string;
        sizeBytes: number;
        mimeType: string;
        createdAt: string;
      }> = [];

      if (fs.existsSync(uploadsDir)) {
        const dirFiles = fs.readdirSync(uploadsDir);
        for (const file of dirFiles) {
          if (file.startsWith(".")) continue;
          try {
            const stat = fs.statSync(path.join(uploadsDir, file));
            if (stat.isFile()) {
              let mime = "image/png";
              if (file.endsWith(".jpg") || file.endsWith(".jpeg")) mime = "image/jpeg";
              else if (file.endsWith(".webp")) mime = "image/webp";
              else if (file.endsWith(".svg")) mime = "image/svg+xml";
              else if (file.endsWith(".gif")) mime = "image/gif";
              else if (file.endsWith(".pdf")) mime = "application/pdf";

              files.push({
                id: file,
                filename: file,
                url: `/uploads/${file}`,
                sizeBytes: stat.size,
                mimeType: mime,
                createdAt: stat.birthtime.toISOString()
              });
            }
          } catch (e) {
            // Ignore file read error
          }
        }
      }

      // Sort newest first
      files.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      return res.json({ success: true, count: files.length, media: files });
    } catch (err: any) {
      console.error("[Media List Error]:", err);
      return res.status(500).json({ error: "Failed to list media", details: err.message });
    }
  });

  // API Route: Delete media file (/api/media/:id)
  app.delete("/api/media/:id", (req, res) => {
    try {
      const id = req.params.id;
      const cleanFile = path.basename(id);
      const filePath = path.join(uploadsDir, cleanFile);
      const distPath = path.join(distUploadsDir, cleanFile);

      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
      if (fs.existsSync(distPath)) {
        fs.unlinkSync(distPath);
      }
      inMemoryImageCache.delete(cleanFile);
      inMemoryImageCache.delete(cleanFile.toLowerCase());

      return res.json({ success: true, message: `Deleted media file ${cleanFile}` });
    } catch (err: any) {
      console.error("[Media Delete Error]:", err);
      return res.status(500).json({ error: "Failed to delete media", details: err.message });
    }
  });

  // API Route: Direct Image Retrieval (/api/images/:id)
  app.get("/api/images/:id", (req, res) => {
    const id = req.params.id;
    const cleanKey = id.toLowerCase().replace(/[^a-z0-9._-]/g, "");

    // 1. Check in-memory cache
    if (inMemoryImageCache.has(cleanKey)) {
      const cached = inMemoryImageCache.get(cleanKey)!;
      res.setHeader("Content-Type", cached.mimeType);
      res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
      res.setHeader("Access-Control-Allow-Origin", "*");
      return res.send(cached.buffer);
    }

    // 2. Check disk file in uploads directory
    const diskPath = path.join(uploadsDir, id);
    if (fs.existsSync(diskPath)) {
      res.setHeader("Access-Control-Allow-Origin", "*");
      res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
      return res.sendFile(diskPath);
    }

    return res.status(404).json({ error: "Image not found" });
  });

  // Initialize Gemini AI Client lazily or safely
  const getAiClient = () => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not configured.");
    }
    return new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  };

  // API Route: Health check
  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // SEO Route: Sitemap XML
  app.get("/sitemap.xml", (_req, res) => {
    const today = new Date().toISOString().split("T")[0];
    const courses = [
      "c", "java", "python", "data-structures", "dbms", "html-css",
      "javascript", "computer-networks", "operating-systems",
      "software-engineering", "artificial-intelligence", "cyber-security"
    ];
    const lessons = [
      "introduction-program-structure",
      "tokens-data-types-operators",
      "control-flow-decision-making",
      "arrays-strings-functions",
      "pointers-memory-management",
      "structures-unions-file-io"
    ];

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://www.learnwithpems.in/</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://www.learnwithpems.in/courses</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>https://www.learnwithpems.in/notes</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://www.learnwithpems.in/practice</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://www.learnwithpems.in/quizzes</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://www.learnwithpems.in/about</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
  <url>
    <loc>https://www.learnwithpems.in/contact</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>
  <url>
    <loc>https://www.learnwithpems.in/privacy-policy</loc>
    <lastmod>${today}</lastmod>
    <changefreq>yearly</changefreq>
    <priority>0.3</priority>
  </url>
  <url>
    <loc>https://www.learnwithpems.in/terms-and-conditions</loc>
    <lastmod>${today}</lastmod>
    <changefreq>yearly</changefreq>
    <priority>0.3</priority>
  </url>
${courses
  .map(
    (c) => `  <url>
    <loc>https://www.learnwithpems.in/courses/${c}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>${c === "c" ? "0.95" : "0.85"}</priority>
  </url>`
  )
  .join("\n")}
${lessons
  .map(
    (l) => `  <url>
    <loc>https://www.learnwithpems.in/courses/c/${l}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.75</priority>
  </url>`
  )
  .join("\n")}
</urlset>`;

    res.setHeader("Content-Type", "application/xml; charset=utf-8");
    res.setHeader("Cache-Control", "public, max-age=86400");
    res.send(xml);
  });

  // SEO Route: Robots.txt
  app.get("/robots.txt", (_req, res) => {
    const robots = `# LearnWithPems robots.txt
# Canonical URL: https://www.learnwithpems.in/
User-agent: *
Allow: /
Allow: /courses
Allow: /courses/
Allow: /notes
Allow: /practice
Allow: /quizzes
Allow: /about
Allow: /contact
Allow: /privacy-policy
Allow: /terms-and-conditions

# Disallow private user accounts and admin panels
Disallow: /admin
Disallow: /dashboard
Disallow: /api/

# Sitemap Location
Sitemap: https://www.learnwithpems.in/sitemap.xml
`;
    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    res.setHeader("Cache-Control", "public, max-age=86400");
    res.send(robots);
  });

  // API Route: AI C Tutor (Student)
  app.post("/api/ai/tutor", async (req, res) => {
    try {
      const { question, lessonContext, studentLevel, chatHistory } = req.body;
      const ai = getAiClient();

      const systemInstruction = `You are "C-Tutor", an expert, patient, and friendly AI programming tutor specializing in the C Programming Language.
Your audience: Students learning C programming (Level: ${studentLevel || "Beginner"}).
Current Lesson Context: ${lessonContext ? JSON.stringify(lessonContext) : "General C Programming"}.

Instructions:
1. Explain concepts simply, clearly, and step-by-step using standard C (ANSI C / C99).
2. Always provide short, clean C code examples when applicable, formatted inside markdown code blocks (\`\`\`c ... \`\`\`).
3. Point out common pitfalls (e.g., missing semicolons, uninitialized variables, array index out of bounds, null pointers).
4. Do NOT solve complete homework directly if student asks for code without effort; guide them with hints first.
5. Keep explanations engaging, concise, and educational.`;

      let prompt = `Student Question: ${question}`;
      if (chatHistory && Array.isArray(chatHistory) && chatHistory.length > 0) {
        prompt = `Previous conversation:\n${chatHistory
          .slice(-4)
          .map((m: { sender: string; text: string }) => `${m.sender}: ${m.text}`)
          .join("\n")}\n\nCurrent Question: ${question}`;
      }

      const response = await ai.models.generateContent({
        model: "gemini-3.7-flash",
        contents: prompt,
        config: {
          systemInstruction,
          temperature: 0.7,
        },
      });

      res.json({ text: response.text || "I couldn't generate a response." });
    } catch (error: any) {
      console.error("AI Tutor Error:", error);
      res.status(500).json({
        error: "AI Tutor request failed",
        details: error.message || "Unknown error",
      });
    }
  });

  // API Route: AI Subject Helpline & Student Doubt Assistant
  app.post("/api/ai/helpline-chat", async (req, res) => {
    try {
      const {
        subjectTitle,
        topic,
        question,
        codeSnippet,
        programmingLanguage,
        studentName,
        category,
        chatHistory
      } = req.body;

      const ai = getAiClient();

      const systemInstruction = `You are the Official "LearnwithPems Academic Helpline AI Assistant", authored under the curriculum guidance of Mr. Pemmaiah U. T. (HOD of Department of BCA, Cauvery College, Gonikoppal).
You provide patient, comprehensive, step-by-step academic clarifications for BCA, B.Sc, B.Tech, and Computer Science students.

Subject: ${subjectTitle || "Computer Science / C Programming"}
Topic/Module: ${topic || "Core Subject Concept"}
Category: ${category || "CONCEPT_CLARIFICATION"}
Student Name: ${studentName || "Student"}

Academic Guidelines:
1. Explain the underlying computer science concepts clearly, addressing the student respectfully and encouragement.
2. If code is provided or needed, format it cleanly in markdown code blocks with comments explaining critical lines.
3. If this is a syntax or compilation error, explicitly point out the line of failure, explain WHY it fails, and show the fixed code.
4. When explaining algorithms or data structures, use simple ASCII diagrams or step-by-step memory trace tables if helpful.
5. Remind the student that if they require official faculty clarification or college syllabus verification, their query can also be submitted directly to Mr. Pemmaiah U. T. (Author & HOD) from the portal.`;

      let prompt = `Subject: ${subjectTitle}\nTopic: ${topic}\nStudent Question:\n${question}`;
      if (codeSnippet && codeSnippet.trim()) {
        prompt += `\n\nStudent's Code (${programmingLanguage || "c"}):\n\`\`\`${programmingLanguage || "c"}\n${codeSnippet}\n\`\`\``;
      }

      if (chatHistory && Array.isArray(chatHistory) && chatHistory.length > 0) {
        prompt = `Previous Conversation Context:\n${chatHistory
          .slice(-5)
          .map((m: { sender: string; text: string }) => `${m.sender}: ${m.text}`)
          .join("\n")}\n\nLatest Query:\n${prompt}`;
      }

      const response = await ai.models.generateContent({
        model: "gemini-3.7-flash",
        contents: prompt,
        config: {
          systemInstruction,
          temperature: 0.65,
        },
      });

      res.json({
        text: response.text || "Academic clarification generated successfully.",
        authorHint: "You can also forward this query to Faculty Author Mr. Pemmaiah U. T. for official evaluation."
      });
    } catch (error: any) {
      console.error("AI Helpline Error:", error);
      res.status(500).json({
        error: "Academic Helpline service encountered an error.",
        details: error.message || "Unknown error",
      });
    }
  });

  // API Route: AI Content Assistant (Admin)
  app.post("/api/ai/generate-content", async (req, res) => {
    try {
      const { topic, difficulty, targetType } = req.body;
      const ai = getAiClient();

      const systemInstruction = `You are an expert C Computer Science Curriculum Designer.
Generate educational content for the topic "${topic}" at level "${difficulty || "Beginner"}".
Output MUST be valid JSON adhering strictly to the schema requested.`;

      const prompt = `Generate a comprehensive C programming lesson draft for: "${topic}".
Include:
- Lesson Title
- Short Description
- 3 Learning Objectives
- Theory Content (well-formatted markdown explanation with headings and examples)
- Syntax definition
- 1-2 complete working C code examples with expected output and detailed code explanation
- Common mistakes (array of strings)
- Pro tips (array of strings)
- 2 Quiz questions (MCQ format with 4 options, correct answer index, and explanation)
- 1 Practice problem (title, description, expected output, hint, solution code)

Format response as strict JSON with this schema:
{
  "title": "string",
  "shortDesc": "string",
  "learningObjectives": ["string"],
  "theoryContent": "markdown string",
  "syntax": "string",
  "codeExamples": [
    {
      "title": "string",
      "code": "C code string",
      "expectedOutput": "string",
      "explanation": "string"
    }
  ],
  "commonMistakes": ["string"],
  "tips": ["string"],
  "quizQuestions": [
    {
      "question": "string",
      "options": ["A", "B", "C", "D"],
      "correctAnswer": 0,
      "explanation": "string",
      "marks": 10
    }
  ],
  "practiceProblem": {
    "title": "string",
    "description": "string",
    "exampleInput": "string",
    "exampleOutput": "string",
    "starterCode": "string",
    "solutionCode": "string",
    "hint": "string"
  }
}`;

      const response = await ai.models.generateContent({
        model: "gemini-3.7-flash",
        contents: prompt,
        config: {
          systemInstruction,
          responseMimeType: "application/json",
          temperature: 0.6,
        },
      });

      const rawText = response.text || "{}";
      const parsedData = JSON.parse(rawText);
      res.json({ success: true, data: parsedData });
    } catch (error: any) {
      console.error("AI Generator Error:", error);
      res.status(500).json({
        error: "AI Content Generation failed",
        details: error.message || "Unknown error",
      });
    }
  });

  // API Route: C Compiler Info (Dynamic host compiler query)
  app.get("/api/c-compiler-info", (_req, res) => {
    res.setHeader("Content-Type", "application/json");
    try {
      const info = getInstalledCCompiler();
      res.json(info);
    } catch (err: any) {
      res.status(500).json({ error: err.message || "Failed to retrieve compiler info" });
    }
  });

  // API Route: Native C Code Compiler & Runner (Real GCC / Clang)
  app.post("/api/c-runner", async (req, res) => {
    res.setHeader("Content-Type", "application/json");
    const { code, stdin, courseId, compiler, standard, timeoutMs } = req.body;

    if (!code || typeof code !== "string") {
      return res.status(400).json({
        output: "Error: No C source code provided.",
        stdout: "",
        stderr: "Error: No C source code provided.",
        status: "compilation_error",
        exitCode: 1,
        executionTimeMs: 0
      });
    }

    try {
      const result = await executeCCodeSecurely({
        code,
        stdin: typeof stdin === "string" ? stdin : "",
        courseId: typeof courseId === "string" ? courseId : "learn-c",
        compiler: compiler === "clang" ? "clang" : "gcc",
        standard: standard || "c17",
        timeoutMs: typeof timeoutMs === "number" ? timeoutMs : 5000
      });

      // Output string formatted for terminal viewer display
      let combinedOutput = result.stdout;
      if (result.status === "compilation_error") {
        combinedOutput = `=== COMPILATION ERROR (${result.compilerInfo.compiler.toUpperCase()} -std=${result.compilerInfo.standard}) ===\n${result.stderr}`;
        if (result.diagnosticExplanation) {
          combinedOutput += `\n\n[Diagnostic Guidance]\n${result.diagnosticExplanation}`;
        }
      } else if (result.status === "timeout") {
        combinedOutput = result.stdout ? `${result.stdout}\n\n=== RUNTIME TIMEOUT ===\n${result.stderr}` : `=== RUNTIME TIMEOUT ===\n${result.stderr}`;
      } else if (result.status === "runtime_error") {
        combinedOutput = result.stdout ? `${result.stdout}\n\n=== RUNTIME ERROR (Exit Code: ${result.exitCode ?? "Signal"}) ===\n${result.stderr}` : `=== RUNTIME ERROR (Exit Code: ${result.exitCode ?? "Signal"}) ===\n${result.stderr}`;
      } else if (!combinedOutput && result.exitCode === 0) {
        combinedOutput = "[Program finished with exit code 0 and produced no output.]";
      }

      res.json({
        ...result,
        output: combinedOutput
      });
    } catch (err: any) {
      console.error("C Runner execution error:", err);
      res.status(500).json({
        output: `Internal Execution Error: ${err.message || String(err)}`,
        stdout: "",
        stderr: err.message || String(err),
        status: "runtime_error",
        exitCode: 1,
        executionTimeMs: 0,
        compilerInfo: getInstalledCCompiler()
      });
    }
  });

  // API Route: Python Runtime Info (Dynamic host CPython query)
  app.get("/api/python-runtime-info", (_req, res) => {
    res.setHeader("Content-Type", "application/json");
    try {
      const info = getInstalledPythonRuntime();
      res.json(info);
    } catch (err: any) {
      res.status(500).json({ error: err.message || "Failed to retrieve Python runtime info" });
    }
  });

  // API Route: Native CPython Code Runner
  app.post("/api/python-runner", async (req, res) => {
    res.setHeader("Content-Type", "application/json");
    const { code, stdin, courseId, timeoutMs } = req.body;

    if (!code || typeof code !== "string") {
      return res.status(400).json({
        output: "Error: No Python source code provided.",
        stdout: "",
        stderr: "Error: No Python source code provided.",
        status: "runtime_error",
        exitCode: 1,
        executionTimeMs: 0
      });
    }

    try {
      const result = await executePythonCodeSecurely({
        code,
        stdin: typeof stdin === "string" ? stdin : "",
        courseId: typeof courseId === "string" ? courseId : "learn-python",
        timeoutMs: typeof timeoutMs === "number" ? timeoutMs : 5000
      });

      // Output string formatted for terminal viewer display
      let combinedOutput = result.stdout;
      if (result.status === "syntax_error") {
        combinedOutput = `=== SYNTAX ERROR (${result.runtimeInfo.version}) ===\n${result.stderr}`;
        if (result.diagnosticExplanation) {
          combinedOutput += `\n\n[Diagnostic Guidance]\n${result.diagnosticExplanation}`;
        }
      } else if (result.status === "timeout") {
        combinedOutput = result.stdout
          ? `${result.stdout}\n\n=== RUNTIME TIMEOUT ===\n${result.stderr}`
          : `=== RUNTIME TIMEOUT ===\n${result.stderr}`;
      } else if (result.status === "runtime_error") {
        combinedOutput = result.stdout
          ? `${result.stdout}\n\n=== RUNTIME ERROR (Exit Code: ${result.exitCode ?? "Signal"}) ===\n${result.stderr}`
          : `=== RUNTIME ERROR (Exit Code: ${result.exitCode ?? "Signal"}) ===\n${result.stderr}`;
        if (result.diagnosticExplanation) {
          combinedOutput += `\n\n[Diagnostic Guidance]\n${result.diagnosticExplanation}`;
        }
      } else if (!combinedOutput && result.exitCode === 0) {
        combinedOutput = "[Program finished with exit code 0 and produced no output.]";
      }

      res.json({
        ...result,
        output: combinedOutput
      });
    } catch (err: any) {
      console.error("Python Runner execution error:", err);
      res.status(500).json({
        output: `Internal Execution Error: ${err.message || String(err)}`,
        stdout: "",
        stderr: err.message || String(err),
        status: "runtime_error",
        exitCode: 1,
        executionTimeMs: 0,
        runtimeInfo: getInstalledPythonRuntime()
      });
    }
  });

  // Vite middleware in development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`C Learning Platform Server running at http://0.0.0.0:${PORT}`);
  });
}

/**
 * Intelligent C Execution Simulation Engine
 * Handles standard stdio printf, variables, math, if/else, for loops, string formatting, array print, etc.
 */
function simulateCExecution(code: string, stdin: string): string {
  // Basic C syntax sanity checks
  if (!code.includes("main")) {
    throw new Error("error: undefined reference to 'main'. C programs require a main() function.");
  }

  const inputTokens = stdin ? stdin.trim().split(/\s+/).filter(Boolean) : [];
  let inputIndex = 0;

  // Extract main body
  const mainMatch = code.match(/(?:int|void)\s+main\s*\([^)]*\)\s*\{([\s\S]*)\}/);
  const mainBody = mainMatch ? mainMatch[1] : code;

  let stdout = "";
  const vars: Record<string, any> = {};

  // Simple evaluator helper
  const evalExpr = (expr: string): any => {
    let clean = expr.trim();
    if (!clean) return 0;
    if (clean.startsWith('"') && clean.endsWith('"')) return clean.slice(1, -1);
    if (clean.startsWith("'") && clean.endsWith("'")) return clean.charCodeAt(1);

    // Replace known variables
    for (const [k, v] of Object.entries(vars)) {
      clean = clean.replace(new RegExp(`\\b${k}\\b`, "g"), String(v));
    }

    try {
      if (/^[0-9+\-*/%().\s<>!=&|^~?:eE]+$/.test(clean)) {
        return Function(`"use strict"; return (${clean});`)();
      }
    } catch {}
    return clean;
  };

  // Extract statements
  const rawLines = mainBody
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/\/\/.*$/gm, "")
    .split(";")
    .map((s) => s.trim())
    .filter(Boolean);

  for (const stmt of rawLines) {
    // Declarations: int a = 10, b = 20;
    const declMatch = stmt.match(/^(?:int|float|double|char|long|short)\s+([\s\S]+)$/);
    if (declMatch) {
      const parts = declMatch[1].split(",");
      for (const p of parts) {
        const [k, ...vParts] = p.split("=");
        const varName = k.trim().replace(/^\*/, "");
        if (vParts.length > 0) {
          vars[varName] = evalExpr(vParts.join("="));
        } else {
          vars[varName] = 0;
        }
      }
      continue;
    }

    // scanf: scanf("%d %d", &a, &b)
    const scanfMatch = stmt.match(/scanf\s*\(\s*"([^"]*)"\s*,\s*([\s\S]*)\)/);
    if (scanfMatch) {
      const targets = scanfMatch[2].split(",").map((t) => t.trim().replace(/^&/, ""));
      for (const target of targets) {
        const val = inputIndex < inputTokens.length ? inputTokens[inputIndex++] : "0";
        vars[target] = isNaN(Number(val)) ? val : Number(val);
      }
      continue;
    }

    // Assignment: a = a + 5
    const assignMatch = stmt.match(/^([a-zA-Z_][a-zA-Z0-9_]*)\s*=\s*([\s\S]+)$/);
    if (assignMatch) {
      vars[assignMatch[1]] = evalExpr(assignMatch[2]);
      continue;
    }

    // printf: printf("Sum = %d\n", a + b)
    const printfMatch = stmt.match(/printf\s*\(\s*"([^"]*)"(?:\s*,\s*([\s\S]*))?\)/);
    if (printfMatch) {
      let formatStr = printfMatch[1]
        .replace(/\\n/g, "\n")
        .replace(/\\t/g, "\t")
        .replace(/\\"/g, '"')
        .replace(/\\\\/g, "\\");

      const argsStr = printfMatch[2];
      if (argsStr) {
        const rawArgs = argsStr.split(",").map((a) => a.trim());
        let argIdx = 0;

        formatStr = formatStr.replace(/%(?:ld|lf|[dfscipuxX%])/g, (specifier) => {
          if (specifier === "%%") return "%";
          if (argIdx < rawArgs.length) {
            const evaluated = evalExpr(rawArgs[argIdx++]);
            if (specifier === "%f" || specifier === "%lf") {
              const num = Number(evaluated);
              return isNaN(num) ? "0.000000" : num.toFixed(6);
            }
            if (specifier === "%c" && typeof evaluated === "number") {
              return String.fromCharCode(evaluated);
            }
            return String(evaluated);
          }
          return specifier;
        });
      }
      stdout += formatStr;
    }
  }

  return stdout || "[Program finished with exit code 0 and produced no output.]";
}

startServer();
