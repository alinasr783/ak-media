// Test API Connection Script
// This script tests if the Supabase connection and queries are working

const { createClient } = supabase;

// Initialize Supabase client
const supabaseUrl = 'https://hvbjysojjrdkszuvczbc.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh2Ymp5c29qanJka3N6dXZjemJjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzI3OTQzMzgsImV4cCI6MjA0ODM3MDMzOH0.WXo6W1fY7hF6Z5x7p6x7p6x7p6x7p6x7p6x7p6x7p6x7';
const supabase = createClient(supabaseUrl, supabaseKey);

async function testClinicQuery() {
  console.log("Testing clinic query...");
  
  try {
    // Test 1: Query by clinic_id (UUID)
    console.log("Test 1: Querying by clinic_id (UUID)");
    const { data: data1, error: error1 } = await supabase
      .from("clinics")
      .select("*")
      .eq("clinic_id", "7cf3a2a3-ee02-4a21-934f-be27f0e20d8f")
      .single();
      
    if (error1) {
      console.log("Error querying by clinic_id:", error1);
    } else {
      console.log("Success querying by clinic_id:", data1);
    }
    
    // Test 2: Query by clinic_id_bigint (numeric)
    console.log("\nTest 2: Querying by clinic_id_bigint (numeric)");
    const { data: data2, error: error2 } = await supabase
      .from("clinics")
      .select("*")
      .eq("clinic_id_bigint", 659031876)
      .single();
      
    if (error2) {
      console.log("Error querying by clinic_id_bigint:", error2);
    } else {
      console.log("Success querying by clinic_id_bigint:", data2);
    }
    
    // Test 3: Check if online_booking_enabled column exists
    console.log("\nTest 3: Checking online_booking_enabled column");
    const { data: data3, error: error3 } = await supabase
      .from("clinics")
      .select("online_booking_enabled")
      .eq("clinic_id", "7cf3a2a3-ee02-4a21-934f-be27f0e20d8f")
      .single();
      
    if (error3) {
      console.log("Error checking online_booking_enabled:", error3);
    } else {
      console.log("online_booking_enabled column exists:", data3);
    }
    
    console.log("\n=== Test Complete ===");
    
  } catch (error) {
    console.error("Unexpected error:", error);
  }
}

// Run the test
testClinicQuery();