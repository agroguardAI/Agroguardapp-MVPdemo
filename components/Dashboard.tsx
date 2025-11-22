
import React, { useState, useEffect } from 'react';
import { UserProfile, Language } from '../types';
import { 
  UserIcon, MapPinIcon, CheckCircleIcon, SunIcon, CloudRainIcon, 
  TrendingUpIcon, CalendarIcon, CoinsIcon, DropletsIcon, WindIcon, EditIcon 
} from './Icons';
import { translations } from '../translations';

interface Props {
  lang: Language;
}

const Dashboard: React.FC<Props> = ({ lang }) => {
  const t = translations[lang];
  const [profile, setProfile] = useState<UserProfile>({
    name: '',
    phone: '',
    address: '',
    farmLocation: '',
    farmSize: '',
    crops: ''
  });
  const [saved, setSaved] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Placeholder Logic
  const [yieldData, setYieldData] = useState({ tons: 12.5, revenue: 5625000 });
  const [marketRates, setMarketRates] = useState<{crop: string, price: string, trend: 'up' | 'down'}[]>([]);
  const [weather, setWeather] = useState({ temp: 28, condition: 'Sunny', rain: 10 });

  useEffect(() => {
    const savedProfile = localStorage.getItem('agroGuardProfile');
    if (savedProfile) {
      const p = JSON.parse(savedProfile);
      setProfile(p);
      updateInsights(p);
    } else {
      // Initialize with demo data if no profile
      updateInsights(profile);
      setIsEditing(true);
    }
  }, []);

  const updateInsights = (p: UserProfile) => {
    // 1. Calculate Yield (Rough placeholder logic or Demo values)
    const size = parseFloat(p.farmSize) || 5; // Default 5 hectares for demo
    const estYield = size * 2.5; 
    const estRev = estYield * 450000; 

    setYieldData({
      tons: parseFloat(estYield.toFixed(1)),
      revenue: estRev
    });

    // 2. Parse Crops for Market Prices
    const cropsList = p.crops ? p.crops.split(',').map(c => c.trim()).filter(c => c.length > 0) : ['Maize', 'Cassava', 'Yam'];
    
    const mockPrices = cropsList.map(c => ({
      crop: c,
      price: "₦" + (Math.floor(Math.random() * 200) + 300) + ",000/T",
      trend: Math.random() > 0.5 ? 'up' as const : 'down' as const
    }));
    setMarketRates(mockPrices);

    // 3. Simulate weather
    setWeather({
      temp: Math.floor(Math.random() * 10) + 25,
      condition: Math.random() > 0.7 ? 'Rainy' : 'Sunny',
      rain: Math.floor(Math.random() * 80)
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProfile(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setSaved(false);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('agroGuardProfile', JSON.stringify(profile));
    setSaved(true);
    setIsEditing(false);
    updateInsights(profile);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleGeolocation = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const loc = `${position.coords.latitude.toFixed(4)}, ${position.coords.longitude.toFixed(4)}`;
          setProfile(prev => ({ ...prev, farmLocation: loc }));
        },
        () => alert("Could not get location")
      );
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 }).format(amount);
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6 animate-slide-up pb-20">
      
      {/* Welcome Header */}
      <div className="flex items-center justify-between bg-white dark:bg-white/10 backdrop-blur p-6 rounded-2xl border border-gray-200 dark:border-white/10 text-gray-800 dark:text-white shadow-sm dark:shadow-none">
        <div>
          <h1 className="text-3xl font-bold">{profile.name ? `${t.welcomeFarmer}, ${profile.name}` : t.welcomeFarmer}</h1>
          <p className="text-gray-600 dark:text-gray-300">{t.dashboardOverview}</p>
        </div>
        <button 
          onClick={() => setIsEditing(!isEditing)}
          className="p-3 bg-gray-100 dark:bg-white/20 hover:bg-gray-200 dark:hover:bg-white/30 rounded-full transition-colors"
        >
          <UserIcon />
        </button>
      </div>

      {/* Profile Alert */}
      {!profile.name && (
        <div className="bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-700 p-4 rounded-xl flex items-center gap-3 text-yellow-800 dark:text-yellow-200">
          <div className="p-2 bg-yellow-100 dark:bg-yellow-800 rounded-full"><EditIcon /></div>
          <p className="text-sm font-medium">{t.completeProfileMsg}</p>
        </div>
      )}

      {/* Farm Intelligence Dashboard (Always Visible with Demo Data) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* Weather Card */}
        <div className="bg-gradient-to-br from-blue-500 to-blue-700 rounded-2xl shadow-xl p-6 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-20">
            <CloudRainIcon />
          </div>
          <h3 className="text-lg font-medium opacity-90 mb-4">{t.weatherForecast}</h3>
          <div className="flex items-center gap-4 mb-6">
            <div className="text-5xl font-bold">{weather.temp}°C</div>
            <div className="text-sm font-medium bg-white/20 px-3 py-1 rounded-full">{weather.condition}</div>
          </div>
          <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2"><DropletsIcon /> {t.humidity}</span>
                <span>65%</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2"><WindIcon /> {t.windSpeed}</span>
                <span>12 km/h</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2"><CloudRainIcon /> {t.rainChance}</span>
                <div className="w-24 h-2 bg-white/30 rounded-full overflow-hidden">
                  <div className="h-full bg-white" style={{width: `${weather.rain}%`}}></div>
                </div>
              </div>
          </div>
        </div>

        {/* Yield Estimator */}
        <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur rounded-2xl shadow-xl p-6 border border-gray-200 dark:border-white/20">
            <div className="flex items-center gap-2 text-green-700 dark:text-green-400 mb-4">
              <CoinsIcon />
              <h3 className="font-bold text-lg">{t.yieldProjection}</h3>
            </div>
            
            <div className="space-y-6">
              <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-100 dark:border-green-800">
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">{t.expectedYield}</p>
                <p className="text-3xl font-bold text-green-800 dark:text-green-300">{yieldData.tons} Tons</p>
              </div>
              <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl border border-yellow-100 dark:border-yellow-800">
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">{t.estRevenue}</p>
                <p className="text-2xl font-bold text-yellow-800 dark:text-yellow-300 truncate">{formatCurrency(yieldData.revenue)}</p>
              </div>
            </div>
        </div>

        {/* Market Prices */}
        <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur rounded-2xl shadow-xl p-6 border border-gray-200 dark:border-white/20 lg:col-span-1">
          <div className="flex items-center gap-2 text-[#667eea] mb-4">
            <TrendingUpIcon />
            <h3 className="font-bold text-lg">{t.marketPrices}</h3>
          </div>
          <div className="space-y-3">
            {marketRates.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors border-b border-gray-100 dark:border-gray-700 last:border-0">
                <span className="font-medium text-gray-700 dark:text-gray-200 capitalize">{item.crop}</span>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-gray-900 dark:text-white">{item.price}</span>
                  {item.trend === 'up' ? (
                    <span className="text-green-500 text-xs">▲</span>
                  ) : (
                    <span className="text-red-500 text-xs">▼</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

          {/* Farming Calendar */}
        <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur rounded-2xl shadow-xl p-6 border border-gray-200 dark:border-white/20 md:col-span-2 lg:col-span-3">
            <div className="flex items-center gap-2 text-orange-600 dark:text-orange-400 mb-4">
              <CalendarIcon />
              <h3 className="font-bold text-lg">{t.farmingCalendar}</h3>
            </div>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-700 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-green-500"></div>
                <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider font-semibold mb-1">This Week</p>
                <p className="font-bold text-gray-800 dark:text-white">Apply NPK Fertilizer</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">Based on crop stage</p>
              </div>
              <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-700 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-yellow-500"></div>
                <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider font-semibold mb-1">Next Week</p>
                <p className="font-bold text-gray-800 dark:text-white">Scout for Stem Borers</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">High risk due to recent rain</p>
              </div>
              <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-700 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
                <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider font-semibold mb-1">Next Month</p>
                <p className="font-bold text-gray-800 dark:text-white">Prepare Storage Silos</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">Harvest approaching</p>
              </div>
            </div>
        </div>

      </div>

      {/* Profile Edit Section (Collapsible) */}
      {isEditing && (
        <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur rounded-2xl shadow-xl overflow-hidden animate-fade-in border border-gray-200 dark:border-white/20">
          <div className="p-6 bg-gray-800 dark:bg-gray-900 text-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <UserIcon />
              <h2 className="text-xl font-bold">{t.profileTitle}</h2>
            </div>
            <button onClick={() => setIsEditing(false)} className="text-gray-400 hover:text-white">✕</button>
          </div>

          <form onSubmit={handleSave} className="p-8 space-y-8">
            {/* Personal Info */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 border-b border-gray-200 dark:border-gray-700 pb-2">{t.personalInfo}</h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-400">{t.nameLabel}</label>
                  <input
                    name="name"
                    value={profile.name}
                    onChange={handleChange}
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-[#667eea] focus:outline-none text-gray-800 dark:text-white bg-white dark:bg-gray-700"
                    placeholder="e.g. Musa Ibrahim"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-400">{t.phoneLabel}</label>
                  <input
                    name="phone"
                    value={profile.phone}
                    onChange={handleChange}
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-[#667eea] focus:outline-none text-gray-800 dark:text-white bg-white dark:bg-gray-700"
                    placeholder="e.g. +234..."
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-400">{t.addressLabel}</label>
                  <input
                    name="address"
                    value={profile.address}
                    onChange={handleChange}
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-[#667eea] focus:outline-none text-gray-800 dark:text-white bg-white dark:bg-gray-700"
                  />
                </div>
              </div>
            </div>

            {/* Farm Info */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 border-b border-gray-200 dark:border-gray-700 pb-2">{t.farmDetails}</h3>
              <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-400">{t.farmLocLabel}</label>
                  <div className="flex gap-2">
                    <input
                      name="farmLocation"
                      value={profile.farmLocation}
                      onChange={handleChange}
                      className="flex-1 p-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-[#667eea] focus:outline-none text-gray-800 dark:text-white bg-white dark:bg-gray-700"
                    />
                    <button 
                      type="button"
                      onClick={handleGeolocation}
                      className="p-3 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-300 rounded-xl transition-colors"
                      title={t.useCurrentLoc}
                    >
                      <MapPinIcon />
                    </button>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-400">{t.farmSizeLabel}</label>
                  <input
                    name="farmSize"
                    type="number"
                    value={profile.farmSize}
                    onChange={handleChange}
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-[#667eea] focus:outline-none text-gray-800 dark:text-white bg-white dark:bg-gray-700"
                    placeholder="e.g. 5"
                  />
                </div>
                  <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-400">{t.cropsLabel}</label>
                  <input
                    name="crops"
                    value={profile.crops}
                    onChange={handleChange}
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-[#667eea] focus:outline-none text-gray-800 dark:text-white bg-white dark:bg-gray-700"
                    placeholder="e.g. Maize, Cassava, Yams"
                  />
                </div>
              </div>
            </div>

            <button 
              type="submit"
              className="w-full py-4 bg-[#667eea] hover:bg-[#5a67d8] text-white text-lg font-bold rounded-xl shadow-lg transition-transform active:scale-95 flex items-center justify-center gap-2"
            >
              {saved ? <CheckCircleIcon /> : null}
              {saved ? t.profileSaved : t.saveProfile}
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default Dashboard;