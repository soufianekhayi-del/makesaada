import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Heart, HandHeart, ShieldCheck, Eye, EyeOff, MapPin } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { UserRole } from '../types';
import { api } from '../services/api';

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
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    password: '',
    city: 'GPS Location',
    latitude: 0,
    longitude: 0
  });

  const requestLocation = () => {
    setLocError(false);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData(prev => ({
            ...prev,
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          }));
        },
        (error) => {
          console.error("Location error:", error);
          setLocError(true);
          alert("GPS Permission Denied. Please enable location services in your browser settings to continue.");
        }
      );
    } else {
      setLocError(true);
      alert("Geolocation is not supported by this browser.");
    }
  };

  React.useEffect(() => {
    if (step === 3 && !isLoginMode) {
      requestLocation();
    }
  }, [step, isLoginMode]);

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
          longitude: formData.longitude
        });
      }

      if (res && res.user) {
        onComplete(res.user);
      }
    } catch (error: any) {
      console.error(error);
      alert(error.message || (isLoginMode ? 'Login failed' : 'Registration failed'));
    } finally {
      setLoading(false);
    }
  };



  // Login Form View
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

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('onboarding_new.location_required')}
              </label>

              <div className={`p-3 rounded-xl border flex items-center justify-between ${formData.latitude !== 0 ? 'border-morocco-green bg-morocco-green/5' : 'border-red-200 bg-red-50'
                }`}>
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-full ${formData.latitude !== 0 ? 'bg-morocco-green text-white' : 'bg-red-100 text-red-500'
                    }`}>
                    <MapPin size={20} />
                  </div>
                  <div>
                    <p className={`text-sm font-bold ${formData.latitude !== 0 ? 'text-morocco-green' : 'text-red-500'
                      }`}>
                      {formData.latitude !== 0
                        ? t('onboarding_new.location_found')
                        : t('onboarding_new.location_needed')
                      }
                    </p>
                    <p className="text-xs text-gray-500">
                      {formData.latitude !== 0
                        ? t('onboarding_new.ready_match')
                        : t('onboarding_new.enable_gps')
                      }
                    </p>
                  </div>
                </div>

                {formData.latitude === 0 && (
                  <button
                    onClick={requestLocation}
                    className="text-xs font-bold bg-white border border-gray-200 px-3 py-2 rounded-lg hover:bg-gray-50 shadow-sm"
                  >
                    {t('onboarding_new.try_again')}
                  </button>
                )}
              </div>
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