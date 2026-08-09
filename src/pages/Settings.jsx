import api from "@/api/axios";
import { useEffect, useState } from "react";
import { Settings as SettingsIcon, Database, Server, Bell, ShieldCheck, Sliders, ToggleLeft, ToggleRight } from "lucide-react";
import { toast } from "sonner";

export default function Settings() {
    const [autoSync, setAutoSync] = useState(true);
    const [highContrast, setHighContrast] = useState(false);

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

    return (
        <div className="p-6 space-y-7 text-slate-100 max-w-[1600px] mx-auto min-h-screen">
            {/* HERO BANNER */}
            <section className="relative overflow-hidden rounded-[28px] border border-slate-800 bg-[#090b12] px-7 py-7 shadow-xl glass-card">
                <div className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full bg-indigo-500/10 blur-3xl" />
                <div className="relative">
                    <div className="mb-3 flex items-center gap-2">
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-indigo-400/20 bg-indigo-500/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-indigo-300">
                            <SettingsIcon size={12} /> System Preferences {isAdmin && "(Admin Mode)"}
                        </span>
                    </div>
                    <h1 className="!m-0 text-3xl font-bold tracking-tight text-white md:text-4xl">
                        Platform Settings
                    </h1>
                    <p className="mt-2 max-w-2xl text-sm text-slate-400">
                        Configure backend endpoints, database sync parameters, and interactive platform toggles.
                    </p>
                </div>
            </section>

            {/* SETTINGS CARDS GRID */}
            <div className="grid gap-5 md:grid-cols-2">
                {/* API CONFIGURATION */}
                <div className="rounded-3xl border border-slate-800/80 bg-[#0d111a] p-6 space-y-4 shadow-lg glass-card">
                    <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                            <Server size={20} />
                        </div>
                        <div>
                            <h3 className="text-base font-bold text-white">API Configuration</h3>
                            <p className="text-xs text-slate-400">FastAPI & Google Apps Script bridge</p>
                        </div>
                    </div>
                    <div className="space-y-3 pt-2 text-xs">
                        <div>
                            <label className="block text-slate-400 mb-1">Backend Base URL</label>
                            <input
                                readOnly
                                value="http://localhost:8000"
                                className="h-10 w-full rounded-xl border border-slate-800 bg-slate-900/60 px-3 text-slate-300 outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-slate-400 mb-1">Schedule Sync Endpoint</label>
                            <input
                                readOnly
                                value="http://localhost:8000/schedule"
                                className="h-10 w-full rounded-xl border border-slate-800 bg-slate-900/60 px-3 text-slate-300 outline-none"
                            />
                        </div>
                    </div>
                </div>

                {/* DATABASE STATUS */}
                <div className="rounded-3xl border border-slate-800/80 bg-[#0d111a] p-6 space-y-4 shadow-lg glass-card">
                    <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            <Database size={20} />
                        </div>
                        <div>
                            <h3 className="text-base font-bold text-white">Database Status</h3>
                            <p className="text-xs text-slate-400">PostgreSQL pw_calendar active</p>
                        </div>
                    </div>
                    <div className="space-y-3 pt-2 text-xs">
                        <div className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-900/50 p-3">
                            <span className="text-slate-400">Connection Engine</span>
                            <span className="text-emerald-400 font-bold flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" /> Connected</span>
                        </div>
                        <div className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-900/50 p-3">
                            <span className="text-slate-400">ORM Tables</span>
                            <span className="text-slate-200 font-bold">batches, faculty, classes</span>
                        </div>
                    </div>
                </div>

                {/* INTERACTIVE TOGGLES */}
                <div className="rounded-3xl border border-slate-800/80 bg-[#0d111a] p-6 space-y-4 shadow-lg md:col-span-2 glass-card">
                    <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                            <Sliders size={20} />
                        </div>
                        <div>
                            <h3 className="text-base font-bold text-white">Application Toggles</h3>
                            <p className="text-xs text-slate-400">Manage real-time sync and display accents</p>
                        </div>
                    </div>

                    <div className="grid gap-3 pt-2 sm:grid-cols-2 text-xs">
                        <div className="flex items-center justify-between rounded-2xl border border-slate-800 bg-slate-900/50 p-4">
                            <div>
                                <strong className="text-white block text-sm">Background Auto-Sync</strong>
                                <span className="text-slate-400 text-[11px]">Periodically sync test schedules with Apps Script</span>
                            </div>
                            <button
                                onClick={() => {
                                    setAutoSync(!autoSync);
                                    toast.success(`Auto-sync ${!autoSync ? 'enabled' : 'disabled'}`);
                                }}
                                className="text-cyan-400 hover:text-cyan-300 cursor-pointer transition magnetic-btn"
                            >
                                {autoSync ? <ToggleRight size={32} className="text-cyan-400" /> : <ToggleLeft size={32} className="text-slate-600" />}
                            </button>
                        </div>

                        <div className="flex items-center justify-between rounded-2xl border border-slate-800 bg-slate-900/50 p-4">
                            <div>
                                <strong className="text-white block text-sm">High Contrast Mode</strong>
                                <span className="text-slate-400 text-[11px]">Boost borders and text intensity</span>
                            </div>
                            <button
                                onClick={() => {
                                    setHighContrast(!highContrast);
                                    toast.success(`High contrast mode ${!highContrast ? 'activated' : 'deactivated'}`);
                                }}
                                className="text-indigo-400 hover:text-indigo-300 cursor-pointer transition magnetic-btn"
                            >
                                {highContrast ? <ToggleRight size={32} className="text-indigo-400" /> : <ToggleLeft size={32} className="text-slate-600" />}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}