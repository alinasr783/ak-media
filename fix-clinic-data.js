const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabaseUrl = 'https://hvbjysojjrdkszuvczbc.supabase.co';
const supabaseKey = process.env.SUPABASE_KEY; // You'll need to set this environment variable
const supabase = createClient(supabaseUrl, supabaseKey);

async function fixClinicData() {
  try {
    console.log('Checking if clinic exists...');
    
    // Check if clinic exists
    const { data: clinicData, error: clinicError } = await supabase
      .from('clinics')
      .select('*')
      .eq('clinic_id', '7cf3a2a3-ee02-4a21-934f-be27f0e20d8f')
      .single();
    
    if (clinicError && clinicError.code !== 'PGRST116') {
      console.error('Error checking clinic:', clinicError);
      return;
    }
    
    if (!clinicData) {
      console.log('Creating clinic record...');
      
      // Create clinic record
      const { data, error } = await supabase
        .from('clinics')
        .upsert({
          id: 'd7893b23-adac-436b-96ce-685242f1d019',
          clinic_id: '7cf3a2a3-ee02-4a21-934f-be27f0e20d8f',
          clinic_uuid: 'd7893b23-adac-436b-96ce-685242f1d019',
          name: 'عيادة الأمراض الجلدية',
          address: 'شارع الملك فهد، الرياض',
          booking_price: 150.00,
          online_booking_enabled: true
        })
        .select()
        .single();
        
      if (error) {
        console.error('Error creating clinic:', error);
        return;
      }
      
      console.log('Clinic created:', data);
    } else {
      console.log('Clinic already exists:', clinicData);
    }
    
    // Check if user is associated with clinic
    console.log('Checking user clinic association...');
    
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .limit(1);
      
    if (userError) {
      console.error('Error checking users:', userError);
      return;
    }
    
    console.log('Users found:', userData);
    
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

fixClinicData();