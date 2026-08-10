import api from "@/api/axios";
import { useEffect, useState, useMemo, useRef } from "react";
import { ClipboardList, Search, RefreshCw, X, AlertCircle, BookOpen, Sparkles, Eye, Cpu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

// Complete mapping of all possible keys from Apps Script JSON for each subject
const SUBJECT_MAPPING = {
    "Physics": ["phy", "physics", "Physics"],
    "Chemistry": ["chem", "chemistry", "Chemistry", "chem-roi", "Chemistry - ROI"],
    "Math": ["math", "mathematics", "Math"],
    "Chem-KPM": ["chemKPM", "chem-kpm", "Chemistry - KPM"],
    "Botany": ["bot", "botany", "Botany"],
    "Zoology": ["zoo", "zoology", "Zoology"]
};

function clean(value) {
    if (value === null || value === undefined) return "";
    return String(value).trim();
}

function lower(value) {
    return clean(value).toLowerCase();
}

function flattenPayload(payload) {
    if (Array.isArray(payload)) return payload;
    if (!payload || typeof payload !== "object") return [];
    const candidates = [payload.data, payload.records, payload.results, payload.rows, payload.schedule, payload.tests, payload.planner, payload.items];
    for (const candidate of candidates) {
        if (Array.isArray(candidate)) return candidate;
    }
    return Object.values(payload).flatMap((value) => (Array.isArray(value) ? value : []));
}

function normalizeDate(value) {
    const raw = clean(value);
    if (!raw) return null;
    const parsed = new Date(raw);
    if (Number.isNaN(parsed.getTime())) return null;
    const y = parsed.getFullYear();
    const m = String(parsed.getMonth() + 1).padStart(2, "0");
    const d = String(parsed.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
}

function parseDate(key) {
    if (!key) return null;
    const [y, m, d] = key.split("-").map(Number);
    if (!y || !m || !d) return null;
    return new Date(y, m - 1, d);
}

export default function Tests() {
    const [tests, setTests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [errorMsg, setErrorMsg] = useState(null);
    const [search, setSearch] = useState("");
    const [selectedTest, setSelectedTest] = useState(null);

    // Admin Check based on local storage email
    const userEmail = localStorage.getItem("user_email");
    const adminEmails = ["abishek.katwal@pw.live", "abhishek20.katwal@gmail.com"];
    const isAdmin = adminEmails.includes(userEmail);

    // --- CODEPEN MAGIC: Holographic Tilt, Mouse Spotlight & Magnetic Buttons ---
    useEffect(() => {
        const handleMouseMove = (e) => {
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

    const loadTests = async (isRefresh = false) => {
        try {
            if (isRefresh) setRefreshing(true);
            else setLoading(true);
            setErrorMsg(null);

            const res = await api.get("/schedule");
            const data = res.data;
            const rows = flattenPayload(data);

            const formatted = rows.map((row, index) => {
                if (!row || typeof row !== "object") return null;
                const date = normalizeDate(row.date || row.testDate) || "2026-05-10";
                const type = row.type || row.testName || "Milestone Test";
                const div = row.div || row.exam || "JEE";
                const batchClass = row.batch || "11th";
                const exam = lower(div + " " + batchClass).includes("neet") ? "NEET" : "JEE";

                const syllabus = {};
                Object.entries(SUBJECT_MAPPING).forEach(([subjectName, keys]) => {
                    for (const key of keys) {
                        const val = clean(row[key]);
                        if (val) {
                            syllabus[subjectName] = val;
                            break;
                        }
                    }
                });

                return {
                    id: `${date}-${index}`,
                    date,
                    name: type,
                    no: row.no || "1",
                    exam,
                    batch: `${batchClass} ${div}`,
                    type,
                    phase: row.phase || "ALL",
                    pattern: row.pattern || "Main",
                    syllabus,
                    raw: row
                };
            }).filter(Boolean);

            setTests(formatted);
            if (isRefresh) toast.success("Tests synchronized successfully!");
        } catch (err) {
            console.error("Fetch error:", err);
            setErrorMsg(err.message);
            toast.error("Failed to load tests. Unauthorized or connection error.");
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        loadTests();
    }, []);

    const filteredTests = useMemo(() => {
        return tests.filter(t => {
            const query = search.toLowerCase();
            const matchName = t.name.toLowerCase().includes(query) || t.no.toLowerCase().includes(query);
            const matchBatch = t.batch.toLowerCase().includes(query);
            const matchExam = t.exam.toLowerCase().includes(query);
            const matchDate = t.date.toLowerCase().includes(query);
            const matchPattern = t.pattern.toLowerCase().includes(query);

            return matchName || matchBatch || matchExam || matchDate || matchPattern;
        });
    }, [tests, search]);

    return (
        <div className="p-6 space-y-7 text-slate-100 max-w-[1600px] mx-auto min-h-screen relative">

            {/* --- CYBER SCANNER ORB HEADER --- */}
            <div className="relative w-full overflow-hidden h-9 pointer-events-none mb-[-8px] flex items-center">
                <div className="absolute left-0 flex items-center gap-2.5 px-3.5 py-1 rounded-full bg-indigo-500/10 border border-indigo-400/30 text-indigo-300 shadow-[0_0_20px_rgba(99,102,241,0.3)] animate-tech-walk z-20 backdrop-blur-md">
                    <Cpu size={14} className="animate-spin text-indigo-400" />
                    <span className="text-[9px] font-extrabold uppercase tracking-widest text-indigo-200">
                        ⚡ SCHEDULER ENGINE // ACTIVE PROTOCOL
                    </span>
                </div>
            </div>

            {/* HERO BANNER */}
            <section className="relative overflow-hidden rounded-[28px] border border-slate-800 bg-[#090b12] px-7 py-7 shadow-xl glass-card">
                <div className="absolute -right-24 -top-28 h-80 w-80 rounded-full bg-cyan-500/10 blur-3xl" />
                <div className="relative flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
                    <div>
                        <div className="mb-3 flex items-center gap-2">
                            <span className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-500/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-cyan-300">
                                <Sparkles size={12} /> Examination Cell {isAdmin && "(Admin Mode)"}
                            </span>
                        </div>
                        <h1 className="text-3xl font-bold tracking-tight text-white md:text-4xl">Test Planner & Directory</h1>
                        <p className="mt-2 max-w-2xl text-sm text-slate-400">
                            Centralized repository for all scheduled JEE & NEET test assessments with complete syllabus breakdowns.
                        </p>
                    </div>

                    <Button
                        onClick={() => loadTests(true)}
                        disabled={refreshing}
                        className="rounded-xl bg-cyan-500 text-slate-950 hover:bg-cyan-400 shadow-lg shadow-cyan-500/20 cursor-pointer font-bold magnetic-btn"
                    >
                        <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
                        {refreshing ? "Syncing..." : "Sync Tests"}
                    </Button>
                </div>
            </section>

            {errorMsg && (
                <div className="bg-rose-500/10 border border-rose-500/20 p-4 rounded-2xl flex items-center gap-3 text-rose-400 text-xs glass-card">
                    <AlertCircle size={18} />
                    <span>Connection Warning: {errorMsg}</span>
                </div>
            )}

            {/* SEARCH BAR */}
            <div className="rounded-3xl border border-slate-800/80 bg-[#0d111a] p-5 shadow-lg flex items-center gap-3 glass-card">
                <Search size={18} className="text-cyan-400" />
                <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search by test name, date (YYYY-MM-DD), batch, or pattern..."
                    className="bg-transparent border-none outline-none w-full text-sm text-slate-200 placeholder:text-slate-500"
                />
                {search && (
                    <button onClick={() => setSearch("")} className="text-xs text-slate-400 hover:text-white cursor-pointer magnetic-btn">Clear</button>
                )}
            </div>

            {/* CONTENT LIST */}
            {loading ? (
                <div className="flex min-h-[40vh] items-center justify-center">
                    <div className="h-8 w-8 animate-spin rounded-full border-2 border-cyan-500 border-t-transparent" />
                </div>
            ) : filteredTests.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-slate-800 bg-[#090b12]/50 p-12 text-center glass-card">
                    <ClipboardList size={32} className="text-slate-600 mb-3" />
                    <h3 className="text-base font-bold text-slate-200">No tests found</h3>
                    <p className="mt-1 text-xs text-slate-500">Try searching with a different keyword or date format.</p>
                </div>
            ) : (
                <div className="grid gap-3">
                    {filteredTests.slice(0, 50).map((t) => (
                        <div
                            key={t.id}
                            onClick={() => setSelectedTest(t)}
                            className="group bg-[#0d111a] border border-slate-800/80 p-4 rounded-2xl flex justify-between items-center hover:border-cyan-500/40 hover:bg-white/[0.02] cursor-pointer transition shadow-md glass-card"
                        >
                            <div className="flex items-center gap-4">
                                <div className="flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-2xl bg-slate-900 border border-slate-800 text-cyan-400 font-bold">
                                    <span className="text-[9px] uppercase text-slate-500">
                                        {parseDate(t.date)?.toLocaleDateString("en-IN", { month: "short" })}
                                    </span>
                                    <span className="text-sm font-bold text-white leading-none">
                                        {parseDate(t.date)?.getDate()}
                                    </span>
                                </div>
                                <div>
                                    <div className="flex gap-2 items-center mb-1">
                                        <span className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded border ${t.exam === 'NEET' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'}`}>
                                            {t.exam}
                                        </span>
                                        <span className="text-xs text-slate-400">{t.batch}</span>
                                        <span className="text-[10px] bg-slate-900 border border-slate-800 text-slate-300 px-2 py-0.5 rounded">Phase {t.phase}</span>
                                    </div>
                                    <h3 className="text-sm font-bold text-white group-hover:text-cyan-300 transition">{t.name} #{t.no} ({t.pattern} Pattern)</h3>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="text-xs border border-slate-800 bg-slate-900/60 px-3 py-1 rounded-xl text-slate-300 font-semibold">{t.date}</span>
                                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-900 border border-slate-800 text-slate-400 group-hover:text-cyan-400 transition">
                                    <Eye size={14} />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* MODAL WITH ALL SUBJECTS SYLLABUS */}
            {selectedTest && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-md animate-in fade-in duration-200" onClick={() => setSelectedTest(null)}>
                    <div className="bg-[#090b12] border border-slate-800 w-full max-w-2xl max-h-[90vh] overflow-y-auto p-7 rounded-3xl space-y-6 shadow-2xl text-white glass-card" onClick={(e) => e.stopPropagation()}>
                        <div className="flex justify-between items-center border-b border-slate-800 pb-4">
                            <div>
                                <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest">Assessment & Syllabus Details</span>
                                <h2 className="text-xl font-bold mt-0.5">{selectedTest.name} #{selectedTest.no} ({selectedTest.pattern})</h2>
                            </div>
                            <button onClick={() => setSelectedTest(null)} className="text-slate-400 hover:text-white cursor-pointer p-1.5 rounded-xl bg-slate-900 border border-slate-800 magnetic-btn"><X size={18} /></button>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                            <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-3.5">
                                <span className="text-slate-500 block mb-1">Exam Stream</span>
                                <strong className="text-slate-200 text-sm">{selectedTest.exam}</strong>
                            </div>
                            <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-3.5">
                                <span className="text-slate-500 block mb-1">Scheduled Date</span>
                                <strong className="text-slate-200 text-sm">{selectedTest.date}</strong>
                            </div>
                            <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-3.5 col-span-2 sm:col-span-1">
                                <span className="text-slate-500 block mb-1">Target Batch</span>
                                <strong className="text-slate-200 text-sm">{selectedTest.batch}</strong>
                            </div>
                        </div>

                        {/* SUBJECT-WISE SYLLABUS BREAKDOWN */}
                        <div className="space-y-3">
                            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                                <BookOpen size={14} className="text-cyan-400" /> Subject-wise Syllabus
                            </h3>
                            {Object.keys(selectedTest.syllabus).length > 0 ? (
                                <div className="grid gap-3">
                                    {Object.entries(selectedTest.syllabus).map(([subj, text]) => (
                                        <div key={subj} className="rounded-2xl border border-slate-800/80 bg-[#0d111a] p-4 space-y-1.5 glass-card">
                                            <span className="text-[11px] font-extrabold text-cyan-400 uppercase tracking-wide">{subj}</span>
                                            <p className="text-xs text-slate-300 whitespace-pre-line leading-relaxed">{text}</p>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="rounded-2xl border border-slate-800/80 bg-slate-900/50 p-6 text-center text-xs text-slate-500">
                                    No detailed syllabus topics specified for this test record.
                                </div>
                            )}
                        </div>

                        <div className="flex justify-end pt-3 border-t border-slate-800">
                            <button onClick={() => setSelectedTest(null)} className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 px-6 py-2.5 rounded-xl text-xs font-bold cursor-pointer shadow-lg shadow-cyan-500/20 magnetic-btn">Close Details</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}