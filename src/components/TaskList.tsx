import React, { useState } from 'react';
import { Task } from '@/services/taskService';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Calendar, CheckCircle2, Clock, Edit2, PlayCircle, Trash2, Search } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface TaskListProps {
  tasks: Task[];
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  onStatusChange: (id: string, status: Task['status']) => void;
}

export const TaskList: React.FC<TaskListProps> = ({ tasks, onEdit, onDelete, onStatusChange }) => {
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<'todos' | Task['status']>('todos');
  
  // Estados para controle dos modais de confirmação
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);
  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);

  const filteredTasks = tasks.filter((task) => {
    const matchesSearch = task.titulo.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = filterStatus === 'todos' || task.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: Task['status']) => {
    switch (status) {
      case 'pendente':
        return (
          <Badge variant="outline" className="border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-400">
            <Clock className="mr-1 h-3 w-3" /> Pendente
          </Badge>
        );
      case 'em_progresso':
        return (
          <Badge variant="outline" className="border-indigo-200 bg-indigo-50 text-indigo-700 dark:border-indigo-900 dark:bg-indigo-950/30 dark:text-indigo-400">
            <PlayCircle className="mr-1 h-3 w-3" /> Em Progresso
          </Badge>
        );
      case 'concluido':
        return (
          <Badge variant="outline" className="border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-400">
            <CheckCircle2 className="mr-1 h-3 w-3" /> Concluído
          </Badge>
        );
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
  };

  return (
    <div className="space-y-4">
      {/* Barra de Busca e Filtros */}
      <div className="space-y-3">
        <div className="relative">
          <Input
            placeholder="Buscar tarefas..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="rounded-xl border-gray-200 pl-10 focus:ring-2 focus:ring-indigo-500 dark:border-gray-700"
          />
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        </div>

        {/* Filtros Rápidos */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {(['todos', 'pendente', 'em_progresso', 'concluido'] as const).map((status) => {
            const labelMap = {
              todos: 'Todas',
              pendente: 'Pendentes',
              em_progresso: 'Em Progresso',
              concluido: 'Concluídas',
            };

            const isSelected = filterStatus === status;

            return (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`whitespace-nowrap rounded-full px-4 py-1.5 text-xs font-semibold transition-all active:scale-95 ${
                  isSelected
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300'
                }`}
              >
                {labelMap[status]}
              </button>
            );
          })}
        </div>
      </div>

      {/* Lista de Itens */}
      <div className="space-y-3">
        {filteredTasks.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-200 p-8 text-center dark:border-gray-800">
            <p className="text-sm text-gray-500 dark:text-gray-400">Nenhuma tarefa encontrada.</p>
          </div>
        ) : (
          filteredTasks.map((task) => (
            <div
              key={task.id}
              className="group relative flex flex-col gap-3 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm transition-all hover:shadow-md dark:border-gray-800 dark:bg-gray-900"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <h4 className={`font-semibold text-gray-900 dark:text-white ${task.status === 'concluido' ? 'line-through text-gray-400 dark:text-gray-500' : ''}`}>
                    {task.titulo}
                  </h4>
                  <div className="flex flex-wrap items-center gap-2">
                    {getStatusBadge(task.status)}
                    {task.data_conclusao && (
                      <span className="inline-flex items-center text-xs text-gray-500 dark:text-gray-400">
                        <Calendar className="mr-1 h-3.5 w-3.5" />
                        {formatDate(task.data_conclusao)}
                      </span>
                    )}
                  </div>
                </div>

                {/* Ações Rápidas */}
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setTaskToEdit(task)}
                    className="h-8 w-8 rounded-full text-gray-500 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800"
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setTaskToDelete(task)}
                    className="h-8 w-8 rounded-full text-red-500 hover:bg-red-50 hover:text-red-600 dark:text-red-400 dark:hover:bg-red-950/30"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>

              {/* Atalhos Rápidos de Status para Touch */}
              <div className="flex items-center gap-1.5 border-t border-gray-50 pt-3 dark:border-gray-800">
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">Mudar para:</span>
                <div className="flex gap-1">
                  {task.status !== 'pendente' && (
                    <button
                      onClick={() => onStatusChange(task.id, 'pendente')}
                      className="rounded-lg bg-amber-50/50 px-2 py-1 text-[10px] font-bold text-amber-700 hover:bg-amber-50 dark:bg-amber-950/20 dark:text-amber-400"
                    >
                      Pendente
                    </button>
                  )}
                  {task.status !== 'em_progresso' && (
                    <button
                      onClick={() => onStatusChange(task.id, 'em_progresso')}
                      className="rounded-lg bg-indigo-50/50 px-2 py-1 text-[10px] font-bold text-indigo-700 hover:bg-indigo-50 dark:bg-indigo-950/20 dark:text-indigo-400"
                    >
                      Em Progresso
                    </button>
                  )}
                  {task.status !== 'concluido' && (
                    <button
                      onClick={() => onStatusChange(task.id, 'concluido')}
                      className="rounded-lg bg-emerald-50/50 px-2 py-1 text-[10px] font-bold text-emerald-700 hover:bg-emerald-50 dark:bg-emerald-950/20 dark:text-emerald-400"
                    >
                      Concluir
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Dialog de Confirmação para Exclusão */}
      <AlertDialog open={!!taskToDelete} onOpenChange={(open) => !open && setTaskToDelete(null)}>
        <AlertDialogContent className="rounded-2xl max-w-[90%] sm:max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-gray-900 dark:text-white">Excluir Tarefa?</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-500 dark:text-gray-400">
              Tem certeza que deseja excluir a tarefa <strong className="text-gray-900 dark:text-white">"{taskToDelete?.titulo}"</strong>? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2 sm:gap-0">
            <AlertDialogCancel className="rounded-xl">Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (taskToDelete) {
                  onDelete(taskToDelete.id);
                  setTaskToDelete(null);
                }
              }}
              className="rounded-xl bg-red-600 hover:bg-red-700 text-white"
            >
              Confirmar Exclusão
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Dialog de Confirmação para Edição */}
      <AlertDialog open={!!taskToEdit} onOpenChange={(open) => !open && setTaskToEdit(null)}>
        <AlertDialogContent className="rounded-2xl max-w-[90%] sm:max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-gray-900 dark:text-white">Editar Tarefa?</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-500 dark:text-gray-400">
              Tem certeza que deseja editar a tarefa <strong className="text-gray-900 dark:text-white">"{taskToEdit?.titulo}"</strong>? Você será levado ao formulário de edição.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2 sm:gap-0">
            <AlertDialogCancel className="rounded-xl">Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (taskToEdit) {
                  onEdit(taskToEdit);
                  setTaskToEdit(null);
                }
              }}
              className="rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              Confirmar Edição
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};