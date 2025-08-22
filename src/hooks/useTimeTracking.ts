import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export interface TimeEntry {
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
}

export interface UseTimeTrackingReturn {
  currentEntry: TimeEntry | null;
  todayEntries: TimeEntry[];
  isClocked: boolean;
  onBreak: boolean;
  loading: boolean;
  error: string | null;
  clockIn: (location?: string, jobSite?: string) => Promise<void>;
  clockOut: (location?: string, notes?: string) => Promise<void>;
  startBreak: () => Promise<void>;
  endBreak: () => Promise<void>;
  refreshEntries: () => Promise<void>;
}

export const useTimeTracking = (): UseTimeTrackingReturn => {
  const [currentEntry, setCurrentEntry] = useState<TimeEntry | null>(null);
  const [todayEntries, setTodayEntries] = useState<TimeEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { user, profile } = useAuth();

  const isClocked = currentEntry !== null && currentEntry.status !== 'completed';
  const onBreak = currentEntry?.status === 'on_break';

  // Fetch today's entries and current active entry
  const refreshEntries = useCallback(async () => {
    if (!user || !profile?.business_id) return;

    setLoading(true);
    setError(null);

    try {
      const today = new Date().toISOString().split('T')[0];
      
      // Fetch today's entries
      const { data: entries, error: entriesError } = await supabase
        .from('time_entries')
        .select('*')
        .eq('user_id', user.id)
        .gte('clock_in_time', `${today}T00:00:00`)
        .lt('clock_in_time', `${today}T23:59:59`)
        .order('clock_in_time', { ascending: false });

      if (entriesError) throw entriesError;

      setTodayEntries(entries || []);

      // Find current active entry
      const activeEntry = entries?.find(entry => 
        entry.status === 'active' || entry.status === 'on_break'
      );
      
      setCurrentEntry(activeEntry || null);
    } catch (err) {
      console.error('Error fetching time entries:', err);
      setError('Failed to load time entries');
    } finally {
      setLoading(false);
    }
  }, [user, profile?.business_id]);

  // Clock in
  const clockIn = useCallback(async (location?: string, jobSite?: string) => {
    if (!user || !profile?.business_id) {
      setError('User not authenticated');
      return;
    }

    if (currentEntry && currentEntry.status !== 'completed') {
      setError('Already clocked in');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { data, error: insertError } = await supabase
        .from('time_entries')
        .insert({
          user_id: user.id,
          business_id: profile.business_id,
          location_clock_in: location || null,
          job_site: jobSite || null,
          status: 'active'
        })
        .select()
        .single();

      if (insertError) throw insertError;

      setCurrentEntry(data);
      
      // Update user status to active
      await supabase
        .from('user_profiles')
        .update({ 
          status: 'active',
          last_activity: new Date().toISOString()
        })
        .eq('id', user.id);
        
      await refreshEntries();
    } catch (err) {
      console.error('Error clocking in:', err);
      setError('Failed to clock in');
    } finally {
      setLoading(false);
    }
  }, [user, profile?.business_id, currentEntry, refreshEntries]);

  // Clock out
  const clockOut = useCallback(async (location?: string, notes?: string) => {
    if (!currentEntry) {
      setError('No active time entry');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // If on break, end the break first
      let breakMinutes = currentEntry.total_break_minutes;
      if (currentEntry.status === 'on_break' && currentEntry.break_start_time) {
        const breakDuration = Math.floor(
          (new Date().getTime() - new Date(currentEntry.break_start_time).getTime()) / (1000 * 60)
        );
        breakMinutes += breakDuration;
      }

      const { error: updateError } = await supabase
        .from('time_entries')
        .update({
          clock_out_time: new Date().toISOString(),
          location_clock_out: location || null,
          notes: notes || currentEntry.notes,
          status: 'completed',
          break_end_time: currentEntry.status === 'on_break' ? new Date().toISOString() : currentEntry.break_end_time,
          total_break_minutes: breakMinutes
        })
        .eq('id', currentEntry.id);

      if (updateError) throw updateError;

      // Update user status to off
      await supabase
        .from('user_profiles')
        .update({ 
          status: 'off',
          last_activity: new Date().toISOString()
        })
        .eq('id', user.id);
      setCurrentEntry(null);
      await refreshEntries();
    } catch (err) {
      console.error('Error clocking out:', err);
      setError('Failed to clock out');
    } finally {
      setLoading(false);
    }
  }, [currentEntry, refreshEntries]);

  // Start break
  const startBreak = useCallback(async () => {
    if (!currentEntry || currentEntry.status !== 'active') {
      setError('No active time entry or already on break');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { error: updateError } = await supabase
        .from('time_entries')
        .update({
          break_start_time: new Date().toISOString(),
          status: 'on_break'
        })
        .eq('id', currentEntry.id);

      if (updateError) throw updateError;

      // Update user status to on_break
      await supabase
        .from('user_profiles')
        .update({ 
          status: 'on_break',
          last_activity: new Date().toISOString()
        })
        .eq('id', user.id);
      await refreshEntries();
    } catch (err) {
      console.error('Error starting break:', err);
      setError('Failed to start break');
    } finally {
      setLoading(false);
    }
  }, [currentEntry, refreshEntries]);

  // End break
  const endBreak = useCallback(async () => {
    if (!currentEntry || currentEntry.status !== 'on_break' || !currentEntry.break_start_time) {
      setError('Not currently on break');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Calculate break duration
      const breakDuration = Math.floor(
        (new Date().getTime() - new Date(currentEntry.break_start_time).getTime()) / (1000 * 60)
      );

      const { error: updateError } = await supabase
        .from('time_entries')
        .update({
          break_end_time: new Date().toISOString(),
          total_break_minutes: currentEntry.total_break_minutes + breakDuration,
          status: 'active',
          break_start_time: null // Reset for next break
        })
        .eq('id', currentEntry.id);

      if (updateError) throw updateError;

      // Update user status back to active
      await supabase
        .from('user_profiles')
        .update({ 
          status: 'active',
          last_activity: new Date().toISOString()
        })
        .eq('id', user.id);
      await refreshEntries();
    } catch (err) {
      console.error('Error ending break:', err);
      setError('Failed to end break');
    } finally {
      setLoading(false);
    }
  }, [currentEntry, refreshEntries]);

  // Load entries on mount and when dependencies change
  useEffect(() => {
    refreshEntries();
  }, [refreshEntries]);

  return {
    currentEntry,
    todayEntries,
    isClocked,
    onBreak,
    loading,
    error,
    clockIn,
    clockOut,
    startBreak,
    endBreak,
    refreshEntries
  };
};