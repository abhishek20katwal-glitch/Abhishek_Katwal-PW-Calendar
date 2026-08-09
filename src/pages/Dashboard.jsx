import api from "@/api/axios";
import { useEffect, useMemo, useRef, useState } from "react";

import {
    Activity,
    CalendarDays,
    Clock3,
    Layers3,
    RefreshCw,
    Search,
    Sparkles,
    Target,
    Users,
    Zap,
    X,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

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

const TYPE_META = {
    COE: { label: "COE", color: "#38bdf8" },
    AIR: { label: "AIR", color: "#fb7185" },
    MILESTONE: { label: "Milestone", color: "#60a5fa" },
    AITS: { label: "AITS", color: "#f59e0b" },
    UNIVERSE: { label: "PW Universe", color: "#c084fc" },
    NEET_MILESTONE: { label: "NEET Milestone", color: "#34d399" },
    NEET_AITS: { label: "NEET AITS", color: "#22d3ee" },
};

/* =========================================================
   HELPERS
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
        const normalizedKey = key
            .toLowerCase()
            .replace(/[^a-z0-9]/g, "");

        if (
            Object.prototype.hasOwnProperty.call(normalized, normalizedKey) &&
            clean(normalized[normalizedKey]) !== ""
        ) {
            return clean(normalized[normalizedKey]);
        }
    }

    return "";
}

/* =========================================================
   GLOBAL RAW SEARCH TEXT
========================================================= */

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
        return value
            .map((item) => getRawSearchText(item, depth + 1))
            .join(" ");
    }

    if (typeof value === "object") {
        return Object.entries(value)
            .map(([key, val]) => {
                return `${key} ${getRawSearchText(val, depth + 1)}`;
            })
            .join(" ");
    }

    return "";
}

/* =========================================================
   FLATTEN API PAYLOAD
========================================================= */

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
        if (Array.isArray(candidate)) {
            return candidate;
        }
    }

    const values = Object.values(payload);

    if (
        values.length &&
        values.some((value) => Array.isArray(value))
    ) {
        return values.flatMap((value) =>
            Array.isArray(value) ? value : []
        );
    }

    return [payload];
}

/* =========================================================
   DATE
========================================================= */

function formatDateKey(date) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");

    return `${y}-${m}-${d}`;
}

function normalizeDate(value) {
    const raw = clean(value);

    if (!raw) return null;

    const isoMatch = raw.match(
        /^(\d{4})[-/](\d{1,2})[-/](\d{1,2})/
    );

    if (isoMatch) {
        const [, y, m, d] = isoMatch;

        const date = new Date(
            Number(y),
            Number(m) - 1,
            Number(d)
        );

        if (!Number.isNaN(date.getTime())) {
            return formatDateKey(date);
        }
    }

    const indianMatch = raw.match(
        /^(\d{1,2})[-/](\d{1,2})[-/](\d{4})/
    );

    if (indianMatch) {
        const [, d, m, y] = indianMatch;

        const date = new Date(
            Number(y),
            Number(m) - 1,
            Number(d)
        );

        if (!Number.isNaN(date.getTime())) {
            return formatDateKey(date);
        }
    }

    const parsed = new Date(raw);

    if (!Number.isNaN(parsed.getTime())) {
        return formatDateKey(parsed);
    }

    return null;
}

function parseDateKey(key) {
    if (!key) return null;

    const [y, m, d] = key.split("-").map(Number);

    if (!y || !m || !d) return null;

    return new Date(y, m - 1, d);
}

function todayKey() {
    return formatDateKey(new Date());
}

function formatDate(key) {
    const date = parseDateKey(key);

    if (!date) return "";

    return date.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
    });
}

function formatDay(key) {
    const date = parseDateKey(key);

    if (!date) return "";

    return date.toLocaleDateString("en-IN", {
        weekday: "short",
        day: "numeric",
        month: "short",
    });
}

/* =========================================================
   TEXT
========================================================= */

function normalizeTextForMatch(value) {
    return lower(value)
        .replace(/12\s*th/g, "12th")
        .replace(/11\s*th/g, "11th")
        .replace(/10\s*th/g, "10th")
        .replace(/\s+/g, " ")
        .trim();
}

/* =========================================================
   TEST NAME
========================================================= */

function extractTestName(row) {
    if (!row || typeof row !== "object") {
        return "Untitled Test";
    }

    const explicitName = firstValue(row, [
        "testName",
        "test_name",
        "Test Name",
        "testname",
        "testTitle",
        "test_title",
        "Test Title",
        "name",
        "Name",
        "paperName",
        "Paper Name",
        "title",
        "Title",
    ]);

    if (explicitName) {
        return explicitName;
    }

    const type = firstValue(row, [
        "type",
        "Type",
        "testType",
        "test_type",
        "Test Type",
    ]);

    const number = firstValue(row, [
        "no",
        "No",
        "number",
        "Number",
        "testNo",
        "test_no",
        "Test No",
    ]);

    if (type && number) {
        return `${type} ${number}`;
    }

    if (type) {
        return type;
    }

    return "Untitled Test";
}

/* =========================================================
   BATCH
========================================================= */

