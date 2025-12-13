import { 
  Package, 
  Star, 
  Crown, 
  Rocket, 
  Zap, 
  Shield, 
  Heart, 
  Award,
  CheckCircle,
  CreditCard
} from 'lucide-react';

/**
 * Get the appropriate icon component based on plan name
 * @param {string} planName - The name of the plan
 * @returns {JSX.Element} - The icon component
 */
export function getPlanIcon(planName) {
  if (!planName) return <Package className="w-6 h-6 text-blue-600" />;
  
  const name = planName.toLowerCase();
  
  if (name.includes('أساسية') || name.includes('basic')) {
    return <Package className="w-6 h-6 text-blue-600" />;
  }
  
  if (name.includes('قياسية') || name.includes('standard')) {
    return <Star className="w-6 h-6 text-green-600" />;
  }
  
  if (name.includes('مميزة') || name.includes('premium')) {
    return <Crown className="w-6 h-6 text-yellow-600" />;
  }
  
  if (name.includes('ذهبي') || name.includes('gold')) {
    return <Award className="w-6 h-6 text-yellow-500" />;
  }
  
  if (name.includes('فضي') || name.includes('silver')) {
    return <Shield className="w-6 h-6 text-gray-400" />;
  }
  
  if (name.includes('vip')) {
    return <Rocket className="w-6 h-6 text-purple-600" />;
  }
  
  // Default icon
  return <CreditCard className="w-6 h-6 text-blue-600" />;
}