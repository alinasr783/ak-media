import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card.jsx';
import { Button } from '../components/ui/button.jsx';
import { useAuth } from '@/features/auth/AuthContext';
import { createSubscription } from '@/services/apiSubscriptions';
import toast from 'react-hot-toast';
import { 
  Loader, 
  CheckCircle, 
  XCircle, 
  ArrowLeft,
  CreditCard,
  Calendar,
  Zap,
  Wallet,
  Smartphone,
  Phone
} from 'lucide-react';

export default function PaymentCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [status, setStatus] = useState('processing'); // processing, success, failed
  const [paymentData, setPaymentData] = useState(null);

  useEffect(() => {
    const processPaymentCallback = async () => {
      try {
        // Extract payment data from URL parameters
        const success = searchParams.get('success') === 'true';
        const id = searchParams.get('id');
        const amount_cents = parseInt(searchParams.get('amount_cents')) || 0;
        const source_data = {
          type: searchParams.get('source_data.type'),
          pan: searchParams.get('source_data.pan')
        };
        
        // Create callback data object
        const callbackData = {
          success,
          id,
          amount_cents,
          source_data
        };

        // Simulate payment verification (in a real app, this would be server-side)
        const verification = {
          isValid: callbackData.success,
          status: callbackData.success ? 'success' : 'failed',
          transactionId: callbackData.id,
          amount: callbackData.amount_cents / 100,
          paymentMethod: callbackData.source_data?.type || 'card'
        };
        
        if (verification.isValid && verification.status === 'success') {
          // Payment was successful, create the subscription
          const clinicId = user?.clinic_id;
          const planId = localStorage.getItem('pending_subscription_plan_id');
          const billingPeriod = localStorage.getItem('pending_subscription_billing_period');
          const amount = localStorage.getItem('pending_subscription_amount');
          
          if (clinicId && planId) {
            await createSubscription({
              clinicId,
              planId,
              billingPeriod: billingPeriod || 'monthly',
              amount: parseFloat(amount) || 0
            });
            
            setStatus('success');
            setPaymentData(verification);
            toast.success("🎉 تم تفعيل الاشتراك بنجاح!");
            
            // Clear pending subscription data
            localStorage.removeItem('pending_subscription_plan_id');
            localStorage.removeItem('pending_subscription_billing_period');
            localStorage.removeItem('pending_subscription_amount');
            localStorage.removeItem('pending_payment_method');
          } else {
            throw new Error('بيانات الاشتراك غير مكتملة');
          }
        } else {
          setStatus('failed');
          setPaymentData(verification);
        }
      } catch (error) {
        console.error('Payment callback processing error:', error);
        setStatus('failed');
        toast.error("❌ فشل في معالجة نتيجة الدفع: " + error.message);
      }
    };

    processPaymentCallback();
  }, [searchParams, user]);

  const handleReturnToDashboard = () => {
    navigate("/dashboard");
  };

  const handleRetryPayment = () => {
    // Go back to the plan selection page
    navigate("/pricing");
  };

  // Get payment method icon and name
  const getPaymentMethodInfo = (methodType) => {
    switch(methodType) {
      case 'visa':
      case 'mastercard':
      case 'card':
        return {
          icon: <CreditCard className="w-5 h-5" />,
          name: 'بطاقة ائتمان',
          bgColorClass: 'bg-blue-100',
          textColorClass: 'text-blue-600'
        };
      case 'wallet':
        return {
          icon: <Wallet className="w-5 h-5" />,
          name: 'محفظة إلكترونية',
          bgColorClass: 'bg-green-100',
          textColorClass: 'text-green-600'
        };
      case 'vodafone':
        return {
          icon: <Smartphone className="w-5 h-5" />,
          name: 'فودافون كاش',
          bgColorClass: 'bg-red-100',
          textColorClass: 'text-red-600'
        };
      case 'etisalat':
        return {
          icon: <Phone className="w-5 h-5" />,
          name: 'إتيصالات كاش',
          bgColorClass: 'bg-blue-100',
          textColorClass: 'text-blue-600'
        };
      default:
        return {
          icon: <CreditCard className="w-5 h-5" />,
          name: 'بطاقة ائتمان',
          bgColorClass: 'bg-blue-100',
          textColorClass: 'text-blue-600'
        };
    }
  };

  if (status === 'processing') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30 flex items-center justify-center p-4" dir="rtl" lang="ar">
        <Card className="w-full max-w-md rounded-2xl border-0 shadow-lg">
          <CardHeader className="text-center pb-4">
            <div className="mx-auto bg-blue-100 p-4 rounded-full w-16 h-16 flex items-center justify-center mb-4">
              <Loader className="w-8 h-8 text-blue-600 animate-spin" />
            </div>
            <CardTitle className="text-xl font-bold text-gray-900">
              جاري معالجة النتيجة
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-gray-600 mb-6">
              نقوم الآن بمعالجة نتيجة الدفع وإتمام عملية الاشتراك
            </p>
            <div className="flex justify-center">
              <div className="animate-pulse flex space-x-2">
                <div className="h-2 w-2 bg-blue-600 rounded-full"></div>
                <div className="h-2 w-2 bg-blue-600 rounded-full"></div>
                <div className="h-2 w-2 bg-blue-600 rounded-full"></div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (status === 'success') {
    const paymentMethod = paymentData?.paymentMethod || 'card';
    const methodInfo = getPaymentMethodInfo(paymentMethod);
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30 flex items-center justify-center p-4" dir="rtl" lang="ar">
        <Card className="w-full max-w-md rounded-2xl border-0 shadow-lg">
          <CardHeader className="text-center pb-4">
            <div className={`mx-auto ${methodInfo.bgColorClass} p-4 rounded-full w-16 h-16 flex items-center justify-center mb-4`}>
              <CheckCircle className={`w-8 h-8 ${methodInfo.textColorClass}`} />
            </div>
            <CardTitle className="text-xl font-bold text-gray-900">
              تم الدفع بنجاح!
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-6">
            <div className="space-y-4">
              <p className="text-gray-600">
                تم تفعيل الاشتراك في الخطة بنجاح
              </p>
              
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-gray-600">طريقة الدفع:</span>
                  <div className="flex items-center gap-2">
                    <div className={`w-8 h-8 ${methodInfo.bgColorClass} rounded-lg flex items-center justify-center`}>
                      {methodInfo.icon}
                    </div>
                    <span className="font-medium">{methodInfo.name}</span>
                  </div>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">رقم العملية:</span>
                  <span className="font-medium">#{paymentData?.transactionId?.substring(0, 8)}</span>
                </div>
                <div className="flex justify-between items-center mt-2">
                  <span className="text-gray-600">المبلغ المدفوع:</span>
                  <span className="font-medium">{(paymentData?.amount || 0).toFixed(2)} جنيه</span>
                </div>
              </div>
            </div>
            
            <div className="pt-4 space-y-3">
              <Button 
                className="w-full bg-primary hover:bg-primary/90"
                onClick={handleReturnToDashboard}
              >
                الذهاب إلى لوحة التحكم
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Failed status
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30 flex items-center justify-center p-4" dir="rtl" lang="ar">
      <Card className="w-full max-w-md rounded-2xl border-0 shadow-lg">
        <CardHeader className="text-center pb-4">
          <div className="mx-auto bg-red-100 p-4 rounded-full w-16 h-16 flex items-center justify-center mb-4">
            <XCircle className="w-8 h-8 text-red-600" />
          </div>
          <CardTitle className="text-xl font-bold text-gray-900">
            فشل في الدفع
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-6">
          <div className="space-y-2">
            <p className="text-gray-600">
              لم يتم إتمام عملية الدفع بنجاح. يرجى المحاولة مرة أخرى.
            </p>
            {paymentData?.error && (
              <div className="bg-red-50 rounded-xl p-3 border border-red-200 text-red-700 text-sm">
                {paymentData.error}
              </div>
            )}
          </div>
          
          <div className="pt-4 space-y-3">
            <Button 
              className="w-full bg-primary hover:bg-primary/90"
              onClick={handleRetryPayment}
            >
              إعادة محاولة الدفع
            </Button>
            <Button 
              variant="outline"
              className="w-full border-gray-300 hover:bg-gray-50"
              onClick={handleReturnToDashboard}
            >
              <ArrowLeft className="w-4 h-4 ml-2" />
              العودة للوحة التحكم
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}