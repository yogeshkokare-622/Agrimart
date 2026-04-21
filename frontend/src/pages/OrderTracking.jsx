import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import API from "../services/api";
import Loader from "../components/Loader";
import { Package, Truck, CheckCircle, Clock, MapPin, Phone, User, ArrowLeft } from "lucide-react";

const STEPS = [
    { status: "Pending",           icon: Clock,       label: "Order Placed" },
    { status: "Accepted",          icon: Package,     label: "Accepted by Seller" },
    { status: "Packed",            icon: Package,     label: "Packed & Ready" },
    { status: "Shipped",           icon: Truck,       label: "Shipped" },
    { status: "Out for Delivery",  icon: Truck,       label: "Out for Delivery" },
    { status: "Delivered",         icon: CheckCircle, label: "Delivered" },
];

const BACKEND_URL = import.meta.env.VITE_API_URL?.replace("/api", "") || "http://localhost:5000";

function OrderTracking() {
    const { id } = useParams();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchOrder();
        const interval = setInterval(fetchOrder, 30000); // Auto-refresh every 30s
        return () => clearInterval(interval);
    }, [id]);

    const fetchOrder = async () => {
        try {
            const res = await API.get(`/orders/${id}/track`);
            setOrder(res.data);
        } catch (err) {
            console.error("Tracking Error:", err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="h-screen flex items-center justify-center"><Loader/></div>;
    if (!order) return (
        <div className="max-w-2xl mx-auto mt-20 text-center p-8 bg-white rounded-3xl shadow-sm border">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Order Not Found</h2>
            <Link to="/orders" className="text-green-600 font-bold hover:underline">Back to My Orders</Link>
        </div>
    );

    const currentIdx = STEPS.findIndex(s => s.status === order.status);

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4">
            <div className="max-w-4xl mx-auto">
                <Link to="/orders" className="inline-flex items-center gap-2 text-gray-500 hover:text-green-600 font-bold mb-8 transition-colors">
                    <ArrowLeft size={18}/> Back to Orders
                </Link>

                <div className="bg-white rounded-[2.5rem] shadow-xl shadow-gray-200/50 overflow-hidden border border-gray-100">
                    <div className="bg-green-600 p-8 text-white">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div>
                                <p className="text-green-100 text-xs font-black uppercase tracking-widest mb-1">Track Order</p>
                                <h1 className="text-3xl font-black">#{order.id.toString().padStart(6, '0')}</h1>
                            </div>
                            <div className="bg-white/20 backdrop-blur-md px-6 py-3 rounded-2xl flex flex-col items-center">
                                <p className="text-[10px] font-black uppercase tracking-tighter mb-0.5">Estimated Delivery</p>
                                <p className="text-xl font-black">2-3 Days</p>
                            </div>
                        </div>
                    </div>

                    <div className="p-8 lg:p-12">
                        {/* Status Stepper */}
                        <div className="relative mb-16">
                            {/* Line */}
                            <div className="absolute left-[19px] md:left-0 md:top-[19px] md:w-full h-full md:h-1 bg-gray-100 rounded-full overflow-hidden">
                                <div 
                                    className="h-full bg-green-500 transition-all duration-1000 ease-out"
                                    style={{ width: `${(currentIdx / (STEPS.length - 1)) * 100}%` }}
                                />
                            </div>

                            {/* Vert line for mobile */}
                            <div className="absolute left-[19px] top-0 w-1 h-full bg-gray-100 md:hidden overflow-hidden">
                                <div 
                                    className="w-full bg-green-500 transition-all duration-1000 ease-out"
                                    style={{ height: `${(currentIdx / (STEPS.length - 1)) * 100}%` }}
                                />
                            </div>

                            <div className="relative flex flex-col md:flex-row justify-between gap-10 md:gap-4">
                                {STEPS.map((step, idx) => {
                                    const Icon = step.icon;
                                    const isDone = idx <= currentIdx;
                                    const isCurrent = idx === currentIdx;

                                    return (
                                        <div key={step.status} className="flex md:flex-col items-center gap-4 md:text-center group">
                                            <div className={`
                                                w-10 h-10 rounded-full flex items-center justify-center transition-all duration-500 z-10
                                                ${isDone ? 'bg-green-500 text-white shadow-lg shadow-green-100 scale-110' : 'bg-white text-gray-300 border-2 border-gray-100'}
                                                ${isCurrent ? 'ring-4 ring-green-100' : ''}
                                            `}>
                                                <Icon size={18} />
                                            </div>
                                            <div>
                                                <p className={`text-xs font-black uppercase tracking-widest ${isDone ? 'text-gray-900' : 'text-gray-400'}`}>
                                                    {step.label}
                                                </p>
                                                {isCurrent && <p className="text-[10px] text-green-600 font-bold mt-0.5">Active Stage</p>}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                            {/* Product Info */}
                            <div className="space-y-6">
                                <h3 className="text-xl font-black text-gray-900 border-b pb-4">Order Details</h3>
                                <div className="flex gap-4">
                                    <img 
                                        src={order.product_image ? `${BACKEND_URL}/uploads/${order.product_image}` : "https://placehold.co/100x100?text=Product"} 
                                        className="w-24 h-24 object-cover rounded-2xl shadow-sm border border-gray-100"
                                    />
                                    <div>
                                        <h4 className="font-black text-gray-900 text-lg">{order.product_name}</h4>
                                        <p className="text-gray-500 text-sm line-clamp-2 mt-1 mb-2">{order.product_description}</p>
                                        <div className="flex gap-4 items-center">
                                            <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-xs font-bold">Qty: {order.quantity}</span>
                                            <span className="text-green-600 font-black text-xl">₹{order.total_price}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Logistics Info */}
                            <div className="space-y-6">
                                <h3 className="text-xl font-black text-gray-900 border-b pb-4">Logistics Information</h3>
                                
                                <div className="space-y-6">
                                    <div className="flex items-start gap-4">
                                        <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 flex-shrink-0"><User size={20}/></div>
                                        <div>
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Seller Details</p>
                                            <p className="font-bold text-gray-900">{order.seller_name}</p>
                                            <p className="text-xs text-gray-500">{order.seller_email}</p>
                                        </div>
                                    </div>

                                    {order.delivery_name && (
                                        <div className="flex items-start gap-4">
                                            <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center text-purple-600 flex-shrink-0"><Truck size={20}/></div>
                                            <div>
                                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Delivery Partner</p>
                                                <p className="font-bold text-gray-900">{order.delivery_name}</p>
                                                <p className="text-xs text-gray-500">{order.delivery_email}</p>
                                            </div>
                                        </div>
                                    )}

                                    <div className="flex items-start gap-4">
                                        <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center text-orange-600 flex-shrink-0"><MapPin size={20}/></div>
                                        <div>
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Shipping Address</p>
                                            <p className="font-bold text-gray-900 text-sm leading-relaxed">{order.shipping_address || "AgriMart Standard Logistics Hub"}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default OrderTracking;
