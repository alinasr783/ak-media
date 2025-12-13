import { useQuery } from "@tanstack/react-query";
import { getFinanceStats } from "../../services/apiFinance";

export const useFinanceStats = () => {
  return useQuery({
    queryKey: ["financeStats"],
    queryFn: getFinanceStats,
  });
};