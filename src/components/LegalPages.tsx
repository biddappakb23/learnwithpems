import React from "react";
import { ShieldCheck, FileText, Lock, Eye, AlertCircle, ArrowLeft } from "lucide-react";
import { Breadcrumbs } from "./Breadcrumbs";

interface LegalPageProps {
  type: "privacy" | "terms";
  onNavigateHome: () => void;
}

export const LegalPageView: React.FC<LegalPageProps> = ({ type, onNavigateHome }) => {
  const isPrivacy = type === "privacy";

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <Breadcrumbs
        items={[
          { name: "Home", onClick: onNavigateHome },
          { name: isPrivacy ? "Privacy Policy" : "Terms & Conditions" }
        ]}
      />

      <main className="flex-1 max-w-4xl mx-auto px-4 py-10 sm:py-14 w-full">
        <header className="mb-8 pb-6 border-b border-slate-800">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/25 text-blue-400 text-xs font-semibold mb-3">
            {isPrivacy ? <Lock className="w-3.5 h-3.5" /> : <FileText className="w-3.5 h-3.5" />}
            <span>Educational Platform Policy</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white">
            {isPrivacy ? "Privacy Policy" : "Terms and Conditions"}
          </h1>
          <p className="text-xs text-slate-400 mt-2">
            Last Updated: August 15, 2026 • Official Platform Document for LearnWithPems (learnwithpems.in)
          </p>
        </header>

        {isPrivacy ? (
          <article className="prose prose-invert max-w-none space-y-6 text-slate-300 text-sm leading-relaxed">
            <section className="space-y-3">
              <h2 className="text-lg font-bold text-white">1. Commitment to Student Privacy</h2>
              <p>
                LearnWithPems (&ldquo;learnwithpems.in&rdquo;) is an educational platform founded by Mr. Pemmaiah U. T. (Cauvery College, Gonikoppal). We are dedicated to maintaining strict student privacy and data integrity.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-bold text-white">2. Information We Collect</h2>
              <p>When you register for an account on LearnWithPems, we collect:</p>
              <ul className="list-disc pl-5 space-y-1.5 text-slate-300">
                <li><strong>Account Details:</strong> Full name, institutional/personal email address, mobile number, and college name.</li>
                <li><strong>Academic Progress:</strong> Quiz submission scores, completed practice problem exercises, and syllabus topic timestamps.</li>
                <li><strong>Compiler Code Data:</strong> Code snippets you write inside the interactive browser execution sandbox for testing purposes.</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-bold text-white">3. How Your Information is Utilized</h2>
              <p>We process collected data exclusively to:</p>
              <ul className="list-disc pl-5 space-y-1.5 text-slate-300">
                <li>Grant authorized access to academic course materials and interactive compiler tools.</li>
                <li>Track individual learning milestones, XP rewards, and diagnostic quiz achievements.</li>
                <li>Enable instructor review of curriculum progress and departmental reports.</li>
              </ul>
              <p>
                We do not sell, rent, or share personal student information with third-party advertisers or marketing data brokers.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-bold text-white">4. Data Security</h2>
              <p>
                Student authentication data is protected with modern cryptographic hashing standards and secure Google Cloud Firestore database infrastructure with authenticated security rules.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-bold text-white">5. Contact Regarding Privacy</h2>
              <p>
                For data access requests or privacy questions, please contact our academic administrator at <code className="text-blue-400">contact@learnwithpems.in</code>.
              </p>
            </section>
          </article>
        ) : (
          <article className="prose prose-invert max-w-none space-y-6 text-slate-300 text-sm leading-relaxed">
            <section className="space-y-3">
              <h2 className="text-lg font-bold text-white">1. Acceptance of Terms</h2>
              <p>
                By accessing and utilizing LearnWithPems (learnwithpems.in), you acknowledge and agree to comply with these Terms and Conditions. This platform is designed exclusively for educational, academic, and non-commercial learning purposes.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-bold text-white">2. Educational Content & Intellectual Property</h2>
              <p>
                All course curriculums, lesson notes, code examples, tutorial explanations, and practice problem sets published on this website are authored or curated by Mr. Pemmaiah U. T. and LearnWithPems. Content may be studied and referenced for academic learning. Unauthorized bulk scraping, commercial redistribution, or reproduction without citation is prohibited.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-bold text-white">3. User Code of Conduct</h2>
              <p>Students and learners utilizing the platform agree to:</p>
              <ul className="list-disc pl-5 space-y-1.5 text-slate-300">
                <li>Provide accurate information during account registration.</li>
                <li>Not attempt to exploit, disrupt, or overload the browser execution simulator or backend API services.</li>
                <li>Maintain academic honesty during quiz evaluations and practical problem submissions.</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-bold text-white">4. Disclaimer of Warranties</h2>
              <p>
                The learning materials and code simulators are provided on an &ldquo;as-is&rdquo; basis for instructional support. While we strive for absolute technical precision in all syntax examples and curriculum notes, LearnWithPems makes no warranties regarding guaranteed exam results or external system compatibility.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-bold text-white">5. Inquiries & Institutional Affiliation</h2>
              <p>
                For institutional inquiries or clarifications, contact the Department of BCA, Cauvery College Gonikoppal at <code className="text-blue-400">contact@learnwithpems.in</code>.
              </p>
            </section>
          </article>
        )}

        <div className="mt-12 pt-6 border-t border-slate-800 flex justify-between items-center">
          <button
            onClick={onNavigateHome}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Homepage</span>
          </button>
        </div>
      </main>
    </div>
  );
};
