import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import API from "../services/api";
import toast from "react-hot-toast";
import { Eye, EyeOff, Loader2 } from "lucide-react";

function Login() {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [form, setForm] = useState({ email: "", password: "" });
    const [showPwd, setShowPwd] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.email || !form.password) {
            toast.error("Please fill all fields");
            return;
        }
        setLoading(true);
        try {
            const res = await API.post("/auth/login", form);
            login(res.data.token, res.data.user);
            toast.success(`Welcome back, ${res.data.user.name}! 👋`);
            
            // Role-based redirection
            const { role } = res.data.user;
            if (role === "admin") navigate("/admin");
            else if (role === "seller") navigate("/seller/dashboard");
            else if (role === "delivery") navigate("/delivery/dashboard");
            else navigate("/marketplace");

        } catch (err) {
            toast.error(err.response?.data?.message || "Login failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex">
            {/* Left Panel */}
            <div className="hidden md:flex w-1/2 bg-gradient-to-br from-green-700 to-emerald-600 text-white flex-col justify-center items-center px-12">
                <div className="max-w-md text-center">
                    <div className="text-7xl mb-6">🌾</div>
                    <h1 className="text-5xl font-black mb-4">AgriMart</h1>
                    <p className="text-lg text-green-100 leading-relaxed">
                        India's trusted digital marketplace connecting farmers and buyers directly.
                    </p>
                    <div className="mt-10 grid grid-cols-2 gap-4 text-sm">
                        {["2,000+ Sellers", "15,000+ Products", "50,000+ Orders", "250+ Cities"].map(s => (
                            <div key={s} className="bg-white/10 backdrop-blur rounded-xl px-4 py-3 font-semibold">
                                {s}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Right Panel */}
            <div className="flex-1 flex items-center justify-center bg-gray-50 px-4">
                <div className="w-full max-w-md">
                    <div className="bg-white rounded-3xl shadow-2xl p-10">
                        <div className="text-center mb-8">
                            <div className="text-4xl mb-2">👤</div>
                            <h2 className="text-3xl font-black text-gray-800">Welcome Back</h2>
                            <p className="text-gray-500 mt-1">Sign in to your account</p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Email Address</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={form.email}
                                    onChange={handleChange}
                                    placeholder="you@example.com"
                                    required
                                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-0 outline-none transition text-gray-800"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Password</label>
                                <div className="relative">
                                    <input
                                        type={showPwd ? "text" : "password"}
                                        name="password"
                                        value={form.password}
                                        onChange={handleChange}
                                        placeholder="Your password"
                                        required
                                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-0 outline-none transition text-gray-800 pr-12"
                                    />
                                    <button type="button" onClick={() => setShowPwd(!showPwd)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1">
                                        {showPwd ? <EyeOff size={18}/> : <Eye size={18}/>}
                                    </button>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white font-bold py-3.5 rounded-xl transition-colors flex items-center justify-center gap-2 text-lg"
                            >
                                {loading ? <><Loader2 size={20} className="animate-spin"/>Signing in...</> : "Sign In"}
                            </button>
                        </form>

                        <p className="text-center text-gray-500 mt-6 text-sm">
                            Don't have an account?{" "}
                            <Link to="/register" className="text-green-600 font-bold hover:underline">Create one →</Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Login;