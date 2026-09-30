import React, { useState } from "react";
import {
  Mail,
  Send,
  Building2,
  MapPin,
  CheckCircle2,
  HelpCircle,
  MessageSquare,
  Sparkles,
  Phone
} from "lucide-react";
import { Breadcrumbs } from "./Breadcrumbs";

interface ContactViewProps {
  onNavigateHome: () => void;
  onExploreCourses: () => void;
}

export const ContactView: React.FC<ContactViewProps> = ({
  onNavigateHome,
  onExploreCourses
}) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !message) return;
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <Breadcrumbs
        items={[
          { name: "Home", onClick: onNavigateHome },
          { name: "Contact & Academic Inquiries" }
        ]}
      />

      <main className="flex-1 max-w-5xl mx-auto px-4 py-10 sm:py-14 w-full">
        <header className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/25 text-blue-400 text-xs font-semibold mb-4">
            <Mail className="w-4 h-4" />
            <span>Academic Support & Feedback</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
            Contact <span className="text-blue-400">LearnWithPems</span>
          </h1>
          <p className="mt-4 text-slate-300 text-base sm:text-lg leading-relaxed">
            Have questions about course curriculum, academic mentorship, or platform features?
            We are here to assist students and educators.
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Institutional Info Sidebar */}
          <aside className="lg:col-span-2 space-y-6">
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-lg">
              <h2 className="text-lg font-bold text-white mb-4">Department Information</h2>

              <div className="space-y-4 text-sm text-slate-300">
                <div className="flex items-start gap-3">
                  <Building2 className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="block text-white font-semibold">Department of BCA</strong>
                    <span className="text-slate-400 text-xs">Cauvery College, Gonikoppal</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="block text-white font-semibold">Location</strong>
                    <span className="text-slate-400 text-xs">
                      Gonikoppal, Kodagu District, Karnataka, India - 571213
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Mail className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="block text-white font-semibold">Official Contact</strong>
                    <span className="text-slate-400 text-xs font-mono">contact@learnwithpems.in</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-slate-800">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Academic Hours
                </h3>
                <p className="text-xs text-slate-400">
                  Monday – Friday: 9:00 AM – 5:00 PM IST<br />
                  Saturday: 9:00 AM – 1:30 PM IST
                </p>
              </div>
            </div>

            <div className="bg-blue-950/30 border border-blue-900/40 rounded-2xl p-5">
              <div className="flex items-center gap-2.5 text-blue-400 font-bold text-sm mb-2">
                <HelpCircle className="w-4 h-4" />
                <span>Frequently Asked Inquiries</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Looking for syllabus guides, notes, or course enrollments? All learning tracks are freely accessible from the homepage.
              </p>
            </div>
          </aside>

          {/* Contact Form */}
          <section className="lg:col-span-3">
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl">
              <h2 className="text-xl font-bold text-white mb-2">Send an Academic Inquiry</h2>
              <p className="text-xs sm:text-sm text-slate-400 mb-6">
                Fill in the form below and our team will get back to you promptly.
              </p>

              {submitted ? (
                <div className="p-6 rounded-xl bg-emerald-950/40 border border-emerald-800 text-center space-y-3">
                  <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-white">Message Dispatched</h3>
                  <p className="text-xs sm:text-sm text-slate-300 max-w-md mx-auto">
                    Thank you for reaching out! Your message has been received. Our academic coordinator will review it.
                  </p>
                  <button
                    onClick={() => {
                      setSubmitted(false);
                      setName("");
                      setEmail("");
                      setSubject("");
                      setMessage("");
                    }}
                    className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 mt-2"
                  >
                    Send Another Message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                        Your Full Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. Rahul Sharma"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-slate-100 text-sm outline-none transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="e.g. rahul@example.com"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-slate-100 text-sm outline-none transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Subject / Topic
                    </label>
                    <input
                      type="text"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      placeholder="e.g. BCA C-Programming Curriculum Query"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-slate-100 text-sm outline-none transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Message *
                    </label>
                    <textarea
                      rows={5}
                      required
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Write your questions, feedback, or collaboration details..."
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-slate-100 text-sm outline-none transition-all resize-none"
                    ></textarea>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-blue-600/25 transition-all cursor-pointer"
                  >
                    <Send className="w-4 h-4" />
                    <span>Submit Inquiry</span>
                  </button>
                </form>
              )}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};
