import { useQuery } from "@tanstack/react-query"
import { getClinicById } from "../../services/apiClinic"

export default function useClinicById(clinicId) {
    return useQuery({
        queryKey: ["clinic", clinicId],
        queryFn: () => getClinicById(clinicId),
        enabled: !!clinicId,
        retry: false,
    })
}