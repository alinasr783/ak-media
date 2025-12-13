import { useMutation, useQueryClient } from "@tanstack/react-query"
import { logout } from "../../services/apiAuth"
import { useNavigate } from "react-router-dom"
import toast from "react-hot-toast"

export default function useLogout() {
    const queryClient = useQueryClient()
    const navigate = useNavigate()

    return useMutation({
        mutationFn: logout,
        onSuccess: () => {
            // Invalidate the user query and set it to null
            queryClient.setQueryData(["user"], null)
            queryClient.invalidateQueries({ queryKey: ["user"] })
            toast.success("تم تسجيل الخروج بنجاح")
            navigate("/", { replace: true })
        },
        onError: (error) => {
            toast.error(error.message || "فشل تسجيل الخروج")
        },
    })
}