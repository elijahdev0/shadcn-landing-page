import { useState, useEffect, useCallback } from 'react';
import { supabase, UserProfile } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { type Event } from '@/types/guestlist';

export function useUserEvents(user: UserProfile | null) {
  const [userEvents, setUserEvents] = useState<Event[]>([]);
  const [loadingUserEvents, setLoadingUserEvents] = useState(true);

  const fetchUserEvents = useCallback(async () => {
    if (!user) {
      setUserEvents([]);
      setLoadingUserEvents(false);
      return;
    }
    setLoadingUserEvents(true);
    try {
      const { data, error } = await supabase
        .from('events')
        .select('id, name')
        .eq('user_id', user.id)
        .order('name', { ascending: true });
      if (error) throw error;
      setUserEvents(data || []);
    } catch (err: unknown) {
      console.error("Error fetching user events:", err);
      const errorMessage = err instanceof Error ? err.message : String(err);
      toast.error(`Failed to load your events: ${errorMessage}`);
    } finally {
      setLoadingUserEvents(false);
    }
  }, [user]);

  useEffect(() => {
    fetchUserEvents();
  }, [fetchUserEvents]);

  return { userEvents, loadingUserEvents, fetchUserEvents };
}