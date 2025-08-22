import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Database = {
  public: {
    Tables: {
      user_profiles: {
        Row: {
          id: string;
          email: string;
          first_name: string | null;
          last_name: string | null;
          phone_number: string | null;
          role: 'admin' | 'manager' | 'worker';
          business_id: string | null;
          onboarding_completed: boolean;
          trial_start_date: string;
          trial_end_date: string;
          status: 'active' | 'on_break' | 'off' | 'inactive';
          last_activity: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          first_name?: string | null;
          last_name?: string | null;
          phone_number?: string | null;
          role?: 'admin' | 'manager' | 'worker';
          business_id?: string | null;
          onboarding_completed?: boolean;
          trial_start_date?: string;
          trial_end_date?: string;
          status?: 'active' | 'on_break' | 'off' | 'inactive';
          last_activity?: string;
        };
        Update: {
          first_name?: string | null;
          last_name?: string | null;
          phone_number?: string | null;
          business_id?: string | null;
          onboarding_completed?: boolean;
          status?: 'active' | 'on_break' | 'off' | 'inactive';
          last_activity?: string;
        };
      };
      businesses: {
        Row: {
          id: string;
          company_name: string | null;
          industry: string | null;
          website: string | null;
          team_size: string | null;
          time_in_business: string | null;
          estimated_revenue: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          company_name?: string | null;
          industry?: string | null;
          website?: string | null;
          team_size?: string | null;
          time_in_business?: string | null;
          estimated_revenue?: string | null;
        };
        Update: {
          company_name?: string | null;
          industry?: string | null;
          website?: string | null;
          team_size?: string | null;
          time_in_business?: string | null;
          estimated_revenue?: string | null;
        };
      };
      time_entries: {
        Row: {
          id: string;
          user_id: string;
          business_id: string;
          clock_in_time: string;
          clock_out_time: string | null;
          break_start_time: string | null;
          break_end_time: string | null;
          total_break_minutes: number;
          location_clock_in: string | null;
          location_clock_out: string | null;
          job_site: string | null;
          notes: string | null;
          status: 'active' | 'on_break' | 'completed';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          business_id: string;
          clock_in_time?: string;
          clock_out_time?: string | null;
          break_start_time?: string | null;
          break_end_time?: string | null;
          total_break_minutes?: number;
          location_clock_in?: string | null;
          location_clock_out?: string | null;
          job_site?: string | null;
          notes?: string | null;
          status?: 'active' | 'on_break' | 'completed';
        };
        Update: {
          clock_out_time?: string | null;
          break_start_time?: string | null;
          break_end_time?: string | null;
          total_break_minutes?: number;
          location_clock_out?: string | null;
          notes?: string | null;
          status?: 'active' | 'on_break' | 'completed';
        };
      };
      clients: {
        Row: {
          id: string;
          first_name: string;
          last_name: string | null;
          business_name: string | null;
          email: string | null;
          phone_number: string;
          street_address: string;
          city: string;
          state: string;
          zip_code: string;
          notes: string | null;
          client_type: 'residential' | 'commercial' | 'municipal' | 'other';
          lead_source: string | null;
          status: 'active' | 'prospect' | 'inactive';
          created_by: string;
          business_id: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          first_name: string;
          last_name?: string | null;
          business_name?: string | null;
          email?: string | null;
          phone_number: string;
          street_address: string;
          city: string;
          state: string;
          zip_code: string;
          notes?: string | null;
          client_type?: 'residential' | 'commercial' | 'municipal' | 'other';
          lead_source?: string | null;
          status?: 'active' | 'prospect' | 'inactive';
          created_by: string;
          business_id: string;
        };
        Update: {
          first_name?: string;
          last_name?: string | null;
          business_name?: string | null;
          email?: string | null;
          phone_number?: string;
          street_address?: string;
          city?: string;
          state?: string;
          zip_code?: string;
          notes?: string | null;
          client_type?: 'residential' | 'commercial' | 'municipal' | 'other';
          lead_source?: string | null;
          status?: 'active' | 'prospect' | 'inactive';
        };
      };
      jobs: {
        Row: {
          id: string;
          title: string;
          description: string | null;
          client_id: string;
          business_id: string;
          created_by: string;
          status: string;
          priority: 'low' | 'medium' | 'high';
          scheduled_date: string | null;
          scheduled_time: string | null;
          estimated_duration: number;
          estimated_cost: number;
          actual_cost: number | null;
          notes: string | null;
          assigned_worker_id: string | null;
          completion_date: string | null;
          metadata: Record<string, any>;
          attachments: any[];
          checklist: any[];
          invoice_id: string | null;
          is_recurring: boolean;
          parent_job_id: string | null;
          recurrence_pattern: Record<string, any> | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description?: string | null;
          client_id: string;
          business_id: string;
          created_by: string;
          status?: string;
          priority?: 'low' | 'medium' | 'high';
          scheduled_date?: string | null;
          scheduled_time?: string | null;
          estimated_duration?: number;
          estimated_cost?: number;
          actual_cost?: number | null;
          notes?: string | null;
          assigned_worker_id?: string | null;
          completion_date?: string | null;
          metadata?: Record<string, any>;
          attachments?: any[];
          checklist?: any[];
          invoice_id?: string | null;
          is_recurring?: boolean;
          parent_job_id?: string | null;
          recurrence_pattern?: Record<string, any> | null;
        };
        Update: {
          title?: string;
          description?: string | null;
          client_id?: string;
          status?: string;
          priority?: 'low' | 'medium' | 'high';
          scheduled_date?: string | null;
          scheduled_time?: string | null;
          estimated_duration?: number;
          estimated_cost?: number;
          actual_cost?: number | null;
          notes?: string | null;
          assigned_worker_id?: string | null;
          completion_date?: string | null;
          metadata?: Record<string, any>;
          attachments?: any[];
          checklist?: any[];
          invoice_id?: string | null;
          is_recurring?: boolean;
          parent_job_id?: string | null;
          recurrence_pattern?: Record<string, any> | null;
        };
      };
    };
      job_service_items: {
      Row: {
        id: string;
        job_id: string;
        business_id: string;
        item_name: string;
        quantity: number;
        unit_cost: number | null;
        unit_price: number;
        description: string | null;
        total: number;
        sort_order: number;
        created_at: string;
        updated_at: string;
      };
      Insert: {
        id?: string;
        job_id: string;
        business_id: string;
        item_name: string;
        quantity?: number;
        unit_cost?: number | null;
        unit_price: number;
        description?: string | null;
        sort_order?: number;
      };
      Update: {
        item_name?: string;
        quantity?: number;
        unit_cost?: number | null;
        unit_price?: number;
        description?: string | null;
        sort_order?: number;
      };
    };
  };
};