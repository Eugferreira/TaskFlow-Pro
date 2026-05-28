import { supabaseFetch, isSupabaseConfigured } from '@/lib/supabaseClient';

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
    if (isSupabaseConfigured) {
      try {
        // Ordena por data de criação decrescente
        return await supabaseFetch.request('taskflow_items?order=created_at.desc');
      } catch (error) {
        console.warn("Falha ao conectar ao Supabase, usando Local Storage:", error);
        return getLocalTasks().sort((a, b) => 
          new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime()
        );
      }
    } else {
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

    if (isSupabaseConfigured) {
      try {
        const result = await supabaseFetch.request('taskflow_items', {
          method: 'POST',
          body: JSON.stringify({
            titulo: task.titulo,
            status: task.status,
            data_conclusao: task.data_conclusao
          })
        });
        return result[0];
      } catch (error) {
        console.warn("Falha ao salvar no Supabase, salvando localmente:", error);
        const tasks = getLocalTasks();
        tasks.push(newTask);
        saveLocalTasks(tasks);
        return newTask;
      }
    } else {
      const tasks = getLocalTasks();
      tasks.push(newTask);
      saveLocalTasks(tasks);
      return newTask;
    }
  },

  async updateTask(id: string, updates: Partial<Omit<Task, 'id' | 'created_at'>>): Promise<Task> {
    if (isSupabaseConfigured) {
      try {
        const result = await supabaseFetch.request(`taskflow_items?id=eq.${id}`, {
          method: 'PATCH',
          body: JSON.stringify(updates)
        });
        return result[0];
      } catch (error) {
        console.warn("Falha ao atualizar no Supabase, atualizando localmente:", error);
        const tasks = getLocalTasks();
        const index = tasks.findIndex(t => t.id === id);
        if (index === -1) throw new Error('Tarefa não encontrada');
        
        tasks[index] = { ...tasks[index], ...updates };
        saveLocalTasks(tasks);
        return tasks[index];
      }
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
    if (isSupabaseConfigured) {
      try {
        await supabaseFetch.request(`taskflow_items?id=eq.${id}`, {
          method: 'DELETE'
        });
      } catch (error) {
        console.warn("Falha ao deletar no Supabase, deletando localmente:", error);
        const tasks = getLocalTasks();
        const filtered = tasks.filter(t => t.id !== id);
        saveLocalTasks(filtered);
      }
    } else {
      const tasks = getLocalTasks();
      const filtered = tasks.filter(t => t.id !== id);
      saveLocalTasks(filtered);
    }
  }
};