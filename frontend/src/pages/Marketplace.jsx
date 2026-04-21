import React, { useEffect, useState } from "react";
import API from "../services/api";
import ProductCard from "../components/ProductCard";
import Loader from "../components/Loader";
import Footer from "../components/Footer";
import { Search, Filter } from "lucide-react";

const CATEGORIES = ["All", "Vegetables", "Fruits", "Grains", "Dairy", "Spices", "Seeds", "Tools"];

function Marketplace() {
    const [products, setProducts]     = useState([]);
    const [loading, setLoading]       = useState(true);
    const [search, setSearch]         = useState("");
    const [category, setCategory]     = useState("All");
    const [sortBy, setSortBy]         = useState("newest");

    const fetchProducts = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (search)              params.append("search", search);
            if (category !== "All") params.append("category", category);
            const res = await API.get(`/products?${params}`);
            setProducts(res.data);
        } catch (err) {
            console.error("Failed to load products:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [category]);

    const handleSearch = (e) => {
        e.preventDefault();
        fetchProducts();
    };

    const sorted = [...products].sort((a, b) => {
        if (sortBy === "price-asc")  return a.price - b.price;
        if (sortBy === "price-desc") return b.price - a.price;
        return b.id - a.id; // newest
    });

    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            {/* Hero */}
            <div className="bg-gradient-to-r from-green-700 to-emerald-600 text-white py-12 px-4">
                <div className="max-w-6xl mx-auto text-center">
                    <h1 className="text-4xl font-black mb-3">🌾 AgriMart Marketplace</h1>
                    <p className="text-green-100 text-lg mb-6">Fresh products. Direct from farmers.</p>

                    {/* Search */}
                    <form onSubmit={handleSearch} className="max-w-xl mx-auto flex gap-2">
                        <div className="relative flex-1">
                            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"/>
                            <input
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                placeholder="Search products, crops, tools..."
                                className="w-full pl-11 pr-4 py-3 rounded-xl text-gray-800 focus:ring-2 focus:ring-amber-300 outline-none"
                            />
                        </div>
                        <button type="submit" className="bg-amber-400 hover:bg-amber-300 text-black font-bold px-6 py-3 rounded-xl transition">
                            Search
                        </button>
                    </form>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 py-8 flex-1">
                {/* Filters */}
                <div className="flex flex-col sm:flex-row gap-4 mb-8 items-center justify-between">
                    {/* Category pills */}
                    <div className="flex gap-2 overflow-x-auto pb-1 flex-wrap">
                        {CATEGORIES.map(cat => (
                            <button key={cat} onClick={() => setCategory(cat)}
                                className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition ${
                                    category === cat
                                        ? "bg-green-600 text-white shadow-md"
                                        : "bg-white text-gray-600 border border-gray-200 hover:border-green-300"
                                }`}>
                                {cat}
                            </button>
                        ))}
                    </div>

                    {/* Sort */}
                    <div className="flex items-center gap-2">
                        <Filter size={16} className="text-gray-400"/>
                        <select value={sortBy} onChange={e => setSortBy(e.target.value)}
                            className="border-2 border-gray-200 rounded-xl px-3 py-2 text-sm focus:border-green-500 outline-none bg-white">
                            <option value="newest">Newest First</option>
                            <option value="price-asc">Price: Low → High</option>
                            <option value="price-desc">Price: High → Low</option>
                        </select>
                    </div>
                </div>

                {/* Results count */}
                {!loading && (
                    <p className="text-gray-500 text-sm mb-5">
                        Showing <strong>{sorted.length}</strong> product{sorted.length !== 1 ? "s" : ""}
                        {category !== "All" ? ` in "${category}"` : ""}
                        {search ? ` for "${search}"` : ""}
                    </p>
                )}

                {/* Grid */}
                {loading ? <Loader/> : (
                    sorted.length > 0
                        ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {sorted.map(p => <ProductCard key={p.id} product={p}/>)}
                            </div>
                        )
                        : (
                            <div className="text-center py-20 text-gray-400">
                                <div className="text-6xl mb-4">🔍</div>
                                <p className="text-xl font-semibold mb-2">No products found</p>
                                <p className="text-sm">Try a different search term or category</p>
                            </div>
                        )
                )}
            </div>

            <Footer/>
        </div>
    );
}

export default Marketplace;