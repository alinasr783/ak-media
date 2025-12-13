import { Dialog, DialogHeader, DialogContent, DialogFooter } from "../../components/ui/dialog"
import { Button } from "../../components/ui/button"
import { useForm } from "react-hook-form"
import PatientForm from "./PatientForm"
import useUpdatePatient from "./useUpdatePatient"
import toast from "react-hot-toast"

export default function PatientEditDialog({ open, onClose, patient }) {
  const { register, handleSubmit, formState: { errors } } = useForm()
  const { mutateAsync, isPending } = useUpdatePatient()

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
      }
      await mutateAsync({ id: patient.id, values: payload })
      toast.success("تم تحديث بيانات المريض")
      onClose?.()
    } catch (e) {
      console.error("Error updating patient:", e);
      toast.error("حدث خطأ أثناء التحديث")
    }
  }

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogHeader>
        <h3 className="text-lg font-semibold">تعديل بيانات المريض</h3>
      </DialogHeader>
      <DialogContent>
        <form id="edit-patient-form" onSubmit={handleSubmit(onSubmit)}>
          <PatientForm defaultValues={patient ?? {}} register={register} errors={errors} />
        </form>
      </DialogContent>
      <DialogFooter>
        <Button variant="outline" onClick={onClose}>إلغاء</Button>
        <Button form="edit-patient-form" type="submit" disabled={isPending}>حفظ</Button>
      </DialogFooter>
    </Dialog>
  )
}

