'use client';

import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/lib/auth';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';

export interface Organizer {
  id: string;
  name: string;
  plan: 'free' | 'pro';
}

/** The signed-in user's business (first one), or null. */
export function useOrganizer() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['organizer', user?.id],
    enabled: !!user,
    queryFn: async () => {
      const supabase = getSupabaseBrowserClient()!;
      const { data, error } = await supabase.from('organizers').select('id, name, plan').eq('owner_id', user!.id).order('created_at').limit(1).maybeSingle();
      if (error) throw new Error(error.message);
      return (data as Organizer | null) ?? null;
    },
  });
}
