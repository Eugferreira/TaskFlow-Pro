import { createClient, SupportedStorage } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || "https://rvrpygzadtaxjtxvonjj.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ2cnB5Z3phZHRheGp0eHZvbmpqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk5NjA0MzAsImV4cCI6MjA5NTUzNjQzMH0.cZKdEiSfKWtT-QFhzjQmZvDHLfzJtwm06XPmlioZinA";

// Armazenamento em memória alternativo para quando o localStorage estiver bloqueado no iframe
class MemoryStorage implements SupportedStorage {
  private store: Record<string, string> = {};

  getItem(key: string): string | null {
    return this.store[key] || null;
  }

  setItem(key: string, value: string): void {
    this.store[key] = value;
  }

  removeItem(key: string): void {
    delete this.store[key];
  }
}

// Testar se o localStorage está disponível e acessível
let safeStorage: SupportedStorage;
try {
  const testKey = '__storage_test__';
  window.localStorage.setItem(testKey, testKey);
  window.localStorage.removeItem(testKey);
  safeStorage = window.localStorage;
} catch (e) {
  console.warn('[Supabase] LocalStorage inacessível no iframe. Usando armazenamento em memória temporário.');
  safeStorage = new MemoryStorage();
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: safeStorage,
    persistSession: true,
    detectSessionInUrl: true,
    autoRefreshToken: true
  }
});