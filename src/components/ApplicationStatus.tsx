import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Clock, FileText, CreditCard, Home } from "lucide-react";

interface StatusStep {
  title: string;
  status: 'completed' | 'in-progress' | 'pending';
  date?: string;
  description: string;
}

interface ApplicationStatusProps {
  steps: StatusStep[];
  currentStage: string;
}

export const ApplicationStatus = ({ steps, currentStage }: ApplicationStatusProps) => {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="w-5 h-5 text-success" />;
      case 'in-progress':
        return <Clock className="w-5 h-5 text-warning animate-pulse" />;
      case 'pending':
        return <Clock className="w-5 h-5 text-muted-foreground" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-success/10 text-success border-success/20">Completed</Badge>;
      case 'in-progress':
        return <Badge className="bg-warning/10 text-warning border-warning/20">In Progress</Badge>;
      case 'pending':
        return <Badge variant="outline">Pending</Badge>;
      default:
        return null;
    }
  };

  const getStageIcon = (title: string) => {
    if (title.includes('Application')) return <FileText className="w-5 h-5" />;
    if (title.includes('Contract')) return <FileText className="w-5 h-5" />;
    if (title.includes('Payment')) return <CreditCard className="w-5 h-5" />;
    if (title.includes('Move')) return <Home className="w-5 h-5" />;
    return <CheckCircle2 className="w-5 h-5" />;
  };

  return (
    <Card className="p-6 glass-effect border-border/50 shadow-elegant overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 pointer-events-none" />
      <div className="relative mb-6">
        <h3 className="text-xl font-semibold mb-2 text-foreground flex items-center gap-2">
          <CheckCircle2 className="h-5 w-5 text-primary" />
          Application Timeline
        </h3>
        <p className="text-sm text-muted-foreground font-medium">
          Current Stage: <span className="font-semibold text-primary">{currentStage}</span>
        </p>
      </div>

      <div className="relative space-y-4">
        {steps.map((step, index) => (
          <div key={index} className="relative animate-fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
            {index < steps.length - 1 && (
              <div className={`absolute left-[22px] top-12 w-0.5 h-full -translate-x-1/2 ${
                step.status === 'completed' ? 'bg-gradient-to-b from-success to-success/50' : 'bg-border'
              }`} />
            )}
            
            <div className={`flex items-start gap-4 p-4 rounded-xl transition-all duration-300 hover:scale-[1.02] ${
              step.status === 'in-progress' 
                ? 'glass-effect border border-warning/30 bg-warning/5 shadow-md' 
                : step.status === 'completed'
                ? 'glass-effect border border-success/30 bg-success/5 shadow-md'
                : 'glass-effect border border-border/50'
            }`}>
              <div className="flex-shrink-0 mt-1">
                {getStatusIcon(step.status)}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    {getStageIcon(step.title)}
                    <h4 className="font-medium text-foreground">{step.title}</h4>
                  </div>
                  {getStatusBadge(step.status)}
                </div>
                
                <p className="text-sm text-muted-foreground mb-1">{step.description}</p>
                
                {step.date && (
                  <p className="text-xs text-muted-foreground">
                    {step.status === 'completed' ? 'Completed: ' : 'Expected: '}{step.date}
                  </p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};
