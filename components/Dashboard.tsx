import React, { useState, useEffect } from 'react';
import { UserProfile, Language } from '../types';
import { UserIcon, MapPinIcon, CheckCircleIcon } from './Icons';
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

  useEffect(() => {
    const savedProfile = localStorage.getItem('agroGuardProfile');
    if (savedProfile) {
      setProfile(JSON.parse(savedProfile));
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProfile(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setSaved(false);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('agroGuardProfile', JSON.stringify(profile));
    setSaved(true);
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

  return (
    <div className="w-full max-w-3xl mx-auto bg-white/95 backdrop-blur rounded-2xl shadow-2xl overflow-hidden animate-slide-up">
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
                value={profile.farmSize}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#667eea] focus:outline-none text-gray-800"
                placeholder="e.g. 5 Hectares"
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
  );
};

export default Dashboard;