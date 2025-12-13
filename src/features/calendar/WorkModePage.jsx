import { useState, useEffect } from "react";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Clock, User, RefreshCw, ArrowLeft, Check, X, AlertCircle, Eye } from "lucide-react";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { useNavigate } from "react-router-dom";
import useAppointments from "./useAppointments";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateAppointment } from "../../services/apiAppointments";
import toast from "react-hot-toast";
import TableSkeleton from "../../components/ui/table-skeleton";

const statusMap = {
  pending: { label: "جديد", variant: "warning" },
  confirmed: { label: "مؤكد", variant: "success" },
  rejected: { label: "مرفوض", variant: "destructive" },
  completed: { label: "مكتمل", variant: "default" },
  cancelled: { label: "ملغي", variant: "destructive" },
};

const sourceMap = {
  booking: { label: "إلكتروني", variant: "default" },
  clinic: { label: "من العيادة", variant: "secondary" },
};

export default function WorkModePage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [refreshing, setRefreshing] = useState(false);

  // Fetch all appointments (including online bookings)
  const { 
    data: appointmentsData, 
    isLoading, 
    refetch 
  } = useAppointments("", 1, 1000);

  const { mutate: updateStatus } = useMutation({
    mutationFn: ({ id, status }) => updateAppointment(id, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
      toast.success("تم تحديث حالة الحجز بنجاح");
    },
    onError: (error) => {
      toast.error(error.message || "فشل في تحديث حالة الحجز");
    },
  });

  const handleAccept = (appointmentId) => {
    updateStatus({ id: appointmentId, status: "confirmed" });
  };

  const handleReject = (appointmentId) => {
    updateStatus({ id: appointmentId, status: "rejected" });
  };

  const handleViewDetails = (appointmentId) => {
    navigate(`/appointments/${appointmentId}`);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setTimeout(() => setRefreshing(false), 500);
  };

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      refetch();
    }, 30 * 1000);
    return () => clearInterval(interval);
  }, [refetch]);

  // Filter appointments to show only pending and confirmed for today from all sources
  const today = new Date().toISOString().split('T')[0];
  const filteredAppointments = appointmentsData?.items?.filter(appointment => 
    (appointment.status === "pending" || appointment.status === "confirmed") &&
    appointment.date &&
    appointment.date.startsWith(today)
  ) || [];

  // Sort appointments by date (earliest first)
  const sortedAppointments = [...filteredAppointments].sort((a, b) => {
    return new Date(a.date) - new Date(b.date);
  });

  // Calculate patient age from birth date if available (fallback)
  const calculateAge = (birthDate) => {
    if (!birthDate) return "غير محدد";
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6" dir="rtl">
      <div className="max-w-[1920px] mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate("/appointments")}
                className="h-10 w-10"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">وضع العمل</h1>
                <p className="text-sm text-gray-500">تنظيم دخول المرضى حسب الترتيب</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={handleRefresh}
                disabled={refreshing}
                className="h-10 gap-2"
              >
                <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
                تحديث
              </Button>
            </div>
          </div>
        </div>

        {/* Info Box */}
        <div className="mb-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm text-blue-700 font-medium">وضع العمل</p>
              <p className="text-sm text-blue-600">
                تعرض هذه الصفحة جميع الحجوزات المؤكدة والجديدة لليوم الحالي بترتيب زمني. 
                يمكنك قبول أو رفض الحجوزات الجديدة من هنا وعرض تفاصيل أي حجز.
              </p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">إجمالي الحجوزات</p>
                    <p className="text-2xl font-bold">{sortedAppointments.length}</p>
                  </div>
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <User className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">الحجوزات الجديدة</p>
                    <p className="text-2xl font-bold">
                      {sortedAppointments.filter(a => a.status === "pending").length}
                    </p>
                  </div>
                  <div className="p-2 bg-amber-100 rounded-lg">
                    <Clock className="h-6 w-6 text-amber-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">الحجوزات المؤكدة</p>
                    <p className="text-2xl font-bold">
                      {sortedAppointments.filter(a => a.status === "confirmed").length}
                    </p>
                  </div>
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Check className="h-6 w-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Appointments List */}
        <Card className="border border-gray-200 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-blue-600" />
              قائمة المرضى المرتصة
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="p-6">
                <TableSkeleton columns={5} rows={5} />
              </div>
            ) : sortedAppointments.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-right py-3 px-4 font-medium text-gray-900">#</th>
                      <th className="text-right py-3 px-4 font-medium text-gray-900">اسم المريض</th>
                      <th className="text-right py-3 px-4 font-medium text-gray-900">رقم الهاتف</th>
                      <th className="text-right py-3 px-4 font-medium text-gray-900">العمر</th>
                      <th className="text-right py-3 px-4 font-medium text-gray-900">نوع الحجز</th>
                      <th className="text-right py-3 px-4 font-medium text-gray-900">تاريخ الحجز</th>
                      <th className="text-right py-3 px-4 font-medium text-gray-900">ميعاد الدخول</th>
                      <th className="text-right py-3 px-4 font-medium text-gray-900">الحالة</th>
                      <th className="text-right py-3 px-4 font-medium text-gray-900">إجراءات</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedAppointments.map((appointment, index) => (
                      <tr key={appointment.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4">{index + 1}</td>
                        <td className="py-3 px-4 font-medium">{appointment.patient?.name || "مريض"}</td>
                        <td className="py-3 px-4">{appointment.patient?.phone || "غير محدد"}</td>
                        <td className="py-3 px-4">
                          {appointment.age || 
                           (appointment.patient?.age || calculateAge(appointment.patient?.date_of_birth)) || 
                           "غير محدد"}
                        </td>
                        <td className="py-3 px-4">
                          <Badge variant={sourceMap[appointment.from]?.variant || "secondary"}>
                            {sourceMap[appointment.from]?.label || appointment.from}
                          </Badge>
                        </td>
                        <td className="py-3 px-4">
                          {appointment.created_at
                            ? format(new Date(appointment.created_at), "dd/MM/yyyy hh:mm a", { locale: ar })
                            : "غير محدد"}
                        </td>
                        <td className="py-3 px-4">
                          {appointment.date
                            ? format(new Date(appointment.date), "dd/MM/yyyy hh:mm a", { locale: ar })
                            : "غير محدد"}
                        </td>
                        <td className="py-3 px-4">
                          <Badge variant={statusMap[appointment.status]?.variant || "secondary"}>
                            {statusMap[appointment.status]?.label || appointment.status}
                          </Badge>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-8 gap-1"
                              onClick={() => handleViewDetails(appointment.id)}
                            >
                              <Eye className="h-4 w-4" />
                              عرض
                            </Button>
                            
                            {appointment.status === "pending" && (
                              <div className="flex gap-1">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="h-8 gap-1 border-green-300 text-green-700 hover:bg-green-50"
                                  onClick={() => handleAccept(appointment.id)}
                                >
                                  <Check className="h-4 w-4" />
                                  قبول
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="h-8 gap-1 border-red-300 text-red-700 hover:bg-red-50"
                                  onClick={() => handleReject(appointment.id)}
                                >
                                  <X className="h-4 w-4" />
                                  رفض
                                </Button>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12">
                <Clock className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-600 mb-2">لا توجد مواعيد اليوم</p>
                <p className="text-sm text-gray-400">سيتم عرض المواعيد المؤكدة والجديدة هنا</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}