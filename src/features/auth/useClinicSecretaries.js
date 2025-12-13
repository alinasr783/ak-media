import { useQuery } from "@tanstack/react-query"
import { getClinicSecretaries } from "../../services/apiAuth"

export default function useClinicSecretaries(clinicId) {
    return useQuery({
        queryKey: ["clinicSecretaries", clinicId],
        queryFn: () => getClinicSecretaries(clinicId),
        enabled: !!clinicId,
    })
}