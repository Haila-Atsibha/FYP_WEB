"use client";

import React, { useEffect, useState, Suspense } from "react";
import { CheckCircle2, Home, Loader2, AlertCircle } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import DashboardLayout from "../../../../src/components/DashboardLayout";
import ProtectedRoute from "../../../../src/components/ProtectedRoute";
import Button from "../../../../src/components/Button";
import api from "../../../../src/services/api";
import { useTranslation } from "../../../../src/hooks/useTranslation";

function SubscriptionSuccessContent() {
    const { t } = useTranslation();
    const searchParams = useSearchParams();
    const tx_ref = searchParams.get("tx_ref");
    const [status, setStatus] = useState("verifying"); // verifying, success, error

    useEffect(() => {
        const verify = async () => {
            if (!tx_ref) {
                setStatus("success"); // Assume success if no ref, but better to have it
                return;
            }

            try {
                await api.get(`/api/payments/verify-payment/${tx_ref}`);
                setStatus("success");
            } catch (err) {
                console.error("Verification failed:", err);
                setStatus("error");
            }
        };

        verify();
    }, [tx_ref]);

    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-8 animate-in fade-in zoom-in duration-700">
            {status === "verifying" ? (
                <div className="space-y-4">
                    <Loader2 className="w-16 h-16 text-primary animate-spin mx-auto" />
                    <h2 className="text-2xl font-bold">{t("verifying_payment")}</h2>
                    <p className="text-text-muted">{t("verifying_payment_desc")}</p>
                </div>
            ) : status === "error" ? (
                <div className="space-y-4">
                    <AlertCircle className="w-16 h-16 text-red-500 mx-auto" />
                    <h2 className="text-2xl font-bold text-red-500">{t("verification_pending")}</h2>
                    <p className="text-text-muted">{t("verification_pending_desc")}</p>
                    <Link href="/provider">
                        <Button>{t("btn_go_to_dashboard")}</Button>
                    </Link>
                </div>
            ) : (
                <>
                    <div className="relative">
                        <div className="w-24 h-24 bg-green-500/10 rounded-full flex items-center justify-center mb-4">
                            <CheckCircle2 className="w-16 h-16 text-green-500" />
                        </div>
                        <div className="absolute top-0 right-0 -mr-2 -mt-2 w-8 h-8 bg-green-500 rounded-full border-4 border-background flex items-center justify-center animate-bounce">
                            <CheckCircle2 className="w-4 h-4 text-white" />
                        </div>
                    </div>

                    <div className="space-y-3">
                        <h1 className="text-4xl font-black text-foreground tracking-tight">{t("payment_successful")}</h1>
                        <p className="text-text-muted text-lg max-w-md mx-auto">
                            {t("payment_successful_desc")}
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md">
                        <Link href="/provider" className="flex-1">
                            <Button className="w-full flex items-center justify-center gap-2">
                                <Home className="w-4 h-4" /> {t("btn_go_to_dashboard")}
                            </Button>
                        </Link>
                    </div>
                </>
            )}
        </div>
    );
}

export default function SubscriptionSuccess() {
    return (
        <ProtectedRoute roles={["provider"]}>
            <DashboardLayout>
                <Suspense fallback={
                    <div className="flex flex-col items-center justify-center min-h-[60vh]">
                        <Loader2 className="w-16 h-16 text-primary animate-spin" />
                    </div>
                }>
                    <SubscriptionSuccessContent />
                </Suspense>
            </DashboardLayout>
        </ProtectedRoute>
    );
}
