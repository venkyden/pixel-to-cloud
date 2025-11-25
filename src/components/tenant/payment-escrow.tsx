'use client'

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Shield, CreditCard, Lock, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/utils/supabase/client";

interface PaymentEscrowProps {
    applicationId: string;
    monthlyRent: number;
    deposit: number;
    onPayment: () => void;
}

export const PaymentEscrow = ({ applicationId, monthlyRent, deposit, onPayment }: PaymentEscrowProps) => {
    const [loading, setLoading] = useState(false);
    const total = monthlyRent + deposit;
    const supabase = createClient();

    const handlePayment = async () => {
        setLoading(true);
        try {
            toast.info("Initializing secure payment...");

            // Create checkout session via edge function
            const { data, error } = await supabase.functions.invoke("process-escrow-payment", {
                body: {
                    applicationId,
                    amount: monthlyRent,
                    depositAmount: deposit,
                },
            });

            if (error) throw error;

            // Redirect to Stripe Checkout
            if (data.url) {
                window.location.href = data.url;
            } else {
                throw new Error("No checkout URL received");
            }
        } catch (error) {
            if (process.env.NODE_ENV === 'development') console.error("Payment error:", error);
            toast.error(error instanceof Error ? error.message : "Payment failed. Please try again.");
            setLoading(false);
        }
    };

    return (
        <Card className="p-6">
            <div className="space-y-2 mb-6">
                <div className="flex items-center gap-2">
                    <Shield className="w-6 h-6 text-primary" />
                    <h3 className="text-xl font-semibold text-foreground">Secure Escrow Payment</h3>
                </div>
                <p className="text-xs text-muted-foreground">
                    Escrow service compliant with French payment services regulations
                </p>
            </div>

            <div className="space-y-4 mb-6">
                <div className="p-4 bg-accent/5 rounded-lg border border-accent/20">
                    <div className="flex items-center gap-2 mb-3">
                        <Lock className="w-4 h-4 text-primary" />
                        <p className="text-sm font-medium text-foreground">How escrow works:</p>
                    </div>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                        <li className="flex items-start gap-2">
                            <CheckCircle2 className="w-4 h-4 text-success flex-shrink-0 mt-0.5" />
                            <span>Payment is securely held until move-in</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <CheckCircle2 className="w-4 h-4 text-success flex-shrink-0 mt-0.5" />
                            <span>Landlord receives payment after entry inspection</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <CheckCircle2 className="w-4 h-4 text-success flex-shrink-0 mt-0.5" />
                            <span>Full refund if property doesn't match description</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <CheckCircle2 className="w-4 h-4 text-success flex-shrink-0 mt-0.5" />
                            <span>Security deposit held in escrow for lease duration</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <CheckCircle2 className="w-4 h-4 text-success flex-shrink-0 mt-0.5" />
                            <span>Compliant with July 6, 1989 law (return within 2 months)</span>
                        </li>
                    </ul>
                </div>

                <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                        <span className="text-sm text-muted-foreground">First month rent (excl. charges)</span>
                        <span className="font-semibold text-foreground">{monthlyRent} €</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                        <span className="text-sm text-muted-foreground">Security Deposit</span>
                        <span className="font-semibold text-foreground">{deposit} €</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-primary/10 rounded-lg border border-primary/20">
                        <span className="text-sm font-medium text-foreground">Total due today</span>
                        <span className="text-xl font-bold text-primary">{total} €</span>
                    </div>
                </div>
            </div>

            <div className="space-y-3">
                <Button className="w-full" size="lg" onClick={handlePayment} disabled={loading}>
                    <CreditCard className="w-4 h-4 mr-2" />
                    {loading ? "Processing..." : "Pay Securely"}
                </Button>
                <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                        <Shield className="w-3 h-3" />
                        <span>SSL Encryption</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <Lock className="w-3 h-3" />
                        <span>PCI-DSS</span>
                    </div>
                    <Badge variant="outline" className="text-xs">Secure Escrow</Badge>
                </div>
                <p className="text-xs text-center text-muted-foreground">
                    Secure payment via Stripe • End-to-end encrypted
                </p>
            </div>
        </Card>
    );
};
