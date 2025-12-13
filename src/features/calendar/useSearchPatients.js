import { useQuery } from "@tanstack/react-query"
import { searchPatients } from "../../services/apiAppointments"

export default function useSearchPatients(searchTerm) {
    return useQuery({
        queryKey: ["patients-search", searchTerm],
        queryFn: () => searchPatients(searchTerm),
        enabled: searchTerm.trim().length >= 2,
        meta: {
            errorMessage: "فشل في البحث عن المرضى"
        }
    })
}
