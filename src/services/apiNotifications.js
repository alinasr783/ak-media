import supabase from "./supabase";

/**
 * Create a new notification
 * @param {Object} notificationData - The notification data
 * @param {string} notificationData.title - Notification title
 * @param {string} notificationData.message - Notification message
 * @param {string} notificationData.type - Notification type (appointment, payment, reminder, subscription, patient, system)
 * @param {string} notificationData.relatedId - Related entity ID (optional)
 * @returns {Promise<Object>} The created notification
 */
export async function createNotification(notificationData) {
  console.log("createNotification: Creating notification with data:", notificationData);
  
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

  console.log("createNotification: User clinic_id:", userData.clinic_id);

  // Prepare notification data
  const notification = {
    clinic_id: userData.clinic_id,
    title: notificationData.title,
    message: notificationData.message,
    type: notificationData.type,
    related_id: notificationData.relatedId || null,
  };

  console.log("createNotification: Inserting notification:", notification);

  // Insert notification
  const { data, error } = await supabase
    .from("notifications")
    .insert(notification)
    .select()
    .single();

  if (error) {
    console.error("createNotification: Error inserting notification:", error);
    throw error;
  }
  
  console.log("createNotification: Notification created:", data);
  return data;
}

/**
 * Get notifications for the current clinic
 * @param {Object} params - Query parameters
 * @param {number} params.page - Page number (default: 1)
 * @param {number} params.pageSize - Page size (default: 20)
 * @param {Object} params.filters - Filter options
 * @returns {Promise<Object>} Paginated notifications
 */
