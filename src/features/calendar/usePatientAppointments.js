import { useQuery } from "@tanstack/react-query"
import { getAppointmentsByPatientId } from "../../services/apiAppointments"

export default function usePatientAppointments(patientId) {
    return useQuery({
        queryKey: ["patient-appointments", patientId],
        queryFn: () => getAppointmentsByPatientId(patientId),
        enabled: !!patientId,
        meta: {
            errorMessage: "فشل في تحميل سجل الحجوزات"
        }
    })
}