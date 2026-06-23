import React, { useState, useEffect } from 'react';
import { Task } from '@/services/taskService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar, Plus, Save, X, Sparkles, CheckCircle2, Clock, PlayCircle } from 'lucide-react';
import { sanitizeInput } from '@/utils/security';

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
    
    // Sanitize the input to remove any HTML/JS tags
    const sanitizedTitulo = sanitizeInput(titulo);
    if (!sanitizedTitulo) return;

    onSubmit({
      titulo: sanitizedTitulo,
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
    <form 
      onSubmit={handleSubmit} 
      className="space-y-5 rounded-2xl border border-indigo-100/80 bg-indigo-50/30 p-5 shadow-sm transition-all dark:border-indigo-950/50 dark:bg-indigo-950/10"
    >
      <div className="flex items-center justify-between border-b border-indigo-100/50 pb-3 dark:border-indigo-950/30">
        <div className="flex items-center gap-2">
          <div className="rounded-lg bg-indigo-600/10 p-1.5 text-indigo-600 dark:bg-indigo-400/10 dark:text-indigo-400">
            <Sparkles className="h-4 w-4" />
          </div>
          <h3 className="text-sm font-bold text-indigo-950 dark:text-indigo-200">
            {initialTask ? 'Editar Tarefa' : 'Nova Tarefa'}
          </h3>
        </div>
        {onCancel && (
          <Button 
            type="button" 
            variant="ghost" 
            size="icon" 
            onClick={onCancel} 
            className="h-7 w-7 rounded-full hover:bg-indigo-100/50 dark:hover:bg-indigo-950/50"
          >
            <X className="h-4 w-4 text-indigo-900/60 dark:text-indigo-400" />
          </Button>
        )}
      </div>

      <div className="space-y-4">
        {/* Título */}
        <div className="space-y-1.5">
          <Label htmlFor="titulo" className="text-xs font-bold text-indigo-900/80 dark:text-indigo-300">
            O que precisa ser feito?
          </Label>
          <Input
            id="titulo"
            placeholder="Ex: Finalizar relatório mensal"
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            className="rounded-xl border-indigo-100 bg-white/80 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-indigo-950 dark:bg-gray-900/80"
            required
          />
        </div>

        {/* Status */}
        <div className="space-y-1.5">
          <Label className="text-xs font-bold text-indigo-900/80 dark:text-indigo-300">Status Atual</Label>
          <div className="grid grid-cols-3 gap-2">
            {(['pendente', 'em_progresso', 'concluido'] as const).map((s) => {
              const labelMap = {
                pendente: 'Pendente',
                em_progresso: 'Em Progresso',
                concluido: 'Concluído',
              };
              
              const iconMap = {
                pendente: Clock,
                em_progresso: PlayCircle,
                concluido: CheckCircle2,
              };

              const activeClasses = {
                pendente: 'bg-amber-50 border-amber-200 text-amber-700 dark:bg-amber-950/30 dark:border-amber-800 dark:text-amber-400',
                em_progresso: 'bg-indigo-50 border-indigo-200 text-indigo-700 dark:bg-indigo-950/30 dark:border-indigo-800 dark:text-indigo-400',
                concluido: 'bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-950/30 dark:border-emerald-800 dark:text-emerald-400',
              };

              const isSelected = status === s;
              const Icon = iconMap[s];

              return (
                <button
                  key={s}
                  type="button"
                  onClick={() => setStatus(s)}
                  className={`flex items-center justify-center gap-1.5 rounded-xl border py-2 text-xs font-bold transition-all active:scale-95 ${
                    isSelected
                      ? activeClasses[s]
                      : 'border-indigo-100/50 bg-white/50 text-indigo-900/60 hover:bg-white dark:border-indigo-950/50 dark:bg-gray-900/50 dark:text-indigo-300/60'
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {labelMap[s]}
                </button>
              );
            })}
          </div>
        </div>

        {/* Data de Conclusão */}
        <div className="space-y-1.5">
          <Label htmlFor="data_conclusao" className="text-xs font-bold text-indigo-900/80 dark:text-indigo-300">
            Previsão de Conclusão <span className="text-[10px] font-normal text-indigo-900/40 dark:text-indigo-400/40">(Opcional)</span>
          </Label>
          <div className="relative">
            <Input
              id="data_conclusao"
              type="date"
              value={dataConclusao}
              onChange={(e) => setDataConclusao(e.target.value)}
              className="rounded-xl border-indigo-100 bg-white/80 pl-10 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-indigo-950 dark:bg-gray-900/80"
            />
            <Calendar className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-indigo-500/60 dark:text-indigo-400/60" />
          </div>
        </div>
      </div>

      <div className="flex gap-2 pt-2">
        {onCancel && (
          <Button 
            type="button" 
            variant="outline" 
            onClick={onCancel} 
            className="flex-1 rounded-xl border-indigo-100 bg-white/50 text-indigo-900/80 hover:bg-white dark:border-indigo-950 dark:bg-gray-900/50 dark:text-indigo-200"
          >
            Cancelar
          </Button>
        )}
        <Button 
          type="submit" 
          className="flex-1 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm shadow-indigo-600/10"
        >
          {initialTask ? (
            <>
              <Save className="mr-1.5 h-4 w-4" /> Salvar
            </>
          ) : (
            <>
              <Plus className="mr-1.5 h-4 w-4" /> Criar Tarefa
            </>
          )}
        </Button>
      </div>
    </form>
  );
};