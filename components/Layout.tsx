import React from 'react';
import { useTranslation } from 'react-i18next';
import { Home, PlusCircle, MessageCircle, User, Truck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  onTabChange: (tab: string) => void;
  showNav?: boolean;
}

export const Layout: React.FC<LayoutProps> = ({ children, activeTab, onTabChange, showNav = true }) => {
  const { t } = useTranslation();

  const navItems = [
    { id: 'home', icon: Home, label: t('nav.home') },
    { id: 'create', icon: PlusCircle, label: t('nav.create') },
    { id: 'chat', icon: MessageCircle, label: t('nav.chat') },
    { id: 'delivery', icon: Truck, label: t('delivery.title').split(' ')[0] }, // Short label
    { id: 'profile', icon: User, label: t('nav.profile') },
  ];

  return (
    <div className="h-[100dvh] bg-morocco-sand text-morocco-charcoal font-sans overflow-hidden flex flex-col md:flex-row w-full md:max-w-none max-w-[430px] mx-auto shadow-2xl relative md:shadow-none">

      {/* Desktop Sidebar */}
      {showNav && (
        <div className="hidden md:flex flex-col w-64 bg-white/90 backdrop-blur-md border-r border-morocco-sandDark z-50 p-6">
          <div className="mb-10 text-center">
            <h1 className="text-3xl font-bold text-morocco-green">tadamon</h1>
            <p className="text-xs text-gray-400 mt-1">Neighbors Help Neighbors</p>
          </div>

          <div className="flex flex-col gap-4 flex-1">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onTabChange(item.id)}
                  className={`flex items-center gap-4 p-3 rounded-xl transition-all ${isActive ? 'bg-morocco-green text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'
                    }`}
                >
                  <item.icon size={24} />
                  <span className="font-bold">{item.label}</span>
                </button>
              );
            })}
          </div>

          <div className="text-center text-xs text-gray-300 mt-auto">
            v1.0.0 Desktop
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto no-scrollbar relative z-0 bg-pattern-geo md:bg-gray-50">
        <div className="absolute inset-0 bg-morocco-sand/90 -z-10 pointer-events-none md:bg-gray-50/50" />
        {/* Desktop Container Check */}
        <div className="md:container md:mx-auto md:max-w-5xl md:py-8 h-full">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="min-h-full pb-24 md:pb-0 h-full"
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Mobile Bottom Nav */}
      {showNav && (
        <div className="md:hidden absolute bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-morocco-sandDark pb-safe z-50">
          <div className="flex justify-around items-center h-16 px-2">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onTabChange(item.id)}
                  className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors ${isActive ? 'text-morocco-green' : 'text-gray-400'
                    }`}
                >
                  <motion.div
                    whileTap={{ scale: 0.8 }}
                    animate={isActive ? { y: -2 } : { y: 0 }}
                  >
                    <item.icon
                      size={24}
                      strokeWidth={isActive ? 2.5 : 2}
                      className={isActive && item.id === 'create' ? 'fill-morocco-green/10' : ''}
                    />
                  </motion.div>
                  <span className="text-[10px] font-medium">{item.label}</span>
                </button>
              );
            })}
          </div>
          {/* Safe area spacer for modern phones */}
          <div className="h-4 w-full" />
        </div>
      )}
    </div>
  );
};