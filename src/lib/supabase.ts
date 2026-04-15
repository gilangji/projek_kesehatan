import { createClient } from '@supabase/supabase-js';

// Menggunakan kredensial yang diberikan oleh pengguna sebagai fallback jika .env kosong
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://rinbmjhesywiczkfxygp.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJpbmJtamhlc3l3aWN6a2Z4eWdwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYyNTg5MDMsImV4cCI6MjA5MTgzNDkwM30.EoCjOh9Y_bRoypsHd5S4A94WN9tkP85CEj97syiooRM';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
