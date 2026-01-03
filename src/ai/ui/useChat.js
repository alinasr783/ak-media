import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getConversations,
  getMessages,
  createConversation,
  saveMessage,
  sendMessageToAI,
  deleteConversation,
  updateConversationTitle,
  archiveConversation,
  executeAIAction
} from "../../services/apiAskTabibi";
import { parseAIResponse } from "./ActionRenderer";
import { useAuth } from "../../features/auth";
import { usePlan } from "../../features/auth";
import { useCallback, useState, useRef, useEffect } from "react";
import toast from "react-hot-toast";
import { createPipeline, PHASES } from "../services/aiPipeline";

// LocalStorage keys
const STORAGE_KEYS = {
  ACTIVE_CONVERSATION: 'tabibi_active_conversation',
  PENDING_REQUEST: 'tabibi_pending_request'
};

// Helper to safely get from localStorage
const getFromStorage = (key, defaultValue = null) => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch {
    return defaultValue;
  }
};

// Helper to safely save to localStorage
const saveToStorage = (key, value) => {
  try {
    if (value === null || value === undefined) {
      localStorage.removeItem(key);
    } else {
      localStorage.setItem(key, JSON.stringify(value));
    }
  } catch (e) {
    console.warn('Failed to save to localStorage:', e);
  }
};

// Hook لجلب كل المحادثات
export function useConversations() {
  return useQuery({
    queryKey: ["chat-conversations"],
    queryFn: getConversations,
    staleTime: 1000 * 60, // 1 minute
  });
}

// Hook لجلب رسائل محادثة معينة
export function useMessages(conversationId) {
  return useQuery({
    queryKey: ["chat-messages", conversationId],
    queryFn: () => getMessages(conversationId),
    enabled: !!conversationId,
    staleTime: 1000 * 30, // 30 seconds
  });
}

// Hook لإنشاء محادثة جديدة
export function useCreateConversation() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: () => createConversation(user?.clinic_id),
    onSuccess: (newConversation) => {
      queryClient.invalidateQueries({ queryKey: ["chat-conversations"] });
      return newConversation;
    },
    onError: (error) => {
      toast.error(error.message || "حصل مشكلة في إنشاء محادثة جديدة");
    }
  });
}

// Hook لحذف محادثة
export function useDeleteConversation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteConversation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chat-conversations"] });
      toast.success("تم حذف المحادثة");
    },
    onError: (error) => {
      toast.error(error.message || "حصل مشكلة في حذف المحادثة");
    }
  });
}

// Hook لتحديث عنوان محادثة
export function useUpdateConversationTitle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ conversationId, title }) => updateConversationTitle(conversationId, title),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chat-conversations"] });
    }
  });
}

// Hook لأرشفة محادثة
export function useArchiveConversation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: archiveConversation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chat-conversations"] });
      toast.success("تم أرشفة المحادثة");
    },
    onError: (error) => {
      toast.error(error.message || "حصل مشكلة في أرشفة المحادثة");
    }
  });
}

