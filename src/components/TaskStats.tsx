import React from 'react';
import { Task } from '@/services/taskService';
import { CheckCircle2, Clock, PlayCircle, ListTodo } from 'lucide-react';

interface TaskStatsProps {
  tasks: Task[];
}

export const TaskStats: React.FC<TaskStatsProps> = ({ tasks }) => {
  const total = tasks.length;
  const pendentes = tasks.filter(t => t.status === 'pendente').length;
  const emProgresso = tasks.filter(t => t.status === 'em_progresso').length;
  const concluidas = tasks.filter(t => t.status === 'concluido').length;

  const stats = [
    {
      label: 'Total',
      value: total,
      icon: ListTodo,
      color: 'bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400',
    },
    {
      label: 'Pendentes',
      value: pendentes,
      icon: Clock,
      color: 'bg-amber-50 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400',
    },
    {
      label: 'Em Progresso',
      value: emProgresso,
      icon: PlayCircle,
      color: 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400',
    },
    {
      label: 'Concluídas',
      value: concluidas,
      icon: CheckCircle2,
      color: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400',
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <div
            key={index}
            className="flex items-center gap-3 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm transition-all hover:shadow-md dark:border-gray-800 dark:bg-gray-900"
          >
            <div className={`rounded-xl p-2.5 ${stat.color}`}>
              <Icon className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400">{stat.label}</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
};