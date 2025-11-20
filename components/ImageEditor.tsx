import React, { useState } from 'react';
import { editCropImage } from '../services/geminiService';
import ImageUploader from './ImageUploader';
import { EditIcon, SparklesIcon, RefreshCwIcon } from './Icons';
import { Language } from '../types';
import { translations } from '../translations';

interface Props {
  lang: Language;
}

const ImageEditor: React.FC<Props> = ({ lang }) => {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [editedUrl, setEditedUrl] = useState<string | null>(null);
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const t = translations[lang];

  const handleImageSelect = (selectedFile: File) => {
    setFile(selectedFile);
    setPreviewUrl(URL.createObjectURL(selectedFile));
    setEditedUrl(null);
  };

  const handleEdit = async () => {
    if (!file || !prompt) return;
    setLoading(true);
    try {
      const newImageBase64 = await editCropImage(file, prompt, lang);
      setEditedUrl(newImageBase64);
    } catch (err) {
      console.error(err);
      alert("Failed to edit image");
    } finally {
      setLoading(false);
    }
  };

  if (!file) {
    return <ImageUploader onImageSelect={handleImageSelect} lang={lang} />;
  }

  return (
    <div className="w-full max-w-4xl mx-auto bg-white/95 backdrop-blur rounded-2xl shadow-2xl overflow-hidden p-6 animate-slide-up">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <EditIcon /> {t.editorTitle}
        </h2>
        <button onClick={() => setFile(null)} className="text-gray-500 hover:text-gray-700 text-sm">
          {t.uploadTitle}
        </button>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Original */}
        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-500">{t.original}</p>
          <div className="aspect-square bg-gray-100 rounded-xl overflow-hidden">
            <img src={previewUrl!} alt="Original" className="w-full h-full object-cover" />
          </div>
        </div>

        {/* Result */}
        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-500">{t.simulationResult}</p>
          <div className="aspect-square bg-gray-100 rounded-xl overflow-hidden flex items-center justify-center border-2 border-dashed border-gray-200 relative">
             {loading ? (
               <div className="animate-spin text-[#667eea]"><RefreshCwIcon /></div>
             ) : editedUrl ? (
               <img src={editedUrl} alt="Edited" className="w-full h-full object-cover" />
             ) : (
               <p className="text-gray-400 text-sm">Result will appear here</p>
             )}
          </div>
        </div>
      </div>

      <div className="mt-8">
        <label className="block text-sm font-medium text-gray-700 mb-2">{t.magicPrompt}</label>
        <div className="flex gap-2">
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="e.g., Show healthy maize leaves, Remove the background"
            className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#667eea] outline-none text-gray-800"
          />
          <button
            onClick={handleEdit}
            disabled={loading || !prompt}
            className="px-6 py-3 bg-[#667eea] text-white font-semibold rounded-xl hover:bg-[#5a67d8] disabled:opacity-50 flex items-center gap-2"
          >
            <SparklesIcon /> {t.generate}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImageEditor;