import React from "react";
import { X, Package, User, Phone, MapPin, Calendar, CreditCard, Truck } from "lucide-react";

const OrderDetailsModal = ({ order, onClose }) => {
    if (!order) return null;

    const statusColors = {
        Pending: "bg-yellow-100 text-yellow-700 border-yellow-200",
        Accepted: "bg-blue-100 text-blue-700 border-blue-200",
        Packed: "bg-indigo-100 text-indigo-700 border-indigo-200",
        Shipped: "bg-purple-100 text-purple-700 border-purple-200",
        "Out for Delivery": "bg-orange-100 text-orange-700 border-orange-200",
        Delivered: "bg-green-100 text-green-700 border-green-200",
        Cancelled: "bg-red-100 text-red-700 border-red-200",
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-all animate-in fade-in duration-300">
            <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
                {/* Header */}
                <div className="bg-gray-900 text-white px-8 py-6 flex justify-between items-center">
                    <div>
                        <h3 className="text-xl font-black tracking-tight">Order #ORD-{order.id}</h3>
                        <p className="text-gray-400 text-xs mt-1">Placed on {new Date(order.created_at).toLocaleString()}</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-xl transition-colors">
                        <X size={24} />
                    </button>
                </div>

                <div className="max-h-[70vh] overflow-y-auto p-8 custom-scrollbar">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Product Info */}
                        <div className="space-y-6">
                            <div className="flex gap-4">
                                <div className="w-24 h-24 rounded-2xl bg-gray-100 overflow-hidden flex-shrink-0 border border-gray-100">
                                    <img 
                                        src={order.product_image || "https://images.unsplash.com/photo-1542831371-29b0f74f9713?w=200"} 
                                        alt={order.product_name}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                <div>
                                    <h4 className="font-bold text-gray-900 text-lg leading-tight">{order.product_name}</h4>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-md font-bold uppercase">{order.category}</span>
                                        <p className="text-sm text-gray-500">Qty: {order.quantity}</p>
                                    </div>
                                    <p className="text-xl font-black text-green-600 mt-2">₹{order.total_price}</p>
                                </div>
                            </div>

                            <div className="pt-4 border-t border-gray-100">
                                <h5 className="text-xs font-black text-orange-600 uppercase tracking-widest mb-4 flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-orange-600" /> Pickup (Seller)
                                </h5>
                                <div className="space-y-3">
                                    <InfoItem icon={<User size={16}/>} label="Seller" value={order.seller_name} />
                                    <InfoItem icon={<Phone size={16}/>} label="Seller Phone" value={order.seller_phone} />
                                    <InfoItem icon={<MapPin size={16}/>} label="Pickup Address" value={order.pickup_address} />
                                </div>
                            </div>

                            <div className="pt-4 border-t border-gray-100">
                                <h5 className="text-xs font-black text-blue-600 uppercase tracking-widest mb-4 flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-blue-600" /> Delivery (Customer)
                                </h5>
                                <div className="space-y-3">
                                    <InfoItem icon={<User size={16}/>} label="Customer" value={order.buyer_name} />
                                    <InfoItem icon={<Phone size={16}/>} label="Phone" value={order.buyer_phone} />
                                    <InfoItem icon={<MapPin size={16}/>} label="Delivery Address" value={order.delivery_address} />
                                </div>
                            </div>
                        </div>

                        {/* Order Status & Delivery */}
                        <div className="space-y-6">
                            <div>
                                <h5 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">Current Status</h5>
                                <div className={`inline-flex items-center px-4 py-2 rounded-xl border text-sm font-bold ${statusColors[order.status] || "bg-gray-100"}`}>
                                    <Package size={16} className="mr-2" />
                                    {order.status}
                                </div>
                            </div>

                            <div className="pt-4 border-t border-gray-100">
                                <h5 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">Logistics Info</h5>
                                <div className="space-y-3">
                                    <InfoItem 
                                        icon={<Truck size={16}/>} 
                                        label="Delivery Partner" 
                                        value={order.delivery_person_name || "Not Assigned"} 
                                        subValue={order.delivery_person_name ? "Assigned" : "Pending Assignment"}
                                    />
                                    <InfoItem 
                                        icon={<Calendar size={16}/>} 
                                        label="Estimated Delivery" 
                                        value="By Tomorrow, 8:00 PM" 
                                    />
                                    <InfoItem 
                                        icon={<CreditCard size={16}/>} 
                                        label="Payment Method" 
                                        value="Cash on Delivery (COD)" 
                                        highlight
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="bg-gray-50 px-8 py-6 flex justify-end border-t border-gray-100">
                    <button 
                        onClick={onClose}
                        className="bg-gray-900 text-white font-bold px-8 py-3 rounded-2xl hover:bg-black transition-all shadow-lg shadow-gray-200"
                    >
                        Close Details
                    </button>
                </div>
            </div>
        </div>
    );
};

const InfoItem = ({ icon, label, value, subValue, highlight }) => (
    <div className="flex items-start gap-3">
        <div className="mt-1 text-gray-400">{icon}</div>
        <div className="min-w-0">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider leading-none mb-1">{label}</p>
            <p className={`font-bold text-sm leading-tight ${highlight ? 'text-green-600' : 'text-gray-800'} break-words`}>{value}</p>
            {subValue && <p className="text-[10px] text-gray-400 font-medium">{subValue}</p>}
        </div>
    </div>
);

export default OrderDetailsModal;
