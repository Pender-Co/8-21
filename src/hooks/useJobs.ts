import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export interface Job {
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
  // Joined data
  clients?: {
    first_name: string;
    last_name: string | null;
    business_name: string | null;
    email: string | null;
    phone_number: string;
    street_address: string;
    city: string;
    state: string;
    zip_code: string;
  };
  created_by_user?: {
    first_name: string | null;
    last_name: string | null;
    email: string;
  };
  assigned_worker_profile?: {
    first_name: string | null;
    last_name: string | null;
    email: string;
  };
  job_service_items?: Array<{
    id: string;
    item_name: string;
    quantity: number;
    unit_cost: number | null;
    unit_price: number;
    description: string | null;
    total: number;
    sort_order: number;
  }>;
}

export interface UseJobsReturn {
  jobs: Job[];
  loading: boolean;
  error: string | null;
  refreshJobs: () => Promise<void>;
  updateJobStatus: (jobId: string, newStatus: string) => Promise<void>;
  deleteJob: (jobId: string) => Promise<void>;
  createJob: (jobData: Partial<Job>) => Promise<Job>;
  updateJob: (jobId: string, updates: Partial<Job>) => Promise<void>;
}

export const useJobs = (): UseJobsReturn => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { profile } = useAuth();

  // Fetch jobs with related data
  const fetchJobs = useCallback(async () => {
    if (!profile?.business_id) return;

    setLoading(true);
    setError(null);

    try {
      console.log('🔵 Fetching jobs for business:', profile.business_id);

      const { data, error: fetchError } = await supabase
        .from('jobs')
        .select(`
          *,
          clients (
            first_name,
            last_name,
            business_name,
            email,
            phone_number,
            street_address,
            city,
            state,
            zip_code
          ),
          created_by_user:user_profiles!jobs_created_by_fkey (
            first_name,
            last_name,
            email
          ),
          assigned_worker_profile:user_profiles!jobs_assigned_worker_id_fkey (
            first_name,
            last_name,
            email
          ),
          job_service_items (
            id,
            item_name,
            quantity,
            unit_cost,
            unit_price,
            description,
            total,
            sort_order
          )
        `)
        .eq('business_id', profile.business_id)
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;

      console.log('🟢 Fetched jobs:', data?.length || 0);
      setJobs(data || []);
    } catch (err: any) {
      console.error('🔴 Error fetching jobs:', err);
      setError(err.message || 'Failed to load jobs');
    } finally {
      setLoading(false);
    }
  }, [profile?.business_id]);

  // Update job status
  const updateJobStatus = useCallback(async (jobId: string, newStatus: string) => {
    try {
      console.log('🔵 Updating job status:', { jobId, newStatus });

      const { error } = await supabase
        .from('jobs')
        .update({ 
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', jobId);

      if (error) throw error;

      console.log('🟢 Job status updated successfully');
      
      // Update local state
      setJobs(prevJobs => 
        prevJobs.map(job => 
          job.id === jobId 
            ? { ...job, status: newStatus, updated_at: new Date().toISOString() }
            : job
        )
      );
    } catch (err: any) {
      console.error('🔴 Error updating job status:', err);
      throw err;
    }
  }, []);

  // Delete job
  const deleteJob = useCallback(async (jobId: string) => {
    try {
      console.log('🔵 Deleting job:', jobId);

      const { error } = await supabase
        .from('jobs')
        .delete()
        .eq('id', jobId);

      if (error) throw error;

      console.log('🟢 Job deleted successfully');
      
      // Update local state
      setJobs(prevJobs => prevJobs.filter(job => job.id !== jobId));
    } catch (err: any) {
      console.error('🔴 Error deleting job:', err);
      throw err;
    }
  }, []);

  // Create job
  const createJob = useCallback(async (jobData: Partial<Job>): Promise<Job> => {
    if (!profile?.business_id) {
      throw new Error('No business ID available');
    }

    try {
      console.log('🔵 Creating job:', jobData);

      const { data, error } = await supabase
        .from('jobs')
        .insert({
          ...jobData,
          business_id: profile.business_id,
          status: jobData.status || 'scheduled'
        })
        .select(`
          *,
          clients (
            first_name,
            last_name,
            business_name,
            email,
            phone_number,
            street_address,
            city,
            state,
            zip_code
          ),
          created_by_user:user_profiles!jobs_created_by_fkey (
            first_name,
            last_name,
            email
          ),
          assigned_worker_profile:user_profiles!jobs_assigned_worker_id_fkey (
            first_name,
            last_name,
            email
          ),
          job_service_items (
            id,
            item_name,
            quantity,
            unit_cost,
            unit_price,
            description,
            total,
            sort_order
          )
        `)
        .single();

      if (error) throw error;

      console.log('🟢 Job created successfully:', data);
      
      // Update local state
      setJobs(prevJobs => [data, ...prevJobs]);
      
      return data;
    } catch (err: any) {
      console.error('🔴 Error creating job:', err);
      throw err;
    }
  }, [profile?.business_id]);

  // Update job
  const updateJob = useCallback(async (jobId: string, updates: Partial<Job>) => {
    try {
      console.log('🔵 Updating job:', { jobId, updates });

      const { error } = await supabase
        .from('jobs')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', jobId);

      if (error) throw error;

      console.log('🟢 Job updated successfully');
      
      // Refresh jobs to get updated data with relations
      await fetchJobs();
    } catch (err: any) {
      console.error('🔴 Error updating job:', err);
      throw err;
    }
  }, [fetchJobs]);

  // Set up real-time subscription
  useEffect(() => {
    if (!profile?.business_id) return;

    console.log('🔵 Setting up real-time subscription for jobs');

    const subscription = supabase
      .channel('jobs_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'jobs',
          filter: `business_id=eq.${profile.business_id}`
        },
        (payload) => {
          console.log('🔵 Real-time job update:', payload);
          
          // Refresh jobs when changes occur
          fetchJobs();
        }
      )
      .subscribe();

    return () => {
      console.log('🔵 Cleaning up real-time subscription');
      subscription.unsubscribe();
    };
  }, [profile?.business_id, fetchJobs]);

  // Initial fetch
  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  return {
    jobs,
    loading,
    error,
    refreshJobs: fetchJobs,
    updateJobStatus,
    deleteJob,
    createJob,
    updateJob
  };
};