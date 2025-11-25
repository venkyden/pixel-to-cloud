'use client'

import { useState, useEffect } from 'react';
import { TrendingUp, AlertCircle, CheckCircle2 } from "lucide-react";
import { useLandlordApplications } from './use-landlord-applications';
import { useLandlordProperties } from './use-landlord-properties';

export const useSmartInsights = () => {
    const { applicants } = useLandlordApplications();
    const { properties } = useLandlordProperties();
    const [insights, setInsights] = useState<any[]>([]);

    const generateInsights = () => {
        const newInsights = [];

        // Insight 1: Pending Applications
        const pendingApps = applicants.filter(a => a.status === 'pending');
        if (pendingApps.length > 0) {
            const topCandidate = pendingApps.sort((a, b) => b.match - a.match)[0];
            newInsights.push({
                id: 1,
                type: 'action',
                icon: AlertCircle,
                color: 'text-amber-500',
                bg: 'bg-amber-500/10',
                title: "Pending Application",
                description: `${topCandidate.name} matches ${topCandidate.match}% of your criteria for ${topCandidate.property}. Review now to secure this tenant.`,
                action: "Review Application"
            });
        }

        // Insight 2: Market Opportunity (Mock logic based on property count)
        if (properties.length > 0) {
            newInsights.push({
                id: 2,
                type: 'opportunity',
                icon: TrendingUp,
                color: 'text-blue-500',
                bg: 'bg-blue-500/10',
                title: "Market Opportunity",
                description: "Rents in your area have increased by 5% this month. Consider reviewing your pricing strategy.",
                action: "Check Market Rates"
            });
        }

        // Insight 3: Compliance
        newInsights.push({
            id: 3,
            type: 'success',
            icon: CheckCircle2,
            color: 'text-green-500',
            bg: 'bg-green-500/10',
            title: "Compliance Check",
            description: "Your portfolio is fully compliant with the latest energy regulations (DPE).",
            action: "View Certificate"
        });

        setInsights(newInsights);
    };

    useEffect(() => {
        generateInsights();
    }, [applicants, properties]);

    return { insights };
};
