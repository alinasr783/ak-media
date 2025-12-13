import { useQuery } from "@tanstack/react-query"
import { getAppointmentById } from "../../services/apiAppointments"

export default function useAppointment(id) {
    return useQuery({
        queryKey: ["appointment", id],
        queryFn: () => getAppointmentById(id),
        meta: {
            errorMessage: "فشل في تحميل تفاصيل الحجز"
        },
        enabled: !!id
    })
}