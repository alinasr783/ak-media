// Test PATCH Request - Ready for Execution
// This demonstrates the corrected approach

// CORRECTED APPROACH - Use clinic_uuid instead of clinic_id
await supabase.from('clinics')
  .update({ online_booking_enabled: true })
  .eq('clinic_uuid', '7cf3a2a3-ee02-4a21-934f-be27f0e20d8f')
  .select();

// Alternative using fetch API
const response = await fetch(
  'https://hvbjysojjrdkszuvczbc.supabase.co/rest/v1/clinics?clinic_uuid=eq.7cf3a2a3-ee02-4a21-934f-be27f0e20d8f&select=*',
  {
    method: 'PATCH',
    headers: {
      'apikey': 'your-anon-key',
      'Authorization': 'Bearer your-access-token',
      'Content-Type': 'application/json',
      'Prefer': 'return=representation'
    },
    body: JSON.stringify({
      online_booking_enabled: true
    })
  }
);

const data = await response.json();
console.log('Patch response:', data);