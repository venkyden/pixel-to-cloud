import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Incident } from "@/types/incidents";
import { 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Eye,
  Wrench,
  CreditCard,
  Scale,
  Shield,
  MessageSquare,
  FileQuestion
} from "lucide-react";

interface IncidentCardProps {
  incident: Incident;
  onViewDetails: (incident: Incident) => void;
}

export const IncidentCard = ({ incident, onViewDetails }: IncidentCardProps) => {
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'maintenance':
        return <Wrench className="w-4 h-4" />;
      case 'payment':
        return <CreditCard className="w-4 h-4" />;
      case 'dispute':
        return <MessageSquare className="w-4 h-4" />;
      case 'legal':
        return <Scale className="w-4 h-4" />;
      case 'safety':
        return <Shield className="w-4 h-4" />;
      default:
        return <FileQuestion className="w-4 h-4" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'open':
        return <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/20">Open</Badge>;
      case 'investigating':
        return <Badge variant="outline" className="bg-warning/10 text-warning border-warning/20">Investigating</Badge>;
      case 'resolved':
        return <Badge variant="outline" className="bg-success/10 text-success border-success/20">Resolved</Badge>;
      case 'closed':
        return <Badge variant="outline">Closed</Badge>;
      default:
        return null;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'critical':
        return <Badge className="bg-destructive text-destructive-foreground">Critical</Badge>;
      case 'high':
        return <Badge className="bg-warning/80 text-white border-warning">High</Badge>;
      case 'medium':
        return <Badge variant="secondary">Medium</Badge>;
      case 'low':
        return <Badge variant="outline">Low</Badge>;
      default:
        return null;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'resolved':
        return <CheckCircle2 className="w-5 h-5 text-success" />;
      case 'investigating':
        return <Clock className="w-5 h-5 text-warning animate-pulse" />;
      default:
        return <AlertTriangle className="w-5 h-5 text-destructive" />;
    }
  };

  return (
    <Card className="p-6 hover:shadow-lg transition-all">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start gap-3 flex-1">
          <div className="mt-1">
            {getStatusIcon(incident.status)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-lg font-semibold text-foreground truncate">
                {incident.title}
              </h3>
              <Badge variant="outline" className="text-xs">
                {incident.id}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
              {incident.description}
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        {getStatusBadge(incident.status)}
        {getPriorityBadge(incident.priority)}
        <Badge variant="outline" className="text-xs">
          {getCategoryIcon(incident.category)}
          <span className="ml-1 capitalize">{incident.category}</span>
        </Badge>
      </div>

      <div className="space-y-2 mb-4 text-sm">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Property:</span>
          <span className="font-medium text-foreground text-right">{incident.propertyName}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Reported by:</span>
          <span className="font-medium text-foreground">{incident.reporterName}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Created:</span>
          <span className="font-medium text-foreground">
            {new Date(incident.createdAt).toLocaleDateString('en-GB')}
          </span>
        </div>
        {incident.resolvedAt && (
          <div className="flex justify-between">
            <span className="text-muted-foreground">Resolved:</span>
            <span className="font-medium text-success">
              {new Date(incident.resolvedAt).toLocaleDateString('en-GB')}
            </span>
          </div>
        )}
      </div>

      <Button 
        className="w-full" 
        variant="outline"
        onClick={() => onViewDetails(incident)}
      >
        <Eye className="w-4 h-4 mr-2" />
        View Details
      </Button>
    </Card>
  );
};
