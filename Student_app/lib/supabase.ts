import { createClient } from '@supabase/supabase-js';
import { API_CONFIG } from '@/config/api.config';
import 'react-native-url-polyfill/auto';

export const supabase = createClient(
  API_CONFIG.SUPABASE_URL,
  API_CONFIG.SUPABASE_ANON_KEY,
  {
    auth: {
      persistSession: true,
      detectSessionInUrl: false,
    },
  }
);
