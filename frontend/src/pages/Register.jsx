import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../services/api";
import toast from "react-hot-toast";
import { Eye, EyeOff, Loader2 } from "lucide-react";

const ROLES = [
    { value: "user",     label: "Buyer" },
    { value: "seller",   label: "Seller" },
    { value: "delivery", label: "Delivery Partner" },
];


function Register() {
    const navigate = useNavigate();
    const [form, setForm] = useState({
        name: "", email: "", password: "", confirmPassword: "",
        phone: "", address: "", role: "user"
    });
    const [showPwd, setShowPwd] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (form.password !== form.confirmPassword) {
            toast.error("Passwords do not match");
            return;
        }
        if (form.password.length < 6) {
            toast.error("Password must be at least 6 characters");
            return;
        }
        setLoading(true);
        try {
            const { confirmPassword, ...payload } = form;
            const res = await API.post("/auth/register", payload);
            toast.success(res.data.message || "Account created! Please login.");
            navigate("/login");
        } catch (err) {
            toast.error(err.response?.data?.message || "Registration failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex">
            {/* Left Panel */}
            <div className="hidden md:flex w-1/2 bg-gradient-to-br from-green-700 to-emerald-600 text-white flex-col justify-center items-center px-12">
                <div className="max-w-md text-center">
                    <div className="text-7xl mb-6">🌿</div>
                    <h1 className="text-4xl font-black mb-4">Join AgriMart</h1>
                    <p className="text-lg text-green-100 leading-relaxed">
                        Create your account and start buying or selling agricultural products today.
                    </p>
                    <div className="mt-8 space-y-3 text-left">
                        {["✅ Free to register", "✅ Buy fresh products", "✅ Sell your crops", "✅ Secure platform"].map(i => (
                            <div key={i} className="bg-white/10 backdrop-blur rounded-xl px-4 py-3 font-medium">{i}</div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Right Panel */}
            <div className="flex-1 flex items-center justify-center bg-gray-50 px-4 py-8">
                <div className="w-full max-w-md">
                    <div className="bg-white rounded-3xl shadow-2xl p-10">
                        <div className="text-center mb-6">
                            <h2 className="text-3xl font-black text-gray-800">Create Account</h2>
                            <p className="text-gray-500 mt-1">Fill in the details below</p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            {/* Role selector */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">I am a...</label>
                                <div className="grid grid-cols-3 gap-2">
                                    {ROLES.map(r => (
                                        <button key={r.value} type="button"
                                            onClick={() => setForm({ ...form, role: r.value })}
                                            className={`py-2.5 px-3 rounded-xl border-2 text-sm font-semibold transition ${form.role === r.value
                                                    ? "border-green-500 bg-green-50 text-green-700"
                                                    : "border-gray-200 text-gray-600 hover:border-gray-300"
                                                }`}>
                                            {r.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <Field label="Full Name" name="name" type="text" value={form.name} onChange={handleChange} placeholder="Ramesh Kumar" />
                            <Field label="Email" name="email" type="email" value={form.email} onChange={handleChange} placeholder="you@example.com" />
                            <Field label="Phone Number" name="phone" type="tel" value={form.phone} onChange={handleChange} placeholder="+91 98765 43210" />

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Password</label>
                                <div className="relative">
                                    <input type={showPwd ? "text" : "password"} name="password"
                                        value={form.password} onChange={handleChange}
                                        placeholder="Min. 6 characters" required
                                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 outline-none transition pr-12 text-gray-800" />
                                    <button type="button" onClick={() => setShowPwd(!showPwd)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1">
                                        {showPwd ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                            </div>

                            <Field label="Confirm Password" name="confirmPassword" type="password"
                                value={form.confirmPassword} onChange={handleChange} placeholder="Re-enter password" />

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Address</label>
                                <textarea name="address" value={form.address} onChange={handleChange}
                                    placeholder="Your full address" required rows={2}
                                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 outline-none transition resize-none text-gray-800" />
                            </div>

                            <button type="submit" disabled={loading}
                                className="w-full bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white font-bold py-3.5 rounded-xl transition-colors flex items-center justify-center gap-2 text-lg mt-2">
                                {loading ? <><Loader2 size={20} className="animate-spin" />Creating...</> : "Create Account"}
                            </button>
                        </form>

                        <p className="text-center text-gray-500 mt-5 text-sm">
                            Already have an account?{" "}
                            <Link to="/login" className="text-green-600 font-bold hover:underline">Sign in →</Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

function Field({ label, name, type, value, onChange, placeholder }) {
    return (
        <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">{label}</label>
            <input type={type} name={name} value={value} onChange={onChange}
                placeholder={placeholder} required
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 outline-none transition text-gray-800" />
        </div>
    );
}

export default Register;