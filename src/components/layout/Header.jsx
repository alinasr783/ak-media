import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Stethoscope, Menu, X, Calendar, FileText, Tag, MessageCircle, HelpCircle, User } from "lucide-react";
import { Button } from "../ui/button";
import { useAuth } from "../../features/auth/AuthContext";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, logout, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSectionClick = (sectionId) => {
    // Close mobile menu if open
    setIsMenuOpen(false);
    
    // Scroll to section if already on landing page
    if (location.pathname === "/") {
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    } else {
      // Navigate to landing page with hash
      navigate(`/#${sectionId}`);
    }
  };

  const navItems = [
    { id: "core-features", label: "المميزات", icon: FileText },
    { id: "online-booking", label: "الحجز الإلكتروني", icon: Calendar },
    { id: "pricing", label: "الأسعار", icon: Tag },
    { id: "testimonials", label: "آراء الأطباء", icon: MessageCircle },
    { id: "faq", label: "الأسئلة الشائعة", icon: HelpCircle },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/90 backdrop-blur">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <Stethoscope className="size-6 text-primary" />
          <span className="text-xl font-bold">Tabibi</span>
        </div>
        
        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1 text-sm">
          {navItems.map((item) => (
            <Button
              key={item.id}
              variant="ghost"
              className="text-muted-foreground hover:text-foreground flex items-center gap-2"
              onClick={() => handleSectionClick(item.id)}>
              <item.icon className="w-4 h-4" />
              {item.label}
            </Button>
          ))}
        </nav>
        
        <div className="flex items-center gap-3">
          {isLoading ? (
            // Show loading state
            <div className="flex items-center gap-3">
              <div className="h-10 w-20 bg-gray-200 rounded animate-pulse"></div>
            </div>
          ) : user ? (
            // If user is authenticated, show user menu
            <div className="flex items-center gap-2">
              <Link to="/dashboard">
                <Button variant="ghost" size="icon">
                  <User className="w-5 h-5" />
                </Button>
              </Link>
              <Button variant="outline" onClick={logout} className="text-xs">
                تسجيل الخروج
              </Button>
            </div>
          ) : (
            // If user is not authenticated, show auth buttons
            <div className="hidden md:flex items-center gap-2">
              <Link to="/login">
                <Button variant="ghost">تسجيل الدخول</Button>
              </Link>
              <Link to="/signup">
                <Button>ابدأ الآن</Button>
              </Link>
            </div>
          )}
          
          {/* Mobile menu button */}
          <Button 
            variant="ghost" 
            size="icon" 
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>
      </div>
      
      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden border-t border-border/60 bg-background/95 backdrop-blur">
          <div className="container py-4 space-y-2">
            {navItems.map((item) => (
              <Button
                key={item.id}
                variant="ghost"
                className="w-full justify-start text-muted-foreground hover:text-foreground flex items-center gap-2"
                onClick={() => handleSectionClick(item.id)}>
                <item.icon className="w-4 h-4" />
                {item.label}
              </Button>
            ))}
            
            {!user && (
              <div className="pt-4 flex flex-col gap-2">
                <Link to="/login" onClick={() => setIsMenuOpen(false)}>
                  <Button variant="outline" className="w-full">
                    تسجيل الدخول
                  </Button>
                </Link>
                <Link to="/signup" onClick={() => setIsMenuOpen(false)}>
                  <Button className="w-full">
                    ابدأ الآن
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}