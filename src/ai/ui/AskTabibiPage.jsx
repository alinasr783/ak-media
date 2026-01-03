import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import {
  MessageCircle,
  Send,
  Plus,
  Trash2,
  Menu,
  X,
  Bot,
  User,
  Loader2,
  ChevronLeft,
  ChevronDown,
  Sparkles,
  Clock,
  Mic,
  MicOff,
  Square,
  BarChart3,
  Calendar,
  Users,
  TrendingUp,
  Zap
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import useSpeechRecognition from "../../hooks/useSpeechRecognition";
import { Button } from "../../components/ui/button";
import { Card } from "../../components/ui/card";
import { useChat } from "./useChat";
import { useAuth } from "../../features/auth";
import { getCurrentClinic } from "../../services/apiClinic";
import { toggleOnlineBooking, changeThemeMode, reorderMenuItem, resetToDefaultSettings, changeColors, executeAIAction } from "../../services/apiAskTabibi";
import { useUserPreferencesContext } from "../../features/user-preferences/UserPreferencesProvider";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { cn } from "../../lib/utils";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { ActionRenderer, parseAIResponse, FormattedText, InlineMessageRenderer } from "./ActionRenderer";
import PhaseIndicator from "./PhaseIndicator";
import { PHASES } from "../services/aiPipeline";
import AppointmentCreateDialog from "../../features/calendar/AppointmentCreateDialog";
import PatientCreateDialog from "../../features/patients/PatientCreateDialog";
import TreatmentTemplateCreateDialog from "../../features/treatment-plans/TreatmentTemplateCreateDialog";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

// Component name mappings - handle multiple variations
const COMPONENT_MAP = {
  "new-appointment": "appointment",
  "add-appointment": "appointment",
  "appointment": "appointment",
  "new-patient": "patient",
  "add-patient": "patient",
  "patient": "patient",
  "new-treatment": "treatment",
  "add-treatment": "treatment",
  "treatment": "treatment",
  "new-staff": "staff",
  "add-staff": "staff",
  "staff": "staff",
  "new-visit": "visit",
  "add-visit": "visit",
  "visit": "visit",
  "new-plan": "plan",
  "add-plan": "plan",
  "plan": "plan"
};

// Helper function to group conversations by date
function groupConversationsByDate(conversations) {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const lastWeek = new Date(today);
  lastWeek.setDate(lastWeek.getDate() - 7);
  const lastMonth = new Date(today);
  lastMonth.setDate(lastMonth.getDate() - 30);

  const groups = {
    today: [],
    yesterday: [],
    thisWeek: [],
    thisMonth: [],
    older: []
  };

  conversations.forEach(conv => {
    const convDate = new Date(conv.updated_at);
    if (convDate >= today) {
      groups.today.push(conv);
    } else if (convDate >= yesterday) {
      groups.yesterday.push(conv);
    } else if (convDate >= lastWeek) {
      groups.thisWeek.push(conv);
    } else if (convDate >= lastMonth) {
      groups.thisMonth.push(conv);
    } else {
      groups.older.push(conv);
    }
  });

  return groups;
}

// ========================
// مكون الرسالة الواحدة مع دعم الـ Actions المضمنة
// ========================
function ChatMessage({ message, isStreaming = false, onAction, executeResults = {} }) {
  const isUser = message.role === "user";
  const isAssistant = message.role === "assistant";

  // Parse content for actions if it's an assistant message
  const { segments } = isAssistant
    ? parseAIResponse(message.content)
    : { segments: [{ type: 'text', content: message.content }] };

  return (
    <div className={cn(
      "flex gap-2 sm:gap-3 mb-3 sm:mb-4",
      isUser ? "flex-row-reverse" : "flex-row"
    )}>
      {/* Avatar */}
      <div className={cn(
        "flex-shrink-0 w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center",
        isUser
          ? "bg-primary text-primary-foreground"
          : "bg-gradient-to-br from-primary/20 to-secondary/20 text-primary"
      )}>
        {isUser ? (
          <User className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        ) : (
          <Bot className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        )}
      </div>

      {/* Message Bubble */}
      <div className={cn(
        "max-w-[82%] sm:max-w-[80%] rounded-2xl px-3 py-2 sm:px-4 sm:py-3",
        isUser
          ? "bg-primary text-primary-foreground rounded-tr-md"
          : "bg-card border border-border/60 rounded-tl-md shadow-sm"
      )}>
        <div className="text-[13px] sm:text-sm leading-relaxed">
          {isAssistant ? (
            // Use InlineMessageRenderer for inline actions
            <InlineMessageRenderer segments={segments} onAction={onAction} executeResults={executeResults} />
          ) : (
            <p className="whitespace-pre-wrap">{message.content}</p>
          )}
          {isStreaming && (
            <span className="inline-block w-1.5 h-3.5 sm:w-2 sm:h-4 bg-current ml-1 animate-pulse" />
          )}
        </div>

        {message.created_at && (
          <p className={cn(
            "text-[9px] sm:text-[10px] mt-1.5 sm:mt-2 opacity-50",
            isUser ? "text-left" : "text-right"
          )}>
            {format(new Date(message.created_at), "hh:mm a", { locale: ar })}
          </p>
        )}
      </div>
    </div>
  );
}

// ========================
// مكون Loading للرسالة
// ========================
function TypingIndicator() {
  return (
    <div className="flex gap-2 sm:gap-3 mb-3 sm:mb-4">
      <div className="flex-shrink-0 w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-secondary/20 text-primary">
        <Bot className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
      </div>
      <div className="bg-card border border-border/60 rounded-2xl rounded-tl-md px-3 py-2.5 sm:px-4 sm:py-3 shadow-sm">
        <div className="flex gap-1">
          <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
          <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
          <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
        </div>
      </div>
    </div>
  );
}

// ========================
// مكون إدخال الرسالة - Mobile Optimized with Mic & Stop
// ========================
function ChatInput({ onSend, disabled, isStreaming, onStop }) {
  const [message, setMessage] = useState("");
  const textareaRef = useRef(null);
  
  // Speech recognition hook
  const { 
    isListening, 
    isSupported: isSpeechSupported, 
    transcript, 
    startListening, 
    stopListening,
    resetTranscript 
  } = useSpeechRecognition();
  
  // Update message when transcript changes (real-time)
  useEffect(() => {
    if (transcript) {
      setMessage(prev => prev + (prev ? " " : "") + transcript);
      resetTranscript();
    }
  }, [transcript, resetTranscript]);
  
  // Play WhatsApp-like send sound
  const playSendSound = useCallback(() => {
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      
      // WhatsApp-like "swoosh" sound - two quick tones
      const createTone = (freq, startTime, duration, volume) => {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(freq, audioContext.currentTime + startTime);
        oscillator.frequency.exponentialRampToValueAtTime(freq * 1.5, audioContext.currentTime + startTime + duration * 0.5);
        oscillator.frequency.exponentialRampToValueAtTime(freq * 0.8, audioContext.currentTime + startTime + duration);
        
        gainNode.gain.setValueAtTime(0, audioContext.currentTime + startTime);
        gainNode.gain.linearRampToValueAtTime(volume, audioContext.currentTime + startTime + 0.01);
        gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + startTime + duration);
        
        oscillator.start(audioContext.currentTime + startTime);
        oscillator.stop(audioContext.currentTime + startTime + duration);
      };
      
      // Two-tone swoosh effect like WhatsApp
      createTone(880, 0, 0.08, 0.15);
      createTone(1320, 0.03, 0.1, 0.12);
      
    } catch (e) {
      console.log("Audio not supported");
    }
  }, []);

  const handleSend = () => {
    if (message.trim() && !disabled) {
      playSendSound();
      onSend(message.trim(), false);
      setMessage("");
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }
      if (isListening) {
        stopListening();
      }
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Auto-resize textarea
  const handleInput = (e) => {
    const textarea = e.target;
    textarea.style.height = "auto";
    textarea.style.height = Math.min(textarea.scrollHeight, 100) + "px";
    setMessage(textarea.value);
  };
  
  // Toggle microphone
  const toggleMic = () => {
    if (isListening) {
      stopListening();
    } else {
      resetTranscript();
      startListening();
    }
  };

  return (
    <div className="bg-background border-t border-border/50 px-2 sm:px-4 py-2 sm:py-3 safe-area-bottom">
      <div className="max-w-3xl mx-auto flex flex-col items-center">
        {/* Listening Indicator */}
        <AnimatePresence>
          {isListening && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="flex items-center justify-center gap-2 mb-2 py-1.5 px-3 rounded-full bg-red-500/10 border border-red-500/20 w-fit mx-auto"
            >
              <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              <span className="text-[10px] sm:text-xs text-red-500 font-medium">بسجل صوتك</span>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex items-end gap-1.5 sm:gap-2 bg-card rounded-2xl border border-border/60 shadow-sm p-1.5 sm:p-2 px-2 sm:px-3 py-1.5 sm:py-2.5 w-[95%] mb-[8px]">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={handleInput}
            onKeyDown={handleKeyDown}
            placeholder="اكتب او اتكلم وانا هسمعك"
            disabled={disabled}
            className={cn(
              "flex-1 resize-none bg-transparent px-2 sm:px-3 py-1.5 sm:py-2 text-[13px] sm:text-sm",
              "focus:outline-none",
              "placeholder:text-muted-foreground/70 min-h-[36px] sm:min-h-[40px] max-h-[100px]",
              "disabled:opacity-50 disabled:cursor-not-allowed"
            )}
            rows={1}
          />

          {/* Microphone Button */}
          {isSpeechSupported && (
            <Button
              onClick={toggleMic}
              disabled={disabled}
              size="icon"
              variant="ghost"
              className={cn(
                "h-8 w-8 sm:h-9 sm:w-9 rounded-xl flex-shrink-0 transition-all",
                isListening 
                  ? "bg-red-500 hover:bg-red-600 text-white animate-pulse" 
                  : "hover:bg-muted text-muted-foreground"
              )}
              title={isListening ? "وقف التسجيل" : "اضغط عشان تتكلم"}
            >
              {isListening ? (
                <MicOff className="w-4 h-4" />
              ) : (
                <Mic className="w-4 h-4" />
              )}
            </Button>
          )}

          {/* Send / Stop Button */}
          <Button
            onClick={isStreaming ? onStop : handleSend}
            disabled={!isStreaming && (!message.trim() || disabled)}
            size="icon"
            className={cn(
              "h-8 w-8 sm:h-9 sm:w-9 rounded-xl flex-shrink-0 transition-all",
              isStreaming
                ? "bg-red-500 hover:bg-red-600 text-white"
                : message.trim() 
                  ? "bg-primary hover:bg-primary/90 text-primary-foreground" 
                  : "bg-muted text-muted-foreground"
            )}
            title={isStreaming ? "وقف الرد" : "ابعت"}
          >
            {isStreaming ? (
              <Square className="w-4 h-4" />
            ) : disabled ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

// ========================
// مكون المحادثات الجانبية - Left Side with Grouping & Pagination
// ========================
function ChatSidebar({
  conversations,
  activeId,
  onSelect,
  onNew,
  onDelete,
  isLoading,
  isOpen,
  onClose
}) {
  const [displayCount, setDisplayCount] = useState(10);
  
  // Group conversations by date
  const groupedConversations = useMemo(() => {
    return groupConversationsByDate(conversations.slice(0, displayCount));
  }, [conversations, displayCount]);
  
  const hasMore = conversations.length > displayCount;
  
  const loadMore = () => {
    setDisplayCount(prev => prev + 10);
  };
  
  // Section labels
  const groupLabels = {
    today: "النهاردة",
    yesterday: "امبارح",
    thisWeek: "الاسبوع ده",
    thisMonth: "الشهر ده",
    older: "اقدم"
  };

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar - LEFT side */}
      <div className={cn(
        "fixed md:static top-0 left-0 h-full w-[280px] sm:w-72 bg-card border-r border-border/50 z-50",
        "transform transition-transform duration-300 ease-in-out",
        "flex flex-col shadow-xl md:shadow-none",
        isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
      )}>
        {/* Header */}
        <div className="p-3 sm:p-4 border-b border-border/50 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
            <h2 className="font-semibold text-sm sm:text-base">المحادثات</h2>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={onNew}
              className="text-primary h-8 w-8"
              title="محادثة جديدة"
            >
              <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="md:hidden h-8 w-8"
            >
              <X className="w-4 h-4 sm:w-5 sm:h-5" />
            </Button>
          </div>
        </div>

        {/* Conversations List with Groups */}
        <div className="flex-1 overflow-y-auto p-2 chat-scrollbar">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-5 h-5 sm:w-6 sm:h-6 animate-spin text-muted-foreground" />
            </div>
          ) : conversations.length === 0 ? (
            <div className="text-center py-6 sm:py-8 px-4">
              <MessageCircle className="w-10 h-10 sm:w-12 sm:h-12 mx-auto text-muted-foreground/30 mb-3" />
              <p className="text-xs sm:text-sm text-muted-foreground">مفيش محادثات لسه</p>
              <p className="text-[10px] sm:text-xs text-muted-foreground/70 mt-1">ابدأ محادثة جديدة</p>
            </div>
          ) : (
            <>
              {Object.entries(groupLabels).map(([key, label]) => {
                const items = groupedConversations[key];
                if (items.length === 0) return null;
                
                return (
                  <div key={key} className="mb-4">
                    <p className="text-[10px] sm:text-xs text-muted-foreground font-medium px-2 mb-2">
                      {label}
                    </p>
                    <div className="space-y-1">
                      {items.map((conv) => (
                        <motion.div
                          key={conv.id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          className={cn(
                            "group relative rounded-xl p-2.5 sm:p-3 cursor-pointer transition-all",
                            "hover:bg-muted/50 active:scale-[0.98]",
                            activeId === conv.id && "bg-primary/10 border border-primary/20"
                          )}
                          onClick={() => onSelect(conv.id)}
                        >
                          <div className="flex items-start gap-2">
                            <MessageCircle className={cn(
                              "w-3.5 h-3.5 sm:w-4 sm:h-4 mt-0.5 flex-shrink-0",
                              activeId === conv.id ? "text-primary" : "text-muted-foreground"
                            )} />
                            <div className="flex-1 min-w-0">
                              <p className="text-xs sm:text-sm font-medium truncate">
                                {conv.title}
                              </p>
                              <p className="text-[10px] sm:text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                                <Clock className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                                {format(new Date(conv.updated_at), "hh:mm a", { locale: ar })}
                              </p>
                            </div>
                          </div>
                          
                          {/* Delete button */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onDelete(conv.id);
                            }}
                            className={cn(
                              "absolute left-2 top-1/2 -translate-y-1/2",
                              "opacity-0 group-hover:opacity-100 transition-opacity",
                              "p-1 sm:p-1.5 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600"
                            )}
                          >
                            <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                          </button>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                );
              })}
              
              {/* Load More Button */}
              {hasMore && (
                <motion.button
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  onClick={loadMore}
                  className="w-full py-2 mt-2 text-xs text-primary hover:bg-primary/10 rounded-lg transition-colors flex items-center justify-center gap-1"
                >
                  <ChevronDown className="w-4 h-4" />
                  عرض المزيد ({conversations.length - displayCount} محادثة)
                </motion.button>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}

// ========================
// شاشة الترحيب مع الانيميشنز المحسنة
// ========================
function WelcomeScreen({ onStartChat }) {
  // اسئلة مقترحة متطورة بتوضح قوة الـ AI - باللهجة المصرية بدون علامات ترقيم
  const suggestions = [
    {
      text: "اعملي رسم بياني خطي بيوضح عدد الحجوزات اليومية اللي جيه من العيادة مقارنة باللي جيه من النت  ",
      icon: BarChart3,
      category: "تحليلات"
    },
    {
      text: "احجزلي موعد لاحمد محمد بكره الساعة 4 العصر وابعتله رسالة تاكيد",
      icon: Calendar,
      category: "حجوزات"
    },
    {
      text: "عايز تحليل كامل لاداء العيادة الشهر ده وقارنه بالشهر اللي فات ووريني الفرق",
      icon: TrendingUp,
      category: "تقارير"
    },
    {
      text: "وريني كل الاشعارات اللي جاتلي انهارده وافتحلي صفحة اول مريض محتاج متابعة",
      icon: Users,
      category: "ادارة"
    },
    {
      text: "غير لون الثيم للبني الغامق وخليني في الوضع النهاري",
      icon: Zap,
      category: "اعدادات"
    }
  ];
  
  // Animation variants - محسنة مع تأثيرات سلسة
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.15
      }
    }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.9 },
    visible: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      transition: { 
        type: "spring", 
        stiffness: 120, 
        damping: 14,
        mass: 0.8
      }
    }
  };
  
  const iconVariants = {
    hidden: { scale: 0, rotate: -180, opacity: 0 },
    visible: { 
      scale: 1, 
      rotate: 0,
      opacity: 1,
      transition: { 
        type: "spring", 
        stiffness: 200, 
        damping: 15, 
        delay: 0.1 
      }
    }
  };
  
  const floatingVariants = {
    animate: {
      y: [-3, 3, -3],
      rotate: [-5, 5, -5],
      transition: {
        duration: 3,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };
  
  const pulseVariants = {
    animate: {
      scale: [1, 1.05, 1],
      opacity: [0.3, 0.5, 0.3],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      <motion.div 
        className="max-w-sm sm:max-w-2xl text-center"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Avatar with enhanced pulse animation */}
        <motion.div 
          className="relative w-24 h-24 sm:w-28 sm:h-28 mx-auto mb-5 sm:mb-7"
          variants={iconVariants}
        >
          <motion.div 
            className="absolute inset-0 rounded-full bg-gradient-to-br from-primary/40 to-secondary/40"
            variants={pulseVariants}
            animate="animate"
          />
          <motion.div 
            className="absolute inset-1 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20"
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          />
          <div className="absolute inset-3 rounded-full bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center backdrop-blur-sm">
            <Bot className="w-12 h-12 sm:w-14 sm:h-14 text-primary drop-shadow-lg" />
          </div>
          {/* Floating sparkles */}
          <motion.div 
            className="absolute -top-2 -right-2"
            variants={floatingVariants}
            animate="animate"
          >
            <Sparkles className="w-6 h-6 text-yellow-500 drop-shadow-md" />
          </motion.div>
          <motion.div 
            className="absolute -bottom-1 -left-2"
            variants={floatingVariants}
            animate="animate"
            style={{ animationDelay: "1s" }}
          >
            <Zap className="w-4 h-4 text-primary/70" />
          </motion.div>
        </motion.div>
        
        <motion.h1 
          className="text-2xl sm:text-4xl font-bold mb-3 bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent bg-[length:200%] animate-gradient"
          variants={itemVariants}
        >
          يلا نبدا
        </motion.h1>
        
        <motion.p 
          className="text-sm sm:text-lg text-muted-foreground mb-7 sm:mb-9 leading-relaxed max-w-md mx-auto"
          variants={itemVariants}
        >
          انا طبيبي هساعدك في كل حاجة تخص عيادتك من غير تعقيد خالص
        </motion.p>
        
        <motion.div 
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4"
          variants={containerVariants}
        >
          {suggestions.map((suggestion, index) => {
            const Icon = suggestion.icon;
            return (
              <motion.button
                key={index}
                variants={itemVariants}
                whileHover={{ 
                  scale: 1.03, 
                  y: -4,
                  boxShadow: "0 10px 40px -10px rgba(0,0,0,0.2)"
                }}
                whileTap={{ scale: 0.97 }}
                onClick={() => onStartChat(suggestion.text)}
                className={cn(
                  "p-4 sm:p-5 rounded-2xl border border-border/50 bg-card/60 backdrop-blur-sm text-[12px] sm:text-[13px] text-right",
                  "hover:bg-gradient-to-br hover:from-primary/5 hover:to-secondary/5 hover:border-primary/40 transition-all duration-300",
                  "flex flex-col gap-3 group relative overflow-hidden"
                )}
              >
                {/* Category badge */}
                <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[9px] sm:text-[10px] font-medium">
                  {suggestion.category}
                </div>
                
                <div className="flex items-start gap-3 mt-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center flex-shrink-0 group-hover:from-primary/30 group-hover:to-secondary/30 transition-all duration-300 shadow-sm">
                    <Icon className="w-5 h-5 text-primary group-hover:scale-110 transition-transform" />
                  </div>
                  <span className="leading-relaxed text-muted-foreground group-hover:text-foreground transition-colors">
                    {suggestion.text}
                  </span>
                </div>
              </motion.button>
            );
          })}
        </motion.div>
        
        {/* Hint text */}
        <motion.p 
          className="text-xs sm:text-sm text-muted-foreground/50 mt-7 sm:mt-9"
          variants={itemVariants}
        >
          جرب تسالني عن اي حاجة وانا هساعدك علي طول
        </motion.p>
      </motion.div>
    </div>
  );
}

// ========================
// الصفحة الرئيسية
// ========================
export default function AskTabibiPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showAppointmentDialog, setShowAppointmentDialog] = useState(false);
  const [showPatientDialog, setShowPatientDialog] = useState(false);
  const [showTreatmentDialog, setShowTreatmentDialog] = useState(false);
  const [lastCreatedPatientId, setLastCreatedPatientId] = useState(null);
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { user } = useAuth();
  const { applyColors, applyThemeMode } = useUserPreferencesContext();

  const {
    activeConversationId,
    conversations,
    messages,
    isLoadingConversations,
    isLoadingMessages,
    startNewConversation,
    selectConversation,
    removeConversation,
    sendMessage,
    isStreaming,
    stopStreaming,
    isCreatingConversation,
    executeResults,
    currentPhase,
    pipelineLogs
  } = useChat();

  // جلب بيانات العيادة
  const { data: clinicData } = useQuery({
    queryKey: ["clinic"],
    queryFn: getCurrentClinic,
    staleTime: 5 * 60 * 1000
  });

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isStreaming]);

  // Handle sending a message
  const handleSendMessage = useCallback(async (content, deepReasoning = false) => {
    if (!activeConversationId) {
      // إنشاء محادثة جديدة أولاً
      const newConv = await startNewConversation();
      if (newConv) {
        // أرسل الرسالة مباشرة باستخدام الـ ID الجديد
        sendMessage(content, clinicData, newConv.id, deepReasoning);
      }
    } else {
      sendMessage(content, clinicData, undefined, deepReasoning);
    }
  }, [activeConversationId, startNewConversation, sendMessage, clinicData]);

  // Start chat with a suggestion
  const handleStartWithSuggestion = useCallback(async (suggestion) => {
    const newConv = await startNewConversation();
    if (newConv) {
      // أرسل الرسالة مباشرة باستخدام الـ ID الجديد
      sendMessage(suggestion, clinicData, newConv.id);
    }
  }, [startNewConversation, sendMessage, clinicData]);

  // Handle actions from AI messages
  const handleAction = useCallback(async (actionType, actionData) => {
    console.log("Action triggered:", actionType, actionData);

    // Handle input submission - send as message to continue the conversation
    if (actionType === "input") {
      const { id, value } = actionData;
      // Format the response based on input type
      let message = value;
      if (id === 'patientPhone' || id === 'phone') {
        message = `رقم الموبايل: ${value}`;
      } else if (id === 'patientName' || id === 'name') {
        message = `الاسم: ${value}`;
      } else if (id === 'date') {
        message = `التاريخ: ${value}`;
      } else if (id === 'time') {
        message = `الوقت: ${value}`;
      }
      // Send the input as a regular message
      handleSendMessage(message);
      return;
    }

    // Handle form submission - send all form data as a message
    if (actionType === "formSubmit") {
      const { formId, data, formattedMessage, action } = actionData;
      // Send the formatted form data as a message to the AI
      handleSendMessage(formattedMessage);
      return;
    }

    // Handle component opening
    if (actionType === "openComponent") {
      const normalizedComponent = COMPONENT_MAP[actionData];

      switch (normalizedComponent) {
        case "appointment":
          setShowAppointmentDialog(true);
          break;
        case "patient":
          setShowPatientDialog(true);
          break;
        case "treatment":
          // Open treatment template dialog directly
          setShowTreatmentDialog(true);
          break;
        case "staff":
          // Navigate to staff page with add dialog trigger
          navigate("/staff?action=add");
          break;
        case "visit":
          // Visit requires a patient context
          if (lastCreatedPatientId) {
            navigate(`/patients/${lastCreatedPatientId}?action=add-visit`);
          } else {
            toast.error("محتاج تختار مريض الأول عشان تضيفله كشف");
            navigate("/patients");
          }
          break;
        case "plan":
          // Treatment plan requires a patient context
          if (lastCreatedPatientId) {
            navigate(`/patients/${lastCreatedPatientId}?action=add-plan`);
          } else {
            toast.error("محتاج تختار مريض الأول عشان تضيفله خطة علاجية");
            navigate("/patients");
          }
          break;
        default:
          console.log("Unknown component:", actionData);
      }
      return;
    }

    // Replace placeholders in navigation path
    let navigationPath = actionData;
    if (typeof actionData === 'string') {
      console.log("Before replacement - actionData:", actionData, "lastCreatedPatientId:", lastCreatedPatientId);

      // Replace {{patientId}} with actual patient ID if available in context
      // This would be available after patient creation
      navigationPath = actionData.replace(/{{patientId}}/g, lastCreatedPatientId || '');

      // Additional replacements can be added here as needed
      // For example, if we have other placeholders like {{appointmentId}}

      console.log("Replaced navigation path:", actionData, "->", navigationPath);
    }

    // Handle navigation
    if (actionType === "navigate") {
      navigate(navigationPath);
      return;
    }

    // Handle executable actions
    if (actionType === "action") {
      try {
        // actionData is now the full action object with { action: "actionName", data: {...} }
        const actionName = typeof actionData === 'string' ? actionData : actionData?.action;
        const data = typeof actionData === 'object' ? actionData?.data : undefined;

        // Execute ALL AI actions through the API - Complete CRUD operations
        const aiActionsList = [
          // Patient CRUD
          'createPatientAction', 'updatePatientAction', 'deletePatientAction', 'searchPatientAction', 'resolvePatientAction', 'getPatientDetailsAction',
          // Appointment CRUD
          'createAppointmentAction', 'updateAppointmentAction', 'deleteAppointmentAction', 'cancelAppointmentAction', 'rescheduleAppointmentAction', 'checkAvailabilityAction', 'getAppointmentDetailsAction', 'filterAppointmentsAction',
          // Visit CRUD
          'createVisitAction', 'updateVisitAction', 'deleteVisitAction',
          // Treatment Plan CRUD
          'createTreatmentPlanAction', 'updateTreatmentPlanAction', 'deleteTreatmentPlanAction',
          // Staff
          'addStaffAction',
          // Clinic Settings
          'setClinicDayOffAction', 'updateClinicHoursAction', 'updateBookingPriceAction',
          // Batch Operations
          'rescheduleAppointments', // Reschedule all appointments from one day to another
          // Advanced
          'databaseQueryAction', // Direct database queries
          'createNotificationAction', // Send notifications
          'analyzeUserPerformanceAction', // Analyze clinic performance
          // Daily Email Settings
          'enableDailyAppointmentsEmailAction',
          'disableDailyAppointmentsEmailAction',
          'updateDailyAppointmentsEmailTimeAction',
          'getDailyEmailSettingsAction'
        ];

        if (aiActionsList.includes(actionName)) {
          console.log(`Executing ${actionName} with data:`, data);
          const result = await executeAIAction(actionName, data);
          console.log(`${actionName} result:`, result);

          // Handle special cases
          if (result.patientId) {
            setLastCreatedPatientId(result.patientId);
            console.log("Updated lastCreatedPatientId:", result.patientId);
          }

          // Show success message
          if (result?.message) {
            toast.success(result.message);
          }

          // Invalidate relevant queries
          if (actionName.includes('Patient')) {
            queryClient.invalidateQueries({ queryKey: ['patients'] });
            queryClient.invalidateQueries({ queryKey: ['dashboardStats'] });
          } else if (actionName.includes('Appointment')) {
            queryClient.invalidateQueries({ queryKey: ['appointments'] });
            queryClient.invalidateQueries({ queryKey: ['dashboardStats'] });
          } else if (actionName.includes('Visit')) {
            queryClient.invalidateQueries({ queryKey: ['visits'] });
            queryClient.invalidateQueries({ queryKey: ['dashboardStats'] });
          } else if (actionName.includes('TreatmentPlan')) {
            queryClient.invalidateQueries({ queryKey: ['treatmentTemplates'] });
            queryClient.invalidateQueries({ queryKey: ['patientPlans'] });
          } else if (actionName.includes('Staff')) {
            queryClient.invalidateQueries({ queryKey: ['staff'] });
          } else if (actionName.includes('Clinic') || actionName.includes('Booking')) {
            queryClient.invalidateQueries({ queryKey: ['clinic'] });
          }

          return; // Exit early after handling AI action
        }

        // Handle UI-only actions
        switch (actionName) {
          case "enableOnlineBooking":
            await toggleOnlineBooking(true);
            toast.success("تم تفعيل الحجز الإلكتروني");
            queryClient.invalidateQueries({ queryKey: ["clinic"] });
            break;

          case "disableOnlineBooking":
            await toggleOnlineBooking(false);
            toast.success("تم إيقاف الحجز الإلكتروني");
            queryClient.invalidateQueries({ queryKey: ["clinic"] });
            break;

          case "copyBookingLink":
            if (clinicData?.clinic_uuid) {
              const bookingLink = `${window.location.origin}/booking/${clinicData.clinic_uuid}`;
              await navigator.clipboard.writeText(bookingLink);
              toast.success("تم نسخ رابط الحجز");
            } else {
              toast.error("مش لاقي رابط الحجز");
            }
            break;

          case "changeTheme": {
            const mode = data?.mode || 'dark';
            const result = await changeThemeMode(mode);
            applyThemeMode(mode);
            toast.success(result.message);
            break;
          }

          case "reorderMenu": {
            const { itemId, position } = data || {};
            if (!itemId || !position) {
              toast.error("بيانات غير كاملة");
              break;
            }
            const result = await reorderMenuItem(itemId, position);
            toast.success(result.message);
            setTimeout(() => window.location.reload(), 500);
            break;
          }

          case "resetSettings": {
            const result = await resetToDefaultSettings();
            applyColors('#1AA19C', '#224FB5', '#FF6B6B');
            applyThemeMode('system');
            toast.success(result.message);
            break;
          }

          case "changeColors": {
            const { primary, secondary, accent } = data || {};
            if (!primary) {
              toast.error("بيانات الألوان غير كاملة");
              break;
            }
            const result = await changeColors(primary, secondary, accent);
            applyColors(primary, secondary, accent);
            toast.success(result.message);
            break;
          }

          case "changeColorsAction": {
            // Handle preset colors
            const presets = {
              red: { primary: '#EF4444', secondary: '#DC2626', accent: '#F87171' },
              blue: { primary: '#3B82F6', secondary: '#2563EB', accent: '#60A5FA' },
              green: { primary: '#22C55E', secondary: '#16A34A', accent: '#4ADE80' },
              purple: { primary: '#8B5CF6', secondary: '#7C3AED', accent: '#A78BFA' },
              orange: { primary: '#F97316', secondary: '#EA580C', accent: '#FB923C' },
              pink: { primary: '#EC4899', secondary: '#DB2777', accent: '#F472B6' },
              teal: { primary: '#1AA19C', secondary: '#224FB5', accent: '#FF6B6B' }
            };
            const preset = data?.preset;
            const colors = presets[preset] || presets.teal;
            applyColors(colors.primary, colors.secondary, colors.accent);
            await changeColors(colors.primary, colors.secondary, colors.accent);
            toast.success(`تم تغيير الألوان للـ ${preset || 'teal'}`);
            break;
          }

          case "changeThemeAction": {
            const mode = data?.mode || 'system';
            const result = await changeThemeMode(mode);
            applyThemeMode(mode);
            toast.success(result.message || `تم تغيير المظهر للـ ${mode}`);
            break;
          }

          case "setBrownThemeAction": {
            const brownColors = { primary: '#8B4513', secondary: '#A0522D', accent: '#D2691E' };
            applyColors(brownColors.primary, brownColors.secondary, brownColors.accent);
            applyThemeMode('light');
            await changeColors(brownColors.primary, brownColors.secondary, brownColors.accent);
            await changeThemeMode('light');
            toast.success('تم تطبيق الثيم البني');
            break;
          }

          case "resetThemeAction": {
            const result = await resetToDefaultSettings();
            applyColors('#1AA19C', '#224FB5', '#FF6B6B');
            applyThemeMode('system');
            toast.success(result.message || 'تم إرجاع الإعدادات الأصلية');
            break;
          }

          case "changeTime": {
            // Open appointment dialog with pre-filled data for time change
            const { date, time, patientId, patientName, patientPhone } = data || {};
            // Store the pending appointment data for the dialog
            sessionStorage.setItem('pendingAppointment', JSON.stringify({
              date,
              time,
              patientId,
              patientName,
              patientPhone
            }));
            setShowAppointmentDialog(true);
            toast.success("اختار الوقت المناسب");
            break;
          }

          case "showMoreAppointments": {
            // Navigate to appointments page with filter
            const { date: filterDate, status: filterStatus } = data || {};
            let url = '/appointments';
            if (filterDate) {
              url += `?date=${filterDate}`;
            }
            navigate(url);
            break;
          }

          default:
            console.log("Unknown action:", actionName, data);
        }
      } catch (error) {
        console.error("Action error:", error);
        toast.error(error.message || "حصل مشكلة");
      }
    }
  }, [navigate, queryClient, clinicData, applyColors, applyThemeMode, lastCreatedPatientId]);

  const handlePatientCreated = (newPatient) => {
    // Navigate to the newly created patient's profile
    if (newPatient?.id) {
      console.log("AI: Navigating to patient with ID:", newPatient.id, "Full patient object:", newPatient);
      // Update the last created patient ID for template replacement
      setLastCreatedPatientId(newPatient.id);
      console.log("Set lastCreatedPatientId to:", newPatient.id);
      navigate(`/patients/${newPatient.id}`);
      setShowPatientDialog(false); // Close the dialog after navigation
    } else {
      console.error("AI: No patient ID available for navigation", newPatient);
    }
  };

  return (
    <div className="h-[100dvh] md:h-[calc(100vh-6rem)] flex flex-col -m-6 md:-m-0 overflow-hidden">
      {/* Appointment Create Dialog */}
      <AppointmentCreateDialog
        open={showAppointmentDialog}
        onClose={() => setShowAppointmentDialog(false)}
      />

      {/* Patient Create Dialog */}
      <PatientCreateDialog
        open={showPatientDialog}
        onClose={() => setShowPatientDialog(false)}
        clinicId={user?.clinic_id}
        onPatientCreated={handlePatientCreated}
      />

      {/* Treatment Template Create Dialog */}
      <TreatmentTemplateCreateDialog
        open={showTreatmentDialog}
        onClose={() => setShowTreatmentDialog(false)}
        onTemplateCreated={(template) => {
          toast.success(`تم إضافة الخطة العلاجية "${template.name}" بنجاح`);
          queryClient.invalidateQueries({ queryKey: ['treatmentTemplates'] });
        }}
      />
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar - LEFT side first in flex */}
        <ChatSidebar
          conversations={conversations}
          activeId={activeConversationId}
          onSelect={(id) => {
            selectConversation(id);
            setSidebarOpen(false);
          }}
          onNew={() => {
            startNewConversation();
            setSidebarOpen(false);
          }}
          onDelete={removeConversation}
          isLoading={isLoadingConversations}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        {/* Chat Area */}
        <div className="flex-1 flex flex-col bg-muted/10 relative min-h-0">
          {/* Header */}
          <div className="bg-card/95 backdrop-blur-md border-b border-border/50 px-3 sm:px-4 py-2 sm:py-3 flex items-center justify-between flex-shrink-0">
            {/* LEFT: Menu button for mobile */}
            <div className="flex items-center gap-2 sm:gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSidebarOpen(true)}
                className="md:hidden h-8 w-8"
              >
                <Menu className="w-5 h-5" />
              </Button>
              <button 
                onClick={() => {
                  // Clear active conversation to show welcome screen
                  selectConversation(null);
                }}
                className="flex items-center gap-2 sm:gap-3 cursor-pointer hover:opacity-80 transition-opacity"
              >
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                  <Bot className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                </div>
                <div>
                  <h1 className="font-semibold text-sm sm:text-base">Tabibi AI</h1>
                  <p className="text-[10px] sm:text-xs text-muted-foreground hidden sm:block">المساعد الذكي للمنصة</p>
                </div>
              </button>
            </div>

            {/* RIGHT: New chat button - Desktop only */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => startNewConversation()}
              disabled={isCreatingConversation}
              className="hidden sm:flex h-8 text-xs"
            >
              <Plus className="w-4 h-4 ml-1" />
              محادثة جديدة
            </Button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto px-3 sm:px-4 py-3 sm:py-4 min-h-0 chat-scrollbar">
            {!activeConversationId && messages.length === 0 ? (
              <WelcomeScreen onStartChat={handleStartWithSuggestion} />
            ) : isLoadingMessages ? (
              <div className="flex items-center justify-center h-full">
                <Loader2 className="w-6 h-6 sm:w-8 sm:h-8 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <div className="max-w-3xl mx-auto">
                {messages.map((msg) => (
                  <ChatMessage key={msg.id} message={msg} onAction={handleAction} executeResults={executeResults} />
                ))}
                {isStreaming && <PhaseIndicator phase={currentPhase} />}
                <div ref={messagesEndRef} className="h-1" />
              </div>
            )}
          </div>

          {/* Input Area - Fixed at bottom */}
          <div className="flex-shrink-0">
            <ChatInput
              onSend={handleSendMessage}
              disabled={isStreaming || isCreatingConversation}
              isStreaming={isStreaming}
              onStop={stopStreaming}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
