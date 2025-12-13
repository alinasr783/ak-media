import { useQuery } from "@tanstack/react-query"
import { getFilteredPatientStats } from "../../services/apiDashboard"

export default function useFilteredPatientStats(filter) {
    return useQuery({
        queryKey: ["filteredPatientStats", filter],
        queryFn: () => getFilteredPatientStats(filter),
        enabled: !!filter,
    })
}