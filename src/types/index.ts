export interface Property {
  id: number | string;
  name: string;
  price: number;
  currency: string;
  rooms: number;
  location: string;
  amenities: string[];
  description: string;
  neighborhood_rating: number;
  transport_score: number;
  legal_status: string;
  images?: string[];
  match_score?: number;
  match_reason?: string;
}

export interface Tenant {
  id: number;
  name: string;
  age: number;
  profession: string;
  income: number;
  co_signer_income?: number;
  verified: boolean;
  match_score: number;
  risk_level: string;
  rental_history: string;
  move_in: string;
}

export interface TenantProfile {
  budget?: string;
  location?: string;
  moveInDate?: string;
  amenities?: string[];
  roomCount?: string;
}

export interface AppState {
  role: 'tenant' | 'landlord' | null;
  currentStep: number;
  tenantProfile: TenantProfile;
  selectedProperty: Property | null;
  selectedTenants: Tenant[];
}
