import { useQuery } from "@tanstack/react-query"
import { getPatientById } from "../../services/apiPatients"

export default function usePatient(id) {
  return useQuery({
    queryKey: ["patient", id],
    queryFn: () => getPatientById(id), enabled: !!id
  })
}
