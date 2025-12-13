import { useQuery } from "@tanstack/react-query"
import { getDashboardStats } from "../../services/apiDashboard"

export default function useDashboardStats() {
    return useQuery({
        queryKey: ["dashboardStats"],
        queryFn: getDashboardStats,
    })
}
