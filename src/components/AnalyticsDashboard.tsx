import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, DollarSign, Users, Home } from "lucide-react";

interface Metric {
  title: string;
  value: string;
  change: string;
  icon: any;
}

const metrics: Metric[] = [
  {
    title: "Total Revenue",
    value: "$12,450",
    change: "+12.5%",
    icon: DollarSign,
  },
  {
    title: "Active Tenants",
    value: "24",
    change: "+3",
    icon: Users,
  },
  {
    title: "Properties",
    value: "8",
    change: "+2",
    icon: Home,
  },
  {
    title: "Occupancy Rate",
    value: "95%",
    change: "+5%",
    icon: TrendingUp,
  },
];

export const AnalyticsDashboard = () => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric) => (
          <Card key={metric.title}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">{metric.title}</p>
                  <p className="text-3xl font-bold text-foreground">{metric.value}</p>
                  <p className="text-sm text-success mt-1">{metric.change} from last month</p>
                </div>
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                  <metric.icon className="w-6 h-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Revenue Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center text-muted-foreground">
            <TrendingUp className="h-12 w-12 mr-3" />
            Chart visualization placeholder
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
