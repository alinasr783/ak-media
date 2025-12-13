import { useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { Check, X } from "lucide-react";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import DataTable from "../../components/ui/table";
import { updateAppointment } from "../../services/apiAppointments";
import toast from "react-hot-toast";

const statusMap = {
  pending: { label: "جديد", variant: "warning" },
  confirmed: { label: "مؤكد", variant: "success" },
  rejected: { label: "مرفوض", variant: "destructive" },
  completed: { label: "مكتمل", variant: "default" },
  cancelled: { label: "ملغي", variant: "destructive" },
};

export default function OnlineBookingsTable({
  appointments,
  onAccept,
  onReject,
}) {
  const queryClient = useQueryClient();

  const { mutate: updateStatus } = useMutation({
    mutationFn: ({ id, status }) => updateAppointment(id, { status }),
    // Optimistic update - immediately update the UI
    onMutate: async ({ id, status }) => {
      // Cancel any outgoing refetches to avoid overwriting our optimistic update
      await queryClient.cancelQueries({ queryKey: ["appointments"] });
      
      // Snapshot the previous value
      const previousAppointments = queryClient.getQueryData(["appointments"]);
      
      // Optimistically update to the new value
      queryClient.setQueryData(["appointments"], old => {
        if (!old) return old;
        
        // Update the specific appointment in the cache
        return {
          ...old,
          items: old.items?.map(appointment => 
            appointment.id === id 
              ? { ...appointment, status } 
              : appointment
          ) || []
        };
      });
      
      // Return a context object with the snapshotted value
      return { previousAppointments };
    },
    // If the mutation fails, use the context returned from onMutate to roll back
    onError: (err, variables, context) => {
      // Rollback to the previous value
      if (context?.previousAppointments) {
        queryClient.setQueryData(["appointments"], context.previousAppointments);
      }
      toast.error(err.message || "فشل في تحديث حالة الحجز");
    },
    // Always refetch after error or success to ensure we have the correct data
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
    },
    onSuccess: (_, variables) => {
      // Also invalidate dashboard stats to update the counts
      queryClient.invalidateQueries({ queryKey: ["dashboardStats"] });
      queryClient.invalidateQueries({ queryKey: ["filteredPatientStats"] });
      
      // Show success message with the updated status
      const statusLabel = statusMap[variables.status]?.label || variables.status;
      toast.success(`تم تغيير حالة الحجز إلى: ${statusLabel}`);
    },
  });

  const handleAccept = (appointmentId) => {
    updateStatus({ id: appointmentId, status: "confirmed" });
  };

  const handleReject = (appointmentId) => {
    updateStatus({ id: appointmentId, status: "rejected" });
  };

  const columns = [
    {
      header: "اسم المريض",
      accessor: "patientName",
      cellClassName: "font-medium",
      render: (appointment) => appointment.patient?.name || "غير محدد",
    },
    {
      header: "الحالة",
      accessor: "status",
      render: (appointment) => (
        <Badge variant={statusMap[appointment.status]?.variant || "secondary"}>
          {statusMap[appointment.status]?.label || appointment.status}
        </Badge>
      ),
    },
    {
      header: "تاريخ الحجز",
      accessor: "date",
      cellClassName: "text-muted-foreground",
      render: (appointment) =>
        appointment.date
          ? format(new Date(appointment.date), "dd/MM/yyyy", {
              locale: ar,
            })
          : "غير محدد",
    },
    {
      header: "الوقت",
      accessor: "time",
      cellClassName: "text-muted-foreground",
      render: (appointment) =>
        appointment.date
          ? format(new Date(appointment.date), "hh:mm a", {
              locale: ar,
            })
          : "غير محدد",
    },
    {
      header: "رقم الهاتف",
      accessor: "patientPhone",
      cellClassName: "text-muted-foreground",
      render: (appointment) => appointment.patient?.phone || "-",
    },
    {
      header: "نوع الحجز",
      accessor: "notes",
      cellClassName: "text-muted-foreground",
    },
    {
      header: "",
      render: (appointment) => (
        <div className="flex items-center gap-2">
          {appointment.status === "pending" && (
            <>
              <Button
                size="sm"
                variant="outline"
                className="h-8 gap-1 border-green-300 text-green-700 hover:bg-green-50"
                onClick={() => handleAccept(appointment.id)}
              >
                <Check className="w-4 h-4" />
                قبول
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="h-8 gap-1 border-red-300 text-red-700 hover:bg-red-50"
                onClick={() => handleReject(appointment.id)}
              >
                <X className="w-4 h-4" />
                رفض
              </Button>
            </>
          )}
          
          {appointment.status === "confirmed" && (
            <Badge variant="success">مقبول</Badge>
          )}
          
          {appointment.status === "rejected" && (
            <Badge variant="destructive">مرفوض</Badge>
          )}
        </div>
      ),
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={appointments ?? []}
      emptyLabel="لا توجد طلبات حجز جديدة"
    />
  );
}