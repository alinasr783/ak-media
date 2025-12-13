import { useQuery } from "@tanstack/react-query"
import { getRecentActivity } from "../../services/apiDashboard"

export default function useRecentActivity(page = 1, pageSize = 5) {
    return useQuery({
        queryKey: ["recentActivity", page, pageSize],
        queryFn: () => getRecentActivity(page, pageSize),
    })
}