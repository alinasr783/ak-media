// Helper function to format time as 12-hour format with AM/PM
export const formatTime12 = (time24) => {
    if (!time24) return ""

    const [hours, minutes] = time24.split(":")
    let hour = parseInt(hours, 10)
    const minute = minutes

    // Validate input
    if (isNaN(hour) || hour < 0 || hour > 23) return time24;

    const period = hour >= 12 ? "مساءً" : "صباحًا"
    hour = hour % 12 || 12

    return `${hour}:${minute} ${period}`
}

// Helper function to get Arabic day name from day index (0-6, where 0 is Sunday)
export const getDayOfWeekArabic = (dayIndex) => {
    const days = {
        0: "الأحد",
        1: "الاثنين",
        2: "الثلاثاء",
        3: "الأربعاء",
        4: "الخميس",
        5: "الجمعة",
        6: "السبت"
    }
    return days[dayIndex] || ""
}

// Helper function to get day key for available_time object (saturday, sunday, etc.)
export const getDayKey = (dayIndex) => {
    const dayMap = {
        0: "sunday",
        1: "monday",
        2: "tuesday",
        3: "wednesday",
        4: "thursday",
        5: "friday",
        6: "saturday"
    }
    return dayMap[dayIndex] || ""
}

// Helper function to format time as HH:MM from a Date object
export const formatTime24 = (date) => {
    if (!(date instanceof Date) || isNaN(date.getTime())) return ""
    
    const hours = date.getHours().toString().padStart(2, '0')
    const minutes = date.getMinutes().toString().padStart(2, '0')
    return `${hours}:${minutes}`
}

// Validate if the selected date/time is within working hours and not a holiday
export const validateWorkingHours = (dateTimeString, availableTime) => {
    if (!availableTime) return null

    // Check if dateTimeString is valid
    if (!dateTimeString || typeof dateTimeString !== 'string') {
        return "تاريخ ووقت الموعد غير محدد"
    }

    const date = new Date(dateTimeString)
    
    // Check if date is valid
    if (isNaN(date.getTime())) {
        return "تاريخ ووقت الموعد غير صحيح"
    }

    const dayOfWeek = getDayOfWeekArabic(date.getDay())
    const timeString = formatTime24(date)

    // Check if timeString is valid
    if (!timeString) {
        return "وقت الموعد غير محدد"
    }

    const dayData = availableTime[getDayKey(date.getDay())]

    if (!dayData) return null

    if (dayData.off) {
        return `هذا اليوم (${dayOfWeek}) إجازة، لا يمكن الحجز في هذا اليوم`
    }

    if (!dayData.start || !dayData.end) {
        return `أوقات العمل لهذا اليوم (${dayOfWeek}) غير محددة`
    }

    // Validate time format
    if (!/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(dayData.start) || 
        !/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(dayData.end)) {
        return `أوقات العمل لهذا اليوم (${dayOfWeek}) بتنسيق غير صحيح`
    }

    if (timeString < dayData.start || timeString > dayData.end) {
        return `الوقت المحدد خارج أوقات العمل. أوقات العمل لهذا اليوم (${dayOfWeek}): من ${formatTime12(dayData.start)} إلى ${formatTime12(dayData.end)}`
    }

    return null
}

// Check if the appointment form is valid
export const isAppointmentFormValid = (appointmentDate, availableTime) => {
    if (!appointmentDate) return false
    const validationError = validateWorkingHours(appointmentDate, availableTime)
    return !validationError
}
