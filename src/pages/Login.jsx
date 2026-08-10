import { useEffect, useState, useRef } from "react";
import { GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import api from "@/api/axios";
import { ShieldCheck, Sparkles, Gamepad2, Play, RotateCcw } from "lucide-react";

export default function Login() {
    const navigate = useNavigate();

    // --- MINI ARCADE GAME STATES ---
    const [isPlaying, setIsPlaying] = useState(false);
    const [score, setScore] = useState(0);
    const [highScore, setHighScore] = useState(0);
    const [gameOver, setGameOver] = useState(false);
    const shipYRef = useRef(120);
    const obstacleXRef = useRef(300);
    const obstacleHRef = useRef(40);
    const requestRef = useRef(null);

    // --- GAME LOOP ---
    useEffect(() => {
        if (!isPlaying || gameOver) return;

        const updateGame = () => {
            obstacleXRef.current -= 4;
            if (obstacleXRef.current < -20) {
                obstacleXRef.current = 320;
                obstacleHRef.current = Math.floor(Math.random() * 50) + 30;
                setScore(s => {
                    const newS = s + 10;
                    if (newS > highScore) setHighScore(newS);
                    return newS;
                });
            }

            // Collision check (Ship box vs Obstacle box)
            if (
                obstacleXRef.current < 55 &&
                obstacleXRef.current > 15 &&
                shipYRef.current > (160 - obstacleHRef.current)
            ) {
                setGameOver(true);
                setIsPlaying(false);
            }

            requestRef.current = requestAnimationFrame(updateGame);
        };

        requestRef.current = requestAnimationFrame(updateGame);
        return () => cancelAnimationFrame(requestRef.current);
    }, [isPlaying, gameOver, highScore]);

    // Keyboard controls for game
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.code === "Space" || e.code === "ArrowUp") {
                e.preventDefault();
                if (!isPlaying && !gameOver) {
                    setIsPlaying(true);
                } else if (isPlaying) {
                    shipYRef.current = Math.max(10, shipYRef.current - 35);
                }
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [isPlaying, gameOver]);

    const restartGame = () => {
        setScore(0);
        setGameOver(false);
        obstacleXRef.current = 300;
        shipYRef.current = 120;
        setIsPlaying(true);
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
        <div className="flex min-h-screen items-center justify-center bg-[#070912] p-4 text-white relative overflow-hidden flex-col gap-6">
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

                <div className="flex justify-center transition hover:scale-[1.02] mb-5">
                    <GoogleLogin
                        onSuccess={handleGoogleSuccess}
                        onError={() => toast.error("Google Login Failed. Try again.")}
                        theme="filled_black"
                        shape="pill"
                        size="large"
                    />
                </div>
            </div>

            {/* --- CYBER ARCADE EASTER EGG GAME WIDGET --- */}
            <div className="w-full max-w-md rounded-2xl border border-slate-800/80 bg-[#090b12]/90 p-4 shadow-xl glass-card relative z-10 text-center">
                <div className="flex items-center justify-between mb-2">
                    <span className="flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-widest text-cyan-400">
                        <Gamepad2 size={13} /> Cyber Dodger Arcade
                    </span>
                    <div className="flex gap-3 text-[11px] font-mono">
                        <span className="text-slate-400">SCORE: <strong className="text-white">{score}</strong></span>
                        <span className="text-slate-400">BEST: <strong className="text-indigo-400">{highScore}</strong></span>
                    </div>
                </div>

                {/* GAME SCREEN */}
                <div className="relative h-28 w-full rounded-xl border border-slate-800 bg-black/60 overflow-hidden flex items-center">
                    {/* Grid lines background */}
                    <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f2937_1px,transparent_1px),linear-gradient(to_bottom,#1f2937_1px,transparent_1px)] bg-[size:20px_20px] opacity-20" />

                    {!isPlaying && !gameOver && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 backdrop-blur-xs z-10">
                            <p className="text-[11px] font-bold text-slate-300 mb-2">Press SPACE or Click to Play while waiting!</p>
                            <button
                                onClick={() => setIsPlaying(true)}
                                className="flex items-center gap-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 px-4 py-1.5 text-[10px] font-extrabold text-slate-950 transition cursor-pointer"
                            >
                                <Play size={12} /> Start Arcade
                            </button>
                        </div>
                    )}

                    {gameOver && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 backdrop-blur-xs z-10">
                            <p className="text-xs font-bold text-rose-400 mb-1">CRASH DETECTED!</p>
                            <button
                                onClick={restartGame}
                                className="flex items-center gap-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 px-4 py-1.5 text-[10px] font-bold text-white transition cursor-pointer"
                            >
                                <RotateCcw size={12} /> Play Again
                            </button>
                        </div>
                    )}

                    {/* PLAYER SHIP */}
                    <div
                        className="absolute left-10 w-5 h-5 rounded-md bg-cyan-400 shadow-[0_0_12px_rgba(34,211,238,0.8)] transition-all duration-75 flex items-center justify-center text-[9px] font-bold text-slate-950"
                        style={{ bottom: `${shipYRef.current}px` }}
                        onClick={() => { if (isPlaying) shipYRef.current = Math.max(10, shipYRef.current - 30); }}
                    >
                        ▲
                    </div>

                    {/* OBSTACLE */}
                    <div
                        className="absolute w-4 rounded-t-md bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.7)]"
                        style={{
                            right: `${obstacleXRef.current}px`,
                            bottom: '0px',
                            height: `${obstacleHRef.current}px`
                        }}
                    />
                </div>
                <p className="text-[10px] text-slate-500 mt-2">Tap/Click or press SPACE to jump your cyber-ship over obstacles.</p>
            </div>
        </div>
    );
}