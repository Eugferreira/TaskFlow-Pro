import { supabase } from '@/integrations/supabase/client';
import { sanitizeInput } from '@/utils/security';

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

    // Clean and trim the task title before inserting into the database
    const sanitizedTitulo = sanitizeInput(task.titulo);

    if (!sanitizedTitulo) {
      throw new Error("O título da tarefa não pode ser vazio.");
    }

    const { data, error } = await supabase
      .from('taskflow_items')
      .insert([{
        titulo: sanitizedTitulo,
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
    const updatedFields: Partial<Omit<Task, 'id' | 'created_at'>> = { ...updates };

    // Clean and trim the task title if it is being updated
    if (updates.titulo !== undefined) {
      const sanitizedTitulo = sanitizeInput(updates.titulo);
      if (!sanitizedTitulo) {
        throw new Error("O título da tarefa não pode ser vazio.");
      }
      updatedFields.titulo = sanitizedTitulo;
    }

    const { data, error } = await supabase
      .from('taskflow_items')
      .update(updatedFields)
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