export async function getNotifications({ page = 1, pageSize = 20, filters = {} } = {}) {
  console.log("getNotifications: Called with params:", { page, pageSize, filters });
  
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

  console.log("getNotifications: User clinic_id:", userData.clinic_id);

  // Calculate range for pagination
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  // Build query
  // Based on the actual database structure
  let query = supabase
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
    `, { count: "exact" })
    .eq("clinic_id", userData.clinic_id)
    .order("created_at", { ascending: false })
    .range(from, to);

  console.log("getNotifications: Applying filters:", filters);

  // Apply filters
  if (filters.type) {
    query = query.eq("type", filters.type);
  }

  if (filters.read !== undefined) {
    query = query.eq("is_read", filters.read);
  }

  if (filters.search) {
    query = query.or(`title.ilike.%${filters.search}%,message.ilike.%${filters.search}%`);
  }

  const { data, error, count } = await query;

  if (error) {
    console.error("getNotifications: Error querying notifications:", error);
    throw error;
  }
  
  console.log("getNotifications: Retrieved notifications:", { data, count });
  return {
    notifications: data || [],
    totalCount: count || 0,
    page,
    pageSize,
  };
}

/**
 * Mark notifications as read
 * @param {Array<number>} notificationIds - Array of notification IDs
 * @returns {Promise<Array>} Updated notifications
 */
export async function markNotificationsAsRead(notificationIds) {
  console.log("markNotificationsAsRead: Marking notifications as read:", notificationIds);
  
  // Get current user
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error("Not authenticated");

  // Update notifications
  const { data, error } = await supabase
    .from("notifications")
    .update({ is_read: true })
    .in("id", notificationIds)
    .select();

  if (error) {
    console.error("markNotificationsAsRead: Error updating notifications:", error);
    throw error;
  }
  
  console.log("markNotificationsAsRead: Updated notifications:", data);
  return data;
}

/**
 * Mark notifications as unread
 * @param {Array<number>} notificationIds - Array of notification IDs
 * @returns {Promise<Array>} Updated notifications
 */
export async function markNotificationsAsUnread(notificationIds) {
  console.log("markNotificationsAsUnread: Marking notifications as unread:", notificationIds);
  
  // Get current user
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error("Not authenticated");

  // Update notifications
  const { data, error } = await supabase
    .from("notifications")
    .update({ is_read: false })
    .in("id", notificationIds)
    .select();

  if (error) {
    console.error("markNotificationsAsUnread: Error updating notifications:", error);
    throw error;
  }
  
  console.log("markNotificationsAsUnread: Updated notifications:", data);
  return data;
}

/**
 * Delete notifications
 * @param {Array<number>} notificationIds - Array of notification IDs
 * @returns {Promise<void>}
 */
export async function deleteNotifications(notificationIds) {
  console.log("deleteNotifications: Deleting notifications:", notificationIds);
  
  // Get current user
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error("Not authenticated");

  // Delete notifications
  const { error } = await supabase
    .from("notifications")
    .delete()
    .in("id", notificationIds);

  if (error) {
    console.error("deleteNotifications: Error deleting notifications:", error);
    throw error;
  }
  
  console.log("deleteNotifications: Notifications deleted successfully");
}

/**
 * Mark all notifications as read
 * @returns {Promise<Array>} Updated notifications
 */
export async function markAllNotificationsAsRead() {
  console.log("markAllNotificationsAsRead: Marking all notifications as read");
  
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

  console.log("markAllNotificationsAsRead: User clinic_id:", userData.clinic_id);

  // Update all unread notifications for the clinic
  const { data, error } = await supabase
    .from("notifications")
    .update({ is_read: true })
    .eq("clinic_id", userData.clinic_id)
    .eq("is_read", false)
    .select();

  if (error) {
    console.error("markAllNotificationsAsRead: Error updating notifications:", error);
    throw error;
  }
  
  console.log("markAllNotificationsAsRead: Updated notifications:", data);
  return data;
}

/**
 * Get unread notifications count
 * @returns {Promise<number>} Unread notifications count
 */
export async function getUnreadNotificationsCount() {
  console.log("getUnreadNotificationsCount: Getting unread notifications count");
  
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

  console.log("getUnreadNotificationsCount: User clinic_id:", userData.clinic_id);

  // Count unread notifications
  const { count, error } = await supabase
    .from("notifications")
    .select("*", { count: "exact", head: true })
    .eq("clinic_id", userData.clinic_id)
    .eq("is_read", false);

  if (error) {
    console.error("getUnreadNotificationsCount: Error counting notifications:", error);
    throw error;
  }
  
  console.log("getUnreadNotificationsCount: Unread count:", count);
  return count || 0;
}

// New function to create notifications for public bookings (without authentication)
export async function createPublicNotification(notificationData) {
    console.log("createPublicNotification: Creating notification with data:", notificationData);
    
    // Prepare notification data
    const notification = {
        clinic_id: notificationData.clinic_id,
        title: notificationData.title,
        message: notificationData.message,
        type: notificationData.type,
        is_read: false
    };
    
    // Add appointment_id if provided
    if (notificationData.appointment_id) {
        // Check if it's a valid UUID format (8-4-4-4-12)
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        if (uuidRegex.test(notificationData.appointment_id)) {
            notification.appointment_id = notificationData.appointment_id;
        } else {
            console.warn("Invalid appointment_id format, using related_id instead:", notificationData.appointment_id);
            // Use related_id for non-UUID values
            notification.related_id = notificationData.appointment_id.toString();
        }
    }
    
    // Add patient_id if provided
    if (notificationData.patient_id) {
        // Check if it's a valid UUID format (8-4-4-4-12)
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        if (uuidRegex.test(notificationData.patient_id)) {
            notification.patient_id = notificationData.patient_id;
        } else {
            console.warn("Invalid patient_id format, using related_id instead:", notificationData.patient_id);
            // Use related_id for non-UUID values if not already set
            if (!notification.related_id) {
                notification.related_id = notificationData.patient_id.toString();
            }
        }
    }

    console.log("createPublicNotification: Inserting notification:", notification);

    // Insert notification
    const { data, error } = await supabase
        .from("notifications")
        .insert(notification)
        .select()
        .single();

    if (error) {
        console.error("createPublicNotification: Error inserting notification:", error);
        throw error;
    }
    
    console.log("createPublicNotification: Notification created:", data);
    return data;
}
