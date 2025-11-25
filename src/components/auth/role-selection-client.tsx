'use client'

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Home, Building2 } from "lucide-react";

export const RoleSelectionClient = () => {
    const router = useRouter();
    const supabase = createClient();
    const [isLoading, setIsLoading] = useState(false);

    const handleRoleSelect = async (role: 'tenant' | 'landlord') => {
        setIsLoading(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                throw new Error("No user found");
            }

            const { error } = await supabase
                .from("user_roles")
                .insert({
                    user_id: user.id,
                    role: role
                });

            if (error) throw error;

            toast.success(`Welcome! You are now set up as a ${role}.`);
            router.push("/dashboard");
            router.refresh();
        } catch (error: unknown) {
            console.error("Error saving role:", error);
            toast.error("Failed to save role. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
            {/* Animated Background */}
            <div className="absolute inset-0 -z-10">
                <div className="absolute inset-0 bg-gradient-to-br from-background via-muted/30 to-background" />
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse floating" />
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
            </div>

            <Card className="w-full max-w-2xl glass-effect border-border/50 shadow-elegant">
                <CardHeader className="text-center space-y-2">
                    <CardTitle className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                        Choose Your Role
                    </CardTitle>
                    <CardDescription className="text-lg">
                        How do you plan to use Roomivo?
                    </CardDescription>
                </CardHeader>
                <CardContent className="grid md:grid-cols-2 gap-6 p-8">
                    <Button
                        variant="outline"
                        className="h-auto flex flex-col items-center justify-center p-8 space-y-4 hover:border-primary hover:bg-primary/5 transition-all duration-300 group"
                        onClick={() => handleRoleSelect('tenant')}
                        disabled={isLoading}
                    >
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                            <Home className="w-8 h-8 text-primary" />
                        </div>
                        <div className="space-y-2 text-center">
                            <h3 className="font-bold text-xl">I&apos;m a Tenant</h3>
                            <p className="text-sm text-muted-foreground mb-4">Find your perfect home, sign contracts digitally, and pay securely. We&apos;ll guide you every step.</p>
                        </div>
                    </Button>

                    <Button
                        variant="outline"
                        className="h-auto flex flex-col items-center justify-center p-8 space-y-4 hover:border-accent hover:bg-accent/5 transition-all duration-300 group"
                        onClick={() => handleRoleSelect('landlord')}
                        disabled={isLoading}
                    >
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-accent/20 to-primary/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                            <Building2 className="w-8 h-8 text-accent" />
                        </div>
                        <div className="space-y-2 text-center">
                            <h3 className="font-bold text-xl">I&apos;m a Landlord</h3>
                            <p className="text-sm text-muted-foreground mb-4">List properties, screen tenants with AI, and manage payments effortlessly. It&apos;s free to get started.</p>
                        </div>
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
};
