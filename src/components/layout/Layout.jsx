import { useState } from "react";
import Sidebar from "./Sidebar";
import { Menu } from "lucide-react";

export default function Layout({ children }) {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    return (
        <div className="flex min-h-screen bg-[#070912] text-white">

            {/* Mobile Top Bar (Yeh sirf mobile aur tablet par dikhega, desktop par hidden rahega) */}
            <div className="fixed top-0 left-0 right-0 z-30 flex h-16 items-center justify-between border-b border-white/[0.06] bg-[#090b12] px-4 lg:hidden">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setIsMobileMenuOpen(true)}
                        className="rounded-lg border border-white/[0.08] bg-white/[0.03] p-2 text-slate-300 hover:text-white"
                        aria-label="Open Menu"
                    >
                        <Menu size={20} />
                    </button>
                    <span className="text-sm font-bold tracking-tight text-white">
                        PW Calendar Pro
                    </span>
                </div>
            </div>

            {/* Sidebar */}
            <Sidebar
                isOpen={isMobileMenuOpen}
                onClose={() => setIsMobileMenuOpen(false)}
            />

            {/* Main Content Area (Desktop par koi padding top nahi hogi, mobile par 16 hogi) */}
            <main className="flex-1 flex flex-col min-w-0 pt-16 lg:pt-0">
                <div className="flex-1 p-4 lg:p-8 overflow-y-auto">
                    {children}
                </div>
            </main>
        </div>
    );
}