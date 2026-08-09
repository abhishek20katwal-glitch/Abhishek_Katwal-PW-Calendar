import { useState, useEffect } from "react";
import {
    Bell,
    Search,
    ChevronDown,
    Circle,
    Activity,
    Server,
    Database,
    X,
    ShieldCheck,
    LogOut,
} from "lucide-react";

import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";

function Header() {
    const location = useLocation();
    const navigate = useNavigate();
    const [showStatusModal, setShowStatusModal] = useState(false);
    const [showSearchModal, setShowSearchModal] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [backendStatus, setBackendStatus] = useState("Online & Synchronized");
    const [latency, setLatency] = useState("12ms");

    // Dynamic User Role Logic based on localStorage email
    const userEmail = localStorage.getItem("user_email") || "";
    const adminEmails = ["abishek.katwal@pw.live", "abhishek20.katwal@gmail.com"];
    const isAdmin = adminEmails.includes(userEmail);
    const displayName = userEmail ? userEmail.split("@")[0] : "User";

    // Global shortcut listener for Ctrl + K
    useEffect(() => {
        const handleKeyDown = (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
                e.preventDefault();
                setShowSearchModal(true);
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, []);

    const pages = {
        "/": { title: "Dashboard", subtitle: "Academic operations overview" },
        "/calendar": { title: "Calendar", subtitle: "Academic test planner" },
        "/batches": { title: "Batches", subtitle: "Manage academic batches" },
        "/faculty": { title: "Faculty", subtitle: "Manage faculty information" },
        "/tests": { title: "Tests", subtitle: "Manage scheduled tests" },
        "/settings": { title: "Settings", subtitle: "Application configuration" },
    };

    const current = pages[location.pathname] || { title: "PW Calendar", subtitle: "Academic operations" };

    const checkHealth = async () => {
        try {
            const start = performance.now();
            const res = await fetch("http://localhost:8000/schedule");
            const end = performance.now();
            if (res.ok) {
                setBackendStatus("Online & Synchronized");
                setLatency(`${Math.round(end - start)}ms`);
            } else {
                setBackendStatus("Degraded Response");
            }
        } catch (err) {
            setBackendStatus("Offline / Connection Refused");
            setLatency("N/A");
        }
    };

    const handleLogout = () => {
        localStorage.removeItem("admin_token");
        localStorage.removeItem("user_email");
        toast.success("Logged out successfully");
        navigate("/login");
    };

    const quickLinks = [
        { name: "Go to Dashboard", path: "/", icon: "📊" },
        { name: "Go to Calendar", path: "/calendar", icon: "📅" },
        { name: "Go to Batches", path: "/batches", icon: "🎓" },
        { name: "Go to Faculty", path: "/faculty", icon: "👨‍🏫" },
        { name: "Go to Tests Directory", path: "/tests", icon: "📝" },
        { name: "Go to Settings", path: "/settings", icon: "⚙️" },
    ];

    const filteredLinks = quickLinks.filter(l => l.name.toLowerCase().includes(searchQuery.toLowerCase()));

    return (
        <header
            style={{ pointerEvents: "auto", zIndex: 99999, position: "relative" }}
            className="
                sticky top-0
                flex h-[78px] shrink-0
                items-center
                border-b border-white/[0.06]
                bg-[#090b12]/90
                px-5 backdrop-blur-xl
                sm:px-7
            "
        >
            {/* ================= LEFT ================= */}
            <div className="flex min-w-0 flex-1 items-center pointer-events-auto">
                <div className="min-w-0">
                    <div className="flex items-center gap-2">
                        <h2 className="truncate text-[16px] font-semibold tracking-tight text-slate-100">
                            {current.title}
                        </h2>
                        <span className="hidden text-slate-700 sm:block">/</span>
                        <span className="hidden text-[11px] text-slate-600 sm:block">PW Calendar</span>
                    </div>
                    <p className="mt-0.5 hidden text-[10px] text-slate-600 sm:block">
                        {current.subtitle}
                    </p>
                </div>
            </div>

            {/* ================= RIGHT ================= */}
            <div className="flex items-center gap-2 sm:gap-3 pointer-events-auto">

                {/* Search Button (Opens Command Palette Modal) */}
                <button
                    type="button"
                    onClick={(e) => {
                        e.stopPropagation();
                        setShowSearchModal(true);
                    }}
                    className="
                        hidden h-9
                        items-center gap-2
                        rounded-lg
                        border border-white/[0.07]
                        bg-white/[0.025]
                        px-3
                        text-slate-400
                        transition-all duration-200
                        hover:border-white/[0.13]
                        hover:bg-white/[0.045]
                        hover:text-slate-200
                        md:flex
                        cursor-pointer
                        pointer-events-auto
                    "
                >
                    <Search size={13} />
                    <span className="text-[11px]">Search</span>
                    <kbd className="ml-4 rounded-md border border-white/[0.07] bg-white/[0.03] px-1.5 py-0.5 text-[9px] text-slate-500 font-mono">
                        Ctrl K
                    </kbd>
                </button>

                {/* Live Pill */}
                <button
                    type="button"
                    onClick={(e) => {
                        e.stopPropagation();
                        checkHealth();
                        setShowStatusModal(true);
                    }}
                    className="
                        hidden h-9
                        items-center gap-2
                        rounded-lg
                        border border-emerald-400/10
                        bg-emerald-400/[0.035]
                        px-3
                        sm:flex
                        cursor-pointer
                        hover:bg-emerald-400/[0.1]
                        transition-all
                        pointer-events-auto
                    "
                >
                    <Circle size={6} fill="currentColor" className="text-emerald-400 animate-pulse" />
                    <span className="text-[9px] font-bold uppercase tracking-[0.15em] text-emerald-400">
                        Live
                    </span>
                </button>

                {/* Notification */}
                <button
                    type="button"
                    onClick={(e) => {
                        e.stopPropagation();
                        toast.success("No new system notifications.");
                    }}
                    className="
                        relative flex h-9 w-9
                        items-center justify-center
                        rounded-lg
                        border border-white/[0.07]
                        bg-white/[0.025]
                        text-slate-400
                        transition-all duration-200
                        hover:border-white/[0.13]
                        hover:bg-white/[0.045]
                        hover:text-slate-200
                        cursor-pointer
                        pointer-events-auto
                    "
                    aria-label="Notifications"
                >
                    <Bell size={14} />
                    <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-blue-400 shadow-[0_0_8px_rgba(96,165,250,0.9)]" />
                </button>

                {/* Dynamic User Profile Badge */}
                <button
                    type="button"
                    onClick={(e) => {
                        e.stopPropagation();
                        toast.success(`Logged in as: ${userEmail || "Guest"} (${isAdmin ? "Admin" : "View-Only"})`);
                    }}
                    className="
                        flex h-9
                        items-center gap-2
                        rounded-lg
                        border border-white/[0.07]
                        bg-white/[0.025]
                        px-2.5
                        transition-all duration-200
                        hover:border-white/[0.13]
                        hover:bg-white/[0.045]
                        cursor-pointer
                        pointer-events-auto
                    "
                >
                    <div className="flex h-7 w-7 items-center justify-center rounded-md bg-blue-500/[0.10] text-[10px] font-bold text-blue-300 uppercase">
                        {displayName.charAt(0)}
                    </div>
                    <div className="hidden text-left sm:block">
                        <p className="text-[10px] font-semibold text-slate-300 truncate max-w-[100px]">{displayName}</p>
                        <p className="text-[8px] text-slate-400">{isAdmin ? "Admin" : "View-Only"}</p>
                    </div>
                    <ChevronDown size={10} className="hidden text-slate-600 sm:block" />
                </button>

                {/* Logout Button */}
                <button
                    type="button"
                    onClick={handleLogout}
                    title="Logout"
                    className="
                        flex h-9 w-9
                        items-center justify-center
                        rounded-lg
                        border border-rose-500/20
                        bg-rose-500/10
                        text-rose-400
                        transition-all duration-200
                        hover:bg-rose-500/20
                        cursor-pointer
                        pointer-events-auto
                    "
                >
                    <LogOut size={14} />
                </button>
            </div>

            {/* COMMAND PALETTE SEARCH MODAL */}
            {showSearchModal && (
                <div
                    style={{ pointerEvents: "auto", zIndex: 100000 }}
                    className="fixed inset-0 flex items-start justify-center pt-24 bg-black/80 p-4 backdrop-blur-sm"
                    onClick={() => setShowSearchModal(false)}
                >
                    <div
                        className="bg-[#0d111a] border border-slate-800 w-full max-w-lg p-5 rounded-3xl space-y-4 shadow-2xl text-white pointer-events-auto"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center gap-3 border-b border-slate-800 pb-3 px-2">
                            <Search size={18} className="text-cyan-400" />
                            <input
                                autoFocus
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Type to jump to any section..."
                                className="w-full bg-transparent border-none outline-none text-sm text-slate-200 placeholder:text-slate-600"
                            />
                            <button onClick={() => setShowSearchModal(false)} className="text-slate-500 hover:text-white cursor-pointer"><X size={16} /></button>
                        </div>

                        <div className="space-y-1.5 max-h-60 overflow-y-auto">
                            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 px-2 block mb-1">Quick Navigation</span>
                            {filteredLinks.length > 0 ? (
                                filteredLinks.map((item, idx) => (
                                    <div
                                        key={idx}
                                        onClick={() => {
                                            navigate(item.path);
                                            setShowSearchModal(false);
                                            setSearchQuery("");
                                        }}
                                        className="flex items-center justify-between p-3 rounded-2xl hover:bg-cyan-500/10 hover:border-cyan-500/30 border border-transparent cursor-pointer transition text-xs text-slate-300"
                                    >
                                        <span className="flex items-center gap-2.5 font-medium"><span className="text-base">{item.icon}</span> {item.name}</span>
                                        <span className="text-[10px] font-mono text-slate-500 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">{item.path}</span>
                                    </div>
                                ))
                            ) : (
                                <div className="p-4 text-center text-xs text-slate-500">No matching pages found.</div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* LIVE System Status Modal */}
            {showStatusModal && (
                <div
                    style={{ pointerEvents: "auto", zIndex: 100000 }}
                    className="fixed inset-0 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
                    onClick={() => setShowStatusModal(false)}
                >
                    <div
                        className="bg-[#090b12] border border-slate-800 w-full max-w-md p-6 rounded-3xl space-y-5 shadow-2xl text-white pointer-events-auto"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex justify-between items-center border-b border-slate-800 pb-4">
                            <div className="flex items-center gap-2.5">
                                <Activity className="text-emerald-400" size={20} />
                                <h3 className="text-base font-bold">System Health & Telemetry</h3>
                            </div>
                            <button
                                onClick={() => setShowStatusModal(false)}
                                className="text-slate-400 hover:text-white cursor-pointer p-1.5 rounded-xl bg-slate-900 border border-slate-800"
                            >
                                <X size={16} />
                            </button>
                        </div>

                        <div className="space-y-3 text-xs">
                            <div className="flex items-center justify-between rounded-2xl border border-slate-800 bg-slate-900/50 p-3.5">
                                <span className="text-slate-400 flex items-center gap-2">
                                    <Server size={14} className="text-indigo-400" /> FastAPI Backend
                                </span>
                                <span className="text-emerald-400 font-bold">{backendStatus}</span>
                            </div>
                            <div className="flex items-center justify-between rounded-2xl border border-slate-800 bg-slate-900/50 p-3.5">
                                <span className="text-slate-400 flex items-center gap-2">
                                    <Database size={14} className="text-cyan-400" /> Response Latency
                                </span>
                                <span className="text-cyan-300 font-mono font-bold">{latency}</span>
                            </div>
                            <div className="flex items-center justify-between rounded-2xl border border-slate-800 bg-slate-900/50 p-3.5">
                                <span className="text-slate-400 flex items-center gap-2">
                                    <ShieldCheck size={14} className="text-emerald-400" /> Security Protocol
                                </span>
                                <span className="text-slate-200 font-bold">Encrypted Token Active</span>
                            </div>
                        </div>

                        <div className="flex justify-end pt-2">
                            <button
                                onClick={() => setShowStatusModal(false)}
                                className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 px-5 py-2 rounded-xl text-xs font-bold cursor-pointer"
                            >
                                Close Telemetry
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </header>
    );
}

export default Header;