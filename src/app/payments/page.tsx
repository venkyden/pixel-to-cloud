import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CreditCard, Download } from "lucide-react";

export default function PaymentsPage() {
    return (
        <div className="min-h-screen bg-background p-6">
            <div className="max-w-7xl mx-auto space-y-8">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-foreground">Payments & Invoices</h1>
                        <p className="text-muted-foreground">Manage your rent payments and view history</p>
                    </div>
                    <Button variant="outline">
                        <Download className="w-4 h-4 mr-2" />
                        Download Statement
                    </Button>
                </div>

                <div className="grid gap-6">
                    <Card className="glass-effect border-border/50">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <CreditCard className="w-5 h-5 text-primary" />
                                Payment History
                            </CardTitle>
                            <CardDescription>Your recent transactions</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="text-center py-12 text-muted-foreground">
                                No payments found. Once you have an active lease, your payment history will appear here.
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
