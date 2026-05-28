import React, { useState, useEffect } from 'react';
import { Task } from '@/services/taskService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar, Plus, Save, X } from 'lucide-react';

interface TaskFormProps {
  onSubmit: (task: Omit<Task, 'id' | 'created_at'>) => void;
  initialTask?: Task | null;
  onCancel?: () => void;
}

export const TaskForm: React.FC<TaskFormProps> = ({ onSubmit, initialTask, onCancel }) => {
  const [titulo, setTitulo] = useState('');
  const [status, setStatus] = useState<'pendente' | 'em_progresso' | 'concluido'>('pendente');
  const [dataConclusao, setDataConclusao] = useState('');

  useEffect(() => {
    if (initialTask) {
      setTitulo(initialTask.titulo);
      setStatus(initialTask.status);
      setDataConclusao(initialTask.data_conclusao ? initialTask.data_conclusao.split('T')[0] : '');
    } else {
      setTitulo('');
      setStatus('pendente');
      setDataConclusao('');
    }
  }, [initialTask]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!titulo.trim()) return;

    onSubmit({
      titulo: titulo.trim(),
      status,
      data_conclusao: dataConclusao ? new Date(dataConclusao).toISOString() : null,
    });

    if (!initialTask) {
      setTitulo('');
      setStatus('pendente');
      setDataConclusao('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
      <div className="flex items-center justify-between border-b border-gray-50 pb-3 dark:border-gray-800">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white">
          {initialTask ? 'Editar Tarefa' : 'Nova Tarefa'}
        </h3>
        {onCancel && (
          <Button type="button" variant="ghost" size="icon" onClick={onCancel} className="rounded-full">
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      <div className="space-y-4">
        {/* Título */}
        <div className="space-y-1.5">
          <Label htmlFor="titulo" className="text-sm font-semibold text-gray-700 dark:text-gray-300">
            Título da Tarefa
          </Label>
          <Input
            id="titulo"
            placeholder="Ex: Finalizar relatório mensal"
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            className="rounded-xl border-gray-200 focus:ring-2 focus:ring-indigo-500 dark:border-gray-700"
            required
          />
        </div>

        {/* Status */}
        <div className="space-y-1.5">
          <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Status</Label>
          <div className="grid grid-cols-3 gap-2">
            {(['pendente', 'em_progresso', 'concluido'] as const).map((s) => {
              const labelMap = {
                pendente: 'Pendente',
                em_progresso: 'Em Progresso',
                concluido: 'Concluído',
              };
              const activeClasses = {
                pendente: 'bg-amber-50 border-amber-200 text-amber-700 dark:bg-amber-950/30 dark:border-amber-800 dark:text-amber-400',
                em_progresso: 'bg-indigo-50 border-indigo-200 text-indigo-700 dark:bg-indigo-950/30 dark:border-indigo-800 dark:text-indigo-400',
                concluido: 'bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-950/30 dark:border-emerald-800 dark:text-emerald-400',
              };

              const isSelected = status === s;

              return (
                <button
                  key={s}
                  type="button"
                  onClick={() => setStatus(s)}
                  className={`flex items-center justify-center rounded-xl border py-2.5 text-xs font-bold transition-all active:scale-95 ${
                    isSelected
                      ? activeClasses[s]
                      : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300'
                  }`}
                >
                  {labelMap[s]}
                </button>
              );
            })}
          </div>
        </div>

        {/* Data de Conclusão */}
        <div className="space-y-1.5">
          <Label htmlFor="data_conclusao" className="text-sm font-semibold text-gray-700 dark:text-gray-300">
            Previsão / Data de Conclusão <span className="text-xs font-normal text-gray-400">(Opcional)</span>
          </Label>
          <div className="relative">
            <Input
              id="data_conclusao"
              type="date"
              value={dataConclusao}
              onChange={(e) => setDataConclusao(e.target.value)}
              className="rounded-xl border-gray-200 pl-10 focus:ring-2 focus:ring-indigo-500 dark:border-gray-700"
            />
            <Calendar className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          </div>
        </div>
      </div>

      <div className="flex gap-2 pt-2">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel} className="flex-1 rounded-xl">
            Cancelar
          </Button>
        )}
        <Button type="submit" className="flex-1 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white">
          {initialTask ? (
            <>
              <Save className="mr-2 h-4 w-4" /> Salvar Alterações
            </>
          ) : (
            <>
              <Plus className="mr-2 h-4 w-4" /> Criar Tarefa
            </>
          )}
        </Button>
      </div>
    </form>
  );
};