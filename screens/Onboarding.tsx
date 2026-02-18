import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Heart, HandHeart, ShieldCheck, Eye, EyeOff, MapPin, Building2, ChevronDown } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { UserRole } from '../types';
import { api } from '../services/api';
import { MOROCCAN_CITIES } from '../constants/cities';

interface OnboardingProps {
  onComplete: (user: any) => void;
}

export const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
  const { t } = useTranslation();
  const [step, setStep] = useState<number>(1);
  const [role, setRole] = useState<UserRole>(null);
  const [loading, setLoading] = useState(false);
  const [isLoginMode, setIsLoginMode] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [locError, setLocError] = useState(false);
  const [locationMode, setLocationMode] = useState<'GPS' | 'CITY' | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    password: '',
    city: '',
    latitude: 0,
    longitude: 0,
    locationMode: 'GPS' // Default for backend, but UI will override
  });

  const requestLocation = () => {
    setLocError(false);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData(prev => ({
            ...prev,
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            city: 'GPS Location',
            locationMode: 'GPS'
          }));
          setLocationMode('GPS');
        },
        (error) => {
          console.error("Location error:", error);
          setLocError(true);
          // Don't alert immediately, just show error state in UI
        }
      );
    } else {
      setLocError(true);
      alert("Geolocation is not supported by this browser.");
    }
  };

  const handleCitySelect = (cityName: string) => {
    const cityData = MOROCCAN_CITIES.find(c => c.name === cityName);
    if (cityData) {
      setFormData(prev => ({
        ...prev,
        city: cityData.name,
        latitude: cityData.lat,
        longitude: cityData.lng,
        locationMode: 'CITY'
      }));
      setLocationMode('CITY');
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
    exit: { opacity: 0, x: -20 }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  const handleRoleSelect = (selectedRole: UserRole) => {
    setRole(selectedRole);
    setStep(2);
  };

  const handleAuth = async () => {
    try {
      setLoading(true);
      let res;

      if (isLoginMode) {
        // Login: only username and password
        res = await api.auth.login({
          username: formData.username,
          password: formData.password
        });
      } else {
        // Register: full profile
        res = await api.auth.register({
          name: formData.name,
          username: formData.username,
          password: formData.password,
          role,
          city: formData.city,
          latitude: formData.latitude,
          longitude: formData.longitude,
          // We might need to pass locationMode to backend if supported, 
          // but for now latitude/longitude is enough to place them.
        });
      }

      if (res && res.user) {
        // If user registered with CITY mode, we might want to store that preference
        // locally or ensuring backend returns it used for App.tsx state.
        // For now, onComplete passes the user object.
        const userWithMode = { ...res.user, locationMode: locationMode || 'GPS' };
        onComplete(userWithMode);
      }
    } catch (error: any) {
      console.error(error);
      alert(error.message || (isLoginMode ? 'Login failed' : 'Registration failed'));
    } finally {
      setLoading(false);
    }
  };

  // Login Form View
  if (isLoginMode) {
    return (
      <div className="h-full flex flex-col justify-center px-6">
        <motion.div
          key="login"
          className="flex-1 flex flex-col justify-center space-y-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-morocco-green rounded-2xl mx-auto flex items-center justify-center mb-6 shadow-xl shadow-morocco-green/20">
              <Heart className="text-morocco-sand" size={32} fill="currentColor" />
            </div>
            <h2 className="text-2xl font-bold text-morocco-green">{t('onboarding.login')}</h2>
            <p className="text-gray-500">Welcome back to Tadamon</p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('onboarding.username')}</label>
              <input
                type="text"
                autoCapitalize="none"
                className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-morocco-green focus:outline-none"
                value={formData.username}
                onChange={e => setFormData({ ...formData, username: e.target.value })}
                placeholder={t('onboarding.usernamePlaceholder')}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('onboarding.passwordPlaceholder')}</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-morocco-green focus:outline-none"
                  value={formData.password}
                  onChange={e => setFormData({ ...formData, password: e.target.value })}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>
          </div>

          <div className="pt-8">
            <Button fullWidth onClick={handleAuth} disabled={loading || !formData.username || !formData.password}>
              {loading ? t('common.loading') : t('onboarding.login')}
            </Button>
            <button
              onClick={() => { setIsLoginMode(false); setStep(1); }}
              className="w-full text-center py-4 text-sm text-gray-500 mt-4"
            >
              {t('onboarding.noAccount')} <span className="font-bold text-morocco-green">{t('onboarding.register')}</span>
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  // Registration Flow
  return (
    <div className="h-full flex flex-col justify-center px-6 pt-10">
      {step === 1 && (
        <motion.div
          key="step1"
          className="flex-1 flex flex-col justify-center space-y-8"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
        >
          <motion.div variants={itemVariants} className="text-center space-y-2">
            <div className="w-16 h-16 bg-morocco-green rounded-2xl mx-auto flex items-center justify-center mb-6 shadow-xl shadow-morocco-green/20">
              <Heart className="text-morocco-sand" size={32} fill="currentColor" />
            </div>
            <h1 className="text-3xl font-bold text-morocco-green">{t('onboarding.welcome')}</h1>
            <p className="text-morocco-charcoal/70">{t('onboarding.subtitle')}</p>
          </motion.div>

          <motion.div variants={itemVariants} className="space-y-4">
            <h2 className="text-xl font-semibold text-center mb-6">{t('onboarding_new.participation_question')}</h2>

            <button
              onClick={() => handleRoleSelect('GIVER')}
              className="w-full bg-white p-6 rounded-2xl shadow-sm border-2 border-transparent hover:border-morocco-green transition-all group flex items-center gap-4 text-left"
            >
              <div className="bg-morocco-sand p-3 rounded-full group-hover:bg-morocco-green/10 transition-colors">
                <Heart className="text-morocco-green" size={24} />
              </div>
              <div>
                <h3 className="font-bold text-morocco-charcoal">{t('onboarding.giver')}</h3>
                <p className="text-sm text-gray-500">{t('onboarding_new.giver_desc')}</p>
              </div>
            </button>

            <button
              onClick={() => handleRoleSelect('RECEIVER')}
              className="w-full bg-white p-6 rounded-2xl shadow-sm border-2 border-transparent hover:border-morocco-terracotta transition-all group flex items-center gap-4 text-left"
            >
              <div className="bg-morocco-sand p-3 rounded-full group-hover:bg-morocco-terracotta/10 transition-colors">
                <HandHeart className="text-morocco-terracotta" size={24} />
              </div>
              <div>
                <h3 className="font-bold text-morocco-charcoal">{t('onboarding.receiver')}</h3>
                <p className="text-sm text-gray-500">{t('onboarding_new.receiver_desc')}</p>
              </div>
            </button>
          </motion.div>

          <motion.div variants={itemVariants} className="mt-auto space-y-3">
            <button
              onClick={() => setIsLoginMode(true)}
              className="w-full text-center py-4 text-sm text-gray-500"
            >
              {t('onboarding.haveAccount')} <span className="font-bold text-morocco-green">{t('onboarding.login')}</span>
            </button>
          </motion.div>
        </motion.div>
      )}

      {step === 2 && (
        <motion.div
          className="flex-1 flex flex-col justify-center space-y-8"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <div className="text-center space-y-6">
            <div className="w-20 h-20 bg-morocco-sandDark rounded-full mx-auto flex items-center justify-center">
              <ShieldCheck className="text-morocco-green" size={40} />
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-morocco-green">{t('onboarding_new.dignity_title')}</h2>
              <p
                className="text-gray-600 leading-relaxed max-w-xs mx-auto"
                dangerouslySetInnerHTML={{ __html: t('onboarding_new.dignity_desc') }}
              >
              </p>
            </div>

            <div className="bg-white/60 p-4 rounded-xl text-sm text-left space-y-2 max-w-xs mx-auto">
              <div className="flex gap-2">
                <span className="text-morocco-green font-bold">✓</span>
                <span>{t('onboarding_new.dignity_point1')}</span>
              </div>
              <div className="flex gap-2">
                <span className="text-morocco-green font-bold">✓</span>
                <span>{t('onboarding_new.dignity_point2')}</span>
              </div>
              <div className="flex gap-2">
                <span className="text-morocco-green font-bold">✓</span>
                <span>{t('onboarding_new.dignity_point3')}</span>
              </div>
            </div>
          </div>

          <div className="mt-auto">
            <Button fullWidth onClick={() => setStep(3)}>
              {t('onboarding.continue')}
            </Button>
            <button
              onClick={() => setStep(1)}
              className="w-full text-center py-4 text-sm text-gray-400"
            >
              {t('common.back')}
            </button>
          </div>
        </motion.div>
      )}

      {step === 3 && (
        <motion.div
          className="flex-1 flex flex-col justify-center space-y-4"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <div className="text-center mb-2">
            <h2 className="text-2xl font-bold text-morocco-green">{t('onboarding_new.create_profile')}</h2>
            <p className="text-gray-500">{t('onboarding_new.connect_neighbors')}</p>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('onboarding_new.fullname_label')}</label>
              <input
                type="text"
                className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-morocco-green focus:outline-none"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Karima Benali"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('onboarding_new.username_label')}</label>
              <input
                type="text"
                autoCapitalize="none"
                className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-morocco-green focus:outline-none"
                value={formData.username}
                onChange={e => setFormData({ ...formData, username: e.target.value })}
                placeholder="e.g. karima123"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('onboarding.passwordPlaceholder')}</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-morocco-green focus:outline-none"
                  value={formData.password}
                  onChange={e => setFormData({ ...formData, password: e.target.value })}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {/* Location Selection Section */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('onboarding_new.location_required')}
              </label>

              {/* Toggle / Tabs */}
              <div className="flex gap-2 mb-2">
                <button
                  onClick={requestLocation}
                  className={`flex-1 p-3 rounded-xl border text-sm font-medium transition-all flex items-center justify-center gap-2 ${locationMode === 'GPS'
                    ? 'border-morocco-green bg-morocco-green/10 text-morocco-green'
                    : 'border-gray-200 text-gray-500 hover:bg-gray-50'
                    }`}
                >
                  <MapPin size={18} />
                  GPS Location
                </button>
                <button
                  onClick={() => {
                    setLocationMode('CITY');
                    setFormData(prev => ({
                      ...prev,
                      latitude: 0, // Reset until city selected
                      city: '',
                      locationMode: 'CITY'
                    }));
                  }}
                  className={`flex-1 p-3 rounded-xl border text-sm font-medium transition-all flex items-center justify-center gap-2 ${locationMode === 'CITY'
                    ? 'border-morocco-green bg-morocco-green/10 text-morocco-green'
                    : 'border-gray-200 text-gray-500 hover:bg-gray-50'
                    }`}
                >
                  <Building2 size={18} />
                  Select City
                </button>
              </div>

              {/* GPS Status */}
              {locationMode === 'GPS' && (
                <div className={`p-3 rounded-xl border flex items-center justify-between ${formData.latitude !== 0 ? 'border-morocco-green bg-morocco-green/5' : 'border-gray-200 bg-gray-50'
                  }`}>
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-full ${formData.latitude !== 0 ? 'bg-morocco-green text-white' : 'bg-gray-200 text-gray-500'
                      }`}>
                      <MapPin size={20} />
                    </div>
                    <div>
                      <p className={`text-sm font-bold ${formData.latitude !== 0 ? 'text-morocco-green' : 'text-gray-500'
                        }`}>
                        {formData.latitude !== 0
                          ? t('onboarding_new.location_found')
                          : t('onboarding_new.location_needed')
                        }
                      </p>
                      {formData.latitude === 0 && (
                        <p className="text-xs text-gray-500">
                          Tap 'GPS Location' again to retry
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* City Dropdown */}
              {locationMode === 'CITY' && (
                <div className="relative">
                  <select
                    className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-morocco-green focus:outline-none appearance-none bg-white"
                    onChange={(e) => handleCitySelect(e.target.value)}
                    value={formData.city === 'GPS Location' ? '' : formData.city}
                  >
                    <option value="">Choose your city...</option>
                    {MOROCCAN_CITIES.sort((a, b) => a.name.localeCompare(b.name)).map(city => (
                      <option key={city.name} value={city.name}>
                        {city.name}
                      </option>
                    ))}
                  </select>
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                    <ChevronDown size={20} />
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="mt-auto pt-4">
            <Button fullWidth onClick={handleAuth} disabled={loading || !formData.name || !formData.username || !formData.password || formData.latitude === 0}>
              {loading ? t('common.loading') : t('onboarding_new.start')}
            </Button>
            <button
              onClick={() => setStep(2)}
              className="w-full text-center py-4 text-sm text-gray-400"
            >
              {t('common.back')}
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
};