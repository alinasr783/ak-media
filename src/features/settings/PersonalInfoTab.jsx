import { useState, useEffect } from "react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Card, CardContent } from "../../components/ui/card";
import { useAuth } from "../auth/AuthContext";
import useUpdateProfile from "./useUpdateProfile";
import useClinic from "../auth/useClinic";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateClinic } from "../../services/apiClinic";
import toast from "react-hot-toast";

export default function PersonalInfoTab() {
  const { user } = useAuth();
  const { mutate: updateProfile, isPending: isProfilePending } = useUpdateProfile();
  
  // Clinic data hooks
  const { data: clinic, isLoading: isClinicLoading } = useClinic();
  const queryClient = useQueryClient();
  
  const { mutate: updateClinicData, isPending: isClinicPending } = useMutation({
    mutationFn: updateClinic,
    onSuccess: () => {
      queryClient.invalidateQueries(["clinic"]);
      // Only show success toast if we're not also updating profile (to avoid double toasts)
      // or rely on the profile update toast if both are happening
    },
    onError: (error) => {
      toast.error("حدث خطأ أثناء تحديث بيانات العيادة: " + error.message);
    }
  });
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    clinicName: "",
    clinicAddress: ""
  });

  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || ""
      }));
    }
  }, [user]);

  useEffect(() => {
    if (clinic && user?.role === 'doctor') {
      setFormData(prev => ({
        ...prev,
        clinicName: clinic.name || "",
        clinicAddress: clinic.address || ""
      }));
    }
  }, [clinic, user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Update profile
    updateProfile({
      name: formData.name,
      phone: formData.phone
    });
    
    // Update clinic if doctor and fields are changed
    if (user?.role === 'doctor') {
      updateClinicData({
        name: formData.clinicName,
        address: formData.clinicAddress
      });
    }
  };

  const isPending = isProfilePending || isClinicPending;

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-base sm:text-lg font-semibold">البيانات الشخصية</h2>
        <p className="text-xs sm:text-sm text-muted-foreground">
          قم بتحديث معلومات حسابك الشخصية{user?.role === 'doctor' ? ' وبيانات العيادة' : ''}
        </p>
      </div>

      <Card>
        <CardContent className="p-4 sm:p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="name" className="text-sm">الاسم</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="أدخل اسمك"
                className="text-sm"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-sm">البريد الإلكتروني</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="أدخل بريدك الإلكتروني"
                disabled
                className="text-sm bg-muted/50"
              />
              <p className="text-[10px] sm:text-xs text-muted-foreground">
                لا يمكن تغيير البريد الإلكتروني
              </p>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="phone" className="text-sm">رقم الهاتف</Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleChange}
                placeholder="أدخل رقم هاتفك"
                className="text-sm"
              />
            </div>

            {user?.role === 'doctor' && (
              <>
                <div className="border-t pt-4 mt-4">
                  <h3 className="text-sm font-semibold mb-3">بيانات العيادة</h3>
                </div>
                
                <div className="space-y-1.5">
                  <Label htmlFor="clinicName" className="text-sm">اسم العيادة</Label>
                  <Input
                    id="clinicName"
                    name="clinicName"
                    value={formData.clinicName}
                    onChange={handleChange}
                    placeholder="أدخل اسم العيادة"
                    className="text-sm"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="clinicAddress" className="text-sm">عنوان العيادة</Label>
                  <Input
                    id="clinicAddress"
                    name="clinicAddress"
                    value={formData.clinicAddress}
                    onChange={handleChange}
                    placeholder="أدخل عنوان العيادة"
                    className="text-sm"
                  />
                </div>
              </>
            )}

            <div className="pt-2 sm:pt-4">
              <Button type="submit" disabled={isPending} className="w-full sm:w-auto">
                {isPending ? "جاري الحفظ..." : "حفظ التغييرات"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}