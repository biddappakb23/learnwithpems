import { Course, Lesson } from "../types";
import { getCourses } from "./db";

export const SITE_NAME = "LearnWithPems";
export const SITE_BASE_URL = "https://www.learnwithpems.in";
export const DEFAULT_OG_IMAGE = "https://www.learnwithpems.in/og-preview.png";
export const INSTRUCTOR_NAME = "Pemmaiah U. T.";
export const INSTRUCTOR_TITLE = "Head of the Department of BCA, Cauvery College, Gonikoppal";

export interface SEOMetadata {
  title: string;
  description: string;
  canonicalUrl: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  ogType?: "website" | "article";
  twitterCard?: "summary" | "summary_large_image";
  noIndex?: boolean;
  publishedDate?: string;
  updatedDate?: string;
  breadcrumbs?: { name: string; url: string }[];
  schemaJson?: Record<string, any>[];
}

/**
 * Normalizes any string into a clean, SEO-friendly URL slug
 */
export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w\-]+/g, "")
    .replace(/\-\-+/g, "-")
    .replace(/^-+/, "")
    .replace(/-+$/, "");
}

/**
 * Course URL slug mapping (maps both short and standard aliases)
 */
export const COURSE_SLUG_MAP: Record<string, string> = {
  "c": "learn-c",
  "learn-c": "learn-c",
  "c-programming": "learn-c",
  "java": "learn-java",
  "learn-java": "learn-java",
  "python": "learn-python",
  "learn-python": "learn-python",
  "data-structures": "learn-data-structures",
  "learn-data-structures": "learn-data-structures",
  "ds": "learn-data-structures",
  "dbms": "learn-dbms",
  "learn-dbms": "learn-dbms",
  "html-css": "learn-html-css",
  "learn-html-css": "learn-html-css",
  "javascript": "learn-javascript",
  "learn-javascript": "learn-javascript",
  "computer-networks": "learn-computer-networks",
  "learn-computer-networks": "learn-computer-networks",
  "operating-systems": "learn-operating-systems",
  "learn-operating-systems": "learn-operating-systems",
  "software-engineering": "learn-software-engineering",
  "learn-software-engineering": "learn-software-engineering",
  "artificial-intelligence": "learn-artificial-intelligence",
  "learn-artificial-intelligence": "learn-artificial-intelligence",
  "ai": "learn-artificial-intelligence",
  "cyber-security": "learn-cyber-security",
  "learn-cyber-security": "learn-cyber-security"
};

/**
 * Get Course ID from path slug (checks live courses first, then aliases)
 */
export function getCourseIdFromSlug(slug: string, liveCourses: Course[] = []): string | null {
  if (!slug) return null;
  const normalized = slug.toLowerCase().trim();

  // 1. Check live courses list directly by id, slugified title, or courseCode
  if (liveCourses.length > 0) {
    const liveMatch = liveCourses.find((c) => {
      const cId = c.id.toLowerCase();
      const cleanId = cId.replace(/^learn-/, "");
      return (
        cId === normalized ||
        cleanId === normalized ||
        slugify(c.title) === normalized ||
        (c.courseCode && c.courseCode.toLowerCase() === normalized)
      );
    });
    if (liveMatch) return liveMatch.id;
  }

  // 2. Check static COURSE_SLUG_MAP aliases
  if (COURSE_SLUG_MAP[normalized]) {
    return COURSE_SLUG_MAP[normalized];
  }

  // 3. Check clean slug
  const withLearn = `learn-${normalized}`;
  if (COURSE_SLUG_MAP[withLearn]) {
    return COURSE_SLUG_MAP[withLearn];
  }

  return null;
}

/**
 * Get canonical course path from course ID
 */
export function getCourseCanonicalPath(courseId: string): string {
  const cleanId = courseId.replace(/^learn-/, "");
  return `/courses/${cleanId}`;
}

/**
 * Core Global Organization & WebSite Schemas
 */
export function getGlobalSchemas(): Record<string, any>[] {
  return [
    {
      "@context": "https://schema.org",
      "@type": "EducationalOrganization",
      "name": SITE_NAME,
      "url": SITE_BASE_URL,
      "logo": `${SITE_BASE_URL}/logo.png`,
      "description": "Learn programming and computer science subjects with structured courses, tutorials, notes, and interactive practice by Pemmaiah U.T.",
      "founder": {
        "@type": "Person",
        "name": INSTRUCTOR_NAME,
        "jobTitle": INSTRUCTOR_TITLE,
        "affiliation": {
          "@type": "CollegeOrUniversity",
          "name": "Cauvery College, Gonikoppal"
        }
      },
      "sameAs": [
        "https://www.linkedin.com",
        "https://github.com"
      ]
    },
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      "name": SITE_NAME,
      "url": SITE_BASE_URL,
      "description": "Free and open programming notes, computer science tutorials, and interactive coding exercises.",
      "inLanguage": "en-US",
      "publisher": {
        "@type": "EducationalOrganization",
        "name": SITE_NAME
      }
    }
  ];
}

