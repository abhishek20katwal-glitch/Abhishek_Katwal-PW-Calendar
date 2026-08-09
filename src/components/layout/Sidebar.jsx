import {
    LayoutDashboard,
    CalendarDays,
    Users,
    GraduationCap,
    ClipboardCheck,
    Settings,
    ChevronLeft,
    ChevronRight,
    Circle,
    Sparkles,
} from "lucide-react";

import { NavLink } from "react-router-dom";
import { useState } from "react";

const menu = [
    {
        name: "Dashboard",
        path: "/",
        icon: LayoutDashboard,
    },
    {
        name: "Calendar",
        path: "/calendar",
        icon: CalendarDays,
    },
    {
        name: "Batches",
        path: "/batches",
        icon: Users,
        badge: "Active",
    },
    {
        name: "Faculty",
        path: "/faculty",
        icon: GraduationCap,
    },
    {
        name: "Tests",
        path: "/tests",
        icon: ClipboardCheck,
        badge: "New",
    },
];

function Sidebar() {
    const [collapsed, setCollapsed] = useState(false);

    return (
        <aside
            className={`
                relative hidden min-h-screen shrink-0
                border-r border-white/[0.07]
                bg-[#090b12] text-white
                transition-[width] duration-300 ease-out
                lg:block
                ${collapsed ? "w-[78px]" : "w-[252px]"}
            `}
        >
            {/* Ambient glow */}
            <div
                className="
                    pointer-events-none absolute
                    left-0 top-0
                    h-[260px] w-full
                    bg-blue-500/[0.045]
                    blur-3xl
                "
            />

            <div className="relative flex min-h-screen flex-col">

                {/* ================================================= */}
                {/* BRAND */}
                {/* ================================================= */}

                <div
                    className={`
                        flex h-[78px] shrink-0
                        items-center
                        border-b border-white/[0.06]
                        ${collapsed ? "justify-center px-3" : "px-4"}
                    `}
                >
                    {collapsed ? (
                        /* Collapsed logo */
                        <div
                            className="
                                flex h-10 w-10
                                items-center justify-center
                                rounded-xl
                                border border-blue-400/20
                                bg-blue-500/[0.10]
                                shadow-[0_0_28px_rgba(59,130,246,0.08)]
                            "
                        >
                            <Sparkles
                                size={19}
                                strokeWidth={2}
                                className="text-blue-400"
                            />
                        </div>
                    ) : (
                        /* Full brand */
                        <div className="flex min-w-0 items-center gap-3">
                            <div
                                className="
                                    flex h-10 w-10 shrink-0
                                    items-center justify-center
                                    rounded-xl
                                    border border-blue-400/20
                                    bg-blue-500/[0.10]
                                    shadow-[0_0_28px_rgba(59,130,246,0.08)]
                                "
                            >
                                <Sparkles
                                    size={19}
                                    strokeWidth={2}
                                    className="text-blue-400"
                                />
                            </div>

                            <div className="min-w-0">
                                <div
                                    className="
                                        whitespace-nowrap
                                        text-[15px]
                                        font-bold
                                        leading-none
                                        tracking-tight
                                        text-white
                                    "
                                >
                                    PW Calendar
                                </div>
                                <p
                                    className="
                                        m-0 mt-1.5
                                        whitespace-nowrap
                                        text-[9px]
                                        font-semibold
                                        uppercase
                                        tracking-[0.18em]
                                        text-cyan-400
                                    "
                                >
                                    Admin Panel Pro
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                {/* ================================================= */}
                {/* NAVIGATION */}
                {/* ================================================= */}

                <div className="flex-1 px-3 py-6">

                    {!collapsed && (
                        <p
                            className="
                                mb-3 px-3
                                text-[9px]
                                font-bold
                                uppercase
                                tracking-[0.2em]
                                text-slate-600
                            "
                        >
                            Workspace
                        </p>
                    )}

                    <nav className="space-y-1.5">
                        {menu.map((item) => {
                            const Icon = item.icon;

                            return (
                                <NavLink
                                    key={item.name}
                                    to={item.path}
                                    end={item.path === "/"}
                                    className={({ isActive }) =>
                                        `
                                        group relative flex
                                        items-center justify-between
                                        rounded-xl
                                        border
                                        transition-all
                                        duration-200

                                        ${collapsed
                                            ? "justify-center px-3 py-3.5"
                                            : "px-3 py-3"
                                        }

                                        ${isActive
                                            ? `
                                                border-blue-400/15
                                                bg-blue-500/[0.10]
                                                text-white
                                                shadow-[0_8px_30px_rgba(37,99,235,0.08)]
                                            `
                                            : `
                                                border-transparent
                                                text-slate-500
                                                hover:border-white/[0.05]
                                                hover:bg-white/[0.035]
                                                hover:text-slate-200
                                            `
                                        }
                                        `
                                    }
                                >
                                    {({ isActive }) => (
                                        <>
                                            {/* Active line */}
                                            {isActive && (
                                                <span
                                                    className="
                                                        absolute
                                                        left-0 top-1/2
                                                        h-6 w-[3px]
                                                        -translate-y-1/2
                                                        rounded-r-full
                                                        bg-blue-400
                                                        shadow-[0_0_12px_rgba(96,165,250,0.8)]
                                                    "
                                                />
                                            )}

                                            <div className="flex items-center gap-3 min-w-0">
                                                <Icon
                                                    size={17}
                                                    strokeWidth={1.9}
                                                    className={`
                                                        shrink-0
                                                        transition-colors
                                                        ${isActive
                                                            ? "text-blue-400"
                                                            : "text-slate-600 group-hover:text-slate-300"
                                                        }
                                                    `}
                                                />

                                                {!collapsed && (
                                                    <span
                                                        className="
                                                            truncate
                                                            text-[13px]
                                                            font-medium
                                                        "
                                                    >
                                                        {item.name}
                                                    </span>
                                                )}
                                            </div>

                                            {!collapsed && item.badge && (
                                                <span className="text-[9px] font-bold uppercase px-2 py-0.5 rounded-md bg-slate-900 border border-slate-800 text-slate-400">
                                                    {item.badge}
                                                </span>
                                            )}

                                            {/* Collapsed tooltip */}
                                            {collapsed && (
                                                <span
                                                    className="
                                                        pointer-events-none
                                                        absolute left-full
                                                        z-50 ml-3
                                                        whitespace-nowrap
                                                        rounded-lg
                                                        border
                                                        border-white/[0.08]
                                                        bg-[#11141d]
                                                        px-3 py-2
                                                        text-[11px]
                                                        font-medium
                                                        text-white
                                                        opacity-0
                                                        shadow-2xl
                                                        transition-opacity
                                                        group-hover:opacity-100
                                                    "
                                                >
                                                    {item.name}
                                                </span>
                                            )}
                                        </>
                                    )}
                                </NavLink>
                            );
                        })}
                    </nav>

                    {/* ================================================= */}
                    {/* SYSTEM */}
                    {/* ================================================= */}

                    <div className="mt-8">

                        {!collapsed && (
                            <p
                                className="
                                    mb-3 px-3
                                    text-[9px]
                                    font-bold
                                    uppercase
                                    tracking-[0.2em]
                                    text-slate-600
                                "
                            >
                                System
                            </p>
                        )}

                        <NavLink
                            to="/settings"
                            className={({ isActive }) =>
                                `
                                group relative flex
                                items-center
                                rounded-xl
                                border
                                transition-all duration-200

                                ${collapsed
                                    ? "justify-center px-3 py-3.5"
                                    : "gap-3 px-3 py-3"
                                }

                                ${isActive
                                    ? `
                                            border-blue-400/15
                                            bg-blue-500/[0.10]
                                            text-white
                                        `
                                    : `
                                            border-transparent
                                            text-slate-500
                                            hover:border-white/[0.05]
                                            hover:bg-white/[0.035]
                                            hover:text-slate-200
                                        `
                                }
                                `
                            }
                        >
                            <Settings
                                size={17}
                                strokeWidth={1.9}
                                className="shrink-0 transition-transform duration-300 group-hover:rotate-45"
                            />

                            {!collapsed && (
                                <span className="text-[13px] font-medium">
                                    Settings
                                </span>
                            )}

                            {collapsed && (
                                <span
                                    className="
                                        pointer-events-none
                                        absolute left-full
                                        z-50 ml-3
                                        whitespace-nowrap
                                        rounded-lg
                                        border
                                        border-white/[0.08]
                                        bg-[#11141d]
                                        px-3 py-2
                                        text-[11px]
                                        font-medium
                                        text-white
                                        opacity-0
                                        shadow-2xl
                                        transition-opacity
                                        group-hover:opacity-100
                                    "
                                >
                                    Settings
                                </span>
                            )}
                        </NavLink>
                    </div>
                </div>

                {/* ================================================= */}
                {/* SYSTEM STATUS */}
                {/* ================================================= */}

                <div className="border-t border-white/[0.06] p-3">
                    {collapsed ? (
                        <div className="flex justify-center py-3">
                            <Circle
                                size={7}
                                fill="currentColor"
                                className="
                                    text-emerald-400
                                    drop-shadow-[0_0_7px_rgba(52,211,153,0.8)]
                                "
                            />
                        </div>
                    ) : (
                        <div
                            className="
                                rounded-xl
                                border border-white/[0.06]
                                bg-white/[0.025]
                                px-3 py-2.5
                            "
                        >
                            <div className="flex items-center gap-2">
                                <Circle
                                    size={7}
                                    fill="currentColor"
                                    className="
                                        text-emerald-400
                                        drop-shadow-[0_0_7px_rgba(52,211,153,0.8)]
                                    "
                                />

                                <span
                                    className="
                                        text-[9px]
                                        font-bold
                                        uppercase
                                        tracking-[0.15em]
                                        text-emerald-400
                                    "
                                >
                                    System Live
                                </span>
                            </div>

                            <p className="m-0 mt-1 text-[9px] text-slate-600">
                                Planner connected
                            </p>
                        </div>
                    )}
                </div>

                {/* ================================================= */}
                {/* COLLAPSE BUTTON */}
                {/* ================================================= */}

                <button
                    type="button"
                    onClick={() => setCollapsed((value) => !value)}
                    aria-label={
                        collapsed
                            ? "Expand sidebar"
                            : "Collapse sidebar"
                    }
                    className="
                        absolute
                        -right-3
                        top-[64px]
                        z-50
                        flex h-7 w-7
                        items-center justify-center
                        rounded-full
                        border border-white/[0.09]
                        bg-[#11141d]
                        text-slate-500
                        shadow-lg
                        transition-all
                        duration-200
                        hover:border-blue-400/30
                        hover:bg-[#151927]
                        hover:text-blue-400
                        cursor-pointer
                    "
                >
                    {collapsed ? (
                        <ChevronRight size={12} />
                    ) : (
                        <ChevronLeft size={12} />
                    )}
                </button>
            </div>
        </aside>
    );
}

export default Sidebar;