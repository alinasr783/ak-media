import { useState } from "react"
import { Button } from "../../components/ui/button"
import { Card, CardContent } from "../../components/ui/card"
import { Input } from "../../components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select"

const statusOptions = [
  { value: "all", label: "جميع الحالات" },
  { value: "pending", label: "قيد الانتظار" },
  { value: "confirmed", label: "مؤكد" },
  { value: "completed", label: "مكتمل" },
  { value: "cancelled", label: "ملغي" },
]

const timeOptions = [
  { value: "all", label: "الجميع" },
  { value: "upcoming", label: "القادمة" },
]

const sourceOptions = [
  { value: "all", label: "جميع المصادر" },
  { value: "booking", label: "من الموقع" },
  { value: "clinic", label: "من العيادة" },
]

export default function AppointmentsFilter({ onFilterChange }) {
  const [date, setDate] = useState("")
  const [status, setStatus] = useState("all")
  const [time, setTime] = useState("all")
  const [source, setSource] = useState("all")

  const handleDateChange = (newDate) => {
    setDate(newDate)
    const statusValue = status === "all" ? "" : status
    const timeValue = time === "all" ? "" : time
    const sourceValue = source === "all" ? "" : source
    onFilterChange({ date: newDate, status: statusValue, time: timeValue, source: sourceValue })
  }

  const handleStatusChange = (newStatus) => {
    setStatus(newStatus)
    const statusValue = newStatus === "all" ? "" : newStatus
    const timeValue = time === "all" ? "" : time
    const sourceValue = source === "all" ? "" : source
    onFilterChange({ date, status: statusValue, time: timeValue, source: sourceValue })
  }

  const handleTimeChange = (newTime) => {
    setTime(newTime)
    const statusValue = status === "all" ? "" : status
    const timeValue = newTime === "all" ? "" : newTime
    const sourceValue = source === "all" ? "" : source
    onFilterChange({ date, status: statusValue, time: timeValue, source: sourceValue })
  }

  const handleSourceChange = (newSource) => {
    setSource(newSource)
    const statusValue = status === "all" ? "" : status
    const timeValue = time === "all" ? "" : time
    const sourceValue = newSource === "all" ? "" : newSource
    onFilterChange({ date, status: statusValue, time: timeValue, source: sourceValue })
  }

  const handleClearFilters = () => {
    setDate("")
    setStatus("all")
    setTime("all")
    setSource("all")
    onFilterChange({ date: "", status: "", time: "", source: "" })
  }

  return (
    <Card>
      <CardContent className="py-4 flex flex-wrap gap-3 items-end">
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium">تاريخ الموعد</label>
          <Input
            type="date"
            value={date}
            onChange={(e) => handleDateChange(e.target.value)}
            className="w-full sm:w-40"
          />
        </div>
        
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium">الحالة</label>
          <Select value={status} onValueChange={handleStatusChange}>
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue placeholder="اختر الحالة" />
            </SelectTrigger>
            <SelectContent>
              {statusOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium">الوقت</label>
          <Select value={time} onValueChange={handleTimeChange}>
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue placeholder="اختر الوقت" />
            </SelectTrigger>
            <SelectContent>
              {timeOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium">المصدر</label>
          <Select value={source} onValueChange={handleSourceChange}>
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue placeholder="اختر المصدر" />
            </SelectTrigger>
            <SelectContent>
              {sourceOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleClearFilters}>مسح الفلاتر</Button>
        </div>
      </CardContent>
    </Card>
  )
}