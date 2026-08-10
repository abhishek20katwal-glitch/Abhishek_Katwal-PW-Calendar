import { useEffect, useState, useRef } from "react";
import { GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import api from "@/api/axios";
import { ShieldCheck, Sparkles, Gamepad2, Play, RotateCcw } from "lucide-react";

export default function Login() {
    const navigate = useNavigate();

    // --- CYBER GRID RACER ARCADE GAME STATES ---
    const [gameActive, setGameActive] = useState(false);
    const [score, setScore] = useState(0);
    const [highScore, setHighScore] = useState(0);
    const [isGameOver, setIsGameOver] = useState(false);

    // Player & Obstacle coordinates inside a 300x120 grid
    const playerXRef = useRef(140);
    const obstaclesRef = useRef([
        { x: 50, y: -40, speed: 3 },
        { x: 180, y: -160, speed: 4 },
        { x: 240, y: -280, speed: 3.5 }
    ]);
    const animFrameRef = useRef(null);

    // Smooth Game Loop (60 FPS, Zero Lag)
    useEffect(() => {
        if (!gameActive || isGameOver) return;

        const runGame = () => {
            obstaclesRef.current = obstaclesRef.current.map(obs => {
                let newY = obs.y + obs.speed;
                // Reset obstacle when it goes off screen
                if (newY > 120) {
                    newY = -Math.floor(Math.random() * 100) - 40;
                    setScore(s => {
                        const updated = s + 5;
                        if (updated > highScore) setHighScore(updated);
                        return updated;
                    });
                }

                // Collision detection (Player at X: playerXRef, Y: 95 | Obstacle X: obs.x, Y: newY)
                if (
                    newY >= 80 && newY <= 110 &&
                    Math.abs(obs.x - playerXRef.current) < 22
                ) {
                    setIsGameOver(true);
                    setGameActive(false);
                }

                return { ...obs, y: newY };
            });

            animFrameRef.current = requestAnimationFrame(runGame);
        };

        animFrameRef.current = requestAnimationFrame(runGame);
        return () => cancelAnimationFrame(animFrameRef.current);
    }, [gameActive, isGameOver, highScore]);

    // Smooth Keyboard Controls for Game
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (!gameActive) return;
            if (e.code === "ArrowLeft" || e.code === "KeyA") {
                e.preventDefault();
                playerXRef.current = Math.max(15, playerXRef.current - 20);
            } else if (e.code === "ArrowRight" || e.code === "KeyD") {
                e.preventDefault();
                playerXRef.current = Math.min(285, playerXRef.current + 20);
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [gameActive]);

    const startArcade = () => {
        setScore(0);
        setIsGameOver(false);
        playerXRef.current = 140;
        obstaclesRef.current = [
            { x: 50, y: -40, speed: 3.5 },
            { x: 170, y: -150, speed: 4.5 },
            { x: 250, y: -260, speed: 4 }
        ];
        setGameActive(true);
    };

    // --- CODEPEN MAGIC: Holographic Tilt & Mouse Spotlight ---
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
                const rotateX = ((y - centerY) / centerY) * -4;
                const rotateY = ((x - centerX) / centerX) * 4;

                if (
                    e.clientX >= rect.left &&
                    e.clientX <= rect.right &&
                    e.clientY >= rect.top &&
                    e.clientY <= rect.bottom
                ) {
                    card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-2px)`;
                } else {
                    card.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px)`;
                }
            });
        };

        window.addEventListener("mousemove", handleMouseMove);
        return () => window.removeEventListener("mousemove", handleMouseMove);
    }, []);

    const handleGoogleSuccess = async (credentialResponse) => {
        try {
            const decoded = jwtDecode(credentialResponse.credential);
            const userEmail = decoded.email;

            const response = await api.post("/api/verify-admin", { email: userEmail });

            if (response.data.status === "success") {
                localStorage.setItem("admin_token", credentialResponse.credential);
                localStorage.setItem("user_email", userEmail);

                toast.success(`Welcome back, ${decoded.name}!`);
                navigate("/");
            }
        } catch (err) {
            const errorMsg = err.response?.data?.detail || "Access denied.";
            toast.error(errorMsg);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-[#070912] p-4 text-white relative overflow-hidden flex-col gap-5">
            {/* Ambient Background Glow Orbs */}
            <div className="pointer-events-none absolute -left-20 -top-20 h-96 w-96 rounded-full bg-indigo-600/10 blur-3xl" />
            <div className="pointer-events-none absolute -right-20 -bottom-20 h-96 w-96 rounded-full bg-violet-600/10 blur-3xl" />

            {/* MAIN LOGIN CARD */}
            <div className="w-full max-w-md rounded-[32px] border border-slate-800 bg-[#0d111a] p-7 text-center shadow-2xl glass-card relative z-10">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 shadow-inner">
                    <ShieldCheck size={24} />
                </div>

                <div className="mb-2 flex items-center justify-center gap-1.5">
                    <span className="inline-flex items-center gap-1 rounded-full border border-indigo-400/20 bg-indigo-500/10 px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-[0.18em] text-indigo-300">
                        <Sparkles size={10} /> Secure Gateway
                    </span>
                </div>

                <h1 className="text-2xl font-bold mb-1 text-white">PW Calendar Pro</h1>
                <p className="text-xs text-slate-400 mb-6">Authorized personnel only. Please sign in with Google credentials.</p>

                <div className="flex justify-center transition hover:scale-[1.02] mb-3">
                    <GoogleLogin
                        onSuccess={handleGoogleSuccess}
                        onError={() => toast.error("Google Login Failed. Try again.")}
                        theme="filled_black"
                        shape="pill"
                        size="large"
                    />
                </div>
            </div>

            {/* --- CYBER GRID RACER ARCADE GAME WIDGET --- */}
            <div className="w-full max-w-md rounded-2xl border border-slate-800/80 bg-[#090b12]/95 p-4 shadow-xl glass-card relative z-10 text-center">
                <div className="flex items-center justify-between mb-2">
                    <span className="flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-widest text-cyan-400">
                        <Gamepad2 size={13} /> Cyber Grid Racer
                    </span>
                    <div className="flex gap-3 text-[11px] font-mono">
                        <span className="text-slate-400">SCORE: <strong className="text-white">{score}</strong></span>
                        <span className="text-slate-400">BEST: <strong className="text-indigo-400">{highScore}</strong></span>
                    </div>
                </div>

                {/* GAME SCREEN */}
                <div className="relative h-28 w-full rounded-xl border border-slate-800 bg-black/80 overflow-hidden flex items-center shadow-inner">
                    {/* Retro Cyber Grid Lines */}
                    <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e1b4b_1px,transparent_1px),linear-gradient(to_bottom,#1e1b4b_1px,transparent_1px)] bg-[size:25px_25px] opacity-30" />

                    {!gameActive && !isGameOver && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 backdrop-blur-xs z-20">
                            <p className="text-[11px] font-bold text-slate-200 mb-2">Play Cyber Grid Racer while you sign in!</p>
                            <button
                                onClick={startArcade}
                                className="flex items-center gap-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 px-4 py-1.5 text-[10px] font-extrabold text-slate-950 transition cursor-pointer shadow-lg shadow-cyan-500/20"
                            >
                                <Play size={12} /> Launch Game
                            </button>
                        </div>
                    )}

                    {isGameOver && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/85 backdrop-blur-xs z-20">
                            <p className="text-xs font-bold text-rose-400 mb-1">HULL BREACH - GAME OVER</p>
                            <p className="text-[10px] text-slate-400 mb-2">Final Score: <span className="text-white font-bold">{score}</span></p>
                            <button
                                onClick={startArcade}
                                className="flex items-center gap-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 px-4 py-1.5 text-[10px] font-bold text-white transition cursor-pointer shadow-lg shadow-indigo-600/30"
                            >
                                <RotateCcw size={12} /> Retry Run
                            </button>
                        </div>
                    )}

                    {/* PLAYER SHIP (Controlled via Left/Right Arrow keys or on-screen buttons) */}
                    <div
                        className="absolute bottom-2 w-6 h-4 rounded bg-gradient-to-t from-cyan-500 to-indigo-500 shadow-[0_0_12px_rgba(34,211,238,0.9)] transition-none flex items-center justify-center text-[8px] font-bold text-black"
                        style={{ left: `${playerXRef.current}px` }}
                    >
                        ▲
                    </div>

                    {/* FALLING OBSTACLES */}
                    {obstaclesRef.current.map((obs, idx) => (
                        <div
                            key={idx}
                            className="absolute w-5 h-5 rounded-md bg-rose-600 shadow-[0_0_10px_rgba(244,63,94,0.8)] border border-rose-400/40"
                            style={{
                                left: `${obs.x}px`,
                                top: `${obs.y}px`
                            }}
                        />
                    ))}
                </div>

                {/* Mobile / Click Controls helper */}
                <div className="mt-3 flex items-center justify-between text-[10px] text-slate-400">
                    <span>Use <strong className="text-slate-200">←</strong> / <strong className="text-slate-200">→</strong> keys to dodge</span>
                    <div className="flex gap-2">
                        <button
                            onClick={() => { if (gameActive) playerXRef.current = Math.max(15, playerXRef.current - 25); }}
                            className="px-3 py-1 rounded bg-slate-800 hover:bg-slate-700 text-white font-bold"
                        >
                            ◀ LEFT
                        </button>
                        <button
                            onClick={() => { if (gameActive) playerXRef.current = Math.min(285, playerXRef.current + 25); }}
                            className="px-3 py-1 rounded bg-slate-800 hover:bg-slate-700 text-white font-bold"
                        >
                            RIGHT ▶
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}