import { useEffect } from "react";
import useSubscriptionExpiry from "./useSubscriptionExpiry";
import SubscriptionExpiryPopup from "../../components/SubscriptionExpiryPopup";

// List of pages that should be restricted when subscription expires
const RESTRICTED_PAGES = [
    "/appointments",
    "/patients",
    "/treatments",
    "/online-booking",
    "/finance",
    "/notifications"
];

// Check if current path matches restricted pages (including detail pages)
const isRestrictedPage = (pathname) => {
    return RESTRICTED_PAGES.some(page => 
        pathname === page || pathname.startsWith(`${page}/`)
    );
};

export default function SubscriptionExpiryGuard({ children }) {
    const { data: subscriptionStatus, isLoading } = useSubscriptionExpiry();
    
    // Check if we're on a restricted page
    useEffect(() => {
        // We could add additional logic here if needed
    }, []);
    
    // While checking subscription status, show nothing or a loading indicator
    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }
    
    // If subscription is expired and we're on a restricted page, show the popup
    if (subscriptionStatus?.isExpired && isRestrictedPage(window.location.pathname)) {
        return (
            <>
                <SubscriptionExpiryPopup 
                    daysRemaining={subscriptionStatus.daysRemaining}
                    expiryDate={subscriptionStatus.expiryDate}
                />
                <div className="opacity-20 pointer-events-none">
                    {children}
                </div>
            </>
        );
    }
    
    // Otherwise, show the normal page content
    return children;
}