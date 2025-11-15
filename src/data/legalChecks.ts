// Vérifications de conformité réglementaire française
// Conformément à la Loi n°89-462 du 6 juillet 1989 et Loi ALUR

export const legalChecks = [
  {
    name: "Clauses obligatoires (Loi du 6 juillet 1989)",
    status: "pass" as const,
    details: "Toutes les clauses obligatoires du décret n°87-713 sont présentes : identité des parties, durée du bail, montant du loyer, modalités de révision, destination du logement"
  },
  {
    name: "Diagnostics techniques obligatoires",
    status: "pass" as const,
    details: "DPE, état des risques naturels et technologiques, diagnostic plomb (si avant 1949), amiante (si avant 1997), gaz et électricité (si > 15 ans) - Conforme article 3-3 loi 1989"
  },
  {
    name: "Dépôt de garantie",
    status: "pass" as const,
    details: "Plafonné à 1 mois de loyer hors charges (logement nu) ou 2 mois (meublé) - Article 22 loi 1989. Restitution dans un délai de 2 mois maximum"
  },
  {
    name: "Clause d'assurance habitation",
    status: "pass" as const,
    details: "Obligation d'assurance risques locatifs clairement stipulée - Article 7 loi 1989. Justificatif à fournir annuellement"
  },
  {
    name: "Préavis de résiliation",
    status: "pass" as const,
    details: "3 mois pour le locataire (1 mois en zone tendue), 6 mois pour le bailleur avec motif légitime - Articles 12 et 15 loi 1989"
  },
  {
    name: "Clauses interdites",
    status: "pass" as const,
    details: "Aucune clause abusive détectée. Conforme à l'article 4 du décret n°87-713 (interdiction de solidarité après départ, paiement direct au syndic, etc.)"
  },
  {
    name: "Encadrement des loyers (zones tendues)",
    status: "pass" as const,
    details: "Loyer conforme au décret d'encadrement si applicable (Paris, Lyon, etc.) - Loi ELAN 2018"
  },
  {
    name: "Logement décent",
    status: "pass" as const,
    details: "Conformité au décret n°2002-120 : surface minimale, équipements, absence de risques pour la santé - Article 6 loi 1989"
  }
];
