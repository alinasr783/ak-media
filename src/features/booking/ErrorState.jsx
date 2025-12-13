import {useNavigate} from "react-router-dom";
import {Button} from "../../components/ui/button";

export default function ErrorState() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="text-center">
        <div className="text-red-500 text-xl font-bold">خطأ</div>
        <p className="mt-2 text-muted-foreground">
          تعذر تحميل بيانات العيادة. تأكد من صحة الرابط.
        </p>
        <Button className="mt-4" onClick={() => navigate("/")}>
          العودة للرئيسية
        </Button>
      </div>
    </div>
  );
}
