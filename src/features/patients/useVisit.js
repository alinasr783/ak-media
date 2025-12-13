import { useQuery } from "@tanstack/react-query"
import { getVisitById } from "../../services/apiVisits"

export default function useVisit(visitId) {
    return useQuery({
        queryKey: ["visit", visitId],
        queryFn: () => getVisitById(visitId),
        enabled: !!visitId,
    })
}