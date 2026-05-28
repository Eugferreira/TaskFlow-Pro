import React, { useState, useEffect } from 'react';
import { taskService, Task } from '@/services/taskService';
import { isSupabaseConfigured } from '@/lib/supabaseClient';
import { TaskStats } from '@/components/TaskStats';
import { TaskForm } from '@/components/TaskForm';
import { TaskList } from '@/components/TaskList';
import { Button } from '@/components/ui/button';
import { showSuccess, showError } from '@/utils/toast';
import { Database, Info, Plus, Sparkles, Terminal } from 'lucide-react';

const Index = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [showSqlInstructions, setShowSqlInstructions] = useState(false);

  const loadTasks = async () => {
    try {
      setLoading(true);
      const data = await taskService.getTasks();
      setTasks(data);
    } catch (error: any) {
      showError('Erro ao carregar tarefas: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTasks();
  }, []);

  const handleSubmitTask = async (taskData: Omit<Task, 'id' | 'created_at'>) => {
    try {
      if (editingTask) {
        await taskService.updateTask(editingTask.id, taskData);
        showSuccess('Tarefa atualizada com sucesso!');
        setEditingTask(null);
      } else {
        await taskService.createTask(taskData);
        showSuccess('Tarefa criada com sucesso!');
      }
      setShowForm(false);
      loadTasks();
    } catch (error: any) {
      showError('Erro ao salvar tarefa: ' + error.message);
    }
  };

  const handleDeleteTask = async (id: string) => {
    try {
      await taskService.deleteTask(id);
      showSuccess('Tarefa excluída com sucesso!');
      loadTasks();
    } catch (error: any) {
      showError('Erro ao excluir tarefa: ' + error.message);
    }
  };

  const handleStatusChange = async (id: string, status: Task['status']) => {
    try {
      await taskService.updateTask(id, { status });
      showSuccess('Status atualizado!');
      loadTasks();
    } catch (error: any) {
      showError('Erro ao atualizar status: ' + error.message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/50 pb-12 dark:bg-gray-950">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-gray-100 bg-white/80 backdrop-blur-md dark:border-gray-900 dark:bg-gray-950/80">
        <div className="mx-auto max-w-md px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="rounded-xl bg-indigo-600 p-2 text-white">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-lg font-extrabold tracking-tight text-gray-900 dark:text-white">TaskFlow Pro</h1>
              <p className="text-[10px] font-medium text-gray-500 dark:text-gray-400">Gestão Inteligente de Tarefas</p>
            </div>
          </div>

          <Button
            onClick={() => {
              setEditingTask(null);
              setShowForm(!showForm);
            }}
            size="sm"
            className="rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white"
          >
            <Plus className="mr-1.5 h-4 w-4" /> Nova
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-md px-4 py-6 space-y-6">
        {/* Status de Conexão */}
        <div className={`rounded-2xl border p-4 flex items-start gap-3 ${
          isSupabaseConfigured
            ? 'bg-emerald-50/50 border-emerald-100 text-emerald-800 dark:bg-emerald-950/20 dark:border-emerald-900 dark:text-emerald-400'
            : 'bg-amber-50/50 border-amber-100 text-amber-800 dark:bg-amber-950/20 dark:border-amber-900 dark:text-amber-400'
        }`}>
          <Database className="h-5 w-5 mt-0.5 shrink-0" />
          <div className="space-y-1">
            <p className="text-xs font-bold">
              {isSupabaseConfigured ? 'Conectado ao Supabase' : 'Modo de Demonstração (Local Storage)'}
            </p>
            <p className="text-[11px] leading-relaxed opacity-90">
              {isSupabaseConfigured
                ? 'Suas tarefas estão sendo sincronizadas em tempo real com o banco de dados Supabase.'
                : 'Configure as variáveis de ambiente VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY para conectar ao seu banco de dados.'}
            </p>
            <button
              onClick={() => setShowSqlInstructions(!showSqlInstructions)}
              className="inline-flex items-center gap-1 text-[11px] font-bold underline mt-1 hover:opacity-80"
            >
              <Terminal className="h-3 w-3" /> Ver Script SQL do Supabase
            </button>
          </div>
        </div>

        {/* Instruções SQL */}
        {showSqlInstructions && (
          <div className="rounded-2xl border border-gray-200 bg-gray-900 p-4 text-gray-100 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-indigo-400">Script SQL para o Supabase</span>
              <button
                onClick={() => setShowSqlInstructions(false)}
                className="text-xs text-gray-400 hover:text-white"
              >
                Fechar
              </button>
            </div>
            <pre className="text-[10px] font-mono overflow-x-auto bg-black/40 p-3 rounded-xl leading-relaxed">
{`-- 1. Criar o tipo enum para status
CREATE TYPE task_status AS ENUM ('pendente', 'em_progresso', 'concluido');

-- 2. Criar a tabela taskflow_items
CREATE TABLE taskflow_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  titulo TEXT NOT NULL,
  status task_status DEFAULT 'pendente' NOT NULL,
  data_conclusao TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 3. Habilitar Row Level Security (RLS)
ALTER TABLE taskflow_items ENABLE ROW LEVEL SECURITY;

-- 4. Criar política de acesso público (para fins de teste/anon)
CREATE POLICY "Permitir acesso total para todos" 
ON taskflow_items 
FOR ALL 
USING (true) 
WITH CHECK (true);`}
            </pre>
            <p className="text-[10px] text-gray-400">
              Copie e cole o código acima no <strong>SQL Editor</strong> do seu painel do Supabase para criar a tabela corretamente.
            </p>
          </div>
        )}

        {/* Estatísticas */}
        <TaskStats tasks={tasks} />

        {/* Formulário (quando ativo) */}
        {(showForm || editingTask) && (
          <TaskForm
            onSubmit={handleSubmitTask}
            initialTask={editingTask}
            onCancel={() => {
              setShowForm(false);
              setEditingTask(null);
            }}
          />
        )}

        {/* Lista de Tarefas */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
          </div>
        ) : (
          <TaskList
            tasks={tasks}
            onEdit={(task) => {
              setEditingTask(task);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onDelete={handleDeleteTask}
            onStatusChange={handleStatusChange}
          />
        )}
      </main>
    </div>
  );
};

export default Index;