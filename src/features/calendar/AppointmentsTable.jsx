import {useMutation, useQueryClient} from "@tanstack/react-query";
import {format} from "date-fns";
import {ar} from "date-fns/locale";
import {Bell, Eye, MoreHorizontal} from "lucide-react";
import toast from "react-hot-toast";
import {Badge} from "../../components/ui/badge";
import {Button} from "../../components/ui/button";
import {Card, CardContent} from "../../components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu";
import DataTable from "../../components/ui/table";
import {updateAppointment} from "../../services/apiAppointments";
// Added import for usePlan hook and Dialog components
import usePlan from "../auth/usePlan";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../../components/ui/dialog";
import {useState} from "react";
import {useNavigate} from "react-router-dom";

const statusMap = {
  pending: {label: "قيد الانتظار", variant: "secondary"},
  confirmed: {label: "مؤكد", variant: "default"},
  completed: {label: "مكتمل", variant: "outline"},
  cancelled: {label: "ملغي", variant: "destructive"},
};

const sourceMap = {
  booking: {label: "من الموقع", variant: "default"},
  clinic: {label: "من العيادة", variant: "secondary"},
};

// Check if appointment is within 2 hours
const isWithinTwoHours = (appointmentDate) => {
  if (!appointmentDate) return false;

  const now = new Date();
  const appointmentTime = new Date(appointmentDate);
  const timeDifference = appointmentTime.getTime() - now.getTime();
  const hoursDifference = timeDifference / (1000 * 60 * 60);

  return hoursDifference > 0 && hoursDifference <= 2;
};

// Generate WhatsApp reminder message
const generateReminderMessage = (patientName, appointmentDate) => {
  const formattedDate = format(new Date(appointmentDate), "dd/MM/yyyy", {
    locale: ar,
  });
  const formattedTime = format(new Date(appointmentDate), "hh:mm a", {
    locale: ar,
  });

  return `مرحباً ${patientName}، هذا تذكير بموعدك في العيادة بتاريخ ${formattedDate} الساعة ${formattedTime}. نرجو الحضور قبل الموعد بـ15 دقيقة.`;
};

// Format phone number for WhatsApp (remove all non-digit characters and ensure it starts with country code)
const formatPhoneNumberForWhatsApp = (phone) => {
  if (!phone) return "";

  // Remove all non-digit characters
  let formattedPhone = phone.replace(/\D/g, "");

  // If the phone number starts with "0", replace it with the country code (assuming Egypt with +20)
  if (formattedPhone.startsWith("0")) {
    formattedPhone = "20" + formattedPhone.substring(1);
  }

  // If the phone number doesn't start with "+", add it
  if (!formattedPhone.startsWith("20")) {
    formattedPhone = "20" + formattedPhone;
  }

  return formattedPhone;
};

