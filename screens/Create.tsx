import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Package, Shirt, Archive, Eye, EyeOff, HandHeart, Heart } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { UserRole, Item } from '../types';

interface CreateProps {
  userRole: UserRole;
  onAddItem: (item: Item) => void;
  currentLocation: { lat: number; lng: number } | null;
}

export const Create: React.FC<CreateProps> = ({ userRole, onAddItem, currentLocation }) => {
  const { t } = useTranslation();
  const [type, setType] = useState<'FOOD' | 'CLOTHES' | 'OTHERS'>('FOOD');
  const [isAnonymous, setIsAnonymous] = useState(true);
  const [titleInput, setTitleInput] = useState('');
  const [quantityInput, setQuantityInput] = useState('');
  const [descriptionInput, setDescriptionInput] = useState('');

  const isGiver = userRole === 'GIVER';

  // Dynamic Text based on Role
  const title = isGiver ? t('create.giveBack') : t('create.askHelp');
  const question = isGiver ? t('create.whatOffering') : t('create.whatNeed');
  const submitText = isGiver ? t('create.postDonation') : t('create.postRequest');

  const handleSubmit = () => {
    if (!titleInput || !quantityInput || !descriptionInput) return;

    if (!currentLocation) {
      alert("Please enable GPS to post items.");
      return;
    }

    const newItem: Item = {
      id: Date.now().toString(),
      kind: isGiver ? 'OFFER' : 'REQUEST',
      type: type,
      title: titleInput,
      quantity: quantityInput,
      description: descriptionInput,
      distance: '< 100m', // Mock distance for user's own post
      isAnonymous: isAnonymous,
      createdAt: 'Just now',
      status: 'AVAILABLE',
      latitude: currentLocation.lat,
      longitude: currentLocation.lng
    };

    onAddItem(newItem);
  };

  return (
    <div className="pt-6 px-6 pb-20 h-full overflow-y-auto no-scrollbar">
      <h1 className="text-2xl font-bold text-morocco-green mb-6">{title}</h1>

      <div className="space-y-6">
        {/* Type Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">{question}</label>
          <div className="grid grid-cols-3 gap-4">
            <button
              onClick={() => setType('FOOD')}
              className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${type === 'FOOD'
                ? 'border-morocco-green bg-morocco-green/5 text-morocco-green'
                : 'border-gray-100 bg-white text-gray-400'
                }`}
            >
              <Package size={28} />
              <span className="font-bold text-xs">{t('create.food')}</span>
            </button>
            <button
              onClick={() => setType('CLOTHES')}
              className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${type === 'CLOTHES'
                ? 'border-morocco-terracotta bg-morocco-terracotta/5 text-morocco-terracotta'
                : 'border-gray-100 bg-white text-gray-400'
                }`}
            >
              <Shirt size={28} />
              <span className="font-bold text-xs">{t('create.clothes')}</span>
            </button>
            <button
              onClick={() => setType('OTHERS')}
              className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${type === 'OTHERS'
                ? 'border-morocco-sandDark bg-morocco-sand/20 text-morocco-charcoal'
                : 'border-gray-100 bg-white text-gray-400'
                }`}
            >
              <Archive size={28} />
              <span className="font-bold text-xs">{t('create.others')}</span>
            </button>
          </div>
        </div>

        {/* Form Fields */}
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">{t('create.titleLabel')}</label>
            <input
              type="text"
              value={titleInput}
              onChange={(e) => setTitleInput(e.target.value)}
              placeholder={isGiver ? t('placeholders.foodTitle') : t('placeholders.requestTitle')}
              className="w-full p-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-morocco-green focus:ring-1 focus:ring-morocco-green transition-all"
            />
          </div>

          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">{t('create.quantityLabel')}</label>
              <input
                type="text"
                value={quantityInput}
                onChange={(e) => setQuantityInput(e.target.value)}
                placeholder={isGiver ? t('placeholders.foodQty') : t('placeholders.requestQty')}
                className="w-full p-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-morocco-green transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">{t('create.descLabel')}</label>
            <textarea
              value={descriptionInput}
              onChange={(e) => setDescriptionInput(e.target.value)}
              placeholder={isGiver ? t('placeholders.foodDesc') : t('placeholders.requestDesc')}
              rows={3}
              className="w-full p-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-morocco-green focus:ring-1 focus:ring-morocco-green transition-all resize-none"
            />
          </div>

        </div>

        {/* Anonymity Toggle */}
        <div
          onClick={() => setIsAnonymous(!isAnonymous)}
          className="flex items-center justify-between bg-white p-4 rounded-xl border border-gray-200 cursor-pointer active:scale-[0.98] transition-transform"
        >
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-full ${isAnonymous ? 'bg-morocco-green/10 text-morocco-green' : 'bg-gray-100 text-gray-400'}`}>
              {isAnonymous ? <EyeOff size={20} /> : <Eye size={20} />}
            </div>
            <div>
              <h3 className="font-bold text-morocco-charcoal text-sm">{t('create.anonymous')}</h3>
              <p className="text-xs text-gray-500">{t('create.anonymousDesc')}</p>
            </div>
          </div>
          <div className={`w-12 h-6 rounded-full p-1 transition-colors ${isAnonymous ? 'bg-morocco-green' : 'bg-gray-300'}`}>
            <div className={`w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${isAnonymous ? 'translate-x-6' : 'translate-x-0'}`} />
          </div>
        </div>

        <Button fullWidth className="mt-4" onClick={handleSubmit} disabled={!titleInput || !quantityInput || !descriptionInput}>
          {submitText}
        </Button>
      </div>
    </div>
  );
};