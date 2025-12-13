import { useMutation } from "@tanstack/react-query"
import { createAppointmentPublic } from "../../services/apiAppointments"
import toast from "react-hot-toast"

export default function useCreateAppointmentPublic() {
    return useMutation({
        mutationFn: ({ payload, clinicId }) => createAppointmentPublic(payload, clinicId),
        onSuccess: () => {
            toast.success("تم إضافة الموعد بنجاح")
        },
        onError: (error) => {
            console.error("Error in useCreateAppointmentPublic:", error)
            toast.error(error.message || "فشل إضافة الموعد")
        },
    })
}