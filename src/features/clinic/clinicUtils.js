// Helper function to get Arabic day names
export const getDayName = (day) => {
    const days = {
        saturday: "السبت",
        sunday: "الأحد",
        monday: "الاثنين",
        tuesday: "الثلاثاء",
        wednesday: "الأربعاء",
        thursday: "الخميس",
        friday: "الجمعة",
    };
    return days[day] || day;
};

// Initialize available time structure with defaults
export const initializeAvailableTime = (clinicAvailableTime) => {
    const defaultTimeStructure = {
        saturday: { start: "", end: "", off: false },
        sunday: { start: "", end: "", off: false },
        monday: { start: "", end: "", off: false },
        tuesday: { start: "", end: "", off: false },
        wednesday: { start: "", end: "", off: false },
        thursday: { start: "", end: "", off: false },
        friday: { start: "", end: "", off: false },
    };

    const initializedAvailableTime = {};

    if (clinicAvailableTime) {
        Object.keys(defaultTimeStructure).forEach((day) => {
            initializedAvailableTime[day] = {
                ...defaultTimeStructure[day],
                ...(clinicAvailableTime[day] || {}),
            };
        });
    } else {
        Object.keys(defaultTimeStructure).forEach((day) => {
            initializedAvailableTime[day] = { ...defaultTimeStructure[day] };
        });
    }

    return initializedAvailableTime;
};

// Available permissions/routes
export const AVAILABLE_PERMISSIONS = [
    { id: "dashboard", label: "لوحة التحكم" },
    { id: "calendar", label: "المواعيد" },
    { id: "patients", label: "المرضى" },
    { id: "clinic", label: "العيادة" },
    { id: "finance", label: "الحسابات" },
    { id: "treatments", label: "الخطط العلاجية" },
    { id: "notifications", label: "الإشعارات" },
];

// Extended permissions for secretaries
export const SECRETARY_PERMISSIONS = [
    { id: "dashboard", label: "لوحة التحكم", description: "عرض إحصائيات العيادة العامة" },
    { id: "calendar", label: "المواعيد", description: "إدارة جدول المواعيد والزيارات" },
    { id: "patients", label: "المرضى", description: "إضافة وتعديل بيانات المرضى" },
    { id: "clinic", label: "العيادة", description: "عرض معلومات العيادة" },
    { id: "finance", label: "الحسابات", description: "عرض السجلات المالية" },
    { id: "treatments", label: "الخطط العلاجية", description: "إدارة الخطط العلاجية للمرضى" },
    { id: "notifications", label: "الإشعارات", description: "عرض الإشعارات والإشعارات" },
];