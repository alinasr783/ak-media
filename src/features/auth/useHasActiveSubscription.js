import { useQuery } from "@tanstack/react-query";
import { getCurrentPlan } from "../../services/apiPlan";

export default function useHasActiveSubscription() {
    return useQuery({
        queryKey: ["hasActiveSubscription"],
        queryFn: async () => {
            try {
                const planData = await getCurrentPlan();
                
                // Return true if user has an active subscription, false otherwise
                return !!planData;
            } catch (error) {
                console.error("Error checking active subscription:", error);
                // If there's an error, we assume no active subscription
                return false;
            }
        },
        staleTime: 5 * 60 * 1000, // 5 minutes
        cacheTime: 10 * 60 * 1000, // 10 minutes
    });
}