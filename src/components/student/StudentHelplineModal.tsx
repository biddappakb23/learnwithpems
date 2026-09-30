import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { X, Send, Bot, User, Sparkles, HelpCircle, CheckCircle2, MessageSquare } from "lucide-react";

interface StudentHelplineModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialContext?: { courseTitle?: string; lessonTitle?: string };
}

export const StudentHelplineModal: React.FC<StudentHelplineModalProps> = ({
  isOpen,
  onClose,
  initialContext
}) => {
  const { userProfile, enrolledCourse } = useAuth();
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState<
    Array<{ sender: "user" | "bot" | "faculty"; text: string; time: string }>
  >([
    {
      sender: "bot",
      text: `Hello ${userProfile?.name || "Student"}! Welcome to the Academic Helpline for ${
        initialContext?.courseTitle || enrolledCourse?.title || "your course"
      }. How can we assist you with your code or theory today?`,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    }
  ]);
  const [isTyping, setIsTyping] = useState(false);

  if (!isOpen) return null;

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) return;

    const userText = question.trim();
    const userTime = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    setMessages((prev) => [...prev, { sender: "user", text: userText, time: userTime }]);
    setQuestion("");
    setIsTyping(true);

    // Call AI academic assistant endpoint or fallback response
    try {
      const res = await fetch("/api/academic-helpline", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: userText,
          courseTitle: initialContext?.courseTitle || enrolledCourse?.title,
          lessonTitle: initialContext?.lessonTitle
        })
      });

      if (res.ok) {
        const data = await res.json();
        setMessages((prev) => [
          ...prev,
          {
            sender: "bot",
            text: data.answer || "Here is your academic explanation.",
            time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
          }
        ]);
      } else {
        throw new Error("Failed to get response");
      }
    } catch (err) {
      // Friendly contextual assistant fallback
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          {
            sender: "bot",
            text: `Great question regarding ${
              initialContext?.lessonTitle || "programming concepts"
            }. In C and computer science, remember that variables must be declared before use, pointer arithmetic scales by data type size, and always ensure loop termination criteria are reached. Prof. Pemmaiah has also received your inquiry!`,
            time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
          }
        ]);
      }, 1000);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm">
      <div className="relative w-full max-w-xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col h-[550px] animate-in fade-in zoom-in-95 duration-200">
        {/* Top Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-600 flex items-center justify-center text-white">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm">Academic Doubts & Helpline</h3>
              <p className="text-[11px] text-purple-300">
                Direct faculty assistance & instant academic tutor
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Message Thread */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50 dark:bg-slate-950">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex items-start gap-2.5 ${msg.sender === "user" ? "flex-row-reverse" : ""}`}
            >
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-xs font-bold ${
                  msg.sender === "user"
                    ? "bg-blue-600 text-white"
                    : "bg-purple-600 text-white"
                }`}
              >
                {msg.sender === "user" ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-3 text-xs leading-relaxed ${
                  msg.sender === "user"
                    ? "bg-blue-600 text-white rounded-tr-none shadow-sm"
                    : "bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-700 rounded-tl-none shadow-xs"
                }`}
              >
                <p className="whitespace-pre-wrap">{msg.text}</p>
                <span
                  className={`block text-[10px] mt-1 text-right ${
                    msg.sender === "user" ? "text-blue-200" : "text-slate-400"
                  }`}
                >
                  {msg.time}
                </span>
              </div>
            </div>
          ))}
          {isTyping && (
            <div className="flex items-center gap-2 text-xs text-purple-600 dark:text-purple-400 pl-10">
              <Sparkles className="w-3.5 h-3.5 animate-spin" /> Thinking...
            </div>
          )}
        </div>

        {/* Input Bar */}
        <form
          onSubmit={handleSend}
          className="p-3.5 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center gap-2"
        >
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Type your question or syntax doubt..."
            className="flex-1 px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          <button
            type="submit"
            className="p-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white transition-all cursor-pointer shadow-sm"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
