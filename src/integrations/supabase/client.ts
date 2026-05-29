import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || "https://rvrpygzadtaxjtxvonjj.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ2cnB5Z3phZHRheGp0eHZvbmpqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk5NjA0MzAsImV4cCI6MjA5NTUzNjQzMH0.cZKdEiSfKWtT-QFhzjQmZvDHLfzJtwm06XPmlioZinA";

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);