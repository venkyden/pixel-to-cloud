'use client'

import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/components/providers/language-provider";

export const Hero = () => {
    const router = useRouter();
    const { t } = useLanguage();

    return (
        <section className="flex-1 flex items-center justify-center py-20 px-4 relative">
            <div className="container mx-auto text-center space-y-8">
                <div className="space-y-6 animate-fade-in">
                    <div className="inline-block px-4 py-2 rounded-full glass-effect mb-4">
                        <span className="text-sm font-medium text-primary">✨ The Future of Rental Management</span>
                    </div>
                    <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-foreground tracking-tight">
                        {t("landing.title") || "Roomivo"}
                        <br />
                        <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent animate-gradient">
                            {t("landing.tagline") || "Smart Housing Platform"}
                        </span>
                    </h1>
                    <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                        {t("landing.subtitle") || "Experience the next generation of property management with AI-powered matching and secure payments."}
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-fade-in" style={{ animationDelay: '0.2s' }}>
                    <Button
                        size="lg"
                        className="text-lg h-14 px-8 bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-all duration-300 shadow-elegant hover:shadow-lg hover:scale-105"
                        onClick={() => router.push("/auth")}
                    >
                        {t("landing.startFree") || "Start for Free"}
                        <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                    <Button
                        size="lg"
                        variant="outline"
                        className="text-lg h-14 px-8 glass-effect hover:bg-muted/50 transition-all duration-300 hover:scale-105"
                        onClick={() => router.push("/auth")}
                    >
                        {t("landing.howItWorks") || "How it Works"}
                    </Button>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-12 max-w-4xl mx-auto">
                    {[
                        { value: "100%", label: t("landing.statsCompliance") || "Legal Compliance" },
                        { value: "48h", label: t("landing.statsSpeed") || "Average Match Time" },
                        { value: "0€", label: t("landing.statsNoFees") || "Hidden Fees" }
                    ].map((stat, index) => (
                        <div
                            key={index}
                            className="glass-effect p-6 rounded-2xl space-y-2 animate-fade-in hover:scale-105 transition-all duration-300 shadow-md hover:shadow-elegant"
                            style={{ animationDelay: `${0.3 + index * 0.1}s` }}
                        >
                            <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                                {stat.value}
                            </div>
                            <div className="text-muted-foreground font-medium">{stat.label}</div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};
