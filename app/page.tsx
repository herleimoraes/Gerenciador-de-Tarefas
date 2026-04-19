'use client';

import { useEffect, useState } from 'react';
import { collection, query, where, onSnapshot, addDoc, updateDoc, doc, serverTimestamp, orderBy, deleteDoc } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import { db, auth } from '@/lib/firebase';
import { useAuth } from '@/components/AuthProvider';
import { TaskItem } from '@/components/TaskItem';
import { TaskFormModal } from '@/components/TaskFormModal';
import { PhotoCaptureModal } from '@/components/PhotoCaptureModal';
import { Task } from '@/lib/types';
import { LogOut, Plus, Activity } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Image from 'next/image';

export default function HomePage() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Partial<Task> | null>(null);
  
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);
  const [taskToComplete, setTaskToComplete] = useState<Task | null>(null);

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, 'tasks'),
      where('userId', '==', user.uid),
      orderBy('dueDate', 'asc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const tasksData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        // Check if createdAt exists to avoid missing timestamp errors. Provide a fallback for optimistic updates
        dueDate: doc.data().dueDate,
      })) as Task[];
      setTasks(tasksData);
    });

    return () => unsubscribe();
  }, [user]);

  const handleSignOut = () => signOut(auth);

  const handleFormSubmit = async (data: Partial<Task>) => {
    if (!user) return;
    try {
      if (editingTask?.id) {
        await updateDoc(doc(db, 'tasks', editingTask.id), {
          ...data,
          updatedAt: serverTimestamp()
        });
      } else {
        await addDoc(collection(db, 'tasks'), {
          ...data,
          userId: user.uid,
          completionPhotoUrl: '',
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
      }
      setIsFormOpen(false);
      setEditingTask(null);
    } catch (error) {
      console.error("Error saving task:", error);
      alert("Failed to save task.");
    }
  };

  const handleCompleteToggle = async (task: Task) => {
    if (task.status === 'Completed') {
      // Revert to pending
      await updateDoc(doc(db, 'tasks', task.id!), {
        status: 'Pending',
        completionPhotoUrl: '',
        updatedAt: serverTimestamp()
      });
    } else {
      // Trigger photo capture
      setTaskToComplete(task);
      setIsPhotoModalOpen(true);
    }
  };

  const handlePhotoCaptured = async (base64Photo: string) => {
    if (!taskToComplete?.id) return;
    try {
      await updateDoc(doc(db, 'tasks', taskToComplete.id), {
        status: 'Completed',
        completionPhotoUrl: base64Photo,
        updatedAt: serverTimestamp()
      });
      setIsPhotoModalOpen(false);
      setTaskToComplete(null);
    } catch (error) {
      console.error(error);
      alert('Failed to complete task');
    }
  };

  if (!user) return null;

  const pendingTasks = tasks.filter(t => t.status !== 'Completed');
  const completedTasks = tasks.filter(t => t.status === 'Completed');

  return (
    <div className="flex flex-col h-full bg-slate-50">
      {/* Top Bar */}
      <header className="bg-white px-5 pt-6 pb-2.5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            {user.photoURL ? (
              <Image src={user.photoURL} alt="Profile" width={40} height={40} className="rounded-full border-2 border-white shadow-[0_2px_4px_rgba(0,0,0,0.1)]" />
            ) : (
              <div className="w-10 h-10 rounded-full bg-indigo-500 border-2 border-white flex items-center justify-center text-white font-bold text-sm shadow-[0_2px_4px_rgba(0,0,0,0.1)]">
                {user.email?.[0].toUpperCase()}
              </div>
            )}
            <div>
              <div className="text-[10px] text-slate-500 leading-tight">Bom dia,</div>
              <div className="font-bold text-[14px] text-slate-800 leading-tight">{user.displayName || user.email?.split('@')[0]}</div>
            </div>
          </div>
          <button onClick={handleSignOut} className="text-slate-400 hover:text-red-500 transition-colors">
            <span className="text-[20px]">🚪</span>
          </button>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 p-4 overflow-y-auto">
        {tasks.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-gray-400 p-8 pt-20">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <Activity className="w-10 h-10 text-gray-300" />
            </div>
            <p className="text-center font-medium">No tasks yet.<br/>Tap + to create your first task!</p>
          </div>
        ) : (
          <div className="space-y-6">
            <AnimatePresence>
              {pendingTasks.map(task => (
                <TaskItem 
                  key={task.id} 
                  task={task} 
                  onEdit={(t) => { setEditingTask(t); setIsFormOpen(true); }}
                  onCompleteToggle={handleCompleteToggle}
                />
              ))}

              {completedTasks.length > 0 && (
                <div className="pt-4 mt-6 border-t border-gray-200">
                  <h3 className="text-sm font-bold text-gray-500 mb-4 px-2 uppercase tracking-widen">Completed</h3>
                  <div className="space-y-4">
                    {completedTasks.map(task => (
                      <TaskItem 
                        key={task.id} 
                        task={task} 
                        onEdit={(t) => { setEditingTask(t); setIsFormOpen(true); }}
                        onCompleteToggle={handleCompleteToggle}
                      />
                    ))}
                  </div>
                </div>
              )}
            </AnimatePresence>
          </div>
        )}
      </main>

      {/* FAB */}
      <button 
        onClick={() => { setEditingTask(null); setIsFormOpen(true); }}
        className="absolute bottom-6 right-6 w-14 h-14 bg-indigo-500 rounded-full flex items-center justify-center text-white shadow-lg shadow-indigo-500/40 hover:scale-105 active:scale-95 transition-all z-20 text-2xl font-light"
      >
        <Plus className="w-6 h-6" />
      </button>

      {/* Modals */}
      <AnimatePresence>
        {isFormOpen && (
          <TaskFormModal 
            isOpen={isFormOpen} 
            onClose={() => { setIsFormOpen(false); setEditingTask(null); }}
            onSubmit={handleFormSubmit}
            initialData={editingTask}
          />
        )}
        
        {isPhotoModalOpen && (
          <PhotoCaptureModal
            isOpen={isPhotoModalOpen}
            onClose={() => { setIsPhotoModalOpen(false); setTaskToComplete(null); }}
            onPhotoCaptured={handlePhotoCaptured}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
