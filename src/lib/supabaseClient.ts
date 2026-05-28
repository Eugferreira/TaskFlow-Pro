import { createClient } from '@supabase/supabase-js';

// Carrega as variáveis de ambiente do Vite
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Verifica se as credenciais estão configuradas
export const isSupabaseConfigured = Boolean(
  supabaseUrl && 
  supabaseAnonKey && 
  supabaseUrl !== 'SUA_SUPABASE_URL' && 
  supabaseAnonKey !== 'SUA_SUPABASE_ANON_KEY'
);

// Inicializa o cliente apenas se as credenciais forem válidas para evitar crashes
export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;