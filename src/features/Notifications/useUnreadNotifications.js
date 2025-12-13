import { useState, useEffect } from "react";
import supabase from "../../services/supabase";

export function useUnreadNotifications() {
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let channel;

    const fetchUnreadCount = async () => {
      try {
        // Get current user
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          setLoading(false);
          return;
        }

        // Get user's clinic_id
        const { data: userData, error: userError } = await supabase
          .from("users")
          .select("clinic_id")
          .eq("user_id", session.user.id)
          .single();

        if (userError || !userData?.clinic_id) {
          setLoading(false);
          return;
        }

        // Get initial unread count
        const { count, error } = await supabase
          .from("notifications")
          .select("*", { count: "exact", head: true })
          .eq("clinic_id", userData.clinic_id)
          .eq("is_read", false);

        if (!error) {
          setUnreadCount(count || 0);
        }
        setLoading(false);

        // Set up real-time subscription for unread count
        channel = supabase
          .channel('unread-notifications-count')
          .on(
            'postgres_changes',
            {
              event: 'INSERT',
              schema: 'public',
              table: 'notifications',
              filter: `clinic_id=eq.${userData.clinic_id}`
            },
            (payload) => {
              // A new notification was inserted, increment count if it's unread
              if (payload.new && !payload.new.is_read) {
                setUnreadCount(prev => prev + 1);
              }
            }
          )
          .on(
            'postgres_changes',
            {
              event: 'UPDATE',
              schema: 'public',
              table: 'notifications',
              filter: `clinic_id=eq.${userData.clinic_id}`
            },
            (payload) => {
              // A notification was updated, adjust count based on read status change
              if (payload.old && payload.new) {
                const wasRead = payload.old.is_read;
                const isNowRead = payload.new.is_read;
                
                if (wasRead && !isNowRead) {
                  // Marked as unread
                  setUnreadCount(prev => prev + 1);
                } else if (!wasRead && isNowRead) {
                  // Marked as read
                  setUnreadCount(prev => Math.max(0, prev - 1));
                }
              }
            }
          )
          .on(
            'postgres_changes',
            {
              event: 'DELETE',
              schema: 'public',
              table: 'notifications',
              filter: `clinic_id=eq.${userData.clinic_id}`
            },
            (payload) => {
              // A notification was deleted, decrement count if it was unread
              if (payload.old && !payload.old.is_read) {
                setUnreadCount(prev => Math.max(0, prev - 1));
              }
            }
          )
          .subscribe((status) => {
            console.log('Real-time subscription status:', status);
          });

      } catch (error) {
        console.error("Error in useUnreadNotifications:", error);
        setLoading(false);
      }
    };

    fetchUnreadCount();

    // Cleanup subscription on unmount
    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, []);

  return { unreadCount, loading };
}