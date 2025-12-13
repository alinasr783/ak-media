import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import useHasActiveSubscription from "./useHasActiveSubscription";
import useUser from "./useUser";
import NoSubscriptionPopup from "../../components/NoSubscriptionPopup";
// List of pages that should be accessible without a subscription
const ALLOWED_PAGES = [
    "/",
    "/login",
    "/signup",
    "/subscriptions",
    "/plan/",
    "/payment/callback"
];

// Check if current path is allowed without subscription
const isAllowedPage = (pathname) => {
    return ALLOWED_PAGES.some(page => 
        pathname === page || pathname.startsWith(page)
    );
};

export default function NoSubscriptionGuard({ children }) {
    const location = useLocation();
    const { data: user, isLoading: isUserLoading } = useUser();
    const { data: hasActiveSubscription, isLoading: isSubscriptionLoading } = useHasActiveSubscription();
    const [showPopup, setShowPopup] = useState(false);
    
    // Check if we should show the popup
    useEffect(() => {
        // Don't show popup if user is not logged in
        if (!user || isUserLoading) return;
        
        // Don't show popup on allowed pages
        if (isAllowedPage(location.pathname)) return;
        
        // Show popup if user is logged in but has no active subscription
        if (!isSubscriptionLoading && hasActiveSubscription === false) {
            setShowPopup(true);
        }
    }, [user, isUserLoading, hasActiveSubscription, isSubscriptionLoading, location.pathname]);
    
    // While checking, show nothing or a loading indicator
    if (isUserLoading || isSubscriptionLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }
    
    // If user is not logged in, show normal content
    if (!user) {
        return children;
    }
    
    // If user is on an allowed page, show normal content
    if (isAllowedPage(location.pathname)) {
        return children;
    }
    
    // If user has no active subscription, show the popup
    if (showPopup) {
        return (
            <>
                <NoSubscriptionPopup />
                <div className="opacity-20 pointer-events-none">
                    {children}
                </div>
            </>
        );
    }
    
    // Otherwise, show the normal page content
    return children;
}