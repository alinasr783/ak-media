import { useMutation } from "@tanstack/react-query"
import { changePassword } from "../../services/apiAuth"
import toast from "react-hot-toast"

export default function useChangePassword() {
    return useMutation({
        mutationFn: changePassword,
        onSuccess: () => {
            toast.success("تم تغيير كلمة المرور بنجاح")
        },
        onError: (error) => {
            toast.error("حدث خطأ أثناء تغيير كلمة المرور: " + error.message)
        }
    })
}