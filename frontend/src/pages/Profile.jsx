import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import API from "../services/api";
import toast from "react-hot-toast";
import Loader from "../components/Loader";
import { User, Mail, Phone, MapPin, Shield, Edit2, Save, X } from "lucide-react";

function Profile() {
    const { user: authUser, logout, login: updateAuthUser } = useAuth();
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [form, setForm] = useState({ name: "", phone: "", address: "" });

    useEffect(() => {
        API.get("/auth/profile")
            .then(res => {
                // ✅ FIX: handle both response formats safely
                const userData = res.data.user || res.data;

                setUser(userData);

                setForm({
                    name: userData?.name || "",
                    phone: userData?.phone || "",
                    address: userData?.address || ""
                });
            })
            .catch(() => {
                toast.error("Failed to load profile");
                logout();
                navigate("/login");
            })
            .finally(() => setLoading(false));
    }, [logout, navigate]);

    const handleSave = async () => {
        setSaving(true);
        try {
            const res = await API.put("/auth/profile", form);

            const updatedUser = res.data.user || res.data;

            setUser(updatedUser);

            // update auth context
            const token = localStorage.getItem("token");
            if (token) {
                updateAuthUser(token, { ...authUser, name: updatedUser.name });
            }

            setEditing(false);
            toast.success("Profile updated! ✅");
        } catch (err) {
            toast.error(err.response?.data?.message || "Update failed");
        } finally {
            setSaving(false);
        }
    };

    const handleLogout = async () => {
        await logout();
        toast.success("Logged out");
        navigate("/login");
    };

    const roleStyles = {
        admin: "bg-red-100 text-red-700",
        seller: "bg-blue-100 text-blue-700",
        delivery: "bg-purple-100 text-purple-700",
        user: "bg-green-100 text-green-700",
    };

    if (loading) return <Loader fullPage />;

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="bg-green-700 text-white px-4 py-8">
                <div className="max-w-3xl mx-auto flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-black">👤 My Profile</h1>
                        <p className="text-green-200 mt-1">Your account information</p>
                    </div>
                    <div className="flex gap-2">
                        {!editing && (
                            <button onClick={() => setEditing(true)}
                                className="bg-white/20 hover:bg-white/30 backdrop-blur text-white px-5 py-2.5 rounded-xl font-semibold transition flex items-center gap-2">
                                <Edit2 size={16} /> Edit
                            </button>
                        )}
                        <button onClick={handleLogout}
                            className="bg-red-500 hover:bg-red-600 text-white px-5 py-2.5 rounded-xl font-semibold transition">
                            Logout
                        </button>
                    </div>
                </div>
            </div>

            <div className="max-w-3xl mx-auto px-4 py-8">
                <div className="bg-white rounded-3xl shadow-lg overflow-hidden">
                    {/* Avatar */}
                    <div className="bg-gradient-to-r from-green-600 to-emerald-500 h-24 relative">
                        <div className="absolute -bottom-10 left-8 w-20 h-20 rounded-2xl bg-white border-4 border-white shadow-lg flex items-center justify-center text-3xl font-black text-green-600">
                            {user?.name?.[0]?.toUpperCase()}
                        </div>
                    </div>

                    <div className="pt-14 px-8 pb-8">
                        <div className="flex items-center justify-between mb-1">
                            <h2 className="text-2xl font-black text-gray-800">
                                {user?.name || "—"}
                            </h2>
                            <span className={`text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1 ${roleStyles[user?.role] || "bg-gray-100"}`}>
                                <Shield size={12} /> {user?.role || "user"}
                            </span>
                        </div>

                        <p className="text-gray-500 text-sm mb-6">
                            Member since {
                                user?.created_at
                                    ? new Date(user.created_at).toLocaleDateString("en-IN", {
                                        year: "numeric",
                                        month: "long"
                                    })
                                    : "—"
                            }
                        </p>

                        {editing ? (
                            <div className="space-y-4">
                                <EditField icon={<User size={18} />} label="Full Name" value={form.name}
                                    onChange={e => setForm({ ...form, name: e.target.value })} />
                                <InfoRow icon={<Mail size={18} />} label="Email" value={user?.email} />
                                <EditField icon={<Phone size={18} />} label="Phone" value={form.phone}
                                    onChange={e => setForm({ ...form, phone: e.target.value })} />
                                <EditField icon={<MapPin size={18} />} label="Address" value={form.address}
                                    onChange={e => setForm({ ...form, address: e.target.value })} textarea />

                                <div className="flex gap-3 pt-2">
                                    <button onClick={handleSave} disabled={saving}
                                        className="flex-1 flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white font-bold py-3 rounded-xl transition">
                                        <Save size={16} /> {saving ? "Saving..." : "Save Changes"}
                                    </button>
                                    <button
                                        onClick={() => {
                                            setEditing(false);
                                            setForm({
                                                name: user?.name || "",
                                                phone: user?.phone || "",
                                                address: user?.address || ""
                                            });
                                        }}
                                        className="px-5 py-3 border-2 border-gray-200 rounded-xl hover:border-gray-300 transition text-gray-600">
                                        <X size={20} />
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <InfoRow icon={<User size={18} />} label="Full Name" value={user?.name} />
                                <InfoRow icon={<Mail size={18} />} label="Email" value={user?.email} />
                                <InfoRow icon={<Phone size={18} />} label="Phone" value={user?.phone} />
                                <InfoRow icon={<MapPin size={18} />} label="Address" value={user?.address} />
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

function InfoRow({ icon, label, value }) {
    return (
        <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl">
            <div className="text-green-600 mt-0.5 flex-shrink-0">{icon}</div>
            <div className="min-w-0">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">{label}</p>
                <p className="text-gray-800 font-medium break-words">{value || "—"}</p>
            </div>
        </div>
    );
}

function EditField({ icon, label, value, onChange, textarea }) {
    const cls = "w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 outline-none transition text-gray-800";

    return (
        <div className="flex items-start gap-4 p-4 bg-green-50/50 rounded-xl border-2 border-green-100">
            <div className="text-green-600 mt-3 flex-shrink-0">{icon}</div>
            <div className="flex-1">
                <p className="text-xs font-semibold text-green-600 uppercase tracking-wide mb-1">{label}</p>
                {textarea
                    ? <textarea value={value || ''} onChange={onChange} rows={2} className={`${cls} resize-none`} />
                    : <input type="text" value={value || ''} onChange={onChange} className={cls} />
                }
            </div>
        </div>
    );
}

export default Profile;