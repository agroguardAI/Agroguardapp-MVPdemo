import React, { useState } from 'react';
import { findAgroServices } from '../services/geminiService';
import { MapPinIcon } from './Icons';
import { MapResult, Language } from '../types';
import { translations } from '../translations';

interface Props {
  lang: Language;
}

const MapFinder: React.FC<Props> = ({ lang }) => {
  const [query, setQuery] = useState('');
  const [result, setResult] = useState<MapResult | null>(null);
  const [loading, setLoading] = useState(false);
  const t = translations[lang];

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let lat = 6.5244; // Default Lagos
      let lng = 3.3792;

      if ("geolocation" in navigator) {
        try {
          const pos = await new Promise<GeolocationPosition>((resolve, reject) => 
            navigator.geolocation.getCurrentPosition(resolve, reject)
          );
          lat = pos.coords.latitude;
          lng = pos.coords.longitude;
        } catch (err) {
          console.warn("Location denied, using default");
        }
      }

      const data = await findAgroServices(query || "Agrochemical dealers", lat, lng, lang);
      setResult(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto bg-white/95 dark:bg-gray-800/95 backdrop-blur rounded-2xl shadow-2xl overflow-hidden p-6 animate-slide-up min-h-[500px] border border-gray-200 dark:border-white/20">
      <div className="text-center mb-8">
        <div className="mx-auto w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center text-green-600 dark:text-green-400 mb-3">
          <MapPinIcon />
        </div>
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">{t.findTitle}</h2>
        <p className="text-gray-500 dark:text-gray-400">{t.findDesc}</p>
      </div>

      <form onSubmit={handleSearch} className="mb-8">
        <div className="flex gap-2">
          <input 
            type="text" 
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t.findPlaceholder}
            className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none text-gray-800 dark:text-white bg-white dark:bg-gray-700"
          />
          <button 
            type="submit" 
            disabled={loading}
            className="px-6 py-3 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700 transition-colors"
          >
            {loading ? t.searching : t.search}
          </button>
        </div>
      </form>

      {result && (
        <div className="space-y-6">
          <p className="text-gray-700 dark:text-gray-300">{result.text}</p>
          
          {result.places.length > 0 && (
            <div className="grid gap-3">
              {result.places.map((place, idx) => (
                <a 
                  key={idx} 
                  href={place.uri} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-xl hover:border-green-500 dark:hover:border-green-500 hover:bg-green-50 dark:hover:bg-green-900/30 transition-all group"
                >
                  <span className="font-medium text-gray-800 dark:text-gray-200 group-hover:text-green-800 dark:group-hover:text-green-300">{place.title}</span>
                  <MapPinIcon />
                </a>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MapFinder;