/**
 * Homepage SEO metadata
 */
export function getHomepageSEO(): SEOMetadata {
  const globalSchemas = getGlobalSchemas();
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "What courses are available on LearnWithPems?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "LearnWithPems provides comprehensive, structured curriculums in C Programming, Java Mastery, Python for Engineers, Data Structures & Algorithms, DBMS, HTML & CSS, JavaScript, Computer Networks, Operating Systems, Software Engineering, Artificial Intelligence, and Cyber Security."
        }
      },
      {
        "@type": "Question",
        "name": "Who is the course instructor on LearnWithPems?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Courses and academic resources on LearnWithPems are developed and taught by Pemmaiah U. T., Head of the Department of BCA at Cauvery College, Gonikoppal."
        }
      },
      {
        "@type": "Question",
        "name": "Are the learning resources and compiler tools free for students?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes, all students can freely explore the curriculum syllabus, structured lesson notes, interactive code playgrounds, quizzes, and practical exercises on LearnWithPems."
        }
      }
    ]
  };

  return {
    title: "LearnWithPems – Learn C, Java, Python, Data Structures & Computer Science",
    description: "Learn programming and computer science with LearnWithPems. Explore C, Java, Python, Data Structures, notes, tutorials, examples and learning resources taught by Pemmaiah U. T.",
    canonicalUrl: `${SITE_BASE_URL}/`,
    ogTitle: "LearnWithPems – Learn Programming & Computer Science",
    ogDescription: "Master programming fundamentals, core CS subjects, algorithms, and practical development with structured notes and interactive labs.",
    ogImage: DEFAULT_OG_IMAGE,
    ogType: "website",
    twitterCard: "summary_large_image",
    schemaJson: [...globalSchemas, faqSchema]
  };
}

/**
 * Course Catalog listing page SEO metadata
 */
export function getCoursesCatalogSEO(): SEOMetadata {
  const globalSchemas = getGlobalSchemas();
  return {
    title: "All Computer Science & Programming Courses | LearnWithPems",
    description: "Explore 12 comprehensive computer science courses: C Programming, Java, Python, Data Structures, Web Development, Operating Systems, AI, and Cyber Security.",
    canonicalUrl: `${SITE_BASE_URL}/courses`,
    ogTitle: "Computer Science & Programming Course Catalog | LearnWithPems",
    ogDescription: "Curriculum designed for BCA, B.Tech, and CS students. Master programming concepts from foundational logic to advanced systems.",
    ogImage: DEFAULT_OG_IMAGE,
    ogType: "website",
    breadcrumbs: [
      { name: "Home", url: `${SITE_BASE_URL}/` },
      { name: "Courses", url: `${SITE_BASE_URL}/courses` }
    ],
    schemaJson: [
      ...globalSchemas,
      {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Home", "item": `${SITE_BASE_URL}/` },
          { "@type": "ListItem", "position": 2, "name": "Courses", "item": `${SITE_BASE_URL}/courses` }
        ]
      }
    ]
  };
}

/**
 * Individual Course Page SEO metadata & Schema
 */
export function getCourseSEO(course: Course): SEOMetadata {
  const canonicalPath = getCourseCanonicalPath(course.id);
  const canonicalUrl = `${SITE_BASE_URL}${canonicalPath}`;

  const courseSchema = {
    "@context": "https://schema.org",
    "@type": "Course",
    "name": `${course.title} Course`,
    "description": course.detailedDesc || course.shortDesc,
    "courseCode": course.courseCode,
    "educationalLevel": course.difficulty,
    "provider": {
      "@type": "EducationalOrganization",
      "name": SITE_NAME,
      "sameAs": SITE_BASE_URL
    },
    "instructor": {
      "@type": "Person",
      "name": course.instructorName || INSTRUCTOR_NAME,
      "jobTitle": course.instructorTitle || INSTRUCTOR_TITLE
    },
    "inLanguage": "en-US",
    "url": canonicalUrl,
    "hasCourseInstance": {
      "@type": "CourseInstance",
      "courseMode": "Online",
      "courseWorkload": `PT${course.estimatedDurationHours}H`
    }
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": `${SITE_BASE_URL}/` },
      { "@type": "ListItem", "position": 2, "name": "Courses", "item": `${SITE_BASE_URL}/courses` },
      { "@type": "ListItem", "position": 3, "name": course.title, "item": canonicalUrl }
    ]
  };

  return {
    title: `${course.title} – Complete Course, Syllabus & Notes | LearnWithPems`,
    description: `${course.shortDesc} Master ${course.tags.slice(0, 4).join(", ")} with practical lessons, notes, and quizzes taught by ${course.instructorName}.`,
    canonicalUrl,
    ogTitle: `${course.title} Course (${course.courseCode}) | LearnWithPems`,
    ogDescription: course.detailedDesc.slice(0, 160),
    ogImage: DEFAULT_OG_IMAGE,
    ogType: "website",
    publishedDate: "2026-01-15",
    updatedDate: "2026-08-15",
    breadcrumbs: [
      { name: "Home", url: `${SITE_BASE_URL}/` },
      { name: "Courses", url: `${SITE_BASE_URL}/courses` },
      { name: course.title, url: canonicalUrl }
    ],
    schemaJson: [courseSchema, breadcrumbSchema]
  };
}

