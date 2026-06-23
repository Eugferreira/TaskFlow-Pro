-- Criação do tipo enum para status da tarefa se não existir
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'task_status') THEN
    CREATE TYPE task_status AS ENUM ('pendente', 'em_progresso', 'concluido');
  END IF;
END$$;

-- Criação da tabela taskflow_items
CREATE TABLE IF NOT EXISTS public.taskflow_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  titulo TEXT NOT NULL,
  status task_status NOT NULL DEFAULT 'pendente'::task_status,
  data_conclusao TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc'::text, now()),
  user_id UUID DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Habilitar RLS (Row Level Security)
ALTER TABLE public.taskflow_items ENABLE ROW LEVEL SECURITY;

-- Políticas de Segurança RLS
CREATE POLICY "Usuários podem ver apenas suas próprias tarefas" 
  ON public.taskflow_items FOR SELECT 
  TO authenticated 
  USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem criar apenas suas próprias tarefas" 
  ON public.taskflow_items FOR INSERT 
  TO authenticated 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar apenas suas próprias tarefas" 
  ON public.taskflow_items FOR UPDATE 
  TO authenticated 
  USING (auth.uid() = user_id) 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem deletar apenas suas próprias tarefas" 
  ON public.taskflow_items FOR DELETE 
  TO authenticated 
  USING (auth.uid() = user_id);

-- Permissões explícitas de banco de dados (Grants) para as roles de API
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.taskflow_items TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.taskflow_items TO service_role;