import { useQuery } from "@tanstack/react-query"
import { getAppointments } from "../../services/apiAppointments"

export default function useAppointments(search, page, pageSize = 10, filters = {}) {
    return useQuery({
        queryKey: ["appointments", search, page, pageSize, filters],
        queryFn: () => getAppointments(search, page, pageSize, filters),
        meta: {
            errorMessage: "فشل في تحميل المواعيد"
        }
    })
}