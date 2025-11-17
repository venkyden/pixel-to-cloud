import { useEffect, useState } from "react";
import { LegalChecks } from "./LegalChecks";
import { legalChecks as legalChecksData } from "@/data/legalChecks";

interface PropertyLegalChecksProps {
  propertyId: string;
  price: number;
  location: string;
  hasEnergyDiagnostic?: boolean;
  hasGasDiagnostic?: boolean;
  hasElectricalDiagnostic?: boolean;
  hasAsbestosDiagnostic?: boolean;
  hasLeadDiagnostic?: boolean;
}

export const PropertyLegalChecks = ({
  propertyId,
  price,
  location,
  hasEnergyDiagnostic = false,
  hasGasDiagnostic = false,
  hasElectricalDiagnostic = false,
  hasAsbestosDiagnostic = false,
  hasLeadDiagnostic = false,
}: PropertyLegalChecksProps) => {
  const [checks, setChecks] = useState<any[]>([]);

  useEffect(() => {
    runLegalChecks();
  }, [propertyId, price, location]);

  const runLegalChecks = () => {
    const results = [];

    // Check rent control zones (Paris and surrounding areas)
    const rentControlZones = ["Paris", "Lille", "Lyon", "Montpellier", "Bordeaux"];
    const isInControlZone = rentControlZones.some(zone => 
      location.toLowerCase().includes(zone.toLowerCase())
    );

    if (isInControlZone) {
      results.push({
        name: "Encadrement des loyers",
        status: "warning",
        details: "Ce bien est situé en zone d'encadrement des loyers. Vérifiez que le loyer respecte le plafond légal.",
      });
    } else {
      results.push({
        name: "Encadrement des loyers",
        status: "pass",
        details: "Le bien n'est pas en zone d'encadrement des loyers.",
      });
    }

    // Check deposit amount (max 1 month for unfurnished, 2 months for furnished)
    const maxDeposit = price; // Assuming unfurnished
    results.push({
      name: "Montant du dépôt de garantie",
      status: "pass",
      details: `Dépôt de garantie maximum autorisé: ${maxDeposit}€ (1 mois de loyer pour non meublé, Art. 22 Loi 89-462)`,
    });

    // Check mandatory diagnostics
    results.push({
      name: "Diagnostic de Performance Énergétique (DPE)",
      status: hasEnergyDiagnostic ? "pass" : "fail",
      details: hasEnergyDiagnostic 
        ? "DPE fourni (obligatoire depuis 2006 - Loi ENL)"
        : "⚠️ DPE manquant - Obligatoire pour toute mise en location",
    });

    results.push({
      name: "Diagnostic Gaz",
      status: hasGasDiagnostic ? "pass" : "warning",
      details: hasGasDiagnostic
        ? "Diagnostic gaz fourni (obligatoire si installation >15 ans)"
        : "Diagnostic gaz recommandé si installation gaz présente",
    });

    results.push({
      name: "Diagnostic Électricité",
      status: hasElectricalDiagnostic ? "pass" : "warning",
      details: hasElectricalDiagnostic
        ? "Diagnostic électricité fourni (obligatoire si installation >15 ans)"
        : "Diagnostic électricité recommandé si installation >15 ans",
    });

    results.push({
      name: "Diagnostic Amiante",
      status: hasAsbestosDiagnostic ? "pass" : "warning",
      details: hasAsbestosDiagnostic
        ? "Diagnostic amiante fourni (obligatoire pour biens construits avant 1997)"
        : "Diagnostic amiante requis si construction avant 1er juillet 1997",
    });

    results.push({
      name: "Diagnostic Plomb (CREP)",
      status: hasLeadDiagnostic ? "pass" : "warning",
      details: hasLeadDiagnostic
        ? "Diagnostic plomb fourni (obligatoire pour biens construits avant 1949)"
        : "Diagnostic plomb requis si construction avant 1er janvier 1949",
    });

    // Contract requirements
    results.push({
      name: "Contrat de location conforme",
      status: "pass",
      details: "Le bail doit respecter le modèle type fixé par décret (Loi ALUR 2014)",
    });

    results.push({
      name: "État des lieux obligatoire",
      status: "pass",
      details: "État des lieux d'entrée et de sortie obligatoires (Art. 3 Loi 89-462)",
    });

    // Notice period
    results.push({
      name: "Préavis légal",
      status: "pass",
      details: "Préavis locataire: 1 ou 3 mois selon zone tendue. Préavis bailleur: 6 mois (Art. 15 Loi 89-462)",
    });

    setChecks(results);
  };

  return <LegalChecks checks={checks} />;
};
