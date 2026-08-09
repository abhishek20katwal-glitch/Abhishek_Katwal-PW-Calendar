import api from "@/api/axios";
import { useEffect, useState } from "react";
import {
    Layers3,
    Plus,
    Search,
    RefreshCw,
    Building2,
    Calendar,
    Trash2,
    Edit3,
    X,
    AlertTriangle
} from "lucide-react";
import { toast } from "sonner";

export default function Batches() {
    const [batches, setBatches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [search, setSearch] = useState("");
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [currentBatchId, setCurrentBatchId] = useState(null);

    // Admin Check based on local storage email
    const userEmail = localStorage.getItem("user_email");
    const adminEmails = ["abishek.katwal@pw.live", "abhishek20.katwal@gmail.com"];
    const isAdmin = adminEmails.includes(userEmail);

    // Custom Delete Modal State
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [batchToDelete, setBatchToDelete] = useState(null);

    // Form States
    const [formData, setFormData] = useState({
        batch_name: "",
        class_name: "",
        center: "",
        academic_year: "2026-27"
    });

    const fetchBatches = async (isRefresh = false) => {
        try {
            if (isRefresh) setRefreshing(true);
            else setLoading(true);

            // Using secured 'api' instance
            const res = await api.get("/batches");
            setBatches(res.data);
        } catch (err) {
            console.error(err);
            toast.error("Could not load batches from database.");
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchBatches();
    }, []);

    const handleCreateBatch = async (e) => {
        e.preventDefault();
        try {
            await api.post("/batches", formData);

            toast.success("Batch created successfully!");
            setIsAddOpen(false);
            setFormData({ batch_name: "", class_name: "", center: "", academic_year: "2026-27" });
            fetchBatches();
        } catch (err) {
            toast.error("Error creating batch. Unauthorized or invalid data.");
        }
    };

    const handleUpdateBatch = async (e) => {
        e.preventDefault();
        if (!currentBatchId) return;
        try {
            await api.put(`/batches/${currentBatchId}`, formData);

            toast.success("Batch updated successfully!");
            setIsEditOpen(false);
            setCurrentBatchId(null);
            fetchBatches();
        } catch (err) {
            toast.error("Error updating batch. Unauthorized.");
        }
    };

    const confirmDelete = async () => {
        if (!batchToDelete) return;
        try {
            await api.delete(`/batches/${batchToDelete}`);

            toast.success("Batch deleted successfully!");
            setDeleteModalOpen(false);
            setBatchToDelete(null);
            fetchBatches();
        } catch (err) {
            toast.error("Error deleting batch. Unauthorized.");
        }
    };

    const filteredBatches = batches.filter(b =>
        b.batch_name.toLowerCase().includes(search.toLowerCase()) ||
        b.center.toLowerCase().includes(search.toLowerCase()) ||
        b.class_name.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="vp-page p-6 space-y-7">
            {/* HERO BANNER */}
            <section className="relative overflow-hidden rounded-[28px] border border-slate-800 bg-[#090b12] px-7 py-7 text-white shadow-xl">
                <div className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full bg-indigo-500/10 blur-3xl" />
                <div className="relative flex flex-col justify-between gap-6 md:flex-row md:items-center">
                    <div>
                        <div className="mb-3 flex items-center gap-2">
                            <span className="inline-flex items-center gap-1.5 rounded-full border border-indigo-400/20 bg-indigo-500/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-indigo-300">
                                <Layers3 size={12} /> Management Console
                            </span>
                        </div>
                        <h1 className="!m-0 text-3xl font-bold tracking-tight text-white md:text-4xl">
                            Batch Management
                        </h1>
                        <p className="mt-2 max-w-2xl text-sm text-slate-400">
                            Create, configure and manage all active academic batches, centers, and academic years.
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => fetchBatches(true)}
                            className={`flex h-11 w-11 items-center justify-center rounded-xl border border-slate-800 bg-white/[0.04] text-slate-300 transition hover:bg-white/[0.08] ${refreshing ? "animate-spin" : ""}`}
                            title="Refresh Batches"
                        >
                            <RefreshCw size={18} />
                        </button>

                        {/* Only Admin can see Add New Batch Button */}
                        {isAdmin && (
                            <button
                                onClick={() => {
                                    setFormData({ batch_name: "", class_name: "", center: "", academic_year: "2026-27" });
                                    setIsAddOpen(true);
                                }}
                                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 px-5 py-3 text-xs font-bold text-white shadow-lg shadow-indigo-500/25 transition hover:opacity-95 cursor-pointer"
                            >
                                <Plus size={16} /> Add New Batch
                            </button>
                        )}
                    </div>
                </div>
            </section>

            {/* SEARCH BAR */}
            <section className="rounded-2xl border border-slate-800/60 bg-[#0d111a] p-4 shadow-sm backdrop-blur-xl">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div className="relative w-full md:w-[400px]">
                        <Search size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                        <input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search by batch name, center, class..."
                            className="h-11 w-full rounded-xl border border-slate-800 bg-slate-900/50 pl-10 pr-4 text-sm text-slate-200 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                        />
                    </div>
                    <div className="text-xs font-semibold text-slate-400">
                        Total Active Batches: <span className="text-indigo-400 font-bold">{batches.length}</span>
                    </div>
                </div>
            </section>

            {/* BATCHES GRID */}
            {loading ? (
                <div className="flex min-h-[40vh] items-center justify-center">
                    <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
                </div>
            ) : filteredBatches.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-slate-800 bg-[#090b12]/50 p-12 text-center">
                    <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-400">
                        <Layers3 size={24} />
                    </div>
                    <h3 className="text-base font-bold text-slate-200">No batches found</h3>
                    <p className="mt-1 text-xs text-slate-500">Get started by adding a new batch using the button above.</p>
                </div>
            ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {filteredBatches.map((batch) => (
                        <div
                            key={batch.id}
                            className="group relative overflow-hidden rounded-2xl border border-slate-800/80 bg-[#0d111a] p-5 shadow-lg transition hover:border-indigo-500/40 hover:bg-[#111622]"
                        >
                            <div className="absolute top-0 right-0 h-24 w-24 rounded-full bg-indigo-500/5 blur-2xl transition group-hover:bg-indigo-500/10" />

                            <div className="flex items-start justify-between gap-4">
                                <div>
                                    <span className="inline-flex items-center gap-1.5 rounded-md border border-indigo-500/20 bg-indigo-500/10 px-2.5 py-0.5 text-[10px] font-bold text-indigo-300 uppercase tracking-wide">
                                        {batch.class_name}
                                    </span>
                                    <h3 className="mt-3 text-lg font-bold text-slate-100 group-hover:text-indigo-300 transition">
                                        {batch.batch_name}
                                    </h3>
                                </div>

                                {/* Only Admin can see Edit & Delete buttons */}
                                {isAdmin && (
                                    <div className="flex items-center gap-1 z-10 relative">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setCurrentBatchId(batch.id);
                                                setFormData({
                                                    batch_name: batch.batch_name,
                                                    class_name: batch.class_name,
                                                    center: batch.center,
                                                    academic_year: batch.academic_year
                                                });
                                                setIsEditOpen(true);
                                            }}
                                            className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white transition cursor-pointer"
                                            title="Edit Batch"
                                        >
                                            <Edit3 size={15} />
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setBatchToDelete(batch.id);
                                                setDeleteModalOpen(true);
                                            }}
                                            className="rounded-lg p-2 text-rose-400 hover:bg-rose-500/10 transition cursor-pointer"
                                            title="Delete Batch"
                                        >
                                            <Trash2 size={15} />
                                        </button>
                                    </div>
                                )}
                            </div>

                            <div className="mt-5 space-y-2.5 border-t border-slate-800/60 pt-4 text-xs text-slate-400">
                                <div className="flex items-center gap-2">
                                    <Building2 size={14} className="text-slate-500" />
                                    <span>Center: <strong className="text-slate-200">{batch.center}</strong></span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Calendar size={14} className="text-slate-500" />
                                    <span>Academic Year: <strong className="text-slate-200">{batch.academic_year}</strong></span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* ADD / EDIT MODAL DIALOG */}
            {isAdmin && (isAddOpen || isEditOpen) && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="relative w-full max-w-lg rounded-3xl border border-slate-800 bg-[#090b12] p-6 shadow-2xl">
                        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                            <h2 className="text-lg font-bold text-white">
                                {isAddOpen ? "Create New Batch" : "Edit Batch Details"}
                            </h2>
                            <button
                                onClick={() => { setIsAddOpen(false); setIsEditOpen(false); }}
                                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white cursor-pointer"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <form onSubmit={isAddOpen ? handleCreateBatch : handleUpdateBatch} className="mt-5 space-y-4">
                            <div>
                                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">Batch Name</label>
                                <input
                                    required
                                    value={formData.batch_name}
                                    onChange={(e) => setFormData({ ...formData, batch_name: e.target.value })}
                                    placeholder="e.g. Arjuna JEE 2027 Phase-1"
                                    className="h-11 w-full rounded-xl border border-slate-800 bg-slate-900/50 px-4 text-sm text-slate-200 outline-none focus:border-indigo-500"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">Class / Stream</label>
                                    <input
                                        required
                                        value={formData.class_name}
                                        onChange={(e) => setFormData({ ...formData, class_name: e.target.value })}
                                        placeholder="e.g. 11th JEE"
                                        className="h-11 w-full rounded-xl border border-slate-800 bg-slate-900/50 px-4 text-sm text-slate-200 outline-none focus:border-indigo-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">Center</label>
                                    <input
                                        required
                                        value={formData.center}
                                        onChange={(e) => setFormData({ ...formData, center: e.target.value })}
                                        placeholder="e.g. Delhi"
                                        className="h-11 w-full rounded-xl border border-slate-800 bg-slate-900/50 px-4 text-sm text-slate-200 outline-none focus:border-indigo-500"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">Academic Year</label>
                                <input
                                    required
                                    value={formData.academic_year}
                                    onChange={(e) => setFormData({ ...formData, academic_year: e.target.value })}
                                    placeholder="e.g. 2026-27"
                                    className="h-11 w-full rounded-xl border border-slate-800 bg-slate-900/50 px-4 text-sm text-slate-200 outline-none focus:border-indigo-500"
                                />
                            </div>

                            <div className="mt-6 flex justify-end gap-3 border-t border-slate-800 pt-4">
                                <button
                                    type="button"
                                    onClick={() => { setIsAddOpen(false); setIsEditOpen(false); }}
                                    className="rounded-xl border border-slate-800 px-4 py-2.5 text-xs font-semibold text-slate-300 hover:bg-slate-800 cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="rounded-xl bg-indigo-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-indigo-500 shadow-lg shadow-indigo-600/20 cursor-pointer"
                                >
                                    {isAddOpen ? "Save Batch" : "Update Changes"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* PROFESSIONAL CUSTOM DELETE CONFIRMATION MODAL */}
            {isAdmin && deleteModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="relative w-full max-w-sm rounded-3xl border border-slate-800 bg-[#090b12] p-6 text-center shadow-2xl">
                        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-500/10 text-rose-500 border border-rose-500/20">
                            <AlertTriangle size={24} />
                        </div>
                        <h3 className="text-lg font-bold text-white">Delete Batch?</h3>
                        <p className="mt-2 text-xs text-slate-400 leading-relaxed">
                            This action cannot be undone. This will permanently remove the batch from the admin records.
                        </p>
                        <div className="mt-6 flex gap-3">
                            <button
                                type="button"
                                onClick={() => { setDeleteModalOpen(false); setBatchToDelete(null); }}
                                className="flex-1 rounded-xl border border-slate-800 py-2.5 text-xs font-semibold text-slate-300 hover:bg-slate-800 transition cursor-pointer"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={confirmDelete}
                                className="flex-1 rounded-xl bg-rose-600 py-2.5 text-xs font-bold text-white hover:bg-rose-500 shadow-lg shadow-rose-600/20 transition cursor-pointer"
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