/**
 * Individual Lesson / Educational Note SEO metadata
 */
export function getLessonSEO(lesson: Lesson, courseName = "C Programming", courseSlug = "c"): SEOMetadata {
  const lessonSlug = slugify(lesson.title);
  const canonicalUrl = `${SITE_BASE_URL}/courses/${courseSlug}/${lessonSlug}`;

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "TechArticle",
    "headline": `${lesson.title} - ${courseName} Tutorial & Notes`,
    "description": lesson.shortDesc || `Learn about ${lesson.title} in ${courseName} with comprehensive explanations, code examples, and practice programs.`,
    "author": {
      "@type": "Person",
      "name": INSTRUCTOR_NAME,
      "jobTitle": INSTRUCTOR_TITLE
    },
    "publisher": {
      "@type": "EducationalOrganization",
      "name": SITE_NAME,
      "url": SITE_BASE_URL
    },
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": canonicalUrl
    },
    "datePublished": lesson.createdAt || "2026-01-15T00:00:00Z",
    "dateModified": lesson.updatedAt || "2026-08-15T00:00:00Z",
    "inLanguage": "en-US",
    "proficiencyLevel": lesson.difficulty || "Beginner"
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": `${SITE_BASE_URL}/` },
      { "@type": "ListItem", "position": 2, "name": "Courses", "item": `${SITE_BASE_URL}/courses` },
      { "@type": "ListItem", "position": 3, "name": courseName, "item": `${SITE_BASE_URL}/courses/${courseSlug}` },
      { "@type": "ListItem", "position": 4, "name": lesson.title, "item": canonicalUrl }
    ]
  };

  return {
    title: `${lesson.title} – ${courseName} Notes & Examples | LearnWithPems`,
    description: `${lesson.shortDesc || `Learn ${lesson.title} with complete syntax, working code examples, output analysis, and common mistakes in ${courseName}.`}`.slice(0, 160),
    canonicalUrl,
    ogTitle: `${lesson.title} | ${courseName} Notes | LearnWithPems`,
    ogDescription: (lesson.shortDesc || lesson.title).slice(0, 160),
    ogImage: DEFAULT_OG_IMAGE,
    ogType: "article",
    publishedDate: lesson.createdAt || "2026-01-15",
    updatedDate: lesson.updatedAt || "2026-08-15",
    breadcrumbs: [
      { name: "Home", url: `${SITE_BASE_URL}/` },
      { name: "Courses", url: `${SITE_BASE_URL}/courses` },
      { name: courseName, url: `${SITE_BASE_URL}/courses/${courseSlug}` },
      { name: lesson.title, url: canonicalUrl }
    ],
    schemaJson: [articleSchema, breadcrumbSchema]
  };
}

/**
 * About Page SEO metadata
 */