function detectBatch(row) {
    if (!row || typeof row !== "object") {
        return "All";
    }

    const rawBatch = firstValue(row, [
        "batch",
        "Batch",
        "batchName",
        "batch_name",
        "Batch Name",
        "batchname",
        "targetBatch",
        "Target Batch",
        "class",
        "Class",
        "className",
        "Class Name",
    ]);

    const rawDiv = firstValue(row, [
        "div",
        "Div",
        "division",
        "Division",
        "stream",
        "Stream",
        "target",
        "Target",
    ]);

    const rawName = firstValue(row, [
        "testName",
        "Test Name",
        "name",
        "Name",
        "title",
        "Title",
    ]);

    const rawCode = firstValue(row, [
        "batchCode",
        "Batch Code",
        "course",
        "Course",
    ]);

    const combined = normalizeTextForMatch(
        [rawBatch, rawDiv, rawName, rawCode]
            .filter(Boolean)
            .join(" ")
    );

    if (combined.includes("dropper") && combined.includes("neet")) {
        return "Dropper NEET";
    }

    if (combined.includes("dropper") && combined.includes("jee")) {
        return "Dropper JEE";
    }

    if (combined.includes("12th") && combined.includes("neet")) {
        return "12th NEET";
    }

    if (combined.includes("12th") && combined.includes("jee")) {
        return "12th JEE";
    }

    if (combined.includes("11th") && combined.includes("neet")) {
        return "11th NEET";
    }

    if (combined.includes("11th") && combined.includes("jee")) {
        return "11th JEE";
    }

    return clean(rawBatch) || "All";
}

/* =========================================================
   EXAM
========================================================= */

function detectExam(row) {
    const value = [
        firstValue(row, [
            "exam",
            "Exam",
            "examType",
            "Exam Type",
            "stream",
            "Stream",
            "target",
            "Target",
        ]),
        firstValue(row, [
            "testName",
            "Test Name",
            "name",
            "Name",
        ]),
        firstValue(row, [
            "batch",
            "Batch",
            "batchName",
            "Batch Name",
        ]),
        detectBatch(row),
    ]
        .filter(Boolean)
        .join(" ");

    const text = lower(value);

    if (text.includes("neet")) return "NEET";
    if (text.includes("jee")) return "JEE";

    return "JEE";
}

/* =========================================================
   TYPE
========================================================= */

function detectType(row) {
    const explicit = firstValue(row, [
        "testType",
        "test_type",
        "Test Type",
        "type",
        "Type",
        "category",
        "Category",
        "testCategory",
        "Test Category",
    ]);

    const combined = [
        explicit,
        firstValue(row, [
            "testName",
            "test_name",
            "Test Name",
            "name",
            "Name",
        ]),
        firstValue(row, [
            "test",
            "Test",
            "paper",
            "Paper",
        ]),
        detectBatch(row),
    ]
        .filter(Boolean)
        .join(" ");

    const value = lower(combined);

    if (value.includes("universe")) {
        return "UNIVERSE";
    }

    if (value.includes("aits")) {
        if (value.includes("neet")) {
            return "NEET_AITS";
        }

        return "AITS";
    }

    if (
        value.includes("air") ||
        value.includes("vp air")
    ) {
        return "AIR";
    }

    if (
        value.includes("milestone") ||
        value.includes("milestone test")
    ) {
        if (value.includes("neet")) {
            return "NEET_MILESTONE";
        }

        return "MILESTONE";
    }

    if (
        value.includes("coe") ||
        value.includes("utam") ||
        value.includes("wtm")
    ) {
        return "COE";
    }

    return explicit || "COE";
}

/* =========================================================
   PHASE
========================================================= */

function detectPhase(row) {
    const value = firstValue(row, [
        "phase",
        "Phase",
        "testPhase",
        "Test Phase",
    ]);

    if (!value) {
        return "ALL";
    }

    const text = lower(value);

    for (let i = 1; i <= 6; i++) {
        if (
            text === String(i) ||
            text.includes(`phase ${i}`) ||
            text.includes(`phase-${i}`)
        ) {
            return `Phase ${i}`;
        }
    }

    return value;
}

/* =========================================================
   SUBJECT
========================================================= */

function normalizeSubjectName(value) {
    const text = lower(value)
        .replace(/[^a-z0-9]+/g, " ")
        .trim();

    if (
        text.includes("chem kpm") ||
        text.includes("chemkpm")
    ) {
        return "Chem-KPM";
    }

    if (
        text === "phy" ||
        text === "physics" ||
        text.includes("physics")
    ) {
        return "Physics";
    }

    if (
        text === "chem" ||
        text === "chemistry" ||
        text.includes("chemistry")
    ) {
        return "Chemistry";
    }

    if (
        text === "math" ||
        text === "maths" ||
        text === "mathematics" ||
        text.includes("mathematics")
    ) {
        return "Math";
    }

    if (
        text === "botany" ||
        text === "bot" ||
        text.includes("botany")
    ) {
        return "Botany";
    }

    if (
        text === "zoology" ||
        text === "zoo" ||
        text.includes("zoology")
    ) {
        return "Zoology";
    }

    return "";
}

