import { useMutation, useQueryClient } from "@tanstack/react-query"
import { updateSecretaryPermissions } from "../../services/apiAuth"
import toast from "react-hot-toast"

export default function useUpdateSecretaryPermissions() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ secretaryId, permissions }) => updateSecretaryPermissions(secretaryId, permissions),
        onSuccess: () => {
            toast.success("تم تحديث صلاحيات السكرتير بنجاح")
            // Invalidate relevant queries to refetch updated data
            queryClient.invalidateQueries(["clinicSecretaries"])
        },
        onError: (error) => {
            toast.error("حدث خطأ أثناء تحديث صلاحيات السكرتير: " + error.message)
        }
    })
}