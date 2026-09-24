import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://dcfzpiszpnpmhvjtfups.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRjZnpwaXN6cG5wbWh2anRmdXBzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTAxNjY3NTksImV4cCI6MjEwNTc0Mjc1OX0.VUE9v_Vpc3wKYyNn8sDWuNpxUQT41zA3Yn6rOnM38xU';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);
