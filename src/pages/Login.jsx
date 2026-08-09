import { GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import api from "@/api/axios";

export default function Login() {
    const navigate = useNavigate();

    const handleGoogleSuccess = async (credentialResponse) => {
        try {
            const decoded = jwtDecode(credentialResponse.credential);
            const userEmail = decoded.email;

            // Backend par check karega ki email allowed list mein hai ya nahi
            const response = await api.post("/api/verify-admin", { email: userEmail });

            if (response.data.status === "success") {
                localStorage.setItem("admin_token", credentialResponse.credential);
                localStorage.setItem("user_email", userEmail); // <--- Yeh zaroori hai

                toast.success(`Welcome back, ${decoded.name}!`);
                navigate("/");
            }
        } catch (err) {
            const errorMsg = err.response?.data?.detail || "Access denied.";
            toast.error(errorMsg);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-[#070912] p-4 text-white">
            <div className="w-full max-w-md rounded-3xl border border-slate-800 bg-[#0d111a] p-8 text-center shadow-2xl">
                <h1 className="text-2xl font-bold mb-2">PW Calendar Admin</h1>
                <p className="text-xs text-slate-400 mb-8">Authorized personnel only. Please sign in with Google.</p>

                <div className="flex justify-center">
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