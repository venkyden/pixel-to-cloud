'use client'

import { Card } from "@/components/ui/card";
import { useLanguage } from "@/components/providers/language-provider";
import {
    Shield,
    Zap,
    CheckCircle,
    Users,
    FileCheck
} from "lucide-react";

export const Features = () => {
    const { t } = useLanguage();

    const features = [
        {
            icon: Shield,
            title: t("landing.securePayment") || "Secure Payments",
            description: t("landing.securePaymentDesc") || "Bank-grade security for all transactions with escrow protection."
        },
        {
            icon: FileCheck,
            title: t("landing.photoInspection") || "AI Inspections",
            description: t("landing.photoInspectionDesc") || "Automated property inspections using advanced computer vision."
        },
        {
            icon: CheckCircle,
            title: t("landing.idVerification") || "Verified Profiles",
            description: t("landing.idVerificationDesc") || "Identity verification for both tenants and landlords."
        },
        {
            icon: Zap,
            title: t("landing.smartAutomation") || "Smart Automation",
            description: t("landing.smartAutomationDesc") || "Automated rent collection, reminders, and maintenance requests."
        },
        {
            icon: Users,
            title: t("landing.simpleManagement") || "Easy Management",
            description: t("landing.simpleManagementDesc") || "Intuitive dashboard to manage all your properties in one place."
        },
        {
            icon: Shield,
            title: t("landing.legalCompliance") || "Legal Compliance",
            description: t("landing.legalComplianceDesc") || "Automatically generated contracts compliant with local laws."
        }
    ];

    return (
        <section className="py-20 px-4 relative">
            <div className="container mx-auto space-y-12">
                <div className="text-center space-y-4 animate-fade-in">
                    <div className="inline-block px-4 py-2 rounded-full glass-effect mb-2">
                        <span className="text-sm font-medium text-primary">💎 Premium Features</span>
                    </div>
                    <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground">
                        {t("landing.featuresTitle") || "Everything you need"}
                    </h2>
                    <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                        {t("landing.featuresSubtitle") || "A complete suite of tools to make renting seamless and secure."}
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {features.map((feature, index) => (
                        <Card
                            key={index}
                            className="p-6 space-y-4 cursor-pointer transition-all duration-300 hover:shadow-elegant animate-fade-in group glass-effect hover:scale-105 border-border/50"
                            style={{ animationDelay: `${index * 0.1}s` }}
                        >
                            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center group-hover:from-primary/30 group-hover:to-accent/30 transition-all duration-300 shadow-md">
                                <feature.icon className="h-7 w-7 text-primary" />
                            </div>
                            <h3 className="text-xl font-semibold text-foreground">
                                {feature.title}
                            </h3>
                            <p className="text-muted-foreground leading-relaxed">
                                {feature.description}
                            </p>
                        </Card>
                    ))}
                </div>
            </div>
        </section>
    );
};
