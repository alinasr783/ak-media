import { useQuery } from "@tanstack/react-query";
import { getVisits } from "../../services/apiVisits";

export function useVisits() {
  const {
    data: visits,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["visits"],
    queryFn: getVisits,
  });

  return { visits, isLoading, error };
}
