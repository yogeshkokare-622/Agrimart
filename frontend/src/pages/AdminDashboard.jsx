import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import API from "../services/api";
import toast from "react-hot-toast";
import Loader from "../components/Loader";
import OrderDetailsModal from "../components/OrderDetailsModal";
import { 
    Users, Package, ShoppingBag, DollarSign, Trash2, 
    BarChart3, UserCheck, UserX, CheckCircle, XCircle, 
    Truck, Search, Filter, ShieldCheck, Settings,
    ChevronRight, MoreVertical
} from "lucide-react";

const statusColors = {
    Pending:   "bg-yellow-100 text-yellow-700",
    Accepted:  "bg-blue-100 text-blue-700",
    Packed:    "bg-indigo-100 text-indigo-700",
    Shipped:   "bg-purple-100 text-purple-700",
    "Out for Delivery": "bg-orange-100 text-orange-700",
    Delivered: "bg-green-100 text-green-700",
    Cancelled: "bg-red-100 text-red-700",
};

function AdminDashboard() {
    const { isAdmin } = useAuth();
    const navigate    = useNavigate();
    const [tab, setTab]         = useState("overview");
    const [stats, setStats]     = useState(null);
    const [users, setUsers]     = useState([]);
    const [sellers, setSellers] = useState([]);
    const [orders, setOrders]   = useState([]);
    const [deliveryBoys, setDeliveryBoys] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [showOrderDetailsModal, setShowOrderDetailsModal] = useState(false);

    useEffect(() => {
        if (!isAdmin) { navigate("/"); return; }
        loadData();
    }, [isAdmin, tab]);

    const loadData = async () => {
        setLoading(true);
        try {
            if (tab === "overview") {
                const r = await API.get("/admin/stats");
                setStats(r.data);
            } else if (tab === "users") {
                const r = await API.get("/admin/users");
                setUsers(r.data);
            } else if (tab === "sellers") {
                const r = await API.get("/admin/sellers");
                setSellers(r.data);
            } else if (tab === "orders") {
                const r = await API.get("/admin/orders");
                setOrders(r.data);
                const u = await API.get("/admin/users");
                setDeliveryBoys(u.data.filter(user => user.role === 'delivery'));
            }
        } catch (err) {
            toast.error("Failed to load data");
        } finally {
            setLoading(false);
        }
    };

    const toggleUserBlock = async (id) => {
        try {
            const res = await API.patch(`/admin/users/${id}/toggle-block`);
            toast.success(res.data.message);
            loadData();
        } catch (err) {
            toast.error(err.response?.data?.message || "Action failed");
        }
    };

    const deleteUser = async (id) => {
        if (!window.confirm("Are you sure you want to delete this user permanently?")) return;
        try {
            await API.delete(`/admin/users/${id}`);
            toast.success("User deleted successfully");
            loadData();
        } catch (err) {
            toast.error(err.response?.data?.message || "Delete failed");
        }
    };

    const handleSellerAction = async (id, action) => {
        try {
            const endpoint = action === 'approve' ? 'approve' : 'reject';
            await API.patch(`/admin/sellers/${id}/${endpoint}`);
            toast.success(`Seller ${action === 'approve' ? 'approved' : 'rejected'}`);
            loadData();
        } catch (err) {
            toast.error("Action failed");
        }
    };

    const updateOrderStatus = async (id, status) => {
        try {
            await API.patch(`/admin/orders/${id}/status`, { status });
            toast.success(`Order status updated to ${status}`);
            loadData();
        } catch (err) {
            toast.error("Failed to update status");
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

    const assignDelivery = async (orderId, deliveryPersonId) => {
        if (!deliveryPersonId) return;
        try {
            await API.post("/admin/assign-delivery", { orderId, deliveryPersonId });
            toast.success("Delivery partner assigned");
            loadData();
        } catch (err) {
            toast.error("Assignment failed");
        }
    };

    const filteredUsers = users.filter(u => 
        u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        u.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const filteredOrders = orders.filter(o => 
        String(o.id).includes(searchTerm) || 
        o.buyer_name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-[#F8FAFC] flex">
            {/* Sidebar */}
            <aside className="w-72 bg-white border-r border-gray-200 hidden lg:flex flex-col sticky top-0 h-screen">
                <div className="p-8">
                    <div className="flex items-center gap-3 mb-10">
                        <div className="w-10 h-10 bg-red-600 rounded-xl flex items-center justify-center text-white font-black shadow-lg shadow-red-200">
                            A
                        </div>
                        <h2 className="text-xl font-black text-gray-900 tracking-tight">AgriMart <span className="text-red-600">Admin</span></h2>
                    </div>

                    <nav className="space-y-1.5">
                        <NavItem active={tab === "overview"} onClick={() => setTab("overview")} icon={<BarChart3 size={20}/>} label="Overview" />
                        <NavItem active={tab === "users"}    onClick={() => setTab("users")}    icon={<Users size={20}/>}      label="User Management" />
                        <NavItem active={tab === "sellers"}  onClick={() => setTab("sellers")}  icon={<ShieldCheck size={20}/>} label="Seller Approval" />
                        <NavItem active={tab === "orders"}   onClick={() => setTab("orders")}   icon={<Package size={20}/>}    label="Order Control" />
                        <NavItem active={tab === "system"}   onClick={() => setTab("system")}   icon={<Settings size={20}/>}   label="System Settings" />
                    </nav>
                </div>
                
                <div className="mt-auto p-8 border-t border-gray-100">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 font-bold uppercase">
                            AD
                        </div>
                        <div>
                            <p className="text-sm font-bold text-gray-900">Admin Panel</p>
                            <p className="text-xs text-gray-400">v2.4.0 Stable</p>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 min-w-0 overflow-auto">
                <header className="bg-white/80 backdrop-blur-md sticky top-0 z-10 border-b border-gray-200 px-8 py-4 flex items-center justify-between">
                    <h1 className="text-xl font-bold text-gray-900 capitalize">{tab.replace("-", " ")}</h1>
                    <div className="flex items-center gap-4">
                        <div className="relative hidden md:block">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18}/>
                            <input 
                                type="text" 
                                placeholder="Global search..." 
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                className="pl-10 pr-4 py-2 bg-gray-100 border-none rounded-xl text-sm focus:ring-2 focus:ring-red-500 w-64 transition-all"
                            />
                        </div>
                        <button className="p-2 text-gray-400 hover:text-gray-900 transition-colors">
                            <Filter size={20}/>
                        </button>
                    </div>
                </header>

                <div className="p-8 max-w-7xl mx-auto">
                    {loading ? (
                        <div className="h-[60vh] flex flex-col items-center justify-center space-y-4">
                            <Loader />
                            <p className="text-gray-500 font-medium animate-pulse">Syncing real-time data...</p>
                        </div>
                    ) : (
                        <>
                            {tab === "overview" && stats && <Overview stats={stats} />}
                            {tab === "users" && <UserManagement users={filteredUsers} onBlock={toggleUserBlock} onDelete={deleteUser} />}
                            {tab === "sellers" && <SellerApproval sellers={sellers} onAction={handleSellerAction} />}
                            {tab === "orders" && <OrderManagement orders={filteredOrders} deliveryBoys={deliveryBoys} onStatusUpdate={updateOrderStatus} onAssign={assignDelivery} onView={handleViewOrder} />}
                            {tab === "system" && <SystemSettings />}
                        </>
                    )}
                </div>
            </main>
            {showOrderDetailsModal && (
                <OrderDetailsModal 
                    order={selectedOrder} 
                    onClose={() => setShowOrderDetailsModal(false)} 
                />
            )}
        </div>
    );
}

// ── SUB-COMPONENTS ───────────────────────────────────────────

function NavItem({ icon, label, active, onClick }) {
    return (
        <button onClick={onClick} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${active ? "bg-red-50 text-red-600 font-bold shadow-sm shadow-red-100" : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"}`}>
            <span className={`${active ? "text-red-600" : "text-gray-400 group-hover:text-gray-600"}`}>{icon}</span>
            <span className="text-sm">{label}</span>
            {active && <ChevronRight size={16} className="ml-auto"/>}
        </button>
    );
}

function Overview({ stats }) {
    return (
        <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard label="Total Revenue" value={`₹${parseFloat(stats.revenue).toLocaleString("en-IN")}`} icon={<DollarSign size={24}/>} color="bg-emerald-500" />
                <StatCard label="Total Orders"  value={stats.orderCount} icon={<ShoppingBag size={24}/>} color="bg-blue-500" />
                <StatCard label="Active Sellers" value={stats.sellerCount} icon={<ShieldCheck size={24}/>} color="bg-amber-500" />
                <StatCard label="Total Users"    value={stats.userCount} icon={<Users size={24}/>} color="bg-indigo-500" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h3 className="text-lg font-black text-gray-900">Performance Snapshot</h3>
                            <p className="text-sm text-gray-400">Monthly overview of key metrics</p>
                        </div>
                        <select className="bg-gray-50 border-none rounded-lg text-sm px-3 py-1.5 focus:ring-0">
                            <option>Last 30 Days</option>
                            <option>Last 7 Days</option>
                        </select>
                    </div>
                    {/* Placeholder for Chart */}
                    <div className="h-64 bg-gray-50 rounded-2xl flex items-center justify-center border border-dashed border-gray-200">
                        <div className="text-center">
                            <BarChart3 size={40} className="text-gray-300 mx-auto mb-2" />
                            <p className="text-gray-400 text-sm">Visual Analytics coming in v2.5</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                    <h3 className="text-lg font-black text-gray-900 mb-6">Quick Actions</h3>
                    <div className="space-y-3">
                        <QuickAction icon={<Package className="text-blue-600"/>} label="Export Sales Report" bg="bg-blue-50" />
                        <QuickAction icon={<Users className="text-indigo-600"/>} label="Bulk User Cleanup" bg="bg-indigo-50" />
                        <QuickAction icon={<ShieldCheck className="text-amber-600"/>} label="Security Audit" bg="bg-amber-50" />
                        <QuickAction icon={<Truck className="text-red-600"/>} label="Optimize Routes" bg="bg-red-50" />
                    </div>
                </div>
            </div>
        </div>
    );
}

function StatCard({ label, value, icon, color }) {
    return (
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 group hover:shadow-xl hover:shadow-gray-200/50 transition-all duration-300">
            <div className={`${color} w-12 h-12 rounded-2xl flex items-center justify-center text-white mb-4 shadow-lg`}>
                {icon}
            </div>
            <p className="text-sm font-semibold text-gray-400 uppercase tracking-wider">{label}</p>
            <p className="text-3xl font-black text-gray-900 mt-1">{value}</p>
        </div>
    );
}

function QuickAction({ icon, label, bg }) {
    return (
        <button className="w-full flex items-center gap-4 p-3 rounded-2xl hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-100">
            <div className={`${bg} p-2.5 rounded-xl`}>{icon}</div>
            <span className="text-sm font-bold text-gray-700">{label}</span>
            <ChevronRight size={16} className="ml-auto text-gray-300" />
        </button>
    );
}

function UserManagement({ users, onBlock, onDelete }) {
    return (
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                <h3 className="font-black text-gray-900">Registered Users ({users.length})</h3>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="bg-gray-50/50 text-left text-gray-500 font-bold uppercase text-[10px] tracking-widest">
                            <th className="px-8 py-4">User</th>
                            <th className="px-8 py-4">Role</th>
                            <th className="px-8 py-4">Status</th>
                            <th className="px-8 py-4">Joined</th>
                            <th className="px-8 py-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {users.map(u => (
                            <tr key={u.id} className="hover:bg-gray-50/80 transition-colors group">
                                <td className="px-8 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-gray-500 font-bold uppercase">
                                            {u.name.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="font-bold text-gray-900">{u.name}</p>
                                            <p className="text-xs text-gray-400">{u.email}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-8 py-4">
                                    <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-tighter ${
                                        u.role === 'admin' ? 'bg-red-100 text-red-700' : 
                                        u.role === 'seller' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'
                                    }`}>
                                        {u.role}
                                    </span>
                                </td>
                                <td className="px-8 py-4">
                                    <div className="flex items-center gap-1.5">
                                        <div className={`w-2 h-2 rounded-full ${u.isBlocked ? 'bg-red-500' : 'bg-emerald-500'}`} />
                                        <span className="font-semibold text-gray-700 text-xs">{u.isBlocked ? 'Blocked' : 'Active'}</span>
                                    </div>
                                </td>
                                <td className="px-8 py-4 text-gray-400 text-xs">
                                    {new Date(u.created_at).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}
                                </td>
                                <td className="px-8 py-4">
                                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button 
                                            onClick={() => onBlock(u.id)}
                                            className={`p-2 rounded-lg transition-colors ${u.isBlocked ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100' : 'bg-orange-50 text-orange-600 hover:bg-orange-100'}`}
                                            title={u.isBlocked ? "Unblock User" : "Block User"}
                                        >
                                            {u.isBlocked ? <UserCheck size={16}/> : <UserX size={16}/>}
                                        </button>
                                        {u.role !== 'admin' && (
                                            <button 
                                                onClick={() => onDelete(u.id)}
                                                className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                                            >
                                                <Trash2 size={16}/>
                                            </button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

function SellerApproval({ sellers, onAction }) {
    return (
        <div className="space-y-6">
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                <h3 className="text-lg font-black text-gray-900 mb-2">Seller Onboarding</h3>
                <p className="text-gray-400 text-sm mb-6">Review and manage seller partnership requests.</p>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {sellers.map(s => (
                        <div key={s.id} className="border border-gray-100 rounded-2xl p-6 hover:shadow-lg transition-all group">
                            <div className="flex items-start justify-between mb-4">
                                <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-600 font-black text-xl">
                                    {s.name.charAt(0)}
                                </div>
                                <span className={`px-2 py-1 rounded-lg text-[10px] font-black uppercase ${s.isApproved ? 'bg-emerald-100 text-emerald-700' : 'bg-orange-100 text-orange-700'}`}>
                                    {s.isApproved ? 'Approved' : 'Pending Review'}
                                </span>
                            </div>
                            <h4 className="font-bold text-gray-900">{s.name}</h4>
                            <p className="text-xs text-gray-400 mb-4">{s.email}</p>
                            
                            <div className="flex gap-2 mt-6">
                                {!s.isApproved ? (
                                    <>
                                        <button onClick={() => onAction(s.id, 'approve')} className="flex-1 bg-emerald-600 text-white text-xs font-bold py-2 rounded-xl hover:bg-emerald-700 transition-colors">Approve</button>
                                        <button onClick={() => onAction(s.id, 'reject')} className="flex-1 bg-gray-100 text-gray-600 text-xs font-bold py-2 rounded-xl hover:bg-gray-200 transition-colors">Decline</button>
                                    </>
                                ) : (
                                    <button onClick={() => onAction(s.id, 'reject')} className="w-full bg-red-50 text-red-600 text-xs font-bold py-2 rounded-xl hover:bg-red-100 transition-colors">Suspend Seller</button>
                                )}
                            </div>
                        </div>
                    ))}
                    {sellers.length === 0 && <p className="col-span-full text-center py-12 text-gray-400">No sellers pending approval.</p>}
                </div>
            </div>
        </div>
    );
}

function OrderManagement({ orders, deliveryBoys, onStatusUpdate, onAssign, onView }) {
    return (
        <div className="space-y-4">
            {orders.map(o => (
                <div key={o.id} className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex flex-col lg:flex-row lg:items-center gap-6">
                    <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                            <span className="text-xs font-black text-gray-400 uppercase tracking-widest">Order #{o.id}</span>
                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${statusColors[o.status] || "bg-gray-100"}`}>
                                {o.status}
                            </span>
                        </div>
                        <h4 className="font-black text-gray-900 text-lg">{o.product_name}</h4>
                        <p className="text-sm text-gray-500">
                            Buyer: <span className="text-gray-900 font-semibold">{o.buyer_name}</span> • 
                            Seller: <span className="text-gray-900 font-semibold">{o.seller_name}</span>
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-8">
                        <div>
                            <p className="text-[10px] font-black text-gray-400 uppercase mb-1">Total Value</p>
                            <p className="text-lg font-black text-emerald-600">₹{parseFloat(o.total_price).toLocaleString("en-IN")}</p>
                        </div>

                        <div className="min-w-[200px]">
                            <p className="text-[10px] font-black text-gray-400 uppercase mb-2">Logistics Control</p>
                            <div className="flex gap-2">
                                <select 
                                    value={o.status} 
                                    onChange={e => onStatusUpdate(o.id, e.target.value)}
                                    className="bg-gray-50 border-none rounded-xl text-xs font-bold px-3 py-2 focus:ring-2 focus:ring-red-500 outline-none flex-1"
                                >
                                    {Object.keys(statusColors).map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                                
                                <select 
                                    onChange={e => onAssign(o.id, e.target.value)}
                                    className="bg-gray-50 border-none rounded-xl text-xs font-bold px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none flex-1"
                                    defaultValue=""
                                >
                                    <option value="" disabled>Assign Courier</option>
                                    {deliveryBoys.map(db => (
                                        <option key={db.id} value={db.id}>{db.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        
                        <button 
                            onClick={() => onView(o.id)}
                            className="bg-gray-900 text-white font-black px-6 py-3 rounded-2xl text-sm hover:bg-black transition shadow-lg shadow-gray-100"
                        >
                            Details
                        </button>
                    </div>
                </div>
            ))}
            {orders.length === 0 && <div className="text-center py-24 bg-white rounded-3xl border border-dashed border-gray-200 text-gray-400">No orders found matching your criteria.</div>}
        </div>
    );
}

function SystemSettings() {
    return (
        <div className="max-w-3xl space-y-8">
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                <h3 className="text-xl font-black text-gray-900 mb-6">Global Configuration</h3>
                <div className="space-y-6">
                    <ToggleItem label="Enable Seller Self-Registration" desc="Allow new sellers to register without invite" enabled />
                    <ToggleItem label="Maintenance Mode" desc="Take the site offline for updates" />
                    <ToggleItem label="Automatic Delivery Assignment" desc="Use AI to assign nearest delivery partner" enabled />
                </div>
            </div>

            <div className="bg-red-50 rounded-3xl p-8 border border-red-100">
                <h3 className="text-lg font-black text-red-800 mb-2">Danger Zone</h3>
                <p className="text-red-600/70 text-sm mb-6">Irreversible administrative actions.</p>
                <div className="flex flex-wrap gap-4">
                    <button className="bg-red-600 text-white font-bold px-6 py-3 rounded-2xl hover:bg-red-700 transition-shadow">Clear System Cache</button>
                    <button className="bg-white text-red-600 border border-red-200 font-bold px-6 py-3 rounded-2xl hover:bg-red-50 transition-colors">Database Backup</button>
                </div>
            </div>
        </div>
    );
}

function ToggleItem({ label, desc, enabled = false }) {
    const [isOn, setIsOn] = useState(enabled);
    return (
        <div className="flex items-center justify-between">
            <div>
                <p className="font-bold text-gray-800 text-sm">{label}</p>
                <p className="text-xs text-gray-400">{desc}</p>
            </div>
            <button 
                onClick={() => setIsOn(!isOn)}
                className={`w-12 h-6 rounded-full transition-colors relative ${isOn ? 'bg-red-600' : 'bg-gray-200'}`}
            >
                <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${isOn ? 'right-1' : 'left-1'}`} />
            </button>
        </div>
    );
}

export default AdminDashboard;
