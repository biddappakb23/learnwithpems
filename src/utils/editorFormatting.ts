/**
 * Utility functions for Markdown formatting in Lesson and Document editors.
 * Handles headings (H1-H4, Body), bullet lists, ordered lists, checklists,
 * blockquotes, indentation, and line breaks/paragraphs.
 */

export function applyHeadingToText(
  text: string,
  start: number,
  end: number,
  level: 1 | 2 | 3 | 4 | 0
): { newText: string; newStart: number; newEnd: number } {
  const prevNewline = text.lastIndexOf("\n", start - 1);
  const lineStart = prevNewline === -1 ? 0 : prevNewline + 1;
  const nextNewline = text.indexOf("\n", end);
  const lineEnd = nextNewline === -1 ? text.length : nextNewline;

  const targetChunk = text.substring(lineStart, lineEnd);
  const lines = targetChunk.split("\n");

  const formattedLines = lines.map((line) => {
    // Strip existing markdown headings (#, ##, etc.) or list/quote markers
    const stripped = line
      .replace(/^#{1,6}\s*/, "")
      .replace(/^(\d+\.|[-*+]|>\s*)\s*(\[[ xX]\]\s*)?/, "")
      .trimStart();

    if (level === 0) {
      // Normal Paragraph / Body
      return stripped;
    }
    const prefix = `${"#".repeat(level)} `;
    return `${prefix}${stripped || `Heading ${level}`}`;
  });

  const replacement = formattedLines.join("\n");
  const newText = text.substring(0, lineStart) + replacement + text.substring(lineEnd);
  return {
    newText,
    newStart: lineStart,
    newEnd: lineStart + replacement.length
  };
}

export function applyBulletListToText(
  text: string,
  start: number,
  end: number
): { newText: string; newStart: number; newEnd: number } {
  const prevNewline = text.lastIndexOf("\n", start - 1);
  const lineStart = prevNewline === -1 ? 0 : prevNewline + 1;
  const nextNewline = text.indexOf("\n", end);
  const lineEnd = nextNewline === -1 ? text.length : nextNewline;

  const targetChunk = text.substring(lineStart, lineEnd);
  const lines = targetChunk.split("\n");

  // Check if every non-empty line already starts with a bullet
  const allBulleted = lines.length > 0 && lines.every((l) => !l.trim() || /^[-*]\s+/.test(l.trimStart()));

  const formattedLines = lines.map((line) => {
    if (!line.trim()) {
      return allBulleted ? "" : "- ";
    }
    const stripped = line
      .replace(/^#{1,6}\s*/, "")
      .replace(/^(\d+\.|[-*+]|>\s*)\s*(\[[ xX]\]\s*)?/, "")
      .trimStart();

    if (allBulleted) {
      return stripped; // toggle off
    }
    return `- ${stripped}`;
  });

  const replacement = formattedLines.join("\n");
  const newText = text.substring(0, lineStart) + replacement + text.substring(lineEnd);
  return {
    newText,
    newStart: lineStart,
    newEnd: lineStart + replacement.length
  };
}

export function applyNumberedListToText(
  text: string,
  start: number,
  end: number
): { newText: string; newStart: number; newEnd: number } {
  const prevNewline = text.lastIndexOf("\n", start - 1);
  const lineStart = prevNewline === -1 ? 0 : prevNewline + 1;
  const nextNewline = text.indexOf("\n", end);
  const lineEnd = nextNewline === -1 ? text.length : nextNewline;

  const targetChunk = text.substring(lineStart, lineEnd);
  const lines = targetChunk.split("\n");

  // Check if every non-empty line already starts with a number
  const allNumbered = lines.length > 0 && lines.every((l) => !l.trim() || /^\d+\.\s+/.test(l.trimStart()));

  let count = 1;
  const formattedLines = lines.map((line) => {
    if (!line.trim()) {
      return allNumbered ? "" : `${count++}. `;
    }
    const stripped = line
      .replace(/^#{1,6}\s*/, "")
      .replace(/^(\d+\.|[-*+]|>\s*)\s*(\[[ xX]\]\s*)?/, "")
      .trimStart();

    if (allNumbered) {
      return stripped; // toggle off
    }
    return `${count++}. ${stripped}`;
  });

  const replacement = formattedLines.join("\n");
  const newText = text.substring(0, lineStart) + replacement + text.substring(lineEnd);
  return {
    newText,
    newStart: lineStart,
    newEnd: lineStart + replacement.length
  };
}

export function applyChecklistToText(
  text: string,
  start: number,
  end: number
): { newText: string; newStart: number; newEnd: number } {
  const prevNewline = text.lastIndexOf("\n", start - 1);
  const lineStart = prevNewline === -1 ? 0 : prevNewline + 1;
  const nextNewline = text.indexOf("\n", end);
  const lineEnd = nextNewline === -1 ? text.length : nextNewline;

  const targetChunk = text.substring(lineStart, lineEnd);
  const lines = targetChunk.split("\n");

  const allChecklist = lines.length > 0 && lines.every((l) => !l.trim() || /^[-*]\s*\[[ xX]\]\s*/.test(l.trimStart()));

  const formattedLines = lines.map((line) => {
    if (!line.trim()) {
      return allChecklist ? "" : "- [ ] ";
    }
    const stripped = line
      .replace(/^#{1,6}\s*/, "")
      .replace(/^(\d+\.|[-*+]|>\s*)\s*(\[[ xX]\]\s*)?/, "")
      .trimStart();

    if (allChecklist) {
      return stripped;
    }
    return `- [ ] ${stripped}`;
  });

  const replacement = formattedLines.join("\n");
  const newText = text.substring(0, lineStart) + replacement + text.substring(lineEnd);
  return {
    newText,
    newStart: lineStart,
    newEnd: lineStart + replacement.length
  };
}

export function applyBlockquoteToText(
  text: string,
  start: number,
  end: number
): { newText: string; newStart: number; newEnd: number } {
  const prevNewline = text.lastIndexOf("\n", start - 1);
  const lineStart = prevNewline === -1 ? 0 : prevNewline + 1;
  const nextNewline = text.indexOf("\n", end);
  const lineEnd = nextNewline === -1 ? text.length : nextNewline;

  const targetChunk = text.substring(lineStart, lineEnd);
  const lines = targetChunk.split("\n");

  const allQuoted = lines.length > 0 && lines.every((l) => !l.trim() || /^>\s*/.test(l.trimStart()));

  const formattedLines = lines.map((line) => {
    if (!line.trim()) {
      return allQuoted ? "" : "> ";
    }
    if (allQuoted) {
      return line.replace(/^>\s*/, "");
    }
    return `> ${line}`;
  });

  const replacement = formattedLines.join("\n");
  const newText = text.substring(0, lineStart) + replacement + text.substring(lineEnd);
  return {
    newText,
    newStart: lineStart,
    newEnd: lineStart + replacement.length
  };
}

export function applyIndentToText(
  text: string,
  start: number,
  end: number,
  increase: boolean
): { newText: string; newStart: number; newEnd: number } {
  const prevNewline = text.lastIndexOf("\n", start - 1);
  const lineStart = prevNewline === -1 ? 0 : prevNewline + 1;
  const nextNewline = text.indexOf("\n", end);
  const lineEnd = nextNewline === -1 ? text.length : nextNewline;

  const targetChunk = text.substring(lineStart, lineEnd);
  const lines = targetChunk.split("\n");

  const formattedLines = lines.map((line) => {
    if (increase) {
      return `  ${line}`;
    } else {
      return line.replace(/^ {1,2}|\t/, "");
    }
  });

  const replacement = formattedLines.join("\n");
  const newText = text.substring(0, lineStart) + replacement + text.substring(lineEnd);
  return {
    newText,
    newStart: lineStart,
    newEnd: lineStart + replacement.length
  };
}

export function insertLineBreakToText(
  text: string,
  start: number,
  end: number
): { newText: string; newStart: number; newEnd: number } {
  const replacement = "\n\n";
  const newText = text.substring(0, start) + replacement + text.substring(end);
  const newPos = start + replacement.length;
  return {
    newText,
    newStart: newPos,
    newEnd: newPos
  };
}
