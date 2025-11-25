'use client'

import { Home } from "lucide-react";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/components/providers/language-provider";

export const Footer = () => {
    const router = useRouter();
    const { t } = useLanguage();

    return (
        <footer className="border-t border-border/50 backdrop-blur-xl bg-background/70 py-12 px-4">
            <div className="container mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    <div className="space-y-4">
                        <div className="flex items-center gap-2">
                            <Home className="h-6 w-6 text-primary" />
                            <span className="text-xl font-bold text-foreground">{t("landing.title") || "Roomivo"}</span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                            {t("landing.footerTagline") || "Making housing simple, secure, and smart."}
                        </p>
                    </div>

                    <div className="space-y-4">
                        <h4 className="font-semibold text-foreground">{t("landing.footerProduct") || "Product"}</h4>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                            <li><a href="#" className="hover:text-primary transition-colors">{t("landing.footerFeatures") || "Features"}</a></li>
                            <li><a href="#" className="hover:text-primary transition-colors">{t("landing.footerPricing") || "Pricing"}</a></li>
                            <li><a href="#" className="hover:text-primary transition-colors">{t("landing.footerSecurity") || "Security"}</a></li>
                        </ul>
                    </div>

                    <div className="space-y-4">
                        <h4 className="font-semibold text-foreground">{t("landing.footerCompany") || "Company"}</h4>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                            <li><a href="#" className="hover:text-primary transition-colors">{t("landing.footerAbout") || "About Us"}</a></li>
                            <li><a href="#" className="hover:text-primary transition-colors">{t("landing.footerBlog") || "Blog"}</a></li>
                            <li><a href="#" className="hover:text-primary transition-colors">{t("landing.footerCareers") || "Careers"}</a></li>
                        </ul>
                    </div>

                    <div className="space-y-4">
                        <h4 className="font-semibold text-foreground">{t("landing.footerLegal") || "Legal"}</h4>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                            <li>
                                <button
                                    onClick={() => router.push("/privacy")}
                                    className="hover:text-primary transition-colors"
                                >
                                    {t("landing.footerPrivacy") || "Privacy Policy"}
                                </button>
                            </li>
                            <li>
                                <button
                                    onClick={() => router.push("/terms")}
                                    className="hover:text-primary transition-colors"
                                >
                                    {t("landing.footerTerms") || "Terms of Service"}
                                </button>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="mt-12 pt-8 border-t border-border text-center text-sm text-muted-foreground">
                    <p>&copy; {new Date().getFullYear()} {t("landing.title") || "Roomivo"}. {t("landing.footerRights") || "All rights reserved."}</p>
                </div>
            </div>
        </footer>
    );
};
