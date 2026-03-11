"use client";

import React from 'react';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';

const icons = {
    success: <CheckCircle className="text-green-500" size={20} />,
    error: <AlertCircle className="text-red-500" size={20} />,
    warning: <AlertTriangle className="text-yellow-500" size={20} />,
    info: <Info className="text-blue-500" size={20} />,
};

const styles = {
    success: "bg-green-50 border-green-100 text-green-800",
    error: "bg-red-50 border-red-100 text-red-800",
    warning: "bg-yellow-50 border-yellow-100 text-yellow-800",
    info: "bg-blue-50 border-blue-100 text-blue-800",
};

export default function Toast({ toast, onRemove }) {
    return (
        <div className={`flex items-center gap-3 p-4 rounded-2xl border shadow-lg animate-in slide-in-from-right-full duration-300 min-w-[300px] ${styles[toast.type] || styles.info}`}>
            <div className="flex-shrink-0">
                {icons[toast.type] || icons.info}
            </div>
            <div className="flex-1 font-bold text-sm">
                {toast.message}
            </div>
            <button
                onClick={() => onRemove(toast.id)}
                className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
            >
                <X size={16} />
            </button>
        </div>
    );
}
