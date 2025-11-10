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

      toast.success("Demande d'export enregistrée. Vous recevrez vos données par email dans les 48h conformément au RGPD.");
    } catch (error: any) {
      toast.error("Erreur lors de l'export : " + error.message);
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

      toast.success("Demande de suppression enregistrée. Votre compte sera supprimé dans 30 jours conformément au RGPD.");
      
      // Sign out after deletion request
      setTimeout(async () => {
        await supabase.auth.signOut();
      }, 2000);
    } catch (error: any) {
      toast.error("Erreur lors de la suppression : " + error.message);
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
            <h1 className="text-3xl font-bold text-foreground mb-2">Profile Settings</h1>
            <p className="text-muted-foreground">Manage your account information</p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center space-x-4">
                <Avatar className="h-20 w-20">
                  <AvatarFallback className="text-2xl">JD</AvatarFallback>
                </Avatar>
                <Button variant="outline">Change Photo</Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input id="firstName" defaultValue="John" className="pl-10" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input id="lastName" defaultValue="Doe" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input id="email" type="email" defaultValue="john.doe@example.com" className="pl-10" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input id="phone" defaultValue="+1 (555) 123-4567" className="pl-10" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input id="address" defaultValue="123 Main St, San Francisco, CA" className="pl-10" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="occupation">Occupation</Label>
                  <div className="relative">
                    <Building className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input id="occupation" defaultValue="Software Engineer" className="pl-10" />
                  </div>
                </div>
              </div>

              <Button className="w-full md:w-auto">Save Changes</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Security</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="currentPassword">Current Password</Label>
                <Input id="currentPassword" type="password" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="newPassword">New Password</Label>
                <Input id="newPassword" type="password" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <Input id="confirmPassword" type="password" />
              </div>
              <Button variant="outline">Update Password</Button>
            </CardContent>
          </Card>

          {/* GDPR Data Management */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-primary" />
                <CardTitle>Gestion des données (RGPD)</CardTitle>
              </div>
              <CardDescription>
                Conformément au Règlement Général sur la Protection des Données, vous disposez de droits sur vos données personnelles
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Data Export */}
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <Download className="w-5 h-5 text-muted-foreground mt-0.5" />
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground mb-1">Droit à la portabilité des données</h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      Téléchargez une copie complète de vos données personnelles au format JSON. 
                      Vous recevrez un email avec un lien de téléchargement sécurisé valable 7 jours.
                    </p>
                    <Button 
                      variant="outline" 
                      onClick={handleExportData}
                      disabled={isExporting}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      {isExporting ? "Traitement..." : "Exporter mes données"}
                    </Button>
                  </div>
                </div>
              </div>

              <div className="border-t pt-6">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-destructive mt-0.5" />
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground mb-1">Droit à l'effacement (Droit à l'oubli)</h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      Supprimez définitivement votre compte et toutes vos données personnelles. 
                      Cette action est irréversible. Un délai de 30 jours est prévu avant la suppression définitive.
                    </p>
                    
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" disabled={isDeleting}>
                          <Trash2 className="w-4 h-4 mr-2" />
                          {isDeleting ? "Traitement..." : "Supprimer mon compte"}
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Êtes-vous absolument sûr(e) ?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Cette action est irréversible. Toutes vos données seront définitivement supprimées 
                            dans un délai de 30 jours conformément au RGPD :
                            <ul className="list-disc list-inside mt-2 space-y-1">
                              <li>Informations de profil</li>
                              <li>Historique de navigation</li>
                              <li>Messages et communications</li>
                              <li>Documents téléchargés</li>
                            </ul>
                            <p className="mt-2 font-semibold">
                              Certaines données peuvent être conservées pour des obligations légales (comptabilité, contrats).
                            </p>
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Annuler</AlertDialogCancel>
                          <AlertDialogAction onClick={handleDeleteAccount} className="bg-destructive hover:bg-destructive/90">
                            Confirmer la suppression
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </div>

              <div className="border-t pt-6">
                <p className="text-xs text-muted-foreground">
                  Pour exercer vos autres droits RGPD (rectification, limitation, opposition), 
                  contactez notre DPO : <a href="mailto:dpo@roomivo.fr" className="text-primary hover:underline">dpo@roomivo.fr</a>
                  <br />
                  Vous disposez également du droit d'introduire une réclamation auprès de la CNIL : {" "}
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
