import { Navigate } from "react-router-dom";

export const ProtectedRoute = ({ children }) => {
    const token = localStorage.getItem("admin_token");

    // Agar token nahi hai, toh login page par bhej do
    if (!token) {
        return <Navigate to="/login" replace />;
    }

    // Agar token hai, toh jo component manga hai use render karo
    return children;
};