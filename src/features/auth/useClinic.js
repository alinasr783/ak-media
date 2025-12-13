import { useQuery } from "@tanstack/react-query"
import { getCurrentClinic } from "../../services/apiClinic"

export default function useClinic() {
    return useQuery({
        queryKey: ["clinic"],
        queryFn: getCurrentClinic,
        retry: 1,
        staleTime: 1000 * 60 * 5, // 5 minutes
        cacheTime: 1000 * 60 * 30, // 30 minutes
    })
}