import { Link, useNavigate } from "react-router-dom"
import SignupForm from "../features/auth/SignupForm"
import { Card } from "../components/ui/card"
import { ArrowLeft } from "lucide-react"
import { Button } from "../components/ui/button"

export default function Signup() {
  const navigate = useNavigate();

  return (
    <div dir="rtl" className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4 py-12">
      <Card className="w-full max-w-2xl p-8 relative">
        {/* زر الرجوع */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate(-1)}
          className="absolute top-4 left-4 hover:bg-primary/10"
        >
          <ArrowLeft className="size-5" />
        </Button>
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            إنشاء حساب جديد
          </h1>
          <p className="text-gray-600">انضم إلى طبيبي وأدر عيادتك بكفاءة</p>
        </div>

        <SignupForm />

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            لديك حساب بالفعل؟{" "}
            <Link
              to="/login"
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              تسجيل الدخول
            </Link>
          </p>
        </div>
      </Card>
    </div>
  )
}
