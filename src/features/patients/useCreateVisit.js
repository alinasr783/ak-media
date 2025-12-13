import { useMutation, useQueryClient } from "@tanstack/react-query"
import toast from "react-hot-toast"
import { createVisit } from "../../services/apiVisits"

export default function useCreateVisit() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (visitData) => {
            console.log("useCreateVisit: Creating visit with data", visitData)
            return createVisit(visitData)
        },
        onSuccess: (data) => {
            console.log("useCreateVisit: Visit created successfully", data)
            // Invalidate visits queries to refresh the data
            queryClient.invalidateQueries({ queryKey: ["visits"] })
            toast.success("تم إضافة الكشف بنجاح")
        },
        onError: (error) => {
            console.error("useCreateVisit: Error creating visit", error)
            toast.error(error.message || "فشل في إضافة الكشف")
        },
    })
}