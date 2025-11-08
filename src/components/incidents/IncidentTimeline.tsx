import { Card } from "@/components/ui/card";
import { IncidentTimelineEvent } from "@/types/incidents";
import { Clock, User } from "lucide-react";

interface IncidentTimelineProps {
  timeline: IncidentTimelineEvent[];
}

export const IncidentTimeline = ({ timeline }: IncidentTimelineProps) => {
  return (
    <Card className="p-6">
      <h3 className="text-xl font-semibold mb-6 text-foreground flex items-center gap-2">
        <Clock className="w-5 h-5" />
        Incident Timeline
      </h3>
      
      <div className="space-y-6">
        {timeline.map((event, index) => (
          <div key={event.id} className="relative">
            {index < timeline.length - 1 && (
              <div className="absolute left-[15px] top-8 w-0.5 h-full bg-border" />
            )}
            
            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 relative z-10">
                <div className="w-3 h-3 rounded-full bg-primary" />
              </div>
              
              <div className="flex-1 pb-6">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h4 className="font-semibold text-foreground">{event.action}</h4>
                    <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                      <User className="w-3 h-3" />
                      {event.actor}
                    </p>
                  </div>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    {new Date(event.timestamp).toLocaleString('en-GB', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">{event.details}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};
