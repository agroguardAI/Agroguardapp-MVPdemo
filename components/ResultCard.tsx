import React, { useState } from 'react';
import { AnalysisResult, Language } from '../types';
import { translations } from '../translations';
import { AlertTriangleIcon, CheckCircleIcon, RefreshCwIcon, SpeakerIcon, ThumbsUpIcon, ThumbsDownIcon } from './Icons';
import { generateSpeech } from '../services/geminiService';

interface ResultCardProps {
  result: AnalysisResult;
  imageUrl: string;
  onReset: () => void;
  lang: Language;
}

const ResultCard: React.FC<ResultCardProps> = ({ result, imageUrl, onReset, lang }) => {
  const [playing, setPlaying] = useState(false);
  const [feedback, setFeedback] = useState<'up' | 'down' | null>(null);
  const [comment, setComment] = useState('');
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const t = translations[lang];

  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getSeverityLabel = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'high': return t.high;
      case 'medium': return t.medium;
      case 'low': return t.low;
      default: return severity;
    }
  };

  const handleSpeak = async () => {
    if (playing) return;
    setPlaying(true);
    try {
      // Use localized labels for the TTS intro
      const textToSpeak = `${t.diagnosisTitle}: ${result.name}. ${t.severity}: ${getSeverityLabel(result.severity)}. ${result.description}. ${t.treatmentTitle}: ${result.treatments.join('. ')}`;
      const base64 = await generateSpeech(textToSpeak);
      
      const binary = atob(base64);
      const len = binary.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) bytes[i] = binary.charCodeAt(i);
      
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)({sampleRate: 24000});
      
      const dataInt16 = new Int16Array(bytes.buffer);
      const buffer = ctx.createBuffer(1, dataInt16.length, 24000);
      const channel = buffer.getChannelData(0);
      for(let i=0; i<dataInt16.length; i++) channel[i] = dataInt16[i] / 32768.0;

      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.connect(ctx.destination);
      source.start(0);
      source.onended = () => setPlaying(false);
    } catch (e) {
      console.error("TTS error", e);
      setPlaying(false);
    }
  };

  const handleSubmitFeedback = () => {
    console.log("Feedback submitted:", { 
      isPositive: feedback === 'up', 
      comment, 
      diagnosis: result.name 
    });
    setFeedbackSubmitted(true);
  };

  return (
    <div className="w-full max-w-2xl mx-auto bg-white/95 backdrop-blur rounded-2xl shadow-2xl overflow-hidden animate-slide-up pb-20 lg:pb-0">
      
      {/* Header / Image Section */}
      <div className="relative h-64 sm:h-72 w-full overflow-hidden">
        <img 
          src={imageUrl} 
          alt="Analyzed Crop" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end">
          <div className="p-6 w-full flex justify-between items-end">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${getSeverityColor(result.severity)}`}>
                  {getSeverityLabel(result.severity)} {t.severity}
                </span>
              </div>
              <h2 className="text-3xl font-bold text-white mb-1">{result.name}</h2>
              <p className="text-white/80 italic text-sm">{result.scientificName}</p>
            </div>
            <button 
              onClick={handleSpeak}
              disabled={playing}
              className="p-3 bg-white/20 backdrop-blur hover:bg-white/40 rounded-full text-white transition-colors"
            >
              <SpeakerIcon />
            </button>
          </div>
        </div>
      </div>

      {/* Content Body */}
      <div className="p-6 space-y-8">
        
        {/* Diagnosis */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-gray-800 font-bold text-lg border-b border-gray-100 pb-2">
            <AlertTriangleIcon />
            <h3>{t.diagnosisTitle}</h3>
          </div>
          <p className="text-gray-600 leading-relaxed">{result.description}</p>
          <div className="flex flex-wrap gap-2 mt-2">
            {result.symptoms.map((symptom, idx) => (
              <span key={idx} className="px-3 py-1 bg-gray-100 text-gray-600 rounded-lg text-sm">
                • {symptom}
              </span>
            ))}
          </div>
        </div>

        {/* Treatment */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-[#667eea] font-bold text-lg border-b border-gray-100 pb-2">
            <CheckCircleIcon />
            <h3>{t.treatmentTitle}</h3>
          </div>
          <ul className="space-y-3">
            {result.treatments.map((treatment, idx) => (
              <li key={idx} className="flex items-start gap-3 p-3 rounded-xl bg-indigo-50/50 border border-indigo-100 text-gray-700 text-sm">
                <span className="flex-shrink-0 w-6 h-6 bg-[#667eea] text-white rounded-full flex items-center justify-center text-xs font-bold mt-0.5">
                  {idx + 1}
                </span>
                <span>{treatment}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Prevention */}
        <div className="space-y-3">
          <h3 className="font-bold text-gray-800 text-sm uppercase tracking-wide text-xs mb-2">{t.preventionTitle}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {result.prevention.map((tip, idx) => (
              <div key={idx} className="p-3 bg-green-50 border border-green-100 rounded-lg text-sm text-green-800">
                {tip}
              </div>
            ))}
          </div>
        </div>

        {/* Feedback Section */}
        <div className="border-t border-gray-100 pt-6">
          {!feedbackSubmitted ? (
            <div className="space-y-4">
              <p className="text-sm font-semibold text-gray-600 text-center">{t.feedbackQuestion}</p>
              <div className="flex justify-center gap-4">
                <button
                  onClick={() => setFeedback('up')}
                  className={`p-3 rounded-full transition-colors border ${
                    feedback === 'up' 
                      ? 'bg-green-100 border-green-300 text-green-700' 
                      : 'bg-gray-50 border-gray-200 text-gray-400 hover:bg-gray-100'
                  }`}
                >
                  <ThumbsUpIcon />
                </button>
                <button
                  onClick={() => setFeedback('down')}
                  className={`p-3 rounded-full transition-colors border ${
                    feedback === 'down' 
                      ? 'bg-red-100 border-red-300 text-red-700' 
                      : 'bg-gray-50 border-gray-200 text-gray-400 hover:bg-gray-100'
                  }`}
                >
                  <ThumbsDownIcon />
                </button>
              </div>

              {feedback && (
                <div className="animate-fade-in space-y-3">
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder={feedback === 'down' ? t.whatWentWrong : t.additionalComments}
                    className="w-full p-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#667eea] focus:outline-none resize-none bg-gray-50 text-gray-800"
                    rows={2}
                  />
                  <button
                    onClick={handleSubmitFeedback}
                    className="w-full py-2 bg-[#667eea] text-white rounded-lg text-sm font-medium hover:bg-[#5a67d8] transition-colors"
                  >
                    {t.submitFeedback}
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-4 bg-green-50 rounded-xl border border-green-100 animate-fade-in">
              <p className="text-green-800 font-medium text-sm">{t.thankYou}</p>
            </div>
          )}
        </div>

        {/* Action Footer */}
        <div className="pt-4">
          <button 
            onClick={onReset}
            className="w-full py-4 bg-gray-900 hover:bg-black text-white rounded-xl font-semibold shadow-lg flex items-center justify-center gap-2 transition-transform active:scale-95"
          >
            <RefreshCwIcon />
            {t.scanAnother}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResultCard;