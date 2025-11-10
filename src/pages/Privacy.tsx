import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Shield, Lock, FileText, UserCheck } from "lucide-react";

export default function Privacy() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-12 max-w-4xl">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Shield className="w-8 h-8 text-primary" />
            <h1 className="text-4xl font-bold text-foreground">Politique de Confidentialité</h1>
          </div>
          <p className="text-muted-foreground">
            Dernière mise à jour : {new Date().toLocaleDateString('fr-FR')}
          </p>
        </div>

        <div className="space-y-6">
          <Card className="p-6">
            <div className="flex items-start gap-3 mb-4">
              <FileText className="w-6 h-6 text-primary mt-1" />
              <div>
                <h2 className="text-2xl font-semibold mb-3 text-foreground">1. Responsable du traitement</h2>
                <p className="text-muted-foreground mb-3">
                  Le responsable du traitement des données personnelles est Roomivo, société par actions simplifiée, 
                  enregistrée en France.
                </p>
                <p className="text-muted-foreground">
                  Conformément au Règlement Général sur la Protection des Données (RGPD) et à la loi Informatique et Libertés, 
                  nous nous engageons à protéger vos données personnelles.
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-start gap-3 mb-4">
              <UserCheck className="w-6 h-6 text-primary mt-1" />
              <div>
                <h2 className="text-2xl font-semibold mb-3 text-foreground">2. Données collectées</h2>
                <p className="text-muted-foreground mb-3">
                  Nous collectons uniquement les données nécessaires au fonctionnement de notre service :
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                  <li>Données d'identification : nom, prénom, email</li>
                  <li>Données de contact : numéro de téléphone</li>
                  <li>Données de profil : rôle (locataire/propriétaire), préférences</li>
                  <li>Données de navigation : logs de connexion, adresse IP</li>
                </ul>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-start gap-3 mb-4">
              <Lock className="w-6 h-6 text-primary mt-1" />
              <div>
                <h2 className="text-2xl font-semibold mb-3 text-foreground">3. Base légale et finalités</h2>
                <p className="text-muted-foreground mb-3">
                  Le traitement de vos données repose sur :
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                  <li><strong>Votre consentement</strong> : collecté lors de l'inscription</li>
                  <li><strong>L'exécution du contrat</strong> : fourniture du service de mise en relation</li>
                  <li><strong>Obligation légale</strong> : conformité avec les lois françaises sur la location</li>
                  <li><strong>Intérêt légitime</strong> : amélioration de nos services, prévention de la fraude</li>
                </ul>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-2xl font-semibold mb-3 text-foreground">4. Durée de conservation</h2>
            <p className="text-muted-foreground mb-3">
              Vos données sont conservées pendant :
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
              <li>Données de profil : durée de votre compte + 3 ans</li>
              <li>Données de transaction : 10 ans (obligation comptable)</li>
              <li>Logs de connexion : 12 mois</li>
            </ul>
          </Card>

          <Card className="p-6">
            <h2 className="text-2xl font-semibold mb-3 text-foreground">5. Vos droits RGPD</h2>
            <p className="text-muted-foreground mb-3">
              Conformément au RGPD, vous disposez des droits suivants :
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
              <li><strong>Droit d'accès</strong> : consulter vos données</li>
              <li><strong>Droit de rectification</strong> : corriger vos données</li>
              <li><strong>Droit à l'effacement</strong> : supprimer votre compte et vos données</li>
              <li><strong>Droit à la portabilité</strong> : télécharger vos données</li>
              <li><strong>Droit d'opposition</strong> : refuser certains traitements</li>
              <li><strong>Droit à la limitation</strong> : limiter le traitement</li>
            </ul>
            <p className="text-muted-foreground mt-3">
              Pour exercer vos droits, rendez-vous dans votre profil ou contactez notre DPO.
            </p>
          </Card>

          <Card className="p-6">
            <h2 className="text-2xl font-semibold mb-3 text-foreground">6. Sécurité des données</h2>
            <p className="text-muted-foreground mb-3">
              Nous mettons en œuvre des mesures techniques et organisationnelles appropriées :
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
              <li>Chiffrement des données en transit (HTTPS/TLS)</li>
              <li>Chiffrement des données au repos</li>
              <li>Authentification sécurisée</li>
              <li>Contrôle d'accès strict (RLS - Row Level Security)</li>
              <li>Audits de sécurité réguliers</li>
            </ul>
          </Card>

          <Card className="p-6">
            <h2 className="text-2xl font-semibold mb-3 text-foreground">7. Transferts de données</h2>
            <p className="text-muted-foreground">
              Vos données sont hébergées dans l'Union Européenne. Aucun transfert hors UE n'est effectué 
              sans garanties appropriées (clauses contractuelles types de la Commission européenne).
            </p>
          </Card>

          <Card className="p-6">
            <h2 className="text-2xl font-semibold mb-3 text-foreground">8. Cookies</h2>
            <p className="text-muted-foreground">
              Nous utilisons uniquement des cookies essentiels au fonctionnement du service 
              (authentification, préférences d'interface). Aucun cookie de tracking ou publicitaire n'est utilisé.
            </p>
          </Card>

          <Card className="p-6">
            <h2 className="text-2xl font-semibold mb-3 text-foreground">9. Contact et réclamations</h2>
            <p className="text-muted-foreground mb-3">
              Pour toute question concernant vos données personnelles :
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
              <li>Email DPO : dpo@roomivo.fr</li>
              <li>Courrier : Roomivo - Service DPO, [Adresse]</li>
            </ul>
            <p className="text-muted-foreground mt-3">
              Vous avez également le droit d'introduire une réclamation auprès de la CNIL 
              (Commission Nationale de l'Informatique et des Libertés) : <a href="https://www.cnil.fr" className="text-primary hover:underline">www.cnil.fr</a>
            </p>
          </Card>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
