import { useQuery } from "@tanstack/react-query";
import { getPatientPlan } from "../../services/apiPatientPlans";

export default function usePatientPlan(planId) {
    return useQuery({
        queryKey: ["patientPlan", planId],
        queryFn: () => getPatientPlan(planId),
        enabled: !!planId,
    });
}