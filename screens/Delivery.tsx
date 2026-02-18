import React from 'react';
import { useTranslation } from 'react-i18next';
import { Bike } from 'lucide-react';
import { motion } from 'framer-motion';

export const Delivery: React.FC = () => {
  const { t } = useTranslation();
  const drivers = [
    { id: 1, name: 'Karim El Amrani', vehicle: 'Moto', type: t('delivery.fastDelivery'), phone: '06 00 00 00 01', icon: Bike },
    { id: 2, name: 'Rachid Tazi', vehicle: 'Moto', type: t('delivery.smallPackages'), phone: '06 00 00 00 02', icon: Bike },
    { id: 3, name: 'Hassan B.', vehicle: 'Moto', type: t('delivery.foodDelivery'), phone: '06 00 00 00 03', icon: Bike },
  ];

  return (
    <div className="pt-6 px-4 pb-24">
      <h1 className="text-2xl font-bold text-morocco-green mb-2">{t('delivery.title')}</h1>
      <p className="text-sm text-gray-600 mb-6">
        {t('delivery.subtitle')}
      </p>

      <div className="space-y-4">
        {drivers.map((driver, index) => (
          <motion.div
            key={driver.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white p-4 rounded-2xl shadow-sm border border-transparent hover:border-morocco-green/20"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-morocco-sandDark flex items-center justify-center text-morocco-charcoal">
                <driver.icon size={24} />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-morocco-charcoal">{driver.name}</h3>
                <p className="text-xs text-gray-400 font-medium mb-1">{driver.type}</p>
                <p className="text-lg font-bold text-morocco-green tracking-wide">{driver.phone}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="mt-8 bg-morocco-sand/50 p-4 rounded-xl border border-morocco-sandDark text-center">
        <p className="text-xs text-gray-500">
          <strong>{t('delivery.note').split(':')[0]}:</strong> {t('delivery.note').split(':')[1]}
        </p>
      </div>
    </div>
  );
};