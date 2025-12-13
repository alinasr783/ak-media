import { Stethoscope } from "lucide-react";
import { Card, CardContent, CardHeader } from "../../components/ui/card";
import Activity from "./Activity";
import MiniSchedule from "./MiniSchedule";
import SubscriptionBanner from "./SubscriptionBanner";
import SummaryCards from "./SummaryCards";

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10 text-primary">
            <Stethoscope className="size-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">لوحة التحكم</h1>
            <p className="text-sm text-muted-foreground">
              نظرة عامة سريعة على نشاط العيادة.
            </p>
          </div>
        </div>
      </div>

      {/* Stats Summary */}
      <SummaryCards />

      {/* New Sections: Mini Schedule & Subscription Banner */}
      <div className="grid gap-6 lg:grid-cols-2">
        <MiniSchedule />
        <SubscriptionBanner />
      </div>

      {/* Recent Activity - Full Width */}
      <div className="grid gap-6">
        <Activity />
      </div>
    </div>
  );
}