import React from "react";
import Sidebar from "./Sidebar";

export default function Layout({ children }) {
    return (
        <div className="flex min-h-screen bg-background text-foreground w-full">
            {/* Sidebar - Fixed/Sticky on the left */}
            <Sidebar />

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0">
                <header className="h-16 border-b border-border flex items-center px-6 bg-card">
                    <h1 className="text-xl font-semibold tracking-tight">PW Calendar Dashboard</h1>
                </header>
                <main className="flex-1 p-6 overflow-y-auto bg-background">
                    {children}
                </main>
            </div>
        </div>
    );
}