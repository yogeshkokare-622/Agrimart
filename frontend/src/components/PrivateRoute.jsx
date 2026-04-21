import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function PrivateRoute({ children, adminOnly = false, sellerOnly = false, deliveryOnly = false, allowCommon = false }) {
    const { isAuthenticated, isAdmin, isSeller, isDelivery, user, loading } = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-10 w-10 border-4 border-green-600 border-t-transparent"/>
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    if (adminOnly && !isAdmin) {
        return <Navigate to="/" replace />;
    }

    if (sellerOnly && !isSeller && !isAdmin) {
        return <Navigate to="/" replace />;
    }

    if (deliveryOnly && !isDelivery && !isAdmin) {
        return <Navigate to="/" replace />;
    }

    // Strict Seller Approval Check
    if (sellerOnly && isSeller && !user?.is_approved) {
        // Handled in SellerDashboard
    }

    // Generic route protection (Default)
    // Block delivery partners from Buyer/Marketplace sections, but allow common routes like Profile
    if (!adminOnly && !sellerOnly && !deliveryOnly && !allowCommon && isDelivery) {
        return <Navigate to="/delivery/dashboard" replace />;
    }

    return children;
}

export default PrivateRoute;