import axios from "axios";

const api = axios.create({
    baseURL: "https://abhishek-katwal-pw-calendar.onrender.com",
});

// Request Interceptor: Har request mein token automatically attach karne ke liye
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("admin_token");
        if (token) {
            config.headers["x-admin-token"] = token;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response Interceptor: Token expiry (401) ko handle karne ke liye
api.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        if (error.response && error.response.status === 401) {
            localStorage.removeItem("admin_token");
            window.location.href = "/login";
        }
        return Promise.reject(error);
    }
);

export default api;