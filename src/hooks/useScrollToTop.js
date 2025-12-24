import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 * Custom hook that scrolls to the top of the page whenever the route changes
 */
export default function useScrollToTop() {
  const { pathname, search, hash, key } = useLocation();

  useEffect(() => {
    // Scroll to top immediately
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    
    // Fallback for older browsers
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, [pathname, search, key]); // Trigger on pathname, search params, or navigation key change

  return null;
}