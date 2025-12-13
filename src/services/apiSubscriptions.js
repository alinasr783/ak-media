import supabase from "./supabase";

export async function getPlanById(planId) {
    const { data, error } = await supabase
        .from('plan_pricing')
        .select('*')
        .eq('id', planId)
        .single();

    if (error) {
        if (error.code === "PGRST116") {
            throw new Error("الخطة غير موجودة");
        }
        throw error;
    }

    return data;
}

export async function getActiveSubscription(clinicId) {
    const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('clinic_id', clinicId)
        .eq('status', 'active')
        .single();

    if (error) {
        // If no active subscription found, return null
        if (error.code === "PGRST116") {
            return null;
        }
        throw error;
    }

    return data;
}

// Get the most recent subscription for a clinic (regardless of status)
export async function getMostRecentSubscription(clinicId) {
    const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('clinic_id', clinicId)
        .order('current_period_end', { ascending: false })
        .limit(1)
        .single();

    if (error) {
        // If no subscription found, return null
        if (error.code === "PGRST116") {
            return null;
        }
        throw error;
    }

    return data;
}

export async function cancelActiveSubscription(clinicId) {
    // First, get the active subscription
    const activeSubscription = await getActiveSubscription(clinicId);

    if (!activeSubscription) {
        // No active subscription to cancel
        return null;
    }

    // Update the subscription status to cancelled
    const { data, error } = await supabase
        .from('subscriptions')
        .update({ status: 'cancelled' })
        .eq('id', activeSubscription.id)
        .eq('clinic_id', clinicId)
        .select()
        .single();

    if (error) throw error;

    return data;
}

// Deactivate a specific subscription by ID
export async function deactivateSubscription(subscriptionId) {
    const { data, error } = await supabase
        .from('subscriptions')
        .update({ status: 'inactive' })
        .eq('id', subscriptionId)
        .select()
        .single();

    if (error) throw error;

    return data;
}

export async function createSubscription({ clinicId, planId, billingPeriod = 'monthly', amount }) {
    // First, get the most recent subscription to check if it's expired
    const mostRecentSubscription = await getMostRecentSubscription(clinicId);
    
    // If there's a recent subscription and it's active, we need to deactivate it
    if (mostRecentSubscription && mostRecentSubscription.status === 'active') {
        await deactivateSubscription(mostRecentSubscription.id);
    }
    
    // Calculate subscription period based on billing type
    const now = new Date();
    const currentPeriodStart = now.toISOString();
    const currentPeriodEnd = new Date(now);
    
    if (billingPeriod === 'annual') {
        currentPeriodEnd.setFullYear(currentPeriodEnd.getFullYear() + 1);
    } else {
        currentPeriodEnd.setMonth(currentPeriodEnd.getMonth() + 1);
    }

    const { data, error } = await supabase
        .from('subscriptions')
        .insert({
            clinic_id: clinicId,
            plan_id: planId,
            status: 'active',
            current_period_start: currentPeriodStart,
            current_period_end: currentPeriodEnd.toISOString(),
            billing_period: billingPeriod,
            amount: amount
        })
        .select()
        .single();

    if (error) throw error;

    return data;
}