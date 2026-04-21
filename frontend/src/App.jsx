import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";

import { AuthProvider } from "./context/AuthContext";

import Navbar from "./components/Navbar";
import PrivateRoute from "./components/PrivateRoute";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Marketplace from "./pages/Marketplace";
import Profile from "./pages/Profile";
import AdminDashboard from "./pages/AdminDashboard";
import ProductDetails from "./pages/ProductDetails";
import SellerDashboard from "./pages/SellerDashboard";
import BuyerOrders from "./pages/BuyerOrders";
import Checkout from "./pages/Checkout";
import DeliveryDashboard from "./pages/DeliveryDashboard";
import OrderTracking from "./pages/OrderTracking";


function App() {
  return (
    <AuthProvider>
        <BrowserRouter>
          <div className="flex flex-col min-h-screen">
            <Navbar />
            <div className="flex-1">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/home" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/marketplace" element={<PrivateRoute><Marketplace /></PrivateRoute>} />
                <Route path="/products/:id" element={<ProductDetails />} />
                
                {/* Protected Routes */}
                <Route path="/seller/dashboard" element={<PrivateRoute sellerOnly><SellerDashboard /></PrivateRoute>} />
                <Route path="/orders" element={<PrivateRoute><BuyerOrders /></PrivateRoute>} />
                <Route path="/orders/:id/track" element={<PrivateRoute><OrderTracking /></PrivateRoute>} />
                <Route path="/delivery/dashboard" element={<PrivateRoute deliveryOnly><DeliveryDashboard /></PrivateRoute>} />
                <Route path="/profile" element={<PrivateRoute allowCommon><Profile /></PrivateRoute>} />
                <Route path="/checkout" element={<PrivateRoute><Checkout /></PrivateRoute>} />
                
                {/* Admin Only Routes */}
                <Route path="/admin" element={<PrivateRoute adminOnly><AdminDashboard /></PrivateRoute>} />
              </Routes>
            </div>
          </div>
          <Toaster position="top-right" />
        </BrowserRouter>
    </AuthProvider>
  );
}



export default App;