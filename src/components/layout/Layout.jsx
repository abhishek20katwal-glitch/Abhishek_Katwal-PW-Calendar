import { useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";
import { Menu } from "lucide-react";

export default function Layout({ children }) {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [cursorPos, setCursorPos] = useState({ x: -100, y: -100 });
    const [isHovered, setIsHovered] = useState(false);

    // Custom smooth cursor position tracker
    useEffect(() => {
        const handleMouseMove = (e) => {
            setCursorPos({ x: e.clientX, y: e.clientY });
        };
        window.addEventListener("mousemove", handleMouseMove);
        return () => window.removeEventListener("mousemove", handleMouseMove);
    }, []);

    return (
        <div className="flex min-h-screen bg-[#070912] text-white relative cursor-default selection:bg-blue-500 selection:text-white">

            {/* --- CUSTOM CODEPEN-STYLE GLOWING CURSOR --- */}
            <div
                className="pointer-events-none fixed z-[99999] h-8 w-8 -translate-x-1/2 -translate-y-1/2 rounded-full border border-blue-400/40 bg-blue-500/10 backdrop-blur-[1px] transition-transform duration-75 ease-out hidden lg:block"
                style={{
                    left: `${cursorPos.x}px`,
                    top: `${cursorPos.y}px`,
                    transform: `translate(-50%, -50%) scale(${isHovered ? 1.6 : 1})`,
                }}
            />
            <div
                className="pointer-events-none fixed z-[99999] h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-400 shadow-[0_0_12px_rgba(34,211,238,0.8)] hidden lg:block"
                style={{
                    left: `${cursorPos.x}px`,
                    top: `${cursorPos.y}px`,
                }}
            />

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

            {/* Main Content Area */}
            <main className="flex-1 flex flex-col min-w-0 pt-16 lg:pt-0 lg:ml-[252px] bg-[#070912] text-white overflow-x-hidden relative">

                {/* Ambient Dynamic Background Glow */}
                <div className="absolute top-0 right-1/4 h-96 w-96 rounded-full bg-blue-600/[0.03] blur-[120px] pointer-events-none" />

                <Header />

                <div
                    className="flex-1 p-4 lg:p-8 overflow-y-auto w-full"
                    onMouseOver={(e) => {
                        if (e.target.tagName === 'BUTTON' || e.target.tagName === 'A' || e.target.closest('button') || e.target.closest('a')) {
                            setIsHovered(true);
                        }
                    }}
                    onMouseOut={(e) => {
                        if (e.target.tagName === 'BUTTON' || e.target.tagName === 'A' || e.target.closest('button') || e.target.closest('a')) {
                            setIsHovered(false);
                        }
                    }}
                >
                    {children}
                </div>
            </main>
        </div>
    );
}