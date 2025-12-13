import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Switch } from "../../components/ui/switch";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Badge } from "../../components/ui/badge";
import { 
  Copy, 
  ExternalLink, 
  QrCode, 
  Bell, 
  Calendar, 
  Clock, 
  Users,
  CheckCircle,
  XCircle,
  AlertCircle,
  Link,
  AlertTriangle,
  Check,
  X
} from "lucide-react";
import useClinic from "../auth/useClinic";
import useUpdateClinic from "../clinic/useUpdateClinic";
import toast from "react-hot-toast";
import QRCode from "react-qr-code";
import { useOnlineBookings } from "./useOnlineBookings";
import OnlineBookingsTable from "./OnlineBookingsTable"; // Import the new table component

export default function OnlineBookingControlPanel() {
  const { data: clinic, isLoading: isClinicLoading, isError, error } = useClinic();
  const { mutate: updateClinic, isPending: isUpdating } = useUpdateClinic();
  
  const [clinicFormData, setClinicFormData] = useState({
    booking_price: "",
    online_booking_enabled: true
  });
  
  const [showQRCode, setShowQRCode] = useState(false);
  
  // Use the real-time hook for online bookings
  // Use clinic_uuid instead of id since appointments table references clinic_uuid
  const { bookings, loading: bookingsLoading, error: bookingsError } = useOnlineBookings(clinic?.clinic_uuid);
  
  // Initialize form data when clinic loads
  useEffect(() => {
    if (!clinic) return;
    
    setClinicFormData({
      booking_price: clinic.booking_price || "",
      online_booking_enabled: clinic.online_booking_enabled !== undefined ? clinic.online_booking_enabled : true
    });
  }, [clinic]);
  
  const handleClinicChange = (e) => {
    const { name, value } = e.target;
    setClinicFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
  
  const toggleOnlineBooking = () => {
    const newValue = !clinicFormData.online_booking_enabled;
    setClinicFormData((prev) => ({
      ...prev,
      online_booking_enabled: newValue,
    }));
    
    // Immediately save the toggle state
    updateClinic({
      ...clinicFormData,
      online_booking_enabled: newValue
    });
  };
  
  const handleUpdateClinic = (e) => {
    e.preventDefault();
    updateClinic(clinicFormData);
  };
  
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success("تم نسخ النص إلى الحافظة");
  };
  
  const getBookingLink = () => {
    // Check if clinic data is available
    if (!clinic) return "";
    
    // Use clinic_uuid for the booking link
    const clinicId = clinic.clinic_uuid;
    if (!clinicId) return "";
    
    return `${window.location.origin}/booking/${clinicId}`;
  };
  
  const getEmbedCode = () => {
    const link = getBookingLink();
    if (!link) return "";
    return `<iframe src="${link}" width="100%" height="600" frameborder="0"></iframe>`;
  };
  
  const handleAcceptBooking = async (bookingId) => {
    try {
      // Update the appointment status to confirmed
      const response = await fetch(`/api/appointments/${bookingId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: 'confirmed' }),
      });
      
      if (!response.ok) throw new Error('Failed to accept booking');
      
      toast.success("تم قبول الحجز بنجاح");
    } catch (error) {
      console.error("Error accepting booking:", error);
      toast.error("فشل في قبول الحجز");
    }
  };

  const handleRejectBooking = async (bookingId) => {
    try {
      // Update the appointment status to cancelled
      const response = await fetch(`/api/appointments/${bookingId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: 'cancelled' }),
      });
      
      if (!response.ok) throw new Error('Failed to reject booking');
      
      toast.success("تم رفض الحجز بنجاح");
    } catch (error) {
      console.error("Error rejecting booking:", error);
      toast.error("فشل في رفض الحجز");
    }
  };
  
  if (isClinicLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-64 bg-gray-200 rounded animate-pulse"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 bg-gray-100 rounded animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }
  
  // Show error state if clinic data failed to load
  if (isError || !clinic) {
    return (
      <div className="space-y-8" dir="rtl">
        <div className="space-y-3">
          <h1 className="text-2xl font-bold">إدارة الحجز الإلكتروني</h1>
          <p className="text-sm text-muted-foreground">
            إدارة إعدادات الحجز الإلكتروني وعرض الطلبات الواردة
          </p>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
              خطأ في تحميل بيانات العيادة
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-red-500">
                {isError ? `فشل تحميل بيانات العيادة: ${error?.message || 'خطأ غير معروف'}` : 
                 "لم نتمكن من تحميل بيانات العيادة. يرجى التأكد من أنك قمت بتسجيل الدخول وأن لديك عيادة مرتبطة بحسابك."}
              </p>
              
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h3 className="font-medium text-yellow-800 mb-2">اقتراحات لحل المشكلة:</h3>
                <ul className="list-disc pr-5 space-y-1 text-yellow-700">
                  <li>تأكد من أنك قمت بتسجيل الدخول</li>
                  <li>تحقق من أن حسابك مرتبط بعيادة</li>
                  <li>حاول تحديث الصفحة</li>
                  <li>تواصل مع الدعم الفني إذا استمرت المشكلة</li>
                </ul>
              </div>
              
              <Button 
                onClick={() => window.location.reload()} 
                variant="outline"
                className="w-full"
              >
                تحديث الصفحة
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="space-y-8" dir="rtl">
      <div className="space-y-3">
        <h1 className="text-2xl font-bold">إدارة الحجز الإلكتروني</h1>
        <p className="text-sm text-muted-foreground">
          إدارة إعدادات الحجز الإلكتروني وعرض الطلبات الواردة
        </p>
      </div>
      
      {/* Online Booking Status Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>حالة الحجز الإلكتروني</span>
            <div className="flex items-center gap-2">
              <Switch
                checked={clinicFormData.online_booking_enabled}
                onCheckedChange={toggleOnlineBooking}
              />
              <Badge 
                variant={clinicFormData.online_booking_enabled ? "default" : "secondary"}
                className="gap-1"
              >
                {clinicFormData.online_booking_enabled ? (
                  <>
                    <CheckCircle className="h-4 w-4" />
                    مفعل
                  </>
                ) : (
                  <>
                    <XCircle className="h-4 w-4" />
                    معطل
                  </>
                )}
              </Badge>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            {clinicFormData.online_booking_enabled
              ? "الحجز الإلكتروني مفعل حالياً وسيظهر لمرضاك"
              : "الحجز الإلكتروني معطل ولن يظهر لمرضاك"}
          </p>
        </CardContent>
      </Card>
      
      {/* Booking Link Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Link className="h-5 w-5" />
            رابط الحجز الإلكتروني
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-2">
            <Input
              value={getBookingLink() || "جارٍ تحميل الرابط..."}
              readOnly
              className="flex-1"
            />
            <div className="flex gap-2">
              <Button
                onClick={() => copyToClipboard(getBookingLink())}
                className="gap-2"
                size="sm"
                disabled={!getBookingLink()}
              >
                <Copy className="h-4 w-4" />
                نسخ
              </Button>
              <Button
                onClick={() => window.open(getBookingLink(), "_blank")}
                variant="outline"
                className="gap-2"
                size="sm"
                disabled={!getBookingLink()}
              >
                <ExternalLink className="h-4 w-4" />
                فتح
              </Button>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2">
            <Button
              onClick={() => setShowQRCode(!showQRCode)}
              variant="outline"
              size="sm"
              className="gap-2"
              disabled={!getBookingLink()}
            >
              <QrCode className="h-4 w-4" />
              {showQRCode ? "إخفاء" : "عرض"} رمز QR
            </Button>
            
            <Button
              onClick={() => copyToClipboard(getEmbedCode())}
              variant="outline"
              size="sm"
              className="gap-2"
              disabled={!getBookingLink()}
            >
              <Copy className="h-4 w-4" />
              نسخ كود التضمين
            </Button>
          </div>
          
          {showQRCode && getBookingLink() && (
            <div className="mt-4 p-4 bg-white rounded-lg inline-block">
              <QRCode value={getBookingLink()} size={128} />
            </div>
          )}
          
          <p className="text-xs text-muted-foreground">
            شارك هذا الرابط مع مرضاك لحجز المواعيد، أو استخدم رمز QR في العيادة
          </p>
        </CardContent>
      </Card>
      
      {/* Booking Price Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            سعر الحجز الإلكتروني
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleUpdateClinic} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="bookingPrice">سعر الحجز</Label>
              <Input
                id="bookingPrice"
                name="booking_price"
                type="number"
                step="0.01"
                min="0"
                value={clinicFormData.booking_price}
                onChange={handleClinicChange}
                placeholder="أدخل سعر الحجز"
              />
              <p className="text-xs text-muted-foreground">
                سعر الحجز الذي سيظهر لمرضى العيادة عند الحجز الإلكتروني
              </p>
            </div>
            
            <Button type="submit" disabled={isUpdating}>
              {isUpdating ? "جاري الحفظ..." : "حفظ السعر"}
            </Button>
          </form>
        </CardContent>
      </Card>
      
      
      
      {/* Incoming Bookings Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            طلبات الحجز القادمة
          </CardTitle>
        </CardHeader>
        <CardContent>
          {bookingsLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 bg-gray-100 rounded animate-pulse"></div>
              ))}
            </div>
          ) : bookingsError ? (
            <div className="text-center py-8 text-red-500">
              <AlertTriangle className="h-12 w-12 mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">خطأ في تحميل الحجوزات</h3>
              <p>{bookingsError}</p>
            </div>
          ) : (
            <OnlineBookingsTable
              appointments={bookings}
              onAccept={handleAcceptBooking}
              onReject={handleRejectBooking}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
