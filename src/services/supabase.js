
import { createClient } from '@supabase/supabase-js'
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "https://hvbjysojjrdkszuvczbc.supabase.co"
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh2Ymp5c29qanJka3N6dXZjemJjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM5MzE2NjYsImV4cCI6MjA3OTUwNzY2Nn0.mv-Lrl1fvXbwFSlgeNSex_HcGiEriOmcjthtrXRZpFA"
const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        storage: window.localStorage,
    },
})

export default supabase