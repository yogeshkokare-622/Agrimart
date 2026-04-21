import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../services/api";
import toast from "react-hot-toast";
import Loader from "../components/Loader";
import { 
    Package, ShoppingBag, Clock, CheckCircle, 
    Truck, XCircle, ChevronRight, IndianRupee 
} from "lucide-react";

const BACKEND_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

function BuyerOrders() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            const res = await API.get("/orders/buyer");
            setOrders(res.data);
        } catch (err) {
            toast.error("Failed to load your orders");
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="h-screen flex items-center justify-center"><Loader /></div>;

    return (
        <div className="min-h-screen bg-gray-50 pb-12">
            <div className="bg-green-700 text-white py-12 px-4 shadow-inner">
                <div className="max-w-7xl mx-auto">
                    <h1 className="text-4xl font-black mb-2">My Orders</h1>
                    <p className="text-green-100 font-medium opacity-80">Track and manage your recent purchases</p>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 -mt-8">
                {orders.length === 0 ? (
                    <div className="bg-white rounded-3xl p-16 text-center shadow-xl">
                        <ShoppingBag size={80} className="mx-auto mb-6 text-gray-200" />
                        <h2 className="text-2xl font-black text-gray-900 mb-2">No orders yet</h2>
                        <p className="text-gray-500 mb-8 max-w-sm mx-auto">Looks like you haven't placed any orders. Discover amazing farm-fresh products in our marketplace.</p>
                        <Link to="/marketplace" className="inline-block bg-green-600 text-white font-bold py-3 px-8 rounded-2xl hover:bg-green-700 transition">
                            Explore Marketplace
                        </Link>
                    </div>
                ) : (
                    <div className="grid gap-6">
                        {orders.map((order) => (
                            <div key={order.id} className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition">
                                <div className="p-6 md:p-8 flex flex-col md:flex-row items-center gap-8">
                                    <div className="h-32 w-32 rounded-2xl overflow-hidden bg-gray-50 flex-shrink-0">
                                        <img 
                                            src={order.product_image ? `${BACKEND_URL}/uploads/${order.product_image}` : "https://placehold.co/128x128"} 
                                            alt={order.product_name}
                                            className="h-full w-full object-cover"
                                        />
                                    </div>

                                    <div className="flex-1 text-center md:text-left">
                                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                                            <div>
                                                <h3 className="text-xl font-black text-gray-900 mb-1">{order.product_name}</h3>
                                                <p className="text-sm text-gray-400 font-bold uppercase tracking-widest">Order ID: #{order.id}</p>
                                            </div>
                                            <div className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-tighter w-fit mx-auto md:mx-0 flex items-center gap-2 ${statusColors[order.status] || "bg-gray-100 text-gray-600"}`}>
                                                {statusIcons[order.status] || <Package size={14}/>} {order.status}
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-4 border-t border-gray-50">
                                            <div>
                                                <p className="text-[10px] font-black text-gray-400 uppercase mb-1">Date</p>
                                                <p className="font-bold text-gray-900">{new Date(order.created_at).toLocaleDateString()}</p>
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black text-gray-400 uppercase mb-1">Price</p>
                                                <p className="font-bold text-gray-900">₹{order.total_price / order.quantity}</p>
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black text-gray-400 uppercase mb-1">Quantity</p>
                                                <p className="font-bold text-gray-900">{order.quantity}</p>
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black text-gray-400 uppercase mb-1">Seller</p>
                                                <p className="font-bold text-green-600">{order.seller_name}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="w-full md:w-auto text-center md:text-right flex flex-col gap-3">
                                        <div>
                                            <p className="text-[10px] font-black text-gray-400 uppercase mb-1">Total Paid</p>
                                            <p className="text-3xl font-black text-green-600">₹{order.total_price}</p>
                                        </div>
                                        <Link 
                                            to={`/orders/${order.id}/track`}
                                            className="bg-gray-900 text-white font-bold py-3 px-6 rounded-2xl hover:bg-black transition flex items-center justify-center gap-2"
                                        >
                                            Track Order <ChevronRight size={16} />
                                        </Link>
                                    </div>

                                </div>
                                <div className="bg-gray-50 px-8 py-3 flex justify-between items-center text-xs text-gray-500 font-bold uppercase tracking-wider">
                                    <span>Last update: {new Date(order.updated_at).toLocaleTimeString()}</span>
                                    {order.status === 'Delivered' && <span className="text-green-600 flex items-center gap-1 cursor-pointer hover:underline">Write a Review</span>}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

const statusColors = {
    Pending:           "bg-yellow-100 text-yellow-600",
    Accepted:          "bg-blue-100 text-blue-600",
    Packed:            "bg-indigo-100 text-indigo-600",
    Shipped:           "bg-purple-100 text-purple-600",
    "Out for Delivery": "bg-orange-100 text-orange-600",
    Delivered:         "bg-green-100 text-green-600",
    Cancelled:         "bg-red-100 text-red-600",
};

const statusIcons = {
    Pending:           <Clock size={14}/>,
    Accepted:          <CheckCircle size={14}/>,
    Packed:            <Package size={14}/>,
    Shipped:           <Truck size={14}/>,
    "Out for Delivery": <Truck size={14}/>,
    Delivered:         <CheckCircle size={14} fill="currentColor" />,
    Cancelled:         <XCircle size={14}/>,
};

export default BuyerOrders;
