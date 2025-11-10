import { useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { User, Mail, Phone, MapPin, Building, Download, Trash2, Shield, AlertTriangle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/contexts/LanguageContext";
import { toast } from "sonner";
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle, 
  AlertDialogTrigger 
} from "@/components/ui/alert-dialog";

export default function Profile() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [isExporting, setIsExporting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleExportData = async () => {
    if (!user) return;
    
    setIsExporting(true);
    try {
      const { error } = await supabase
        .from("data_exports")
        .insert({
          user_id: user.id,
          status: "pending"
        });

      if (error) throw error;

      toast.success(t("profile.exportRequested"));
    } catch (error: any) {
      toast.error(t("profile.exportError") + " " + error.message);
    } finally {
      setIsExporting(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!user) return;
    
    setIsDeleting(true);
    try {
      const { error } = await supabase
        .from("data_deletion_requests")
        .insert({
          user_id: user.id,
          reason: "User requested account deletion"
        });

      if (error) throw error;

      toast.success(t("profile.deleteRequested"));
      
      setTimeout(async () => {
        await supabase.auth.signOut();
      }, 2000);
    } catch (error: any) {
      toast.error(t("profile.deleteError") + " " + error.message);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">{t("profile.title")}</h1>
            <p className="text-muted-foreground">{t("profile.subtitle")}</p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>{t("profile.personalInfo")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center space-x-4">
                <Avatar className="h-20 w-20">
                  <AvatarFallback className="text-2xl">JD</AvatarFallback>
                </Avatar>
                <Button variant="outline">{t("profile.changePhoto")}</Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">{t("common.firstName")}</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input id="firstName" defaultValue="John" className="pl-10" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="lastName">{t("common.lastName")}</Label>
                  <Input id="lastName" defaultValue="Doe" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">{t("common.email")}</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input id="email" type="email" defaultValue="john.doe@example.com" className="pl-10" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">{t("common.phone")}</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input id="phone" defaultValue="+1 (555) 123-4567" className="pl-10" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">{t("common.address")}</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input id="address" defaultValue="123 Main St, San Francisco, CA" className="pl-10" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="occupation">{t("common.occupation")}</Label>
                  <div className="relative">
                    <Building className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input id="occupation" defaultValue="Software Engineer" className="pl-10" />
                  </div>
                </div>
              </div>

              <Button className="w-full md:w-auto">{t("common.saveChanges")}</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t("profile.security")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="currentPassword">{t("profile.currentPassword")}</Label>
                <Input id="currentPassword" type="password" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="newPassword">{t("profile.newPassword")}</Label>
                <Input id="newPassword" type="password" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">{t("profile.confirmPassword")}</Label>
                <Input id="confirmPassword" type="password" />
              </div>
              <Button variant="outline">{t("profile.updatePassword")}</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-primary" />
                <CardTitle>{t("profile.gdprManagement")}</CardTitle>
              </div>
              <CardDescription>
                {t("profile.gdprDescription")}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <Download className="w-5 h-5 text-muted-foreground mt-0.5" />
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground mb-1">{t("profile.dataPortability")}</h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      {t("profile.dataPortabilityText")}
                    </p>
                    <Button 
                      variant="outline" 
                      onClick={handleExportData}
                      disabled={isExporting}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      {isExporting ? t("common.processing") : t("profile.exportData")}
                    </Button>
                  </div>
                </div>
              </div>

              <div className="border-t pt-6">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-destructive mt-0.5" />
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground mb-1">{t("profile.rightToErasure")}</h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      {t("profile.rightToErasureText")}
                    </p>
                    
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" disabled={isDeleting}>
                          <Trash2 className="w-4 h-4 mr-2" />
                          {isDeleting ? t("common.processing") : t("profile.deleteAccount")}
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>{t("profile.deleteConfirmTitle")}</AlertDialogTitle>
                          <AlertDialogDescription>
                            {t("profile.deleteConfirmText")}
                            <ul className="list-disc list-inside mt-2 space-y-1">
                              <li>{t("profile.profileInfo")}</li>
                              <li>{t("profile.navigationHistory")}</li>
                              <li>{t("profile.messagesComm")}</li>
                              <li>{t("profile.uploadedDocs")}</li>
                            </ul>
                            <p className="mt-2 font-semibold">
                              {t("profile.legalRetention")}
                            </p>
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
                          <AlertDialogAction onClick={handleDeleteAccount} className="bg-destructive hover:bg-destructive/90">
                            {t("profile.confirmDeletion")}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </div>

              <div className="border-t pt-6">
                <p className="text-xs text-muted-foreground">
                  {t("profile.otherRights")}{" "}
                  <a href="mailto:dpo@roomivo.fr" className="text-primary hover:underline">dpo@roomivo.fr</a>
                  <br />
                  {t("profile.cnilComplaint")}{" "}
                  <a href="https://www.cnil.fr" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                    www.cnil.fr
                  </a>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}
