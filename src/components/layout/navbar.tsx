'use client'

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { NotificationBell } from "@/components/notification-bell";
import { LanguageSwitcher } from "@/components/language-switcher";
import { useAuth } from "@/components/providers/auth-provider";
import { useLanguage } from "@/components/providers/language-provider";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Home, User, LogOut, Menu, X } from "lucide-react";

export const Navbar = () => {
    const router = useRouter();
    const { signOut, user } = useAuth();
    const { t } = useLanguage();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    return (
        <header className="sticky top-0 z-50 w-full border-b border-white/10 backdrop-blur-xl bg-background/60 shadow-sm supports-[backdrop-filter]:bg-background/60">
            <div className="container mx-auto px-4 flex h-16 items-center justify-between">
                <Link href="/" className="flex items-center space-x-2 transition-transform hover:scale-105">
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg shadow-primary/20">
                        <Home className="h-5 w-5 text-white" />
                    </div>
                    <span className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent tracking-tight">Roomivo</span>
                </Link>

                <nav className="hidden md:flex items-center space-x-8">
                    {[
                        { href: "/properties", label: t("header.properties") },
                        { href: "/dashboard", label: t("header.dashboard") },
                        { href: "/incidents", label: t("header.incidents") },
                        { href: "/payments", label: "Payments" },
                        { href: "/messages", label: t("header.messages") },
                    ].map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            className="text-sm font-medium text-muted-foreground hover:text-primary transition-all duration-300 relative group py-2"
                        >
                            {link.label}
                            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-primary to-accent transition-all duration-300 group-hover:w-full rounded-full"></span>
                        </Link>
                    ))}
                </nav>

                <div className="flex items-center space-x-3">
                    <LanguageSwitcher />
                    {user && <NotificationBell />}

                    {user ? (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="rounded-full hover:bg-primary/10 hover:text-primary transition-colors">
                                    <User className="h-5 w-5" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-56 glass-effect border-white/10 shadow-xl rounded-xl p-2">
                                <DropdownMenuLabel className="px-2 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">{t("header.myAccount")}</DropdownMenuLabel>
                                <DropdownMenuSeparator className="bg-white/10" />
                                <DropdownMenuItem onClick={() => router.push("/profile")} className="rounded-lg focus:bg-primary/10 focus:text-primary cursor-pointer">
                                    <User className="mr-2 h-4 w-4" />
                                    {t("header.profile")}
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => router.push("/dashboard")} className="rounded-lg focus:bg-primary/10 focus:text-primary cursor-pointer">
                                    <Home className="mr-2 h-4 w-4" />
                                    {t("header.dashboard")}
                                </DropdownMenuItem>
                                <DropdownMenuSeparator className="bg-white/10" />
                                <DropdownMenuItem onClick={signOut} className="rounded-lg focus:bg-destructive/10 focus:text-destructive cursor-pointer text-destructive">
                                    <LogOut className="mr-2 h-4 w-4" />
                                    {t("header.signOut")}
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    ) : (
                        <Button onClick={() => router.push("/auth")} size="sm" className="hidden md:flex rounded-full px-6 bg-gradient-to-r from-primary to-accent hover:opacity-90 shadow-lg shadow-primary/20 transition-all duration-300 hover:scale-105">
                            Sign In
                        </Button>
                    )}

                    <Button
                        variant="ghost"
                        size="icon"
                        className="md:hidden"
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    >
                        {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                    </Button>
                </div>
            </div>

            {mobileMenuOpen && (
                <div className="md:hidden border-t border-white/10 backdrop-blur-xl bg-background/95 absolute w-full left-0 shadow-2xl">
                    <nav className="container py-6 flex flex-col space-y-4 px-6">
                        {[
                            { href: "/properties", label: t("header.properties") },
                            { href: "/dashboard", label: t("header.dashboard") },
                            { href: "/incidents", label: t("header.incidents") },
                            { href: "/payments", label: "Payments" },
                            { href: "/messages", label: t("header.messages") },
                        ].map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className="text-base font-medium text-muted-foreground hover:text-primary transition-colors flex items-center justify-between group"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                {link.label}
                                <span className="w-1.5 h-1.5 rounded-full bg-primary opacity-0 group-hover:opacity-100 transition-opacity"></span>
                            </Link>
                        ))}
                        {!user && (
                            <Button onClick={() => router.push("/auth")} className="w-full mt-4 bg-gradient-to-r from-primary to-accent">
                                Sign In
                            </Button>
                        )}
                    </nav>
                </div>
            )}
        </header>
    );
};
