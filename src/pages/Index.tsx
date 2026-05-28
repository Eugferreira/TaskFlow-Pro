import React, { useState, useEffect } from 'react';
import { taskService, Task } from '@/services/taskService';
import { TaskStats } from '@/components/TaskStats';
import { TaskForm } from '@/components/TaskForm';
import { TaskList } from '@/components/TaskList';
import { Button } from '@/components/ui/button';
import { showSuccess, showError } from '@/utils/toast';
import { Plus, Sparkles } from 'lucide-react';

const Index = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [showForm, setShowForm] = useState(false);

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