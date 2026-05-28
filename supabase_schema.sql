-- 1. Criar o tipo enum para status das tarefas
CREATE TYPE task_status AS ENUM ('pendente', 'em_progresso', 'concluido');

-- 2. Criar a tabela taskflow_items
CREATE TABLE public.taskflow_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  titulo TEXT NOT NULL,
  status task_status DEFAULT 'pendente' NOT NULL,
  data_conclusao TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 3. Habilitar Row Level Security (RLS) para segurança
ALTER TABLE public.taskflow_items ENABLE ROW LEVEL SECURITY;

-- 4. Conceder permissões de acesso à API do Supabase (Grants)
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.taskflow_items TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.taskflow_items TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.taskflow_items TO service_role;

-- 5. Criar política de acesso público (para fins de teste/anon)
CREATE POLICY "Permitir acesso total para todos" 
ON public.taskflow_items 
FOR ALL 
USING (true) 
WITH CHECK (true);