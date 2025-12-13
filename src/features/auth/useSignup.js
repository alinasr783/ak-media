import { useMutation, useQueryClient } from "@tanstack/react-query"
import { signup } from "../../services/apiAuth"
import toast from "react-hot-toast"
import { useNavigate } from "react-router-dom"

export default function useSignup() {
    const navigate = useNavigate()
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: signup,
        onSuccess: (data) => {
            // Set user data and invalidate any cached user data
            queryClient.setQueryData(["user"], data.user)
            queryClient.invalidateQueries({ queryKey: ["user"] })
            toast.success(
                "تم إنشاء الحساب بنجاح."
            )
            navigate("/dashboard", { replace: true })
        },
        onError: (error) => {
            toast.error(error.message || "فشل إنشاء الحساب")
        },
    })
}