import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";

export default function ClinicInfoCard({clinic}) {
  return (
    <Card className="mb-6 sm:mb-8">
      <CardHeader className="pb-3 text-right">
        <CardTitle className="text-lg sm:text-xl">{clinic?.name}</CardTitle>
        <CardDescription className="text-sm text-right">{clinic?.address}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col sm:flex-row-reverse items-center justify-between gap-3 p-4 bg-muted rounded-lg">
          <span className="font-medium text-sm sm:text-base">سعر الحجز:</span>
          <span className="text-xl sm:text-2xl font-bold text-primary">
            {clinic?.booking_price ? `${clinic.booking_price} جنيه` : "مجاني"}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
