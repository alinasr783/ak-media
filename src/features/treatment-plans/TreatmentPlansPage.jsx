import { Plus } from "lucide-react";
import { useState } from "react";
import { Button } from "../../components/ui/button";
import TreatmentTemplateCreateDialog from "./TreatmentTemplateCreateDialog";
import TreatmentTemplatesList from "./TreatmentTemplatesList";

export default function TreatmentPlansPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  return (
    <div className="space-y-8" dir="rtl">
      <div className="flex justify-between items-center">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold text-gray-900">العلاجات</h1>
          <p className="text-sm text-muted-foreground">
            إدارة العلاجات والبحث عنها
          </p>
        </div>
        <Button onClick={() => setIsDialogOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          إضافة علاج
        </Button>
      </div>
      
      <TreatmentTemplatesList />
      
      <TreatmentTemplateCreateDialog 
        open={isDialogOpen} 
        onClose={() => setIsDialogOpen(false)} 
      />
    </div>
  );
}