import React, { useEffect, useState } from "react";
import API from "../services/api";
import toast from "react-hot-toast";
import Loader from "../components/Loader";
import { 
    LayoutDashboard, Package, ShoppingBag, TrendingUp, 
    Plus, Edit2, Trash2, Upload, FileText, IndianRupee,
    ArrowUpRight, ArrowDownRight, ChevronRight, X, Truck
} from "lucide-react";

import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import OrderDetailsModal from "../components/OrderDetailsModal";

const BACKEND_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

function SellerDashboard() {
    const navigate = useNavigate();
    const [stats, setStats] = useState(null);
    const [products, setProducts] = useState([]);
    const [orders, setOrders] = useState([]);
    const [expenses, setExpenses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("overview");

    // Modal states
    const [showProductModal, setShowProductModal] = useState(false);
    const [showExpenseModal, setShowExpenseModal] = useState(false);
    const [editMode, setEditMode] = useState(false);
    
    const initialProduct = { name: "", description: "", price: "", quantity: "", category: "", image: null };
    const [productForm, setProductForm] = useState(initialProduct);
    const [expenseForm, setExpenseForm] = useState({ title: "", amount: "", category: "General" });

    // Delivery Assignment
    const [deliveryPartners, setDeliveryPartners] = useState([]);
    const [showAssignModal, setShowAssignModal] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [showOrderDetailsModal, setShowOrderDetailsModal] = useState(false);

    useEffect(() => {
        loadAllData();
    }, []);

    const loadAllData = async () => {
        setLoading(true);
        try {
            const [s, p, o, e] = await Promise.all([
                API.get("/seller/stats"),
                API.get("/products/my-products/list"),
                API.get("/orders/seller"),
                API.get("/seller/expenses")
            ]);
            setStats(s.data);
            setProducts(p.data);
            setOrders(o.data);
            setExpenses(e.data);
        } catch (err) {
            toast.error("Failed to load dashboard data");
        } finally {
            setLoading(false);
        }
    };

    const loadPartners = async () => {
        try {
            const res = await API.get("/delivery/partners");
            setDeliveryPartners(res.data);
        } catch (err) {
            toast.error("Failed to load delivery partners");
        }
    };

    const handleAssignDelivery = async (delivery_person_id) => {
        try {
            await API.patch(`/orders/${selectedOrder.id}/assign`, { delivery_person_id });
            toast.success("Delivery partner assigned!");
            setShowAssignModal(false);
            loadAllData();
        } catch (err) {
            toast.error("Assignment failed");
        }
    };

    const handleViewOrder = async (orderId) => {
        try {
            const res = await API.get(`/orders/${orderId}`);
            setSelectedOrder(res.data);
            setShowOrderDetailsModal(true);
        } catch (err) {
            toast.error("Failed to load order details");
        }
    };

    const handleProductSubmit = async (e) => {
        e.preventDefault();
        const fd = new FormData();
        Object.entries(productForm).forEach(([k, v]) => { if (v !== null) fd.append(k, v); });

        try {
            if (editMode) {
                await API.put(`/products/${productForm.id}`, fd);
                toast.success("Product updated!");
            } else {
                await API.post("/products", fd);
                toast.success("Product added!");
            }
            setShowProductModal(false);
            loadAllData();
        } catch (err) {
            toast.error("Failed to save product");
        }
    };

    const handleExpenseSubmit = async (e) => {
        e.preventDefault();
        try {
            await API.post("/seller/expenses", expenseForm);
            toast.success("Expense added!");
            setShowExpenseModal(false);
            setExpenseForm({ title: "", amount: "", category: "General" });
            loadAllData();
        } catch (err) {
            toast.error("Failed to add expense");
        }
    };

    const deleteProduct = async (id) => {
        if (!window.confirm("Are you sure?")) return;
        try {
            await API.delete(`/products/${id}`);
            toast.success("Product deleted");
            loadAllData();
        } catch (err) {
            toast.error("Delete failed");
        }
    };

    const updateOrderStatus = async (orderId, status) => {
        try {
            await API.patch(`/orders/${orderId}/status`, { status });
            toast.success(`Order ${status}`);
            loadAllData();
        } catch (err) {
            toast.error("Update failed");
        }
    };

    const { user, checkAuth } = useAuth();

    if (loading) return <div className="h-screen flex items-center justify-center"><Loader /></div>;

    // Handle Pending Approval
    if (user?.role === 'seller' && !user?.isApproved) {
        return (
            <div className="min-h-screen bg-white flex flex-col items-center justify-center p-8 text-center">
                <div className="w-24 h-24 bg-amber-100 rounded-3xl flex items-center justify-center text-amber-600 mb-6">
                    <LayoutDashboard size={48} />
                </div>
                <h1 className="text-3xl font-black text-gray-900 mb-2">Approval Pending</h1>
                <p className="text-gray-500 max-w-md mx-auto mb-8">
                    Your seller account is currently under review by our administration team. 
                    This usually takes 24-48 hours. We'll notify you once you're cleared to start selling!
                </p>
                <div className="flex gap-4">
                    <button onClick={() => checkAuth()} className="bg-gray-900 text-white font-bold px-8 py-3 rounded-2xl hover:bg-black transition">Check Status</button>
                    <button onClick={() => navigate("/profile")} className="bg-gray-100 text-gray-600 font-bold px-8 py-3 rounded-2xl hover:bg-gray-200 transition">View Profile</button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 flex">
            {/* Sidebar */}
            <aside className="w-64 bg-white border-r hidden lg:flex flex-col p-6 sticky top-0 h-screen">
                <div className="flex items-center gap-3 mb-10 px-2">
                    <div className="h-10 w-10 bg-green-600 rounded-xl flex items-center justify-center text-white">
                        <LayoutDashboard size={24} />
                    </div>
                    <span className="font-black text-xl text-gray-900">Seller Hub</span>
                </div>
                
                <nav className="space-y-1">
                    <NavItem active={activeTab === "overview"} onClick={() => setActiveTab("overview")} icon={<LayoutDashboard size={20}/>} label="Overview" />
                    <NavItem active={activeTab === "products"} onClick={() => setActiveTab("products")} icon={<Package size={20}/>} label="Products" />
                    <NavItem active={activeTab === "orders"} onClick={() => setActiveTab("orders")} icon={<ShoppingBag size={20}/>} label="Orders" />
                    <NavItem active={activeTab === "finances"} onClick={() => setActiveTab("finances")} icon={<IndianRupee size={20}/>} label="Finances" />
                </nav>

                <div className="mt-auto bg-green-50 p-4 rounded-2xl">
                    <p className="text-sm font-bold text-green-800 mb-1">Need help?</p>
                    <p className="text-xs text-green-600 mb-3">Contact our support for seller assistance.</p>
                    <button className="w-full bg-green-600 text-white text-xs font-bold py-2 rounded-lg">Get Support</button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-4 lg:p-8">
                <header className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-black text-gray-900">Dashboard</h1>
                        <p className="text-gray-500">Welcome back! Here's what's happening with your store.</p>
                    </div>
                    <div className="flex gap-3">
                        <button onClick={() => { setEditMode(false); setProductForm(initialProduct); setShowProductModal(true); }}
                            className="bg-green-600 hover:bg-green-700 text-white font-bold py-2.5 px-6 rounded-xl flex items-center gap-2 transition shadow-lg shadow-green-100">
                            <Plus size={20} /> Add Product
                        </button>
                    </div>
                </header>

                {/* Stats Grid */}
                {activeTab === "overview" && (
                    <div className="space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <StatCard label="Total Revenue" value={`₹${stats?.totalSales}`} icon={<IndianRupee />} color="bg-blue-500" trend="+12.5%" />
                            <StatCard label="Net Profit" value={`₹${stats?.profit}`} icon={<TrendingUp />} color="bg-green-500" trend="+8.2%" />
                            <StatCard label="Total Orders" value={stats?.totalOrders} icon={<ShoppingBag />} color="bg-orange-500" trend="+5.1%" />
                            <StatCard label="Total Products" value={stats?.totalProducts} icon={<Package />} color="bg-purple-500" />
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            {/* Revenue Chart Placeholder */}
                            <div className="lg:col-span-2 bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                                <h3 className="font-black text-xl mb-6">Revenue Growth</h3>
                                <div className="h-64 flex items-end gap-2 px-2">
                                    {stats?.revenueChart?.map((day, i) => (
                                        <div key={i} className="flex-1 bg-green-100 hover:bg-green-500 transition-colors rounded-t-lg group relative" style={{ height: `${(day.dailyRevenue / Math.max(...stats.revenueChart.map(d=>d.dailyRevenue))) * 100}%` }}>
                                            <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition whitespace-nowrap">
                                                ₹{day.dailyRevenue}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <div className="flex justify-between mt-4 text-xs text-gray-400 font-bold uppercase tracking-wider">
                                    {stats?.revenueChart?.map((day, i) => <span key={i}>{new Date(day.date).toLocaleDateString([], {weekday: 'short'})}</span>)}
                                </div>
                            </div>

                            {/* Recent Orders List */}
                            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                                <div className="flex justify-between items-center mb-6">
                                    <h3 className="font-black text-xl">Recent Orders</h3>
                                    <button onClick={()=>setActiveTab("orders")} className="text-green-600 text-sm font-bold flex items-center">See all <ChevronRight size={16}/></button>
                                </div>
                                <div className="space-y-4">
                                    {orders.slice(0, 5).map(order => (
                                        <div key={order.id} className="flex items-center gap-4 p-3 hover:bg-gray-50 rounded-2xl transition border border-transparent hover:border-gray-100">
                                            <img src={order.product_image ? `${BACKEND_URL}/uploads/${order.product_image}` : "https://placehold.co/40x40"} className="h-10 w-10 rounded-lg object-cover" />
                                            <div className="flex-1 overflow-hidden">
                                                <p className="font-bold text-sm text-gray-900 truncate">{order.product_name}</p>
                                                <p className="text-xs text-gray-500">{order.buyer_name}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-black text-sm text-green-600">₹{order.total_price}</p>
                                                <p className="text-[10px] font-bold text-orange-500 uppercase">{order.status}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Products Tab */}
                {activeTab === "products" && (
                    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="p-8 border-b flex justify-between items-center">
                            <h3 className="font-black text-2xl">My Inventory</h3>
                            <span className="bg-gray-100 text-gray-500 px-4 py-1 rounded-full text-sm font-bold">{products.length} Items</span>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-gray-50 text-gray-400 text-xs font-black uppercase tracking-wider">
                                    <tr>
                                        <th className="px-8 py-4">Product</th>
                                        <th className="px-8 py-4">Category</th>
                                        <th className="px-8 py-4">Price</th>
                                        <th className="px-8 py-4">Stock</th>
                                        <th className="px-8 py-4 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {products.map(p => (
                                        <tr key={p.id} className="hover:bg-gray-50/50 transition">
                                            <td className="px-8 py-4">
                                                <div className="flex items-center gap-4">
                                                    <img src={p.image ? `${BACKEND_URL}/uploads/${p.image}` : "https://placehold.co/40x40"} className="h-12 w-12 rounded-xl object-cover shadow-sm" />
                                                    <span className="font-bold text-gray-900">{p.name}</span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-4"><span className="bg-green-50 text-green-700 px-3 py-1 rounded-full text-xs font-bold uppercase">{p.category}</span></td>
                                            <td className="px-8 py-4 font-black text-gray-900">₹{p.price}</td>
                                            <td className="px-8 py-4">
                                                <div className="flex items-center gap-2">
                                                    <div className={`h-2 w-2 rounded-full ${p.quantity > 10 ? 'bg-green-500' : 'bg-red-500'}`}></div>
                                                    <span className="font-medium">{p.quantity}</span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-4 text-right">
                                                <div className="flex justify-end gap-2">
                                                    <button onClick={() => { setEditMode(true); setProductForm(p); setShowProductModal(true); }} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"><Edit2 size={18}/></button>
                                                    <button onClick={() => deleteProduct(p.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"><Trash2 size={18}/></button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Orders Tab */}
                {activeTab === "orders" && (
                    <div className="space-y-4">
                        {orders.map(order => (
                            <div key={order.id} className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col md:flex-row items-center gap-6">
                                <img src={order.product_image ? `${BACKEND_URL}/uploads/${order.product_image}` : "https://placehold.co/80x80"} className="h-20 w-20 rounded-2xl object-cover" />
                                <div className="flex-1 text-center md:text-left">
                                    <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4 mb-2">
                                        <h4 className="font-black text-xl text-gray-900">{order.product_name}</h4>
                                        <span className={`px-3 py-0.5 rounded-full text-[10px] font-black uppercase tracking-tighter w-fit mx-auto md:mx-0 ${statusColors[order.status]}`}>
                                            {order.status}
                                        </span>
                                    </div>
                                    <div className="flex flex-wrap justify-center md:justify-start gap-4 text-sm text-gray-500">
                                        <div className="flex items-center gap-1"><IndianRupee size={14}/> <span className="font-bold text-gray-900">{order.total_price}</span></div>
                                        <div className="flex items-center gap-1">Qty: <span className="font-bold text-gray-900">{order.quantity}</span></div>
                                        <div className="flex items-center gap-1">Buyer: <span className="font-bold text-gray-900">{order.buyer_name}</span></div>
                                    </div>
                                </div>
                                <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
                                    <select 
                                        value={order.status}
                                        onChange={(e)=>updateOrderStatus(order.id, e.target.value)}
                                        className="bg-gray-50 border-none rounded-xl px-4 py-2 font-bold text-sm focus:ring-2 focus:ring-green-500 outline-none"
                                    >
                                        {Object.keys(statusColors).map(s => <option key={s} value={s}>{s}</option>)}
                                    </select>
                                    <button 
                                        onClick={() => { setSelectedOrder(order); loadPartners(); setShowAssignModal(true); }}
                                        className="bg-purple-600 text-white font-bold px-4 py-2 rounded-xl text-sm hover:bg-purple-700 transition flex items-center gap-2"
                                    >
                                        <Truck size={16}/> Assign Delivery
                                    </button>
                                    <button 
                                        onClick={() => handleViewOrder(order.id)}
                                        className="bg-gray-900 text-white font-bold px-6 py-2 rounded-xl text-sm hover:bg-black transition"
                                    >
                                        Details
                                    </button>
                                </div>

                            </div>
                        ))}
                    </div>
                )}

                {/* Finances Tab */}
                {activeTab === "finances" && (
                    <div className="space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 flex items-center gap-6">
                                <div className="h-16 w-16 bg-green-100 rounded-2xl flex items-center justify-center text-green-600"><IndianRupee size={32}/></div>
                                <div>
                                    <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Total Income</p>
                                    <p className="text-3xl font-black text-gray-900">₹{stats?.income}</p>
                                </div>
                            </div>
                            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 flex items-center gap-6">
                                <div className="h-16 w-16 bg-red-100 rounded-2xl flex items-center justify-center text-red-600"><FileText size={32}/></div>
                                <div>
                                    <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Total Expense</p>
                                    <p className="text-3xl font-black text-gray-900">₹{stats?.expense}</p>
                                </div>
                            </div>
                            <div className="bg-gradient-to-br from-green-600 to-green-700 p-8 rounded-3xl shadow-lg flex items-center gap-6 text-white">
                                <div className="h-16 w-16 bg-white/20 rounded-2xl flex items-center justify-center"><TrendingUp size={32}/></div>
                                <div>
                                    <p className="text-sm font-bold text-green-100 uppercase tracking-widest">Net Profit</p>
                                    <p className="text-3xl font-black">₹{stats?.profit}</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="p-8 border-b flex justify-between items-center">
                                <h3 className="font-black text-2xl">Expense Tracking</h3>
                                <button onClick={()=>setShowExpenseModal(true)} className="bg-gray-900 text-white font-bold py-2 px-4 rounded-xl text-sm flex items-center gap-2"><Plus size={16}/> Add Expense</button>
                            </div>
                            <table className="w-full text-left">
                                <thead className="bg-gray-50 text-gray-400 text-xs font-black uppercase tracking-wider">
                                    <tr>
                                        <th className="px-8 py-4">Title</th>
                                        <th className="px-8 py-4">Category</th>
                                        <th className="px-8 py-4">Amount</th>
                                        <th className="px-8 py-4 text-right">Date</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {expenses.map(e => (
                                        <tr key={e.id}>
                                            <td className="px-8 py-4 font-bold text-gray-900">{e.title}</td>
                                            <td className="px-8 py-4 text-sm text-gray-500">{e.category}</td>
                                            <td className="px-8 py-4 font-black text-red-600">₹{e.amount}</td>
                                            <td className="px-8 py-4 text-right text-gray-400 text-sm">{new Date(e.created_at).toLocaleDateString()}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </main>

            {/* Product Modal */}
            {showProductModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white w-full max-w-xl rounded-3xl shadow-2xl p-8 animate-in fade-in zoom-in duration-200">
                        <div className="flex justify-between items-center mb-8">
                            <h2 className="text-2xl font-black">{editMode ? 'Update Product' : 'Add New Product'}</h2>
                            <button onClick={()=>setShowProductModal(false)} className="text-gray-400 hover:text-black"><X size={24}/></button>
                        </div>
                        <form onSubmit={handleProductSubmit} className="space-y-4">
                            <div className="space-y-1">
                                <label className="text-xs font-black uppercase text-gray-400">Product Name</label>
                                <input type="text" value={productForm.name} onChange={e=>setProductForm({...productForm, name: e.target.value})} className="w-full bg-gray-50 border-none rounded-xl px-4 py-3 font-bold focus:ring-2 focus:ring-green-500 outline-none" placeholder="e.g. Organic Carrots" required />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-black uppercase text-gray-400">Description</label>
                                <textarea value={productForm.description} onChange={e=>setProductForm({...productForm, description: e.target.value})} className="w-full bg-gray-50 border-none rounded-xl px-4 py-3 font-bold focus:ring-2 focus:ring-green-500 outline-none h-24 resize-none" placeholder="Brief details about the product" required />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-xs font-black uppercase text-gray-400">Price (₹)</label>
                                    <input type="number" value={productForm.price} onChange={e=>setProductForm({...productForm, price: e.target.value})} className="w-full bg-gray-50 border-none rounded-xl px-4 py-3 font-bold focus:ring-2 focus:ring-green-500 outline-none" required />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-black uppercase text-gray-400">Stock Qty</label>
                                    <input type="number" value={productForm.quantity} onChange={e=>setProductForm({...productForm, quantity: e.target.value})} className="w-full bg-gray-50 border-none rounded-xl px-4 py-3 font-bold focus:ring-2 focus:ring-green-500 outline-none" required />
                                </div>
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-black uppercase text-gray-400">Category</label>
                                <select value={productForm.category} onChange={e=>setProductForm({...productForm, category: e.target.value})} className="w-full bg-gray-50 border-none rounded-xl px-4 py-3 font-bold focus:ring-2 focus:ring-green-500 outline-none">
                                    {["Vegetables","Fruits","Grains","Dairy","Tools","Seeds"].map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-black uppercase text-gray-400">Image</label>
                                <input type="file" onChange={e=>setProductForm({...productForm, image: e.target.files[0]})} className="w-full text-xs" />
                            </div>
                            <button className="w-full bg-green-600 text-white font-black py-4 rounded-2xl hover:bg-green-700 transition shadow-lg shadow-green-100 mt-4">
                                {editMode ? 'Update Listing' : 'Publish Product'}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Expense Modal */}
            {showExpenseModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl p-8 animate-in fade-in zoom-in duration-200">
                        <div className="flex justify-between items-center mb-8">
                            <h2 className="text-2xl font-black">Add Expense</h2>
                            <button onClick={()=>setShowExpenseModal(false)} className="text-gray-400 hover:text-black"><X size={24}/></button>
                        </div>
                        <form onSubmit={handleExpenseSubmit} className="space-y-4">
                            <div className="space-y-1">
                                <label className="text-xs font-black uppercase text-gray-400">Expense Title</label>
                                <input type="text" value={expenseForm.title} onChange={e=>setExpenseForm({...expenseForm, title: e.target.value})} className="w-full bg-gray-50 border-none rounded-xl px-4 py-3 font-bold focus:ring-2 focus:ring-green-500 outline-none" placeholder="e.g. Fertilizer" required />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-black uppercase text-gray-400">Amount (₹)</label>
                                <input type="number" value={expenseForm.amount} onChange={e=>setExpenseForm({...expenseForm, amount: e.target.value})} className="w-full bg-gray-50 border-none rounded-xl px-4 py-3 font-bold focus:ring-2 focus:ring-green-500 outline-none" required />
                            </div>
                            <button className="w-full bg-gray-900 text-white font-black py-4 rounded-2xl hover:bg-black transition shadow-lg shadow-gray-200 mt-4">
                                Save Expense
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Assign Delivery Modal */}
            {showAssignModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl p-8">
                        <div className="flex justify-between items-center mb-8">
                            <h2 className="text-2xl font-black">Assign Delivery</h2>
                            <button onClick={()=>setShowAssignModal(false)} className="text-gray-400 hover:text-black"><X size={24}/></button>
                        </div>
                        <div className="space-y-4">
                            {deliveryPartners.map(partner => (
                                <button 
                                    key={partner.id} 
                                    onClick={() => handleAssignDelivery(partner.id)}
                                    className="w-full flex items-center justify-between p-4 rounded-2xl border-2 border-gray-50 hover:border-purple-600 hover:bg-purple-50 transition group"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="h-10 w-10 bg-gray-100 rounded-xl flex items-center justify-center text-gray-500 font-black group-hover:bg-purple-600 group-hover:text-white transition">
                                            {partner.name.charAt(0)}
                                        </div>
                                        <div className="text-left">
                                            <p className="font-bold text-gray-900">{partner.name}</p>
                                            <p className="text-xs text-gray-400">{partner.phone || "No phone"}</p>
                                        </div>
                                    </div>
                                    <ChevronRight size={20} className="text-gray-300 group-hover:text-purple-600"/>
                                </button>
                            ))}
                            {deliveryPartners.length === 0 && <p className="text-center text-gray-400 py-4 italic">No delivery partners available</p>}
                        </div>
                    </div>
                </div>
            )}

            {showOrderDetailsModal && (
                <OrderDetailsModal 
                    order={selectedOrder} 
                    onClose={() => setShowOrderDetailsModal(false)} 
                />
            )}
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


function NavItem({ active, icon, label, onClick }) {
    return (
        <button onClick={onClick} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition ${active ? 'bg-green-600 text-white shadow-lg shadow-green-100' : 'text-gray-400 hover:text-gray-900 hover:bg-gray-50'}`}>
            {icon}
            <span>{label}</span>
        </button>
    );
}

function StatCard({ label, value, icon, color, trend }) {
    return (
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col gap-4">
            <div className="flex justify-between items-start w-full">
                <div className={`h-12 w-12 ${color} rounded-2xl flex items-center justify-center text-white shadow-lg`}>
                    {icon}
                </div>
                {trend && (
                    <span className="flex items-center text-[10px] font-black text-green-500 bg-green-50 px-2 py-0.5 rounded-full">
                        <ArrowUpRight size={10} className="mr-1" /> {trend}
                    </span>
                )}
            </div>
            <div>
                <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">{label}</p>
                <p className="text-2xl font-black text-gray-900">{value}</p>
            </div>
        </div>
    );
}

export default SellerDashboard;
