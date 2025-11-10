import { Property, Tenant } from "@/types";

// ⚠️ DONNÉES DE DÉMONSTRATION
// Ces données sont des exemples à des fins de développement et démonstration uniquement.
// Dans un environnement de production, ces données proviendraient de la base de données Supabase.

export const properties: Property[] = [
  {
    id: 1,
    name: "Cozy Apartment in Marais, Paris",
    price: 850,
    currency: "€",
    rooms: 2,
    location: "Paris, Marais District",
    amenities: ["balcony", "elevator", "near_metro"],
    description: "Beautiful 2-room apartment in vibrant Marais district with modern finishes and balcony",
    neighborhood_rating: 4.8,
    transport_score: 9.5,
    legal_status: "Compliant",
    match_score: 94,
    match_reason: "Perfect match! Balcony, near metro (500m to Line 1), within your €600-900 budget. Legal compliance verified."
  },
  {
    id: 2,
    name: "Modern Studio in Lyon Presqu'île",
    price: 650,
    currency: "€",
    rooms: 1,
    location: "Lyon, Presqu'île",
    amenities: ["garden_access", "parking", "pet_friendly"],
    description: "Bright studio apartment with garden access and ample parking",
    neighborhood_rating: 4.5,
    transport_score: 8.8,
    legal_status: "Compliant",
    match_score: 87,
    match_reason: "Excellent value with garden access and pet-friendly. Slightly outside Paris but great for nature lovers."
  },
  {
    id: 3,
    name: "Bright Flat in Nantes Center",
    price: 720,
    currency: "€",
    rooms: 2,
    location: "Nantes, City Center",
    amenities: ["parking", "furnished", "near_shops"],
    description: "Recently renovated 2-room flat in the heart of Nantes",
    neighborhood_rating: 4.6,
    transport_score: 9.0,
    legal_status: "Compliant",
    match_score: 76,
    match_reason: "Central location with parking included. Near shops and transport. Good value in Nantes center."
  }
];

export const tenants: Tenant[] = [
  {
    id: 1,
    name: "Marie Dupont",
    age: 28,
    profession: "Finance Analyst",
    income: 3000,
    verified: true,
    match_score: 92,
    risk_level: "Low",
    rental_history: "3 years clean rental history",
    move_in: "January 2026"
  },
  {
    id: 2,
    name: "Jean Leclerc",
    age: 24,
    profession: "Student",
    income: 1200,
    co_signer_income: 2500,
    verified: true,
    match_score: 78,
    risk_level: "Medium",
    rental_history: "First-time renter with parental guarantee",
    move_in: "February 2026"
  },
  {
    id: 3,
    name: "Sophie Martin",
    age: 35,
    profession: "Manager",
    income: 4500,
    verified: true,
    match_score: 95,
    risk_level: "Low",
    rental_history: "7 years excellent rental history",
    move_in: "December 2025"
  }
];

export const amenityLabels: Record<string, string> = {
  balcony: "Balcony",
  elevator: "Elevator",
  near_metro: "Near Metro",
  garden_access: "Garden",
  parking: "Parking",
  pet_friendly: "Pet Friendly",
  furnished: "Furnished",
  near_shops: "Near Shops"
};
