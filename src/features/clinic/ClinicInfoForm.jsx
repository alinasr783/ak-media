import { Button } from "../../components/ui/button"
import { Input } from "../../components/ui/input"
import { Label } from "../../components/ui/label"
import { Skeleton } from "../../components/ui/skeleton"
import WorkingHours from "./WorkingHours"
import { Copy, Building, MapPin, CreditCard, Link, Hash } from "lucide-react"
import { toast } from "sonner"
import { getDayName } from "./clinicUtils"

export default function ClinicInfoForm({
  clinicFormData,
  isClinicLoading,
  isClinicError,
  isUpdating,
  onClinicChange,
  onTimeChange,
  onDayToggle,
  onSubmit,
  clinicId,
}) {
  if (isClinicLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="space-y-3">
          <Skeleton className="h-8 w-40" />
          <Skeleton className="h-10 w-full" />
        </div>
        <div className="space-y-3">
          <Skeleton className="h-8 w-40" />
          <Skeleton className="h-10 w-full" />
        </div>
        <Skeleton className="h-32 w-full" />
      </div>
    )
  }

  if (isClinicError) {
    return (
      <div className="p-8 text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
          <span className="text-red-600 text-2xl">!</span>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">مشكلة في التحميل</h3>
        <p className="text-gray-500">تعذر تحميل معلومات العيادة. حاول مرة أخرى</p>
      </div>
    )
  }

  const copyBookingLink = () => {
    const link = `${window.location.origin}/booking/${clinicId}`
    navigator.clipboard.writeText(link)
    toast.success("تم نسخ رابط الحجز")
  }

  return (
    <form onSubmit={onSubmit} className="p-4 md:p-6">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-1">إعدادات العيادة</h2>
          <p className="text-gray-500 text-sm">عدل معلومات عيادتك وأوقات العمل</p>
        </div>

        {/* Clinic Name */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Building className="w-4 h-4 text-gray-500" />
            <Label htmlFor="clinicName" className="text-gray-700 font-medium">
              اسم العيادة
            </Label>
          </div>
          <Input
            id="clinicName"
            name="name"
            value={clinicFormData.name}
            onChange={onClinicChange}
            placeholder="أدخل اسم عيادتك"
            className="h-11 border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />
        </div>

        {/* Address */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-gray-500" />
            <Label htmlFor="clinicAddress" className="text-gray-700 font-medium">
              العنوان
            </Label>
          </div>
          <Input
            id="clinicAddress"
            name="address"
            value={clinicFormData.address}
            onChange={onClinicChange}
            placeholder="عنوان العيادة بالتفصيل"
            className="h-11 border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />
        </div>

        {/* Booking Price */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-gray-500" />
            <Label htmlFor="bookingPrice" className="text-gray-700 font-medium">
              سعر الحجز
            </Label>
          </div>
          <Input
            id="bookingPrice"
            name="booking_price"
            type="number"
            step="0.01"
            min="0"
            value={clinicFormData.booking_price}
            onChange={onClinicChange}
            placeholder="0.00"
            className="h-11 border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />
          <p className="text-xs text-gray-400">
            السعر اللي هيظهر للمريض وقت الحجز
          </p>
        </div>

        {/* Working Hours */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="w-4 h-4">⏰</span>
            <Label className="text-gray-700 font-medium">
              أوقات العمل
            </Label>
          </div>
          <WorkingHours
            availableTime={clinicFormData.available_time}
            onTimeChange={onTimeChange}
            onDayToggle={onDayToggle}
            getDayName={getDayName}
          />
        </div>

        {/* Booking Link */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Link className="w-4 h-4 text-gray-500" />
            <Label className="text-gray-700 font-medium">
              رابط الحجز
            </Label>
          </div>
          <div className="flex gap-2">
            <div className="flex-1 bg-gray-50 border border-gray-300 rounded-lg px-4 py-3 text-sm truncate">
              {`${window.location.origin}/booking/${clinicId}`}
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={copyBookingLink}
              className="h-11 px-4 border-gray-300 hover:bg-gray-50"
            >
              <Copy className="w-4 h-4" />
              <span className="mr-2">نسخ</span>
            </Button>
          </div>
          <p className="text-xs text-gray-400">
            شارك الرابط مع مرضاك عشان يحجزوا أونلاين
          </p>
        </div>

        {/* Clinic ID */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Hash className="w-4 h-4 text-gray-500" />
            <Label className="text-gray-700 font-medium">
              رقم العيادة
            </Label>
          </div>
          <Input 
            value={clinicId || ""} 
            disabled 
            className="h-11 bg-gray-50 text-gray-500"
          />
          <p className="text-xs text-gray-400">
            ده الرقم التعريفي بتاع عيادتك
          </p>
        </div>

        {/* Submit Button */}
        <div className="pt-4">
          <Button 
            type="submit" 
            disabled={isUpdating}
            className="h-11 w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white px-8 rounded-lg"
          >
            {isUpdating ? (
              <>
                <span className="mr-2">جاري الحفظ...</span>
                <span className="animate-spin">⟳</span>
              </>
            ) : "حفظ التغييرات"}
          </Button>
        </div>
      </div>
    </form>
  )
}