import { useMutation, useQueryClient } from "@tanstack/react-query"
import { updateVisit } from "../../services/apiVisits"

export default function useUpdateVisit() {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: ({ id, ...values }) => updateVisit(id, values),
        onSuccess: (data) => {
            qc.invalidateQueries({ queryKey: ["visit", data.id] })
            qc.invalidateQueries({ queryKey: ["visits"], exact: false })
            // Also invalidate dashboard stats if needed
            qc.invalidateQueries({ queryKey: ["dashboardStats"] })
        },
    })
}