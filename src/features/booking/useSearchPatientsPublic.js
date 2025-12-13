import { useQuery } from "@tanstack/react-query"
import { searchPatientsPublic } from "../../services/apiAppointments"

export default function useSearchPatientsPublic(searchTerm, clinicId) {
    return useQuery({
        queryKey: ["patients-search-public", searchTerm, clinicId],
        queryFn: () => searchPatientsPublic(searchTerm, clinicId),
        enabled: !!searchTerm && !!clinicId && searchTerm.trim().length >= 10,
        meta: {
            errorMessage: "فشل في البحث عن المرضى"
        }
    })
}