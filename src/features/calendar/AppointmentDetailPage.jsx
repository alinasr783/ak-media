import {format} from "date-fns";
import {ar} from "date-fns/locale";
import {
  ArrowLeft,
  Calendar,
  Edit,
  FileText,
  Wallet,
  User,
  Phone,
  Clock,
  MapPin,
  AlertCircle,
  Stethoscope,
  Shield,
  Download,
  Printer,
  MessageSquare,
  CheckCircle,
  XCircle,
  Clock3,
  MoreVertical,
  Mail,
  Plus,
  X
} from "lucide-react";
import {useState, useEffect} from "react";
import {useNavigate, useParams} from "react-router-dom";
import {Button} from "../../components/ui/button";
import {Card, CardContent, CardHeader, CardTitle, CardFooter} from "../../components/ui/card";
import {Badge} from "../../components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog";
import {Input} from "../../components/ui/input";
import {Label} from "../../components/ui/label";
import {Skeleton} from "../../components/ui/skeleton";
import {Textarea} from "../../components/ui/textarea";
import {Tabs, TabsContent, TabsList, TabsTrigger} from "../../components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "../../components/ui/dropdown-menu";
import { Switch } from "../../components/ui/switch";
import { Separator } from "../../components/ui/separator";
import useAppointment from "./useAppointment";
import useUpdateAppointmentHandler from "./useUpdateAppointmentHandler";

