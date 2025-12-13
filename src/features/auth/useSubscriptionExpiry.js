import { useQuery } from "@tanstack/react-query";
import { getCurrentPlan } from "../../services/apiPlan";

export default function useSubscriptionExpiry() {
    return useQuery({
        queryKey: ["subscriptionExpiry"],
        queryFn: async () => {
            try {
                const planData = await getCurrentPlan();
                
                // If no plan data, user is on free plan which doesn't expire
                if (!planData) {
                    return {
                        isExpired: false,
                        daysRemaining: null,
                        expiryDate: null
                    };
                }
                
                // Check if subscription has expired
                const endDate = planData.current_period_end;
                if (!endDate) {
                    return {
                        isExpired: false,
                        daysRemaining: null,
                        expiryDate: null
                    };
                }
                
                const today = new Date();
                const end = new Date(endDate);
                const diffTime = end - today;
                const daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                
                // Subscription is expired if daysRemaining is negative
                const isExpired = daysRemaining < 0;
                
                return {
                    isExpired,
                    daysRemaining,
                    expiryDate: end
                };
            } catch (error) {
                // If there's an error fetching plan data, we assume no expiration issue
                console.error("Error checking subscription expiry:", error);
                return {
                    isExpired: false,
                    daysRemaining: null,
                    expiryDate: null
                };
            }
        },
        staleTime: 5 * 60 * 1000, // 5 minutes
        cacheTime: 10 * 60 * 1000, // 10 minutes
    });
}