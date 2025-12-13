import { useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { useParams } from "react-router-dom";
import AppointmentFormCard from "./AppointmentFormCard";
import BookingSuccessCard from "./BookingSuccessCard";
import ClinicInfoCard from "./ClinicInfoCard";
import ErrorState from "./ErrorState";
import LoadingState from "./LoadingState";
import PatientFormCard from "./PatientFormCard";
import StepIndicator from "./StepIndicator";
import { isAppointmentFormValid, validateWorkingHours } from "./bookingUtils";
import useClinicById from "./useClinicById";
import useCreateAppointmentPublic from "./useCreateAppointmentPublic";
import usePatientHandling from "./usePatientHandling";

export default function BookingPage() {
  const { clinicId } = useParams();
  const {
    data: clinic,
    isLoading: isClinicLoading,
    isError: isClinicError,
  } = useClinicById(clinicId);
  const {
    register: registerPatient,
    handleSubmit: handleSubmitPatient,
    formState: { errors: patientErrors },
    reset: resetPatient,
  } = useForm();
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm();
  const { mutate: createAppointment, isPending: isCreatingAppointment } =
    useCreateAppointmentPublic();
  const { handlePatientSubmit, isCreatingPatient } = usePatientHandling();

  const [selectedPatient, setSelectedPatient] = useState(null);
  const [isBookingComplete, setIsBookingComplete] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);

  // Check if online booking is enabled
  const isOnlineBookingEnabled = clinic?.online_booking_enabled !== false;

  const handlePatientFormSubmit = async (data) => {
    try {
      const patient = await handlePatientSubmit(data, clinicId);
      setSelectedPatient(patient);
      setCurrentStep(2);
    } catch (error) {
      console.error("Error submitting patient form:", error);
    }
  };

  // Handle appointment form submission
  const onSubmit = (data) => {
    if (!selectedPatient) {
      toast.error("يجب إدخال بيانات المريض أولاً");
      return;
    }

    if (!data.date) {
      toast.error("تاريخ ووقت الموعد مطلوب");
      return;
    }
    
    // Check if date is valid
    const date = new Date(data.date);
    if (isNaN(date.getTime())) {
      toast.error("تاريخ ووقت الموعد غير صحيح");
      return;
    }
    
    // Check if date is not in the past
    const now = new Date();
    if (date < now) {
      toast.error("لا يمكن اختيار تاريخ ووقت سابق");
      return;
    }

    const validationError = validateWorkingHours(
      data.date,
      clinic?.available_time
    );
    if (validationError) {
      toast.error(validationError);
      return;
    }

    createAppointment(
      {
        payload: {
          date: data.date,
          notes: data.notes,
          price: clinic?.booking_price || 0,
          patient_id: selectedPatient.id,
        },
        clinicId: clinicId,
      },
      {
        onSuccess: () => {
          setIsBookingComplete(true);
          reset();
        },
        onError: (error) => {
          console.error("Error creating appointment:", error);
          toast.error("حدث خطأ أثناء حجز الموعد");
        },
      }
    );
  };

  // Reset form and start over
  const handleReset = () => {
    setIsBookingComplete(false);
    reset();
    resetPatient();
    setSelectedPatient(null);
    setCurrentStep(1);
    setSelectedDate(null);
    setSelectedTime(null);
  };

  // Go back to patient form
  const handleBackToPatient = () => {
    setCurrentStep(1);
    setSelectedDate(null);
    setSelectedTime(null);
  };

  // Loading state
  if (isClinicLoading) {
    return <LoadingState />;
  }

  // Error state
  if (isClinicError) {
    return <ErrorState />;
  }

  // Check if online booking is disabled
  if (!isOnlineBookingEnabled) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-8 px-4 sm:py-12 flex items-center justify-center">
        <div className="max-w-md mx-auto text-center p-6 bg-white rounded-lg shadow-md">
          <div className="text-5xl mb-4">🔒</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            الحجز الإلكتروني معطل
          </h1>
          <p className="text-gray-600 mb-6">
            عذرًا، الحجز الإلكتروني غير متوفر حاليًا. يرجى التواصل مع العيادة مباشرة.
          </p>
          <button
            onClick={() => window.history.back()}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            العودة للصفحة السابقة
          </button>
        </div>
      </div>
    );
  }

  // Success state
  if (isBookingComplete) {
    return <BookingSuccessCard onReset={handleReset} />;
  }

  // Main booking page
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-8 px-4 sm:py-12">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-primary mb-2">
            حجز موعد
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base">
            احجز موعدك بسهولة في {clinic?.name}
          </p>
        </div>

        {/* Clinic Info */}
        <ClinicInfoCard clinic={clinic} />

        {/* Step Indicator */}
        <StepIndicator currentStep={currentStep} />

        {/* Patient Form - Step 1 */}
        {currentStep === 1 && (
          <PatientFormCard
            register={registerPatient}
            errors={patientErrors}
            onSubmit={handleSubmitPatient(handlePatientFormSubmit)}
            isLoading={isCreatingPatient}
          />
        )}

        {/* Appointment Form - Step 2 */}
        {currentStep === 2 && selectedPatient && (
          <AppointmentFormCard
            register={register}
            errors={errors}
            watch={watch}
            setValue={setValue}
            onSubmit={handleSubmit(onSubmit)}
            isLoading={isCreatingAppointment}
            clinic={clinic}
            selectedPatient={selectedPatient}
            onChangePatient={handleBackToPatient}
            validateWorkingHours={validateWorkingHours}
            isAppointmentFormValid={isAppointmentFormValid}
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
            selectedTime={selectedTime}
            setSelectedTime={setSelectedTime}
          />
        )}
      </div>
    </div>
  );
}