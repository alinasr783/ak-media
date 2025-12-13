import { useQuery } from "@tanstack/react-query"
import { getCurrentPlan } from "../../services/apiPlan"

export default function usePlan() {
    const result = useQuery({
        queryKey: ["plan"],
        queryFn: getCurrentPlan,
        retry: false,
    })
    
    console.log("=== DEBUG: usePlan hook result ===", result)
    
    return result
}