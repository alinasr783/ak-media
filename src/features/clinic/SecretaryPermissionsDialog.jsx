import { useState } from "react";
import { Button } from "../../components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog";
import { Checkbox } from "../../components/ui/checkbox";
import { SECRETARY_PERMISSIONS } from "./clinicUtils"; // Changed from AVAILABLE_PERMISSIONS

export default function SecretaryPermissionsDialog({
  open,
  onOpenChange,
  secretary,
  selectedPermissions,
  onPermissionChange,
  onSave,
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent dir="rtl" className="max-w-md">
        <DialogHeader>
          <DialogTitle>تعديل صلاحيات السكرتير</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <h4 className="font-medium mb-2">الصلاحيات المتوفرة</h4>
            <div className="space-y-3">
              {SECRETARY_PERMISSIONS.map((permission) => (
                <div key={permission.id} className="flex items-start gap-3">
                  <Checkbox
                    id={permission.id}
                    className="mt-1"
                    checked={selectedPermissions.includes(permission.id)}
                    onCheckedChange={() => onPermissionChange(permission.id)}
                  />
                  <div className="grid gap-1">
                    <label htmlFor={permission.id} className="text-sm font-medium leading-none cursor-pointer">
                      {permission.label}
                    </label>
                    <p className="text-xs text-muted-foreground">
                      {permission.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 p-3 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">
                ملاحظة: صفحة الإعدادات متاحة دائماً للسكرتير كونها تحتوي على
                معلومات حسابه الشخصي
              </p>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              إلغاء
            </Button>
            <Button onClick={onSave}>حفظ التغييرات</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}