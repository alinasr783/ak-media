import { useQuery } from "@tanstack/react-query";
import { getTodayAppointments } from "../../services/apiDashboard";

export default function useTodayAppointments() {
  return useQuery({
    queryKey: ["todayAppointments"],
    queryFn: getTodayAppointments,
  });
}
