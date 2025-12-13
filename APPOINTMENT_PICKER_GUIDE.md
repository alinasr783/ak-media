# مكون اختيار التاريخ والوقت للمواعيد
# Appointment Date & Time Picker Component

مكون جميل ومتقدم لاختيار التاريخ والوقت للمواعيد، مبني على React DayPicker.

## المميزات

- ✅ تقويم تفاعلي مع تصميم عصري
- ✅ اختيار الوقت من قائمة منزلقة
- ✅ دعم كامل للغة العربية
- ✅ منع اختيار تواريخ سابقة
- ✅ تحديد الأوقات المتاحة/المحجوزة
- ✅ تصميم متجاوب (Mobile & Desktop)
- ✅ سهل التخصيص

## التثبيت

المكتبات المطلوبة مثبتة بالفعل:
```json
{
  "react-day-picker": "^9.11.2",
  "@radix-ui/react-scroll-area": "^2.x",
  "date-fns": "^4.1.0"
}
```

## الملفات المُنشأة

```
src/
├── components/ui/
│   ├── calendar.jsx                    # مكون التقويم
│   ├── scroll-area.jsx                 # مكون الـ Scroll Area
│   └── appointment-time-picker.jsx     # المكون الرئيسي
└── pages/doctor/
    └── AppointmentPickerDemo.jsx       # مثال الاستخدام
```

## طريقة الاستخدام

### استخدام أساسي

```jsx
import { useState } from "react";
import AppointmentTimePicker from "../../components/ui/appointment-time-picker";

function MyComponent() {
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);

  return (
    <AppointmentTimePicker
      selectedDate={selectedDate}
      onDateChange={setSelectedDate}
      selectedTime={selectedTime}
      onTimeChange={setSelectedTime}
    />
  );
}
```

### استخدام متقدم مع أوقات مخصصة

```jsx
import { useState } from "react";
import AppointmentTimePicker from "../../components/ui/appointment-time-picker";

function BookingPage() {
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);

  // تخصيص الأوقات المتاحة حسب ساعات عمل العيادة
  const clinicHours = [
    { time: "09:00", available: true },
    { time: "09:30", available: false },  // محجوز
    { time: "10:00", available: true },
    { time: "10:30", available: true },
    { time: "11:00", available: true },
    { time: "11:30", available: true },
    { time: "12:00", available: false },  // وقت راحة
    { time: "12:30", available: false },  // وقت راحة
    { time: "13:00", available: true },
    { time: "13:30", available: true },
    { time: "14:00", available: true },
    { time: "14:30", available: true },
    { time: "15:00", available: true },
    { time: "15:30", available: true },
    { time: "16:00", available: true },
    { time: "16:30", available: true },
    { time: "17:00", available: true },
  ];

  const handleBooking = () => {
    if (selectedDate && selectedTime) {
      console.log("Booking:", { date: selectedDate, time: selectedTime });
      // إرسال البيانات للـ API
    }
  };

  return (
    <div>
      <AppointmentTimePicker
        selectedDate={selectedDate}
        onDateChange={setSelectedDate}
        selectedTime={selectedTime}
        onTimeChange={setSelectedTime}
        availableTimeSlots={clinicHours}
      />
      <button onClick={handleBooking}>تأكيد الحجز</button>
    </div>
  );
}
```

## الخصائص (Props)

| الخاصية | النوع | مطلوب | الافتراضي | الوصف |
|---------|------|-------|-----------|-------|
| `selectedDate` | `Date` | لا | `new Date()` | التاريخ المحدد حالياً |
| `onDateChange` | `function` | لا | - | دالة تُستدعى عند تغيير التاريخ |
| `selectedTime` | `string` | لا | `null` | الوقت المحدد (مثل: "09:30") |
| `onTimeChange` | `function` | لا | - | دالة تُستدعى عند تغيير الوقت |
| `availableTimeSlots` | `Array` | لا | مواعيد افتراضية | قائمة الأوقات المتاحة |

## تنسيق `availableTimeSlots`

```javascript
const timeSlots = [
  { 
    time: "09:00",      // الوقت بصيغة HH:MM
    available: true     // هل الوقت متاح؟
  },
  { 
    time: "09:30", 
    available: false    // غير متاح (محجوز أو خارج ساعات العمل)
  },
  // ... المزيد
];
```

## التخصيص

### تغيير الألوان

المكون يستخدم متغيرات Tailwind CSS من المشروع:
- `primary` - اللون الأساسي
- `accent` - لون التمرير
- `border` - لون الحدود
- `muted-foreground` - النصوص الثانوية

### تغيير نطاق التواريخ

```jsx
<AppointmentTimePicker
  // السماح باختيار تواريخ من الغد فقط
  disabled={[
    { before: new Date(Date.now() + 86400000) }
  ]}
/>
```

## أمثلة الاستخدام في المشروع

### 1. في صفحة حجز المواعيد (Calendar)
```jsx
import AppointmentTimePicker from "../../components/ui/appointment-time-picker";

// داخل مكون إنشاء موعد جديد
<AppointmentTimePicker
  selectedDate={appointmentDate}
  onDateChange={setAppointmentDate}
  selectedTime={appointmentTime}
  onTimeChange={setAppointmentTime}
  availableTimeSlots={clinicWorkingHours}
/>
```

### 2. في صفحة الحجز الأونلاين (Booking Page)
```jsx
// يمكن جلب الأوقات المتاحة من API
const { data: availableSlots } = useAvailableSlots(clinicId, selectedDate);

<AppointmentTimePicker
  availableTimeSlots={availableSlots}
  // ... بقية الخصائص
/>
```

## الدعم

- ✅ React 19+
- ✅ دعم RTL كامل
- ✅ Tailwind CSS 4+
- ✅ تصميم متجاوب
- ✅ Accessibility (a11y)

## صورة توضيحية

المكون يعرض:
1. **التقويم** (يسار): لاختيار التاريخ
2. **قائمة الأوقات** (يمين): لاختيار الوقت المناسب

الأوقات المحجوزة تظهر معطلة (disabled) ولا يمكن اختيارها.

---

Built with ❤️ for Tabibi Clinic Management System
