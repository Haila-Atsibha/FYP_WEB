"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCcw } from "lucide-react";
import Button from "../src/components/Button";

export default function GlobalError({ error, reset }) {
    useEffect(() => {
        // Log the error to an error reporting service
        console.error("Global Error Boundary caught an error:", error);
    }, [error]);

    return (
        <html>
            <body>
                <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-surface text-center">
                    <div className="w-24 h-24 bg-red-500/10 text-red-500 rounded-3xl flex items-center justify-center mb-6 animate-pulse">
                        <AlertTriangle size={48} />
                    </div>
                    <h1 className="text-4xl font-black text-foreground tracking-tight mb-2">Something went wrong!</h1>
                    <p className="text-text-muted mb-8 max-w-md">
                        We apologize for the inconvenience. Our team has been notified of this issue.
                    </p>
                    <div className="flex gap-4">
                        <Button variant="primary" onClick={() => reset()} className="flex items-center gap-2">
                            <RefreshCcw size={18} />
                            Try Again
                        </Button>
                        <Button variant="outline" onClick={() => window.location.href = '/'}>
                            Return Home
                        </Button>
                    </div>
                    {process.env.NODE_ENV === "development" && (
                        <div className="mt-10 p-4 bg-red-50 text-red-800 rounded-xl max-w-2xl text-left overflow-auto text-xs font-mono">
                            <p className="font-bold mb-2">Developer Error Details:</p>
                            <p>{error.message}</p>
                            <pre className="mt-2 opacity-80">{error.stack}</pre>
                        </div>
                    )}
                </div>
            </body>
        </html>
    );
}
