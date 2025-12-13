import {Search, UserPlus} from "lucide-react";
import {useState} from "react";
import {useForm} from "react-hook-form";
import {Button} from "../../components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog";
import {Input} from "../../components/ui/input";
import {Label} from "../../components/ui/label";
import {Textarea} from "../../components/ui/textarea";
import AppointmentTimePicker from "../../components/ui/appointment-time-picker";
import PatientCreateDialog from "../patients/PatientCreateDialog";
import useSearchPatients from "./useSearchPatients";
import useCreateAppointmentHandler from "./useCreateAppointmentHandler";
import useClinic from "../auth/useClinic";

export default function AppointmentCreateDialog({open, onClose}) {
  const {
    register,
    handleSubmit,
    formState: {errors},
    reset,
    setValue,
  } = useForm();
  const {handleAppointmentSubmit, isPending} = useCreateAppointmentHandler();
  const {data: clinicData} = useClinic();
  const [patientSearch, setPatientSearch] = useState("");
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [showPatientDialog, setShowPatientDialog] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const {data: searchResults, isLoading: isSearching} =
    useSearchPatients(patientSearch);

  const onSubmit = (data) => {
    // Combine date and time into a single datetime
    if (selectedDate && selectedTime) {
      // Parse 12-hour format time
      let [timePart, period] = selectedTime.split(' ');
      let [hours, minutes] = timePart.split(':').map(Number);
      
      // Convert to 24-hour format
      if (period === 'PM' && hours !== 12) {
        hours += 12;
      } else if (period === 'AM' && hours === 12) {
        hours = 0;
      }
      
      const appointmentDate = new Date(selectedDate);
      appointmentDate.setHours(hours, minutes, 0, 0);
      data.date = appointmentDate.toISOString();
    }
    
    // Validate that we have a date
    if (!data.date) {
      alert("يرجى اختيار التاريخ والوقت");
      return;
    }
    
    // Validate that the date is not in the past
    const selectedDateTime = new Date(data.date);
    const now = new Date();
    if (selectedDateTime < now) {
      alert("لا يمكن إنشاء موعد لتاريخ ووقت سابق");
      return;
    }
    
    handleAppointmentSubmit(data, selectedPatient, () => {
      reset();
      setSelectedPatient(null);
      setPatientSearch("");
      setSelectedDate(null);
      setSelectedTime(null);
      onClose();
    });
  };

  const handlePatientSelect = (patient) => {
    setSelectedPatient(patient);
    setPatientSearch(patient.name);
  };

  const handlePatientCreated = (newPatient) => {
    setSelectedPatient(newPatient);
    setPatientSearch(newPatient.name);
    setShowPatientDialog(false);
  };

  return (
    <>
      <Dialog
        open={open}
        onOpenChange={(isOpen) => {
          if (!isOpen) {
            reset();
            setSelectedPatient(null);
            setPatientSearch("");
            setSelectedDate(null);
            setSelectedTime(null);
            onClose();
          }
        }}>
        <DialogContent
          className="sm:max-w-[500px] max-h-[85vh] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
          dir="rtl">
          <DialogHeader>
            <DialogTitle>موعد جديد</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Patient Search */}
            <div className="space-y-2">
              <Label htmlFor="patient">المريض *</Label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute start-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                  <Input
                    id="patient"
                    className="ps-9"
                    placeholder="ابحث عن مريض بالاسم أو الهاتف"
                    value={patientSearch}
                    onChange={(e) => {
                      setPatientSearch(e.target.value);
                      setSelectedPatient(null);
                    }}
                  />
                </div>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowPatientDialog(true)}
                  className="gap-2">
                  <UserPlus className="size-4" />
                  جديد
                </Button>
              </div>

              {/* Patient Search Results */}
              {patientSearch.length >= 2 && !selectedPatient && (
                <div className="relative">
                  <div className="absolute z-10 w-full mt-1 bg-background border rounded-md shadow-lg max-h-60 overflow-y-auto">
                    {isSearching ? (
                      <div className="p-3 text-sm text-muted-foreground text-center">
                        جاري البحث...
                      </div>
                    ) : searchResults?.length > 0 ? (
                      <div className="divide-y">
                        {searchResults.map((patient) => (
                          <button
                            key={patient.id}
                            type="button"
                            className="w-full p-3 text-start hover:bg-muted transition-colors"
                            onClick={() => handlePatientSelect(patient)}>
                            <div className="font-medium truncate">
                              {patient.name}
                            </div>
                            <div className="text-xs text-muted-foreground truncate">
                              {patient.phone}
                            </div>
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div className="p-3 text-sm text-muted-foreground text-center">
                        لا توجد نتائج
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Selected Patient */}
              {selectedPatient && (
                <div className="p-3 border rounded-md bg-muted/50">
                  <div className="font-medium">{selectedPatient.name}</div>
                  <div className="text-sm text-muted-foreground">
                    {selectedPatient.phone}
                  </div>
                </div>
              )}

              {/* Patient Selection Error */}
              {patientSearch.length >= 2 && !selectedPatient && (
                <p className="text-sm text-red-500">
                  يجب اختيار مريض من القائمة
                </p>
              )}
            </div>

            {/* Date and Time */}
            <div className="space-y-2">
              <Label>التاريخ والوقت *</Label>
              <AppointmentTimePicker
                selectedDate={selectedDate}
                onDateChange={setSelectedDate}
                selectedTime={selectedTime}
                onTimeChange={setSelectedTime}
                clinicAvailableTime={clinicData?.available_time}
              />
              {(!selectedDate || !selectedTime) && (
                <p className="text-sm text-muted-foreground">
                  يرجى اختيار التاريخ والوقت المناسب
                </p>
              )}
              {selectedDate && (() => {
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                const selectedDateTime = new Date(selectedDate);
                selectedDateTime.setHours(0, 0, 0, 0);
                
                if (selectedDateTime < today) {
                  return (
                    <p className="text-sm text-red-500">
                      لا يمكن اختيار تاريخ سابق
                    </p>
                  );
                }
                return null;
              })()}
            </div>

            {/* Price */}
            <div className="space-y-2">
              <Label htmlFor="price">السعر</Label>
              <Input
                id="price"
                type="number"
                step="1.00"
                placeholder="0.00"
                {...register("price", {
                  required: "سعر الحجز مطلوب",
                  min: {value: 0, message: "السعر يجب أن يكون رقمًا موجبًا"},
                  validate: (value) => {
                    if (value === "" || isNaN(parseFloat(value))) {
                      return "سعر الحجز مطلوب ويجب أن يكون رقمًا";
                    }
                    return true;
                  },
                })}
              />
              {errors.price && (
                <p className="text-sm text-red-500">{errors.price.message}</p>
              )}
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes">نوع الحجز *</Label>
              <Textarea
                id="notes"
                placeholder="مثال: كشف، متابعة، استشارة..."
                {...register("notes", {required: "نوع الحجز مطلوب"})}
              />
              {errors.notes && (
                <p className="text-sm text-red-500">{errors.notes.message}</p>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-3 justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  reset();
                  setSelectedPatient(null);
                  setPatientSearch("");
                  setSelectedDate(null);
                  setSelectedTime(null);
                  onClose();
                }}
                disabled={isPending}>
                إلغاء
              </Button>
              <Button 
                type="submit" 
                disabled={isPending || !selectedPatient || !selectedDate || !selectedTime || (() => {
                  if (!selectedDate) return true;
                  const today = new Date();
                  today.setHours(0, 0, 0, 0);
                  const selectedDateTime = new Date(selectedDate);
                  selectedDateTime.setHours(0, 0, 0, 0);
                  return selectedDateTime < today;
                })()}
              >
                {isPending ? "جاري الإضافة..." : "إضافة موعد"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Patient Create Dialog */}
      <PatientCreateDialog
        open={showPatientDialog}
        onClose={() => setShowPatientDialog(false)}
        onPatientCreated={handlePatientCreated}
      />
    </>
  );
}
