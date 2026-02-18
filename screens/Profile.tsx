import React from 'react';
import { useTranslation } from 'react-i18next';
import { Star, Package, Shirt, Settings, LogOut, Globe } from 'lucide-react'; // Added Globe icon

import { Item, User } from '../types';

import { api } from '../services/api';

interface ProfileProps {
    currentUser: User | null;
    items: Item[];
    onUpdateUser: (user: User) => void;
    onLogout: () => void;
}

export const Profile: React.FC<ProfileProps> = ({ currentUser, items, onUpdateUser, onLogout }) => {
    const { t, i18n } = useTranslation();
    const [viewMode, setViewMode] = React.useState<'STATS' | 'MEALS' | 'ITEMS'>('STATS');
    const [switching, setSwitching] = React.useState(false);

    React.useEffect(() => {
        // Global RTL handled in App.tsx
    }, []);

    const changeLanguage = (lng: string) => {
        i18n.changeLanguage(lng);
    };

    const handleSwitchRole = async () => {
        if (!currentUser) return;
        setSwitching(true);
        try {
            const newRole = currentUser.role === 'GIVER' ? 'RECEIVER' : 'GIVER';
            const updated = await api.users.updateMe({ role: newRole });
            onUpdateUser(updated);
        } catch (error) {
            console.error(error);
            alert("Failed to switch role");
        } finally {
            setSwitching(false);
        }
    }

    if (!currentUser) return null;

    // Filter my items
    const myItems = items.filter(i => i.userId === currentUser.id);

    // Calculate stats
    // "Meals Shared" = Offers of Food
    const mealsShared = myItems.filter(i => i.kind === 'OFFER' && i.type === 'FOOD');
    // "Items Donated" = Offers of Clothes (or anything else)
    const itemsDonated = myItems.filter(i => i.kind === 'OFFER' && i.type === 'CLOTHES');

    const historyList = viewMode === 'MEALS' ? mealsShared : itemsDonated;
    const historyTitle = viewMode === 'MEALS' ? t('profile.mealsShared') : t('profile.itemsDonated');

    return (
        <div className="pt-6 px-6 h-full overflow-y-auto no-scrollbar pb-24">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-2xl font-bold text-morocco-green">{t('profile.title')}</h1>
                <button className="text-gray-400 hover:text-morocco-charcoal"><Settings size={20} /></button>
            </div>

            <div className="flex flex-col items-center mb-8">
                <div className="w-24 h-24 bg-gradient-to-br from-morocco-sand to-morocco-sandDark rounded-full flex items-center justify-center text-4xl mb-4 shadow-inner border-4 border-white">
                    {currentUser.role === 'GIVER' ? '🌱' : '👐'}
                </div>
                <h2 className="text-xl font-bold text-morocco-charcoal">{currentUser.name}</h2>
                <div className="flex flex-col items-center gap-1">
                    <p className="text-sm text-gray-500">{currentUser.city}</p>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${currentUser.role === 'GIVER' ? 'bg-morocco-green/10 text-morocco-green' : 'bg-morocco-terracotta/10 text-morocco-terracotta'}`}>
                        {currentUser.role === 'GIVER' ? t('onboarding.giver') : t('onboarding.receiver')}
                    </span>
                </div>
            </div>

            {/* History List View */}
            {viewMode !== 'STATS' ? (
                <div className="animate-fade-in">
                    <button
                        onClick={() => setViewMode('STATS')}
                        className="mb-4 flex items-center text-sm text-gray-500 hover:text-morocco-green gap-1"
                    >
                        <span>←</span> {t('common.back')}
                    </button>
                    <h3 className="font-bold text-morocco-charcoal mb-4">{historyTitle}</h3>

                    {historyList.length === 0 ? (
                        <p className="text-center text-gray-400 py-8">No history yet.</p>
                    ) : (
                        <div className="space-y-3">
                            {historyList.map(item => (
                                <div key={item.id} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex justify-between items-center">
                                    <div>
                                        <div className="flex justify-between items-start mb-1">
                                            <h3 className="font-bold text-morocco-charcoal">{item.title}</h3>
                                            <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${item.status === 'AVAILABLE' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                                                {t(`status.${item.status}`)}
                                            </span>
                                        </div>
                                        <p className="text-xs text-gray-500">{item.quantity} • {new Date(item.createdAt).toLocaleDateString()}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            ) : (
                /* Status View */
                <div className="bg-white rounded-3xl p-6 shadow-sm mb-6">
                    <h3 className="font-bold text-morocco-charcoal mb-4 flex items-center gap-2">
                        <Star size={16} className="text-morocco-terracotta" />
                        {t('profile.impact')}
                    </h3>

                    <div className="grid grid-cols-2 gap-4">
                        <div
                            onClick={() => setViewMode('MEALS')}
                            className="bg-morocco-green/5 p-4 rounded-2xl border border-morocco-green/10 flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-morocco-green/10 transition-colors"
                        >
                            <Package className="text-morocco-green" size={24} />
                            <span className="text-2xl font-bold text-morocco-charcoal">{mealsShared.length}</span>
                            <span className="text-[10px] uppercase tracking-wider text-gray-500 font-bold">{t('profile.mealsShared')}</span>
                        </div>

                        <div
                            onClick={() => setViewMode('ITEMS')}
                            className="bg-morocco-terracotta/5 p-4 rounded-2xl border border-morocco-terracotta/10 flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-morocco-terracotta/10 transition-colors"
                        >
                            <Shirt className="text-morocco-terracotta" size={24} />
                            <span className="text-2xl font-bold text-morocco-charcoal">{itemsDonated.length}</span>
                            <span className="text-[10px] uppercase tracking-wider text-gray-500 font-bold">{t('profile.itemsDonated')}</span>
                        </div>
                    </div>
                </div>
            )}

            {/* Settings (Only show in Stats mode to keep clean) */}
            {viewMode === 'STATS' && (
                <div className="bg-white rounded-2xl overflow-hidden shadow-sm">
                    {/* Language Switcher */}
                    <div className="p-4 border-b border-gray-50 flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-600 flex items-center gap-2">
                            <Globe size={16} /> {t('profile.language')}
                        </span>
                        <div className="flex gap-2">
                            <button onClick={() => changeLanguage('ar')} className={`px-2 py-1 rounded text-xs font-bold ${i18n.language === 'ar' ? 'bg-morocco-green text-white' : 'bg-gray-100 text-gray-500'}`}>عربي</button>
                            <button onClick={() => changeLanguage('fr')} className={`px-2 py-1 rounded text-xs font-bold ${i18n.language === 'fr' ? 'bg-morocco-green text-white' : 'bg-gray-100 text-gray-500'}`}>FR</button>
                            <button onClick={() => changeLanguage('en')} className={`px-2 py-1 rounded text-xs font-bold ${i18n.language === 'en' ? 'bg-morocco-green text-white' : 'bg-gray-100 text-gray-500'}`}>EN</button>
                        </div>
                    </div>

                    <button
                        onClick={handleSwitchRole}
                        disabled={switching}
                        className="w-full p-4 text-left text-sm font-medium text-gray-600 border-b border-gray-50 active:bg-gray-50 flex items-center justify-between"
                    >
                        <span>Switch to {currentUser.role === 'GIVER' ? t('onboarding.receiver') : t('onboarding.giver')}</span>
                        {switching && <span className="text-xs text-gray-400">...</span>}
                    </button>


                    <button className="w-full p-4 text-left text-sm font-medium text-gray-600 border-b border-gray-50 active:bg-gray-50">
                        {t('profile.notifications')}
                    </button>
                    <button
                        onClick={onLogout}
                        className="w-full p-4 text-left text-sm font-medium text-red-500 active:bg-red-50 flex items-center gap-2">
                        <LogOut size={16} />
                        {t('profile.signOut')}
                    </button>
                </div>
            )}

            <div className="mt-8 text-center pb-8">
                <p className="text-[10px] text-gray-300">Tadamon v1.0.0</p>
            </div>
        </div>
    );
};