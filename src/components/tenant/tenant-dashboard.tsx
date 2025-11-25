'use client'

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TenantProfileForm } from "./dashboard/profile-form";
import { TenantMatches } from "./dashboard/matches-list";
import { TenantApplicationCard } from "./dashboard/application-card";
import { Property, TenantProfile } from "@/types";
import { User, Home, FileText, Settings } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTenantApplications } from "@/hooks/use-tenant-applications";

export const TenantDashboard = () => {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState("matches");

    const { applications, loading: appsLoading } = useTenantApplications();

    const handlePropertySelect = (property: Property) => {
        router.push(`/properties/${property.id}`);
    };

    const handleProfileSave = (profile: TenantProfile) => {
        setActiveTab("matches");
    };

    return (
        <div className="min-h-screen bg-background p-6">
            <div className="max-w-7xl mx-auto space-y-8">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-foreground">Tenant Dashboard</h1>
                        <p className="text-muted-foreground">Manage your search, applications, and profile</p>
                    </div>
                </div>

                <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                    <TabsList className="grid w-full grid-cols-3 lg:w-[400px] glass-effect">
                        <TabsTrigger value="matches" className="flex items-center gap-2">
                            <Home className="w-4 h-4" />
                            Matches
                        </TabsTrigger>
                        <TabsTrigger value="applications" className="flex items-center gap-2">
                            <FileText className="w-4 h-4" />
                            Applications
                        </TabsTrigger>
                        <TabsTrigger value="profile" className="flex items-center gap-2">
                            <User className="w-4 h-4" />
                            Profile
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="matches" className="space-y-6">
                        <TenantMatches onSelectProperty={handlePropertySelect} />
                    </TabsContent>

                    <TabsContent value="applications">
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {applications.map(app => (
                                <TenantApplicationCard
                                    key={app.id}
                                    application={{
                                        id: app.id,
                                        status: app.status,
                                        submittedDate: app.created_at,
                                        property: app.property
                                    }}
                                    onViewDetails={(id) => console.log("View details", id)}
                                />
                            ))}
                            {!appsLoading && applications.length === 0 && (
                                <div className="col-span-full text-center py-12 text-muted-foreground">
                                    No active applications. Start searching to find your new home!
                                </div>
                            )}
                        </div>
                    </TabsContent>

                    <TabsContent value="profile">
                        <TenantProfileForm onSave={handleProfileSave} />
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
};
