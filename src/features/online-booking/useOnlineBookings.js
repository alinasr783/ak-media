import { useState, useEffect } from "react";
import supabase from "../../services/supabase";

export function useOnlineBookings(clinicId) {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Validate clinicId format - must be a valid UUID
    if (!clinicId) {
      setLoading(false);
      return;
    }

    // Simple UUID validation (format: xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx)
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(clinicId)) {
      console.error("Invalid clinic UUID format:", clinicId);
      setError("Invalid clinic ID format");
      setLoading(false);
      return;
    }

    const fetchBookings = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch initial bookings
        const { data, error } = await supabase
          .from("appointments")
          .select(`
            id,
            date,
            notes,
            price,
            status,
            from,
            patient:patients(id, name, phone),
            created_at
          `)
          .eq("clinic_id", clinicId) // clinicId should be a UUID
          .eq("from", "booking")
          .order("created_at", { ascending: false });

        if (error) throw error;

        // Sort to put pending first (as per existing logic)
        const sortedData = [...(data ?? [])].sort((a, b) => {
          if (a.status === "pending" && b.status !== "pending") return -1;
          if (b.status === "pending" && a.status !== "pending") return 1;
          return new Date(b.created_at) - new Date(a.created_at);
        });

        setBookings(sortedData);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching online bookings:", err);
        setError(err.message);
        setLoading(false);
      }
    };

    // Set up real-time subscription
    const setupSubscription = async () => {
      await fetchBookings();

      const channel = supabase
        .channel('online-bookings-changes')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'appointments',
            filter: `clinic_id=eq.${clinicId}&from=eq.booking`
          },
          (payload) => {
            // Add new booking to the top of the list
            setBookings(prev => {
              const newList = [payload.new, ...prev];
              // Re-sort to maintain pending-first order
              return newList.sort((a, b) => {
                if (a.status === "pending" && b.status !== "pending") return -1;
                if (b.status === "pending" && a.status !== "pending") return 1;
                return new Date(b.created_at) - new Date(a.created_at);
              });
            });
          }
        )
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'appointments',
            filter: `clinic_id=eq.${clinicId}&from=eq.booking`
          },
          (payload) => {
            // Update existing booking in the list
            setBookings(prev => {
              const index = prev.findIndex(item => item.id === payload.new.id);
              if (index !== -1) {
                const newList = [...prev];
                newList[index] = payload.new;
                // Re-sort to maintain pending-first order
                return newList.sort((a, b) => {
                  if (a.status === "pending" && b.status !== "pending") return -1;
                  if (b.status === "pending" && a.status !== "pending") return 1;
                  return new Date(b.created_at) - new Date(a.created_at);
                });
              }
              return prev;
            });
          }
        )
        .on(
          'postgres_changes',
          {
            event: 'DELETE',
            schema: 'public',
            table: 'appointments',
            filter: `clinic_id=eq.${clinicId}&from=eq.booking`
          },
          (payload) => {
            // Remove deleted booking from the list
            setBookings(prev => prev.filter(item => item.id !== payload.old.id));
          }
        )
        .subscribe();

      // Cleanup subscription on unmount
      return () => {
        supabase.removeChannel(channel);
      };
    };

    const unsubscribe = setupSubscription();

    return () => {
      if (typeof unsubscribe === 'function') {
        unsubscribe();
      }
    };
  }, [clinicId]);

  return { bookings, loading, error };
}