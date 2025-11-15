export type IncidentCategory = 
  | 'maintenance'
  | 'payment'
  | 'dispute'
  | 'legal'
  | 'safety'
  | 'communication'
  | 'other';

export type IncidentStatus = 
  | 'open'
  | 'investigating'
  | 'resolved'
  | 'closed';

export type IncidentPriority = 
  | 'low'
  | 'medium'
  | 'high'
  | 'critical';

export interface Incident {
  id: string;
  title: string;
  description: string;
  category: IncidentCategory;
  status: IncidentStatus;
  priority: IncidentPriority;
  reportedBy: 'tenant' | 'landlord' | 'system';
  reporterName: string;
  propertyName: string;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
  resolution?: string;
  attachments?: string[];
  timeline: IncidentTimelineEvent[];
}

export interface IncidentTimelineEvent {
  id: string;
  timestamp: string;
  action: string;
  actor: string;
  details: string;
}

export interface IncidentStats {
  total: number;
  open: number;
  resolved: number;
  byCategory: Record<IncidentCategory, number>;
  byPriority: Record<IncidentPriority, number>;
  averageResolutionTime: number; // in hours
}
