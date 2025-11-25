'use client'

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SmartInsights } from "./dashboard/smart-insights";
import { PropertyManager } from "./dashboard/property-manager";
import { ApplicantViewer } from "./dashboard/applicant-viewer";
import { LayoutDashboard, Building2, Users, Settings, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const LandlordDashboard = () => {
    const [activeTab, setActiveTab] = useState("overview");

    return (
        <div className="min-h-screen bg-background p-6">
            <div className="max-w-7xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-foreground">Landlord Command Center</h1>
                        <p className="text-muted-foreground">Manage your portfolio with AI-driven insights</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Button variant="outline" size="icon" className="relative">
                            <Bell className="w-5 h-5" />
                            <Badge className="absolute -top-1 -right-1 h-4 w-4 p-0 flex items-center justify-center bg-destructive text-[10px]">3</Badge>
                        </Button>
                        <Button variant="outline" size="icon">
                            <Settings className="w-5 h-5" />
                        </Button>
                    </div>
                </div>

                {/* Main Content */}
                <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                    <TabsList className="grid w-full grid-cols-3 lg:w-[400px] glass-effect">
                        <TabsTrigger value="overview" className="flex items-center gap-2">
                            <LayoutDashboard className="w-4 h-4" />
                            Overview
                        </TabsTrigger>
                        <TabsTrigger value="properties" className="flex items-center gap-2">
                            <Building2 className="w-4 h-4" />
                            Properties
                        </TabsTrigger>
                        <TabsTrigger value="applicants" className="flex items-center gap-2">
                            <Users className="w-4 h-4" />
                            Applicants
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="overview" className="space-y-8 animate-in fade-in-50 duration-500">
                        <SmartInsights />
                        <div className="grid lg:grid-cols-2 gap-8">
                            <ApplicantViewer />
                            <PropertyManager />
                        </div>
                    </TabsContent>

                    <TabsContent value="properties" className="animate-in fade-in-50 duration-500">
                        <PropertyManager />
                    </TabsContent>

                    <TabsContent value="applicants" className="animate-in fade-in-50 duration-500">
                        <ApplicantViewer />
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
};
