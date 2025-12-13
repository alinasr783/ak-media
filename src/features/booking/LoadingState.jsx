import {Button} from "../../components/ui/button";

export default function LoadingState() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
        <p className="mt-4 text-muted-foreground">
          جاري تحميل بيانات العيادة...
        </p>
      </div>
    </div>
  );
}
