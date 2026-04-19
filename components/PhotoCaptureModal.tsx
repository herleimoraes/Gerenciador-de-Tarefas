'use client';

import { useRef, useState } from 'react';
import { motion } from 'motion/react';
import { X, Camera, Upload } from 'lucide-react';
import { compressImage } from '@/lib/types';
import Image from 'next/image';

interface PhotoCaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPhotoCaptured: (base64Photo: string) => void;
}

export function PhotoCaptureModal({ isOpen, onClose, onPhotoCaptured }: PhotoCaptureModalProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isCompressing, setIsCompressing] = useState(false);

  if (!isOpen) return null;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsCompressing(true);
      const base64 = await compressImage(file, 800); // Max width 800px
      setPreview(base64);
    } catch (err) {
      console.error(err);
      alert('Failed to process image');
    } finally {
      setIsCompressing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="absolute bottom-0 left-0 right-0 h-[240px] sm:h-auto bg-white rounded-t-[30px] p-6 shadow-[0_-10px_25px_rgba(0,0,0,0.1)] flex flex-col items-center text-center"
      >
        <button onClick={onClose} className="absolute top-4 right-4 p-2 bg-slate-100 rounded-full text-slate-500 hover:text-slate-900 z-10 transition-colors">
          <X className="w-5 h-5" />
        </button>

        <h4 className="m-0 mb-4 font-bold text-slate-800 text-lg">Finalizar Tarefa</h4>

        {preview ? (
          <div className="w-full flex-1 flex flex-col justify-between">
            <div className="relative w-full h-[100px] mb-4 rounded-2xl overflow-hidden shadow-inner bg-black">
              <Image src={preview} alt="Capture preview" fill className="object-cover" />
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={() => setPreview(null)}
                className="flex-1 py-3 font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
              >
                Retake
              </button>
              <button
                onClick={() => onPhotoCaptured(preview)}
                className="flex-[2] py-3 font-bold text-white bg-emerald-500 hover:bg-emerald-600 rounded-xl transition-colors shadow-sm"
              >
                Concluir Agora
              </button>
            </div>
          </div>
        ) : (
          <div className="w-full">
            <div
              onClick={() => fileInputRef.current?.click()}
              className="w-full h-[100px] border-2 border-dashed border-slate-300 rounded-[16px] flex flex-col items-center justify-center mb-4 bg-slate-50 cursor-pointer hover:bg-slate-100 transition-colors"
            >
              {isCompressing ? (
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-slate-300 border-t-indigo-500" />
              ) : (
                <>
                  <span className="text-[20px] mb-1">📷</span>
                  <span className="text-[12px] text-slate-500">Tirar foto para comprovar</span>
                </>
              )}
            </div>
            <button
               disabled={true}
               className="w-full py-3 font-bold text-white bg-emerald-500 hover:bg-emerald-600 rounded-xl transition-colors opacity-50 cursor-not-allowed"
             >
               Concluir Agora
             </button>
          </div>
        )}

        <input
          type="file"
          accept="image/*"
          capture="environment"
          ref={fileInputRef}
          className="hidden"
          onChange={handleFileChange}
        />
      </motion.div>
    </div>
  );
}
