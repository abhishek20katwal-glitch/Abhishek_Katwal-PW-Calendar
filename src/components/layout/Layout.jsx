import { useState } from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";
import { Menu } from "lucide-react";

export default function Layout({ children }) {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    return (
        <div className="flex min-h-screen bg-[#070912] text-white">

            {/* Mobile Top Bar */}
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

            {/* Fixed Sidebar */}
            <Sidebar
                isOpen={isMobileMenuOpen}
                onClose={() => setIsMobileMenuOpen(false)}
            />

            {/* Main Content Area - lg:ml-[252px] ensure karega ki content sidebar ke aage se start ho aur kuch na kate */}
            <main className="flex-1 flex flex-col min-w-0 pt-16 lg:pt-0 lg:ml-[252px] bg-[#070912] text-white overflow-x-hidden">
                <Header />

                <div className="flex-1 p-4 lg:p-8 overflow-y-auto w-full">
                    {children}
                </div>
            </main>
        </div>
    );
}