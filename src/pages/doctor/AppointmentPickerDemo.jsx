import { useState } from "react";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import AppointmentTimePicker from "../../components/ui/appointment-time-picker";
import { Card, CardContent, CardHeader } from "../../components/ui/card";

export default function AppointmentPickerDemo() {
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);

  // Example time slots - يمكنك تخصيصها حسب ساعات عمل العيادة
  const customTimeSlots = [
    { time: "09:00", available: true },
    { time: "09:30", available: false }, // محجوز
    { time: "10:00", available: true },
    { time: "10:30", available: true },
    { time: "11:00", available: false }, // محجوز
    { time: "11:30", available: true },
    { time: "12:00", available: false }, // وقت الراحة
    { time: "12:30", available: false }, // وقت الراحة
    { time: "13:00", available: true },
    { time: "13:30", available: true },
    { time: "14:00", available: true },
    { time: "14:30", available: true },
    { time: "15:00", available: true },
    { time: "15:30", available: false }, // محجوز
    { time: "16:00", available: true },
    { time: "16:30", available: true },
    { time: "17:00", available: true },
    { time: "17:30", available: false }, // محجوز
  ];

  return (
    <div className="space-y-8 max-w-2xl mx-auto" dir="rtl">
      <div className="space-y-3">
        <h1 className="text-2xl font-bold">اختيار موعد الحجز</h1>
        <p className="text-sm text-muted-foreground">
          اختر التاريخ والوقت المناسب للموعد
        </p>
      </div>

      <Card>
        <CardHeader>
          <h3 className="font-semibold">التاريخ والوقت</h3>
        </CardHeader>
        <CardContent>
          <AppointmentTimePicker
            selectedDate={selectedDate}
            onDateChange={setSelectedDate}
            selectedTime={selectedTime}
            onTimeChange={setSelectedTime}
            availableTimeSlots={customTimeSlots}
          />
        </CardContent>
      </Card>

      {selectedDate && selectedTime && (
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="pt-6">
            <div className="text-center space-y-2">
              <p className="text-sm text-muted-foreground">الموعد المحدد</p>
              <p className="text-lg font-semibold">
                {format(selectedDate, "EEEE، d MMMM yyyy", { locale: ar })}
              </p>
              <p className="text-2xl font-bold text-primary">{selectedTime}</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
