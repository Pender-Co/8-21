import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

interface UserProfile {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  phone_number: string | null;
  role: string;
  business_id: string | null;
  avatar_url: string | null;
  onboarding_completed: boolean;
  trial_start_date: string;
  trial_end_date: string;
  onboarding_step?: number | null;
}

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: any }>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (userId: string) => {
    console.log('🔵 Fetching profile for user:', userId);
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .limit(1);

      if (error) {
        console.error('🔴 Error fetching profile:', error);
        console.log('🟡 Profile fetch error - setting profile to null');
        setProfile(null);
        return;
      }

      if (data && data.length > 0) {
        console.log('🟢 Profile fetched successfully:', data[0]);
        setProfile(data[0]);
      } else {
        console.log('🟡 No profile found - user may need onboarding');
        setProfile(null);
      }
    } catch (error) {
      console.error('🔴 Unexpected error fetching profile:', error);
      setProfile(null);
    }
  };

  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user.id);
    }
  };

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        // Add timeout to prevent hanging
        Promise.race([
          fetchProfile(session.user.id),
          new Promise(resolve => setTimeout(resolve, 5000))
        ]).finally(() => {
          console.log('🔵 Initial profile fetch completed or timed out');
        });
      }
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔵 Auth state changed:', event, 'User:', session?.user?.email);
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          console.log('🔵 Auth state change - fetching profile for:', session.user.id);
          // Add timeout to prevent hanging
          await Promise.race([
            fetchProfile(session.user.id),
            new Promise(resolve => setTimeout(resolve, 5000))
          ]);
          console.log('🔵 Auth state change - profile fetch completed or timed out');
        } else {
          console.log('🔵 Auth state change - clearing profile');
          setProfile(null);
        }
        
        console.log('🔵 Auth state change - setting loading to false');
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
        data: {
          email: email
        }
      }
    });
    
    // If signup was successful but user needs to confirm email
    if (data.user && !data.session && !error) {
      // For development, we'll allow immediate access
      // In production, you might want to handle email confirmation
      return { error: null, user: data.user };
    }
    
    return { error, user: data.user };
  };

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    if (error) {
      return { error, success: false };
    }
    
    if (data.user) {
      // Fetch profile immediately after successful sign-in
      try {
        // Add timeout to prevent hanging
        await Promise.race([
          fetchProfile(data.user.id),
          new Promise(resolve => setTimeout(resolve, 5000))
        ]);
      } catch (error) {
        // Continue anyway - profile might not exist yet
      }
    }
    
    return { error: null, success: true };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`
    });
    return { error };
  };

  const value = {
    user,
    profile,
    session,
    loading,
    signUp,
    signIn,
    signOut,
    resetPassword,
    refreshProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};