
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    // In development, this might throw if .env is missing.
    // We can log a warning or just let it fail.
    console.warn("Supabase URL or Key missing in environment variables.");
}

export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '');
