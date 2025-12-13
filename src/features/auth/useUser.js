import { useQuery } from "@tanstack/react-query"
import { getCurrentUser } from "../../services/apiAuth"

export default function useUser() {
    const result = useQuery({
        queryKey: ["user"],
        queryFn: getCurrentUser,
        retry: false,
        // Increase staleTime to reduce unnecessary API calls
        staleTime: 5 * 60 * 1000, // 5 minutes
        refetchOnWindowFocus: false,
    })
    
    return result
}