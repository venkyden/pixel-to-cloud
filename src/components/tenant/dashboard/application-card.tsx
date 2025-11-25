'use client'

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Property } from "@/types";
import { FileText, Clock, CheckCircle2, XCircle, ArrowRight } from "lucide-react";

interface TenantApplicationCardProps {
    application: {
        id: string;
        status: 'pending' | 'approved' | 'rejected' | 'draft';
        submittedDate: string;
        property: Property;
    };
    onViewDetails: (id: string) => void;
}

export const TenantApplicationCard = ({ application, onViewDetails }: TenantApplicationCardProps) => {
    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'approved':
                return <Badge className="bg-success/10 text-success hover:bg-success/20">Approved</Badge>;
            case 'rejected':
                return <Badge variant="destructive">Rejected</Badge>;
            case 'pending':
                return <Badge variant="secondary" className="bg-warning/10 text-warning hover:bg-warning/20">Pending Review</Badge>;
            default:
                return <Badge variant="outline">Draft</Badge>;
        }
    };

    return (
        <Card className="p-6 glass-effect border-border/50 hover:shadow-md transition-all duration-300">
            <div className="flex justify-between items-start mb-4">
                <div>
                    <h3 className="font-bold text-lg text-foreground">{application.property.name}</h3>
                    <p className="text-sm text-muted-foreground">{application.property.location}</p>
                </div>
                {getStatusBadge(application.status)}
            </div>

            <div className="space-y-3 mb-6">
                <div className="flex items-center text-sm text-muted-foreground">
                    <Clock className="w-4 h-4 mr-2" />
                    Submitted: {new Date(application.submittedDate).toLocaleDateString()}
                </div>
                <div className="flex items-center text-sm text-muted-foreground">
                    <FileText className="w-4 h-4 mr-2" />
                    Documents: {application.status === 'draft' ? 'Incomplete' : 'Uploaded'}
                </div>
            </div>

            <div className="flex gap-3">
                <Button variant="outline" className="flex-1" onClick={() => onViewDetails(application.id)}>
                    View Details
                </Button>
                {application.status === 'approved' && (
                    <Button className="flex-1 bg-success hover:bg-success/90">
                        Sign Lease
                        <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                )}
            </div>
        </Card>
    );
};
