import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Plus } from "lucide-react";

export default function IncidentsPage() {
    return (
        <div className="min-h-screen bg-background p-6">
            <div className="max-w-7xl mx-auto space-y-8">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-foreground">Incidents & Maintenance</h1>
                        <p className="text-muted-foreground">Report and track maintenance issues</p>
                    </div>
                    <Button>
                        <Plus className="w-4 h-4 mr-2" />
                        Report Incident
                    </Button>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <Card className="glass-effect border-border/50">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <AlertTriangle className="w-5 h-5 text-warning" />
                                No Active Incidents
                            </CardTitle>
                            <CardDescription>You have no open maintenance requests.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground">
                                If you have an issue with your property, click the "Report Incident" button to notify your landlord.
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
