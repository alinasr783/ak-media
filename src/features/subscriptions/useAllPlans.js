import { useQuery } from "@tanstack/react-query";
import { getPricingPlans } from "../../services/apiSettings";

export default function useAllPlans() {
    return useQuery({
        queryKey: ["plans"],
        queryFn: getPricingPlans,
        staleTime: 1000 * 60 * 30, // 30 minutes
    });
}