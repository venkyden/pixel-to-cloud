import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { useLanguage } from "@/contexts/LanguageContext";
import { toast } from "sonner";
import { z } from "zod";
import zxcvbn from "zxcvbn";

const signUpSchema = z.object({
  email: z.string().trim().email("Invalid email address").max(255, "Email must be less than 255 characters"),
  password: z.string().min(8, "Password must be at least 8 characters").max(128, "Password must be less than 128 characters"),
  firstName: z.string().trim().min(1, "First name is required").max(100, "First name must be less than 100 characters"),
  lastName: z.string().trim().min(1, "Last name is required").max(100, "Last name must be less than 100 characters"),
  role: z.enum(["tenant", "landlord"], { errorMap: () => ({ message: "Please select a valid role" }) })
});

const signInSchema = z.object({
  email: z.string().trim().email("Invalid email address").max(255, "Email must be less than 255 characters"),
  password: z.string().min(1, "Password is required")
});

// Password strength color mapping
const getPasswordStrengthColor = (score: number) => {
  if (score === 0) return 'bg-destructive';
  if (score === 1) return 'bg-destructive';
  if (score === 2) return 'bg-warning';
  if (score === 3) return 'bg-success';
  return 'bg-success';
};

export default function Auth() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [isLoading, setIsLoading] = useState(false);
  const [isPasswordReset, setIsPasswordReset] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [passwordStrength, setPasswordStrength] = useState<number>(0);
  const [signupPassword, setSignupPassword] = useState("");

  // Check password against HaveIBeenPwned API using k-anonymity
  const checkPasswordBreach = async (password: string): Promise<boolean> => {
    try {
      const encoder = new TextEncoder();
      const data = encoder.encode(password);
      const hashBuffer = await crypto.subtle.digest('SHA-1', data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('').toUpperCase();
      
      const prefix = hashHex.substring(0, 5);
      const suffix = hashHex.substring(5);
      
      const response = await fetch(`https://api.pwnedpasswords.com/range/${prefix}`);
      const text = await response.text();
      
      return text.split('\n').some(line => line.startsWith(suffix));
    } catch (error) {
      console.error('Password breach check failed:', error);
      return false; // Fail open - don't block signup if API is down
    }
  };

  const handlePasswordChange = (password: string) => {
    setSignupPassword(password);
    if (password) {
      const result = zxcvbn(password);
      setPasswordStrength(result.score);
    } else {
      setPasswordStrength(0);
    }
  };

  useEffect(() => {
    // Check if user is returning from password reset email
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const type = hashParams.get('type');
    
    if (type === 'recovery') {
      setIsPasswordReset(true);
    }
  }, []);

  const handleForgotPassword = async () => {
    const email = prompt("Enter your email address:");
    if (!email) return;

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth`,
      });

      if (error) throw error;

      toast.success("Password reset email sent! Check your inbox.");
    } catch (error: any) {
      toast.error(error.message || "Failed to send reset email");
    }
  };

  const handlePasswordReset = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (newPassword.length < 8) {
        throw new Error("Password must be at least 8 characters");
      }

      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) throw error;

      toast.success("Password updated successfully!");
      setIsPasswordReset(false);
      setNewPassword("");
      navigate("/role-selection");
    } catch (error: any) {
      toast.error(error.message || "Failed to reset password");
    } finally {
      setIsLoading(false);
    }
  };


  const handleSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const rawData = {
      email: formData.get("email") as string,
      password: signupPassword,
      firstName: formData.get("firstName") as string,
      lastName: formData.get("lastName") as string,
      role: formData.get("role") as string
    };
    const marketingConsent = formData.get("marketingConsent") === "on";

    // Check password strength
    if (passwordStrength < 2) {
      toast.error("Password is too weak. Please use a stronger password with a mix of letters, numbers, and symbols.");
      setIsLoading(false);
      return;
    }

    // Check if password has been breached
    const isBreached = await checkPasswordBreach(rawData.password);
    if (isBreached) {
      toast.error("This password has been found in a data breach. Please choose a different password for your security.");
      setIsLoading(false);
      return;
    }

    try {
      // Validate input
      const validatedData = signUpSchema.parse(rawData);
      const { email, password, firstName, lastName, role } = validatedData;
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            first_name: firstName,
            last_name: lastName,
          }
        }
      });

      if (error) throw error;

      if (data.user) {
        const { error: roleError } = await supabase
          .from("user_roles")
          .insert({
            user_id: data.user.id,
            role: role
          });

        if (roleError) throw roleError;

        const { error: consentError } = await supabase
          .from("profiles")
          .update({
            gdpr_consent_given: true,
            gdpr_consent_date: new Date().toISOString(),
            marketing_consent: marketingConsent,
            data_processing_consent: true
          })
          .eq("id", data.user.id);

        if (consentError && import.meta.env.DEV) console.error("Consent update error:", consentError);

        toast.success(t("auth.accountCreated"));
        navigate("/role-selection");
      }
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        toast.error(error.errors[0].message);
      } else {
        toast.error(error.message || "Failed to sign up");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const rawData = {
      email: formData.get("email") as string,
      password: formData.get("password") as string
    };

    try {
      // Validate input
      const validatedData = signInSchema.parse(rawData);
      const { email, password } = validatedData;

      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      toast.success(t("auth.signedIn"));
      navigate("/role-selection");
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        toast.error(error.errors[0].message);
      } else {
        toast.error(error.message || "Failed to sign in");
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (isPasswordReset) {
    return (
      <div className="min-h-screen relative overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-background via-muted/30 to-background">
          <div className="absolute top-0 left-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        </div>

        <div className="absolute top-6 right-6 z-10">
          <LanguageSwitcher />
        </div>

        <div className="relative min-h-screen flex items-center justify-center p-4">
          <Card className="w-full max-w-md backdrop-blur-xl bg-card/80 border-border/50 shadow-elegant">
            <CardHeader className="space-y-1 text-center">
              <CardTitle className="text-2xl font-semibold">Reset Your Password</CardTitle>
              <CardDescription>Enter your new password below</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePasswordReset} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="new-password" className="text-sm font-medium">New Password</Label>
                  <Input
                    id="new-password"
                    type="password"
                    placeholder="••••••••"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    minLength={8}
                    className="h-11 transition-all duration-300 focus:ring-2 focus:ring-primary/20"
                  />
                  <p className="text-sm text-muted-foreground">
                    Password must be at least 8 characters
                  </p>
                </div>
                <Button 
                  type="submit" 
                  className="w-full h-11 bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-all duration-300 shadow-md hover:shadow-lg" 
                  disabled={isLoading}
                >
                  {isLoading ? "Updating..." : "Update Password"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-muted/30 to-background">
        <div className="absolute top-0 left-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <div className="absolute top-6 right-6 z-10">
        <LanguageSwitcher />
      </div>

      <div className="relative min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Logo/Brand Section */}
          <div className="text-center mb-8 floating">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-accent mb-4 shadow-lg">
              <span className="text-3xl font-bold text-primary-foreground">R</span>
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-2">
              {t("auth.welcome")}
            </h1>
            <p className="text-muted-foreground">{t("auth.signInDescription")}</p>
          </div>

          <Card className="backdrop-blur-xl bg-card/80 border-border/50 shadow-elegant transition-all duration-500 hover:shadow-lg">
            <CardHeader className="space-y-1 pb-4">
              <CardTitle className="text-2xl font-semibold text-center">Get Started</CardTitle>
              <CardDescription className="text-center">Choose your preferred method</CardDescription>
            </CardHeader>
            <CardContent>
          <Tabs defaultValue="signin" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2 bg-muted/50 p-1">
              <TabsTrigger 
                value="signin"
                className="data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all duration-300"
              >
                {t("common.signIn")}
              </TabsTrigger>
              <TabsTrigger 
                value="signup"
                className="data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all duration-300"
              >
                {t("common.signUp")}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="signin" className="space-y-6">
              <form onSubmit={handleSignIn} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="signin-email" className="text-sm font-medium">{t("common.email")}</Label>
                  <Input
                    id="signin-email"
                    name="email"
                    type="email"
                    placeholder="you@example.com"
                    required
                    className="h-11 transition-all duration-300 focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="signin-password" className="text-sm font-medium">{t("common.password")}</Label>
                    <Button
                      type="button"
                      variant="link"
                      className="p-0 h-auto text-sm hover:text-primary transition-colors"
                      onClick={handleForgotPassword}
                    >
                      Forgot password?
                    </Button>
                  </div>
                  <Input
                    id="signin-password"
                    name="password"
                    type="password"
                    placeholder="••••••••"
                    required
                    className="h-11 transition-all duration-300 focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <Button 
                  type="submit" 
                  className="w-full h-11 bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-all duration-300 shadow-md hover:shadow-lg" 
                  disabled={isLoading}
                >
                  {isLoading ? t("auth.signingIn") : t("common.signIn")}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup" className="space-y-6">
              <form onSubmit={handleSignUp} className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName" className="text-sm font-medium">{t("common.firstName")}</Label>
                    <Input
                      id="firstName"
                      name="firstName"
                      type="text"
                      placeholder="John"
                      required
                      className="h-11 transition-all duration-300 focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName" className="text-sm font-medium">{t("common.lastName")}</Label>
                    <Input
                      id="lastName"
                      name="lastName"
                      type="text"
                      placeholder="Doe"
                      required
                      className="h-11 transition-all duration-300 focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-email" className="text-sm font-medium">{t("common.email")}</Label>
                  <Input
                    id="signup-email"
                    name="email"
                    type="email"
                    placeholder="you@example.com"
                    required
                    className="h-11 transition-all duration-300 focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-password" className="text-sm font-medium">{t("common.password")}</Label>
                  <Input
                    id="signup-password"
                    name="password"
                    type="password"
                    placeholder="••••••••"
                    required
                    minLength={8}
                    value={signupPassword}
                    onChange={(e) => handlePasswordChange(e.target.value)}
                    className="h-11 transition-all duration-300 focus:ring-2 focus:ring-primary/20"
                  />
                  {signupPassword && (
                    <div className="space-y-1">
                      <div className="flex gap-1">
                        {[0, 1, 2, 3, 4].map((level) => (
                          <div
                            key={level}
                            className={`h-1 flex-1 rounded-full transition-all ${
                              level <= passwordStrength
                                ? passwordStrength === 0
                                  ? 'bg-destructive'
                                  : passwordStrength === 1
                                  ? 'bg-destructive'
                                  : passwordStrength === 2
                                  ? 'bg-warning'
                                  : passwordStrength === 3
                                  ? 'bg-success'
                                  : 'bg-success'
                                : 'bg-muted'
                            }`}
                          />
                        ))}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {passwordStrength === 0 && 'Very weak password'}
                        {passwordStrength === 1 && 'Weak password'}
                        {passwordStrength === 2 && 'Fair password'}
                        {passwordStrength === 3 && 'Strong password'}
                        {passwordStrength === 4 && 'Very strong password'}
                      </p>
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role" className="text-sm font-medium">{t("auth.iAmA")}</Label>
                  <select
                    id="role"
                    name="role"
                    className="w-full h-11 px-3 rounded-md border border-input bg-background transition-all duration-300 focus:ring-2 focus:ring-primary/20 focus:outline-none"
                    required
                  >
                    <option value="tenant">{t("auth.tenant")}</option>
                    <option value="landlord">{t("auth.landlord")}</option>
                  </select>
                </div>
                
                <div className="space-y-3 pt-2 border-t">
                  <div className="flex items-start gap-2">
                    <input
                      type="checkbox"
                      id="gdpr-consent"
                      name="gdprConsent"
                      required
                      className="mt-1"
                    />
                    <Label htmlFor="gdpr-consent" className="text-xs leading-relaxed cursor-pointer">
                      {t("auth.gdprConsent")}{" "}
                      <a href="/privacy" target="_blank" className="text-primary hover:underline">
                        {t("auth.privacyPolicy")}
                      </a>{" "}
                      {t("auth.andGDPR")} {t("auth.required")}
                    </Label>
                  </div>
                  
                  <div className="flex items-start gap-2">
                    <input
                      type="checkbox"
                      id="terms-consent"
                      name="termsConsent"
                      required
                      className="mt-1"
                    />
                    <Label htmlFor="terms-consent" className="text-xs leading-relaxed cursor-pointer">
                      {t("auth.termsConsent")}{" "}
                      <a href="/terms" target="_blank" className="text-primary hover:underline">
                        {t("auth.termsOfService")}
                      </a> {t("auth.required")}
                    </Label>
                  </div>
                  
                  <div className="flex items-start gap-2">
                    <input
                      type="checkbox"
                      id="marketing-consent"
                      name="marketingConsent"
                      className="mt-1"
                    />
                    <Label htmlFor="marketing-consent" className="text-xs leading-relaxed cursor-pointer">
                      {t("auth.marketingConsent")}
                    </Label>
                  </div>
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full h-11 bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-all duration-300 shadow-md hover:shadow-lg" 
                  disabled={isLoading}
                >
                  {isLoading ? t("auth.creatingAccount") : t("auth.createAccount")}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
        </div>
      </div>
    </div>
  );
}
