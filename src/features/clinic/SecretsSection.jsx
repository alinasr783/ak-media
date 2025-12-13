import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { SkeletonLine } from "../../components/ui/skeleton";
import SecretaryItem from "./SecretaryItem";
import SecretarySkeleton from "./SecretarySkeleton";
import { Button } from "../../components/ui/button";
import { Link } from "react-router-dom";
import { UserPlus } from "lucide-react";

export default function SecretsSection({
  secretaries,
  isSecretariesLoading,
  isSecretariesError,
  onUpdatePermissions,
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg font-semibold">السكرتير</CardTitle>
        <Button variant="outline" size="sm" asChild>
          <Link to="/staff">
            <UserPlus className="ml-2 h-4 w-4" />
            إدارة السكرتير
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        {isSecretariesLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <SecretarySkeleton key={i} />
            ))}
          </div>
        ) : isSecretariesError ? (
          <div className="text-destructive">
            حدث خطأ أثناء تحميل قائمة السكرتير
          </div>
        ) : secretaries && secretaries.length > 0 ? (
          <div className="space-y-4">
            {secretaries.map((secretary) => (
              <SecretaryItem
                key={secretary.user_id}
                secretary={secretary}
                onUpdatePermissions={onUpdatePermissions}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            لا يوجد سكرتير مسجل في هذه العيادة.{" "}
            <Link to="/staff" className="text-primary hover:underline">
              أضف سكرتيرًا الآن
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  );
}