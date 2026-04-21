import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Menu, X, Home, ShoppingBag, BarChart3, Package, User, LogOut, Shield } from "lucide-react";
import toast from "react-hot-toast";

const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const { isAuthenticated, logout, user, isAdmin, isSeller, isDelivery } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        toast.success("Logged out successfully");
        navigate("/login");
        setIsOpen(false);
    };

    const close = () => setIsOpen(false);

    return (
        <nav className="bg-gradient-to-r from-green-700 to-green-600 shadow-xl sticky top-0 z-50 text-white">
            <div className="max-w-7xl mx-auto px-4">
                <div className="flex justify-between items-center h-16">
                    {/* Logo */}
                    <Link to="/" className="flex items-center space-x-2 font-black text-2xl tracking-tight" onClick={close}>
                        <span className="text-3xl">🌾</span>
                        <span>AgriMart</span>
                    </Link>

                    <div className="hidden md:flex items-center space-x-1">
                        {!isDelivery && (
                            <>
                                <NavLink to="/"           icon={<Home size={18}/>}        label="Home"        onClick={close}/>
                                <NavLink to="/marketplace" icon={<ShoppingBag size={18}/>} label="Marketplace" onClick={close}/>
                            </>
                        )}
                        {isAuthenticated && (
                            <>
                                {(isSeller || isAdmin) && (
                                    <NavLink to="/seller/dashboard" icon={<Shield size={18}/>} label="Store Hub" onClick={close}/>
                                )}
                                {isDelivery && (
                                    <NavLink to="/delivery/dashboard" icon={<BarChart3 size={18}/>} label="Logistics Hub" onClick={close}/>
                                )}
                                {!isDelivery && <NavLink to="/orders"    icon={<Package size={18}/>}   label="Orders"    onClick={close}/>}

                                <NavLink to="/profile"   icon={<User size={18}/>}      label="Profile"   onClick={close}/>
                                {isAdmin && (
                                    <NavLink to="/admin" icon={<Shield size={18}/>} label="Admin" onClick={close}/>
                                )}
                                <button onClick={handleLogout}
                                    className="flex items-center space-x-1 p-2 rounded-lg hover:bg-red-500/30 text-red-100 transition">
                                    <LogOut size={18}/>
                                    <span>Logout</span>
                                </button>
                            </>
                        )}
                        {!isAuthenticated && (
                            <>
                                <Link to="/login" onClick={close} className="p-2 rounded-lg hover:bg-white/20 transition">Login</Link>
                                <Link to="/register" onClick={close}
                                    className="bg-amber-400 text-black px-4 py-2 rounded-lg font-semibold hover:bg-amber-300 transition">
                                    Register
                                </Link>
                            </>
                        )}
                    </div>

                    {/* Mobile menu toggle */}
                    <button className="md:hidden p-1 rounded-md hover:bg-white/20 transition"
                        onClick={() => setIsOpen(!isOpen)}>
                        {isOpen ? <X size={24}/> : <Menu size={24}/>}
                    </button>
                </div>

                {/* Mobile dropdown */}
                {isOpen && (
                    <div className="md:hidden pb-4 pt-2 space-y-1 border-t border-green-500/50">
                        {!isDelivery && (
                            <>
                                <NavLink to="/"            icon={<Home size={18}/>}        label="Home"        onClick={close}/>
                                <NavLink to="/marketplace" icon={<ShoppingBag size={18}/>} label="Marketplace" onClick={close}/>
                            </>
                        )}
                        {isAuthenticated && (
                            <>
                                {isDelivery && <NavLink to="/delivery/dashboard" icon={<BarChart3 size={18}/>} label="Logistics Hub" onClick={close}/>}
                                {!isDelivery && <NavLink to="/orders"    icon={<Package size={18}/>}      label="Orders"    onClick={close}/>}
                                <NavLink to="/profile"   icon={<User size={18}/>}         label="Profile"   onClick={close}/>
                                {isAdmin && <NavLink to="/admin" icon={<Shield size={18}/>} label="Admin" onClick={close}/>}
                                <button onClick={handleLogout}
                                    className="w-full flex items-center space-x-2 p-2 rounded-lg hover:bg-red-500/30 text-red-100 transition">
                                    <LogOut size={18}/><span>Logout</span>
                                </button>
                            </>
                        )}
                        {!isAuthenticated && (
                            <>
                                <NavLink to="/login"    label="Login"    onClick={close}/>
                                <NavLink to="/register" label="Register" onClick={close}/>
                            </>
                        )}
                    </div>
                )}
            </div>
        </nav>
    );
};

function NavLink({ to, icon, label, onClick }) {
    return (
        <Link to={to} onClick={onClick}
            className="flex items-center space-x-1 p-2 rounded-lg hover:bg-white/20 transition text-white">
            {icon}
            <span>{label}</span>
        </Link>
    );
}

export default Navbar;
