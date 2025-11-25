'use client'

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/components/providers/language-provider";

export const CTA = () => {
    const router = useRouter();
    const { t } = useLanguage();

    return (
        <section className="py-20 px-4 relative">
            <div className="container mx-auto">
                <Card className="p-12 md:p-16 text-center space-y-8 glass-effect border-primary/20 shadow-elegant relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-accent/5 to-primary/5 animate-gradient" />
                    <div className="relative z-10 space-y-6">
                        <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground">
                            {t("landing.ctaTitle") || "Ready to get started?"}
                        </h2>
                        <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                            {t("landing.ctaSubtitle") || "Join thousands of happy tenants and landlords today."}
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
                            <Button
                                size="lg"
                                className="text-lg h-14 px-8 bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-all duration-300 shadow-elegant hover:shadow-lg hover:scale-105"
                                onClick={() => router.push("/auth")}
                            >
                                {t("landing.createAccount") || "Create Free Account"}
                                <ArrowRight className="ml-2 h-5 w-5" />
                            </Button>
                        </div>
                    </div>
                </Card>
            </div>
        </section>
    );
};
