import React from "react";

function Loader({ fullPage = false, message = "Loading..." }) {
    if (fullPage) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 gap-4">
                <div className="animate-spin rounded-full h-14 w-14 border-4 border-green-600 border-t-transparent"/>
                <p className="text-gray-500 font-medium">{message}</p>
            </div>
        );
    }
    return (
        <div className="flex items-center justify-center py-16 gap-3">
            <div className="animate-spin rounded-full h-8 w-8 border-4 border-green-600 border-t-transparent"/>
            <p className="text-gray-500">{message}</p>
        </div>
    );
}

export default Loader;
