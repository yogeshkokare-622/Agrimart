import React from "react";
import { Link } from "react-router-dom";
import { ShoppingBag, Star, Eye } from "lucide-react";

const BACKEND_URL = "http://localhost:5000";

function ProductCard({ product }) {

    const imgSrc = product.image
        ? `${BACKEND_URL}/uploads/${product.image}`
        : `https://placehold.co/300x200/dcfce7/16a34a?text=${encodeURIComponent(product.name)}`;

    return (
        <Link to={`/products/${product.id}`} className="bg-white rounded-[2rem] shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 overflow-hidden group flex flex-col border border-gray-100 h-full">
            <div className="relative overflow-hidden h-56 flex-shrink-0">
                <img
                    src={imgSrc}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <div className="bg-white/90 backdrop-blur-sm p-3 rounded-full text-green-600 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                        <Eye size={24} />
                    </div>
                </div>
                {product.quantity <= 0 && (
                    <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center">
                        <span className="bg-red-500 text-white text-[10px] uppercase font-black px-4 py-2 rounded-full tracking-widest shadow-lg shadow-red-200">Sold Out</span>
                    </div>
                )}
                {product.category && (
                    <span className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm text-green-700 text-[10px] font-black uppercase px-4 py-1.5 rounded-full tracking-widest shadow-sm">
                        {product.category}
                    </span>
                )}
            </div>

            <div className="p-6 flex flex-col flex-1">
                <div className="flex justify-between items-start mb-2">
                    <h3 className="font-black text-gray-900 text-xl truncate pr-4">{product.name}</h3>
                    <div className="flex items-center gap-1 text-yellow-500 bg-yellow-50 px-2 py-0.5 rounded-lg">
                        <Star fill="currentColor" size={12}/>
                        <span className="text-[10px] font-black">{parseFloat(product.avgRating || 0).toFixed(1)}</span>
                    </div>
                </div>
                
                <p className="text-gray-400 text-xs mb-4 line-clamp-2 min-h-[2.5rem] font-medium leading-relaxed">{product.description}</p>

                <div className="flex items-end justify-between mt-auto pt-4 border-t border-gray-50">
                    <div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Price</p>
                        <span className="text-2xl font-black text-green-600">₹{parseFloat(product.price).toLocaleString("en-IN")}</span>
                    </div>
                    <div className="text-right">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Available</p>
                        <span className="text-sm font-black text-gray-900">{product.quantity} Qty</span>
                    </div>
                </div>

                <div className="mt-6 flex gap-2">
                    <button
                        disabled={product.quantity <= 0}
                        className="flex-1 flex items-center justify-center gap-2 bg-gray-900 hover:bg-black disabled:bg-gray-100 disabled:text-gray-400 text-white font-black py-4 rounded-2xl transition-all shadow-lg shadow-gray-200"
                    >
                        <ShoppingBag size={18}/>
                        <span className="text-sm">View Details</span>
                    </button>
                </div>

                {product.seller_name && (
                    <p className="text-[10px] text-center mt-4 text-gray-300 font-bold uppercase tracking-[0.2em] group-hover:text-green-600 transition-colors">By {product.seller_name}</p>
                )}
            </div>
        </Link>
    );
}

export default ProductCard;
