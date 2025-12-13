import { useMutation, useQueryClient } from "@tanstack/react-query"
import { createPatient } from "../../services/apiPatients"

export default function useCreatePatient() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: createPatient,
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ["patients"] })
      // Also invalidate dashboard stats to update the patient count
      qc.invalidateQueries({ queryKey: ["dashboardStats"] })
      qc.invalidateQueries({ queryKey: ["filteredPatientStats"] })
      return data
    },
  })
}