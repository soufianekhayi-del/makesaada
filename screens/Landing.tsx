import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ShieldAlert, Heart, Users, MapPin, Globe } from 'lucide-react';

interface LandingProps {
    onStart: () => void;
}

export const Landing: React.FC<LandingProps> = ({ onStart }) => {
    const { t, i18n } = useTranslation();

    const toggleLanguage = () => {
        const newLang = i18n.language === 'ar' ? 'fr' : (i18n.language === 'fr' ? 'en' : 'ar');
        i18n.changeLanguage(newLang);
        document.body.dir = newLang === 'ar' ? 'rtl' : 'ltr';
    };

    return (
        <div className="min-h-screen bg-white text-gray-900 font-sans">
            {/* Navbar */}
            <nav className="container mx-auto px-6 py-6 flex justify-between items-center relative z-20">
                <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold text-morocco-green">Tadamon</span>
                </div>

                <div className="flex items-center gap-4">
                    <button
                        onClick={toggleLanguage}
                        className="p-2 rounded-full hover:bg-gray-100 transition-colors flex items-center gap-1 text-sm font-bold text-gray-600"
                    >
                        <Globe size={18} />
                        <span className="uppercase">{i18n.language}</span>
                    </button>

                    <button onClick={() => onStart()} className="text-sm font-bold text-gray-600 hover:text-morocco-green px-4 py-2 hidden sm:block">
                        {t('landing.ctaLogin')}
                    </button>
                    <button onClick={() => onStart()} className="bg-morocco-charcoal text-white px-5 py-2.5 rounded-full font-bold text-sm hover:bg-gray-800 transition-colors shadow-lg">
                        {t('landing.ctaJourney')}
                    </button>
                </div>
            </nav>

            {/* Hero Section */}
            <main className="container mx-auto px-6 mt-8 md:mt-16 mb-24 relative">
                <div className="flex flex-col md:flex-row items-center gap-12 lg:gap-24">

                    {/* Text Content */}
                    <div className="flex-1 text-center md:text-start rtl:md:text-right ltr:md:text-left">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6 }}
                        >
                            <h1
                                className="text-4xl md:text-6xl lg:text-7xl font-bold leading-tight mb-6 text-gray-900"
                                dangerouslySetInnerHTML={{ __html: t('landing.title') }}
                            >
                            </h1>
                            <p className="text-lg md:text-xl text-gray-500 mb-8 leading-relaxed max-w-lg mx-auto md:mx-0">
                                {t('landing.subtitle')}
                            </p>

                            {/* Email Capture / CTA */}
                            <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                                <button
                                    onClick={() => onStart()}
                                    className="bg-morocco-green text-white text-lg font-bold py-4 px-8 rounded-full shadow-lg hover:bg-morocco-green/90 transition-all flex items-center justify-center gap-2"
                                >
                                    <span>{t('landing.ctaStart')}</span>
                                    <ArrowLeft size={20} className="rtl:rotate-0 ltr:rotate-180" />
                                </button>
                            </div>

                            {/* Trust / Community Indicators */}

                            {/* Alert Card */}
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.5, duration: 0.5 }}
                                className="mt-12 bg-[#FFF5F5] border-2 border-red-100 rounded-3xl p-6 md:p-8 text-start relative overflow-hidden max-w-xl mx-auto md:mx-0 shadow-sm hover:shadow-md transition-shadow"
                            >
                                <div className="absolute top-0 left-0 w-32 h-32 bg-red-100/50 rounded-full -ml-10 -mt-10 blur-2xl"></div>

                                <div className="relative z-10">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="bg-red-100 p-3 rounded-2xl">
                                            <ShieldAlert className="text-red-600" size={28} />
                                        </div>
                                    </div>

                                    <h3 className="text-2xl font-bold text-red-800 mb-2">{t('landing.disclaimerTitle')}</h3>
                                    <p className="text-red-700/80 font-medium text-lg leading-relaxed">
                                        {t('landing.disclaimerText')}
                                    </p>
                                    <p className="text-red-600 font-bold mt-2">
                                        {t('landing.disclaimerFree')}
                                    </p>
                                </div>
                            </motion.div>
                        </motion.div>
                    </div>

                    {/* Visuals / Floating Cards */}
                    <div className="flex-1 w-full max-w-lg relative hidden md:block">
                        <motion.div
                            initial={{ opacity: 0, x: 50 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.8, delay: 0.2 }}
                            className="relative z-10"
                        >
                            {/* Main Card Mockup */}
                            <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 p-6 relative z-10 transform rotate-2 hover:rotate-0 transition-transform duration-500">
                                <div className="flex justify-between items-center mb-6">
                                    <div className="flex flex-col">
                                        <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">{t('home.donationsNearby')}</span>
                                        <span className="text-2xl font-bold text-gray-800">{t('placeholders.foodTitle')}</span>
                                    </div>
                                    <div className="bg-morocco-green/10 p-3 rounded-full text-morocco-green">
                                        <Heart fill="currentColor" size={24} />
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="h-2 bg-gray-100 rounded-full w-full">
                                        <div className="h-2 bg-morocco-green rounded-full w-2/3"></div>
                                    </div>
                                    <div className="flex justify-between text-sm text-gray-500">
                                        <span>{t('home.radius', { distance: '0.5' })}</span>
                                    </div>

                                    <div className="flex gap-3 mt-6">
                                        <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center text-xl">🥘</div>
                                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-xl">👖</div>
                                        <div className="w-10 h-10 rounded-full bg-gray-100 text-gray-400 flex items-center justify-center text-xs font-bold">+5</div>
                                    </div>
                                </div>

                                {/* Floating Badge */}
                                <div className="absolute -left-6 top-10 bg-white p-4 rounded-2xl shadow-xl flex items-center gap-3 animate-bounce-slow">
                                    <div className="bg-green-100 p-2 rounded-full">
                                        <ShieldAlert className="text-green-600" size={20} />
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-400 font-bold">{t('status.AVAILABLE')}</p>
                                        <p className="text-sm font-bold text-green-600">100% Free</p>
                                    </div>
                                </div>
                            </div>

                            {/* Background Decor */}
                            <div className="absolute top-10 -right-10 w-full h-full bg-morocco-sand rounded-3xl -z-10 transform -rotate-3"></div>
                        </motion.div>
                    </div>
                </div >

                {/* Impact Statistics Section */}
                < div className="my-24 bg-gray-900 text-white rounded-3xl p-12 relative overflow-hidden" >
                    <div className="absolute inset-0 bg-pattern-geo opacity-10 pointer-events-none" />
                    <div className="relative z-10 grid md:grid-cols-3 gap-12 text-center">
                        <div>
                            <div className="text-4xl md:text-5xl font-bold text-morocco-green mb-2">3.2k</div>
                            <div className="text-lg text-gray-400 font-medium">{t('landing.statFood')}</div>
                        </div>
                        <div>
                            <div className="text-4xl md:text-5xl font-bold text-blue-400 mb-2">+15k</div>
                            <div className="text-lg text-gray-400 font-medium">{t('landing.statClothes')}</div>
                        </div>
                        <div>
                            <div className="text-4xl md:text-5xl font-bold text-yellow-400 mb-2">+2.4k</div>
                            <div className="text-lg text-gray-400 font-medium">{t('landing.statFamilies')}</div>
                        </div>
                    </div>
                </div >

                {/* Features Grid */}
                < div className="mt-24 grid md:grid-cols-2 gap-8 max-w-4xl mx-auto" >
                    {/* Feature 1 */}
                    < div className="p-8 rounded-3xl bg-gray-50 hover:bg-white hover:shadow-xl transition-all border border-transparent hover:border-gray-100" >
                        <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600 mb-6">
                            <Users size={24} />
                        </div>
                        <h3 className="text-xl font-bold mb-3">{t('landing.feature1Title')}</h3>
                        <p className="text-gray-500 leading-relaxed">
                            {t('landing.feature1Desc')}
                        </p>
                    </div >

                    {/* Feature 2 */}
                    < div className="p-8 rounded-3xl bg-gray-50 hover:bg-white hover:shadow-xl transition-all border border-transparent hover:border-gray-100" >
                        <div className="w-12 h-12 bg-morocco-green/10 rounded-xl flex items-center justify-center text-morocco-green mb-6">
                            <Heart size={24} />
                        </div>
                        <h3 className="text-xl font-bold mb-3">{t('landing.feature2Title')}</h3>
                        <p className="text-gray-500 leading-relaxed">
                            {t('landing.feature2Desc')}
                        </p>
                    </div >
                </div >

            </main >

            {/* Simple Footer */}
            < footer className="border-t border-gray-100 py-12 text-center bg-gray-50" >
                <p className="text-gray-400 text-sm">{t('landing.footer')}</p>
            </footer >
        </div >
    );
};

