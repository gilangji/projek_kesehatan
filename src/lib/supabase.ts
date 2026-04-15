import { createClient } from '@supabase/supabase-js';

// Use placeholder values if environment variables are missing to prevent app crash on startup.
// Actual uploads will fail gracefully and fallback to local storage if these are placeholders.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
