'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { User } from '@supabase/supabase-js';
import type { UserRole } from '@whats-poppin/shared';
import { getSupabaseBrowserClient } from './supabase/client';

export interface Profile {
  id: string;
  role: UserRole;
  display_name: string | null;
  home_city_id: number | null;
  favorite_categories: string[];
  notify_saved_ending: boolean;
  notify_new_nearby: boolean;
}

interface AuthValue {
  /** Signed in with an email (anonymous "save without sign-up" sessions don't count). */
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  isAdmin: boolean;
  refreshProfile: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const loadProfile = useCallback(async (u: User | null) => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase || !u) {
      setProfile(null);
      return;
    }
    const { data } = await supabase.from('profiles').select('*').eq('id', u.id).maybeSingle();
    setProfile((data as Profile | null) ?? null);
  }, []);

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      setLoading(false);
      return;
    }
    const apply = async (u: User | null) => {
      const real = u && !u.is_anonymous ? u : null;
      setUser(real);
      await loadProfile(real);
      setLoading(false);
    };
    void supabase.auth.getUser().then(({ data }) => apply(data.user));
    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      void apply(session?.user ?? null);
      // Bring this browser's saved pop-ups into the signed-in account (and back).
      if (event === 'SIGNED_IN') void import('./saved-sync').then((m) => m.syncSaved());
    });
    return () => sub.subscription.unsubscribe();
  }, [loadProfile]);

  const value = useMemo<AuthValue>(
    () => ({
      user,
      profile,
      loading,
      isAdmin: profile?.role === 'admin',
      refreshProfile: () => loadProfile(user),
      signOut: async () => {
        await getSupabaseBrowserClient()?.auth.signOut();
        setUser(null);
        setProfile(null);
      },
    }),
    [user, profile, loading, loadProfile],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
