export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      audit_logs: {
        Row: {
          action: string
          created_at: string
          id: string
          ip_address: string | null
          record_id: string | null
          table_name: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          id?: string
          ip_address?: string | null
          record_id?: string | null
          table_name?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          id?: string
          ip_address?: string | null
          record_id?: string | null
          table_name?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      contracts: {
        Row: {
          application_id: string | null
          contract_data: Json
          contract_type: string
          created_at: string | null
          deposit_amount: number
          duration_months: number | null
          end_date: string | null
          id: string
          landlord_id: string
          landlord_signature_url: string | null
          landlord_signed_at: string | null
          monthly_rent: number
          pdf_url: string | null
          property_id: string
          start_date: string
          status: string
          tenant_id: string
          tenant_signature_url: string | null
          tenant_signed_at: string | null
          updated_at: string | null
        }
        Insert: {
          application_id?: string | null
          contract_data: Json
          contract_type?: string
          created_at?: string | null
          deposit_amount: number
          duration_months?: number | null
          end_date?: string | null
          id?: string
          landlord_id: string
          landlord_signature_url?: string | null
          landlord_signed_at?: string | null
          monthly_rent: number
          pdf_url?: string | null
          property_id: string
          start_date: string
          status?: string
          tenant_id: string
          tenant_signature_url?: string | null
          tenant_signed_at?: string | null
          updated_at?: string | null
        }
        Update: {
          application_id?: string | null
          contract_data?: Json
          contract_type?: string
          created_at?: string | null
          deposit_amount?: number
          duration_months?: number | null
          end_date?: string | null
          id?: string
          landlord_id?: string
          landlord_signature_url?: string | null
          landlord_signed_at?: string | null
          monthly_rent?: number
          pdf_url?: string | null
          property_id?: string
          start_date?: string
          status?: string
          tenant_id?: string
          tenant_signature_url?: string | null
          tenant_signed_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "contracts_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "tenant_applications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contracts_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      data_deletion_requests: {
        Row: {
          completed_at: string | null
          id: string
          reason: string | null
          requested_at: string
          status: string
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          id?: string
          reason?: string | null
          requested_at?: string
          status?: string
          user_id: string
        }
        Update: {
          completed_at?: string | null
          id?: string
          reason?: string | null
          requested_at?: string
          status?: string
          user_id?: string
        }
        Relationships: []
      }
      data_exports: {
        Row: {
          created_at: string
          download_url: string | null
          expires_at: string | null
          id: string
          requested_at: string
          status: string
          user_id: string
        }
        Insert: {
          created_at?: string
          download_url?: string | null
          expires_at?: string | null
          id?: string
          requested_at?: string
          status?: string
          user_id: string
        }
        Update: {
          created_at?: string
          download_url?: string | null
          expires_at?: string | null
          id?: string
          requested_at?: string
          status?: string
          user_id?: string
        }
        Relationships: []
      }
      documents: {
        Row: {
          created_at: string
          id: string
          name: string
          property_id: string | null
          size: number | null
          type: string
          url: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          property_id?: string | null
          size?: number | null
          type: string
          url: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          property_id?: string | null
          size?: number | null
          type?: string
          url?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "documents_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      escrow_payments: {
        Row: {
          amount: number
          application_id: string
          created_at: string
          currency: string
          deposit_amount: number
          escrow_released_at: string | null
          id: string
          landlord_id: string
          property_id: string
          status: string
          stripe_payment_intent_id: string | null
          tenant_id: string
          updated_at: string
        }
        Insert: {
          amount: number
          application_id: string
          created_at?: string
          currency?: string
          deposit_amount: number
          escrow_released_at?: string | null
          id?: string
          landlord_id: string
          property_id: string
          status?: string
          stripe_payment_intent_id?: string | null
          tenant_id: string
          updated_at?: string
        }
        Update: {
          amount?: number
          application_id?: string
          created_at?: string
          currency?: string
          deposit_amount?: number
          escrow_released_at?: string | null
          id?: string
          landlord_id?: string
          property_id?: string
          status?: string
          stripe_payment_intent_id?: string | null
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "escrow_payments_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "tenant_applications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "escrow_payments_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      incident_timeline: {
        Row: {
          action: string
          actor: string
          created_at: string
          details: string | null
          id: string
          incident_id: string
        }
        Insert: {
          action: string
          actor: string
          created_at?: string
          details?: string | null
          id?: string
          incident_id: string
        }
        Update: {
          action?: string
          actor?: string
          created_at?: string
          details?: string | null
          id?: string
          incident_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "incident_timeline_incident_id_fkey"
            columns: ["incident_id"]
            isOneToOne: false
            referencedRelation: "incidents"
            referencedColumns: ["id"]
          },
        ]
      }
      incidents: {
        Row: {
          attachments: string[] | null
          category: Database["public"]["Enums"]["incident_category"]
          created_at: string
          description: string
          id: string
          priority: Database["public"]["Enums"]["incident_priority"] | null
          property_id: string
          reported_by: string
          resolution: string | null
          resolved_at: string | null
          status: Database["public"]["Enums"]["incident_status"] | null
          title: string
          updated_at: string
        }
        Insert: {
          attachments?: string[] | null
          category: Database["public"]["Enums"]["incident_category"]
          created_at?: string
          description: string
          id?: string
          priority?: Database["public"]["Enums"]["incident_priority"] | null
          property_id: string
          reported_by: string
          resolution?: string | null
          resolved_at?: string | null
          status?: Database["public"]["Enums"]["incident_status"] | null
          title: string
          updated_at?: string
        }
        Update: {
          attachments?: string[] | null
          category?: Database["public"]["Enums"]["incident_category"]
          created_at?: string
          description?: string
          id?: string
          priority?: Database["public"]["Enums"]["incident_priority"] | null
          property_id?: string
          reported_by?: string
          resolution?: string | null
          resolved_at?: string | null
          status?: Database["public"]["Enums"]["incident_status"] | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "incidents_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      landlord_verifications: {
        Row: {
          created_at: string
          email: string
          full_name: string
          government_id_url: string | null
          id: string
          ownership_document_url: string | null
          phone: string
          status: string
          updated_at: string
          user_id: string
          verified_at: string | null
        }
        Insert: {
          created_at?: string
          email: string
          full_name: string
          government_id_url?: string | null
          id?: string
          ownership_document_url?: string | null
          phone: string
          status?: string
          updated_at?: string
          user_id: string
          verified_at?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          full_name?: string
          government_id_url?: string | null
          id?: string
          ownership_document_url?: string | null
          phone?: string
          status?: string
          updated_at?: string
          user_id?: string
          verified_at?: string | null
        }
        Relationships: []
      }
      lease_terminations: {
        Row: {
          acknowledged_date: string | null
          created_at: string
          deposit_amount: number | null
          deposit_return_date: string | null
          deposit_returned: boolean | null
          document_url: string | null
          id: string
          landlord_id: string
          landlord_name: string
          lease_start_date: string | null
          notice_date: string
          notice_type: string
          property_address: string
          property_id: string
          sent_date: string | null
          special_conditions: string | null
          status: string
          tenant_id: string
          tenant_name: string
          termination_date: string
          termination_reason: string | null
          updated_at: string
        }
        Insert: {
          acknowledged_date?: string | null
          created_at?: string
          deposit_amount?: number | null
          deposit_return_date?: string | null
          deposit_returned?: boolean | null
          document_url?: string | null
          id?: string
          landlord_id: string
          landlord_name: string
          lease_start_date?: string | null
          notice_date: string
          notice_type: string
          property_address: string
          property_id: string
          sent_date?: string | null
          special_conditions?: string | null
          status?: string
          tenant_id: string
          tenant_name: string
          termination_date: string
          termination_reason?: string | null
          updated_at?: string
        }
        Update: {
          acknowledged_date?: string | null
          created_at?: string
          deposit_amount?: number | null
          deposit_return_date?: string | null
          deposit_returned?: boolean | null
          document_url?: string | null
          id?: string
          landlord_id?: string
          landlord_name?: string
          lease_start_date?: string | null
          notice_date?: string
          notice_type?: string
          property_address?: string
          property_id?: string
          sent_date?: string | null
          special_conditions?: string | null
          status?: string
          tenant_id?: string
          tenant_name?: string
          termination_date?: string
          termination_reason?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "lease_terminations_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          content: string
          created_at: string
          id: string
          property_id: string | null
          read: boolean | null
          recipient_id: string
          sender_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          property_id?: string | null
          read?: boolean | null
          recipient_id: string
          sender_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          property_id?: string | null
          read?: boolean | null
          recipient_id?: string
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          link: string | null
          message: string
          read: boolean
          read_at: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          link?: string | null
          message: string
          read?: boolean
          read_at?: string | null
          title: string
          type?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          link?: string | null
          message?: string
          read?: boolean
          read_at?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      payments: {
        Row: {
          amount: number
          auto_collect: boolean | null
          created_at: string
          currency: string | null
          description: string | null
          id: string
          next_collection_date: string | null
          payment_date: string | null
          payment_method: string | null
          property_id: string
          status: string | null
          stripe_payment_intent_id: string | null
          tenant_id: string
        }
        Insert: {
          amount: number
          auto_collect?: boolean | null
          created_at?: string
          currency?: string | null
          description?: string | null
          id?: string
          next_collection_date?: string | null
          payment_date?: string | null
          payment_method?: string | null
          property_id: string
          status?: string | null
          stripe_payment_intent_id?: string | null
          tenant_id: string
        }
        Update: {
          amount?: number
          auto_collect?: boolean | null
          created_at?: string
          currency?: string | null
          description?: string | null
          id?: string
          next_collection_date?: string | null
          payment_date?: string | null
          payment_method?: string | null
          property_id?: string
          status?: string | null
          stripe_payment_intent_id?: string | null
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          data_processing_consent: boolean | null
          email: string | null
          first_name: string | null
          gdpr_consent_date: string | null
          gdpr_consent_given: boolean | null
          id: string
          last_name: string | null
          marketing_consent: boolean | null
          phone: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          data_processing_consent?: boolean | null
          email?: string | null
          first_name?: string | null
          gdpr_consent_date?: string | null
          gdpr_consent_given?: boolean | null
          id: string
          last_name?: string | null
          marketing_consent?: boolean | null
          phone?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          data_processing_consent?: boolean | null
          email?: string | null
          first_name?: string | null
          gdpr_consent_date?: string | null
          gdpr_consent_given?: boolean | null
          id?: string
          last_name?: string | null
          marketing_consent?: boolean | null
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      properties: {
        Row: {
          amenities: string[] | null
          created_at: string
          currency: string | null
          description: string | null
          id: string
          images: string[] | null
          legal_status: Database["public"]["Enums"]["legal_status"] | null
          location: string
          name: string
          neighborhood_rating: number | null
          owner_id: string
          price: number
          rooms: number
          transport_score: number | null
          updated_at: string
        }
        Insert: {
          amenities?: string[] | null
          created_at?: string
          currency?: string | null
          description?: string | null
          id?: string
          images?: string[] | null
          legal_status?: Database["public"]["Enums"]["legal_status"] | null
          location: string
          name: string
          neighborhood_rating?: number | null
          owner_id: string
          price: number
          rooms: number
          transport_score?: number | null
          updated_at?: string
        }
        Update: {
          amenities?: string[] | null
          created_at?: string
          currency?: string | null
          description?: string | null
          id?: string
          images?: string[] | null
          legal_status?: Database["public"]["Enums"]["legal_status"] | null
          location?: string
          name?: string
          neighborhood_rating?: number | null
          owner_id?: string
          price?: number
          rooms?: number
          transport_score?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      property_diagnostics: {
        Row: {
          created_at: string
          diagnostics: Json
          id: string
          property_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          diagnostics?: Json
          id?: string
          property_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          diagnostics?: Json
          id?: string
          property_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "property_diagnostics_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: true
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      property_inspections: {
        Row: {
          completed: boolean | null
          created_at: string
          id: string
          inspection_data: Json | null
          landlord_signature_url: string | null
          landlord_signed_at: string | null
          notes: string | null
          property_id: string
          tenant_signature_url: string | null
          tenant_signed_at: string | null
          type: string
          user_id: string
          video_url: string | null
        }
        Insert: {
          completed?: boolean | null
          created_at?: string
          id?: string
          inspection_data?: Json | null
          landlord_signature_url?: string | null
          landlord_signed_at?: string | null
          notes?: string | null
          property_id: string
          tenant_signature_url?: string | null
          tenant_signed_at?: string | null
          type: string
          user_id: string
          video_url?: string | null
        }
        Update: {
          completed?: boolean | null
          created_at?: string
          id?: string
          inspection_data?: Json | null
          landlord_signature_url?: string | null
          landlord_signed_at?: string | null
          notes?: string | null
          property_id?: string
          tenant_signature_url?: string | null
          tenant_signed_at?: string | null
          type?: string
          user_id?: string
          video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "property_inspections_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      ratings: {
        Row: {
          comment: string | null
          contract_id: string
          created_at: string
          id: string
          rated_user_id: string
          rating: number
          reviewer_id: string
          updated_at: string
        }
        Insert: {
          comment?: string | null
          contract_id: string
          created_at?: string
          id?: string
          rated_user_id: string
          rating: number
          reviewer_id: string
          updated_at?: string
        }
        Update: {
          comment?: string | null
          contract_id?: string
          created_at?: string
          id?: string
          rated_user_id?: string
          rating?: number
          reviewer_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "ratings_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "contracts"
            referencedColumns: ["id"]
          },
        ]
      }
      rent_schedules: {
        Row: {
          active: boolean | null
          amount: number
          created_at: string
          currency: string
          day_of_month: number
          id: string
          landlord_id: string
          last_collection_date: string | null
          next_collection_date: string
          property_id: string
          stripe_customer_id: string | null
          stripe_payment_method_id: string | null
          tenant_id: string
          updated_at: string
        }
        Insert: {
          active?: boolean | null
          amount: number
          created_at?: string
          currency?: string
          day_of_month: number
          id?: string
          landlord_id: string
          last_collection_date?: string | null
          next_collection_date: string
          property_id: string
          stripe_customer_id?: string | null
          stripe_payment_method_id?: string | null
          tenant_id: string
          updated_at?: string
        }
        Update: {
          active?: boolean | null
          amount?: number
          created_at?: string
          currency?: string
          day_of_month?: number
          id?: string
          landlord_id?: string
          last_collection_date?: string | null
          next_collection_date?: string
          property_id?: string
          stripe_customer_id?: string | null
          stripe_payment_method_id?: string | null
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "rent_schedules_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      saved_searches: {
        Row: {
          created_at: string
          filters: Json
          id: string
          name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          filters: Json
          id?: string
          name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          filters?: Json
          id?: string
          name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      tenant_applications: {
        Row: {
          bank_statement_url: string | null
          co_signer_income: number | null
          created_at: string
          expires_at: string | null
          government_id_url: string | null
          id: string
          income: number | null
          income_proof_url: string | null
          match_score: number | null
          move_in_date: string | null
          profession: string | null
          property_id: string
          rental_history: string | null
          risk_level: string | null
          status: string | null
          updated_at: string
          user_id: string
          verified: boolean | null
        }
        Insert: {
          bank_statement_url?: string | null
          co_signer_income?: number | null
          created_at?: string
          expires_at?: string | null
          government_id_url?: string | null
          id?: string
          income?: number | null
          income_proof_url?: string | null
          match_score?: number | null
          move_in_date?: string | null
          profession?: string | null
          property_id: string
          rental_history?: string | null
          risk_level?: string | null
          status?: string | null
          updated_at?: string
          user_id: string
          verified?: boolean | null
        }
        Update: {
          bank_statement_url?: string | null
          co_signer_income?: number | null
          created_at?: string
          expires_at?: string | null
          government_id_url?: string | null
          id?: string
          income?: number | null
          income_proof_url?: string | null
          match_score?: number | null
          move_in_date?: string | null
          profession?: string | null
          property_id?: string
          rental_history?: string | null
          risk_level?: string | null
          status?: string | null
          updated_at?: string
          user_id?: string
          verified?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "tenant_applications_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      transaction_fees: {
        Row: {
          application_id: string | null
          contract_id: string | null
          created_at: string
          description: string | null
          fee_amount: number
          fee_percentage: number
          gross_amount: number
          id: string
          net_amount: number
          transaction_type: string
        }
        Insert: {
          application_id?: string | null
          contract_id?: string | null
          created_at?: string
          description?: string | null
          fee_amount: number
          fee_percentage: number
          gross_amount: number
          id?: string
          net_amount: number
          transaction_type: string
        }
        Update: {
          application_id?: string | null
          contract_id?: string | null
          created_at?: string
          description?: string | null
          fee_amount?: number
          fee_percentage?: number
          gross_amount?: number
          id?: string
          net_amount?: number
          transaction_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "transaction_fees_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "tenant_applications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transaction_fees_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "contracts"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      expire_old_applications: { Args: never; Returns: undefined }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "landlord" | "tenant"
      incident_category:
        | "maintenance"
        | "payment"
        | "dispute"
        | "legal"
        | "safety"
        | "communication"
        | "other"
      incident_priority: "low" | "medium" | "high" | "critical"
      incident_status: "open" | "investigating" | "resolved" | "closed"
      legal_status: "compliant" | "pending" | "non_compliant"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "landlord", "tenant"],
      incident_category: [
        "maintenance",
        "payment",
        "dispute",
        "legal",
        "safety",
        "communication",
        "other",
      ],
      incident_priority: ["low", "medium", "high", "critical"],
      incident_status: ["open", "investigating", "resolved", "closed"],
      legal_status: ["compliant", "pending", "non_compliant"],
    },
  },
} as const