export default function AppointmentsTable({
  appointments,
  total,
  page,
  pageSize,
  onPageChange,
}) {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  // Added plan data hook
  const {data: planData} = usePlan();
  // State for WhatsApp feature modal
  const [isWhatsAppModalOpen, setIsWhatsAppModalOpen] = useState(false);

  const {mutate: updateStatus} = useMutation({
    mutationFn: ({id, status}) => updateAppointment(id, {status}),
    // Optimistic update - immediately update the UI
    onMutate: async ({id, status}) => {
      // Cancel any outgoing refetches to avoid overwriting our optimistic update
      await queryClient.cancelQueries({queryKey: ["appointments"]});
      
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
              ? {...appointment, status} 
              : appointment
          ) || []
        };
      });
      
      // Return a context object with the snapshotted value
      return {previousAppointments};
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
      queryClient.invalidateQueries({queryKey: ["appointments"]});
    },
    onSuccess: (_, variables) => {
      // Also invalidate dashboard stats to update the counts
      queryClient.invalidateQueries({queryKey: ["dashboardStats"]});
      queryClient.invalidateQueries({queryKey: ["filteredPatientStats"]});
      
      // Show success message with the updated status
      const statusLabel = statusMap[variables.status]?.label || variables.status;
      toast.success(`تم تغيير حالة الحجز إلى: ${statusLabel}`);
    },
  });

  const handleStatusChange = (appointmentId, newStatus) => {
    updateStatus({id: appointmentId, status: newStatus});
  };

  // Check if WhatsApp feature is enabled in the plan
  const isWhatsAppEnabled =
    planData?.plans?.limits?.features?.whatsapp === true;

  const handleSendReminder = (patientPhone, patientName, appointmentDate) => {
    // If WhatsApp is not enabled in the plan, show a modal and return
    if (!isWhatsAppEnabled) {
      setIsWhatsAppModalOpen(true);
      return;
    }

    // Format the phone number for WhatsApp
    const formattedPhone = formatPhoneNumberForWhatsApp(patientPhone);

    // If phone number is invalid, show an error
    if (!formattedPhone) {
      toast.error("رقم الهاتف غير صحيح");
      return;
    }

    const message = generateReminderMessage(patientName, appointmentDate);
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${formattedPhone}?text=${encodedMessage}`;
    window.open(whatsappUrl, "_blank");
  };

  const columns = [
    {
      header: "اسم المريض",
      accessor: "patientName",
      cellClassName: "font-medium",
      render: (appointment) => appointment.patient?.name || "غير محدد",
    },
    {
      header: "رقم الهاتف",
      accessor: "patientPhone",
      cellClassName: "text-muted-foreground",
      render: (appointment) => appointment.patient?.phone || "-",
    },
    {
      header: "التاريخ والوقت",
      accessor: "date",
      cellClassName: "text-muted-foreground",
      render: (appointment) =>
        appointment.date
          ? format(new Date(appointment.date), "dd MMMM yyyy - hh:mm a", {
              locale: ar,
            })
          : "غير محدد",
    },
    {
      header: "نوع الحجز",
      accessor: "notes",
      cellClassName: "text-muted-foreground",
    },
    {
      header: "السعر (جنيه)",
      accessor: "price",
      cellClassName: "text-muted-foreground",
      render: (appointment) =>
        appointment.price ? appointment.price.toFixed(2) : "0.00",
    },
    {
      header: "المصدر",
      accessor: "from",
      render: (appointment) => (
        <Badge variant={sourceMap[appointment.from]?.variant || "secondary"}>
          {sourceMap[appointment.from]?.label || appointment.from}
        </Badge>
      ),
    },
    {
      header: "تم الإنشاء",
      accessor: "created_at",
      cellClassName: "text-muted-foreground",
      render: (appointment) =>
        appointment.created_at
          ? format(new Date(appointment.created_at), "dd MMMM yyyy - hh:mm a", {
              locale: ar,
            })
          : "غير محدد",
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
      header: "",
      render: (appointment) => (
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={() => navigate(`/appointments/${appointment.id}`)}
            title="عرض تفاصيل الحجز">
            <Eye className="h-4 w-4" />
          </Button>
          {isWithinTwoHours(appointment.date) && (
            <Button
              variant="outline"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() =>
                handleSendReminder(
                  appointment.patient?.phone,
                  appointment.patient?.name,
                  appointment.date
                )
              }
              title={
                !isWhatsAppEnabled
                  ? "خطتك الحالية لا تدعم إرسال رسائل WhatsApp"
                  : "إرسال تذكير عبر الواتساب"
              }>
              <Bell className="h-4 w-4" />
            </Button>
          )}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              sideOffset={5}
              collisionPadding={10}
              avoidCollisions>
              <DropdownMenuItem
                onClick={() => handleStatusChange(appointment.id, "pending")}>
                تغيير إلى قيد الانتظار
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleStatusChange(appointment.id, "confirmed")}>
                تغيير إلى مؤكد
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleStatusChange(appointment.id, "completed")}>
                تغيير إلى مكتمل
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleStatusChange(appointment.id, "cancelled")}>
                تغيير إلى ملغي
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
    },
  ];

  return (
    <>
      <Card className="max-h-[calc(100vh-200px)] flex flex-col">
        <CardContent className="p-0 flex-grow overflow-hidden">
          <div className="h-full overflow-y-auto">
            <DataTable
              columns={columns}
              data={appointments ?? []}
              total={total}
              page={page}
              pageSize={pageSize}
              onPageChange={onPageChange}
              emptyLabel="لا توجد مواعيد"
            />
          </div>
        </CardContent>
      </Card>

      {/* WhatsApp Feature Not Available Modal */}
      <Dialog open={isWhatsAppModalOpen} onOpenChange={setIsWhatsAppModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>ميزة غير متوفرة</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-muted-foreground">
              خطتك الحالية لا تدعم إرسال رسائل WhatsApp للمرضى
            </p>
            <p className="text-muted-foreground mt-2">
              يرجى ترقية خطتك لتفعيل ميزة إرسال رسائل WhatsApp تلقائياً للمرضى.
            </p>
          </div>
          <DialogFooter>
            <Button onClick={() => setIsWhatsAppModalOpen(false)}>إغلاق</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
