import React, { useState, useEffect } from 'react';
import { UserProfile, Language } from '../types';
import { 
  UserIcon, MapPinIcon, CheckCircleIcon, SunIcon, CloudRainIcon, 
  TrendingUpIcon, CalendarIcon, CoinsIcon, DropletsIcon, WindIcon 
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

  // Placeholder Logic derived from profile
  const [yieldData, setYieldData] = useState({ tons: 0, revenue: 0 });
  const [marketRates, setMarketRates] = useState<{crop: string, price: string, trend: 'up' | 'down'}[]>([]);
  const [weather, setWeather] = useState({ temp: 28, condition: 'Sunny', rain: 10 });

  useEffect(() => {
    const savedProfile = localStorage.getItem('agroGuardProfile');
    if (savedProfile) {
      const p = JSON.parse(savedProfile);
      setProfile(p);
      updateInsights(p);
    }
  }, []);

  const updateInsights = (p: UserProfile) => {
    // 1. Calculate Yield (Rough placeholder logic)
    const size = parseFloat(p.farmSize) || 0;
    // Assume 2.5 tons per hectare average for generic crops
    const estYield = size * 2.5; 
    const estRev = estYield * 450000; // 450k Naira per ton approx

    setYieldData({
      tons: parseFloat(estYield.toFixed(1)),
      revenue: estRev
    });

    // 2. Parse Crops for Market Prices
    const cropsList = p.crops.split(',').map(c => c.trim()).filter(c => c.length > 0);
    const mockPrices = cropsList.length > 0 ? cropsList.map(c => ({
      crop: c,
      price: "₦" + (Math.floor(Math.random() * 500) + 300) + ",000/T",
      trend: Math.random() > 0.5 ? 'up' as const : 'down' as const
    })) : [
      { crop: "Maize", price: "₦450,000/T", trend: 'up' as const },
      { crop: "Rice", price: "₦800,000/T", trend: 'down' as const },
      { crop: "Soybeans", price: "₦520,000/T", trend: 'up' as const }
    ];
    setMarketRates(mockPrices);

    // 3. Simulate weather based on location (randomized for demo)
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
    <div className="w-full max-w-5xl mx-auto space-y-8 animate-slide-up">
      
      {/* 1. Profile Section */}
      <div className="bg-white/95 backdrop-blur rounded-2xl shadow-xl overflow-hidden">
        <div className="p-6 bg-[#667eea] text-white flex items-center gap-3">
          <div className="p-2 bg-white/20 rounded-full">
            <UserIcon />
          </div>
          <h2 className="text-2xl font-bold">{t.profileTitle}</h2>
        </div>

        <form onSubmit={handleSave} className="p-8 space-y-8">
          {/* Personal Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2">{t.personalInfo}</h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-600">{t.nameLabel}</label>
                <input
                  name="name"
                  value={profile.name}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#667eea] focus:outline-none text-gray-800"
                  placeholder="e.g. Musa Ibrahim"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-600">{t.phoneLabel}</label>
                <input
                  name="phone"
                  value={profile.phone}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#667eea] focus:outline-none text-gray-800"
                  placeholder="e.g. +234..."
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-medium text-gray-600">{t.addressLabel}</label>
                <input
                  name="address"
                  value={profile.address}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#667eea] focus:outline-none text-gray-800"
                />
              </div>
            </div>
          </div>

          {/* Farm Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2">{t.farmDetails}</h3>
            <div className="grid md:grid-cols-2 gap-6">
               <div className="space-y-2">
                <label className="text-sm font-medium text-gray-600">{t.farmLocLabel}</label>
                <div className="flex gap-2">
                  <input
                    name="farmLocation"
                    value={profile.farmLocation}
                    onChange={handleChange}
                    className="flex-1 p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#667eea] focus:outline-none text-gray-800"
                  />
                  <button 
                    type="button"
                    onClick={handleGeolocation}
                    className="p-3 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-xl transition-colors"
                    title={t.useCurrentLoc}
                  >
                    <MapPinIcon />
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-600">{t.farmSizeLabel}</label>
                <input
                  name="farmSize"
                  type="number"
                  value={profile.farmSize}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#667eea] focus:outline-none text-gray-800"
                  placeholder="e.g. 5"
                />
              </div>
               <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-medium text-gray-600">{t.cropsLabel}</label>
                <input
                  name="crops"
                  value={profile.crops}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#667eea] focus:outline-none text-gray-800"
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

      {/* 2. Farm Intelligence Dashboard (Only Visible if Profile exists) */}
      {profile.name && (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <TrendingUpIcon /> {t.farmInsights}
          </h2>

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
            <div className="bg-white/95 backdrop-blur rounded-2xl shadow-xl p-6">
               <div className="flex items-center gap-2 text-green-700 mb-4">
                 <CoinsIcon />
                 <h3 className="font-bold text-lg">{t.yieldProjection}</h3>
               </div>
               
               <div className="space-y-6">
                 <div className="p-4 bg-green-50 rounded-xl border border-green-100">
                    <p className="text-sm text-gray-500 mb-1">{t.expectedYield}</p>
                    <p className="text-3xl font-bold text-green-800">{yieldData.tons} Tons</p>
                 </div>
                 <div className="p-4 bg-yellow-50 rounded-xl border border-yellow-100">
                    <p className="text-sm text-gray-500 mb-1">{t.estRevenue}</p>
                    <p className="text-2xl font-bold text-yellow-800 truncate">{formatCurrency(yieldData.revenue)}</p>
                 </div>
               </div>
            </div>

            {/* Market Prices */}
            <div className="bg-white/95 backdrop-blur rounded-2xl shadow-xl p-6 lg:col-span-1">
              <div className="flex items-center gap-2 text-[#667eea] mb-4">
                <TrendingUpIcon />
                <h3 className="font-bold text-lg">{t.marketPrices}</h3>
              </div>
              <div className="space-y-3">
                {marketRates.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors border-b border-gray-100 last:border-0">
                    <span className="font-medium text-gray-700 capitalize">{item.crop}</span>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-gray-900">{item.price}</span>
                      {item.trend === 'up' ? (
                        <span className="text-green-500 text-xs">▲</span>
                      ) : (
                        <span className="text-red-500 text-xs">▼</span>
                      )}
                    </div>
                  </div>
                ))}
                {marketRates.length === 0 && (
                  <p className="text-sm text-gray-400 text-center py-4">Add crops to see prices</p>
                )}
              </div>
            </div>

             {/* Farming Calendar */}
            <div className="bg-white/95 backdrop-blur rounded-2xl shadow-xl p-6 md:col-span-2 lg:col-span-3">
               <div className="flex items-center gap-2 text-orange-600 mb-4">
                 <CalendarIcon />
                 <h3 className="font-bold text-lg">{t.farmingCalendar}</h3>
               </div>
               <div className="grid md:grid-cols-3 gap-4">
                 <div className="p-4 border border-gray-200 rounded-xl bg-white relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1 h-full bg-green-500"></div>
                    <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1">This Week</p>
                    <p className="font-bold text-gray-800">Apply NPK Fertilizer</p>
                    <p className="text-xs text-gray-500 mt-2">Based on crop stage (Maize)</p>
                 </div>
                 <div className="p-4 border border-gray-200 rounded-xl bg-white relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1 h-full bg-yellow-500"></div>
                    <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1">Next Week</p>
                    <p className="font-bold text-gray-800">Scout for Stem Borers</p>
                    <p className="text-xs text-gray-500 mt-2">High risk due to recent rain</p>
                 </div>
                  <div className="p-4 border border-gray-200 rounded-xl bg-white relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
                    <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1">Next Month</p>
                    <p className="font-bold text-gray-800">Prepare Storage Silos</p>
                    <p className="text-xs text-gray-500 mt-2">Harvest approaching</p>
                 </div>
               </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;