/**
 * Smart Paste Converter Utility
 * Automatically handles pasting text, tables, and images from Word, Excel, PDFs, and Web pages
 * into clean, formatted Academic Markdown.
 */

/**
 * Converts an HTML string containing <table> elements into GitHub-Flavored Markdown table(s)
 */
export function convertHtmlTableToMarkdown(html: string): string | null {
  if (!html || !html.includes("<table")) return null;

  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");
    const tables = doc.querySelectorAll("table");
    if (!tables || tables.length === 0) return null;

    const markdownTables: string[] = [];

    tables.forEach((table) => {
      const rows = table.querySelectorAll("tr");
      if (rows.length === 0) return;

      const matrix: string[][] = [];
      let maxCols = 0;

      rows.forEach((row) => {
        const cells = row.querySelectorAll("th, td");
        if (cells.length === 0) return;
        const rowData: string[] = [];
        cells.forEach((cell) => {
          // Clean inner text and preserve basic inline formatting
          let cellText = cell.innerHTML
            .replace(/<br\s*[\/]?>/gi, " ")
            .replace(/<b>|<strong>/gi, "**")
            .replace(/<\/b>|<\/strong>/gi, "**")
            .replace(/<i>|<em>/gi, "*")
            .replace(/<\/i>|<\/em>/gi, "*")
            .replace(/<code>/gi, "`")
            .replace(/<\/code>/gi, "`")
            .replace(/<[^>]+>/g, "") // strip remaining html
            .replace(/\|/g, "\\|") // escape pipe
            .replace(/\s+/g, " ")
            .trim();
          rowData.push(cellText || "-");
        });
        if (rowData.length > maxCols) maxCols = rowData.length;
        matrix.push(rowData);
      });

      if (matrix.length === 0 || maxCols === 0) return;

      // Normalize row lengths
      const normalizedMatrix = matrix.map((row) => {
        while (row.length < maxCols) {
          row.push("-");
        }
        return row;
      });

      const headerRow = normalizedMatrix[0];
      const dataRows = normalizedMatrix.slice(1);

      let md = `\n| ${headerRow.join(" | ")} |\n`;
      md += `| ${headerRow.map(() => ":---").join(" | ")} |\n`;

      if (dataRows.length > 0) {
        dataRows.forEach((row) => {
          md += `| ${row.join(" | ")} |\n`;
        });
      } else {
        md += `| ${headerRow.map(() => "-").join(" | ")} |\n`;
      }
      md += "\n";
      markdownTables.push(md);
    });

    return markdownTables.length > 0 ? markdownTables.join("\n") : null;
  } catch (err) {
    console.warn("Failed to parse HTML table to markdown:", err);
    return null;
  }
}

/**
 * Detects TSV (Tab-Separated Values) or CSV and converts into Markdown Table
 */
export function convertTsvOrCsvToMarkdown(text: string): string | null {
  if (!text || !text.trim()) return null;
  const lines = text.trim().split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (lines.length < 2) return null;

  // Check for Tab-Separated
  const hasTabs = lines.some((l) => l.includes("\t"));
  if (hasTabs) {
    const matrix = lines.map((line) => line.split("\t").map((c) => c.trim().replace(/\|/g, "\\|")));
    const maxCols = Math.max(...matrix.map((r) => r.length));
    if (maxCols >= 2) {
      const headerRow = matrix[0];
      while (headerRow.length < maxCols) headerRow.push(`Col ${headerRow.length + 1}`);

      let md = `\n| ${headerRow.map((c) => c || "Header").join(" | ")} |\n`;
      md += `| ${headerRow.map(() => ":---").join(" | ")} |\n`;

      for (let i = 1; i < matrix.length; i++) {
        const row = matrix[i];
        while (row.length < maxCols) row.push("-");
        md += `| ${row.map((c) => c || "-").join(" | ")} |\n`;
      }
      md += "\n";
      return md;
    }
  }

  // Check for Comma-Separated
  const hasCommas = lines.every((l) => l.includes(",") && l.split(",").length >= 2);
  if (hasCommas) {
    const matrix = lines.map((line) => line.split(",").map((c) => c.trim().replace(/\|/g, "\\|")));
    const maxCols = Math.max(...matrix.map((r) => r.length));
    if (maxCols >= 2) {
      const headerRow = matrix[0];
      while (headerRow.length < maxCols) headerRow.push(`Col ${headerRow.length + 1}`);

      let md = `\n| ${headerRow.map((c) => c || "Header").join(" | ")} |\n`;
      md += `| ${headerRow.map(() => ":---").join(" | ")} |\n`;

      for (let i = 1; i < matrix.length; i++) {
        const row = matrix[i];
        while (row.length < maxCols) row.push("-");
        md += `| ${row.map((c) => c || "-").join(" | ")} |\n`;
      }
      md += "\n";
      return md;
    }
  }

  return null;
}

/**
 * Cleans PDF text formatting (fixes mid-sentence line breaks, handles bullet lists)
 */
export function cleanAndFormatPdfTheoryText(rawText: string): string {
  if (!rawText) return "";

  // 1. First check if it's a table
  const tableMd = convertTsvOrCsvToMarkdown(rawText);
  if (tableMd) return tableMd;

  // 2. Normalize carriage returns
  let text = rawText.replace(/\r\n/g, "\n").replace(/\r/g, "\n");

  // 3. Remove weird PDF non-printable characters
  text = text.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "");

  // 4. Handle bullets copied from PDFs (e.g. •, ▪, ‣, ⁃, etc.)
  text = text.replace(/^[ \t]*[•▪‣⁃–—][ \t]+/gm, "- ");

  // 5. Detect potential headings (e.g. "Topic 1:", "Definition:", all caps lines)
  const lines = text.split("\n");
  const processedLines: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) {
      processedLines.push("");
      continue;
    }

    // Numbered list item: 1. 2. etc
    if (/^\d+[\.\)][ \t]+/.test(line)) {
      processedLines.push(line.replace(/^(\d+)[\.\)][ \t]+/, "$1. "));
      continue;
    }

    // Header detection: e.g. "1. Introduction to C", "Features of C:"
    if (
      (line.endsWith(":") && line.length < 60 && !line.startsWith("-")) ||
      (/^[A-Z0-9\s,\-\(\)]{4,60}$/.test(line) && line.length < 50 && !line.includes("."))
    ) {
      processedLines.push(`\n### ${line.replace(/:$/, "")}\n`);
      continue;
    }

    processedLines.push(line);
  }

  return processedLines.join("\n");
}
