import axios from "axios";

const API = axios.create({
    baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api"
});

// Attach JWT token to every request
API.interceptors.request.use((req) => {
    const token = localStorage.getItem("token");
    if (token) {
        req.headers.Authorization = `Bearer ${token}`;
    }
    return req;
});

// Global response error interceptor
API.interceptors.response.use(
    (res) => res,
    (err) => {
        if (err.response) {
            console.error(`📡 API Error [${err.response.status}]:`, err.response.data);
        }
        if (err.response?.status === 401) {
            // Token expired — clear session and redirect
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            if (window.location.pathname !== "/login") {
                window.location.href = "/login";
            }
        }
        return Promise.reject(err);
    }
);

export default API;
