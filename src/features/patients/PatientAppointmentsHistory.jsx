import { format } from "date-fns"
import { ar } from "date-fns/locale"
import { Card, CardContent, CardHeader } from "../../components/ui/card"
import { Badge } from "../../components/ui/badge"
import { SkeletonBlock } from "../../components/ui/skeleton"
import { PATIENT_DETAIL_PAGE_SIZE } from "../../constants/pagination"
import { useState } from "react"

const statusMap = {
  pending: { label: "قيد الانتظار", variant: "secondary" },
  confirmed: { label: "مؤكد", variant: "default" },
  completed: { label: "مكتمل", variant: "outline" },
  cancelled: { label: "ملغي", variant: "destructive" },
}

export default function PatientAppointmentsHistory({ appointments, isLoading }) {
  const [currentPage, setCurrentPage] = useState(1)
  
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <div className="h-6 w-32 bg-gray-200 rounded animate-pulse"></div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <SkeletonBlock key={i} className="h-16" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  // Pagination logic
  const startIndex = (currentPage - 1) * PATIENT_DETAIL_PAGE_SIZE
  const endIndex = startIndex + PATIENT_DETAIL_PAGE_SIZE
  const paginatedAppointments = appointments?.slice(startIndex, endIndex) || []
  const totalPages = Math.ceil((appointments?.length || 0) / PATIENT_DETAIL_PAGE_SIZE)

  return (
    <Card>
      <CardHeader>
        <h3 className="text-lg font-semibold">سجل الحجوزات</h3>
      </CardHeader>
      <CardContent>
        {appointments && appointments.length > 0 ? (
          <>
            <div className="space-y-3">
              {paginatedAppointments.map((appointment) => (
                <div key={appointment.id} className="flex items-center justify-between p-3 rounded-[var(--radius)] border border-border">
                  <div className="flex-1">
                    <div className="flex justify-between">
                      <div className="text-sm text-muted-foreground">
                        {appointment.date ? format(new Date(appointment.date), "dd MMMM yyyy - hh:mm a", { locale: ar }) : "غير محدد"}
                      </div>
                      <div className="text-sm font-medium">
                        {appointment.price ? `${appointment.price.toFixed(2)} جنيه` : "0.00 جنيه"}
                      </div>
                    </div>
                    <div className="font-medium">{appointment.notes}</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      تم الإنشاء: {appointment.created_at ? format(new Date(appointment.created_at), "dd/MM/yyyy - hh:mm a", { locale: ar }) : "غير محدد"}
                    </div>
                </div>
                <Badge variant={statusMap[appointment.status]?.variant || "secondary"}>
                  {statusMap[appointment.status]?.label || appointment.status}
                </Badge>
              </div>
            ))}
          </div>
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-border px-3 py-2 mt-4">
              <div className="text-xs text-muted-foreground">
                {startIndex + 1}-{Math.min(endIndex, appointments.length)} من {appointments.length}
              </div>
              <div className="flex items-center gap-1">
                <button
                  className="px-2 py-1 rounded-[var(--radius)] bg-muted text-xs disabled:opacity-50"
                  disabled={currentPage <= 1}
                  onClick={() => setCurrentPage(prev => prev - 1)}
                >
                  السابق
                </button>
                <span className="px-2 py-1 rounded-[var(--radius)] bg-muted text-xs">
                  الصفحة {currentPage} من {totalPages}
                </span>
                <button
                  className="px-2 py-1 rounded-[var(--radius)] bg-muted text-xs disabled:opacity-50"
                  disabled={currentPage >= totalPages}
                  onClick={() => setCurrentPage(prev => prev + 1)}
                >
                  التالي
                </button>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-8 text-muted-foreground">
          لا توجد حجوزات سابقة لهذا المريض
        </div>
      )}
    </CardContent>
  </Card>
)
}