// Hook رئيسي لإرسال رسالة والحصول على رد - مع نظام Pipeline الجديد
export function useSendMessage() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { data: planData } = usePlan();
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingContent, setStreamingContent] = useState("");
  const [executeResults, setExecuteResults] = useState({});
  const [currentPhase, setCurrentPhase] = useState(PHASES.IDLE);
  const [pipelineLogs, setPipelineLogs] = useState([]);
  const pipelineRef = useRef(null);

  // Stop streaming and abort pipeline
  const stopStreaming = useCallback(() => {
    if (pipelineRef.current) {
      pipelineRef.current.abort();
      pipelineRef.current = null;
    }
    setIsStreaming(false);
    setCurrentPhase(PHASES.IDLE);
  }, []);

  // Log handler for pipeline
  const handlePipelineLog = useCallback((message, data) => {
    console.log('[Pipeline]', message, data || '');
    setPipelineLogs(prev => [...prev, { message, data, timestamp: Date.now() }]);
  }, []);

  // Phase change handler
  const handlePhaseChange = useCallback((phase) => {
    console.log('📍 Phase Changed:', phase);
    setCurrentPhase(phase);
  }, []);

  const sendMessage = useCallback(async (conversationId, messageContent, clinicData, deepReasoning = false) => {
    if (!conversationId || !messageContent.trim()) return;

    // Create new pipeline
    pipelineRef.current = createPipeline(handlePhaseChange, handlePipelineLog);

    setIsStreaming(true);
    setStreamingContent("");
    setExecuteResults({});
    setPipelineLogs([]);
    setCurrentPhase(PHASES.PLANNING);

    console.log('🚀 ========================================');
    console.log('🚀 Starting AI Pipeline');
    console.log('🚀 User Message:', messageContent);
    console.log('🚀 ========================================');

    try {
      // حفظ رسالة المستخدم
      const userMessage = await saveMessage(conversationId, "user", messageContent);
      console.log('✅ User message saved');

      // تحديث الكاش برسالة المستخدم
      queryClient.setQueryData(["chat-messages", conversationId], (old) => {
        return [...(old || []), userMessage];
      });

      // جلب كل الرسائل للمحادثة
      const allMessages = queryClient.getQueryData(["chat-messages", conversationId]) || [];

      // Run the pipeline
      const aiResponse = await pipelineRef.current.run(
        messageContent,
        allMessages,
        user,
        clinicData,
        planData,
        (chunk, fullContent) => {
          setStreamingContent(fullContent);
        }
      );

      console.log('✅ Pipeline completed');
      console.log('📝 AI Response length:', aiResponse?.length || 0);

      // Parse the AI response to extract execute commands
      const { executeCommands } = parseAIResponse(aiResponse);

      // Execute any commands automatically
      if (executeCommands && executeCommands.length > 0) {
        console.log('⚡ Executing commands:', executeCommands.length);
        const results = {};

        for (const cmd of executeCommands) {
          const execKey = JSON.stringify(cmd);
          const actionName = cmd.action;
          const actionData = cmd.data || {};

          try {
            console.log(`⚡ Executing: ${actionName}`, actionData);
            const result = await executeAIAction(actionName, actionData);
            results[execKey] = { status: 'success', result };
            console.log(`✅ ${actionName} success:`, result);

            // Show success toast
            if (result?.message) {
              toast.success(result.message);
            }

            // Invalidate relevant queries based on action type
            if (actionName.includes('Patient')) {
              queryClient.invalidateQueries({ queryKey: ['patients'] });
              queryClient.invalidateQueries({ queryKey: ['dashboardStats'] });
            } else if (actionName.includes('Appointment')) {
              queryClient.invalidateQueries({ queryKey: ['appointments'] });
              queryClient.invalidateQueries({ queryKey: ['dashboardStats'] });
            } else if (actionName.includes('Staff')) {
              queryClient.invalidateQueries({ queryKey: ['staff'] });
            } else if (actionName.includes('Clinic') || actionName.includes('Booking')) {
              queryClient.invalidateQueries({ queryKey: ['clinic'] });
            }
          } catch (error) {
            console.error(`❌ ${actionName} failed:`, error);
            results[execKey] = { status: 'error', result: { message: error.message } };
            toast.error(error.message || 'حصل مشكلة');
          }
        }

        setExecuteResults(results);
      }

      // حفظ رد الـ AI
      const assistantMessage = await saveMessage(conversationId, "assistant", aiResponse);
      console.log('✅ Assistant message saved');

      // تحديث الكاش برد الـ AI
      queryClient.setQueryData(["chat-messages", conversationId], (old) => {
        return [...(old || []), assistantMessage];
      });

      // تحديث قائمة المحادثات
      queryClient.invalidateQueries({ queryKey: ["chat-conversations"] });

      setIsStreaming(false);
      setCurrentPhase(PHASES.COMPLETE);
      
      console.log('🎉 ========================================');
      console.log('🎉 Pipeline Completed Successfully!');
      console.log('🎉 ========================================');
      
      return assistantMessage;

    } catch (error) {
      console.error('❌ ========================================');
      console.error('❌ Pipeline Failed:', error);
      console.error('❌ ========================================');
      
      setIsStreaming(false);
      setCurrentPhase(PHASES.ERROR);
      toast.error(error.message || "حصل مشكلة في إرسال الرسالة");
      throw error;
    }
  }, [queryClient, user, planData, handlePhaseChange, handlePipelineLog]);

  return {
    sendMessage,
    stopStreaming,
    isStreaming,
    streamingContent,
    executeResults,
    currentPhase,
    pipelineLogs
  };
}

