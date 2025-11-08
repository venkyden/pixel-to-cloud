import { Incident, IncidentStats } from "@/types/incidents";

export const mockIncidents: Incident[] = [
  {
    id: "INC-001",
    title: "Water leak in bathroom",
    description: "Noticed water leaking from the bathroom ceiling. Appears to be coming from upstairs apartment.",
    category: "maintenance",
    status: "investigating",
    priority: "high",
    reportedBy: "tenant",
    reporterName: "Marie Dupont",
    propertyName: "Cozy Apartment in Marais, Paris",
    createdAt: "2025-01-15T09:30:00Z",
    updatedAt: "2025-01-15T14:20:00Z",
    timeline: [
      {
        id: "1",
        timestamp: "2025-01-15T09:30:00Z",
        action: "Incident Reported",
        actor: "Marie Dupont (Tenant)",
        details: "Water leak reported via mobile app"
      },
      {
        id: "2",
        timestamp: "2025-01-15T10:15:00Z",
        action: "Acknowledged",
        actor: "System",
        details: "Landlord notified automatically"
      },
      {
        id: "3",
        timestamp: "2025-01-15T14:20:00Z",
        action: "Status Updated",
        actor: "Property Manager",
        details: "Plumber scheduled for tomorrow morning"
      }
    ],
    attachments: ["leak-photo-1.jpg", "leak-photo-2.jpg"]
  },
  {
    id: "INC-002",
    title: "Late rent payment",
    description: "Rent payment for January was not received by the 5th as per contract terms.",
    category: "payment",
    status: "resolved",
    priority: "medium",
    reportedBy: "landlord",
    reporterName: "Property Management Team",
    propertyName: "Modern Studio in Lyon Presqu'île",
    createdAt: "2025-01-06T08:00:00Z",
    updatedAt: "2025-01-08T16:30:00Z",
    resolvedAt: "2025-01-08T16:30:00Z",
    resolution: "Payment received with late fee. Tenant experienced banking delay.",
    timeline: [
      {
        id: "1",
        timestamp: "2025-01-06T08:00:00Z",
        action: "Incident Created",
        actor: "System (Automated)",
        details: "Payment deadline passed without payment"
      },
      {
        id: "2",
        timestamp: "2025-01-06T10:00:00Z",
        action: "Reminder Sent",
        actor: "System",
        details: "Automated reminder sent to tenant"
      },
      {
        id: "3",
        timestamp: "2025-01-08T14:00:00Z",
        action: "Payment Received",
        actor: "Jean Leclerc (Tenant)",
        details: "Payment processed with €50 late fee"
      },
      {
        id: "4",
        timestamp: "2025-01-08T16:30:00Z",
        action: "Resolved",
        actor: "Property Manager",
        details: "Incident closed. Banking issue confirmed."
      }
    ]
  },
  {
    id: "INC-003",
    title: "Noise complaint from neighbor",
    description: "Multiple complaints about loud music after 10 PM on weekends.",
    category: "dispute",
    status: "open",
    priority: "low",
    reportedBy: "landlord",
    reporterName: "Building Management",
    propertyName: "Bright Flat in Nantes Center",
    createdAt: "2025-01-14T11:00:00Z",
    updatedAt: "2025-01-14T11:00:00Z",
    timeline: [
      {
        id: "1",
        timestamp: "2025-01-14T11:00:00Z",
        action: "Complaint Filed",
        actor: "Building Manager",
        details: "Neighbor complained about noise violations"
      }
    ]
  },
  {
    id: "INC-004",
    title: "Security deposit return delay",
    description: "Tenant moved out 3 weeks ago, security deposit not yet returned despite no damages found.",
    category: "legal",
    status: "investigating",
    priority: "critical",
    reportedBy: "tenant",
    reporterName: "Sophie Martin",
    propertyName: "Apartment in Marseille",
    createdAt: "2025-01-10T15:45:00Z",
    updatedAt: "2025-01-14T09:00:00Z",
    timeline: [
      {
        id: "1",
        timestamp: "2025-01-10T15:45:00Z",
        action: "Incident Reported",
        actor: "Sophie Martin (Tenant)",
        details: "Formal complaint about deposit delay"
      },
      {
        id: "2",
        timestamp: "2025-01-11T10:00:00Z",
        action: "Legal Team Notified",
        actor: "System",
        details: "Case escalated to legal compliance team"
      },
      {
        id: "3",
        timestamp: "2025-01-14T09:00:00Z",
        action: "Investigation Started",
        actor: "Legal Team",
        details: "Reviewing contract terms and move-out inspection"
      }
    ]
  },
  {
    id: "INC-005",
    title: "Broken heating system",
    description: "Central heating not working for 2 days. Temperature dropped below 15°C.",
    category: "safety",
    status: "resolved",
    priority: "critical",
    reportedBy: "tenant",
    reporterName: "Marie Dupont",
    propertyName: "Cozy Apartment in Marais, Paris",
    createdAt: "2025-01-12T07:00:00Z",
    updatedAt: "2025-01-13T18:00:00Z",
    resolvedAt: "2025-01-13T18:00:00Z",
    resolution: "Heating system repaired. Temporary heaters provided during repair.",
    timeline: [
      {
        id: "1",
        timestamp: "2025-01-12T07:00:00Z",
        action: "Emergency Reported",
        actor: "Marie Dupont (Tenant)",
        details: "Heating failure reported as emergency"
      },
      {
        id: "2",
        timestamp: "2025-01-12T08:30:00Z",
        action: "Technician Dispatched",
        actor: "Property Manager",
        details: "Emergency HVAC technician sent immediately"
      },
      {
        id: "3",
        timestamp: "2025-01-12T11:00:00Z",
        action: "Temporary Solution",
        actor: "Technician",
        details: "Portable heaters provided while parts ordered"
      },
      {
        id: "4",
        timestamp: "2025-01-13T16:00:00Z",
        action: "Repair Completed",
        actor: "Technician",
        details: "New thermostat installed, system operational"
      },
      {
        id: "5",
        timestamp: "2025-01-13T18:00:00Z",
        action: "Resolved",
        actor: "Property Manager",
        details: "Tenant confirmed heating working properly"
      }
    ]
  }
];

export const mockIncidentStats: IncidentStats = {
  total: 5,
  open: 2,
  resolved: 3,
  byCategory: {
    maintenance: 2,
    payment: 1,
    dispute: 1,
    legal: 1,
    safety: 1,
    communication: 0,
    other: 0
  },
  byPriority: {
    low: 1,
    medium: 1,
    high: 1,
    critical: 2
  },
  averageResolutionTime: 36 // hours
};
