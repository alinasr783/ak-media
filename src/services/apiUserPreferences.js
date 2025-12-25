import supabase from './supabase';

// ========================
// User Preferences API
// ========================

// Default preferences
const DEFAULT_PREFERENCES = {
  theme_mode: 'system',
  primary_color: '#1AA19C',
  secondary_color: '#224FB5',
  accent_color: '#FF6B6B',
  sidebar_style: 'default',
  sidebar_collapsed: false,
  language: 'ar',
  notifications_enabled: true,
  sound_notifications: true,
  menu_items: [],
  dashboard_widgets: []
};

// Get user preferences (creates default if not exists)
export async function getUserPreferences() {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return null;

    // Try to get existing preferences
    const { data, error } = await supabase
      .from('user_preferences')
      .select('*')
      .eq('user_id', session.user.id)
      .maybeSingle();

    // If no row exists, create one with defaults
    if (!data && !error) {
      const { data: newData, error: insertError } = await supabase
        .from('user_preferences')
        .insert({
          user_id: session.user.id,
          ...DEFAULT_PREFERENCES
        })
        .select()
        .single();
      
      if (insertError) {
        console.error('Error creating user preferences:', insertError);
        return DEFAULT_PREFERENCES;
      }
      return newData;
    }

    if (error) {
      console.error('Error fetching user preferences:', error);
      return DEFAULT_PREFERENCES;
    }

    return data;
  } catch (error) {
    console.error('Error in getUserPreferences:', error);
    return DEFAULT_PREFERENCES;
  }
}

// Update user preferences (upsert - creates if not exists)
export async function updateUserPreferences(preferences) {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error('Not authenticated');

    // First ensure preferences row exists
    await getUserPreferences();

    // Now update
    const { data, error } = await supabase
      .from('user_preferences')
      .update({
        ...preferences,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', session.user.id)
      .select()
      .single();

    if (error) throw error;

    return data;
  } catch (error) {
    console.error('Error updating user preferences:', error);
    throw error;
  }
}

// Update theme mode
export async function updateThemeMode(themeMode) {
  return updateUserPreferences({ theme_mode: themeMode });
}

// Update colors
export async function updateColors(primaryColor, secondaryColor, accentColor) {
  return updateUserPreferences({
    primary_color: primaryColor,
    secondary_color: secondaryColor,
    accent_color: accentColor
  });
}

// Update menu items order
export async function updateMenuItemsOrder(menuItems) {
  return updateUserPreferences({ menu_items: menuItems });
}

// Update sidebar style
export async function updateSidebarStyle(sidebarStyle) {
  return updateUserPreferences({ sidebar_style: sidebarStyle });
}

// Update language
export async function updateLanguage(language) {
  return updateUserPreferences({ language });
}

// Update notification preferences
export async function updateNotificationPreferences(notificationsEnabled, soundNotifications) {
  return updateUserPreferences({
    notifications_enabled: notificationsEnabled,
    sound_notifications: soundNotifications
  });
}

// Update dashboard widgets
export async function updateDashboardWidgets(widgets) {
  return updateUserPreferences({ dashboard_widgets: widgets });
}

// Update branding
export async function updateBranding(companyName, logoUrl) {
  return updateUserPreferences({
    company_name: companyName,
    logo_url: logoUrl
  });
}

// Toggle sidebar collapse
export async function toggleSidebarCollapsed(collapsed) {
  return updateUserPreferences({ sidebar_collapsed: collapsed });
}
