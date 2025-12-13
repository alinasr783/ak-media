import useClinic from "./useClinic"

export default function ClinicInfo() {
  const { data: clinic, isLoading, error } = useClinic()

  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
        <div className="h-3 bg-gray-200 rounded w-24"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-sm text-gray-500">
        <p>لا توجد عيادة مرتبطة</p>
      </div>
    )
  }

  if (!clinic) return null

  return (
    <div className="text-sm">
      <p className="font-semibold text-gray-900">{clinic.name}</p>
      <p className="text-xs text-gray-500">{clinic.address}</p>
    </div>
  )
}