export function getAboutSEO(): SEOMetadata {
  const canonicalUrl = `${SITE_BASE_URL}/about`;
  const globalSchemas = getGlobalSchemas();

  const personSchema = {
    "@context": "https://schema.org",
    "@type": "Person",
    "name": INSTRUCTOR_NAME,
    "jobTitle": INSTRUCTOR_TITLE,
    "affiliation": {
      "@type": "CollegeOrUniversity",
      "name": "Cauvery College, Gonikoppal"
    },
    "description": "Educator and academic leader guiding students in Cyber Security, Blockchain, Cryptography, Artificial Intelligence, and Systems Programming.",
    "knowsAbout": [
      "C Programming",
      "Java",
      "Python",
      "Data Structures and Algorithms",
      "Cyber Security",
      "Post-Quantum Cryptography",
      "Blockchain Technology"
    ]
  };

  return {
    title: `About Instructor & Platform – LearnWithPems | ${INSTRUCTOR_NAME}`,
    description: `Learn about LearnWithPems, an educational initiative by ${INSTRUCTOR_NAME}, Head of BCA at Cauvery College, Gonikoppal. Fostering skill-based learning and innovation.`,
    canonicalUrl,
    ogTitle: `About LearnWithPems & Instructor ${INSTRUCTOR_NAME}`,
    ogDescription: "Discover the educational mission, student mentorship initiatives, and technical curriculum behind LearnWithPems.",
    ogImage: DEFAULT_OG_IMAGE,
    ogType: "website",
    breadcrumbs: [
      { name: "Home", url: `${SITE_BASE_URL}/` },
      { name: "About", url: canonicalUrl }
    ],
    schemaJson: [...globalSchemas, personSchema]
  };
}

/**
 * Contact Page SEO metadata
 */
export function getContactSEO(): SEOMetadata {
  const canonicalUrl = `${SITE_BASE_URL}/contact`;
  const globalSchemas = getGlobalSchemas();

  return {
    title: "Contact & Academic Inquiries | LearnWithPems",
    description: "Get in touch with Pemmaiah U. T. and the LearnWithPems academic team for course inquiries, student mentorship, and workshop collaborations.",
    canonicalUrl,
    ogTitle: "Contact LearnWithPems",
    ogDescription: "Reach out for technical questions, student support, and academic guidance.",
    ogImage: DEFAULT_OG_IMAGE,
    ogType: "website",
    breadcrumbs: [
      { name: "Home", url: `${SITE_BASE_URL}/` },
      { name: "Contact", url: canonicalUrl }
    ],
    schemaJson: [...globalSchemas]
  };
}

/**
 * Notes Directory SEO metadata
 */
export function getNotesDirectorySEO(): SEOMetadata {
  const canonicalUrl = `${SITE_BASE_URL}/notes`;
  const globalSchemas = getGlobalSchemas();

  return {
    title: "Computer Science & Programming Notes – Free Study Materials | LearnWithPems",
    description: "Access structured programming notes, chapter summaries, syntax cheat sheets, code examples, and practice questions for C, Java, Python, and Data Structures.",
    canonicalUrl,
    ogTitle: "Programming Notes & Study Materials | LearnWithPems",
    ogDescription: "Download and read high-yield computer science notes and revision summaries.",
    ogImage: DEFAULT_OG_IMAGE,
    ogType: "website",
    breadcrumbs: [
      { name: "Home", url: `${SITE_BASE_URL}/` },
      { name: "Notes", url: canonicalUrl }
    ],
    schemaJson: [...globalSchemas]
  };
}

/**
 * Practice Lab SEO metadata
 */
export function getPracticeSEO(): SEOMetadata {
  const canonicalUrl = `${SITE_BASE_URL}/practice`;
  const globalSchemas = getGlobalSchemas();

  return {
    title: "Interactive Programming Practice Lab & Coding Exercises | LearnWithPems",
    description: "Solve algorithmic programming problems in C, data structures, loops, arrays, and recursion with instant test case verification and hints.",
    canonicalUrl,
    ogTitle: "Programming Practice Lab | LearnWithPems",
    ogDescription: "Sharpen your coding skills with guided exercises and live execution.",
    ogImage: DEFAULT_OG_IMAGE,
    ogType: "website",
    breadcrumbs: [
      { name: "Home", url: `${SITE_BASE_URL}/` },
      { name: "Practice Lab", url: canonicalUrl }
    ],
    schemaJson: [...globalSchemas]
  };
}

/**
 * Quizzes Portal SEO metadata
 */
export function getQuizzesSEO(): SEOMetadata {
  const canonicalUrl = `${SITE_BASE_URL}/quizzes`;
  const globalSchemas = getGlobalSchemas();

  return {
    title: "Computer Science Quizzes & Concept Assessments | LearnWithPems",
    description: "Test your understanding with module-wise programming quizzes, multiple choice questions, and output prediction problems.",
    canonicalUrl,
    ogTitle: "Computer Science Quizzes | LearnWithPems",
    ogDescription: "Self-evaluate your mastery of C, Java, Python, and Data Structures.",
    ogImage: DEFAULT_OG_IMAGE,
    ogType: "website",
    breadcrumbs: [
      { name: "Home", url: `${SITE_BASE_URL}/` },
      { name: "Quizzes", url: canonicalUrl }
    ],
    schemaJson: [...globalSchemas]
  };
}

/**
 * Privacy Policy SEO metadata
 */
