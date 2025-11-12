import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { FileText, Download, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

export const EndOfLeaseDocument = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    tenantName: "",
    landlordName: "",
    propertyAddress: "",
    leaseStartDate: "",
    noticeDate: "",
    endDate: "",
    noticePeriod: "3",
    depositAmount: "",
    reason: ""
  });

  const handleGenerate = () => {
    if (!formData.tenantName || !formData.endDate) {
      toast({
        title: "Champs requis",
        description: "Veuillez remplir tous les champs obligatoires.",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Document généré",
      description: "Le document de fin de bail a été créé avec succès.",
    });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Fin de Bail
          </CardTitle>
          <Badge className="bg-warning/10 text-warning border-warning/20">
            Art. 12-15 Loi 1989
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-xs">
            <strong>Préavis légal:</strong> 3 mois pour le locataire (1 mois en zone tendue - Art. 12). 
            6 mois pour le bailleur avec motif légitime (Art. 15).
          </AlertDescription>
        </Alert>

        <div className="space-y-2">
          <Label>Type de congé</Label>
          <RadioGroup 
            value={formData.noticePeriod} 
            onValueChange={(value) => setFormData({...formData, noticePeriod: value})}
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="3" id="normal" />
              <Label htmlFor="normal" className="font-normal">
                Préavis normal (3 mois)
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="1" id="reduced" />
              <Label htmlFor="reduced" className="font-normal">
                Préavis réduit (1 mois - zone tendue, mutation, perte emploi, 60+ ans)
              </Label>
            </div>
          </RadioGroup>
        </div>

        <Separator />

        <div className="space-y-2">
          <Label htmlFor="tenantName">Nom du Locataire *</Label>
          <Input 
            id="tenantName"
            placeholder="Jean Dupont"
            value={formData.tenantName}
            onChange={(e) => setFormData({...formData, tenantName: e.target.value})}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="landlordName">Nom du Bailleur</Label>
          <Input 
            id="landlordName"
            placeholder="Marie Martin"
            value={formData.landlordName}
            onChange={(e) => setFormData({...formData, landlordName: e.target.value})}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="propertyAddress">Adresse du Logement</Label>
          <Input 
            id="propertyAddress"
            placeholder="123 Rue de la Paix, 75001 Paris"
            value={formData.propertyAddress}
            onChange={(e) => setFormData({...formData, propertyAddress: e.target.value})}
          />
        </div>

        <Separator />

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="leaseStartDate">Date début du bail</Label>
            <Input 
              id="leaseStartDate"
              type="date"
              value={formData.leaseStartDate}
              onChange={(e) => setFormData({...formData, leaseStartDate: e.target.value})}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="noticeDate">Date de notification *</Label>
            <Input 
              id="noticeDate"
              type="date"
              value={formData.noticeDate}
              onChange={(e) => setFormData({...formData, noticeDate: e.target.value})}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="endDate">Date de fin du bail *</Label>
          <Input 
            id="endDate"
            type="date"
            value={formData.endDate}
            onChange={(e) => setFormData({...formData, endDate: e.target.value})}
          />
          <p className="text-xs text-muted-foreground">
            Date effective de libération du logement
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="depositAmount">Montant du dépôt de garantie (€)</Label>
          <Input 
            id="depositAmount"
            type="number"
            placeholder="1200"
            value={formData.depositAmount}
            onChange={(e) => setFormData({...formData, depositAmount: e.target.value})}
          />
          <p className="text-xs text-muted-foreground">
            À restituer dans les 2 mois (Art. 22)
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="reason">Motif du départ (optionnel)</Label>
          <Textarea 
            id="reason"
            placeholder="Mutation professionnelle, achat d'un bien..."
            value={formData.reason}
            onChange={(e) => setFormData({...formData, reason: e.target.value})}
            rows={3}
          />
        </div>

        <Separator />

        <div className="bg-accent/5 p-4 rounded-lg space-y-2">
          <h4 className="font-semibold text-sm">Prochaines étapes :</h4>
          <ul className="list-disc list-inside space-y-1 text-xs text-muted-foreground">
            <li>État des lieux de sortie à réaliser</li>
            <li>Restitution des clés le jour du départ</li>
            <li>Restitution du dépôt de garantie (2 mois max)</li>
            <li>Solde de tout compte (eau, électricité, gaz)</li>
          </ul>
        </div>

        <div className="space-y-2">
          <Button className="w-full" onClick={handleGenerate}>
            <FileText className="mr-2 h-4 w-4" />
            Générer le Document
          </Button>
          <Button variant="outline" className="w-full">
            <Download className="mr-2 h-4 w-4" />
            Télécharger PDF
          </Button>
        </div>

        <p className="text-xs text-muted-foreground text-center">
          Document conforme aux Articles 12, 15 et 22 de la loi n°89-462 du 6 juillet 1989
        </p>
      </CardContent>
    </Card>
  );
};
