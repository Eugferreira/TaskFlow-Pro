// Carrega as variáveis de ambiente do Vite
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "https://rvrpygzadtaxjtxvonjj.supabase.co";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ2cnB5Z3phZHRheGp0eHZvbmpqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk5NjA0MzAsImV4cCI6MjA5NTUzNjQzMH0.cZKdEiSfKWtT-QFhzjQmZvDHLfzJtwm06XPmlioZinA";

// Verifica se as credenciais estão configuradas
export const isSupabaseConfigured = Boolean(
  supabaseUrl && 
  supabaseAnonKey && 
  supabaseUrl !== 'SUA_SUPABASE_URL' && 
  supabaseAnonKey !== 'SUA_SUPABASE_ANON_KEY'
);

// Cliente REST nativo para o Supabase (evita dependência do @supabase/supabase-js)
export const supabaseFetch = {
  async request(path: string, options: RequestInit = {}) {
    if (!isSupabaseConfigured) {
      throw new Error("Supabase não configurado");
    }

    const url = `${supabaseUrl}/rest/v1/${path}`;
    const headers = {
      'apikey': supabaseAnonKey,
      'Authorization': `Bearer ${supabaseAnonKey}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=representation',
      ...options.headers,
    };

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Erro no Supabase: ${response.statusText} - ${errorText}`);
    }

    // Algumas requisições DELETE podem retornar vazio
    if (response.status === 204) {
      return null;
    }

    return response.json();
  }
};