import React, { useEffect, useRef, useState } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';
import { MicIcon, LeafIcon } from './Icons';
import { Language } from '../types';
import { translations, languageNames } from '../translations';

interface Props {
  lang: Language;
}

const LiveAssistant: React.FC<Props> = ({ lang }) => {
  const [isActive, setIsActive] = useState(false);
  const t = translations[lang];
  const [status, setStatus] = useState<string>(t.talkToExpert);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hasPermission, setHasPermission] = useState(false);

  // Audio Contexts
  const inputAudioContextRef = useRef<AudioContext | null>(null);
  const outputAudioContextRef = useRef<AudioContext | null>(null);
  
  useEffect(() => {
    // Check permissions
    navigator.mediaDevices.getUserMedia({ audio: true })
      .then(() => setHasPermission(true))
      .catch(() => setStatus("Microphone permission denied"));
      
    return () => {
      inputAudioContextRef.current?.close();
      outputAudioContextRef.current?.close();
    };
  }, []);

  useEffect(() => {
    if (!isActive) {
       setStatus(t.talkToExpert);
    }
  }, [lang, isActive, t.talkToExpert]);

  const startSession = async () => {
    if (!process.env.API_KEY) return;
    setIsActive(true);
    setStatus("Connecting...");

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      // Setup Audio
      inputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      outputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      let nextStartTime = 0;
      const sources = new Set<AudioBufferSourceNode>();

      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        callbacks: {
          onopen: () => {
            setStatus("Listening...");
            
            const source = inputAudioContextRef.current!.createMediaStreamSource(stream);
            const scriptProcessor = inputAudioContextRef.current!.createScriptProcessor(4096, 1, 1);
            
            scriptProcessor.onaudioprocess = (e) => {
              const inputData = e.inputBuffer.getChannelData(0);
              // Simple downsampling/conversion to PCM Int16
              const l = inputData.length;
              const int16 = new Int16Array(l);
              for (let i = 0; i < l; i++) {
                int16[i] = inputData[i] * 32768;
              }
              const b64 = btoa(String.fromCharCode(...new Uint8Array(int16.buffer)));
              
              sessionPromise.then(session => {
                session.sendRealtimeInput({ 
                  media: { 
                    mimeType: 'audio/pcm;rate=16000', 
                    data: b64 
                  } 
                });
              });
            };
            
            source.connect(scriptProcessor);
            scriptProcessor.connect(inputAudioContextRef.current!.destination);
          },
          onmessage: async (message: LiveServerMessage) => {
            const base64Audio = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
            if (base64Audio && outputAudioContextRef.current) {
              const ctx = outputAudioContextRef.current;
              const binary = atob(base64Audio);
              const bytes = new Uint8Array(binary.length);
              for(let i=0; i<binary.length; i++) bytes[i] = binary.charCodeAt(i);
              
              // PCM 16bit 24kHz decode
              const dataInt16 = new Int16Array(bytes.buffer);
              const buffer = ctx.createBuffer(1, dataInt16.length, 24000);
              const channelData = buffer.getChannelData(0);
              for(let i=0; i<dataInt16.length; i++) channelData[i] = dataInt16[i] / 32768.0;
              
              const source = ctx.createBufferSource();
              source.buffer = buffer;
              source.connect(ctx.destination);
              
              nextStartTime = Math.max(ctx.currentTime, nextStartTime);
              source.start(nextStartTime);
              nextStartTime += buffer.duration;
              sources.add(source);
              
              source.onended = () => sources.delete(source);
            }
            
            if (message.serverContent?.interrupted) {
              sources.forEach(s => s.stop());
              sources.clear();
              nextStartTime = 0;
            }
          },
          onclose: () => {
            setIsActive(false);
            setStatus("Session ended");
          },
          onerror: (err) => {
            console.error(err);
            setStatus("Error connecting to expert");
            setIsActive(false);
          }
        },
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } }
          },
          systemInstruction: `You are a friendly expert agro-extension officer helping Nigerian farmers. You MUST speak in ${languageNames[lang]}.`
        }
      });

    } catch (e) {
      console.error(e);
      setIsActive(false);
      setStatus("Connection failed");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-full min-h-[400px] space-y-8 animate-fade-in">
      <div className={`relative w-48 h-48 rounded-full flex items-center justify-center transition-all duration-500 ${isActive ? "bg-[#667eea]/20 scale-110" : "bg-white/5"}`}>
        {isActive && (
           <div className="absolute inset-0 rounded-full border-4 border-[#667eea] animate-pulse-slow opacity-50"></div>
        )}
        <div className="bg-gradient-to-br from-[#667eea] to-purple-600 p-8 rounded-full shadow-2xl z-10">
           <MicIcon />
        </div>
      </div>
      
      <div className="text-center space-y-4">
        <h2 className="text-2xl font-bold text-white">{isActive ? t.live : t.talkToExpert}</h2>
        <p className="text-gray-300 max-w-xs mx-auto">{status}</p>
        
        {!isActive ? (
          <button 
            onClick={startSession}
            disabled={!hasPermission}
            className="px-8 py-3 bg-white text-[#667eea] font-bold rounded-full hover:bg-gray-100 transition-all shadow-lg disabled:opacity-50"
          >
            {t.startVoice}
          </button>
        ) : (
          <button 
            onClick={() => window.location.reload()} // Simple way to kill session for now
            className="px-8 py-3 bg-red-500 text-white font-bold rounded-full hover:bg-red-600 transition-all shadow-lg"
          >
            {t.endCall}
          </button>
        )}
      </div>
    </div>
  );
};

export default LiveAssistant;