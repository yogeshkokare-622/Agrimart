import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import API from "../services/api";
import toast from "react-hot-toast";
import { ChevronRight, CreditCard, Truck, MapPin, CheckCircle2, ShoppingBag } from "lucide-react";

function Checkout() {
    const navigate = useNavigate();
    const location = useLocation();
    const directItem = location.state?.directItem;

    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState(1);

    const [address, setAddress] = useState({
        line1: "",
        city: "",
        zip: "",
        phone: ""
    });

    useEffect(() => {
        if (!directItem && step !== 3) {
            navigate("/marketplace");
        }
    }, [directItem, navigate, step]);

    const handlePlaceOrder = async () => {
        setLoading(true);
        try {
            // Place single direct order
            await API.post("/orders", { 
                product_id: directItem.product_id, 
                quantity: directItem.quantity 
            });
            
            toast.success("Order Placed Successfully! 🎉");
            setStep(3);
        } catch (err) {
            toast.error(err.response?.data?.message || "Checkout failed");
        } finally {
            setLoading(false);
        }
    };

    if (!directItem && step !== 3) return null;

    const total = directItem ? directItem.price * directItem.quantity : 0;

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* Progress Stepper */}
            <div className="max-w-3xl mx-auto px-4 py-12">
                <div className="flex items-center justify-between relative">
                    <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-200 -translate-y-1/2 z-0"></div>
                    <div className={`absolute top-1/2 left-0 h-1 bg-green-600 -translate-y-1/2 z-0 transition-all duration-500`} style={{ width: step === 1 ? '0%' : step === 2 ? '50%' : '100%' }}></div>
                    
                    <StepCircle num={1} active={step >= 1} done={step > 1} label="Address" />
                    <StepCircle num={2} active={step >= 2} done={step > 2} label="Payment" />
                    <StepCircle num={3} active={step >= 3} done={step > 3} label="Confirm" />
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-12 gap-12">
                
                {/* Main Content */}
                <div className="lg:col-span-8">
                    {step === 1 && (
                        <div className="bg-white rounded-3xl shadow-sm p-8 border border-gray-100">
                            <h2 className="text-2xl font-black mb-8 flex items-center gap-3"><MapPin className="text-green-600"/> Shipping Address</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <InputGroup label="Street Address" value={address.line1} onChange={e=>setAddress({...address, line1: e.target.value})} placeholder="123 Farm Road" />
                                <InputGroup label="Phone Number" value={address.phone} onChange={e=>setAddress({...address, phone: e.target.value})} placeholder="000-000-0000" />
                                <InputGroup label="City" value={address.city} onChange={e=>setAddress({...address, city: e.target.value})} placeholder="Nagpur" />
                                <InputGroup label="ZIP / Postal Code" value={address.zip} onChange={e=>setAddress({...address, zip: e.target.value})} placeholder="440001" />
                            </div>
                            <button 
                                onClick={() => step < 3 && setStep(2)}
                                className="mt-10 w-full bg-green-600 text-white font-black py-4 rounded-2xl hover:bg-green-700 transition flex items-center justify-center gap-2"
                            >
                                Continue to Payment <ChevronRight size={20}/>
                            </button>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="bg-white rounded-3xl shadow-sm p-8 border border-gray-100">
                            <h2 className="text-2xl font-black mb-8 flex items-center gap-3"><CreditCard className="text-green-600"/> Payment Method</h2>
                            <div className="space-y-4">
                                <PaymentOption active={true} icon={<CreditCard/>} label="Cash on Delivery" description="Pay when you receive the fresh products." />
                                <PaymentOption active={false} icon={<CreditCard/>} label="UPI / Cards" description="Coming soon..." disabled />
                            </div>
                            <div className="flex gap-4 mt-10">
                                <button onClick={()=>setStep(1)} className="flex-1 bg-gray-100 text-gray-600 font-black py-4 rounded-2xl hover:bg-gray-200 transition">Back</button>
                                <button 
                                    onClick={handlePlaceOrder}
                                    disabled={loading}
                                    className="flex-[2] bg-green-600 text-white font-black py-4 rounded-2xl hover:bg-green-700 transition flex items-center justify-center gap-2 shadow-lg shadow-green-100"
                                >
                                    {loading ? "Processing..." : "Complete Purchase"} <CheckCircle2 size={20}/>
                                </button>
                            </div>
                        </div>
                    )}

                    {step === 3 && (
                        <div className="bg-white rounded-3xl shadow-sm p-16 border border-gray-100 text-center animate-in zoom-in duration-500">
                            <div className="h-24 w-24 bg-green-100 rounded-full flex items-center justify-center text-green-600 mx-auto mb-8 shadow-inner">
                                <CheckCircle2 size={64} />
                            </div>
                            <h2 className="text-4xl font-black text-gray-900 mb-4">Order Confirmed!</h2>
                            <p className="text-gray-500 text-lg mb-10 max-w-md mx-auto">Your fresh produce is being prepared for shipping. We'll send you an update as soon as it leaves the farm.</p>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <button onClick={()=>navigate("/orders")} className="bg-gray-900 text-white font-bold py-4 px-8 rounded-2xl hover:bg-black transition">Track My Order</button>
                                <button onClick={()=>navigate("/marketplace")} className="bg-white text-green-600 font-bold py-4 px-8 rounded-2xl border-2 border-green-600 hover:bg-green-50 transition">Continue Shopping</button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Sidebar Order Summary */}
                {step < 3 && directItem && (
                    <div className="lg:col-span-4">
                        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 sticky top-8">
                            <h3 className="text-xl font-black mb-6">Order Summary</h3>
                            <div className="space-y-4 mb-8">
                                <div className="flex justify-between items-center gap-4">
                                    <div className="bg-gray-50 h-12 w-12 rounded-xl flex-shrink-0 overflow-hidden">
                                        <img src={directItem.image ? `${import.meta.env.VITE_API_URL?.replace("/api", "") || "http://localhost:5000"}/uploads/${directItem.image}` : `https://placehold.co/48x48`} className="h-full w-full object-cover" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm font-black text-gray-900 truncate">{directItem.name}</p>
                                        <p className="text-[10px] font-bold text-gray-400">Qty: {directItem.quantity}</p>
                                    </div>
                                    <p className="font-black text-sm">₹{directItem.price * directItem.quantity}</p>
                                </div>
                            </div>
                            
                            <div className="space-y-3 pt-6 border-t border-gray-100">
                                <div className="flex justify-between text-sm text-gray-500">
                                    <span>Subtotal</span>
                                    <span className="font-bold">₹{total}</span>
                                </div>
                                <div className="flex justify-between text-sm text-gray-500">
                                    <span>Shipping</span>
                                    <span className="text-green-600 font-bold uppercase text-[10px]">Free</span>
                                </div>
                                <div className="flex justify-between text-xl font-black text-gray-900 pt-4 border-t border-dashed border-gray-200">
                                    <span>Total</span>
                                    <span>₹{total}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

function StepCircle({ num, active, done, label }) {
    return (
        <div className="flex flex-col items-center gap-2 z-10">
            <div className={`h-12 w-12 rounded-full flex items-center justify-center font-black transition-all duration-300 border-4 ${
                done ? "bg-green-600 border-green-600 text-white" : 
                active ? "bg-white border-green-600 text-green-600 shadow-lg" : 
                "bg-white border-gray-200 text-gray-300"
            }`}>
                {done ? <CheckCircle2 size={24}/> : num}
            </div>
            <span className={`text-xs font-black uppercase tracking-tighter ${active ? 'text-gray-900' : 'text-gray-300'}`}>{label}</span>
        </div>
    );
}

function InputGroup({ label, value, onChange, placeholder }) {
    return (
        <div className="space-y-1">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">{label}</label>
            <input 
                type="text" 
                value={value} 
                onChange={onChange} 
                className="w-full bg-gray-50 border-none rounded-2xl px-5 py-4 font-bold text-gray-900 hover:bg-gray-100 focus:bg-white focus:ring-2 focus:ring-green-500 transition outline-none" 
                placeholder={placeholder} 
            />
        </div>
    );
}

function PaymentOption({ active, icon, label, description, disabled }) {
    return (
        <div className={`p-6 rounded-2xl border-2 flex items-center gap-6 transition ${
            disabled ? 'opacity-30 border-gray-100 cursor-not-allowed' :
            active ? 'border-green-600 bg-green-50/30' : 'border-gray-100 hover:border-gray-200 cursor-pointer'
        }`}>
            <div className={`h-12 w-12 rounded-xl flex items-center justify-center ${active ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-400'}`}>
                {icon}
            </div>
            <div>
                <p className="font-black text-gray-900">{label}</p>
                <p className="text-xs text-gray-500 font-medium">{description}</p>
            </div>
        </div>
    );
}

export default Checkout;
