import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { Button } from "../../components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog";
import PatientForm from "./PatientForm";
import useCreatePatientOffline from "./useCreatePatientOffline";
export default function PatientCreateDialog({open, onClose, onPatientCreated, clinicId}) {
  const {
    register,
    handleSubmit,
    formState: {errors},
    reset,
  } = useForm();
  const {mutateAsync, isPending} = useCreatePatientOffline();
  async function onSubmit(values) {
    try {
      // Handle date of birth properly
      let dateOfBirth = null;
      if (values.date_of_birth && values.date_of_birth !== "") {
        dateOfBirth = values.date_of_birth;
      }
      
      const payload = {
        name: values.name,
        phone: values.phone || null,
        gender: values.gender,
        address: values.address || null,
        date_of_birth: dateOfBirth,
        blood_type: values.blood_type || null,
        clinic_id: clinicId
      };
      
      // Log the payload for debugging
      console.log("Patient creation payload:", payload);
      
      const newPatient = await mutateAsync(payload);
      toast.success("تم إضافة المريض بنجاح");
      reset();
      if (onPatientCreated) {
        onPatientCreated(newPatient);
      }
      onClose?.();
    } catch (e) {
      console.error("Error creating patient:", e);
      toast.error(e.message || "حدث خطأ أثناء إضافة المريض");
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">إضافة مريض جديد</DialogTitle>
          <p className="text-sm text-muted-foreground">
            أضف مريضًا جديدًا في أقل من 10 ثواني
          </p>
        </DialogHeader>
        
        <form id="create-patient-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <PatientForm register={register} errors={errors} />
        </form>
        
        <DialogFooter className="gap-3 sm:gap-0">
          <Button variant="outline" onClick={onClose} className="sm:mr-2">
            إلغاء
          </Button>
          <Button form="create-patient-form" type="submit" disabled={isPending} className="gap-2">
            {isPending ? (
              <>
                <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                جاري الإضافة...
              </>
            ) : (
              "إضافة المريض"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}