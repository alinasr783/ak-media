import supabase from "./supabase"

export async function getVisitsByPatientId(patientId) {
    // Get current user's clinic_id
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) throw new Error("Not authenticated")

    const { data: userData } = await supabase
        .from("users")
        .select("clinic_id")
        .eq("user_id", session.user.id)
        .single()

    if (!userData?.clinic_id) throw new Error("User has no clinic assigned")

    const { data, error } = await supabase
        .from("visits")
        .select(`
      id,
      patient_id,
      diagnosis,
      notes,
      medications,
      created_at
    `)
        .eq("clinic_id", userData.clinic_id)
        .eq("patient_id", patientId)
        .order("created_at", { ascending: false })

    if (error) throw error
    return data ?? []
}

export async function getVisitById(visitId) {
    // Get current user's clinic_id
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) throw new Error("Not authenticated")

    const { data: userData } = await supabase
        .from("users")
        .select("clinic_id")
        .eq("user_id", session.user.id)
        .single()

    if (!userData?.clinic_id) throw new Error("User has no clinic assigned")

    const { data, error } = await supabase
        .from("visits")
        .select(`
      id,
      patient_id,
      diagnosis,
      notes,
      medications,
      created_at,
      patient:patients(phone, name)
    `)
        .eq("id", visitId)
        .eq("clinic_id", userData.clinic_id)
        .single()

    if (error) throw error
    return data
}

export async function createVisit(payload) {
    console.log("apiVisits.createVisit: Received payload", payload)
    
    // Get current user's clinic_id
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) throw new Error("Not authenticated")

    const { data: userData } = await supabase
        .from("users")
        .select("clinic_id")
        .eq("user_id", session.user.id)
        .single()

    if (!userData?.clinic_id) throw new Error("User has no clinic assigned")

    // Add clinic_id to the visit data
    const visitData = {
        ...payload,
        clinic_id: userData.clinic_id
    }

    console.log("apiVisits.createVisit: Final visit data", visitData)

    const { data, error } = await supabase
        .from("visits")
        .insert(visitData)
        .select()
        .single()

    if (error) {
        console.error("apiVisits.createVisit: Error inserting visit", error)
        throw error
    }
    
    console.log("apiVisits.createVisit: Visit inserted successfully", data)
    return data
}

export async function updateVisit(id, payload) {
    // Get current user's clinic_id for security
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) throw new Error("Not authenticated")

    const { data: userData } = await supabase
        .from("users")
        .select("clinic_id")
        .eq("user_id", session.user.id)
        .single()

    if (!userData?.clinic_id) throw new Error("User has no clinic assigned")

    const { data, error } = await supabase
        .from("visits")
        .update(payload)
        .eq("id", id)
        .eq("clinic_id", userData.clinic_id)
        .select()
        .single()

    if (error) throw error
    return data
}

export async function deleteVisit(id) {
    // Get current user's clinic_id for security
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) throw new Error("Not authenticated")

    const { data: userData } = await supabase
        .from("users")
        .select("clinic_id")
        .eq("user_id", session.user.id)
        .single()

    if (!userData?.clinic_id) throw new Error("User has no clinic assigned")

    const { error } = await supabase
        .from("visits")
        .delete()
        .eq("id", id)
        .eq("clinic_id", userData.clinic_id)

    if (error) throw error
}