import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { cancelActiveSubscription, createSubscription, getActiveSubscription } from "../../services/apiSubscriptions";
import toast from "react-hot-toast";
import { useAuth } from "./AuthContext";

export function useActiveSubscription(clinicId) {
    return useQuery({
        queryKey: ["activeSubscription", clinicId],
        queryFn: () => getActiveSubscription(clinicId),
        enabled: !!clinicId
    });
}

export function useCancelActiveSubscription() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (clinicId) => cancelActiveSubscription(clinicId),
        onSuccess: (_, clinicId) => {
            // Don't show success message as it's not necessary for the user
            queryClient.invalidateQueries(["activeSubscription", clinicId]);
        },
        onError: (error) => {
            // We don't show an error here because it's expected that there might not be an active subscription
            console.log("No active subscription to cancel or error cancelling:", error);
        }
    });
}

export function useCreateSubscription() {
    const queryClient = useQueryClient();
    const { user } = useAuth();

    return useMutation({
        mutationFn: async ({ clinicId, planId, planName, billingPeriod = 'monthly', amount, paymentMethod = 'card' }) => {
            // Create subscription directly without payment processing
            const subscriptionData = {
                clinicId: clinicId,
                planId: planId,
                billingPeriod: billingPeriod,
                amount: amount
            };

            const result = await createSubscription(subscriptionData);
            
            if (!result || result.error) {
                throw new Error(result?.error || "فشل في تفعيل الاشتراك");
            }

            // Return success result
            return {
                success: true,
                subscription: result
            };
        },
        onSuccess: (result) => {
            // Invalidate queries to refresh subscription data
            queryClient.invalidateQueries(["plan"]);
            queryClient.invalidateQueries(["activeSubscription"]);
            
            // Show success message
            toast.success("تم تفعيل الاشتراك بنجاح");
        },
        onError: (error) => {
            toast.error("فشل في تفعيل الاشتراك: " + error.message);
        }
    });
}