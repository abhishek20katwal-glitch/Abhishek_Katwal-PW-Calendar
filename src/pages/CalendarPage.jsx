import api from "@/api/axios";
import { useEffect, useMemo, useRef, useState } from "react";
import {
    Activity,
    ArrowLeft,
    ArrowRight,
    BarChart3,
    BookOpen,
    CalendarDays,
    ChevronDown,
    ChevronRight,
    CircleDot,
    Filter,
    Layers3,
    List,
    Maximize2,
    RefreshCw,
    Search,
    Sparkles,
    Target,
    X,
    Zap,
    Cpu,
} from "lucide-react";

/* =========================================================
   PW TEST PLANNER (Dashboard Synced Engine)
========================================================= */

/* =========================================================
   CONSTANTS
========================================================= */

const SUBJECTS = [
    "Physics",
    "Chemistry",
    "Math",
    "Chem-KPM",
    "Botany",
    "Zoology",
];

const JEE_SUBJECTS = ["Physics", "Chemistry", "Math", "Chem-KPM"];
const NEET_SUBJECTS = ["Physics", "Chemistry", "Botany", "Zoology"];

const BATCHES = [
    "11th JEE",
    "12th JEE",
    "Dropper JEE",
    "11th NEET",
    "12th NEET",
    "Dropper NEET",
];

const PHASES = [
    "All",
    "Phase 1",
    "Phase 2",
    "Phase 3",
    "Phase 4",
    "Phase 5",
    "Phase 6",
];

const TYPE_META = {
    ALL: { label: "All", short: "ALL", color: "#7c8cff", glow: "rgba(124,140,255,.28)" },
    COE: { label: "COE", short: "COE", color: "#38bdf8", glow: "rgba(56,189,248,.28)" },
    AIR: { label: "AIR", short: "AIR", color: "#fb7185", glow: "rgba(251,113,133,.28)" },
    MILESTONE: { label: "Milestone", short: "MILE", color: "#60a5fa", glow: "rgba(96,165,250,.28)" },
    AITS: { label: "AITS", short: "AITS", color: "#f59e0b", glow: "rgba(245,158,11,.28)" },
    UNIVERSE: { label: "PW Universe", short: "UNIV", color: "#c084fc", glow: "rgba(192,132,252,.28)" },
    NEET_MILESTONE: { label: "NEET Milestone", short: "NEET", color: "#34d399", glow: "rgba(52,211,153,.28)" },
    NEET_AITS: { label: "NEET AITS", short: "AITS", color: "#22d3ee", glow: "rgba(34,211,238,.28)" },
};

const MONTHS = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
];

const WEEKDAYS = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

/* =========================================================
   HELPERS (Dashboard Synced)
========================================================= */

function clean(value) {
    if (value === null || value === undefined) return "";
    return String(value).trim();
}

function lower(value) {
    return clean(value).toLowerCase();
}

function firstValue(obj, keys) {
    if (!obj || typeof obj !== "object") return "";

    for (const key of keys) {
        if (
            Object.prototype.hasOwnProperty.call(obj, key) &&
            clean(obj[key]) !== ""
        ) {
            return clean(obj[key]);
        }
    }

    const normalized = {};
    Object.entries(obj).forEach(([key, value]) => {
        normalized[key.toLowerCase().replace(/[^a-z0-9]/g, "")] = value;
    });

    for (const key of keys) {
        const normalizedKey = key.toLowerCase().replace(/[^a-z0-9]/g, "");
        if (
            Object.prototype.hasOwnProperty.call(normalized, normalizedKey) &&
            clean(normalized[normalizedKey]) !== ""
        ) {
            return clean(normalized[normalizedKey]);
        }
    }

    return "";
}

function getRawSearchText(value, depth = 0) {
    if (value === null || value === undefined) return "";
    if (depth > 5) return "";

    if (
        typeof value === "string" ||
        typeof value === "number" ||
        typeof value === "boolean"
    ) {
        return String(value);
    }

    if (Array.isArray(value)) {
        return value.map((item) => getRawSearchText(item, depth + 1)).join(" ");
    }

    if (typeof value === "object") {
        return Object.entries(value)
            .map(([key, val]) => `${key} ${getRawSearchText(val, depth + 1)}`)
            .join(" ");
    }

    return "";
}

function flattenPayload(payload) {
    if (Array.isArray(payload)) return payload;
    if (!payload || typeof payload !== "object") return [];

    const candidates = [
        payload.data,
        payload.records,
        payload.results,
        payload.rows,
        payload.schedule,
        payload.tests,
        payload.planner,
        payload.items,
    ];

    for (const candidate of candidates) {
        if (Array.isArray(candidate)) return candidate;
    }

    const values = Object.values(payload);
    if (values.length && values.some((value) => Array.isArray(value))) {
        return values.flatMap((value) => (Array.isArray(value) ? value : []));
    }

    return [payload];
}

function normalizeDate(value) {
    const raw = clean(value);
    if (!raw) return null;

    const isoMatch = raw.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})/);
    if (isoMatch) {
        const [, y, m, d] = isoMatch;
        const date = new Date(Number(y), Number(m) - 1, Number(d));
        if (!Number.isNaN(date.getTime())) return formatDateKey(date);
    }

    const indianMatch = raw.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})/);
    if (indianMatch) {
        const [, d, m, y] = indianMatch;
        const date = new Date(Number(y), Number(m) - 1, Number(d));
        if (!Number.isNaN(date.getTime())) return formatDateKey(date);
    }

    const parsed = new Date(raw);
    if (!Number.isNaN(parsed.getTime())) return formatDateKey(parsed);

    return null;
}

function formatDateKey(date) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
}

function parseDateKey(key) {
    if (!key) return null;
    const [y, m, d] = key.split("-").map(Number);
    if (!y || !m || !d) return null;
    return new Date(y, m - 1, d);
}

function formatLongDate(key) {
    const date = parseDateKey(key);
    if (!date) return "";
    return date.toLocaleDateString("en-IN", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
    });
}

function dateOnlyKey(date) {
    return formatDateKey(date);
}

function normalizeTextForMatch(value) {
    return lower(value)
        .replace(/12\s*th/g, "12th")
        .replace(/11\s*th/g, "11th")
        .replace(/10\s*th/g, "10th")
        .replace(/\s+/g, " ")
        .trim();
}

function extractTestName(row) {
    if (!row || typeof row !== "object") return "Untitled Test";

    const explicitName = firstValue(row, [
        "testName", "test_name", "Test Name", "testname",
        "testTitle", "test_title", "Test Title", "name", "Name",
        "paperName", "Paper Name", "title", "Title",
    ]);

    if (explicitName) return explicitName;

    const type = clean(firstValue(row, ["type", "Type", "testType", "test_type", "Test Type"]));
    const number = clean(firstValue(row, ["no", "No", "number", "Number", "testNo", "test_no", "Test No"]));

    if (type && number) return `${type} ${number}`;
    if (type) return type;

    return "Untitled Test";
}

function detectBatch(row) {
    if (!row || typeof row !== "object") return "All";

    const rawBatch = firstValue(row, [
        "batch", "Batch", "batchName", "batch_name", "Batch Name",
        "batchname", "targetBatch", "Target Batch", "class", "Class", "className", "Class Name",
    ]);
    const rawDiv = firstValue(row, ["div", "Div", "division", "Division", "stream", "Stream", "target", "Target"]);
    const rawName = firstValue(row, ["testName", "Test Name", "name", "Name", "title", "Title"]);
    const rawCode = firstValue(row, ["batchCode", "Batch Code", "course", "Course"]);

    const combined = normalizeTextForMatch(
        [rawBatch, rawDiv, rawName, rawCode].filter(Boolean).join(" ")
    );

    if (combined.includes("dropper") && combined.includes("neet")) return "Dropper NEET";
    if (combined.includes("dropper") && combined.includes("jee")) return "Dropper JEE";
    if (combined.includes("12th") && combined.includes("neet")) return "12th NEET";
    if (combined.includes("12th") && combined.includes("jee")) return "12th JEE";
    if (combined.includes("11th") && combined.includes("neet")) return "11th NEET";
    if (combined.includes("11th") && combined.includes("jee")) return "11th JEE";

    return clean(rawBatch) || "All";
}

function detectExam(row) {
    const value = [
        firstValue(row, ["exam", "Exam", "examType", "Exam Type", "stream", "Stream", "target", "Target"]),
        firstValue(row, ["testName", "Test Name", "name", "Name"]),
        firstValue(row, ["batch", "Batch", "batchName", "Batch Name"]),
        detectBatch(row),
    ].filter(Boolean).join(" ");

    const text = lower(value);
    if (text.includes("neet")) return "NEET";
    if (text.includes("jee")) return "JEE";
    return "JEE";
}

function detectType(row) {
    const explicit = firstValue(row, [
        "testType", "test_type", "Test Type", "type", "Type",
        "category", "Category", "testCategory", "Test Category",
    ]);

    const detectedBatch = detectBatch(row);
    const combined = [
        explicit,
        firstValue(row, ["testName", "test_name", "Test Name", "name", "Name"]),
        firstValue(row, ["test", "Test", "paper", "Paper"]),
        detectedBatch,
    ].filter(Boolean).join(" ");

    const value = lower(combined);

    if (value.includes("universe")) return "UNIVERSE";
    if (value.includes("aits")) {
        if (value.includes("neet")) return "NEET_AITS";
        return "AITS";
    }
    if (value.includes("air") || value.includes("vp air")) return "AIR";
    if (value.includes("milestone") || value.includes("milestone test")) {
        if (value.includes("neet")) return "NEET_MILESTONE";
        return "MILESTONE";
    }
    if (value.includes("coe") || value.includes("utam") || value.includes("wtm")) return "COE";

    return explicit || "COE";
}

function detectPhase(row) {
    const value = firstValue(row, ["phase", "Phase", "testPhase", "Test Phase"]);
    if (!value) return "ALL";
    const text = lower(value);

    for (let i = 1; i <= 6; i++) {
        if (text === String(i) || text.includes(`phase ${i}`) || text.includes(`phase-${i}`)) {
            return `Phase ${i}`;
        }
    }
    return value;
}

