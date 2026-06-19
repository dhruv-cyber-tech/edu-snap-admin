// Realistic sample data for an Indian tuition center (EduVault).
// Used when USE_MOCK is true in src/api/client.js.

// ---------------------------------------------------------------------------
// Standards / Classes — grouped by board & medium.
// ---------------------------------------------------------------------------

const STD_NUMBERS = [1, 2, 3, 4, 5, 6, 7, 8];

const STANDARD_GROUP_DEFS = [
  { group: "GSEB Gujarati Medium", prefix: "GSEB Gujarati Std" },
  { group: "GSEB English Medium", prefix: "GSEB English Std" },
  { group: "CBSE", prefix: "CBSE Std" },
];

// Grouped structure for dropdowns with non-selectable group headers.
export const standardGroups = STANDARD_GROUP_DEFS.map(({ group, prefix }) => ({
  group,
  standards: STD_NUMBERS.map((n) => `${prefix} ${n}`),
}));

// Flat list of every standard name (used for filtering / search).
export const standards = standardGroups.flatMap((g) => g.standards);

export const subjects = [
  "Gujarati",
  "Hindi",
  "English",
  "Maths",
  "Paryavaran",
  "Vigyan",
  "Samajik Vigyan",
  "EVS",
  "Science",
  "Social Science",
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
  Gujarati: ["Grammar Basics", "Stories & Prose", "Poetry"],
  Hindi: ["Vyakaran (Grammar)", "Kahani (Stories)", "Kavita (Poetry)"],
  English: ["Grammar Essentials", "Reading Comprehension", "Writing Skills"],
  Maths: ["Numbers & Operations", "Geometry", "Measurement & Data"],
  Paryavaran: ["My Surroundings", "Plants & Animals", "Water & Air"],
  Vigyan: ["Matter & Materials", "Living World", "Force & Energy"],
  "Samajik Vigyan": ["History & Heritage", "Geography", "Civics & Society"],
  EVS: ["My Family & Surroundings", "Plants & Animals", "Water, Air & Weather"],
  Science: ["Matter & Materials", "Living World", "Force, Motion & Energy"],
  "Social Science": ["History & Heritage", "Geography", "Civics & Economics"],
};

const RESOURCE_TYPES = ["Worksheet", "Notes", "Test Paper", "Solution"];

