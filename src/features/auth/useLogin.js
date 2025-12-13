import { useMutation, useQueryClient } from "@tanstack/react-query"
import { login } from "../../services/apiAuth"
import { useNavigate } from "react-router-dom"
import toast from "react-hot-toast"

export default function useLogin() {
    const queryClient = useQueryClient()
    const navigate = useNavigate()

    return useMutation({
        mutationFn: login,
        onSuccess: (data) => {
            // Set user data and invalidate any cached user data
            queryClient.setQueryData(["user"], data.user)
            queryClient.invalidateQueries({ queryKey: ["user"] })
            toast.success("تم تسجيل الدخول بنجاح")
            navigate("/dashboard", { replace: true })
        },
        onError: (error) => {
            toast.error(error.message || "فشل تسجيل الدخول")
        },
    })
}