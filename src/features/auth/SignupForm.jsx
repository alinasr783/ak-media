import { useState } from "react"
import { useForm } from "react-hook-form"
import toast from "react-hot-toast"
import { Button } from "../../components/ui/button"
import { Input } from "../../components/ui/input"
import { generateClinicId } from "../../lib/clinicIdGenerator"
import useSignup from "./useSignup"
import useVerifyClinicId from "./useVerifyClinicId"
import { checkEmailExists } from "../../services/apiAuth"
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
  const [isCheckingEmail, setIsCheckingEmail] = useState(false)
  const [step3Touched, setStep3Touched] = useState(false)

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
      
      // Validate form fields first
      const isValid = await trigger(fieldsToValidate)
      if (!isValid) return

      // Check if email already exists before moving to next step
      const email = watch("email")
      setIsCheckingEmail(true)
      
      try {
        const emailExists = await checkEmailExists(email)
        if (emailExists) {
          toast.error("الإيميل ده موجود قبل كده، جرب إيميل تاني")
          setIsCheckingEmail(false)
          return
        }
        setIsCheckingEmail(false)
      } catch (error) {
        console.error("Error checking email:", error)
        toast.error("حصل مشكلة في التحقق من الإيميل")
        setIsCheckingEmail(false)
        return
      }

      setCurrentStep((prev) => prev + 1)
    } else if (currentStep === STEPS.PERSONAL_INFO) {
      fieldsToValidate = ["name", "phone", "role"]
      
      const isValid = await trigger(fieldsToValidate)
      if (!isValid) return

      if (role === "doctor") {
        // Generate clinic ID for doctor as UUID
        const clinicId = generateClinicId()
        setGeneratedClinicId(clinicId)
      }
      setCurrentStep((prev) => prev + 1)
    }
  }

  function handlePrevStep() {
    setCurrentStep((prev) => prev - 1)
    // Reset step 3 touched state when going back
    if (currentStep === STEPS.ROLE_SPECIFIC) {
      setStep3Touched(false)
    }
  }

  function handleRoleChange(e) {
    setSelectedRole(e.target.value)
  }

  function handleVerifyClinicId() {
    if (!clinicIdInput) {
      setClinicVerification({
        status: 'error',
        message: "لازم تدخل معرف العيادة"
      })
      return
    }

    verifyClinic(clinicIdInput, {
      onSuccess: () => {
        setClinicVerification({
          status: 'success',
          message: "تم التحقق بنجاح"
        })
        setVerifiedClinicId(clinicIdInput)
      },
      onError: (error) => {
        setClinicVerification({
          status: 'error',
          message: error.message || "معرف العيادة ده مش موجود"
        })
        setVerifiedClinicId("")
      },
    })
  }

  async function handleCreateAccount() {
    // Mark step 3 as touched to show validation errors
    setStep3Touched(true)

    // Get all form data to validate
    const formData = watch()

    // Validate step 3 fields based on role
    let fieldsToValidate = []
    if (role === "doctor") {
      fieldsToValidate = ["clinicName", "clinicAddress"]
      
      // CRITICAL: Ensure clinic name and address are provided and not empty
      if (!formData.clinicName || formData.clinicName.trim().length === 0) {
        toast.error("لازم تدخل اسم العيادة")
        return
      }
      if (formData.clinicName.trim().length < 3) {
        toast.error("اسم العيادة لازم 3 أحرف على الأقل")
        return
      }
      if (!formData.clinicAddress || formData.clinicAddress.trim().length === 0) {
        toast.error("لازم تدخل عنوان العيادة")
        return
      }
      if (formData.clinicAddress.trim().length < 5) {
        toast.error("عنوان العيادة لازم 5 أحرف على الأقل")
        return
      }
    } else if (role === "secretary") {
      fieldsToValidate = ["clinicId"]
    }

    const isValid = await trigger(fieldsToValidate)
    if (!isValid) {
      toast.error("لازم تملى كل الحقول المطلوبة")
      return
    }

    // For secretary, check if clinic ID was verified
    if (role === "secretary" && !verifiedClinicId) {
      toast.error("لازم تتحقق من معرف العيادة الأول")
      return
    }

    // Generate clinic ID for doctor if not already generated
    let finalClinicId = generatedClinicId
    if (role === "doctor" && !finalClinicId) {
      finalClinicId = generateClinicId()
      setGeneratedClinicId(finalClinicId)
    }

    const userData = {
      name: formData.name,
      phone: formData.phone,
      role: formData.role,
      clinicId: role === "doctor" ? finalClinicId : verifiedClinicId,
    }

    // Add role-specific data with trimmed values
    if (role === "doctor") {
      userData.clinicName = formData.clinicName.trim()
      userData.clinicAddress = formData.clinicAddress.trim()
    } else if (role === "secretary") {
      userData.permissions = []
    }

    console.log("Creating account with data:", userData)

    signup({
      email: formData.email,
      password: formData.password,
      userData,
    })
  }

  function onSubmit(data) {
    // CRITICAL: Prevent ANY form submission unless explicitly on final step
    // This ensures account creation only happens via manual button click
    console.log("onSubmit called, current step:", currentStep)
    if (currentStep !== STEPS.ROLE_SPECIFIC) {
      console.log("Blocked submission - not on final step")
      return
    }

    // Mark step 3 as touched
    setStep3Touched(true)

    // For secretary, check if clinic ID was verified
    if (data.role === "secretary" && (!verifiedClinicId || verifiedClinicId !== data.clinicId)) {
      toast.error("لازم تتحقق من معرف العيادة الأول")
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
    <form 
      onSubmit={(e) => {
        e.preventDefault()
        console.log("Form submit prevented")
        // Do nothing - all navigation happens via buttons
      }} 
      className="space-y-6"
    >
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
                required: "لازم تدخل الإيميل",
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: "الإيميل ده مش صحيح",
                },
              })}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  handleNextStep()
                }
              }}
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
                required: "لازم تدخل كلمة المرور",
                minLength: {
                  value: 6,
                  message: "كلمة المرور لازم 6 أحرف على الأقل",
                },
              })}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  handleNextStep()
                }
              }}
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
                required: "لازم تأكد كلمة المرور",
                validate: (value) =>
                  value === password || "كلمة المرور مش متطابقة",
              })}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  handleNextStep()
                }
              }}
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
                required: "لازم تدخل الاسم",
                minLength: {
                  value: 3,
                  message: "الاسم لازم 3 أحرف على الأقل",
                },
              })}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  handleNextStep()
                }
              }}
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
                required: "لازم تدخل رقم الهاتف",
                pattern: {
                  value: /^[0-9]{10,15}$/,
                  message: "رقم الهاتف مش صحيح",
                },
              })}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  handleNextStep()
                }
              }}
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
              {...register("role", { required: "لازم تختار نوع المستخدم" })}
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
                    required: step3Touched ? "لازم تدخل اسم العيادة" : false,
                    minLength: {
                      value: 3,
                      message: "اسم العيادة لازم 3 أحرف على الأقل",
                    },
                  })}
                  placeholder="مثال: عيادة د. أحمد للأسنان"
                />
                {step3Touched && errors.clinicName && (
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
                    required: step3Touched ? "لازم تدخل عنوان العيادة" : false,
                    minLength: {
                      value: 5,
                      message: "عنوان العيادة لازم 5 أحرف على الأقل",
                    },
                  })}
                  placeholder="مثال: 15 شارع الجامعة، القاهرة"
                />
                {step3Touched && errors.clinicAddress && (
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
                      required: "لازم تدخل معرف العيادة",
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
      <div className="flex gap-2 pt-4">
        {currentStep > STEPS.ACCOUNT_INFO && (
          <Button 
            type="button" 
            onClick={handlePrevStep} 
            variant="outline"
            className="flex-1"
            style={{ flexBasis: '25%' }}
          >
            السابق
          </Button>
        )}

        {currentStep < STEPS.ROLE_SPECIFIC ? (
          <Button
            type="button"
            onClick={handleNextStep}
            disabled={isCheckingEmail}
            className="flex-1"
            style={{ flexBasis: currentStep === STEPS.ACCOUNT_INFO ? '100%' : '75%' }}
          >
            {isCheckingEmail ? "جاري التحقق..." : "التالي"}
          </Button>
        ) : (
          <Button 
            type="button"
            onClick={handleCreateAccount}
            disabled={isSigningUp || (role === "secretary" && !verifiedClinicId)}
            className="flex-1"
            style={{ flexBasis: '75%' }}
          >
            {isSigningUp ? "جاري إنشاء الحساب..." : "إنشاء الحساب"}
          </Button>
        )}
      </div>
    </form>
  )
}