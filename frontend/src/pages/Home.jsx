import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../services/api";
import ProductCard from "../components/ProductCard";
import Footer from "../components/Footer";
import Loader from "../components/Loader";

function Home() {
    const [featuredProducts, setFeaturedProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        API.get("/products")
            .then(res => setFeaturedProducts(res.data.slice(0, 6)))
            .catch((err) => console.error("Failed to load featured products:", err))
            .finally(() => setLoading(false));
    }, []);

    return (
        <div className="min-h-screen flex flex-col bg-gray-50">

            {/* ── Hero ────────────────────────────────── */}
            <section className="relative bg-gradient-to-br from-green-700 via-green-600 to-emerald-500 text-white overflow-hidden">
                <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/leaf.png')]"/>
                <div className="relative max-w-6xl mx-auto px-4 py-24 text-center">
                    <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur px-4 py-2 rounded-full text-sm font-medium mb-6">
                        🌿 India's Farmer-First Marketplace
                    </div>
                    <h1 className="text-5xl md:text-7xl font-black mb-6 leading-tight">
                        Farm Fresh,<br/>
                        <span className="text-amber-300">Delivered Direct</span>
                    </h1>
                    <p className="text-xl text-green-100 max-w-2xl mx-auto mb-10 leading-relaxed">
                        Connect directly with farmers. Buy fresh agricultural products
                        at the best prices — no middlemen, no hassle.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link to="/marketplace"
                            className="bg-amber-400 hover:bg-amber-300 text-black font-bold px-8 py-4 rounded-2xl text-lg transition-colors shadow-lg">
                            🌾 Explore Marketplace
                        </Link>
                        <Link to="/register"
                            className="bg-white/20 hover:bg-white/30 text-white font-bold px-8 py-4 rounded-2xl text-lg backdrop-blur transition-colors">
                            Become a Seller →
                        </Link>
                    </div>
                </div>
                {/* Wave */}
                <div className="absolute bottom-0 left-0 right-0">
                    <svg viewBox="0 0 1440 80" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M0,40 C360,80 1080,0 1440,40 L1440,80 L0,80 Z" fill="#f9fafb"/>
                    </svg>
                </div>
            </section>

            {/* ── Stats ───────────────────────────────── */}
            <section className="max-w-6xl mx-auto px-4 -mt-2 py-12">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    {[
                        { label: "Farmers",       value: "2,000+",  icon: "👨‍🌾" },
                        { label: "Products",      value: "15,000+", icon: "🌾" },
                        { label: "Orders Placed", value: "50,000+", icon: "📦" },
                        { label: "Cities Served", value: "250+",    icon: "🏙️" },
                    ].map(s => (
                        <div key={s.label} className="bg-white rounded-2xl p-6 text-center shadow-md hover:shadow-lg transition-shadow">
                            <div className="text-4xl mb-2">{s.icon}</div>
                            <div className="text-2xl font-black text-green-700">{s.value}</div>
                            <div className="text-gray-500 text-sm">{s.label}</div>
                        </div>
                    ))}
                </div>
            </section>

            {/* ── Features ───────────────────────────── */}
            <section className="max-w-6xl mx-auto px-4 py-10">
                <h2 className="text-3xl font-black text-gray-800 text-center mb-10">Why AgriMart?</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[
                        { icon: "🌱", title: "Direct from Farmers", desc: "No middlemen — get the freshest produce at fair prices directly from the source." },
                        { icon: "🔒", title: "Secure Payments",     desc: "Safe, verified transactions with buyer protection on every order." },
                        { icon: "🚚", title: "Fast Delivery",       desc: "Reliable logistics to get your order delivered right to your doorstep." },
                    ].map(f => (
                        <div key={f.title} className="bg-white rounded-2xl p-8 shadow-md hover:shadow-xl transition-shadow text-center group">
                            <div className="text-5xl mb-4 group-hover:scale-110 transition-transform inline-block">{f.icon}</div>
                            <h3 className="text-xl font-bold text-gray-800 mb-2">{f.title}</h3>
                            <p className="text-gray-500 leading-relaxed">{f.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* ── Featured Products ──────────────────── */}
            <section className="max-w-6xl mx-auto px-4 py-10">
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-3xl font-black text-gray-800">Featured Products</h2>
                    <Link to="/marketplace" className="text-green-600 hover:text-green-700 font-semibold transition">
                        View all →
                    </Link>
                </div>
                {loading ? (
                    <Loader/>
                ) : featuredProducts.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {featuredProducts.map(p => <ProductCard key={p.id} product={p}/>)}
                    </div>
                ) : (
                    <div className="text-center py-16 text-gray-400">
                        <div className="text-6xl mb-4">🌾</div>
                        <p className="text-lg">No products yet. Be the first seller!</p>
                        <Link to="/register" className="mt-4 inline-block bg-green-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-green-700 transition">
                            Register as Seller
                        </Link>
                    </div>
                )}
            </section>

            {/* ── CTA ───────────────────────────────── */}
            <section className="bg-green-700 text-white mt-10">
                <div className="max-w-4xl mx-auto px-4 py-16 text-center">
                    <h2 className="text-4xl font-black mb-4">Ready to start selling?</h2>
                    <p className="text-green-200 text-lg mb-8">
                        Join thousands of farmers already growing their business on AgriMart.
                    </p>
                    <Link to="/register"
                        className="bg-amber-400 hover:bg-amber-300 text-black font-bold px-8 py-4 rounded-2xl text-lg transition-colors shadow-lg inline-block">
                        Get Started Free
                    </Link>
                </div>
            </section>

            <Footer/>
        </div>
    );
}

export default Home;