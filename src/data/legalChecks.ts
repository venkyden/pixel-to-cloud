export const legalChecks = [
  {
    name: "Required Clauses Present",
    status: "pass" as const,
    details: "All mandatory French tenancy law clauses included"
  },
  {
    name: "Insurance Clause",
    status: "pass" as const,
    details: "Tenant insurance requirements clearly specified"
  },
  {
    name: "Deposit Terms",
    status: "pass" as const,
    details: "Deposit amount and return conditions compliant"
  },
  {
    name: "Termination Notice",
    status: "pass" as const,
    details: "Notice period aligned with French law"
  },
  {
    name: "Access Rights",
    status: "warning" as const,
    details: "Landlord access conditions should be more specific"
  }
];
