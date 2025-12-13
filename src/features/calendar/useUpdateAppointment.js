import { useMutation, useQueryClient } from "@tanstack/react-query"
import toast from "react-hot-toast"
import { updateAppointment } from "../../services/apiAppointments"

export default function useUpdateAppointment() {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: ({ id, ...values }) => updateAppointment(id, values),
        onSuccess: (data) => {
            toast.success("تم تحديث بيانات الحجز بنجاح");
            qc.invalidateQueries({ queryKey: ["appointment", data.id] })
            qc.invalidateQueries({ queryKey: ["appointments"], exact: false })
            // Also invalidate dashboard stats if needed
            qc.invalidateQueries({ queryKey: ["dashboardStats"] })
        },
        onError: (error) => {
            toast.error("حدث خطأ أثناء تحديث بيانات الحجز: " + error.message);
        },
    })
}