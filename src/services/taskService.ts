import { supabase } from '@/integrations/supabase/client';

export interface Task {
  id: string;
  titulo: string;
  status: 'pendente' | 'em_progresso' | 'concluido';
  data_conclusao: string | null;
  created_at?: string;
  user_id?: string;
}

const LOCAL_STORAGE_KEY = 'taskflow_items_local';

// Helper para obter tarefas do Local Storage
const getLocalTasks = (): Task[] => {
  const data = localStorage.getItem(LOCAL_STORAGE_KEY);
  return data ? JSON.parse(data) : [];
};

// Helper para salvar tarefas no Local Storage
const saveLocalTasks = (tasks: Task[]) => {
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(tasks));
};

export const taskService = {
  async getTasks(): Promise<Task[]> {
    try {
      const { data, error } = await supabase
        .from('taskflow_items')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data as Task[]) || [];
    } catch (error) {
      console.warn("Falha ao conectar ao Supabase, usando Local Storage:", error);
      
      // Filtrar tarefas locais pelo usuário atualmente logado
      const { data: { session } } = await supabase.auth.getSession();
      const currentUserId = session?.user?.id;
      
      return getLocalTasks()
        .filter(t => !currentUserId || t.user_id === currentUserId)
        .sort((a, b) => 
          new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime()
        );
    }
  },

  async createTask(task: Omit<Task, 'id' | 'created_at'>): Promise<Task> {
    const { data: { session } } = await supabase.auth.getSession();
    const currentUserId = session?.user?.id || null;

    const newTask: Task = {
      id: crypto.randomUUID(),
      ...task,
      user_id: currentUserId || undefined,
      created_at: new Date().toISOString()
    };

    try {
      const { data, error } = await supabase
        .from('taskflow_items')
        .insert([{
          titulo: task.titulo,
          status: task.status,
          data_conclusao: task.data_conclusao,
          user_id: currentUserId
        }])
        .select();

      if (error) throw error;
      return data[0] as Task;
    } catch (error) {
      console.warn("Falha ao salvar no Supabase, salvando localmente:", error);
      const tasks = getLocalTasks();
      tasks.push(newTask);
      saveLocalTasks(tasks);
      return newTask;
    }
  },

  async updateTask(id: string, updates: Partial<Omit<Task, 'id' | 'created_at'>>): Promise<Task> {
    try {
      const { data, error } = await supabase
        .from('taskflow_items')
        .update(updates)
        .eq('id', id)
        .select();

      if (error) throw error;
      return data[0] as Task;
    } catch (error) {
      console.warn("Falha ao atualizar no Supabase, atualizando localmente:", error);
      const tasks = getLocalTasks();
      const index = tasks.findIndex(t => t.id === id);
      if (index === -1) throw new Error('Tarefa não encontrada');
      
      tasks[index] = { ...tasks[index], ...updates };
      saveLocalTasks(tasks);
      return tasks[index];
    }
  },

  async deleteTask(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('taskflow_items')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.warn("Falha ao deletar no Supabase, deletando localmente:", error);
      const tasks = getLocalTasks();
      const filtered = tasks.filter(t => t.id !== id);
      saveLocalTasks(filtered);
    }
  }
};