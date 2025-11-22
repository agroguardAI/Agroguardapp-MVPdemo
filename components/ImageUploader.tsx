import React, { useCallback } from 'react';
import { CameraIcon, UploadIcon } from './Icons';
import { Language } from '../types';
import { translations } from '../translations';

interface ImageUploaderProps {
  onImageSelect: (file: File) => void;
  lang: Language;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageSelect, lang }) => {
  const t = translations[lang];
  
  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onImageSelect(e.target.files[0]);
    }
  }, [onImageSelect]);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
       onImageSelect(e.dataTransfer.files[0]);
    }
  }, [onImageSelect]);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  return (
    <div 
      className="w-full max-w-md mx-auto animate-slide-up"
      onDrop={handleDrop}
      onDragOver={handleDragOver}
    >
      <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur rounded-2xl shadow-2xl overflow-hidden border border-gray-200 dark:border-white/20">
        <div className="p-8 text-center space-y-6">
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white">{t.uploadTitle}</h2>
            <p className="text-gray-500 dark:text-gray-400">{t.uploadDesc}</p>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {/* Camera Button (Mobile Optimized) */}
            <label className="relative group cursor-pointer">
              <input 
                type="file" 
                accept="image/*" 
                capture="environment"
                className="hidden" 
                onChange={handleFileInput}
              />
              <div className="flex items-center justify-center gap-3 w-full py-4 px-6 bg-[#667eea] hover:bg-[#5a67d8] text-white rounded-xl transition-all duration-300 transform group-active:scale-95 shadow-lg shadow-indigo-200 dark:shadow-none">
                <CameraIcon />
                <span className="font-semibold text-lg">{t.takePhoto}</span>
              </div>
            </label>

            {/* File Upload Area */}
            <label className="relative block group cursor-pointer">
               <input 
                type="file" 
                accept="image/*" 
                className="hidden" 
                onChange={handleFileInput}
              />
              <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-8 hover:border-[#667eea] dark:hover:border-[#667eea] hover:bg-indigo-50 dark:hover:bg-gray-700 transition-all duration-300 flex flex-col items-center justify-center gap-3 text-gray-400 dark:text-gray-500 hover:text-[#667eea] dark:hover:text-[#667eea]">
                <UploadIcon />
                <span className="font-medium">{t.dropImage}</span>
              </div>
            </label>
          </div>
        </div>
        
        <div className="bg-gray-50 dark:bg-gray-900/50 p-4 text-center border-t border-gray-100 dark:border-gray-700">
          <p className="text-xs text-gray-500 dark:text-gray-400">Supports JPG, PNG. Max 5MB.</p>
        </div>
      </div>
    </div>
  );
};

export default ImageUploader;