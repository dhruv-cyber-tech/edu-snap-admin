// Realistic sample data for an Indian tuition center (EduVault).
// Used when USE_MOCK is true in src/api/client.js.

export const standards = [
  "Class 8",
  "Class 9",
  "Class 10",
  "Class 11",
  "Class 12",
];

export const subjects = [
  "Maths",
  "Science",
  "English",
  "Social Science",
  "Physics",
  "Chemistry",
  "Biology",
];

export const tags = [
  "important",
  "mid-term",
  "final-exam",
  "practice",
  "revision",
  "tricky",
];

// At least 3 chapters per subject.
export const chapters = {
  Maths: [
    "Real Numbers",
    "Polynomials",
    "Quadratic Equations",
    "Trigonometry",
  ],
  Science: [
    "Light — Reflection & Refraction",
    "Life Processes",
    "Electricity",
  ],
  English: [
    "Grammar Essentials",
    "Comprehension Practice",
    "Letter & Essay Writing",
  ],
  "Social Science": [
    "The French Revolution",
    "Resources & Development",
    "Democracy & Diversity",
  ],
  Physics: [
    "Laws of Motion",
    "Work, Energy & Power",
    "Electrostatics",
  ],
  Chemistry: [
    "Chemical Bonding",
    "Acids, Bases & Salts",
    "Carbon and its Compounds",
  ],
  Biology: [
    "Cell — Structure & Function",
    "Human Physiology",
    "Genetics & Evolution",
  ],
};

const RESOURCE_TYPES = ["Worksheet", "Notes", "Test Paper", "Solution"];

// At least 10 sample resources across classes, subjects and types.
export const resources = [
  {
    id: 1,
    title: "Real Numbers — Practice Worksheet",
    subject: "Maths",
    standard: "Class 10",
    chapter: "Real Numbers",
    type: "Worksheet",
    tags: ["practice", "important"],
    downloads: 142,
    url: "#",
    uploadedAt: "2026-06-09T10:15:00Z",
  },
  {
    id: 2,
    title: "Life Processes — Detailed Notes",
    subject: "Science",
    standard: "Class 10",
    chapter: "Life Processes",
    type: "Notes",
    tags: ["revision", "final-exam"],
    downloads: 98,
    url: "#",
    uploadedAt: "2026-06-08T14:30:00Z",
  },
  {
    id: 3,
    title: "Quadratic Equations — Mid-Term Test Paper",
    subject: "Maths",
    standard: "Class 10",
    chapter: "Quadratic Equations",
    type: "Test Paper",
    tags: ["mid-term", "tricky"],
    downloads: 76,
    url: "#",
    uploadedAt: "2026-06-07T09:00:00Z",
  },
  {
    id: 4,
    title: "Laws of Motion — Solved Problems",
    subject: "Physics",
    standard: "Class 11",
    chapter: "Laws of Motion",
    type: "Solution",
    tags: ["important", "practice"],
    downloads: 113,
    url: "#",
    uploadedAt: "2026-06-06T16:45:00Z",
  },
  {
    id: 5,
    title: "Chemical Bonding — Revision Notes",
    subject: "Chemistry",
    standard: "Class 11",
    chapter: "Chemical Bonding",
    type: "Notes",
    tags: ["revision"],
    downloads: 64,
    url: "#",
    uploadedAt: "2026-06-05T11:20:00Z",
  },
  {
    id: 6,
    title: "Cell Structure — Class 8 Worksheet",
    subject: "Biology",
    standard: "Class 8",
    chapter: "Cell — Structure & Function",
    type: "Worksheet",
    tags: ["practice"],
    downloads: 51,
    url: "#",
    uploadedAt: "2026-06-04T08:10:00Z",
  },
  {
    id: 7,
    title: "The French Revolution — Final Exam Paper",
    subject: "Social Science",
    standard: "Class 9",
    chapter: "The French Revolution",
    type: "Test Paper",
    tags: ["final-exam", "important"],
    downloads: 87,
    url: "#",
    uploadedAt: "2026-06-03T13:25:00Z",
  },
  {
    id: 8,
    title: "Grammar Essentials — Class 9 Notes",
    subject: "English",
    standard: "Class 9",
    chapter: "Grammar Essentials",
    type: "Notes",
    tags: ["revision", "practice"],
    downloads: 39,
    url: "#",
    uploadedAt: "2026-06-02T10:40:00Z",
  },
  {
    id: 9,
    title: "Trigonometry — Tricky Problems Solution",
    subject: "Maths",
    standard: "Class 11",
    chapter: "Trigonometry",
    type: "Solution",
    tags: ["tricky", "important"],
    downloads: 129,
    url: "#",
    uploadedAt: "2026-06-01T15:05:00Z",
  },
  {
    id: 10,
    title: "Electrostatics — Class 12 Test Paper",
    subject: "Physics",
    standard: "Class 12",
    chapter: "Electrostatics",
    type: "Test Paper",
    tags: ["mid-term", "tricky"],
    downloads: 102,
    url: "#",
    uploadedAt: "2026-05-30T09:50:00Z",
  },
  {
    id: 11,
    title: "Carbon and its Compounds — Worksheet",
    subject: "Chemistry",
    standard: "Class 10",
    chapter: "Carbon and its Compounds",
    type: "Worksheet",
    tags: ["practice", "final-exam"],
    downloads: 73,
    url: "#",
    uploadedAt: "2026-05-29T12:15:00Z",
  },
  {
    id: 12,
    title: "Genetics & Evolution — Revision Notes",
    subject: "Biology",
    standard: "Class 12",
    chapter: "Genetics & Evolution",
    type: "Notes",
    tags: ["revision", "important"],
    downloads: 58,
    url: "#",
    uploadedAt: "2026-05-28T14:00:00Z",
  },
];

// 5 most recent uploads.
export const recentUploads = [...resources]
  .sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt))
  .slice(0, 5);

// Breakdown of resources by subject.
const bySubject = subjects
  .map((subject) => ({
    subject,
    count: resources.filter((r) => r.subject === subject).length,
  }))
  .filter((row) => row.count > 0);

// Breakdown of resources by type.
const byType = RESOURCE_TYPES.map((type) => ({
  type,
  count: resources.filter((r) => r.type === type).length,
})).filter((row) => row.count > 0);

export const dashboardStats = {
  totalResources: 47,
  thisMonthUploads: 8,
  totalSubjects: 7,
  bySubject,
  byType,
  // Extra fields consumed by the dashboard UI.
  totalStudents: 312,
  totalDownloads: 1032,
  activeClasses: 5,
  downloadsByDay: [
    { day: "Mon", count: 34 },
    { day: "Tue", count: 41 },
    { day: "Wed", count: 28 },
    { day: "Thu", count: 52 },
    { day: "Fri", count: 47 },
    { day: "Sat", count: 63 },
    { day: "Sun", count: 22 },
  ],
  uploadsByMonth: [
    { month: "Jan", count: 5 },
    { month: "Feb", count: 7 },
    { month: "Mar", count: 4 },
    { month: "Apr", count: 9 },
    { month: "May", count: 6 },
    { month: "Jun", count: 8 },
  ],
  recentUploads,
};

export const mockUser = {
  id: 1,
  name: "Anjali Sharma",
  email: "anjali@eduvault.in",
  role: "admin",
};

export { RESOURCE_TYPES };

// ---------------------------------------------------------------------------
// Structured entities (with ids) for Standards / Subjects / Chapters
// These power the Settings management screens and the Upload cascading dropdowns.
// ---------------------------------------------------------------------------

export const mockStandards = standards.map((name, i) => ({
  id: i + 1,
  name,
  sortOrder: i + 1,
}));

const SUBJECTS_FOR = (standardName) =>
  standardName === "Class 11" || standardName === "Class 12"
    ? ["Maths", "Physics", "Chemistry", "Biology", "English"]
    : ["Maths", "Science", "English", "Social Science"];

let _subjectId = 0;
export const mockSubjects = [];
mockStandards.forEach((std) => {
  SUBJECTS_FOR(std.name).forEach((name) => {
    mockSubjects.push({ id: ++_subjectId, name, standardId: std.id });
  });
});

let _chapterId = 0;
export const mockChapters = [];
mockSubjects.forEach((subj) => {
  const list = chapters[subj.name] || [
    "Introduction",
    "Core Concepts",
    "Advanced Topics",
  ];
  list.forEach((name, i) => {
    mockChapters.push({
      id: ++_chapterId,
      number: i + 1,
      name,
      subjectId: subj.id,
    });
  });
});