function normalizeSubjectName(value) {
    const text = lower(value).replace(/[^a-z0-9]+/g, " ").trim();

    if (text.includes("chem kpm") || text.includes("chemkpm")) return "Chem-KPM";
    if (text === "phy" || text === "physics" || text.includes("physics")) return "Physics";
    if (text === "chem" || text === "chemistry" || text.includes("chemistry")) return "Chemistry";
    if (text === "math" || text === "maths" || text === "mathematics" || text.includes("mathematics")) return "Math";
    if (text === "botany" || text === "bot" || text.includes("botany")) return "Botany";
    if (text === "zoology" || text === "zoo" || text.includes("zoology")) return "Zoology";

    return "";
}

function getVisibleSubjects(test) {
    if (!test) return JEE_SUBJECTS;
    const examText = lower([test.exam, test.batch, test.type, test.name].filter(Boolean).join(" "));
    if (examText.includes("neet")) return NEET_SUBJECTS;
    return JEE_SUBJECTS;
}

function splitSyllabusValue(value) {
    if (!value) return [];
    const text = clean(value);
    if (!text) return [];
    return text.split(/\s*(?:\n|•|\|)\s*/).map((item) => item.trim()).filter(Boolean);
}

function getSubjectColumnValue(row, subject) {
    if (!row || typeof row !== "object") return "";

    const keyMap = {
        Physics: ["Physics", "physics", "phy", "PHY", "Physics Syllabus", "Physics Chapters"],
        Chemistry: ["Chemistry", "chemistry", "chem", "CHEM", "Chemistry Syllabus", "Chemistry Chapters"],
        Math: ["Math", "math", "maths", "Maths", "MATH", "Mathematics", "Math Syllabus"],
        "Chem-KPM": ["Chem-KPM", "Chem KPM", "ChemKPM", "chem-kpm"],
        Botany: ["Botany", "botany", "BOTANY", "Botany Syllabus", "Bot"],
        Zoology: ["Zoology", "zoology", "ZOOLOGY", "Zoology Syllabus", "Zoo"],
    };

    const direct = firstValue(row, keyMap[subject] || []);
    if (direct) return direct;

    for (const [key, value] of Object.entries(row)) {
        const normalizedKey = lower(key).replace(/[_-]+/g, " ").trim();
        const normalizedSubject = normalizeSubjectName(normalizedKey);
        if (normalizedSubject === subject && clean(value)) {
            return clean(value);
        }
    }

    return "";
}

function extractAllSubjectSyllabi(row) {
    const result = {
        Physics: [],
        Chemistry: [],
        Math: [],
        "Chem-KPM": [],
        Botany: [],
        Zoology: [],
    };

    SUBJECTS.forEach((subject) => {
        const val = getSubjectColumnValue(row, subject);
        if (val) {
            result[subject] = splitSyllabusValue(val);
        }
    });

    const explicitSubject = normalizeSubjectName(
        firstValue(row, ["subject", "Subject", "SUBJECT", "stream", "Stream"])
    );

    if (explicitSubject) {
        const generic = firstValue(row, ["syllabus", "Syllabus", "chapter", "Chapter", "chapters", "Chapters", "topics", "Topics"]);
        if (generic) {
            result[explicitSubject] = [...(result[explicitSubject] || []), ...splitSyllabusValue(generic)];
        }
    }

    return result;
}

function normalizeRow(row, index) {
    if (!row || typeof row !== "object") return null;

    const date = firstValue(row, [
        "date", "testDate", "test_date", "examDate", "exam_date",
        "scheduleDate", "schedule_date", "startDate", "start_date", "Date", "Test Date",
    ]);

    const normalizedDate = normalizeDate(date);
    if (!normalizedDate) return null;

    const name = extractTestName(row);
    const type = detectType(row);
    const batch = detectBatch(row);
    const phase = detectPhase(row);
    const exam = detectExam(row);
    const subjects = extractAllSubjectSyllabi(row);
    const rawSearchText = getRawSearchText(row);

    const searchableText = [
        name, type, exam, batch, phase, normalizedDate, rawSearchText,
    ].join(" ").toLowerCase();

    return {
        id: `${normalizedDate}-${index}`,
        date: normalizedDate,
        name,
        type,
        batch,
        phase,
        exam,
        subjects,
        raw: row,
        searchableText,
    };
}

function makeTestKey(entry) {
    return [
        entry.date,
        normalizeTextForMatch(entry.name),
        normalizeTextForMatch(entry.batch),
        normalizeTextForMatch(entry.type),
        normalizeTextForMatch(entry.phase),
    ].join("::");
}

function mergeTests(entries) {
    const map = new Map();

    entries.forEach((entry) => {
        const key = makeTestKey(entry);

        if (!map.has(key)) {
            map.set(key, {
                id: key,
                date: entry.date,
                name: entry.name,
                type: entry.type,
                batch: entry.batch,
                phase: entry.phase,
                exam: entry.exam,
                subjects: {
                    Physics: [],
                    Chemistry: [],
                    Math: [],
                    "Chem-KPM": [],
                    Botany: [],
                    Zoology: [],
                },
                searchableText: entry.searchableText,
                rawRows: [],
            });
        }

        const test = map.get(key);
        test.rawRows.push(entry.raw);

        SUBJECTS.forEach((subject) => {
            const values = entry.subjects?.[subject] || [];
            if (values.length) {
                test.subjects[subject].push(...values);
            }
        });
    });

    return Array.from(map.values()).map((test) => {
        SUBJECTS.forEach((subject) => {
            test.subjects[subject] = [
                ...new Set(
                    (test.subjects[subject] || [])
                        .map((item) => clean(item))
                        .filter(Boolean)
                ),
            ];
        });
        return test;
    });
}

function buildCalendarDays(monthDate) {
    const year = monthDate.getFullYear();
    const month = monthDate.getMonth();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startOffset = firstDay.getDay();
    const daysInMonth = lastDay.getDate();
    const previousMonthDays = new Date(year, month, 0).getDate();
    const totalCells = Math.ceil((startOffset + daysInMonth) / 7) * 7;

    const cells = [];
    for (let i = 0; i < totalCells; i++) {
        const dayNumber = i - startOffset + 1;
        let date;
        let currentMonth = true;

        if (dayNumber <= 0) {
            date = new Date(year, month - 1, previousMonthDays + dayNumber);
            currentMonth = false;
        } else if (dayNumber > daysInMonth) {
            date = new Date(year, month + 1, dayNumber - daysInMonth);
            currentMonth = false;
        } else {
            date = new Date(year, month, dayNumber);
        }

        cells.push({
            date,
            key: formatDateKey(date),
            day: date.getDate(),
            currentMonth,
        });
    }

    return cells;
}

function getSubjectShortLabel(subject) {
    if (subject === "Physics") return "PHY";
    if (subject === "Chemistry") return "CHEM";
    if (subject === "Math") return "MATH";
    if (subject === "Chem-KPM") return "KPM";
    if (subject === "Botany") return "BOT";
    if (subject === "Zoology") return "ZOO";
    return subject;
}

function getSubjectInitial(subject) {
    if (subject === "Physics") return "P";
    if (subject === "Chemistry") return "C";
    if (subject === "Math") return "M";
    if (subject === "Chem-KPM") return "K";
    if (subject === "Botany") return "B";
    if (subject === "Zoology") return "Z";
    return "•";
}

function getSubjectClass(subject) {
    if (subject === "Physics") return "physics";
    if (subject === "Chemistry") return "chemistry";
    if (subject === "Chem-KPM") return "chem-kpm";
    if (subject === "Botany") return "botany";
    if (subject === "Zoology") return "zoology";
    return "math";
}

function getTypeMeta(type) {
    return TYPE_META[type] || TYPE_META.COE;
}

/* =========================================================
   MAIN COMPONENT
========================================================= */

