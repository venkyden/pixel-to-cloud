import { Card } from "@/components/ui/card";
import { IncidentStats as IIncidentStats } from "@/types/incidents";
import { 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  TrendingUp,
  Activity
} from "lucide-react";

interface IncidentStatsProps {
  stats: IIncidentStats;
}

export const IncidentStatsDisplay = ({ stats }: IncidentStatsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground mb-1">Total Incidents</p>
            <p className="text-3xl font-bold text-foreground">{stats.total}</p>
          </div>
          <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
            <Activity className="w-6 h-6 text-primary" />
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground mb-1">Open Cases</p>
            <p className="text-3xl font-bold text-destructive">{stats.open}</p>
          </div>
          <div className="w-12 h-12 bg-destructive/10 rounded-full flex items-center justify-center">
            <AlertTriangle className="w-6 h-6 text-destructive" />
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground mb-1">Resolved</p>
            <p className="text-3xl font-bold text-success">{stats.resolved}</p>
          </div>
          <div className="w-12 h-12 bg-success/10 rounded-full flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6 text-success" />
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground mb-1">Avg Resolution</p>
            <p className="text-3xl font-bold text-foreground">{stats.averageResolutionTime}h</p>
          </div>
          <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center">
            <Clock className="w-6 h-6 text-accent" />
          </div>
        </div>
      </Card>

      <Card className="p-6 lg:col-span-2">
        <h3 className="font-semibold mb-4 text-foreground flex items-center gap-2">
          <TrendingUp className="w-5 h-5" />
          By Category
        </h3>
        <div className="space-y-3">
          {Object.entries(stats.byCategory).map(([category, count]) => (
            count > 0 && (
              <div key={category} className="flex items-center justify-between">
                <span className="text-sm capitalize text-muted-foreground">{category}</span>
                <div className="flex items-center gap-2">
                  <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary"
                      style={{ width: `${(count / stats.total) * 100}%` }}
                    />
                  </div>
                  <span className="text-sm font-semibold text-foreground w-8 text-right">{count}</span>
                </div>
              </div>
            )
          ))}
        </div>
      </Card>

      <Card className="p-6 lg:col-span-2">
        <h3 className="font-semibold mb-4 text-foreground flex items-center gap-2">
          <AlertTriangle className="w-5 h-5" />
          By Priority
        </h3>
        <div className="space-y-3">
          {Object.entries(stats.byPriority).map(([priority, count]) => (
            count > 0 && (
              <div key={priority} className="flex items-center justify-between">
                <span className="text-sm capitalize text-muted-foreground">{priority}</span>
                <div className="flex items-center gap-2">
                  <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${
                        priority === 'critical' ? 'bg-destructive' :
                        priority === 'high' ? 'bg-warning' :
                        priority === 'medium' ? 'bg-accent' :
                        'bg-muted-foreground'
                      }`}
                      style={{ width: `${(count / stats.total) * 100}%` }}
                    />
                  </div>
                  <span className="text-sm font-semibold text-foreground w-8 text-right">{count}</span>
                </div>
              </div>
            )
          ))}
        </div>
      </Card>
    </div>
  );
};
