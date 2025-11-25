'use client'

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Home, BarChart3, Receipt, Wrench, FileText, Video } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PaymentHistory } from "@/components/payments/payment-history";

export const DashboardClient = () => {
    return (
        <div className="container py-8 relative">
            <div className="mb-8 animate-fade-in">
                <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-2">Dashboard</h1>
                <p className="text-muted-foreground text-lg">Manage your properties and tenants</p>
            </div>

            <Tabs defaultValue="overview" className="space-y-6">
                <TabsList className="grid w-full grid-cols-3 md:grid-cols-6 glass-effect p-1.5 h-auto">
                    <TabsTrigger value="overview" className="data-[state=active]:bg-background data-[state=active]:shadow-md transition-all duration-300">
                        <Home className="mr-2 h-4 w-4" />
                        <span className="hidden sm:inline">Overview</span>
                    </TabsTrigger>
                    <TabsTrigger value="analytics" className="data-[state=active]:bg-background data-[state=active]:shadow-md transition-all duration-300">
                        <BarChart3 className="mr-2 h-4 w-4" />
                        <span className="hidden sm:inline">Analytics</span>
                    </TabsTrigger>
                    <TabsTrigger value="payments" className="data-[state=active]:bg-background data-[state=active]:shadow-md transition-all duration-300">
                        <Receipt className="mr-2 h-4 w-4" />
                        <span className="hidden sm:inline">Payments</span>
                    </TabsTrigger>
                    <TabsTrigger value="maintenance" className="data-[state=active]:bg-background data-[state=active]:shadow-md transition-all duration-300">
                        <Wrench className="mr-2 h-4 w-4" />
                        <span className="hidden sm:inline">Maintenance</span>
                    </TabsTrigger>
                    <TabsTrigger value="documents" className="data-[state=active]:bg-background data-[state=active]:shadow-md transition-all duration-300">
                        <FileText className="mr-2 h-4 w-4" />
                        <span className="hidden sm:inline">Documents</span>
                    </TabsTrigger>
                    <TabsTrigger value="inspections" className="data-[state=active]:bg-background data-[state=active]:shadow-md transition-all duration-300">
                        <Video className="mr-2 h-4 w-4" />
                        <span className="hidden sm:inline">Inspections</span>
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="overview">
                    <Card className="glass-effect">
                        <CardHeader>
                            <CardTitle>Overview</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground">Overview dashboard coming soon.</p>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="analytics">
                    <Card className="glass-effect">
                        <CardHeader>
                            <CardTitle>Analytics</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground">Analytics dashboard coming soon.</p>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="payments">
                    <PaymentHistory />
                </TabsContent>

                <TabsContent value="maintenance">
                    <Card className="glass-effect">
                        <CardHeader>
                            <CardTitle>Maintenance</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground">Maintenance requests coming soon.</p>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="documents">
                    <Card className="glass-effect">
                        <CardHeader>
                            <CardTitle>Documents</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground">Document vault coming soon.</p>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="inspections">
                    <Card className="glass-effect">
                        <CardHeader>
                            <CardTitle>Inspections</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground">Property inspections coming soon.</p>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
};
