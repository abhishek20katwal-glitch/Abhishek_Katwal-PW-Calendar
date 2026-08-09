import { useEffect, useRef } from "react";
import { GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import api from "@/api/axios";
import { ShieldCheck, Sparkles } from "lucide-react";

export default function Login() {
    const navigate = useNavigate();

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
        <div className="flex min-h-screen items-center justify-center bg-[#070912] p-4 text-white relative overflow-hidden">
            {/* Ambient Background Glow Orbs */}
            <div className="pointer-events-none absolute -left-20 -top-20 h-96 w-96 rounded-full bg-indigo-600/10 blur-3xl" />
            <div className="pointer-events-none absolute -right-20 -bottom-20 h-96 w-96 rounded-full bg-violet-600/10 blur-3xl" />

            <div className="w-full max-w-md rounded-[32px] border border-slate-800 bg-[#0d111a] p-8 text-center shadow-2xl glass-card relative z-10">
                <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 shadow-inner">
                    <ShieldCheck size={26} />
                </div>

                <div className="mb-2 flex items-center justify-center gap-1.5">
                    <span className="inline-flex items-center gap-1 rounded-full border border-indigo-400/20 bg-indigo-500/10 px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-[0.18em] text-indigo-300">
                        <Sparkles size={10} /> Secure Gateway
                    </span>
                </div>

                <h1 className="text-2xl font-bold mb-1 text-white">PW Calendar Pro</h1>
                <p className="text-xs text-slate-400 mb-8">Authorized personnel only. Please sign in with Google credentials.</p>

                <div className="flex justify-center transition hover:scale-[1.02]">
                    <GoogleLogin
                        onSuccess={handleGoogleSuccess}
                        onError={() => toast.error("Google Login Failed. Try again.")}
                        theme="filled_black"
                        shape="pill"
                        size="large"
                    />
                </div>
            </div>
        </div>
    );
}