export default function CalendarPage() {
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState("");
    const [rawRows, setRawRows] = useState([]);

    // Admin Check based on local storage email
    const userEmail = localStorage.getItem("user_email");
    const adminEmails = ["abishek.katwal@pw.live", "abhishek20.katwal@gmail.com"];
    const isAdmin = adminEmails.includes(userEmail);

    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(null);
    const [selectedTest, setSelectedTest] = useState(null);
    const [view, setView] = useState("calendar");

    const [typeFilter, setTypeFilter] = useState("ALL");
    const [batchFilter, setBatchFilter] = useState("All");
    const [phaseFilter, setPhaseFilter] = useState("All");
    const [subjectFilter, setSubjectFilter] = useState("All");
    const [search, setSearch] = useState("");

    const searchRef = useRef(null);

    // --- CODEPEN MAGIC: Holographic Tilt, Mouse Spotlight & Magnetic Buttons ---
    useEffect(() => {
        const handleMouseMove = (e) => {
            const cards = document.querySelectorAll(".glass-card, .calendar-card, .date-panel, .list-view, .summary-view, .stat-card, .sync-card, .filter-panel");
            cards.forEach((card) => {
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                card.style.setProperty("--mouse-x", `${x}px`);
                card.style.setProperty("--mouse-y", `${y}px`);

                const centerX = rect.width / 2;
                const centerY = rect.height / 2;
                const rotateX = ((y - centerY) / centerY) * -3;
                const rotateY = ((x - centerX) / centerX) * 3;

                if (
                    e.clientX >= rect.left &&
                    e.clientX <= rect.right &&
                    e.clientY >= rect.top &&
                    e.clientY <= rect.bottom
                ) {
                    card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-2px)`;
                } else {
                    card.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px)`;
                }
            });

            const buttons = document.querySelectorAll(".magnetic-btn, .today-button, .nav-button, .view-button, .spin-button, .clear-filter");
            buttons.forEach((btn) => {
                const rect = btn.getBoundingClientRect();
                const btnX = rect.left + rect.width / 2;
                const btnY = rect.top + rect.height / 2;
                const distX = e.clientX - btnX;
                const distY = e.clientY - btnY;
                const distance = Math.sqrt(distX * distX + distY * distY);

                if (distance < 70) {
                    btn.style.transform = `translate(${distX * 0.3}px, ${distY * 0.3}px)`;
                } else {
                    btn.style.transform = `translate(0px, 0px)`;
                }
            });
        };

        window.addEventListener("mousemove", handleMouseMove);
        return () => window.removeEventListener("mousemove", handleMouseMove);
    }, []);

    async function loadPlanner(isRefresh = false) {
        try {
            if (isRefresh) setRefreshing(true);
            else setLoading(true);
            setError("");

            const response = await api.get("/schedule");
            const payload = response.data;
            const rows = flattenPayload(payload);
            setRawRows(rows);
        } catch (err) {
            console.error("Planner loading error:", err);
            setError(`Planner data could not be loaded: ${err?.message || "Unknown error"}`);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }

    useEffect(() => {
        loadPlanner();
    }, []);

    const normalizedEntries = useMemo(() => {
        return rawRows.map((row, index) => normalizeRow(row, index)).filter(Boolean);
    }, [rawRows]);

    const allTests = useMemo(() => {
        return mergeTests(normalizedEntries);
    }, [normalizedEntries]);

    const filteredTests = useMemo(() => {
        const query = normalizeTextForMatch(search);
        const words = query ? query.split(/\s+/).filter(Boolean) : [];

        return allTests.filter((test) => {
            if (typeFilter !== "ALL" && test.type !== typeFilter) return false;
            if (batchFilter !== "All" && test.batch !== batchFilter) return false;
            if (phaseFilter !== "All" && !lower(test.phase).includes(lower(phaseFilter))) return false;
            if (subjectFilter !== "All" && !test.subjects[subjectFilter]?.length) return false;

            if (words.length > 0) {
                const haystack = normalizeTextForMatch(test.searchableText);
                const matches = words.every((word) => haystack.includes(word));
                if (!matches) return false;
            }

            return true;
        });
    }, [allTests, typeFilter, batchFilter, phaseFilter, subjectFilter, search]);

    const testsByDate = useMemo(() => {
        const map = new Map();
        filteredTests.forEach((test) => {
            if (!map.has(test.date)) map.set(test.date, []);
            map.get(test.date).push(test);
        });
        return map;
    }, [filteredTests]);

    const monthTests = useMemo(() => {
        const year = currentMonth.getFullYear();
        const month = currentMonth.getMonth();
        return filteredTests.filter((test) => {
            const date = parseDateKey(test.date);
            return date && date.getFullYear() === year && date.getMonth() === month;
        });
    }, [filteredTests, currentMonth]);

    const activeDates = useMemo(() => {
        return new Set(filteredTests.map((test) => test.date)).size;
    }, [filteredTests]);

    const facetBaseTests = useMemo(() => {
        const query = normalizeTextForMatch(search);
        const words = query ? query.split(/\s+/).filter(Boolean) : [];

        return allTests.filter((test) => {
            if (batchFilter !== "All" && test.batch !== batchFilter) return false;
            if (phaseFilter !== "All" && !lower(test.phase).includes(lower(phaseFilter))) return false;

            if (words.length > 0) {
                const haystack = normalizeTextForMatch(test.searchableText);
                const matches = words.every((word) => haystack.includes(word));
                if (!matches) return false;
            }

            return true;
        });
    }, [allTests, batchFilter, phaseFilter, search]);

    const subjectFacetTests = useMemo(() => {
        return facetBaseTests.filter((test) => typeFilter === "ALL" || test.type === typeFilter);
    }, [facetBaseTests, typeFilter]);

    const subjectCounts = useMemo(() => {
        return SUBJECTS.reduce((acc, subject) => {
            acc[subject] = subjectFacetTests.filter((test) => test.subjects[subject]?.length).length;
            return acc;
        }, {});
    }, [subjectFacetTests]);

    const typeCounts = useMemo(() => {
        return Object.keys(TYPE_META).reduce((acc, type) => {
            acc[type] = type === "ALL" ? facetBaseTests.length : facetBaseTests.filter((test) => test.type === type).length;
            return acc;
        }, {});
    }, [facetBaseTests]);

    const selectedDateTests = selectedDate ? testsByDate.get(selectedDate) || [] : [];

    useEffect(() => {
        if (!selectedDate) {
            if (selectedTest) setSelectedTest(null);
            return;
        }
        const visibleTestsForDate = testsByDate.get(selectedDate) || [];
        if (visibleTestsForDate.length === 0) {
            setSelectedDate(null);
            setSelectedTest(null);
            return;
        }
        if (selectedTest) {
            const stillVisible = visibleTestsForDate.some((test) => test.id === selectedTest.id);
            if (!stillVisible) setSelectedTest(null);
        }
    }, [selectedDate, selectedTest, testsByDate]);

    function previousMonth() {
        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
    }

    function nextMonth() {
        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
    }

    function goToday() {
        const today = new Date();
        setCurrentMonth(new Date(today.getFullYear(), today.getMonth(), 1));
        const todayKey = dateOnlyKey(today);
        if (testsByDate.has(todayKey)) {
            setSelectedDate(todayKey);
        } else {
            setSelectedDate(null);
            setSelectedTest(null);
        }
    }

    const calendarDays = useMemo(() => buildCalendarDays(currentMonth), [currentMonth]);

    if (loading) {
        return (
            <div className="vp-page">
                <style>{styles}</style>
                <div className="vp-loading">
                    <div className="loading-orbit">
                        <div /><div /><div />
                    </div>
                    <div className="loading-title">Loading Test Planner</div>
                    <div className="loading-subtitle">Syncing Google Sheets data…</div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="vp-page">
                <style>{styles}</style>
                <div className="error-shell">
                    <div className="error-card glass-card">
                        <div className="error-icon"><Activity size={28} /></div>
                        <h2>Planner connection failed</h2>
                        <p>{error}</p>
                        <button className="vp-primary-button magnetic-btn" onClick={() => loadPlanner()}>
                            <RefreshCw size={16} /> Retry
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="vp-page">
            <style>{styles}</style>

            <div className="ambient ambient-one" />
            <div className="ambient ambient-two" />
            <div className="ambient ambient-three" />
            <div className="noise" />

            <main className="planner-shell">
                {/* --- CYBER SCANNER ORB HEADER --- */}
                <div className="relative w-full overflow-hidden h-9 pointer-events-none mb-[-8px] flex items-center">
                    <div className="absolute left-0 flex items-center gap-2.5 px-3.5 py-1 rounded-full bg-indigo-500/10 border border-indigo-400/30 text-indigo-300 shadow-[0_0_20px_rgba(99,102,241,0.3)] animate-tech-walk z-20 backdrop-blur-md">
                        <Cpu size={14} className="animate-spin text-indigo-400" />
                        <span className="text-[9px] font-extrabold uppercase tracking-widest text-indigo-200">
                            ⚡ SCHEDULER ENGINE // ACTIVE PROTOCOL
                        </span>
                    </div>
                </div>

                {/* TOP HEADER */}
                <section className="hero glass-card">
                    <div className="hero-left">
                        <div className="eyebrow">
                            <span className="live-pulse" /> ACADEMIC OPERATIONS {isAdmin && "(Admin Mode)"}
                        </div>
                        <h1>
                            VP Test Planner <span>AY 2026–27</span>
                        </h1>
                        <p>Complete academic test schedule, milestones and subject-wise planning in one place.</p>
                    </div>

                    <div className="hero-right">
                        <div className="sync-card glass-card">
                            <div className="sync-top">
                                <span className="sync-status"><span /> LIVE</span>
                                <span className="sync-source">Google Sheets</span>
                            </div>
                            <div className="sync-number">{filteredTests.length.toLocaleString("en-IN")}</div>
                            <div className="sync-label">planner tests</div>
                            <div className="sync-footer">
                                <span><Activity size={13} /> Synced just now</span>
                                <button
                                    onClick={() => loadPlanner(true)}
                                    className={refreshing ? "spin-button spinning magnetic-btn" : "spin-button magnetic-btn"}
                                    title="Refresh"
                                >
                                    <RefreshCw size={15} />
                                </button>
                            </div>
                        </div>
                    </div>
                </section>

                {/* KPI STRIP */}
                <section className="stats-grid" aria-label="Subject coverage">
                    <StatCard icon={<CalendarDays size={16} />} label="Test Dates" value={activeDates} accent="#818cf8" />
                    <StatCard icon={<BookOpen size={16} />} label="Physics" value={subjectCounts.Physics || 0} accent="#60a5fa" />
                    <StatCard icon={<Target size={16} />} label="Chemistry" value={subjectCounts.Chemistry || 0} accent="#f59e0b" />
                    <StatCard icon={<Zap size={16} />} label="Math" value={subjectCounts.Math || 0} accent="#c084fc" />
                    <StatCard icon={<Layers3 size={16} />} label="Chem-KPM" value={subjectCounts["Chem-KPM"] || 0} accent="#22d3ee" />
                    <StatCard icon={<Sparkles size={16} />} label="Botany" value={subjectCounts.Botany || 0} accent="#4ade80" />
                    <StatCard icon={<CircleDot size={16} />} label="Zoology" value={subjectCounts.Zoology || 0} accent="#f472b6" />
                </section>

                {/* TOOLBAR */}
                <section className="toolbar">
                    <div className="view-switcher">
                        <ViewButton active={view === "calendar"} icon={<CalendarDays size={16} />} label="Calendar" onClick={() => setView("calendar")} />
                        <ViewButton active={view === "list"} icon={<List size={16} />} label="List" onClick={() => setView("list")} />
                        <ViewButton active={view === "summary"} icon={<BarChart3 size={16} />} label="Summary" onClick={() => setView("summary")} />
                    </div>

                    <div className="search-box glass-card">
                        <Search size={16} />
                        <input
                            ref={searchRef}
                            value={search}
                            onChange={(event) => setSearch(event.target.value)}
                            placeholder="Search tests, chapters, batches, JEE, NEET..."
                        />
                        {search && (
                            <button onClick={() => setSearch("")} className="magnetic-btn"><X size={14} /></button>
                        )}
                    </div>
                </section>

                {/* FILTER PANEL */}
                <section className="filter-panel glass-card">
                    <div className="filter-header">
                        <div>
                            <div className="section-kicker"><Filter size={13} /> FILTERS</div>
                            <div className="section-title">Refine your planner</div>
                        </div>
                        <button
                            className="clear-filter magnetic-btn"
                            onClick={() => {
                                setTypeFilter("ALL");
                                setBatchFilter("All");
                                setPhaseFilter("All");
                                setSubjectFilter("All");
                                setSearch("");
                            }}
                        >
                            Reset all
                        </button>
                    </div>

                    <div className="filter-row">
                        <FilterGroup label="Test Type" value={typeFilter}>
                            <div className="filter-pills">
                                {Object.entries(TYPE_META).map(([key, meta]) => (
                                    <FilterPill
                                        key={key}
                                        active={typeFilter === key}
                                        color={meta.color}
                                        onClick={() => setTypeFilter(key)}
                                        label={meta.label}
                                        count={key === "ALL" ? filteredTests.length : typeCounts[key] || 0}
                                    />
                                ))}
                            </div>
                        </FilterGroup>

                        <FilterGroup label="Batch">
                            <div className="select-wrap">
                                <select value={batchFilter} onChange={(event) => setBatchFilter(event.target.value)}>
                                    <option value="All">All Batches</option>
                                    {BATCHES.map((batch) => (
                                        <option key={batch} value={batch}>{batch}</option>
                                    ))}
                                </select>
                                <ChevronDown size={14} />
                            </div>
                        </FilterGroup>

                        <FilterGroup label="Phase">
                            <div className="filter-pills phase-pills">
                                {PHASES.map((phase) => (
                                    <button
                                        key={phase}
                                        className={phaseFilter === phase ? "phase-pill active magnetic-btn" : "phase-pill magnetic-btn"}
                                        onClick={() => setPhaseFilter(phase)}
                                    >
                                        {phase}
                                    </button>
                                ))}
                            </div>
                        </FilterGroup>

                        <FilterGroup label="Subject">
                            <div className="filter-pills phase-pills">
                                {["All", ...SUBJECTS].map((subject) => (
                                    <button
                                        key={subject}
                                        className={subjectFilter === subject ? "phase-pill active magnetic-btn" : "phase-pill magnetic-btn"}
                                        onClick={() => setSubjectFilter(subject)}
                                    >
                                        {subject}
                                    </button>
                                ))}
                            </div>
                        </FilterGroup>
                    </div>
                </section>

                {/* MAIN CONTENT */}
                {view === "calendar" && (
                    <section className="calendar-layout">
                        <div className="calendar-card glass-card">
                            <div className="calendar-header">
                                <div className="month-info">
                                    <div className="month-mini">ACADEMIC CALENDAR</div>
                                    <div className="month-title">
                                        {MONTHS[currentMonth.getMonth()]}
                                        <span>{currentMonth.getFullYear()}</span>
                                    </div>
                                    <div className="month-meta">
                                        {monthTests.length.toLocaleString("en-IN")} tests scheduled this month
                                    </div>
                                </div>

                                <div className="month-actions">
                                    <button className="today-button magnetic-btn" onClick={goToday}>Today</button>
                                    <button className="nav-button magnetic-btn" onClick={previousMonth}><ArrowLeft size={17} /></button>
                                    <button className="nav-button magnetic-btn" onClick={nextMonth}><ArrowRight size={17} /></button>
                                </div>
                            </div>

                            <div className="weekday-grid">
                                {WEEKDAYS.map((day) => (
                                    <div key={day} className="weekday">{day}</div>
                                ))}
                            </div>

                            <div className="calendar-grid">
                                {calendarDays.map((cell) => {
                                    const tests = testsByDate.get(cell.key) || [];
                                    const active = tests.length > 0;
                                    const selected = selectedDate === cell.key;
                                    const today = cell.key === dateOnlyKey(new Date());

                                    const typeList = [...new Set(tests.map((test) => test.type))];

                                    return (
                                        <button
                                            key={cell.key}
                                            className={[
                                                "calendar-cell",
                                                !cell.currentMonth ? "muted-cell" : "",
                                                active ? "has-tests" : "",
                                                selected ? "selected-cell" : "",
                                                today ? "today-cell" : "",
                                            ].join(" ")}
                                            onClick={() => {
                                                if (active) {
                                                    setSelectedDate(cell.key);
                                                    setSelectedTest(null);
                                                }
                                            }}
                                        >
                                            <div className="cell-top">
                                                <span className="date-number">{cell.day}</span>
                                                {active && <span className="test-count">{tests.length}</span>}
                                            </div>

                                            {active && (
                                                <>
                                                    <div className="dot-row">
                                                        {typeList.slice(0, 5).map((type) => {
                                                            const meta = getTypeMeta(type);
                                                            return (
                                                                <span
                                                                    key={type}
                                                                    className="type-dot"
                                                                    style={{
                                                                        background: meta.color,
                                                                        boxShadow: `0 0 12px ${meta.color}`,
                                                                    }}
                                                                />
                                                            );
                                                        })}
                                                    </div>

                                                    <div className="cell-preview">
                                                        {tests.slice(0, 2).map((test) => {
                                                            const meta = getTypeMeta(test.type);
                                                            return (
                                                                <span
                                                                    key={test.id}
                                                                    className="mini-test"
                                                                    style={{ borderColor: meta.color }}
                                                                >
                                                                    {test.name}
                                                                </span>
                                                            );
                                                        })}
                                                        {tests.length > 2 && (
                                                            <span className="more-tests">+{tests.length - 2} more</span>
                                                        )}
                                                    </div>
                                                </>
                                            )}

                                            {!active && cell.currentMonth && (
                                                <div className="empty-cell-label">—</div>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>

                            <div className="calendar-footer">
                                <div className="legend">
                                    {["MILESTONE", "AITS", "AIR", "COE", "UNIVERSE", "NEET_MILESTONE", "NEET_AITS"].map((type) => {
                                        const meta = getTypeMeta(type);
                                        return (
                                            <span key={type} className="legend-item">
                                                <span className="legend-dot" style={{ background: meta.color, boxShadow: `0 0 8px ${meta.color}` }} />
                                                {meta.label}
                                            </span>
                                        );
                                    })}
                                </div>
                                <div className="calendar-count">
                                    <CircleDot size={13} /> {activeDates} active dates
                                </div>
                            </div>
                        </div>

                        <aside className="date-panel glass-card">
                            {!selectedDate ? (
                                <div className="empty-panel">
                                    <div className="empty-orbit"><CalendarDays size={28} /></div>
                                    <h3>Select a test date</h3>
                                    <p>Click any highlighted date to inspect all scheduled tests and their complete subject-wise syllabus.</p>
                                    <div className="empty-hint"><Sparkles size={13} /> {activeDates} active dates available</div>
                                </div>
                            ) : (
                                <DatePanel
                                    date={selectedDate}
                                    tests={selectedDateTests}
                                    selectedTest={selectedTest}
                                    setSelectedTest={setSelectedTest}
                                    close={() => setSelectedDate(null)}
                                />
                            )}
                        </aside>
                    </section>
                )}

                {view === "list" && (
                    <section className="list-view glass-card">
                        <div className="list-header">
                            <div>
                                <div className="section-kicker"><List size={13} /> PLANNER LIST</div>
                                <h2>{filteredTests.length.toLocaleString("en-IN")} tests</h2>
                            </div>
                            <div className="list-header-meta">{activeDates} active dates</div>
                        </div>

                        {filteredTests.length === 0 ? (
                            <EmptyState />
                        ) : (
                            <div className="test-list">
                                {filteredTests.slice().sort((a, b) => a.date.localeCompare(b.date)).map((test) => (
                                    <TestListRow
                                        key={test.id}
                                        test={test}
                                        onClick={() => {
                                            setSelectedDate(test.date);
                                            setSelectedTest(test);
                                            setView("calendar");
                                        }}
                                    />
                                ))}
                            </div>
                        )}
                    </section>
                )}

                {view === "summary" && (
                    <section className="summary-view glass-card">
                        <div className="summary-hero glass-card">
                            <div>
                                <div className="section-kicker"><BarChart3 size={13} /> ACADEMIC OVERVIEW</div>
                                <h2>Planner Intelligence</h2>
                                <p>A quick operational snapshot of the current test plan.</p>
                            </div>
                            <div className="summary-big-number">
                                {filteredTests.length.toLocaleString("en-IN")} <span>tests</span>
                            </div>
                        </div>

                        <div className="summary-grid">
                            <SummaryBlock title="Test Types" icon={<Layers3 size={18} />}>
                                {Object.entries(TYPE_META).filter(([key]) => key !== "ALL").map(([key, meta]) => (
                                    <ProgressRow
                                        key={key}
                                        label={meta.label}
                                        value={typeCounts[key] || 0}
                                        total={filteredTests.length}
                                        color={meta.color}
                                    />
                                ))}
                            </SummaryBlock>

                            <SummaryBlock title="Subjects" icon={<BookOpen size={18} />}>
                                {SUBJECTS.map((subject) => (
                                    <ProgressRow
                                        key={subject}
                                        label={subject}
                                        value={subjectCounts[subject] || 0}
                                        total={filteredTests.length}
                                        color={
                                            subject === "Physics" ? "#60a5fa" :
                                                subject === "Chemistry" ? "#f59e0b" :
                                                    subject === "Chem-KPM" ? "#22d3ee" : "#c084fc"
                                        }
                                    />
                                ))}
                            </SummaryBlock>

                            <SummaryBlock title="Batches" icon={<Target size={18} />}>
                                {BATCHES.map((batch) => {
                                    const count = filteredTests.filter((test) => test.batch === batch).length;
                                    return (
                                        <ProgressRow key={batch} label={batch} value={count} total={filteredTests.length} color="#818cf8" />
                                    );
                                })}
                            </SummaryBlock>
                        </div>
                    </section>
                )}
            </main>

            {selectedTest && (
                <TestDetailModal test={selectedTest} onClose={() => setSelectedTest(null)} />
            )}
        </div>
    );
}

/* =========================================================
   SUB-COMPONENTS
========================================================= */

function StatCard({ icon, label, value, accent }) {
    return (
        <div className="stat-card glass-card" style={{ "--accent": accent }}>
            <div className="stat-icon">{icon}</div>
            <div className="stat-content">
                <span>{label}</span>
                <strong>{Number(value || 0).toLocaleString("en-IN")}</strong>
            </div>
            <div className="stat-glow" />
        </div>
    );
}

function ViewButton({ active, icon, label, onClick }) {
    return (
        <button className={active ? "view-button active magnetic-btn" : "view-button magnetic-btn"} onClick={onClick}>
            {icon} {label}
        </button>
    );
}

function FilterGroup({ label, children }) {
    return (
        <div className="filter-group">
            <span className="filter-label">{label}</span>
            {children}
        </div>
    );
}

function FilterPill({ active, color, label, count, onClick }) {
    return (
        <button className={active ? "filter-pill active magnetic-btn" : "filter-pill magnetic-btn"} onClick={onClick} style={{ "--pill-color": color }}>
            <span className="pill-dot" style={{ background: color, boxShadow: `0 0 8px ${color}` }} />
            <span>{label}</span>
            <small>{count}</small>
        </button>
    );
}

function DatePanel({ date, tests, selectedTest, setSelectedTest, close }) {
    const parsed = parseDateKey(date);
    const weekday = parsed?.toLocaleDateString("en-IN", { weekday: "long" });
    const day = parsed?.getDate();
    const month = parsed?.toLocaleDateString("en-IN", { month: "short" });
    const year = parsed?.getFullYear();

    const physics = tests.filter((t) => t.subjects.Physics?.length).length;
    const chemistry = tests.filter((t) => t.subjects.Chemistry?.length).length;
    const math = tests.filter((t) => t.subjects.Math?.length).length;
    const chemKPM = tests.filter((t) => t.subjects["Chem-KPM"]?.length).length;

    return (
        <div className="date-panel-inner">
            <div className="date-panel-header">
                <div className="date-big">
                    <strong>{day}</strong>
                    <div>
                        <span>{weekday}</span>
                        <b>{month} {year}</b>
                    </div>
                </div>
                <button className="close-panel magnetic-btn" onClick={close}><X size={17} /></button>
            </div>

            <div className="date-summary">
                <MiniMetric label="Tests" value={tests.length} />
                <MiniMetric label="Physics" value={physics} />
                <MiniMetric label="Chemistry" value={chemistry} />
                <MiniMetric label="Math" value={math} />
                <MiniMetric label="Chem-KPM" value={chemKPM} />
            </div>

            <div className="panel-heading">
                <span>Scheduled Tests</span>
                <small>{tests.length} records</small>
            </div>

            <div className="date-test-list">
                {tests.length === 0 ? (
                    <EmptyState />
                ) : (
                    tests.map((test) => {
                        const meta = getTypeMeta(test.type);
                        const isSelected = selectedTest?.id === test.id;

                        return (
                            <button
                                key={test.id}
                                className={isSelected ? "date-test active" : "date-test"}
                                onClick={() => setSelectedTest(test)}
                                style={{ "--test-color": meta.color }}
                            >
                                <div className="date-test-accent" />
                                <div className="date-test-main">
                                    <div className="date-test-top">
                                        <span className="type-badge" style={{ color: meta.color, borderColor: meta.color, background: `${meta.color}14` }}>
                                            {meta.label}
                                        </span>
                                        <span className="phase-badge">{test.phase || "ALL"}</span>
                                    </div>
                                    <strong>{test.name}</strong>
                                    <div className="date-test-meta">
                                        <span>{test.batch}</span>
                                        <span>{test.exam}</span>
                                    </div>
                                    <div className="subject-strip">
                                        {getVisibleSubjects(test).map((subject) => (
                                            <span
                                                key={subject}
                                                className={test.subjects[subject]?.length ? "subject-chip filled" : "subject-chip"}
                                            >
                                                {getSubjectShortLabel(subject)}
                                                <b>{test.subjects[subject]?.length || 0}</b>
                                            </span>
                                        ))}
                                    </div>
                                </div>
                                <ChevronRight size={17} className="date-test-arrow" />
                            </button>
                        );
                    })
                )}
            </div>
        </div>
    );
}

function MiniMetric({ label, value }) {
    return (
        <div className="mini-metric">
            <strong>{value}</strong>
            <span>{label}</span>
        </div>
    );
}

function TestDetailModal({ test, onClose }) {
    const meta = getTypeMeta(test.type);

    return (
        <div className="modal-backdrop" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
            <div className="test-modal glass-card">
                <div className="modal-glow" style={{ background: meta.color }} />
                <div className="modal-header">
                    <div>
                        <div className="modal-eyebrow">
                            <span style={{ background: meta.color, boxShadow: `0 0 12px ${meta.color}` }} /> TEST DETAILS
                        </div>
                        <h2>{test.name}</h2>
                        <div className="modal-meta-row">
                            <span className="type-badge" style={{ color: meta.color, borderColor: meta.color, background: `${meta.color}14` }}>
                                {meta.label}
                            </span>
                            <span className="modal-tag">{test.batch}</span>
                            <span className="modal-tag">{test.exam}</span>
                            <span className="modal-tag">Phase {test.phase || "ALL"}</span>
                        </div>
                    </div>
                    <button className="modal-close magnetic-btn" onClick={onClose}><X size={19} /></button>
                </div>

                <div className="modal-date-banner">
                    <CalendarDays size={18} />
                    <div>
                        <span>Scheduled Date</span>
                        <strong>{formatLongDate(test.date)}</strong>
                    </div>
                    <div className="modal-date-status"><span /> Scheduled</div>
                </div>

                <div className="modal-body">
                    {getVisibleSubjects(test).map((subject) => {
                        const chapters = test.subjects[subject] || [];
                        return (
                            <div key={subject} className="syllabus-card glass-card">
                                <div className="syllabus-header">
                                    <div className={`subject-icon ${getSubjectClass(subject)}`}>
                                        {getSubjectInitial(subject)}
                                    </div>
                                    <div>
                                        <strong>{subject}</strong>
                                        <span>{chapters.length ? `${chapters.length} syllabus entries` : "No syllabus mapped"}</span>
                                    </div>
                                    <span className="syllabus-count">{chapters.length}</span>
                                </div>
                                <div className="chapter-list">
                                    {chapters.length ? (
                                        chapters.map((chapter, idx) => (
                                            <div key={`${chapter}-${idx}`} className="chapter-item">
                                                <span>{String(idx + 1).padStart(2, "0")}</span>
                                                <p>{chapter}</p>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="no-syllabus">Syllabus data is not available for this subject in the planner record.</div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>

                <div className="modal-footer">
                    <div><Activity size={14} /> Live planner record</div>
                    <button className="magnetic-btn" onClick={onClose}>Done</button>
                </div>
            </div>
        </div>
    );
}

function TestListRow({ test, onClick }) {
    const meta = getTypeMeta(test.type);

    return (
        <button className="list-row glass-card" onClick={onClick} style={{ "--row-color": meta.color }}>
            <div className="list-date">
                <strong>{parseDateKey(test.date)?.getDate()}</strong>
                <span>{parseDateKey(test.date)?.toLocaleDateString("en-IN", { month: "short" })}</span>
            </div>
            <div className="list-type">
                <span style={{ color: meta.color, borderColor: meta.color }}>{meta.label}</span>
            </div>
            <div className="list-main">
                <strong>{test.name}</strong>
                <div>
                    <span>{test.batch}</span>
                    <span>{test.exam}</span>
                    <span>{test.phase}</span>
                </div>
            </div>
            <div className="list-subjects">
                {getVisibleSubjects(test).map((subject) => (
                    <span key={subject} className={test.subjects[subject]?.length ? "subject-chip filled" : "subject-chip"}>
                        {getSubjectShortLabel(subject)}
                        <b>{test.subjects[subject]?.length || 0}</b>
                    </span>
                ))}
            </div>
            <ChevronRight size={18} />
        </button>
    );
}

function SummaryBlock({ title, icon, children }) {
    return (
        <div className="summary-block glass-card">
            <div className="summary-block-header">
                <div className="summary-icon">{icon}</div>
                <strong>{title}</strong>
            </div>
            <div className="progress-list">{children}</div>
        </div>
    );
}

function ProgressRow({ label, value, total, color }) {
    const percentage = total > 0 ? Math.min(100, (value / total) * 100) : 0;
    return (
        <div className="progress-row">
            <div className="progress-label">
                <span>
                    <i style={{ background: color, boxShadow: `0 0 8px ${color}` }} />
                    {label}
                </span>
                <b>{value}</b>
            </div>
            <div className="progress-track">
                <div className="progress-fill" style={{ width: `${percentage}%`, background: color, boxShadow: `0 0 12px ${color}` }} />
            </div>
        </div>
    );
}

function EmptyState() {
    return (
        <div className="empty-state">
            <Search size={25} />
            <h3>No tests found</h3>
            <p>Try changing your filters or search query.</p>
        </div>
    );
}

/* =========================================================
   CSS STYLING (Unchanged & Polished)
========================================================= */

const styles = `
* { box-sizing: border-box; }
.vp-page {
    min-height: 100vh; position: relative; overflow-x: hidden; color: #eef2ff;
    background: radial-gradient(circle at 10% 0%, rgba(99,102,241,.12), transparent 30%),
                radial-gradient(circle at 90% 10%, rgba(168,85,247,.09), transparent 28%), #070912;
    font-family: Inter, ui-sans-serif, system-ui, sans-serif;
}
.vp-page button, .vp-page input, .vp-page select { font: inherit; }
.ambient { position: fixed; pointer-events: none; border-radius: 999px; filter: blur(100px); opacity: .24; z-index: 0; animation: floatOrb 14s ease-in-out infinite alternate; }
.ambient-one { width: 420px; height: 420px; background: #4f46e5; top: -180px; left: -120px; }
.ambient-two { width: 360px; height: 360px; background: #9333ea; right: -140px; top: 280px; animation-delay: -5s; }
.ambient-three { width: 280px; height: 280px; background: #0284c7; bottom: -120px; left: 35%; animation-delay: -9s; }
.noise { position: fixed; inset: 0; pointer-events: none; z-index: 1; opacity: .035; background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 180 180' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='.8'/%3E%3C/svg%3E"); }
.planner-shell { position: relative; z-index: 2; width: min(1680px, calc(100% - 44px)); margin: 0 auto; padding: 34px 0 60px; }
.hero { display: flex; justify-content: space-between; align-items: flex-end; gap: 30px; margin-bottom: 24px; padding: 24px; border-radius: 28px; }
.hero-left { max-width: 900px; }
.eyebrow, .section-kicker { display: flex; align-items: center; gap: 8px; color: #8992b8; font-size: 10px; font-weight: 800; letter-spacing: .18em; text-transform: uppercase; }
.live-pulse { width: 7px; height: 7px; border-radius: 50%; background: #22c55e; box-shadow: 0 0 0 5px rgba(34,197,94,.08), 0 0 14px #22c55e; animation: pulse 1.8s infinite; }
.hero h1 { margin: 9px 0 8px; font-size: clamp(38px, 4vw, 62px); line-height: .98; letter-spacing: -.055em; font-weight: 850; color: #f8fafc; }
.hero h1 span { display: block; color: #8d96ba; font-size: .43em; letter-spacing: -.01em; margin-top: 9px; font-weight: 650; }
.hero p { margin: 16px 0 0; max-width: 700px; color: #858eaf; font-size: 14px; line-height: 1.7; }
.sync-card { min-width: 230px; padding: 16px 17px; border: 1px solid rgba(148,163,184,.13); border-radius: 18px; background: linear-gradient(145deg, rgba(255,255,255,.065), rgba(255,255,255,.025)); box-shadow: 0 25px 70px rgba(0,0,0,.24), inset 0 1px rgba(255,255,255,.05); backdrop-filter: blur(22px); }
.sync-top, .sync-footer { display: flex; justify-content: space-between; align-items: center; }
.sync-status { display: flex; align-items: center; gap: 6px; color: #4ade80; font-size: 10px; font-weight: 800; letter-spacing: .12em; }
.sync-status > span { width: 6px; height: 6px; border-radius: 50%; background: #4ade80; box-shadow: 0 0 10px #4ade80; }
.sync-source { color: #68718f; font-size: 10px; }
.sync-number { margin-top: 10px; color: #f8fafc; font-size: 32px; line-height: 1; font-weight: 800; letter-spacing: -.05em; }
.sync-label { margin-top: 4px; color: #707996; font-size: 11px; }
.sync-footer { margin-top: 13px; padding-top: 11px; border-top: 1px solid rgba(148,163,184,.08); color: #66708e; font-size: 10px; }
.sync-footer span { display: flex; align-items: center; gap: 5px; }
.spin-button { display: grid; place-items: center; width: 27px; height: 27px; border: 1px solid rgba(148,163,184,.12); border-radius: 8px; background: rgba(255,255,255,.035); color: #9ba4c2; cursor: pointer; transition: .2s; }
.spin-button:hover { color: #fff; background: rgba(255,255,255,.08); }
.spinning svg { animation: spin 1s linear infinite; }
.stats-grid { display: grid; grid-template-columns: repeat(7, minmax(0, 1fr)); gap: 8px; margin-bottom: 16px; }
.stat-card { position: relative; overflow: hidden; display: flex; align-items: center; gap: 9px; min-width: 0; min-height: 62px; padding: 10px 11px; border: 1px solid rgba(148,163,184,.11); border-radius: 16px; background: linear-gradient(145deg, rgba(255,255,255,.055), rgba(255,255,255,.018)); backdrop-filter: blur(18px); }
.stat-icon { display: grid; place-items: center; flex: 0 0 auto; width: 31px; height: 31px; border: 1px solid color-mix(in srgb, var(--accent), transparent 70%); border-radius: 9px; color: var(--accent); background: color-mix(in srgb, var(--accent), transparent 91%); }
.stat-content { display: flex; flex-direction: column; min-width: 0; }
.stat-content span { color: #737c9c; font-size: 8.5px; font-weight: 700; text-transform: uppercase; letter-spacing: .10em; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.stat-content strong { margin-top: 3px; color: #f1f5f9; font-size: 19px; line-height: 1; letter-spacing: -.04em; }
.stat-glow { position: absolute; right: -35px; bottom: -55px; width: 110px; height: 110px; border-radius: 50%; background: var(--accent); opacity: .08; filter: blur(30px); }
.toolbar { display: flex; align-items: center; justify-content: space-between; gap: 14px; margin-bottom: 14px; }
.view-switcher { display: flex; gap: 3px; padding: 4px; border: 1px solid rgba(148,163,184,.11); border-radius: 12px; background: rgba(255,255,255,.025); }
.view-button { display: flex; align-items: center; gap: 7px; padding: 8px 13px; border: 0; border-radius: 9px; color: #737d9b; background: transparent; cursor: pointer; font-size: 11px; font-weight: 700; transition: .2s; }
.view-button:hover { color: #dbe4ff; }
.view-button.active { color: #fff; background: linear-gradient(135deg, rgba(99,102,241,.3), rgba(139,92,246,.18)); box-shadow: inset 0 1px rgba(255,255,255,.08), 0 7px 20px rgba(79,70,229,.12); }
.search-box { display: flex; align-items: center; gap: 8px; width: min(360px, 100%); height: 38px; padding: 0 12px; border: 1px solid rgba(148,163,184,.12); border-radius: 11px; background: rgba(255,255,255,.03); color: #697391; }
.search-box:focus-within { border-color: rgba(129,140,248,.45); box-shadow: 0 0 0 4px rgba(99,102,241,.07); }
.search-box input { width: 100%; outline: none; border: 0; color: #e5e7eb; background: transparent; font-size: 11px; }
.search-box input::placeholder { color: #555e7b; }
.search-box button { display: grid; place-items: center; border: 0; color: #727b98; background: transparent; cursor: pointer; }
.filter-panel { margin-bottom: 18px; padding: 17px; border: 1px solid rgba(148,163,184,.1); border-radius: 18px; background: linear-gradient(145deg, rgba(255,255,255,.045), rgba(255,255,255,.018)); backdrop-filter: blur(18px); }
.filter-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px; }
.section-kicker { color: #68718f; }
.section-title { margin-top: 4px; color: #e7ebf7; font-size: 13px; font-weight: 750; }
.clear-filter { border: 0; color: #8c96b7; background: transparent; cursor: pointer; font-size: 10px; }
.clear-filter:hover { color: #fff; }
.filter-row { display: flex; gap: 18px; flex-wrap: wrap; }
.filter-group { display: flex; flex-direction: column; gap: 7px; }
.filter-label { color: #5e6783; font-size: 9px; font-weight: 800; letter-spacing: .14em; text-transform: uppercase; }
.filter-pills { display: flex; gap: 5px; flex-wrap: wrap; }
.filter-pill { display: flex; align-items: center; gap: 6px; height: 29px; padding: 0 9px; border: 1px solid rgba(148,163,184,.1); border-radius: 8px; color: #78829f; background: rgba(255,255,255,.025); cursor: pointer; font-size: 10px; font-weight: 700; transition: .2s; }
.filter-pill:hover { color: #dce3f8; border-color: rgba(148,163,184,.2); }
.filter-pill.active { color: #fff; border-color: color-mix(in srgb, var(--pill-color), transparent 55%); background: color-mix(in srgb, var(--pill-color), transparent 88%); }
.pill-dot { width: 6px; height: 6px; border-radius: 50%; }
.filter-pill small { color: #5e6780; font-size: 8px; }
.select-wrap { position: relative; }
.select-wrap select { appearance: none; height: 29px; min-width: 145px; padding: 0 30px 0 10px; outline: none; border: 1px solid rgba(148,163,184,.1); border-radius: 8px; color: #9ba5c1; background: #111524; font-size: 10px; font-weight: 700; cursor: pointer; }
.select-wrap svg { position: absolute; right: 9px; top: 50%; transform: translateY(-50%); color: #68718e; pointer-events: none; }
.phase-pills { gap: 4px; }
.phase-pill { height: 29px; padding: 0 10px; border: 1px solid rgba(148,163,184,.1); border-radius: 8px; color: #78829f; background: rgba(255,255,255,.025); cursor: pointer; font-size: 10px; font-weight: 700; }
.phase-pill.active { color: #eef2ff; border-color: rgba(129,140,248,.35); background: rgba(99,102,241,.15); }
.calendar-layout { display: grid; grid-template-columns: minmax(0, 1fr) 390px; gap: 15px; align-items: stretch; }
.calendar-card, .date-panel, .list-view, .summary-view { border: 1px solid rgba(148,163,184,.1); border-radius: 20px; background: linear-gradient(145deg, rgba(255,255,255,.045), rgba(255,255,255,.017)); box-shadow: 0 30px 80px rgba(0,0,0,.17), inset 0 1px rgba(255,255,255,.035); backdrop-filter: blur(20px); }
.calendar-card { overflow: hidden; }
.calendar-header { display: flex; justify-content: space-between; align-items: center; padding: 23px 24px 20px; border-bottom: 1px solid rgba(148,163,184,.08); }
.month-mini { color: #646e8d; font-size: 9px; font-weight: 800; letter-spacing: .17em; }
.month-title { margin-top: 3px; color: #f5f7ff; font-size: 29px; font-weight: 820; letter-spacing: -.045em; }
.month-title span { margin-left: 9px; color: #626c8b; font-size: 15px; font-weight: 650; }
.month-meta { margin-top: 5px; color: #69728f; font-size: 10px; }
.month-actions { display: flex; align-items: center; gap: 7px; }
.today-button, .nav-button { height: 34px; border: 1px solid rgba(148,163,184,.12); border-radius: 9px; color: #8993af; background: rgba(255,255,255,.025); cursor: pointer; transition: .2s; }
.today-button { padding: 0 12px; font-size: 10px; font-weight: 750; }
.nav-button { display: grid; place-items: center; width: 34px; }
.today-button:hover, .nav-button:hover { color: #fff; border-color: rgba(129,140,248,.35); background: rgba(99,102,241,.12); transform: translateY(-1px); }
.weekday-grid, .calendar-grid { display: grid; grid-template-columns: repeat(7, minmax(0, 1fr)); }
.weekday-grid { padding: 0 10px; border-bottom: 1px solid rgba(148,163,184,.07); }
.weekday { padding: 12px 8px 10px; color: #59627d; font-size: 9px; font-weight: 800; letter-spacing: .15em; text-align: right; }
.calendar-grid { padding: 0 10px 10px; }
.calendar-cell { position: relative; min-height: 143px; padding: 11px; border: 1px solid rgba(148,163,184,.055); border-top: 0; border-left: 0; color: #dce2f2; background: linear-gradient(145deg, rgba(255,255,255,.017), transparent); text-align: left; cursor: default; overflow: hidden; transition: background .22s, transform .22s, border-color .22s, box-shadow .22s; }
.calendar-cell:nth-child(7n) { border-right: 0; }
.calendar-cell.has-tests { cursor: pointer; }
.calendar-cell.has-tests:hover { z-index: 3; background: linear-gradient(145deg, rgba(99,102,241,.095), rgba(255,255,255,.028)); border-color: rgba(129,140,248,.24); box-shadow: inset 0 0 35px rgba(99,102,241,.035), 0 12px 35px rgba(0,0,0,.16); transform: translateY(-2px); }
.calendar-cell.selected-cell { z-index: 4; background: linear-gradient(145deg, rgba(99,102,241,.16), rgba(139,92,246,.07)); border-color: rgba(129,140,248,.48); box-shadow: inset 0 0 35px rgba(99,102,241,.08), 0 0 0 1px rgba(129,140,248,.08); }
.muted-cell { opacity: .28; }
.today-cell .date-number { color: #fff; }
.today-cell .date-number::after { content: ""; position: absolute; left: 10px; top: 11px; width: 28px; height: 28px; border: 1px solid rgba(129,140,248,.5); border-radius: 50%; pointer-events: none; }
.cell-top { display: flex; justify-content: space-between; align-items: center; }
.date-number { position: relative; z-index: 2; color: #b6bed5; font-size: 13px; font-weight: 800; }
.test-count { min-width: 21px; height: 19px; padding: 0 6px; border: 1px solid rgba(129,140,248,.2); border-radius: 7px; color: #aeb7ff; background: rgba(99,102,241,.1); font-size: 9px; font-weight: 800; text-align: center; line-height: 17px; }
.dot-row { display: flex; gap: 4px; margin-top: 9px; }
.type-dot { width: 6px; height: 6px; border-radius: 50%; }
.cell-preview { display: flex; flex-direction: column; gap: 4px; margin-top: 9px; }
.mini-test { max-width: 100%; padding: 5px 6px; border-left: 2px solid; border-radius: 4px; color: #8c96b3; background: rgba(255,255,255,.026); font-size: 8px; font-weight: 650; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.more-tests { color: #59637f; font-size: 8px; font-weight: 700; }
.empty-cell-label { position: absolute; right: 11px; bottom: 9px; color: #252c41; font-size: 12px; }
.calendar-footer { display: flex; justify-content: space-between; align-items: center; gap: 15px; padding: 13px 18px; border-top: 1px solid rgba(148,163,184,.08); }
.legend { display: flex; flex-wrap: wrap; gap: 11px; }
.legend-item { display: flex; align-items: center; gap: 5px; color: #68718c; font-size: 8px; font-weight: 700; }
.legend-dot { width: 5px; height: 5px; border-radius: 50%; }
.calendar-count { display: flex; align-items: center; gap: 5px; color: #5d6784; white-space: nowrap; font-size: 9px; }
.date-panel { min-height: 100%; overflow: hidden; }
.date-panel-inner { display: flex; flex-direction: column; min-height: 100%; }
.date-panel-header { display: flex; justify-content: space-between; padding: 21px 19px 16px; border-bottom: 1px solid rgba(148,163,184,.08); }
.date-big { display: flex; align-items: center; gap: 11px; }
.date-big > strong { color: #f8fafc; font-size: 44px; line-height: .9; letter-spacing: -.06em; }
.date-big div { display: flex; flex-direction: column; }
.date-big span { color: #747e9d; font-size: 10px; font-weight: 700; }
.date-big b { margin-top: 3px; color: #b6bed2; font-size: 12px; }
.close-panel, .modal-close { display: grid; place-items: center; width: 30px; height: 30px; border: 1px solid rgba(148,163,184,.1); border-radius: 8px; color: #6e7895; background: rgba(255,255,255,.025); cursor: pointer; }
.close-panel:hover, .modal-close:hover { color: #fff; background: rgba(255,255,255,.07); }
.date-summary { display: grid; grid-template-columns: repeat(5, 1fr); gap: 5px; padding: 13px; border-bottom: 1px solid rgba(148,163,184,.07); }
.mini-metric { display: flex; flex-direction: column; padding: 9px 7px; border: 1px solid rgba(148,163,184,.07); border-radius: 8px; background: rgba(255,255,255,.018); }
.mini-metric strong { color: #e9edfa; font-size: 16px; letter-spacing: -.03em; }
.mini-metric span { margin-top: 2px; color: #626c88; font-size: 7px; font-weight: 700; text-transform: uppercase; }
.panel-heading { display: flex; justify-content: space-between; padding: 14px 15px 9px; }
.panel-heading span { color: #b6bfd7; font-size: 10px; font-weight: 800; }
.panel-heading small { color: #5f6985; font-size: 8px; }
.date-test-list { display: flex; flex-direction: column; gap: 6px; padding: 0 10px 12px; overflow: auto; max-height: 570px; }
.date-test { position: relative; display: flex; align-items: center; width: 100%; min-height: 105px; padding: 11px 10px 11px 13px; border: 1px solid rgba(148,163,184,.08); border-radius: 12px; color: inherit; background: rgba(255,255,255,.02); text-align: left; cursor: pointer; overflow: hidden; transition: .2s; }
.date-test:hover, .date-test.active { background: linear-gradient(145deg, rgba(255,255,255,.055), rgba(99,102,241,.04)); border-color: color-mix(in srgb, var(--test-color), transparent 60%); transform: translateX(2px); }
.date-test-accent { position: absolute; left: 0; top: 13px; bottom: 13px; width: 2px; background: var(--test-color); box-shadow: 0 0 12px var(--test-color); }
.date-test-main { flex: 1; min-width: 0; }
.date-test-top { display: flex; align-items: center; gap: 5px; margin-bottom: 6px; }
.type-badge, .phase-badge, .modal-tag { display: inline-flex; align-items: center; min-height: 18px; padding: 0 6px; border: 1px solid; border-radius: 5px; font-size: 7px; font-weight: 800; text-transform: uppercase; letter-spacing: .04em; }
.phase-badge { border-color: rgba(148,163,184,.1); color: #69738f; background: rgba(255,255,255,.025); }
.date-test strong { display: block; max-width: 280px; color: #dce3f4; font-size: 11px; line-height: 1.45; }
.date-test-meta { display: flex; gap: 7px; margin-top: 5px; }
.date-test-meta span { color: #65708c; font-size: 8px; font-weight: 650; }
.date-test-meta span + span { padding-left: 7px; border-left: 1px solid rgba(148,163,184,.1); }
.subject-strip { display: flex; gap: 4px; margin-top: 8px; }
.subject-chip { display: inline-flex; align-items: center; gap: 4px; height: 18px; padding: 0 5px; border: 1px solid rgba(148,163,184,.08); border-radius: 5px; color: #4f5872; background: rgba(255,255,255,.018); font-size: 6px; font-weight: 800; }
.subject-chip.filled { color: #8f9abc; border-color: rgba(148,163,184,.15); background: rgba(255,255,255,.04); }
.subject-chip b { color: #c0c7da; font-size: 7px; }
.date-test-arrow { flex-shrink: 0; color: #4f5871; }
.open-detail-button { display: flex; align-items: center; justify-content: center; gap: 7px; margin: auto 10px 10px; height: 35px; border: 1px solid rgba(129,140,248,.2); border-radius: 9px; color: #aab2f4; background: rgba(99,102,241,.08); cursor: pointer; font-size: 9px; font-weight: 750; }
.open-detail-button:hover { background: rgba(99,102,241,.15); }
.empty-panel { display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 570px; padding: 30px; text-align: center; }
.empty-orbit { display: grid; place-items: center; width: 64px; height: 64px; margin-bottom: 17px; border: 1px solid rgba(129,140,248,.25); border-radius: 20px; color: #818cf8; background: rgba(99,102,241,.07); box-shadow: 0 0 45px rgba(99,102,241,.12), inset 0 0 20px rgba(99,102,241,.07); }
.empty-panel h3 { margin: 0; color: #dfe5f4; font-size: 14px; }
.empty-panel p { max-width: 250px; margin: 9px 0 15px; color: #626c88; font-size: 10px; line-height: 1.7; }
.empty-hint { display: flex; align-items: center; gap: 5px; color: #777f9d; font-size: 9px; }
.list-view, .summary-view { padding: 20px; }
.list-header { display: flex; align-items: flex-end; justify-content: space-between; margin-bottom: 15px; }
.list-header h2, .summary-hero h2 { margin: 5px 0 0; color: #eef2ff; font-size: 24px; letter-spacing: -.04em; }
.list-header-meta { color: #68718e; font-size: 10px; }
.test-list { display: flex; flex-direction: column; gap: 6px; }
.list-row { display: grid; grid-template-columns: 58px 95px minmax(0, 1fr) 180px 20px; align-items: center; gap: 15px; width: 100%; min-height: 72px; padding: 9px 13px; border: 1px solid rgba(148,163,184,.08); border-radius: 12px; color: inherit; background: rgba(255,255,255,.02); text-align: left; cursor: pointer; transition: .2s; }
.list-row:hover { border-color: color-mix(in srgb, var(--row-color), transparent 60%); background: rgba(255,255,255,.045); transform: translateX(3px); }
.list-date { display: flex; flex-direction: column; }
.list-date strong { color: #e9edf8; font-size: 22px; line-height: 1; }
.list-date span { margin-top: 3px; color: #69738e; font-size: 9px; }
.list-type span { display: inline-flex; padding: 4px 6px; border: 1px solid; border-radius: 5px; background: rgba(255,255,255,.02); font-size: 7px; font-weight: 800; }
.list-main { min-width: 0; }
.list-main strong { display: block; color: #dfe5f5; font-size: 11px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.list-main div { display: flex; gap: 7px; margin-top: 5px; }
.list-main div span { color: #68728e; font-size: 8px; }
.list-main div span + span { padding-left: 7px; border-left: 1px solid rgba(148,163,184,.1); }
.list-subjects { display: flex; gap: 4px; }
.summary-hero { display: flex; align-items: center; justify-content: space-between; padding: 18px; margin-bottom: 13px; border: 1px solid rgba(148,163,184,.08); border-radius: 15px; background: rgba(255,255,255,.02); }
.summary-hero p { margin: 7px 0 0; color: #65708c; font-size: 10px; }
.summary-big-number { color: #a5b4fc; font-size: 45px; font-weight: 850; letter-spacing: -.06em; }
.summary-big-number span { margin-left: 7px; color: #5f6986; font-size: 11px; font-weight: 700; }
.summary-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }
.summary-block { padding: 17px; border: 1px solid rgba(148,163,184,.08); border-radius: 14px; background: rgba(255,255,255,.018); }
.summary-block-header { display: flex; align-items: center; gap: 9px; margin-bottom: 16px; }
.summary-icon { display: grid; place-items: center; width: 31px; height: 31px; border: 1px solid rgba(129,140,248,.16); border-radius: 8px; color: #818cf8; background: rgba(99,102,241,.08); }
.summary-block-header strong { color: #dce2f1; font-size: 11px; }
.progress-list { display: flex; flex-direction: column; gap: 13px; }
.progress-row { display: flex; flex-direction: column; gap: 6px; }
.progress-label { display: flex; justify-content: space-between; align-items: center; color: #7e88a4; font-size: 9px; }
.progress-label span { display: flex; align-items: center; gap: 6px; }
.progress-label i { width: 5px; height: 5px; border-radius: 50%; }
.progress-label b { color: #c5cce0; }
.progress-track { height: 4px; border-radius: 99px; background: rgba(148,163,184,.07); overflow: hidden; }
.progress-fill { height: 100%; border-radius: inherit; transition: width .5s ease; }
.modal-backdrop { position: fixed; inset: 0; z-index: 100; display: flex; align-items: center; justify-content: center; padding: 25px; background: rgba(2,4,12,.78); backdrop-filter: blur(16px); animation: fadeIn .2s ease; }
.test-modal { position: relative; width: min(920px, 100%); max-height: calc(100vh - 50px); display: flex; flex-direction: column; border: 1px solid rgba(148,163,184,.15); border-radius: 23px; background: linear-gradient(145deg, rgba(20,24,39,.98), rgba(10,13,24,.98)); box-shadow: 0 50px 120px rgba(0,0,0,.55), inset 0 1px rgba(255,255,255,.05); overflow: hidden; animation: modalIn .25s cubic-bezier(.2,.8,.2,1); }
.modal-glow { position: absolute; top: -160px; right: -120px; width: 350px; height: 350px; border-radius: 50%; opacity: .08; filter: blur(90px); pointer-events: none; }
.modal-header { position: relative; z-index: 2; display: flex; justify-content: space-between; gap: 20px; padding: 25px 27px 18px; border-bottom: 1px solid rgba(148,163,184,.08); }
.modal-eyebrow { display: flex; align-items: center; gap: 7px; color: #626c89; font-size: 9px; font-weight: 800; letter-spacing: .16em; }
.modal-eyebrow span { width: 6px; height: 6px; border-radius: 50%; }
.modal-header h2 { margin: 8px 0 10px; color: #f2f5fd; font-size: 25px; letter-spacing: -.04em; }
.modal-meta-row { display: flex; flex-wrap: wrap; gap: 5px; }
.modal-tag { border-color: rgba(148,163,184,.1); color: #77819d; background: rgba(255,255,255,.025); }
.modal-close { position: relative; z-index: 2; flex-shrink: 0; }
.modal-date-banner { display: flex; align-items: center; gap: 11px; margin: 15px 27px; padding: 11px 13px; border: 1px solid rgba(129,140,248,.12); border-radius: 11px; color: #8f99b7; background: rgba(99,102,241,.045); }
.modal-date-banner > div:not(.modal-date-status) { display: flex; flex-direction: column; }
.modal-date-banner span { color: #606a86; font-size: 8px; font-weight: 700; text-transform: uppercase; }
.modal-date-banner strong { margin-top: 2px; color: #cbd3e7; font-size: 10px; }
.modal-date-status { display: flex; align-items: center; gap: 6px; margin-left: auto; color: #4ade80; font-size: 8px; font-weight: 800; }
.modal-date-status span { width: 6px; height: 6px; border-radius: 50%; background: #4ade80; box-shadow: 0 0 10px #4ade80; }
.modal-body { display: grid; grid-template-columns: repeat(3, 1fr); gap: 9px; padding: 0 27px 20px; overflow: auto; }
.syllabus-card { border: 1px solid rgba(148,163,184,.09); border-radius: 14px; background: rgba(255,255,255,.022); overflow: hidden; }
.syllabus-header { display: flex; align-items: center; gap: 9px; padding: 12px; border-bottom: 1px solid rgba(148,163,184,.07); }
.subject-icon { display: grid; place-items: center; width: 31px; height: 31px; border-radius: 8px; font-size: 11px; font-weight: 900; }
.subject-icon.physics { color: #93c5fd; background: rgba(59,130,246,.11); border: 1px solid rgba(96,165,250,.15); }
.subject-icon.chemistry { color: #fbbf24; background: rgba(245,158,11,.1); border: 1px solid rgba(245,158,11,.15); }
.subject-icon.math { color: #d8b4fe; background: rgba(168,85,247,.1); border: 1px solid rgba(192,132,252,.15); }
.subject-icon.botany { color: #4ade80; background: rgba(74,222,128,.1); border: 1px solid rgba(74,222,128,.15); }
.subject-icon.zoology { color: #f472b6; background: rgba(244,114,182,.1); border: 1px solid rgba(244,114,182,.15); }
.subject-icon.chem-kpm { color: #22d3ee; background: rgba(34,211,238,.1); border: 1px solid rgba(34,211,238,.15); }
.syllabus-header > div:nth-child(2) { display: flex; flex-direction: column; min-width: 0; }
.syllabus-header strong { color: #dce3f3; font-size: 10px; }
.syllabus-header span { margin-top: 2px; color: #616b87; font-size: 7px; }
.syllabus-count { margin-left: auto; color: #707a97; font-size: 9px !important; font-weight: 800; }
.chapter-list { padding: 6px; }
.chapter-item { display: flex; gap: 7px; padding: 7px 6px; border-radius: 7px; }
.chapter-item:hover { background: rgba(255,255,255,.035); }
.chapter-item > span { flex-shrink: 0; color: #414a65; font-size: 7px; font-weight: 800; }
.chapter-item p { margin: 0; color: #858faa; font-size: 8px; line-height: 1.55; }
.no-syllabus { padding: 10px; color: #555f7b; font-size: 8px; line-height: 1.6; }
.modal-footer { display: flex; justify-content: space-between; align-items: center; padding: 13px 27px; border-top: 1px solid rgba(148,163,184,.08); color: #5f6984; font-size: 8px; }
.modal-footer > div { display: flex; align-items: center; gap: 5px; }
.modal-footer button { height: 30px; padding: 0 14px; border: 1px solid rgba(129,140,248,.2); border-radius: 8px; color: #b0b8f7; background: rgba(99,102,241,.1); cursor: pointer; font-size: 9px; font-weight: 750; }
.vp-loading, .error-shell { position: relative; z-index: 3; min-height: 100vh; display: grid; place-items: center; }
.vp-loading { text-align: center; }
.loading-orbit { position: relative; width: 76px; height: 76px; margin: 0 auto 20px; border: 1px solid rgba(129,140,248,.18); border-radius: 50%; animation: spin 3s linear infinite; }
.loading-orbit div { position: absolute; width: 8px; height: 8px; border-radius: 50%; }
.loading-orbit div:nth-child(1) { top: -4px; left: 50%; background: #818cf8; box-shadow: 0 0 20px #818cf8; }
.loading-orbit div:nth-child(2) { right: -4px; top: 50%; background: #c084fc; box-shadow: 0 0 20px #c084fc; }
.loading-orbit div:nth-child(3) { bottom: -4px; left: 25%; background: #38bdf8; box-shadow: 0 0 20px #38bdf8; }
.loading-title { color: #e5e9f7; font-size: 15px; font-weight: 750; }
.loading-subtitle { margin-top: 6px; color: #626c89; font-size: 10px; }
.error-card { width: min(460px, calc(100% - 30px)); padding: 28px; border: 1px solid rgba(248,113,113,.14); border-radius: 20px; background: rgba(255,255,255,.035); text-align: center; }
.error-icon { display: grid; place-items: center; width: 55px; height: 55px; margin: 0 auto 14px; border-radius: 15px; color: #fb7185; background: rgba(244,63,94,.08); }
.error-card h2 { margin: 0; color: #f1f5f9; font-size: 18px; }
.error-card p { margin: 10px 0 18px; color: #747e9b; font-size: 10px; line-height: 1.6; }
.vp-primary-button { display: inline-flex; align-items: center; gap: 7px; height: 36px; padding: 0 14px; border: 0; border-radius: 9px; color: #fff; background: linear-gradient(135deg, #6366f1, #8b5cf6); cursor: pointer; font-size: 10px; font-weight: 750; }
.empty-state { display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 260px; color: #535d79; text-align: center; }
.empty-state h3 { margin: 10px 0 4px; color: #c4cbe0; font-size: 13px; }
.empty-state p { margin: 0; font-size: 9px; }
@keyframes pulse { 0%, 100% { opacity: 1; transform: scale(1); } 50% { opacity: .5; transform: scale(.75); } }
@keyframes spin { to { transform: rotate(360deg); } }
@keyframes floatOrb { 0% { transform: translate3d(0,0,0); } 100% { transform: translate3d(25px,-20px,0); } }
@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
@keyframes modalIn { from { opacity: 0; transform: translateY(15px) scale(.985); } to { opacity: 1; transform: translateY(0) scale(1); } }
@media (max-width: 1250px) { .calendar-layout { grid-template-columns: minmax(0, 1fr) 340px; } .calendar-cell { min-height: 125px; } .mini-test { font-size: 7px; } }
@media (max-width: 1050px) { .planner-shell { width: min(100% - 24px, 900px); } .calendar-layout { grid-template-columns: 1fr; } .date-panel { min-height: 400px; } .date-test-list { max-height: 450px; } .stats-grid { grid-template-columns: repeat(4, minmax(0, 1fr)); } .summary-grid { grid-template-columns: 1fr; } }
@media (max-width: 760px) { .planner-shell { width: calc(100% - 16px); padding-top: 20px; } .hero { flex-direction: column; align-items: stretch; } .hero h1 { font-size: 39px; } .sync-card { width: 100%; } .toolbar { flex-direction: column; align-items: stretch; } .search-box { width: 100%; } .filter-row { flex-direction: column; } .calendar-header { padding: 17px; } .month-title { font-size: 23px; } .calendar-cell { min-height: 90px; padding: 7px; } .cell-preview { display: flex; gap: 2px; margin-top: 6px; } .mini-test { padding: 3px 4px; font-size: 6px; } .mini-test:nth-child(n + 2), .more-tests { display: none; } .weekday { font-size: 7px; } .calendar-footer { flex-direction: column; align-items: flex-start; } .modal-backdrop { padding: 8px; } .test-modal { max-height: calc(100vh - 16px); border-radius: 17px; } .modal-body { grid-template-columns: 1fr; padding: 0 15px 15px; } .modal-header { padding: 18px 15px 14px; } .modal-date-banner { margin: 10px 15px; } .modal-footer { padding: 11px 15px; } .list-row { grid-template-columns: 45px minmax(0, 1fr) 20px; } .list-type, .list-subjects { display: none; } }
@media (max-width: 500px) { .stats-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 7px; } .stat-card { min-height: 58px; padding: 9px; } .stat-content strong { font-size: 17px; } .view-button { padding: 7px 9px; } .view-button svg { width: 14px; } .calendar-grid { padding: 0 5px 5px; } .weekday-grid { padding: 0 5px; } .calendar-cell { min-height: 72px; padding: 5px; } .date-number { font-size: 11px; } .test-count { min-width: 17px; height: 16px; line-height: 14px; padding: 0 4px; font-size: 7px; } .dot-row { margin-top: 7px; } .cell-preview { display: flex; } .mini-test { font-size: 5.5px; padding: 2px 3px; } }
`;