// Hook مركب يجمع كل الوظائف
export function useChat() {
  // Initialize from localStorage
  const [activeConversationId, setActiveConversationId] = useState(() => {
    return getFromStorage(STORAGE_KEYS.ACTIVE_CONVERSATION, null);
  });
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const conversations = useConversations();
  const messages = useMessages(activeConversationId);
  const createConversationMutation = useCreateConversation();
  const deleteConversationMutation = useDeleteConversation();
  const archiveConversationMutation = useArchiveConversation();
  const { sendMessage: sendMessageBase, stopStreaming, isStreaming, streamingContent, executeResults, currentPhase, pipelineLogs } = useSendMessage();

  // Save activeConversationId to localStorage whenever it changes
  useEffect(() => {
    saveToStorage(STORAGE_KEYS.ACTIVE_CONVERSATION, activeConversationId);
  }, [activeConversationId]);

  // Check for pending requests when component mounts (returning to page)
  useEffect(() => {
    const pendingRequest = getFromStorage(STORAGE_KEYS.PENDING_REQUEST);
    if (pendingRequest && pendingRequest.conversationId) {
      // Refresh messages to see if AI has responded
      queryClient.invalidateQueries({ queryKey: ['chat-messages', pendingRequest.conversationId] });
      
      // Check if request is stale (more than 2 minutes old)
      const requestAge = Date.now() - pendingRequest.timestamp;
      if (requestAge > 2 * 60 * 1000) {
        // Clear stale pending request
        saveToStorage(STORAGE_KEYS.PENDING_REQUEST, null);
      }
    }
  }, [queryClient]);

  // Auto-select last conversation if we have one saved but messages aren't loaded
  useEffect(() => {
    if (activeConversationId && conversations.data?.length > 0) {
      // Verify the saved conversation still exists
      const exists = conversations.data.some(c => c.id === activeConversationId);
      if (!exists) {
        // If saved conversation doesn't exist, select the most recent one
        setActiveConversationId(conversations.data[0]?.id || null);
      }
    }
  }, [activeConversationId, conversations.data]);

  // Wrapped sendMessage that uses active conversation ID
  const sendMessage = useCallback(async (content, clinicData, overrideConversationId = null, deepReasoning = false) => {
    const convId = overrideConversationId || activeConversationId;
    if (!convId) return;
    
    // Save pending request to localStorage (for background sync)
    saveToStorage(STORAGE_KEYS.PENDING_REQUEST, {
      conversationId: convId,
      timestamp: Date.now(),
      content: content.substring(0, 100) // Store first 100 chars
    });
    
    try {
      const result = await sendMessageBase(convId, content, clinicData, deepReasoning);
      // Clear pending request on success
      saveToStorage(STORAGE_KEYS.PENDING_REQUEST, null);
      return result;
    } catch (error) {
      // Clear pending request on error
      saveToStorage(STORAGE_KEYS.PENDING_REQUEST, null);
      throw error;
    }
  }, [activeConversationId, sendMessageBase]);

  const startNewConversation = useCallback(async () => {
    const newConversation = await createConversationMutation.mutateAsync();
    setActiveConversationId(newConversation.id);
    return newConversation;
  }, [createConversationMutation]);

  const selectConversation = useCallback((conversationId) => {
    setActiveConversationId(conversationId);
  }, []);

  const removeConversation = useCallback(async (conversationId) => {
    await deleteConversationMutation.mutateAsync(conversationId);
    if (activeConversationId === conversationId) {
      setActiveConversationId(null);
    }
  }, [deleteConversationMutation, activeConversationId]);

  // Check if there's a pending background request
  const pendingRequest = getFromStorage(STORAGE_KEYS.PENDING_REQUEST);
  const hasPendingRequest = pendingRequest && 
    pendingRequest.conversationId === activeConversationId &&
    (Date.now() - pendingRequest.timestamp) < 2 * 60 * 1000; // Less than 2 minutes old

  return {
    // State
    activeConversationId,
    user,

    // Data
    conversations: conversations.data || [],
    messages: messages.data || [],
    isLoadingConversations: conversations.isLoading,
    isLoadingMessages: messages.isLoading,

    // Actions
    startNewConversation,
    selectConversation,
    removeConversation,
    sendMessage,

    // Streaming & Pipeline
    isStreaming,
    stopStreaming,
    streamingContent,
    executeResults,
    currentPhase,
    pipelineLogs,

    // Background sync
    hasPendingRequest,

    // Mutations loading states
    isCreatingConversation: createConversationMutation.isPending,
    isDeletingConversation: deleteConversationMutation.isPending
  };
}

export default useChat;
