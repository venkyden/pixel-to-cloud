'use client'

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Download, CreditCard, Loader2 } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { useAuth } from "@/components/providers/auth-provider";
import { toast } from "sonner";
import { useLanguage } from "@/components/providers/language-provider";

interface Payment {
    id: string;
    payment_date: string;
    description: string;
    amount: number;
    status: string;
    currency: string;
    property_id: string;
}

export const PaymentHistory = () => {
    const [payments, setPayments] = useState<Payment[]>([]);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();
    const { t } = useLanguage();
    const supabase = createClient();

    const fetchPayments = useCallback(async () => {
        if (!user) return;

        try {
            const { data, error } = await supabase
                .from("payments")
                .select("*")
                .order("payment_date", { ascending: false });

            if (error) throw error;

            setPayments(data || []);
        } catch (error) {
            if (process.env.NODE_ENV === 'development') console.error("Error fetching payments:", error);
            toast.error("Failed to load payment history");
        } finally {
            setLoading(false);
        }
    }, [user, supabase]);

    useEffect(() => {
        if (user) {
            fetchPayments();
        }
    }, [user, fetchPayments]);

    const getStatusBadge = (status: string) => {
        const variants = {
            completed: "default",
            pending: "secondary",
            failed: "destructive",
        } as const;
        return <Badge variant={variants[status as keyof typeof variants] || "secondary"}>{status}</Badge>;
    };

    const handleDownloadReceipt = (paymentId: string) => {
        toast.info(t("payment.downloadStarted") || "Download started...");
        // TODO: Implement actual receipt download
    };

    if (!user) {
        return (
            <Card>
                <CardContent className="pt-6">
                    <p className="text-center text-muted-foreground">{t("payment.loginRequired") || "Login required"}</p>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="glass-effect border-border/50">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5 text-primary" />
                    {t("payment.title") || "Payment History"}
                </CardTitle>
            </CardHeader>
            <CardContent>
                {loading ? (
                    <div className="flex items-center justify-center py-8">
                        <Loader2 className="h-6 w-6 animate-spin text-primary" />
                    </div>
                ) : payments.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">{t("payment.noHistory") || "No payment history found"}</p>
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>{t("payment.date") || "Date"}</TableHead>
                                <TableHead>{t("payment.description") || "Description"}</TableHead>
                                <TableHead>{t("payment.amount") || "Amount"}</TableHead>
                                <TableHead>{t("payment.status") || "Status"}</TableHead>
                                <TableHead>{t("payment.receipt") || "Receipt"}</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {payments.map((payment) => (
                                <TableRow key={payment.id}>
                                    <TableCell>
                                        {payment.payment_date
                                            ? new Date(payment.payment_date).toLocaleDateString()
                                            : "N/A"}
                                    </TableCell>
                                    <TableCell>{payment.description || t("payment.defaultDescription") || "Rent Payment"}</TableCell>
                                    <TableCell className="font-semibold">
                                        {payment.currency}{Number(payment.amount).toFixed(2)}
                                    </TableCell>
                                    <TableCell>{getStatusBadge(payment.status)}</TableCell>
                                    <TableCell>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleDownloadReceipt(payment.id)}
                                        >
                                            <Download className="h-4 w-4" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                )}
            </CardContent>
        </Card>
    );
};
