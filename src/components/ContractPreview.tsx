import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, Download } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ContractPreviewProps {
  propertyName: string;
  tenantName?: string;
  landlordName?: string;
  monthlyRent: number;
  deposit: number;
  startDate: string;
}

export const ContractPreview = ({ 
  propertyName, 
  tenantName, 
  landlordName,
  monthlyRent, 
  deposit, 
  startDate 
}: ContractPreviewProps) => {
  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <FileText className="w-6 h-6 text-primary" />
          <h3 className="text-xl font-semibold text-foreground">Contrat de Location</h3>
        </div>
        <Badge className="bg-success/10 text-success border-success/20">
          Conforme Loi du 6 juillet 1989
        </Badge>
      </div>

      <div className="prose prose-sm max-w-none text-foreground mb-6">
        <h4 className="font-semibold text-lg mb-4">BAIL D'HABITATION (Loi n°89-462 du 6 juillet 1989)</h4>
        
        <div className="space-y-4 text-sm">
          <div>
            <p className="font-medium">Le Bailleur :</p>
            <p className="text-muted-foreground">{landlordName || "[Nom du propriétaire]"}</p>
          </div>

          <div>
            <p className="font-medium">Le Locataire :</p>
            <p className="text-muted-foreground">{tenantName || "[Nom du locataire]"}</p>
          </div>

          <div>
            <p className="font-medium">Le Logement :</p>
            <p className="text-muted-foreground">{propertyName}</p>
          </div>

          <div>
            <p className="font-medium">Loyer mensuel (hors charges) :</p>
            <p className="text-muted-foreground">{monthlyRent} €</p>
          </div>

          <div>
            <p className="font-medium">Dépôt de garantie :</p>
            <p className="text-muted-foreground">{deposit} € (plafonné à 1 mois de loyer - Art. 22 loi 1989)</p>
          </div>

          <div>
            <p className="font-medium">Date d'effet du bail :</p>
            <p className="text-muted-foreground">{new Date(startDate).toLocaleDateString('fr-FR')}</p>
          </div>

          <div className="pt-4 border-t border-border">
            <p className="font-medium mb-2">Durée et renouvellement :</p>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
              <li>Durée : 3 ans minimum (bailleur personne physique) - Art. 10 loi 1989</li>
              <li>Tacite reconduction sauf congé dans les formes légales</li>
              <li>Préavis locataire : 3 mois (1 mois en zone tendue) - Art. 12</li>
              <li>Préavis bailleur : 6 mois pour motif légitime uniquement - Art. 15</li>
            </ul>
          </div>

          <div className="pt-4 border-t border-border">
            <p className="font-medium mb-2">Obligations du locataire :</p>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
              <li>Assurance habitation obligatoire (risques locatifs) - Art. 7</li>
              <li>Paiement du loyer et des charges au 1er de chaque mois</li>
              <li>Entretien courant et réparations locatives - Art. 7</li>
              <li>Jouir paisiblement du logement (bon père de famille)</li>
            </ul>
          </div>

          <div className="pt-4 border-t border-border">
            <p className="font-medium mb-2">Obligations du bailleur :</p>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
              <li>Délivrer un logement décent (décret n°2002-120) - Art. 6</li>
              <li>Assurer les réparations autres que locatives - Art. 6</li>
              <li>Ne pas s'opposer aux aménagements du locataire</li>
              <li>Respecter le droit au maintien dans les lieux</li>
            </ul>
          </div>

          <div className="pt-4 border-t border-border">
            <p className="font-medium mb-2">Diagnostics techniques annexés :</p>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
              <li>Diagnostic de Performance Énergétique (DPE) - Obligatoire</li>
              <li>Constat de Risque d'Exposition au Plomb (CREP) si avant 1949</li>
              <li>État d'amiante si permis avant 1997</li>
              <li>État des installations gaz et électricité si plus de 15 ans</li>
              <li>État des Risques Naturels et Technologiques (ERNT)</li>
            </ul>
          </div>

          <div className="pt-4 border-t border-border bg-accent/5 p-3 rounded">
            <p className="font-medium text-sm">
              ⚖️ Bail conforme à la loi n°89-462 du 6 juillet 1989, à la loi ALUR, 
              et au décret n°87-713 fixant la liste des clauses obligatoires et interdites.
            </p>
          </div>
        </div>
      </div>

      <div className="flex gap-3">
        <Button className="flex-1">
          <FileText className="w-4 h-4 mr-2" />
          Signer électroniquement
        </Button>
        <Button variant="outline">
          <Download className="w-4 h-4 mr-2" />
          Télécharger PDF
        </Button>
      </div>
      
      <p className="text-xs text-muted-foreground mt-3 text-center">
        La signature électronique a la même valeur juridique qu'une signature manuscrite (Règlement eIDAS)
      </p>
    </Card>
  );
};
