import React, { useState } from "react";
import {
  X,
  HelpCircle,
  Code2,
  CheckCircle2,
  XCircle,
  Play,
  Sparkles,
  Plus,
  Trash2,
  Check,
  Eye,
  Settings2,
  AlertTriangle,
  Lightbulb
} from "lucide-react";
import { Module, Lesson, QuizQuestion, QuizQuestionType, QuizDifficulty } from "../types";

interface QuizManagerModalProps {
  initialData: Partial<QuizQuestion> | null;
  modules: Module[];
  lessons: Lesson[];
  onSave: (data: Partial<QuizQuestion> & { moduleId: string; question: string }) => void;
  onClose: () => void;
}

export const QuizManagerModal: React.FC<QuizManagerModalProps> = ({
  initialData,
  modules,
  lessons,
  onSave,
  onClose
}) => {
  const isEditing = Boolean(initialData?.id);

  // Form State
  const [moduleId, setModuleId] = useState<string>(
    initialData?.moduleId || modules[0]?.id || ""
  );
  const [lessonId, setLessonId] = useState<string>(initialData?.lessonId || "");
  const [type, setType] = useState<QuizQuestionType>(initialData?.type || "mcq");
  const [difficulty, setDifficulty] = useState<QuizDifficulty>(initialData?.difficulty || "Medium");
  const [marks, setMarks] = useState<number>(initialData?.marks ?? 5);
  const [question, setQuestion] = useState<string>(initialData?.question || "");
  const [codeSnippet, setCodeSnippet] = useState<string>(initialData?.codeSnippet || "");
  
  // Options state
  const [options, setOptions] = useState<string[]>(() => {
    if (initialData?.options && initialData.options.length > 0) {
      return initialData.options;
    }
    return ["Option A", "Option B", "Option C", "Option D"];
  });

  const [correctAnswer, setCorrectAnswer] = useState<number | string>(() => {
    if (initialData?.correctAnswer !== undefined) {
      return initialData.correctAnswer;
    }
    return 0;
  });

  const [explanation, setExplanation] = useState<string>(initialData?.explanation || "");

  // Modal View: "edit" or "test"
  const [activeTab, setActiveTab] = useState<"edit" | "test">("edit");
  const [validationError, setValidationError] = useState<string | null>(null);

  // Live Test State
  const [testSelectedAnswer, setTestSelectedAnswer] = useState<number | string | null>(null);
  const [testSubmitted, setTestSubmitted] = useState<boolean>(false);

  // Filter lessons belonging to the selected module
  const availableLessons = lessons.filter((l) => !moduleId || l.moduleId === moduleId);

  // Handle Type Change
  const handleTypeChange = (newType: QuizQuestionType) => {
    setType(newType);
    if (newType === "true_false") {
      setOptions(["True", "False"]);
      if (typeof correctAnswer !== "number" || (correctAnswer !== 0 && correctAnswer !== 1)) {
        setCorrectAnswer(0);
      }
    } else if (newType === "fill_blank") {
      setCorrectAnswer(typeof correctAnswer === "string" ? correctAnswer : "");
    } else {
      if (options.length < 2) {
        setOptions(["Option A", "Option B", "Option C", "Option D"]);
      }
      if (typeof correctAnswer !== "number" || correctAnswer >= options.length) {
        setCorrectAnswer(0);
      }
    }
  };

  // Option editing helpers
  const handleOptionTextChange = (index: number, val: string) => {
    const updated = [...options];
    updated[index] = val;
    setOptions(updated);
  };

  const handleAddOption = () => {
    if (options.length >= 6) return;
    setOptions([...options, `Option ${String.fromCharCode(65 + options.length)}`]);
  };

  const handleRemoveOption = (index: number) => {
    if (options.length <= 2) return;
    const updated = options.filter((_, i) => i !== index);
    setOptions(updated);
    if (typeof correctAnswer === "number") {
      if (correctAnswer === index) setCorrectAnswer(0);
      else if (correctAnswer > index) setCorrectAnswer(correctAnswer - 1);
    }
  };

  // Form Validation & Submit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    if (!moduleId) {
      setValidationError("Please select a target module.");
      return;
    }
    if (!question.trim()) {
      setValidationError("Question statement cannot be empty.");
      return;
    }

    if (type === "mcq" || type === "code_output") {
      if (options.some((o) => !o.trim())) {
        setValidationError("All option fields must have text.");
        return;
      }
      if (typeof correctAnswer !== "number" || correctAnswer < 0 || correctAnswer >= options.length) {
        setValidationError("Please select a valid correct answer option.");
        return;
      }
    } else if (type === "true_false") {
      if (correctAnswer !== 0 && correctAnswer !== 1) {
        setValidationError("Please specify True (0) or False (1) as the correct answer.");
        return;
      }
    } else if (type === "fill_blank") {
      if (typeof correctAnswer !== "string" || !correctAnswer.trim()) {
        setValidationError("Please specify the exact expected answer string for the blank.");
        return;
      }
    }

    onSave({
      ...(initialData?.id ? { id: initialData.id } : {}),
      moduleId,
      lessonId: lessonId || undefined,
      type,
      question: question.trim(),
      codeSnippet: codeSnippet.trim() ? codeSnippet.trim() : undefined,
      options: type === "fill_blank" ? [] : options,
      correctAnswer: type === "fill_blank" ? (correctAnswer as string).trim() : Number(correctAnswer),
      explanation: explanation.trim(),
      marks: Number(marks) || 5,
      difficulty
    });
  };

  // Live Test evaluation
  const isTestAnswerCorrect = () => {
    if (testSelectedAnswer === null) return false;
    if (type === "fill_blank") {
      return (
        String(testSelectedAnswer).trim().toLowerCase() ===
        String(correctAnswer).trim().toLowerCase()
      );
    }
    return Number(testSelectedAnswer) === Number(correctAnswer);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto font-sans">
      <div className="w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden my-6 flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                {isEditing ? "Edit Quiz Question" : "Add New Quiz Question"}
              </h2>
              <p className="text-xs text-slate-400">
                Design interactive C assessment questions and test evaluation in real-time
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* View Tab Switcher */}
            <div className="flex items-center bg-slate-900 border border-slate-800 rounded-xl p-1 text-xs">
              <button
                type="button"
                onClick={() => setActiveTab("edit")}
                className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 cursor-pointer transition-colors ${
                  activeTab === "edit"
                    ? "bg-amber-600 text-white shadow-sm"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <Settings2 className="w-3.5 h-3.5" /> Configure
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveTab("test");
                  setTestSubmitted(false);
                  setTestSelectedAnswer(null);
                }}
                className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 cursor-pointer transition-colors ${
                  activeTab === "test"
                    ? "bg-emerald-600 text-white shadow-sm"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <Eye className="w-3.5 h-3.5" /> Live Test
              </button>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Validation Alert */}
        {validationError && (
          <div className="mx-6 mt-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 text-red-400" />
            <span>{validationError}</span>
          </div>
        )}

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-5 text-xs text-slate-200">
          {activeTab === "edit" ? (
            <form id="quiz-edit-form" onSubmit={handleSubmit} className="space-y-4">
              {/* Module, Lesson, Type, Difficulty Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1 font-medium">Target Module *</label>
                  <select
                    value={moduleId}
                    onChange={(e) => {
                      setModuleId(e.target.value);
                      setLessonId("");
                    }}
                    required
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 focus:border-amber-500 focus:outline-none"
                  >
                    {modules.map((m) => (
                      <option key={m.id} value={m.id}>
                        Module {m.moduleNumber}: {m.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-slate-400 block mb-1 font-medium">Lesson Tag (Optional)</label>
                  <select
                    value={lessonId}
                    onChange={(e) => setLessonId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 focus:border-amber-500 focus:outline-none"
                  >
                    <option value="">-- General Module Quiz --</option>
                    {availableLessons.map((l) => (
                      <option key={l.id} value={l.id}>
                        {l.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-slate-400 block mb-1 font-medium">Question Type *</label>
                  <select
                    value={type}
                    onChange={(e) => handleTypeChange(e.target.value as QuizQuestionType)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 focus:border-amber-500 focus:outline-none"
                  >
                    <option value="mcq">Multiple Choice (MCQ)</option>
                    <option value="true_false">True / False</option>
                    <option value="code_output">Predict Code Output</option>
                    <option value="fill_blank">Fill in the Blank</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-slate-400 block mb-1 font-medium">Difficulty</label>
                    <select
                      value={difficulty}
                      onChange={(e) => setDifficulty(e.target.value as QuizDifficulty)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 focus:border-amber-500 focus:outline-none"
                    >
                      <option value="Easy">Easy</option>
                      <option value="Medium">Medium</option>
                      <option value="Hard">Hard</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-slate-400 block mb-1 font-medium">Marks</label>
                    <input
                      type="number"
                      min={1}
                      max={100}
                      value={marks}
                      onChange={(e) => setMarks(Number(e.target.value))}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 focus:border-amber-500 focus:outline-none text-center font-bold"
                    />
                  </div>
                </div>
              </div>

              {/* Question Statement */}
              <div>
                <label className="text-slate-400 block mb-1 font-medium">
                  Question Prompt / Problem Statement *
                </label>
                <textarea
                  required
                  rows={3}
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="e.g. What will be the output of the following C code snippet?"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-100 focus:border-amber-500 focus:outline-none"
                />
              </div>

              {/* Optional Code Snippet */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-slate-400 font-medium flex items-center gap-1.5">
                    <Code2 className="w-3.5 h-3.5 text-cyan-400" /> C Code Snippet (Optional)
                  </label>
                  <span className="text-[11px] text-slate-500">Embedded syntax snippet</span>
                </div>
                <textarea
                  rows={4}
                  value={codeSnippet}
                  onChange={(e) => setCodeSnippet(e.target.value)}
                  placeholder={'#include <stdio.h>\nint main() {\n    int x = 5;\n    printf("%d", x++ + ++x);\n    return 0;\n}'}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 font-mono text-emerald-300 focus:border-cyan-500 focus:outline-none text-[11px]"
                />
              </div>

              {/* Options & Correct Answer Section */}
              <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800/80 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-200 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    Answer Choices & Designate Correct Answer
                  </span>
                  {(type === "mcq" || type === "code_output") && (
                    <button
                      type="button"
                      onClick={handleAddOption}
                      disabled={options.length >= 6}
                      className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-200 rounded-lg text-[11px] font-semibold flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add Option
                    </button>
                  )}
                </div>

                {/* MCQ / Code Output Options */}
                {(type === "mcq" || type === "code_output") && (
                  <div className="space-y-2.5">
                    {options.map((opt, idx) => {
                      const isCorrect = Number(correctAnswer) === idx;
                      return (
                        <div
                          key={idx}
                          className={`flex items-center gap-2.5 p-2 rounded-xl border transition-all ${
                            isCorrect
                              ? "bg-emerald-950/30 border-emerald-500/50"
                              : "bg-slate-900 border-slate-800"
                          }`}
                        >
                          <label
                            className="flex items-center gap-2 cursor-pointer shrink-0 pl-1"
                            title="Click to select this as the correct answer"
                          >
                            <input
                              type="radio"
                              name="quiz_correct_answer"
                              checked={isCorrect}
                              onChange={() => setCorrectAnswer(idx)}
                              className="accent-emerald-500 w-4 h-4 cursor-pointer"
                            />
                            <span className="font-bold text-slate-400 text-xs uppercase">
                              {String.fromCharCode(65 + idx)}:
                            </span>
                          </label>

                          <input
                            type="text"
                            value={opt}
                            onChange={(e) => handleOptionTextChange(idx, e.target.value)}
                            placeholder={`Choice ${String.fromCharCode(65 + idx)} text`}
                            className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-slate-100 focus:border-emerald-500 focus:outline-none"
                          />

                          {isCorrect && (
                            <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold text-[10px] shrink-0 border border-emerald-500/30">
                              Correct Key
                            </span>
                          )}

                          {options.length > 2 && (
                            <button
                              type="button"
                              onClick={() => handleRemoveOption(idx)}
                              className="p-1 text-slate-500 hover:text-rose-400 cursor-pointer"
                              title="Delete option"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* True / False Options */}
                {type === "true_false" && (
                  <div className="grid grid-cols-2 gap-3 pt-1">
                    {[
                      { label: "True", value: 0 },
                      { label: "False", value: 1 }
                    ].map((tf) => (
                      <label
                        key={tf.value}
                        className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                          Number(correctAnswer) === tf.value
                            ? "bg-emerald-950/40 border-emerald-500/60 text-emerald-300"
                            : "bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700"
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <input
                            type="radio"
                            name="quiz_correct_tf"
                            checked={Number(correctAnswer) === tf.value}
                            onChange={() => setCorrectAnswer(tf.value)}
                            className="accent-emerald-500 w-4 h-4 cursor-pointer"
                          />
                          <span className="font-bold text-sm">{tf.label}</span>
                        </div>
                        {Number(correctAnswer) === tf.value && (
                          <span className="text-[10px] font-bold uppercase bg-emerald-500/20 px-2 py-0.5 rounded-full">
                            Correct
                          </span>
                        )}
                      </label>
                    ))}
                  </div>
                )}

                {/* Fill in Blank Option */}
                {type === "fill_blank" && (
                  <div className="space-y-2 pt-1">
                    <label className="text-slate-400 block font-medium">
                      Exact Expected Answer (Case-insensitive keyword or value)
                    </label>
                    <input
                      type="text"
                      value={String(correctAnswer)}
                      onChange={(e) => setCorrectAnswer(e.target.value)}
                      placeholder="e.g. printf or pointer or 32"
                      className="w-full bg-slate-950 border border-emerald-500/40 rounded-xl p-2.5 font-mono text-emerald-300 focus:outline-none"
                    />
                  </div>
                )}
              </div>

              {/* Detailed Explanation */}
              <div>
                <label className="text-slate-400 block mb-1 font-medium flex items-center gap-1.5">
                  <Lightbulb className="w-3.5 h-3.5 text-amber-400" /> Explanation & Solution Rationale
                </label>
                <textarea
                  rows={3}
                  value={explanation}
                  onChange={(e) => setExplanation(e.target.value)}
                  placeholder="Explain why this answer is correct according to ANSI C standards (shown to students in feedback)..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-100 focus:border-amber-500 focus:outline-none"
                />
              </div>
            </form>
          ) : (
            /* LIVE TEST SIMULATION VIEW */
            <div className="space-y-4 animate-in fade-in">
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 font-bold text-[10px] uppercase">
                      {difficulty}
                    </span>
                    <span className="px-2.5 py-1 rounded-full bg-blue-500/20 text-blue-300 font-bold text-[10px]">
                      {marks} Marks
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-400 uppercase font-semibold">
                    Student Interactive Simulator
                  </span>
                </div>

                <h3 className="text-sm sm:text-base font-bold text-white leading-relaxed">
                  {question || "[Question prompt will appear here]"}
                </h3>

                {codeSnippet && (
                  <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl font-mono text-xs text-emerald-300 overflow-x-auto whitespace-pre">
                    {codeSnippet}
                  </div>
                )}

                {/* Options in Test View */}
                {type === "fill_blank" ? (
                  <div className="space-y-2">
                    <label className="text-slate-400 block font-medium">Type your answer:</label>
                    <input
                      type="text"
                      disabled={testSubmitted}
                      value={String(testSelectedAnswer || "")}
                      onChange={(e) => setTestSelectedAnswer(e.target.value)}
                      placeholder="Enter response here..."
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-white font-mono"
                    />
                  </div>
                ) : (
                  <div className="space-y-2">
                    {options.map((opt, idx) => {
                      const isSelected = testSelectedAnswer === idx;
                      const isCorrectOption = Number(correctAnswer) === idx;

                      let style = "bg-slate-900 border-slate-800 text-slate-200 hover:border-slate-700";
                      if (testSubmitted) {
                        if (isCorrectOption) {
                          style = "bg-emerald-950/60 border-emerald-500 text-emerald-200 font-bold";
                        } else if (isSelected && !isCorrectOption) {
                          style = "bg-rose-950/60 border-rose-500 text-rose-200 font-bold";
                        }
                      } else if (isSelected) {
                        style = "bg-amber-600/20 border-amber-500 text-white font-bold";
                      }

                      return (
                        <button
                          key={idx}
                          type="button"
                          disabled={testSubmitted}
                          onClick={() => setTestSelectedAnswer(idx)}
                          className={`w-full p-3 rounded-xl border text-left flex items-center justify-between cursor-pointer transition-all ${style}`}
                        >
                          <div className="flex items-center gap-3">
                            <span className="w-6 h-6 rounded-lg bg-slate-800 flex items-center justify-center font-bold text-xs">
                              {String.fromCharCode(65 + idx)}
                            </span>
                            <span>{opt}</span>
                          </div>

                          {testSubmitted && isCorrectOption && (
                            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                          )}
                          {testSubmitted && isSelected && !isCorrectOption && (
                            <XCircle className="w-4 h-4 text-rose-400" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* Test Action Buttons */}
                <div className="pt-2 flex items-center gap-2">
                  {!testSubmitted ? (
                    <button
                      type="button"
                      disabled={testSelectedAnswer === null || testSelectedAnswer === ""}
                      onClick={() => setTestSubmitted(true)}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white font-bold rounded-xl flex items-center gap-1.5 cursor-pointer shadow-md shadow-emerald-900/30"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" /> Submit Answer Test
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        setTestSubmitted(false);
                        setTestSelectedAnswer(null);
                      }}
                      className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl cursor-pointer"
                    >
                      Reset Test
                    </button>
                  )}
                </div>

                {/* Test Result Feedback */}
                {testSubmitted && (
                  <div
                    className={`p-4 rounded-xl border space-y-2 animate-in fade-in ${
                      isTestAnswerCorrect()
                        ? "bg-emerald-950/40 border-emerald-500/40 text-emerald-200"
                        : "bg-rose-950/40 border-rose-500/40 text-rose-200"
                    }`}
                  >
                    <div className="flex items-center gap-2 font-bold text-sm">
                      {isTestAnswerCorrect() ? (
                        <>
                          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                          <span>Correct Answer! (+{marks} Marks awarded)</span>
                        </>
                      ) : (
                        <>
                          <XCircle className="w-5 h-5 text-rose-400" />
                          <span>Incorrect Selection. Correct answer is: {type === "fill_blank" ? String(correctAnswer) : options[Number(correctAnswer)]}</span>
                        </>
                      )}
                    </div>
                    {explanation && (
                      <div className="text-xs pt-1 border-t border-slate-800/80 text-slate-300">
                        <strong className="text-amber-300">Explanation:</strong> {explanation}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-slate-950/80 border-t border-slate-800 flex items-center justify-between shrink-0">
          <div className="text-slate-400 text-xs">
            {activeTab === "edit" ? "Review inputs before publishing" : "Simulator validated for live quizzes"}
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="quiz-edit-form"
              onClick={(e) => {
                if (activeTab === "test") {
                  setActiveTab("edit");
                  setTimeout(() => {
                    const form = document.getElementById("quiz-edit-form") as HTMLFormElement;
                    form?.requestSubmit();
                  }, 50);
                }
              }}
              className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-lg shadow-amber-600/30"
            >
              <Check className="w-4 h-4" />
              <span>{isEditing ? "Update Quiz Question" : "Save Quiz Question"}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
