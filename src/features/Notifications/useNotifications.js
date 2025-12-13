import { useQuery, useQueryClient } from "@tanstack/react-query";
import supabase from "../../services/supabase";
import toast from "react-hot-toast";
import { useEffect } from "react";

export function useNotifications() {
  const queryClient = useQueryClient();
  
  // Original query function
  const fetchNotifications = async () => {
    console.log("useNotifications: Fetching notifications");
    
    // Get current user
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error("Not authenticated");

    // Get user's clinic_id
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("clinic_id")
      .eq("user_id", session.user.id)
      .single();

    if (userError) throw userError;
    if (!userData?.clinic_id) throw new Error("User has no clinic assigned");

    console.log("useNotifications: User clinic_id:", userData.clinic_id);

    // Fetch notifications for the clinic
    // Based on the actual database structure
    const { data, error } = await supabase
      .from("notifications")
      .select(`
        id,
        title,
        message,
        type,
        is_read,
        created_at,
        patient_id,
        appointment_id
      `)
      .eq("clinic_id", userData.clinic_id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("useNotifications: Error fetching notifications:", error);
      throw error;
    }
    
    console.log("useNotifications: Retrieved notifications:", data);
    return data || [];
  };

  // Set up real-time subscription
  useEffect(() => {
    // Get current user
    const setupSubscription = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      // Get user's clinic_id
      const { data: userData } = await supabase
        .from("users")
        .select("clinic_id")
        .eq("user_id", session.user.id)
        .single();

      if (!userData?.clinic_id) return;

      // Subscribe to notifications changes
      const channel = supabase
        .channel('notifications-changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'notifications',
            filter: `clinic_id=eq.${userData.clinic_id}`
          },
          (payload) => {
            console.log('Real-time notification received:', payload);
            // Invalidate and refetch notifications when changes occur
            queryClient.invalidateQueries({ queryKey: ["notifications"] });
          }
        )
        .subscribe();

      // Cleanup subscription on unmount
      return () => {
        supabase.removeChannel(channel);
      };
    };

    setupSubscription();
  }, [queryClient]);

  return useQuery({
    queryKey: ["notifications"],
    queryFn: fetchNotifications,
  });
}

export function useNotificationActions() {
  const queryClient = useQueryClient();

  const markAsRead = async (notificationIds) => {
    console.log("useNotificationActions: Marking notifications as read:", notificationIds);
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("notifications")
        .update({ is_read: true })
        .in("id", notificationIds)
        .select();

      if (error) throw error;

      // Invalidate and refetch notifications
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      
      toast.success(`تم تحديد ${notificationIds.length} إشعار كمقروء`);
      return data;
    } catch (error) {
      console.error("useNotificationActions: Error marking as read:", error);
      toast.error("فشل في تحديث الإشعارات");
      throw error;
    }
  };

  const markAsUnread = async (notificationIds) => {
    console.log("useNotificationActions: Marking notifications as unread:", notificationIds);
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("notifications")
        .update({ is_read: false })
        .in("id", notificationIds)
        .select();

      if (error) throw error;

      // Invalidate and refetch notifications
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      
      toast.success(`تم تحديد ${notificationIds.length} إشعار كغير مقروء`);
      return data;
    } catch (error) {
      console.error("useNotificationActions: Error marking as unread:", error);
      toast.error("فشل في تحديث الإشعارات");
      throw error;
    }
  };

  const deleteNotifications = async (notificationIds) => {
    console.log("useNotificationActions: Deleting notifications:", notificationIds);
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");

      const { error } = await supabase
        .from("notifications")
        .delete()
        .in("id", notificationIds);

      if (error) throw error;

      // Invalidate and refetch notifications
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      
      toast.success(`تم حذف ${notificationIds.length} إشعار`);
    } catch (error) {
      console.error("useNotificationActions: Error deleting notifications:", error);
      toast.error("فشل في حذف الإشعارات");
      throw error;
    }
  };

  const markAllAsRead = async () => {
    console.log("useNotificationActions: Marking all notifications as read");
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");

      // Get user's clinic_id
      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("clinic_id")
        .eq("user_id", session.user.id)
        .single();

      if (userError) throw userError;
      if (!userData?.clinic_id) throw new Error("User has no clinic assigned");

      console.log("useNotificationActions: User clinic_id:", userData.clinic_id);

      const { data, error } = await supabase
        .from("notifications")
        .update({ is_read: true })
        .eq("clinic_id", userData.clinic_id)
        .eq("is_read", false)
        .select();

      if (error) throw error;

      // Invalidate and refetch notifications
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      
      toast.success("تم تحديد جميع الإشعارات كمقروءة");
      return data;
    } catch (error) {
      console.error("useNotificationActions: Error marking all as read:", error);
      toast.error("فشل في تحديث الإشعارات");
      throw error;
    }
  };

  return {
    markAsRead,
    markAsUnread,
    deleteNotifications,
    markAllAsRead,
  };
}