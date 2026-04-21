import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../services/api";
import toast from "react-hot-toast";
import Loader from "../components/Loader";
import { Star, ShoppingBag, ArrowLeft, Package, User, Plus, Minus } from "lucide-react";

const BACKEND_URL = import.meta.env.VITE_API_URL?.replace("/api", "") || "http://localhost:5000";

function ProductDetails() {
    const { id } = useParams();
    const [product, setProduct] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const navigate = useNavigate();
    const [qty, setQty] = useState(1);

    useEffect(() => {
        fetchProduct();
        fetchReviews();
    }, [id]);

    const fetchProduct = async () => {
        try {
            const res = await API.get(`/products/${id}`);
            setProduct(res.data);
        } catch (err) {
            toast.error("Product not found");
            navigate("/marketplace");
        } finally {
            setLoading(false);
        }
    };

    const fetchReviews = async () => {
        try {
            const res = await API.get(`/reviews/product/${id}`);
            setReviews(res.data.reviews || []);
        } catch (err) {
            console.error("Failed to load reviews");
        }
    };

    const handleSubmitReview = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await API.post("/reviews", { product_id: id, rating, comment });
            toast.success("Review submitted! ⭐");
            setComment("");
            fetchReviews();
            fetchProduct(); // Refresh rating
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to submit review");
        } finally {
            setSubmitting(false);
        }
    };
    
    const handleBuyNow = () => {
        if (qty > product.quantity) {
            toast.error(`Only ${product.quantity} units available`);
            return;
        }
        navigate("/checkout", { state: { directItem: { ...product, product_id: product.id, quantity: qty } } });
    };

    const increaseQty = () => {
        if (qty < product.quantity) setQty(prev => prev + 1);
        else toast.error("Maximum stock reached");
    };

    const decreaseQty = () => {
        if (qty > 1) setQty(prev => prev - 1);
    };

    if (loading) return <div className="h-screen flex items-center justify-center"><Loader /></div>;
    if (!product) return null;

    return (
        <div className="min-h-screen bg-gray-50 pb-12">
            <div className="max-w-7xl mx-auto px-4 py-8">
                <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-600 hover:text-green-600 mb-6 transition">
                    <ArrowLeft size={20} /> Back
                </button>

                <div className="bg-white rounded-3xl shadow-xl overflow-hidden grid grid-cols-1 md:grid-cols-2 gap-8 p-8">
                    {/* Image Section */}
                    <div className="rounded-2xl overflow-hidden bg-gray-100 flex items-center justify-center min-h-[400px]">
                        <img 
                            src={product.image ? `${BACKEND_URL}/uploads/${product.image}` : `https://placehold.co/600x600/dcfce7/16a34a?text=${encodeURIComponent(product.name)}`} 
                            alt={product.name}
                            className="w-full h-full object-cover"
                        />
                    </div>

                    {/* Details Section */}
                    <div className="flex flex-col justify-center">
                        <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold w-fit mb-4 uppercase tracking-wider">
                            {product.category}
                        </span>
                        <h1 className="text-4xl font-black text-gray-900 mb-2">{product.name}</h1>
                        
                        <div className="flex items-center gap-4 mb-6">
                            <div className="flex items-center gap-1 text-yellow-500">
                                <Star fill="currentColor" size={20} />
                                <span className="font-bold text-gray-900">{parseFloat(product.avgRating).toFixed(1)}</span>
                            </div>
                            <span className="text-gray-400">|</span>
                            <span className="text-gray-600 font-medium">{product.reviewCount} Reviews</span>
                        </div>

                        <p className="text-gray-600 text-lg mb-8 leading-relaxed">{product.description}</p>
                        
                        <div className="bg-gray-50 p-6 rounded-2xl mb-8">
                            <div className="flex items-baseline gap-2 mb-4">
                                <span className="text-4xl font-black text-green-600">₹{product.price}</span>
                                <span className="text-gray-400 line-through text-lg">₹{(product.price * 1.2).toFixed(0)}</span>
                            </div>
                            <div className="flex items-center gap-2 text-gray-500 text-sm">
                                <Package size={16} />
                                <span>{product.quantity > 0 ? `${product.quantity} units in stock` : "Sold Out"}</span>
                            </div>
                        </div>

                        {/* Quantity Selector */}
                        {product.quantity > 0 && (
                            <div className="flex items-center gap-6 mb-8">
                                <span className="text-sm font-bold text-gray-500 uppercase tracking-widest">Quantity</span>
                                <div className="flex items-center bg-white border-2 border-gray-100 rounded-2xl p-2 shadow-sm">
                                    <button 
                                        onClick={decreaseQty}
                                        className="h-10 w-10 flex items-center justify-center hover:bg-gray-50 text-gray-600 transition rounded-xl"
                                    >
                                        <Minus size={20} />
                                    </button>
                                    <span className="w-12 text-center font-black text-xl text-gray-900">{qty}</span>
                                    <button 
                                        onClick={increaseQty}
                                        className="h-10 w-10 flex items-center justify-center hover:bg-gray-50 text-gray-600 transition rounded-xl"
                                    >
                                        <Plus size={20} />
                                    </button>
                                </div>
                            </div>
                        )}

                        <div className="flex gap-4">
                            <button 
                                onClick={handleBuyNow}
                                disabled={product.quantity <= 0}
                                className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-3 transition-all transform hover:scale-[1.02] shadow-lg shadow-green-200"
                            >
                                <ShoppingBag size={20} /> {product.quantity <= 0 ? "Out of Stock" : "Buy Now"}
                            </button>
                        </div>

                        
                        <div className="mt-8 flex items-center gap-3 text-sm text-gray-500 border-t pt-6">
                            <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-bold">
                                {product.seller_name?.charAt(0)}
                            </div>
                            <div>
                                <p className="font-bold text-gray-900">{product.seller_name}</p>
                                <p>Verified Seller</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Reviews Section */}
                <div className="mt-12 grid grid-cols-1 lg:grid-cols-3 gap-12">
                    <div className="lg:col-span-1">
                        <div className="bg-white p-8 rounded-3xl shadow-lg sticky top-8">
                            <h2 className="text-2xl font-black mb-6">Rate this Product</h2>
                            <form onSubmit={handleSubmitReview} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Rating</label>
                                    <div className="flex gap-2">
                                        {[1, 2, 3, 4, 5].map((s) => (
                                            <button 
                                                key={s} 
                                                type="button" 
                                                onClick={() => setRating(s)}
                                                className={`p-2 rounded-lg transition ${rating >= s ? "text-yellow-500" : "text-gray-300 hover:text-yellow-200"}`}
                                            >
                                                <Star fill={rating >= s ? "currentColor" : "none"} size={32} />
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Review Comment</label>
                                    <textarea 
                                        value={comment}
                                        onChange={(e) => setComment(e.target.value)}
                                        placeholder="What do you think about this product?"
                                        className="w-full px-4 py-3 border-2 border-gray-100 bg-gray-50 rounded-xl focus:bg-white focus:border-green-500 outline-none transition resize-none h-32"
                                        required
                                    />
                                </div>
                                <button 
                                    type="submit"
                                    disabled={submitting}
                                    className="w-full bg-gray-900 text-white font-bold py-3 rounded-xl hover:bg-black transition disabled:opacity-50"
                                >
                                    {submitting ? "Posting..." : "Submit Review"}
                                </button>
                            </form>
                        </div>
                    </div>

                    <div className="lg:col-span-2">
                        <h2 className="text-2xl font-black mb-8 flex items-center gap-3">
                            Customer Reviews <span className="text-green-600 bg-green-50 px-3 py-1 rounded-full text-sm">{reviews.length}</span>
                        </h2>
                        {reviews.length === 0 ? (
                            <div className="bg-white p-12 text-center rounded-3xl text-gray-400">
                                <Star size={48} className="mx-auto mb-4 opacity-10" />
                                <p className="text-lg">No reviews yet. Be the first to review!</p>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {reviews.map((rev) => (
                                    <div key={rev.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-50">
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="flex items-center gap-3">
                                                <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500">
                                                    <User size={20} />
                                                </div>
                                                <div>
                                                    <p className="font-bold text-gray-900">{rev.user_name}</p>
                                                    <p className="text-xs text-gray-400">{new Date(rev.created_at).toLocaleDateString()}</p>
                                                </div>
                                            </div>
                                            <div className="flex text-yellow-500">
                                                {[...Array(rev.rating)].map((_, i) => <Star key={i} fill="currentColor" size={14} />)}
                                            </div>
                                        </div>
                                        <p className="text-gray-600 leading-relaxed">{rev.comment}</p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ProductDetails;
