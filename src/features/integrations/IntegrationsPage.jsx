import { Share2, Calendar, CheckSquare, Users, Trash2, ExternalLink } from "lucide-react";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { linkGoogleAccount } from "../../services/apiAuth";
import { useSearchParams } from "react-router-dom";

export default function IntegrationsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [integrations, setIntegrations] = useState([
    {
      id: "google-calendar",
      title: "Google Calendar",
      description: "هنحطلك كل حجوزاتك في الكالندر وهيجيلك اشعار علي موبيلك علي كل حجز",
      icon: Calendar,
      scope: "https://www.googleapis.com/auth/calendar",
      color: "text-blue-600",
      bgColor: "bg-blue-100 dark:bg-blue-900/20",
      connected: false,
    },
    {
      id: "google-tasks",
      title: "Google Tasks",
      description: "إدارة المهام والمتابعة عبر مهام جوجل مباشرة",
      icon: CheckSquare,
      scope: "https://www.googleapis.com/auth/tasks",
      color: "text-blue-500",
      bgColor: "bg-blue-100 dark:bg-blue-900/20",
      connected: false,
    },
    {
      id: "google-contacts",
      title: "Google Contacts",
      description: "مع كل مريض بيضاف هنضيف جهة اتصال جديدة باسم ورقم المريض ده",
      icon: Users,
      scope: "https://www.googleapis.com/auth/contacts",
      color: "text-blue-600",
      bgColor: "bg-blue-100 dark:bg-blue-900/20",
      connected: false,
    },
  ]);

  useEffect(() => {
    // Load connected state from localStorage
    const saved = localStorage.getItem("connected_integrations");
    if (saved) {
      const connectedIds = JSON.parse(saved);
      setIntegrations(prev => prev.map(i => ({
        ...i,
        connected: connectedIds.includes(i.id)
      })));
    }

    // Check if we just returned from OAuth
    const pendingId = localStorage.getItem("pending_integration");
    
    // Check if this is a valid callback from Google
    // We expect google_auth_callback=true in the URL query params
    const isGoogleCallback = searchParams.get("google_auth_callback") === "true";

    if (pendingId) {
      if (isGoogleCallback) {
        // Optimistically mark as connected ONLY if we have the callback param
        const newConnected = saved ? JSON.parse(saved) : [];
        if (!newConnected.includes(pendingId)) {
          newConnected.push(pendingId);
          localStorage.setItem("connected_integrations", JSON.stringify(newConnected));
          toast.success("تم الربط بنجاح!");
          
          setIntegrations(prev => prev.map(i => {
              if (i.id === pendingId) return { ...i, connected: true };
              return i;
          }));
        }
        
        // Clean up URL
        const newParams = new URLSearchParams(searchParams);
        newParams.delete("google_auth_callback");
        setSearchParams(newParams);
      } else {
        // If pendingId exists but no callback param, it implies the user clicked "Back" or cancelled
        // Do NOT mark as connected. Just clear the pending state.
        console.log("Integration pending but no callback detected. User likely cancelled.");
      }
      
      // Always clear pending state after checking
      localStorage.removeItem("pending_integration");
    }
  }, [searchParams, setSearchParams]);

  const handleConnect = async (integration) => {
    try {
      localStorage.setItem("pending_integration", integration.id);
      await linkGoogleAccount(integration.scope);
    } catch (error) {
      console.error(error);
      toast.error("حدث خطأ أثناء محاولة الربط");
      localStorage.removeItem("pending_integration");
    }
  };

  const handleDisconnect = (integration) => {
     const saved = localStorage.getItem("connected_integrations");
     if (saved) {
         let connectedIds = JSON.parse(saved);
         connectedIds = connectedIds.filter(id => id !== integration.id);
         localStorage.setItem("connected_integrations", JSON.stringify(connectedIds));
         
         setIntegrations(prev => prev.map(i => {
             if (i.id === integration.id) return { ...i, connected: false };
             return i;
         }));
         toast.success(`تم إلغاء الربط مع ${integration.title}`);
     }
  };

  return (
    <div className="space-y-6 p-6" dir="rtl">
       <div className="flex items-center gap-3 mb-8">
        <div className="p-2 rounded-lg bg-primary/10 text-primary">
          <Share2 className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">التكاملات</h1>
          <p className="text-muted-foreground">اربط حسابك بخدمات جوجل لزيادة الإنتاجية</p>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        {integrations.map((item) => {
            const Icon = item.icon;
            return (
                <Card key={item.id} className="p-6 hover:shadow-md transition-shadow">
                    <div className="flex flex-col gap-4">
                        {/* Top Row: Icon | Name | Button */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className={`p-3 rounded-full ${item.bgColor} ${item.color}`}>
                                    <Icon className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg">{item.title}</h3>
                                    {item.connected && (
                                        <Badge variant="secondary" className="bg-green-100 text-green-700 mt-1">
                                            متصل
                                        </Badge>
                                    )}
                                </div>
                            </div>
                            
                            <div>
                                {item.connected ? (
                                    <Button 
                                        variant="outline" 
                                        className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                                        onClick={() => handleDisconnect(item)}
                                    >
                                        <Trash2 className="w-4 h-4 ml-2" />
                                        إلغاء الربط
                                    </Button>
                                ) : (
                                    <Button 
                                        onClick={() => handleConnect(item)}
                                    >
                                        <ExternalLink className="w-4 h-4 ml-2" />
                                        ربط الحساب
                                    </Button>
                                )}
                            </div>
                        </div>

                        {/* Bottom Row: Description */}
                        <div className="mr-16">
                            <p className="text-muted-foreground text-sm leading-relaxed">
                                {item.description}
                            </p>
                        </div>
                    </div>
                </Card>
            );
        })}
      </div>
    </div>
  );
}
