import supabase from "./services/supabase";

// Simple test function to check what's happening with our queries
export async function testDashboardQueries() {
  try {
    // Get current user's clinic_id
    const { data: { session } } = await supabase.auth.getSession();
    console.log("Session:", session);
    
    if (!session) {
      console.log("Not authenticated");
      return;
    }

    console.log("User ID:", session.user.id);

    // Try to get user data with more details
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("*")
      .eq("user_id", session.user.id)
      .single();

    console.log("Full user data:", userData);
    console.log("User error:", userError);

    if (!userData?.clinic_id) {
      console.log("User has no clinic assigned");
      // Try to get clinic data directly
      const { data: clinics, error: clinicsError } = await supabase
        .from("clinics")
        .select("*");
      
      console.log("All clinics:", clinics);
      console.log("Clinics error:", clinicsError);
      
      return;
    }

    const clinicId = userData.clinic_id;
    console.log("Clinic ID:", clinicId);

    // Test 1: Get all appointments for this clinic
    const { data: allAppointments, error: allAppointmentsError } = await supabase
      .from("appointments")
      .select("*")
      .eq("clinic_id", clinicId)
      .limit(5);

    console.log("All appointments:", allAppointments);
    console.log("All appointments error:", allAppointmentsError);

    // Test 2: Get today's date range
    const today = new Date();
    const startOfDay = new Date(Date.UTC(today.getFullYear(), today.getMonth(), today.getDate()));
    const endOfDay = new Date(Date.UTC(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59, 999));

    console.log("Today's date range:", startOfDay.toISOString(), "to", endOfDay.toISOString());

    // Test 3: Try to get today's appointments with different approaches
    const { data: todayAppointments1, error: todayAppointmentsError1 } = await supabase
      .from("appointments")
      .select("*")
      .eq("clinic_id", clinicId)
      .gte("date", startOfDay.toISOString())
      .lte("date", endOfDay.toISOString());

    console.log("Today's appointments (method 1):", todayAppointments1);
    console.log("Today's appointments error (method 1):", todayAppointmentsError1);

    // Test 4: Try a different approach - get appointments without date filter
    const { count: totalCount, error: totalCountError } = await supabase
      .from("appointments")
      .select("*", { count: "exact", head: true })
      .eq("clinic_id", clinicId);

    console.log("Total appointments count:", totalCount);
    console.log("Total appointments error:", totalCountError);

    // Test 5: Try to get patients
    const { count: totalPatients, error: patientsError } = await supabase
      .from("patients")
      .select("*", { count: "exact", head: true })
      .eq("clinic_id", clinicId);

    console.log("Total patients count:", totalPatients);
    console.log("Total patients error:", patientsError);

    // Test 6: Try to get today's appointments count
    const { count: todayCount, error: todayCountError } = await supabase
      .from("appointments")
      .select("*", { count: "exact", head: true })
      .eq("clinic_id", clinicId)
      .gte("date", startOfDay.toISOString())
      .lte("date", endOfDay.toISOString());

    console.log("Today's appointments count:", todayCount);
    console.log("Today's appointments count error:", todayCountError);

  } catch (error) {
    console.error("Test error:", error);
  }
}