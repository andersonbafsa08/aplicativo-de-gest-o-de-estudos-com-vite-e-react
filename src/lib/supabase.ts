import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const getCurrentUserId = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  // Retorna o ID do usuário ou um UUID dummy se não autenticado, para satisfazer o schema do DB
  return user?.id || '00000000-0000-0000-0000-000000000000';
};

export const isSupabaseConfigured = () => !!supabaseUrl && !!supabaseAnonKey;
