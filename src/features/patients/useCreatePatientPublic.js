import { useMutation, useQueryClient } from "@tanstack/react-query"
import { createPatientPublic } from "../../services/apiPatients"

export default function useCreatePatientPublic() {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: createPatientPublic,
        onSuccess: (data) => {
            qc.invalidateQueries({ queryKey: ["patients"] })
            // Also invalidate dashboard stats to update the patient count
            qc.invalidateQueries({ queryKey: ["dashboardStats"] })
            qc.invalidateQueries({ queryKey: ["filteredPatientStats"] })
            return data
        },
    })
}