export function getPrivacyPolicySEO(): SEOMetadata {
  const canonicalUrl = `${SITE_BASE_URL}/privacy-policy`;
  return {
    title: "Privacy Policy | LearnWithPems",
    description: "LearnWithPems privacy policy, data protection terms, student account security, and educational platform usage guidelines.",
    canonicalUrl,
    ogTitle: "Privacy Policy | LearnWithPems",
    ogDescription: "Read how student privacy and data are respected on LearnWithPems.",
    ogType: "website",
    breadcrumbs: [
      { name: "Home", url: `${SITE_BASE_URL}/` },
      { name: "Privacy Policy", url: canonicalUrl }
    ]
  };
}

/**
 * Terms & Conditions SEO metadata
 */
export function getTermsSEO(): SEOMetadata {
  const canonicalUrl = `${SITE_BASE_URL}/terms-and-conditions`;
  return {
    title: "Terms and Conditions | LearnWithPems",
    description: "Terms and conditions for utilizing LearnWithPems educational courses, compilers, coding exercises, and learning resources.",
    canonicalUrl,
    ogTitle: "Terms and Conditions | LearnWithPems",
    ogDescription: "Platform guidelines and educational terms of service.",
    ogType: "website",
    breadcrumbs: [
      { name: "Home", url: `${SITE_BASE_URL}/` },
      { name: "Terms and Conditions", url: canonicalUrl }
    ]
  };
}

/**
 * 404 Not Found SEO metadata
 */
export function getNotFoundSEO(): SEOMetadata {
  return {
    title: "Page Not Found (404) | LearnWithPems",
    description: "The requested educational page could not be found. Explore our popular courses in C, Java, Python, and Data Structures.",
    canonicalUrl: `${SITE_BASE_URL}/404`,
    noIndex: true
  };
}

import { CATALOG_COURSES } from "./db";

/**
 * Generate complete XML Sitemap string
 */
export function generateXmlSitemap(lessons: Lesson[] = [], liveCourses: Course[] = []): string {
  const today = new Date().toISOString().split("T")[0];
  const coursesToUse = liveCourses.length > 0 ? liveCourses : CATALOG_COURSES;

  const staticPages = [
    { url: `${SITE_BASE_URL}/`, priority: "1.0", changefreq: "weekly" },
    { url: `${SITE_BASE_URL}/courses`, priority: "0.9", changefreq: "weekly" },
    { url: `${SITE_BASE_URL}/notes`, priority: "0.8", changefreq: "weekly" },
    { url: `${SITE_BASE_URL}/practice`, priority: "0.8", changefreq: "weekly" },
    { url: `${SITE_BASE_URL}/quizzes`, priority: "0.8", changefreq: "weekly" },
    { url: `${SITE_BASE_URL}/about`, priority: "0.7", changefreq: "monthly" },
    { url: `${SITE_BASE_URL}/contact`, priority: "0.6", changefreq: "monthly" },
    { url: `${SITE_BASE_URL}/privacy-policy`, priority: "0.3", changefreq: "yearly" },
    { url: `${SITE_BASE_URL}/terms-and-conditions`, priority: "0.3", changefreq: "yearly" }
  ];

  const coursePages = coursesToUse.map((course) => ({
    url: `${SITE_BASE_URL}${getCourseCanonicalPath(course.id)}`,
    priority: course.id === "learn-c" ? "0.95" : "0.85",
    changefreq: "weekly"
  }));

  const lessonPages = lessons
    .filter((l) => l.status === "Published")
    .map((l) => ({
      url: `${SITE_BASE_URL}/courses/c/${slugify(l.title)}`,
      priority: "0.75",
      changefreq: "monthly"
    }));

  const allUrls = [...staticPages, ...coursePages, ...lessonPages];

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9
        http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">
${allUrls
  .map(
    (item) => `  <url>
    <loc>${item.url}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${item.changefreq}</changefreq>
    <priority>${item.priority}</priority>
  </url>`
  )
  .join("\n")}
</urlset>`;
}

/**
 * Generate robots.txt string
 */
export function generateRobotsTxt(): string {
  return `# LearnWithPems robots.txt
# Platform: https://www.learnwithpems.in/
User-agent: *
Allow: /
Allow: /courses/
Allow: /notes/
Allow: /practice/
Allow: /quizzes/
Allow: /about/
Allow: /contact/
Allow: /privacy-policy/
Allow: /terms-and-conditions/

# Disallow private user accounts and admin panels
Disallow: /admin
Disallow: /dashboard
Disallow: /api/

# Sitemap Location
Sitemap: ${SITE_BASE_URL}/sitemap.xml
`;
}
