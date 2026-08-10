import api from "@/api/axios";
import { useEffect, useState } from "react";
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import {
    format,
    parse,
    startOfWeek,
    getDay,
} from "date-fns";
import { enUS } from "date-fns/locale";
import { CalendarDays, Sparkles, Cpu } from "lucide-react";
import { toast } from "sonner";

import AddClassDialog from "@/components/calendar/AddClassDialog";

import "react-big-calendar/lib/css/react-big-calendar.css";

const locales = {
    "en-US": enUS,
};

const localizer = dateFnsLocalizer({
    format,
    parse,
    startOfWeek,
    getDay,
    locales,
});

function CalendarPage() {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);

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

    const fetchClasses = async () => {
        try {
            setLoading(true);
            const res = await api.get("/classes");

            const formattedEvents = res.data.map((item) => ({
                id: item.id,
                title: `${item.subject} (${item.batch_name || "Batch"})`,
                start: new Date(item.start_time),
                end: new Date(item.end_time),
            }));

            setEvents(formattedEvents);
        } catch (err) {
            console.error(err);
            toast.error("Could not load class schedules from database.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchClasses();
    }, []);

    return (
        <div className="space-y-7 p-2 min-h-screen relative">

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
            <section className="relative overflow-hidden rounded-[28px] glass-card px-7 py-7 text-white shadow-2xl">
                <div className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full bg-indigo-500/15 blur-3xl" />
                <div className="pointer-events-none absolute -bottom-32 left-1/3 h-64 w-64 rounded-full bg-violet-500/15 blur-3xl" />

                <div className="relative flex flex-col justify-between gap-6 md:flex-row md:items-center">
                    <div>
                        <div className="mb-3 flex items-center gap-2">
                            <span className="inline-flex items-center gap-1.5 rounded-full border border-indigo-400/20 bg-indigo-500/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-indigo-300">
                                <Sparkles size={12} />
                                Schedule View
                            </span>
                        </div>
                        <h1 className="!m-0 text-3xl font-bold tracking-tight text-white md:text-4xl">
                            Class Calendar
                        </h1>
                        <p className="mt-2 max-w-2xl text-sm text-slate-400">
                            Interactive timetable and academic sessions scheduled for batches.
                        </p>
                    </div>

                    {/* Only Admin can see Add Class button/dialog */}
                    {isAdmin && (
                        <div className="shrink-0 magnetic-btn">
                            <AddClassDialog onClassAdded={fetchClasses} />
                        </div>
                    )}
                </div>
            </section>

            {/* CALENDAR CONTAINER WRAPPER */}
            <div className="rounded-3xl glass-card p-6 shadow-xl border border-slate-800/80">
                {loading ? (
                    <div className="flex min-h-[40vh] items-center justify-center">
                        <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
                    </div>
                ) : (
                    <div className="calendar-container-wrapper">
                        <Calendar
                            localizer={localizer}
                            events={events}
                            startAccessor="start"
                            endAccessor="end"
                            style={{
                                height: 700,
                            }}
                        />
                    </div>
                )}
            </div>
        </div>
    );
}

export default CalendarPage;