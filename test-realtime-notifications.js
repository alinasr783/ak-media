// Test script to verify real-time notifications functionality
import supabase from './src/services/supabase.js';

async function testRealtimeNotifications() {
  console.log('Testing real-time notifications...');
  
  try {
    // Get current user session
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      console.log('No active session');
      return;
    }
    
    console.log('Current user session:', session.user.id);
    
    // Get user's clinic_id
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("clinic_id")
      .eq("user_id", session.user.id)
      .single();
      
    if (userError || !userData?.clinic_id) {
      console.log('Error getting user data:', userError);
      return;
    }
    
    console.log('User clinic_id:', userData.clinic_id);
    
    // Set up real-time subscription
    const channel = supabase
      .channel('test-notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `clinic_id=eq.${userData.clinic_id}`
        },
        (payload) => {
          console.log('New notification received:', payload);
        }
      )
      .subscribe((status) => {
        console.log('Subscription status:', status);
      });
      
    console.log('Subscription set up, waiting for notifications...');
    
    // Keep the script running for a while to test
    setTimeout(() => {
      console.log('Test completed');
      supabase.removeChannel(channel);
    }, 30000);
    
  } catch (error) {
    console.error('Error in test:', error);
  }
}

testRealtimeNotifications();