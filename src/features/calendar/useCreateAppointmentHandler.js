import { useCallback } from "react"
import toast from "react-hot-toast"
import useCreateAppointment from "./useCreateAppointment"

/**
 * Hook to handle appointment creation with validation and error handling
 * Encapsulates all logic for creating appointments including:
 * - Patient validation
 * - Date/Time validation
 * - Price validation
 * - Toast notifications
 */
export default function useCreateAppointmentHandler() {
    const { mutate: createAppointment, isPending } = useCreateAppointment()

    /**
     * Validate appointment form data
     * @param {Object} data - Form data
     * @param {Object} selectedPatient - Selected patient
     * @returns {string|null} Error message or null if valid
     */
    const validateAppointmentData = useCallback((data, selectedPatient) => {
        if (!selectedPatient) {
            return "يجب اختيار مريض"
        }

        if (!data.date) {
            return "تاريخ ووقت الموعد مطلوب"
        }
        
        // Check if date is valid
        const date = new Date(data.date);
        if (isNaN(date.getTime())) {
            return "تاريخ ووقت الموعد غير صحيح"
        }
        
        // Check if date is not in the past
        const now = new Date();
        if (date < now) {
            return "لا يمكن اختيار تاريخ ووقت سابق"
        }

        if (
            data.price === "" ||
            isNaN(parseFloat(data.price)) ||
            parseFloat(data.price) < 0
        ) {
            return "سعر الحجز مطلوب ويجب أن يكون رقمًا موجبًا"
        }

        return null
    }, [])

    /**
     * Handle appointment form submission
     * @param {Object} data - Form data
     * @param {Object} selectedPatient - Selected patient
     * @param {Function} onSuccess - Success callback
     * @returns {Promise<void>}
     */
    const handleAppointmentSubmit = useCallback(
        (data, selectedPatient, onSuccess) => {
            const validationError = validateAppointmentData(data, selectedPatient)

            if (validationError) {
                toast.error(validationError)
                return
            }

            createAppointment(
                {
                    date: data.date,
                    notes: data.notes,
                    price: parseFloat(data.price) || 0,
                    patient_id: selectedPatient.id,
                    // Add patient age to appointment if available
                    age: selectedPatient.age || null
                },
                {
                    onSuccess: () => {
                        onSuccess?.()
                    },
                }
            )
        },
        [createAppointment, validateAppointmentData]
    )

    return {
        handleAppointmentSubmit,
        isPending,
    }
}
