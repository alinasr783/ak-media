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

      console.log('Setting up real-time subscription for clinic:', clinicId);

      const channel = supabase
        .channel(`online-bookings-${clinicId}`) // Unique channel per clinic
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'appointments',
            filter: `clinic_id=eq.${clinicId}`
          },
          async (payload) => {
            console.log('New appointment received:', payload);
            
            // Check if this is a booking (from = 'booking')
            if (payload.new.from !== 'booking') {
              console.log('Not a booking, ignoring');
              return;
            }

            // Fetch the complete appointment data with patient info
            try {
              const { data: completeData, error: fetchError } = await supabase
                .from('appointments')
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
                .eq('id', payload.new.id)
                .single();

              if (fetchError) {
                console.error('Error fetching complete appointment:', fetchError);
                return;
              }

              console.log('Complete appointment data:', completeData);

              // Add new booking to the top of the list
              setBookings(prev => {
                const newList = [completeData, ...prev];
                // Re-sort to maintain pending-first order
                return newList.sort((a, b) => {
                  if (a.status === "pending" && b.status !== "pending") return -1;
                  if (b.status === "pending" && a.status !== "pending") return 1;
                  return new Date(b.created_at) - new Date(a.created_at);
                });
              });
            } catch (err) {
              console.error('Error in INSERT handler:', err);
            }
          }
        )
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'appointments',
            filter: `clinic_id=eq.${clinicId}`
          },
          async (payload) => {
            console.log('Appointment updated:', payload);
            
            // Check if this is a booking
            if (payload.new.from !== 'booking') {
              return;
            }

            // Fetch the complete appointment data with patient info
            try {
              const { data: completeData, error: fetchError } = await supabase
                .from('appointments')
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
                .eq('id', payload.new.id)
                .single();

              if (fetchError) {
                console.error('Error fetching complete appointment:', fetchError);
                return;
              }

              // Update existing booking in the list
              setBookings(prev => {
                const index = prev.findIndex(item => item.id === payload.new.id);
                if (index !== -1) {
                  const newList = [...prev];
                  newList[index] = completeData;
                  // Re-sort to maintain pending-first order
                  return newList.sort((a, b) => {
                    if (a.status === "pending" && b.status !== "pending") return -1;
                    if (b.status === "pending" && a.status !== "pending") return 1;
                    return new Date(b.created_at) - new Date(a.created_at);
                  });
                }
                return prev;
              });
            } catch (err) {
              console.error('Error in UPDATE handler:', err);
            }
          }
        )
        .on(
          'postgres_changes',
          {
            event: 'DELETE',
            schema: 'public',
            table: 'appointments',
            filter: `clinic_id=eq.${clinicId}`
          },
          (payload) => {
            console.log('Appointment deleted:', payload);
            // Remove deleted booking from the list
            setBookings(prev => prev.filter(item => item.id !== payload.old.id));
          }
        )
        .subscribe((status) => {
          console.log('Subscription status:', status);
        });

      // Cleanup subscription on unmount
      return () => {
        console.log('Cleaning up subscription');
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