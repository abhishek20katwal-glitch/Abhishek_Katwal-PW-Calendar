import api from "@/api/axios";
import { useEffect, useState } from "react";
import {
    Users,
    Plus,
    Search,
    RefreshCw,
    Mail,
    Trash2,
    Edit3,
    X,
    AlertTriangle,
    Cpu
} from "lucide-react";
import { toast } from "sonner";

export default function Faculty() {
    const [facultyList, setFacultyList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [search, setSearch] = useState("");
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [currentFacultyId, setCurrentFacultyId] = useState(null);

    // Admin Check based on local storage email
    const userEmail = localStorage.getItem("user_email");
    const adminEmails = ["abishek.katwal@pw.live", "abhishek20.katwal@gmail.com"];
    const isAdmin = adminEmails.includes(userEmail);

    // Custom Delete Modal State
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [facultyToDelete, setFacultyToDelete] = useState(null);

    // Form States
    const [formData, setFormData] = useState({
        name: "",
        subject: "",
        email: ""
    });

    // --- CODEPEN MAGIC: Holographic Tilt & Magnetic Buttons ---
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

    const fetchFaculty = async (isRefresh = false) => {
        try {
            if (isRefresh) setRefreshing(true);
            else setLoading(true);

            const res = await api.get("/faculty");
            setFacultyList(res.data);
        } catch (err) {
            console.error(err);
            toast.error("Could not load faculty members.");
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchFaculty();
    }, []);

    const handleCreateFaculty = async (e) => {
        e.preventDefault();
        try {
            await api.post("/faculty", formData);
            toast.success("Faculty added successfully!");
            setIsAddOpen(false);
            setFormData({ name: "", subject: "", email: "" });
            fetchFaculty();
        } catch (err) {
            toast.error("Error adding faculty member. Unauthorized.");
        }
    };

    const handleUpdateFaculty = async (e) => {
        e.preventDefault();
        if (!currentFacultyId) return;
        try {
            await api.put(`/faculty/${currentFacultyId}`, formData);
            toast.success("Faculty updated successfully!");
            setIsEditOpen(false);
            setCurrentFacultyId(null);
            fetchFaculty();
        } catch (err) {
            toast.error("Error updating faculty details. Unauthorized.");
        }
    };

    const confirmDelete = async () => {
        if (!facultyToDelete) return;
        try {
            await api.delete(`/faculty/${facultyToDelete}`);
            toast.success("Faculty member removed!");
            setDeleteModalOpen(false);
            setFacultyToDelete(null);
            fetchFaculty();
        } catch (err) {
            toast.error("Error deleting faculty. Unauthorized.");
        }
    };

    const filteredFaculty = facultyList.filter(f =>
        f.name.toLowerCase().includes(search.toLowerCase()) ||
        f.subject.toLowerCase().includes(search.toLowerCase()) ||
        (f.email && f.email.toLowerCase().includes(search.toLowerCase()))
    );

    return (
        <div className="vp-page p-6 space-y-7 relative">

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
            <section className="relative overflow-hidden rounded-[28px] border border-slate-800 bg-[#090b12] px-7 py-7 text-white shadow-xl glass-card">
                <div className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full bg-violet-500/10 blur-3xl" />
                <div className="relative flex flex-col justify-between gap-6 md:flex-row md:items-center">
                    <div>
                        <div className="mb-3 flex items-center gap-2">
                            <span className="inline-flex items-center gap-1.5 rounded-full border border-violet-400/20 bg-violet-500/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-violet-300">
                                <Users size={12} /> Instructor Directory {isAdmin && "(Admin Mode)"}
                            </span>
                        </div>
                        <h1 className="!m-0 text-3xl font-bold tracking-tight text-white md:text-4xl">
                            Faculty Management
                        </h1>
                        <p className="mt-2 max-w-2xl text-sm text-slate-400">
                            Manage faculty members, academic teachers, subject mappings, and contact information.
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => fetchFaculty(true)}
                            className={`flex h-11 w-11 items-center justify-center rounded-xl border border-slate-800 bg-white/[0.04] text-slate-300 transition hover:bg-white/[0.08] magnetic-btn cursor-pointer ${refreshing ? "animate-spin" : ""}`}
                            title="Refresh Faculty"
                        >
                            <RefreshCw size={18} />
                        </button>

                        {isAdmin && (
                            <button
                                onClick={() => {
                                    setFormData({ name: "", subject: "", email: "" });
                                    setIsAddOpen(true);
                                }}
                                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-500 to-fuchsia-600 px-5 py-3 text-xs font-bold text-white shadow-lg shadow-violet-500/25 transition hover:opacity-95 magnetic-btn cursor-pointer"
                            >
                                <Plus size={16} /> Add New Faculty
                            </button>
                        )}
                    </div>
                </div>
            </section>

            {/* SEARCH BAR */}
            <section className="rounded-2xl border border-slate-800/60 bg-[#0d111a] p-4 shadow-sm backdrop-blur-xl glass-card">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div className="relative w-full md:w-[400px]">
                        <Search size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                        <input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search by faculty name, subject, email..."
                            className="h-11 w-full rounded-xl border border-slate-800 bg-slate-900/50 pl-10 pr-4 text-sm text-slate-200 outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20"
                        />
                    </div>
                    <div className="text-xs font-semibold text-slate-400">
                        Total Active Instructors: <span className="text-violet-400 font-bold">{facultyList.length}</span>
                    </div>
                </div>
            </section>

            {/* FACULTY GRID */}
            {loading ? (
                <div className="flex min-h-[40vh] items-center justify-center">
                    <div className="h-8 w-8 animate-spin rounded-full border-2 border-violet-500 border-t-transparent" />
                </div>
            ) : filteredFaculty.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-slate-800 bg-[#090b12]/50 p-12 text-center glass-card">
                    <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-500/10 text-violet-400">
                        <Users size={24} />
                    </div>
                    <h3 className="text-base font-bold text-slate-200">No faculty members found</h3>
                    <p className="mt-1 text-xs text-slate-500">Get started by adding a new instructor using the button above.</p>
                </div>
            ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {filteredFaculty.map((item) => (
                        <div
                            key={item.id}
                            className="group relative overflow-hidden rounded-2xl border border-slate-800/80 bg-[#0d111a] p-5 shadow-lg transition glass-card"
                        >
                            <div className="absolute top-0 right-0 h-24 w-24 rounded-full bg-violet-500/5 blur-2xl transition group-hover:bg-violet-500/10" />

                            <div className="flex items-start justify-between gap-4">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-violet-500/10 text-violet-400 font-bold text-base border border-violet-500/20">
                                        {item.name ? item.name.charAt(0).toUpperCase() : "F"}
                                    </div>
                                    <div>
                                        <h3 className="text-base font-bold text-slate-100 group-hover:text-violet-300 transition">
                                            {item.name}
                                        </h3>
                                        <span className="inline-flex items-center gap-1.5 rounded-md border border-slate-700/60 bg-slate-800/50 px-2 py-0.5 text-[10px] font-semibold text-slate-300 mt-1">
                                            {item.subject}
                                        </span>
                                    </div>
                                </div>

                                {isAdmin && (
                                    <div className="flex items-center gap-1 z-10 relative">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setCurrentFacultyId(item.id);
                                                setFormData({
                                                    name: item.name,
                                                    subject: item.subject,
                                                    email: item.email || ""
                                                });
                                                setIsEditOpen(true);
                                            }}
                                            className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white transition magnetic-btn cursor-pointer"
                                            title="Edit Faculty"
                                        >
                                            <Edit3 size={15} />
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setFacultyToDelete(item.id);
                                                setDeleteModalOpen(true);
                                            }}
                                            className="rounded-lg p-2 text-rose-400 hover:bg-rose-500/10 transition magnetic-btn cursor-pointer"
                                            title="Delete Faculty"
                                        >
                                            <Trash2 size={15} />
                                        </button>
                                    </div>
                                )}
                            </div>

                            <div className="mt-5 border-t border-slate-800/60 pt-4 text-xs text-slate-400">
                                <div className="flex items-center gap-2 truncate">
                                    <Mail size={14} className="text-slate-500 shrink-0" />
                                    <span className="truncate text-slate-300">{item.email || "No email provided"}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* ADD / EDIT MODAL DIALOG */}
            {isAdmin && (isAddOpen || isEditOpen) && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="relative w-full max-w-lg rounded-3xl border border-slate-800 bg-[#090b12] p-6 shadow-2xl glass-card">
                        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                            <h2 className="text-lg font-bold text-white">
                                {isAddOpen ? "Add New Faculty Member" : "Edit Faculty Details"}
                            </h2>
                            <button
                                onClick={() => { setIsAddOpen(false); setIsEditOpen(false); }}
                                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white cursor-pointer magnetic-btn"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <form onSubmit={isAddOpen ? handleCreateFaculty : handleUpdateFaculty} className="mt-5 space-y-4">
                            <div>
                                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">Faculty Name</label>
                                <input
                                    required
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="e.g. Saleem Sir"
                                    className="h-11 w-full rounded-xl border border-slate-800 bg-slate-900/50 px-4 text-sm text-slate-200 outline-none focus:border-violet-500"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">Subject Specialty</label>
                                <input
                                    required
                                    value={formData.subject}
                                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                                    placeholder="e.g. Physics"
                                    className="h-11 w-full rounded-xl border border-slate-800 bg-slate-900/50 px-4 text-sm text-slate-200 outline-none focus:border-violet-500"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">Email Address</label>
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    placeholder="teacher@example.com"
                                    className="h-11 w-full rounded-xl border border-slate-800 bg-slate-900/50 px-4 text-sm text-slate-200 outline-none focus:border-violet-500"
                                />
                            </div>

                            <div className="mt-6 flex justify-end gap-3 border-t border-slate-800 pt-4">
                                <button
                                    type="button"
                                    onClick={() => { setIsAddOpen(false); setIsEditOpen(false); }}
                                    className="rounded-xl border border-slate-800 px-4 py-2.5 text-xs font-semibold text-slate-300 hover:bg-slate-800 cursor-pointer magnetic-btn"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="rounded-xl bg-violet-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-violet-500 shadow-lg shadow-violet-600/20 cursor-pointer magnetic-btn"
                                >
                                    {isAddOpen ? "Save Faculty" : "Update Changes"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* PROFESSIONAL CUSTOM DELETE CONFIRMATION MODAL */}
            {isAdmin && deleteModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="relative w-full max-w-sm rounded-3xl border border-slate-800 bg-[#090b12] p-6 text-center shadow-2xl glass-card">
                        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-500/10 text-rose-500 border border-rose-500/20">
                            <AlertTriangle size={24} />
                        </div>
                        <h3 className="text-lg font-bold text-white">Delete Instructor?</h3>
                        <p className="mt-2 text-xs text-slate-400 leading-relaxed">
                            This action cannot be undone. This will permanently remove the instructor from the directory.
                        </p>
                        <div className="mt-6 flex gap-3">
                            <button
                                type="button"
                                onClick={() => { setDeleteModalOpen(false); setFacultyToDelete(null); }}
                                className="flex-1 rounded-xl border border-slate-800 py-2.5 text-xs font-semibold text-slate-300 hover:bg-slate-800 transition cursor-pointer magnetic-btn"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={confirmDelete}
                                className="flex-1 rounded-xl bg-rose-600 py-2.5 text-xs font-bold text-white hover:bg-rose-500 shadow-lg shadow-rose-600/20 transition cursor-pointer magnetic-btn"
                            >
                                Yes, Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}