import { format } from "date-fns";
import { ar } from "date-fns/locale";
import {
    ArrowLeft,
    Calendar,
    Edit,
    FileText,
    MessageCircle,
    Pill,
    Printer
} from "lucide-react";
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardHeader } from "../../components/ui/card";
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "../../components/ui/dialog";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { SkeletonLine } from "../../components/ui/skeleton";
import { Textarea } from "../../components/ui/textarea";
import generatePrescriptionPdfNew from "../../lib/generatePrescriptionPdfNew";
import { useAuth } from "../auth/AuthContext";
import useClinic from "../auth/useClinic";
import usePlan from "../auth/usePlan";
import useUpdateVisit from "./useUpdateVisit";
import useVisit from "./useVisit";

export default function VisitDetailPage() {
  const {visitId} = useParams();
  const {data: visit, isLoading, error} = useVisit(visitId);
  const {data: clinic} = useClinic();
  const {user} = useAuth();
  const {data: planData} = usePlan();
  const navigate = useNavigate();
  const {mutate: updateVisit, isPending: isUpdating} = useUpdateVisit();
  const [isWhatsAppModalOpen, setIsWhatsAppModalOpen] = useState(false);
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [isFeatureRestrictedModalOpen, setIsFeatureRestrictedModalOpen] =
    useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editData, setEditData] = useState({
    diagnosis: "",
    notes: "",
    medications: [],
  });

  // Check if WhatsApp feature is enabled in the plan
  const isWhatsAppEnabled =
    planData?.plans?.limits?.features?.whatsapp === true;

  // Initialize edit data when visit loads
  useState(() => {
    if (visit && !editData.diagnosis) {
      setEditData({
        diagnosis: visit.diagnosis || "",
        notes: visit.notes || "",
        medications: visit.medications ? [...visit.medications] : [],
      });
    }
  }, [visit]);

  const handleGeneratePdf = async () => {
    if (visit && clinic && user) {
      try {
        await generatePrescriptionPdfNew(
          visit,
          user.name,
          clinic.name,
          clinic.address,
          false, // shareViaWhatsApp
          planData // Pass plan data for watermark feature
        );
      } catch (error) {
        console.error("Error in PDF generation:", error);
        alert("حدث خطأ أثناء إنشاء الروشتة. يرجى المحاولة مرة أخرى.");
      }
    } else {
      console.log("Missing data for PDF generation");
      alert(
        "لا توجد بيانات كافية لإنشاء الروشتة. يرجى التأكد من تحميل جميع البيانات."
      );
    }
  };

  const openWhatsAppModal = () => {
    // If WhatsApp is not enabled in the plan, show a modal and return
    if (!isWhatsAppEnabled) {
      setIsFeatureRestrictedModalOpen(true);
      return;
    }

    // Pre-fill with patient's phone number if available
    if (visit && visit.patient?.phone) {
      setWhatsappNumber(visit.patient.phone);
    }
    setIsWhatsAppModalOpen(true);
  };

  const handleWhatsAppShare = () => {
    if (!visit) {
      alert("لا توجد بيانات الكشف لمشاركتها");
      return;
    }

    // Format phone number for WhatsApp (remove any non-digit characters and add country code if needed)
    let formattedPhone = whatsappNumber.replace(/\D/g, "");

    // Assuming Egyptian phone numbers, add country code if not present
    if (formattedPhone.startsWith("0")) {
      formattedPhone = "2" + formattedPhone;
    } else if (!formattedPhone.startsWith("20")) {
      formattedPhone = "20" + formattedPhone;
    }

    // Create formatted medications list
    let medicationsList = "";
    if (
      visit.medications &&
      Array.isArray(visit.medications) &&
      visit.medications.length > 0
    ) {
      medicationsList = visit.medications
        .map(
          (med, index) =>
            `${index + 1}. ${med.name || ""}\n   ${med.using || ""}`
        )
        .join("\n\n");
    } else {
      medicationsList = "لا توجد أدوية محددة";
    }

    // Create WhatsApp message with only medications and welcome message
    const message = `*مرحباً بك في عيادة ${clinic?.name || "الطبيب"}*
        
نرجو منك الالتزام بالتعليمات التالية:

${medicationsList}

*تاريخ الزيارة:* ${
      visit.created_at
        ? new Date(visit.created_at).toLocaleDateString("ar-EG")
        : "غير محدد"
    }

نشكرك على ثقتك بعيادتنا!`;

    // Encode message for URL
    const encodedMessage = encodeURIComponent(message);

    // Create WhatsApp URL
    const whatsappUrl = `https://wa.me/${formattedPhone}?text=${encodedMessage}`;

    // Close modal and open WhatsApp in new tab
    setIsWhatsAppModalOpen(false);
    window.open(whatsappUrl, "_blank");
  };

  const openEditModal = () => {
    // Initialize edit data with current visit data
    setEditData({
      diagnosis: visit?.diagnosis || "",
      notes: visit?.notes || "",
      medications: visit?.medications ? [...visit.medications] : [],
    });
    setIsEditModalOpen(true);
  };

  const handleEditChange = (field, value) => {
    setEditData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleMedicationChange = (index, field, value) => {
    setEditData((prev) => {
      const newMedications = [...prev.medications];
      newMedications[index] = {
        ...newMedications[index],
        [field]: value,
      };
      return {
        ...prev,
        medications: newMedications,
      };
    });
  };

  const addMedication = () => {
    setEditData((prev) => ({
      ...prev,
      medications: [...prev.medications, {name: "", using: ""}],
    }));
  };

  const removeMedication = (index) => {
    setEditData((prev) => {
      const newMedications = [...prev.medications];
      newMedications.splice(index, 1);
      return {
        ...prev,
        medications: newMedications,
      };
    });
  };

  const handleSaveEdit = () => {
    updateVisit(
      {id: visitId, ...editData},
      {
        onSuccess: () => {
          setIsEditModalOpen(false);
          // Refresh the visit data
          window.location.reload();
        },
        onError: (error) => {
          alert("حدث خطأ أثناء تحديث بيانات الكشف: " + error.message);
        },
      }
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-8" dir="rtl">
        <div className="space-y-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <h1 className="text-2xl sm:text-3xl font-bold">تفاصيل الكشف</h1>
            <Button
              variant="ghost"
              className="gap-2 w-full sm:w-auto"
              onClick={() => navigate(-1)}>
              رجوع <ArrowLeft className="size-4" />
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">
            عرض تفاصيل الكشف الطبي.
          </p>
        </div>

        <Card>
          <CardHeader>
            <SkeletonLine width={180} height={20} />
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {Array.from({length: 4}).map((_, i) => (
                <div
                  key={i}
                  className="rounded-[var(--radius)] border border-border p-3">
                  <SkeletonLine width={100} height={12} />
                  <div className="mt-2">
                    <SkeletonLine height={16} />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-8" dir="rtl">
        <div className="space-y-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <h1 className="text-2xl sm:text-3xl font-bold">تفاصيل الكشف</h1>
            <Button
              variant="ghost"
              className="gap-2 w-full sm:w-auto"
              onClick={() => navigate(-1)}>
              رجوع <ArrowLeft className="size-4" />
            </Button>
          </div>
        </div>
        <Card>
          <CardContent className="py-8 text-center text-destructive">
            حدث خطأ أثناء تحميل تفاصيل الكشف: {error.message}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8" dir="rtl">
      <div className="space-y-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <h1 className="text-2xl sm:text-3xl font-bold">تفاصيل الكشف</h1>
          <Button
            variant="ghost"
            className="gap-2 w-full sm:w-auto"
            onClick={() => navigate(-1)}>
            رجوع <ArrowLeft className="size-4" />
          </Button>
        </div>
        <p className="text-sm text-muted-foreground">عرض تفاصيل الكشف الطبي.</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h3 className="text-lg font-semibold">معلومات الكشف</h3>
            <div className="flex flex-wrap gap-2">
              <Button
                onClick={openEditModal}
                variant="outline"
                size="sm"
                className="w-full sm:w-auto">
                <Edit className="size-4 ml-1" />
                تعديل
              </Button>
              {visit?.medications && visit.medications.length > 0 && (
                <>
                  <Button
                    onClick={openWhatsAppModal}
                    variant="outline"
                    size="sm"
                    className="w-full sm:w-auto"
                    // Disable button and show tooltip if WhatsApp is not enabled
                    title={
                      !isWhatsAppEnabled
                        ? "خطتك الحالية لا تدعم إرسال رسائل WhatsApp"
                        : ""
                    }>
                    <MessageCircle className="size-4 ml-1" />
                    مشاركة واتساب
                  </Button>
                  <Button
                    onClick={handleGeneratePdf}
                    variant="outline"
                    size="sm"
                    className="w-full sm:w-auto">
                    <Printer className="size-4 ml-1" />
                    طباعة الروشتة
                  </Button>
                </>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="rounded-[var(--radius)] border border-border p-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="size-4" />
                تاريخ الكشف
              </div>
              <div className="text-base mt-1">
                {visit?.created_at
                  ? format(
                      new Date(visit.created_at),
                      "dd MMMM yyyy - hh:mm a",
                      {locale: ar}
                    )
                  : "-"}
              </div>
            </div>

            <div className="rounded-[var(--radius)] border border-border p-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <FileText className="size-4" />
                التشخيص المبدئي
              </div>
              <div className="text-base mt-1">{visit?.diagnosis || "-"}</div>
            </div>

            <div className="sm:col-span-2 rounded-[var(--radius)] border border-border p-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <FileText className="size-4" />
                الملاحظات
              </div>
              <div className="text-base mt-1 whitespace-pre-wrap">
                {visit?.notes || "-"}
              </div>
            </div>

            <div className="sm:col-span-2 rounded-[var(--radius)] border border-border p-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-sm text-muted-foreground mb-2">
                <div className="flex items-center gap-2">
                  <Pill className="size-4" />
                  الأدوية
                </div>
              </div>
              {visit?.medications && visit.medications.length > 0 ? (
                <div className="space-y-3">
                  {visit.medications.map((medication, index) => (
                    <div
                      key={index}
                      className="border-b border-border pb-3 last:border-0 last:pb-0">
                      <div className="font-medium">{medication.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {medication.using}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-muted-foreground">لا توجد أدوية محددة</div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* WhatsApp Number Selection Modal */}
      <Dialog open={isWhatsAppModalOpen} onOpenChange={setIsWhatsAppModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>إرسال الروشتة عبر WhatsApp</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4">
              <Label htmlFor="phone" className="text-right sm:text-left">
                رقم الهاتف
              </Label>
              <div className="sm:col-span-3">
                <Input
                  id="phone"
                  value={whatsappNumber}
                  onChange={(e) => setWhatsappNumber(e.target.value)}
                  placeholder="أدخل رقم الهاتف"
                  className="w-full"
                />
                {visit?.patient?.phone && (
                  <p className="text-sm text-muted-foreground mt-2">
                    رقم المريض: {visit.patient.phone}
                  </p>
                )}
              </div>
            </div>
            <div className="flex flex-col sm:flex-row justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setIsWhatsAppModalOpen(false)}
                className="w-full sm:w-auto">
                إلغاء
              </Button>
              <Button
                onClick={handleWhatsAppShare}
                disabled={!whatsappNumber.trim()}
                className="w-full sm:w-auto">
                إرسال
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* WhatsApp Feature Not Available Modal */}
      <Dialog
        open={isFeatureRestrictedModalOpen}
        onOpenChange={setIsFeatureRestrictedModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>ميزة غير متوفرة</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-muted-foreground">
              خطتك الحالية لا تدعم إرسال رسائل WhatsApp للمرضى
            </p>
            <p className="text-muted-foreground mt-2">
              يرجى ترقية خطتك لتفعيل ميزة إرسال رسائل WhatsApp تلقائياً للمرضى.
            </p>
          </div>
          <DialogFooter>
            <Button onClick={() => setIsFeatureRestrictedModalOpen(false)}>
              إغلاق
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Visit Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>تعديل بيانات الكشف</DialogTitle>
          </DialogHeader>
          <div className="grid gap-6 py-4">
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <Label htmlFor="diagnosis">التشخيص المبدئي</Label>
                <Input
                  id="diagnosis"
                  value={editData.diagnosis}
                  onChange={(e) =>
                    handleEditChange("diagnosis", e.target.value)
                  }
                  placeholder="أدخل التشخيص المبدئي"
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">الملاحظات</Label>
                <Textarea
                  id="notes"
                  value={editData.notes}
                  onChange={(e) => handleEditChange("notes", e.target.value)}
                  placeholder="أدخل الملاحظات"
                  className="w-full"
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label>الأدوية</Label>
                  <Button variant="outline" onClick={addMedication} size="sm">
                    إضافة دواء
                  </Button>
                </div>

                <div className="space-y-3">
                  {editData.medications.map((med, index) => (
                    <div
                      key={index}
                      className="grid grid-cols-1 md:grid-cols-5 gap-2 p-3 border border-border rounded-md">
                      <div className="md:col-span-2">
                        <Input
                          value={med.name}
                          onChange={(e) =>
                            handleMedicationChange(
                              index,
                              "name",
                              e.target.value
                            )
                          }
                          placeholder="اسم الدواء"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <Input
                          value={med.using}
                          onChange={(e) =>
                            handleMedicationChange(
                              index,
                              "using",
                              e.target.value
                            )
                          }
                          placeholder="طريقة الاستخدام"
                        />
                      </div>
                      <div className="md:col-span-1">
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => removeMedication(index)}
                          className="w-full">
                          حذف
                        </Button>
                      </div>
                    </div>
                  ))}

                  {editData.medications.length === 0 && (
                    <div className="text-center py-4 text-muted-foreground">
                      لا توجد أدوية مضافة حالياً
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-end gap-2 pt-4">
              <Button
                variant="outline"
                onClick={() => setIsEditModalOpen(false)}
                className="w-full sm:w-auto">
                إلغاء
              </Button>
              <Button
                onClick={handleSaveEdit}
                disabled={isUpdating}
                className="w-full sm:w-auto">
                {isUpdating ? "جاري الحفظ..." : "حفظ التغييرات"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
