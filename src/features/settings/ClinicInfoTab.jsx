import { Button } from "../../components/ui/button";
import { Card, CardContent } from "../../components/ui/card";
import { Building } from "lucide-react";

export default function ClinicInfoTab() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold">بيانات العيادة</h2>
        <p className="text-sm text-muted-foreground">
          تم نقل قسم تعديل بيانات العيادة إلى صفحة العيادة الخاصة
        </p>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="text-center py-8">
            <div className="mx-auto size-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <Building className="size-8 text-primary" />
            </div>
            <h3 className="text-lg font-medium mb-2">تم نقل هذا القسم</h3>
            <p className="text-muted-foreground mb-4">
              يمكنك تعديل بيانات العيادة من خلال الانتقال إلى صفحة العيادة
            </p>
            <Button onClick={() => window.location.hash = "#/clinic"}>
              الانتقال إلى صفحة العيادة
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}