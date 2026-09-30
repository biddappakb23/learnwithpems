import React from "react";
import { CourseExecutionProfile } from "../types";
import { getCourseExecutionProfile } from "../services/executionProfile";
import { CPlayground } from "./CPlayground";
import { PythonPlayground } from "./PythonPlayground";

export interface CodePlaygroundProps {
  initialCode?: string;
  title?: string;
  onCodeChange?: (code: string) => void;
  showTemplates?: boolean;
  courseId?: string;
  executionProfile?: CourseExecutionProfile;
}

/**
 * Universal Course-Aware Code Playground
 * Automatically routes to the dedicated language runner based on the course's
 * authoritative execution profile:
 * - C Programming / Data Structures in C -> Native GCC / Clang Playground
 * - Python -> Native CPython Playground
 */
export const CodePlayground: React.FC<CodePlaygroundProps> = (props) => {
  const profile = props.executionProfile || getCourseExecutionProfile(props.courseId);

  if (profile.language === "python") {
    return (
      <PythonPlayground
        initialCode={props.initialCode}
        title={props.title || "Interactive Python Code Playground"}
        onCodeChange={props.onCodeChange}
        showTemplates={props.showTemplates}
        courseId={props.courseId || "learn-python"}
        executionProfile={profile}
      />
    );
  }

  // Default to C Execution (C Programming, Data Structures, etc.)
  return (
    <CPlayground
      initialCode={props.initialCode}
      title={props.title || "Interactive C Code Playground"}
      onCodeChange={props.onCodeChange}
      showTemplates={props.showTemplates}
      courseId={props.courseId || "learn-c"}
      executionProfile={profile}
    />
  );
};
