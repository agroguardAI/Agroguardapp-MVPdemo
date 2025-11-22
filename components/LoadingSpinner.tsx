import React from 'react';
import { LeafIcon } from './Icons';
import { Language } from '../types';
import { translations } from '../translations';

interface Props {
  lang: Language;
}

const LoadingSpinner: React.FC<Props> = ({ lang }) => {
  const t = translations[lang];
  return (
    <div className="flex flex-col items-center justify-center py-12 space-y-6 text-gray-800 dark:text-white animate-fade-in">
      <div className="relative">
        <div className="absolute inset-0 bg-brand-purple blur-xl opacity-50 rounded-full animate-pulse-slow"></div>
        <div className="relative bg-brand-purple/10 dark:bg-white/10 p-6 rounded-full border border-brand-purple/20 dark:border-white/20 shadow-xl backdrop-blur-sm">
          <div className="animate-spin text-brand-purple dark:text-white">
            <LeafIcon />
          </div>
        </div>
      </div>
      <div className="text-center space-y-2">
        <h3 className="text-xl font-semibold tracking-wide">{t.analyzing}</h3>
        <p className="text-gray-600 dark:text-white/70 text-sm">{t.analyzingDesc}</p>
      </div>
    </div>
  );
};

export default LoadingSpinner;