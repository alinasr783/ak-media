const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabaseUrl = 'https://hvbjysojjrdkszuvczbc.supabase.co';
const supabaseKey = process.env.SUPABASE_KEY; // You'll need to set this environment variable
const supabase = createClient(supabaseUrl, supabaseKey);

async function testNotifications() {
  try {
    console.log('Testing notifications table structure...');
    
    // Test 1: Check table structure
    const { data, error } = await supabase
      .from('notifications')
      .select('column_name, data_type')
      .eq('table_name', 'notifications');
    
    if (error) {
      console.error('Error checking table structure:', error);
    } else {
      console.log('Table structure:', data);
    }
    
    // Test 2: Try to query with quoted read column
    const { data: notificationsData, error: notificationsError } = await supabase
      .from('notifications')
      .select('id, title, message, type, "read", created_at, related_id')
      .limit(1);
    
    if (notificationsError) {
      console.error('Error querying with quoted read column:', notificationsError);
    } else {
      console.log('Query with quoted read column succeeded:', notificationsData);
    }
    
    // Test 3: Try to query without quoting read column
    const { data: notificationsData2, error: notificationsError2 } = await supabase
      .from('notifications')
      .select('id, title, message, type, read, created_at, related_id')
      .limit(1);
    
    if (notificationsError2) {
      console.error('Error querying without quoting read column:', notificationsError2);
    } else {
      console.log('Query without quoting read column succeeded:', notificationsData2);
    }
    
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

testNotifications();