export default function AppointmentDetailPage() {
  const {appointmentId} = useParams();
  const {data: appointment, isLoading, error, refetch} = useAppointment(appointmentId);
  const navigate = useNavigate();
  const {handleAppointmentUpdate, isPending: isUpdating} = useUpdateAppointmentHandler();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isActionsMenuOpen, setIsActionsMenuOpen] = useState(false);
  const [showPrescriptionDialog, setShowPrescriptionDialog] = useState(false);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [showCallDialog, setShowCallDialog] = useState(false);
  const [showInvoiceDialog, setShowInvoiceDialog] = useState(false);
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [showPrintDialog, setShowPrintDialog] = useState(false);
  const [showFollowUpDialog, setShowFollowUpDialog] = useState(false);
  const [medications, setMedications] = useState([{ name: '', dosage: '', duration: '', instructions: '' }]);
  
  const [editData, setEditData] = useState({
    date: "",
    notes: "",
    price: "",
    status: "",
    diagnosis: "",
    treatment: ""
  });

  // Medication management functions
  const addMedication = () => {
    setMedications([...medications, { name: '', dosage: '', duration: '', instructions: '' }]);
  };

  const removeMedication = (index) => {
    if (medications.length > 1) {
      const newMedications = medications.filter((_, i) => i !== index);
      setMedications(newMedications);
    }
  };

  const updateMedication = (index, field, value) => {
    const newMedications = [...medications];
    newMedications[index][field] = value;
    setMedications(newMedications);
  };

  const handleCreatePrescription = () => {
    // Implement prescription creation logic here
    console.log("Creating prescription with medications:", medications);
    // For now, we'll just close the dialog and show a toast
    setShowPrescriptionDialog(false);
    // Reset medications to initial state
    setMedications([{ name: '', dosage: '', duration: '', instructions: '' }]);
    // In a real implementation, you would call an API to create the prescription
    // and possibly redirect to the prescription page
    alert("تم إنشاء الوصفة الطبية بنجاح!");
  };

  const statusConfig = {
    pending: {label: "في انتظار التأكيد", variant: "warning", icon: Clock3, color: "text-yellow-600", bg: "bg-yellow-50", border: "border-yellow-200"},
    confirmed: {label: "مؤكد", variant: "success", icon: CheckCircle, color: "text-green-600", bg: "bg-green-50", border: "border-green-200"},
    completed: {label: "مكتمل", variant: "default", icon: Shield, color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-200"},
    cancelled: {label: "ملغي", variant: "destructive", icon: XCircle, color: "text-red-600", bg: "bg-red-50", border: "border-red-200"},
    in_progress: {label: "قيد الكشف", variant: "info", icon: Stethoscope, color: "text-purple-600", bg: "bg-purple-50", border: "border-purple-200"}
  };

  const sourceConfig = {
    booking: {label: "حجز إلكتروني", variant: "info", icon: "🌐"},
    clinic: {label: "حجز مباشر", variant: "secondary", icon: "🏥"},
    phone: {label: "هاتفي", variant: "default", icon: "📞"}
  };

  // Initialize edit data when appointment loads
  useEffect(() => {
    if (appointment) {
      setEditData({
        date: appointment.date || "",
        notes: appointment.notes || "",
        price: appointment.price || "",
        status: appointment.status || "",
        diagnosis: appointment.diagnosis || "",
        treatment: appointment.treatment || ""
      });
    }
  }, [appointment]);

  const openEditModal = () => {
    setEditData({
      date: appointment?.date || "",
      notes: appointment?.notes || "",
      price: appointment?.price || "",
      status: appointment?.status || "",
      diagnosis: appointment?.diagnosis || "",
      treatment: appointment?.treatment || ""
    });
    setIsEditModalOpen(true);
  };

  const handleEditChange = (field, value) => {
    setEditData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSaveEdit = async () => {
    await handleAppointmentUpdate(appointmentId, editData);
    setIsEditModalOpen(false);
    refetch();
  };

  const handlePrintTicket = () => {
    setIsActionsMenuOpen(false);
    // Implement print functionality
    window.print();
  };

  const handleExportData = () => {
    setIsActionsMenuOpen(false);
    // Implement export functionality
    console.log("Exporting appointment data...");
  };

  const handleSendReminder = () => {
    setIsActionsMenuOpen(false);
    // setShowReminderDialog(true); // Comment out the dialog
    
    // Create a WhatsApp message with appointment details
    const phoneNumber = appointment?.patient?.phone?.replace(/\D/g, ''); // Remove non-digits
    if (!phoneNumber) {
      alert("رقم الهاتف غير متوفر");
      return;
    }
    
    // Format the appointment date for the message
    const appointmentDate = formatDate(appointment?.date);
    const doctorName = appointment?.doctor?.name || "الدكتور";
    
    // Create the WhatsApp message
    const message = `مرحبًا ${appointment?.patient?.name || 'سيد/سيدة'}،
    
هذه رسالة تذكير بموعدك مع ${doctorName} في ${appointmentDate}.
    
يرجى الحضور قبل 10 دقائق من الموعد المحدد.
    
شكراً لك.`;
    
    // Encode the message for URL
    const encodedMessage = encodeURIComponent(message);
    
    // Open WhatsApp with the message
    const whatsappUrl = `https://wa.me/+2${phoneNumber}?text=${encodedMessage}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleAddToCalendar = () => {
    // Implement add to calendar functionality
    console.log("Adding to calendar...");
  };

  const handleRegisterPayment = () => {
    setShowPaymentDialog(true);
  };

  const handleGenerateInvoice = () => {
    setShowInvoiceDialog(true);
  };

  const handleSendPatientReminder = () => {
    // Create a WhatsApp message with appointment details
    const phoneNumber = appointment?.patient?.phone?.replace(/\D/g, ''); // Remove non-digits
    if (!phoneNumber) {
      alert("رقم الهاتف غير متوفر");
      return;
    }
    
    // Format the appointment date for the message
    const appointmentDate = formatDate(appointment?.date);
    const doctorName = appointment?.doctor?.name || "الدكتور";
    
    // Create the WhatsApp message
    const message = `مرحبًا ${appointment?.patient?.name || 'سيد/سيدة'}،
    
هذه رسالة تذكير بموعدك مع ${doctorName} في ${appointmentDate}.
    
يرجى الحضور قبل 10 دقائق من الموعد المحدد.
    
شكراً لك.`;
    
    // Encode the message for URL
    const encodedMessage = encodeURIComponent(message);
    
    // Open WhatsApp with the message
    const whatsappUrl = `https://wa.me/+2${phoneNumber}?text=${encodedMessage}`;
    window.open(whatsappUrl, '_blank');
    
    // Don't show the dialog since we're opening WhatsApp directly
    // setShowReminderDialog(true);
  };

  const handleCallPatient = () => {
    setShowCallDialog(true);
  };

  const handleWritePrescription = () => {
    setShowPrescriptionDialog(true);
  };

  const handleSharePrescriptionWhatsApp = () => {
    // Create a WhatsApp message with prescription details
    const phoneNumber = appointment?.patient?.phone?.replace(/\D/g, ''); // Remove non-digits
    if (!phoneNumber) {
      alert("رقم هاتف المريض غير متوفر");
      return;
    }
    
    // Create the prescription message
    let message = `السلام عليكم ${appointment?.patient?.name || 'سيد/سيدة'}，
    
مرفق لكم الوصفة الطبية من د. ${appointment?.doctor?.name || 'الطبيب'}:
    
`;
    
    // Add medications to the message
    medications.forEach((med, index) => {
      message += `الدواء #${index + 1}: ${med.name || 'غير محدد'}
الجرعة: ${med.dosage || 'غير محددة'}
المدة: ${med.duration || 'غير محددة'}`;
      
      if (med.instructions) {
        message += `
تعليمات خاصة: ${med.instructions}`;
      }
      
      message += '\n\n';
    });
    
    message += `تاريخ الوصفة: ${format(new Date(), "d MMMM yyyy", {locale: ar})}
    
يرجى اتباع التعليمات المذكورة وإحضار الوصفة عند زيارة العيادة القادمة.
    
شكراً لك.`;
    
    // Encode the message for URL
    const encodedMessage = encodeURIComponent(message);
    
    // Open WhatsApp with the message
    const whatsappUrl = `https://wa.me/+2${phoneNumber}?text=${encodedMessage}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleStartExamination = () => {
    handleStatusChange('in_progress');
  };

  const handleStatusChange = async (newStatus) => {
    try {
      await handleAppointmentUpdate(appointmentId, { ...editData, status: newStatus });
      refetch();
      // Show success message
      const statusLabel = statusConfig[newStatus]?.label || 'الحالة';
      alert(`تم تغيير الحالة إلى: ${statusLabel}`);
    } catch (error) {
      console.error("Error updating status:", error);
      alert("حدث خطأ أثناء تحديث الحالة");
    }
  };

  const handleBookFollowUp = () => {
    setShowFollowUpDialog(true);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    try {
      return format(new Date(dateString), "EEEE، d MMMM yyyy - hh:mm a", {locale: ar});
    } catch {
      return dateString;
    }
  };

  const calculatePatientAge = (birthDate) => {
    if (!birthDate) return "غير معروف";
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return `${age} سنة`;
  };

  const LoadingSkeleton = () => (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6" dir="rtl">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header Skeleton */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-3">
            <Skeleton className="h-10 w-64" />
            <Skeleton className="h-4 w-48" />
          </div>
          <div className="flex gap-3">
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-10 w-24" />
          </div>
        </div>

        {/* Status Card Skeleton */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Skeleton className="h-14 w-14 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-6 w-32" />
                  <Skeleton className="h-4 w-40" />
                </div>
              </div>
              <Skeleton className="h-8 w-24" />
            </div>
          </CardContent>
        </Card>

        {/* Grid Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {Array.from({length: 6}).map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-5 w-32" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );

  if (isLoading) return <LoadingSkeleton />;

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-6" dir="rtl">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">تفاصيل الحجز</h1>
              <p className="text-gray-500 text-sm mt-1">عرض معلومات الحجز</p>
            </div>
            <Button
              variant="ghost"
              className="gap-2"
              onClick={() => navigate(-1)}>
              <ArrowLeft className="size-4" />
              رجوع
            </Button>
          </div>

          <Card className="border-red-200 bg-red-50">
            <CardContent className="py-12 text-center">
              <AlertCircle className="size-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-red-700 mb-2">حدث خطأ</h3>
              <p className="text-red-600 mb-4">تعذر تحميل تفاصيل الحجز</p>
              <div className="flex gap-3 justify-center">
                <Button onClick={() => refetch()} variant="outline" className="border-red-300">
                  المحاولة مرة أخرى
                </Button>
                <Button onClick={() => navigate(-1)} variant="ghost">
                  العودة للقائمة
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const StatusIcon = statusConfig[appointment?.status]?.icon || Clock3;

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6" dir="rtl">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">تفاصيل الحجز</h1>
              <Badge variant="outline" className="text-sm font-normal">
                رقم: #{appointmentId?.slice(-6)}
              </Badge>
            </div>
            <p className="text-gray-500 text-sm">
              آخر تحديث: {format(new Date(appointment?.updatedAt || Date.now()), "d MMMM yyyy - hh:mm a", {locale: ar})}
            </p>
          </div>
          
          <div className="flex flex-wrap gap-3">
            <Button
              variant="outline"
              onClick={openEditModal}
              className="gap-2 bg-white hover:bg-gray-50 border-gray-300">
              <Edit className="size-4" />
              تعديل الحجز
            </Button>
            
            <DropdownMenu open={isActionsMenuOpen} onOpenChange={setIsActionsMenuOpen}>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <MoreVertical className="size-4" />
                  المزيد
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56">
                <DropdownMenuItem className="gap-3 cursor-pointer" onClick={handlePrintTicket}>
                  <Printer className="size-4" />
                  طباعة التذكرة
                </DropdownMenuItem>
                <DropdownMenuItem className="gap-3 cursor-pointer" onClick={handleExportData}>
                  <Download className="size-4" />
                  تصدير البيانات
                </DropdownMenuItem>
                <DropdownMenuItem className="gap-3 cursor-pointer" onClick={handleSendReminder}>
                  <MessageSquare className="size-4" />
                  إرسال تذكير
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  className="gap-3 text-red-600 cursor-pointer"
                  onClick={() => handleStatusChange('cancelled')}
                >
                  <XCircle className="size-4" />
                  إلغاء الحجز
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button
              variant="ghost"
              className="gap-2"
              onClick={() => navigate(-1)}>
              <ArrowLeft className="size-4" />
              رجوع
            </Button>
          </div>
        </div>

        {/* Status Quick Actions */}
        <div className="flex flex-wrap gap-3">
          {Object.entries(statusConfig).map(([key, config]) => {
            const Icon = config.icon;
            if (key === appointment?.status) return null;
            return (
              <Button
                key={key}
                variant="outline"
                size="sm"
                className="gap-2"
                onClick={() => handleStatusChange(key)}
              >
                <Icon className="size-4" />
                {config.label}
              </Button>
            );
          })}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Appointment Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Status Card */}
            <Card className={`${statusConfig[appointment?.status]?.bg} ${statusConfig[appointment?.status]?.border} border-2`}>
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-full ${statusConfig[appointment?.status]?.bg}`}>
                      <StatusIcon className={`size-6 ${statusConfig[appointment?.status]?.color}`} />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900">{statusConfig[appointment?.status]?.label}</h3>
                      <div className="flex flex-wrap gap-4 mt-3">
                        <div className="flex items-center gap-2 text-gray-600">
                          <Clock className="size-4" />
                          <span className="text-sm font-medium">المصدر:</span>
                          <Badge variant={sourceConfig[appointment?.from]?.variant || "secondary"} className="text-xs">
                            {sourceConfig[appointment?.from]?.label}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                          <AlertCircle className="size-4" />
                          <span className="text-sm font-medium">الأولوية:</span>
                          <Badge 
                            variant={appointment?.priority === 'high' ? 'destructive' : 'default'} 
                            className="text-xs"
                          >
                            {appointment?.priority === 'high' ? 'عاجل' : 'عادي'}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Patient Information */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-3 text-lg">
                  <User className="size-6 text-blue-600" />
                  معلومات المريض
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-4">
                    <div>
                      <Label className="text-sm text-gray-500 mb-2 block">الاسم الكامل</Label>
                      <div className="font-bold text-xl">{appointment?.patient?.name || "-"}</div>
                      <div className="text-gray-500 text-sm mt-1">{appointment?.patient?.arabicName || ""}</div>
                    </div>
                    
                    <div>
                      <Label className="text-sm text-gray-500 mb-2 block">رقم الملف</Label>
                      <div className="font-medium">#{appointment?.patient?.fileNumber || "غير محدد"}</div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <Label className="text-sm text-gray-500 mb-2 block">معلومات الاتصال</Label>
                      <div className="flex items-center gap-3 mb-2">
                        <Phone className="size-4 text-gray-400" />
                        <span className="font-medium">{appointment?.patient?.phone || "-"}</span>
                      </div>
                      <div className="text-gray-600 text-sm">
                        {appointment?.patient?.email || "لا يوجد بريد إلكتروني"}
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <Label className="text-sm text-gray-500 mb-2 block">المعلومات الشخصية</Label>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <div className="text-sm text-gray-500">العمر</div>
                          <div className="font-medium">{calculatePatientAge(appointment?.patient?.birthDate)}</div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-500">الجنس</div>
                          <div className="font-medium">{appointment?.patient?.gender === 'male' ? 'ذكر' : 'أنثى'}</div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-500">فصيلة الدم</div>
                          <div className="font-medium">{appointment?.patient?.bloodType || "غير معروفة"}</div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-500">الوزن</div>
                          <div className="font-medium">{appointment?.patient?.weight ? `${appointment.patient.weight} كجم` : "-"}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <Separator className="my-6" />
                
                <div className="flex justify-end">
                  <Button 
                    variant="outline" 
                    className="gap-2"
                    onClick={() => navigate(`/patients/${appointment?.patient?.id}`)}>
                    عرض الملف الطبي الكامل
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Medical Details */}
            <Tabs defaultValue="notes" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="notes">ملاحظات الحجز</TabsTrigger>
                <TabsTrigger value="diagnosis">التشخيص</TabsTrigger>
                <TabsTrigger value="treatment">العلاج</TabsTrigger>
              </TabsList>
              
              <TabsContent value="notes" className="space-y-4">
                <Card>
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <div>
                        <Label className="text-sm text-gray-500 mb-2 block">ملاحظات مبدئية</Label>
                        <Textarea
                          className="min-h-[100px] mb-4"
                          placeholder="أدخل ملاحظات الحجز هنا..."
                          value={editData.notes}
                          onChange={(e) => handleEditChange("notes", e.target.value)}
                        />
                        <div className="flex justify-end">
                          <Button 
                            onClick={handleSaveEdit}
                            disabled={isUpdating}
                            className="gap-2"
                          >
                            {isUpdating ? (
                              <>
                                <div className="size-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                جاري الحفظ...
                              </>
                            ) : (
                              "حفظ الملاحظات"
                            )}
                          </Button>
                        </div>
                      </div>
                      
                      <div>
                        <Label className="text-sm text-gray-500 mb-2 block">تاريخ الأعراض</Label>
                        <div className="bg-gray-50 rounded-lg p-4 border">
                          <p className="text-gray-700">
                            {appointment?.symptomsHistory || "غير مسجل"}
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="diagnosis">
                <Card>
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Label className="text-sm text-gray-500">التشخيص الأولي</Label>
                        <Switch checked={appointment?.diagnosisConfirmed} />
                      </div>
                      <Textarea 
                        className="min-h-[200px]"
                        placeholder="أدخل التشخيص هنا..."
                        value={editData.diagnosis}
                        onChange={(e) => handleEditChange("diagnosis", e.target.value)}
                      />
                      <div className="flex justify-end">
                        <Button 
                          onClick={handleSaveEdit}
                          disabled={isUpdating}
                          className="gap-2"
                        >
                          {isUpdating ? (
                            <>
                              <div className="size-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                              جاري الحفظ...
                            </>
                          ) : (
                            "حفظ التشخيص"
                          )}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="treatment">
                <Card>
                  <CardContent className="p-6">
                    <Textarea 
                      className="min-h-[200px]"
                      placeholder="أدوصف العلاج الموصى به هنا..."
                      value={editData.treatment}
                      onChange={(e) => handleEditChange("treatment", e.target.value)}
                    />
                    <div className="flex justify-end mt-4">
                      <Button 
                        onClick={handleSaveEdit}
                        disabled={isUpdating}
                        className="gap-2"
                      >
                        {isUpdating ? (
                          <>
                            <div className="size-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            جاري الحفظ...
                          </>
                        ) : (
                          "حفظ العلاج"
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Right Column - Quick Info & Actions */}
          <div className="space-y-6">
            {/* Quick Actions Card */}
            <Card>
              <CardHeader>
                <CardTitle>إجراءات سريعة</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start gap-3" onClick={handleSendPatientReminder}>
                  <MessageSquare className="size-4" />
                  إرسال تذكير
                </Button>
                <Button variant="outline" className="w-full justify-start gap-3" onClick={handleCallPatient}>
                  <Phone className="size-4" />
                  اتصال بالمريض
                </Button>
                <Button variant="outline" className="w-full justify-start gap-3" onClick={handleWritePrescription}>
                  <FileText className="size-4" />
                  كتابة وصفة
                </Button>
                <Button variant="outline" className="w-full justify-start gap-3" onClick={handleSharePrescriptionWhatsApp}>
                  <MessageSquare className="size-4" />
                  إرسال الوصفة عبر واتساب
                </Button>
              </CardContent>
            </Card>

            {/* Appointment Time Card */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-3">
                  <Calendar className="size-5 text-blue-600" />
                  موعد الكشف
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600 mb-2">
                      {format(new Date(appointment?.date), "d", {locale: ar})}
                    </div>
                    <div className="text-lg font-semibold">
                      {format(new Date(appointment?.date), "MMMM yyyy", {locale: ar})}
                    </div>
                    <div className="text-gray-500 mt-1">
                      {format(new Date(appointment?.date), "EEEE", {locale: ar})}
                    </div>
                  </div>
                    
                    <Separator />
                    
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-gray-600">
                          <Clock className="size-4" />
                          <span>الوقت:</span>
                        </div>
                        <div className="font-bold">{format(new Date(appointment?.date), "hh:mm a", {locale: ar})}</div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-gray-600">
                          <MapPin className="size-4" />
                          <span>المكان:</span>
                        </div>
                        <div className="font-medium">العيادة {appointment?.clinicNumber || "1"}</div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-gray-600">
                          <User className="size-4" />
                          <span>الطبيب:</span>
                        </div>
                        <div className="font-medium">د. {appointment?.doctor?.name || "أحمد محمد"}</div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-gray-600">
                          <Clock className="size-4" />
                          <span>تم الإنشاء:</span>
                        </div>
                        <div className="font-medium">{format(new Date(appointment?.created_at), "d MMMM yyyy - hh:mm a", {locale: ar})}</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button className="w-full gap-2" onClick={handleSendPatientReminder}>
                    <MessageSquare className="size-4" />
                    إرسال تذكير
                  </Button>
                </CardFooter>
            </Card>

            {/* Financial Card - Hidden */}
            {/* <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-3">
                  <Wallet className="size-5 text-green-600" />
                  التفاصيل المالية
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">سعر الكشف:</span>
                      <span className="font-bold text-lg">{appointment?.price?.toFixed(2) || "0.00"} ج.م</span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">الخصم:</span>
                      <span className="text-red-600">- {(appointment?.discount || 0).toFixed(2)} ج.م</span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">الضريبة:</span>
                      <span className="text-gray-600">+ {(appointment?.tax || 0).toFixed(2)} ج.م</span>
                    </div>
                    
                    <Separator className="my-2" />
                    
                    <div className="flex justify-between items-center pt-2">
                      <span className="font-bold text-gray-900">المبلغ الإجمالي:</span>
                      <span className="font-bold text-xl text-green-600">
                        {((appointment?.price || 0) - (appointment?.discount || 0) + (appointment?.tax || 0)).toFixed(2)} ج.م
                      </span>
                    </div>
                  </div>
                  
                  <div className="pt-4 space-y-3">
                    <div>
                      <Label className="text-sm text-gray-500 mb-2 block">طريقة الدفع</Label>
                      <div className="flex gap-2">
                        <Badge variant={appointment?.paymentMethod === 'cash' ? 'default' : 'outline'}>
                          نقدي
                        </Badge>
                        <Badge variant={appointment?.paymentMethod === 'card' ? 'default' : 'outline'}>
                          بطاقة
                        </Badge>
                        <Badge variant={appointment?.paymentMethod === 'insurance' ? 'default' : 'outline'}>
                          تأمين
                        </Badge>
                      </div>
                    </div>
                    
                    <div>
                      <Label className="text-sm text-gray-500 mb-2 block">حالة الدفع</Label>
                      <Badge variant={appointment?.paymentStatus === 'paid' ? 'success' : 'destructive'}>
                        {appointment?.paymentStatus === 'paid' ? 'مدفوع' : 'غير مدفوع'}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex-col gap-3">
                <Button variant="outline" className="w-full gap-2" onClick={handleRegisterPayment}>
                  <Wallet className="size-4" />
                  تسجيل الدفع
                </Button>
                <Button variant="ghost" className="w-full gap-2" onClick={handleGenerateInvoice}>
                  <FileText className="size-4" />
                  إصدار فاتورة
                </Button>
              </CardFooter>
            </Card> */}

            {/* Next Appointment */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">الموعد القادم</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-4">
                  <div className="text-gray-500 mb-2">لا يوجد موعد قادم</div>
                  <Button variant="outline" size="sm" onClick={handleBookFollowUp}>
                    حجز متابعة
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Edit Appointment Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3 text-lg">
              <Edit className="size-5" />
              تعديل بيانات الحجز
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            <Tabs defaultValue="basic" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="basic">البيانات الأساسية</TabsTrigger>
                <TabsTrigger value="medical">المعلومات الطبية</TabsTrigger>
                <TabsTrigger value="financial">المالية</TabsTrigger>
              </TabsList>
              
              <TabsContent value="basic" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="date" className="flex items-center gap-2">
                      <Calendar className="size-4" />
                      التاريخ والوقت *
                    </Label>
                    <Input
                      id="date"
                      type="datetime-local"
                      value={
                        editData.date
                          ? new Date(editData.date).toISOString().slice(0, 16)
                          : ""
                      }
                      onChange={(e) => handleEditChange("date", e.target.value)}
                      className="w-full"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="status">حالة الحجز</Label>
                    <select
                      id="status"
                      value={editData.status}
                      onChange={(e) => handleEditChange("status", e.target.value)}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                    >
                      {Object.entries(statusConfig).map(([key, config]) => (
                        <option key={key} value={key}>{config.label}</option>
                      ))}
                    </select>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="notes" className="flex items-center gap-2">
                    <FileText className="size-4" />
                    ملاحظات الحجز
                  </Label>
                  <Textarea
                    id="notes"
                    value={editData.notes}
                    onChange={(e) => handleEditChange("notes", e.target.value)}
                    placeholder="أدخل أي ملاحظات مهمة بخصوص الحجز..."
                    className="w-full min-h-[100px]"
                    rows={4}
                  />
                </div>
              </TabsContent>
              
              <TabsContent value="medical" className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="diagnosis">التشخيص</Label>
                  <Textarea
                    id="diagnosis"
                    value={editData.diagnosis}
                    onChange={(e) => handleEditChange("diagnosis", e.target.value)}
                    placeholder="أدخل التشخيص..."
                    className="min-h-[150px]"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="treatment">العلاج الموصى به</Label>
                  <Textarea
                    id="treatment"
                    value={editData.treatment}
                    onChange={(e) => handleEditChange("treatment", e.target.value)}
                    placeholder="أدخل تفاصيل العلاج..."
                    className="min-h-[150px]"
                  />
                </div>
              </TabsContent>
              
              <TabsContent value="financial" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="price" className="flex items-center gap-2">
                      <Wallet className="size-4" />
                      السعر (جنية مصري)
                    </Label>
                    <div className="relative">
                      <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                        ج.م
                      </span>
                      <Input
                        id="price"
                        type="number"
                        value={editData.price}
                        onChange={(e) => handleEditChange("price", e.target.value)}
                        placeholder="0.00"
                        className="w-full pr-12"
                        min="0"
                        step="0.01"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="discount">الخصم</Label>
                    <Input
                      id="discount"
                      type="number"
                      value={appointment?.discount || 0}
                      onChange={(e) => handleEditChange("discount", e.target.value)}
                      className="w-full"
                      min="0"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="paymentMethod">طريقة الدفع</Label>
                    <select
                      id="paymentMethod"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                    >
                      <option value="cash">نقدي</option>
                      <option value="card">بطاقة</option>
                      <option value="insurance">تأمين</option>
                    </select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="paymentStatus">حالة الدفع</Label>
                    <select
                      id="paymentStatus"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                    >
                      <option value="pending">معلق</option>
                      <option value="paid">مدفوع</option>
                      <option value="partial">جزئي</option>
                    </select>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
            
            <DialogFooter className="flex flex-col sm:flex-row gap-3 pt-6 border-t">
              <Button
                variant="outline"
                onClick={() => setIsEditModalOpen(false)}
                className="w-full sm:w-auto">
                إلغاء
              </Button>
              <Button
                onClick={handleSaveEdit}
                disabled={isUpdating}
                className="w-full sm:w-auto gap-2 bg-blue-600 hover:bg-blue-700">
                {isUpdating ? (
                  <>
                    <div className="size-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    جاري الحفظ...
                  </>
                ) : (
                  "حفظ التغييرات"
                )}
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      {/* Prescription Dialog */}
      <Dialog open={showPrescriptionDialog} onOpenChange={setShowPrescriptionDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="size-5" />
              كتابة وصفة طبية
            </DialogTitle>
          </DialogHeader>
          <div className="py-4 max-h-[70vh] overflow-y-auto">
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold mb-2">تفاصيل الوصفة</h3>
                <p className="text-gray-600 text-sm">سيتم إنشاء وصفة طبية للحجز الحالي</p>
              </div>
              
              {/* Prescription Form with Multiple Medications */}
              <div className="space-y-6">
                {medications.map((med, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4 space-y-4">
                    <div className="flex justify-between items-center">
                      <h4 className="font-medium">الدواء #{index + 1}</h4>
                      {medications.length > 1 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeMedication(index)}
                          className="text-red-600 hover:text-red-800 hover:bg-red-50"
                        >
                          <X className="size-4" />
                        </Button>
                      )}
                    </div>
                    
                    <div>
                      <Label htmlFor={`medication-${index}`}>اسم الدواء</Label>
                      <Input 
                        id={`medication-${index}`}
                        placeholder="أدخل اسم الدواء"
                        value={med.name}
                        onChange={(e) => updateMedication(index, 'name', e.target.value)}
                        className="w-full"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor={`dosage-${index}`}>الجرعة</Label>
                      <Input 
                        id={`dosage-${index}`}
                        placeholder="مثال: ملعقة صغيرة مرتين يومياً"
                        value={med.dosage}
                        onChange={(e) => updateMedication(index, 'dosage', e.target.value)}
                        className="w-full"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor={`duration-${index}`}>مدة الاستخدام</Label>
                      <Input 
                        id={`duration-${index}`}
                        placeholder="مثال: 7 أيام"
                        value={med.duration}
                        onChange={(e) => updateMedication(index, 'duration', e.target.value)}
                        className="w-full"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor={`instructions-${index}`}>تعليمات خاصة</Label>
                      <Textarea 
                        id={`instructions-${index}`}
                        placeholder="أدخل أي تعليمات خاصة لاستخدام الدواء"
                        value={med.instructions}
                        onChange={(e) => updateMedication(index, 'instructions', e.target.value)}
                        className="min-h-[80px]"
                      />
                    </div>
                  </div>
                ))}
                
                <Button 
                  variant="outline" 
                  onClick={addMedication}
                  className="w-full gap-2"
                >
                  <Plus className="size-4" />
                  إضافة دواء آخر
                </Button>
              </div>
              
              <div className="flex justify-end gap-3 pt-4">
                <Button variant="outline" onClick={() => setShowPrescriptionDialog(false)}>
                  إلغاء
                </Button>
                <Button onClick={handleCreatePrescription}>
                  إنشاء الوصفة
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Payment Dialog */}
      <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Wallet className="size-5" />
              تسجيل دفع الحجز
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>المبلغ المطلوب</Label>
                  <div className="text-2xl font-bold text-green-600">
                    {((appointment?.price || 0) - (appointment?.discount || 0) + (appointment?.tax || 0)).toFixed(2)} ج.م
                  </div>
                </div>
                <div>
                  <Label>المبلغ المدفوع</Label>
                  <Input type="number" placeholder="0.00" />
                </div>
              </div>
              <div>
                <Label>طريقة الدفع</Label>
                <select className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background">
                  <option value="cash">نقدي</option>
                  <option value="card">بطاقة</option>
                  <option value="insurance">تأمين</option>
                </select>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <Button variant="outline" onClick={() => setShowPaymentDialog(false)}>
                  إلغاء
                </Button>
                <Button>
                  تسجيل الدفع
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Call Dialog */}
      <Dialog open={showCallDialog} onOpenChange={setShowCallDialog}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Phone className="size-5" />
              اتصال بالمريض
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <div className="space-y-4">
              <div className="text-center">
                <div className="text-lg font-semibold">{appointment?.patient?.name}</div>
                <div className="text-gray-600">{appointment?.patient?.phone}</div>
              </div>
              <div className="flex justify-center gap-3 pt-4">
                <Button variant="outline" onClick={() => setShowCallDialog(false)}>
                  إلغاء
                </Button>
                <Button className="gap-2">
                  <Phone className="size-4" />
                  اتصال
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Invoice Dialog */}
      <Dialog open={showInvoiceDialog} onOpenChange={setShowInvoiceDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="size-5" />
              إصدار فاتورة
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold mb-2">تفاصيل الفاتورة</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>سعر الكشف:</span>
                    <span>{appointment?.price?.toFixed(2) || "0.00"} ج.م</span>
                  </div>
                  <div className="flex justify-between text-red-600">
                    <span>الخصم:</span>
                    <span>- {(appointment?.discount || 0).toFixed(2)} ج.م</span>
                  </div>
                  <div className="flex justify-between">
                    <span>الضريبة:</span>
                    <span>+ {(appointment?.tax || 0).toFixed(2)} ج.م</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-bold">
                    <span>المجموع:</span>
                    <span>{((appointment?.price || 0) - (appointment?.discount || 0) + (appointment?.tax || 0)).toFixed(2)} ج.م</span>
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <Button variant="outline" onClick={() => setShowInvoiceDialog(false)}>
                  إلغاء
                </Button>
                <Button className="gap-2">
                  <Download className="size-4" />
                  تنزيل الفاتورة
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Follow-up Dialog */}
      <Dialog open={showFollowUpDialog} onOpenChange={setShowFollowUpDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Calendar className="size-5" />
              حجز متابعة
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>تاريخ المتابعة</Label>
                  <Input type="date" />
                </div>
                <div>
                  <Label>وقت المتابعة</Label>
                  <Input type="time" />
                </div>
              </div>
              <div>
                <Label>ملاحظات المتابعة</Label>
                <Textarea placeholder="أدخل ملاحظات المتابعة..." className="min-h-[80px]" />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <Button variant="outline" onClick={() => setShowFollowUpDialog(false)}>
                  إلغاء
                </Button>
                <Button>
                  حجز المتابعة
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}