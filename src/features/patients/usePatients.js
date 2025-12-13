import { useQuery } from "@tanstack/react-query"
import { getPatients } from "../../services/apiPatients"
import { PAGE_SIZE } from "../../constants/pagination"
import { useOffline } from "../../features/offline-mode/OfflineContext"
import { useOfflineData } from "../../features/offline-mode/useOfflineData"

export default function usePatients(search, page = 1) {
  const { isOfflineMode } = useOffline()
  const { searchOfflinePatients } = useOfflineData()
  
  // For offline mode, we'll handle search differently
  if (isOfflineMode) {
    // In offline mode, we don't use pagination, just search all local patients
    return useQuery({
      queryKey: ["patients", "offline", search ?? ""],
      queryFn: () => searchOfflinePatients(search),
      enabled: isOfflineMode
    })
  }
  
  // Online mode - use the original implementation
  return useQuery({
    queryKey: ["patients", search ?? "", page],
    queryFn: () => getPatients(search, page, PAGE_SIZE),
    enabled: !isOfflineMode
  })
}