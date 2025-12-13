import { useQuery } from "@tanstack/react-query";
import { getPricingPlans } from "../../services/apiSettings";

export default function usePricingPlans() {
    return useQuery({
        queryKey: ["pricingPlans"],
        queryFn: getPricingPlans,
        meta: {
            errorMessage: "فشل في تحميل خطط التسعير"
        }
    });
}