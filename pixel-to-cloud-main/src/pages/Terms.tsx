import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { FileText, Scale } from "lucide-react";

export default function Terms() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-12 max-w-4xl">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Scale className="w-8 h-8 text-primary" />
            <h1 className="text-4xl font-bold text-foreground">Conditions Générales d'Utilisation</h1>
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
                <h2 className="text-2xl font-semibold mb-3 text-foreground">1. Objet</h2>
                <p className="text-muted-foreground">
                  Les présentes Conditions Générales d'Utilisation (CGU) régissent l'accès et l'utilisation 
                  de la plateforme Roomivo, service de mise en relation entre locataires et propriétaires, 
                  conforme à la législation française en matière de location immobilière.
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-2xl font-semibold mb-3 text-foreground">2. Acceptation des CGU</h2>
            <p className="text-muted-foreground">
              L'utilisation de Roomivo implique l'acceptation pleine et entière des présentes CGU. 
              Si vous n'acceptez pas ces conditions, veuillez ne pas utiliser nos services.
            </p>
          </Card>

          <Card className="p-6">
            <h2 className="text-2xl font-semibold mb-3 text-foreground">3. Description des services</h2>
            <p className="text-muted-foreground mb-3">
              Roomivo propose :
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
              <li>Mise en relation entre locataires et propriétaires</li>
              <li>Gestion transparente des candidatures</li>
              <li>Vérification d'identité et scoring</li>
              <li>Génération de contrats conformes à la loi française</li>
              <li>Gestion des incidents et médiation</li>
              <li>Système de paiement sécurisé</li>
            </ul>
          </Card>

          <Card className="p-6">
            <h2 className="text-2xl font-semibold mb-3 text-foreground">4. Inscription et compte utilisateur</h2>
            <p className="text-muted-foreground mb-3">
              L'inscription sur Roomivo nécessite :
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
              <li>Avoir au moins 18 ans</li>
              <li>Fournir des informations exactes et à jour</li>
              <li>Accepter les CGU et la Politique de Confidentialité</li>
              <li>Consentir au traitement des données personnelles (RGPD)</li>
            </ul>
            <p className="text-muted-foreground mt-3">
              Vous êtes responsable de la confidentialité de vos identifiants.
            </p>
          </Card>

          <Card className="p-6">
            <h2 className="text-2xl font-semibold mb-3 text-foreground">5. Obligations des utilisateurs</h2>
            <p className="text-muted-foreground mb-3">
              <strong>Locataires :</strong>
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
              <li>Fournir des documents authentiques</li>
              <li>Respecter les termes du bail</li>
              <li>Payer le loyer aux échéances convenues</li>
            </ul>
            <p className="text-muted-foreground mt-3 mb-3">
              <strong>Propriétaires :</strong>
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
              <li>Respecter la loi du 6 juillet 1989 sur les baux d'habitation</li>
              <li>Fournir un logement décent</li>
              <li>Ne pas discriminer les candidats</li>
              <li>Respecter les diagnostics obligatoires (DPE, plomb, amiante, etc.)</li>
            </ul>
          </Card>

          <Card className="p-6">
            <h2 className="text-2xl font-semibold mb-3 text-foreground">6. Conformité légale française</h2>
            <p className="text-muted-foreground mb-3">
              Roomivo respecte la législation française en vigueur :
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
              <li>Loi n°89-462 du 6 juillet 1989 sur les rapports locatifs</li>
              <li>Loi ALUR (Accès au Logement et Urbanisme Rénové)</li>
              <li>Encadrement des loyers dans les zones tendues</li>
              <li>RGPD et Loi Informatique et Libertés</li>
              <li>Code de la consommation</li>
            </ul>
          </Card>

          <Card className="p-6">
            <h2 className="text-2xl font-semibold mb-3 text-foreground">7. Tarification</h2>
            <p className="text-muted-foreground">
              Les frais de service sont clairement affichés avant toute transaction. 
              Conformément à la loi ALUR, les frais d'agence sont partagés entre locataire et propriétaire 
              selon les barèmes légaux.
            </p>
          </Card>

          <Card className="p-6">
            <h2 className="text-2xl font-semibold mb-3 text-foreground">8. Dépôt de garantie</h2>
            <p className="text-muted-foreground">
              Le dépôt de garantie est plafonné à 1 mois de loyer hors charges pour un logement nu, 
              et 2 mois pour un logement meublé, conformément à l'article 22 de la loi du 6 juillet 1989.
            </p>
          </Card>

          <Card className="p-6">
            <h2 className="text-2xl font-semibold mb-3 text-foreground">9. Résiliation et suppression de compte</h2>
            <p className="text-muted-foreground">
              Vous pouvez supprimer votre compte à tout moment depuis votre profil. 
              Conformément au RGPD, vos données seront supprimées dans un délai de 30 jours, 
              sauf obligation légale de conservation.
            </p>
          </Card>

          <Card className="p-6">
            <h2 className="text-2xl font-semibold mb-3 text-foreground">10. Limitation de responsabilité</h2>
            <p className="text-muted-foreground">
              Roomivo agit en tant qu'intermédiaire. Nous ne sommes pas responsables des litiges 
              entre locataires et propriétaires, mais proposons un service de médiation.
            </p>
          </Card>

          <Card className="p-6">
            <h2 className="text-2xl font-semibold mb-3 text-foreground">11. Droit applicable et juridiction</h2>
            <p className="text-muted-foreground">
              Les présentes CGU sont soumises au droit français. Tout litige sera porté devant 
              les tribunaux français compétents. Conformément à la directive européenne sur le règlement 
              des litiges en ligne, vous pouvez également recourir à la plateforme de résolution des litiges : 
              <a href="https://ec.europa.eu/consumers/odr" className="text-primary hover:underline ml-1">
                https://ec.europa.eu/consumers/odr
              </a>
            </p>
          </Card>

          <Card className="p-6">
            <h2 className="text-2xl font-semibold mb-3 text-foreground">12. Contact</h2>
            <p className="text-muted-foreground">
              Pour toute question concernant ces CGU, contactez-nous à : legal@roomivo.fr
            </p>
          </Card>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
