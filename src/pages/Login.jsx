import { Link, useNavigate } from "react-router-dom"
import LoginForm from "../features/auth/LoginForm"
import { Card } from "../components/ui/card"
import { ArrowLeft } from "lucide-react"
import { Button } from "../components/ui/button"

export default function Login() {
  const navigate = useNavigate();

  return (
    <div dir="rtl" className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
      <Card className="w-full max-w-md p-8 relative">
        {/* زر الرجوع */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/")} // Changed from navigate(-1) to navigate("/") to go to landing page
          className="absolute top-4 left-4 hover:bg-primary/10"
        >
          <ArrowLeft className="size-5" />
        </Button>
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            مرحباً بعودتك
          </h1>
          <p className="text-gray-600">سجل دخول إلى حسابك</p>
        </div>

        <LoginForm />

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            ليس لديك حساب؟{" "}
            <Link
              to="/signup"
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              إنشاء حساب
            </Link>
          </p>
        </div>
      </Card>
    </div>
  )
}