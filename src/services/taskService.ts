import { supabase, isSupabaseConfigured } from '@/lib/supabaseClient';

export interface Task {
  id: string;
  titulo: string;
  status: 'pendente' | 'em_progresso' | 'concluido';
  data_conclusao: string | null;
  created_at?: string;
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
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('taskflow_items')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    } else {
      // Fallback Local Storage
      return getLocalTasks().sort((a, b) => 
        new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime()
      );
    }
  },

  async createTask(task: Omit<Task, 'id' | 'created_at'>): Promise<Task> {
    const newTask: Task = {
      id: crypto.randomUUID(),
      ...task,
      created_at: new Date().toISOString()
    };

    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('taskflow_items')
        .insert([{
          titulo: task.titulo,
          status: task.status,
          data_conclusao: task.data_conclusao
        }])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } else {
      const tasks = getLocalTasks();
      tasks.push(newTask);
      saveLocalTasks(tasks);
      return newTask;
    }
  },

  async updateTask(id: string, updates: Partial<Omit<Task, 'id' | 'created_at'>>): Promise<Task> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('taskflow_items')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } else {
      const tasks = getLocalTasks();
      const index = tasks.findIndex(t => t.id === id);
      if (index === -1) throw new Error('Tarefa não encontrada');
      
      tasks[index] = { ...tasks[index], ...updates };
      saveLocalTasks(tasks);
      return tasks[index];
    }
  },

  async deleteTask(id: string): Promise<void> {
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase
        .from('taskflow_items')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    } else {
      const tasks = getLocalTasks();
      const filtered = tasks.filter(t => t.id !== id);
      saveLocalTasks(filtered);
    }
  }
};