import { useQuery } from "@tanstack/react-query";
import { getFinanceReportData } from "../../services/apiFinance";

export const useFinanceReportData = (reportType) => {
  return useQuery({
    queryKey: ["financeReportData", reportType],
    queryFn: () => getFinanceReportData(reportType),
  });
};