function getSubjectColumnValue(row, subject) {
    if (!row || typeof row !== "object") {
        return "";
    }

    const keyMap = {
        Physics: [
            "Physics",
            "physics",
            "phy",
            "PHY",
            "Physics Syllabus",
        ],

        Chemistry: [
            "Chemistry",
            "chemistry",
            "chem",
            "CHEM",
            "Chemistry Syllabus",
        ],

        Math: [
            "Math",
            "math",
            "maths",
            "Maths",
            "MATH",
            "Mathematics",
        ],

        "Chem-KPM": [
            "Chem-KPM",
            "Chem KPM",
            "ChemKPM",
            "chem-kpm",
        ],

        Botany: [
            "Botany",
            "botany",
            "BOTANY",
            "Bot",
        ],

        Zoology: [
            "Zoology",
            "zoology",
            "ZOOLOGY",
            "Zoo",
        ],
    };

    const direct = firstValue(
        row,
        keyMap[subject] || []
    );

    if (direct) {
        return direct;
    }

    for (const [key, value] of Object.entries(row)) {
        const normalizedKey = lower(key)
            .replace(/[_-]+/g, " ")
            .trim();

        const normalizedSubject =
            normalizeSubjectName(normalizedKey);

        if (
            normalizedSubject === subject &&
            clean(value)
        ) {
            return clean(value);
        }
    }

    return "";
}

function getSubjects(row) {
    const detected = [];

    SUBJECTS.forEach((subject) => {
        const val = getSubjectColumnValue(row, subject);

        if (val) {
            detected.push(subject);
        }
    });

    const explicitSubject = normalizeSubjectName(
        firstValue(row, [
            "subject",
            "Subject",
            "SUBJECT",
            "stream",
            "Stream",
        ])
    );

    if (
        explicitSubject &&
        !detected.includes(explicitSubject)
    ) {
        detected.push(explicitSubject);
    }

    return detected;
}

/* =========================================================
   NORMALIZE TEST
========================================================= */

function normalizeTest(row, index) {
    if (!row || typeof row !== "object") {
        return null;
    }

    const date = firstValue(row, [
        "date",
        "testDate",
        "test_date",
        "examDate",
        "exam_date",
        "scheduleDate",
        "schedule_date",
        "startDate",
        "start_date",
        "Date",
        "Test Date",
    ]);

    const normalizedDate = normalizeDate(date);

    if (!normalizedDate) {
        return null;
    }

    const name = extractTestName(row);
    const type = detectType(row);
    const exam = detectExam(row);
    const batch = detectBatch(row);
    const phase = detectPhase(row);
    const subjects = getSubjects(row);

    const rawSearchText = getRawSearchText(row);

    const searchableText = [
        name,
        type,
        exam,
        batch,
        phase,
        normalizedDate,
        formatDate(normalizedDate),
        formatDay(normalizedDate),
        subjects.join(" "),
        rawSearchText,
    ]
        .join(" ")
        .toLowerCase();

    return {
        id: `${normalizedDate}-${index}`,
        date: normalizedDate,
        name,
        type,
        exam,
        batch,
        phase,
        subjects,
        raw: row,
        searchableText,
    };
}

/* =========================================================
   DASHBOARD
========================================================= */

