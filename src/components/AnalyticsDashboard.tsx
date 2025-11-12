import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, DollarSign, Users, Home } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

export const AnalyticsDashboard = () => {
  const { t } = useLanguage();
  
  const metrics = [
    {
      title: t("analytics.totalRevenue"),
      value: "$12,450",
      change: "+12.5%",
      icon: DollarSign,
    },
    {
      title: t("analytics.activeTenants"),
      value: "24",
      change: "+3",
      icon: Users,
    },
    {
      title: t("roleSelection.properties"),
      value: "8",
      change: "+2",
      icon: Home,
    },
    {
      title: t("analytics.occupancyRate"),
      value: "95%",
      change: "+5%",
      icon: TrendingUp,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric) => (
          <Card key={metric.title} className="glass-effect border-border/50 shadow-elegant overflow-hidden group hover:shadow-glow transition-all duration-300 hover:scale-105">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <CardContent className="pt-6 relative">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1 font-medium">{metric.title}</p>
                  <p className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent animate-fade-in">{metric.value}</p>
                  <p className="text-sm text-success mt-1 font-medium">{metric.change} {t("common.loading")}</p>
                </div>
                <div className="w-14 h-14 bg-gradient-to-br from-primary/20 to-accent/20 rounded-2xl flex items-center justify-center shadow-md ring-2 ring-primary/10 group-hover:scale-110 transition-transform duration-300">
                  <metric.icon className="w-7 h-7 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="glass-effect border-border/50 shadow-elegant overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 pointer-events-none" />
        <CardHeader className="relative">
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            {t("roleSelection.properties")}
          </CardTitle>
        </CardHeader>
        <CardContent className="relative">
          <div className="h-[300px] flex items-center justify-center text-muted-foreground glass-effect rounded-xl border border-border/50 p-6">
            <TrendingUp className="h-12 w-12 mr-3 text-primary" />
            <span className="font-medium">Chart visualization placeholder</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
