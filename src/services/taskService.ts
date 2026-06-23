import { supabase } from '@/integrations/supabase/client';

export interface Task {
  id: string;
  titulo: string;
  status: 'pendente' | 'em_progresso' | 'concluido';
  data_conclusao: string | null;
  created_at?: string;
  user_id?: string;
}

export const taskService = {
  async getTasks(): Promise<Task[]> {
    const { data, error } = await supabase
      .from('taskflow_items')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(error.message);
    }
    return (data as Task[]) || [];
  },

  async createTask(task: Omit<Task, 'id' | 'created_at'>): Promise<Task> {
    const { data: { session } } = await supabase.auth.getSession();
    const currentUserId = session?.user?.id;

    if (!currentUserId) {
      throw new Error("Usuário não autenticado.");
    }

    const { data, error } = await supabase
      .from('taskflow_items')
      .insert([{
        titulo: task.titulo,
        status: task.status,
        data_conclusao: task.data_conclusao,
        user_id: currentUserId
      }])
      .select();

    if (error) {
      throw new Error(error.message);
    }
    return data[0] as Task;
  },

  async updateTask(id: string, updates: Partial<Omit<Task, 'id' | 'created_at'>>): Promise<Task> {
    const { data, error } = await supabase
      .from('taskflow_items')
      .update(updates)
      .eq('id', id)
      .select();

    if (error) {
      throw new Error(error.message);
    }

    if (!data || data.length === 0) {
      throw new Error("Tarefa não encontrada ou você não tem permissão para atualizá-la.");
    }

    return data[0] as Task;
  },

  async deleteTask(id: string): Promise<void> {
    const { data, error } = await supabase
      .from('taskflow_items')
      .delete()
      .eq('id', id)
      .select();

    if (error) {
      throw new Error(error.message);
    }

    if (!data || data.length === 0) {
      throw new Error("Tarefa não encontrada ou você não tem permissão para excluí-la.");
    }
  }
};