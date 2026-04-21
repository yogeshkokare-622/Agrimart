import React, { useEffect, useState } from "react";
import API from "../services/api";
import toast from "react-hot-toast";
import Loader from "../components/Loader";
import { Truck, Package, MapPin, Phone, User, CheckCircle, Navigation, Clock, LogOut } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import OrderDetailsModal from "../components/OrderDetailsModal";

const STATUS_FLOW = ["Shipped", "Out for Delivery", "Delivered"];

function DeliveryDashboard() {
    const { logout, user } = useAuth();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [showDetailsModal, setShowDetailsModal] = useState(false);

    useEffect(() => {
        fetchAssignedOrders();
    }, []);

    const fetchAssignedOrders = async () => {
        try {
            const res = await API.get("/delivery/orders");
            setOrders(res.data);
        } catch (err) {
            toast.error("Failed to load assigned orders");
        } finally {
            setLoading(false);
        }
    };

    const handleViewDetails = async (orderId) => {
        try {
            const res = await API.get(`/orders/${orderId}`);
            setSelectedOrder(res.data);
            setShowDetailsModal(true);
        } catch (err) {
            toast.error("Failed to load details");
        }
    };

    const handleUpdateStatus = async (orderId, currentStatus) => {
        const nextIdx = STATUS_FLOW.indexOf(currentStatus) + 1;
        if (nextIdx >= STATUS_FLOW.length) return;
        
        const nextStatus = STATUS_FLOW[nextIdx];

        try {
            await API.patch("/delivery/update-status", { orderId, status: nextStatus });
            toast.success(`Status updated to ${nextStatus}`);
            fetchAssignedOrders();
        } catch (err) {
            toast.error("Status update failed");
        }
    };

    if (loading) return <Loader />;

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col lg:flex-row">
            {/* Sidebar */}
            <aside className="w-full lg:w-80 bg-white border-r lg:sticky top-0 lg:h-screen p-8 flex flex-col">
                <div className="flex items-center gap-4 mb-12">
                    <div className="h-12 w-12 bg-purple-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-purple-100">
                        <Truck size={24} />
                    </div>
                    <div>
                        <h1 className="font-black text-xl text-gray-900">Logistics Hub</h1>
                        <p className="text-[10px] font-black text-purple-600 uppercase tracking-widest">Delivery Partner</p>
                    </div>
                </div>

                <div className="bg-purple-50 rounded-3xl p-6 mb-8">
                    <p className="text-[10px] font-black text-purple-400 uppercase tracking-widest mb-3">Partner Profile</p>
                    <div className="flex items-center gap-4">
                        <div className="h-10 w-10 bg-white rounded-xl flex items-center justify-center text-purple-600 font-black">{user?.name?.charAt(0)}</div>
                        <div>
                            <p className="font-black text-gray-900 truncate max-w-[140px]">{user?.name}</p>
                            <p className="text-xs text-purple-600 font-bold">{orders.length} Active Tasks</p>
                        </div>
                    </div>
                </div>

                <nav className="space-y-2 flex-1">
                    <button className="w-full flex items-center gap-4 px-6 py-4 rounded-2xl bg-purple-600 text-white font-black shadow-lg shadow-purple-100">
                        <Navigation size={20}/> Active Tasks
                    </button>
                    <button className="w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-gray-400 font-bold hover:bg-gray-50 transition">
                        <CheckCircle size={20}/> History
                    </button>
                </nav>

                <button onClick={logout} className="mt-auto flex items-center gap-4 px-6 py-4 rounded-2xl text-red-500 font-black hover:bg-red-50 transition">
                    <LogOut size={20}/> Logout
                </button>
            </aside>

            {/* Main Area */}
            <main className="flex-1 p-4 lg:p-12">
                <header className="mb-12">
                    <h2 className="text-4xl font-black text-gray-900 mb-2">Active Deliveries</h2>
                    <p className="text-gray-500 font-medium">Manage and update your assigned fulfillment tasks.</p>
                </header>

                <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                    {orders.map(order => (
                        <div key={order.id} className="bg-white rounded-[2.5rem] shadow-xl shadow-gray-200/40 overflow-hidden border border-gray-100 flex flex-col">
                            {/* Inner Header */}
                            <div className="p-8 border-b border-gray-50 flex justify-between items-start">
                                <div className="flex gap-5">
                                    <img 
                                        src={order.product_image ? `http://localhost:5000/uploads/${order.product_image}` : "https://placehold.co/80x80"} 
                                        className="h-20 w-20 rounded-2xl object-cover shadow-sm border"
                                    />
                                    <div>
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Order #{order.id}</p>
                                        <h3 className="font-black text-xl text-gray-900 mb-1">{order.product_name}</h3>
                                        <p className="text-sm text-purple-600 font-bold">Qty: {order.quantity}</p>
                                    </div>
                                </div>
                                <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm ${
                                    order.status === 'Delivered' ? 'bg-green-100 text-green-700' : 
                                    order.status === 'Out for Delivery' ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'
                                }`}>
                                    {order.status}
                                </span>
                            </div>

                            {/* Body */}
                            <div className="p-8 space-y-6 flex-1">
                                <div className="flex items-start gap-4">
                                    <div className="h-10 w-10 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400"><MapPin size={20}/></div>
                                    <div>
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Delivery Address</p>
                                        <p className="font-bold text-gray-900 leading-relaxed text-sm">{order.shipping_address || "AgriMart Logistics Point A"}</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4">
                                    <div className="h-10 w-10 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400"><User size={20}/></div>
                                    <div>
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Customer Details</p>
                                        <p className="font-bold text-gray-900">{order.buyer_name}</p>
                                        <p className="text-xs text-gray-500">{order.buyer_email}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Footer / Actions */}
                            <div className="p-8 bg-gray-50 border-t border-gray-100">
                                {order.status === "Delivered" ? (
                                    <div className="w-full py-4 bg-green-50 text-green-700 rounded-2xl flex items-center justify-center gap-3 font-black">
                                        <CheckCircle size={20}/> Compelted Task
                                    </div>
                                ) : (
                                    <div className="flex flex-col gap-3">
                                        <button 
                                            onClick={() => handleViewDetails(order.id)}
                                            className="w-full py-4 bg-white border-2 border-gray-200 text-gray-700 hover:border-purple-600 hover:text-purple-600 rounded-2xl font-black transition flex items-center justify-center gap-3"
                                        >
                                            View Details
                                        </button>
                                        <button 
                                            onClick={() => handleUpdateStatus(order.id, order.status)}
                                            className="w-full py-4 bg-purple-600 hover:bg-purple-700 text-white rounded-2xl font-black shadow-lg shadow-purple-100 transition flex items-center justify-center gap-3"
                                        >
                                            {order.status === 'Packed' && <><Package size={20}/> Pick Up Order</>}
                                            {order.status === 'Shipped' && <><Truck size={20}/> Start Delivery</>}
                                            {order.status === 'Out for Delivery' && <><CheckCircle size={20}/> Mark as Delivered</>}
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}

                    {orders.length === 0 && (
                        <div className="col-span-full py-20 text-center bg-white rounded-[2.5rem] border-2 border-dashed border-gray-200">
                            <Clock size={48} className="mx-auto mb-4 text-gray-300"/>
                            <h3 className="text-xl font-bold text-gray-900">No Orders Assigned</h3>
                            <p className="text-gray-500">Wait for sellers to assign you new delivery tasks.</p>
                        </div>
                    )}
                </div>
            </main>
            {showDetailsModal && (
                <OrderDetailsModal 
                    order={selectedOrder} 
                    onClose={() => setShowDetailsModal(false)} 
                />
            )}
        </div>
    );
}

export default DeliveryDashboard;
