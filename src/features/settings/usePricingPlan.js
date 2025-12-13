import { useQuery } from "@tanstack/react-query";
import { getPricingPlanById } from "../../services/apiSettings";

export default function usePricingPlan(id) {
    return useQuery({
        queryKey: ["pricingPlan", id],
        queryFn: () => getPricingPlanById(id),
        meta: {
            errorMessage: "فشل في تحميل تفاصيل الخطة"
        },
        enabled: !!id
    });
}