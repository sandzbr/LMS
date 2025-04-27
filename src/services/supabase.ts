import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/supabase';

// Initialize Supabase client
// Note: In a real-world scenario, these would be environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase credentials');
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

export default supabase;