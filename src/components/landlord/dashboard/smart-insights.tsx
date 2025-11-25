'use client'

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, TrendingUp, AlertCircle, ArrowRight, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

import { useSmartInsights } from "@/hooks/use-smart-insights";

export const SmartInsights = () => {
    const { insights } = useSmartInsights();

    const handleAction = (action: string) => {
        toast.success(`Action triggered: ${action}`);
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-5 h-5 text-primary animate-pulse" />
                <h2 className="text-xl font-bold text-foreground">AI Smart Insights</h2>
            </div>

            <div className="grid md:grid-cols-3 gap-4">
                {insights.map((insight) => (
                    <Card key={insight.id} className="p-5 glass-effect border-border/50 hover:shadow-glow transition-all duration-300 group">
                        <div className="flex items-start justify-between mb-3">
                            <div className={`p-2 rounded-lg ${insight.bg}`}>
                                <insight.icon className={`w-5 h-5 ${insight.color}`} />
                            </div>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="opacity-0 group-hover:opacity-100 transition-opacity text-xs"
                                onClick={() => handleAction(insight.action)}
                            >
                                {insight.action} <ArrowRight className="w-3 h-3 ml-1" />
                            </Button>
                        </div>

                        <h3 className="font-semibold text-foreground mb-1">{insight.title}</h3>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                            {insight.description}
                        </p>
                    </Card>
                ))}
            </div>
        </div>
    );
};
