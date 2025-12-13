import { useMutation, useQueryClient } from "@tanstack/react-query"
import { updateClinic } from "../../services/apiClinic"
import toast from "react-hot-toast"

export default function useUpdateClinic() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: updateClinic,
        onSuccess: () => {
            toast.success("تم تحديث بيانات العيادة بنجاح")
            // Invalidate and refetch clinic data
            queryClient.invalidateQueries(["clinic"])
        },
        onError: (error) => {
            toast.error("حدث خطأ أثناء تحديث بيانات العيادة: " + error.message)
        }
    })
}