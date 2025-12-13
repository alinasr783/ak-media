import {CheckCircle} from "lucide-react";
import {Card, CardContent} from "../../components/ui/card";
import {Button} from "../../components/ui/button";

export default function BookingSuccessCard({onReset}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 p-4">
      <Card className="w-full max-w-md">
        <CardContent className="pt-6 text-center">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">تم حجز الموعد بنجاح!</h2>
          <p className="text-muted-foreground mb-6">
            شكراً لك على حجزك. سيتم التواصل معك قريباً لتأكيد الموعد.
          </p>
          <Button onClick={onReset} className="w-full">
            حجز موعد آخر
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
