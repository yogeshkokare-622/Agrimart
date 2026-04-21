import React from "react";
import { Link } from "react-router-dom";

function Footer() {
    const year = new Date().getFullYear();
    return (
        <footer className="bg-green-800 text-green-100 mt-auto">
            <div className="max-w-7xl mx-auto px-4 py-10 grid grid-cols-1 md:grid-cols-3 gap-8">
                <div>
                    <div className="text-2xl font-black mb-2">🌾 AgriMart</div>
                    <p className="text-green-300 text-sm leading-relaxed">
                        Connecting farmers and buyers across India.
                        Fresh. Direct. Reliable.
                    </p>
                </div>
                <div>
                    <h4 className="font-bold mb-3 text-white">Quick Links</h4>
                    <ul className="space-y-1 text-sm text-green-300">
                        <li><Link to="/"            className="hover:text-white transition">Home</Link></li>
                        <li><Link to="/marketplace" className="hover:text-white transition">Marketplace</Link></li>
                        <li><Link to="/login"       className="hover:text-white transition">Login</Link></li>
                        <li><Link to="/register"    className="hover:text-white transition">Register</Link></li>
                    </ul>
                </div>
                <div>
                    <h4 className="font-bold mb-3 text-white">Contact</h4>
                    <p className="text-green-300 text-sm">support@agrimart.in</p>
                    <p className="text-green-300 text-sm">+91 98765 43210</p>
                </div>
            </div>
            <div className="border-t border-green-700 text-center py-4 text-sm text-green-400">
                © {year} AgriMart. All rights reserved.
            </div>
        </footer>
    );
}

export default Footer;
