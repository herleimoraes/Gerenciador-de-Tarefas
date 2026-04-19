'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { TaskSchema, Task } from '@/lib/types';
import { motion, AnimatePresence } from 'motion/react';
import { X, Calendar } from 'lucide-react';
import { useEffect } from 'react';

interface TaskFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<Task>) => void;
  initialData?: Partial<Task> | null;
}

export function TaskFormModal({ isOpen, onClose, onSubmit, initialData }: TaskFormModalProps) {
  const { register, handleSubmit, reset, formState: { errors }, setValue, watch } = useForm({
    resolver: zodResolver(TaskSchema.omit({ id: true, completionPhotoUrl: true })),
    defaultValues: {
      title: '',
      description: '',
      dueDate: Date.now() + 86400000, // Tomorrow
      priority: 'Medium' as const,
      status: 'Pending' as const,
    }
  });

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        reset({
          title: initialData.title || '',
          description: initialData.description || '',
          dueDate: initialData.dueDate || Date.now(),
          priority: initialData.priority || 'Medium',
          status: initialData.status || 'Pending',
        });
      } else {
        reset({
          title: '',
          description: '',
          dueDate: Date.now() + 86400000,
          priority: 'Medium',
          status: 'Pending',
        });
      }
    }
  }, [isOpen, initialData, reset]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <motion.div
        initial={{ opacity: 0, y: 100 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 100 }}
        className="w-full max-w-[375px] bg-slate-50 rounded-[30px] p-6 shadow-2xl max-h-[90vh] overflow-y-auto"
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-slate-800">
            {initialData ? 'Editar Tarefa' : 'Nova Tarefa'}
          </h2>
          <button onClick={onClose} className="p-2 bg-slate-200 rounded-full text-slate-500 hover:text-slate-900 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-[13px] font-bold text-slate-700 mb-1">Título</label>
            <input
              {...register('title')}
              className="w-full p-3.5 bg-white border border-slate-200 rounded-[12px] focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all text-[14px]"
              placeholder="O que precisa ser feito?"
            />
            {errors.title?.message && <p className="text-red-500 text-xs mt-1">{String(errors.title.message)}</p>}
          </div>

          <div>
            <label className="block text-[13px] font-bold text-slate-700 mb-1">Descrição</label>
            <textarea
              {...register('description')}
              rows={3}
              className="w-full p-3.5 bg-white border border-slate-200 rounded-[12px] focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all resize-none text-[14px]"
              placeholder="Adicionar detalhes..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[13px] font-bold text-slate-700 mb-1">Prazo</label>
              <input
                type="datetime-local"
                value={new Date(watch('dueDate') - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16)}
                onChange={(e) => {
                  const val = new Date(e.target.value).getTime();
                  if (!isNaN(val)) setValue('dueDate', val);
                }}
                className="w-full p-3.5 bg-white border border-slate-200 rounded-[12px] focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all text-[13px]"
              />
            </div>
            
            <div>
              <label className="block text-[13px] font-bold text-slate-700 mb-1">Prioridade</label>
              <select
                {...register('priority')}
                className="w-full p-3.5 bg-white border border-slate-200 rounded-[12px] focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all font-semibold text-[13px]"
              >
                <option value="Low" className="text-emerald-600">Normal</option>
                <option value="Medium" className="text-amber-600">Alta</option>
                <option value="High" className="text-red-600">Urgente</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[13px] font-bold text-slate-700 mb-1">Status</label>
            <select
              {...register('status')}
              className="w-full p-3.5 bg-white border border-slate-200 rounded-[12px] focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all font-semibold text-[13px]"
            >
              <option value="Pending">Pendente</option>
              <option value="In Progress">Em Andamento</option>
              <option value="Completed">Concluído</option>
            </select>
          </div>

          <button
            type="submit"
            className="w-full mt-6 bg-indigo-500 text-white font-bold py-3.5 rounded-[12px] transition-transform active:scale-95"
          >
            {initialData ? 'Salvar Alterações' : 'Criar Tarefa'}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
