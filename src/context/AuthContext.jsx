import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem("admin_token"));
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // App start hote hi check karein ki token valid hai ya nahi
        const token = localStorage.getItem("admin_token");
        setIsAuthenticated(!!token);
        setLoading(false);
    }, []);

    const login = (token) => {
        localStorage.setItem("admin_token", token);
        setIsAuthenticated(true);
    };

    const logout = () => {
        localStorage.removeItem("admin_token");
        setIsAuthenticated(false);
        window.location.href = "/login";
    };

    return (
        <AuthContext.Provider value={{ isAuthenticated, login, logout, loading }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);