import Link from "next/link";
import { Home, Mail, Phone, MapPin } from "lucide-react";

export const Footer = () => {
    return (
        <footer className="border-t border-border/50 backdrop-blur-xl bg-background/70 mt-auto relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 pointer-events-none" />
            <div className="container mx-auto px-4 py-12 relative">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    <div>
                        <Link href="/" className="flex items-center space-x-2 mb-4 group transition-transform hover:scale-105">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-md">
                                <Home className="h-5 w-5 text-primary-foreground" />
                            </div>
                            <span className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Roomivo</span>
                        </Link>
                        <p className="text-sm text-muted-foreground font-medium">
                            Transparent, AI-powered rental platform connecting tenants and landlords.
                        </p>
                    </div>

                    <div>
                        <h3 className="font-semibold text-foreground mb-4">Platform</h3>
                        <ul className="space-y-2">
                            <li>
                                <Link href="/properties" className="text-sm text-muted-foreground hover:text-primary transition-all duration-300 relative group">
                                    Find Properties
                                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-primary to-accent transition-all duration-300 group-hover:w-full"></span>
                                </Link>
                            </li>
                            <li>
                                <Link href="/dashboard" className="text-sm text-muted-foreground hover:text-primary transition-all duration-300 relative group">
                                    Dashboard
                                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-primary to-accent transition-all duration-300 group-hover:w-full"></span>
                                </Link>
                            </li>
                            <li>
                                <Link href="/incidents" className="text-sm text-muted-foreground hover:text-primary transition-all duration-300 relative group">
                                    Transparency Dashboard
                                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-primary to-accent transition-all duration-300 group-hover:w-full"></span>
                                </Link>
                            </li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="font-semibold text-foreground mb-4">Legal</h3>
                        <ul className="space-y-2">
                            <li>
                                <Link href="#" className="text-sm text-muted-foreground hover:text-primary transition-all duration-300 relative group">
                                    Terms of Service
                                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-primary to-accent transition-all duration-300 group-hover:w-full"></span>
                                </Link>
                            </li>
                            <li>
                                <Link href="#" className="text-sm text-muted-foreground hover:text-primary transition-all duration-300 relative group">
                                    Privacy Policy
                                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-primary to-accent transition-all duration-300 group-hover:w-full"></span>
                                </Link>
                            </li>
                            <li>
                                <Link href="#" className="text-sm text-muted-foreground hover:text-primary transition-all duration-300 relative group">
                                    Cookie Policy
                                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-primary to-accent transition-all duration-300 group-hover:w-full"></span>
                                </Link>
                            </li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="font-semibold text-foreground mb-4">Contact</h3>
                        <ul className="space-y-2">
                            <li className="flex items-center text-sm text-muted-foreground group hover:text-primary transition-colors duration-300">
                                <Mail className="h-4 w-4 mr-2 text-primary" />
                                support@roomivo.com
                            </li>
                            <li className="flex items-center text-sm text-muted-foreground group hover:text-primary transition-colors duration-300">
                                <Phone className="h-4 w-4 mr-2 text-primary" />
                                +1 (555) 123-4567
                            </li>
                            <li className="flex items-center text-sm text-muted-foreground group hover:text-primary transition-colors duration-300">
                                <MapPin className="h-4 w-4 mr-2 text-primary" />
                                San Francisco, CA
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="mt-8 pt-8 border-t text-center text-sm text-muted-foreground">
                    © {new Date().getFullYear()} Roomivo. All rights reserved.
                </div>
            </div>
        </footer>
    );
};