function Dashboard() {
    const [tests, setTests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState("");
    const [search, setSearch] = useState("");

    // Admin Check based on local storage email
    const userEmail = localStorage.getItem("user_email");
    const adminEmails = ["abishek.katwal@pw.live", "abhishek20.katwal@gmail.com"];
    const isAdmin = adminEmails.includes(userEmail);

    const searchRef = useRef(null);

    // --- CODEPEN MAGIC: Holographic Tilt, Mouse Spotlight & Magnetic Buttons ---
    useEffect(() => {
        const handleMouseMove = (e) => {
            // Spotlight & 3D Tilt for Glass Cards
            const cards = document.querySelectorAll(".glass-card");
            cards.forEach((card) => {
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                card.style.setProperty("--mouse-x", `${x}px`);
                card.style.setProperty("--mouse-y", `${y}px`);

                const centerX = rect.width / 2;
                const centerY = rect.height / 2;
                const rotateX = ((y - centerY) / centerY) * -5;
                const rotateY = ((x - centerX) / centerX) * 5;

                if (
                    e.clientX >= rect.left &&
                    e.clientX <= rect.right &&
                    e.clientY >= rect.top &&
                    e.clientY <= rect.bottom
                ) {
                    card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-3px)`;
                } else {
                    card.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px)`;
                }
            });

            // Magnetic Pull Effect for Buttons
            const buttons = document.querySelectorAll(".magnetic-btn");
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

    const fetchCalendarData = async () => {
        const response = await api.get("/schedule", {
            headers: {
                Accept: "application/json",
            },
            cache: "no-store",
        });

        const payload = response.data;
        const rows = flattenPayload(payload);

        const normalized = rows
            .map((row, index) =>
                normalizeTest(row, index)
            )
            .filter(Boolean);

        setTests(normalized);
    };

    useEffect(() => {
        const load = async () => {
            try {
                setLoading(true);
                setError("");
                await fetchCalendarData();
            } catch (err) {
                console.error(err);
                const message =
                    err?.message ||
                    "Failed to load calendar data";
                setError(message);
                toast.error(message);
            } finally {
                setLoading(false);
            }
        };

        load();
    }, []);

    useEffect(() => {
        const handleEscape = (event) => {
            if (event.key === "Escape") {
                setSearch("");
                searchRef.current?.blur();
            }
        };

        window.addEventListener("keydown", handleEscape);
        return () => {
            window.removeEventListener("keydown", handleEscape);
        };
    }, []);

    const handleRefresh = async () => {
        try {
            setRefreshing(true);
            setError("");
            await fetchCalendarData();
            toast.success(
                "Calendar data synchronized successfully"
            );
        } catch (err) {
            console.error(err);
            toast.error(
                err?.message ||
                "Failed to refresh calendar"
            );
        } finally {
            setRefreshing(false);
        }
    };

    const today = todayKey();

    const todaysTests = useMemo(() => {
        return tests
            .filter((test) => test.date === today)
            .sort((a, b) =>
                a.name.localeCompare(b.name)
            );
    }, [tests, today]);

    const upcomingTests = useMemo(() => {
        return tests
            .filter((test) => test.date >= today)
            .sort((a, b) =>
                a.date.localeCompare(b.date)
            );
    }, [tests, today]);

    const filteredTests = useMemo(() => {
        const query = normalizeTextForMatch(search);

        if (!query) {
            return upcomingTests;
        }

        const words = query
            .split(/\s+/)
            .filter(Boolean);

        return upcomingTests.filter((test) => {
            const haystack = normalizeTextForMatch(
                test.searchableText
            );

            return words.every((word) =>
                haystack.includes(word)
            );
        });
    }, [upcomingTests, search]);

    const allMatchingTests = useMemo(() => {
        const query = normalizeTextForMatch(search);

        if (!query) {
            return tests;
        }

        const words = query
            .split(/\s+/)
            .filter(Boolean);

        return tests.filter((test) => {
            const haystack = normalizeTextForMatch(
                test.searchableText
            );

            return words.every((word) =>
                haystack.includes(word)
            );
        });
    }, [tests, search]);

    const batchCount = useMemo(() => {
        return new Set(
            tests
                .map((test) => test.batch)
                .filter(
                    (batch) =>
                        batch &&
                        batch !== "All"
                )
        ).size;
    }, [tests]);

    const phaseCount = useMemo(() => {
        return new Set(
            tests
                .map((test) => test.phase)
                .filter(
                    (phase) =>
                        phase &&
                        phase !== "ALL"
                )
        ).size;
    }, [tests]);

    const jeeCount = useMemo(() => {
        return tests.filter(
            (test) => test.exam === "JEE"
        ).length;
    }, [tests]);

    const neetCount = useMemo(() => {
        return tests.filter(
            (test) => test.exam === "NEET"
        ).length;
    }, [tests]);

    const typeStats = useMemo(() => {
        const map = {};

        tests.forEach((test) => {
            map[test.type] =
                (map[test.type] || 0) + 1;
        });

        return Object.entries(map)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5);
    }, [tests]);

    const subjectStats = useMemo(() => {
        const map = {};

        tests.forEach((test) => {
            test.subjects.forEach((subject) => {
                map[subject] =
                    (map[subject] || 0) + 1;
            });
        });

        return Object.entries(map)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 6);
    }, [tests]);

    const monthlyStats = useMemo(() => {
        const map = {};

        tests.forEach((test) => {
            const date = parseDateKey(test.date);

            if (!date) return;

            const key =
                date.toLocaleDateString("en-IN", {
                    month: "short",
                    year: "numeric",
                });

            map[key] =
                (map[key] || 0) + 1;
        });

        return Object.entries(map).slice(-6);
    }, [tests]);

    const nextTest = upcomingTests[0];

    if (loading) {
        return (
            <div className="flex min-h-[80vh] items-center justify-center">
                <div className="text-center">
                    <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl glass-card text-white">
                        <CalendarDays
                            className="animate-pulse"
                            size={25}
                        />
                    </div>

                    <h2 className="text-xl font-bold">
                        Loading PW Calendar
                    </h2>

                    <p className="mt-1 text-sm text-slate-400">
                        Syncing planner data...
                    </p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex min-h-[70vh] items-center justify-center">
                <div className="w-full max-w-lg rounded-3xl glass-card p-8 text-center">
                    <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-500/10 text-rose-400">
                        <Activity size={25} />
                    </div>

                    <h2 className="text-xl font-bold text-white">
                        Calendar connection failed
                    </h2>

                    <p className="mt-2 text-sm text-slate-400">
                        {error}
                    </p>

                    <Button
                        onClick={handleRefresh}
                        className="mt-6 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl magnetic-btn"
                    >
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Try Again
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen space-y-7 p-2">

            {/* HERO */}

            <section className="relative overflow-hidden rounded-[28px] glass-card px-7 py-7 text-white shadow-2xl">

                <div className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full bg-indigo-500/15 blur-3xl" />

                <div className="pointer-events-none absolute -bottom-32 left-1/3 h-64 w-64 rounded-full bg-violet-500/15 blur-3xl" />

                <div className="relative flex flex-col justify-between gap-6 md:flex-row md:items-center">

                    <div>
                        <div className="mb-3 flex items-center gap-2">
                            <span className="inline-flex items-center gap-1.5 rounded-full border border-indigo-400/20 bg-indigo-500/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-indigo-300">
                                <Sparkles size={12} />
                                Planner Overview {isAdmin && "(Admin)"}
                            </span>
                        </div>

                        <h1 className="!m-0 text-3xl font-bold tracking-tight text-white md:text-4xl">
                            PW Calendar Dashboard
                        </h1>

                        <p className="mt-2 max-w-2xl text-sm text-slate-400">
                            Live overview of tests, batches,
                            phases and exam schedules from
                            the Calendar planner.
                        </p>
                    </div>

                    <Button
                        onClick={handleRefresh}
                        disabled={refreshing}
                        className="shrink-0 rounded-xl bg-white/[0.08] border border-white/10 text-white hover:bg-white/[0.15] backdrop-blur-md transition-all magnetic-btn cursor-pointer"
                    >
                        <RefreshCw
                            className={
                                refreshing
                                    ? "mr-2 h-4 w-4 animate-spin"
                                    : "mr-2 h-4 w-4"
                            }
                        />

                        {refreshing
                            ? "Syncing..."
                            : "Refresh Planner"}
                    </Button>
                </div>
            </section>

            {/* KPI */}

            <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">

                <MetricCard
                    icon={CalendarDays}
                    label="Total Tests"
                    value={tests.length}
                    detail="Planner records"
                    iconClass="text-indigo-400 bg-indigo-500/10 border border-indigo-500/20"
                />

                <MetricCard
                    icon={Clock3}
                    label="Today"
                    value={todaysTests.length}
                    detail="Tests scheduled today"
                    iconClass="text-amber-400 bg-amber-500/10 border border-amber-500/20"
                />

                <MetricCard
                    icon={Layers3}
                    label="Phases"
                    value={phaseCount}
                    detail="Active phase groups"
                    iconClass="text-violet-400 bg-violet-500/10 border border-violet-500/20"
                />

                <MetricCard
                    icon={Users}
                    label="Batches"
                    value={batchCount}
                    detail="Detected target batches"
                    iconClass="text-emerald-400 bg-emerald-500/10 border border-emerald-500/20"
                />

                <MetricCard
                    icon={Target}
                    label="Upcoming"
                    value={upcomingTests.length}
                    detail="Next planner records"
                    iconClass="text-rose-400 bg-rose-500/10 border border-rose-500/20"
                />
            </section>

            {/* SEARCH */}

            <section className="rounded-2xl glass-card p-4">

                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

                    <div>
                        <div className="flex items-center gap-2">
                            <p className="text-sm font-semibold text-slate-200">
                                Planner Search
                            </p>

                            {search && (
                                <Badge
                                    variant="secondary"
                                    className="rounded-lg bg-indigo-500/20 text-indigo-300 border border-indigo-500/30"
                                >
                                    {allMatchingTests.length} matches
                                </Badge>
                            )}
                        </div>

                        <p className="text-xs text-slate-400">
                            Search tests, batches, phases,
                            exams, subjects or any planner field.
                        </p>
                    </div>

                    <div className="relative w-full lg:w-[430px]">

                        <Search
                            size={17}
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                        />

                        <input
                            ref={searchRef}
                            value={search}
                            onChange={(event) =>
                                setSearch(event.target.value)
                            }
                            placeholder="Search test, batch, JEE, NEET, Physics..."
                            className="h-11 w-full rounded-xl border border-slate-800 bg-black/40 pl-10 pr-20 text-sm text-white outline-none transition focus:border-indigo-400 focus:bg-black/60 focus:ring-2 focus:ring-indigo-500/20"
                        />

                        {search ? (
                            <button
                                type="button"
                                onClick={() => setSearch("")}
                                className="absolute right-3 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-lg text-slate-400 transition hover:bg-white/10 hover:text-white cursor-pointer magnetic-btn"
                                aria-label="Clear search"
                            >
                                <X size={15} />
                            </button>
                        ) : (
                            <kbd className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md border border-slate-700 bg-black/50 px-1.5 py-0.5 text-[10px] font-semibold text-slate-400 shadow-sm">
                                Ctrl K
                            </kbd>
                        )}
                    </div>
                </div>

                {search && (
                    <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-slate-800/80 pt-4">

                        <span className="text-xs text-slate-400">
                            Searching for
                        </span>

                        <span className="rounded-lg bg-indigo-500/10 border border-indigo-500/20 px-2.5 py-1 text-xs font-semibold text-indigo-300">
                            "{search}"
                        </span>

                        <span className="text-xs text-slate-400">
                            in {tests.length} planner records
                        </span>
                    </div>
                )}
            </section>

            {/* SEARCH RESULT SUMMARY */}

            {search && (
                <section className="rounded-3xl border border-indigo-500/20 bg-indigo-500/5 p-5 backdrop-blur-xl glass-card">

                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

                        <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-indigo-400">
                                Search Results
                            </p>

                            <h2 className="mt-1 text-xl font-bold text-white">
                                {allMatchingTests.length} matching planner records
                            </h2>

                            <p className="mt-1 text-xs text-slate-400">
                                Matching across test names, batches,
                                subjects, dates and raw planner data.
                            </p>
                        </div>

                        <Button
                            variant="outline"
                            onClick={() => setSearch("")}
                            className="rounded-xl bg-white/5 border-white/10 text-white hover:bg-white/10 cursor-pointer magnetic-btn"
                        >
                            <X className="mr-2 h-4 w-4" />
                            Clear Search
                        </Button>
                    </div>
                </section>
            )}

            {/* TODAY + NEXT */}

            {!search && (
                <section className="grid gap-6 xl:grid-cols-[1.45fr_.9fr]">

                    <div className="rounded-3xl glass-card p-6">

                        <div className="mb-6 flex items-center justify-between">

                            <div className="flex items-center gap-2">

                                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
                                    <CalendarDays size={18} />
                                </span>

                                <div>
                                    <h2 className="!m-0 text-lg font-bold text-white">
                                        Today's Planner
                                    </h2>

                                    <p className="text-xs text-slate-400">
                                        {formatDate(today)}
                                    </p>
                                </div>
                            </div>

                            <Badge
                                variant="secondary"
                                className="rounded-lg bg-white/5 border border-white/10 text-slate-300"
                            >
                                {todaysTests.length} tests
                            </Badge>
                        </div>

                        {todaysTests.length === 0 ? (
                            <EmptyState
                                icon={CalendarDays}
                                title="No tests today"
                                description="The planner has no test scheduled for today."
                            />
                        ) : (
                            <div className="space-y-3">
                                {todaysTests
                                    .slice(0, 6)
                                    .map((test) => (
                                        <TestRow
                                            key={test.id}
                                            test={test}
                                        />
                                    ))}
                            </div>
                        )}
                    </div>

                    <div className="rounded-3xl border border-indigo-500/30 bg-[#060810] p-6 text-white shadow-xl relative overflow-hidden glass-card">
                        <div className="absolute top-0 right-0 h-40 w-40 rounded-full bg-indigo-600/10 blur-3xl pointer-events-none" />

                        <div className="flex items-center gap-2">

                            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-500/15 border border-indigo-500/30 text-indigo-300">
                                <Zap size={18} />
                            </span>

                            <div>
                                <p className="text-xs font-semibold uppercase tracking-[0.15em] text-slate-400">
                                    Next Up
                                </p>

                                <h2 className="!m-0 text-lg font-bold text-white">
                                    Upcoming Test
                                </h2>
                            </div>
                        </div>

                        {nextTest ? (
                            <div className="mt-8">

                                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-indigo-400">
                                    {formatDate(nextTest.date)}
                                </p>

                                <h3 className="mt-3 text-2xl font-bold leading-tight text-white">
                                    {nextTest.name}
                                </h3>

                                <div className="mt-5 flex flex-wrap gap-2">
                                    <DarkTag>
                                        {nextTest.type}
                                    </DarkTag>

                                    <DarkTag>
                                        {nextTest.exam}
                                    </DarkTag>

                                    <DarkTag>
                                        {nextTest.batch}
                                    </DarkTag>

                                    {nextTest.phase !== "ALL" && (
                                        <DarkTag>
                                            {nextTest.phase}
                                        </DarkTag>
                                    )}
                                </div>

                                <div className="mt-7 border-t border-white/[0.08] pt-5">

                                    <p className="text-xs text-slate-400">
                                        Subjects detected
                                    </p>

                                    <div className="mt-2 flex flex-wrap gap-2">

                                        {nextTest.subjects.length > 0 ? (
                                            nextTest.subjects.map(
                                                (subject) => (
                                                    <span
                                                        key={subject}
                                                        className="rounded-lg border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[11px] text-slate-300"
                                                    >
                                                        {subject}
                                                    </span>
                                                )
                                            )
                                        ) : (
                                            <span className="text-xs text-slate-500">
                                                Subject data unavailable
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="mt-8">
                                <p className="text-sm text-slate-400">
                                    No upcoming tests found.
                                </p>
                            </div>
                        )}
                    </div>
                </section>
            )}

            {/* SEARCH RESULTS / UPCOMING */}

            <section className="rounded-3xl glass-card p-6">

                <div className="mb-6 flex items-center justify-between">

                    <div>
                        <h2 className="!m-0 text-lg font-bold text-white">
                            {search
                                ? "Matching Tests"
                                : "Upcoming Tests"}
                        </h2>

                        <p className="text-xs text-slate-400">
                            {search
                                ? `Results for "${search}"`
                                : "Next scheduled planner records"}
                        </p>
                    </div>

                    <span className="text-xs font-semibold text-slate-400">
                        {filteredTests.length} records
                    </span>
                </div>

                {filteredTests.length === 0 ? (
                    <EmptyState
                        icon={Search}
                        title={
                            search
                                ? "No matching tests"
                                : "No upcoming tests"
                        }
                        description={
                            search
                                ? "Try searching by test name, batch, JEE, NEET, subject, phase or date."
                                : "No upcoming planner records were found."
                        }
                    />
                ) : (
                    <div className="divide-y divide-slate-800/80">

                        {filteredTests
                            .slice(0, 20)
                            .map((test) => (
                                <TestListRow
                                    key={test.id}
                                    test={test}
                                    search={search}
                                />
                            ))}

                    </div>
                )}

                {filteredTests.length > 20 && (
                    <div className="mt-5 rounded-xl bg-white/[0.03] border border-slate-800 p-3 text-center text-xs font-medium text-slate-400">
                        Showing first 20 of{" "}
                        {filteredTests.length} matching records
                    </div>
                )}
            </section>

            {/* EXAM SPLIT */}

            {!search && (
                <section className="grid gap-4 md:grid-cols-2">

                    <ExamCard
                        title="JEE Planner"
                        value={jeeCount}
                        total={tests.length}
                        description="JEE test records"
                        icon="JEE"
                    />

                    <ExamCard
                        title="NEET Planner"
                        value={neetCount}
                        total={tests.length}
                        description="NEET test records"
                        icon="NEET"
                    />
                </section>
            )}

            {/* ANALYTICS */}

            {!search && (
                <section className="grid gap-6 lg:grid-cols-2">

                    <AnalyticsCard
                        title="Test Type Distribution"
                        subtitle="How the planner is distributed"
                    >
                        {typeStats.length === 0 ? (
                            <EmptyMini />
                        ) : (
                            <div className="space-y-4">

                                {typeStats.map(
                                    ([type, count]) => {
                                        const percentage =
                                            tests.length > 0
                                                ? Math.round(
                                                    (count /
                                                        tests.length) *
                                                    100
                                                )
                                                : 0;

                                        const meta =
                                            TYPE_META[type] || {
                                                color: "#64748b",
                                            };

                                        return (
                                            <div key={type}>

                                                <div className="mb-1.5 flex items-center justify-between">

                                                    <span className="text-sm font-medium text-slate-300">
                                                        {type}
                                                    </span>

                                                    <span className="text-xs font-semibold text-slate-400">
                                                        {count} · {percentage}%
                                                    </span>
                                                </div>

                                                <div className="h-2 overflow-hidden rounded-full bg-slate-800/80">

                                                    <div
                                                        className="h-full rounded-full transition-all"
                                                        style={{
                                                            width: `${percentage}%`,
                                                            backgroundColor:
                                                                meta.color,
                                                            boxShadow: `0 0 10px ${meta.color}`,
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                        );
                                    }
                                )}
                            </div>
                        )}
                    </AnalyticsCard>

                    <AnalyticsCard
                        title="Subject Coverage"
                        subtitle="Subjects detected from planner records"
                    >
                        {subjectStats.length === 0 ? (
                            <EmptyMini />
                        ) : (
                            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">

                                {subjectStats.map(
                                    ([subject, count]) => (
                                        <div
                                            key={subject}
                                            className="rounded-2xl border border-slate-800 bg-white/[0.02] p-4"
                                        >
                                            <p className="truncate text-xs font-semibold text-slate-400">
                                                {subject}
                                            </p>

                                            <p className="mt-1 text-2xl font-bold text-white">
                                                {count}
                                            </p>

                                            <p className="text-[10px] text-slate-500">
                                                test records
                                            </p>
                                        </div>
                                    )
                                )}
                            </div>
                        )}
                    </AnalyticsCard>
                </section>
            )}

            {/* MONTHLY ACTIVITY */}

            {!search && (
                <section className="rounded-3xl glass-card p-6">

                    <div className="mb-6">
                        <h2 className="!m-0 text-lg font-bold text-white">
                            Planner Activity
                        </h2>

                        <p className="text-xs text-slate-400">
                            Test distribution across available calendar months
                        </p>
                    </div>

                    {monthlyStats.length === 0 ? (
                        <EmptyMini />
                    ) : (
                        <div className="flex h-48 items-end gap-3 overflow-x-auto pb-1">

                            {monthlyStats.map(
                                ([month, count]) => {

                                    const max = Math.max(
                                        ...monthlyStats.map(
                                            ([, value]) => value
                                        )
                                    );

                                    const height = max > 0 ? Math.max(35, (count / max) * 100) : 35;

                                    return (
                                        <div
                                            key={month}
                                            className="flex min-w-[48px] flex-1 flex-col items-center justify-end gap-2"
                                        >
                                            <span className="text-xs font-semibold text-indigo-400">
                                                {count}
                                            </span>

                                            <div
                                                className="w-full max-w-[58px] rounded-t-xl bg-gradient-to-t from-indigo-600 to-violet-500 shadow-[0_0_15px_rgba(99,102,241,0.3)] transition-all"
                                                style={{
                                                    height: `${height}%`,
                                                }}
                                            />

                                            <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                                                {month}
                                            </span>
                                        </div>
                                    );
                                }
                            )}
                        </div>
                    )}
                </section>
            )}

            {/* FOOTER */}

            <div className="flex flex-col gap-3 rounded-2xl glass-card px-5 py-4 sm:flex-row sm:items-center sm:justify-between">

                <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,.55)]" />

                    <span className="text-xs font-semibold text-slate-300">
                        Planner connected {isAdmin && "• Admin Session Active"}
                    </span>
                </div>

                <p className="text-xs text-slate-500">
                    Source: PW Calendar /schedule
                </p>
            </div>
        </div>
    );
}

/* =========================================================
   METRIC CARD
========================================================= */

function MetricCard({
    icon: Icon,
    label,
    value,
    detail,
    iconClass,
}) {
    return (
        <div className="rounded-3xl glass-card p-5">

            <div className="flex items-start justify-between">

                <span
                    className={`flex h-10 w-10 items-center justify-center rounded-xl ${iconClass}`}
                >
                    <Icon size={19} />
                </span>

                <span className="text-2xl font-bold text-white">
                    {value}
                </span>
            </div>

            <p className="mt-4 text-sm font-semibold text-slate-200">
                {label}
            </p>

            <p className="mt-1 text-xs text-slate-400">
                {detail}
            </p>
        </div>
    );
}

/* =========================================================
   TEST ROW
========================================================= */

function TestRow({ test }) {
    return (
        <div className="rounded-2xl border border-slate-800 bg-white/[0.02] p-4 transition hover:border-indigo-500/40 hover:bg-white/[0.05]">

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

                <div className="min-w-0">

                    <div className="mb-1 flex flex-wrap items-center gap-2">

                        <span className="rounded-md bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 text-[10px] font-bold text-indigo-300">
                            {test.exam}
                        </span>

                        <span className="text-xs text-slate-400">
                            {formatDay(test.date)}
                        </span>
                    </div>

                    <h3 className="truncate text-sm font-bold text-white">
                        {test.name}
                    </h3>

                    <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-slate-400">

                        <span>{test.type}</span>

                        <span>•</span>

                        <span>{test.batch}</span>

                        {test.phase !== "ALL" && (
                            <>
                                <span>•</span>
                                <span>{test.phase}</span>
                            </>
                        )}
                    </div>
                </div>

                <div className="flex flex-wrap gap-1.5">

                    {test.subjects
                        .slice(0, 4)
                        .map((subject) => (
                            <span
                                key={subject}
                                className="rounded-lg border border-slate-800 bg-white/[0.04] px-2 py-1 text-[10px] font-medium text-slate-300 shadow-sm"
                            >
                                {subject}
                            </span>
                        ))}
                </div>
            </div>
        </div>
    );
}

/* =========================================================
   TEST LIST ROW
========================================================= */

function TestListRow({ test, search }) {
    return (
        <div className="group py-5">

            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

                <div className="flex min-w-0 items-start gap-4">

                    <div className="hidden h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/[0.04] border border-slate-800 text-slate-300 sm:flex">
                        <CalendarDays size={18} />
                    </div>

                    <div className="min-w-0">

                        <div className="flex flex-wrap items-center gap-2">

                            <span className="rounded-md bg-indigo-600 px-2 py-0.5 text-[10px] font-bold text-white">
                                {test.exam}
                            </span>

                            <span className="text-xs font-medium text-slate-400">
                                {formatDate(test.date)}
                            </span>

                            {search &&
                                test.subjects.map(
                                    (subject) => (
                                        <span
                                            key={subject}
                                            className="rounded-md bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 text-[10px] font-semibold text-indigo-300"
                                        >
                                            {subject}
                                        </span>
                                    )
                                )}
                        </div>

                        <h3 className="mt-2 truncate text-sm font-bold text-white">
                            {test.name}
                        </h3>

                        <p className="mt-1 text-xs text-slate-400">
                            {test.batch} · {test.type}
                        </p>

                        {test.phase !== "ALL" && (
                            <span className="mt-2 inline-flex rounded-lg bg-violet-500/10 border border-violet-500/20 px-2 py-1 text-[10px] font-semibold text-violet-300">
                                {test.phase}
                            </span>
                        )}
                    </div>
                </div>

                <div className="flex shrink-0 items-center gap-3">

                    <div className="text-right">

                        <p className="text-xs font-semibold text-slate-300">
                            {formatDay(test.date)}
                        </p>

                        <p className="mt-1 max-w-[280px] truncate text-[10px] text-slate-400">
                            {test.subjects.length
                                ? test.subjects.join(" · ")
                                : "Subjects not specified"}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

/* =========================================================
   EXAM CARD
========================================================= */

function ExamCard({
    title,
    value,
    total,
    description,
    icon,
}) {
    const percentage =
        total > 0
            ? Math.round(
                (value / total) * 100
            )
            : 0;

    return (
        <div className="rounded-3xl glass-card p-6">

            <div className="flex items-start justify-between">

                <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.15em] text-slate-400">
                        {icon}
                    </p>

                    <h3 className="mt-2 text-lg font-bold text-white">
                        {title}
                    </h3>

                    <p className="mt-1 text-xs text-slate-400">
                        {description}
                    </p>
                </div>

                <span className="rounded-xl border border-indigo-500/30 bg-indigo-500/10 px-3 py-2 text-xs font-bold text-indigo-300">
                    {percentage}%
                </span>
            </div>

            <div className="mt-6 flex items-end justify-between">

                <p className="text-4xl font-bold text-white">
                    {value}
                </p>

                <p className="text-xs text-slate-400">
                    of {total}
                </p>
            </div>

            <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-800">

                <div
                    className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]"
                    style={{
                        width: `${percentage}%`,
                    }}
                />
            </div>
        </div>
    );
}

/* =========================================================
   ANALYTICS CARD
========================================================= */

function AnalyticsCard({
    title,
    subtitle,
    children,
}) {
    return (
        <div className="rounded-3xl glass-card p-6">

            <div className="mb-6">
                <h2 className="!m-0 text-lg font-bold text-white">
                    {title}
                </h2>

                <p className="text-xs text-slate-400">
                    {subtitle}
                </p>
            </div>

            {children}
        </div>
    );
}

/* =========================================================
   DARK TAG
========================================================= */

function DarkTag({ children }) {
    return (
        <span className="rounded-lg border border-white/[0.08] bg-white/[0.06] px-2.5 py-1 text-[10px] font-semibold text-slate-300">
            {children}
        </span>
    );
}

/* =========================================================
   EMPTY STATE
========================================================= */

function EmptyState({
    icon: Icon,
    title,
    description,
}) {
    return (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-800 bg-white/[0.01] px-6 py-12 text-center">

            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-white/5 border border-slate-800 text-slate-400 shadow-sm">
                <Icon size={20} />
            </div>

            <h3 className="text-sm font-bold text-slate-200">
                {title}
            </h3>

            <p className="mt-1 max-w-md text-xs text-slate-400">
                {description}
            </p>
        </div>
    );
}

/* =========================================================
   EMPTY MINI
========================================================= */

function EmptyMini() {
    return (
        <div className="rounded-2xl border border-dashed border-slate-800 bg-white/[0.01] p-8 text-center text-xs text-slate-400">
            No planner data available.
        </div>
    );
}

/* =========================================================
   EXPORT
========================================================= */

export default Dashboard;