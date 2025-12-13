import { useState } from "react"
import { useForm } from "react-hook-form"
import toast from "react-hot-toast"
import { Button } from "../../components/ui/button"
import { Input } from "../../components/ui/input"
import { generateClinicId } from "../../lib/clinicIdGenerator"
import useSignup from "./useSignup"
import useVerifyClinicId from "./useVerifyClinicId"
import { Mail, User, Building2, CheckCircle2 } from "lucide-react"

const STEPS = {
  ACCOUNT_INFO: 1,
  PERSONAL_INFO: 2,
  ROLE_SPECIFIC: 3,
}

export default function SignupForm() {
  const [currentStep, setCurrentStep] = useState(STEPS.ACCOUNT_INFO)
  const [selectedRole, setSelectedRole] = useState("")
  const [generatedClinicId, setGeneratedClinicId] = useState("")
  const [clinicVerification, setClinicVerification] = useState({ 
    status: null, // null, 'success', 'error'
    message: "" 
  })
  const [verifiedClinicId, setVerifiedClinicId] = useState("")

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    trigger,
  } = useForm()

  const { mutate: signup, isPending: isSigningUp } = useSignup()
  const { mutate: verifyClinic, isPending: isVerifying } = useVerifyClinicId()

  const password = watch("password")
  const role = watch("role")
  const clinicIdInput = watch("clinicId")

  async function handleNextStep() {
    let fieldsToValidate = []

    if (currentStep === STEPS.ACCOUNT_INFO) {
      fieldsToValidate = ["email", "password", "confirmPassword"]
    } else if (currentStep === STEPS.PERSONAL_INFO) {
      fieldsToValidate = ["name", "phone", "role"]
    }

    const isValid = await trigger(fieldsToValidate)

    if (isValid) {
      if (currentStep === STEPS.PERSONAL_INFO && role === "doctor") {
        // Generate clinic ID for doctor as UUID
        const clinicId = generateClinicId()
        setGeneratedClinicId(clinicId)
      }
      setCurrentStep((prev) => prev + 1)
    }
  }

  function handlePrevStep() {
    setCurrentStep((prev) => prev - 1)
  }

  function handleRoleChange(e) {
    setSelectedRole(e.target.value)
  }

  function handleVerifyClinicId() {
    if (!clinicIdInput) {
      setClinicVerification({
        status: 'error',
        message: "يرجى إدخال معرف العيادة"
      })
      return
    }

    verifyClinic(clinicIdInput, {
      onSuccess: () => {
        setClinicVerification({
          status: 'success',
          message: "تم التحقق من معرف العيادة بنجاح"
        })
        setVerifiedClinicId(clinicIdInput)
      },
      onError: (error) => {
        setClinicVerification({
          status: 'error',
          message: error.message || "معرف العيادة غير صالح"
        })
        setVerifiedClinicId("")
      },
    })
  }

  function onSubmit(data) {
    // For secretary, check if clinic ID was verified
    if (data.role === "secretary" && (!verifiedClinicId || verifiedClinicId !== data.clinicId)) {
      toast.error("يجب التحقق من معرف العيادة قبل إنشاء الحساب")
      return
    }

    // Generate clinic ID for doctor if not already generated
    let finalClinicId = generatedClinicId
    if (data.role === "doctor" && !finalClinicId) {
      finalClinicId = generateClinicId()
      setGeneratedClinicId(finalClinicId)
    }

    const userData = {
      name: data.name,
      phone: data.phone,
      role: data.role,
      clinicId: data.role === "doctor" ? finalClinicId : verifiedClinicId,
    }

    // Add role-specific data
    if (data.role === "doctor") {
      userData.clinicName = data.clinicName
      userData.clinicAddress = data.clinicAddress
    } else if (data.role === "secretary") {
      // Remove permissions field as requested - permissions will be set by doctor later
      userData.permissions = []
    }

    console.log("Submitting with clinic ID:", userData.clinicId)

    signup({
      email: data.email,
      password: data.password,
      userData,
    })
  }

  const stepConfig = [
    { number: 1, title: "معلومات الحساب", icon: Mail },
    { number: 2, title: "المعلومات الشخصية", icon: User },
    { number: 3, title: "تفاصيل الدور", icon: Building2 },
  ];

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Modern Progress Bar */}
      <div className="mb-10">
        {/* Progress Line */}
        <div className="relative">
          <div className="absolute top-5 right-0 w-full h-1 bg-muted">
            <div 
              className="h-full bg-primary transition-all duration-500 ease-out"
              style={{ width: `${((currentStep - 1) / 2) * 100}%` }}
            />
          </div>
          
          {/* Steps */}
          <div className="relative flex justify-between">
            {stepConfig.map((step) => {
              const isCompleted = currentStep > step.number;
              const isCurrent = currentStep === step.number;
              const StepIcon = step.icon;
              
              return (
                <div key={step.number} className="flex flex-col items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                      isCompleted
                        ? "bg-primary text-primary-foreground scale-110"
                        : isCurrent
                        ? "bg-primary text-primary-foreground shadow-lg shadow-primary/50 scale-110"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {isCompleted ? (
                      <CheckCircle2 className="size-5" />
                    ) : (
                      <StepIcon className="size-5" />
                    )}
                  </div>
                  <p
                    className={`text-xs mt-3 font-medium transition-colors duration-300 max-w-[80px] text-center ${
                      isCurrent || isCompleted
                        ? "text-foreground"
                        : "text-muted-foreground"
                    }`}
                  >
                    {step.title}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Step 1: Account Information */}
      {currentStep === STEPS.ACCOUNT_INFO && (
        <div className="space-y-4 animate-in fade-in slide-in-from-right-5 duration-300">
          <h3 className="text-lg font-semibold text-primary flex items-center gap-2">
            <Mail className="size-5" />
            معلومات الحساب
          </h3>

          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium">
              البريد الإلكتروني *
            </label>
            <Input
              id="email"
              type="email"
              {...register("email", {
                required: "البريد الإلكتروني مطلوب",
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: "البريد الإلكتروني غير صالح",
                },
              })}
            />
            {errors.email && (
              <p className="text-sm text-red-500">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium">
              كلمة المرور *
            </label>
            <Input
              id="password"
              type="password"
              {...register("password", {
                required: "كلمة المرور مطلوبة",
                minLength: {
                  value: 6,
                  message: "كلمة المرور يجب أن تكون 6 أحرف على الأقل",
                },
              })}
            />
            {errors.password && (
              <p className="text-sm text-red-500">{errors.password.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="confirmPassword" className="text-sm font-medium">
              تأكيد كلمة المرور *
            </label>
            <Input
              id="confirmPassword"
              type="password"
              {...register("confirmPassword", {
                required: "يرجى تأكيد كلمة المرور",
                validate: (value) =>
                  value === password || "كلمات المرور غير متطابقة",
              })}
            />
            {errors.confirmPassword && (
              <p className="text-sm text-red-500">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Step 2: Personal Information */}
      {currentStep === STEPS.PERSONAL_INFO && (
        <div className="space-y-4 animate-in fade-in slide-in-from-right-5 duration-300">
          <h3 className="text-lg font-semibold text-primary flex items-center gap-2">
            <User className="size-5" />
            المعلومات الشخصية
          </h3>

          <div className="space-y-2">
            <label htmlFor="name" className="text-sm font-medium">
              الاسم الكامل *
            </label>
            <Input
              id="name"
              type="text"
              {...register("name", {
                required: "الاسم مطلوب",
                minLength: {
                  value: 3,
                  message: "الاسم يجب أن يكون 3 أحرف على الأقل",
                },
              })}
            />
            {errors.name && (
              <p className="text-sm text-red-500">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="phone" className="text-sm font-medium">
              رقم الهاتف *
            </label>
            <Input
              id="phone"
              type="tel"
              {...register("phone", {
                required: "رقم الهاتف مطلوب",
                pattern: {
                  value: /^[0-9]{10,15}$/,
                  message: "رقم الهاتف غير صالح",
                },
              })}
            />
            {errors.phone && (
              <p className="text-sm text-red-500">{errors.phone.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="role" className="text-sm font-medium">
              نوع المستخدم *
            </label>
            <select
              id="role"
              {...register("role", { required: "يرجى اختيار نوع المستخدم" })}
              onChange={handleRoleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">اختر نوع المستخدم</option>
              <option value="doctor">طبيب</option>
              <option value="secretary">سكرتير</option>
            </select>
            {errors.role && (
              <p className="text-sm text-red-500">{errors.role.message}</p>
            )}
          </div>
        </div>
      )}

      {/* Step 3: Role-Specific Information */}
      {currentStep === STEPS.ROLE_SPECIFIC && (
        <div className="space-y-4 animate-in fade-in slide-in-from-right-5 duration-300">
          <h3 className="text-lg font-semibold text-primary flex items-center gap-2">
            <Building2 className="size-5" />
            {role === "doctor" ? "بيانات العيادة" : "تفاصيل السكرتير"}
          </h3>

          {role === "doctor" && (
            <>
              <div className="space-y-2">
                <label htmlFor="clinicName" className="text-sm font-medium">
                  اسم العيادة *
                </label>
                <Input
                  id="clinicName"
                  type="text"
                  {...register("clinicName", {
                    required: "اسم العيادة مطلوب",
                    minLength: {
                      value: 3,
                      message: "اسم العيادة يجب أن يكون 3 أحرف على الأقل",
                    },
                  })}
                  placeholder="مثال: عيادة د. أحمد للأسنان"
                />
                {errors.clinicName && (
                  <p className="text-sm text-red-500">
                    {errors.clinicName.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label htmlFor="clinicAddress" className="text-sm font-medium">
                  عنوان العيادة *
                </label>
                <Input
                  id="clinicAddress"
                  type="text"
                  {...register("clinicAddress", {
                    required: "عنوان العيادة مطلوب",
                    minLength: {
                      value: 5,
                      message: "عنوان العيادة يجب أن يكون 5 أحرف على الأقل",
                    },
                  })}
                  placeholder="مثال: 15 شارع الجامعة، القاهرة"
                />
                {errors.clinicAddress && (
                  <p className="text-sm text-red-500">
                    {errors.clinicAddress.message}
                  </p>
                )}
              </div>
            </>
          )}

          {role === "secretary" && (
            <>
              <div className="space-y-2">
                <label htmlFor="clinicId" className="text-sm font-medium">
                  معرف العيادة *
                </label>
                <div className="flex gap-2">
                  <Input
                    id="clinicId"
                    type="text"
                    {...register("clinicId", {
                      required: "معرف العيادة مطلوب",
                    })}
                    placeholder="أدخل معرف العيادة من الطبيب"
                    readOnly={!!verifiedClinicId}
                  />
                  {!verifiedClinicId ? (
                    <Button
                      type="button"
                      onClick={handleVerifyClinicId}
                      disabled={isVerifying || !clinicIdInput}
                    >
                      {isVerifying ? "جاري التحقق..." : "تحقق"}
                    </Button>
                  ) : (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setVerifiedClinicId("")
                        setClinicVerification({ status: null, message: "" })
                      }}
                    >
                      تعديل
                    </Button>
                  )}
                </div>
                {errors.clinicId && (
                  <p className="text-sm text-red-500">
                    {errors.clinicId.message}
                  </p>
                )}
                {clinicVerification.status && (
                  <p className={`text-sm ${clinicVerification.status === 'success' ? 'text-green-600' : 'text-red-500'}`}>
                    {clinicVerification.message}
                  </p>
                )}
              </div>
            </>
          )}
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="flex justify-between pt-4">
        {currentStep > STEPS.ACCOUNT_INFO && (
          <Button type="button" onClick={handlePrevStep} variant="outline">
            السابق
          </Button>
        )}

        {currentStep < STEPS.ROLE_SPECIFIC ? (
          <Button
            type="button"
            onClick={handleNextStep}
            className={currentStep === STEPS.ACCOUNT_INFO ? "ml-auto" : ""}
          >
            التالي
          </Button>
        ) : (
          <Button 
            type="submit" 
            disabled={isSigningUp || (role === "secretary" && !verifiedClinicId)}
            className="ml-auto"
          >
            {isSigningUp ? "جاري إنشاء الحساب..." : "إنشاء الحساب"}
          </Button>
        )}
      </div>
    </form>
  )
}