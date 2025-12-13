import supabase from "./supabase";

export async function createPatientPlan(payload) {
    // Get current user's clinic_id
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error("Not authenticated");

    const { data: userData } = await supabase
        .from("users")
        .select("clinic_id")
        .eq("user_id", session.user.id)
        .single();

    if (!userData?.clinic_id) throw new Error("User has no clinic assigned");

    // Add clinic_id to the patient plan data
    const patientPlanData = {
        ...payload,
        clinic_id: userData.clinic_id
    };

    const { data, error } = await supabase
        .from("patient_plans")
        .insert(patientPlanData)
        .select()
        .single();

    if (error) {
        console.error("Error creating patient plan:", error);
        throw error;
    }

    return data;
}

export async function getPatientPlan(planId) {
    // Get current user's clinic_id
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error("Not authenticated");

    const { data: userData } = await supabase
        .from("users")
        .select("clinic_id")
        .eq("user_id", session.user.id)
        .single();

    if (!userData?.clinic_id) throw new Error("User has no clinic assigned");

    const { data, error } = await supabase
        .from("patient_plans")
        .select(`
            id,
            total_sessions,
            completed_sessions,
            total_price,
            status,
            created_at,
            treatment_templates(name, session_count, session_price)
        `)
        .eq("clinic_id", userData.clinic_id)
        .eq("id", planId)
        .single();

    if (error) {
        console.error("Error fetching patient plan:", error);
        throw error;
    }
    return data;
}

export async function getPatientPlans(patientId) {
    // Get current user's clinic_id
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error("Not authenticated");

    const { data: userData } = await supabase
        .from("users")
        .select("clinic_id")
        .eq("user_id", session.user.id)
        .single();

    if (!userData?.clinic_id) throw new Error("User has no clinic assigned");

    const { data, error } = await supabase
        .from("patient_plans")
        .select(`
            id,
            total_sessions,
            completed_sessions,
            total_price,
            status,
            created_at,
            treatment_templates(name, session_count, session_price)
        `)
        .eq("clinic_id", userData.clinic_id)
        .eq("patient_id", patientId)
        .order("created_at", { ascending: false });

    if (error) {
        console.error("Error fetching patient plans:", error);
        throw error;
    }
    return data;
}

export async function updatePatientPlan(id, payload) {
    // Get current user's clinic_id
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error("Not authenticated");

    const { data: userData } = await supabase
        .from("users")
        .select("clinic_id")
        .eq("user_id", session.user.id)
        .single();

    if (!userData?.clinic_id) throw new Error("User has no clinic assigned");

    const { data, error } = await supabase
        .from("patient_plans")
        .update(payload)
        .eq("id", id)
        .eq("clinic_id", userData.clinic_id)
        .select()
        .single();

    if (error) {
        console.error("Error updating patient plan:", error);
        throw error;
    }
    return data;
}

export async function deletePatientPlan(id) {
    // Get current user's clinic_id
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error("Not authenticated");

    const { data: userData } = await supabase
        .from("users")
        .select("clinic_id")
        .eq("user_id", session.user.id)
        .single();

    if (!userData?.clinic_id) throw new Error("User has no clinic assigned");

    const { data, error } = await supabase
        .from("patient_plans")
        .delete()
        .eq("id", id)
        .eq("clinic_id", userData.clinic_id);

    if (error) {
        console.error("Error deleting patient plan:", error);
        throw error;
    }
    return data;
}