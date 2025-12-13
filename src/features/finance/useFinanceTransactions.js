import { useQuery } from "@tanstack/react-query";
import { getFinanceTransactions } from "../../services/apiFinance";

export const useFinanceTransactions = () => {
  return useQuery({
    queryKey: ["financeTransactions"],
    queryFn: getFinanceTransactions,
  });
};