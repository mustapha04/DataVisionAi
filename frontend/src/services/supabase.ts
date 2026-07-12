import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://pjnkkhmfwjismqveipok.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_J5suxlNBcL4nrbxEUgz_Ug_gzzZGbsV';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
