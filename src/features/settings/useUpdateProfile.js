import { useMutation, useQueryClient } from "@tanstack/react-query"
import { updateProfile } from "../../services/apiAuth"
import toast from "react-hot-toast"

export default function useUpdateProfile() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: updateProfile,
        onSuccess: () => {
            toast.success("تم تحديث البيانات الشخصية بنجاح")
            // Invalidate and refetch user data
            queryClient.invalidateQueries(["user"])
        },
        onError: (error) => {
            toast.error("حدث خطأ أثناء تحديث البيانات: " + error.message)
        }
    })
}