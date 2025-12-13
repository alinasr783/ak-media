import {Card, CardContent, CardHeader} from "../../components/ui/card";
import {SkeletonLine} from "../../components/ui/skeleton";

export default function PlanSection({plan, isPlanLoading, isPlanError}) {
  return (
    <Card>
      <CardHeader>
        <h2 className="text-lg font-semibold">خطة الاشتراك</h2>
      </CardHeader>
      <CardContent>
        {isPlanLoading ? (
          <SkeletonLine className="h-4 w-1/3" />
        ) : isPlanError ? (
          <div className="text-destructive">
            حدث خطأ أثناء تحميل معلومات الاشتراك
          </div>
        ) : plan ? (
          <div className="p-4 border border-border rounded-lg">
            <h3 className="font-medium text-lg">
              {plan.plans?.name || "غير محدد"}
            </h3>
          </div>
        ) : (
          <div className="text-center py-4 text-muted-foreground">
            لا يوجد اشتراك مفعل حاليًا
          </div>
        )}
      </CardContent>
    </Card>
  );
}
