import supabase from "./supabase"

export async function getPatients(search, page, pageSize) {
  // Get current user's clinic_id
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) throw new Error("Not authenticated")

  const { data: userData } = await supabase
    .from("users")
    .select("clinic_id")
    .eq("user_id", session.user.id)
    .single()

  if (!userData?.clinic_id) throw new Error("User has no clinic assigned")


  const from = Math.max(0, (page - 1) * pageSize)
  const to = from + pageSize - 1
  let query = supabase
    .from("patients")
    .select("id,name,phone,gender,address,date_of_birth,age,blood_type", { count: "exact" })
    .eq("clinic_id", userData.clinic_id)
    .order("created_at", { ascending: false })
    .range(from, to)
  if (search && search.trim()) {
    const s = `%${search.trim()}%`
    query = query.or(`name.ilike.${s},phone.ilike.${s}`)
  }
  const { data, error, count } = await query
  if (error) throw error
  return { items: data ?? [], total: count ?? 0 }
}

export async function createPatient(payload) {
  // Get current user's clinic_id
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) throw new Error("Not authenticated")

  const { data: userData } = await supabase
    .from("users")
    .select("clinic_id")
    .eq("user_id", session.user.id)
    .single()

  if (!userData?.clinic_id) throw new Error("User has no clinic assigned")

  // get clinic subscription plan
  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('*, plans(limits)')
    .eq('clinic_id', userData.clinic_id)
    .eq('status', 'active')
    .single()

  if (!subscription) throw new Error("لا يوجد اشتراك مفعل")

  const maxPatients = subscription.plans.limits.max_patients
  const periodStart = subscription.current_period_start

  // 3. احسب عدد المرضى المضافين في الشهر الحالي فقط
  if (maxPatients !== -1) {
    const { count } = await supabase
      .from('patients')
      .select('*', { count: 'exact', head: true })
      .eq('clinic_id', userData.clinic_id)
      .gte('created_at', periodStart) // أهم شرط: أكبر من أو يساوي تاريخ بداية الباقة

    // 4. المقارنة الحاسمة
    if (count >= maxPatients) {
      throw new Error("لقد تجاوزت الحد المسموح من المرضى لهذا الشهر. يرجى ترقية الباقة.")
    }
  }
  // Add clinic_id to the patient data
  const patientData = {
    ...payload,
    clinic_id: payload.clinic_id || userData.clinic_id
  }

  const { data, error } = await supabase
    .from("patients")
    .insert(patientData)
    .select()
    .single()

  if (error) {
    console.error("Error creating patient:", error)
    throw error
  }
  return data
}

// New function for public booking - create patient without authentication
export async function createPatientPublic(payload) {
  // Convert clinic_id to BigInt for database operations if it exists
  const patientData = { ...payload }

  if (patientData.clinic_id) {
    // Keep clinic_id as string to avoid BigInt serialization issues
    patientData.clinic_id = patientData.clinic_id.toString()
  }

  // If age is provided, ensure it's an integer
  if (patientData.age) {
    patientData.age = parseInt(patientData.age, 10);
  }

  const { data, error } = await supabase
    .from("patients")
    .insert(patientData)
    .select()
    .single()

  if (error) {
    console.error("Error creating patient:", error)
    throw error
  }
  return data
}

export async function getPatientById(id) {
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
    .from("patients")
    .select("id,name,phone,gender,address,date_of_birth,age,blood_type")
    .eq("id", id)
    .eq("clinic_id", userData.clinic_id)
    .single()
  if (error) throw error
  return data
}

export async function updatePatient(id, payload) {
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
    .from("patients")
    .update(payload)
    .eq("id", id)
    .eq("clinic_id", userData.clinic_id)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function getPatientFinancialData(patientId) {
  // Get current user's clinic_id
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error("Not authenticated");

  const { data: userData } = await supabase
    .from("users")
    .select("clinic_id")
    .eq("user_id", session.user.id)
    .single();

  if (!userData?.clinic_id) throw new Error("User has no clinic assigned");

  // Get all appointments for this patient
  const { data: appointments, error: appointmentsError } = await supabase
    .from("appointments")
    .select(`
      id,
      price,
      status,
      created_at,
      date,
      notes
    `)
    .eq("clinic_id", userData.clinic_id)
    .eq("patient_id", patientId)
    .order("date", { ascending: false });

  if (appointmentsError) throw appointmentsError;

  // Calculate financial summary
  const completedAppointments = appointments.filter(app => app.status === 'completed');
  const totalAmount = completedAppointments.reduce((sum, appointment) => sum + (parseFloat(appointment.price) || 0), 0);
  const paidAmount = totalAmount; // In a real app, this would come from payment records
  const remainingAmount = 0; // In a real app, this would be calculated from unpaid appointments

  // Transform data for payment history
  const paymentHistory = completedAppointments.map(appointment => ({
    id: appointment.id,
    amount: parseFloat(appointment.price) || 0,
    date: appointment.date,
    method: "نقدي", // In a real app, this would come from payment records
    status: "مدفوع"
  }));

  return {
    totalAmount,
    paidAmount,
    remainingAmount,
    paymentHistory
  };
}
