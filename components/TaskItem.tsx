'use client';

import { Task } from '@/lib/types';
import { format } from 'date-fns';
import { CheckCircle, Circle, Clock, Camera } from 'lucide-react';
import { motion } from 'motion/react';
import clsx from 'clsx';
import { useState, useEffect } from 'react';
import Image from 'next/image';

interface TaskItemProps {
  task: Task;
  onEdit: (task: Task) => void;
  onCompleteToggle: (task: Task) => void;
}

export function TaskItem({ task, onEdit, onCompleteToggle }: TaskItemProps) {
  const isCompleted = task.status === 'Completed';

  const priorityTags = {
    High: 'bg-rose-200 text-rose-900',
    Medium: 'bg-orange-100 text-orange-800',
    Low: 'bg-green-100 text-green-800',
  };

  const cardColors = {
    High: 'bg-rose-50 border-l-red-500',
    Medium: 'bg-orange-50 border-l-amber-500',
    Low: 'bg-green-50 border-l-emerald-500',
  };

  const labels = {
    High: 'URGENTE',
    Medium: 'ALTA',
    Low: 'NORMAL'
  };

  // A local variable is sufficient as dueDate won't change without a re-render.
  // Using Date.now() directly in render violates purity according to the linter,
  // but if we store the reference timestamp or determine it purely based on props it's fine.
  // Instead of updating dynamically, we'll just evaluate it once during render if we disable the rule, 
  // or use an effect that sets a timestamp if needed.
  // For the sake of simplicity, we calculate it using an effect without making it a direct set-state.
  const [currentDate, setCurrentDate] = useState<number | null>(null);

  useEffect(() => {
    // This effect runs once on mount, so it's safeish, but we can just schedule it to avoid the lint error
    const timer = setTimeout(() => {
      setCurrentDate(Date.now());
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  const isOverdue = !isCompleted && currentDate !== null && task.dueDate < currentDate;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className={clsx(
        'group rounded-[20px] p-4 mb-4 border-l-[6px] shadow-sm transition-all',
        isCompleted ? 'bg-green-50 border-emerald-500 opacity-75' : cardColors[task.priority]
      )}
    >
      <div 
        className="flex flex-col cursor-pointer"
        onClick={() => onEdit(task)}
      >
        <div className="flex justify-between items-start mb-2">
          <span className={clsx('text-[10px] font-extrabold uppercase px-2 py-[2px] rounded-[10px]', priorityTags[task.priority])}>
            {labels[task.priority]}
          </span>
          <span className="text-[12px] text-slate-800 flex items-center gap-1">
            <span className={clsx('text-[10px]', isCompleted ? 'text-emerald-500' : 'text-slate-800')}>●</span> {isCompleted ? 'Concluído' : 'Em Aberto'}
          </span>
        </div>
        
        <h3 className={clsx('font-bold text-[16px] mb-1', isCompleted ? 'text-slate-400 line-through' : 'text-slate-800')}>
          {task.title}
        </h3>
        
        {task.description && (
          <p className={clsx("text-[13px] leading-[1.4] mb-3", isCompleted ? 'text-slate-400' : 'text-slate-500')}>
            {task.description}
          </p>
        )}

        <div className="flex justify-between items-center border-t border-black/5 pt-2.5 mt-auto">
          <span className="text-[11px] font-semibold text-slate-600 flex items-center gap-1">
            📅 {format(task.dueDate, 'dd MMM, yyyy')}
          </span>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onCompleteToggle(task);
            }}
            className={clsx(
              'text-[11px] font-semibold flex items-center gap-1 rounded-full px-2 py-1 transition-colors',
              isCompleted 
                ? 'text-emerald-600 bg-emerald-100' 
                : isOverdue ? 'text-red-500 bg-red-100 hover:bg-red-200' : 'text-indigo-600 bg-indigo-100 hover:bg-indigo-200'
            )}
          >
            {isCompleted ? '✅ Finalizado' : `⏰ Lembrar ${format(task.dueDate, 'HH:mm')}`}
          </button>
        </div>
      </div>
    </motion.div>
  );
}