// At least 10 sample resources across boards, classes, subjects and types.
export const resources = [
  {
    id: 1,
    title: "Numbers & Operations — Practice Worksheet",
    subject: "Maths",
    standard: "GSEB English Std 5",
    chapter: "Numbers & Operations",
    type: "Worksheet",
    tags: ["practice", "important"],
    downloads: 142,
    url: "#",
    uploadedAt: "2026-06-17T10:15:00Z",
  },
  {
    id: 2,
    title: "Plants & Animals — EVS Notes",
    subject: "EVS",
    standard: "CBSE Std 4",
    chapter: "Plants & Animals",
    type: "Notes",
    tags: ["revision", "final-exam"],
    downloads: 98,
    url: "#",
    uploadedAt: "2026-06-16T14:30:00Z",
  },
  {
    id: 3,
    title: "Living World — Mid-Term Test Paper",
    subject: "Science",
    standard: "GSEB English Std 7",
    chapter: "Living World",
    type: "Test Paper",
    tags: ["mid-term", "tricky"],
    downloads: 76,
    url: "#",
    uploadedAt: "2026-06-15T09:00:00Z",
  },
  {
    id: 4,
    title: "Poetry — Gujarati Notes",
    subject: "Gujarati",
    standard: "GSEB Gujarati Std 3",
    chapter: "Poetry",
    type: "Notes",
    tags: ["revision"],
    downloads: 64,
    url: "#",
    uploadedAt: "2026-06-14T11:20:00Z",
  },
  {
    id: 5,
    title: "Vyakaran — Hindi Worksheet",
    subject: "Hindi",
    standard: "CBSE Std 6",
    chapter: "Vyakaran (Grammar)",
    type: "Worksheet",
    tags: ["practice"],
    downloads: 51,
    url: "#",
    uploadedAt: "2026-06-13T08:10:00Z",
  },
  {
    id: 6,
    title: "Geography — Samajik Vigyan Notes",
    subject: "Samajik Vigyan",
    standard: "GSEB Gujarati Std 8",
    chapter: "Geography",
    type: "Notes",
    tags: ["revision", "important"],
    downloads: 87,
    url: "#",
    uploadedAt: "2026-06-12T13:25:00Z",
  },
  {
    id: 7,
    title: "Reading Comprehension — English Test Paper",
    subject: "English",
    standard: "GSEB English Std 8",
    chapter: "Reading Comprehension",
    type: "Test Paper",
    tags: ["final-exam", "important"],
    downloads: 39,
    url: "#",
    uploadedAt: "2026-06-11T10:40:00Z",
  },
  {
    id: 8,
    title: "Geometry — Maths Solved Problems",
    subject: "Maths",
    standard: "CBSE Std 8",
    chapter: "Geometry",
    type: "Solution",
    tags: ["tricky", "important"],
    downloads: 129,
    url: "#",
    uploadedAt: "2026-06-10T15:05:00Z",
  },
  {
    id: 9,
    title: "Matter & Materials — Vigyan Worksheet",
    subject: "Vigyan",
    standard: "GSEB Gujarati Std 6",
    chapter: "Matter & Materials",
    type: "Worksheet",
    tags: ["practice", "final-exam"],
    downloads: 73,
    url: "#",
    uploadedAt: "2026-06-09T12:15:00Z",
  },
  {
    id: 10,
    title: "My Surroundings — Paryavaran Notes",
    subject: "Paryavaran",
    standard: "GSEB Gujarati Std 2",
    chapter: "My Surroundings",
    type: "Notes",
    tags: ["practice"],
    downloads: 58,
    url: "#",
    uploadedAt: "2026-06-08T14:00:00Z",
  },
  {
    id: 11,
    title: "History & Heritage — Social Science Worksheet",
    subject: "Social Science",
    standard: "CBSE Std 7",
    chapter: "History & Heritage",
    type: "Worksheet",
    tags: ["practice", "revision"],
    downloads: 102,
    url: "#",
    uploadedAt: "2026-06-07T09:50:00Z",
  },
  {
    id: 12,
    title: "Grammar Essentials — English Notes",
    subject: "English",
    standard: "GSEB Gujarati Std 4",
    chapter: "Grammar Essentials",
    type: "Notes",
    tags: ["revision", "important"],
    downloads: 45,
    url: "#",
    uploadedAt: "2026-06-06T12:15:00Z",
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
  totalSubjects: subjects.length,
  bySubject,
  byType,
  // Extra fields consumed by the dashboard UI.
  totalStudents: 312,
  totalDownloads: 1032,
  activeClasses: standards.length,
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

// Maps a standard name + group to its list of subjects.
function subjectsFor(group, stdNumber) {
  if (group === "GSEB Gujarati Medium") {
    const base = ["Gujarati", "Hindi", "English", "Maths"];
    return stdNumber <= 5
      ? [...base, "Paryavaran"]
      : [...base, "Vigyan", "Samajik Vigyan"];
  }
  if (group === "GSEB English Medium") {
    const base = ["Gujarati", "English", "Maths"];
    return stdNumber <= 5
      ? [...base, "EVS"]
      : [...base, "Science", "Social Science"];
  }
  // CBSE
  const base = ["Hindi", "English", "Maths"];
  return stdNumber <= 5
    ? [...base, "EVS"]
    : [...base, "Science", "Social Science"];
}

let _standardId = 0;
export const mockStandards = [];
STANDARD_GROUP_DEFS.forEach(({ group, prefix }) => {
  STD_NUMBERS.forEach((n) => {
    mockStandards.push({
      id: ++_standardId,
      name: `${prefix} ${n}`,
      group,
      number: n,
      sortOrder: _standardId,
    });
  });
});

let _subjectId = 0;
export const mockSubjects = [];
mockStandards.forEach((std) => {
  subjectsFor(std.group, std.number).forEach((name) => {
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
